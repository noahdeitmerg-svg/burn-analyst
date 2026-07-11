# Chat-Handover — burn-analyst Dev-Session 6 (10.–11.07.2026) · FINALER STAND

## Kontext
Fortsetzung von SESSION5-HANDOFF (dort: alle Basis-Konstanten BURN+HOODIE, Arbeitsweise, Server-Setup). Noahs burn-analyst PWA, GitHub Pages (`noahdeitmerg-svg/burn-analyst`), Hetzner VPS 95.216.152.31. Claude liefert komplette Dateien nach /mnt/user-data/outputs, Server-Änderungen als idempotente Heredocs. **App-Version: v=20260711f, APP_V-Konstante synchron** (Achtung: APP_V wird separat in app.js gepflegt — bei Bump BEIDES ändern, das war in Session 5 tagelang still kaputt).

## GROSSE INFRASTRUKTUR-ÄNDERUNG: HTTPS via Caddy
- **Root-Causes der Sync-Probleme gefunden:** (1) ufw blockte 8081/8082 extern seit jeher — JEDER App→Server-Sync seit April war tot, portfolio-data.json enthielt TEST-Daten. (2) Robinhood-RPC blockt seit ~09.07. Mobile-Clients (Server/curl ok).
- **Lösung:** Caddy auf dem VPS, Auto-TLS via Let's Encrypt, Hostname **95-216-152-31.sslip.io**. ufw: 80/443/8082/8083 offen. Routen: `/rhrpc*` → strip_prefix → https://rpc.mainnet.chain.robinhood.com (mit UA-Header), `/fcm/*` → 127.0.0.1:8083, alles andere → 127.0.0.1:8082. Caddyfile: /etc/caddy/Caddyfile.
- **App nutzt NUR noch HTTPS:** alle 8 Endpunkte auf https://95-216-152-31.sslip.io umgestellt (ptf, addressbook, wallet/state, wallet/defi-confirm, history, fcm/register, rhrpc). RH_RPC-Konstante = …/rhrpc.
- **Server-Sync bestätigt ✓** (Statuszeile `syncStat` in Hero-Card zeigt Version + „Server-Sync ✓/✗ HH:MM").

## Neue Server-Endpunkte (ptf-history-server.py, 8082)
- POST /ptf → /root/portfolio-data.json (App-Bestände, 5-min-Sync; fetch_assets im Monitor liest sie bevorzugt <24h)
- POST /hdscan → /root/hd_scan.json (max 3MB, HOODIE-Scan-Backup) · GET /hdscan → liefert Backup (Neuinstallations-Hydration). **Status: Heredoc geliefert, Einspielen evtl. noch offen — als Erstes prüfen: `grep -c hdscan /root/ptf-history-server.py` (0 = Block aus Session-Ende nochmal geben).**
- burn-monitor-fcm.py: zusätzlich HOODIE-LP-Pushes (HD_MODLIQ-Branch: 🧥 NEUE HOODIE LP / 🔴 GESCHLOSSEN, Name via tx.from, Mengen zerlegt, Range) — eingespielt ✓, aktiv ✓.

## HOODIE-Modul Endstand (App)
- **Scan v3-Schema** (localStorage hd_scan {v:3,lastBlk,trades(cap1000, mit tk=Swap-Tick),lps,ev(cap200)}): Event-Replay ab Block 4268344 über /rhrpc, adaptive Chunks 400k/150k/50k, Fortschritt pro Chunk persistiert, 25s-Timeout, ↻-Button mit %-Anzeige (Doppel-Klick meldet „läuft bereits"), in-memory seen-Dedup, Server-Backup throttled 60s + Boot-Hydration wenn lastBlk==0.
- **Zeitexakte Historie:** LP-Events werden zum Tick des nächstliegenden Swaps zerlegt (Swap-Data-Wort 5); $-Werte vergangener Trades/Closes zum **damaligen ETH-Kurs** (CoinGecko market_chart/range, stündlich, 14d, localStorage hd_ethhist, ethUsdAt(ts), >12h-Lücke→aktueller Kurs).
- **Analyse-Sektion:** Summen-Badges · tick-exakte Kaufdruck-Tabelle (1.25–20×, hdPressure über Bänder aller aktiven LPs; CP-Fallback ohne Scan) · Heatmap (▲HD-Wände/▼ETH-Support, Buckets multiplikativ) · Impact-Rechner (Binärsuche über Ziel-Tick, „tick-exakt"-Marker) · LP-Positionen inkl. CLOSED-Zeilen · 📜 Open/Close-Log · Trades mit „alle N anzeigen"-Toggle.
- **HOODIE-Karte:** Bestand (live, W_HOODIE) · Buchwert · **Realer Exit ~$X (Y×)** (eine Kachel, constant-product aus GT-Reserve − PM-Bestand) · Pool-ETH-Seite · Preis · P&L Buch (×) · Einstand · 24h Vol.
- Bekannter Chain-Fakt: Bestand fiel 169,88M → **169,0M** (~0,9M Abgang, Noah wollte Historie prüfen — offen).

## 🕵️ Investoren-Übersicht (neue Karte, sec-inv)
Pro Wallet (Top 25 nach Aktivität), zwei Tabellen: **HOODIE (komplett ab Pool-Geburt)** und **BURN (seit Log-Beginn: allTrades-Fenster + usdcOut geschlossener LPs aus lmap-Scan)**. Spalten: Investiert (Käufe+LP-Einzahlungen, $-Seite, zeitkorrekt) · Rausgezogen (Verkäufe+LP-Entnahmen, zeitkorrekt) · Netto-Cash-Flow · **In LP (Token·$, aktiv, Jetzt-Kurs)** · Bestand (on-demand-Button, balanceOf via /rhrpc bzw. Arbitrum-rpcCall, 10-min-Cache). Live-Refresh 90s wenn offen. BURN-Wallet-Key: signerCache[txHash]||recipient.

## Sonstiges aus Session 6
- LP-Aktivitäts-Log rückwirkend komplett (Cache-Schema-Resets v2→v3 erzwingen Rescan — Pool jung, billig).
- Button-Feedback überall: HOODIE-Scan (Dim+%-Label), BURN forceScanLiqMap (Buttons dimmen via querySelectorAll, restore nach Promise).
- HOODIE-Holder-Top10 aufgelöst (reiss.eth 47%, Deployer 0x2fd8 20%, Noah 16,9%, Dominic 3,1%, jkr.92/marioh97/alex.burn je 6,19M; #4 0x01…349d 74M und #7 0xd8…24b2 unbekannt — bei Discord-Namen nachtragen).
- Adressbuch: +Micha (0xb9f0…9f16). Rabby graut HOODIE als „unverifiziert" aus (DeBank-Flag) — reine Kosmetik, dokumentiert, keine Aktion.
- Arthur Viktor Rein fährt nachgezogene Sell-Leiter (Log zeigt Zyklen); Liquiditäts-Strategie-Diskussion: Support-LPs unter Preis als community-taugliche Lösung vorgeschlagen (bremst nicht), Zahlenwerk auf Zuruf.
- OTC-Steuer: Entscheidung EIN Deal, 15% zahlen; Guide-Docx geliefert (Session 5).

## OFFEN (Priorität absteigend)
1. **/hdscan-Serverpatch verifizieren/einspielen** (siehe oben) — sonst kein Scan-Backup.
2. Upload v=20260711f bestätigen (Statuszeile prüfen) + einmal Investoren-Karte öffnen.
3. Altcoin-Push-Verifikation: Log muss `Assets from app-sync (19)` + `ALT: $44xx` zeigen (Sync ✓ war da, Log-Bestätigung steht aus) + einmaliger Korrektur-Push erwartet.
4. Export-JSON-Backup (überfällig) · 0,9M-HOODIE-Abgang klären · P&L-Label „USDC (AKTIV)" (nie beantwortet).
5. Wunschliste: BURN-Allzeit-Investorenscan (großer Arbitrum-Vollscan) · HOODIE-LP-Fees erfassen (Collect-Events) · Support-LP-Programm-Zahlenwerk für Discord.

## Arbeitsweise (unverändert + Ergänzungen)
Deutsch; komplette Dateien; idempotente Heredocs mit Selbsttest; alles beweisen (Rechnungen/On-Chain); Noahs Plausibilitäts-Einwände waren JEDES MAL echte Bugs. NEU gelernt: (a) APP_V+Cache-String synchron bumpen, (b) bei „geht nicht"-Meldungen erst Version/Reihenfolge klären (Server vor App bei Endpunkt-Wechseln), (c) sichtbares UI-Feedback für jede Aktion einbauen, (d) Netzwerkpfade der APK nie annehmen — Statuszeile/Log beweisen lassen, (e) python-Heredocs: keine verschachtelten Quote-Escapes, große Blöcke als Dateien schreiben.
