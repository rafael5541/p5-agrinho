// Código para a câmera e movimento.
// Inspirado por vários projetos do p5js, assistência do Stackoverflow.

// Para object pooling. É uma técnica de otimização.
const objectPool = {
  _pool: [],
  get(x = 0, y = 0, z = 0) {
    let v = this._pool.pop() || new p5.Vector();
    v.set(x, y, z);
    return v;
  },
  release(v) {
    this._pool.push(v);
  },
};

// Classe para câmera.
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
    this.fovAtual = this.fov;
    this.marcarPasso = marcarPassoFn;
    this.ultimoPasso = 0;
    this.intervaloPasso = 500;
    this.direcaoPasso;
    this.indicePasso = 0;
    this.stamina = 100;
    this.staminaMaximo = 100;
    this.staminaRecuperacao = 7;
    this.estaCorrendo = false;
    this.barraStamina = document.getElementById("barra-stamina-fill");
  }

  // Atualiza a rotação da câmera com base no movimento do mouse
  atualizarMouse(mX, mY) {
    this.yaw -= mX * this.sens;
    this.pitch += mY * this.sens;
    this.pitch = constrain(this.pitch, -HALF_PI + 0.01, HALF_PI - 0.01);
  }

  // Código para mover. Sim, o player é so uma câmera flutuante.
  mover() {
    if (dialogoAtivo) return;
    if (menuAtivo) return;
    let frente = objectPool.get(sin(this.yaw), 0, cos(this.yaw));
    let direita = objectPool.get(cos(this.yaw), 0, -sin(this.yaw));
    let direcaoFinal = objectPool.get();

    if (inverterControles) {
      if (keyIsDown(87)) direcaoFinal.sub(frente); // W
      if (keyIsDown(83)) direcaoFinal.add(frente); // S
      if (keyIsDown(65)) direcaoFinal.sub(direita); // A
      if (keyIsDown(68)) direcaoFinal.add(direita); // D
    } else {
      if (keyIsDown(87)) direcaoFinal.add(frente); // W
      if (keyIsDown(83)) direcaoFinal.sub(frente); // S
      if (keyIsDown(65)) direcaoFinal.add(direita); // A
      if (keyIsDown(68)) direcaoFinal.sub(direita); // D
    }

    // Recuperação de stamina
    if (!this.estaCorrendo) {
      this.stamina += this.staminaRecuperacao * (deltaTime / 1000);
      if (this.stamina > this.staminaMaximo) this.stamina = this.staminaMaximo;
    }

    if (this.barraStamina) {
      this.barraStamina.style.width =
        (this.stamina / this.staminaMaximo) * 100 + "%";
    }

    if (direcaoFinal.mag() > 0) {
      direcaoFinal.normalize();

      if (keyIsDown(SHIFT) && this.stamina > 0) {
        this.estaCorrendo = true;
        this.stamina -= 20 * (deltaTime / 1000);
        if (this.stamina <= 0) {
          this.stamina = 0;
          this.estaCorrendo = false;
        }
      } else {
        this.estaCorrendo = false;
      }

      let fatorVelocidade = this.estaCorrendo ? 1.5 : 1;

      if (this.barraStamina) {
        this.barraStamina.style.width =
          (this.stamina / this.staminaMaximo) * 100 + "%";
      }

      let i = (this.pos.x / this.tamanho) | 0;
      let j = (this.pos.z / this.tamanho) | 0;
      let celulaAtual = grade[index(i, j)];

      if (celulaAtual && celulaAtual.temTrap && !celulaAtual.trapDesarmada) {
        fatorVelocidade = 0.15;
        this.intervaloPasso = 800;
      } else if (this.estaCorrendo) {
        this.intervaloPasso = 350;
      } else {
        this.intervaloPasso = 500;
      }

      let speed = this.tamanho * (deltaTime / 1000) * fatorVelocidade;
      let tentativa = objectPool.get();
      tentativa.add(this.pos).add(p5.Vector.mult(direcaoFinal, speed));

      const buffer = 3;

      // Colisão. É bem simples, mais funciona.
      let iTent = floor(
        (tentativa.x + buffer * Math.sign(direcaoFinal.x)) / this.tamanho
      );
      let jTent = floor(
        (tentativa.z + buffer * Math.sign(direcaoFinal.z)) / this.tamanho
      );

      if (index(iTent, jTent) < 0) {
        objectPool.release(frente);
        objectPool.release(direita);
        objectPool.release(direcaoFinal);
        objectPool.release(tentativa);
        return;
      }

      if (iTent > i) {
        if (!celulaAtual.temParedeEm("direita")) {
          this.pos.x = tentativa.x;
        }
      } else if (iTent < i) {
        let celulaEsquerda = grade[index(iTent, j)];
        if (
          (celulaEsquerda && !celulaEsquerda.temParedeEm("direita")) ||
          (!celulaEsquerda && !celulaAtual.temParedeEm("esquerda"))
        ) {
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

      // Marca os passos.
      let iAtual = floor(this.pos.x / this.tamanho);
      let jAtual = floor(this.pos.z / this.tamanho);
      this.marcarPasso(iAtual, jAtual);
      checarIrrigadorNaPosicao(iAtual, jAtual);
      if (millis() - this.ultimoPasso > this.intervaloPasso) {
        tocarSom(passosBuffers[this.indicePasso]);
        this.ultimoPasso = millis();
        this.indicePasso = (this.indicePasso + 1) % passosBuffers.length;
      }

      objectPool.release(tentativa);
    }

    // libera vetores usados
    objectPool.release(frente);
    objectPool.release(direita);
    objectPool.release(direcaoFinal);
  }

  // Aplica a câmera.
  aplicar() {
    let alvoFov = this.estaCorrendo ? this.fov + radians(15) : this.fov;

    this.fovAtual = lerp(this.fovAtual, alvoFov, 0.1);
    perspective(this.fovAtual, width / height, 0.5, 1000);

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

  // Funções para conseguir desarmar/regar, quando usa o mouse perto da armadilha/planta
  desarmarTrapComMouse() {
    let iAtual = floor(this.pos.x / this.tamanho);
    let jAtual = floor(this.pos.z / this.tamanho);
    let celulaAtual = grade[index(iAtual, jAtual)];
    if (celulaAtual) celulaAtual.desarmarTrap();
  }

  regarPlantaComMouse() {
    let iAtual = floor(this.pos.x / this.tamanho);
    let jAtual = floor(this.pos.z / this.tamanho);
    let celulaAtual = grade[index(iAtual, jAtual)];
    if (celulaAtual && celulaAtual.regarPlanta()) {
      this.stamina = this.staminaMaximo;
      if (this.barraStamina) {
        this.barraStamina.style.width = "100%";
      }
    }
  }
}
