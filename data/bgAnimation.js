let bgIndexes = [];
let droppers = [];
let mouseVect;

class DropAnimation {
  constructor(x, y) {
    this.position = createVector(y, x);
    this.velocity = p5.Vector.random2D(5, 5);
    this.acceleration = createVector(0, 0);
    this.spawnX = x;
    this.spawnY = y;
    this.start = random(10);
    this.width = 250;
    this.speed = random(0.5, 5);
    this.speedMultiplier = 1;
    this.trailPoints = [];
    this.color = color(random(120), 100, 100, 0.7)
    this.distance = 0;

    this.maxVelocity = random(3, 10);
  }


  display() {
    if (timeRunning / 1000 > this.start) {
      this.drop()
    }

    if (this.width < 10.1) {
      this.shoot();
      this.chase();
    }
  }


  drop() {
      this.width = lerp(this.width, 10, 0.05);
      fill(this.color);
      noStroke();
      ellipse(this.position.x, this.position.y, this.width, this.width);
  }

  chase() {
    this.acceleration = p5.Vector.sub(mouseVect, this.position)

    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxVelocity);
    this.position.add(this.velocity);

    this.distance = dist(this.position.x, this.position.y, mouseX, mouseY)
    
    this.color = color(100, 100, 40, 0.7)
    if (this.distance < 500) {
      colorMode(HSL);
      this.color = color(map(this.distance, 0, 500, 0, 100), 100, 50, 0.7)
    }
    
    if (this.distance < 5) {
      this.position.y = this.spawnX;
      this.position.x = this.spawnY;
    }
  }

  shoot() {
    fill(map(this.distance, 0, 150, 0, 120));
    ellipse(this.spawnY, this.spawnX, 7, 7);
  }


}

function animationInit() {
  colorMode(HSB);
  for (let i = 0; i < cityTable.getRowCount(); i++) {
    bgIndexes.push(i);
  }

  let len = bgIndexes.length;

  for (let j = 0; j < len; j++) {
    const cityY = cityTable.get(j, 1);
    const cityX = cityTable.get(j, 2);
    const pixelX = map(cityX, extent.north, extent.south, 0, height);
    const pixelY = map(cityY, extent.west, extent.east, 0, width);
    const dropper = new DropAnimation(pixelX, pixelY);
    droppers.push(dropper);
  }
  colorMode(RGB);
}