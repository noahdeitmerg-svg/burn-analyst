#!/usr/bin/env python3
# otc_track.py — OTC-Deal-Tracker für die Sammel-Wallet.
# Scannt die OTC-Adresse auf Arbitrum: wer hat wie viel USDC geschickt, wer hat wie viel BURN bekommen.
# Löst Namen über addr_book auf (Airdrop-Liste). Aufruf:  python3 /root/otc_track.py
# Optional: python3 /root/otc_track.py --json   (Maschinenausgabe für die App)
import json,sys,time,datetime,urllib.request

OTC="0xa1b9dec925a4dcb26ed096f238669d45df27c465"   # Sammel-Wallet des OTC-Deals (Mario)
ARBS=["https://arb1.arbitrum.io/rpc","https://arbitrum-one-rpc.publicnode.com","https://arbitrum.llamarpc.com","https://rpc.ankr.com/arbitrum","https://1rpc.io/arb"]
ARB=ARBS[0]
# Ethereum Mainnet — Kaeufer koennen auch dort USDC/USDT schicken
ETHS=["https://ethereum-rpc.publicnode.com","https://eth.llamarpc.com","https://rpc.ankr.com/eth","https://1rpc.io/eth","https://cloudflare-eth.com"]
USDC_ETH="0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"   # USDC auf Ethereum
USDT_ETH="0xdac17f958d2ee523a2206206994597c13d831ec7"   # USDT auf Ethereum
DEC_ETH={USDC_ETH:6,USDT_ETH:6}
SYM_ETH={USDC_ETH:"USDC",USDT_ETH:"USDT"}
FCM_KEY="/root/firebase-key.json"
BURN_TK="0xbfc6620459762a6e485ebf1cf7e532e06253b62f"
STBURN_TK="0xd36701e8cfe1c8edd993fa67b90134671c8f8424"
USDC_TK="0xaf88d065e77c8cc2239327c5edb3a432268e5831"
TRANSFER="0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
DEC={BURN_TK:18,STBURN_TK:18,USDC_TK:6}
SYM={BURN_TK:"BURN",STBURN_TK:"stBURN",USDC_TK:"USDC"}
STATE="/root/otc_state.json"
OUT="/root/otc_report.json"
TARGET=40600.0   # Ziel-Volumen USD
PRICE=0.105      # $/Token
NOAH=["0x6e37cc7d415466909db6102b6dc34473ac1bb500","0x505042ff781ea1689e44e1d200efd691c30db86c","0x9ffa190b0d2543f35dfa1a2955bc2f4c544871d2"]

sys.path.insert(0,"/root")
try:
    import addr_book
    def NAME(a):
        try:
            n=addr_book.addr_name(a)
            return n if n and not n.startswith("0x") else None
        except Exception: return None
except Exception:
    def NAME(a): return None

_rpc_i=0
def rpc(method,params,tries=None,pool=None):
    """Rotiert über mehrere RPCs; 403 = Endpoint blockt -> naechster. pool=ARBS oder ETHS."""
    global _rpc_i
    POOL=pool or ARBS
    body=json.dumps({"jsonrpc":"2.0","id":1,"method":method,"params":params}).encode()
    hdr={"Content-Type":"application/json","User-Agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36","Accept":"*/*"}
    last=None
    for n in range(len(POOL)*2):
        url=POOL[(_rpc_i+n)%len(POOL)]
        try:
            req=urllib.request.Request(url,data=body,headers=hdr)
            with urllib.request.urlopen(req,timeout=40) as r:
                j=json.loads(r.read())
            if "error" in j: raise RuntimeError(j["error"])
            _rpc_i=(_rpc_i+n)%len(POOL)
            return j["result"]
        except Exception as e:
            last=e; time.sleep(0.6)
    raise RuntimeError(f"alle RPCs fehlgeschlagen: {last}")

