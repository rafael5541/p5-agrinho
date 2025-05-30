let cam;
let menu;
let passo1, passo2, passo3;
let sons = [];
let background;
let colunas, linhas;
let fonte;
let tamanho = 100;
let grade = [];
let atual;
let pilha = [];
let passos = new Set();
let noclip = false;
let drones = [];

function keyPressed() {
  if (key === "p" || key === "P") {
    menu.alternar();
  }
  if (key === "n" || key === "N") {
    noclip = !noclip;
    console.log("Modo noclip:", noclip ? "ATIVADO" : "DESATIVADO");
  }
}

// Só carrega e inicia algumas variáveis essenciais.
function setup() {
  background = loadImage("assets/dia.jpg");
  passo1 = loadSound("assets/passo1.mp3");
  passo2 = loadSound("assets/passo2.mp3");
  passo3 = loadSound("assets/passo3.mp3");
  preloadLabirinto();
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1);
  noSmooth();
  noLights();
  let sens = 0.002;
  colunas = floor(width / tamanho);
  linhas = floor(height / tamanho);
  cam = new Camera(
    tamanho / 2,
    tamanho / 6,
    tamanho / 5,
    sens,
    tamanho,
    marcarPasso
  );
  menu = new Menu();

  // Cria nossa "grade" (um labirinto é basicamente uma grade.)
  for (let j = 0; j < linhas; j++) {
    for (let i = 0; i < colunas; i++) {
      const cel = new Celula(i, j);
      grade.push(cel);
    }
  }
  atual = grade[0];
  gerarLabirinto();
  adicionarTraps(50);
  detectarDeadEnds();
  atualizarHUDPlantas();
  iniciarTimerRegressivo(3);
  sonsPasso = [passo2, passo1, passo3];
  menu.aplicarConfiguracoes(cam);
  // Cria os drones.
  for (let i = 0; i < 60; i++) {
    let x = random(colunas * tamanho);
    let z = random(linhas * tamanho);
    drones.push(new Drone(x, z));
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Para os movimentos da câmera com o mouse.
function mouseMoved() {
  if (document.pointerLockElement === canvas) {
    cam.atualizarMouse(movedX, movedY);
  }
}

// Trava o pointer do mouse, e desarma uma armadilha se tiver uma.
function mousePressed() {
  if (!menu.ativo) {
    requestPointerLock();
  }
  cam.desarmarTrapComMouse();
  cam.regarPlantaComMouse();
}

// Desenhe o labirinto.
function draw() {
  panorama(background);
  cam.mover();
  cam.aplicar();

  // bem útil, porque ai o jogo não vai rodar a 3 fps em labirintos grandes.
  // só restringe a câmera por um campo de visão.
  let raioVisao = 5;
  let margem = 1;
  let cx = floor(cam.pos.x / tamanho);
  let cz = floor(cam.pos.z / tamanho);

  let minI = max(0, cx - raioVisao - margem);
  let maxI = min(colunas - 1, cx + raioVisao + margem);
  let minJ = max(0, cz - raioVisao - margem);
  let maxJ = min(linhas - 1, cz + raioVisao + margem);

  // aí que a gente desenha o labirinto, finalmente.
  for (let j = minJ; j <= maxJ; j++) {
    for (let i = minI; i <= maxI; i++) {
      let idx = index(i, j);
      grade[idx].mostrar(cam);
    }
  }
  for (let drone of drones) {
    drone.atualizar();
    drone.mostrar();
  }
}
