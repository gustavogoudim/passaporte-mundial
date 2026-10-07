# Passaporte Mundial — "Com qual figura política você se parece?"

Fonte da verdade do projeto. Toda decisão nova ou alterada é registrada aqui.

## Contexto
- Público: alunos de ensino médio de escola pública, 15–17 anos. Uso em dinâmica em sala.
- Facilitador: formado em Relações Internacionais.
- Idioma: português do Brasil.

## Regra principal
- NENHUM resultado pode gerar constrangimento. Todas as figuras são democráticas e moderadas; todo resultado é positivo.
- O teste mede política em três dimensões: estilo de atuação, causas e um eixo ideológico SUAVE.

### Proteções ideológicas (obrigatórias)
- O resultado NUNCA mostra rótulo de esquerda/direita.
- Perguntas usam linguagem neutra, sem termos partidários.
- As figuras cobrem todo o espectro democrático, sem extremos.
- Brasileiros: só figuras históricas (anteriores a 1985) ou diplomatas. Nenhum político brasileiro pós-1985.

## Tamanho
- 36 figuras (resultados possíveis) e 20 perguntas. (Eram 30; 6 acrescentadas em 2026-10-07.)

## Figuras (lista final — 30)
**Líderes de Estado (11):** Nelson Mandela, Angela Merkel, Abraham Lincoln, John F. Kennedy, Franklin D. Roosevelt, Jacinda Ardern, Mikhail Gorbachev, Ellen Johnson Sirleaf, Jimmy Carter, Juscelino Kubitschek, Dom Pedro II.

**Diplomacia (8):** Barão do Rio Branco, Rui Barbosa, Joaquim Nabuco, Bertha Lutz, Sérgio Vieira de Mello, Kofi Annan, Eleanor Roosevelt, Princesa Diana (campanha contra minas terrestres).

**Ativismo e resistência (11):** Malala Yousafzai, Martin Luther King Jr., Mahatma Gandhi, Rosa Parks, Desmond Tutu, Wangari Maathai, Corazón Aquino, Zilda Arns, Tiradentes, Zumbi dos Palmares, Harriet Tubman.

**Acrescentadas em 2026-10-07 (6):** Dag Hammarskjöld (Diplomacia), Willy Brandt (Líder), Václav Havel (Líder), Óscar Arias (Líder), André Rebouças (Ativismo), Ralph Bunche (Diplomacia).
Tentamos usar o catálogo do 12 Axes como fonte, mas a API dele é de uso exclusivo do próprio site, e o catálogo inclui extremos e políticos atuais, o que contraria as premissas. Os nomes acima foram escolhidos por Claude seguindo as premissas.

Totais: Líderes 14, Diplomacia 10, Ativismo 12 · 12 mulheres, 24 homens · 11 brasileiros.

### Excluídos de propósito — NÃO sugerir
Churchill, Thatcher, Reagan, Obama, Mujica, Che Guevara, Aung San Suu Kyi, Oswaldo Aranha, qualquer político brasileiro pós-1985, Neymar, Anitta, Musk, Greta e afins.

## Modelo de traços (nota 0–5 por figura)
| Grupo | Traços |
|---|---|
| Estilo | Diálogo, Firmeza, Estratégia, Empatia |
| Causa | Paz, Igualdade e direitos, Liberdade e democracia, Desenvolvimento |
| Ideológico suave | Ritmo da mudança (0 = aos poucos, 5 = ruptura); Quem resolve (0 = governo, 5 = sociedade) |

- Cálculo: as respostas formam o vetor do aluno nos 10 traços, comparado com as 30 figuras em `js/calculo.js`:
  - 8 traços de estilo e causa: correlação (compara o FORMATO do perfil, o que se destaca mais), mapeada para 0–1;
  - 2 eixos ideológicos: distância absoluta normalizada;
  - similaridade = 0,8 × perfil + 0,2 × ideologia (ideologia é só tempero).
- Resultado: figura mais próxima + top 3 com % de proximidade.

## Perguntas
- 20 perguntas, 4 alternativas cada, sem opção neutra.
- Estilo: mistura — ~14 situações do cotidiano do aluno (grêmio, trabalho em grupo, conflito na turma, problema no bairro) + ~6 cenários hipotéticos de RI ("você é mediador da ONU e...").
- Nenhuma alternativa pode parecer a "certa" ou a "feia": as 4 precisam ser igualmente atraentes.

### Pontuação
- Esparsa: cada alternativa dá +2 no traço principal e +1 num traço secundário.
- Foco das perguntas: 8 de estilo (cada traço de estilo é foco 2×), 8 de causa (cada traço de causa é foco 2×), 4 ideológicas (2 Ritmo, 2 Quem resolve).
- Estilo e causa: soma normalizada pelo máximo possível em cada traço → escala 0–5.
- Eixos ideológicos: medidos como POSIÇÃO (cada alternativa marca 0–5; vale a média das escolhas), não por soma. Padrão 2,5 se o aluno não tocar no eixo.
- Pesos finais calibrados pela simulação de 1000 perfis.

