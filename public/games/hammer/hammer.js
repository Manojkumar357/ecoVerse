const squares = document.querySelectorAll('.square');
const mole = document.querySelector('.mole');

// selecting for an element with id time-left
const timeLeft = document.querySelector('#time-left');
const score = document.querySelector('#score');

let result = 0;
let hitPosition;
let currentTime = 15;
let timerId = null;

let countDownTimerId = setInterval(countDown, 1000)

function randomSquare() {
  // remove mole
  squares.forEach(square => {
    square.classList.remove('mole');
  })

  // add mole to random position from 1 - 32
  let randomPosition = squares[Math.floor(Math.random() * 32)];
  randomPosition.classList.add('mole');
  hitPosition = randomPosition.id;
}

//create audio element for playing music and sfx
function playSound(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);

  this.play = function () {
    this.sound.play();
  };
  
  this.stop = function () {
    this.sound.pause();
  };
}

squares.forEach(square => {
  square.addEventListener('click', () => {
    if (square.id == hitPosition) {
      result++;
      score.textContent = result;
      hitPosition = null;
      smashedLoggers = new playSound("sounds/smash.mp3");
      smashedLoggers.play();
    }
  })
})

function moveMole() {
  timerId = setInterval(randomSquare, 800);
}

moveMole();

function countDown() {
  currentTime--;
  timeLeft.textContent = currentTime;

  if (currentTime == 0) {
    clearInterval(countDownTimerId);
    clearInterval(timerId);
    alert('Your score is ' + result + '. Congratulations one of Rozxie\'s hand has been transformed back!');
    next()
  }
}

function next() {
  window.location.href = "../transitionPages/antiTrawling.html";
}