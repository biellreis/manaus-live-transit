# Progresso do site Manô

## Implementado

Site independente em `website/`, hero com aparelhos Three.js, conteúdo de oito capítulos, capturas otimizadas, seletores de planejamento/sentido/conexões, FAQ, QR local para instalação em desktop e links de instalação no celular. Tela de instalação implementada no PWA.

## Verificação realizada

Build e tipos do site aprovados; build do app aprovado. Auditoria de dependências do site após atualização: zero vulnerabilidades. Navegador: hero 3D renderizado; Ida/Volta e Estações respondem; diálogo iPhone mostra QR e destino correto. Largura 390px sem overflow horizontal.

## Limitações registradas

Sem teste físico Android/iPhone; captura Android real pendente. Modelos procedurais substituem GLB/Blender; fallback é aparelho CSS e imagem. Metas de desempenho de campo e validação VoiceOver ainda não medidas. Ver `DECISOES.md`.

## Continuidade

Site publicado em https://mano-site-seven.vercel.app, no projeto Vercel `mano-site`, separado do aplicativo. Publicação via CLI a partir de `website/`; Git deploy automático desse novo projeto ainda não configurado. Para atualizar, executar Vercel dentro dessa pasta e selecionar explicitamente `mano-site`.

Conferir `VALIDACAO.md` e estado Git antes de editar. Preservar alterações anteriores nas screenshots. Após entrega, priorizar revisão visual do usuário e validação em aparelhos físicos. Não reconstruir o site de outro framework sem motivo registrado.