## Tela de resultado
- Card curto que cabe numa tela de celular:
  - foto;
  - título-arquétipo positivo (ex.: "O Conciliador");
  - 3 qualidades em comum com o aluno;
  - 2–3 linhas de história;
  - frase famosa, só com autoria confirmada;
  - gancho de RI (ex.: "Tema: apartheid e reconciliação").
- Top 3 figuras mais parecidas, com %.
- Botão "Ver mais" → FICHA DENTRO DO SITE (sem link externo):
  - bio curta; contexto histórico; o que fez no mundo; 2 curiosidades; por que importa para RI.
- Fotos: Wikimedia Commons (licença livre ou domínio público), com crédito de autor e licença.

### Extras inspirados no 12 Axes (aprovados em 2026-10-07)
Referência: https://12axes.vercel.app/. Dele aproveitamos só o formato, NÃO os rótulos esquerda/direita, as ideologias extremas, os temas polêmicos (religião, armas, imigração, moral) nem o "mais distante de você".
1. Comparação traço por traço: barras "você × figura" nos 8 traços de estilo e causa.
2. Mais parecido em cada categoria (Líder, Diplomacia, Ativismo), além do top 3.
3. Imagem do resultado para compartilhar (formato story, gerada no celular, sem servidor).
4. "Combinação rara": quando os dois traços mais fortes do aluno aparecem juntos em poucas figuras, mostrar um aviso positivo.
5. Tela "Como funciona", explicando o cálculo em linguagem simples.
6. Compartilhar nas redes: WhatsApp, Telegram, X e Facebook (links de compartilhamento com texto + link do resultado) e imagem para stories (Instagram/TikTok).
- "Quem tem menos a ver": pedido e depois RETIRADO pelo facilitador (2026-10-07), por contrariar a regra de nenhum resultado constrangedor. NÃO implementar.
- O formato das perguntas continua sendo situações com 4 alternativas (não "concordo/discordo").

## Regras de conteúdo
- Títulos e qualidades sempre positivos. Nenhuma figura pode ter título "pior" que as outras.
- Textos factuais e neutros, sem juízo partidário, linguagem adequada a 15–17 anos.
- Temas sensíveis (escravidão, apartheid, assassinatos, guerras) tratados com cuidado e tom adequado à idade.
- Português do Brasil.

## Tecnologia
- HTML + CSS + JavaScript puro, página única, sem framework e sem build.
- Todo o cálculo roda no celular do aluno; sem servidor nem banco de dados.
- Fotos baixadas do Commons, comprimidas (~400px, ~30 KB, WebP/JPEG) e servidas pelo próprio site.
- Meta: site inteiro < 1,5 MB; funciona offline depois de carregado.
- Scripts de verificação em Node.

## Hospedagem e acesso
- GitHub Pages (gratuito, HTTPS, sem anúncios). Claude configura via terminal; o facilitador precisa de conta no GitHub.
- Acesso por QR code (PNG/PDF para projetar ou imprimir) + link escrito por extenso como plano B.
- Sem encurtadores de link.

## Visual e identidade
- Nome: **Passaporte Mundial**. Subtítulo: "Com qual figura política você se parece?".
- Tema passaporte; o resultado aparece como carimbo de visto.
- Cores: azul-noite (fundo com estrelas), âmbar, turquesa e lilás de destaque; cartões em papel claro para leitura. (Tema inicial azul-petróleo/off-white foi achado "chocho" pelo facilitador e trocado em 2026-10-07.)
- Animações: globo com avião em órbita, esteira com as fotos das figuras na capa, avião percorrendo a rota de progresso, cartões deslizando, revelação com suspense (fotos passando), carimbo batendo, confete, barras crescendo e porcentagens contando. Tudo desligado com `prefers-reduced-motion`. Sem bibliotecas.
- Proibido: vermelho dominante e a combinação verde+amarelo (leitura partidária no Brasil).
- Tom leve, falando com "você", sem gírias forçadas.

## Ordem de trabalho
1. Fechar decisões pendentes (abaixo).
2. Fase 1 — dados das figuras. NÃO fazer telas antes da aprovação dos dados pelo facilitador.
3. Fases seguintes (perguntas, telas, publicação) só depois.

## Fase 1 — dados das figuras
`figuras.json`, um objeto por figura:
- `id`, `nome`, `pais`, `periodo`, `categoria`, `titulo`;
- `tracos` (10 notas);
- `card { qualidades[3], historia, frase, fonteFrase, ganchoRI }`;
- `ficha { bio, contexto, oQueFez, curiosidades[2], porQueImportaRI }`;
- `foto { url, arquivo, autor, licenca }` — `url` = página/arquivo original no Commons; `arquivo` = cópia local comprimida.

Página simples de revisão: as 30 figuras e as notas lado a lado.

