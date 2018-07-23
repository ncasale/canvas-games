var canvas = document.querySelector("canvas");
var c = canvas.getContext('2d');

var FPS = 15;
var canvasWidth = 400;
var canvasHeight = 400;
var windowInterval = null;

var KEYCODE_W = 87;
var KEYCODE_S = 83;
var KEYCODE_UP = 38;
var KEYCODE_DOWN = 40;
var KEYCODE_RESET = 82;

var playerMargin = 1;
var paddleWidth = 10;
var paddleHeight = 60;


var movementSpeed = 10;

var ballWidth = 10;
var ballHeight = 10;
var ballDx = 10;

var playerScore = 0;
var cpuScore = 0;
var playerScoreX = 75;
var playerScoreY = 40;
var scoreFontSize = 40;
var cpuScoreX = canvasWidth - 75 - scoreFontSize;
var cpuScoreY = playerScoreY;
var winningScore = 3;

//Instances of player and cpu
var player = "";
var cpu = "";
var ball = "";

//Key listeners
window.addEventListener("keydown", keyDownEvent, false);
window.addEventListener('keyup', keyUpEvent, false);

var Player = function(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.dy = 0;

    this.draw = function() {
        //Draw player
        c.fillStyle = "#FFFFFF";
        c.fillRect(this.x, this.y, this.width, this.height);
    }

    this.update = function() {
        this.y += this.dy;        
    }

    this.setVelocity = function(dy) {
        this.dy = dy;
    }

    this.getVelocity = function() {
        return this.dy;
    }

    this.setPosition = function(y) {
        this.y = y;
    }

    this.reset = function() {
        this.setPosition(canvasHeight/2);
    }

}

var Cpu = function(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.dy = 0;

    this.draw = function() {
        //Draw cpu
        c.fillStyle = "#FFFFFF";
        c.fillRect(this.x, this.y, this.width, this.height);
    }

    this.update = function() {
        this.y += this.dy;
    }

    this.setVelocity = function(dy) {
        this.dy = dy;
    }

    this.getVelocity = function() {
        return this.dy;
    }

    this.setPosition = function(y) {
        this.y = y;
    }

    this.reset = function() {
        this.setPosition(canvasHeight/2);
    }
}

var Ball = function(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.dy = 0;

    this.draw = function() {
        //Draw the ball
        c.fillStyle = "#FFFFFF";
        c.fillRect(this.x, this.y, this.width, this.height);
    }

    this.update = function() {
        this.x += this.dx;
        this.y += this.dy;

        if(this.x + this.width > canvasWidth) {
            console.log("player has scored");
            playerScore += 1;
            console.log("Score\nP1: " + playerScore + "\nP2: " + cpuScore);
            this.reset();

        }
        if(this.x < 0) {
            console.log("cpu has scored");
            cpuScore += 1;
            console.log("Score\nP1: " + playerScore + "\nP2: " + cpuScore);
            this.reset();
        }
    }

    this.setVelocity = function(dx, dy) {
        this.dx = dx;
        this.dy += dy;
    }

    this.verticalRebound = function() {
        this.dy = -this.dy;
    }

    this.reset = function(scorer) {
        //reset ball
        this.x = canvasWidth/2;
        this.y = canvasHeight/2;
        this.dy = 0;
        //Reset paddles
        player.reset();
        cpu.reset();
    }
}

function drawScore() {
    //Draw player scpre
    c.font="40px Georgia";
    c.fillText(playerScore, playerScoreX, playerScoreY);

    //Draw CPU Score
    c.fillText(cpuScore, cpuScoreX, cpuScoreY);

    //Check for win
    if(playerScore == winningScore) {
        c.font="40px Georgia";
        c.fillText("Player 1 wins!", canvasWidth/2 - 110, canvasHeight/2);
        clearInterval(windowInterval);
    }
    if(cpuScore == winningScore) {
        c.font="40px Georgia";
        c.fillText("Player 2 wins!", canvasWidth/2 - 110, canvasHeight/2);
        clearInterval(windowInterval); 
    }
}


function init() {
    //Resize the canvas
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    //Init player
    player = new Player(playerMargin, 180, paddleWidth, paddleHeight);

    //Init cpu
    cpu = new Cpu(canvasWidth - playerMargin - paddleWidth, 180, paddleWidth, paddleHeight);

    //Init ball
    ball = new Ball(canvasWidth/2, canvasHeight/2, ballWidth, ballHeight);
    ball.setVelocity(ballDx, 0);
    
    //Start gameloop
    windowInterval = window.setInterval(gameLoop, 1000/FPS);
}

function gameLoop() {
    //Clear screen
    c.clearRect(0, 0, canvasWidth, canvasHeight);

    //Update the player, cpu, and ball
    player.update();
    cpu.update();
    ball.update();

    //Calculate collisions
    detectCollisions();

    //Draw the player, cpu, and ball
    player.draw();
    cpu.draw();
    ball.draw();
    drawScore();
}

function keyDownEvent(e) {
    switch(e.keyCode) {
        case KEYCODE_W:
            player.setVelocity(-movementSpeed);
            break;
        case KEYCODE_S:
            player.setVelocity(movementSpeed);
            break;
        case KEYCODE_UP:
            cpu.setVelocity(-movementSpeed);
            break;
        case KEYCODE_DOWN:
            cpu.setVelocity(movementSpeed);
            break;
        case KEYCODE_RESET:
            resetGame();
            break;
    }
}

function keyUpEvent(e) {
    switch(e.keyCode) {
        case KEYCODE_W:
            player.setVelocity(0);
            break;
        case KEYCODE_S:
            player.setVelocity(0);
            break;
        case KEYCODE_UP:
            cpu.setVelocity(0);
            break;
        case KEYCODE_DOWN:
            cpu.setVelocity(0);
            break;
    }
}

function resetGame() {
    playerScore = 0;
    cpuScore = 0;
    ball.reset();

    windowInterval = window.setInterval(gameLoop, 1000/15, false);
}

function detectCollisions() {
    //Between ball and player
    if(ball.x <= player.x + paddleWidth 
        && (ball.y + ballHeight >= player.y && ball.y <= player.y + player.height) ){
            ball.setVelocity(ballDx, player.getVelocity());
    }

    //Between ball and CPU
    if(ball.x + ballWidth >= cpu.x && (ball.y + ballHeight >= cpu.y && ball.y <= cpu.y + player.height)) {
        ball.setVelocity(-ballDx, cpu.getVelocity());
    }

    //Between ball and top and bottom border
    if(ball.y + ballHeight >= canvasHeight || ball.y <= 0) {
        ball.verticalRebound();        
    }

    //Between player and top and bottom border
    if(player.y + paddleHeight >= canvasHeight) {
        player.setPosition(canvasHeight - paddleHeight);
    }
    if(player.y <= 0) {
        player.setPosition(0);
    }

    //Between CPU and top and bottom border
    if(cpu.y + paddleHeight >= canvasHeight) {
        cpu.setPosition(canvasHeight - paddleHeight);
    }
    if(cpu.y <= 0) {
        cpu.setPosition(0);
    }

}



init();
gameLoop();