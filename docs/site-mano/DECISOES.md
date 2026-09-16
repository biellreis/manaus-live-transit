# Decisões de implementação

15/09/2026 — primeira implementação.

- Astro 7.3.2, Three.js direto e GSAP. React Three Fiber não foi necessário para uma cena isolada; remover React do site reduz dependências sem afetar o React do aplicativo.
- Modelos de aparelhos gerados por geometria em `website/src/three/hero.ts`, incluindo moldura, bevel e tela. Blender não está instalado. Não alegar que foram produzidos modelos GLB ou renders Blender.
- Cena WebGL na abertura; capítulos usam aparelhos em camadas CSS com screenshots e movimentos de scroll. Fallback mantém aparelhos visíveis, mas não é um render offline idêntico ao canvas. Essa é uma diferença em relação ao plano, registrada para melhoria visual futura.
- Android é mockup de apresentação com recorte de conteúdo real do aplicativo, sem indicadores de sistema iOS. Captura de dispositivo Android real ainda não foi produzida.
- Movimento reduzido não importa Three.js ou GSAP. Renderização 3D para quando não há movimento, quando a página está oculta ou o hero sai da tela.
- Dados mostrados são capturas, não feed ao vivo. O site não usa credenciais ou APIs do backend.
- A única integração no PWA é entrada `?install=ios|android`; abertura standalone preserva a home. Não alteramos domínio, identidade do manifesto ou regras de viewport.
