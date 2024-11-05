const KEYS = {};
const SETTINGS = {
  numRocks:10,
  worldWidth: 8000,
  worldHeight: 8000,
  margin: 100,
  rotSpeed: 0.1,
  rotSpeedWheel: 0.002,
  //multiplier for fine control
  get mult() {
    return KEYS["s"] ? 0.1 : 1;
  },
};

let rocks = new Map();
let rockCounter = 0;
let world, windowPos, mousePrev, selectedRock, canvasGrabbed;

function setup() {
  createCanvas(windowWidth, windowHeight);
  world = createGraphics(SETTINGS.worldWidth, SETTINGS.worldHeight);
  world.colorMode(HSL);
  world.noStroke();
  world.fill(240, 8, 75);
  let c = createVector(world.width / 2, world.height / 2)
  // MAKE ROCKS
  for (let i = 0; i < SETTINGS.numRocks; i++) {
    rocks.set(rockCounter++, new Rock(world, createVector(random(c.x - width / 2 + SETTINGS.margin, c.x + width / 2 - SETTINGS.margin), random(c.y - height / 2 + SETTINGS.margin, c.y + height / 2 - SETTINGS.margin))));
  }
  mousePrev = createVector();
  windowPos = createVector(c.x - width / 2, c.y - height / 2);
}

function draw() {
  getInput();
  world.background(240, 2, 95);
  world.fill(240, 8, 75);
  rocks.forEach(rock => rock.draw());
  if (selectedRock) {
    let overlapping = selectedRock.checkOverlap(rocks);
    if (overlapping) {
      world.fill(355, 100, 50, 0.5);
      overlapping.forEach(rock => rock.draw());
    }
  }
  image(world, 0, 0, width, height, windowPos.x, windowPos.y, width, height);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function getInput() {
  if (selectedRock) {
    if (KEYS["a"]) {
      selectedRock.rotate(-SETTINGS.rotSpeed * SETTINGS.mult);
    }
    if (KEYS["d"]) {
      selectedRock.rotate(SETTINGS.rotSpeed * SETTINGS.mult);
    }
  } 
}

document.addEventListener("keydown", e => KEYS[e.key] = true);
document.addEventListener("keyup", e => KEYS[e.key] = false);
document.addEventListener("mousedown", e => KEYS["m" + e.button] = true);
document.addEventListener("mouseup", e => { KEYS["m" + e.button] = false; canvasGrabbed = false });
document.addEventListener("contextmenu", e => e.preventDefault());
document.addEventListener("mousedown", e => { handleMouseDown(e) });
document.addEventListener("mousemove", e => { handleMouseMove(e) });
document.addEventListener("wheel", e => { handleWheel(e) }, { passive: false });

function handleWheel(e) {
  e.preventDefault();
  if (selectedRock) {
    // ROTATE WHEEL
    selectedRock.rotate(e.deltaY * SETTINGS.rotSpeedWheel * SETTINGS.mult);
  }
  if (!selectedRock) {
    // MOVE WINDOW
    windowPos.x = constrain(windowPos.x + e.deltaX, 0, world.width - width);
    windowPos.y = constrain(windowPos.y + e.deltaY, 0, world.width - height);
  }
}
function handleMouseMove(e) {
  let delta = createVector(e.clientX, e.clientY).sub(mousePrev);
  if (selectedRock) {
    // MOVE ROCK
    selectedRock.move(delta);
  } else if (KEYS["m0"] && canvasGrabbed) {
    // MOVE WINDOW
    windowPos.x = constrain(windowPos.x - delta.x, 0, world.width - width);
    windowPos.y = constrain(windowPos.y - delta.y, 0, world.width - height);
  }
  mousePrev = createVector(e.clientX, e.clientY);
}
function handleMouseDown(e) {
  if (e.button == 0) {
    if (selectedRock) {
      // PLACE ROCK
      if (!selectedRock.checkOverlap(rocks)) {
        selectedRock = null;
        return;
      }
    }
    if (!selectedRock) {
      // PICK ROCK
      for (let rock of rocks.values()) {
        if (rock.collidePoint(createVector(mouseX + windowPos.x, mouseY + windowPos.y))) {
          selectedRock = rock;
          return;
        }
      }
      canvasGrabbed = true;
    }
  }
  if (e.button == 2) {
    // DELETE ROCK IF CLICKED
    if (!selectedRock) {
      for (let [i, rock] of rocks) {
        if (rock.collidePoint(createVector(mouseX + windowPos.x, mouseY + windowPos.y))) {
          (rocks.delete(i))
          return;
        }
      }
      // OTHERWISE ADD NEW ROCK IF NO ROCK CLICKED
      rocks.set(rockCounter++, new Rock(world, createVector(mouseX + windowPos.x, mouseY + windowPos.y)));
    }
  }
}