// The MAP global variable contains initialization details and the state of the game map.
var MAP = {
    columns: 5,
    rows: 6,
    blockWidth: 101,
    blockHeight: 83, // The size of a visible block is 83, the character also should move in the y axis by 83px.
    numberOfEnemies: 4,
    gameRunning: true,
    collided: false,
    score: 0,
    debug: false
};
// This is the default Y-axis position for the player, it scales automatically according to map size. The
// default position for X-axis is 0.
MAP.spriteBeginningYPos = (MAP.rows * MAP.blockHeight) - 80 - Math.floor(MAP.blockHeight / 2);

// Enemies our player must avoid, the row_num is the the row block the enemy travels in.
var Enemy = function (row_num) {
    "use strict";
    // The image graphic of the enemy.
    this.sprite = 'images/enemy-bug.png';
    // The pos variable contains the location of the enemy in the map (in pixels).
    // Set a starting X position within the bug's travel path.
    var random_x = Math.random() * (MAP.columns * MAP.blockWidth - -MAP.blockWidth) + -MAP.blockWidth;
    this.pos = {x: random_x, y: MAP.spriteBeginningYPos - (row_num * MAP.blockHeight) };
    this.speed = Math.random() * (100 - 30) + 30; // The speed of the enemy. Value is between 30 & 100
    // The radius to calculate the circular area occupied by the enemy. Used for collision detection.
    this.radius = (MAP.blockWidth - 2) / 2;
};
// Get the center point of the enemy to calculate collision.
Enemy.prototype.getCenter = function () {
    "use strict";
    var x = this.pos.x + parseInt(MAP.blockWidth / 2);
    var y = this.pos.y + 120;
    return {x: x, y: y};

};
// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function (dt) {
    "use strict";
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    // -101 < bug_x_position < width*101
    var min_pos = -MAP.blockWidth;
    var max_pos = MAP.columns * MAP.blockWidth;
    var new_pos = this.pos.x + (this.speed * dt);
    // Make the x position fit the visible range no matter how big the dt variable is.
    while (new_pos > max_pos) {
        new_pos = new_pos - max_pos + min_pos;  // Using a mod might be more efficient.
    }
    this.pos.x = new_pos;
};
// Draw the enemy on the screen.
Enemy.prototype.render = function (debug) {
    "use strict";
    ctx.drawImage(Resources.get(this.sprite), this.pos.x, this.pos.y);
    if (debug === true) {
        drawDebugCircles(this.getCenter(), this.radius, false);
    }
};

// The class containing the player the user controls.
var Player = function () {
    "use strict";
    this.pos = {x: 0, y: MAP.spriteBeginningYPos};
    this.sprite = 'images/char-princess-girl.png';
    this.radius = 30;
};
// Player update function not needed.
//Player.prototype.update = function (dt) {
//};
Player.prototype.render = function (debug) {
    "use strict";
    ctx.drawImage(Resources.get(this.sprite), this.pos.x, this.pos.y);
    if (debug === true) {
        drawDebugCircles(this.getCenter(), this.radius, true);
    }
};
Player.prototype.moveUp = function (pixels) {
    this.pos.y -= locationValid(this.pos.y - pixels, 'y') ? pixels : 0; //move up if within field
};
Player.prototype.moveDown = function (pixels) {
    this.pos.y += locationValid(this.pos.y + pixels, 'y') ? pixels : 0; //move down if within field
};
Player.prototype.moveLeft = function (pixels) {
    this.pos.x -= locationValid(this.pos.x - pixels, 'x') ? pixels : 0; //move left if within field
};
Player.prototype.moveRight = function (pixels) {
    this.pos.x += locationValid(this.pos.x + pixels, 'x') ? pixels : 0;  //move up if within field
};
Player.prototype.handleInput = function (keypress) {
    "use strict";
    if (keypress === 'left') {
        this.moveLeft(MAP.blockWidth);
    }
    else if (keypress === 'right') {
        this.moveRight(MAP.blockWidth);
    }
    else if (keypress === 'up') {
        this.moveUp(MAP.blockHeight);
    }
    else if (keypress === 'down') {
        this.moveDown(MAP.blockHeight);
    }
};
Player.prototype.getCenter = function () {
    "use strict";
    var x = this.pos.x + parseInt(MAP.blockWidth / 2, 10);
    var y = this.pos.y + 120;
    return {x: x, y: y};

};

var allEnemies, player;
// Function that creates the player & enemies. Used to reset map too.
function initializeCharacters(resetMap) {
    "use strict";
    // Place all enemy objects in an array called allEnemies. Dynamically create enemies based on number in the MAP variable.
    allEnemies = [];
    var i, row_num;
    for (i = 0; i < MAP.numberOfEnemies; i += 1) {
        row_num = Math.round(Math.random() * (4 - 2) + 2);  // Add enemies to the rows 2, 3, 4.
        allEnemies.push(new Enemy(row_num));
    }
    // Place the player object in a variable called player
    player = new Player();
    if (resetMap === true) {
        MAP.collided = false;
        MAP.score = 0;
    }
}



// This listens for key presses and sends the keys to the Player.handleInput() method.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

// Does the bounds checking for the player.
function locationValid(val, type) {
    "use strict";
    var returnVal = false;
    val = typeof val !== 'undefined' ? val : -1;
    type = typeof type !== 'undefined' ? type : 'x';
    if (isNaN(val)) { return returnVal; }
    var minX = 0;
    var maxX = (MAP.columns - 1) * MAP.blockWidth;  // Max moveable area. 1 less than map size.
    var minY = -50;
    var maxY = MAP.spriteBeginningYPos;
    if (type === 'x') {
        if (val <= maxX && val >= minX) { returnVal = true; }
    }
    else if (val <= maxY && val >= minY) { returnVal = true; }
    return returnVal;
}

function drawDebugCircles(center_position, radius, player) {
        //if (player === undefined) {
        //    player = false;
        //}
        var alpha = ctx.globalAlpha;
        var color;
        ctx.beginPath();
        ctx.arc(center_position.x, center_position.y, radius, 0, 2 * Math.PI, false);
        ctx.globalAlpha = 0.5;
        if (player === true) {  color = 'blue'; }
        else { color = 'red'; }
        ctx.fillStyle = color;
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = color;//'#003300';
        ctx.stroke();
        ctx.globalAlpha = alpha;
}

function switchDebug () {
    MAP.debug = !MAP.debug;
}

function pauseApp () {
    MAP.gameRunning = !MAP.gameRunning;
}

function makeMapWider () {
    MAP.columns += 1;
}
function makeMapThinner () {
    MAP.columns -= 1;
}