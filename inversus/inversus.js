let canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');
let canvasWidth = 700;
let canvasHeight = 700;

let windowInterval = null;
let FPS = 12;

let tileCount = 14;
let tileSize = canvasWidth / tileCount;

//Player Colors
let P1_COLOR = "#FFF";
let P2_COLOR = "#000";
let P_BORDER_COLOR = "cyan";
let P1_TILE_COLOR = "#000";
let P2_TILE_COLOR = "#FFF";

//Player Starting Positions
let player1StartX = 0;
let player1StartY = 0;
let player2StartX = canvasWidth - tileSize;
let player2StartY = canvasHeight - tileSize;

//Movement Listeners
addEventListener('keydown', keyDown, false);
addEventListener('keyup', keyUp, false);

//Movement Keys
let KEY_P1_LEFT = 65;
let KEY_P1_UP = 87;
let KEY_P1_RIGHT = 68;
let KEY_P1_DOWN = 83;
let KEY_P1_SHOOT = 32;

let KEY_P2_LEFT = 37; //75;
let KEY_P2_UP = 38; //79;
let KEY_P2_RIGHT = 39; //186;
let KEY_P2_DOWN = 40; //76;
let KEY_P2_SHOOT = 16 //13;

let STOPPED = -1;
let DIR_LEFT = 0;
let DIR_UP = 1;
let DIR_RIGHT = 2;
let DIR_DOWN = 3;

//Projectiles
let projectiles = [];
let projectileSpeed = 1; //1/Tiles per second frame

//Lives
let playerLives = 3;
let timeBetweenRounds = 3000; //ms

//Start/Reset
let started = false;
KEY_START = 13;
KEY_RESET = 54;

//Object instances
let player1 = null;
let player2 = null;
let grid = null;

/** OBJECT REPRESENTING PLAYER */
function Player(id, x, y) {
    this.id = id; //Used to identify if first or second player
    this.x = x;
    this.y = y;
    this.previousX = x;
    this.previousY = y;
    this.moveDir = {
        left: false,
        up: false,
        right: false,
        down: false,
        stopped: false
    }
    this.aimDir = 0;
    this.fireShot = false;
    this.lives = playerLives;

    this.draw = function() {
        //Draw a square to represent player
        ctx.beginPath();
        if(this.id === 0) {
            ctx.fillStyle = P1_COLOR;
            ctx.strokeStyle = P_BORDER_COLOR;
        } else {
            ctx.fillStyle = P2_COLOR;
            ctx.strokeStyle = P_BORDER_COLOR;
        }
        ctx.rect(this.x, this.y, tileSize, tileSize);
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.lineWidth = 1;
    }

    this.update = function() {
        //Movement
        this.setPrevCoords();
        if(this.moveDir['left'] && this.x > 0) {
            this.x -= tileSize;
        }
        if(this.moveDir['up'] && this.y > 0) {
            this.y -= tileSize;
        }
        if(this.moveDir['right'] && this.x < (canvasWidth-tileSize)) {
            this.x += tileSize;
        }
        if(this.moveDir['down'] && this.y < (canvasHeight - tileSize)) {
            this.y += tileSize;
        }

        //If after we have moved, we determine we are in an invalid square, move us back
        if(!this.determineValidTile(this.x, this.y, this.id)) {
            this.x = this.previousX;
            this.y = this.previousY;
        }

        //Fire shot if necessary
        if(this.fireShot) {
            let newProj = new Projectile(this.id, this.x, this.y, this.aimDir);
            projectiles.push(new Projectile(this.id, this.x, this.y, this.aimDir));
            this.fireShot = false;
        }

        //Determine if we've been hit by shot
        if(this.detectHitByProjectile()) {
            this.kill();
        }
    }

    this.setPrevCoords = function() {
        this.previousX = this.x;
        this.previousY = this.y;
    }

    this.determineValidTile = function(x, y, playerId) {
        //Determine if the tile we are about to move into is one owned by the player
        let validTile = false;
        grid.tiles.forEach((tile) => {
            if(tile.x === x && tile.y === y) {
                //This is the tile we are looking for - does it belong to player?
                validTile = tile.playerId === playerId;
            }
        });
        
        return validTile;
    }

    this.detectHitByProjectile = function() {
        //Iterate through all projectiles and see if any of them collided 
        return projectiles.filter((proj) => proj.drawX === this.x && proj.drawY === this.y && proj.playerId !== this.id).length > 0;
    }

    this.kill = function() {
        console.log("Player " + (this.id + 1) + " has been killed.");
        this.lives -= 1;
        if(this.lives === 0) {
            endGame(this.id);
        } else {
            endRound();
        }
    }

}

