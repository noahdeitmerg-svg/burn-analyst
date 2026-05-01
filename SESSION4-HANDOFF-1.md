# My Crypto Portfolio — Complete Session Handoff
## Session 4 (April 29 – May 1, 2026)

---

## PREVIOUS SESSION TRANSCRIPTS
- Session 1: /mnt/transcripts/2026-04-06-01-01-45-burn-terminal-dashboard-full-build.txt
- Session 2: /mnt/transcripts/2026-04-08-12-03-42-burn-terminal-full-build-session2.txt
- Session 3: /mnt/transcripts/2026-04-09-01-13-12-burn-terminal-full-build-session3.txt
- Session 4: /mnt/transcripts/2026-04-28-18-34-19-burn-terminal-full-build-session4.txt (CURRENT)
- Session 4 continued: /mnt/transcripts/2026-04-29-23-35-44-burn-terminal-full-build-session4.txt

---

## CURRENT FILES (GitHub Pages: noahdeitmerg-svg/burn-analyst)
- `index.html` — HTML + CSS (~770 lines)
- `app.js` — JavaScript (~3110 lines)
- `sw.js` — Service Worker with Web Push handler (51 lines)
- `manifest.json` — PWA Manifest (25 lines)
- `icon-192.png` + `icon-512.png` — HD MCP App Icons
- `icon-1024.png` + `icon-1920.png` — Extra HD Icons

Deploy: Push files to GitHub → GitHub Pages auto-deploys → App loads automatically.

---

## RENAME: "BURN Terminal" → "My Crypto Portfolio"
All references renamed across all files. Zero "BURN Terminal" references remain.

---

## ANDROID APP (APK)

### Build Location: Hetzner Server 95.216.152.31
```
/root/burn-app/                    — Android project
/root/burn-app/app/google-services.json — Firebase config
/root/MyCryptoPortfolio.apk        — Built APK (~3.6MB)
```

