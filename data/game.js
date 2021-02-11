let est_map;
let cityTable;


const extent = {
  west: 361587,
  east: 748049,
  north: 6622313,
  south: 6366686
}

const answerTime = 5;
let playerName = "";


let booleans = {
  startMenu: true,
  countDown: false,
  dropPins: false,
  inputReady: true,
  inputReadyTrigger: true,
  startGuessTime: true,
  timingRect: true,
  isTimeOver: false, //true when time over during sub menu
  timeOver: false, //trigger to start the time after it's time over
  getTimeOver: true, //trigger boolean for timeOver
  lastCity: false,
  gameIsOver: false,
  scoreToDB: false,
  topScoresReady: false,
  refreshTopScores: false,
  createNextButton: false
}

let yClicked;
let xClicked;
let mappedCityY;
let mappedCityX;


let city;
let cityX;
let cityY;

let pixelInMeters;
let distancePixels;
let distanceKm;
let timeAnswered;
let score;
let scoreSum;
let topScores;
let citiesLeft;

let avgDistance = null;
let avgTime = null;
let avgScore = null;

let yLerped = 0;
let radiusLerped;

let countDownStart;
let TimeElapsed;
let timeRunning;
let timeClicked;
let timeSinceClick;
let timeGuessed;
let cityTimer;
let timeOver;

let size = 40;
let dir = 0.125;

//For the animated pin
let strokeCol = 0;
let adder = 1;


let indexes = [];
let distances = [];
let times = [];
let scores = [];

let LeaderboardHeader = [];
let LeaderboardContent = [];


function preload() {
  estMap = loadImage("est.png");
  cityTable = loadTable("cities.txt", "csv");
  baloo = loadFont("Baloo2-Regular.ttf");
}


function setup() {
  createCanvas(900, 595);
  textFont(baloo)
  pixelInMeters = (extent.east - extent.west) / width;

  citiesLeft = cityTable.getRowCount() + 1;


  //DOM elements
  startButton = createButton("START GAME");
  startButton.position(width / 2 - 80, height - 170);
  startButton.mousePressed(startGame);

  nameBox = createInput().attribute("placeholder", "Enter player's name")
  nameBox.attribute("maxlength", "15")
  nameBox.position(width / 2 - 80, height - 217)
  nameBox.size(162, 30)

  //Get data from database
  getLeaderboard()

  indexesInit();

  getData()
  animationInit();


}



function draw() {
  
  image(estMap, 0, 0);
  fill(255)



  mouseVect = createVector(mouseX, mouseY);
  timeRunning = millis();
  timeSinceClick = ((timeRunning - timeClicked) / 1000);

  main = new Main(xClicked, yClicked, color(255, 255, 255));


  main.startMenu();
  countDown();


  if (!booleans.gameIsOver && !booleans.startMenu && !booleans.countDown) {
    if (booleans.dropPins) {
      main.dropInputPin();
      main.dropCorrectPin(mappedCityY, mappedCityX);
      main.drawDistanceRadius();
    }

    if (booleans.inputReady) {
      removeElements();
      if (booleans.startGuessTime) {
        cityTimer = timeRunning;
        booleans.startGuessTime = false;
      }

      timeGuessed = (timeRunning - cityTimer) / 1000;

      if (timeGuessed < answerTime) {
        animateRect(answerTime, cityTimer, 0, width, 0, height, 8);
        main.drawCityNameAndTime();
      }
      
    }

    if (timeSinceClick > 5.5 && !booleans.isTimeOver) {
      booleans.inputReady = true;
      booleans.dropPins = false;

      if (booleans.inputReadyTrigger) {
        booleans.startGuessTime = true;
        booleans.inputReadyTrigger = false;
      }
    }

    if (!booleans.inputReady) {
      main.drawResult();
      booleans.inputReadyTrigger = true;
    }
    


    if (booleans.getTimeOver && timeGuessed > 5) { //Stuff that happens once when time runs out
      xStartModified = null;
      yStartModified = null;
      xEndModified = null;
      yEndModified = null;

      scores.push(0);
      main.calculateAverages();
      timeOver = timeRunning;
      booleans.isTimeOver = true;
      booleans.timeOver = true;
      booleans.getTimeOver = false;
    }
    	
    if (booleans.timeOver && timeGuessed > 9) { //Stuff that happens when time over menu ends
      cityTimer = timeRunning;
      getData();

      booleans.getTimeOver = true;
      booleans.timeOver = false;
      booleans.isTimeOver = false;
    }

    if (timeGuessed > answerTime && timeGuessed < 9) { //Time over submenu is shown
      main.drawTimeOverResult()
      animateRect(4, timeOver, width / 2 - 250, width / 2 + 250, height / 2 - 100, height / 2 + 100, 3);
    }
 


    drawAverages();

    main.checkGameOver();

    if (booleans.lastCity && timeSinceClick > 5.5) {
      booleans.gameIsOver = true;
      booleans.scoreToDB = true;
    }

  } else if (booleans.gameIsOver) {
    main.gameOverScore();
    drawAverages();
  }


//Add player's name and score to DB
if (booleans.scoreToDB) {

  let finalScore = Math.round(scoreSum);
  const score = {playerName, finalScore};

  const options = {
    method: "POST",
    body: JSON.stringify(score),
    headers: {
      "Content-Type": "application/json" 
    },
  };

  fetch("/api", options)
    .then(getLeaderboard());

  //Display top score as animated text
  createTextPoints("Leaderboard", "header", 15, 120, 160);
  const topScore = topScores[0];
  
  const string = "Your score: " + score.finalScore;
  const textBox = baloo.textBounds(string, 250, 300, 80);
  const leftAlign = (width - textBox.w) / 2;

  createTextPoints("Your score: " + score.finalScore, "content", leftAlign, 505, 80);

  //Create restart game button

  restartButton = createButton("RESTART GAME");
  restartButton.position(width / 2 - 80, height - 70);
  restartButton.mousePressed(restartGame);

  booleans.scoreToDB = false;
  }
}


