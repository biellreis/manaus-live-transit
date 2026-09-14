#!/usr/bin/env python3
"""
Mano Transit - Simulador iOS Automation CLI
Permite navegacao instantanea via Deep Linking e cliques fisicos via Quartz CoreGraphics.
"""

import sys
import os
import time
import subprocess

try:
    import Quartz
except ImportError:
    Quartz = None

BASE_URL = "https://manaus-live-transit.vercel.app"
ARTIFACT_DIR = "/Users/gabrielreis/.gemini/antigravity/brain/9652dae5-8a5f-49cd-a3a3-710475fd8a54"

def get_simulator_window_bounds():
    if not Quartz:
        return None
    windows = Quartz.CGWindowListCopyWindowInfo(Quartz.kCGWindowListOptionOnScreenOnly, Quartz.kCGNullWindowID)
    for w in windows:
        owner = w.get('kCGWindowOwnerName', '')
        if 'Simulator' in owner:
            b = w.get('kCGWindowBounds', {})
            if b.get('Width', 0) > 100 and b.get('Height', 0) > 200:
                return b
    return None

def click_window_normalized(rx, ry):
    bounds = get_simulator_window_bounds()
    if not bounds:
        print("[sim] Janela do Simulator nao encontrada na tela do Mac.")
        return False

    # Focus simulator
    subprocess.run(["osascript", "-e", 'tell application "Simulator" to activate'], check=False)
    time.sleep(0.1)

    x = bounds['X'] + bounds['Width'] * rx
    y = bounds['Y'] + bounds['Height'] * ry

    # Dispatch LeftMouseDown + LeftMouseUp
    down = Quartz.CGEventCreateMouseEvent(None, Quartz.kCGEventLeftMouseDown, (x, y), Quartz.kCGMouseButtonLeft)
    up = Quartz.CGEventCreateMouseEvent(None, Quartz.kCGEventLeftMouseUp, (x, y), Quartz.kCGMouseButtonLeft)
    Quartz.CGEventPost(Quartz.kCGHIDEventTap, down)
    time.sleep(0.08)
    Quartz.CGEventPost(Quartz.kCGHIDEventTap, up)
    print(f"[sim] Toque executado em ({x:.1f}, {y:.1f}) [{rx*100:.1f}%, {ry*100:.1f}%]")
    return True

def take_screenshot(name):
    filename = f"sim_{name}.png" if not name.endswith('.png') else name
    filepath = os.path.join(ARTIFACT_DIR, filename)
    cmd = ["xcrun", "simctl", "io", "booted", "screenshot", filepath]
    subprocess.run(cmd, check=True)
    print(f"[sim] Screenshot capturado com sucesso: {filepath}")
    return filepath

def open_url(url, wait_sec=2, shot_name=None):
    print(f"[sim] Abrindo URL via Deep Link no simulador: {url}")
    subprocess.run(["xcrun", "simctl", "openurl", "booted", url], check=True)
    if wait_sec > 0:
        time.sleep(wait_sec)
    if shot_name:
        take_screenshot(shot_name)

def main():
    if len(sys.argv) < 2:
        print("Uso:")
        print("  sim.py open line <numero> [ida|volta]")
        print("  sim.py open tab <home|lines|stops|alerts>")
        print("  sim.py open planner")
        print("  sim.py open url <custom_url>")
        print("  sim.py tap tab <1|2|3|4>")
        print("  sim.py tap coords <rx> <ry> (ex: 0.5 0.95)")
        print("  sim.py tap home")
        print("  sim.py shot <nome>")
        sys.exit(1)

    cmd = sys.argv[1].lower()

    if cmd == "open":
        sub = sys.argv[2].lower() if len(sys.argv) > 2 else "home"
        if sub == "pwa":
            print("[sim] Abrindo o aplicativo standalone 'Manô Web' (PWA instalado)...")
            subprocess.run(["xcrun", "simctl", "launch", "booted", "com.apple.webapp", "-webclip", "1863933F99B74B61B77474C8A3747C62"], check=True)
            time.sleep(2)
            take_screenshot("pwa_standalone")
        elif sub == "line":
            num = sys.argv[3] if len(sys.argv) > 3 else "640"
            direction = f"&dir={sys.argv[4]}" if len(sys.argv) > 4 else ""
            url = f"{BASE_URL}/?line={num}{direction}"
            open_url(url, wait_sec=2, shot_name=f"line_{num}")
        elif sub == "tab":
            tab = sys.argv[3] if len(sys.argv) > 3 else "lines"
            url = f"{BASE_URL}/?tab={tab}"
            open_url(url, wait_sec=2, shot_name=f"tab_{tab}")
        elif sub == "planner":
            url = f"{BASE_URL}/?planner=true"
            open_url(url, wait_sec=2, shot_name="planner")
        elif sub == "url":
            url = sys.argv[3]
            open_url(url, wait_sec=2, shot_name="custom_url")

    elif cmd == "tap":
        sub = sys.argv[2].lower() if len(sys.argv) > 2 else "1"
        if sub == "tab":
            idx = int(sys.argv[3]) if len(sys.argv) > 3 else 1
            # 1: Inicio (12.5%), 2: Linhas (37.5%), 3: Terminais (62.5%), 4: Alertas (87.5%)
            rx = 0.125 + (idx - 1) * 0.25
            ry = 0.89  # Floating Dock navigation bar
            click_window_normalized(rx, ry)
            time.sleep(1)
            take_screenshot(f"tap_tab_{idx}")
        elif sub == "coords":
            rx = float(sys.argv[3])
            ry = float(sys.argv[4])
            click_window_normalized(rx, ry)
            time.sleep(1)
            take_screenshot("tap_coords")
        elif sub == "home":
            subprocess.run(["osascript", "-e", 'tell application "Simulator" to activate',
                                         "-e", 'tell application "System Events" to keystroke "h" using {command down, shift down}'], check=False)
            time.sleep(1)
            take_screenshot("home_screen")

    elif cmd == "shot":
        name = sys.argv[2] if len(sys.argv) > 2 else "manual"
        take_screenshot(name)

if __name__ == "__main__":
    main()
