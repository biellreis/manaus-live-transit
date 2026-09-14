# Análise Técnica Profunda: Rede de Transporte Coletivo de Manaus (Sinetram / IMMU)

Este documento apresenta o mapeamento detalhado de engenharia reversa e a arquitetura operacional das **238 linhas de ônibus** de Manaus cadastradas no sistema Sinetram / Mobilibus (`project: "4pc1e"`), servindo como especificação canônica para o aplicativo nativo iOS e Web.

---

## 1. Arquitetura de Dados & Modelagem de Domínio

### 1.1. Estrutura do Payload Sinetram / Mobilibus
Cada linha de transporte coletivo em Manaus é identificada por:
* `id` (hash interno no Mobilibus, ex: `"215q"` para Linha 640, `"212s"` para Linha 300).
* `code` (número visível para os passageiros, ex: `"640"`, `"300"`, `"041"`).
* `name` (itinerário oficial regulamentado pelo IMMU - Instituto Municipal de Mobilidade Urbana).

```
Estrutura Hierárquica do Sistema
Linha (RouteSummary)
 ├── Sentido IDA (TripDetail: directionType = "ida")
 │    ├── Traçado GeoJSON (Linha de Coordenadas [lng, lat])
 │    ├── Paradas Sequenciais (StopInfo[1..N])
 │    │    ├── stopId, stopName, lat, lng
 │    │    ├── timeSeconds (segundos acumulados desde a saída)
 │    │    └── distKm (quilometragem acumulada desde a origem)
 │    └── Grade Horária Diária (TimetableService: Segunda a Sexta, Sábado, Domingo)
 │         └── Partidas Programadas [04:30, 04:38, 04:46, ..., 23:30]
 │
 ├── Sentido VOLTA (TripDetail: directionType = "volta")
 │    ├── Traçado GeoJSON de Retorno
 │    ├── Paradas Sequenciais (StopInfo[1..M])
 │    └── Grade Horária de Retorno
 │
 └── Telemetria em Tempo Real (LiveBus Stream SSE 4.5s)
      ├── Prefixo do Veículo (ex: "0426003")
      ├── Posição GPS [lat, lng] + Azimute (0-360°)
      ├── Associação de Viagem (tripId) -> determina se o ônibus está na IDA ou VOLTA
      └── Conforto: Ar-condicionado (AC) e Acessibilidade (PCD)
```

---

## 2. Separação de Sentido (Ida vs Volta) & Horários nas Paradas

### 2.1. O Problema das Aplicações Amadoras
Muitos aplicativos de transporte público erram ao misturar o traçado de Ida e Volta na mesma linha ou exibir horários apenas no terminal de origem. Na realidade de Manaus:
* O traçado de **Ida** passa por avenidas distintas do traçado de **Volta** (ex.: Linha 640 vai para o Centro pela Av. Constantino Nery e retorna pela Av. Getúlio Vargas / Epaminondas).
* Cada parada possui um **tempo de deslocamento acumulado (`timeSeconds`)** específico.

### 2.2. Algoritmo de Predição de Passagem em Cada Parada
Para qualquer partida programada no terminal $T_0$ (ex.: 07:15) e uma parada $k$ com tempo acumulado $\Delta t_k$ em segundos:
$$\text{Horário Previsto}(k) = T_0 + \left\lfloor \frac{\Delta t_k}{60} \right\rfloor \text{ minutos}$$

Exemplo prático na Linha 640 (Partida das 07:15 do T4):
1. **Parada #1 (Terminal 4)**: $\Delta t = 0\text{ s} \implies \mathbf{07:15}$
2. **Parada #2 (Plataforma Fátima)**: $\Delta t = 129\text{ s} \implies \mathbf{07:17}$
3. **Parada #14 (Terminal 3 - Cidade Nova)**: $\Delta t = 1080\text{ s} (18\text{ min}) \implies \mathbf{07:33}$
4. **Parada #22 (Estação E2 - Arena da Amazônia)**: $\Delta t = 1860\text{ s} (31\text{ min}) \implies \mathbf{07:46}$
5. **Parada #31 (Terminal 1 - Constantino Nery)**: $\Delta t = 3096\text{ s} (51\text{ min}) \implies \mathbf{08:06}$
6. **Parada #34 (Rio Negro Clube - Centro)**: $\Delta t = 3159\text{ s} (52\text{ min}) \implies \mathbf{08:07}$

---

## 3. Mapeamento Estrutural dos Corredores de Manaus

O sistema de transporte de Manaus é estruturado em **4 Corredores Troncais**, **6 Terminais de Integração (T1 a T6)** e **4 Estações de Transferência (E1 a E4)**:

