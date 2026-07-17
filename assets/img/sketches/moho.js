// moho.js — simulación de moho fisarum (physarum), en modo instancia de p5
// adaptado de mold.js + sketch.js para vivir embebido dentro del portfolio.
// cada agente sensa 3 puntos (izq / centro / der) sobre el rastro que va
// dejando la propia simulación y gira hacia donde hay más luz.

function moldSketchFactory(holderId) {
  return function (p) {
    let molds = [];
    let num;
    let d;
    let canvasSize;
    let paused = false;

    class Mold {
      constructor() {
        this.x = p.random(canvasSize);
        this.y = p.random(canvasSize);
        this.r = 0.5;

        this.heading = p.random(360);
        this.vx = p.cos(this.heading);
        this.vy = p.sin(this.heading);
        this.rotAngle = 45;

        // posiciones de los 3 sensores
        this.rSensorPos = p.createVector(0, 0);
        this.lSensorPos = p.createVector(0, 0);
        this.fSensorPos = p.createVector(0, 0);
        this.sensorAngle = 45;
        this.sensorDist = 10;
      }

      update() {
        this.vx = p.cos(this.heading);
        this.vy = p.sin(this.heading);

        // wrap-around con módulo, igual que el original
        this.x = (this.x + this.vx + canvasSize) % canvasSize;
        this.y = (this.y + this.vy + canvasSize) % canvasSize;

        this.getSensorPos(this.rSensorPos, this.heading + this.sensorAngle);
        this.getSensorPos(this.lSensorPos, this.heading - this.sensorAngle);
        this.getSensorPos(this.fSensorPos, this.heading);

        const r = this.sample(this.rSensorPos);
        const l = this.sample(this.lSensorPos);
        const f = this.sample(this.fSensorPos);

        if (f > l && f > r) {
          this.heading += 0;
        } else if (f < l && f < r) {
          this.heading += p.random(1) < 0.5 ? this.rotAngle : -this.rotAngle;
        } else if (l > r) {
          this.heading += -this.rotAngle;
        } else if (r > l) {
          this.heading += this.rotAngle;
        }
      }

      sample(pos) {
        const index =
          4 * (d * Math.floor(pos.y)) * (d * canvasSize) +
          4 * (d * Math.floor(pos.x));
        return p.pixels[index] || 0;
      }

      display() {
        p.noStroke();
        p.fill(250, 20, 50);
        p.ellipse(this.x, this.y, this.r * 2, this.r * 2);
      }

      getSensorPos(sensor, angle) {
        sensor.x = (this.x + this.sensorDist * p.cos(angle) + canvasSize) % canvasSize;
        sensor.y = (this.y + this.sensorDist * p.sin(angle) + canvasSize) % canvasSize;
      }
    }

    p.setup = function () {
      const holder = document.getElementById(holderId);
      const holderWidth = holder ? holder.offsetWidth : 400;
      canvasSize = Math.max(220, Math.min(holderWidth, 480));

      const cnv = p.createCanvas(canvasSize, canvasSize);
      if (holder) cnv.parent(holder);

      p.angleMode(p.DEGREES);
      p.pixelDensity(1); // fija densidad para que la fórmula de índice de píxel sea predecible
      d = p.pixelDensity();

      // cantidad de agentes escalada al tamaño real del canvas
      num = Math.min(3500, Math.floor((canvasSize * canvasSize) / 45));
      for (let i = 0; i < num; i++) {
        molds.push(new Mold());
      }
      p.background(0);
    };

    p.draw = function () {
      p.background(0, 5);
      p.loadPixels();
      for (let i = 0; i < num; i++) {
        molds[i].update();
        molds[i].display();
      }
    };

    // clic sobre el lienzo: pausa / reanuda la simulación
    p.mousePressed = function () {
      const inCanvas =
        p.mouseX >= 0 && p.mouseX <= canvasSize && p.mouseY >= 0 && p.mouseY <= canvasSize;
      if (!inCanvas) return;
      paused = !paused;
      if (paused) {
        p.noLoop();
      } else {
        p.loop();
      }
    };
  };
}