Verificação obrigatória (script):
- 30 figuras, 10 traços cada, todas as notas entre 0 e 5;
- matriz de similaridade: nenhum par acima de ~95% (se passar, ajustar notas);
- 1000 perfis aleatórios: nenhuma figura inalcançável nem acima de ~10% dos resultados;
- URLs das fotos respondem.

## Resultado: salvar, compartilhar e visão da turma
- NENHUM dado pessoal é coletado: sem nome, login, e-mail, respostas ou cookies.
- O resultado vira um link próprio só com o id da figura (ex.: `.../#r=mandela`).
- O progresso do quiz fica salvo só no celular do aluno (localStorage). "Refazer" apaga.
- **Contagem anônima (mudança aprovada pelo facilitador em 2026-10-07; antes era "sem analytics"):** GoatCounter, sem cookies e sem IP armazenado. O código do site fica em `js/config.js` (vazio = desligado). Conta:
  - visitas (`/`) e entradas por link compartilhado (`/link-compartilhado`);
  - cada teste terminado: `/resultado/{TURMA}/{id-da-figura}`.
  O aviso de contagem anônima aparece na capa e em "Como funciona". A versão offline nunca conta.
- **Turma ao vivo** (`facilitador.html`): "Nova turma" gera um código de 4 letras e um QR com `?turma=CÓDIGO`. A página lê a cada 20 s os contadores públicos do GoatCounter (`/counter/{caminho}.json`, exige a opção "Allow adding visitor counts" ligada) e mostra o placar. Sem `?turma`, a turma é `geral`. Toque na figura = ajuste manual (plano B sem internet).
- Também no facilitador: mural das figuras e roteiro de debate.

## Acessibilidade
- Contraste mínimo WCAG AA; fonte base ≥ 16px; botões ≥ 48px de altura.
- Funciona com leitor de tela: textos alternativos nas fotos, botões com rótulo, ordem lógica de foco, navegação por teclado.
- Sem limite de tempo; respeita `prefers-reduced-motion`.
- Linguagem simples; frases curtas.

## Se a internet cair
- Depois que a página carrega, tudo funciona offline (dados, fotos e cálculo já estão no aparelho).
- Service worker simples para o site abrir de novo sem rede depois da primeira visita.
- Plano B 1: versão em ARQUIVO ÚNICO (`passaporte-offline.html`, fotos embutidas) para mandar por WhatsApp/Bluetooth/pendrive.
- Plano B 2: modo projetado — o facilitador abre o teste no próprio notebook/celular e a turma responde junto.

## Decisões pendentes
Nenhuma. Todas fechadas em 2026-10-07 (6 e 7 decididas por Claude a pedido do facilitador).

## Arquivos do site
- `index.html`, `css/estilo.css`, `js/app.js`, `js/calculo.js`: o teste.
- `figuras.json`, `perguntas.json`: os dados (fonte da verdade).
- `facilitador.html`: contador da turma, mural e roteiro de debate (só no aparelho do facilitador).
- `sw.js`, `manifest.webmanifest`: funcionamento offline. Ao mudar arquivos, trocar `VERSAO` em `sw.js`.
- `passaporte-offline.html`: gerado por `node scripts/gerar-offline.mjs` (arquivo único com fotos embutidas).
- Barras do aluno na tela são reescaladas (o traço mais forte vale 5) só para exibição.

## Histórico de perguntas
- 2026-10-07: removida "A escola ganhou uma verba extra..." (facilitador não gostou). Entrou "Você ganhou 1 minuto ao vivo num programa visto pelo Brasil inteiro...". Fonte das perguntas: `perguntas.json`.

## Estado atual
- Fase 1 entregue em 2026-10-07. Dados ainda AGUARDANDO REVISÃO do facilitador.
- Em 2026-10-07 o facilitador pediu para implementar tudo (perguntas e telas) sem esperar a revisão. As telas leem `figuras.json`, então ajustes nos dados não exigem retrabalho.
- Arquivos: `figuras.json` (fonte dos dados), `fotos/` (30 JPG comprimidos, ~700 KB no total), `js/calculo.js`, `revisao.html` (gerada), `scripts/verificar.mjs`, `scripts/gerar-revisao.mjs`, `scripts/buscar-fotos.mjs`, `dados/fotos-meta.json`.
- Depois de editar `figuras.json`: `node scripts/verificar.mjs` e `node scripts/gerar-revisao.mjs`.
- Perguntas e telas implementadas em 2026-10-07.
- PUBLICADO em 2026-10-07: https://gustavogoudim.github.io/passaporte-mundial/ (repo github.com/gustavogoudim/passaporte-mundial, Pages na branch main). Para atualizar: commit + `git push`; trocar `VERSAO` em `sw.js` a cada mudança.
- QR code: `qrcode.pdf` (cartaz A4), `qrcode.png`, `qrcode.html`.
- Frase do Rebouças ("Quem possui a terra possui o homem") marcada para o facilitador decidir: é hoje associada a movimentos de reforma agrária.
- Zumbi não tem frase (não há falas registradas); o card mostra no lugar a nota sobre o 20 de novembro.
