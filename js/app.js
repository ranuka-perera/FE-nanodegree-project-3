// Global map size variable
var MAP = {
    columns: 5,
    rows: 6,
    blockWidth: 101,
    blockHeight: 83, // The size of a visible block is 83, the character also should move in the y axis by 83px.
    numberOfEnemies: 1
};
// This is the default Y position for the player, it scales automatically according to map size. Default for X is 0.
MAP.spriteBeginningYPos = (MAP.rows * MAP.blockHeight) - 80 - Math.floor(MAP.blockHeight / 2);

// Enemies our player must avoid
var Enemy = function (row_num) {
    "use strict";
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.pos = {x: -MAP.blockWidth, y: MAP.spriteBeginningYPos - (row_num * MAP.blockHeight) };
    this.speed = Math.random() * (100 - 30) + 30; // The speed of the enemy. Value is between 20 & 100
};
// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function (dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    // -101 < bug < width*101
    var min_pos = -MAP.blockWidth;
    var max_pos = MAP.columns * MAP.blockWidth;
    var new_pos = this.pos.x + (this.speed * dt);
    if (new_pos > max_pos) {
        new_pos = new_pos - max_pos + min_pos;
    }
    this.pos.x = new_pos;
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.pos.x, this.pos.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function () {
    "use strict";
    this.pos = {x: 0, y: MAP.spriteBeginningYPos};
    this.sprite = 'images/char-princess-girl.png';
};
Player.prototype.update = function (dt) {
    "use strict";
}; // curruntly blank
Player.prototype.render = function () {
    "use strict";
    ctx.drawImage(Resources.get(this.sprite), this.pos.x, this.pos.y);
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


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies

var allEnemies = [new Enemy(2), new Enemy(3), new Enemy(4), new Enemy(3)];
// Place the player object in a variable called player
var player = new Player();


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

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
    //var maxY = (MAP.rows - 1) * MAP.blockHeight + 180;
    if (type === 'x') {
        if (val <= maxX && val >= minX) { returnVal = true; }
    }
    else if (val <= maxY && val >= minY) { returnVal = true; }
    return returnVal;
}