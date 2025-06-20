// Classe para as conquistas.
class Conquista {
  constructor(nome, descricao) {
    this.nome = nome;
    this.descricao = descricao;
    this.desbloqueada = this.carregarEstado();
  }

  desbloquear() {
    if (!this.desbloqueada) {
      this.desbloqueada = true;
      this.salvarEstado();
      console.log(
        `🏆 Conquista desbloqueada: ${this.nome} - ${this.descricao}`
      );
      this.exibirNotificacao();
    }
  }

  // Salva o estado no LocalStorage, para as conquistas persistir quando alguém sai da página.
  salvarEstado() {
    const dados = JSON.parse(
      localStorage.getItem("conquistasMilhopolis") || "{}"
    );
    dados[this.nome] = true;
    localStorage.setItem("conquistasMilhopolis", JSON.stringify(dados));
  }

  carregarEstado() {
    const dados = JSON.parse(
      localStorage.getItem("conquistasMilhopolis") || "{}"
    );
    return !!dados[this.nome];
  }

  exibirNotificacao() {
    const notificacao = document.createElement("div");
    notificacao.className = "conquista";
    notificacao.innerText = `🏆 ${this.nome}: ${this.descricao}`;

    Object.assign(notificacao.style, {
      position: "fixed",
      top: "-100px",
      right: "20px",
      backgroundColor: "#333",
      color: "white",
      padding: "12px 18px",
      borderRadius: "6px",
      boxShadow: "0 0 10px rgba(0,0,0,0.5)",
      fontFamily: "sans-serif",
      zIndex: 99999,
      opacity: 0.95,
      transition: "top 0.5s ease",
      cursor: "default",
      maxWidth: "300px",
      userSelect: "none",
    });

    document.body.appendChild(notificacao);

    notificacao.getBoundingClientRect();

    notificacao.style.top = "20px";
    setTimeout(() => {
      notificacao.style.top = "-100px";
      setTimeout(() => {
        notificacao.remove();
      }, 500);
    }, 8000);
  }
}
