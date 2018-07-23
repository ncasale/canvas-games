let canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');
let canvasWidth = 600;
let canvasHeight = 600;

let FPS = 30;

let player = null;
let playerBase = 15;
let playerHeight = 25;
let playerMovementSpeed = 8;

//Asteroids
let asteroids = [];
let minAsteroidRadius = 10;
let maxAsteroidRadius = 50;
let maxAsteroidsOnScreen = 10;
let maxAsteroidVelocity = 3;

//Movement
addEventListener('keydown', keyDown, false);
addEventListener('keyup', keyUp, false);

let KEYCODE_MOVE_LEFT = 65;
let KEYCODE_MOVE_UP = 87;
let KEYCODE_MOVE_RIGHT = 68;
let KEYCODE_MOVE_DOWN = 83;

let moving_left = false;
let moving_up = false;
let moving_right = false;
let moving_down = false;

//Aiming
addEventListener('mousemove', onMouseMove, false);
addEventListener('mousedown', fireProjectile, false);
let projectileSpeed = 15;
let projectileSize = 2;
let projectiles = [];

//Score/lives
let score = 0;
let lives = 3;
let maxScore = 99999;
let baseScore = 150;
let velocityModifier = 25;

//Reset
let KEYCODE_RESET = 82;

//Interval function to loop game loop
let windowInterval = null;

