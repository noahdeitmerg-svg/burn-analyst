#!/usr/bin/env python3
# patch_finance_endpoint.py — fügt dem ptf-history-server einen /finance-Endpunkt hinzu.
# /finance bündelt ALLES was ein externes Finanzprogramm braucht, in EINEM kompakten JSON:
#   - Positionen (aus dem letzten App-Sync /root/ptf_backup.json bzw. ptf_data)
#   - Live BURN/stBURN-Preise + eigene Bestände (aus dem App-Sync)
#   - Steuer-Ledger-Kurzfassung (aus /root/tax_state.json)
#   - Portfolio-Wertverlauf-Referenz (/history)
# Read-only, GET, CORS offen. Sicher: Backup + Syntax-Check + Rollback.
import os,re,shutil,py_compile,datetime

SRV="/root/ptf-history-server.py"
if not os.path.exists(SRV):
    print("FEHLER: server nicht gefunden"); raise SystemExit(1)
src=open(SRV).read()
if "/finance" in src:
    print("✓ /finance existiert bereits"); raise SystemExit(0)

# /taxledger-Handler als Vorlage finden
m=re.search(r'([ \t]*)((?:el)?if\s+[^\n]*?["\']/taxledger["\'][^\n]*?:)\n((?:(?:\1[ \t]+[^\n]*)?\n)+)',src)
if not m:
    print("✗ /taxledger-Handler nicht gefunden — Zeilen mit taxledger:")
    for i,l in enumerate(src.split("\n"),1):
        if "taxledger" in l: print(f"  {i}: {l}")
    raise SystemExit(2)

ind=m.group(1)
block=f'''{ind}elif self.path.startswith("/finance"):
{ind}    try:
{ind}        import json as _j
{ind}        def _load(p):
{ind}            try:
{ind}                return _j.load(open(p))
{ind}            except Exception:
{ind}                return None
{ind}        ptf=_load("/root/ptf_backup.json") or _load("/root/ptf_data.json") or {{}}
{ind}        tax=_load("/root/tax_state.json") or {{}}
{ind}        out={{
{ind}            "updated": __import__("datetime").datetime.utcnow().isoformat()+"Z",
{ind}            "positions": ptf.get("assets", []),
{ind}            "burnPrice": ptf.get("burnPrice"),
{ind}            "stRatio": ptf.get("stRatio"),
{ind}            "myBurn": ptf.get("myBurn"),
{ind}            "myStburn": ptf.get("myStburn"),
{ind}            "lastAppSync": ptf.get("ts"),
{ind}            "tax": {{
{ind}                "residenz": tax.get("residenz"),
{ind}                "limite": tax.get("limite"),
{ind}                "months": tax.get("months"),
{ind}            }},
{ind}            "historyEndpoint": "/history",
{ind}        }}
{ind}        body=_j.dumps(out).encode()
{ind}        self.send_response(200)
{ind}        self.send_header("Access-Control-Allow-Origin","*")
{ind}        self.send_header("Content-Type","application/json")
{ind}        self.end_headers()
{ind}        self.wfile.write(body)
{ind}    except Exception as e:
{ind}        self.send_response(500); self.end_headers()
{ind}        self.wfile.write(str(e).encode())
'''

out=src[:m.end()]+block+src[m.end():]
bak=SRV+".bak-finance-"+datetime.datetime.now().strftime("%Y%m%d%H%M")
shutil.copy(SRV,bak)
open(SRV,"w").write(out)
try:
    py_compile.compile(SRV,doraise=True)
except Exception as e:
    shutil.copy(bak,SRV); print(f"✗ Syntaxfehler — zurückgerollt: {e}"); raise SystemExit(4)
print(f"✓ /finance eingefügt. Backup: {bak}")
print("Neustart:  systemctl restart ptf-history")
print("Test:      curl -s https://95-216-152-31.sslip.io/finance | head -c 400")
