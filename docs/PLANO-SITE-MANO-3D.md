# Manô — plano técnico do site de apresentação em 3D

Data: 15/09/2026. Versão: 1.3 — primeira evolução da capa implementada; vídeo cinematográfico e ampliação das demais seções pendentes.

## LEIA PRIMEIRO — estado atual e ponto de retomada

O site já existe. **Não recriar do zero nem executar as etapas históricas como se estivessem pendentes.** A seção 24 registra a implementação real e a seção 25 define a próxima evolução. Elas prevalecem sobre propostas das versões 1.0/1.1 que descrevem o desenvolvimento no futuro.

- Site: https://mano-site-seven.vercel.app — projeto Vercel `mano-site`.
- Aplicativo: https://manaus-live-transit.vercel.app — projeto Vercel `manaus-live-transit`.
- Repositório: https://github.com/biellreis/manaus-live-transit — branch `master`.
- Commit da implementação: `10a58f4` (`feat(website): build independent Mano presentation and installation journey`).
- Código do site: `website/`; registros complementares: `docs/site-mano/`.
- Último retorno do usuário: **as informações ficaram perfeitas**; deseja uma capa com vídeo muito grande ao fundo, como AVA, e a mesma presença visual nas demais seções.
- Atualização com orçamento restante: capa ampla com fundo luminoso azul/laranja, aparelhos maiores, título “Manô, bora?” e apoio “Manaus na sua mão.” aplicados. Animação Three.js inicial de quatro segundos, seguida de renderização sob demanda ao mouse. Não é vídeo.
- Próxima ação: produzir storyboard, vídeo e posters responsivos conforme seção 25; depois ampliar as demais seções. A copy foi aplicada como escolha de implementação revisável, sem confirmação específica da frase pelo usuário.

Este documento é o contrato de continuidade do trabalho. Ele define o resultado visual, a arquitetura, os arquivos de origem, a sequência de construção e os critérios de aceite. A próxima IA deve ler este arquivo inteiro, conferir o estado real do repositório e continuar pela primeira etapa incompleta. As configurações propostas abaixo não significam que arquivos, modelos, domínios ou integrações já existam.

## 1. Objetivo e limites

Criar um site independente de apresentação do Manô, com aparência editorial premium, minimalista e tridimensional. O visitante deve entender o aplicativo olhando para as telas e encontrar imediatamente dois botões: Apple/iPhone e Android. A experiência apresenta planejamento de viagens, linhas, ida/volta, veículos no mapa, terminais, paradas e alertas.

O produto é o Manô. Os aparelhos são suportes para demonstrar suas funcionalidades. O objetivo visual é a qualidade de apresentação das referências Apple e AVA, com composição própria e identidade Manô; não reproduzir textos, modelos, vídeos ou materiais proprietários dessas marcas.

Este plano começou como documento de preparação. Posteriormente o usuário solicitou a criação do site, e a primeira implementação foi concluída. A revisão 1.2 documenta o resultado e a evolução pretendida; sua existência, por si só, não autoriza executar novas fases sem pedido de desenvolvimento.

Requisitos fixos para a futura implementação:

- Site separado do aplicativo em código, build e publicação.
- Dois botões de instalação no primeiro bloco, acessíveis antes de carregar o 3D.
- Interface em português, textos curtos, títulos grandes e espaçamento generoso.
- iPhone e Android tridimensionais com capturas reais do Manô.
- Paleta branca, azul e laranja; preto/grafite como base neutra.
- Motion suave, com pausas para leitura e sem impedir a rolagem.
- Site utilizável em celulares modestos e sem suporte a 3D.
- Instalação honesta: não prometer instalação automática nem esconder elementos controlados pelo navegador.

## 2. Referências e interpretação visual

