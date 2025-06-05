let cam, menu, background;
let colunas, linhas, tamanho;
let grade = [];
let drones = [];
let regadores = [];
let jogoIniciado = false;
let nivelAtual = 0;
let musica;
let noclip = false;

function keyPressed() {
  if (key.toLowerCase() === "p") menu.alternar();
  if (key.toLowerCase() === "n") {
    noclip = !noclip;
    console.log("Modo noclip:", noclip ? "ATIVADO" : "DESATIVADO");
  }
}

async function setup() {
  noCanvas();
  await preload();
  preloadLabirinto();
  document
    .getElementById("botao-iniciar")
    .addEventListener("click", mostrarSelecaoDeNiveis);
}

function iniciarJogo() {
  jogoIniciado = true;
  document.getElementById("tela-inicial").style.display = "none";
  document.getElementById("tela-carregamento").style.display = "none";

  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1);
  noSmooth();
  noLights();

  colunas = 10;
  linhas = 15;
  tamanho = min(windowWidth / colunas, windowHeight / linhas);

  // Inicializa câmera e menu.
  cam = new Camera(
    tamanho / 2,
    tamanho / 6,
    tamanho / 5,
    0.002,
    tamanho,
    marcarPasso
  );
  menu = new Menu();

  // Cria células do labirinto. o labirinto é tipo uma "grade".
  grade = [];
  for (let j = 0; j < linhas; j++) {
    for (let i = 0; i < colunas; i++) {
      grade.push(new Celula(i, j));
    }
  }

  atual = grade[0];
  gerarLabirinto();

  const level = levels[nivelAtual];
  background = loadImage(level.background, () => loop());
  musica = musicasBuffers[level.musica];

  // Prepara armadilhas e plantas. São definidas no levels.js.
  level.armadilhas();
  adicionarPlantas();
  atualizarHUDPlantas();
  iniciarTimerRegressivo(5);
  menu.aplicarConfiguracoes(cam);

  drones = [];
  for (let i = 0; i < 60; i++) {
    drones.push(new Drone(random(colunas * tamanho), random(linhas * tamanho)));
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mouseMoved() {
  if (document.pointerLockElement === canvas) {
    cam.atualizarMouse(movedX, movedY);
  }
}

function mousePressed() {
  if (!carregamentoCompleto) {
    console.log("Aguarde o carregamento da música...");
    return;
  }

  if (jogoIniciado && !audioIniciado) {
    tocarSom(musica, true);
    audioIniciado = true;
  }

  if (menu && !menu.ativo) {
    requestPointerLock();
  }

  if (jogoIniciado) {
    cam.desarmarTrapComMouse();
    cam.regarPlantaComMouse();
  }
}

function draw() {
  if (!jogoIniciado) return;

  panorama(background);
  cam.mover();
  cam.aplicar();

  const cx = floor(cam.pos.x / tamanho);
  const cz = floor(cam.pos.z / tamanho);

  const raioVisao = 5;
  const margem = 1;

  const minI = max(0, cx - raioVisao - margem);
  const maxI = min(colunas - 1, cx + raioVisao + margem);
  const minJ = max(0, cz - raioVisao - margem);
  const maxJ = min(linhas - 1, cz + raioVisao + margem);

  for (let j = minJ; j <= maxJ; j++) {
    for (let i = minI; i <= maxI; i++) {
      grade[index(i, j)].mostrar(cam);
    }
  }

  for (const drone of drones) {
    drone.atualizar();
    drone.mostrar();
  }
  if (bloqueioVisivel && millis() - ultimoTempoEmRegador > 10000) {
    esconderBloqueio();
    bloqueioVisivel = false;
  }
}
