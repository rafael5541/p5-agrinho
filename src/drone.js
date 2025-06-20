// Faz os drones. Por enquanto, é so decoração. talvez eu faça esses drones fazer alguma coisa em um level.

class Drone {
  constructor(x, z) {
    this.x = x;
    this.z = z;
    this.y = -100;
    this.dirX = random([-1, 1]) * random(0.5, 1);
    this.dirZ = random([-1, 1]) * random(0.5, 1);
    this.vel = random(0.3, 0.8);
    this.visivel = true;
  }

  atualizar(cam) {
    if (frameCount % 3 !== 0) return;

    const dx = abs(this.x - cam.pos.x);
    const dz = abs(this.z - cam.pos.z);
    if (dx < 800 && dz < 800) {
      this.x += this.dirX * this.vel;
      this.z += this.dirZ * this.vel;
      if (this.x < 0 || this.x > colunas * tamanho) this.dirX *= -1;
      if (this.z < 0 || this.z > linhas * tamanho) this.dirZ *= -1;
      this.visivel = true;
    } else {
      this.visivel = false;
    }
  }

  mostrar() {
    if (!this.visivel) return;

    push();
    translate(this.x, this.y, this.z);
    noStroke();
    rotateX(-HALF_PI);
    texture(imgDrone);
    plane(tamanho * 0.5, tamanho * 0.2);
    pop();
  }
}
