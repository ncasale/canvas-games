let canvas = document.querySelector('canvas');
let ctx = canvas.getContext("2d");

let canvasWidth = 500;
let canvasHeight = 500;

let windowInterval = null;
let FPS = 30;

let bloomAngle = Math.PI / 36; //5 Degrees
let minBloomAngle = Math.PI / 36 //5 Degrees
let dBloomAngleOnFire = 3/FPS;
let dBloomAngleOnCoolDown = .75/FPS;
let shotFired = false;
let framesSinceShot = 0;
let maxBloomAreaRadius = Math.min(canvasWidth/2, canvasHeight/2);
let bloomAreaAtMax = false;

//Target variables
let minTargetDistance = 10;
let maxTargetDistance = 2000;
let targetWidth = 100;
let targetHeight = 100;
let distanceToTarget = 100; //Distance to target in pixels
let dDistanceToTarget = 150/FPS;


//Event listener to increase distance and bloom angle
addEventListener('keydown', keyDown, false);
addEventListener('keyup', keyUp, false);


let KEYCODE_DISTANCE_INC = 38;
let KEYCODE_DISTANCE_DEC = 40;
let key_distance_inc = false;
let key_distance_dec = false; 


//Event listener to track mouse movement
document.addEventListener('mousemove', onMouseMove, false);

//Event listener to fire projectile
addEventListener('mousedown', fireProjectile, false);

//Instances
let bloomArea = null;
let projectiles = [];

function init() {
    //Set canvas size
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    //Instantiate bloom area
    bloomArea =  new BloomArea(canvasWidth/2, canvasHeight/2, 0);
    //Instantiate target
    target = new Target(canvasWidth/2 - targetWidth/2, canvasHeight/2 - targetHeight/2, targetWidth, targetHeight);
    //Start game loop
    windowInterval = window.setInterval(gameLoop, 1000/FPS, false);
}

function BloomArea(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;

    this.draw = function() {
        //Draw a circle at x,y with radius radius
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.strokeStyle = "purple";
        ctx.stroke();
    }

    this.update = function() {
        //Decrease bloom angle if necessary
        if(bloomAngle > minBloomAngle && framesSinceShot > FPS/2) {
            bloomAngle -= dBloomAngleOnCoolDown;
            if(bloomAngle <= minBloomAngle) {
                shotFired = false;
                framesSinceShot = 0;
                bloomAngle = minBloomAngle;
            }
        }
        //Calculate radius based on bloom angle
        this.calculateRadius();
    }

    this.calculateRadius = function() {
        //Calculate radius based on bloom angle/distanceToTarget
        var radius = Math.tan(bloomAngle) * distanceToTarget;

        //Account for bug where if angle gets too large, radius will become very negative
        if(radius < 0) {
            radius = maxBloomAreaRadius;
        }

        //Restrict radius to maximum size if necessary
        if(radius < maxBloomAreaRadius) {
            bloomAreaAtMax = false;
            this.radius = radius;
        } else {
            bloomAreaAtMax = true;
            this.radius = maxBloomAreaRadius;
        }
    }

    //Getters and Setters for BloomArea
    this.getRadius = function() {
        return this.radius;
    }
    this.getX = function() {
        return this.x;
    }
    this.getY = function() {
        return this.y;
    }
    this.setPosition = function(x, y) {
        this.x = x;
        this.y = y;
    }
}

