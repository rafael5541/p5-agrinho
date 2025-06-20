let duracaoEmSegundos = 300;
let tempoRestante = duracaoEmSegundos;
let intervaloTimer;
let timerAtivo = false;
let menuAtivo = false;

const mensagens = {
  dicas: [
    "Dica: Quando você pega uma planta, sua stamina recupera!",
    "Dica: Não se perca no labirinto! Lembre onde você foi, e se achar um caminho morto, volte!",
    "Dica: Se estiver sem stamina, pare um pouco e respire. Ela volta sozinha!",
    "Dica: A prática leva à vitória! Cada tentativa te deixa mais rápido.",
  ],
  curiosidades: [
    "Curiosidade: O Brasil é o maior produtor mundial de café!",
    "Curiosidade: A compostagem transforma restos de comida em adubo natural.",
    "Curiosidade: Drones já são usados para monitorar plantações e aplicar fertilizantes com precisão.",
    "Curiosidade: A agricultura de precisão usa tecnologia para economizar água, sementes e adubo.",
    "Curiosidade: As minhocas ajudam a fertilizar o solo naturalmente!",
    "Curiosidade: Plantar árvores ajuda a evitar a erosão do solo.",
    "Curiosidade: A rotação de culturas melhora a saúde do solo e evita pragas.",
    "Curiosidade: Tratores modernos podem ser guiados por GPS!",
    "Curiosidade: Algumas fazendas usam energia solar para reduzir custos e proteger o meio ambiente.",
    "Curiosidade: O mel produzido por abelhas é um dos alimentos mais puros da natureza.",
    "Curiosidade: A mandioca é uma das principais fontes de energia para milhões de brasileiros.",
    "Curiosidade: Plantas como o girassol podem limpar solos contaminados, esse processo se chama fitorremediação.",
    "Curiosidade: O Brasil tem mais de 5 milhões de propriedades rurais.",
    "Curiosidade: A agrofloresta mistura agricultura com floresta, beneficiando o solo e os animais.",
    "Curiosidade: Algumas plantações usam sensores no solo para medir a umidade em tempo real.",
    "Curiosidade: A agricultura familiar é responsável por cerca de 70% dos alimentos que chegam à nossa mesa.",
    "Curiosidade: O leite da vaca passa por várias etapas até chegar à caixinha do supermercado.",
    "Curiosidade: As abelhas são essenciais para a polinização de frutas e vegetais.",
    "Curiosidade: A irrigação por gotejamento economiza até 80% de água comparado com métodos tradicionais.",
    "Curiosidade: Alimentos orgânicos são cultivados sem agrotóxicos ou fertilizantes químicos.",
  ],
};

// Classe para menu de opções
class Menu {
  constructor() {
    const get = (id) => document.getElementById(id);
    this.container = get("menu-container");
    this.fovSlider = get("fov-slider");
    this.fovValue = get("fov-value");
    this.volumeSlider = get("volume-slider");
    this.volumeValue = get("volume-value");
    this.sensSlider = get("sens-slider");
    this.sensValue = get("sens-value");
    this.closeBtn = get("close-menu-btn");

    this.ativo = false;
    this.camera = null;

    this.fovSlider.addEventListener("input", () => {
      const val = this.fovSlider.value;
      this.fovValue.textContent = `${val}°`;
      if (this.camera) this.camera.fov = radians(val);
    });

    this.volumeSlider.addEventListener("input", () => {
      const val = this.volumeSlider.value;
      this.volumeValue.textContent = `${val}%`;
      outputVolume(val / 100);
    });

    this.sensSlider.addEventListener("input", () => {
      const val = parseFloat(this.sensSlider.value);
      this.sensValue.textContent = val.toFixed(4);
      if (this.camera) this.camera.sens = val;
    });

    this.closeBtn.addEventListener("click", () => this.alternar());
  }

  alternar() {
    this.ativo = !this.ativo;
    this.container.style.display = this.ativo ? "block" : "none";

    if (this.ativo) {
      menuAtivo = true;
      timerAtivo = false;
      document.exitPointerLock?.();
    } else {
      menuAtivo = false;
      timerAtivo = true;
      document.getElementById("defaultCanvas0")?.requestPointerLock?.();
    }
  }

  aplicarConfiguracoes(camera) {
    this.camera = camera;
    this.fovSlider.value = degrees(camera.fov);
    this.fovValue.textContent = `${degrees(camera.fov).toFixed(0)}°`;

    const vol = getOutputVolume();
    this.volumeSlider.value = (vol * 100).toFixed(0);
    this.volumeValue.textContent = `${(vol * 100).toFixed(0)}%`;

    const sens = camera.sens || 0.002;
    this.sensSlider.value = sens;
    this.sensValue.textContent = sens.toFixed(4);
  }
}

// Função para pegar uma coisa de um array.
const escolherAleatoria = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Função para verificar se todas as plantas estão regadas
const todasPlantasRegadas = () =>
  grade.filter((c) => c.ePlanta).every((c) => c.plantaRegada);

// Atualiza HUD das plantas regadas
const atualizarHUDPlantas = () => {
  const total = grade.filter((c) => c.ePlanta).length;
  const regadas = grade.filter((c) => c.ePlanta && c.plantaRegada).length;

  const hud = document.getElementById("plantas-hud");
  if (hud) {
    hud.textContent = `Plantas: ${regadas}/${total}`;
  }
};

