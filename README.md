# p5js-agrinho
Projeto Agrinho

Jogue no github pages: https://rafael5541.github.io/p5-agrinho/

## O que é?
Um jogo simples de plantação, feito especialmente para o Agrinho 2025.  
Você explora um labirinto, rega vegetais e tira armadilhas!

## Como jogar?

- Escolha a dificuldade no menu inicial.
- Use o **mouse** para mover a câmera.
- Utilize as teclas **W**, **A**, **S** e **D** para mover seu personagem:
  - **W**: andar para frente
  - **A**: andar para a esquerda
  - **S**: andar para trás
  - **D**: andar para a direita
- Use **Shift** para correr! (Você não tem stamina infinita!)
- Cuidado com as armadilhas especiais em cada fase!  
  Aperte **E** para falar com NPCs, eles geralmente sabem como lidar com as armadilhas.
- Encontre os vegetais no labirinto e clique neles para regá-los!
- Quando encontrar todas as plantas, siga as setas e clique no trator para vencer!

## Créditos

- **Daniel Shiffman** – Pelo tutorial de geração de labirintos, usado como base para o algoritmo principal.  
  (https://editor.p5js.org/codingtrain/sketches/EBkm4txSA)
- **Projetos open-source da Unity** – Pela inspiração na criação visual das paredes em 3D.
- **Stack Overflow** – Por sempre ter uma resposta quando o código quebra, kk.
- **mystman12** - Por criar a textura de milho usada. (fonte: https://baldis-basics-in-education-and-learning.fandom.com/wiki/Farm?file=Corn.png)
- **Pixabay** - Pela maioria dos sons usados. (todos são royalty-free).

### Créditos links
- Armadilha de urso: https://www.artstation.com/artwork/6bJ0g5
- Drone: https://pxhere.com/en/photo/1515979 (sem fundo, apontando para cima).
- Fundo para o level dia: https://www.flickr.com/photos/8525214@N06/6055469523/ (modificado com Photopea para deixar mais claro).
- Fundo para o level estufa: https://www.eaiferias.com/2016/07/curitiba-jardim-botanico.html (modificado com Photopea para deixar o contraste mais alto).
- Fundo para o level noite: https://www.pexels.com/pt-br/foto/ceu-estrelado-1322715/
- Milho: https://baldis-basics-in-education-and-learning.fandom.com/wiki/Farm?file=Corn.png
- Passos:
  - passo1.mp3: https://pixabay.com/pt/sound-effects/st1-footstep-sfx-323053/
  - passo2.mp3: https://pixabay.com/pt/sound-effects/st2-footstep-sfx-323055/
  - passo3.mp3: https://pixabay.com/pt/sound-effects/st3-footstep-sfx-323056/
- Som desarmar: https://pixabay.com/pt/sound-effects/mag-in-82094/
- Som perder: https://pixabay.com/sound-effects/falled-sound-effect-278635/
- Musicas: feito pelo meu irmão. (https://www.instagram.com/f3lpxz/)
  - Musica tutorial/level 1: Cover de Piano Man (https://www.youtube.com/watch?v=hRlsu-4BNv8)
  - Musica level 2: Cover de Yesterday (https://www.youtube.com/watch?v=NrgmdOz227I)
  - Musica level 3: Se essa rua fosse minha (autor desconhecido, https://www.youtube.com/watch?v=A1C7GY0U3iw)
- Vozes: feito pelos meus amigos, com alguns ajuste no Audacity.
- Irrigador: https://sketchfab.com/3d-models/spinning-sprinkler-model-843f983fcd42485483746132ab55d753 (modificado para usar a textura do drone).
- Espantalho: https://milmo.fandom.com/pt-br/wiki/Espantalho
- NPCs: feito pelo meu amigo. (https://www.instagram.com/juaozinhu_qua26/)

## Programas usados

- [Visual Studio Code](https://code.visualstudio.com/) – Para programar o jogo
- [Photopea](https://photopea.com/) – Para editar imagens e sprites
- [Bandlab](https://bandlab.com/) – Para criar a trilha sonora do jogo
- [Audacity](https://github.com/audacity/audacity) - Para criar os efeito sonoros (SFX) do jogo.
Feito usando a distro Linux [Fedora](https://fedoraproject.org/)

## Por que?
Eu queria tentar fazer um jogo 3D pela primeira vez. Mesmo não tendo o MELHOR código, eu ainda aprendi muito, como fazer colisão em 3D, como gerar labirintos, como o eixo Z funciona, etc. E eu acho que foi uma experiência bem legal fazer esse jogo. Estou feliz com o resultado final, mesmo se não está perfeito.

#### Coisas para notar no código
- Eu uso **i** como variável X, e **j** como variável do Z. Todas as variáveis Y estão hardcoded para cada labirinto.
- A maioria do HUD, tela inicial, tela venceu, etc, é feito usando HTML.
- Organização dos arquivos:
  - sketch.js: Código essencial para iniciar o jogo em si. Raramente precisa ser mudado.
  - src/: A lógica do jogo para usar no arquivo inicial. Tentei colocar comentários explicando o que tudo faz, então se quiser mudar alguma coisa, não vai ser muito difícil.
- Usa MIT como licença.