/** OBJECT REPRESENTING PROJECTILES */
function Projectile(playerId, x, y, direction) {
    this.playerId = playerId;
    this.actualX = x;
    this.actualY = y;
    this.drawX = x;
    this.drawY = y;
    this.direction = direction;
    this.hitByProj = false;
    this.destroy = false;

    this.draw = function() {
        //Projectile represented by red square
        ctx.beginPath();
        ctx.fillStyle = "red";
        ctx.fillRect(this.drawX, this.drawY, tileSize, tileSize);
        ctx.fill();
    }

    this.update = function() {
        //If this proj is slated to be destroyed, don't bother updating
        if(!this.destroy) {

            //Move
            switch(this.direction) {
                case DIR_LEFT:
                    this.actualX -= tileSize / projectileSpeed;
                    break;
                case DIR_UP:
                    this.actualY -= tileSize / projectileSpeed;
                    break;
                case DIR_RIGHT:
                    this.actualX += tileSize / projectileSpeed;
                    break;
                case DIR_DOWN:
                    this.actualY += tileSize / projectileSpeed;
                    break;
            }
    
            //Calculate coords to draw at
            this.calculateDrawPosition();
    
            //Destroy projectile if necessary
            this.determineIfHitByAnotherProjectile();

            //Flip tiles if they are opposite of current tile color -- don't flip if just hit by another proj
            if(!this.hitByProj) {
                this.flipTile();
            }
    
    
            //If draw off-screen, destroy the projectile
            if(this.drawX < 0 || this.drawX >= canvasWidth || this.drawY < 0 || this.drawY >= canvasHeight) {
                this.destroy = true;
            }
        }

    }

    this.flipTile = function() {
        grid.tiles.forEach((tile) => {
            if(tile.x === this.drawX && tile.y === this.drawY) {
                //This is correct tile, flip if necessary
                tile.setPlayerId(this.playerId);
            }
        })
    }

    this.determineIfHitByAnotherProjectile = function() {
        //Iterate through projectiles, and see if any collided with this projectile
        projectiles.forEach((proj) => {
            //Destroy both projectiles if they are from opposing players
            if(this.drawX === proj.drawX && this.drawY === proj.drawY) {
                if(this.playerId !== proj.playerId) {
                    this.destroy = true;
                    this.hitByProj = true;
                    proj.destroy = true;
                    proj.hitByProj = true;
                }
            }
        })
    }

    this.calculateDrawPosition = function(){
        this.drawX = Math.floor(this.actualX/tileSize) * tileSize;
        this.drawY = Math.floor(this.actualY/tileSize) * tileSize;        
    }
}

/** OBJECT REPRESENTING GRID PLAYERS PLAY ON */
function Grid() {
    this.tiles = [];
    this.draw = function() {
        this.tiles.forEach((tile) => {
            tile.draw();
        })
    }

    this.generateInitialTiles = function() {
        //Create a half p1 and half p2 tiles
        for(let y=0; y<tileCount; y++) {
            for(let x=0; x<tileCount; x++) {
                //All tiles below mid line are for player 2
                let playerId = 0;
                if(y >= tileCount/2) {
                    playerId = 1;
                }
                let newTile = new Tile(x*tileSize, y*tileSize, playerId);
                this.tiles.push(newTile);
            }
        }
    }

}

/** OBJECT REPRESENTING INDIVIDUAL TILE OF GRID */
function Tile(x, y, playerId) {
    this.x = x;
    this.y = y;
    this.playerId = playerId;

    this.draw = function() {
        //Draw box at x,y with tile color of player who owns tile
        ctx.beginPath();
        ctx.fillStyle = this.determineTileFillColor();
        ctx.strokeStyle = this.determineTileBorderColor();
        ctx.rect(x, y, tileSize, tileSize);
        ctx.fill();
        ctx.stroke();
        
    }

    this.determineTileFillColor = function() {
        if(this.playerId === 0) {
            return P1_TILE_COLOR;
        } else {
            return P2_TILE_COLOR;
        }
    }

    this.determineTileBorderColor = function() {
        //Border has opposite color to fill
        if(this.playerId === 0) {
            return P2_TILE_COLOR;
        } else {
            return P1_TILE_COLOR;
        }
    }

    this.setPlayerId = function(id) {
        this.playerId = id;
    }
}

/** KEY LISTENER */
function keyDown(e) {
    switch(e.keyCode) {
        //Player 1 movement
        case KEY_P1_LEFT:
            player1.moveDir['left'] = true;
            player1.aimDir = DIR_LEFT;
            break;
        case KEY_P1_UP:
            player1.moveDir['up'] = true;
            player1.aimDir = DIR_UP;
            break;
        case KEY_P1_RIGHT:
            player1.moveDir['right'] = true;
            player1.aimDir = DIR_RIGHT;
            break;
        case KEY_P1_DOWN: 
            player1.moveDir['down'] = true;
            player1.aimDir = DIR_DOWN;
            break;
        //Player 2 movement
        case KEY_P2_LEFT:
            player2.moveDir['left'] = true;
            player2.aimDir = DIR_LEFT;
            break;
        case KEY_P2_UP:
            player2.moveDir['up'] = true;
            player2.aimDir = DIR_UP;
            break;
        case KEY_P2_RIGHT:
            player2.moveDir['right'] = true;
            player2.aimDir = DIR_RIGHT;
            break;
        case KEY_P2_DOWN: 
            player2.moveDir['down'] = true;
            player2.aimDir = DIR_DOWN;
            break;

        //Shooting
        case KEY_P1_SHOOT:
            player1.fireShot = true;
            break;
        case KEY_P2_SHOOT:
            if(e.code == "ShiftRight"){
                player2.fireShot = true;
            }
            break;

        //Start
        case KEY_START:
            if(!started) {
                startNextRound();
            }

        //Reset
        case KEY_RESET:
            reset();
            break;
    }
}

