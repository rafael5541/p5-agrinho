// Código para criar labirinto 3d. Algoritmo baseado no Daniel Shiffman (https://editor.p5js.org/codingtrain/sketches/EBkm4txSA) o que usa DFS (Depth-First Search).
// Código para o transformar em 3d feito por mim, com inspiração de vários projetos da Unity.

let imgMilho;
let imgDrone;
let imgArmadilha;
let bloqueioTimeout = null;
let ultimoTempoEmRegador = 0;
let bloqueioVisivel = false;

function preloadLabirinto() {
  imgMilho = loadImage("assets/milho.png");
  imgArmadilha = loadImage("assets/armadilha.png");
  imgDrone = loadImage("assets/drone.png");
}

function tocarSomDesarmar() {
  if (desarmarBuffer && audioCtx) {
    tocarSom(desarmarBuffer);
  }
}

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

    if (this.j === linhas - 1 && this.paredes[2]) {
      push();
      translate(0, 0, tamanho / 2);
      noStroke();
      texture(imgMilho);
      plane(tamanho);
      pop();
    }

    if (this.i === 0 && this.paredes[3]) {
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

    // Planta
    if (this.ePlanta && !this.plantaRegada) {
      push();
      translate(0, tamanho / 2 + 5, 0);
      fill("red");
      noStroke();
      sphere(tamanho * 0.2);
      pop();
    }

    // Regadores
    for (let r of regadores) {
      if (r.estaNaPosicao(this.i, this.j)) {
        push();
        translate(0, tamanho / 2 + 5, 0);
        noStroke();
        fill(r.ativo ? "blue" : "black");
        sphere(tamanho * 0.2);
        pop();
        break;
      }
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
      tocarSomDesarmar();
      return true;
    }
  }
}

// Classe para os irrigadores automáticos. Se o player estiver dentro quando está ativo, bloqueia a tela.
class Regador {
  constructor(i, j, intervalo = 3000, duracao = 1500) {
    this.i = i;
    this.j = j;
    this.ativo = false;

    setInterval(() => {
      this.ativo = true;
      setTimeout(() => {
        this.ativo = false;
      }, duracao);
    }, intervalo);
  }

  estaNaPosicao(x, y) {
    return this.i === x && this.j === y;
  }
}

function index(i, j) {
  if (i < 0 || j < 0 || i >= colunas || j >= linhas) {
    return -1;
  }
  return i + j * colunas;
}

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

// Gera o labirinto em si.
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
    if (cel && !cel.temTrap && !cel.ePlanta) {
      cel.temTrap = true;
    }
  }
}

// Adiciona os regadores automáticos no labirinto.
function adicionarIrrigadores(quantidade) {
  for (let n = 0; n < quantidade; n++) {
    let i, j, cel;
    do {
      i = floor(random(colunas));
      j = floor(random(linhas));
      cel = grade[index(i, j)];
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
  let emRegador = false;
  for (let r of regadores) {
    if (r.estaNaPosicao(i, j) && r.ativo) {
      emRegador = true;
      break;
    }
  }

  if (emRegador) {
    ultimoTempoEmRegador = millis();
    if (!bloqueioVisivel) {
      mostrarBloqueio();
      bloqueioVisivel = true;
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