/** PLAYER OBJECT */
function Player(x, y) {
    this.x = x;
    this.y = y;

    //Bottom Left Coords
    this.bottomLeftX = 0;
    this.bottomLeftY = 0;
    this.rotatedBottomLeftX = 0;
    this.rotatedBottomLeftY = 0;
    //Bottom right coords
    this.bottomRightX  = 0;
    this.bottomRightY = 0;
    this.rotatedBottomRightX = 0;
    this.rotatedBottomRightY = 0;
    //Top coords
    this.topX = 0;
    this.topY = 0;
    this.rotatedTopX = 0;
    this.rotatedTopY = 0;

    this.rotationAngle = 0;
    this.maxRotationAngle = Math.PI * 2;
    this.base = playerBase;
    this.height = playerHeight;

    this.destroy = false;

    this.draw = function() {  
        //Calculate vertices
        this.calculateVertexCoordinates();
        this.calculateRotatedVertexCoordinates();      
        //Draw a triangle
        ctx.beginPath();
        if(this.destroy) {
            ctx.strokeStyle = "red";
        } else{
            ctx.strokeStyle = "#fff";
        }
        ctx.moveTo(this.rotatedBottomLeftX, this.rotatedBottomLeftY); //move to bottom left corner
        ctx.lineTo(this.rotatedBottomRightX, this.rotatedBottomRightY); //Line from bottom left to bottom right
        ctx.lineTo(this.rotatedTopX, this.rotatedTopY);
        ctx.lineTo(this.rotatedBottomLeftX, this.rotatedBottomLeftY);
        ctx.stroke();
    }

    this.update = function() {
        if(moving_left) {
            if(this.rotatedBottomLeftX < 0) {
                this.rotatedBottomLeftX = 0;
            } else if(this.rotatedBottomRightX < 0) {
                this.rotatedBottomRightX = 0;
            } else if(this.rotatedTopX < 0) {
                this.rotatedTopX = 0;
            } else {
                this.x -= playerMovementSpeed;
            }
        }
        if(moving_right) {
            if(this.rotatedBottomLeftX > canvasWidth) {
                this.rotatedBottomLeftX = canvasWidth;
            } else if(this.rotatedBottomRightX > canvasWidth) {
                this.rotatedBottomRightX = canvasWidth;
            } else if(this.rotatedTopX > canvasWidth) {
                this.rotatedTopX = canvasWidth;
            } else {
                this.x += playerMovementSpeed;
            }
        }
        if(moving_up) {
            if(this.rotatedBottomLeftY < 0) {
                this.rotatedBottomLeftY = 0;
            } else if(this.rotatedBottomRightY < 0) {
                this.rotatedBottomRightY = 0;
            } else if(this.rotatedTopY < 0) {
                this.rotatedTopY = 0;
            } else {
                this.y -= playerMovementSpeed;
            }
        }
        if(moving_down) {
            if(this.rotatedBottomLeftY > canvasHeight) {
                this.rotatedBottomLeftY = canvasHeight;
            } else if(this.rotatedBottomLeftY > canvasHeight) {
                this.rotatedBottomLeftY = canvasHeight;
            } else if(this.rotatedTopY > canvasHeight) {
                this.rotatedTopY = canvasHeight;
            } else {
                this.y += playerMovementSpeed;
            }
        } 
    }

    this.calculateVertexCoordinates = function() {
        //Bottom Left
        this.bottomLeftX = this.x - this.base/2;
        this.bottomLeftY = this.y + this.height/2;
        //Bottom Right
        this.bottomRightX = this.x + this.base/2;
        this.bottomRightY = this.y + this.height/2;
        //Top
        this.topX = this.x;
        this.topY = this.y - this.height/2;
    }

    this.calculateRotatedVertexCoordinates = function() {
        //((x−x0)cosθ−(y−y0)sinθ+x0,(x−x0)sinθ+(y−y0)cosθ+y0)

        //Bottom Left
        let rotatedBottomLeft = this.rotationFunction(this.x, this.y, this.bottomLeftX, this.bottomLeftY, this.rotationAngle);
        this.rotatedBottomLeftX = rotatedBottomLeft[0];
        this.rotatedBottomLeftY = rotatedBottomLeft[1];
        //Bottom Right
        let rotatedBottomRight = this.rotationFunction(this.x, this.y, this.bottomRightX, this.bottomRightY, this.rotationAngle);
        this.rotatedBottomRightX = rotatedBottomRight[0];
        this.rotatedBottomRightY = rotatedBottomRight[1];
        //Top
        let rotatedTop = this.rotationFunction(this.x, this.y, this.topX, this.topY, this.rotationAngle);
        this.rotatedTopX = rotatedTop[0];
        this.rotatedTopY = rotatedTop[1];
    }

    this.rotationFunction = function(originX, originY, xp, yp, angle) {
        let x_return = (xp - originX)*Math.cos(angle) - (yp - originY)*Math.sin(angle) + originX;
        let y_return = (xp - originX)*Math.sin(angle) + (yp - originY)*Math.cos(angle) + originY;
        return [x_return, y_return];
    }

    this.reset = function() {
        this.x = canvasWidth / 2;
        this.y = canvasHeight / 2;
        this.rotationAngle = 0;
        this.destroy = false;
    }

    this.markForDestruction = function() {
        this.destroy = true;
    }

    this.getX = function() {return this.x};
    this.getY = function() {return this.y};
    this.getRotationAngle = function() {
        //Subtract 90 degrees to account for player offset
        return this.rotationAngle - Math.PI / 2;
    };
    this.getRotatedTopX = function() {return this.rotatedTopX};
    this.getRotatedTopY = function() {return this.rotatedTopY};
    this.setRotationAngle = function(angle) {
        //Add 90 degrees to account for player being initially offset by -90
        this.rotationAngle = angle + Math.PI / 2
    };

    this.getRotatedPoints = function() {
        let top = [this.rotatedTopX, this.rotatedTopY];
        let left = [this.rotatedBottomLeftX, this.rotatedBottomLeftY];
        let right = [this.rotatedBottomRightX, this.rotatedBottomRightY];
        return [top, left, right];
    }
}

/** PROJECTILE OBJECT */
function Projectile(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.destroy = false;

    this.draw = function() {
        //Draw circle to represent projectile
        ctx.beginPath();
        ctx.arc(this.x, this.y, projectileSize, 0, Math.PI * 2, false);
        ctx.fillStyle = "#fff";
        ctx.fill();
    }

    this.update = function() {
        //Move projectile along angle line
        this.x += projectileSpeed * Math.cos(this.angle);
        this.y += projectileSpeed * Math.sin(this.angle);
    }

    this.markForDestruction = function() {
        this.destroy = true;
    }

    this.getX = function() {
        return this.x;
    }

    this.getY = function() {
        return this.y;
    }

}

