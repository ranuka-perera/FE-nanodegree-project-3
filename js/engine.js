/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    canvas.width = Map.BLOCKWIDTH * Map.columns;
    canvas.height = (Map.BLOCKHEIGHT * Map.rows) + 108;
    doc.body.appendChild(canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        if (Map.gameRunning) { update(dt); }
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        lastTime = Date.now();
        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        syncMap();
        updateEntities(dt);
        checkCollisions();
    }

    /* This is called by the update function  and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to  the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        //player.update();
    }

    /* Check for player & enemy collisions */
    function checkCollisions() {

        allEnemies.forEach(function(enemy) {
            // From https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
            var player_circle = {radius: enemy.radius, pos: enemy.getCenter()};
            var enemy_circle = {radius: player.radius, pos: player.getCenter()};

            var dx = player_circle.pos.x - enemy_circle.pos.x;
            var dy = player_circle.pos.y - enemy_circle.pos.y;
            var distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < player_circle.radius + enemy_circle.radius) {
                Map.collided = true;
                Map.gameRunning = false;
            }
        });
        // Update score if you jump into the water.
        if (!Map.collided && player.pos.y <= Map.SPRITE_BEGINNING_Y_POS - Map.BLOCKHEIGHT * (Map.rows -1)) {
            Map.score += 1;
            reset();
        }
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/water-block.png',   // Top row is water
                'images/stone-block.png',   // Row 1 of 3 of stone
                'images/stone-block.png',   // Row 2 of 3 of stone
                'images/stone-block.png',   // Row 3 of 3 of stone
                'images/grass-block.png',   // Row 1 of 2 of grass
                'images/grass-block.png'    // Row 2 of 2 of grass
            ],
            numRows = Map.rows,
            numCols = Map.columns,
            row, col;
        // Clear top part of the canvas to avoid getting the characters head stuck in the top edge as there is no redraw.
        ctx.clearRect(0, 0, ctx.canvas.width, Map.BLOCKHEIGHT);
        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * Map.BLOCKWIDTH, row * Map.BLOCKHEIGHT);
            }
        }

        renderEntities(Map.debug);
        renderStatus();
    }

    /* This function is called by the render function and is called on each game
     * tick. It's purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities(debug) {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        allEnemies.forEach(function(enemy) {
            enemy.render(debug);
        });

        player.render(debug);
    }

    /* Render the overlay text for the map to show score or game over.
     */
    function renderStatus() {
        if (Map.collided === true) {
            ctx.font = '25pt Calibri';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'black';
            ctx.fillText(
                'YOU GOT STINKED!! Score: ' + Map.score,
                parseInt(Map.BLOCKWIDTH * Map.columns / 2),
                parseInt(Map.BLOCKHEIGHT * Map.rows * 2 / 3)
            );
        }
        else {
            ctx.font = '15pt Calibri';
            ctx.textAlign = 'right';
            ctx.fillStyle = 'white';
            ctx.fillText(
                'Score: ' + Map.score,
                parseInt(Map.BLOCKWIDTH * Map.columns - (Map.BLOCKWIDTH * 1/8)),
                parseInt((Map.BLOCKHEIGHT / 2) + 40)
            );
        }
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        initializeCharacters();
    }

    /* Function to dynamically update number of enemies or map size based on the Map variable.
     */
    function syncMap() {
        // Change map size.
        var canvas = ctx.canvas;
        var c_height = (Map.BLOCKHEIGHT * Map.rows) + 108;
        var c_width = Map.BLOCKWIDTH * Map.columns;
        //if (canvas.height != c_height) { canvas.height = c_height; }
        if (canvas.width != c_width) { canvas.width = c_width; }

        // Change the number of enemies.
        if (allEnemies.length > Map.numberOfEnemies) { allEnemies.pop(); }
        else if (allEnemies.length < Map.numberOfEnemies) {
            row_num = randRange(2, 4);
            allEnemies.push(new Enemy(row_num));
        }
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-princess-girl.png',
        'images/red-x_mark.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developer's can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);
