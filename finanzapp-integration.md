# Portfolio-Integration — Live-Anbindung für dein Finanzprogramm

Alles läuft über den Hetzner-Server. Basis-URL für alle Endpunkte:

```
https://95-216-152-31.sslip.io
```

Kein API-Key, kein Auth-Header nötig (CORS offen, GET). Server = `ptf-history-server.py`
als systemd-Service `ptf-history` auf Port 8082, serviert JSON-Dateien aus `/root/`.

---

## 1. Server-Endpunkte (alle GET, JSON)

| Endpunkt | Inhalt | Status |
|---|---|---|
| `/ptf` | Altcoin-Portfolio (assets, ledger, snapshots) | füllt sich, sobald App synct |
| `/taxledger` | Steuer-Ledger: Monate, Gewinn, DARF, Freigrenze | **live, voll** |
| `/history` | Gesamtwert-Zeitreihe `[[ts_ms, valueUSD], ...]` für Charts | **live, voll** |
| `/burnstats` | BURN pro Wallet: invest, out, LP-Mengen | **live, voll** |
| `/hdscan` | HOODIE-Trades (buy/sell, Menge, Preis, Wallet) | **live, voll** |
| `/wallet` | Wallet-Bestände | füllt sich beim Scan |
| `/defi` | DeFi-/LP-Positionen | füllt sich beim Scan |
| `/otc` | OTC-Deal-Tracker (Käufer, Besitz) | live während Deal |

### Beispiel `/history` (Chart-Daten, direkt plotbar):
```json
[[1777649803111, 4009.61], [1777650039475, 4017.17], ...]
```
`[Unix-ms, Portfolio-Wert-USD]` — fertig für jede Chart-Lib (x=Zeit, y=Wert).

### Beispiel `/taxledger`:
```json
{"v":1,"updated":"2026-07-18 00:30 UTC","residenz":"2025-09-12","limite":35000.0,
 "months":{"2026-06":{"l2":..,"ganho":129.64,"custo":73.76,"darf":..,"n":42}, ...}}
```

---

## 2. Live-Kurse (öffentliche APIs, kein Key)

**Altcoins → CoinGecko:**
```
GET https://api.coingecko.com/api/v3/simple/price?ids=<geckoId,...>&vs_currencies=usd,eur,brl
```
geckoIds: chainlink, ondo-finance, render-token, monad, centrifuge, fetch-ai, aave, sky,
crypto-com-chain, uniswap, arbitrum, syrup, eigenlayer, arweave, bitcoin, celestia,
bittensor, akash-network, ethereum

**BURN / HOODIE (DEX-Token) → DexScreener:**
```
GET https://api.dexscreener.com/latest/dex/tokens/0xbfc6620459762a6e485ebf1cf7e532e06253b62f
→ pairs[0].priceUsd
```

**Chart-Kerzen einzelner Pools → GeckoTerminal:**
```
GET https://api.geckoterminal.com/api/v2/networks/arbitrum/pools/<poolAddress>/ohlcv/hour
```
BURN/USDC-Pool: `0xdbde256870eb8fc3e7aeff5bbcbda1e00a640b37`

**On-Chain Token-Mengen (live balanceOf) → Arbitrum RPC:**
```
POST https://arb1.arbitrum.io/rpc   (oder https://arbitrum-one-rpc.publicnode.com)
{"jsonrpc":"2.0","id":1,"method":"eth_call",
 "params":[{"to":"<tokenContract>","data":"0x70a08231000000000000000000000000<wallet40hex>"},"latest"]}
```
Token-Contracts: BURN `0xbfc6620459762a6e485ebf1cf7e532e06253b62f`,
stBURN `0xd36701e8cfe1c8edd993fa67b90134671c8f8424`,
USDC `0xaf88d065e77c8cc2239327c5edb3a432268e5831`
Wallets: `0x6e37cc7d415466909db6102b6dc34473ac1bb500`,
`0x505042ff781ea1689e44e1d200efd691c30db86c`,
`0x9ffa190b0d2543f35dfa1a2955bc2f4c544871d2`

---

## 3. Empfohlener Sync-Flow für dein Programm

1. **Positionen** (Menge, Einstand): `GET /ptf` — sobald die App einmal gesynct hat.
   Fallback bis dahin: die statische `portfolio-export.json` (23 Positionen).
2. **Live-Werte**: pro Coin CoinGecko-Preis × Menge. BURN/stBURN/HOODIE über DexScreener.
3. **Chart / Verlauf**: `GET /history` direkt plotten.
4. **Steuer-Sicht**: `GET /taxledger` (Monate + DARF + Freigrenze-Auslastung).
5. **Tesouro Selic**: nicht auf dem Server — Werte aus `tesouro-selic-2031-position.json`
   (0,51 Kotas, R$9.894,21, Kauf 2026-07-17, SELIC+0,0744%). Live-Kurs der Cota:
   redentia.com.br/tesouro/tesouro-selic-2031 (kein offizielles API).

Polling-Intervall: Kurse alle 60s, `/history` alle 5min, `/taxledger` bei Bedarf.

---

## 4. Sicherheitshinweis

Die Server-Endpunkte sind aktuell **offen** (kein Token). Für ein fremdes Programm ok,
solange nur read-only. Willst du sie absichern (Bearer-Token-Header), sag Bescheid —
lässt sich in `ptf-history-server.py` mit wenigen Zeilen ergänzen.
