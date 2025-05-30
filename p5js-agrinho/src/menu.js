// Código para fazer o menu de opções e o HUD. Usa o index.html para a visualização.
let duracaoEmSegundos = 300;
let tempoRestante = duracaoEmSegundos;
let intervaloTimer;
let timerAtivo = false;

class Menu {
  constructor() {
    this.container = document.getElementById("menu-container");
    this.fovSlider = document.getElementById("fov-slider");
    this.fovValue = document.getElementById("fov-value");
    this.volumeSlider = document.getElementById("volume-slider");
    this.volumeValue = document.getElementById("volume-value");
    this.sensSlider = document.getElementById("sens-slider");
    this.sensValue = document.getElementById("sens-value");
    this.closeBtn = document.getElementById("close-menu-btn");

    this.ativo = false;
    this.camera = null;

    // fov
    this.fovSlider.addEventListener("input", () => {
      this.fovValue.textContent = this.fovSlider.value + "°";
      if (this.camera) {
        this.camera.fov = radians(this.fovSlider.value);
      }
    });

    // volume
    this.volumeSlider.addEventListener("input", () => {
      let novoVolume = this.volumeSlider.value / 100;
      this.volumeValue.textContent = this.volumeSlider.value + "%";
      outputVolume(novoVolume);
    });

    // sensibilidade
    this.sensSlider.addEventListener("input", () => {
      this.sensValue.textContent = parseFloat(this.sensSlider.value).toFixed(4);
      if (this.camera) {
        this.camera.sens = parseFloat(this.sensSlider.value);
      }
    });

    this.closeBtn.addEventListener("click", () => {
      this.alternar();
    });
  }

  alternar() {
    this.ativo = !this.ativo;
    this.container.style.display = this.ativo ? "block" : "none";
    if (this.ativo) {
      if (document.exitPointerLock) {
        document.exitPointerLock();
      }
    } else {
      let canvas = document.getElementById("defaultCanvas0");
      if (canvas && canvas.requestPointerLock) {
        canvas.requestPointerLock();
      }
    }
  }

  aplicarConfiguracoes(camera) {
    this.camera = camera;

    this.fovSlider.value = degrees(camera.fov);
    this.fovValue.textContent = degrees(camera.fov).toFixed(0) + "°";

    let vol = getOutputVolume();
    this.volumeSlider.value = (vol * 100).toFixed(0);
    this.volumeValue.textContent = (vol * 100).toFixed(0) + "%";

    this.sensSlider.value = camera.sens || 0.002;
    this.sensValue.textContent = (camera.sens || 0.002).toFixed(4);
  }
}

function atualizarHUDPlantas() {
  const total = grade.filter((c) => c.ePlanta).length;
  const regadas = grade.filter((c) => c.ePlanta && c.plantaRegada).length;

  const hud = document.getElementById("plantas-hud");
  hud.textContent = `Plantas: ${regadas}/${total}`;
}

function iniciarTimerRegressivo(minutos = 5) {
  duracaoEmSegundos = minutos * 60;
  tempoRestante = duracaoEmSegundos;
  timerAtivo = true;
  atualizarTimerHUD();

  intervaloTimer = setInterval(() => {
    if (!timerAtivo) return;

    tempoRestante--;

    if (tempoRestante <= 0) {
      tempoRestante = 0;
      pararTimerRegressivo();
      fimDeJogo();
    }

    atualizarTimerHUD();
  }, 1000);
}

function pararTimerRegressivo() {
  timerAtivo = false;
  clearInterval(intervaloTimer);
}

function atualizarTimerHUD() {
  const minutos = Math.floor(tempoRestante / 60)
    .toString()
    .padStart(2, "0");
  const segundos = (tempoRestante % 60).toString().padStart(2, "0");
  const timerHud = document.getElementById("timer-hud");

  if (timerHud) {
    timerHud.textContent = `Tempo restante: ${minutos}:${segundos}`;
  }
}

function fimDeJogo() {
  noLoop();
  alert("Tempo esgotado! Você perdeu.");
}
