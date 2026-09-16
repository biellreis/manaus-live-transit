# Validação — site Manô

15/09/2026

- `website`: `npm run build` com zero erros de tipos; geração estática concluída.
- `client`: `npm run build` aprovado após a entrada de instalação.
- `website`: `npm audit --omit=dev` sem vulnerabilidades. A auditoria do pacote raiz tem avisos preexistentes de Express/qs; não faz parte da nova landing.
- Navegador Chromium integrado: hero passou de fallback para canvas com texturas; nenhum erro observado no console durante essa revisão.
- Seletor Volta e seletor Estações alteraram `aria-pressed` e a imagem correspondente.
- Diálogo iPhone apresentou QR code local e destino de instalação; fechar devolve foco ao botão.
- 390px: documento sem overflow horizontal (`scrollWidth=375`, viewport de 390px incluindo a barra do navegador de teste). Não equivale a hardware físico.
- Entrada local `http://localhost:5174/?install=ios` mostra apenas instrução de instalação e opção de continuar no navegador.
- Tentativa de abrir Simulator via automação falhou com erro de captura de áudio/vídeo do macOS (ScreenCaptureKit -3811). Não registrar como teste concluído no Xcode.

Ainda não verificados: confirmação real de instalação Android, aparelho iPhone físico, VoiceOver, desempenho de campo/INP e retorno a partir do ícone instalado nesta rodada. As restrições e diferenças artísticas estão em `DECISOES.md`.

O bundle Three.js é carregado sob demanda e gera aviso de tamanho bruto acima de 500KB; o build não falha. Não afirmar que todos os orçamentos do planejamento foram auditados.

Publicação do site: Vercel retornou READY e alias `https://mano-site-seven.vercel.app`. Build remoto do site também concluiu a verificação com zero erros e zero avisos de tipos.
