// Código para tocar áudio. p5.Audio não funcionava bem (ficava parando de funcionar quando o mesmo som toca várias vezes), então fiz a minha.
// Feito por mim, com assistência do mdn web docs (https://developer.mozilla.org/en-US/docs/Web/API/AudioContext)
let volumeGlobal = 1.0;
let audioCtx;
let passosBuffers = [];
let desarmarBuffer = null;
let gainNode;

async function iniciarAudioContexto() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioCtx.createGain();
    gainNode.gain.value = volumeGlobal;
    gainNode.connect(audioCtx.destination);
  }
}

async function carregarSom(caminho) {
  const resposta = await fetch(caminho);
  const arrayBuffer = await resposta.arrayBuffer();
  return await audioCtx.decodeAudioData(arrayBuffer);
}

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
}

function tocarSom(buffer, loop = false) {
  const source = audioCtx.createBufferSource();
  source.loop = loop;
  source.buffer = buffer;
  source.connect(gainNode);
  source.start();
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