function mouseClicked() {

  xStartModified = null;
  yStartModified = null;
  xEndModified = null;
  yEndModified = null;

  if (booleans.inputReady && timeGuessed < answerTime) {
    timeClicked = timeRunning;
    yClicked = mouseY;
    xClicked = mouseX;
    yLerped = 0;
    radiusLerped = 0;
    booleans.dropPins = true;
    main.calculateDistance();
    getData();
    main.getTime();
    main.getScore();
    main.calculateAverages();
    booleans.inputReady = false;
    if (!booleans.lastCity) {
      booleans.createNextButton = true;
    }
  }
}


class Main {
  constructor(inputX, inputY) {
    this.inputX = inputX;
    this.inputY = inputY;
  }

  //Stuff that is drawn before starting the game
  startMenu() {
    if (booleans.startMenu) {
      colorMode(HSB);
      for (const dropper of droppers) {
        dropper.display()
      }
      colorMode(RGB);
      startLeaderBoard();
    }
  }

  dropInputPin() {
    animatedPin(this.inputX, this.inputY - 70, "red")
  }

  dropCorrectPin(correctX, correctY) {
    stroke(0, 255, 0)
    yLerped = lerp(yLerped, correctY, 0.1);
    animatedPin(correctX, yLerped - 70, "green")
  }

  drawCityNameAndTime() {
    textAlign(LEFT);
    fill(255);
    stroke(255);
    strokeWeight(0);
    textSize(45);
    text("Find " + city, 10, 50);
    textSize(35);
    text("Time: " + (answerTime - timeGuessed).toFixed(1), 10, 85);
    text("Cities left: " + citiesLeft, 10, 120);
  }

  drawResult() {
    if (timeSinceClick > 1.5) {
      rectMode(CENTER);
      stroke(0);
      strokeWeight(3);
      fill(255, 255, 255, 200);
      rect(width / 2, height / 2, 500, 200);
      animateRect(4, timeClicked + 1500, width / 2 - 250, width / 2 + 250, height / 2 - 100, height / 2 + 100, 3);

      if (booleans.createNextButton) {
        createNextButton();
        booleans.createNextButton = false;
      }

      fill(0);
      strokeWeight(0);
      textAlign(CENTER);
      textSize(35);
      text("Distance: " + Math.round(distanceKm) + " km", width / 2, height / 2 - 60);
      text("Time: " + timeAnswered.toFixed(2) + " s", width / 2, height / 2 - 10);
      text("Score: " + Math.round(score), width / 2, height / 2 + 40);
    }
  }

  drawTimeOverResult() {
    rectMode(CENTER)
    fill(255, 255, 255, 200)
    stroke(0)
    strokeWeight(3)
    rect(width / 2, height / 2, 500, 200)

    fill(0)
    strokeWeight(0)
    textAlign(CENTER)
    textSize(35);
    text("Time over", width / 2, height / 2 - 25)
    text("Score: 0", width / 2, height / 2 + 25)
  }

  getTime() {
    timeAnswered = timeGuessed; //How long it took to answer
    times.push(timeAnswered); //Add answer time to list
  }