### 3.1. Corredor Norte (Faixa Azul / Torquato Tapajós / Constantino Nery)
* **Função**: Conectar a Zona Norte (Cidade Nova, Nova Cidade, Viver Melhor) ao Centro Histórico.
* **Linhas Troncais Principais**:
  - **Linha 640** (`215q`): T4 ↔ Centro (via T3, E4, E3, E2, E1, T1). 134 partidas/dia.
  - **Linha 300** (`212s`): Expresso Norte T4 ↔ Centro (via Manôa, E4, E3, E2, E1, T1).
  - **Linha 448** (`214c`): Cidade de Deus ↔ Centro (via T3, Faixa Azul).
  - **Linha 560** (`2153`): T4 ↔ Centro (via Cidade de Deus, Nova Cidade).
  - **Linha 357** (`27mo`): Viver Melhor ↔ Centro (via Av. das Flores, T3, T1).
  - **Linha 500** (`214o`): Novo Israel ↔ Centro (via E3, E2, E1).

### 3.2. Corredor Leste (Autaz Mirim / Cosme Ferreira / Efigênio Salles)
* **Função**: Ligar a Zona Leste (Jorge Teixeira, São José, Tancredo Neves) ao Centro e Distrito Industrial.
* **Linhas Troncais Principais**:
  - **Linha 652** (`215u`): T4 ↔ Centro (via T5, Efigênio Salles, T1).
  - **Linha 650** (`215t`): T4 ↔ Centro (via T5, Cachoeirinha, T2).
  - **Linha 600** (`215k`): T4 ↔ Centro (via T5, Boulevard).
  - **Linha 678** (`2160`): T4 ↔ Ponta Negra (via T5, V8 / Efigênio Salles, Aeroporto).
  - **Linha 671** (`215w`): T5 ↔ Centro (via Autaz Mirim).

### 3.3. Corredor Sul / Distrito Industrial (SUFRAMA)
* **Função**: Atendimento dos trabalhadores do Polo Industrial de Manaus (PIM).
* **Linhas Principais**:
  - **Linha 418** (`213x`): T3 ↔ Distrito Industrial (via Djalma Batista).
  - **Linha 535** (`214z`): Terminal 5 ↔ Distrito Industrial.
  - **Linha 611** (`215p`): Japiim ↔ Centro (via Cachoeirinha).
  - **Linha 708** (`216c`): Coroado ↔ Distrito Industrial.

### 3.4. Anéis Perimetrais (Interbairros e Circulares)
* **Linha 001** (`20vd`) & **Linha 002** (`20ve`): Conectam Zona Oeste, Centro-Sul e Leste através da Av. Darcy Vargas, Mario Ypiranga e Djalma Batista sem passar pela área central.
* **Linhas Circulares (010, 014, 126)**: Alimentam os bairros de Ponta Negra, Tarumã, Compensa e São Raimundo.

---

## 4. Censo Completo das 238 Linhas de Manaus

| Categoria | Total Linhas | Intervalo Típico de Pico | Exemplo de Linhas |
| :--- | :---: | :---: | :--- |
| **Troncal (Faixa Azul / Expressa)** | 14 | 5 a 8 min | 640, 300, 448, 500, 560, 652, 650, 600, 678, 357 |
| **Alimentadora (T1 a T5)** | 85 | 8 a 15 min | 041, 042, 044, 062, 064, 080, 081, 084, 092 |
| **Interbairros** | 3 | 12 a 18 min | 001, 002, 008 |
| **Circular / Oeste** | 5 | 10 a 20 min | 004, 010, 014, 126, 671 |
| **Convencional / Direta** | 131 | 15 a 30 min | 110, 113, 219, 315, 323, 415, 422, 540, 616, 706 |
| **TOTAL GERAL** | **238 Linhas** | **-** | **Malha Completa Integrada** |

---

## 5. Diretrizes de Renderização para o Aplicativo Nativo
1. **Filtro Estrito por Sentido**: Quando o usuário seleciona `[ Ida ]`, o mapa projeta exclusivamente o GeoJSON de ida e filtra ônibus cujo `tripId` pertença àquela viagem.
2. **Casing Escuro Estilo Uber**: Linha externa escura (`#050811`, 6.5px) com núcleo de alta visibilidade (`#2563EB` na Ida e `#D97706` na Volta).
3. **Paradas Interativas**: Círculos brancos de 5px com halo escuro, expandindo para card com a tabela completa ao toque.
4. **Sem Emojis e Sem Cores Neon**: Tipografia nítida (Outfit / SF Pro) e dados tabulares monoespaçados (JetBrains Mono).
