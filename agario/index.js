// Canvas and context
var canvas = document.querySelector('canvas');
var c = canvas.getContext('2d');
var width = window.innerWidth, height = window.innerHeight;
// Offset of camera / canvas translation
var offset = {
    x: 0,
    y: 0
}
var scale = {
    x: 1,
    y: 1
}
// Size of map
var map = {
    x: 5000,
    y: 5000
}
// Spacing between each grid line
var gap = {
    x: 50,
    y: 50
}
// Mouse coordinates
var mouse = {
    x: 0,
    y: 0
}
// Player properties
var x = width / 2, y = height / 2;
var dx = 0, dy = 0;
var radius = 35;
var speed = 4;
var directionVector = {
    x: 0,
    y: 0
}
var offsethypot;
// Array to hold each food blob & number of food blobs
var food = [];
var foodCount = (map.x + map.y) * 0.05;
var foodRadius = 15;
var popped = 0;
var counter = 1;



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

// Getting updating mouse position
window.addEventListener('mousemove', function() {
    mouse.x = event.x;
    mouse.y = event.y;
})

// Linear interpolation function
function lerp(start, end, amount) {
    return(1 - amount) * start + amount * end;
}

function screenToWorldX(screenX) {
    return screenX + offset.x;
}

function screenToWorldY(screenY) {
    return screenY + offset.y;
}

function worldToScreenX(worldX) {
    return worldX - offset.x;
}

function worldToScreenY(worldY) {
    return worldY - offset.y;
}

// Grid drawing function
function drawGrid() {
    // Map Grid
    c.beginPath();
    c.strokeStyle = 'lightgrey';
    for (let x = gap.x; x < map.x; x += gap.x) {
        c.moveTo(x + offset.x, offset.y);
        c.lineTo(x + offset.x, map.y + offset.y);
    }
    for (let y = gap.y; y < map.y; y += gap.y) {
        c.moveTo(offset.x, y + offset.y);
        c.lineTo(map.x + offset.x, y + offset.y);
    }
    c.stroke();
    c.closePath();
    // Map Outline
    c.beginPath();
    c.strokeStyle = 'black';
    c.moveTo(offset.x, offset.y);
    c.lineTo(map.x + offset.x, offset.y);
    c.lineTo(map.x + offset.x, map.y + offset.y)
    c.lineTo(offset.x, map.y + offset.y);
    c.lineTo(offset.x, offset.y);
    c.stroke();
    c.closePath();
}

// Food spawning object
function Food(foodRadius) {
    this.x = Math.random() * (map.x - foodRadius * 2) + foodRadius, this.y = Math.random() * (map.y - foodRadius * 2) + foodRadius;
    this.color = 'rgb(' + String(Math.random() * 255) + ',' + String(Math.random() * 255) + ',' + String(Math.random() * 255) + ')';

    this.update = function() {
        c.fillStyle = this.color;
        c.beginPath();
        c.arc(this.x + offset.x, this.y + offset.y, foodRadius, 0, Math.PI * 2, true);
        c.fill();
        c.closePath();
        c.fillStyle = 'black';
    }

    this.collisionCheck = function() {
        if (Math.hypot(x - this.x - offset.x, y - this.y - offset.y) < radius) {
            return true;
        }
    }
}

// Food creation
for (var i = 0; i < foodCount; i++) {
    food[i] = new Food(foodRadius);
}

// Updating 60 frames per second
function draw() {
    requestAnimationFrame(draw);
    c.clearRect(0, 0, (width - offset.x), (height - offset.y));

    // Collision with sides of map
    if (x - radius < offset.x) {
        x = offset.x + radius;
        dx = 0;
    } else if (x + radius > map.x + offset.x) {
        x = map.x + offset.x - radius;
        dx = 0;
    } 
    if (y - radius < offset.y) {
        y = offset.y + radius;
        dy = 0;
    } else if (y + radius > map.y + offset.y) {
        y = map.y + offset.y - radius;
        dy = 0;
    }

    drawGrid();

    // Food update / collision
    for (var i = 0; i < foodCount; i++) {
        food[i].update();

        if (food[i].collisionCheck()) {
            food[i] = new Food(foodRadius);
            popped++;
            // radius = lerp(radius, Math.hypot(radius, foodRadius), 0.2);
            radius = Math.hypot(radius, foodRadius);
            speed *= 0.999;

            scale.x *= 0.999;
            scale.y *= 0.999;
        }
    }

    // Canvas translation for camera movement effect, canvas offset
    c.translate(-dx, -dy);
    offset.x -= dx;
    offset.y -= dy;

    // c.scale(0.999, 0.999);
    // scale.x *= 1.001;
    // scale.y *= 1.001;
    // c.translate((width - (width * 0.999)), (height - (height * 0.999)));
    // offset.x -= (width - (width * 0.999));
    // offset.y -= (height - (height * 0.999));

    // Player
    c.fillStyle = 'orange';
    c.beginPath();
    c.arc(x, y, radius, 0, Math.PI * 2, true);
    c.fill();
    c.closePath();
    
    // Velocity of player
    offsethypot = Math.hypot(mouse.x + worldToScreenX(-x), mouse.y + worldToScreenY(-y));
    directionVector.x = (mouse.x + worldToScreenX(-x)) / offsethypot; // Unit vector with magnitude 1
    directionVector.y = (mouse.y + worldToScreenY(-y)) / offsethypot; // Unit vector with magnitude 1
    if (offsethypot > 60) {
        dx = lerp(dx, (directionVector.x) * speed, 0.4);
        dy = lerp(dy, (directionVector.y) * speed, 0.4);
    } else {
        dx = (directionVector.x) * offsethypot * 0.05 * (speed / 4);
        dy = (directionVector.y) * offsethypot * 0.05 * (speed / 4);
    }

    x += dx;
    y += dy;

    map.x -= 0.01;
    map.y -= 0.01;
}

draw();