/** ASTEROID OBJECT */
function Asteroid(x, y, dx, dy, radius) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.radius = radius;
    this.pointAngles = [];
    this.hasBeenShot = false;
    this.destroy = false;
    this.hasBeenOnScreen = false;

    this.generatePolygon = function() {
        //Generate a polygon
        let numPoints = 9;
        let maxVariance = Math.PI / 4; // +/-22.5 degrees
        for(let i =0; i < numPoints; i++) {
            let angle = (Math.PI * 2 / numPoints) * i + maxVariance * (Math.random() - 0.5);
            this.pointAngles.push(angle);
        }
    }    

    this.draw = function() {
        //Draw the five points
        ctx.beginPath();
        ctx.strokeStyle = "#fff";
        this.pointAngles.forEach((angle) => {
            ctx.lineTo(this.x + this.radius * Math.cos(angle), this.y + this.radius * Math.sin(angle));
        })
        ctx.lineTo(this.x + this.radius * Math.cos(this.pointAngles[0]), this.y + this.radius * Math.sin(this.pointAngles[0]));
        ctx.stroke();
    }

    this.update = function() {
        this.x += this.dx;
        this.y += this.dy;

        //Check if this is the first time asteroid has been on screen
        if(!this.hasBeenOnScreen) {
            if((this.x + radius > 0 || this.x - radius < canvasWidth) &&
            (this.y + radius > 0 && this.y - radius < canvasHeight)) {
                this.hasBeenOnScreen = true;
            }
        }

        //Check if asteroid has gone off-screen and destroy
        if(this.hasBeenOnScreen) {
            if((this.x + radius < 0 || this.x - radius > canvasWidth) ||
            (this.y + radius < 0 || this.y - radius > canvasHeight)) {
                this.destroy = true;
            }
        }

        //If asteroid is to be destroyed, halve radius and create two new asteroids
        if(this.hasBeenShot && (this.radius / 2 >= minAsteroidRadius)) {
            let child1 = new Asteroid(this.x + this.radius * Math.random(), this.y + this.radius * Math.random(), this.dx, this.dy, this.radius/2);
            let child2 = new Asteroid(this.x + this.radius * Math.random(), this.y + this.radius * Math.random(), this.dx, -this.dy, this.radius/2);
            child1.generatePolygon();
            child2.generatePolygon();
            asteroids.push(child1);
            asteroids.push(child2);
        }
    }

    this.markAsShot = function() {
        this.hasBeenShot = true;
        this.destroy = true;
    }

    this.getX = function() {
        return this.x;
    }

    this.getY = function() {
        return this.y;
    }

    this.getRadius = function() {
        return this.radius;
    }

    this.getDx = function() {
        return this.dx;
    }

    this.getDy = function() {
        return this.dy;
    }
    
}

function keyDown(e) {
    switch(e.keyCode) {
        case KEYCODE_MOVE_LEFT:
            moving_left = true;
            break;
        case KEYCODE_MOVE_UP:
            moving_up = true;
            break;
        case KEYCODE_MOVE_RIGHT:
            moving_right = true;
            break;
        case KEYCODE_MOVE_DOWN:
            moving_down = true;
            break;
        case KEYCODE_RESET:
            resetGame();
            break;
    }
}

function keyUp(e) {
    switch(e.keyCode) {
        case KEYCODE_MOVE_LEFT:
            moving_left = false;
            break;
        case KEYCODE_MOVE_UP:
            moving_up = false;
            break;
        case KEYCODE_MOVE_RIGHT:
            moving_right = false;
            break;
        case KEYCODE_MOVE_DOWN:
            moving_down = false;
            break;
    }
}

/** AIMING CALLBACK */
function onMouseMove(e) {
    //calculate angle between player center and mouse pointer
    let mouseX = e.clientX;
    let mouseY = e.clientY;
    let playerX = player.getX() + canvas.getBoundingClientRect().left;
    let playerY = player.getY() + canvas.getBoundingClientRect().top;

    let adjLength = mouseX - playerX;
    let xDiff = mouseX - playerX;
    let yDiff = mouseY - playerY;
    let hypLength = Math.sqrt((xDiff**2) + (yDiff**2));
    
    let angle = -Math.acos(adjLength/hypLength);
    if(playerY < mouseY) {
        //3rd Quad
        angle = 2*Math.PI - angle;
    }
    player.setRotationAngle(angle);
}

