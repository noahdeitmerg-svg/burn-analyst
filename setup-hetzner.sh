#!/bin/bash
set -e

echo "═══════════════════════════════════════"
echo "  BURN Terminal — Complete Hetzner Setup"
echo "═══════════════════════════════════════"
echo ""

# ═══ 1. INSTALL DEPENDENCIES ═══
echo "[1/6] Installing dependencies..."
apt update -qq
apt install -y -qq openjdk-17-jdk unzip wget curl python3-pip > /dev/null 2>&1
pip3 install requests -q
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
echo "  ✓ Java $(java -version 2>&1 | head -1 | grep -oP '"\K[^"]+')"
echo "  ✓ Python $(python3 --version | cut -d' ' -f2)"

# ═══ 2. INSTALL ANDROID SDK ═══
echo "[2/6] Installing Android SDK..."
export ANDROID_HOME=$HOME/android-sdk
if [ ! -f "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" ]; then
    mkdir -p $ANDROID_HOME
    cd /tmp
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-10406996_latest.zip -O cmdtools.zip
    unzip -q -o cmdtools.zip
    mkdir -p $ANDROID_HOME/cmdline-tools
    rm -rf $ANDROID_HOME/cmdline-tools/latest
    mv cmdline-tools $ANDROID_HOME/cmdline-tools/latest
    yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses > /dev/null 2>&1 || true
fi
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --install "platforms;android-34" "build-tools;34.0.0" > /dev/null 2>&1
export PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$PATH
echo "  ✓ Android SDK installed"

# ═══ 3. CHECK FIREBASE CONFIG ═══
echo "[3/6] Checking Firebase config..."
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -f "app/google-services.json" ]; then
    echo ""
    echo "  ╔═══════════════════════════════════════════════╗"
    echo "  ║  ⚠️  google-services.json FEHLT!              ║"
    echo "  ║                                               ║"
    echo "  ║  1. https://console.firebase.google.com       ║"
    echo "  ║  2. Projekt erstellen: BURN Terminal           ║"
    echo "  ║  3. Android App hinzufügen                    ║"
    echo "  ║     Package: com.burnterm.app                 ║"
    echo "  ║  4. google-services.json herunterladen        ║"
    echo "  ║  5. Hierhin kopieren:                         ║"
    echo "  ║     ${SCRIPT_DIR}/app/google-services.json    ║"
    echo "  ║  6. Script nochmal starten                    ║"
    echo "  ║                                               ║"
    echo "  ║  AUCH NÖTIG:                                  ║"
    echo "  ║  Projekteinstellungen → Cloud Messaging       ║"
    echo "  ║  → Server Key kopieren                        ║"
    echo "  ║  → In burn-monitor-fcm.py eintragen           ║"
    echo "  ╚═══════════════════════════════════════════════╝"
    echo ""
    echo "  Danach: bash setup-hetzner.sh"
    exit 1
fi
echo "  ✓ google-services.json found"

# ═══ 4. BUILD APK ═══
echo "[4/6] Building APK..."
export ANDROID_HOME=$HOME/android-sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME
chmod +x gradlew
./gradlew assembleDebug --no-daemon -q 2>&1 | tail -5

APK="app/build/outputs/apk/debug/app-debug.apk"
if [ ! -f "$APK" ]; then
    echo "  ✗ Build failed"
    exit 1
fi
echo "  ✓ APK built: $(du -h $APK | cut -f1)"

# ═══ 5. SETUP MONITOR SERVICE ═══
echo "[5/6] Setting up monitor service..."
cp burn-monitor-fcm.py /root/burn-monitor-fcm.py

cat > /etc/systemd/system/burn-monitor.service << SVCEOF
[Unit]
Description=BURN Terminal Price Monitor
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root
ExecStart=/usr/bin/python3 /root/burn-monitor-fcm.py
Restart=always
RestartSec=30
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
SVCEOF

systemctl daemon-reload
echo "  ✓ Service created (not started yet — configure FCM keys first)"

# ═══ 6. CREATE DOWNLOAD SERVER ═══
echo "[6/6] Setting up APK download..."
mkdir -p /root/burn-download
cp "$APK" /root/burn-download/BURN-Terminal.apk

# Get server IP
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')

echo ""
echo "═══════════════════════════════════════════════════"
echo "  ✅ SETUP COMPLETE"
echo "═══════════════════════════════════════════════════"
echo ""
echo "  APK: $(realpath $APK)"
echo "  Size: $(du -h $APK | cut -f1)"
echo ""
echo "  ┌─────────────────────────────────────────────┐"
echo "  │ APK AUF HANDY LADEN:                        │"
echo "  │                                             │"
echo "  │ Option A — Download Link (temporär):         │"
echo "  │   cd /root/burn-download                    │"
echo "  │   python3 -m http.server 8080               │"
echo "  │   → Handy Browser:                         │"
echo "  │   http://${SERVER_IP}:8080/BURN-Terminal.apk│"
echo "  │                                             │"
echo "  │ Option B — ADB:                             │"
echo "  │   adb install $APK                          │"
echo "  │                                             │"
echo "  │ Option C — SCP:                             │"
echo "  │   scp root@${SERVER_IP}:$APK ~/Downloads/   │"
echo "  └─────────────────────────────────────────────┘"
echo ""
echo "  ┌─────────────────────────────────────────────┐"
echo "  │ NACH APP-INSTALLATION:                       │"
echo "  │                                             │"
echo "  │ 1. App öffnen → Dashboard lädt              │"
echo "  │ 2. Notification erlauben                    │"
echo "  │ 3. FCM Token holen:                         │"
echo "  │    App → Price & LP Alerts → Show Push Sub   │"
echo "  │    Oder: adb logcat | grep 'FCM TOKEN'     │"
echo "  │ 4. Token in Monitor eintragen:              │"
echo "  │    nano /root/burn-monitor-fcm.py           │"
echo "  │    → FCM_SERVER_KEY = 'von Firebase'        │"
echo "  │    → FCM_DEVICE_TOKEN = 'von App'           │"
echo "  │ 5. Monitor starten:                         │"
echo "  │    systemctl start burn-monitor             │"
echo "  │    journalctl -u burn-monitor -f            │"
echo "  └─────────────────────────────────────────────┘"
echo ""
