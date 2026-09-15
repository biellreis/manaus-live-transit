#!/usr/bin/env python3
"""
Mano Transit - Script de Captura Automática de Todas as Telas
Captura todas as telas, abas, seções, modais e rotas no iOS Simulator em resolução nativa Retina (iPhone 17 Pro).
Salva todas as imagens em ./screenshots/
"""

import os
import sys
import time
import subprocess

DEVICE_UDID = "057A6921-CE58-4F0C-B1BF-EAFED1245E53"
WEBCLIP_ID = "1863933F99B74B61B77474C8A3747C62"
BASE_URL = "https://manaus-live-transit.vercel.app"

PLIST_PATH = f"/Users/gabrielreis/Library/Developer/CoreSimulator/Devices/{DEVICE_UDID}/data/Library/WebClips/{WEBCLIP_ID}.webclip/Info.plist"
OUTPUT_DIR = "/Users/gabrielreis/manaus-live-transit/screenshots"

os.makedirs(OUTPUT_DIR, exist_ok=True)

SCREENS = [
    {
        "name": "01_splash_motion_abertura.png",
        "url": f"{BASE_URL}/?tab=home",
        "wait": 0.8,
        "desc": "Tela de Abertura / Motion com Logo Manô Web"
    },
    {
        "name": "02_inicio_home.png",
        "url": f"{BASE_URL}/?tab=home",
        "wait": 6.5,
        "desc": "Tela Principal (Home) com mapa ao vivo de ônibus, busca e atalhos"
    },
    {
        "name": "03_linhas_catalogo.png",
        "url": f"{BASE_URL}/?tab=lines",
        "wait": 5.5,
        "desc": "Catálogo Geral de Linhas de Ônibus de Manaus"
    },
    {
        "name": "04_linhas_onibus_direto.png",
        "url": f"{BASE_URL}/?tab=lines&filter=troncal",
        "wait": 5.5,
        "desc": "Linhas filtradas por Ônibus Direto (Troncais e Expressas)"
    },
    {
        "name": "05_linhas_busca_640.png",
        "url": f"{BASE_URL}/?tab=lines&q=640",
        "wait": 5.5,
        "desc": "Busca ativa por linha específica (Linha 640)"
    },
    {
        "name": "06_terminais_paradas_proximas.png",
        "url": f"{BASE_URL}/?tab=stops",
        "wait": 6.0,
        "desc": "Paradas de ônibus mais próximas calculadas por GPS"
    },
    {
        "name": "07_terminais_integracao_t1_t6.png",
        "url": f"{BASE_URL}/?tab=stops&section=terminais",
        "wait": 6.0,
        "desc": "Terminais de Integração de Manaus (T1 ao T6)"
    },
    {
        "name": "08_estacoes_transferencia_e1_e4.png",
        "url": f"{BASE_URL}/?tab=stops&section=estacoes",
        "wait": 6.0,
        "desc": "Estações de Transferência nos corredores (E1 a E4)"
    },
    {
        "name": "09_alertas_transito_todos.png",
        "url": f"{BASE_URL}/?tab=alerts",
        "wait": 6.5,
        "desc": "Aba de Alertas e Trânsito em Tempo Real"
    },
    {
        "name": "10_alertas_fiscalizacao.png",
        "url": f"{BASE_URL}/?tab=alerts&filter=police",
        "wait": 6.5,
        "desc": "Alertas filtrados por Fiscalização de Trânsito"
    },
    {
        "name": "11_planejador_viagens_como_chegar.png",
        "url": f"{BASE_URL}/?planner=true",
        "wait": 6.5,
        "desc": "Planejador de Viagens estilo Uber (Como Chegar)"
    },
    {
        "name": "12_rota_linha_640_ida.png",
        "url": f"{BASE_URL}/?line=640",
        "wait": 7.0,
        "desc": "Rastreamento ao vivo e traçado oficial da Linha 640 (Sentido Ida)"
    },
    {
        "name": "13_rota_linha_640_volta.png",
        "url": f"{BASE_URL}/?line=640&dir=volta",
        "wait": 7.0,
        "desc": "Rastreamento ao vivo da Linha 640 (Sentido Volta)"
    },
    {
        "name": "14_rota_linha_652_troncal_leste.png",
        "url": f"{BASE_URL}/?line=652",
        "wait": 7.0,
        "desc": "Rastreamento ao vivo da Linha 652 (Troncal Leste T4 / Centro)"
    },
    {
        "name": "15_rota_linha_300_expresso_norte.png",
        "url": f"{BASE_URL}/?line=300",
        "wait": 7.0,
        "desc": "Rastreamento ao vivo da Linha 300 (Expresso Norte T4 / T3)"
    },
    {
        "name": "16_detalhes_ponto_onibus.png",
        "url": f"{BASE_URL}/?stop=Djalma",
        "wait": 6.5,
        "desc": "Modal com detalhes da parada de ônibus e linhas atendidas"
    }
]

def capture_screen(item):
    name = item["name"]
    url = item["url"]
    wait_time = item["wait"]
    desc = item["desc"]
    out_path = os.path.join(OUTPUT_DIR, name)

    print(f"\n[Captura] {desc}")
    print(f" -> URL: {url}")
    print(f" -> Destino: {name}")

    # Update URL in WebClip plist
    subprocess.run(["plutil", "-replace", "URL", "-string", url, PLIST_PATH], check=True)

    # Terminate and launch PWA
    subprocess.run(["xcrun", "simctl", "terminate", "booted", "com.apple.webapp"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(0.3)
    subprocess.run(["xcrun", "simctl", "launch", "booted", "com.apple.webapp", "-webclip", WEBCLIP_ID], check=True)

    # Wait for target state
    time.sleep(wait_time)

    # Capture screenshot
    subprocess.run(["xcrun", "simctl", "io", "booted", "screenshot", out_path], check=True)
    print(f" ✓ Salvo com sucesso ({os.path.getsize(out_path):,} bytes)")

def main():
    print(f"Iniciando captura de todas as {len(SCREENS)} telas do Manô Web...")
    for idx, screen in enumerate(SCREENS, 1):
        print(f"\n[{idx}/{len(SCREENS)}] Processando tela...")
        capture_screen(screen)
    print(f"\n Todas as {len(SCREENS)} telas foram capturadas e salvas em: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
