class Rock {
  constructor(canvas,pos) {
    this.pos = pos || createVector(0, 0);
    this.minPoints = 5;
    this.maxPoints = 12;
    this.minRadius = 30;
    this.maxRadius = 100;
    this.numPoints = Math.random() * (this.maxPoints - this.minPoints) + this.minPoints;
    this.radius = Math.random() * (this.maxRadius - this.minRadius) + this.minRadius;
    this.points = [];
    this.rot = 0;
    this.canvas = canvas
    this.createPoints();
  }
  createPoints() {
    for (let i = 0; i < this.numPoints; i++) {
      let angle = Math.random() * Math.PI * 2;
      this.points.push(createVector(Math.cos(angle) * this.radius, Math.sin(angle) * this.radius));
    }
    let c = this.center;
    // sort clockwise
    this.points.sort((a, b) => Math.atan2(b.y - c.y, b.x - c.x) - Math.atan2(a.y - c.y, a.x - c.x));
    this.updateGlobalPoints();
  }

  get center() {
    let cx = this.points.map((p) => p.x).reduce((a, b) => a + b, 0) / this.points.length;
    let cy = this.points.map((p) => p.y).reduce((a, b) => a + b, 0) / this.points.length;
    return createVector(cx, cy);
  }

  collidePoint(mouseVec) {
    return collidePointPoly(mouseVec.x, mouseVec.y, this.globalPoints);
  }
  checkOverlap(rockArr) {
    // check for collision
    let res = [];
    for (let [id, other] of rockArr) {
      if (other !== this) {
        // if lines collide
        if (collidePolyPoly(this.globalPoints, other.globalPoints)) {
          res.push(...[this, other]);
        }
        // if this is entirely inside another
        for (let point of this.globalPoints) {
          if (collidePointPoly(point.x, point.y, other.globalPoints)) {
            res.push(...[this, other]);
          }
        }
        // if another is entirely inside this
        for (let point of other.globalPoints) {
          if (collidePointPoly(point.x, point.y, this.globalPoints)) {
            res.push(...[this, other]);
          }
        }
      }
    }
    return res.length ? [...new Set(res)] : false;
  }

  draw(s = 1) {
    this.canvas.beginShape();
    this.globalPoints.forEach((p) => this.canvas.vertex(p.x, p.y));
    this.canvas.endShape(CLOSE);
  }

  move(mouseDeltaVec) {
    // let mouseDelta = createVector(mouseX - pmouseX, mouseY - pmouseY);
    this.pos = p5.Vector.add(this.pos, mouseDeltaVec);
    this.updateGlobalPoints();
  }

  rotate(angle) {
    this.rot += angle;
    this.updateGlobalPoints();
  }

  updateGlobalPoints(scale = 1) {
    let c = this.center;
    this.globalPoints = this.points.map((p) => p5.Vector.sub(p, c).rotate(this.rot).mult(scale).add(this.pos).add(c));
  }
}