//Projectile object
function Projectile(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 0;

    this.maxRadius = bloomArea.getRadius() / 10;
    this.scaleSpeed = 1.5;
    this.radiusScaleRate = this.maxRadius/FPS * this.scaleSpeed;

    this.destroy = false;
    
    this.draw = function() {
        //Determine if projectile hit the target
        if(this.x >= target.x && this.x <= target.x + targetWidth 
            && this.y >= target.y && this.y <= target.y + targetHeight) {
            //Hit
            ctx.strokeStyle = "green";
        } else {
            ctx.strokeStyle = "red";
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.stroke();
    }

    this.update = function() {
        //Smoothly interpolate up to max radius
        if(this.radius + this.radiusScaleRate <= this.maxRadius) {
            this.radius += this.radiusScaleRate;
        } else {
            this.destroyProjectile();
        }
    }

    //Setters
    this.destroyProjectile = function() {
        this.destroy = true;
    }

}

//Target object
function Target(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.draw = function() {
        //Draw black rectangle to represent target
        ctx.fillStyle = "#555";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

}

//Key down event listener callback
function keyDown (e) {
    /*switch(e.keyCode) {
        case KEYCODE_DISTANCE_INC:
            key_distance_inc = true;
            break;
        case KEYCODE_DISTANCE_DEC:
            key_distance_dec = true;
            break;        
    } */
}

//Key up event listener callback
function keyUp (e) {
    /* switch(e.keyCode) {
        case KEYCODE_DISTANCE_INC:
            key_distance_inc = false;
            break;
        case KEYCODE_DISTANCE_DEC:
            key_distance_dec = false;
            break; 
    } */
}


//Handle mouse move events
function onMouseMove(e) {
    //Get dimensions of canvas bounding box
    let boundingRect = canvas.getBoundingClientRect();
    let canvasRectLeft = boundingRect.left;
    let canvasRectTop = boundingRect.top;
    let canvasRectRight = boundingRect.right;
    let canvasRectBottom = boundingRect.bottom;

    //Adjust X and Y to account for canvas size/resizing
    let bloomX = (e.clientX - canvasRectLeft) / (canvasRectRight - canvasRectLeft) * canvasWidth;
    let bloomY = (e.clientY - canvasRectTop) / (canvasRectBottom - canvasRectTop) * canvasHeight;

    //Account for BloomArea collisions with canvas edges
    let radius = bloomArea.getRadius();
    if(bloomX + radius >= canvasWidth) {
        bloomX = canvasWidth - radius;
    }
    if(bloomX - radius <= 0) {
        bloomX = radius;
    }   
    if(bloomY + radius >= canvasHeight) {
        bloomY = canvasHeight - radius;
    }
    if(bloomY - radius <= 0) {
        bloomY = radius;
    }

    //Set position
    bloomArea.setPosition(bloomX, bloomY);


}

function fireProjectile() {
    //Increase the bloom angle up to a max of 90 degrees
    if(bloomAngle < Math.PI / 2) {
        bloomAngle += dBloomAngleOnFire;
    } else {
        bloomAngle = Math.PI / 2;
    }
    shotFired = true;
    framesSinceShot = 0;

    //Spawn a projectile somewhere in radius
    let projAngle = Math.random() * Math.PI * 2;
    let projRadius = Math.random() * bloomArea.getRadius();

    let projX = bloomArea.getX() + Math.cos(projAngle) * projRadius;
    let projY = bloomArea.getY() + Math.sin(projAngle) * projRadius;
    projectiles.push(new Projectile(projX, projY));

}

//Update the distance to target with arrow keys
 function updateDistanceToTarget() {
    if(key_distance_inc && !bloomAreaAtMax) {
        distanceToTarget += dDistanceToTarget;
        projectiles = [];
    }
    if(key_distance_dec && (distanceToTarget - dDistanceToTarget >= 0)) {
        distanceToTarget -= dDistanceToTarget;
        projectiles = [];
    }
} 

//Write bloom angle and distance to screen
function drawText() {
    //Display angle 
    ctx.font = "12px Georgia";
    ctx.fillStyle = "red";
    var bloomAngleInDegrees = (bloomAngle / (Math.PI/180)).toFixed(2);
    ctx.fillText("Bloom Angle: " + bloomAngleInDegrees, 12, 20);

    //Display distance to target
    //ctx.fillText("Target Distance: " + distanceToTarget, 12, 35);
}

function drawProjectiles() {
    projectiles.forEach((proj) => {
        proj.draw();
    })
}

function updateProjectiles() {
    projectiles.forEach((proj) => {
        proj.update();
    });
    //Remove any projectiles that need destruction
    projectiles = projectiles.filter((x) => !x.destroy);

}

//Main loop
function gameLoop() {
    //Clear loop
    ctx.clearRect(0,0,canvasWidth, canvasHeight);
    //Calculate frames since last shot
    if(shotFired) {
        framesSinceShot += 1;
    }
    //Update
    bloomArea.update();
    updateProjectiles();
    updateDistanceToTarget();
    //Draw
    target.draw();
    bloomArea.draw();
    drawProjectiles();
    drawText();
}


init();