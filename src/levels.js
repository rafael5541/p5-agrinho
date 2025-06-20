// Define os levels para a tela inicial.

const levels = [
  {
    nome: "Tutorial",
    background: "assets/dia.jpg",
    musica: "assets/A happy day in the farm - f3lpxz.m4a",
    armadilhas: () => {
      return;
    },
    npcs: () => [
      new NPC(
        0,
        1,
        imgDrone,
        [
          ".-- --- .-- --..-- / ...- --- -.-. . / -- . / .- -.-. .... --- ..- -.-.--",

          "01010001 01110101 01100101 01110010 00100000 01100001 01100011 \n01101000" +
            "01100001 01110010 00100000 01110011 01100101 01100111 \n01110010 01100101" +
            "01100100 01101111 01110011 00101100 00100000 \n01101110 11000011 10101001" +
            "00111111 00100000 01010110 01101111 \n01110101 00100000 01110100 01100101" +
            "\n00100000 01100110 01100001 01101100 01100001 01110010 \n00100000 01110101" +
            "\n01101101 00101110 00101110 00101110",

          "VW1hIGpvdmVtIHRlbSBvIG1lc21vIG7Dum1lcm8gZG\n" +
            "UgaXJtw6NvcyBlIGlybcOjcy4gTWFzIGNhZGEgdW0g\n" +
            "ZG9zIGlybcOjb3MgZGVsYSB0ZW0gZHVhcyB2ZXplcyBt\n" +
            "ZW5vcyBpcm3Do29zIGRvIHF1ZSBpcm3Do3MuIFF1YW50\n" +
            "b3MgaXJtw6NvcyBlIGlybcOjcyBleGlzdGVtIG5lc3Nh\n" +
            "IGZhbcOtbGlhPw==",
        ],
        npc1Buffer,
        -PI
      ),
    ],
    colunas: 6,
    linhas: 6,
    tempo: 999,
    descricao: "Aprenda a jogar com este labirinto guiado.",
    labirintoPredefinido: true,
  },
  {
    nome: "Campo Básico",
    background: "assets/dia.jpg",
    musica: "assets/A happy day in the farm - f3lpxz.m4a",
    armadilhas: () => adicionarTraps(20),
    npcs: () => [
      new NPC(
        0,
        0,
        [imgNpc1, imgNpc1_falando],
        [
          "Ahhh, tá um dia bom né?",
          "Não pode ficar aí fazendo nada por muito tempo! Vai lá pegar as plantas!",
          "Mais, cuidado com as armadilhas. O zé ruéla lá decidiu colocar para não\nroubarem nossas plantas.",
          "Só clicar nelas que elas já saem.",
        ],
        npc1Buffer,
        -PI
      ),
    ],
    colunas: 10,
    linhas: 10,
    tempo: 3,
    descricao: "Um campo tranquilo para iniciantes.",
  },
  {
    nome: "Estufa Encharcada",
    background: "assets/estufa.jpg",
    musica: "assets/The watered plants - f3lpxz.m4a",
    npcs: () => [
      new NPC(
        0,
        0,
        [imgNpc2, imgNpc2_falando],
        [
          "Mais um dia só coletando planta. Mais hoje está diferente!",
          "A cidade bancou a plantação, e adicionou uns irrigadores para\nas planta!",
          "Só toma cuidado, não passa quando o irrigador está jogando\nágua, se não vai se molhar todo.",
          "Essa parceria entre campo e cidade faz a diferença no cultivo. Agora\nas plantas estão crescendo muito mais rápido!",
          "Tecnologia ajuda, mas nunca vai tirar o trabalho dos cultivadores!",
        ],
        npc2Buffer,
        -PI
      ),
    ],
    armadilhas: () => {
      adicionarTraps(30);
      adicionarIrrigadores(30);
    },
    colunas: 10,
    linhas: 15,
    tempo: 5,
    descricao: "Cuidado com os regadores intermitentes!",
  },
  {
    nome: "Noite Assombrada",
    background: "assets/noite.jpg",
    musica: "assets/Noite assombrada - f3lpxz.m4a",
    npcs: () => [
      new NPC(
        0,
        0,
        imgNpc3,
        [
          "Ui! Trabalhando nessa noite e nesse frio é pra acabar mesmo...",
          "E também é mó assustador! Colocaram espantalhos para assustar os\npássaros.",
          "É um espantalho meio diferenciado. Só não correr nele e você vai ficar de\nboa.",
          "Nem sei o que vai acontecer se você andar correndo...",
        ],
        npc3Buffer,
        -PI
      ),
    ],
    armadilhas: () => {
      adicionarTraps(10);
      adicionarIrrigadores(15);
      adicionarEspantalhos(20);
    },
    colunas: 15,
    linhas: 15,
    tempo: 10,
    descricao: "Uma noita normal... Eu espero...",
  },
];

function mostrarSelecaoDeNiveis() {
  document.getElementById("tela-inicial").style.display = "none";
  const telaSelecao = document.getElementById("tela-selecao-nivel");
  const botoesContainer = document.getElementById("botoes-niveis");
  const infoNivel = document.getElementById("info-nivel");

  telaSelecao.style.display = "flex";
  botoesContainer.innerHTML = "";

  const progresso =
    JSON.parse(localStorage.getItem("progressoMilhopolis")) || {};

  levels.forEach((nivel, index) => {
    const melhorTempo = progresso[index];

    const btn = document.createElement("button");
    btn.innerHTML = `
      ${nivel.nome}
      ${
        melhorTempo !== undefined
          ? (() => {
              const duracaoDoNivel = levels[index].tempo * 60;
              const tempoEconomizado = duracaoDoNivel - melhorTempo;
              const min = Math.floor(tempoEconomizado / 60);
              const seg = (tempoEconomizado % 60).toString().padStart(2, "0");
              return `<br><small>Melhor tempo: ${min}:${seg}</small>`;
            })()
          : ""
      }
    `;

    btn.style = `
      padding: 15px 30px;
      font-size: 22px;
      border: none;
      border-radius: 10px;
      background: #2e7d32;
      color: white;
      cursor: pointer;
      transition: background 0.3s;
    `;

    btn.onmouseover = () => {
      infoNivel.innerHTML = `Nível: ${nivel.nome}<br>Descrição: ${nivel.descricao}`;
    };
    btn.onmouseout = () => {
      infoNivel.textContent = "Passe o mouse sobre um nível para ver detalhes.";
    };
    btn.onclick = () => {
      nivelAtual = index;
      telaSelecao.style.display = "none";
      document.getElementById("tela-carregamento").style.display = "flex";
      iniciarJogo();
    };

    botoesContainer.appendChild(btn);
  });
}
