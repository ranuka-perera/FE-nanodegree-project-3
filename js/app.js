// Enemies our player must avoid
var Enemy = function () {
    "use strict";
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.pos = {x: 0, y: 0};
    this.speed = Math.random(); // 1 is the fastest.
    if (this.speed < 0.3) { this.speed = 0.3; }  // The speed of the enemy.
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function (dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
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
    this.pos = {x: 0, y: 390};
    this.sprite = 'images/char-princess-girl.png';
};
Player.prototype.update = function (dt) {
    "use strict";
};
Player.prototype.render = function () {
    "use strict";
    ctx.drawImage(Resources.get(this.sprite), this.pos.x, this.pos.y);
};
Player.prototype.handleInput = function (keypress) {
    "use strict";
    if (keypress === 'left') {
        this.pos.x -= locationValid(this.pos.x - 101, 'x') ? 101 : 0; //left action
    }
    else if (keypress === 'right') {
        this.pos.x += locationValid(this.pos.x + 101, 'x') ? 101 : 0; //right action
    }
    else if (keypress === 'up') {
        this.pos.y -= locationValid(this.pos.y - 83, 'y') ? 83 : 0; //up action
    }
    else if (keypress === 'down') {
        this.pos.y += locationValid(this.pos.y + 83, 'y') ? 83 : 0; //down action
    }
};


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
var allEnemies = [new Enemy()];
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
    var maxX = (6-1) * 83;  // Max moveable area. 1 less than map size.
    var maxY = (5-1) * 101;
    if (type === 'x' && val > -1) {
        if (val < maxX) { returnVal = true; }
    }
    else if (val > -84) {
        if (val < maxY) { returnVal = true; }
    }
    return returnVal;
}