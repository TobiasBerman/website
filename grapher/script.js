var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

// Resize canvas to match display size
function resizeCanvas() {
    const displayWidth = Math.min(window.innerHeight, window.innerWidth);
    canvas.width = displayWidth;
    canvas.height = displayWidth;
}

// Initial resize
resizeCanvas();

// Resize on window resize
window.addEventListener('resize', resizeCanvas);

// Decay input functionality
var decayInput = document.getElementById('decayInput');
var decayRate = 0;

decayInput.addEventListener('input', function() {
    decayRate = parseFloat(this.value) || 0;
});

var theta = 0;
var deltaTheta = 20;

var circleRadius = 5;

var maxOrbitRadius = 350;
var orbitRadius = maxOrbitRadius;

var x, y;

// Brand colors
var primaryColor = "#3eba44";
var darkColor = "#121212";
var dark2Color = "#1e1e1e";
var dark6Color = "#2c2c2c";
var white = "#ffffff";

// --- X, Y, and Decay input support ---
var xInput = document.getElementById('xInput');
var yInput = document.getElementById('yInput');
var decayInput = document.getElementById('decayInput');
var updateGraphBtn = document.getElementById('updateGraphBtn');

// Clear input fields on page load
xInput.value = '';
yInput.value = '';
decayInput.value = '';

xInput.placeholder = 'r * cos(x)';
yInput.placeholder = 'r * sin(x)';
decayInput.placeholder = '0';

defaultXString = 'r * Math.cos(x)';
defaultYString = 'r * Math.sin(x)';

var xFunctionString = defaultXString;
var yFunctionString = defaultYString;
var decayRate = 0;

var userXFunction = function(theta, orbitRadius) { return orbitRadius * Math.cos(theta); };
var userYFunction = function(theta, orbitRadius) { return orbitRadius * Math.sin(theta); };

function parseXYFunction(str, fallback) {
    try {
        str = str.replace(/sin/g, 'Math.sin')
                 .replace(/cos/g, 'Math.cos')
                 .replace(/tan/g, 'Math.tan')
                 .replace(/abs/g, 'Math.abs')
                 .replace(/PI/g, 'Math.PI')
                 .replace(/E/g, 'Math.E')
                 .replace(/x/g, 'theta')
                 .replace(/r/g, 'orbitRadius');
        var fn = new Function('theta', 'orbitRadius', 'return ' + str + ';');
        var test = fn(1, 100);
        if (typeof test !== 'number' || isNaN(test)) throw new Error('Invalid');
        return fn;
    } catch (e) {
        console.log(e);
        return fallback;
    }
}

updateGraphBtn.addEventListener('click', function() {
    xFunctionString = xInput.value || 'r * cos(x)';
    yFunctionString = yInput.value || 'r * sin(x)';
    decayRate = parseFloat(decayInput.value) || 0;
    userXFunction = parseXYFunction(xFunctionString, function(theta, orbitRadius) { return orbitRadius * Math.cos(theta); });
    userYFunction = parseXYFunction(yFunctionString, function(theta, orbitRadius) { return orbitRadius * Math.sin(theta); });
    // Reset the graph for immediate feedback
    orbitRadius = maxOrbitRadius;
    fuck.length = 0;
    theta = 0;
});
// --- End input support ---

function drawCircle() {
    ctx.beginPath();
    ctx.arc(x, y, circleRadius, 0, Math.PI * 2);
    ctx.fillStyle = white;
    ctx.fill();
    ctx.closePath();
}

function drawLine() {
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.lineTo(x, y);
    ctx.strokeStyle = white;
    ctx.lineWidth = 1;
    ctx.stroke();
}

var fuck = [];

function followingLine(me) {
    ctx.beginPath();
    ctx.arc(fuck[me][0], fuck[me][1], 0, 0, Math.PI * 2);
    ctx.fillStyle = primaryColor;
    ctx.fill();
    ctx.closePath();
}

function trace(me) {
    ctx.beginPath();
    ctx.moveTo(fuck[me][0], fuck[me][1]);
    ctx.lineTo(fuck[me + 1][0], fuck[me + 1][1]);
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 2;
    ctx.stroke();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Use user-defined X and Y functions
    let calculatedX = userXFunction(theta, orbitRadius);
    let calculatedY = userYFunction(theta, orbitRadius);
    // Ensure coordinates stay within canvas bounds
    x = Math.max(0, Math.min(canvas.width, calculatedX + canvas.width/2));
    y = Math.max(0, Math.min(canvas.height, calculatedY + canvas.height/2));
    
    drawLine();
    drawCircle();

    fuck.push([x,y]);

    if (theta > Math.PI*2) {
        fuck.shift();
        theta = 0;
        // fuck.length = 0;
    }

    for (var me = 0; me < fuck.length - 1; me++) {
        followingLine(me);
        trace(me);
        ctx.strokeStyle = primaryColor;
    }

    theta += deltaTheta / 1000; // orbitRadius
    if (orbitRadius < canvas.width/2 && orbitRadius > 0) {
        orbitRadius -= decayRate;
    }

    if (orbitRadius < 3) {
        orbitRadius = maxOrbitRadius;
        fuck.length = 0;
        theta = 0;
        // location.reload(); // Reload page when it "finishes"
        // fuck.shift();
    }

    requestAnimationFrame(draw);
}
requestAnimationFrame(draw);