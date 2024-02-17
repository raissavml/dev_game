class Game {
  constructor() {
    this.board;
    this.boardWidth = 750;
    this.boardHeight = 250;
    this.context;

    this.devHeight = 94;
    this.devWidth = 94;
    this.devX = 50;
    this.devY = this.boardHeight - this.devHeight;
    this.devImg = new Image();

    this.dev = {
      x: this.devX,
      y: null,
      width: this.devWidth,
      height: this.devHeight,
    };

    this.bugsArray = [];
    this.bugWidths = [55, 69, 102, 69];
    this.bugHeights = 70;
    this.bugX = 700;
    this.bugY = this.boardHeight - this.bugHeights;
    this.bugImgs = [];

    this.velocityX = -8;
    this.velocityY = 0;
    this.gravity = 0.4;

    this.gameOver = false;
    this.startGame = false;
    this.animationStarted = false;
    this.score = 0;
    this.lives = 5;
    this.maxLives = 5;
    this.level = 1;
  }

  initialize() {
    this.board = document.getElementById("board");
    this.board.height = this.boardHeight;
    this.board.width = this.boardWidth;
    this.context = this.board.getContext("2d");

    this.devImg.src = "./images/dev.png";
    this.devImg.onload = () => {
      this.context.drawImage(
        this.devImg,
        this.dev.x,
        this.dev.y,
        this.dev.width,
        this.dev.height
      );
    };

    // Load bug images
    for (let i = 1; i <= 4; i++) {
      let img = new Image();
      img.src = `./images/bug${i}.png`;
      this.bugImgs.push(img);
    }

    document.addEventListener("keydown", (event) => {
      if (!this.startGame && event.code === "Enter") {
        this.startGame = true;
        this.animationStarted = true;
        requestAnimationFrame(this.update.bind(this));
        if (!music.overworld.playing()) {
          music.overworld.play();
        }
      }
    });

    setInterval(this.placeBugs.bind(this), 1000);
    document.addEventListener("keydown", this.moveDev.bind(this));
    this.board.addEventListener("click", () => {
      if (this.gameOver) {
        this.resetGame();
        if (!music.overworld.playing()) {
          music.overworld.play();
        }
      }
    });
    document.addEventListener("keydown", (event) => {
      if (this.gameOver && event.code === "Space") {
        this.resetGame();
        if (!music.overworld.playing()) {
          music.overworld.play();
        }
      }
    });
  }

  update() {
    if (!this.startGame) {
      return;
    }

    if (this.animationStarted) {
      requestAnimationFrame(this.update.bind(this));
    }
    if (this.gameOver) {
      music.overworld.pause();
      return;
    }

    this.context.clearRect(0, 0, this.board.width, this.board.height);

    if (!this.gameOver) {
      this.velocityY += this.gravity;
      this.dev.y = Math.min(this.dev.y + this.velocityY, this.devY);
    }

    this.context.drawImage(
      this.devImg,
      this.dev.x,
      this.dev.y,
      this.dev.width,
      this.dev.height
    );

    for (let i = 0; i < this.bugsArray.length; i++) {
      const bug = this.bugsArray[i];
      bug.x += this.velocityX;
      this.context.drawImage(bug.img, bug.x, bug.y, bug.width, bug.height);

      if (this.detectCollision(this.dev, bug)) {
        this.handleCollision(bug);
      }
      if (!music.overworld.playing()) {
        music.overworld.play();
      }
    }

    this.displayScore();
    this.displayLives(); // Displaying lives
    this.checkLevelCompletion();
  }

  moveDev(e) {
    if (this.gameOver) {
      return;
    }

    if ((e.code == "Space" || e.code == "ArrowUp") && this.dev.y == this.devY) {
      this.dev.width = this.devWidth;
      this.dev.height = this.devHeight;
      this.devY = this.boardHeight - this.devHeight;
      this.velocityY = -10;
      this.context.clearRect(
        this.dev.x,
        this.dev.y,
        this.dev.width,
        this.dev.height
      );
      this.devImg.src = "./images/dev.png";
      sfx.boost.play();
    } else if (e.code == "ArrowDown" && this.dev.y == this.devY) {
      this.dev.width = 50;
      this.dev.height = 50;
      this.devY = 200;
      this.context.clearRect(
        this.dev.x,
        this.dev.y,
        this.dev.width,
        this.dev.height
      );
      this.devImg.src = "./images/rubber-duck.png";
    }
  }

  placeBugs() {
    if (this.gameOver) {
      return;
    }

    const bug = {
      img: null,
      x: this.bugX,
      y: null,
      width: null,
      height: this.bugHeights,
      scored: false,
    };

    const placeBugsChance = Math.random();

    if (placeBugsChance > 0.7) {
      bug.img = this.bugImgs[2];
      bug.width = this.bugWidths[2];
      bug.y = this.bugY;
      this.bugsArray.push(bug);
    } else if (placeBugsChance > 0.5) {
      bug.img = this.bugImgs[1];
      bug.width = this.bugWidths[1];
      bug.y = this.bugY;
      this.bugsArray.push(bug);
    } else if (placeBugsChance > 0.3) {
      bug.img = this.bugImgs[0];
      bug.width = this.bugWidths[0];
      bug.y = this.bugY;
      this.bugsArray.push(bug);
    } else if (placeBugsChance > 0.01) {
      bug.img = this.bugImgs[3];
      bug.width = this.bugWidths[3];
      bug.y = 100;
      this.bugsArray.push(bug);
    }

    if (this.bugsArray.length > 5) {
      this.bugsArray.shift();
    }
  }

  detectCollision(a, b) {
    return (
      a.x < b.x + b.width - 7 &&
      a.x + a.width - 7 > b.x &&
      a.y < b.y + b.height - 7 &&
      a.y + a.height - 7 > b.y
    );
  }

  handleCollision(bug) {
    if (this.detectCollision(this.dev, bug)) {
      if (!bug.scored) {
        this.lives--; // Decrease lives on collision
        bug.scored = true; // Mark the bug as scored to avoid multiple decrement
        sfx.push.play();

        if (this.lives <= 0) {
          this.gameOver = true;
          this.displayGameOver();
          music.overworld.pause();
        }
      }
    }
  }

  resetGame() {
    this.devImg.src = "./images/dev.png";
    this.gameOver = false;
    this.score = 0;
    this.lives = 5; // Reset lives
    this.bugsArray.length = 0;
    this.dev.y = this.devY;
    this.velocityY = 0;
    this.velocityX = -8;
    this.context.clearRect(0, 0, this.board.width, this.board.height);
  }

  displayScore() {
    this.context.fillStyle = "black";
    this.context.font = "20px Open Sans";
    this.context.fillText(`Score: ${this.score}`, 5, 20);
    this.score++;
  }

  displayLives() {
    this.context.fillStyle = "black";
    this.context.font = "20px Open Sans";
    this.context.fillText(`Lives: ${this.lives} / ${this.maxLives}`, 650, 20);
  }

  displayGameOver() {
    this.context.fillStyle = "black";
    this.context.font = "20px Open Sans";
    this.context.fillText(`Game Over`, 325, 120);
    this.context.fillText(`Your score: ${this.score}`, 315, 150);
    this.devImg.src = "./images/devEnd.png";
    this.devImg.onload = () => {
      this.context.clearRect(
        this.dev.x,
        this.dev.y,
        this.dev.width,
        this.dev.height
      );
      this.context.drawImage(
        this.devImg,
        this.dev.x,
        this.dev.y,
        this.dev.width,
        this.dev.height
      );
    };

    this.context.fillStyle = "#2a2a2a";
    this.context.fillRect(
      restartButton.x,
      restartButton.y,
      restartButton.width,
      restartButton.height
    );
    this.context.fillStyle = "white";
    this.context.font = "16px Open Sans";
    this.context.fillText(
      `Restart`,
      restartButton.x + 20,
      restartButton.y + 35
    );
  }

  checkLevelCompletion() {
    // Add level completion logic here
  }
}

const game = new Game();
const restartButton = {
  x: 330,
  y: 170,
  width: 85,
  height: 50,
};
game.initialize();

// SOUND ///
let sfx = {
  push: new Howl({
    src: ["https://assets.codepen.io/21542/howler-push.mp3"],
  }),
  boost: new Howl({
    src: ["https://assets.codepen.io/21542/howler-sfx-levelup.mp3"],
    loop: false,
  }),
};

let music = {
  overworld: new Howl({
    src: ["https://assets.codepen.io/21542/howler-demo-bg-music.mp3"],
  }),
};
