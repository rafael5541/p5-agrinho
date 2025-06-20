let cam, menu, background;
let colunas, linhas, tamanho;
let grade = [];
let drones = [];
let regadores = [];
let espantalhos = [];
let setasIndicadoras = [];
let caminho = [];
let celTrator;
let placasTutorial = [];
let npcs = [];
let jogoIniciado = false;
let setasGeradas = false;
let inverterControles = false;
let nivelAtual = 0;
let musica;
let musicaAtiva = null;
let conquistas = {};
let tempoGlobal = 0;

// NPC e menu.
function keyPressed() {
  if (key.toLowerCase() === "e") {
    for (const npc of npcs) {
      const npcX = npc.i * tamanho + tamanho / 2;
      const npcY = npc.j * tamanho + tamanho / 2;
      const distX = abs(cam.pos.x - npcX);
      const distZ = abs(cam.pos.z - npcY);
      const distAceitavel = tamanho;

      if (distX < distAceitavel && distZ < distAceitavel) {
        npc.abrirDialogo();
        break;
      }
    }
  }
  if (key.toLowerCase() === "p") menu.alternar();
}

// Carrega os assets.
async function setup() {
  noCanvas();
  await preload();
  preloadLabirinto();
  preloadNPC();
  document
    .getElementById("botao-iniciar")
    .addEventListener("click", mostrarSelecaoDeNiveis);

  conquistas["ganhou"] = new Conquista(
    "Ganhou o jogo!",
    "Termine um dos levels."
  );
  conquistas["molhado"] = new Conquista(
    "Molhado!",
    "Seja molhado por irrigadores 10 vezes."
  );
  conquistas["espantalho"] = new Conquista(
    "Tonto!",
    "Seja hipnotizado pelo espantalho 10 vezes."
  );
  conquistas["segredo"] = new Conquista("Segredo!", "Você é muito bom!");
  conquistas["speedrunner"] = new Conquista(
    "Colheita Relâmpago",
    "Termine todos os levels com mais de 1 minuto restante."
  );

  if (localStorage.getItem("melhorJogador") === "sim") {
    const msg = document.createElement("div");
    msg.textContent = "Você é o melhor!!";
    msg.style.color = "gold";
    msg.style.fontSize = "24px";
    msg.style.marginTop = "16px";
    document.getElementById("tela-inicial").appendChild(msg);
  }
}

// Verifica se tem parede entre duas células
function temParedeEntre(celAtual, celProx) {
  let di = celProx.i - celAtual.i;
  let dj = celProx.j - celAtual.j;

  if (di === 1 && dj === 0) {
    // Próxima célula à direita
    return celAtual.paredes[1];
  }
  if (di === -1 && dj === 0) {
    // Próxima célula à esquerda
    return celAtual.paredes[3];
  }
  if (di === 0 && dj === 1) {
    // Próxima célula abaixo
    return celAtual.paredes[2];
  }
  if (di === 0 && dj === -1) {
    // Próxima célula acima
    return celAtual.paredes[0];
  }
  return true;
}

// Abre uma parede.
function abrirParede(celula, direcao) {
  const mapa = { cima: 0, direita: 1, baixo: 2, esquerda: 3 };
  let idx = mapa[direcao];
  celula.paredes[idx] = false;

  let i = celula.i;
  let j = celula.j;

  let iViz = i + [0, 1, 0, -1][idx];
  let jViz = j + [-1, 0, 1, 0][idx];

  let vizinha = grade[index(iViz, jViz)];
  if (vizinha) {
    // Remove a parede oposta também
    let oposta = (idx + 2) % 4;
    vizinha.paredes[oposta] = false;
  }
}