Referências consultadas em 15/09/2026: [Apple — iPhone 18 Pro](https://www.apple.com/br/iphone-18-pro/) e [AVA](https://www.ava.com/). A versão 1.1 amplia a inspeção para cenas internas, estrutura semântica, mídia declarada no DOM, navegação e uma tentativa de viewport estreito. A seção 17 registra evidências e limites. Não houve auditoria completa de rede, profiling de GPU ou acesso ao código de autoria. Os movimentos propostos para o Manô não devem ser atribuídos às referências sem evidência.

| Referência | Observação | Tradução para o Manô |
| --- | --- | --- |
| Apple | Produto em grande escala sobre fundo escuro, iluminação controlada e título curto; conteúdo organizado em capítulos | Aparelhos grandes, recortes de detalhes e capítulos com uma funcionalidade por vez |
| AVA | Abertura escura com hardware em destaque e tipografia branca muito grande | Contraste forte, silhuetas metálicas e poucas palavras por quadro |
| Ambas | Hierarquia clara entre produto, mensagem e ação | Tela do aplicativo como foco; botões de instalação sempre fáceis de encontrar |

A sensação de profundidade virá de perspectiva, oclusão, materiais, luz e movimento coordenados. Sombras em cartões e inclinação CSS isolada não satisfazem o requisito principal de aparelhos 3D.

### Direção visual própria

Conceito: **“Manaus na sua mão.”** Uma linha azul percorre os capítulos e conecta os recursos; o laranja identifica destinos, volta e alertas. A linha será abstrata quando decorativa. Só será apresentada como trajeto real quando derivada de geometria verificada do aplicativo.

Não usar partículas, confete, hologramas genéricos, fundo estrelado, texto girando ou brilho excessivo. Evitar uma página inteira de cartões iguais. Alternar cenas amplas, aproximações e duplas de aparelhos, mantendo o mesmo cenário e a mesma linguagem de luz.

## 3. Estado real do projeto e inventário

O aplicativo atual usa React, TypeScript e Vite em `client/`. Sua folha `client/src/index.css` define Outfit, branco `#FFFFFF`, azul `#3B82F6` e laranja `#F97316`, com fundos escuros. Essa é a fonte da identidade deste plano; existem variações locais nas telas que devem ser preservadas nas capturas, sem recoloração global.

O manifesto atual está em `client/public/manifest.json`, com nome Manô, `start_url: /` e `display: standalone`. A origem conhecida do aplicativo é `https://manaus-live-transit.vercel.app`. Confirmar que permanece sendo a origem de produção antes de integrar os botões. Domínios personalizados ainda não foram definidos.

Foram encontradas 14 capturas PNG em `screenshots/`, todas com 1206 × 2622 pixels. Inspecionadas visualmente nesta preparação: home, linha 640 ida e detalhes de caminhada/linha 409. As demais tiveram presença e dimensões verificadas; precisam de revisão visual individual na etapa de assets.

| Arquivo relativo à raiz | Uso planejado |
| --- | --- |
| `screenshots/02_inicio_home.png` | Tela principal do hero e encerramento |
| `screenshots/03_linhas_catalogo.png` | Catálogo de linhas |
| `screenshots/05_linhas_busca_640.png` | Busca da linha 640 |
| `screenshots/06_terminais_paradas_proximas.png` | Paradas próximas |
| `screenshots/07_terminais_integracao_t1_t6.png` | Terminais T1–T6 |
| `screenshots/08_estacoes_transferencia_e1_e4.png` | Estações E1–E4 |
| `screenshots/09_alertas_transito_todos.png` | Alertas de trânsito |
| `screenshots/10_alertas_fiscalizacao.png` | Visão complementar dos alertas, após revisão editorial |
| `screenshots/11_planejador_viagens_como_chegar.png` | Origem e destino |
| `screenshots/12_rota_linha_640_ida.png` | Trajeto de ida e veículos |
| `screenshots/13_rota_linha_640_volta.png` | Trajeto de volta |
| `screenshots/17_confirmacao_trajeto_terminal2_imprensa.png` | Opção de viagem entre locais |
| `screenshots/19_confirmacao_trajeto_rua_kobe_imprensa.png` | Resultado do planejamento |
| `screenshots/20_detalhes_rota_rua_kobe_caminhada_osm.png` | Caminhada, embarque e destino |

Logos disponíveis: `client/public/ICONE-APLICATIVO.png`, `client/public/LOGO-APP-MANÔ.png` e peças em `client/public/logo-assets/`. Conferir resolução e transparência antes de usar. Copiar para nomes ASCII previsíveis no novo site, mantendo os originais.

Não foram encontrados modelos `.blend`, `.glb` ou `.gltf` na busca de arquivos do projeto. A modelagem é uma entrega futura, não um material já disponível.

### Preservação do trabalho existente

Na inspeção havia exclusões de screenshots, três capturas novas não rastreadas e `scripts/capture_new_screens.py` não rastreado. Essas alterações pertencem ao trabalho existente. Não restaurar arquivos excluídos, sobrescrever capturas ou incluir tudo em um commit indiscriminadamente. Verificar `git status` novamente ao retomar.

## 4. Sistema de design

### Cores e materiais

| Token proposto | Valor | Aplicação |
| --- | --- | --- |
| `--mano-white` | `#FFFFFF` | Títulos, ícones, informação principal |
| `--mano-blue` | `#3B82F6` | Ação principal, linha de ida e iluminação azul discreta |
| `--mano-orange` | `#F97316` | Destino, volta e acento complementar |
| `--background` | `#09090B` | Fundo contínuo |
| `--surface` | `#121214` | Superfícies de apoio |
| `--muted` | `#A1A1AA` | Texto secundário |

Base escura ocupa aproximadamente 80–90% da composição; branco organiza a informação; azul e laranja entram pontualmente. Não adicionar outras cores de destaque. Metal neutro nos aparelhos; reflexos azuis e laranjas não podem alterar a leitura da tela. Verificar contraste de botões: não assumir que branco sobre qualquer azul ou laranja atende texto pequeno; ajustar texto escuro ou tom de fundo conforme medição WCAG.

### Tipografia e grid

- Outfit local em WOFF2, com licença registrada. Peso 500 para corpo, 600–700 para títulos; reduzir arquivos usando fonte variável se compensar em tamanho.
- H1: `clamp(44px, 7.5vw, 112px)`, entrelinha 0,98–1,05; até duas linhas no desktop e três no celular.
- H2: `clamp(32px, 5vw, 72px)`, entrelinha 1,05–1,12; preferir 3–7 palavras.
- Corpo: 16–20px, entrelinha 1,45–1,6; até 25 palavras de apoio por capítulo.
- Conteúdo máximo de 1280px; cenas podem sangrar até 1600px ou a largura da tela.
- Grid desktop de 12 colunas com gap de 24px; tablet 8; celular 4, gap de 16px.
- Margens laterais: 20px no celular, 32px no tablet, 64px no desktop; respeitar safe areas.
- Espaçamentos em múltiplos de 8px. Entre capítulos: 80–160px conforme tela.
- Botões com pelo menos 48px de altura e área clicável, foco visível, ícone e rótulo textual.

Não importar a folha global do aplicativo: ela bloqueia a rolagem de `html/body` para o comportamento do PWA. O site terá fluxo de documento normal, seleção de texto e zoom acessíveis.

## 5. Roteiro de conteúdo e storyboard

Os títulos abaixo são copy inicial proposta, não publicidade já publicada. Validar recursos e termos antes da entrega. Evitar números de usuários, velocidade garantida, precisão absoluta ou cobertura completa sem evidência.

| Capítulo | Texto curto proposto | Cena e interação | Capturas |
| --- | --- | --- | --- |
| 01. Abertura | “Manaus na sua mão.” / “Planeje sua viagem e acompanhe seu ônibus.” | iPhone e Android em três quartos, telas visíveis; dois botões logo abaixo do título | Home + linha 640 ida |
| 02. Planejamento | “Seu destino. Seu caminho.” | Aproximação de um aparelho; origem/destino transiciona para resultado, sem inventar uma UI | 11 → 19 → 20 |
| 03. Linhas | “Encontre sua linha.” | Aparelho frontal; catálogo se aproxima e troca para busca da 640 | 03 → 05 |
| 04. Ida e volta | “Veja o trajeto completo.” | Dois aparelhos lado a lado; ida azul e volta laranja; seletor HTML acessível permite alternar | 12 + 13 |
| 05. Ônibus no mapa | “Acompanhe seu ônibus.” | Recorte ampliado da tela com os veículos; movimento de câmera discreto | 12; captura complementar se necessário |
| 06. Conexões | “Sua próxima conexão.” | Aparelho com paradas próximas; planos auxiliares de terminais e estações em profundidade pequena | 06 → 07 → 08 |
| 07. Alertas | “Saiba antes de sair.” | Aparelho quase frontal; destaque laranja no conteúdo de alertas | 09; 10 apenas se pertinente |
| 08. Instalação | “Leve o Manô com você.” | Dupla de aparelhos retorna; dois botões, instrução curta e FAQ discreta | Home + melhor rota aprovada |

O capítulo 05 mostra uma captura de um momento, não uma transmissão ao vivo. Se houver animação demonstrativa de um veículo, identificá-la como demonstração e não apresentar números como dados atuais. O site não deve consultar Apify, GPS ou APIs de ônibus para montar sua vitrine.

### Primeiro quadro, antes de qualquer animação

Desktop: marca pequena no topo, links “Recursos” e “Instalar”; título e os dois botões em área de leitura à esquerda, dupla de aparelhos à direita. Em 1440 × 900 os dois botões devem aparecer sem rolar. Reservar pelo menos 48px entre conteúdo textual e o limite visual dos aparelhos.

Celular: marca, título, apoio e botões precedem a imagem. Dois botões lado a lado se couberem com rótulos legíveis; caso contrário empilhados. O visual dos aparelhos ocupa o espaço restante e continua abaixo da dobra. Nunca reduzir botões ou esconder a instalação para caber o aparelho inteiro. Validar desde 320px de largura e telas baixas de 568px.

Rótulos: ícone Apple + “Instalar no iPhone”; ícone Android + “Instalar no Android”. Não usar selo “App Store” ou “Google Play” para uma instalação web. Usar assets de marca com condições de uso verificadas, sem sugerir parceria.

## 6. Arquitetura independente

Decisão proposta: criar `website/` na raiz, com pacote, lockfile e configuração próprios. Criar projeto Vercel separado, com Root Directory `website`. Não trocar o projeto de produção do aplicativo pelo site institucional.

Stack: Astro para gerar HTML estático e metadados; React apenas na ilha de experiência 3D; Three.js com React Three Fiber para cena; helpers Drei selecionados; GSAP com ScrollTrigger para coordenar movimento por capítulo. CSS nativo com tokens para layout. Usar uma única biblioteca principal de animação; não adicionar Framer Motion, Lenis e outro motor de scroll ao mesmo tempo.

Justificativa: a apresentação e seus botões chegam como HTML leve; o motor 3D pode carregar depois. React é familiar ao projeto, mas o aplicativo inteiro não será empacotado dentro da landing page. Fixar versões compatíveis na implementação e registrar Node e gerenciador em arquivo; não usar versões flutuantes como contrato de reprodução.

Estrutura futura:

```text
website/
  package.json
  package-lock.json
  astro.config.mjs
  tsconfig.json
  public/
    brand/
    fonts/
    models/iphone.glb, android.glb
    screens/                 # derivados de distribuição
    posters/                 # cenas renderizadas para fallback
    environments/            # ambiente de luz otimizado
  assets-source/
    models/phones.blend
    README.md                # autoria, versões e reprodução
  src/
    pages/index.astro
    layouts/BaseLayout.astro
    components/Header.astro
    components/InstallButtons.astro
    components/FeatureSection.astro
    components/InstallHelp.astro
    experience/Experience.tsx
    experience/Phone.tsx
    experience/ScreenMaterial.tsx
    experience/SceneLighting.tsx
    experience/ChapterController.ts
    experience/QualityController.ts
    content/chapters.ts
    content/assets.ts
    config/site.ts
    styles/tokens.css
    styles/global.css
  scripts/prepare-assets.mjs
  tests/
  README.md
docs/site-mano/
  PROGRESSO.md
  DECISOES.md
  VALIDACAO.md
  ASSETS.md
```

Esses caminhos são planejados. Criar apenas os necessários na etapa correspondente. Arquivos grandes de autoria devem ter armazenamento definido antes de commit; não ativar Git LFS no repositório sem conferir o fluxo de build.

### Contratos internos

`chapters.ts` concentra id, título, apoio, imagens, altura de seção, poses desktop/mobile e fallback. `assets.ts` relaciona origem, derivado, dimensões, recorte, hash e licença. `site.ts` define `SITE_URL`, `APP_URL` e destinos de instalação em HTTPS. Não espalhar URLs ou coordenadas por componentes.

Uma pose tem posição, rotação em quaternion, escala, alvo e distância da câmera. O controlador recebe progresso normalizado 0–1 do capítulo e interpola esses dados. React cuida de estado de capítulo/qualidade, não de atualizações de estado a cada frame. GSAP atualiza um objeto de progresso; o renderizador consome esse objeto e solicita frames quando necessário.

## 7. Modelagem 3D e preparo das telas

### Ferramentas e autoria

Blender para modelos, UVs, materiais, iluminação de referência e posters. Three.js renderiza a versão interativa no navegador. glTF Transform pode otimizar GLB e aplicar Meshopt; escolher um método de compressão geométrica, incluindo seu decoder no orçamento. Sharp prepara imagens de distribuição em script reproduzível. Registrar versões e comandos reais quando os arquivos existirem.

A abordagem padrão é modelar carcaças próprias. Se um modelo licenciado economizar tempo, registrar URL, autor, licença comercial e prova de permissão de redistribuição no formato usado. Não extrair modelos dos sites de referência. Não comprar assets sem autorização específica.

### Modelos

Criar um aparelho com silhueta reconhecível de iPhone e um Android premium genérico, sem inventar especificações de um modelo comercial. Frente é prioritária; câmera traseira só terá detalhe proporcional ao que realmente aparece.

1. Bloquear proporções com corpo arredondado, vidro e plano de tela separados.
2. Aplicar escala e transformações; origem no centro; eixo Y para cima e tela orientada a +Z no contrato exportado.
3. Usar bevels reais para captar luz nas bordas; normais suaves controladas, sem malha densa desnecessária.
4. Nomear nós `Body`, `Frame`, `Screen`, `Glass`, `Buttons`, `Camera`, `ScreenMask`.
5. Separar material de tela para trocar screenshots sem recarregar a carcaça.
6. Ajustar UV da tela a retângulo normalizado, com máscara arredondada coerente com a moldura.
7. Exportar GLB, verificar escala, orientação, UVs e nomes em visualizador e na cena real.

Meta inicial: até 35 mil triângulos por aparelho, até 8 materiais por modelo. Revisar para menos caso desempenho exija. Não modelar elementos internos invisíveis.

### Capturas e fidelidade

As telas existentes incluem relógio, indicadores e Dynamic Island. Não aplicar uma segunda ilha 3D sobre a ilha já capturada. Para iPhone, alinhar a captura inteira ao display ou criar derivado sem elementos do sistema de forma documentada. Para Android, produzir preferencialmente captura real do Manô Web em Android na proporção do modelo; usar as capturas existentes como base de conteúdo, não colocar uma barra iOS em um Android final.

Durante a montagem inicial, um derivado recortado abaixo da barra iOS pode servir como textura provisória. Esse recorte deve ser declarado no inventário e substituído por captura adequada antes do aceite visual. Não esticar a captura: calcular proporção de imagem e display; usar encaixe proporcional e recorte revisado. Se precisar cortar informação funcional, recapturar em outra proporção.

Capturas já disponíveis são os masters e não devem ser sobrescritas. Preparar derivados de 768px e, quando necessário, 1024–1206px de largura, preservando legibilidade. Começar com WebP/PNG conforme nitidez; AVIF para posters se trouxer economia comprovada. KTX2 é opção de otimização para memória de GPU, não etapa obrigatória: só adotar se mapas e letras permanecerem nítidos.

As imagens de home e detalhe mostram lugares específicos e horas; revisar dados pessoais e contexto antes da publicação. Não tratar horários, quantidade de ônibus ou tarifas da captura como promessa atual. Conferir atribuição exigida para mapas e demais recursos nas imagens publicadas.

### Materiais e iluminação

- Carcaça: material físico/PBR com metal e rugosidade moderada; bordas visíveis sobre o fundo.
- Tela: material sem influência da iluminação, em sRGB, com tratamento de tone mapping que preserve as cores originais.
- Vidro: camada muito discreta; evitar refração em tempo real e reflexo que encubra o aplicativo.
- Luz principal ampla branca, preenchimento suave e recorte lateral azul ou laranja.
- Ambiente pré-processado para reflexos; usar assets locais licenciados. Sem sombras dinâmicas pesadas no celular.
- Sombra de apoio pré-renderizada ou simples; nada de bloom/SSAO/DOF na primeira versão.

Comparar screenshot de origem e display frontal renderizado: branco não pode ficar cinza, azul não pode virar ciano e texto não pode perder contraste. Aprovar materiais antes de criar a sequência inteira de animação.

## 8. Câmera, motion e rolagem

No máximo um canvas reutilizado nos capítulos que exigem 3D interativo, atrás de conteúdo HTML. Os demais capítulos podem usar renders dos mesmos modelos, conforme matriz da seção 18. Cena e DOM sincronizados pelo id do capítulo. Evitar um canvas/contexto WebGL por seção. O canvas é decorativo, `aria-hidden`, e não captura gesto de rolagem; controles são HTML fora dele.

Usar perspectiva moderada equivalente a FOV de aproximadamente 30–38 graus como ponto de partida. Calcular enquadramento por bounding box e aspect ratio: jamais manter uma distância fixa que corte o aparelho no celular. Inclinação normal de leitura entre 0 e 18 graus; ângulos maiores somente em transições curtas.

### Sequência proposta por cena

| Etapa | Movimento | Tempo/faixa proposta |
| --- | --- | --- |
| Entrada do hero | Dupla parte de inclinação discreta e se acomoda; conteúdo textual já visível | 0,9–1,2s, uma vez |
| Início de capítulo | Novo aparelho/pose ocupa o enquadramento, título aparece com deslocamento de até 16px | Primeiros 20% do progresso |
| Demonstração | Tela permanece legível; troca de screenshot só após textura pronta | 20–75% |
| Saída | Câmera recua ou aparelho se desloca para abrir o capítulo seguinte | 75–100% |
| Hover de botão | Contraste, translação máxima 2px | 160–220ms |
| Parallax de ponteiro | Inclinação máxima 2 graus, somente desktop com ponteiro preciso | Suavização curta |

Usar easing sem overshoot para câmera e aparelhos. O scroll é nativo; não capturar wheel/touch nem fazer scroll artificial. No desktop, permitir blocos sticky de aproximadamente 140–180svh nos capítulos que se beneficiem da narrativa; os demais ficam em fluxo natural. No celular, eliminar pin prolongado e limitar capítulos animados a aproximadamente 110–130svh, ou fluxo natural conforme altura. Não transformar oito recursos em vários minutos de rolagem.

GSAP/ScrollTrigger define progresso, entrada e saída; `matchMedia` separa mobile e desktop; limpar timelines, listeners e triggers no descarte. Recalcular medidas após fontes, imagens, resize e orientação, sem criar loops de refresh. Não animar `top`, `left`, largura ou altura por frame: preferir transformações.

Evitar flutuação infinita na versão inicial. Pausar quando a aba estiver oculta ou a cena fora da área visível. Com `prefers-reduced-motion`, mostrar poses finais estáticas e remover pin, parallax e deslocamentos. Conteúdo e botões permanecem completos.

## 9. Renderização progressiva e desempenho

Renderizar primeiro HTML, fontes essenciais e poster do hero. O poster terá dimensões reservadas, prioridade de carregamento e composição equivalente ao primeiro frame 3D. Carregar a ilha 3D apenas após o caminho crítico, mediante estratégia de idle/visibilidade. Trocar poster por canvas somente depois do primeiro frame válido, sem flash preto. Se falhar, manter poster.

Os posters devem ser renderizados a partir dos mesmos modelos, poses, telas e luzes; o fallback preserva o acabamento tridimensional. Não substituir por um retângulo de screenshot sem moldura.

| Perfil | Configuração inicial |
| --- | --- |
| Desktop capaz | Dois aparelhos, DPR limitado a 1,5; efeitos mínimos |
| Celular capaz | Um aparelho principal ou dupla simples, DPR 1–1,25; sem pós-processamento |
| Hardware lento / economia de dados | Posters responsivos e transições mínimas; carregar 3D só por escolha explícita se apropriado |
| Sem WebGL / perda de contexto / movimento reduzido | Conteúdo estático completo com imagens 3D pré-renderizadas |

Perfil não depende apenas de user agent. Considerar suporte real, preferência de movimento e medição de frames; `saveData` é apenas sinal opcional. Se tempo por frame permanecer acima de 33ms por alguns segundos, reduzir DPR e detalhe; se persistir, trocar para poster sem mudar scroll. Aplicar histerese para não alternar continuamente.

Metas iniciais de orçamento, a medir e registrar:

- HTML/CSS/JS crítico, sem 3D: até 200KB comprimidos no total.
- Poster hero: até 250KB mobile / 450KB desktop; fontes críticas até 120KB.
- JS 3D carregado depois: alvo até 400KB comprimidos; justificar excesso com medição, não esconder o custo.
- Dois modelos: alvo combinado até 1,5MB transferidos; primeira cena inteira até 3MB adicional.
- Demais texturas sob demanda; no máximo capítulo atual e próximo residentes sempre que viável.
- GPU: alvo de texturas abaixo de 64MiB mobile. Arquivo pequeno não implica textura pequena: RGBA 1024 × 2226 usa aproximadamente 8,7MiB antes dos mipmaps.
- LCP ≤ 2,5s, CLS ≤ 0,1 e INP ≤ 200ms em dados reais quando disponíveis; em laboratório usar condições documentadas e não confundir pontuação com prova de campo.
- Movimento: alvo de 60fps em aparelho capaz, no mínimo 30fps sustentados nos aparelhos de validação; reduzir qualidade antes de prejudicar leitura.

Não pré-carregar as 14 capturas em resolução integral. Reutilizar malhas e materiais, descartar texturas não usadas, interromper renderização ociosa e testar recuperação de contexto. Geometria/material não devem ser reconstruídos a cada evento de scroll.

## 10. Instalação: fluxo correto entre dois sites

Esta parte é dependência funcional e merece validação separada do 3D. O site de apresentação e o aplicativo possuem origens diferentes. Um botão pode navegar para o aplicativo; não pode instalar silenciosamente um PWA de outra origem. O endereço pode não ser escrito na interface própria, mas continua visível ou consultável no navegador e em seus menus.

### Fluxo proposto

1. Visitante toca “Instalar no iPhone” ou “Instalar no Android” no site institucional.
2. Navegação na mesma aba para a origem do aplicativo, inicialmente `APP_URL/?install=ios` ou `APP_URL/?install=android`.
3. Uma pequena tela de instalação na origem do PWA mostra só ícone, nome Manô e instruções/ação. O aplicativo completo não precisa aparecer antes da instalação nessa jornada.
4. Ao abrir em modo standalone pela tela inicial, o aplicativo ignora a apresentação de instalação e abre sua home.

O tratamento de `?install=` NÃO existe por definição deste plano: é uma alteração futura, isolada e testada no aplicativo. A landing não está pronta para lançamento apenas porque seus links navegam. Sem essa integração, o fallback honesto é abrir o Manô e mostrar orientação compatível; registrar explicitamente a diferença.

### iPhone

Mostrar passos visuais para abrir Compartilhar, escolher Adicionar à Tela de Início e confirmar. Em versões que exibam “Abrir como App da Web”, orientar a manter a opção ativa. Usar instruções adaptáveis ao layout real do Safari, sem uma seta fixa que aponte para o lugar errado em diferentes versões.

Não existe confirmação universal de instalação acessível ao site no iPhone. `display-mode: standalone` e `navigator.standalone`, quando disponível, indicam o contexto atual de abertura; não provam que o usuário não tem o app instalado em outro contexto. Portanto, não prometer esconder o botão em qualquer navegador só porque houve uma instalação anterior.

### Android

Na origem do PWA, capturar `beforeinstallprompt` quando suportado, armazenar o evento e chamar `prompt()` a partir de um novo toque explícito. O clique que navega de outro domínio não deve ser tratado como autorização garantida para disparar o prompt no destino. Após uso, descartar o evento. Tratar aceitação, recusa e `appinstalled` quando disponível.

Sem evento: oferecer instrução do menu compatível com o navegador, sem spinner infinito nem instalação falsa. HTTPS, manifesto, ícones e critérios do navegador devem estar corretos; verificar suporte no dispositivo real. A API tem disponibilidade limitada segundo a [documentação MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event).

### Desktop e navegadores internos

Desktop: ao escolher uma plataforma, abrir diálogo com QR code para a página de instalação do aplicativo e opção de abrir o link. Gerar QR localmente; não enviar a URL a serviço externo. Em navegador interno de redes sociais, oferecer instrução para abrir no Safari/Chrome; detectar de forma conservadora e permitir acesso manual às duas orientações.

### Identidade do PWA

Auditar o manifesto e garantir que a jornada instala o Manô, não o site institucional. Manter `start_url` limpo, escopo coerente e identidade compatível com instalações existentes. Qualquer inclusão de `id` no manifesto precisa preservar a identidade anterior; não trocar domínio ou id cegamente e criar instalações duplicadas. Conferir ícones, incluindo tamanhos exigidos pelo navegador, maskable e apple-touch-icon.

Não registrar service worker do aplicativo na landing nem copiar seu manifesto para o site de apresentação. A tela `?install=` usa o manifesto do próprio app. Não renderizar o aplicativo em iframe como atalho de instalação.

Referências: [guia Apple para adicionar um site como app](https://support.apple.com/en-gb/guide/iphone/iphea86e5236/ios) e [WebKit: mudanças em apps da tela inicial no Safari 26](https://webkit.org/blog/17333/webkit-features-in-safari-26-0/). Revalidar os passos na versão efetivamente testada.

## 11. Acessibilidade, SEO e publicação

Texto e links ficam no DOM, nunca apenas dentro do canvas. Um H1, títulos em ordem, landmarks semânticos, link de pular conteúdo e navegação por teclado. Controles de ida/volta devem ter estado acessível e funcionar sem animação. Descrever as imagens relevantes com alt curto; o 3D decorativo não duplica leitura.

Diálogos: nome acessível, foco inicial, contenção de foco, Escape e retorno ao botão de origem. Testar zoom de 200%, VoiceOver e preferência de movimento reduzido. Não esconder texto aguardando observer ou JavaScript.

HTML estático com título, descrição, canonical do domínio final, Open Graph e imagem social própria. Usar dados estruturados somente para fatos reais; não inventar avaliações. Links de privacidade/contato devem apontar a destinos existentes antes de publicar; evitar links vazios.

Hospedagem futura: projeto Vercel exclusivo, preview antes de produção, assets com hashes e cache longo; HTML atualizado por deployment. Conferir MIME dos GLB, fontes e decoders, CSP compatível e URLs HTTPS. Nenhuma chave de Apify ou de backend deve entrar no site. Analytics são opcionais; caso adotados, não chamar clique de “instalação concluída” e não coletar destinos de viagens.

## 12. Execução em etapas e critérios de saída

| Etapa | Trabalho e entrega | Critério para avançar |
| --- | --- | --- |
| 0. Retomada | Ler plano, estado Git e configuração; criar registro de progresso; confirmar assets | Nenhuma mudança alheia perdida; dependências e bloqueios anotados |
| 1. Direção visual | Composições desktop/mobile do hero e de um capítulo; mapa de conteúdo e paleta | Botões imediatos, hierarquia e identidade demonstradas em imagens concretas |
| 2. Assets e modelos | Revisar 14 capturas; criar modelos e derivados; registrar licenças e recortes | Aparelhos realistas, telas legíveis, Android sem barra iOS no material final |
| 3. Fatia completa | Montar hero, um capítulo, poster/fallback e scroll em dispositivo | Boa qualidade em desktop e celular antes de multiplicar seções |
| 4. Estrutura completa | Construir todos os capítulos em HTML com seus posters e responsividade | Site inteiro navegável sem WebGL, sem overflow e sem texto provisório |
| 5. Narrativa 3D | Implementar controlador, poses, troca de telas e motion | Sem flashes, recortes errados, saltos de scroll ou cenas vazias |
| 6. Instalação | Integrar destino no app e estados de plataforma | Instala Manô e abre home; nunca instala somente a landing por engano |
| 7. Otimização e QA | Medir carga, frames, acessibilidade e falhas | Orçamentos e checklist cumpridos ou exceções documentadas |
| 8. Entrega | Preview aprovado, publicação no projeto correto e registro de evidências | URL final, commit, rollback e pendências conhecidos |

As etapas 2 e 3 representam o maior risco artístico/técnico. Resolver material, UV e enquadramento de uma cena antes de produzir todas. Não consumir tempo gerando múltiplas variantes sem objetivo; fazer uma versão principal e comparar com critérios mensuráveis.

Não há estimativa rígida de horas porque disponibilidade de Blender, qualidade dos assets e testes físicos ainda não foram confirmadas. Cada etapa deve terminar com artefatos e evidências, não apenas relato de que “foi implementado”.

## 13. Plano de testes e aceite

### Visual

- Capturar hero e cada capítulo em 1440 × 900, 1920 × 1080, 768 × 1024, 390 × 844 e 360 × 800; checar também 320 × 568 e landscape.
- Conferir posicionamento dos dois botões, contraste, quebra de títulos e nenhuma sobreposição com aparelhos.
- Confrontar a tela do mockup frontal com screenshot original; conferir UV, proporção, ilha/câmera e cores.
- Conferir fundo e continuidade entre capítulos; o site não deve apresentar bordas brancas, rodapé artificial ou conteúdo cortado.
- Conferir primeira carga, scroll rápido, scroll de volta, refresh no meio da página e redimensionamento.

### Funcional

- Teclado, leitor de tela, âncoras e diálogos; botões funcionam antes de o 3D carregar.
- Instalação Android: evento disponível, ausência, recusa, aceitação e retorno.
- iPhone: jornada pelo Safari e abertura pelo ícone; validar que não retorna à instrução de instalar.
- Destino indisponível: orientação clara, possibilidade de tentar novamente; sem sucesso falso.
- Navegador sem WebGL, erro de GLB/textura, perda de contexto e movimento reduzido: conteúdo completo.

### Dispositivos

Obrigatório abrir a jornada e o resultado instalado no **Manô Web do simulador Xcode**, conforme preferência do usuário. Complementar com iPhone físico e Android físico/Chrome para aceite de instalação, safe areas e desempenho. Emulação desktop e iPhone Simulator não comprovam GPU, menu ou instalação no Android.

Se algum aparelho não estiver disponível, registrar “não testado” com modelo/SO pendente. Não dizer “funciona em todos os dispositivos” com base em um único simulador. Usar testes automatizados de unidade para seleção de estado/progresso e testes de navegador para CTAs/fallback, mas manter a validação manual real dos menus do sistema.

### Evidência mínima de entrega

Build e checagem de tipos aprovados; relatório de tamanhos; condições da medição de desempenho; screenshots dos capítulos; gravação curta de rolagem; lista de dispositivos e versões; resultado de cada fluxo de instalação. Tudo referenciado em `docs/site-mano/VALIDACAO.md`, sem credenciais ou informações pessoais.

## 14. Riscos e decisões antecipadas

| Risco | Decisão/ação |
| --- | --- |
| Bonito no desktop e pesado no celular | Poster inicial, DPR limitado, uma cena reutilizada, degradação mensurada |
| Celular 3D parece brinquedo | Corrigir bevel, iluminação e material antes de adicionar efeitos |
| Telas distorcidas ou Android com ilha iOS | Recorte rastreado e captura Android real para versão final |
| Usuário instala a landing | Fluxo na origem do PWA; manifesto somente onde deve instalar |
| Mudança de domínio quebra instalações antigas | Não migrar identidade neste projeto; decidir migração separadamente |
| Animação prejudica leitura | Longa pausa central por capítulo; movimento reduzido completo |
| Recursos mostrados não estão funcionando | Conferir app real e ajustar copy; não inventar benefícios |
| Dependência externa de modelos/fontes | Assets locais, fontes licenciadas e autoria registrada |
| Outra IA recomeça tudo | Atualizar progresso, decisões, pendências e próxima ação após cada etapa |

## 15. Protocolo de continuidade para outra IA

Ao assumir:

1. Ler este documento e `docs/site-mano/PROGRESSO.md` se existir.
2. Conferir `git status`, branch, commits recentes e arquivos reais. Não considerar uma proposta aqui como implementação existente.
3. Consultar instruções aplicáveis do repositório. A integração Ruflo foi solicitada nas instruções da sessão, mas não havia ferramenta Ruflo/ToolSearch correspondente disponível durante este planejamento; reavaliar disponibilidade, sem inventar execução.
4. Identificar primeira etapa incompleta e trabalhar nela até seu critério de saída.
5. Preservar arquivos originais e registrar origem de cada derivado.
6. Ao concluir etapa, atualizar progresso e evidências com commit, arquivos, testes e próxima ação concreta.
7. Só alterar decisões deste plano por motivo registrado: resultado de teste, limite de plataforma, preferência do usuário ou incompatibilidade comprovada.

Formato mínimo do registro de progresso:

```text
Etapa atual:
Concluído e evidências:
Arquivos alterados:
Comandos de build/teste e resultados:
Dispositivos/SO testados:
Pendências/bloqueios:
Decisões novas e motivos:
Próxima ação exata:
Commit e URL de preview:
```

Não encerrar uma etapa com GLB placeholder, URL inventada, texto lorem ipsum, botão sem destino ou fallback ausente. Se houver bloqueio externo real, registrá-lo especificamente; nenhum plano pode garantir ausência absoluta de falhas sem execução e testes.

## 16. Fontes técnicas e consulta futura

As especificações de arte, arquitetura e orçamento são decisões propostas para este projeto. Documentações abaixo orientam APIs; confirmar as versões efetivamente instaladas antes de copiar exemplos.

- [Three.js — documentação](https://threejs.org/docs/): materiais, texturas, loaders, câmera e renderer.
- [GSAP — ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/): integração com progresso de rolagem e ciclos de atualização.
- [MDN — beforeinstallprompt](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event): limitações e evento de instalação.
- [Apple — abrir site como app](https://support.apple.com/en-gb/guide/iphone/iphea86e5236/ios): orientação do fluxo iPhone.
- [WebKit — Safari 26](https://webkit.org/blog/17333/webkit-features-in-safari-26-0/): contexto de apps da tela inicial.
- [React Three Fiber — performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance): leitura necessária na implementação; a abertura automatizada falhou nesta preparação, portanto não foi usada como prova de API específica.
- [Astro — integração React](https://docs.astro.build/en/guides/integrations-guide/react/): referência a consultar ao configurar a ilha React.
- [Blender — exportação glTF](https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html): referência a consultar ao exportar modelos.

### Estado ao final deste planejamento

Referências abertas e análise ampliada nas seções seguintes; paleta e stack do app verificadas; 14 capturas inventariadas e dimensões confirmadas; três capturas inspecionadas visualmente. Site, modelos, screenshots Android, testes do novo site e publicação ainda não executados. Próxima ação, quando o usuário solicitar desenvolvimento: etapa 0, seguida da composição do hero desktop/mobile e de uma única cena 3D demonstrável.

## 17. Análise avançada das referências — evidência e consequência

### 17.1 Método e grau de confiança

Foram usados screenshots do navegador e leitura do DOM renderizado, incluindo elementos de vídeo, imagens responsivas e canvas. Contagens representam apenas aquele estado da página: carregamento tardio, recursos condicionais e iframes podem mudar o resultado. Presença de canvas não prova Three.js nem um modelo 3D; ausência de canvas não prova ausência de produção 3D nos materiais visuais.

Classificar conclusões como **observação** (visto ou lido diretamente), **interpretação** (efeito de design percebido) ou **decisão Manô** (implementação proposta). As duas referências são inspiração de direção artística, não dependências do novo projeto.

### 17.2 Apple: hierarquia, narrativa e camadas

**Observação:** o hero apresentou inicialmente uma silhueta iluminada e depois um aparelho horizontal sobre tipografia volumétrica. O DOM tinha um vídeo com fonte terminando em `anim/hero/large.mp4`, sem áudio ativo. Assim, pelo menos essa apresentação usa mídia de vídeo; não é correto chamá-la automaticamente de renderização 3D em tempo real.

**Interpretação:** o enquadramento passa de mistério para reconhecimento. A luz revela contorno, material e volume antes do produto completo. Texto e ação comercial ocupam uma faixa própria, sem depender da legibilidade do fundo animado.

**Decisão Manô:** usar um aparelho já reconhecível no primeiro poster, pois a instalação deve ser imediata. Permitir um breve movimento de acomodação, mas nunca iniciar com tela preta esperando uma introdução. Reservar a revelação por luz para uma transição opcional entre capítulos, sem atrasar a informação.

**Observação:** a seção Design mostrou um bloco grafite com título grande à esquerda, seguido por fundo preto e visualizador de produto. A navegação local reapareceu como cápsula no topo com nome e ação. A estrutura também continha galeria de destaques com controle de reprodução, abas de recursos e região nomeada para o visualizador.

**Interpretação:** a alternância entre bloco editorial e demonstração evita a monotonia de uma única cena contínua. Navegação persistente recupera a ação principal quando o visitante já está distante do hero. Controles explícitos deixam detalhes disponíveis sem exigir uma longa animação obrigatória.

**Decisão Manô:** cabeçalho compacto após o hero, com marca, “Recursos” e “Instalar”; este último leva a um seletor que mantém as duas plataformas. Para detalhes, usar seletor Ida/Volta real e controles de Terminais/Estações, em vez de depender exclusivamente do scroll. A apresentação continua compreensível se o visitante pular capítulos.

**Observação técnica:** na amostra, havia 176 elementos `picture`, um canvas e vários elementos de vídeo, muitos ainda sem fonte ativa. Foram observadas fontes de imagens com variantes `large` e `large_2x`, além de placeholders. Isso confirma uso misto de mídia e seleção de resolução, mas não permite inferir o algoritmo completo de lazy loading ou o formato interno do visualizador.

**Decisão Manô:** manter mídia estática responsiva como primeira classe, com `picture`, dimensões conhecidas e variantes por composição. Carregar cena atual e próxima, sem tratar todas as telas como textura obrigatória desde o início.

### 17.3 AVA: apresentação de produto e contraste editorial

**Observação:** o hero associa hardware escuro a título branco de grande escala. O DOM declarou um vídeo MP4 1080p hospedado em `video.wixstatic.com`, com autoplay, loop e mute ativos. A meta `generator` indicou Wix. Não havia canvas no documento principal inspecionado.

**Interpretação:** a sensação sofisticada vem fortemente da produção visual do hardware, do contraste e da escala. Não é necessário que cada pixel de profundidade seja calculado por WebGL no celular do visitante.

**Decisão Manô:** Blender será fonte dos modelos e dos renders, enquanto a tecnologia de exibição varia conforme a cena. Manter modelos 3D reais como requisito de autoria e capítulos interativos reais como requisito da experiência, sem tornar todo o site um render loop.

**Observação:** após o hero, a página apresentou dois painéis paralelos: controle em ambiente claro com sombra direcional e outro produto flutuando em cenário escuro. As ações eram simples e o texto breve. Mais abaixo, uma interface vertical sobrepunha a fronteira entre uma imagem de marca e o bloco seguinte. O cabeçalho permaneceu no topo durante os trechos de rolagem observados.

**Interpretação:** a profundidade também é construída por sombras, sobreposição de planos e continuidade entre seções. A alternância de escala e organização comunica variedade sem depender de muitos estilos de botão ou cores.

**Decisão Manô:** aplicar a dupla editorial a Ida/Volta, ambas sobre tons escuros da marca. No capítulo de conexões, permitir que o aparelho atravesse visualmente o limite entre fundo e texto, mas sem invadir a área de leitura ou os controles. Não copiar o painel claro ou o anel multicolorido da AVA; a paleta Manô permanece restrita.

### 17.4 Responsividade: o que foi e não foi comprovado

Foi solicitado viewport de 390 × 844. Na AVA, a leitura retornou `innerWidth=390` e `scrollWidth=980`, com screenshot mostrando corte horizontal na versão servida ao navegador desktop. Isso é evidência dessa sessão, não diagnóstico definitivo do site em um iPhone: o navegador não estava com user agent e capacidades de um celular real.

Na Apple, o override não se refletiu nas medidas: a leitura permaneceu em `innerWidth=1280`. Portanto, esta análise não afirma ter validado a composição mobile da Apple. Alguns recursos de mídia secundários da AVA também reportaram indisponibilidade durante a inspeção; não foi possível julgar todos os vídeos em movimento.

Consequência para o Manô: viewport, UA e dispositivo real devem ser registrados nos testes. Em cada breakpoint, verificar `scrollWidth <= clientWidth` para o documento, mas não resolver overflow escondendo conteúdo essencial. Evitar largura mínima rígida e testar fontes carregadas, botões traduzidos, zoom e orientação. As composições mobile descritas neste plano são decisões próprias a validar.

## 18. Estratégia refinada: escolher o renderizador por intenção

A revisão substitui a ideia de animar todos os capítulos no mesmo canvas por uma estratégia híbrida. Mantém-se o limite de um contexto 3D, mas ele só trabalha onde movimento espacial ou escolha do usuário agregam valor. Todos os aparelhos, inclusive estáticos, derivam dos modelos autorais aprovados.

| Capítulo | Técnica principal | Por quê | Versão econômica |
| --- | --- | --- | --- |
| Hero | Poster imediato + dupla GLB com movimento curto | Demonstrar volume e as duas plataformas sem atrasar CTA | Mesmo enquadramento renderizado em imagem |
| Planejamento | GLB quase frontal + troca controlada de texturas | Explicar origem → resultado mantendo continuidade espacial | Três imagens com controles HTML |
| Catálogo | Render do aparelho + detalhe ampliado da busca | Movimento 3D acrescenta pouco à leitura de uma lista | Mesmo render responsivo |
| Ida/Volta | GLB ou dupla de renders com seletor HTML | Escolha de sentido muda a informação; interatividade é útil | Troca de imagem sem movimento |
| Veículos | Render aproximado e, opcionalmente, gravação real curta da tela | Movimento real do app tem mais valor que girar o telefone | Captura estática com legenda de demonstração |
| Conexões | Render 3D em planos separados + transformações leves | Criar profundidade com baixo custo de GPU | Composição única renderizada |
| Alertas | Render frontal, acento laranja e entrada discreta | Priorizar legibilidade das ocorrências | Imagem sem animação |
| Encerramento | Reutilização da dupla do hero em pose final | Reforçar reconhecimento e instalação | Poster reutilizado |

Vídeo cinematográfico é uma opção posterior, não mídia obrigatória no hero inicial. Antes de adotá-lo, comparar nitidez, peso e resultado artístico com GLB na mesma cena. Não carregar vídeo e WebGL simultaneamente para reproduzir o mesmo conteúdo. Sequências de centenas de frames não fazem parte da versão padrão: custam memória, rede e manutenção, e só serão aceitas se um protótipo demonstrar vantagem mensurável.

## 19. Especificação avançada de produção 3D

### 19.1 Separar modelo de autoria e modelo de distribuição

Manter no Blender uma coleção de alta qualidade para renders e uma coleção otimizada para GLB. Usar a mesma silhueta e UV de tela, mas remover microgeometria invisível no navegador. Aplicar modificadores na cópia de exportação, preservando a fonte editável. Testar continuidade dos highlights nas quinas; normais incorretas produzem vincos que um maior número de polígonos não resolve.

Criar três enquadramentos mestres antes de animar: dupla de abertura, aparelho frontal de leitura e detalhe de tela. Exportar um render de cada em desktop e mobile. Esses seis quadros fixam linguagem visual, luz, proporção e contraste para o restante da página.

### 19.2 Luz e material como sistema reproduzível

Em Blender, usar luzes de área largas para criar reflexos contínuos, preenchimento de baixa intensidade e um recorte estreito para separar as bordas. Começar com uma relação artística de intensidade principal/preenchimento/recorte de 1/0,25/0,5; isso é ponto de partida, não valor físico universal. Ajustar exposição antes de aumentar brilho dos materiais.

No navegador, usar ambiente simples pré-filtrado e poucos materiais. PMREM fornece níveis de reflexão adequados à rugosidade; não recalculá-lo por frame. Conferir APIs na versão instalada e liberar os recursos no descarte. Fonte: [Three.js — PMREMGenerator](https://threejs.org/docs/pages/PMREMGenerator.html).

Faixas iniciais propostas: metal com rugosidade 0,25–0,4; plástico/borracha com metalness zero; tela sem resposta à luz. Não aplicar o mesmo material metálico em todas as peças. A largura aparente do reflexo deve ajudar a mostrar a curvatura, não criar contorno neon.

O vidro do GLB deve ser simplificado ou omitido se causar ordenação de transparência, reflexos duplos ou custo alto. Um vidro fisicamente complexo no render offline não obriga o uso de transmission/refração no browser. Guardar presets de luz e material no código e no `.blend`, com nomes correspondentes.

### 19.3 Cor consistente entre render e navegador

Tratar screenshots como informação de cor sRGB; mapas de normal/rugosidade como dados, sem conversão de cor indevida. Verificar a saída do renderer e a aplicação de tone mapping por material. No Blender, não submeter a interface do aplicativo a uma transformação cinematográfica que desbote texto: renderizar/compor a tela de forma controlada, com checagem de referência.

Produzir uma prancha com screenshot original, render offline frontal e frame WebGL frontal. Medir amostras das três cores em regiões sem reflexo e revisar diferenças perceptíveis. “Parece parecido” não é suficiente quando o azul é a identidade do produto. Não exigir igualdade pixel a pixel em áreas inclinadas com filtragem; exigir fidelidade no enquadramento frontal de comparação.

### 19.4 Texturas e materiais de tela

Preferir um único plano de tela com duas texturas e fator de mistura, em vez de dois planos transparentes coincidentes que geram flicker. Decodificar a próxima imagem e prepará-la na GPU antes da transição. Se não estiver pronta, manter a anterior; nunca misturar com preto. Ao mudar rapidamente de capítulo, uma versão/id da solicitação impede que a textura antiga termine o carregamento e substitua a atual.

Uma dissolvência de 180–250ms serve para mudanças pequenas. Telas com muito texto distinto devem usar troca direta num ponto de pausa ou uma transição por máscara curta; sobrepor dois parágrafos durante meio segundo reduz a leitura. Nunca deformar letras para simular morph entre screenshots.

Anisotropia limitada e mipmaps ajudam telas em ângulo; começar com anisotropia 4 e medir. Aproximações devem escolher uma textura de maior resolução apenas quando o tamanho projetado justificar. Não ampliar uma captura pequena esperando que a modelagem recupere detalhes.

## 20. Direção de câmera e coreografia executável

### 20.1 Enquadramento por área disponível

Calcular a área visual livre depois de reservar título, botões e margens. Para FOV vertical `v`, aspect ratio `a`, altura `h` e largura `w` do bounding box: `hFov = 2 * atan(tan(v/2) * a)` e `distância ≈ max(h/(2*tan(v/2)), w/(2*tan(hFov/2)))`. Acrescentar profundidade e margem de segurança; para objetos rotacionados, avaliar cantos transformados. A fórmula é ponto de partida, não substitui teste de projeção final.

Projetar os cantos dos aparelhos e comparar com retângulos reservados ao texto. No modo de leitura, manter a região funcional da tela inteiramente dentro do quadro. Em detalhe decorativo pode haver corte intencional da carcaça, nunca do controle que se pretende explicar.

Normalizar dimensões do modelo, por exemplo altura igual a 1 unidade, para tornar poses portáveis. Usar quaternions e interpolação esférica para rotação; curvas suaves para posição, com tangentes revisadas nas mudanças de capítulo. Evitar animação simultânea grande de câmera e aparelho: eleger um movimento dominante por tomada.

### 20.2 Gramática de tomadas

| Tomada | Configuração | Função |
| --- | --- | --- |
| Produto completo | Três quartos, inclinação moderada, duas plataformas | Reconhecimento |
| Leitura | Tela quase frontal, posição estável | Entender a funcionalidade |
| Detalhe | Aproximação de região específica, contexto ainda visível | Explicar busca, sentido ou embarque |
| Dupla | Aparelhos separados por espaço negativo | Comparar Ida/Volta |
| Retorno | Recuo para pose conhecida | Encerrar e chamar para instalar |

Alternância proposta: completo → leitura → detalhe → dupla → detalhe → leitura → leitura → retorno. Não repetir a mesma rotação em oito capítulos. Pontos de parada devem funcionar como imagens de apresentação mesmo sem movimento.

### 20.3 Timeline por capítulo

Usar faixas de progresso explícitas: 0–0,15 acomodação; 0,15–0,30 revelação da informação; 0,30–0,75 leitura; 0,75–1 saída. Essas faixas refinam a tabela anterior e podem ser ajustadas por capítulo em configuração. No mobile, reduzir ou retirar a fase de saída antes de encurtar a leitura.

Evitar dupla suavização: escolher scrub curto no controlador OU amortecimento no renderer, não ambos com atraso alto. A posição final deve acompanhar inversão rápida do scroll sem parecer solta. A interação manual Ida/Volta tem precedência enquanto o capítulo estiver ativo; o scroll não deve desfazer a escolha a cada frame. Ao sair, guardar ou resetar de maneira documentada.

Não ligar callbacks funcionais exclusivamente à reprodução de uma timeline: ao abrir uma âncora ou restaurar scroll, derivar pose e conteúdo diretamente do progresso atual. Assim, ir direto para Alertas não exige passar pelo hero.

## 21. Composição em camadas e estrutura de cena

Definir camadas: fundo; canvas/render; elementos gráficos decorativos; conteúdo HTML; navegação; diálogo de instalação. Usar uma escala de z-index pequena e centralizada. Evitar ancestrais com transform no contêiner de elementos fixed/sticky, pois podem alterar o bloco de referência.

O canvas pode ficar fixo dentro do trecho narrativo, mas deve sair visualmente antes do footer. Em capítulos estáticos, ocultar sua saída e suspender frames; manter ou liberar recursos conforme memória. Um gestor de cena decide qual capítulo possui a cena naquele momento. Não deixar dois ScrollTriggers disputarem a mesma câmera.

Planos gráficos que saem do aparelho devem representar recortes reais da interface ou ícones simples, com deslocamento de profundidade pequeno. Não desenhar dados novos para parecer que o aplicativo possui funcionalidade inexistente. Para linhas decorativas, SVG com máscara/progresso costuma ser suficiente; TubeGeometry só se a linha realmente passar atrás e à frente dos aparelhos e essa oclusão tiver função visual.

## 22. Vídeo, carregamento e estado de falha

Se uma gravação do aplicativo for usada, exportar vídeo curto sem dados pessoais, com poster correspondente, reprodução inline e sem áudio por padrão. Tratar rejeição de `play()` e apresentar botão de reprodução quando necessário. No máximo um vídeo ativo na área visível; pausar ao sair e ao ocultar a página.

`requestVideoFrameCallback`, quando disponível, ajuda a acompanhar frames de vídeo apresentados; ele não elimina custo de decodificação nem garante seeks suaves. Fonte: [MDN — requestVideoFrameCallback](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestVideoFrameCallback). Não mapear `currentTime` para cada pixel de scroll sem testar keyframes, latência e Safari real. O padrão do Manô continua sendo progresso de GLB ou imagem, não scrub de vídeo.

Estado da experiência: `poster → loading → ready → active → suspended`; qualquer falha pode levar a `fallback`. Separar falha de mídia de falha funcional: botão de instalação nunca depende do sucesso de shader, GLB, decoder ou vídeo. Manter dimensões idênticas entre poster e cena para evitar salto.

Carregamento: HTML e poster primeiro; fontes essenciais; chunk 3D e modelo atual depois; tela seguinte em baixa prioridade. Reutilizar cache por URL/hash, evitar downloads duplicados por componentes e cancelar preparações obsoletas quando possível. A troca entre poster e canvas só ocorre com um frame pronto e enquadramento correspondente.

## 23. Novos critérios de qualidade para a versão 1.1

Além dos testes da seção 13, exigir:

- Prancha de seis quadros mestres aprovada antes da animação completa.
- Comparação de cor entre captura, Blender e navegador.
- Teste de navegação direta por âncora, restauração de scroll e inversão rápida de rolagem.
- Teste de seletor Ida/Volta durante o scroll para detectar disputa entre interação e timeline.
- Vídeo bloqueado, textura atrasada e contexto perdido não escondem texto ou CTA.
- Medição de largura real do documento em cada viewport, sem mascarar overflow.
- Capturas de progresso 0%, 25%, 50%, 75% e 100% de cada capítulo animado, além de uma gravação: frames isolados não provam suavidade.
- Registrar draw calls, triângulos e texturas reportados pelo renderer em desenvolvimento; não habilitar overlay técnico no site público.
- Conferir duração de frames durante movimento ativo. Medir ociosidade separadamente: renderização sob demanda não deve ser marcada como lenta por não produzir frames quando nada muda.
- Matriz final distingue render estático, vídeo, WebGL e fallback por capítulo; sem dependência de recurso remoto das referências.

### Ordem de implementação refinada

Após a etapa 0: produzir os seis quadros → acertar materiais e telas → implementar hero e uma cena de leitura com fallback → medir em celular → decidir quais capítulos precisam de WebGL → expandir narrativa → integrar instalação → validar. Nenhum efeito avançado entra apenas por ser tecnicamente impressionante; ele deve melhorar volume, leitura, continuidade ou explicação do aplicativo.

### Registro da revisão

Versão 1.1 acrescenta análise técnica das mídias observadas, limites da inspeção mobile, matriz híbrida por seção, contrato de cor, enquadramento calculado, coordenação de estado, preparação de texturas, coreografia e critérios adicionais de teste. Não modifica o aplicativo nem inicia o site. Estes refinamentos prevalecem sobre uma leitura da versão inicial que imponha WebGL em todas as seções.

## 24. Implementação real entregue — fonte de verdade

### 24.1 O que foi construído

Site independente com Astro 7.3.2, TypeScript, Three.js direto e GSAP. HTML estático contém textos, navegação e botões; a cena 3D e QR code carregam separadamente. Fonte Outfit local. Branco, azul e laranja sobre preto/grafite. Layout desktop e celular, FAQ, links para abrir o aplicativo e rodapé.

Conteúdo entregue: capa “Manaus na sua mão.”; apresentação geral; planejamento; catálogo de linhas; ida/volta; veículos no mapa; terminais/estações/paradas; alertas; instalação. As imagens são capturas reais já disponíveis no projeto, otimizadas em WebP. Dados das capturas não são dados ao vivo do site.

Controles entregues: troca de tela no planejamento, seletor de sentido com mudança de imagem/cor, seletor de conexões, FAQ expansível, diálogo com QR code no desktop e navegação para instalação no celular. O conteúdo permanece disponível quando não há animação.

### 24.2 Arquivos efetivamente existentes

| Arquivo | Responsabilidade |
| --- | --- |
| `website/src/pages/index.astro` | Página, conteúdo dos capítulos, cabeçalho, footer e diálogo |
| `website/src/styles/global.css` | Layout, breakpoints, aparelhos CSS, tipografia e cores |
| `website/src/three/hero.ts` | Geometria autoral, materiais, câmera, texturas, parallax e renderização sob demanda |
| `website/src/scripts/main.ts` | Seletores, QR, diálogo, carregamento 3D e animação de scroll |
| `website/src/components/Phone.astro` | Mockup em camadas usado nas seções e fallback |
| `website/src/components/InstallButtons.astro` | CTAs Apple e Android |
| `website/src/components/Icon.astro` | Ícones vetoriais |
| `website/src/config.ts` | Origem do PWA e links de instalação |
| `website/scripts/prepare-assets.mjs` | Derivados de screenshots e marca |
| `website/public/screens/` | 12 imagens WebP de distribuição |
| `website/public/brand/` | Ícone e favicon |
| `website/package.json`, `package-lock.json` | Dependências e comandos reproduzíveis |
| `website/astro.config.mjs`, `vercel.json` | Build e publicação independentes |
| `client/src/components/InstallLanding.tsx` | Tela de instalação no domínio do aplicativo |
| `client/src/main.tsx` | Seleciona instalação ou aplicativo, considerando standalone |
| `client/public/sw.js` | Atualizado para versão comentada 3.2 nesta entrega |

Estruturas sugeridas anteriormente, como `Experience.tsx`, `chapters.ts`, arquivos GLB e `.blend`, não foram criadas. Não procurar ou declarar esses arquivos como entregues.

### 24.3 Diferenças explícitas em relação ao plano

- Não foi usado React Three Fiber: Three.js direto resolve a cena isolada com menos dependências.
- Blender não estava instalado. Os aparelhos são modelos geométricos procedurais, com corpo extrudado, bevel, moldura, tela e botão lateral; não foram produzidos GLB nem modelos Blender.
- Só a abertura renderiza 3D em tempo real. As outras seções usam screenshots em aparelhos CSS com profundidade visual e movimentos GSAP. Elas ainda não são cenas cinematográficas completas.
- O fallback atual é aparelho CSS, não poster renderizado da mesma câmera. Substituir por poster correspondente faz parte da próxima evolução.
- Android usa recorte de conteúdo de uma captura iOS, removendo a barra do sistema; não há captura Android física validada.
- A abertura atual não tem vídeo. Não confundir o parallax da cena Three.js com um filme 3D produzido.
- Não houve auditoria completa de todas as metas de desempenho, VoiceOver ou bateria do plano. Não marcar todos os critérios históricos como aprovados.

### 24.4 Instalação entregue

Os botões apontam para `https://manaus-live-transit.vercel.app/?install=ios` ou `?install=android`. No desktop, apresentam QR gerado localmente e link de continuidade; em ponteiro coarse, seguem o link. Sem JavaScript, o link continua válido.

O PWA mostra ícone, instruções e opção de continuar no navegador. Android utiliza `beforeinstallprompt` quando disponível, com confirmação do usuário; sem evento, orienta pelo menu. Em standalone, o aplicativo abre normalmente em vez de manter a instrução. A identidade do manifesto e o domínio existente foram preservados. Não prometer instalação silenciosa nem ocultação do domínio nos menus do sistema.

### 24.5 Publicação e validação efetivamente feitas

- Commit `10a58f4` enviado ao GitHub, `master`.
- Site publicado via CLI no projeto separado `mano-site`, alias `https://mano-site-seven.vercel.app`; Vercel retornou READY.
- Push acionou publicação do PWA; Vercel retornou READY e status GitHub success.
- Página `https://manaus-live-transit.vercel.app/?install=ios` aberta após publicação e instruções confirmadas no navegador.
- Build do site com zero erros/avisos de tipos; build do aplicativo aprovado.
- Auditoria do pacote do site sem vulnerabilidades após atualização de Astro/Sharp. A auditoria do pacote raiz indicou avisos preexistentes Express/qs; não foram corrigidos neste trabalho.
- Navegador: hero renderizou com as duas texturas; seletores de Volta/Estações responderam; diálogo iPhone exibiu QR; largura 390px sem overflow horizontal na sessão testada.
- Falha ao abrir Simulator pela ferramenta: ScreenCaptureKit `-3811`, falha de captura de áudio/vídeo. **Não foi concluído o teste Xcode nesta entrega.**
- Não testados nesta rodada: iPhone físico, Android físico, instalação real a partir do menu, VoiceOver, métricas de campo e todas as condições de falha do plano.

### 24.6 Retomada operacional sem perder trabalho

Executar `git status` antes de mudar arquivos. Continuam existindo exclusões/novas screenshots e script de captura que não pertencem ao commit do site; preservá-los. Não usar `git add .` para incluir mudanças alheias.

As imagens finais WebP estão versionadas. A origem `screenshots/20_detalhes_rota_rua_kobe_caminhada_osm.png` usada pelo preparador ainda estava não rastreada na inspeção: em outro checkout, recuperar essa origem antes de rodar novamente o script, ou preservar o derivado existente. O build normal não executa o preparador e usa os assets já presentes.

Comandos do site, a partir de `website/`: `npm ci`, `npm run dev`, `npm run build`, `npm run preview`. O preview do Astro 7 pode permanecer como serviço; usar `astro preview status/stop` se precisar gerenciá-lo. Não encerrar outros servidores do usuário sem identificar sua origem.

Publicação do site: dentro de `website/`, selecionar explicitamente projeto `mano-site` e scope `eubielreis-6334s-projects`, por exemplo `vercel deploy --prod --yes --project mano-site --scope eubielreis-6334s-projects`. Não publicar a pasta na configuração do PWA. Git deploy automático do novo projeto não foi configurado. Mudanças no PWA seguem o fluxo existente de GitHub/Vercel.

## 25. Próxima evolução — direção cinematográfica solicitada

### 25.1 Pedido do usuário e o que preservar

O usuário gostou das informações e pediu uma capa como a AVA: vídeo muito grande atrás do conteúdo, mostrando iPhone e Android com o Manô, transmitindo grandiosidade. Deseja que as seções mantenham essa presença à medida que navega e movimenta o mouse. Quer também uma abertura com o nome Manô e conexão com “mano”, expressão familiar em Manaus.

Preservar textos informativos, ordem dos recursos, funcionalidades, paleta, telas reais e fluxo de instalação. Evoluir direção de arte, escala, composição e motion. Não inventar funcionalidades, métricas ou dados ao vivo para preencher uma cena.

Proposta apresentada: **“Manô, bora?”**, com apoio **“Manaus na sua mão.”**. A frase aproxima o aplicativo de uma companhia para atravessar a cidade. É a direção recomendada para o protótipo; confirmar a preferência na revisão visual, sem declarar aprovação que não ocorreu. Evitar regionalismo exagerado ou caricatural.

### 25.2 Nova capa — especificação de produção

- Hero full-bleed, com vídeo ocupando o cenário inteiro, em vez de uma coluna de aparelhos pequenos ao lado do texto.
- iPhone e Android com telas reais; luz principal neutra e recortes azul/laranja sobre fundo escuro.
- Texto e CTAs em HTML sobre região com baixa variação luminosa. Usar overlay graduado para legibilidade, não esconder o vídeo inteiro sob preto.
- Nome Manô e mensagem principal dominantes; botões iPhone/Android visíveis logo de início. A animação não bloqueia nem atrasa o clique.
- Desktop: cena ampla, aparelhos em escala grande e título sobre espaço negativo planejado. Mobile: composição vertical própria, com câmera e distribuição próprias; não cortar o vídeo desktop indiscriminadamente com `cover`.
- Começar com um poster que já mostre o produto e a mensagem. Não repetir uma introdução longa totalmente escura.
- Vídeo sem áudio, `muted`, `playsinline`, com poster e tratamento de autoplay bloqueado. Pausar fora de vista e com página oculta. Em movimento reduzido/economia de dados, manter poster.

Storyboard inicial proposto para um filme de 8–12 segundos, sujeito ao orçamento final:

| Tempo aproximado | Quadro | Intenção |
| --- | --- | --- |
| 0–2s | Contornos já reconhecíveis; iPhone/Android entram em luz, telas presentes | Identificar o aplicativo imediatamente |
| 2–5s | Movimento lateral e aproximação suave em três quartos | Mostrar volume, material e as duas plataformas |
| 5–8s | Uma tela de trajeto ganha espaço; outra mantém a home | Mostrar uso, não apenas hardware |
| 8–12s | Retorno lento à composição inicial ou pose de repouso | Loop sem salto ou encerramento elegante |

Revisar um animatic leve antes do render final. Loop não pode exigir reversão artificial do vídeo nem fazer telas desaparecerem. Não aplicar movimento de mouse no vídeo para fingir que a câmera interna responde: se necessário, usar deslocamento CSS de até 1–2% em camada independente, sem alterar a legibilidade. Reservar interação espacial verdadeira para cenas WebGL.

### 25.3 Como produzir os materiais

1. Conferir disponibilidade real de Blender ou ferramenta equivalente antes de decidir o pipeline. Não alegar uso de software inexistente.
2. Modelar/refinar aparelhos com bevels e luzes de estúdio; aproveitar parâmetros dos modelos atuais quando útil, mas melhorar o acabamento para close-up.
3. Aplicar screenshots sem distorção; obter captura Android adequada ou registrar a limitação do mockup. Não duplicar câmera/ilha de sistema.
4. Definir três quadros de aprovação: abertura desktop, abertura mobile e detalhe de tela.
5. Renderizar animatic em baixa resolução; verificar sobreposição de texto e botões no próprio site.
6. Só depois renderizar final, comprimir e gerar posters correspondentes. Guardar fonte de autoria e configuração de câmera/exportação.
7. Manter materiais finais locais, sem hotlink de vídeos/arquivos AVA ou Apple. Registrar autoria/licença de qualquer asset externo.

Proposta de distribuição: vídeo desktop 1920×1080 e variante mobile 720×1280, 24 ou 30fps; MP4 H.264 como base, alternativa moderna apenas se medida e necessária. Alvo inicial de 2–4MB por variante; selecionar apenas uma variante por dispositivo. Esses números são metas para teste, não garantias de qualidade. Se não atingir boa nitidez e peso, reduzir duração/movimento antes de aumentar indiscriminadamente resolução.

Adicionar futuros arquivos, somente quando produzidos: `website/public/films/hero-desktop.mp4`, `hero-mobile.mp4`; `website/public/posters/hero-desktop.webp`, `hero-mobile.webp`; `website/assets-source/` com autoria/receita e `docs/site-mano/ASSETS.md` com hashes e decisões. Não criar arquivos vazios como se fossem entregas.

### 25.4 Seções com maior presença

| Seção atual | Atualização visual proposta | Informação preservada |
| --- | --- | --- |
| Planejamento | Aparelho grande em palco amplo; câmera aproxima origem/destino e depois resultado | Seleção de destino e passos da viagem |
| Linhas | Close da busca e catálogo; menos moldura/caixa em torno da apresentação | Facilidade de encontrar a linha |
| Ida/Volta | Dois aparelhos grandes; azul/laranja organizam os sentidos; troca controlada pelo usuário | Percurso e paradas por sentido |
| Veículos | Mapa ocupa quase toda a área visual; aparelho vira enquadramento de apoio | Dados disponíveis e natureza demonstrativa da imagem |
| Conexões | Aparelho central com camadas de terminais/estações; profundidade moderada | Alternância entre terminais, estações e perto de você |
| Alertas | Cena ampla quase frontal com recorte laranja e foco na informação | Alertas antes de sair |
| Instalação | Retorno dos dois aparelhos em composição memorável | Dois CTAs e alternativa de navegador |

Evitar vídeos simultâneos por seção. Usar WebGL, vídeo ou render conforme o objetivo; não converter todas as telas em vídeos pesados por uniformidade. O que unifica é direção de arte, escala e luz. No desktop, rolagem conduz a sequência; mouse produz apenas parallax sutil. No celular, rolagem e controles explícitos bastam.

### 25.5 Critérios de aceite desta atualização

- Primeiro quadro comunica Manô, mostra aparelhos e mantém os dois CTAs acessíveis sem assistir ao filme inteiro.
- Visual realmente maior e cinematográfico, não apenas zoom excessivo que corta a interface.
- Títulos/CTAs legíveis em todos os quadros e com vídeo pausado; cenas não competem com texto.
- Composição mobile própria, sem conteúdo essencial fora da tela e sem barra horizontal.
- Poster equivalente ao frame inicial; nenhuma tela preta em rede lenta, erro de vídeo ou bloqueio de autoplay.
- Movimento reduzido com experiência estática completa; mouse não é requisito para entender recursos.
- Máximo de uma mídia animada pesada ativa; medir carga, decodificação, frames e memória em aparelhos reais.
- Preservar seletores, QR, instalação e home standalone; repetir testes de regressão desses fluxos.
- Validar novamente Simulator quando a captura funcionar e registrar dispositivos físicos efetivamente disponíveis. Não reutilizar o teste de navegador como prova de instalação física.

## 26. Checklist de passagem para a próxima IA

1. Ler primeiro as seções 24–25 e os arquivos reais em `website/`.
2. Abrir https://mano-site-seven.vercel.app para comparar a capa ampliada com o código local; conferir a publicação antes de iniciar.
3. Conferir Git e preservar mudanças de screenshots não incluídas no trabalho.
4. Continuar a capa protótipo existente com storyboard, vídeo e posters; não reescrever todas as seções.
5. Preservar as informações elogiadas; usar “Manô, bora?” como proposta visual revisável.
6. Confirmar ferramentas de render disponíveis; registrar escolha, custo de mídia e eventuais limitações reais.
7. Produzir e validar a capa antes de expandir a linguagem para as demais seções.
8. Atualizar progresso/decisões/validação e publicar somente no projeto correto.

**Ponto exato de parada desta revisão:** capa protótipo ampliada em `website/src/pages/index.astro`, `website/src/styles/global.css` e `website/src/three/hero.ts`, com nova copy e entrada 3D suave. Build e tipos aprovados; composição desktop e viewport móvel de 390px inspecionados no navegador. Nenhum vídeo, modelo Blender ou poster cinematográfico foi produzido. Demais seções mantêm a implementação anterior. Continuar pela produção audiovisual da seção 25 e, depois, evolução visual das seções. Não confundir esta etapa parcial com toda a direção cinematográfica concluída. Preservar as alterações de screenshots de outros trabalhos.
