let canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');

let canvasWidth = 600;
let canvasHeight = 600;
let gridSquareSize = 20;

let FPS = 10;
let windowInterval = null;

let playerMovementSpeed = 1; //Grid squares per second
let minTailSize = 5;

let player = null;
let apple = null;

//Movement
let KEYCODE_MOVE_LEFT = 37;
let KEYCODE_MOVE_UP = 38;
let KEYCODE_MOVE_RIGHT = 39;
let KEYCODE_MOVE_DOWN = 40;

//Key throttling
let lastKeyPress = 0;
let keyTimeGap = 75; //ms between keypresses to prevent suicide bug

let moving = false;
let movementDir = 3;

let MOVE_LEFT = 0;
let MOVE_UP = 1;
let MOVE_RIGHT = 2;
let MOVE_DOWN = 3;

addEventListener('keydown', keyDown, false);

/** PLAYER OBJECT */
function Player(x, y, tailSize) {
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;
    this.tailSize = tailSize;
    this.tail = [];
    this.addTail = false;

    this.draw = function() {
        //Draw player square and its tail based on grid size
        ctx.fillStyle = "#FFF";
        ctx.strokeStyle = "#000";
        ctx.beginPath();
        ctx.rect(this.x, this.y, gridSquareSize, gridSquareSize);
        ctx.fill();
        ctx.stroke();
        //Draw tail
        this.tail.forEach((tailPoint) => {
            //Tail point is a 2 element array - first elt is x, second is y
            ctx.beginPath();
            ctx.rect(tailPoint[0], tailPoint[1], gridSquareSize, gridSquareSize);  
            ctx.fill(); 
            ctx.stroke();         
        });
    }

    this.update = function() {
        //Move player
        this.prevX = this.x;
        this.prevY = this.y;
        switch(movementDir) {
            case MOVE_LEFT:
                this.x -= gridSquareSize;
                break;
            case MOVE_UP:
                this.y -= gridSquareSize;
                break;
            case MOVE_RIGHT:
                this.x += gridSquareSize;
                break;
            case MOVE_DOWN:
                this.y += gridSquareSize;                
                break;                
        }
        //Handle Left/Right Rollover 
        if(this.x >= canvasWidth) {
            this.x = 0;
        }
        if(this.x < 0) {
            this.x = canvasWidth - gridSquareSize;
        }
        //Handle Top/Bottom Rollover
        if(this.y >= canvasHeight) {
            this.y = 0;
        }
        if(this.y < 0) {
            this.y = canvasHeight - gridSquareSize;
        }
        
        //Detect collision
        if(this.detectTailCollision()) {
            this.reset();
            return;
        }

        //Add tail piece
        if(this.addTail) {
            this.tail.push([0,0]);
            this.addTail = false;
        }
        
        //Move Tail
        for(let i=this.tail.length-1; i>=0; i--) {
            //First tail box will go to where player was
            if(i===0) {
                this.tail[i] = [this.prevX, this.prevY];
            } else {
                this.tail[i] = [this.tail[i-1][0], this.tail[i-1][1]]
            }
        }

        
    }

    this.detectTailCollision = function() {
        //Iterate through all tail points and see if has same x,y as player
        let collision = false;
        this.tail.forEach((tailBox) => {
            if(tailBox[0] == this.x && tailBox[1] == this.y) {
                collision = true;
            }
        });

        return collision;
    }

    this.populateInitialTail = function() {
        for(let i=1; i <= this.tailSize; i++) {
            let tailPoint = [];
            let tailPointX = this.x - gridSquareSize*i;
            let tailPointY = this.y;
            tailPoint.push(tailPointX);
            tailPoint.push(tailPointY);
            this.tail.push(tailPoint);
        }
    }

    this.reset = function() {
        ctx.clearRect(0,0, canvasWidth, canvasHeight);
        this.x = canvasWidth / 2;
        this.y = canvasHeight / 2;
        movementDir = 2;
        this.tailSize = minTailSize;
        this.tail = [];
        this.populateInitialTail();
    }
}

/** APPLE OBJECT */
function Apple(x, y) {
    this.x = x;
    this.y = y;
    
    this.draw = function() {
        ctx.fillStyle = "green";
        ctx.fillRect(this.x, this.y, gridSquareSize, gridSquareSize);
        ctx.strokeStyle = "#000";
        ctx.stroke();
    }

    this.update = function() {
        //Check if collided with player
        if(this.x == player.x && this.y == player.y) {
            player.addTail = true;
            this.x = Math.floor(Math.random() * canvasWidth / gridSquareSize) * gridSquareSize;
            this.y = Math.floor(Math.random() * canvasHeight / gridSquareSize) * gridSquareSize;
            console.log(this.x, this.y);
        }
    }

}

/** KEYBOARD EVENTS */
function keyDown(e) {
    if(lastKeyPress + keyTimeGap < Date.now()) {
        switch(e.keyCode) {
            case KEYCODE_MOVE_LEFT:
                if(movementDir != MOVE_RIGHT) {
                    movementDir = MOVE_LEFT;
                }
                lastKeyPress = Date.now();
                break;
            case KEYCODE_MOVE_UP:
                if(movementDir != MOVE_DOWN) {
                    movementDir = MOVE_UP;
                }
                lastKeyPress = Date.now();
                break;
            case KEYCODE_MOVE_RIGHT:
                if(movementDir != MOVE_LEFT) {
                    movementDir = MOVE_RIGHT;
                }
                lastKeyPress = Date.now();
                break;
            case KEYCODE_MOVE_DOWN:
                if(movementDir != MOVE_UP) {
                    movementDir = MOVE_DOWN;
                }
                lastKeyPress = Date.now();
                break;
        }
    }

}

function init() {
    //Resize canvas
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    //Init player
    player = new Player(canvasWidth/2 - gridSquareSize, canvasHeight/2 - gridSquareSize, minTailSize);
    player.populateInitialTail();

    //Init apple
    apple = new Apple(Math.floor(Math.random() * canvasWidth / gridSquareSize) * gridSquareSize,
        Math.floor(Math.random() * canvasHeight / gridSquareSize) * gridSquareSize);

    //Start game loop
    windowInterval = window.setInterval(gameLoop, 1000/FPS, false);
}

function gameLoop() {
    //Clear Screen
    ctx.clearRect(0,0, canvasWidth, canvasHeight);

    //Update
    player.update();
    apple.update();

    //Draw
    player.draw();
    apple.draw();

}

init();