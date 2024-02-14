let board;
let boardWidth = 750;
let boardHeight = 250;
let context;

let devHeight = 94;
let devWidth = 94;
let devX = 50;
let devY = boardHeight - devHeight;
let devImg;

let dev = {
    x: devX,
    y: null,
    width: devWidth,
    height: devHeight
}

let bugsArray = [];
let bug1Width = 55;
let bug2Width = 69;
let bug3Width = 102;
let bug4Width = 69;

let bugHeight = 70;
let bugX = 700;
let bugY = boardHeight - bugHeight;

let bug1Img;
let bug2Img;
let bug3Img;
let bug4Img;

let velocityX = -8;
let velocityY = 0;
let gravity = .4;

let gameOver = false;
let score = 0;

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;

    context = board.getContext("2d");

    devImg = new Image();
    devImg.src = "./images/dev.png";
    devImg.onload = function() {
        context.drawImage(devImg, dev.x, dev.y, dev.width, dev.height);
    };

    bug1Img = new Image();
    bug1Img.src = "./images/bug1.png";

    bug2Img = new Image();
    bug2Img.src = "./images/bug2.png";

    bug3Img = new Image();
    bug3Img.src = "./images/bug3.png";

    bug4Img = new Image();
    bug4Img.src = "./images/bug4.png";

    requestAnimationFrame(update);
    setInterval(placeBugs, 1000);
    document.addEventListener('keydown', moveDev);
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    velocityY += gravity;
    dev.y = Math.min(dev.y + velocityY, devY);
    context.drawImage(devImg, dev.x, dev.y, dev.width, dev.height);

    for (let i = 0; i < bugsArray.length; i++) {
        let bug = bugsArray[i];
        bug.x += velocityX;
        context.drawImage(bug.img, bug.x, bug.y, bug.width, bug.height);
        
        if (detectCollision(dev, bug)) {
            context.clearRect(dev.x, dev.y, dev.width, dev.height);
            gameOver = true;
            context.fillStyle = 'black'
            context.font = '20px Open Sans';
            context.fillText(`Game Over`, 325, 120);
            devImg.src = "./images/devEnd.png"
            devImg.onload = function () {
                context.drawImage(devImg, dev.x, dev.y, dev.width, dev.height);
            }
        }
    }

    context.fillStyle = 'black';
    context.font = '20px Open Sans';
    context.fillText(`Score: ${score}`, 5, 20);
    scoreboard();

}

function moveDev(e) {
    if (gameOver) {
        return;
    }

    if ((e.code == 'Space' || e.code == 'ArrowUp') && dev.y == devY) {
        dev.width = devWidth;
        dev.height = devHeight;
        devY = boardHeight-devHeight;
        velocityY = -10;
        context.clearRect(dev.x, dev.y, dev.width, dev.height);
        devImg.src = "./images/dev.png" 
    } else if ((e.code == 'ArrowDown') && dev.y == devY) {
        dev.width = 50;
        dev.height = 50;
        devY = 200;
        context.clearRect(dev.x, dev.y, dev.width, dev.height);
        devImg.src = "./images/rubber-duck.png"      
    } 
}

function placeBugs() {
    if (gameOver) {
        return;
    }

    let bug = {
        img: null,
        x: bugX,
        y: null,
        width: null,
        height: bugHeight,
    }

    let placeBugsChance = Math.random();

    if (placeBugsChance > .70) {
        bug.img = bug3Img;
        bug.width = bug3Width;
        bug.y = bugY;
        bugsArray.push(bug);
    } else if (placeBugsChance > .50) {
        bug.img = bug2Img;
        bug.width = bug2Width;
        bug.y = bugY;
        bugsArray.push(bug);        
    } else if (placeBugsChance > .30) {
        bug.img = bug1Img;
        bug.width = bug1Width;
        bug.y = bugY;
        bugsArray.push(bug);
    } else if (placeBugsChance > 0.01) {
        bug.img = bug4Img;
        bug.width = bug4Width;
        bug.y = 100;
        bugsArray.push(bug);   
    }

    if (bugsArray.length > 5) {
        bugsArray.shift();
    }
}

function scoreboard() {
    if (bugsArray.shift) {
        score++;  
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width - 7 &&
        a.x + a.width - 7 > b.x &&
        a.y < b.y + b.height - 7 &&
        a.y + a.height - 7 > b.y;
}