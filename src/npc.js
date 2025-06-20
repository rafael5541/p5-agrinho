function preloadNPC() {
  fonte = loadFont(
    "https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Regular.otf"
  );
  imgNpc1 = loadImage("assets/fazendeiro1.png");
  imgNpc1_falando = loadImage("assets/fazendeiro1_falando.png");
  imgNpc2 = loadImage("assets/fazendeiro2.png");
  imgNpc2_falando = loadImage("assets/fazendeiro2_falando.png");
  imgNpc3 = loadImage("assets/fazendeiro3.png");
}

let dialogoAtivo;

// Classe para os NPCs.
class NPC {
  constructor(i, j, spriteOrSprites, falas, somLetraBuffer, rotY) {
    this.i = i;
    this.j = j;
    // Pode especificar um array de sprites, para ter um sprite de fala tbm.
    if (Array.isArray(spriteOrSprites)) {
      this.sprites = spriteOrSprites;
      this.spriteAtualIndex = 0;
    } else {
      this.sprites = [spriteOrSprites];
      this.spriteAtualIndex = 0;
    }
    this.falas = falas;
    this.somLetraBuffer = somLetraBuffer;

    this.falaAtual = 0;
    this.dialogoAberto = false;
    dialogoAtivo = false;

    this.spriteAtualIndex = 0;
    this.spriteAnimIntervalo = null;

    this.caixaDialogo = document.getElementById("dialog-box");
    this.textoDialogo = document.getElementById("dialog-text");
    this.botaoProximo = document.getElementById("dialog-next");
    this.botaoFechar = document.getElementById("dialog-close");

    this.indiceDigitando = 0;
    this.intervaloDigitando = null;
    this.textoCompleto = "";
    this.estaDigitando = false;
    this.estavaTravadoAntes = false;

    this.rotY = rotY;

    this.botaoProximo.onclick = () => this.proximo();
    this.botaoFechar.onclick = () => this.fecharDialogo();
    textFont(fonte);
  }

  desenhar(tamanho) {
    if (!this.sprites || this.sprites.length === 0) return;

    const x = this.i * tamanho + tamanho / 2;
    const z = this.j * tamanho + tamanho / 2;

    push();
    translate(x, tamanho / 6, z);
    rotateY(this.rotY);
    texture(this.sprites[this.spriteAtualIndex]);
    noStroke();
    plane(tamanho * 0.5, tamanho * 0.8);
    pop();
  }

  iniciarAnimacaoFala(cooldown = 200) {
    if (this.sprites.length <= 1) return;
    if (this.spriteAnimInterval) clearInterval(this.spriteAnimInterval);
    this.spriteAtualIndex = 0;
    this.spriteAnimInterval = setInterval(() => {
      this.spriteAtualIndex = (this.spriteAtualIndex + 1) % this.sprites.length;
    }, cooldown);
  }

  pararAnimacaoFala() {
    if (this.spriteAnimInterval) {
      clearInterval(this.spriteAnimInterval);
      this.spriteAnimInterval = null;
    }
    this.spriteAtualIndex = 0;
  }

  // Abre o diálogo, que está definido no HTML.
  abrirDialogo() {
    if (!this.falas.length) return;

    this.dialogoAberto = true;
    dialogoAtivo = true;
    this.falaAtual = 0;
    this.mostrarFalaDigitando();

    this.iniciarAnimacaoFala(150);

    this.caixaDialogo.style.display = "block";

    timerAtivo = false;

    if (document.pointerLockElement && this.dialogoAberto) {
      document.exitPointerLock();
    }
  }

  // Mostra a fala, como se fosse Undertale, onde cada letra aparece com um certo delay.
  mostrarFalaDigitando() {
    this.textoCompleto = this.falas[this.falaAtual];
    this.textoDialogo.innerHTML = "";
    this.indiceDigitando = 0;
    this.estaDigitando = true;

    this.iniciarAnimacaoFala(150);

    if (this.intervaloDigitando) clearInterval(this.intervaloDigitando);

    this.intervaloDigitando = setInterval(() => {
      if (this.indiceDigitando < this.textoCompleto.length) {
        const letra = this.textoCompleto.charAt(this.indiceDigitando);
        if (letra === "\n") {
          this.textoDialogo.innerHTML += "<br>";
        } else if (letra === " ") {
          this.textoDialogo.innerHTML += "&nbsp;";
        } else {
          this.textoDialogo.innerHTML += letra;
        }
        this.indiceDigitando++;
        this.tocarSomLetra();
      } else {
        clearInterval(this.intervaloDigitando);
        this.estaDigitando = false;
        this.pararAnimacaoFala();
      }
    }, 50);
  }

  tocarSomLetra() {
    if (!this.somLetraBuffer) return;
    tocarSom(this.somLetraBuffer, false);
  }

  proximo() {
    if (this.estaDigitando) {
      clearInterval(this.intervaloDigitando);
      this.textoDialogo.innerHTML = this.textoCompleto.replace(/ /g, "&nbsp;");
      this.estaDigitando = false;
      this.pararAnimacaoFala();
    } else {
      this.falaAtual++;

      const isUltimaFala =
        this.falaAtual === this.falas.length - 1 &&
        levels[nivelAtual].nome === "Tutorial";
      if (this.falaAtual >= this.falas.length) {
        this.fecharDialogo();
      } else {
        this.mostrarFalaDigitando();

        if (isUltimaFala) {
          const seletor = document.getElementById("digito-seletor");
          if (seletor) seletor.style.display = "flex";
        }
      }
    }
  }

  fecharDialogo() {
    this.dialogoAberto = false;
    dialogoAtivo = false;
    timerAtivo = true;
    this.caixaDialogo.style.display = "none";

    if (this.intervaloDigitando) {
      clearInterval(this.intervaloDigitando);
      this.estaDigitando = false;
    }

    this.pararAnimacaoFala();

    if (typeof canvas !== "undefined" && !this.dialogoAberto) {
      canvas.requestPointerLock();
    }
  }

  mostrarInteracao(tamanho, playerI, playerJ) {
    const distI = Math.abs(this.i - playerI);
    const distJ = Math.abs(this.j - playerJ);
    const distancia = Math.sqrt(distI * distI + distJ * distJ);

    if (distancia <= 0.5) {
      const x = this.i * tamanho + tamanho / 2;
      const z = this.j * tamanho + tamanho / 2;
      const y = tamanho / 24;

      push();
      translate(x, y, z);
      rotateY(this.rotY);
      fill(255);
      stroke(0);
      strokeWeight(0.5);
      textAlign(CENTER, BOTTOM);
      textSize(tamanho * 0.05);
      text("Aperte E para falar.", 0, 0);
      pop();

      return true;
    }

    return false;
  }
}
