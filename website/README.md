# Manô — site de apresentação

Projeto independente do PWA, construído com Astro 7, TypeScript, Three.js e GSAP. A apresentação é HTML estático; Three.js e QR code carregam sob demanda.

## Executar

```sh
cd website
npm ci
npm run dev
```

`npm run assets` recria os derivados a partir das capturas em `../screenshots/`, sem modificar originais. `npm run build` verifica os tipos e gera `dist/`. `npm run preview` serve a versão compilada. Node usado na implementação: 25.9.0; para CI usar Node 22.12+ compatível com Astro. Lockfile versiona as dependências.

## Estrutura

- `src/pages/index.astro`: conteúdo editorial e estrutura acessível.
- `src/styles/global.css`: identidade, aparelhos estáticos e breakpoints.
- `src/three/hero.ts`: modelos geométricos autorais e renderização sob demanda.
- `src/scripts/main.ts`: seletores, instalação, QR code e motion.
- `src/config.ts`: origem do aplicativo.

Não vincular este diretório ao projeto Vercel do aplicativo. Usar um projeto separado. O site não registra service worker nem tem manifesto próprio: seus CTAs apontam ao PWA.

## Assets

As screenshots são do aplicativo Manô, fornecidas no repositório. O Android utiliza um recorte da área do aplicativo sem a barra de sistema do iPhone, e não é apresentado como captura nativa Android. A carcaça 3D é gerada por código (Shape/ExtrudeGeometry); não há modelo de terceiro ou arquivo Blender. Essa decisão evita dependência de uma ferramenta não instalada e mantém a modelagem reproduzível.

Outfit é fornecida localmente por `@fontsource-variable/outfit`, com licença incluída no pacote. As imagens de mapa são demonstrações estáticas. Não há integração de analytics nem chamadas a APIs de veículos no site.

## Instalação

Desktop abre diálogo com QR; celular navega para `APP_URL/?install=ios|android`. O componente `client/src/components/InstallLanding.tsx` trata essa entrada no PWA, e o contexto standalone continua abrindo o aplicativo. Não existe instalação silenciosa. Testar menus e confirmação em dispositivos reais antes de afirmar cobertura de plataforma.
