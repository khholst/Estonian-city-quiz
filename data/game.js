

let est_map;
let cityTable;


const extent = {
  west: 366522,
  east: 740421,
  north: 6630834,
  south: 6367593
}

const answerTime = 4;
let playerName = "";


let booleans = {
  startMenu: true,
  dropPins: false,
  inputReady: true,
  timingRect: true,
  timeOver: false, //trigger to start the time after it's time over
  timeOver2: false, //true after time over during result menu
  getTimeOver: true, //trigger boolean for timeOver
  getDataTrigger: false,
  getDataAfterTimeOver: false,
  lastCity: false,
  gameOver: false,
  scoreToDB: false,
  topScoresReady: false
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

let avgDistance = null;
let avgTime = null;
let avgScore = null;

let yLerped = 0;
let radiusLerped;

let TimeElapsed;
let timeRunning;
let timeClicked;
let timeSinceClick;
let timeGuessed;
let cityTimer;
let timeOver;


let indexes = [];
let distances = [];
let times = [];
let scores = [];




function preload() {
  estMap = loadImage("Eesti.png")
  cityTable = loadTable("cities.txt", "csv");
  baloo = loadFont("Baloo2-Regular.ttf")

}


function setup() {
  createCanvas(893, 629);
  textFont(baloo)
  pixelInMeters = (extent.east - extent.west) / width;


  //DOM elements
  startButton = createButton("START GAME")
  startButton.position(width / 2 - 80, height - 170)
  startButton.mousePressed(startGame)

  nameBox = createInput().attribute("placeholder", "Enter player's name")
  nameBox.attribute("maxlength", "15")
  nameBox.position(width / 2 - 80, height - 217)
  nameBox.size(162, 30)

  //Get data from database
  getLeaderboard()
  
/*   async function getLeaderboard() {
    const response = await fetch("/api");
    topScores = await response.json();
    booleans.topScoresReady = true;
  } */
  


  // for (let i = 0; i < cityTable.getRowCount(); i++) {
  //   indexes.push(i)
  // }

  for (let i = 0; i < 3; i++) {
    indexes.push(i)
  }

  getData()


}



function draw() {
  image(estMap, 0, 0);
  fill(255)


  timeRunning = millis();
  timeSinceClick = ((timeRunning - timeClicked) / 1000);

  main = new Main(xClicked, yClicked, color(255, 255, 255));


  main.startMenu();




  if (!booleans.gameOver && !booleans.startMenu) {
    if (booleans.dropPins) {
      main.dropInputPin();
      main.dropCorrectPin(mappedCityY, mappedCityX);
      main.drawDistanceRadius();
    }

    if (booleans.inputReady) {
      timeGuessed = (timeRunning - cityTimer) / 1000
      if (booleans.timingRect) {
        cityTimer = timeRunning;
        booleans.timingRect = false;
      }
      main.drawCityNameAndTime()

      if (timeGuessed < answerTime) {
        animateRect(answerTime, cityTimer, 0, width, 0, height)
      }

    } else {
      main.drawResult()
    }

    if (timeSinceClick > 5.5) {
      booleans.inputReady = true;
      booleans.dropPins = false;
    } else if (timeSinceClick > 4.95 && timeSinceClick < 5.05) {
      booleans.timingRect = true
    }


    if (timeGuessed > answerTime && timeGuessed < 8) { //time over submenu is shown
      main.drawTimeOverResult()
      animateRect(4, timeOver, width / 2 - 250, width / 2 + 250, height / 2 - 100, height / 2 + 100)


      if (booleans.getTimeOver) {
        xStartModified = null;
        yStartModified = null;
        xEndModified = null;
        yEndModified = null;
        timeOver = timeRunning; //get time since time over.......
        scores.push(0); //Add 0 score and null distance/time to lists
        main.calculateAverages();
        booleans.timeOver = true;
        booleans.getTimeOver = false;

      }
    }

    if (timeGuessed > 8) {
      booleans.inputReady = true;
      if (booleans.timeOver) {
        cityTimer = timeRunning;
        getData();
        booleans.timingRect = true;
        booleans.getTimeOver = true;
        booleans.timeOver = false;
      }
    }
    //print(booleans.getTimeOver) needs to be set to true after click

    //Show averages
    rectMode(CORNER)
    fill(255, 255, 255, 150)
    noStroke()
    textSize(24)
    textAlign(LEFT)
    rect(-10, height - 100, 175, 110, 10)
    fill(0)
    text("AVERAGES", 10, height - 80)

    if (scores.length > 0) {
      text("Score: " + Math.round(avgScore), 10, height - 55)
    }

    if (avgDistance != null) {
      text("Distance: " + Math.round(avgDistance), 10, height - 5)
      text("Time: " + Math.round(avgTime), 10, height - 30)
    }

    textSize(35)

    main.checkGameOver()


    if (booleans.lastCity && timeSinceClick > 5.5) {
      booleans.gameOver = true;
      booleans.scoreToDB = true;
    }
  } else if (booleans.gameOver){
    main.gameOverScore()
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

  fetch("/api", options);

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
  }
}


class Main {
  constructor(inputX, inputY, pinColour) {
    this.inputX = inputX;
    this.inputY = inputY;
    this.pinColour = pinColour;
  }

  //Stuff that is drawn before starting the game
  startMenu() {
    if (booleans.startMenu) {


      fill(0, 0, 0, 220);
      rect(0, 0, width, height);

      fill(150, 150, 150, 150);
      strokeWeight(3);
      stroke(255);
      rect(100, 100, width - 200, height - 200, 5);

      fill(200, 200, 200, 50);
      stroke(0);
      rect(300, 120, width - 600, height - 350, 4);
      

      textSize(40);
      textAlign(CENTER);
      fill(255);
      stroke(0);
      strokeWeight(4);
      text("LEADERBOARD", width / 2, 160);

      //Leaderboard content

      if (booleans.topScoresReady) {
        let i = 170;

        for (let score of topScores) {
          i += 40
          textSize(30)
          text(score.playerName + "  " + score.finalScore, width / 2, i)
        }
      }




    }
  }



  dropInputPin() {
    stroke(this.pinColour);
    fill(this.pinColour)
    ellipse(this.inputX, this.inputY, 20, 20);
  }

  dropCorrectPin(correctX, correctY) {
    yLerped = lerp(yLerped, correctY, 0.1);
    ellipse(correctX, yLerped, 20, 20)
  }

  drawCityNameAndTime() {
    textAlign(LEFT)
    fill(255)
    stroke(255)
    strokeWeight(0)
    textSize(45)
    text(city, 10, 50)
    textSize(35)
    text("Time: " + (answerTime - timeGuessed).toFixed(1), 10, 85)

  }

  drawResult() {
    if (timeSinceClick > 1.5) {
      rectMode(CENTER)
      fill(255, 255, 255, 200)
      stroke(0)
      strokeWeight(3)
      rect(width / 2, height / 2, 500, 200)
      animateRect(4, timeClicked + 1500, width / 2 - 250, width / 2 + 250, height / 2 - 100, height / 2 + 100)


      fill(0)
      strokeWeight(0)
      textAlign(CENTER)
      text("Distance: " + Math.round(distanceKm) + " km", width / 2, height / 2 - 50)
      text("Time: " + timeAnswered.toFixed(2) + " s", width / 2, height / 2)
      text("Score: " + Math.round(score), width / 2, height / 2 + 50)
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

    avgDistance = distanceSum / listLength;
    avgTime = timeSum / listLength;
    avgScore = scoreSum / scores.length;
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
        fill(random(100, 250), 0, 0, 200);
        stroke(255, 0, 0);
        //copy(0, 0, width, height, 0, 0, width + floor(random(5)), height + floor(random(5)))
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
    rectMode(CENTER)
    fill(255, 255, 255, 200)
    stroke(0)
    strokeWeight(3)
    rect(width / 2, height / 2, 500, 200)
    fill(0)
    strokeWeight(0)
    textAlign(CENTER)
    text("ALL DONE!", width / 2, height / 2 - 60)
    text("Average distance: " + Math.round(avgDistance) + " km", width / 2, height / 2 - 10)
    text("Average time: " + avgTime.toFixed(1) + " s", width / 2, height / 2 + 30)
    text("Average score: " + Math.round(avgScore), width / 2, height / 2 + 70)
  }
}


function getData() {
  if (indexes.length > 0) {

    const randomIdx = Math.floor(Math.random() * indexes.length);
    city = cityTable.get(indexes[randomIdx], 0);
    cityY = cityTable.get(indexes[randomIdx], 1);
    cityX = cityTable.get(indexes[randomIdx], 2);

    indexes.splice(randomIdx, 1)
  }
}

function startGame() {
  playerName = nameBox.value()
  if (playerName === "") {
    nameBox.style("border", "2px solid red");
  } else {
    booleans.startMenu = false;
    removeElements()
  }
}

async function getLeaderboard() {
  const response = await fetch("/api");
  topScores = await response.json();
  booleans.topScoresReady = true;
}


//AVERAGE SCORE ON PEKKIS