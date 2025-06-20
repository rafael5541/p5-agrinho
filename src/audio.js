// Código para tocar áudio. p5.Audio não funcionava bem (ficava parando de funcionar quando o mesmo som toca várias vezes), então fiz a minha.
// Feito por mim, com assistência do mdn web docs (https://developer.mozilla.org/en-US/docs/Web/API/AudioContext)
let volumeGlobal = 1.0;
let audioCtx;
let passosBuffers = [];
let desarmarBuffer = null;
let ganhouBuffer = null;
let musicasBuffers = {};
let gainNode;
let audioIniciado = false;
let carregamentoCompleto = false;

// Inicia o contexto de áudio global.
async function iniciarAudioContexto() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioCtx.createGain();
    gainNode.gain.value = volumeGlobal;
    gainNode.connect(audioCtx.destination);
  }
}

// Carrega o som.
async function carregarSom(caminho) {
  const resposta = await fetch(caminho);
  const arrayBuffer = await resposta.arrayBuffer();
  return await audioCtx.decodeAudioData(arrayBuffer);
}

// Carrega todos os sons que nós precisamos.
async function preload() {
  await iniciarAudioContexto();

  const caminhosPassos = [
    "assets/passo1.mp3",
    "assets/passo2.mp3",
    "assets/passo3.mp3",
  ];

  for (let caminho of caminhosPassos) {
    const buffer = await carregarSom(caminho);
    passosBuffers.push(buffer);
  }

  desarmarBuffer = await carregarSom("assets/desarmar.mp3");
  pegarBuffer = await carregarSom("assets/pegar.ogg");
  ganhouBuffer = await carregarSom("assets/ganhou.m4a");
  perdeuBuffer = await carregarSom("assets/perdeu.mp3");
  npc1Buffer = await carregarSom("assets/voz2.ogg");
  npc2Buffer = await carregarSom("assets/voz1.ogg");
  npc3Buffer = await carregarSom("assets/voz3.ogg");
  for (let level of levels) {
    if (level.musica) {
      musicasBuffers[level.musica] = await carregarSom(level.musica);
    }
  }
  carregamentoCompleto = true;

  const loadingScreen = document.getElementById("tela-carregamento");
  if (loadingScreen) {
    loadingScreen.style.display = "none";
  }
}

// Toca um som.
function tocarSom(buffer, loop = false) {
  const source = audioCtx.createBufferSource();
  source.loop = loop;
  source.buffer = buffer;
  source.connect(gainNode);
  source.start();

  return source;
}

// Para um som. (coloquei musica, por que vou só usar isso para parar a música do level kk)
function pararMusica(source) {
  if (source && typeof source.stop === "function") {
    try {
      source.stop();
    } catch (e) {}
  }

  if (source && typeof source.disconnect === "function") {
    try {
      source.disconnect();
    } catch (e) {}
  }
}

// Estou tentando fazer as funções do p5.Audio para essa, por causa do menu.js (que tem um slider de volume.)
function outputVolume(novoVolume) {
  volumeGlobal = novoVolume;
  if (gainNode) {
    gainNode.gain.value = volumeGlobal;
  }
}

function getOutputVolume() {
  return volumeGlobal;
}
