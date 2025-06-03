class Drone {
  constructor(x, z) {
    this.x = x;
    this.z = z;
    this.y = -100;
    this.dirX = random([-1, 1]) * random(0.5, 1);
    this.dirZ = random([-1, 1]) * random(0.5, 1);
    this.vel = random(0.3, 0.8);
  }

  atualizar() {
    this.x += this.dirX * this.vel;
    this.z += this.dirZ * this.vel;

    if (this.x < 0 || this.x > colunas * tamanho) this.dirX *= -1;
    if (this.z < 0 || this.z > linhas * tamanho) this.dirZ *= -1;
  }

  mostrar() {
    push();
    translate(this.x, this.y, this.z);
    rotateX(HALF_PI);
    noStroke();
    texture(imgDrone);
    plane(tamanho * 0.5, tamanho * 0.2);
    pop();
  }
}