function fireProjectile() {
    let originX = player.getRotatedTopX();
    let originY = player.getRotatedTopY();
    let angle = player.getRotationAngle();
    //Spawn projectile and add to pool
    let projectile = new Projectile(originX, originY, angle);
    projectiles.push(projectile);
}

function drawProjectiles() {
    projectiles.forEach((proj) => {
        proj.draw();
    })
}

function updateProjectiles() {
    projectiles.forEach((proj) => {
        proj.update();
    })

    //Destroy any projectiles that need to be destroyed
    projectiles = projectiles.filter((proj) => !proj.destroy);
}

function drawAsteroids() {
    asteroids.forEach((asteroid) => {
        asteroid.draw();
    })
}

function updateAsteroids() {
    asteroids.forEach((asteroid) => {
        asteroid.update();
    })
    //Destroy any asteroids that have been shot
    asteroids = asteroids.filter((asteroid) => !asteroid.destroy);
}

function detectProjectileAsteroidCollisions() {
    //Iterate through all asteroids
    asteroids.forEach((asteroid) => {
        //For each asteroid, see if any projectiles collided
        projectiles.forEach((projectile) => {
            //Find resultant vector between projectile and center of asteroid
            let xDiff = asteroid.getX() - projectile.getX();
            let yDiff = asteroid.getY() - projectile.getY();
            let resultant = Math.sqrt((xDiff*xDiff) + (yDiff*yDiff));
            //If hit, mark both asteroid and projectile for destruction
            if(resultant <= asteroid.getRadius()) {
                asteroid.markAsShot();
                projectile.markForDestruction();
                //Increment score according to radius
                let velocityMod = velocityModifier * Math.max(asteroid.getDx(), asteroid.getDy());
                score += baseScore - Math.floor(asteroid.getRadius()) + velocityMod;                
            }
        })
    })
}

function detectAsteroidPlayerCollisions() {
    //Iterate through all asteroids
    asteroids.forEach((asteroid) => {
        //Hacky Solution -- check if any of the player's points lies within the asteroids
        let points = player.getRotatedPoints();
        points.forEach((point) => {
            //See if point lies within asteroid collider
            let xDiff = point[0] - asteroid.getX();
            let yDiff = point[1] - asteroid.getY();
            if(Math.sqrt((xDiff*xDiff) + (yDiff*yDiff)) <= asteroid.getRadius()) {
                //PLAYER HIT
                player.markForDestruction();
                handleLifeLoss();                
            }
        })
    })
}

function handleLifeLoss() {
    //Decrement lives
    lives -= 1;
    //Clear screen, projectiles, and asteroids
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    asteroids = [];
    projectiles = [];
    //Reset player
    player.reset();

    //If out of lives, end game
    if(lives == 0) {
        //End Game Loop
        clearInterval(windowInterval);
        //Draw end game text
        let endGameText = "Game Over!";
        ctx.fillStyle = "#FFF";
        ctx.font = "30px Georgia";
        ctx.fillText(endGameText, canvasWidth / 2 - 50, canvasHeight / 2);
        ctx.fillText("Score: " + score, canvasWidth / 2 - 50, canvasHeight / 2 + 30);
    }
}

function adjustDifficulty() {
    maxAsteroidsOnScreen = 10 + Math.floor(score/5000);
}

