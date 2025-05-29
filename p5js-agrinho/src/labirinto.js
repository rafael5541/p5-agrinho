// Código para criar labirinto 3d. Algoritmo baseado no Daniel Shiffman (https://editor.p5js.org/codingtrain/sketches/EBkm4txSA) o que usa DFS (Depth-First Search).
// Código para o transformar em 3d feito por mim, com inspiração de vários projetos da Unity.

let imgMilho;
let imgArmadilha;
let sonsDesarmar = [];

function preloadLabirinto() {
  imgMilho = loadImage("assets/milho.png");
  imgArmadilha = loadImage("assets/armadilha.png");
  for (let i = 0; i < 10; i++) {
    sonsDesarmar.push(loadSound("assets/desarmar.mp3"));
  }
}

// Por alguma razão, o som buga depois de algum tempo. Ai eu só carrego várias vezes o mesmo som, e dou play.
let somIndex = 0;

function tocarSomDesarmar() {
  if (sonsDesarmar.length > 0) {
    let som = sonsDesarmar[somIndex % sonsDesarmar.length];
    som.stop(); // Garante que não bugue
    som.play();
    somIndex++;
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
      plane(tamanho, tamanho);
      pop();
    }

    if (this.paredes[1]) {
      push();
      translate(tamanho / 2, 0, 0);
      rotateY(HALF_PI);
      noStroke();
      texture(imgMilho);
      plane(tamanho, tamanho);
      pop();
    }

    if (this.j === linhas - 1 && this.paredes[2]) {
      push();
      translate(0, 0, tamanho / 2);
      noStroke();
      texture(imgMilho);
      plane(tamanho, tamanho);
      pop();
    }

    if (this.i === 0 && this.paredes[3]) {
      push();
      translate(-tamanho / 2, 0, 0);
      rotateY(HALF_PI);
      noStroke();
      texture(imgMilho);
      plane(tamanho, tamanho);
      pop();
    }

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

function gerarLabirinto() {
  let atual = grade[0];
  let pilha = [];

  atual.visitado = true;

  while (true) {
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
  }
}

function adicionarTraps(quantidade) {
  for (let n = 0; n < quantidade; n++) {
    let i = floor(random(colunas));
    let j = floor(random(linhas));
    let cel = grade[index(i, j)];
    if (cel && !cel.temTrap) {
      cel.temTrap = true;
    }
  }
}

function marcarPasso(i, j) {
  let cel = grade[index(i, j)];
  if (cel) {
    cel.foiPisado = true;
  }
}
