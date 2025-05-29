// Código para a câmera e movimento.
// Inspirado por vários projetos do p5js, assistência do Stackoverflow.

class Camera {
  constructor(
    x,
    y,
    z,
    sens = 0.002,
    tamanhoCelula = 30,
    marcarPassoFn = () => {}
  ) {
    this.pos = createVector(x, y, z);
    this.yaw = 0;
    this.pitch = 0;
    this.sens = sens;
    this.velocidadeBase = 0.07;
    this.tamanho = tamanhoCelula;
    this.fov = radians(120);
    this.marcarPasso = marcarPassoFn;
    this.ultimoPasso = 0;
    this.intervaloPasso = 500;
    this.direcaoPasso;
    this.indicePasso = 0;
  }

  atualizarMouse(mX, mY) {
    this.yaw -= mX * this.sens;
    this.pitch += mY * this.sens;
    this.pitch = constrain(this.pitch, -HALF_PI + 0.01, HALF_PI - 0.01);
  }
  mover() {
    let frente = createVector(sin(this.yaw), 0, cos(this.yaw));
    let direita = createVector(cos(this.yaw), 0, -sin(this.yaw));
    let direcaoFinal = createVector();

    if (keyIsDown(87)) direcaoFinal.add(frente); // W
    if (keyIsDown(83)) direcaoFinal.sub(frente); // S
    if (keyIsDown(65)) direcaoFinal.add(direita); // A
    if (keyIsDown(68)) direcaoFinal.sub(direita); // D

    if (direcaoFinal.mag() > 0) {
      direcaoFinal.normalize();
      let fatorVelocidade = 1;

      let i = floor(this.pos.x / this.tamanho);
      let j = floor(this.pos.z / this.tamanho);
      let celulaAtual = grade[index(i, j)];

      if (celulaAtual && celulaAtual.temTrap && !celulaAtual.trapDesarmada) {
        fatorVelocidade = 0.15;
        this.intervaloPasso = 800;
      } else {
        this.intervaloPasso = 500;
      }

      let speed = this.tamanho * (deltaTime / 1000) * fatorVelocidade;
      let tentativa = p5.Vector.add(
        this.pos,
        p5.Vector.mult(direcaoFinal, speed)
      );

      // Colisão feita por mim, com assistência de vídeos do YouTube.
      const buffer = 2;
      let iTent = floor(
        (tentativa.x + buffer * Math.sign(direcaoFinal.x)) / this.tamanho
      );
      let jTent = floor(
        (tentativa.z + buffer * Math.sign(direcaoFinal.z)) / this.tamanho
      );

      if (index(iTent, jTent) < 0) {
        return;
      }

      if (iTent > i) {
        if (!celulaAtual.temParedeEm("direita")) {
          this.pos.x = tentativa.x;
        }
      } else if (iTent < i) {
        let celulaEsquerda = grade[index(iTent, j)];
        if (celulaEsquerda && !celulaEsquerda.temParedeEm("direita")) {
          this.pos.x = tentativa.x;
        }
      } else {
        this.pos.x = tentativa.x;
      }

      if (jTent > j) {
        if (!celulaAtual.temParedeEm("baixo")) {
          this.pos.z = tentativa.z;
        }
      } else if (jTent < j) {
        let celulaCima = grade[index(i, jTent)];
        if (celulaCima && !celulaCima.temParedeEm("baixo")) {
          this.pos.z = tentativa.z;
        }
      } else {
        this.pos.z = tentativa.z;
      }

      let iAtual = floor(this.pos.x / this.tamanho);
      let jAtual = floor(this.pos.z / this.tamanho);
      this.marcarPasso(iAtual, jAtual);
      if (millis() - this.ultimoPasso > this.intervaloPasso) {
        let som = sonsPasso[this.indicePasso];
        if (!som.isPlaying()) {
          som.play();
          this.ultimoPasso = millis();
          this.indicePasso = (this.indicePasso + 1) % sonsPasso.length;
        }
      }
    }
    // código noclip, para testar.
    if (noclip) {
      let frente = createVector(sin(this.yaw), 0, cos(this.yaw));
      let direita = createVector(cos(this.yaw), 0, -sin(this.yaw));
      let direcaoFinal = createVector();

      if (keyIsDown(87)) direcaoFinal.add(frente); // W
      if (keyIsDown(83)) direcaoFinal.sub(frente); // S
      if (keyIsDown(65)) direcaoFinal.add(direita); // A
      if (keyIsDown(68)) direcaoFinal.sub(direita); // D

      if (keyIsDown(32)) direcaoFinal.y -= 1;
      if (keyIsDown(SHIFT)) direcaoFinal.y += 1;

      if (direcaoFinal.mag() > 0) {
        direcaoFinal.normalize();
        let speed = this.tamanho * (deltaTime / 1000) * 3;
        let tentativa = p5.Vector.add(
          this.pos,
          p5.Vector.mult(direcaoFinal, speed)
        );

        this.pos.set(tentativa);
      }

      return;
    }
  }

  aplicar() {
    perspective(this.fov, width / height, 0.5, 1000);

    let dirX = cos(this.pitch) * sin(this.yaw);
    let dirY = sin(this.pitch);
    let dirZ = cos(this.pitch) * cos(this.yaw);
    camera(
      this.pos.x,
      this.pos.y,
      this.pos.z,
      this.pos.x + dirX,
      this.pos.y + dirY,
      this.pos.z + dirZ,
      0,
      1,
      0
    );
  }
  desarmarTrapComMouse() {
    let iAtual = floor(this.pos.x / this.tamanho);
    let jAtual = floor(this.pos.z / this.tamanho);
    let celulaAtual = grade[index(iAtual, jAtual)];
    if (celulaAtual) celulaAtual.desarmarTrap();
  }
}