# ── FCM-Push (nutzt dieselbe Firebase-Config wie burn-monitor-fcm.py) ──
_msg=None;_fcm_tok=None
def push_init():
    global _msg,_fcm_tok
    if _msg is not None: return True
    try:
        import firebase_admin
        from firebase_admin import credentials,messaging
        try: firebase_admin.get_app()
        except ValueError: firebase_admin.initialize_app(credentials.Certificate(FCM_KEY))
        _msg=messaging
        # Token aus burn-monitor-fcm.py uebernehmen
        import re as _re
        src=open("/root/burn-monitor-fcm.py").read()
        m=_re.search(r'FCM_TOKEN\s*=\s*["\']([^"\']+)["\']',src)
        _fcm_tok=m.group(1) if m else None
        return bool(_fcm_tok)
    except Exception as e:
        print("Push nicht verfuegbar:",e); return False
def push(title,body):
    if not push_init(): return
    try:
        _msg.send(_msg.Message(notification=_msg.Notification(title=title,body=body),
            data={"title":title,"body":body},
            android=_msg.AndroidConfig(priority="high",notification=_msg.AndroidNotification(sound="default",channel_id="burn_alerts")),
            token=_fcm_tok))
        print("  push:",title,"·",body[:60])
    except Exception as e: print("  push-Fehler:",e)

