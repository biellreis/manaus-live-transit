# Progresso do site Manô

Atualização de continuidade: planejamento principal v1.3, seções 24–26. Commit da primeira implementação: `10a58f4`.

## Próxima evolução solicitada

O usuário aprovou as informações e deseja apresentação mais grandiosa, com vídeo de iPhone/Android ao fundo da capa inspirado na AVA e cenas maiores nas demais seções. Nesta rodada limitada pelo orçamento, a capa foi ampliada, com “Manô, bora?” / “Manaus na sua mão.”, luz azul/laranja e entrada Three.js de quatro segundos. É um protótipo com 3D em tempo real; vídeo não produzido. Restante das seções preservado.

Próxima ação de desenvolvimento: storyboard, três quadros mestres e evolução da capa existente com poster e vídeo responsivo. Preservar CTAs em HTML, conteúdos e controles atuais. Ver seção 25 do plano para pipeline, sequência do vídeo e critérios de aceite. Build desta revisão aprovado; inspeção visual desktop e 390px realizada, sem overflow horizontal no móvel. Validação física e Simulator continuam pendentes.

## Implementado

1. **Limpeza Editorial e Remoção de Frases Curtas / Ruído Visual**:
   - Remoção de stickers flutuantes que cobriam os aparelhos (`.floating-label`, `.label-start`, `.label-end`).
   - Remoção de legendas decorativas repetitivas e microfrases sem sentido (`.art-caption`, `.route-label`, `.fine`, `.subtle-note`, `.map-window-caption`, textos secundários desnecessários nos passos e linhas).
   - Eliminação de textos fragmentados no rodapé da capa, substituídos por um botão elegante e limpo de rolagem (`Explore o Manô ↓`).
   - Submenu `.feature-nav` transformado em barra de navegação sticky premium, translúcida e minimalista.

2. **Ampliação da Presença Visual dos Aparelhos e Seções**:
   - **Hero 3D (Three.js)**: Aparelhos aumentados e aproximados da câmera (`scale 1.08/1.04`), iluminação cromática dual (azul `#3B82F6` e laranja `#F97316`), materiais com reflexo metálico refinado e animação contínua sutil de flutuação/respiração sincronizada com o mouse.
   - **Planejamento**: Aparelho ampliado para 295px, palco limpo e passos numerados claros.
   - **Linhas**: Cards de linhas limpos, com rotas reais de Manaus (640, 300, 448) em destaque.
   - **Trajetos**: Palco amplo (`740px`), aparelho em 295px, seletor de Ida e Volta fluido.
   - **No Mapa**: Janela do mapa ampliada para 480px, visão panorâmica dos ônibus e vias.
   - **Conexões**: Showroom triptych ampliado (290px central, 240px laterais), abas de Terminais, Estações e Perto de Você.
   - **Alertas**: Aparelho em 285px com disco âmbar e badge de notificação.

3. **Verificação**:
   - Build estático do Astro: 0 erros, 0 avisos.
   - Testes unitários do repositório: 15/15 aprovados.

## Verificação realizada

Build e tipos do site aprovados; build do app aprovado. Auditoria de dependências do site após atualização: zero vulnerabilidades. Navegador: hero 3D renderizado; Ida/Volta e Estações respondem; diálogo iPhone mostra QR e destino correto. Largura 390px sem overflow horizontal.

PWA também publicado com status READY/success; entrada `?install=ios` verificada em produção no navegador. Teste Xcode não concluído por erro de captura ScreenCaptureKit -3811. Não há validação física de instalação nesta rodada.

## Limitações registradas

Sem teste físico Android/iPhone; captura Android real pendente. Modelos procedurais substituem GLB/Blender; fallback é aparelho CSS e imagem. Metas de desempenho de campo e validação VoiceOver ainda não medidas. Ver `DECISOES.md`.

## Continuidade

Site publicado em https://mano-site-seven.vercel.app, no projeto Vercel `mano-site`, separado do aplicativo. Publicação via CLI a partir de `website/`; Git deploy automático desse novo projeto ainda não configurado. Para atualizar, executar Vercel dentro dessa pasta e selecionar explicitamente `mano-site`.

Conferir `VALIDACAO.md` e estado Git antes de editar. Preservar alterações anteriores nas screenshots. Após entrega, priorizar revisão visual do usuário e validação em aparelhos físicos. Não reconstruir o site de outro framework sem motivo registrado.