### App Architecture
- WebView wrapper loading `https://noahdeitmerg-svg.github.io/burn-analyst/`
- Firebase Cloud Messaging (FCM) for push notifications
- Splash Screen: Dark background (#05080f) + MCP icon + fade transition
- Notification permission request on first launch
- FCM token injected into WebView localStorage as `fcm_token`
- External links (arbiscan, dexscreener) open in browser
- Package: `com.burnterm.app`

### Firebase Project
- Project: `my-crypto-portfolio-c209b`
- Firebase Key: `/root/firebase-key.json`
- google-services.json in `/root/burn-app/app/`

### Current FCM Token
```
ettHqtBBTCeWlo63U3CNf2:APA91bFa85C4pbcvHOQq3Ua3Rs-A7nYfeCiZHRPT4cZkimDimzT1Y1_vuVUt0W30VaT3fjGP_vjdZmfHAvibfg24zK6YHu426VV9DmVs_wHTbIuojRyJX6w
```
⚠️ Token ändert sich bei App-Deinstallation! IMMER drüber installieren!

### Build Command
```bash
ssh root@95.216.152.31
export ANDROID_HOME=/root/android-sdk
cd /root/burn-app
./gradlew assembleDebug
# APK: app/build/outputs/apk/debug/app-debug.apk
```

### APK Download to Phone
```bash
cp app/build/outputs/apk/debug/app-debug.apk /root/MyCryptoPortfolio.apk
iptables -I INPUT -p tcp --dport 8080 -j ACCEPT
cd /root && python3 -m http.server 8080 &
# Chrome: http://95.216.152.31:8080/MyCryptoPortfolio.apk
# After: kill %1 && iptables -D INPUT -p tcp --dport 8080 -j ACCEPT
```

---

## HETZNER SERVER (95.216.152.31)

### Services Running
```
burn-monitor.service    — Price monitor + Push notifications (24/7)
ptf-history.service     — Portfolio history API on port 8082
```

### Files
```
/root/firebase-key.json           — Firebase service account key
/root/burn-monitor-fcm.py         — Main monitor script
/root/test_push.py                — Test push notification
/root/ptf-history-server.py       — History API server
/root/ptf_history.json            — Portfolio value snapshots (growing)
/root/burn-app/                   — Android project
/root/android-sdk/                — Android SDK (platform 34)
```

### Monitor Script Features (`burn-monitor-fcm.py`)
```
EVERY 30 SECONDS:
  ✅ BURN price via Arbitrum RPC (slot0)
  ✅ Block scan for Swap/Mint/Burn events
  ✅ Balance check (BURN + stBURN on Ledger wallet)

EVERY 5 MINUTES:
  ✅ Altcoin portfolio from CoinGecko (19 assets)
  ✅ Asset list auto-fetched from GitHub app.js PTF_DEFAULTS
  ✅ Portfolio snapshot saved to ptf_history.json

PUSH NOTIFICATIONS:
  🟢 Every BUY trade (≥$1 USDC)
  🔴 Every SELL trade (≥$1 USDC)
  🆕 New LP with BURN amount + USDC + Range
  🔒 LP Closed
  🚨 Balance Drop >100 BURN or stBURN
  🚀 BURN price > $0.20 (1h cooldown)
  ⚠️ BURN price < $0.12 (1h cooldown)
  📈 >5% price change in 10 minutes
  💼 Altcoin portfolio ±$300 real difference + 3h cooldown
```

### Topic Hashes (VERIFIED CORRECT)
```
SWAP:    0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67
MINT:    0x7a53080ba414158be7ec69b987b5fb7d07dee101fe85488f0853ae16239d0bde
BURN_EV: 0x0c396cd989a39f4459b5fa1aed6a9a8dcdbc45908acfd67e028cd56
```
⚠️ SWAP hash was wrong for the entire early session — fixed to the real Keccak256.
⚠️ RPC-Error bug fixed: `None` (error) vs `[]` (empty) now handled separately — no more block skipping.

### Portfolio History API
```
Port: 8082
Endpoint: GET http://95.216.152.31:8082/history
Response: [[timestamp_ms, value], ...]
Firewall: iptables rule for port 8082 open
```

### Manage Monitor
```bash
systemctl status burn-monitor
systemctl restart burn-monitor
journalctl -u burn-monitor --no-pager -n 20
journalctl -u burn-monitor -f  # live tail
```

---

## CONTRACT ADDRESSES
```
Pool:     0xdbde256870eb8fc3e7aeff5bbcbda1e00a640b37  (Uniswap V3 BURN/USDC 0.3%)
BURN:     0xBFC6620459762a6e485eBF1cF7E532e06253B62f
stBURN:   0xd36701e8cFe1C8eDD993Fa67B90134671c8F8424
USDC:     0xaf88d065e77c8cC2239327C5EDb3A432268e5831
NFT PM:   0xC36442b4a4522E871399CD717aBDD847Ab11FE88  (Uniswap V3 Position Manager)
Ledger:   0x9fFa190b0d2543f35DFa1A2955BC2F4C544871D2  (Noah's Ledger)
DeFi:     0x505042fF781eA1689e44e1d200eFD691C30Db86C  (Noah DeFi wallet)
DAO:      0x72aDe1298731f057796ECAb891F623Ae4C18E7c1  (DAO Vault)
Noah Alt: 0x6e37cc...b500
BTC:      bc1qj79tmeql5m8wqxac5wvsdkwnkns7ztyehyv5t4
```

---

## DASHBOARD FEATURES (ALL WORKING)

### Section Order (current)
1. ⬡ Ledger Balance (GANZ OBEN — wird rot bei Drop)
2. ◆ Live Pricing (3 Orbs: stBURN / BURN / Ratio)
3. ◇ Next Fill Target
4. ⚡ Last Trades
5. 🐋 Whale Activity [slim]
6. Alert Bar
7. 🔔 Price & LP Alerts [slim] — Portfolio Above/Below $
8. 👛 Wallet Tracker [slim]
9. 💎 BURN Portfolio
10. 🌐 Altcoin Portfolio (19 assets, CoinGecko, charts)
11. 📊 P&L — Active LPs [slim, collapsible]
12. 📌 My Active LP Positions [slim] (DAO removed)
13. 📈 LP P&L Detail [slim] (Active + Closed + Market)
14. 📕 Closed Positions [slim, fully collapsible]
15. 🧾 Tax Report
16. 📉 Chart
17. 🔍 Market Analysis (V3 Buyflow)
18. 💰 Capital Flow [slim]
19. 🏥 Pool Health [slim]
20. ⚡ Staking APY [slim]
21. 🗺️ Pool Liquidity Map
22. 🪙 Tokenomics
23. 🎲 Price Scenario Simulation

### CSS/UX Design
- Geist Mono + Inter fonts, font-feature-settings: 'tnum'
- Aurora background: 2 morphing radial blobs (orange 32s + violet 38s cycles)
- 3D pulsing orbs: perspective(400px), rotateX/Y per color (4.0s/4.2s/4.4s)
- Double ring effect (outer 2px + inner 1px ::after)
- Glassmorphism cards: backdrop-filter blur(20px)
- Color-matched glow borders per section (7 colors, -6px spread, 0.12 opacity)
- Card top highlight gradient line (::after)
- 27 Section icons (emoji-based)
- 15 Slim Cards (c-slim class: 6px padding, 40px min-height)
- prefers-reduced-motion support
- Mobile UX: 46px touch targets, 16px inputs, smooth scrolling, safe-area padding

### Altcoin Portfolio Chart
- Ranges: 1D | 7D | 1M | 1Y | ALL
- Fullscreen modal with ⛶ Full button
- Touch crosshair: drag to see value + date tooltip
- Mouse hover crosshair on desktop
- Info bar: Change + High + Low + point count + date range
- Data persistence: localStorage + Hetzner server merge
- Server snapshots every 5 min (ptf_history.json)
- App merges server data on load (after 5s)
- Max 200K datapoints (~2 years at 5min interval)

### Pool Liquidity Map
- LP Map table: Wallet/Range | BURN | USDC Now | If Filled | Fill%
- Fill% color: 0-49% green, 50-89% yellow, 90%+ red
- Auto-scan 10s after load + every 5 min
- Cached LP owners in localStorage (closed LPs never change)
- Scan doesn't clear existing data while running ("Refreshing..." instead of skeleton)
- DAO Vault: V3 exact math using sqrtPrice from ticks

### DAO Vault LP (NFT #4358011)
```
Deposited:   6,000,000 BURN
Range:       tick -887220 → 342060 (quasi full range)
Liquidity:   224,276,664,513,191,034
BURN left:   ~537,680 (at $0.174)
USDC earned: ~$85,167
Fill:        ~91.0%
Status:      ACTIVE

NFT #4358019: CLOSED (liq=0)

V3 Math (CORRECT):
  sqrtP = Math.sqrt(1e12/P)  — convert USD price to raw sqrtPrice
  sqrtPL = Math.pow(1.0001, tL/2)
  sqrtPU = Math.pow(1.0001, tU/2)
  BURN remaining = L * (sqrtP - sqrtPL) / 1e18
  USDC earned = L * (1/sqrtP - 1/sqrtPU) / 1e6
  BURN deposited = L * (sqrtPU - sqrtPL) / 1e18 = 6,000,000 ✓
```

### Balance Protection
- App: checkBalanceDecrease() every 60s, notify if >100 drop, walGrid turns red
- Hetzner: on-chain balance check every 30s via balanceOf()
- Push: "BURN Balance Drop — X BURN removed! Y left"

### V3 Buyflow (Market Analysis)
- 3-tier calculation hierarchy:
  1. V3 Tick Scan (most accurate, uses all pool positions from LP Map scan)
  2. POOL_LIQ fallback (reads liquidity() from pool contract)
  3. V2 Constant Product K=X*Y (last resort)
- Shows "V3" or "L" label in buyflow table
- Pool liquidity fetched via fetchPoolLiq() on each go() call

### P&L Detail
- Includes: Active LPs + Hardcoded Closed (CL array, 9 entries) + Market Sales (MS array, 1 entry)
- Auto-detected closed LPs merged from localStorage "cl_history"
- DAO excluded from P&L (only user's positions)

---

## CLOSED LP HISTORY (CL Array)
```javascript
var CL=[
  {d:"01.09.25",b:11600,lo:0,hi:0,u:565,n:"First LP"},
  {d:"25.09.25",b:21209,lo:.0686,hi:.08,u:1577.09,n:"Filled"},
  {d:"09.10.25",b:566,lo:.1005,hi:.14,u:59,n:"Closed"},
  {d:"14.10.25",b:6806,lo:0,hi:0,u:725,n:"Partial"},
  {d:"16.10.25",b:2677,lo:.11086,hi:.1122,u:299,n:"Filled"},
  {d:"21.10.25",b:1915,lo:.1122,hi:.12203,u:217,n:"Partial"},
  {d:"01.12.25",b:8264,lo:.114,hi:.115,u:949.80,n:"Filled"},
  {d:"26.01.26",b:10195,lo:.138,hi:.14,u:1420,n:"Filled"},
  {d:"25.04.26",b:10043,lo:.149,hi:.20,u:1630,n:"Partial (10K BURN returned)"}
];
var MS=[{d:"05.12.25",b:10500,u:1196,n:"Market"}];
// Total: 83,780 BURN sold → $8,637.89 USDC + $1,196 market = $9,833.89
```

---

## ACTIVE LP POSITIONS (LP_FALLBACK array)
```javascript
var LP_FALLBACK=[
  {b:5010,lo:.140,hi:.500,label:"Main LP"},
  {b:5000,lo:.500,hi:1.00,label:"Mid Range"},
  {b:5000,lo:1.00,hi:2.00,label:"Upper Range"},
  {b:5000,lo:2.00,hi:50.00,label:"Moon Range"}
];
var LP_DAO={b:6000000,lo:0,hi:0,label:"DAO Full Range",fr:true};
```
⚠️ LP_FALLBACK is overwritten by on-chain scan (fetchLPs). These are fallbacks only.
⚠️ LP_DAO.b is updated from scan data when Pool Liquidity Map runs.
⚠️ DAO is excluded from "My Active LP Positions" table (pos.fr → continue).

---

## ALTCOIN PORTFOLIO (PTF_DEFAULTS)
19 assets, amounts defined in app.js PTF_DEFAULTS. Hetzner monitor auto-fetches these from GitHub.

Current total: ~$4,000 (fluctuates)

---

## SYSTEM RULES
- NIEMALS Core-Logic ändern ohne explizite Anfrage
- Dashboard MUSS immer rendern, auch ohne API-Daten
- Split architecture: index.html (HTML+CSS) + app.js (JS)
- Deploy: git push to GitHub Pages (app auto-loads)
- BURN Portfolio und Altcoin Portfolio sind isolierte Systeme
- NIE App deinstallieren — immer drüber installieren (localStorage!)
- VPS Deploy: nur `git pull` dann `./restart-screens.sh` (AlphaCycle)
- Monitor restart: `systemctl restart burn-monitor`

---

## KNOWN ISSUES / TODO

### Active Issues
- [ ] Swap Detection was broken for first session (wrong topic hash) — FIXED
- [ ] RPC Error could skip blocks — FIXED (None vs [] handling)
- [ ] MINT data length check was too strict — FIXED (removed len>=320 check)
- [ ] Notification icon shows generic blue square (would need APK rebuild)
- [ ] UX redesign: External AI agent working on concept-B style overhaul

### Pending from UX Mockup (concept-B-v3-final.html)
- Status Rail (Src · Sync · Net pills)
- 24h Sparkline under hero circles
- Section inline live stats + delta pills + chevrons
- Telemetry footer (Sync · Gas · Block)
- Labels BELOW circles instead of inside

### Future Enhancements
- HTTPS for portfolio sync (Mixed Content prevents HTTPS→HTTP)
- LP P&L per Range detail
- Whale Trade Detector (trades >$200 USDC)
- Portfolio value alerts in dashboard (inputs exist, partially working)

---

## PRICE FORMULA (CRITICAL — gets wrong easily)

### Pool is USDC (token0) / BURN (token1), fee 0.3%
```
sqrtPriceX96 from slot0 → Price in USD:
  sqrtP = sqrtPriceX96 / 2^96
  Price (USDC per BURN) = 1 / (sqrtP^2) * 1e12
  
  The 1e12 factor: USDC has 6 decimals, BURN has 18 → 10^(18-6) = 10^12

Python:  p = (2**192) / (sqrtPX96**2) * 1e12
JS:      var p = (s*s*10**12)/(2**192); if(p>1000) p=2**192/(s*s)*10**12;

Converting back for V3 math:
  sqrtPrice_raw = Math.sqrt(1e12 / P)
  This matches tick-based sqrtPrices: Math.pow(1.0001, tick/2)
```

### wtLiqToBurn (Liquidity → BURN deposited)
```javascript
function wtLiqToBurn(liq, tL, tU) {
  var sL = Math.pow(1.0001, tL/2);
  var sU = Math.pow(1.0001, tU/2);
  return liq * (sU - sL) / 1e18;
}
```

### V3 Position Amounts (exact)
```javascript
sqrtP = Math.sqrt(1e12 / P);       // current price → raw sqrtPrice
sqrtPL = Math.pow(1.0001, tL/2);   // tick lower → sqrtPrice
sqrtPU = Math.pow(1.0001, tU/2);   // tick upper → sqrtPrice

if (sqrtP <= sqrtPL):       // below range: all USDC
  BURN = 0
  USDC = L * (1/sqrtPL - 1/sqrtPU) / 1e6
elif (sqrtP >= sqrtPU):     // above range: all BURN
  BURN = L * (sqrtPU - sqrtPL) / 1e18
  USDC = 0
else:                        // in range
  BURN = L * (sqrtP - sqrtPL) / 1e18
  USDC = L * (1/sqrtP - 1/sqrtPU) / 1e6
```

---

## CURRENT PORTFOLIO STATE (as of May 1, 2026)

### BURN Holdings
```
Ledger Wallet: 450,000 BURN + 350,000 stBURN
stBURN/BURN Ratio: ~1.028
BURN Price: ~$0.174
Total BURN Value: ~$140,000
```

### Active LP Positions (Noah's)
```
$0.14 → $0.50  | 5,010 BURN  (Main LP, ~3% filled)
$0.50 → $1.00  | 5,000 BURN  (Mid Range, 0%)
$1.00 → $2.00  | 5,000 BURN  (Upper Range, 0%)
$2.00 → $50.00 | 5,000 BURN  (Moon Range, 0%)
```
⚠️ These are fetched live from on-chain NFTs. LP_FALLBACK is just a fallback.

### Altcoin Portfolio (~$4,000 total)
```
ETH:   0.832427  | LINK: 320.574  | ONDO: 6507.351
RNDR:  639.043   | MONAD: 29311.731 | CFG: 4623.868
FET:   3891.441  | AAVE: 0.9077   | SKY: 8521.203
CRO:   6557      | UNI: 98.139    | ARB: 2631.431
SYRUP: 776.098   | EIGEN: 135.13  | AR: 31.92
BTC:   0.00692908| TIA: 97.39     | TAO: 0.59
AKT:   264.00
```

---

## WALLET LABELS
```javascript
var LABELS={
  "0x72ade1298731f057796ecab891f623ae4c18e7c1": {n:"DAO Vault", icon:"🏛️"},
  "0x505042ff781ea1689e44e1d200efd691c30db86c": {n:"Noah (DeFi)", icon:"⭐"},
  "0x9ffa190b0d2543f35dfa1a2955bc2f4c544871d2": {n:"Noah (Ledger)", icon:"🔐"},
  "0x6e37cc...b500": {n:"Noah (Alt)", icon:"💼"},
};
```

---

## ARBITRUM RPC BEHAVIOR
```
Block time: ~0.25 seconds (4 blocks/sec)
Monitor cycle: 30 seconds → scans ~120 blocks per cycle
RPC endpoints (fallback chain):
  1. https://arb1.arbitrum.io/rpc
  2. https://arbitrum-one-rpc.publicnode.com
  
eth_getLogs: returns events for address in block range
  ⚠️ CRITICAL BUG FIX: None (RPC error) vs [] (no events)
  - None → DON'T advance lastBlk (retry next cycle)
  - [] → advance lastBlk (no events, move forward)
```

---

## TOG() FUNCTION (REWRITTEN)
```
Original: simple toggle open/close
New: also renders cached LP owners when LP Map section is opened
Location: line ~749 in app.js
If sec-lmap is opened and no lmapCache → renders window._lpOwners from localStorage
Scan doesn't clear existing table while running (shows "Refreshing..." not skeleton)
```

---

## PORTFOLIO SYNC ATTEMPT (DISABLED)
```
Tried: Dashboard → HTTP POST → Hetzner Port 8081 → portfolio-data.json
Failed: Mixed Content (HTTPS GitHub Pages → HTTP Hetzner blocked by browser)
Solution: Monitor reads PTF_DEFAULTS directly from GitHub app.js via regex
Service portfolio-sync.service: DISABLED (systemctl disable)
Port 8081: can be closed
```

---

## UX MOCKUP
File created: /mnt/user-data/outputs/mcp-ux-mockup.html
Concept-B style with:
- Aurora background, grain overlay
- Diamond logo, status rail pills
- 24h sparkline under hero circles
- Progress bar with pulsing marker
- Section cards with icons + sparklines + delta pills
- Telemetry footer
Noah approved the style, external AI agent is working on full implementation.

---

## TEST PUSH COMMAND
```bash
# On Hetzner:
python3 /root/test_push.py
# Sends: "Test MCP — Push mit Icon"
```

---

## IMPORTANT GOTCHAS FOR NEXT SESSION
1. SWAP topic hash was wrong for entire early session — now correct (verified)
2. RPC error could skip blocks silently — now fixed (None vs [] check)
3. MINT data length check was too strict — removed len>=320
4. sqrtPrice conversion: ALWAYS use Math.sqrt(1e12/P) not Math.sqrt(P)
5. DAO Full Range ticks: tL=-887220 tU=342060 (NOT -887220/887220)
6. NFT #4358019 is CLOSED (liq=0), only #4358011 is ACTIVE
7. Never deinstall the app — always install over (localStorage!)
8. Monitor FCM token must be updated if app is reinstalled
9. Altcoin alerts: $300 REAL difference + 3h cooldown (not $100 steps)
10. Pool Liquidity Map: auto-scan 10s after load + every 5min
11. Closed LP cache: first scan must succeed to fill cache, then cached forever

---

## CRITICAL TECHNICAL DETAILS

### Price Calculation (BURN/USDC Pool)
```
USDC = token0 (6 decimals)
BURN = token1 (18 decimals)

From slot0 sqrtPriceX96:
  sqrtP = sqrtPriceX96 / 2^96
  Price (USDC per BURN) = 1 / (sqrtP^2) * 1e12
  
  OR equivalently:
  Price = (2^192) / (sqrtPriceX96^2) * 1e12

In JavaScript (app.js):
  P = (2**192) / (sq*sq) * 1e12   // where sq = parseInt(slot0[2:66], 16)

In Python (monitor):
  p = (s*s*10**12) / (2**192)
  if p > 1000: p = 2**192 / (s*s) * 10**12
```

### V3 Position Math (for Full Range / DAO)
```
Raw sqrtPrice for V3 formulas (NOT Math.sqrt(P)):
  sqrtP = Math.sqrt(1e12 / P)     ← converts USD price back to raw
  sqrtPL = Math.pow(1.0001, tickLower/2)
  sqrtPU = Math.pow(1.0001, tickUpper/2)

Amount calculations:
  BURN remaining = L * (sqrtP - sqrtPL) / 1e18
  USDC earned    = L * (1/sqrtP - 1/sqrtPU) / 1e6
  BURN deposited = L * (sqrtPU - sqrtPL) / 1e18
```

### NFT Position Parsing (positions() call on NFT Position Manager)
```
Selector: 0x99fbab88 + tokenId (32 bytes)
Response slots (each 32 bytes / 64 hex chars):
  [0] nonce
  [1] operator
  [2] token0
  [3] token1
  [4] fee
  [5] tickLower (int24, can be negative → twos complement)
  [6] tickUpper (int24)
  [7] liquidity (uint128)
  [8] feeGrowthInside0
  [9] feeGrowthInside1
  [10] tokensOwed0
  [11] tokensOwed1
```

### Wallet Labels in Pool Liquidity Map
```javascript
var WALLET_LABELS = {
  "0x72ade1298731f057796ecab891f623ae4c18e7c1": "DAO Vault",
  "0x505042ff781ea1689e44e1d200efd691c30db86c": "Noah (DeFi)",
  "0x6e37cc...b500": "Noah (Alt)",
  "0x9ffa190b0d2543f35dfa1a2955bc2f4c544871d2": "Ledger",
  // ... others labeled as "Private", "Elite", "Founder"
};
```

### localStorage Keys Used
```
burn_alerts          — Alert config {hi, lo, fill1, fill2, ptfHi, ptfLo}
burn_alert_triggered — Which alerts have fired
push_sub             — Web Push subscription (unused now, FCM instead)
fcm_token            — Firebase Cloud Messaging token
lmap_extra           — Extra wallet addresses to scan
lmap_owners          — Cached LP owner data (all positions)
lmap_closed          — Cached closed LP positions only
cl_history           — Auto-detected closed positions
cl_seen              — Dedup tracker for closed detection
ptf_assets           — Altcoin portfolio assets
ptf_ledger           — Altcoin cost basis ledger
ptf_snapshots        — Portfolio value timeline (merged with server)
ptf_prices           — Last CoinGecko prices
ptf_last_balances    — Last detected on-chain balances
ptf_version          — PTF_DEFAULTS version (triggers reset on update)
burn_offline         — Cached dashboard state for offline load
```

### RPC Endpoints (Arbitrum One)
```
Primary:   https://arb1.arbitrum.io/rpc
Fallback:  https://arbitrum-one-rpc.publicnode.com
Fallback2: https://arbitrum.drpc.org
```

### Data Flow Architecture
```
┌─────────────────────────────────────────────────┐
│ GITHUB PAGES (noahdeitmerg-svg/burn-analyst)    │
│ index.html + app.js + sw.js + manifest.json     │
│ + icons                                         │
└──────────┬──────────────────────────┬───────────┘
           │                          │
           ▼                          ▼
┌──────────────────┐     ┌─────────────────────────┐
│ ANDROID APP      │     │ HETZNER (95.216.152.31)  │
│ WebView loads    │     │                          │
│ GitHub Pages URL │     │ burn-monitor-fcm.py:     │
│                  │     │  • Reads slot0 (price)   │
│ localStorage:    │     │  • Scans eth_getLogs     │
│  • Snapshots     │     │  • balanceOf() checks    │
│  • LP cache      │     │  • CoinGecko prices      │
│  • Alert config  │     │  • Fetches PTF_DEFAULTS  │
│                  │     │    from GitHub app.js     │
│ On load:         │     │  • Saves ptf_history.json │
│  • Merges server │     │  • Pushes via Firebase   │
│    history from  │◄────│                          │
│    port 8082     │     │ ptf-history-server.py:    │
│                  │     │  • Serves snapshots       │
│ FCM Push:        │     │    on GET /history        │
│  • Receives via  │◄────│                          │
│    Firebase SDK  │     │ Firebase Admin SDK:       │
│  • Shows native  │     │  • /root/firebase-key.json│
│    notification  │     │  • messaging.send()       │
└──────────────────┘     └─────────────────────────┘
```

### Monitor Bug History (Important for Debugging)
```
BUG 1 — SWAP Topic Hash (FIXED):
  Wrong: 0xc42079f94a...028cd568da98982c (too long, 68 hex)
  Wrong: 0xc42079f94a...028cd56 (truncated)  
  Correct: 0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67
  → Hash is pool-specific, not the standard Swap(address,address,...) hash

BUG 2 — RPC Error Block Skip (FIXED):
  Problem: `if not logs` treated None (error) same as [] (empty)
  Fix: `if logs is None: return` (don't advance lastBlk)
       `if len(logs)==0: lastBlk=head; return`

BUG 3 — MINT len check (FIXED):
  Problem: `elif t0==MINT and len(d)>=320` skipped short MINT events
  Fix: Removed len check, always process MINT
```

### UX Design Reference
- concept-B-v3-final.html exists as UX mockup (created by external AI agent)
- Features proposed: Status Rail, 24h Sparkline, Section inline stats, Delta pills
- Glassmorphism style with aurora background already partially implemented
- "Other AI agent" is working on detailed UX specs

---

## HOW TO START NEXT SESSION

```
1. Upload SESSION4-HANDOFF.md
2. Upload current app.js + index.html
3. Say: "Lies das Handoff-Dokument. Hier sind die aktuellen Dateien.
   Mache weiter mit: [Aufgabe]"

The next assistant should:
- Read SESSION4-HANDOFF.md first
- Understand the split-file architecture (index.html = HTML+CSS, app.js = JS)
- Know that GitHub push = instant app update
- Know all Hetzner server details for monitor changes
- Understand V3 math for price/LP calculations
- Preserve all IDs and CSS classes (107+ IDs referenced by app.js)
```
