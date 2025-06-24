// TODO: to much is hard coded


let canvasWidth;
let canvasHeight;

let columns = [[], [], [], []];
let columnsAnimationOffset = [0,0,0,0]; //between -1 and 0
let falingRowAniOffset = [0,0,0,0];
const ANIMATION_VEL = 7; //unit of columnsAnimationOffset per secound

let nextFalingRow = [0,0,0,0];
let falingRow = [0,0,0,0];
let falingRowPos = 1; //between 0 and 1
let falingRowVel = 0.1; // per secound
let velDouble = false;
let factorDoubleMode = 5; //if the player touchs, speed will be multiply by this

let score = 0;
let level = 0; // 1 level = roundsPerLevel rounds
let round = 0; // 1 round = falingRow falls one time
const falingRowStartAcc = 0.02; //per level
const roundsPerLevel = 10;
const falingRowAcc = 0.01; //per round

let afterGameoverTimer = 0; //in ms

let gameover = false;
let gamestart = true;

const stoneColors = [
    [0,0,0,0],
    [200, 0, 0],
    [200, 200, 0],
    [0, 200, 0],
    [0, 64, 200],
    [200, 0, 200],
];
const NUM_STONE_COLORS = 5;

function darker(color) {
    if(justZero(color)) {
        return color;
    }
    return [color[0] * 0.5, color[1] * 0.5, color[2] * 0.5];
}

function justZero(array) {
    for(let i = 0; i < array.length; i++) {
        if(array[i] != 0) return false;
    }
    return true;
}
//return the index of the largest element
function minRetI(array) {
    let minI = 0;
    for(let i = 0; i < array.length; i++) {
        if(array[i] < array[minI]) {
            minI = i;
        }
    }
    return minI;
}



function setup() {
    if(windowWidth / windowHeight > 9 / 16) {
        canvasWidth = 9 * windowHeight / 16 ;
        canvasHeight = windowHeight;
    }
    else {
        canvasWidth = windowWidth;
        canvasHeight = 16 * windowWidth / 9 ;
    }

    can = createCanvas(canvasWidth, canvasHeight);
    can.parent("main");
}

function windowResized() {
    if(windowWidth / windowHeight > 9 / 16) {
        canvasWidth = 9 * windowHeight / 16 ;
        canvasHeight = windowHeight;
    }
    else {
        canvasWidth = windowWidth;
        canvasHeight = 16 * windowWidth / 9 ;
    }
    resizeCanvas(canvasWidth, canvasHeight);
}

function keyPressed() {
    if(keyCode === ENTER) {
        if(gameover) {
            gameover = false;
            reset();
        }
        if (gamestart) {
            gamestart = false;
        }
    }

    //Keyboard buttons
    if(keyCode === LEFT_ARROW) {
        switchButtonPressed(0);
    }
    if(keyCode == UP_ARROW || keyCode == DOWN_ARROW) {
        switchButtonPressed(1);
    }
    if(keyCode === RIGHT_ARROW) {
        switchButtonPressed(2);
    }

}



function reset() {
    falingRow = [0,0,0,0];
    nextFalingRow = [0,0,0,0];
    falingRowPos = 1;
    for(let i = 0; i < 4; i++) {
        columns[i].splice(0);
    }

    score = 0;
    level = 0;
    round = 0;
}

function switchButtonPressed(b) {
    //button b is pressed
    //switch columns
    let temp = columns[b].slice();
    columns[b] = columns[b + 1].slice();
    columns[b + 1] = temp.slice();

    columnsAnimationOffset[b] = 1;
    columnsAnimationOffset[b + 1] = -1;


    let frAbsolutePos = falingRowPos * (canvasHeight*7/8 - canvasWidth*1/8); //fr = falingRow (falingRowPos is between 0 and 1)
    let col0AbsolutePos = canvasHeight*7/8 - canvasWidth*1/8 * (columns[b].length + 1);  //+ one block size
    let col1AbsolutePos = canvasHeight*7/8 - canvasWidth*1/8 * (columns[b + 1].length + 1);  //+ one block size

    //if it a faling block collide with the switching stack
    if(frAbsolutePos >= col0AbsolutePos) {
        falingRow[b + 1] = falingRow[b];
        falingRow[b] = 0; //the faling block of the col, which is high, have to be zero

        falingRowAniOffset[b + 1] = -1;
    }
    if(frAbsolutePos >= col1AbsolutePos) {
        falingRow[b] = falingRow[b + 1];
        falingRow[b + 1] = 0; //the faling block of the col, which is high, have to be zero

        falingRowAniOffset[b] = 1;
    }
}



