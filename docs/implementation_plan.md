# Plano de Implementação: Manaus Live Transit no Xcode & Análise Profunda das Linhas

## Objetivo
Atender com excelência à solicitação de:
1. **Construção do Aplicativo no Xcode**: Gerar um projeto Xcode nativo (`ManausLiveTransit.xcodeproj`) moderno com Swift 6 / SwiftUI e WebKit (`WKWebView`), compilar via `xcodebuild` e abrir diretamente no Xcode (`open ManausLiveTransit.xcodeproj`).
2. **Análise Profunda Linha por Linha de Manaus**: Mapear todas as linhas do transporte coletivo de Manaus (238 linhas catalogadas no Sinetram/Mobilibus), detalhando sua estrutura de Ida/Volta, paradas, itinerários, partidas diárias e corredores viários.
3. **Refinamento Avançado de UI/UX (Dribbble #10181902, #17281929, #21560169)**: Eliminar quaisquer instabilidades ou desvios visuais, garantindo traçado perfeito no estilo Uber (sem neon, sem emojis), controle segmentado de sentido e timeline minuto a minuto.

---

## 1. Arquitetura da Solução no Xcode

### 1.1. Estrutura do Projeto iOS (`ios/`)
Utilizaremos o **XcodeGen** (`/opt/homebrew/bin/xcodegen`), a ferramenta padrão da indústria para geração declarativa e limpa de `.xcodeproj` no ecossistema Apple, compatível com Swift 6 e Xcode 26:

```
manaus-live-transit/ios/
├── project.yml                          # Especificação declarativa do XcodeGen
├── ManausLiveTransit/
│   ├── App/
│   │   └── ManausLiveTransitApp.swift   # @main SwiftUI Lifecycle
│   ├── Views/
│   │   ├── ContentView.swift            # View principal com controle nativo e container
│   │   └── TransitWebView.swift         # WKWebView configurada com Metal acceleration e bridges
│   ├── Bridges/
│   │   ├── HapticBridge.swift           # Feedback háptico nativo via UIImpactFeedbackGenerator
│   │   └── LiveActivityBridge.swift     # Estrutura para Dynamic Island / Live Activities no iOS
│   ├── Resources/
│   │   ├── Assets.xcassets/             # Ícones do App, Splash Screen e Cores do Sistema
│   │   ├── Info.plist                   # Permissões de localização e configuração do iOS 18
│   │   └── WebDist/                     # Bundle compilado da aplicação web (offline-first)
```

### 1.2. Recursos Nativos no Xcode
* **Aceleração por Hardware Metal/WebKit**: Renderização a 60/120 FPS dos mapas vetoriais Carto/MapLibre e das animações táteis.
* **WKWebView Bridge Bidirecional**: Troca de mensagens JavaScript <-> Swift para:
  - Disparo de vibrações hápticas reais do Taptic Engine (`UIImpactFeedbackGenerator`).
  - Atualização do Dynamic Island com status do ônibus aproximando.
  - Sincronização da barra de status iOS (Light/Dark mode).
* **Bundle Offline**: O pacote gerado por `npm run build` será embutido nos resources do app para funcionamento autônomo sem internet.

---

## 2. Análise Profunda Linha por Linha do Transporte de Manaus

Criaremos um artefato técnico detalhado (`manaus_bus_network_analysis.md`) analisando a malha completa:

### 2.1. Matriz de Categorias e Corredores Viários
1. **Linhas Troncais Expressas e Faixa Azul**:
   - **Corredor Norte (Torquato Tapajós / Constantino Nery)**:
     - **Linha 640** (T4 ↔ Centro via T3, E4, E2, E1, T1): 134 partidas/dia na Ida (19.29 km, 34 paradas, 52 min), 133 partidas na Volta (23.43 km, 40 paradas, 54 min).
     - **Linha 300** (Expresso Norte - T4 ↔ Centro via Plataforma Manôa, E4, E3, E2, E1, T1).
     - **Linha 448** (Cidade de Deus ↔ Centro via T3, Faixa Azul).
     - **Linha 560** (T4 ↔ Centro via Nova Cidade, Torquato).
     - **Linha 357** (Viver Melhor ↔ Centro via Av. das Flores, T3, T1).
     - **Linha 500** (Novo Israel ↔ Centro via E3, E2, E1).
   - **Corredor Leste (Autaz Mirim / Cosme Ferreira)**:
     - **Linha 652** (T4 ↔ Centro via T5, Efigênio Salles, André Araújo).
     - **Linha 650** (T4 ↔ Centro via T5, Cachoeirinha, T2).
     - **Linha 600** (T4 ↔ T5 ↔ Centro via Boulevard).
     - **Linha 678** (T4 ↔ Ponta Negra via T5, Av. do Turismo).
   - **Corredor Sul / Distrito Industrial (SUFRAMA)**:
     - **Linha 418** (T3 ↔ Distrito Industrial via Djalma Batista).
     - **Linha 535** (Terminal 5 ↔ Distrito Industrial).
     - **Linha 611** (Japiim ↔ Centro via Cachoeirinha).
2. **Linhas Alimentadoras dos Terminais Integrados**:
   - **Bacia T3 (Cidade Nova)**: Linhas `041`, `042`, `044`, `052`, `053`, `054` alimentando bairros como Manôa, Mundo Novo, Canaranas, Monte das Oliveiras.
   - **Bacia T4 (Jorge Teixeira)**: Linhas `062`, `063`, `064`, `065`, `066`, `067`, `068` conectando João Paulo, Valparaíso, Grande Vitória.
   - **Bacia T5 (São José Operário)**: Linhas `080`, `081`, `082`, `084`, `085`, `088`, `092` cobrindo Zumbi, Armando Mendes, Gilberto Mestrinho.
   - **Bacia T2 (Cachoeirinha)**: Conexões históricas com a Zona Sul (Colônia Oliveira Machado, Educandos, Morro da Liberdade).
3. **Linhas Interbairros e Circulares**:
   - **Linha 001** (Interbairros I) e **Linha 002** (Interbairros II): Anéis perimetrais pelas avenidas Djalma Batista, Darcy Vargas, Mario Ypiranga e Constantino Nery.
   - **Linhas Circulares**: `004`, `010`, `014`, `126` conectando Compensa, Ponta Negra, São Raimundo e Parque 10.

---

## 3. Plano de Execução Passo a Passo

### Fase 1: Análise Profunda das Linhas (Artefato Técnico)
* Executar script de extração e mapeamento dos metadados das 238 linhas do Sinetram/Mobilibus.
* Documentar a matriz com ID, Código, Nome, Sentidos (Ida/Volta), Terminais de Integração e Frequências.

### Fase 2: Configuração e Geração do Projeto Xcode
* Criar estrutura de arquivos em `ios/` com:
  - `project.yml` para XcodeGen.
  - Arquivos Swift 6 (`ManausLiveTransitApp.swift`, `ContentView.swift`, `TransitWebView.swift`, `HapticBridge.swift`).
  - `Info.plist` com metadados de mobilidade, status bar e permissões.
  - Assets do aplicativo (`AppIcon`, cores de acento do trânsito).
* Compilar a aplicação web com `npm run build` e copiar o `dist/` para dentro dos recursos do bundle iOS.
* Executar `xcodegen generate` para gerar `ios/ManausLiveTransit.xcodeproj`.

### Fase 3: Compilação e Abertura no Xcode
* Validar a compilação do projeto com:
  ```bash
  xcodebuild -project ios/ManausLiveTransit.xcodeproj -scheme ManausLiveTransit -destination 'generic/platform=iOS Simulator' build
  ```
* Abrir o projeto no Xcode do macOS:
  ```bash
  open ios/ManausLiveTransit.xcodeproj
  ```

### Fase 4: Validação da UI/UX
* Assegurar que a interface dentro do app nativo apresente:
  - Zero neon, zero emojis.
  - Traçado estilo Uber com casing escuro de 6.5px e núcleo sólido de 3.5px.
  - Controle segmentado `[ Ida ] [ Volta ]` com filtragem exata de ônibus e paradas.
  - Timeline minuto a minuto com horário previsto em cada parada.
  - Telemetria de aproximação em tempo real.

---

## Verificação
1. **Compilação**: `xcodebuild` finalizando com `BUILD SUCCEEDED`.
2. **Xcode**: Janela do Xcode aberta com o projeto `ManausLiveTransit` pronto para execução no Simulador iOS 18/17.
3. **Documentação**: Relatório técnico completo de linhas disponibilizado no repositório.
