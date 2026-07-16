#!/usr/bin/env python3
# patch_otc_endpoint.py — fügt dem ptf-history-server einen /otc-Endpoint hinzu (analog /taxledger).
# Sicher: Backup, Syntax-Check, automatischer Rollback bei Fehler. Idempotent.
# Aufruf:  python3 /root/patch_otc_endpoint.py
import re,sys,shutil,os,py_compile,datetime

SRV="/root/ptf-history-server.py"
if not os.path.exists(SRV):
    print("FEHLER: /root/ptf-history-server.py nicht gefunden."); sys.exit(1)
src=open(SRV).read()

if "/otc" in src and "otc_report.json" in src:
    print("✓ /otc-Endpoint bereits vorhanden — nichts zu tun."); sys.exit(0)

# /taxledger-Handler finden (Kopfzeile + eingerückter Body)
m=re.search(r'([ \t]*)((?:el)?if\s+[^\n]*?["\']/taxledger["\'][^\n]*?:)\n((?:(?:\1[ \t]+[^\n]*)?\n)+)', src)
if not m:
    print("✗ /taxledger-Handler nicht gefunden. Bitte diese Zeilen schicken:")
    for i,l in enumerate(src.split("\n"),1):
        if "taxledger" in l: print(f"  {i}: {l}")
    sys.exit(2)

ind, head, body = m.group(1), m.group(2), m.group(3)
full = ind+head+"\n"+body
print("Gefunden:\n"+"-"*50+"\n"+full.rstrip()[:400]+"\n"+"-"*50)

new = full.replace("/taxledger","/otc").replace("tax_ledger.json","otc_report.json").replace("tax_ledger","otc_report")
if new==full:
    print("✗ Konnte Pfad/Datei im Block nicht ersetzen."); sys.exit(3)
# Kopf des neuen Blocks IMMER als elif (er kommt NACH dem Original)
new = re.sub(r'^([ \t]*)if\s', r'\1elif ', new, count=1)

out = src[:m.end()] + new + src[m.end():]      # NACH dem Original einfügen
bak = SRV+".bak-"+datetime.datetime.now().strftime("%Y%m%d%H%M")
shutil.copy(SRV,bak)
open(SRV,"w").write(out)
try:
    py_compile.compile(SRV,doraise=True)
except Exception as e:
    shutil.copy(bak,SRV)
    print(f"✗ Syntaxfehler — zurückgerollt. {e}"); sys.exit(4)

print(f"\n✓ /otc-Endpoint eingefügt. Backup: {bak}\n")
print("Weiter:")
print("  python3 /root/otc_track.py --json")
print("  cd ~/burn-analyst && ./restart-screens.sh")
print("  curl -s -o /dev/null -w '/otc -> %{http_code}\\n' https://95-216-152-31.sslip.io/otc")
