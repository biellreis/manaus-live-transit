# Manaus Live Transit 🚌⚡

Aplicativo profissional de transporte público em tempo real da cidade de Manaus/AM, projetado com interface de alto padrão inspirada nas referências do Dribbble (#10181902, #17281929, #21560169), suporte nativo para iOS (Xcode / Apple Simulator no iPhone 17 Pro Max) e PWA mobile.

---

## 📁 Estrutura do Projeto

```
manaus-live-transit/
├── client/                     # Frontend Web PWA (React 19, TypeScript, Vite, MapLibre GL, Lucide Icons)
│   ├── src/
│   │   ├── components/         # MapView, BottomSheet, LineExplorerModal, SearchBar, BusTelemetryCard, MetroTimeline
│   │   ├── hooks/              # useLiveVehicles (SSE), useHaptic (Taptic Engine)
│   │   └── types/              # Definições de tipos canônicos (Transit, Routes, Trips, Telemetry)
│   └── dist/                   # Build de produção otimizado
│
├── server/                     # Backend BFF (Node.js, Express, TypeScript)
│   ├── src/
│   │   ├── services/
│   │   │   ├── sinetramClient.ts       # Cliente com engenharia reversa do Sinetram / Mobilibus (Projeto 4pc1e)
│   │   │   ├── manausNetworkCatalog.ts # Catálogo oficial: Linhas 001 até 715 & Bacia A (A030 a A626)
│   │   │   └── terminalsData.ts        # Terminais T1-T6 e Estações E1-E4
│   │   └── index.ts            # Rotas da API REST & Stream SSE a cada 4.5s
│   └── dist/                   # Build compilado do backend
│
├── ios/                        # Projeto Nativo Apple (Swift 6, SwiftUI, WKWebView Metal)
│   ├── project.yml             # Configuração declarativa do XcodeGen
│   ├── ManausLiveTransit.xcodeproj # Arquivo do projeto Xcode
│   └── ManausLiveTransit/
│       ├── App/                # Ciclo de vida @main SwiftUI
│       ├── Views/              # ContentView.swift e TransitWebView.swift
│       ├── Bridges/            # HapticBridge.swift (UIImpactFeedbackGenerator)
│       └── WebDist/            # Bundle local empacotado para execução offline
│
└── docs/                       # Documentação técnica, análise da malha e capturas do iPhone 17 Pro Max
    ├── manaus_bus_network_analysis.md # Análise completa da engenharia reversa das 240+ linhas
    ├── walkthrough.md                 # Relatório passo a passo de desenvolvimento e telas
    └── final_iphone17_promax.png      # Captura da tela rodando no simulador iPhone 17 Pro Max
```

---

## 🚀 Como Executar

### 1. Iniciar o Backend BFF
```bash
cd server
npm install
npm run dev
# Servidor ativo em: http://localhost:3001
```

### 2. Iniciar o Frontend Web (PWA)
```bash
cd client
npm install
npm run dev
# Aplicação ativa em: http://localhost:5173
```

### 3. Abrir no Xcode / Apple Simulator
```bash
# Abrir o projeto diretamente no Xcode:
open ios/ManausLiveTransit.xcodeproj

# Ou abrir a aplicação diretamente no simulador Apple:
open -a Simulator
xcrun simctl openurl booted http://localhost:5173
```

---

## 🗺️ Mapeamento de Linhas
* **Malha Completa**: Mais de 240 linhas mapeadas com paradas, distâncias acumuladas e horários calculados.
* **Linhas Regulares**: Do código 001 até o 715 (**Linha 715 - Jardim Mauá / T2 / Cachoeirinha**).
* **Bacia Alimentadora A**: Do código **A030** (*Santa Etelvina / E4*) até o **A626** (*Cj. Beija-Flor / Estação E3*).
