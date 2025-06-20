// Código para criar labirinto 3d. Algoritmo baseado no Daniel Shiffman (https://editor.p5js.org/codingtrain/sketches/EBkm4txSA) o que usa DFS (Depth-First Search).
// Código para o transformar em 3d feito por mim, com inspiração de vários projetos da Unity.

let imgMilho,
  imgDrone,
  imgArmadilha,
  imgSeta,
  imgEspantalho,
  modeloTrator,
  modeloIrrigador;
const conquistasLabirinto = {
  vezesMolhado: 0,
  ultimoMolhado: 0,
  vezesEspantalho: 0,
  ultimoEspantalho: 0,
};
let bloqueioTimeout = null;
let ultimoTempoEmRegador = 0;
let bloqueioVisivel = false;
let tempoInversaoRestante = 0;
let intervaloInversao = null;

// Carrega as imagens para o labirinto.
function preloadLabirinto() {
  imgMilho = loadImage("assets/milho.png");
  imgArmadilha = loadImage("assets/armadilha.png");
  imgDrone = loadImage("assets/drone.png");
  imgSeta = loadImage("assets/seta.png");
  imgEspantalho = loadImage("assets/espantalho.png");

  const options = {
    normalize: true,
    fileType: ".obj",
  };
  modeloTrator = loadModel("assets/trator.obj", options);
  modeloIrrigador = loadModel("assets/irrigador.obj", options);
}

function tocarSomDesarmar() {
  if (desarmarBuffer && audioCtx) {
    tocarSom(desarmarBuffer);
  }
}

function tocarSomPegar() {
  if (pegarBuffer && audioCtx) {
    tocarSom(pegarBuffer);
  }
}

// Classe para a célula do labirinto. Praticamente só usado para desenhar o labirinto.
class Celula {
  constructor(i, j) {
    this.i = i;
    this.j = j;
    this.visitado = false;
    this.paredes = [true, true, true, true]; // Cima, Direita, Baixo, Esquerda
    this.temTrap = false;
    this.trapDesarmada = false;
    this.foiPisado = false;
    this.ePlanta = false;
    this.plantaRegada = false;
    this.temTrator = false;
  }

  mostrar() {
    let x = this.i * tamanho;
    let z = this.j * tamanho;

    push();
    translate(x + tamanho / 2, 0, z + tamanho / 2);

    // Chão
    push();
    noStroke();
    fill("green");
    translate(0, tamanho / 2, 0);
    rotateX(HALF_PI);
    plane(tamanho, tamanho);
    pop();

    // Paredes
    if (this.paredes[0]) {
      push();
      translate(0, 0, -tamanho / 2);
      noStroke();
      texture(imgMilho);
      plane(tamanho);
      pop();
    }

    if (this.paredes[1]) {
      push();
      translate(tamanho / 2, 0, 0);
      rotateY(HALF_PI);
      noStroke();
      texture(imgMilho);
      plane(tamanho);
      pop();
    }

    if (this.paredes[2]) {
      push();
      translate(0, 0, tamanho / 2);
      noStroke();
      texture(imgMilho);
      plane(tamanho);
      pop();
    }

    if (this.paredes[3]) {
      push();
      translate(-tamanho / 2, 0, 0);
      rotateY(HALF_PI);
      noStroke();
      texture(imgMilho);
      plane(tamanho);
      pop();
    }

    // Passos
    if (this.foiPisado) {
      push();
      translate(0, tamanho / 2 + 0.05, 0);
      rotateX(HALF_PI);
      let raio = tamanho * 0.01 + 3;
      stroke(24, 120, 21);
      strokeWeight(2);
      fill(24, 120, 21);
      sphere(raio);
      pop();
    }

    // Trap
    if (this.temTrap && !this.trapDesarmada) {
      push();
      fill("red");
      noStroke();
      translate(0, tamanho / 2 + 1, 0);
      texture(imgArmadilha);
      drawingContext.enable(drawingContext.POLYGON_OFFSET_FILL);
      drawingContext.polygonOffset(-1, -1);
      box(tamanho * 0.4, 2, tamanho * 0.4);
      drawingContext.disable(drawingContext.POLYGON_OFFSET_FILL);
      pop();
    }

    if (this.ePlanta && !this.plantaRegada) {
      push();
      translate(0, tamanho / 2 + 5, 0);

      // Sorteia o tipo de planta uma vez
      if (!this.tipoPlanta) {
        const tipos = ["cenoura", "beterraba", "tomate"];
        this.tipoPlanta = random(tipos);
      }

      noStroke();

      switch (this.tipoPlanta) {
        case "cenoura":
          fill(255, 102, 0);
          rotateX(PI);
          rotateZ(PI);
          cone(tamanho * 0.15, tamanho * 0.5);

          translate(0, -tamanho * 0.25, 0);
          fill(34, 139, 34);
          for (let i = 0; i < 3; i++) {
            push();
            rotateY((TWO_PI / 3) * i);
            translate(0, -tamanho * 0.05, tamanho * 0.1);
            rotateX(-PI / 6);
            cone(tamanho * 0.025, tamanho * 0.2);
            pop();
          }
          break;

        case "beterraba":
          fill(138, 3, 88);
          sphere(tamanho * 0.2);

          fill(0, 100, 0);
          translate(0, -tamanho * 0.25, 0);
          for (let i = 0; i < 4; i++) {
            push();
            rotateZ((TWO_PI / 4) * i);
            translate(tamanho * 0.1, 0, 0);
            rotateX(-PI / 4);
            cone(tamanho * 0.025, tamanho * 0.2);
            pop();
          }
          break;

        case "tomate":
          fill(255, 0, 0);
          sphere(tamanho * 0.18);

          fill(0, 128, 0);
          translate(0, -tamanho * 0.2, 0);
          cone(tamanho * 0.02, tamanho * 0.1);
          break;
      }

      pop();
    }

    // Regadores
    for (let r of regadores) {
      if (r.estaNaPosicao(this.i, this.j)) {
        r.mostrar();
        break;
      }
    }

    // Trator
    if (this.temTrator) {
      push();
      translate(0, 0, -90);

      scale(0.5);
      rotateX(PI);
      noStroke();
      texture(imgDrone);
      normalMaterial();
      model(modeloTrator);
      pop();
    }

    pop();
  }