/** KEY LISTENER */
function keyUp(e) {
    switch(e.keyCode) {
        //Player 1 movement
        case KEY_P1_LEFT:
            player1.moveDir['left'] = false;
            break;
        case KEY_P1_UP:
            player1.moveDir['up'] = false;
            break;
        case KEY_P1_RIGHT:
            player1.moveDir['right'] = false;
            break;
        case KEY_P1_DOWN: 
            player1.moveDir['down'] = false;
            break;
        //Player 2 movement
        case KEY_P2_LEFT:
            player2.moveDir['left'] = false;
            break;
        case KEY_P2_UP:
            player2.moveDir['up'] = false;
            break;
        case KEY_P2_RIGHT:
            player2.moveDir['right'] = false;
            break;
        case KEY_P2_DOWN: 
            player2.moveDir['down'] = false;
            break;
    }
}

/** DRAW/UPDATE PROJECTILES */
function drawProjectiles() {
    //console.log(projectiles);
    projectiles.forEach((proj) => {
        proj.draw();
    })
}

function updateProjectiles() {
    projectiles.forEach((proj) => {
        proj.update();
    })
    //Destroy any unused projectiles
    projectiles = projectiles.filter((proj) => !proj.destroy);
}

/** END THE ROUND */
function endRound() {
    //Stop game loop
    window.clearInterval(windowInterval);
    //Clear screen
    ctx.clearRect(0,0, canvasWidth, canvasHeight);
    //Print out current life count
    let score = "";
    score += (playerLives - player2.lives) + " - " + (playerLives - player1.lives);
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFF";
    ctx.font = "40px Georgia";
    ctx.fillText(score, canvasWidth/2, canvasHeight/2);
    ctx.fill();
    //Start next round
    setTimeout(startNextRound, timeBetweenRounds);
}

/** START THE ROUND */
function startNextRound() {
    //Reset player positions
    player1.x = player1StartX;
    player1.y = player1StartY;
    player2.x = player2StartX;
    player2.y = player2StartY;
    //Clear projectiles
    projectiles = [];
    //Clear and recreate grid
    grid = new Grid();
    grid.generateInitialTiles();
    //Restart game loop
    windowInterval = window.setInterval(gameLoop, 1000/FPS, false);
}

/** END THE GAME */
function endGame(loserId) {
    //Stop game loop
    window.clearInterval(windowInterval);
    //Clear Screen
    ctx.clearRect(0,0, canvasWidth, canvasHeight);
    //Determine winner
    let winner = "";
    if(loserId === 0) {
        winner = "Player 2";
    } else {
        winner = "Player 1";
    }
    //Write winner
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFF";
    ctx.font = "40px Georgia";
    ctx.fillText(winner + " has won!", canvasWidth/2, canvasHeight * 2/5);
    ctx.fillText("Press \'6\' to reset", canvasWidth/2, canvasHeight * 3/5);
}

/** RESET THE GAME */
function reset() {
    //End game loop
    window.clearInterval(windowInterval);
     //Reset players
     player1 = new Player(0, player1StartX, player1StartY);
     player2 = new Player(1, player2StartX, player2StartY);
     //Clear projectiles
     projectiles = [];
     //Clear and recreate grid
     grid = new Grid();
     grid.generateInitialTiles();
     //Restart game loop
     windowInterval = window.setInterval(gameLoop, 1000/FPS, false);
}

/** START THE GAME */
function startGame() {
    ctx.textAlign = "center";
    ctx.font = "30px Georgia";
    ctx.fillStyle = "#FFF";
    ctx.fillText("Player 1 Move/Shoot: WASD/Space", canvasWidth/2, canvasWidth * 1/7);
    ctx.fillText("Player 2 Move/Shoot: Arrow Keys/Right Shift", canvasWidth/2, canvasHeight * 2/7);
    ctx.fillText("First to 3, wins.", canvasWidth/2, canvasHeight * 4/7);
    ctx.fillText("Press Enter to begin battle...", canvasWidth/2, canvasHeight * 5/7);
}


/** MAIN GAME LOOP */
function gameLoop() {
    //Clear screen
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    //Draw
    grid.draw();
    player1.draw();
    player2.draw();
    drawProjectiles();

    //Update
    player1.update();
    player2.update();
    updateProjectiles();

}

/** INITIALIZATION FUNCTION */
function init() {
    //Size canvas
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    //Init object instances
    player1 = new Player(0, player1StartX, player1StartY);
    player2 = new Player(1, player2StartX, player2StartY);
    grid = new Grid();
    grid.generateInitialTiles();

    //Start game loop
    startGame();
    //windowInterval = window.setInterval(gameLoop, 1000/FPS, false);
}

init();