def logs(token,topics,fr,to,pool=None):
    out=[];step=100_000 if pool is not ETHS else 20_000
    while fr<=to:
        hi=min(fr+step,to)
        try:
            r=rpc("eth_getLogs",[{"address":token,"fromBlock":hex(fr),"toBlock":hex(hi),"topics":topics}],pool=pool)
            out+=r; fr=hi+1
        except Exception:
            step=max(step//4,2_000)
            if step<=2_000: fr=hi+1
    return out

def t2a(t): return "0x"+t[-40:]
def amt(data,dec): return int(data,16)/(10**dec)

def blk_time(bn,cache={},pool=None):
    ck=(bn,id(pool))
    if ck in cache: return cache[ck]
    b=rpc("eth_getBlockByNumber",[hex(bn),False],pool=pool)
    ts=int(b["timestamp"],16); cache[ck]=ts; return ts

# ── Live-Bestand (balanceOf) je Adresse — BURN + stBURN auf Arbitrum ──
def balance_of(token,addr,dec=18):
    try:
        data="0x70a08231"+"0"*24+addr[2:].lower()
        r=rpc("eth_call",[{"to":token,"data":data},"latest"])
        return int(r,16)/(10**dec)
    except Exception:
        return None

def holdings(addr):
    return (balance_of(BURN_TK,addr,18) or 0),(balance_of(STBURN_TK,addr,18) or 0)

def main():
    quiet = "--json" in sys.argv
    try: st=json.load(open(STATE))
    except Exception: st={"from":0,"from_eth":0,"rows":{},"pushed":[]}
    rows=st.get("rows",{})
    pushed=set(st.get("pushed",[]))
    before=set(rows.keys())
    topic_to="0x"+"0"*24+OTC[2:]

    # ── ARBITRUM ──
    head=int(rpc("eth_blockNumber",[]),16)
    fr=st.get("from") or max(head-4*60*60*24*30,0)   # Erstlauf ~30 Tage (Arbitrum ~4 Bl/s)
    for tk in (BURN_TK,STBURN_TK,USDC_TK):
        for topics in ([TRANSFER,None,topic_to],[TRANSFER,topic_to,None]):
            for lg in logs(tk,topics,fr,head):
                key="ARB-"+lg["transactionHash"]+"-"+str(int(lg["logIndex"],16))
                if key in rows: continue
                v=amt(lg["data"],DEC[tk])
                if v<=0: continue
                rows[key]={"tx":lg["transactionHash"],"blk":int(lg["blockNumber"],16),"chain":"ARB",
                           "tok":SYM[tk],"amt":v,"from":t2a(lg["topics"][1]),"to":t2a(lg["topics"][2])}

    # ── ETHEREUM MAINNET (USDC/USDT) ──
    head_eth=None
    try:
        head_eth=int(rpc("eth_blockNumber",[],pool=ETHS),16)
        fr_eth=st.get("from_eth") or max(head_eth-(60*60*24*30)//12,0)   # ~30 Tage (12s/Block)
        for tk in (USDC_ETH,USDT_ETH):
            for topics in ([TRANSFER,None,topic_to],[TRANSFER,topic_to,None]):
                for lg in logs(tk,topics,fr_eth,head_eth,pool=ETHS):
                    key="ETH-"+lg["transactionHash"]+"-"+str(int(lg["logIndex"],16))
                    if key in rows: continue
                    v=amt(lg["data"],DEC_ETH[tk])
                    if v<=0: continue
                    rows[key]={"tx":lg["transactionHash"],"blk":int(lg["blockNumber"],16),"chain":"ETH",
                               "tok":SYM_ETH[tk],"amt":v,"from":t2a(lg["topics"][1]),"to":t2a(lg["topics"][2])}
    except Exception as e:
        if not quiet: print("⚠ Ethereum-Scan uebersprungen:",str(e)[:80])

    # Zeitstempel
    for k,r in rows.items():
        if "ts" not in r:
            try: r["ts"]=blk_time(r["blk"],pool=(ETHS if r.get("chain")=="ETH" else None))
            except Exception: r["ts"]=0

    # ── PUSH bei neuen Bewegungen ──
    new=[k for k in rows if k not in before and k not in pushed]
    if new and before:            # beim allerersten Lauf nicht 20 Pushes feuern
        def _n(a):
            x=NAME(a)
            if x: return x
            if a.lower() in [w.lower() for w in NOAH]: return "Noah"
            return a[:6]+"…"+a[-4:]
        for k in sorted(new,key=lambda x:rows[x].get("ts",0)):
            r=rows[k]; o=OTC.lower()
            if r["to"].lower()==o:
                cp=_n(r["from"]); arrow="⬅ EIN"
            else:
                cp=_n(r["to"]); arrow="➡ AUS"
            ch=" ("+r.get("chain","ARB")+")" if r.get("chain")=="ETH" else ""
            v=f"{r['amt']:,.2f}" if r["tok"] in ("USDC","USDT") else f"{r['amt']:,.0f}"
            push(f"🤝 OTC {arrow}{ch}", f"{v} {r['tok']} · {cp}")
            pushed.add(k)
    else:
        pushed |= set(new)

    st={"from":head+1,"from_eth":(head_eth+1) if head_eth else st.get("from_eth",0),
        "rows":rows,"pushed":sorted(pushed)[-500:]}
    json.dump(st,open(STATE,"w"))

    R=sorted(rows.values(),key=lambda x:(x["ts"],x["blk"]))
    # ── Aggregation pro Gegenpartei ──
    party={}
    for r in R:
        o=OTC.lower()
        if r["to"].lower()==o:      cp=r["from"].lower(); d="IN"
        elif r["from"].lower()==o:  cp=r["to"].lower();   d="OUT"
        else: continue
        p=party.setdefault(cp,{"usdc_in":0.0,"burn_out":0.0,"burn_in":0.0,"usdc_out":0.0,"txs":[]})
        if r["tok"]=="USDC" and d=="IN":  p["usdc_in"]+=r["amt"]
        if r["tok"]=="USDC" and d=="OUT": p["usdc_out"]+=r["amt"]
        if r["tok"] in ("BURN","stBURN") and d=="OUT": p["burn_out"]+=r["amt"]
        if r["tok"] in ("BURN","stBURN") and d=="IN":  p["burn_in"]+=r["amt"]
        p["txs"].append(r)

    if "--json" in sys.argv:
        pj={}
        for k,v in party.items():
            d={kk:vv for kk,vv in v.items() if kk!="txs"}
            n=NAME(k)
            if not n and k.lower() in [x.lower() for x in NOAH]: n="Noah"
            d["name"]=n
            if v.get("usdc_in",0)>0:              # Live-Bestand nur fuer Kaeufer
                hb,hs=holdings(k)
                d["hold_burn"]=round(hb,2); d["hold_stburn"]=round(hs,2)
            pj[k]=d
        json.dump({"otc":OTC,"target":TARGET,"price":PRICE,
                   "updated":datetime.datetime.utcnow().isoformat()+"Z",
                   "party":pj,"rows":R},open(OUT,"w"),indent=1)
        print("geschrieben:",OUT,"·",len(pj),"Parteien"); return

    # ── Report ──
    def nm(a):
        n=NAME(a)
        if n: return n
        if a.lower() in [x.lower() for x in NOAH]: return "NOAH (eigene Wallet)"
        return a[:10]+"…"+a[-6:]

    tot_usdc=sum(p["usdc_in"] for p in party.values())
    tot_burn_out=sum(p["burn_out"] for p in party.values())
    tot_burn_in=sum(p["burn_in"] for p in party.values())

    print("="*78)
    print(f"OTC-DEAL TRACKER · Wallet {OTC}")
    print(f"Stand: {datetime.datetime.now():%d.%m.%Y %H:%M} · {len(R)} Transfers")
    print("="*78)

    # KÄUFER = haben USDC geschickt
    buyers=[(a,p) for a,p in party.items() if p["usdc_in"]>0]
    buyers.sort(key=lambda x:-x[1]["usdc_in"])
    print(f"\n── KÄUFER (USDC eingegangen) ── gesamt ${tot_usdc:,.2f}\n")
    print(f"  {'Name / Adresse':<26} {'USDC rein':>10} {'BURN raus':>11} {'Besitz BURN':>12} {'stBURN':>10}")
    print("  "+"-"*76)
    for a,p in buyers:
        hb,hs=holdings(a)
        mark=" *" if p["burn_out"]<=0 else "  "
        print(f"  {nm(a):<26} {p['usdc_in']:>10,.2f} {p['burn_out']:>11,.0f} {hb:>12,.0f} {hs:>10,.0f}{mark}")
    print("  (* = Token noch nicht geliefert)")

    # LIEFERANTEN = haben BURN eingezahlt (Noah, Björn)
    supp=[(a,p) for a,p in party.items() if p["burn_in"]>0]
    supp.sort(key=lambda x:-x[1]["burn_in"])
    print(f"\n── LIEFERANTEN (BURN eingezahlt) ── gesamt {tot_burn_in:,.0f}\n")
    for a,p in supp:
        share=(p["burn_in"]/tot_burn_in*100) if tot_burn_in else 0
        print(f"  {nm(a):<34} {p['burn_in']:>14,.0f} BURN  ({share:.1f}%)")

    # AUSZAHLUNGEN = USDC raus (an Noah, Björn, Mario)
    pay=[(a,p) for a,p in party.items() if p["usdc_out"]>0]
    pay.sort(key=lambda x:-x[1]["usdc_out"])
    if pay:
        print(f"\n── AUSZAHLUNGEN (USDC raus) ──\n")
        for a,p in pay:
            print(f"  {nm(a):<34} ${p['usdc_out']:>12,.2f}")

    # BILANZ
    print("\n"+"="*78)
    print(f"  USDC eingegangen : ${tot_usdc:>12,.2f}")
    print(f"  USDC ausgezahlt  : ${sum(p['usdc_out'] for p in party.values()):>12,.2f}")
    print(f"  USDC im Wallet   : ${tot_usdc-sum(p['usdc_out'] for p in party.values()):>12,.2f}")
    print(f"  BURN eingezahlt  : {tot_burn_in:>13,.0f}")
    print(f"  BURN ausgeliefert: {tot_burn_out:>13,.0f}")
    print(f"  BURN im Wallet   : {tot_burn_in-tot_burn_out:>13,.0f}")
    if tot_burn_out>0: print(f"  Ø Preis          : ${tot_usdc/tot_burn_out:>12,.4f} / Token")
    print("="*78)

    # UNBEKANNTE
    unk=[a for a,p in party.items() if not NAME(a) and a.lower() not in [x.lower() for x in NOAH]]
    if unk:
        print(f"\n⚠ {len(unk)} unbekannte Adresse(n) — in addr_book ergänzen:")
        for a in unk: print(f"   {a}")

    # CHRONOLOGIE
    print("\n── CHRONOLOGIE ──")
    for r in R:
        d="→" if r["to"].lower()==OTC.lower() else "←"
        cp=r["from"] if r["to"].lower()==OTC.lower() else r["to"]
        t=datetime.datetime.fromtimestamp(r["ts"]).strftime("%d.%m %H:%M") if r["ts"] else "—"
        ch=r.get("chain","ARB")
        print(f"  {t}  [{ch:3}] {d} {r['amt']:>14,.2f} {r['tok']:<7} {nm(cp)}")

if __name__=="__main__":
    main()
