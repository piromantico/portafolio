// Simulación de moho fisarum (physarum) — modo instancia de p5.js
// holderId: el id del <div> donde se va a montar el canvas
function moldSketchFactory(holderId){
  return function(sk){

    let molds = [];
    let num = 2500; // bajado de 4000 a 2500 para rendir mejor en celulares
    let d;

    class Mold {
      constructor(){
        this.x = sk.random(sk.width);
        this.y = sk.random(sk.height);
        this.r = 0.5;

        this.heading = sk.random(360);
        this.vx = sk.cos(this.heading);
        this.vy = sk.sin(this.heading);
        this.rotAngle = 45;
        this.stop = false; // controla si el moho deja de moverse

        // Sensores
        this.rSensorPos = sk.createVector(0, 0);
        this.lSensorPos = sk.createVector(0, 0);
        this.fSensorPos = sk.createVector(0, 0);
        this.sensorAngle = 45;
        this.sensorDist = 10;
      }

      update(){
        if(this.stop){
          this.vx = 0;
          this.vy = 0;
        } else {
          this.vx = sk.cos(this.heading);
          this.vy = sk.sin(this.heading);
        }

        // Modulo para envolver en los bordes del canvas
        this.x = (this.x + this.vx + sk.width) % sk.width;
        this.y = (this.y + this.vy + sk.height) % sk.height;

        // Posiciones de los 3 sensores según posición y dirección actual
        this.getSensorPos(this.rSensorPos, this.heading + this.sensorAngle);
        this.getSensorPos(this.lSensorPos, this.heading - this.sensorAngle);
        this.getSensorPos(this.fSensorPos, this.heading);

        // Leer valores de color en cada sensor desde el array de píxeles
        let index, l, r, f;
        index = 4 * (d * sk.floor(this.rSensorPos.y)) * (d * sk.width) + 4 * (d * sk.floor(this.rSensorPos.x));
        r = sk.pixels[index];

        index = 4 * (d * sk.floor(this.lSensorPos.y)) * (d * sk.width) + 4 * (d * sk.floor(this.lSensorPos.x));
        l = sk.pixels[index];

        index = 4 * (d * sk.floor(this.fSensorPos.y)) * (d * sk.width) + 4 * (d * sk.floor(this.fSensorPos.x));
        f = sk.pixels[index];

        // Comparar f, l, r para decidir el giro
        if (f > l && f > r) {
          this.heading += 0;
        } else if (f < l && f < r) {
          if (sk.random(1) < 0.5) {
            this.heading += this.rotAngle;
          } else {
            this.heading -= this.rotAngle;
          }
        } else if (l > r) {
          this.heading += -this.rotAngle;
        } else if (r > l) {
          this.heading += this.rotAngle;
        }
      }

      display(){
        sk.noStroke();
        sk.fill(255);
        sk.ellipse(this.x, this.y, this.r * 2, this.r * 2);
      }

      getSensorPos(sensor, angle){
        sensor.x = (this.x + this.sensorDist * sk.cos(angle) + sk.width) % sk.width;
        sensor.y = (this.y + this.sensorDist * sk.sin(angle) + sk.height) % sk.height;
      }
    }

    sk.setup = function(){
      const holder = document.getElementById(holderId);
      const size = Math.min(holder.clientWidth, 500);
      const c = sk.createCanvas(size, size);
      c.parent(holder);
      sk.angleMode(sk.DEGREES);
      d = sk.pixelDensity();

      for(let i = 0; i < num; i++){
        molds[i] = new Mold();
      }
    };

    sk.draw = function(){
      sk.background(0, 5);
      sk.loadPixels();

      for(let i = 0; i < num; i++){
        if(sk.key === 's'){ // tecla "s" congela el patrón (solo teclado físico)
          molds[i].stop = true;
          sk.updatePixels();
          sk.noLoop();
        } else {
          molds[i].stop = false;
        }
        molds[i].update();
        molds[i].display();
      }
    };

    sk.windowResized = function(){
      const holder = document.getElementById(holderId);
      if(holder){
        const size = Math.min(holder.clientWidth, 500);
        sk.resizeCanvas(size, size);
      }
    };
  };
}
