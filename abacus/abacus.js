let canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');
let canvasWidth = 800;
let canvasHeight = 450;

let FPS = 10;
let windowInterval = null;

//Listener for moving beads
addEventListener('mousedown', mouseDown, false);
let beadAudio = new Audio('./bead.wav');
let beadResetAudio = new Audio('./bead-reset.wav');

//Objects
let abacus = null;
let readout = null;
let resetButton = null;

/** ABACUS OBJECT */
function Abacus() {

    //Variables to construct abacus frame
    this.frameWidth = 10;
    this.margin = 50;
    this.crossBarY = 125;
    this.bottomY = 300;
    this.numVerticalRods = 11;
    this.unitRodNum = Math.ceil(this.numVerticalRods/2);
    this.vertBarWidth = 3;
    this.abacusLength = canvasWidth - (2 * this.margin);
    this.spaceBetweenVertRods = this.abacusLength / (this.numVerticalRods + 1);
    this.markerRadius = 4;

    //Bead Variables
    this.beads = [];
    this.beadRadius = 15;
    this.spaceToCrossbarTop = (this.crossBarY - this.frameWidth/2) - (this.margin + this.frameWidth/2+(2*this.beadRadius));
    this.spaceToCrossbarBottom = (this.bottomY - this.frameWidth/2 - (4*(2*this.beadRadius))) - (this.crossBarY+this.frameWidth/2);


    this.value = 0;

    let position = 1;

    this.generateBeads = function(){
        let totalBeads = this.numVerticalRods * 5;
        for(let i=1; i <= totalBeads; i++) {
            let rodNum = Math.ceil(i/5);
            let xCoord = this.margin + this.spaceBetweenVertRods*rodNum;
            //If i divisible by 5, we will place five bead instead
            if(i%5 === 0) {
                let newBead = new Bead(xCoord, this.margin + this.frameWidth/2+ this.beadRadius, this.beadRadius, 5, true, 'red', rodNum);
                this.beads.push(newBead);
            } else {
                let position =  (i%5);
                let newBead = new Bead(xCoord, this.bottomY - this.frameWidth/2 - (this.beadRadius) * (2*position-1), this.beadRadius,
                    position, false, 'blue', rodNum);
                this.beads.push(newBead);
            }
        }
        
    }


    this.draw = function() {
        //Draw border of abacus
        ctx.beginPath();
        ctx.moveTo(this.margin, this.margin);
        ctx.lineTo(canvasWidth - this.margin, this.margin);
        ctx.lineTo(canvasWidth - this.margin, this.bottomY);
        ctx.lineTo(this.margin, this.bottomY);
        ctx.lineTo(this.margin, this.margin);
        ctx.lineWidth = this.frameWidth;
        ctx.strokeStyle = "brown";
        ctx.stroke();

        //Draw Vertical Rods
        for(let i=1; i<=this.numVerticalRods; i++) {
            let xCoord = this.margin + this.spaceBetweenVertRods * i;
            ctx.beginPath();
            ctx.moveTo(xCoord, this.bottomY);
            ctx.lineTo(xCoord, this.margin);
            ctx.lineWidth = this.vertBarWidth;
            ctx.stroke();
        }

        //Draw crossbar
        ctx.beginPath();
        ctx.moveTo(this.margin, this.crossBarY);
        ctx.lineTo(canvasWidth-this.margin, this.crossBarY);
        ctx.lineWidth = this.frameWidth;
        ctx.stroke();

        //Draw circles on crossbar to mark unit rod, etc.
        ctx.beginPath();
        ctx.arc(this.margin + this.unitRodNum*this.spaceBetweenVertRods, this.crossBarY, this.markerRadius, 0, Math.PI * 2, false);
        ctx.fillStyle = "yellow";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.margin + 2 *this.spaceBetweenVertRods, this.crossBarY, this.markerRadius, 0, Math.PI * 2, false);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.margin + 10 *this.spaceBetweenVertRods, this.crossBarY, this.markerRadius, 0, Math.PI * 2, false);
        ctx.fill();


        //Draw bead
        this.beads.forEach((bead) => {
            bead.draw();            
        });
    }

    this.update = function() {
        //Update any clicked beads
        this.beads.forEach((bead) => {
            if(bead.clicked) {
                //If not already being counted, move toward crossbar
                if(!bead.counted) {
                    //If five bead move down, otherwise move up
                    if(bead.isFive) {
                        bead.setY(bead.getY() + this.spaceToCrossbarTop);
                        bead.counted = true;
                    } else {
                        //Move all beads above and including clicked bead up
                        this.beads.filter((x) => x.position >= bead.position && x.x === bead.x && !x.isFive && !x.counted)
                            .forEach((y) => {
                                y.setY(y.getY() - this.spaceToCrossbarBottom);
                                y.counted = true;
                            })
                    }
                } else {
                    //If bead is five bead, move back to top
                    if(bead.isFive) {
                        bead.setY(bead.getY() - this.spaceToCrossbarTop);
                        bead.counted = false;
                    } else {
                        //If bead has been counted, move it and all lower beads down
                        this.beads.filter((x) => x.position <= bead.position && x.x === bead.x && x.counted)
                            .forEach((y) => {
                                y.setY(y.getY() + this.spaceToCrossbarBottom);
                                y.counted = false;
                            })
                    }
                }
                bead.clicked = false;
            }
        })

        //Calculate value of abacus
        this.calculateAbacusValue();


    }

    this.calculateAbacusValue = function() {
        //This has to be calced as a string because floating point nums suck ass
        this.value = "";
        //Iterate through all beads, and append value from each rod to string
        for(let rodNum=0; rodNum<this.numVerticalRods; rodNum++) {
            //If this is first rod after unit rod, add a decimal point
            if(rodNum === this.unitRodNum) {
                this.value += ".";
            }
            //Iterate through all five beads of rod and add their value to
            let rodValue = 0;
            for(let i=0; i<5; i++) {
                let index = rodNum*5 + i;
                if(this.beads[index].counted){
                    if(this.beads[index].isFive) {
                        rodValue += 5;
                    } else {
                        rodValue += 1;
                    }
                }
            }
            //Add rod value to value string
            this.value += rodValue.toString();
        }
    }

    this.reset = function() {
        //Iterate through all beads and un-count them
        this.beads.forEach((bead) => {
            if(bead.counted) {
                if(bead.isFive) {
                    bead.setY(bead.getY() - this.spaceToCrossbarTop);
                } else {
                    bead.setY(bead.getY() + this.spaceToCrossbarBottom);
                }
                bead.counted = false;
            }
        })
    }

    this.getBeads = function() {
        return this.beads;
    }

    this.setBeads = function(beads) {
        this.beads = beads;
    }

    this.getValue = function() {
        return this.value;
    }
    
}

