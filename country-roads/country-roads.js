let canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');
let canvasWidth = 500;
let canvasHeight = 500;

let FPS = 5;
let windowInterval = null;

let horizonHeight = 300;

//Draw objects
let sun = null;
let mountains = null;
let road = null;
let fields = null;
let grass = null;

function Sun() {
    //Color gradiant 
    this.bottomColor = "#F75B82";
    this.topColor = "#ff672b";
    this.x0 = 0;
    this.y0 = 0;
    this.x1 = 0;
    this.y1 = canvasHeight * .75;

    this.minX = -40;
    this.maxX = 0;
    this.minY = -40;
    this.maxY = canvasHeight + 40;
    
    
    
    this.draw = function() {
        this.gradiant = ctx.createLinearGradient(this.x0,this.y0,this.x1,this.y1);
        this.gradiant.addColorStop(0, this.topColor);
        this.gradiant.addColorStop(1, this.bottomColor);

        ctx.fillStyle = this.gradiant;
        ctx.fillRect(0,0,canvasWidth, canvasHeight);

        //Draw horizon
        ctx.beginPath();
        ctx.moveTo(0, horizonHeight);
        ctx.lineTo(canvasWidth, horizonHeight);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#000";
        ctx.stroke();
    }

    this.update = function() {
        //Slightly the starting locations of the gradiants
        this.x0 = generateRandomBetween(this.minX, this.maxX);
        this.x1 = generateRandomBetween(this.minX, this.maxX);
        this.y0 = generateRandomBetween(this.minY, 20);
        this.y1 = generateRandomBetween(canvasHeight - 20, this.maxY);

    }
}

function Road() {
    this.leftStartPoint = [0, canvasHeight];
    this.rightStartPoint = [canvasWidth, canvasHeight];
    this.vanishingPoint = [canvasWidth/2, horizonHeight];
    this.x0 = 0;
    this.y0 = horizonHeight;
    this.x1 = 0;
    this.y1 = canvasHeight;
    this.bottomColor = "#756d6a";
    
    this.spaceBetweenBreaks = 125;

    this.lineBreakStartX0 = canvasWidth/2 - 5;
    this.lineBreakStartY0 = horizonHeight + 5;

    this.lineBreakStartX1 = canvasWidth/2 - 5;
    this.lineBreakStartY1 = this.lineBreakStartY0 + this.spaceBetweenBreaks;

    this.lineBreakHeight = 50;

    this.draw = function() {
        this.gradiant = ctx.createLinearGradient(this.x0, this.y0, this.x1, this.y1);
        this.gradiant.addColorStop(0, 'black');
        this.gradiant.addColorStop(1, this.bottomColor);

        ctx.strokeStyle = "#000";
        ctx.fillStyle = this.gradiant;

        //Draw road
        ctx.beginPath();
        ctx.moveTo(this.leftStartPoint[0], this.leftStartPoint[1]);
        ctx.lineTo(this.vanishingPoint[0], this.vanishingPoint[1]);
        ctx.lineTo(this.rightStartPoint[0], this.rightStartPoint[1]);
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.stroke();

        //Draw line
        ctx.beginPath();
        ctx.moveTo(canvasWidth/2 - 5, canvasHeight);
        ctx.lineTo(canvasWidth/2, horizonHeight +20);
        ctx.lineTo(canvasWidth/2 + 5, canvasHeight);
        ctx.fillStyle = "#FFF";
        ctx.fill();
        ctx.strokeStyle = "#FFF";
        ctx.lineWidth = .01;
        ctx.stroke();

        //Draw line breaks
        ctx.beginPath();
        ctx.moveTo(this.lineBreakStartX0, this.lineBreakStartY0);
        ctx.lineTo(this.lineBreakStartX0 + 10, this.lineBreakStartY0);
        ctx.lineTo(this.lineBreakStartX0 + 10, this.lineBreakStartY0 + this.lineBreakHeight);
        ctx.lineTo(this.lineBreakStartX0, this.lineBreakStartY0 + this.lineBreakHeight);
        ctx.fillStyle = this.gradiant;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(this.lineBreakStartX1, this.lineBreakStartY1);
        ctx.lineTo(this.lineBreakStartX1 + 10, this.lineBreakStartY1);
        ctx.lineTo(this.lineBreakStartX1 + 10, this.lineBreakStartY1 + this.lineBreakHeight);
        ctx.lineTo(this.lineBreakStartX1, this.lineBreakStartY1 + this.lineBreakHeight);
        ctx.fillStyle = this.gradiant;
        ctx.fill();
    }

    this.update = function() {
        this.x0 = generateRandomBetween(-5, 0);
        this.x1 = generateRandomBetween(-5, 0);
        this.y0 = generateRandomBetween(horizonHeight - 10, horizonHeight);
        this.y1 = generateRandomBetween(canvasHeight, canvasHeight + 10);

        if(this.lineBreakStartY0 >= canvasHeight) {
            this.lineBreakStartY0 = horizonHeight + 5;
        } else {
            this.lineBreakStartY0 +=30;
        }

        if(this.lineBreakStartY1 >= canvasHeight) {
            this.lineBreakStartY1 = horizonHeight + 5;
        } else {
            this.lineBreakStartY1 +=30;
        }

        
    }
}