  vizinhoNaoVisitado() {
    let vizinhos = [];
    const offsets = [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
    ];
    for (let k = 0; k < 4; k++) {
      let ni = this.i + offsets[k][0];
      let nj = this.j + offsets[k][1];
      let idx = index(ni, nj);
      if (idx >= 0 && !grade[idx].visitado) {
        vizinhos.push(grade[idx]);
      }
    }
    if (vizinhos.length > 0) {
      return random(vizinhos);
    }
    return undefined;
  }

  temParedeEm(direcao) {
    const dirs = {
      cima: 0,
      direita: 1,
      baixo: 2,
      esquerda: 3,
    };
    return this.paredes[dirs[direcao]];
  }

  desarmarTrap() {
    if (this.temTrap && !this.trapDesarmada) {
      this.trapDesarmada = true;
      tocarSomDesarmar();
    }
  }
  regarPlanta() {
    if (this.ePlanta && !this.plantaRegada) {
      this.plantaRegada = true;
      if (typeof atualizarHUDPlantas === "function") atualizarHUDPlantas();
      tocarSomPegar();
      return true;
    }
  }
}

// Classe para os irrigadores automáticos. Se o player estiver dentro quando está ativo, bloqueia a tela.
class Regador {
  constructor(i, j, intervalo = 3000, duracao = 1500) {
    this.i = i;
    this.j = j;
    this.intervalo = intervalo;
    this.duracao = duracao;
  }

  estaAtivo() {
    let cicloTotal = this.intervalo + this.duracao;
    let tempoNoCiclo = tempoGlobal % cicloTotal;

    return tempoNoCiclo < this.duracao;
  }

  estaNaPosicao(x, y) {
    return this.i === x && this.j === y;
  }

  mostrar() {
    let ativo = this.estaAtivo();

    push();
    scale(0.1);
    translate(0, tamanho / 2 + 280, 0);
    rotateX(PI);

    if (ativo) {
      rotateY(frameCount * 0.05);
      push();
      translate(0, tamanho / 2 + 80, 0);
      noStroke();
      fill(0, 0, 255);
      cylinder(tamanho * 0.5, tamanho * 20);
      pop();
    }

    noStroke();
    texture(imgDrone);
    model(modeloIrrigador);
    pop();
  }
}

// Classe para as setas indicadores.
class SetaIndicadora {
  constructor(i, j, direcao) {
    this.i = i;
    this.j = j;
    this.direcao = direcao; // "cima", "direita", "baixo", "esquerda"
  }

  mostrar() {
    const x = this.i * tamanho + tamanho / 2;
    const z = this.j * tamanho + tamanho / 2;

    push();
    translate(x, tamanho / 2 - 8, z);
    noStroke();
    texture(imgSeta);

    switch (this.direcao) {
      case "direita":
        rotateY(0);
        break;
      case "baixo":
        rotateY(-HALF_PI);
        break;
      case "esquerda":
        rotateY(PI);
        break;
      case "cima":
        rotateY(HALF_PI);
        break;
    }

    plane(tamanho * 0.8, tamanho * 0.8);
    pop();
  }
}