function spawnAsteroids() {
    //Spawn asteroids off-screen
    if(asteroids.length < maxAsteroidsOnScreen) {
        //Spawn area dimensions
        let spawnMargin = 200;
        //Create asteroid off-screen
        let x = Math.random() * canvasWidth - spawnMargin;
        let y = Math.random() * canvasHeight - spawnMargin;
        let radius = Math.max(Math.random() * maxAsteroidRadius, minAsteroidRadius);
        //Ensure that asteroid spawns off-screen -- start by checking if x and y are within spawn zone
        let xValid = false;
        let yValid = false;
        if((x + radius < 0) || (x - radius) > canvasWidth) {
            xValid = true;
        }
        if((y + radius < 0) || (y - radius) > canvasHeight) {
            yValid = true;
        }
        //If one dimension is off-screen, then we're fine. Otherwise, we have to pick which dimension to force
        //off-screen
        if(!xValid && !yValid) {
            //Decide dimension to force off-screen
            if(Math.random() < 0.5) {
                //Force X -- decide positive or negative
                if(Math.random() < 0.5) {
                    //Negative
                    x = -radius;
                } else {
                    x = canvasWidth + radius;
                }                
            } else {
                //Force Y -- decide positive or negative
                if(Math.random() < 0.5) {
                    //Negative
                    y = -radius;
                } else {
                    y = canvasHeight + radius;
                }
            }
        }
        //Decide velocities for asteroids based on starting position
        let dx = Math.max(Math.random() * maxAsteroidVelocity, 1);
        let dy = Math.max(Math.random() * maxAsteroidVelocity, 1);
        if(x < canvasWidth / 2) {
            dx = dx;
        } else {
            dx = -dx;
        }
        if(y < canvasHeight / 2) {
            dy = dy;
        } else {
            dy = -dy;
        }
        //Spawn new asteroid
        let newAsteroid = new Asteroid(x, y, dx, dy, radius);
        newAsteroid.generatePolygon();
        asteroids.push(newAsteroid);
    }

}

/** SCORE */
function drawScore() {
    if(score > maxScore) {
        score = maxScore;
    }
    ctx.font = "12px Georgia";
    let scoreText = (score/100000).toFixed(5).toString().substr(2, 6);
    ctx.fillStyle = "#FFF";
    ctx.fillText(scoreText, canvasWidth / 2, 20);

    if(score >= maxScore) {
        ctx.font = "40px Georgia";
        ctx.fillStyle = "#FFF";
        ctx.fillText("Get a life.", canvasWidth / 2 - 60, canvasHeight/2);
        //Stop game
        clearInterval(windowInterval);
    }
}

/** LIVES */
function drawLives() {
    //Draw a small triangle in bottom right for each life
    let startingPointX = 560;
    let startingPointY = 580;
    let lifeBase = 10;
    let lifeHeight = 25;
    for(let i = 0; i < lives; i++) {
        ctx.beginPath();
        ctx.strokeStyle = "#FFF";
        let offset = i * (lifeBase + 5);
        ctx.moveTo(startingPointX - offset, startingPointY);
        ctx.lineTo(startingPointX - lifeBase - offset, startingPointY); //Bottom Left
        ctx.lineTo(startingPointX - lifeBase / 2 - offset, startingPointY - lifeHeight);
        ctx.lineTo(startingPointX - offset, startingPointY);
        ctx.stroke();
    }
}

/** RESET GAME */
function resetGame() {
    lives = 3;
    score = 0;

    //Reset player, asteroids, and projectiles
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    player.reset();
    asteroids = [];
    projectiles = [];
    
    //Reset game loop
    if(windowInterval !== null) {
        clearInterval(windowInterval);
    } 
    windowInterval = window.setInterval(gameLoop, 1000/FPS, false);
}

/** INIT FUNCTION */
function init() {
    //Resize the canvas
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    //Create the player at the center of the screen
    player = new Player(canvasWidth/2, canvasHeight/2);

    //Start the game loop
    windowInterval = window.setInterval(gameLoop, 1000/FPS, false);
}

/** MAIN LOOP */
function gameLoop() {
    //Clear screen
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    //Spawn asteroids
    spawnAsteroids();
    
    //Update
    player.update();
    updateProjectiles();
    updateAsteroids();
    adjustDifficulty();
    
    //Detect asteroid collisions
    detectProjectileAsteroidCollisions();
    detectAsteroidPlayerCollisions();


    //Draw
    player.draw();
    drawProjectiles();
    drawAsteroids();
    drawScore();
    drawLives();
}

init();