// Timer regressivo
const iniciarTimerRegressivo = () => {
  pararTimerRegressivo();

  duracaoEmSegundos = levels[nivelAtual].tempo * 60;
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
};

const pararTimerRegressivo = () => {
  timerAtivo = false;
  clearInterval(intervaloTimer);
};

const atualizarTimerHUD = () => {
  const minutos = Math.floor(tempoRestante / 60)
    .toString()
    .padStart(2, "0");
  const segundos = (tempoRestante % 60).toString().padStart(2, "0");
  const timerHud = document.getElementById("timer-hud");

  if (timerHud) {
    timerHud.textContent = `Tempo restante: ${minutos}:${segundos}`;
  }
};

// Roda quando o jogador perde o jogo.
const fimDeJogo = () => {
  noLoop();
  tocarSom(perdeuBuffer);
  document.getElementById("tela-perdeu").style.display = "flex";
  document.getElementById("dica-perdeu").innerText = escolherAleatoria(
    mensagens.dicas
  );
  document.exitPointerLock();
};

function marcarNivelConcluido(nivelIndex, tempoGasto) {
  const progresso =
    JSON.parse(localStorage.getItem("progressoMilhopolis")) || {};

  const tempoAnterior = progresso[nivelIndex];

  // Se for a primeira vez ou um tempo melhor (menor), atualiza
  if (tempoAnterior === undefined || tempoGasto < tempoAnterior) {
    progresso[nivelIndex] = tempoGasto;
    localStorage.setItem("progressoMilhopolis", JSON.stringify(progresso));
  }
}

// Autoexplicativo.
function todosOsNiveisCompletosCom1Minuto() {
  const progresso =
    JSON.parse(localStorage.getItem("progressoMilhopolis")) || {};

  return levels.every((level, idx) => {
    const tempoGasto = progresso[idx];
    if (tempoGasto === undefined) return false;

    const limiteComMargem = level.tempo * 60 - 60;

    return tempoGasto <= limiteComMargem;
  });
}

// Roda quando o jogador ganha o jogo.
const ganhouJogo = () => {
  const tempoGasto = duracaoEmSegundos - Math.floor(tempoRestante);
  marcarNivelConcluido(nivelAtual, tempoGasto);
  if (todosOsNiveisCompletosCom1Minuto()) {
    localStorage.setItem("melhorJogador", "sim");
    conquistas["speedrunner"].desbloquear();
  }
  noLoop();
  pararMusica(musicaAtiva);
  tocarSom(ganhouBuffer);
  if (nivelAtual != 0) conquistas["ganhou"].desbloquear();
  document.getElementById("curiosidade").innerText = escolherAleatoria(
    mensagens.curiosidades
  );
  document.getElementById("tela-vitoria").style.display = "flex";
  document.exitPointerLock();
};

// Para voltar pro menu inicial, eu preciso resetar todas as variaveis.
const voltarMenuInicial = () => {
  document.getElementById("tela-vitoria").style.display = "none";
  document.getElementById("tela-perdeu").style.display = "none";
  document.getElementById("tela-inicial").style.display = "flex";
  noLoop();

  jogoIniciado = false;
  setasGeradas = false;
  nivelAtual = 0;
  noclip = false;

  grade = [];
  drones = [];
  regadores = [];
  setasIndicadoras = [];
  espantalhos = [];
  caminho = [];
  npcs = [];

  pararMusica(musicaAtiva);
  musicaAtiva = null;
  audioIniciado = false;

  if (canvas) {
    canvas.remove();
    canvas = null;
  }

  cam = null;
  menu = null;
  background = null;

  preloadLabirinto();
  document
    .getElementById("botao-iniciar")
    .addEventListener("click", mostrarSelecaoDeNiveis);
};

function configurarModal(botaoId, modalId, fecharId, extraSetup = () => {}) {
  const botao = document.getElementById(botaoId);
  const modal = document.getElementById(modalId);
  const fechar = document.getElementById(fecharId);

  botao?.addEventListener("click", () => {
    extraSetup();
    modal.style.display = "flex";
  });

  fechar?.addEventListener("click", () => {
    modal.style.display = "none";
  });

  modal?.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "flex") {
      modal.style.display = "none";
    }
  });
}

window.addEventListener("load", () => {
  configurarModal(
    "botao-como-jogar",
    "modal-como-jogar",
    "fechar-modal-como-jogar"
  );
  configurarModal(
    "botao-conquistas",
    "modal-conquistas",
    "fechar-modal-conquistas",
    () => {
      const lista = document.getElementById("lista-conquistas");
      lista.innerHTML = "";
      for (const chave in conquistas) {
        const c = conquistas[chave];
        const li = document.createElement("li");
        li.className = `conquista-item ${
          c.desbloqueada ? "desbloqueada" : "bloqueada"
        }`;
        li.innerHTML = `
        <div class="conquista-icon">${c.desbloqueada ? "✅" : "🔒"}</div>
        <div class="conquista-content">
          <div class="conquista-nome">${c.nome}</div>
          <div class="conquista-descricao">${c.descricao}</div>
        </div>
      `;
        lista.appendChild(li);
      }
    }
  );
});