function mouseClicked() {
    //if the mouse on the switch button area
    if(mouseY > canvasHeight * 7/8 && mouseX > canvasWidth * 1/8 && mouseX < canvasWidth * 7/8) {
        //circle(canvasWidth * 1/4, canvasHeight * 7.5/8, canvasWidth * 1/8);
        let relmx = mouseX / canvasWidth;
        let relmy = mouseY / canvasHeight;

        let dySqr = (7.5/8 - relmy) * (7.5/8 - relmy);
        
        let dx1 = 1/4 - relmx;
        let dx2 = 2/4 - relmx;
        let dx3 = 3/4 - relmx;

        let diff1Sqr = dx1 * dx1 + dySqr;
        let diff2Sqr = dx2 * dx2 + dySqr;
        let diff3Sqr = dx3 * dx3 + dySqr;

        let button = minRetI([diff1Sqr, diff2Sqr, diff3Sqr]);
        //b is 0, 1 or 2. So, b + 1 (max. 3) is still valid
        if([diff1Sqr, diff2Sqr, diff3Sqr][button] < canvasWidth * 1/8) {
            switchButtonPressed(button);
        }
    }

}
function mousePressed() {
    if(mouseY < canvasHeight * 7/8 || mouseX < canvasWidth * 1/8 || mouseX > canvasWidth * 7/8) {
        falingRowVel *= factorDoubleMode;
        velDouble = true;
    }

    if(gameover && afterGameoverTimer < 0) {
        gameover = false;
        reset();
        return;
    }
    if(gamestart) {
        gamestart = false;
        return;
    }
}
function mouseReleased() {
    if(velDouble) {
        falingRowVel /= factorDoubleMode;
        velDouble = false;
    }
}

