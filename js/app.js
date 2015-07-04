// The MAP global variable contains initialization details and the state of the game map.
var Map = {
    columns: 5,
    rows: 6,
    BLOCKWIDTH: 101,
    BLOCKHEIGHT: 83, // The size of a visible block is 83, the character also should move in the y axis by 83px.
    numberOfEnemies: 4,
    gameRunning: true,
    collided: false,
    score: 0,
    debug: false
};
// This is the default Y-axis position for the player, it scales automatically according to map size. The
// default position for X-axis is 0. The -80 is used to offset the blank area on the top of the map.
Map.SPRITE_BEGINNING_Y_POS = (Map.rows * Map.BLOCKHEIGHT) - 80 - Math.floor(Map.BLOCKHEIGHT / 2);

// Function to get a random number within a range.
function randRange(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

// Common parent of Enemy & Player.
var LivingThing = function () {
    this.player = false;
};
// Function to render player/enemy.
LivingThing.prototype.render = function (debug) {
    "use strict";
    ctx.drawImage(Resources.get(this.sprite), this.pos.x, this.pos.y);
    // If the we are rendering the player, and the player collided with a enemy.
    if (Map.collided && this.player) {
        var center = this.getCenter();
        ctx.drawImage(Resources.get('images/red-x_mark.png'), center.x - (Map.BLOCKWIDTH /2), center.y - (Map.BLOCKHEIGHT / 2));
    }
    if (debug === true) {
        drawDebugCircles(this.getCenter(), this.radius, this.player);
    }
};
// Get the center point of the object to calculate collision.
LivingThing.prototype.getCenter = function () {
    "use strict";
    var x = this.pos.x + parseInt(Map.BLOCKWIDTH / 2);
    var y = this.pos.y + 120;
    return {x: x, y: y};
};

// Enemies our player must avoid, the row_num is the the row block the enemy travels in.
var Enemy = function (row_num) {
    "use strict";
    LivingThing.call(this);
    // The image graphic of the enemy.
    this.sprite = 'images/enemy-bug.png';
    // The pos variable contains the location of the enemy in the map (in pixels).
    // Set a random starting X position within the bug's travel path.
    var random_x = randRange(-Map.BLOCKWIDTH, Map.columns * Map.BLOCKWIDTH);
    // Set the starting Y in the correct row specified when creating the enemy object.
    this.pos = {x: random_x, y: Map.SPRITE_BEGINNING_Y_POS - (row_num * Map.BLOCKHEIGHT) };
    this.speed = randRange(5, 10); // The speed of the enemy. Value is between 30 & 100
    // The radius to calculate the circular area occupied by the enemy. Used for collision detection.
    this.radius = (Map.BLOCKWIDTH - 2) / 2;
};
// Enable inheriting LivingThing's prototype.
Enemy.prototype = Object.create(LivingThing.prototype);
// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function (dt) {
    "use strict";
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    // -101 < bug_x_position < width*101
    var min_pos = -Map.BLOCKWIDTH;
    var max_pos = Map.columns * Map.BLOCKWIDTH;
    var new_pos = this.pos.x + (this.speed * 10 * dt);
    // Make the x position fit the visible range no matter how big the dt variable is.
    // Also note that the enemy can't travel backwards.
    while (new_pos > max_pos) {
        new_pos = new_pos - max_pos + min_pos;  // TODO: Using a mod might be more efficient.
    }
    this.pos.x = new_pos;
};