  getScore() {
    let timecoeff = 200 - timeAnswered * 50;
    let distancecoeff = 800 - distanceKm * 10;
    score = timecoeff + distancecoeff; //Score calculation based on coefficents

    if (score < 0) {
      score = 0
    } //Avoid below 0 scores
    scores.push(score); //
  }


  calculateDistance() {
    mappedCityX = map(cityX, extent.north, extent.south, 0, height)
    mappedCityY = map(cityY, extent.west, extent.east, 0, width)

    distancePixels = dist(xClicked, yClicked, mappedCityY, mappedCityX)
    distanceKm = distancePixels * pixelInMeters / 1000;
    distances.push(distanceKm)
  }

  calculateAverages() {
    let distanceSum = 0;
    let timeSum = 0;
    scoreSum = 0;
    let listLength = distances.length
    for (let distance of distances) {
      distanceSum += distance;
    }
    for (let time of times) {
      timeSum += time;
    }
    for (let score of scores) {
      scoreSum += score;
    }
    
    if (!booleans.gameIsOver) {
      avgDistance = distanceSum / listLength;
      avgTime = timeSum / listLength;
      avgScore = scoreSum / scores.length;
    }
  }

  drawDistanceRadius() {
    if (mappedCityX - yLerped < 5) {
      strokeWeight(3)
      if (distanceKm < 10) {
        fill(0, 255, 0, 100);
        stroke(0, 255, 0)
      } else if (distanceKm < 100) {
        fill(255, 255, 0, 100);
        stroke(255, 255, 0)
      } else {
        fill(255, 0, 0, 100);
        stroke(255, 0, 0);
      }

      let radius = distancePixels;
      radiusLerped = lerp(radiusLerped, radius, 0.05);
      ellipse(xClicked, yClicked, radiusLerped * 2, radiusLerped * 2);
    }
  }

  checkGameOver() {
    if (indexes.length === 0) {
      booleans.lastCity = true;
    }
  }


  gameOverScore() {
    endLeaderBoard();
    animatedLeaderBoard();
  }
}


function getData() {
  if (indexes.length > 0) {

    const randomIdx = Math.floor(Math.random() * indexes.length);
    city = cityTable.get(indexes[randomIdx], 0);
    cityY = cityTable.get(indexes[randomIdx], 1);
    cityX = cityTable.get(indexes[randomIdx], 2);

    indexes.splice(randomIdx, 1);
    citiesLeft -= 1;
  }
}


function startGame() {
  playerName = nameBox.value()
  if (playerName === "") {
    nameBox.style("border", "2px solid red");
  } else {
    booleans.countDown = true;
    booleans.topScoresReady = false;
    booleans.startMenu = false;
    
    countDownStart = timeRunning;
    removeElements()
  }
}

function startLeaderBoard() {
  rectMode(CORNER)

  fill(150, 150, 150, 100);
  strokeWeight(3);
  stroke(255);
  rect(200, 100, width - 400, height - 200, 5);

  fill(200, 200, 200, 50);
  stroke(255);
  strokeWeight(3);
  rect(300, 120, width - 600, height - 355, 4);

  size += dir;
  if (size === 45) { dir = -dir}
  else if (size === 35) {dir = -dir}

  let fillCol = map(size, 35, 45, 150, 255)
  let strokeCol = map(size, 35, 45, 50, 0)

  textSize(size);
  textAlign(CENTER);
  fill(fillCol);
  stroke(strokeCol);
  strokeWeight(4);
  text("LEADERBOARD", width / 2, 160);


  //Leaderboard content
  if (booleans.topScoresReady) {
    let i = 148;
    
    for (let score of topScores) {
      i += 40
      textSize(30)
      strokeWeight(3)
      stroke(0)

      if (score.playerName === playerName) { fill(0, 255, 0) }
      else { fill(255) }

      text(score.playerName + "  " + score.finalScore, width / 2, i)
    }
  }
}

function endLeaderBoard() {

  fill(150, 150, 150, 100);
  strokeWeight(3);
  stroke(255);
  rect(200, 140, width - 400, height - 295, 5);

  if (booleans.topScoresReady) {
    for (let i = 0; i <= 4; i++) {
      const score = topScores[i];
      let height = 185 + i * 60;

      textSize(50);
      strokeWeight(5);
      stroke(0);

      fill(255, 255, 255);
      if (score.playerName === playerName) { fill(0, 255, 0) };
      textAlign(CENTER)
      text((i + 1) + ". " + score.playerName + ": " + score.finalScore, width / 2, height);
    }
  }
}

function animatedLeaderBoard() {
  for (let i = 0; i < LeaderboardHeader.length; i++) {
    let dot = LeaderboardHeader[i];
    dot.applyBehavior();
    dot.updatePosition();
    dot.show();
  }
}

