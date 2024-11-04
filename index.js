const KEY_ROTATION = 0.1;
const KEY_ROTATION_FINE = 0.01;
const MOUSE_ROTATION = 0.003;
const MOUSE_ROTATION_FINE = 0.0005;
const KEY_FINE = 83; //s key
const MAX_ROTATION_SPEED = 200;

const keys = {};
let buffer,windowPos,mousePrev;


let rocks = new Map();
let selectedRock = null;

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  buffer = createGraphics(10000,10000);
  buffer.colorMode(HSL);
  buffer.noStroke();
  windowPos = createVector()
  mousePrev = createVector()
  // MAKE ROCKS
  for (let i = 0; i < 10; i++) {
    rocks.set(i, new Rock(buffer,createVector(random(width), random(height))));
  }
  
}

function draw() {
  fill(0,0,0)
  buffer.clear()
  buffer.background(240, 2, 95);
  getInput();
  // draw base rock
  buffer.fill(240, 8, 75);
  rocks.forEach((rock) => rock.draw());
  // draw selected rock
  if (selectedRock) {
    // draw overlapping rocks
    let overlapping = selectedRock.checkOverlap(rocks);
    if (overlapping) {
      buffer.fill("red");
      overlapping.forEach((rock) => rock.draw());
    }
  }
  image(buffer,0,0,width,height,windowPos.x,windowPos.y,width,height)
}

function mouseWheel(event) {
  if (!selectedRock) return false;
  let angle = constrain(event.delta, -MAX_ROTATION_SPEED, MAX_ROTATION_SPEED);
  selectedRock.rotate(angle * (keyIsDown(KEY_FINE) ? MOUSE_ROTATION_FINE : MOUSE_ROTATION));
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function getInput() {
  if (keys["a"] && selectedRock) {
    keys["s"] ? selectedRock.rotate(-KEY_ROTATION_FINE) : selectedRock.rotate(-KEY_ROTATION);
  }
  if (keys["d"] && selectedRock) {
    keys["s"] ? selectedRock.rotate(KEY_ROTATION_FINE) : selectedRock.rotate(KEY_ROTATION);
  }
}


document.addEventListener("keydown", (e) => keys[e.key] = true);
document.addEventListener("keyup", (e) => keys[e.key] = false);
document.addEventListener("contextmenu", (event) => {event.preventDefault();});
document.addEventListener("mouseup",e=> keys['m'+ e.button] = false)
document.addEventListener("mousedown", (event) => {
  switch (event.button) {
    case 0:
      keys['m'+ event.button] = true
      if (selectedRock) {
        if (!selectedRock.checkOverlap(rocks)) {
          selectedRock = null;
        }
      } else {
        for (let [i, rock] of rocks) {
          if (rock.collidePoint(createVector(mouseX+windowPos.x, mouseY+windowPos.y))) {
            selectedRock = rock;
            return
          }
        }
        console.log('canvas click')
      }
      break;
    case 1:
      keys['m'+ event.button] = true
      console.log("Middle mouse button clicked");
      break;
    case 2:
      keys['m'+ event.button] = true
      if (selectedRock){return}
      rocks.set(rocks.size, new Rock(buffer,createVector(mouseX+windowPos.x, mouseY+windowPos.y)));
      selectedRock = rocks.get(rocks.size-1)
      event.preventDefault(); // Prevent the default context menu
      break;
    default:
      console.log("Unknown mouse button clicked");
  }
});


document.addEventListener("mousemove", (e) => {
  let delta = createVector(e.clientX,e.clientY).sub(mousePrev)
  if(selectedRock){
    selectedRock.move(delta); 
  } else if (keys['m0']){
    windowPos.x = constrain(windowPos.x - delta.x,0,buffer.width - width)
    windowPos.y = constrain(windowPos.y - delta.y,0,buffer.width - height)
  }



  mousePrev = createVector(e.clientX,e.clientY)
});