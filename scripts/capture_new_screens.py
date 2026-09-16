#!/usr/bin/env python3
"""
Mano Transit - Script de Captura Exclusiva das Novas Telas
Captura APENAS as novas telas ajustadas no iOS Simulator em resolução nativa Retina (iPhone 17 Pro).
Salva todas as novas imagens em ./screenshots/
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

NEW_SCREENS = [
    {
        "name": "17_confirmacao_trajeto_terminal2_imprensa.png",
        "url": f"{BASE_URL}/?orig=Terminal+2&dest=Imprensa+Oficial",
        "wait": 7.5,
        "desc": "Confirmação do Trajeto Uber/99 (Terminal 2 -> Imprensa Oficial) com Pontos de Embarque e Horários"
    },
    {
        "name": "18_detalhes_rota_terminal2_imprensa.png",
        "url": f"{BASE_URL}/?orig=Terminal+2&dest=Imprensa+Oficial&confirm=0",
        "wait": 8.0,
        "desc": "Detalhes da Rota Selecionada no Terminal 2 (Design Moderno UI/UX, Sem Caminhada, Ponto 3)"
    },
    {
        "name": "19_confirmacao_trajeto_rua_kobe_imprensa.png",
        "url": f"{BASE_URL}/?orig=Rua+Kobe&dest=Imprensa+Oficial",
        "wait": 7.5,
        "desc": "Confirmação do Trajeto (Rua Kobe -> Imprensa Oficial) com Ordenação Inteligente por Parada Mais Próxima"
    },
    {
        "name": "20_detalhes_rota_rua_kobe_caminhada_osm.png",
        "url": f"{BASE_URL}/?orig=Rua+Kobe&dest=Imprensa+Oficial&confirm=0",
        "wait": 8.0,
        "desc": "Detalhes do Trajeto com Caminhada pelas Ruas do OpenStreetMap (Sem passar por cima de casas)"
    }
]

def capture_screen(item):
    name = item["name"]
    url = item["url"]
    wait_time = item["wait"]
    desc = item["desc"]
    out_path = os.path.join(OUTPUT_DIR, name)

    print(f"\n[Captura Novas Telas] {desc}")
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
    print(f"Iniciando captura de {len(NEW_SCREENS)} novas telas ajustadas no Manô Web...")
    for idx, screen in enumerate(NEW_SCREENS, 1):
        print(f"\n[{idx}/{len(NEW_SCREENS)}] Processando nova tela...")
        capture_screen(screen)
    print(f"\n Todas as {len(NEW_SCREENS)} novas telas foram salvas em: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