/** BEAD OBJECT */
function Bead(x, y, radius, position, isFive, color, rodNum){
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.position = position;
    this.isFive = isFive;
    this.color = color;
    this.rodNum = rodNum;

    this.clicked = false;
    this.counted = false;

    this.draw = function() {
        //Draw circle at x,y
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    this.getY = function() {
        return this.y;
    }

    this.setY = function(y) {
        this.y = y;
    }
}

/** READOUT OBJECT */

function Readout() {
    this.fontSize = 30;
    this.text = "";
    this.margin = 10;
    this.boxWidth = this.fontSize * this.text.length + 2*this.margin; 
    this.boxHeight = this.fontSize + 2*this.margin;
    this.x = 0;
    this.y = 325;

    this.draw = function() {
        //Draw box centered below abacus
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.boxWidth, this.y);
        ctx.lineTo(this.x + this.boxWidth, this.y + this.boxHeight);
        ctx.lineTo(this.x, this.y + this.boxHeight);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.stroke();

        //Draw text
        ctx.beginPath();
        ctx.font = this.fontSize + "px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText(this.text, this.x + this.boxWidth/2 , this.y + this.boxHeight/2 + this.margin);
        ctx.fill();
    }

    this.update = function() {
        //Update text, coords, and boxwidth
        this.text = abacus.value;

        this.boxWidth = this.fontSize * this.text.length + 2*this.margin;
        this.x = canvasWidth / 2 - (this.boxWidth/2)
    }
    
}

/** RESET BUTTON */
function ResetButton() {
    this.width = 200;
    this.height = 50;
    this.x = canvasWidth/2 - this.width/2;
    this.y = 390;
    this.clicked = false;
    this.fillStyle = 'lightgreen';

    this.draw = function() {
        //Draw a green box
        ctx.beginPath();
        ctx.fillStyle = this.fillStyle;
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        //Write reset on box
        ctx.beginPath();
        ctx.textAlign = 'center';
        ctx.fillStyle = "#FFF";
        ctx.fillText('Reset', this.x + this.width/2, this.y + this.height/2 + 10);
        ctx.stroke();
    }

    this.update = function() {
        if(this.clicked) {
            this.fillStyle = 'green';
            beadResetAudio.play();
            this.clicked = false;
        } else {
            this.fillStyle = 'lightgreen';
        }
    }
}

/** EVENT LISTENER FOR MOUSE */
function mouseDown(e) {
    //Check to see if mouse pointer hovering over any beads
    let mouseX = e.clientX;
    let mouseY = e.clientY;

    abacus.getBeads().forEach((bead) => {
        //Calculate bead x and y screen coords
        let beadX = bead.x + canvas.getBoundingClientRect().left;
        let beadY = bead.y + canvas.getBoundingClientRect().top;
        //See if mouse within bounds of bead
        let xDiff = mouseX - beadX;
        let yDiff = mouseY - beadY;
        let resultant = Math.sqrt((xDiff*xDiff) + (yDiff*yDiff));
        if(resultant <= bead.radius) {
            bead.clicked = true;
            beadAudio.play();

        }
    })

    //See if clicked on reset button
    let resetX = resetButton.x + canvas.getBoundingClientRect().left;
    let resetY = resetButton.y + canvas.getBoundingClientRect().top;
    if((mouseX >= resetX && mouseX <= resetX + resetButton.width) && (mouseY >= resetY && mouseY <= resetY + resetButton.height)) {
        //Clicked button
        resetButton.clicked = true;
        abacus.reset();
    }

}

function gameLoop() {
    //Clear screen
    ctx.clearRect(0,0, canvasWidth, canvasHeight);
    //Draw
    abacus.draw();
    readout.draw();
    resetButton.draw();
    //Update 
    abacus.update();
    readout.update();
    resetButton.update();

}

function init() {
    //Size canvas
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    //Init abacus
    abacus = new Abacus();
    abacus.generateBeads();
    //Init readout
    readout = new Readout();
    //Init reset button
    resetButton = new ResetButton();

    //Start game loop
    windowInterval = window.setInterval(gameLoop, 1000/FPS, false);
}

init();