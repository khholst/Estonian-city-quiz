let font;
//let mouseVect;
let vehicles = [];


/* function setup() {
  let points = font.textToPoints("Leaderboard", 15, 200, 160)
  
  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    let vehicle = new Mover(pt.x, pt.y);
    vehicles.push(vehicle);
  }    
}

function draw() {
  background(50);
  
  for (let i = 0; i < vehicles.length; i++) {
    let vehicle = vehicles[i];
    vehicle.applyBehavior();
    vehicle.updatePosition();
    vehicle.show();
  }


} */


class Mover {
  constructor(x, y, content) {
    this.position = createVector(random(width), random(height));
    this.velocity = p5.Vector.random2D();
    this.acceleration = createVector();
    this.target = createVector(x, y);
    this.content = content;
    this.radius = 3;
    this.maxSpeed = 10;
    this.maxForce = 1;
    this.bounce = 10;
    this.fill = map(this.target.x, 0, width, 0, 120)
  }
  
  style() {
    if (this.content === "header") {
      this.radius = 5;
    } else if (this.content === "content") {
      this.radius = 3;
    }
  }



  updatePosition() {
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration)
    
    this.acceleration.mult(0);
  }
  
  applyBehavior() {
    let seek = this.arrive(this.target);
    
    mouseVect = createVector(mouseX, mouseY);
    let flee = this.flee(mouseVect);
    this.applyForce(seek);
    this.applyForce(flee);
    
  }
  
  applyForce(force) {
    this.acceleration.add(force);
  }
  
  
  flee() {
    let roadHome = p5.Vector.sub(mouseVect, this.position);
    let distance = roadHome.mag();
        
    
    
    if (distance < 75) {
      roadHome.setMag(this.bounce);
      roadHome.mult(-1);
      let goHome = p5.Vector.sub(roadHome, this.velocity);
      
      return goHome;
    }
  }
  
  
  arrive() {
    let roadHome = p5.Vector.sub(this.target, this.position);
    let distance = roadHome.mag();
    let velocity = this.maxSpeed;
    
    if (distance < 150) {
      velocity = map(distance, 0, 150, 0, this.maxSpeed)
    }
    roadHome.setMag(velocity);
    
    let goHome = p5.Vector.sub(roadHome, this.velocity);
    goHome.limit(this.maxForce);
    return goHome;
  }
  

  show() {
    colorMode(HSL);
    this.style();
    let distance = dist(this.target.x, this.target.y, this.position.x, this.position.y);
    let radius = map(distance, 0, 300, this.radius, 0)
    fill(this.fill, 100, 50);
    noStroke();
    ellipse(this.position.x, this.position.y, radius, radius);
    colorMode(RGB);
  }
}