// The class containing the player the user controls.
var Player = function () {
    "use strict";
    LivingThing.call(this);
    this.pos = {x: 0, y: Map.SPRITE_BEGINNING_Y_POS};
    this.sprite = 'images/char-princess-girl.png';
    this.radius = 30;
    this.player = true; // Variable used to make debug circle colour different from enemies & to display the X mark.
};
// Player update function not needed.
//Player.prototype.update = function (dt) {
//};
// Enable inheriting LivingThing's prototype.
Player.prototype = Object.create(LivingThing.prototype);
Player.prototype.moveUp = function (pixels) {
    this.pos.y -= this.locationValid(this.pos.y - pixels, 'y') ? pixels : 0; //move up if within field
};
Player.prototype.moveDown = function (pixels) {
    this.pos.y += this.locationValid(this.pos.y + pixels, 'y') ? pixels : 0; //move down if within field
};
Player.prototype.moveLeft = function (pixels) {
    this.pos.x -= this.locationValid(this.pos.x - pixels, 'x') ? pixels : 0; //move left if within field
};
Player.prototype.moveRight = function (pixels) {
    this.pos.x += this.locationValid(this.pos.x + pixels, 'x') ? pixels : 0;  //move up if within field
};
// Send the keystrokes to the player movement function.
Player.prototype.handleInput = function (keypress) {
    "use strict";
    if (!Map.collided) {
        if (keypress === 'left') {
            this.moveLeft(Map.BLOCKWIDTH);
        }
        else if (keypress === 'right') {
            this.moveRight(Map.BLOCKWIDTH);
        }
        else if (keypress === 'up') {
            this.moveUp(Map.BLOCKHEIGHT);
        }
        else if (keypress === 'down') {
            this.moveDown(Map.BLOCKHEIGHT);
        }
    }
};
// Does the bounds checking for the player.
Player.prototype.locationValid = function (val, type) {
    "use strict";
    var returnVal = false;
    type = typeof type !== 'undefined' ? type : 'x';
    var minX = 0;
    // Max moveable area. 1 less than map size. Because we are only moving In the middles of the tiles, not the edges.
    var maxX = (Map.columns - 1) * Map.BLOCKWIDTH;
    var minY = -50;
    var maxY = Map.SPRITE_BEGINNING_Y_POS;
    // If area to be moved is within map, return true.
    if (type === 'x') {
        if (val <= maxX && val >= minX) { returnVal = true; }
    }
    else if (val <= maxY && val >= minY) { returnVal = true; }
    return returnVal;
};

var allEnemies, player;
// Function that creates the player & enemies. Used to reset map too.
function initializeCharacters(resetMap) {
    "use strict";
    // Place all enemy objects in an array called allEnemies.
    allEnemies = [];
    var i, row_num;
    // Dynamically create enemies based on number in the Map variable.
    for (i = 0; i < Map.numberOfEnemies; i += 1) {
        row_num = Math.round(randRange(2, 4));  // Add enemies to the rows 2, 3, 4.
        allEnemies.push(new Enemy(row_num));
    }
    // Place the player object in a variable called player
    player = new Player();
    if (resetMap === true) {
        Map.collided = false;
        Map.gameRunning = true;
        Map.score = 0;
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

// Draw the debug circles that shows the range used for collision detection.
function drawDebugCircles(center_position, radius, player) {
    var alpha = ctx.globalAlpha;
    var color;
    ctx.beginPath();
    ctx.arc(center_position.x, center_position.y, radius, 0, 2 * Math.PI, false);
    ctx.globalAlpha = 0.5;
    color = player ? 'blue': 'red';
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.globalAlpha = alpha;
}

// Switch debug more on or off.
function switchDebug () {
    Map.debug = !Map.debug;
}

// Paue updating the enemies's update, movement and map updates.
function pauseApp () {
    if (!Map.collided) {
        Map.gameRunning = !Map.gameRunning;
    }
}

//Add extra column to map.
function makeMapWider () {
    Map.columns += 1;
}
// Remove last column from map.
function makeMapThinner () {
    Map.columns -= 1;
}
// Add a single enemy to the enemy list.
function addEnemy() {
    Map.numberOfEnemies += 1;
}
// Remove enemies if they exist.
function removeEnemy() {
    if (Map.numberOfEnemies > 0) {
        Map.numberOfEnemies -= 1;
    }
}
// Update the number of enemies based on the input.
function updateEnemy(e) {
    if (!isNaN(e.value)) {
        Map.numberOfEnemies = parseInt(e.value);
    }
}