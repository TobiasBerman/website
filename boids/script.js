// Canvas and context
var canvas = document.querySelector('canvas');
var c = canvas.getContext('2d');
var width = window.innerWidth, height = window.innerHeight;

// Triggered on loading of window
window.onload = function() {
    init();
    window.addEventListener('resize', init, false);
}

// Triggered on resizing of window
function init() {
    width = window.innerWidth;
    height = window.innerHeight;

    c.canvas.width = width;
    c.canvas.height = height;
}

var showGizmo = false;
var birdsInAlignRad;

function Bird(num) {
    this.num = num;
    this.avoidRadius = 20, this.alignRadius = 70, this.approachRadius = 10;
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.velocityDir = Math.random() * Math.PI * 2;
    this.velocityMag = 1;
    this.dx;
    this.dy;

    // UPDATE METHOD
    this.update = function() {
        // Bird Triangle
        this.dx = this.velocityMag * Math.cos(this.velocityDir);
        this.dy = this.velocityMag * Math.sin(this.velocityDir);

        c.fillStyle = "#3eba44";
        c.beginPath();
        c.moveTo(this.x + (this.dx / this.velocityMag) * 24, this.y + (this.dy / this.velocityMag) * 24);
        c.lineTo(this.x + ((-this.dy / this.dx) / Math.hypot((-this.dy / this.dx), 1)) * 6, this.y + (1 / Math.hypot((-this.dy / this.dx), 1)) * 6);
        c.lineTo(this.x + ((this.dy / this.dx) / Math.hypot((this.dy / this.dx), -1)) * 6, this.y + (-1 / Math.hypot((this.dy / this.dx), -1)) * 6);
        c.lineTo(this.x + (this.dx / this.velocityMag) * 24, this.y + (this.dy / this.velocityMag) * 24);
        c.fill();
        c.closePath();

        if (showGizmo) {
            // Bird Avoid Radius
            c.beginPath();
            c.strokeStyle = "red";
            c.arc(this.x, this.y, this.avoidRadius, 0, Math.PI * 2, true);
            c.stroke();
            c.closePath();

            // Bird Align Radius
            c.beginPath();
            c.strokeStyle = "blue";
            c.arc(this.x, this.y, this.alignRadius, 0, Math.PI * 2, true);
            c.stroke();
            c.closePath();

            // Bird Approach Radius
            c.beginPath();
            c.strokeStyle = "green";
            c.arc(this.x, this.y, this.approachRadius, 0, Math.PI * 2, true);
            c.stroke();
            c.closePath();
        }

        // looping world edges
        if (this.x < 0) {
            this.x = width;
            // this.velocityDir += -this.velocityDir * 0.5;
        }
        if (this.x > width) {
            this.x = 0;
            // this.velocityDir += (Math.PI - this.velocityDir) * 0.5;
        }
        if (this.y < 0) {
            this.y = height;
            // this.velocityDir += (Math.PI / 2 - this.velocityDir) * 0.5;
        }
        if (this.y > height) {
            this.y = 0;
            // this.velocityDir += (Math.PI * 3/2 - this.velocityDir) * 0.5;
        }

        this.x += this.dx;
        this.y += this.dy;
        this.velocityMag += (4 - this.velocityMag) * 0.2;
    };

    // AVOID METHOD
    this.avoid = function() {
        let n = 0;
        let avg = {
            x: 0,
            y: 0
        };
        for (let i = 0; i < numOfBirds; i++) {
            let d = Math.hypot(this.x - birds[i].x, this.y - birds[i].y);
            if (this.num != birds[i].num && d < this.avoidRadius) {
                avg.x += birds[i].x;
                avg.y += birds[i].y;
                n++;
            }
        }
        if (n > 0) {
            avg.x = avg.x / n;
            avg.y = avg.y / n;
            this.velocityDir -= (Math.atan2(avg.y - this.y, avg.x - this.x) - this.velocityDir) * 0.004;
            this.velocityMag += 0.9;
        }
    };

    // ALIGN METHOD
    this.align = function() {
        let n = 0;
        let avg = 0;
        let avg2 = 0;
        for (let i = 0; i < numOfBirds; i++) {
            let d = Math.hypot(this.x - birds[i].x, this.y - birds[i].y);
            if (this.num != birds[i].num && d < this.alignRadius) {
                avg += birds[i].velocityDir;
                avg2 += birds[i].velocityMag;
                n++;
            }
        }
        if (n > 0) {
            avg = avg / n;
            avg2 = avg2 / n;
            this.velocityDir += (avg - this.velocityDir) * 0.05;
            this.velocityMag += (avg2 - this.velocityMag) * 0.05;
        }
    };

    // APPROACH METHOD
    this.approach = function() {
        let n = 0;
        let avg = {
            x: 0,
            y: 0
        };
        for (let i = 0; i < numOfBirds; i++) {
            let d = Math.hypot(this.x - birds[i].x, this.y - birds[i].y);
            if (this.num != birds[i].num && d < this.approachRadius) {
                avg.x += birds[i].x;
                avg.y += birds[i].y;
                n++;
            }
        }
        if (n > 0) {
            avg.x = avg.x / n;
            avg.y = avg.y / n;
            let k = Math.atan2(avg.y - this.y, avg.x - this.x);
            this.velocityDir -= (this.velocityDir - k) * 0.08;
        }
    };
}

// Bird creation
var birds = [];
var numOfBirds = 128;
for (let i = 0; i < numOfBirds; i++) {
    birds[i] = new Bird(i);
}

// Updating 60 frames per second
function draw() {
    requestAnimationFrame(draw);
    c.clearRect(0, 0, width, height);

    // Updating every bird
    for (let i = 0; i < numOfBirds; i++) {
        birds[i].update();
        birds[i].avoid();
        birds[i].align();
        birds[i].approach();
    }
}
draw();