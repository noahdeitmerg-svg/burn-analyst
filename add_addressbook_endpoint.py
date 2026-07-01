#!/usr/bin/env python3
# Patcht ptf-history-server.py: fügt GET /addressbook Endpoint hinzu.
# Idempotent — mehrfaches Ausführen schadet nicht.
import re, shutil, time

PATH = "/root/ptf-history-server.py"
shutil.copy(PATH, PATH + ".bak_addrbook_" + str(int(time.time())))

with open(PATH) as f:
    src = f.read()

if "/addressbook" in src:
    print("✓ /addressbook Endpoint existiert bereits — nichts zu tun.")
    raise SystemExit(0)

# Der neue Endpoint-Block. Wird VOR "elif self.path==\"/wallet/state\"" eingefügt,
# direkt nach dem /history-Block. Wir hängen ihn an den do_GET-Router.
# Einfachster sicherer Weg: nach dem ersten "if self.path==\"/history\":"-Block
# einen elif einfügen. Wir suchen die /wallet/state Zeile und fügen davor ein.

endpoint = '''        elif self.path=="/addressbook":
            # Liefert das komplette Adressbuch als JSON. Eine Quelle der Wahrheit
            # für die App — die App holt das beim Start und bleibt so synchron.
            try:
                import importlib, addr_book
                importlib.reload(addr_book)  # immer frische Version von der Platte
                book = addr_book.ADDR_BOOK
            except Exception as e:
                book = {}
            payload = json.dumps(book).encode()
            self.send_response(200)
            self.send_header("Access-Control-Allow-Origin","*")
            self.send_header("Content-Type","application/json")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return
'''

# Finde die Zeile mit /wallet/state im do_GET und füge den Endpoint davor ein
marker = '        elif self.path=="/wallet/state":'
if marker in src:
    src = src.replace(marker, endpoint + marker, 1)
    print("✓ /addressbook vor /wallet/state eingefügt")
else:
    print("✗ Marker /wallet/state nicht gefunden — manueller Einbau nötig")
    raise SystemExit(1)

# Sicherstellen dass json importiert ist
if "import json" not in src:
    src = "import json\n" + src
    print("✓ import json ergänzt")

with open(PATH, "w") as f:
    f.write(src)

print("✓ Patch geschrieben. Backup angelegt.")
print("→ Jetzt: systemctl restart ptf-history-server.service")
