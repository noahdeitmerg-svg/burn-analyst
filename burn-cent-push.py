#!/usr/bin/env python3
"""
burn-cent-push.py
=================
Sends FCM push notifications on every $0.01 BURN price step.
Also exposes POST /fcm/register endpoint to receive FCM tokens from the app.

State files (in /root):
  fcm_token.txt           — current FCM token (overwritten by /fcm/register)
  cent_push_state.json    — { "last_cent_level": 17, "ts": ... }
  firebase-key.json       — Firebase service account (already exists)

Run as systemd service:
  /etc/systemd/system/burn-cent-push.service
"""

import json
import os
import threading
import time
import urllib.request
import urllib.error
from http.server import HTTPServer, BaseHTTPRequestHandler

import firebase_admin
from firebase_admin import credentials, messaging

# ─── CONFIG ─────────────────────────────────────────────────────────────────
FIREBASE_KEY = "/root/firebase-key.json"
FCM_TOKEN_FILE = "/root/fcm_token.txt"
STATE_FILE = "/root/cent_push_state.json"
HTTP_PORT = 8082
POLL_INTERVAL_SEC = 30  # check price every 30s

# Pool address: BURN/USDC on Arbitrum (V3, 0.3%)
POOL = "0xdbde256870eb8fc3e7aeff5bbcbda1e00a640b37"
BURN_TK = "0xBFC6620459762a6e485eBF1cF7E532e06253B62f"
ARB_RPC = "https://arb1.arbitrum.io/rpc"

# ─── FIREBASE INIT ──────────────────────────────────────────────────────────
if not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_KEY)
    firebase_admin.initialize_app(cred)

# ─── STATE HELPERS ──────────────────────────────────────────────────────────
def load_state():
    try:
        with open(STATE_FILE) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {"last_cent_level": None, "ts": 0}

def save_state(state):
    with open(STATE_FILE, "w") as f:
        json.dump(state, f)

def load_fcm_token():
    try:
        with open(FCM_TOKEN_FILE) as f:
            return f.read().strip()
    except FileNotFoundError:
        return None

# ─── PRICE FETCHING ─────────────────────────────────────────────────────────
def fetch_burn_price():
    """Fetch BURN price by reading slot0 + token0/token1 from the V3 pool.
    Falls back to GeckoTerminal API if RPC fails."""
    try:
        # eth_call to slot0() = 0x3850c7bd
        req = urllib.request.Request(
            ARB_RPC,
            data=json.dumps({
                "jsonrpc": "2.0", "id": 1, "method": "eth_call",
                "params": [{"to": POOL, "data": "0x3850c7bd"}, "latest"]
            }).encode(),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read())
        result = data.get("result", "")
        if not result or len(result) < 66:
            raise ValueError("bad slot0 response")
        # First 32 bytes (64 hex chars after 0x) = sqrtPriceX96
        sqrt_x96 = int(result[2:66], 16)
        # price = (sqrtPriceX96 / 2^96)^2 * 10^(decimals0 - decimals1)
        # BURN is token0 (18 decimals), USDC is token1 (6 decimals)
        # → price (USDC per BURN) = (sqrt/2^96)^2 * 10^(18-6) ... but inverted depending on order
        sqrt = sqrt_x96 / (2 ** 96)
        raw = sqrt * sqrt
        # token0=BURN(18), token1=USDC(6) → USDC per BURN = raw * 10^(18-6) = raw * 1e12
        price = raw * 1e12
        if price > 0 and price < 100:  # sanity
            return price
        raise ValueError(f"implausible price {price}")
    except Exception as e:
        print(f"[price] RPC fail: {e}, trying GeckoTerminal…")
        try:
            req = urllib.request.Request(
                f"https://api.geckoterminal.com/api/v2/networks/arbitrum/pools/{POOL}",
                headers={"Accept": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=10) as r:
                data = json.loads(r.read())
            return float(data["data"]["attributes"]["base_token_price_usd"])
        except Exception as e2:
            print(f"[price] GeckoTerminal also failed: {e2}")
            return None

# ─── FCM PUSH ───────────────────────────────────────────────────────────────
def send_fcm(title, body):
    token = load_fcm_token()
    if not token:
        print("[fcm] no token, skip push")
        return False
    try:
        msg = messaging.Message(
            notification=messaging.Notification(title=title, body=body),
            token=token,
            android=messaging.AndroidConfig(priority="high"),
        )
        response = messaging.send(msg)
        print(f"[fcm] sent: {title} → {body} ({response})")
        return True
    except messaging.UnregisteredError:
        print("[fcm] token unregistered — clearing")
        try:
            os.remove(FCM_TOKEN_FILE)
        except OSError:
            pass
        return False
    except Exception as e:
        print(f"[fcm] send error: {e}")
        return False

# ─── MONITOR LOOP ───────────────────────────────────────────────────────────
def monitor_loop():
    print("[monitor] cent-push monitor started")
    while True:
        try:
            price = fetch_burn_price()
            if price is None:
                time.sleep(POLL_INTERVAL_SEC)
                continue
            cent_level = int(price * 100)  # $0.18 → 18
            state = load_state()
            last = state.get("last_cent_level")
            if last is None:
                # first run — just record, don't push
                state["last_cent_level"] = cent_level
                state["ts"] = time.time()
                save_state(state)
                print(f"[monitor] init at ${price:.4f} (cent {cent_level})")
            elif cent_level != last:
                direction = "📈" if cent_level > last else "📉"
                title = f"{direction} BURN ${cent_level/100:.2f}"
                body = f"Was ${last/100:.2f}, now ${price:.4f}"
                send_fcm(title, body)
                state["last_cent_level"] = cent_level
                state["ts"] = time.time()
                save_state(state)
            # else: no change, no push
        except Exception as e:
            print(f"[monitor] loop error: {e}")
        time.sleep(POLL_INTERVAL_SEC)

# ─── HTTP ENDPOINT (POST /fcm/register) ──────────────────────────────────────
class FcmHandler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_POST(self):
        if self.path != "/fcm/register":
            self.send_response(404)
            self._cors()
            self.end_headers()
            self.wfile.write(b'{"error":"not found"}')
            return
        try:
            length = int(self.headers.get("Content-Length", 0))
            data = json.loads(self.rfile.read(length))
            token = data.get("token", "").strip()
            if not token or len(token) < 20:
                raise ValueError("invalid token")
            with open(FCM_TOKEN_FILE, "w") as f:
                f.write(token)
            print(f"[fcm-register] saved token {token[:16]}…{token[-8:]}")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._cors()
            self.end_headers()
            self.wfile.write(b'{"ok":true}')
        except Exception as e:
            print(f"[fcm-register] error: {e}")
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self._cors()
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())

    def log_message(self, fmt, *args):
        # quiet default access log
        pass

def http_loop():
    server = HTTPServer(("0.0.0.0", HTTP_PORT), FcmHandler)
    print(f"[http] /fcm/register listening on port {HTTP_PORT}")
    server.serve_forever()

# ─── MAIN ────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    t = threading.Thread(target=http_loop, daemon=True)
    t.start()
    monitor_loop()