function draw() {
    //Update
    if(!gameover && !gamestart) {
        falingRowPos += falingRowVel * deltaTime / 1000.0; //(falingRowPos is between 0 and 1)

        //animation
        for(let i = 0; i < 4; i++) {
            if(columnsAnimationOffset[i] < 0) {
                columnsAnimationOffset[i] += deltaTime * ANIMATION_VEL / 1000.0
                if(columnsAnimationOffset[i] > 0) columnsAnimationOffset[i] = 0;
            };
            if(columnsAnimationOffset[i] > 0) {
                columnsAnimationOffset[i] -= deltaTime * ANIMATION_VEL / 1000.0;
                if(columnsAnimationOffset[i] < 0) columnsAnimationOffset[i] = 0;
            }

            if(falingRowAniOffset[i] < 0) {
                falingRowAniOffset[i] += deltaTime * ANIMATION_VEL / 1000.0
                if(falingRowAniOffset[i] > 0) falingRowAniOffset[i] = 0;
            };
            if(falingRowAniOffset[i] > 0) {
                falingRowAniOffset[i] -= deltaTime * ANIMATION_VEL / 1000.0;
                if(falingRowAniOffset[i] < 0) falingRowAniOffset[i] = 0;
            }
        };
    }

    //check if it collide with a columns
    let frAbsolutePos = falingRowPos * (canvasHeight*7/8 - canvasWidth*1.5/8) + canvasWidth*1/16; //fr = falingRow (falingRowPos is between 0 and 1)
    for(let i = 0; i < 4; i++) {
        let colAbsolutePos = canvasHeight*7/8 - canvasWidth*1/8 * (columns[i].length + 1);  //+ one block size
        
        //if it the faling block collide with the stack
        if(frAbsolutePos >= colAbsolutePos && falingRow[i] != 0) {
            columns[i].push(falingRow[i]);
            falingRow[i] = 0;

            //if two blocks with the same color are stacked on top of each other, delete them
            let l = columns[i].length;
            if(columns[i][l-1] == columns[i][l-2]) {
                columns[i].pop();
                columns[i].pop();
                //score
                score += 2;
            }
        }

        //is gameover
        if(colAbsolutePos < canvasWidth * 1/16 && !gameover) { //canvasWidth * 1/16 = score bar width
            gameover = true;
            afterGameoverTimer = 1000;
        }
    }

    //if the faling row is under one block size + score bar
    if(frAbsolutePos > canvasWidth*1.5/8 && justZero(nextFalingRow)) {
        //gen next faling row
        for(let i = 0; i < 4; i++) {
            nextFalingRow[i] = floor(random(NUM_STONE_COLORS)) + 1;
        }

        //delete one or two blocks
        nextFalingRow[floor(random(4))] = 0;
        if(random(2) < 1) nextFalingRow[floor(random(4))] = 0;
    }


    //if the faling row is empty, reset
    if(justZero(falingRow)) {
        falingRow = nextFalingRow.slice();
        falingRowPos = 0;
        frAbsolutePos = canvasWidth * 1/16; //score bar width
        nextFalingRow.fill(0, 0, 4);

        //next round
        round++;
        
        if(velDouble) falingRowVel /= factorDoubleMode; //diable double mode

        falingRowVel += falingRowAcc;
        if(round == roundsPerLevel) {
            round = 0;
            level++;
            score += 10;

            falingRowVel = 0.1 + level * falingRowStartAcc;
        }

        if(velDouble) falingRowVel *= factorDoubleMode; //enable double mode

    }





    //Draw
    background(10, 10, 15);

    // [next] faling row
    strokeWeight(canvasWidth / 150);
    for(let i = 0; i < 4; i++) {
        //next
        fill(stoneColors[nextFalingRow[i]]);
        stroke(darker(stoneColors[nextFalingRow[i]]));
        rect(
            canvasWidth * i/4 + canvasWidth * 1/16, //x pos
            canvasWidth * 1/16, //y pos (score bar)
            canvasWidth*1/8, canvasWidth*1/8 //size
        );

        //normal
        fill(stoneColors[falingRow[i]]);
        stroke(darker(stoneColors[falingRow[i]]));
        rect(
            canvasWidth * (i + falingRowAniOffset[i])/4 + canvasWidth * 1/16, //x pos
            frAbsolutePos, //y pos
            canvasWidth*1/8, canvasWidth*1/8 //size
        );
    }

    //columns
    for(let i = 0; i < 4; i++) {
        col = columns[i];
        for(let k = 0; k < col.length; k++) {
            fill(stoneColors[columns[i][k]]);
            stroke(darker(stoneColors[columns[i][k]]));
            rect(
                canvasWidth * (i + columnsAnimationOffset[i])/4 + canvasWidth * 1/16 , //x pos
                canvasHeight*7/8 - canvasWidth*1/8 * (k + 1), //y pos (stack the blocks)
                canvasWidth*1/8, canvasWidth*1/8//size
            );
        }
    }

    //speed areas
    noStroke();
    fill(0,0,0,128);
    rect(0, canvasHeight * 708/800, canvasWidth * 1/8, canvasHeight * 1/8) //left
    rect(canvasWidth * 7/8, canvasHeight * 708/800, canvasWidth * 1/8, canvasHeight * 1/8) //right
    
    //plates
    fill(200, 200, 190);
    for(let i = 0; i < 4; i++) {
        rect(
            canvasWidth * (i + columnsAnimationOffset[i]) / 4 + canvasWidth*0.25/8,  //x pos
            canvasHeight * 7/8,  //y pos
            canvasWidth*0.75/4, canvasHeight*1/100 //size
        );
    }

    //switch buttons
    fill(100, 100, 200);
    circle(canvasWidth * 1/4, canvasHeight * 7.5/8, canvasWidth * 1/8);
    circle(canvasWidth * 2/4, canvasHeight * 7.5/8, canvasWidth * 1/8);
    circle(canvasWidth * 3/4, canvasHeight * 7.5/8, canvasWidth * 1/8);

    //Score and level
    //score bar
    fill(0,0,0);
    rect(0,0, canvasWidth, canvasWidth * 1/16); 
    //score
    fill(200, 200, 190);
    textAlign(LEFT, TOP);
    textSize(canvasWidth * 1/16);
    text("Score: " + score, canvasWidth * 1/128,canvasWidth * 1/128);
    //level
    textAlign(RIGHT, TOP);
    text("Level: " + level, canvasWidth * 127/128,canvasWidth * 1/128);


    //border
    noFill();
    strokeWeight(2);
    stroke(200);
    rect(0,0, canvasWidth - 1, canvasHeight);

    
    //line that shows the end
    line(0, canvasWidth*1.5/8, canvasWidth, canvasWidth*1.5/8); //block_size * score_bar

    noStroke();

    if(gameover) {
        //print gameover
        fill(255, 0, 0);
        textAlign(CENTER, CENTER);
        textSize(canvasWidth / 10);
        text("Game Over", canvasWidth / 2, canvasHeight / 2);
        textSize(canvasWidth / 20);
        text("Press Enter or touch to start", canvasWidth / 2, canvasHeight / 2 + canvasWidth / 10);

        afterGameoverTimer -= deltaTime;
    }
    if(gamestart) {
        //print welcome text
        fill(255, 255, 0);
        textAlign(CENTER, CENTER);
        textSize(canvasWidth / 10);
        text("Welcome to", canvasWidth / 2, canvasHeight / 2 - canvasWidth / 10);
        text("swirow!", canvasWidth / 2, canvasHeight / 2);
        textSize(canvasWidth / 20);
        text("Press Enter or touch to start", canvasWidth / 2, canvasHeight / 2 + canvasWidth / 10);
    }
}

function toggleFullScreen() {
    //for tests
    return;

    if (!document.fullscreenElement) {
    // If the document is not in full screen mode
    // make the video full screen
    document.getElementById("main").requestFullscreen();
  }
}