// Classe para as placas tutoriais.
class PlacaTutorial {
  constructor(i, j, texto, rotY = 0) {
    this.x = i * tamanho + tamanho / 2;
    this.z = j * tamanho + tamanho / 2;
    this.rotY = rotY;

    this.grafico = createGraphics(256, 128);
    this.grafico.textAlign(CENTER, CENTER);
    this.grafico.textSize(16);
    this.grafico.fill(0);
    this.grafico.noStroke();
    this.grafico.background(255, 240);
    this.grafico.text(texto, 128, 64);
  }

  mostrar() {
    push();
    translate(this.x, tamanho / 4, this.z);
    rotateY(this.rotY);
    texture(this.grafico);
    noStroke();
    plane(tamanho * 0.5, tamanho * 0.5);
    pop();
  }
}

// Classe do espantalho. Se correr perto dele, inverte os controles.
class Espantalho {
  constructor(i, j) {
    this.i = i;
    this.j = j;
    this.x = i * tamanho + tamanho / 2;
    this.z = j * tamanho + tamanho / 2;
    this.y = 0;
    this.raioDeteccao = tamanho * 0.5;
    this.inverterTempo = 6000;
    this.ativo = false;
    this.tempoRestante = 0;
  }

  atualizar(camera) {
    let dx = camera.pos.x - this.x;
    let dz = camera.pos.z - this.z;
    let dist = sqrt(dx * dx + dz * dz);

    if (
      dist < this.raioDeteccao &&
      camera.estaCorrendo &&
      !this.ativo &&
      !inverterControles
    ) {
      this.ativo = true;
      inverterControles = true;
      tempoInversaoRestante = this.inverterTempo / 1000;

      if (millis() - conquistasLabirinto.ultimoEspantalho > 1000) {
        conquistasLabirinto.vezesEspantalho++;
        conquistasLabirinto.ultimoEspantalho = millis();

        if (
          conquistasLabirinto.vezesEspantalho >= 10 &&
          !conquistas["espantalho"].desbloqueada
        ) {
          conquistas["espantalho"].desbloquear();
        }
      }

      document.getElementById("inverter-hud").style.display = "block";
      document.getElementById("contador-inversao").innerText =
        tempoInversaoRestante;

      clearInterval(intervaloInversao);
      intervaloInversao = setInterval(() => {
        tempoInversaoRestante--;
        if (tempoInversaoRestante <= 0) {
          clearInterval(intervaloInversao);
          inverterControles = false;
          this.ativo = false;
          document.getElementById("inverter-hud").style.display = "none";
        } else {
          document.getElementById("contador-inversao").innerText =
            tempoInversaoRestante;
        }
      }, 1000);
    }
  }

  mostrar() {
    push();
    translate(this.x, this.y, this.z);
    texture(imgEspantalho);
    noStroke();
    plane(tamanho * 1.2, tamanho * 1.2);
    pop();
  }
}

// Serve para descobrir onde está uma célula (i, j) dentro de uma lista 1D.
// É como transformar uma tabela em uma linha só, e descobrir em que posição da linha está a célula.
function index(i, j) {
  if (i < 0 || j < 0 || i >= colunas || j >= linhas) {
    return -1;
  }
  return i + j * colunas;
}

// Remove as paredes entre duas células adjacentes (a e b) do labirinto.
function removerParedes(a, b) {
  let x = a.i - b.i;
  let y = a.j - b.j;

  if (x === 1) {
    a.paredes[3] = false;
    b.paredes[1] = false;
  } else if (x === -1) {
    a.paredes[1] = false;
    b.paredes[3] = false;
  }

  if (y === 1) {
    a.paredes[0] = false;
    b.paredes[2] = false;
  } else if (y === -1) {
    a.paredes[2] = false;
    b.paredes[0] = false;
  }
}

// Gera o labirinto em si, usando o algoritmo DFS (Depth First-Search).
function gerarLabirinto() {
  let atual = grade[0];
  let pilha = [];

  atual.visitado = true;

  do {
    let proximo = atual.vizinhoNaoVisitado();
    if (proximo) {
      proximo.visitado = true;
      pilha.push(atual);
      removerParedes(atual, proximo);
      atual = proximo;
    } else if (pilha.length > 0) {
      atual = pilha.pop();
    } else {
      break;
    }
  } while (pilha.length > 0);
}

// Adiciona as traps/armadilhas no labirinto.
function adicionarTraps(quantidade) {
  for (let n = 0; n < quantidade; n++) {
    let i = floor(random(colunas));
    let j = floor(random(linhas));
    let cel = grade[index(i, j)];
    if (cel.i === 0 && cel.j === 0) continue;
    if (cel && !cel.temTrap && !cel.ePlanta) {
      cel.temTrap = true;
    }
  }
}