async function getLeaderboard() {
  //Get top scores from database
  const response = await fetch("/api");
  topScores = await response.json();
  booleans.topScoresReady = true;
}

function drawAverages() {
  rectMode(CORNER);
  fill(255, 255, 255, 200);
  noStroke();
  textSize(24);
  textAlign(LEFT);
  rect(-10, height - 100, 175, 110, 10);
  fill(0);
  text("AVERAGES", 10, height - 80);

  if (scores.length > 0) {
    text("Score: " + Math.round(avgScore), 10, height - 55);
  }

  if (avgDistance != null) {
    text("Distance: " + avgDistance.toFixed(1), 10, height - 5)
    text("Time: " + avgTime.toFixed(1), 10, height - 30)
  }
}

function animatedPin(x, y, color) {
  let strokes;
    
  if (color === "red") {
    strokes = [255, 0, 0];
  } else if (color === "green") {
    strokes = [0, 255, 0];
  }

  strokeCol += adder;
  if (strokeCol > 60) { strokeCol = 0 }

  fill(0)
  noStroke()
  triangle(x - 18, y - 5, x, y + 65, x + 18, y - 5)

  strokeWeight(2)
  for (let i = 0; i < 20; i++) {
    let xy = 2.6 * i + y;

    if (i === strokeCol) {stroke(strokes[0], strokes[1], strokes[2])}
    else if (i === strokeCol + 1 || i === strokeCol - 1){ stroke(strokes[0], strokes[1], strokes[2], 250) }
    else if (i === strokeCol + 2 || i === strokeCol - 2){ stroke(strokes[0], strokes[1], strokes[2], 200) }
    else if (i === strokeCol + 3 || i === strokeCol - 3){ stroke(strokes[0], strokes[1], strokes[2], 150) }
    else if (i === strokeCol + 4 || i === strokeCol - 4){ stroke(strokes[0], strokes[1], strokes[2], 100) }
    else if (i === strokeCol + 5 || i === strokeCol - 5){ stroke(strokes[0], strokes[1], strokes[2], 50) }
    else {
      if (color === "red") { stroke(75, 0, 0)}
      else if (color === "green") {stroke(0, 75, 0)}
    }
    line(i * 0.63 + x - 12, xy, x + 12 - i * 0.63, xy)
  }
  noFill()
  stroke(150)
  if (color === "red") { stroke(200, 0, 0)}
  else if (color === "green") { stroke(0, 200, 0) }
  strokeWeight(2)
  triangle(x - 18, y - 5, x, y + 65, x + 18, y - 5)
}

function createTextPoints(string, type, x, y, size) {
  let options;

  if (type === "header") {
    options = {
      sampleFactor: 0.2
    }

  } else if (type === "content") {
    options = {
      sampleFactor: 0.2


    }
  }
  let points = baloo.textToPoints(string, x, y, size, options)
  
  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    let agent = new Mover(pt.x, pt.y, type);
    LeaderboardHeader.push(agent);
  }  
}

function restartGame() {
  indexesInit();
  getData();
  citiesLeft = cityTable.getRowCount();
  booleans.gameIsOver = false;
  booleans.lastCity = false;

  distances = [];
  times = [];
  scores = [];
  LeaderboardHeader = [];
  LeaderboardContent = [];

  avgScore = undefined;
  avgDistance = undefined;
  avgTime = undefined;
  removeElements();
}

function indexesInit() {
  for (let i = 0; i < cityTable.getRowCount(); i++) {
    indexes.push(i)
  }
}

function countDown() {
  if (booleans.countDown) {
    let countDownElapsed = (timeRunning - countDownStart) / 1000;

    let elapsedString = countDownElapsed.toString();
    let elapsedList = elapsedString.split(".");

    let seconds = elapsedList[0];
    let mapper = elapsedList[1].substring(0, 3);


    if (5 - seconds === 0) {
      booleans.countDown = false;
    } else {
      noStroke();
      textSize(400);
      fill(255, 255, 255, map(mapper, 0, 1000, 250, 0));
      text(5 - seconds, width / 2, 400);
    }
  }
}

function createNextButton() {
  nextButton = createButton("NEXT");
  nextButton.id("next");
  nextButton.position(width / 2 - 53, height - 245);
  nextButton.mousePressed(nextCity);
}

function nextCity() {
  booleans.inputReady = true;
  booleans.dropPins = false;
  booleans.getTimeOver = true;
  
  cityTimer = timeRunning;
  timeClicked = timeRunning;
}