function Fields() {
    this.topColor = "#938c51";
    this.bottomColor2 = "#f9ed8b";
    this.bottomColor1 = "#e0d682";
    this.bottomColor0 = "#eade79";

    this.x0 = 0;
    this.y0 = canvasHeight/2 - 150;
    this.x1 = 0;
    this.y1 = canvasHeight + 100;
    this.xOffset = 0;
    this.yOffset = 0;

    
    this.draw = function() {
        //Determine gradiants
        this.gradiant = ctx.createLinearGradient(this.x0, this.y0, this.x1, this.y1);
        this.gradiant.addColorStop(0, this.topColor);
        this.gradiant.addColorStop(1, this.bottomColor0);

        //Draw bottom section of fields
        ctx.beginPath();
        ctx.moveTo(0, horizonHeight);
        ctx.lineTo(canvasWidth/2, horizonHeight);
        ctx.lineTo(0, canvasHeight);
        ctx.fillStyle = this.gradiant;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(canvasWidth, horizonHeight);
        ctx.lineTo(canvasWidth/2, horizonHeight);
        ctx.lineTo(canvasWidth, canvasHeight);
        ctx.fillStyle = this.gradiant;
        ctx.fill();

        //Draw middle section of fields
        this.gradiant = ctx.createLinearGradient(this.x0, this.y0, this.x1, this.y1);
        this.gradiant.addColorStop(0, this.topColor);
        this.gradiant.addColorStop(1, this.bottomColor1);

        ctx.beginPath();
        ctx.moveTo(0, canvasHeight - 100 + this.yOffset);
        ctx.lineTo(canvasWidth/2, horizonHeight);
        ctx.lineTo(0, horizonHeight);
        ctx.fillStyle = this.gradiant;
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(canvasWidth, canvasHeight - 100 + this.yOffset);
        ctx.lineTo(canvasWidth/2, horizonHeight);
        ctx.lineTo(canvasWidth, horizonHeight);
        ctx.fillStyle = this.gradiant;
        ctx.fill();
        
        //Draw top section of fields
        this.gradiant = ctx.createLinearGradient(this.x0, this.y0, this.x1, this.y1);
        this.gradiant.addColorStop(0, this.topColor);
        this.gradiant.addColorStop(1, this.bottomColor2);

        ctx.beginPath();
        ctx.moveTo(0, canvasHeight - 110 + this.yOffset);
        ctx.lineTo(canvasWidth/2 - 30 - this.xOffset, horizonHeight + 4);
        ctx.lineTo(0, horizonHeight+4);
        ctx.fillStyle = this.gradiant;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(canvasWidth, canvasHeight - 110 + this.yOffset);
        ctx.lineTo(canvasWidth/2 + 30 + this.xOffset, horizonHeight + 4);
        ctx.lineTo(canvasWidth, horizonHeight+4);
        ctx.fillStyle = this.gradiant;
        ctx.fill();
        
    }

    this.update = function() {
        //Slightly alter gradiant
        this.x0 = generateRandomBetween(-5, 0);
        this.y0 = generateRandomBetween(canvasHeight/2 - 150, canvasHeight/2 - 120);
        this.x1 = generateRandomBetween(-5, 0);
        this.y1 = generateRandomBetween(canvasHeight + 80, canvasHeight + 110);
        this.xOffset = generateRandomBetween(0, 10);
        this.yOffset = generateRandomBetween(0,10);
    }
}