// Adiciona os irrigadores automáticos no labirinto.
function adicionarIrrigadores(quantidade) {
  for (let n = 0; n < quantidade; n++) {
    let i, j, cel;
    do {
      i = floor(random(colunas));
      j = floor(random(linhas));
      cel = grade[index(i, j)];
      if (cel.i === 0 && cel.j === 0) continue;
    } while (!cel || cel.temTrap || cel.ePlanta);

    regadores.push(new Regador(i, j));
  }
}

// Mostra o overlay de água na tela.
function mostrarBloqueio() {
  const div = document.getElementById("bloqueio-visao");
  div.style.display = "block";
  div.offsetHeight;
  div.style.opacity = "1";
}

// Esconde o overlay de água na tela.
function esconderBloqueio() {
  const div = document.getElementById("bloqueio-visao");
  div.style.opacity = "0";
  setTimeout(() => {
    div.style.display = "none";
  }, 1500);
}

// Vê se o player pisou nos regadores.
function checarIrrigadorNaPosicao(i, j) {
  for (let r of regadores) {
    if (r.estaNaPosicao(i, j) && r.estaAtivo()) {
      ultimoTempoEmRegador = millis();

      if (millis() - conquistasLabirinto.ultimoMolhado > 1000) {
        conquistasLabirinto.vezesMolhado++;
        conquistasLabirinto.ultimoMolhado = millis();
        if (
          conquistasLabirinto.vezesMolhado >= 10 &&
          !conquistas["molhado"].desbloqueada
        ) {
          conquistas["molhado"].desbloquear();
        }
      }

      if (!bloqueioVisivel) {
        mostrarBloqueio();
        bloqueioVisivel = true;
      }
      return;
    }
  }
}

// Marca os passos, para não se perder no labirinto.
function marcarPasso(i, j) {
  let cel = grade[index(i, j)];
  if (cel) {
    cel.foiPisado = true;
  }
}

// Adiciona as plantas. uma planta será adicionada a cada "dead-end" (caminho morto, sem saída), então o número de plantas depende no labirinto.
// Também depende se tem uma armadilha num dead-end. Se tiver, a planta não irá ser adicionada lá.
function adicionarPlantas() {
  for (let cel of grade) {
    if (cel.i === 0 && cel.j === 0) continue;

    let aberturas = cel.paredes.filter((p) => !p).length;
    let temRegador = regadores.some((r) => r.i === cel.i && r.j === cel.j);

    if (aberturas === 1 && !cel.temTrap && !temRegador) {
      cel.ePlanta = true;
    }
  }
}

// Adiciona os espantalhos.
function adicionarEspantalhos(quantidade) {
  for (let n = 0; n < quantidade; n++) {
    let i, j, cel, temRegador;
    do {
      i = floor(random(colunas));
      j = floor(random(linhas));
      cel = grade[index(i, j)];

      if (cel.i === 0 && cel.j === 0) continue;

      temRegador = regadores.some((r) => r.i === i && r.j === j);
    } while (!cel || cel.temTrap || cel.ePlanta || cel.temTrator || temRegador);

    espantalhos.push(new Espantalho(i, j));
  }
}

function calcularCaminhoParaOrigem(playerI, playerJ) {
  let visitados = new Set();
  let fila = [
    { i: playerI, j: playerJ, caminho: [{ i: playerI, j: playerJ }] },
  ];

  while (fila.length > 0) {
    let atual = fila.shift();
    let key = `${atual.i},${atual.j}`;

    if (visitados.has(key)) continue;
    visitados.add(key);

    if (atual.i === 0 && atual.j === 0) {
      return atual.caminho.reverse(); // caminho do player até (0,0)
    }

    const vizinhosOffsets = [
      [0, -1], // cima
      [1, 0], // direita
      [0, 1], // baixo
      [-1, 0], // esquerda
    ];

    for (let [di, dj] of vizinhosOffsets) {
      let ni = atual.i + di;
      let nj = atual.j + dj;
      let idxAtual = index(atual.i, atual.j);
      let idxVizinho = index(ni, nj);

      if (idxVizinho < 0) continue;

      let celAtual = grade[idxAtual];
      let celVizinho = grade[idxVizinho];

      // Verifica se não tem parede entre as células
      if (!temParedeEntre(celAtual, celVizinho)) {
        let vizKey = `${ni},${nj}`;
        if (!visitados.has(vizKey)) {
          fila.push({
            i: ni,
            j: nj,
            caminho: [...atual.caminho, { i: ni, j: nj }],
          });
        }
      }
    }
  }
  return [];
}
