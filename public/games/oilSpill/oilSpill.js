window.onload = function () {
    const scoreText = document.getElementById("score");
    const startButton = document.getElementById("startBtn");
    const bloop = document.getElementById("bloop");  
    const gameContainer = document.getElementById("gameContainer");
    const gameTimerGauge = document.querySelector(".timer-gauge");
    const gameTimer = document.getElementById("gameTimer");
    const gameStats = document.getElementById("gameStats");
    const modal = document.getElementById("instructionsWrapper");
    const startInstructions = document.getElementById("startInstructions");
    const endScreen = document.getElementById("endGame");
    const kelpHair = document.getElementById("withkelp");
    const nextButton = document.getElementById("next");

    const canvas = document.getElementById("gameContainer");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");

    let score = 0;
    let player;
    let gameTimerInterval = null;

    startButton.addEventListener("click", startGame);
    nextButton.addEventListener("click", null); //add navigation to the next screen

    function startGame() {
        modal.style.display = "none";
        gameStats.style.display = "flex";
        createTimer();
        player = new Player();
        animate();
    }

    function createTimer() {
        gameTimer.innerText = "15s";
        let sec = 0;
        gameTimerInterval = setInterval(startGameTimer, 1000);
        function startGameTimer() {
            gameTimer.textContent = 15 - sec + "s";
            if (sec === 15) {
                sec = 0;
                endGame();
                gameTimer.textContent = 15 - sec + "s";
                gameTimer.classList.remove("warning");
                gameTimerGauge.classList.remove("ticking");
            } else {
                if (sec === 1) {
                gameTimerGauge.classList.add("ticking");
                }
                if (sec > 9) {
                gameTimer.classList.add("warning");
                }
                sec++;
            }
        }
    }

    function endGame() {
        clearInterval(gameTimerInterval);
        gameStats.style.display = "none";
        gameContainer.style.display = "none";
        modal.style.display = "block";
        modal.removeChild(startButton);
        startInstructions.style.display = "none";
        endScreen.style.display = "block";
        document.removeChild(bloop);
        document.removeChild(gameContainer)
    }

    kelpHair.addEventListener("click", () => {
        kelpHair.className += " fade";
        Promise.all(
            kelpHair.getAnimations().map(
              function(animation) {
                return animation.finished
              }
            )
          ).then(
            function() {
              return kelpHair.remove();
            }
          );
    });
    
    const mouse = {
        x: canvas.width / 2,
        y: canvas.height / 2,
    };
    let gameFrame = 0;

    canvas.addEventListener("mousemove", function (e) {
        mouse.x = e.clientX - canvas.offsetLeft
        mouse.y = e.clientY - canvas.offsetTop
    });

    // Make image follow mouse
    const playerLeft = new Image();
    playerLeft.src = "../Assets/images/seaweedhair-l.svg";
    playerLeft.style.objectFit = "contain";
    const playerRight = new Image();
    playerRight.src = "../Assets/images/seaweedhair-r.svg";
    playerRight.style.objectFit = "contain";

    class Player {
        constructor(){
            this.x = canvas.width;
            this.y = canvas.height/2;
            this.radius = 50;
            this.frameX = 0;
            this.frameY = 0;
            this.frame = 0;
            this.spriteWidth = 135;
            this.spriteHeight = 1400;
        }
        update(){
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            if (mouse.x != this.x){
                this.x -= dx/20;
            }
            if (mouse.y != this.y){
                this.y -= dy/20;
            }
            if (this.x < 0) this.x = 0;
            if (this.x > canvas.width) this.x = canvas.width;
            if (this.y < 50) this.y = 50;
            if (this.y > canvas.height) this.y = canvas.height;
        }
        draw(){
            if (gameFrame % 10 == 0) {
                this.frame++;
                if (this.frame >= 12) this.frame = 0;
                if ( this.frame == 3 ||  this.frame == 7 ||  this.frame == 11) {
                    this.frameX = 0;
                } else this.frameX++;
                if (this.frame < 3){
                    this.frameY = 0;
                } else if (this.frame < 7){
                    this.frameY = 1;
                } else if (this.frame < 11){
                    this.frameY = 2;
                } else this.frameY = 0;
            }
          
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 360);
            ctx.fillStyle = "rgba(200, 215, 2, 0.3)";
            ctx.fill();
            if (this.x >= mouse.x) ctx.drawImage(playerLeft,  0 - 60, 0 - 45, this.spriteWidth * 0.8, this.spriteHeight * 0.8);
            else ctx.drawImage(playerRight, 0 - 60, 0 - 45, this.spriteWidth * 0.8, this.spriteHeight * 0.8);

            ctx.restore();
        }
    }

    // Make oil droplets
    const oilArray = [];
    const oil = new Image();
    oil.src = "../Assets/images/oil.svg";
    oil.style.objectFit = "contain";

    class Oil {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = 0 - 50 - (Math.random() * canvas.height) / 2;
            this.radius = 65;
            this.speed = Math.random() * -5 + -1;
            this.distance;
            this.counted = false;
            this.frameX = 0;
            this.spriteWidth = 130;
            this.spriteHeight = 101; 
            this.pop = false;
            this.counted = false;
        }
        update() {
            this.y -= this.speed;
            const dx = this.x - player.x;
            const dy = this.y - player.y;
            this.distance = Math.sqrt(dx * dx + dy * dy);
        }
        draw() {
            ctx.drawImage(oil, this.frameX * this.spriteWidth,
                0,
                this.spriteWidth,
                this.spriteHeight,
                this.x - 68,
                this.y - 68,
                this.spriteWidth,
                this.spriteHeight
            );
            ctx.imageSmoothingEnabled = false;
        }
    }

    function handleOil() {
        for (let i = 0; i < oilArray.length; i++) {
            if (oilArray[i].y > canvas.height * 2) {
                oilArray.splice(i, 1);
            }
        }
        for (let i = 0; i < oilArray.length; i++) {
            if (oilArray[i].distance < oilArray[i].radius + player.radius) {
                popAndRemove(i);
            }
        }
        for (let i = 0; i < oilArray.length; i++) {
            oilArray[i].update();
            oilArray[i].draw();
        }
        if (gameFrame % 50 == 0) {
            oilArray.push(new Oil());
        }
    }
    function popAndRemove(i) {
        if (oilArray[i]) {
            if (!oilArray[i].counted) score++;
            bloop.play();
            scoreText.innerText = `Score: ${score}`;
            oilArray[i].counted = true;
            oilArray[i].frameX++;
            if (oilArray[i].frameX > 7) oilArray[i].pop = true;
            if (oilArray[i].pop) oilArray.splice(i, 1);
            requestAnimationFrame(popAndRemove);
        }
    }

    // animation loop
    function animate() {
        player.update();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        handleOil();
        player.draw();
        gameFrame += 1;
        requestAnimationFrame(animate);
    }

    window.addEventListener("resize", function () {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        mouse.x = canvas.width / 2;
        mouse.y = canvas.height / 2;
    });
};