function Mountains () {
    this.bottomColor = "green";
    this.topColor = "black";
    this.x0 = 0;
    this.y0 = 0;
    this.x1 = 0;
    this.y1 = horizonHeight + 60;
    this.xOffset = 0;
    this.yOffset = 0;
    

    this.leftMountainPoints =[
        [0, 50],
        [40, 80],
        [50, 100],
        [70, 110],
        [80, 123],
        [95, 129],
        [102, 140],
        [117, 158],
        [129, 177],
        [142, 184],
        [160,203],
        [172, 219],
        [183, 233],
        [194, 236],
        [200, 249],
        [213, 250],
        [220, 271],
        [234, 283],        
        [canvasWidth/2, horizonHeight],
        [0, horizonHeight]
    ]
    
    this.rightMountainPoints = [
        [canvasWidth, horizonHeight],
        [canvasWidth/2, horizonHeight],
        [258, 286],
        [269, 270],
        [277, 266],
        [285, 255],
        [289, 250],
        [299, 244],
        [308, 240],
        [319, 227],
        [325, 220],
        [338, 211],
        [346, 208],
        [355, 200],
        [368, 183],
        [384, 170],
        [392, 159],
        [400, 150],
        [410, 147],
        [418, 140],
        [427, 128],
        [440, 111],
        [452, 109],
        [461, 98],
        [470, 84],
        [475, 77],
        [480, 73],
        [486, 65],
        [490, 62],
        [493, 58],
        [496, 55],
        [canvasWidth, 50]
    ]
    
    this.draw = function() {
        //Create gradiant
        this.gradiant = ctx.createLinearGradient(this.x0, this.y0, this.x1, this.y1);
        this.gradiant.addColorStop(0, this.topColor);
        this.gradiant.addColorStop(1, this.bottomColor);

        //Left mountain
        ctx.beginPath();
        for(let i = 0; i < this.leftMountainPoints.length; i++) {
            if(i===0) {
                ctx.moveTo(this.leftMountainPoints[i][0], this.leftMountainPoints[i][1]);
            } else {
                if(i<this.leftMountainPoints.length-1) {
                    ctx.lineTo(this.leftMountainPoints[i][0] + this.xOffset, this.leftMountainPoints[i][1] + this.yOffset);
                } else {
                    ctx.lineTo(this.leftMountainPoints[i][0], this.leftMountainPoints[i][1]);
                }
            }
        }

        ctx.fillStyle = this.gradiant; 
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.stroke();

        //Right Mountain
        ctx.beginPath();
        for(let i = 0; i < this.rightMountainPoints.length; i++) {
            if(i===0) {
                ctx.moveTo(this.rightMountainPoints[i][0], this.rightMountainPoints[i][1]);
            } else {
                if(i===2) {
                    ctx.lineTo(this.rightMountainPoints[i][0], this.rightMountainPoints[i][1]);
                } else {
                    ctx.lineTo(this.rightMountainPoints[i][0] + this.xOffset, this.rightMountainPoints[i][1] + this.yOffset);
                }
            }
        }

        ctx.fillStyle = this.gradiant; 
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.stroke();
        
    }
    
    this.update = function() {
        //Slightly alter gradiant 
        this.x0 = generateRandomBetween(-3, 0);
        this.x1 = generateRandomBetween(-3, 0);
        this.y0 = generateRandomBetween(-3, 0);
        this.y1 = generateRandomBetween(horizonHeight + 50, horizonHeight + 60);
        this.xOffset = generateRandomBetween(0, 9);
        this.yOffset = generateRandomBetween(0, 9);
    }
}

function generateRandomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function init() {
    //Size canvas
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    //Init Sun
    sun = new Sun();
    //Init mountain mama
    mountains = new Mountains();
    //Init Road
    road = new Road();
    //Init Fields
    fields = new Fields();

    //Start draw loop
    windowInterval = window.setInterval(drawLoop, 1000/FPS, false);
}

function drawLoop() {
    //Clear canvas
    ctx.clearRect(0,0, canvasWidth, canvasHeight);

    //Draw
    sun.draw();
    mountains.draw();
    road.draw();
    fields.draw();

    //Update
    sun.update();
    mountains.update();
    fields.update();
    road.update();
}

init();