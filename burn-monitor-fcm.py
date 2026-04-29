#!/usr/bin/env python3
"""
BURN Terminal — FCM Push Monitor
=================================
Sends push notifications via Firebase Cloud Messaging.
100% reliable, works even with app killed.

SETUP:
1. Firebase Console → Project Settings → Cloud Messaging
   → Get Server Key (Legacy) OR use Firebase Admin SDK
2. From the app logs (adb logcat | grep BURNTerminal):
   Get the FCM Token
3. Paste both below
4. pip3 install requests
5. python3 burn-monitor-fcm.py

SYSTEMD:
  sudo cp burn-monitor-fcm.service /etc/systemd/system/
  sudo systemctl enable burn-monitor-fcm
  sudo systemctl start burn-monitor-fcm
"""

import json
import time
import requests
from datetime import datetime

# ═══ FIREBASE CONFIG ═══
# Get from: Firebase Console → Project Settings → Cloud Messaging → Server Key
FCM_SERVER_KEY = "PASTE_YOUR_FCM_SERVER_KEY_HERE"

# Get from: App logs (adb logcat | grep "FCM TOKEN")
# Or from: Dashboard localStorage.getItem('fcm_token')
FCM_DEVICE_TOKEN = "PASTE_YOUR_DEVICE_TOKEN_HERE"

# ═══ ALERT CONFIG ═══
PRICE_ALERT_HIGH = 0.20
PRICE_ALERT_LOW = 0.12
PRICE_CHANGE_PCT = 5        # Alert on >5% change in 10 min
CHECK_INTERVAL = 60          # seconds

# ═══ CONTRACTS ═══
POOL = "0xdbde256870eb8fc3e7aeff5bbcbda1e00a640b37"
RPC_URLS = [
    "https://arb1.arbitrum.io/rpc",
    "https://arbitrum-one-rpc.publicnode.com",
    "https://arbitrum.drpc.org"
]

# State
last_price = 0
price_10min_ago = 0
last_alerts = {}
cycle_count = 0


def rpc(method, params):
    for url in RPC_URLS:
        try:
            r = requests.post(url, json={
                "jsonrpc": "2.0", "method": method, "params": params, "id": 1
            }, timeout=10)
            data = r.json()
            if "result" in data:
                return data["result"]
        except:
            continue
    return None


def get_price():
    result = rpc("eth_call", [{"to": POOL, "data": "0x3850c7bd"}, "latest"])
    if not result or len(result) < 66:
        return 0
    sqrt_price = int(result[2:66], 16)
    if sqrt_price == 0:
        return 0
    return (sqrt_price / (2**96)) ** 2 * (10**12)


def send_push(title, body, tag="burn-alert"):
    if FCM_SERVER_KEY == "PASTE_YOUR_FCM_SERVER_KEY_HERE":
        print(f"  ⚠️ FCM not configured! → {title}: {body}")
        return False

    try:
        r = requests.post("https://fcm.googleapis.com/fcm/send",
            headers={
                "Authorization": "key=" + FCM_SERVER_KEY,
                "Content-Type": "application/json"
            },
            json={
                "to": FCM_DEVICE_TOKEN,
                "priority": "high",
                "data": {
                    "title": title,
                    "body": body,
                    "tag": tag
                },
                "notification": {
                    "title": title,
                    "body": body,
                    "sound": "default",
                    "click_action": "OPEN_ACTIVITY"
                }
            },
            timeout=10
        )
        result = r.json()
        if result.get("success", 0) > 0:
            print(f"  📱 PUSH: {title}: {body}")
            return True
        else:
            print(f"  Push failed: {result}")
            return False
    except Exception as e:
        print(f"  Push error: {e}")
        return False


def check(price):
    global last_alerts, last_price, price_10min_ago, cycle_count
    now = time.time()
    cycle_count += 1

    # Price high
    if PRICE_ALERT_HIGH > 0 and price >= PRICE_ALERT_HIGH:
        if "high" not in last_alerts or now - last_alerts["high"] > 3600:
            send_push("🚀 BURN above target",
                      f"${price:.6f} (target: ${PRICE_ALERT_HIGH})")
            last_alerts["high"] = now

    # Price low
    if PRICE_ALERT_LOW > 0 and price <= PRICE_ALERT_LOW:
        if "low" not in last_alerts or now - last_alerts["low"] > 3600:
            send_push("⚠️ BURN below support",
                      f"${price:.6f} (alert: ${PRICE_ALERT_LOW})")
            last_alerts["low"] = now

    # Reset
    if PRICE_ALERT_HIGH > 0 and price < PRICE_ALERT_HIGH * 0.98:
        last_alerts.pop("high", None)
    if PRICE_ALERT_LOW > 0 and price > PRICE_ALERT_LOW * 1.02:
        last_alerts.pop("low", None)

    # Big move (every 10 cycles = 10 min)
    if cycle_count % 10 == 0:
        if price_10min_ago > 0:
            change = (price - price_10min_ago) / price_10min_ago * 100
            if abs(change) >= PRICE_CHANGE_PCT:
                emoji = "📈" if change > 0 else "📉"
                send_push(f"{emoji} BURN {change:+.1f}%",
                          f"${price_10min_ago:.6f} → ${price:.6f} in 10min",
                          tag="price-move")
        price_10min_ago = price

    last_price = price


def main():
    global price_10min_ago
    print("═══ BURN Terminal FCM Monitor ═══")
    print(f"Alerts: >${PRICE_ALERT_HIGH} / <${PRICE_ALERT_LOW} / {PRICE_CHANGE_PCT}% change")
    print(f"Interval: {CHECK_INTERVAL}s")
    if FCM_SERVER_KEY == "PASTE_YOUR_FCM_SERVER_KEY_HERE":
        print("\n⚠️  FCM NOT CONFIGURED — dry run mode\n")
    print()

    while True:
        try:
            price = get_price()
            if price > 0:
                ts = datetime.now().strftime('%H:%M:%S')
                print(f"[{ts}] BURN: ${price:.6f}", end="")
                if price_10min_ago == 0:
                    price_10min_ago = price
                check(price)
                print()
            else:
                print(f"[{datetime.now().strftime('%H:%M:%S')}] RPC failed")
        except Exception as e:
            print(f"Error: {e}")
        time.sleep(CHECK_INTERVAL)


if __name__ == "__main__":
    main()
