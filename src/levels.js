// Define os levels para a tela inicial.

const levels = [
  {
    nome: "Campo Básico",
    background: "assets/dia.jpg",
    musica: "assets/A happy day in the farm - f3lpxz.m4a",
    armadilhas: () => adicionarTraps(50),
    descricao: "Um campo tranquilo para iniciantes.",
  },
  {
    nome: "Estufa Encharcada",
    background: "assets/dia.jpg",
    musica: "assets/A happy day in the farm - f3lpxz.m4a",
    armadilhas: () => {
      adicionarTraps(30);
      adicionarIrrigadores(20);
    },
    descricao: "Cuidado com os regadores intermitentes!",
  },
];

function mostrarSelecaoDeNiveis() {
  document.getElementById("tela-inicial").style.display = "none";
  const telaSelecao = document.getElementById("tela-selecao-nivel");
  const botoesContainer = document.getElementById("botoes-niveis");
  const infoNivel = document.getElementById("info-nivel");

  telaSelecao.style.display = "flex";
  botoesContainer.innerHTML = "";

  levels.forEach((nivel, index) => {
    const btn = document.createElement("button");
    btn.textContent = nivel.nome;
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