// Começa o jogo, configura tudo
function iniciarJogo() {
  jogoIniciado = true;
  setasGeradas = false;
  document.getElementById("tela-inicial").style.display = "none";
  document.getElementById("tela-carregamento").style.display = "none";

  createCanvas(windowWidth, windowHeight, WEBGL);

  pixelDensity(1);
  noSmooth();
  noLights();

  const level = levels[nivelAtual];

  grade = [];
  drones = [];
  regadores = [];
  setasIndicadoras = [];
  espantalhos = [];
  caminho = [];
  npcs = [];

  colunas = level.colunas;
  linhas = level.linhas;
  tamanho = min(924 / colunas, 924 / linhas);

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
  grade = Array.from({ length: colunas * linhas }, (_, idx) => {
    const i = idx % colunas;
    const j = Math.floor(idx / colunas);
    return new Celula(i, j);
  });

  // Faz o labirinto tutorial.
  if (level.labirintoPredefinido) {
    placasTutorial.push(
      new PlacaTutorial(0, 0, "Use W A S D para se mover.", -PI)
    );
    placasTutorial.push(
      new PlacaTutorial(2, 0, "Use o mouse para olhar ao redor", -HALF_PI)
    );
    placasTutorial.push(new PlacaTutorial(2, 1, "Evite armadilhas!", -PI));
    placasTutorial.push(
      new PlacaTutorial(4, 2, "Clique nas plantas para regar", -PI / 2)
    );
    placasTutorial.push(
      new PlacaTutorial(5, 2, "Volte ao trator para vencer.", -PI / 2)
    );
    placasTutorial.push(new PlacaTutorial(5, 3, "Use SHIFT para correr.", -PI));
    gerarLabirintoTutorial();
    grade[0].paredes = [false, false, false, true];
  } else {
    atual = grade[0];
    gerarLabirinto();
    adicionarPlantas();
  }

  // Colocamos isso para que o labirinto sempre tenha uma entrada aberta para o trator.
  if (!level.labirintoPredefinido) abrirParede(grade[0], "cima");
  grade[index(0, 0)].temTrator = true;

  background = loadImage(level.background, () => loop());
  if (level.musica && musicasBuffers[level.musica]) {
    musica = musicasBuffers[level.musica];
  } else {
    musica = null;
  }

  // Prepara armadilhas e plantas. São definidas no levels.js.
  level.armadilhas();

  // Prepara os npcs. Tentei adicionar um algoritmo para colocar o NPC no lugar certo, e *parece* que funciona.
  if (level.npcs) {
    const npcsDoNivel = level.npcs();

    for (let npc of npcsDoNivel) {
      if (npc.i === undefined || npc.j === undefined) {
        let posInicio = grade.find((c) => {
          const temRegador = regadores.some((r) => r.i === c.i && r.j === c.j);
          // não PRECISAMOS olhar se tem planta, por que a planta nunca irá estar no 0,0. mais coloquei só pra evitar bugs.
          return (
            !c.temTrap && !c.temPlanta && !temRegador && c.i < 3 && c.j < 3
          );
        });

        if (posInicio) {
          npc.i = posInicio.i;
          npc.j = posInicio.j;
        } else {
          npc.i = 0;
          npc.j = 0;
        }
      }

      npcs.push(npc);
    }
  }

  atualizarHUDPlantas();
  iniciarTimerRegressivo(level.tempo);
  menu.aplicarConfiguracoes(cam);

  // Faz os drones.
  drones = [];
  for (let i = 0; i < 30; i++) {
    drones.push(new Drone(random(colunas * tamanho), random(linhas * tamanho)));
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Atualiza a câmera.
function mouseMoved() {
  if (
    !cam ||
    !document.pointerLockElement ||
    document.pointerLockElement !== canvas
  )
    return;
  if (document.pointerLockElement === canvas) {
    cam.atualizarMouse(movedX, movedY);
  }
}

// Roda quando o mouse for pressionado.
function mousePressed() {
  const perdeu = document.getElementById("tela-perdeu");
  const venceu = document.getElementById("tela-vitoria");
  if (
    (perdeu && perdeu.style.display === "flex") ||
    (venceu && venceu.style.display === "flex")
  ) {
    return;
  }

  if (!carregamentoCompleto) {
    console.log("Aguarde o carregamento da música...");
    return;
  }

  // Ativar música quando clicar na tela
  if (jogoIniciado && !audioIniciado) {
    musicaAtiva = tocarSom(musica, true);
    audioIniciado = true;
  }

  // Bloquear mouse, para a câmera funcionar.
  if (menu && !menu.ativo && !npcs.some((npc) => npc.dialogoAberto)) {
    requestPointerLock();
  }
  // Para desarmar as traps, e ganhar clicando no trator.
  if (jogoIniciado) {
    cam.desarmarTrapComMouse();
    cam.regarPlantaComMouse();

    celulaTrator = grade[0];
    celulaTrator.temTrator = true;
    if (celulaTrator && todasPlantasRegadas()) {
      let xTrator = celulaTrator.i * tamanho + tamanho / 2;
      let zTrator = celulaTrator.j * tamanho + tamanho / 2;
      let yTrator = tamanho / 5;

      let px = cam.pos.x;
      let py = cam.pos.y;
      let pz = cam.pos.z;

      // Checa se o mouse está apontando perto do trator
      let distXZ = dist(px, pz, xTrator, zTrator);
      let distY = abs(py - yTrator);

      let distanciaCliqueAceitavel = tamanho;

      if (
        distXZ < distanciaCliqueAceitavel &&
        distY < distanciaCliqueAceitavel
      ) {
        ganhouJogo();
      }
    }
  }
}

// Faz o labirinto tutorial.
function gerarLabirintoTutorial() {
  for (let cel of grade) {
    cel.paredes = [true, true, true, true];
    cel.temTrator = false;
    cel.temPlanta = false;
    cel.armadilha = false;
  }

  const abrirCaminho = (i1, j1, i2, j2) => {
    const cel1 = grade[index(i1, j1)];
    const cel2 = grade[index(i2, j2)];

    if (i2 > i1) {
      cel1.paredes[1] = false;
      cel2.paredes[3] = false;
    } else if (i2 < i1) {
      cel1.paredes[3] = false;
      cel2.paredes[1] = false;
    } else if (j2 > j1) {
      cel1.paredes[2] = false;
      cel2.paredes[0] = false;
    } else if (j2 < j1) {
      cel1.paredes[0] = false;
      cel2.paredes[2] = false;
    }
  };

  // Define o caminho
  const caminho = [
    [0, 0],
    [1, 0],
    [2, 0],
    [2, 1],
    [2, 2],
    [3, 2],
    [4, 2],
    [5, 2],
    [5, 3],
    [5, 4],
    [4, 4],
    [3, 4],
  ];

  for (let k = 0; k < caminho.length - 1; k++) {
    abrirCaminho(...caminho[k], ...caminho[k + 1]);
  }

  grade[index(0, 0)].temTrator = true;
  grade[index(0, 0)].paredes[3] = true;
  grade[index(0, 0)].paredes[0] = false;
  grade[index(0, 0)].paredes[2] = true;
  grade[index(0, 0)].paredes[1] = false;

  grade[index(5, 2)].ePlanta = true;
  grade[index(3, 4)].ePlanta = true;

  grade[index(2, 1)].armadilha = true;
}

function draw() {
  if (!jogoIniciado) return;

  panorama(background);
  cam.mover();
  cam.aplicar();
  tempoGlobal += deltaTime;

  // Define área visível com base na posição do jogador
  const cx = floor(cam.pos.x / tamanho);
  const cz = floor(cam.pos.z / tamanho);

  if (levels[nivelAtual]?.nome === "Noite Assombrada") {
    ambientLight(60);

    pointLight(255, 209, 62, 30, 0, 0);
  }

  const raioVisao = 5;
  const margem = 1;

  const minI = max(0, cx - raioVisao - margem);
  const maxI = min(colunas - 1, cx + raioVisao + margem);
  const minJ = max(0, cz - raioVisao - margem);
  const maxJ = min(linhas - 1, cz + raioVisao + margem);

  // Se terminou de regar, mostra caminho de volta com as setas
  if (todasPlantasRegadas()) {
    setasIndicadoras = [];
    placasTutorial = [];
    caminho = calcularCaminhoParaOrigem(cx, cz);

    for (let k = 0; k < caminho.length - 1; k++) {
      let celAtual = grade[index(caminho[k].i, caminho[k].j)];
      let celProx = grade[index(caminho[k + 1].i, caminho[k + 1].j)];

      if (!temParedeEntre(celAtual, celProx)) {
        const deltaI = celProx.i - celAtual.i;
        const deltaJ = celProx.j - celAtual.j;

        const direcaoMap = {
          "1,0": "direita",
          "-1,0": "esquerda",
          "0,1": "baixo",
          "0,-1": "cima",
        };

        const direcao = direcaoMap[`${deltaI},${deltaJ}`];

        if (direcao) {
          setasIndicadoras.push(
            new SetaIndicadora(celAtual.i, celAtual.j, direcao)
          );
        }
      }
    }
    if (caminho.length > 1) {
      let celUlt =
        grade[
          index(caminho[caminho.length - 1].i, caminho[caminho.length - 1].j)
        ];
      let celAnt =
        grade[
          index(caminho[caminho.length - 2].i, caminho[caminho.length - 2].j)
        ];

      if (!temParedeEntre(celAnt, celUlt)) {
        const deltaI = celUlt.i - celAnt.i;
        const deltaJ = celUlt.j - celAnt.j;

        const direcaoMap = {
          "1,0": "direita",
          "-1,0": "esquerda",
          "0,1": "baixo",
          "0,-1": "cima",
        };

        let direcao = direcaoMap[`${deltaI},${deltaJ}`];

        direcao = {
          // inverte
          direita: "esquerda",
          esquerda: "direita",
          baixo: "cima",
          cima: "baixo",
        }[direcao];

        setasIndicadoras.push(new SetaIndicadora(celUlt.i, celUlt.j, direcao));
      }
    }

    setasGeradas = true;
  }

  // Renderiza células dentro da área visível
  for (let j = minJ; j <= maxJ; j++) {
    for (let i = minI; i <= maxI; i++) {
      let idx = index(i, j);
      let cel = grade[idx];
      cel.mostrar(cam);
    }
  }
  if (bloqueioVisivel && millis() - ultimoTempoEmRegador > 6000) {
    esconderBloqueio();
    bloqueioVisivel = false;
  }
  for (const drone of drones) {
    drone.atualizar(cam);
    drone.mostrar();
  }
  for (let seta of setasIndicadoras) {
    seta.mostrar();
  }
  for (let placa of placasTutorial) {
    placa.mostrar();
  }
  for (let npc of npcs) {
    npc.desenhar(tamanho);
    npc.mostrarInteracao(tamanho, cx, cz);
  }
  for (let e of espantalhos) {
    e.atualizar(cam);
    e.mostrar();
  }
}
