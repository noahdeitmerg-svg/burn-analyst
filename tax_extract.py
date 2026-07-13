#!/usr/bin/env python3
# tax_extract.py — Automatisches Steuer-Ledger (BR) für Noahs Wallets.
# Scannt BURN+USDC (Arbitrum) und HOODIE (Robinhood Chain) inkrementell, klassifiziert jede
# Transaktion über Receipt-Events, bewertet in USD und BRL (PTAX venda, BCB) und schreibt
# /root/tax_ledger.json für die App (GET /taxledger). Lesarten: L2 = nur echte Veräußerungen,
# L1 = zusätzlich LP-Einlagen/-Entnahmen als permuta (strittig, siehe Steuer-Dossier).
import json,urllib.request,time,datetime,os,sys
sys.path.insert(0,'/root')
try:
    import addr_book
    def NAME(a): return addr_book.addr_name(a)
except Exception:
    def NAME(a): return a[:10]

ARB="https://arb1.arbitrum.io/rpc"
RH="https://rpc.mainnet.chain.robinhood.com"
BURN_TK="0xbfc6620459762a6e485ebf1cf7e532e06253b62f"
STBURN_TK="0xd36701e8cfe1c8edd993fa67b90134671c8f8424"
USDC_TK="0xaf88d065e77c8cc2239327c5edb3a432268e5831"
HOODIE_TK="0x91b7304099f0be58029fb4269ad6aa0bf601e666"
POOL="0xdbde256870eb8fc3e7aeff5bbcbda1e00a640b37"
HD_PM="0x8366a39cc670b4001a1121b8f6a443a643e40951"
HD_POOLID="0x9286edc5798ca4e2279297d27bf5edfc9b639c94c772303b0d62e434785cba19"
TRANSFER="0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
SWAP_V3="0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67"
MINT_V3="0x7a53080ba414158be7ec69b987b5fb7d07dee101fe85488f0853ae16239d0bde"
COLLECT_V3="0x70935338e69775456a85ddef226c395fb668b63fa0115f5f20610b388e6ca9c0"
SWAP_V4="0x40e9cecb9f5f1f1c5b9c97dec2917b7ee92e57ba5563708daca94dd84ad7112f"
MODLIQ_V4="0xf208f4912782fd25c7f114ca3723a2d5dd6f3bcc3ac8db5af63baa85f711d5ec"
W=["0x6e37cc7d415466909db6102b6dc34473ac1bb500","0x505042ff781ea1689e44e1d200efd691c30db86c","0x9ffa190b0d2543f35dfa1a2955bc2f4c544871d2"]
WSET=set(W); WT=["0x000000000000000000000000"+w[2:] for w in W]
DEAD="0x000000000000000000000000000000000000dead"
KRAKEN="0xd049a54c8f8757ae7392f0c6f65a487f82ddfde9"  # Noahs Kraken-Einzahladresse: USDC OUT dorthin = Off-Ramp (USDC->EUR->Bank) = Veraeusserung (L2), Transfertag als Naeherung
CRYPTOCOM="0xe7d324bfb30f7b6e314a1698cea57ac8eec4d366"  # Noahs Crypto.com-Einzahladresse: USDC OUT dorthin = Off-Ramp = Veraeusserung (L2)
OFFRAMPS={KRAKEN,CRYPTOCOM}  # Boersen-Auszahladressen: jeder USDC-OUT = Veraeusserung
RESIDENZ="2025-09-12"
HD_PX_ASSUME={"2026-07-11":0.000434,"2026-07-12":0.000286}  # dokumentierte Näherung (Beleganlage)
STATE="/root/tax_state.json"; LEDGER="/root/tax_ledger.json"

def rpc(url,m,p,tries=4):
    for i in range(tries):
        try:
            req=urllib.request.Request(url,data=json.dumps({"jsonrpc":"2.0","id":1,"method":m,"params":p}).encode(),
                headers={"Content-Type":"application/json","User-Agent":"Mozilla/5.0 tax-extract"})
            with urllib.request.urlopen(req,timeout=40) as r: j=json.loads(r.read())
            if "error" in j: raise RuntimeError(str(j["error"])[:120])
            return j["result"]
        except Exception:
            if i==tries-1: raise
            time.sleep(1.5*(i+1))
def twos(h):
    v=int(h,16); return v-(1<<256) if v>=(1<<255) else v

try: st=json.load(open(STATE))
except Exception: st={"v":2,"arbBlk":299_999_999,"hdBlk":3_799_999,"rows":{},"dayPx":{},"ptax":{},"ptaxDay":"","eth":[],"ethTs":0}

if st.get("v")!=3:
    st["v"]=3; st["arbBlk"]=-1; st["hdBlk"]=-1  # Vollhistorie ab Block 0, beide Chains
    print("Schema v3 -> Komplett-Backfill ab Block 0",flush=True)

# ── PTAX (BCB) täglich aktualisieren ──
today=datetime.date.today().isoformat()
if st.get("ptaxDay")!=today or not st["ptax"]:
    try:
        url=("https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/"
             "CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)"
             "?@dataInicial='04-01-2025'&@dataFinalCotacao='"+datetime.date.today().strftime("%m-%d-%Y")+"'"
             "&$top=3000&$format=json&$select=cotacaoVenda,dataHoraCotacao")
        req=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0"})
        for row in json.loads(urllib.request.urlopen(req,timeout=40).read())["value"]:
            st["ptax"][row["dataHoraCotacao"][:10]]=row["cotacaoVenda"]
        st["ptaxDay"]=today
        print(f"PTAX aktualisiert: {len(st['ptax'])} Tage",flush=True)
    except Exception as e: print(f"PTAX-Fehler (nutze Cache): {e}",flush=True)
def ptax_of(day):
    d=datetime.date.fromisoformat(day)
    for _ in range(8):
        k=d.isoformat()
        if k in st["ptax"]: return st["ptax"][k],k
        d-=datetime.timedelta(days=1)
    return None,None

# ── ETH-USD stündlich (90-Tage-Fenster reicht für HOODIE) ──
if time.time()-st.get("ethTs",0)>21600:
    try:
        to=int(time.time()); fr=to-85*86400
        req=urllib.request.Request(f"https://api.coingecko.com/api/v3/coins/ethereum/market_chart/range?vs_currency=usd&from={fr}&to={to}",headers={"User-Agent":"Mozilla/5.0"})
        newp=json.loads(urllib.request.urlopen(req,timeout=30).read())["prices"]
        have={int(p[0]//3600000) for p in st.get("eth",[])}
        st["eth"]=sorted(st.get("eth",[])+[p for p in newp if int(p[0]//3600000) not in have])
        st["ethTs"]=time.time()
        print(f"ETH-Kurse: {len(st['eth'])} Punkte",flush=True)
    except Exception as e: print(f"ETH-Kurs-Fehler (Cache): {e}",flush=True)
def eth_usd(ts):
    best=None;bd=1e18
    for p in st["eth"]:
        d=abs(p[0]-ts*1000)
        if d<bd:bd=d;best=p[1]
    return best or 0

def scan_transfers(url,token,frBlk,head,chunk,decimals):
    out=[]
    for pos in (1,2):
        fr=frBlk+1
        while fr<=head:
            size=chunk
            while True:
                hi=min(fr+size-1,head)
                topics=[TRANSFER,None,None]; topics[pos]=WT
                try:
                    logs=rpc(url,"eth_getLogs",[{"address":token,"fromBlock":hex(fr),"toBlock":hex(hi),"topics":topics}]); break
                except Exception:
                    size//=2
                    if size<50_000: raise
            for l in logs or []:
                out.append({"blk":int(l["blockNumber"],16),"tx":l["transactionHash"],"li":int(l["logIndex"],16),
                            "frm":"0x"+l["topics"][1][26:],"to":"0x"+l["topics"][2][26:],
                            "amt":int(l["data"],16)/decimals})
            fr=hi+1
    return out

def process(chain,url,raw,tokname_fn):
    if not raw: return
    txs=sorted(set(r["tx"] for r in raw)); blks=sorted(set(r["blk"] for r in raw))
    ts={}
    for b in blks: ts[b]=int(rpc(url,"eth_getBlockByNumber",[hex(b),False])["timestamp"],16)
    meta={}
    for tx in txs:
        rec=rpc(url,"eth_getTransactionReceipt",[tx]); tops=set(); eth=0.0
        for l in rec.get("logs",[]):
            a=(l.get("address") or "").lower(); tl=l.get("topics") or []
            if not tl: continue
            if chain=="ARB" and a==POOL: tops.add(tl[0])
            if chain=="RH" and a==HD_PM and len(tl)>1 and tl[1].lower()==HD_POOLID:
                tops.add(tl[0])
                if tl[0]==SWAP_V4:
                    d=(l.get("data") or "0x")[2:]
                    if len(d)>=64: eth+=twos(d[0:64])/1e18
        meta[tx]={"frm":(rec.get("from") or "").lower(),"tops":tops,"eth":eth}
        time.sleep(0.02)
    for r in sorted(raw,key=lambda x:(x["blk"],x["li"])):
        key=chain+":"+r["tx"]+":"+str(r["li"])
        if key in st["rows"]: continue
        m=meta[r["tx"]]; t=ts[r["blk"]]
        day=datetime.datetime.utcfromtimestamp(t).strftime("%Y-%m-%d")
        wallet=r["frm"] if r["frm"] in WSET else r["to"]
        direction="OUT" if r["frm"] in WSET else "IN"
        cp=r["to"] if direction=="OUT" else r["frm"]
        tok=tokname_fn(r)
        pre=day<RESIDENZ
        usd=None;kurs=None;l2=False;l1v=0.0;note="vor Steuerresidenz (nur Kostenbasis)" if pre else ""
        if chain=="ARB":
            pool_tx=(cp==POOL or m["tops"])
            if pool_tx:
                if SWAP_V3 in m["tops"] and MINT_V3 not in m["tops"] and COLLECT_V3 not in m["tops"]:
                    if tok=="USDC":
                        usd=r["amt"];kurs=1.0
                        if direction=="IN":
                            typ="VERKAUFS-Erlös (USDC)";l2=not pre
                        else: typ="KAUF-Zahlung (USDC)"
                    else:
                        typ="VERKAUF (Market)" if direction=="OUT" else "KAUF (Market)"
                        # Tagespreis merken
                elif MINT_V3 in m["tops"]:
                    typ="LP-EINLAGE"  # Bewertung im Post-Pass
                elif COLLECT_V3 in m["tops"]:
                    typ="LP-COLLECT (Fills/Entnahme)" if (tok=="USDC" and direction=="IN") else "LP-COLLECT (Token zurück)"
                else: typ="POOL-Interaktion"
            elif cp==DEAD: typ="BURN (neutral)";note=(note+" · " if note else "")+"kein Tausch, kein Erwerber · §Dossier B/Burn"
            elif cp in WSET: typ="INTERN"
            else: typ="TRANSFER "+("AN Dritte" if direction=="OUT" else "VON Dritten")
        else: # RH / HOODIE
            if cp==HD_PM or m["tops"]:
                if SWAP_V4 in m["tops"] and MODLIQ_V4 not in m["tops"]:
                    eu=eth_usd(t); usd=abs(m["eth"])*eu
                    kurs=(usd/r["amt"]) if r["amt"] else None
                    if direction=="OUT": typ="VERKAUF (Market)";l2=not pre
                    else: typ="KAUF (Market)"
                    note=(note+" · " if note else "")+f"ETH-Gegenwert {abs(m['eth']):.4f} @ ${eu:,.0f}"
                elif MODLIQ_V4 in m["tops"]:
                    typ="LP-EINLAGE" if direction=="OUT" else "LP-ENTNAHME"
                    hp=HD_PX_ASSUME.get(day)
                    if hp and not pre:
                        kurs=hp;usd=r["amt"]*hp;l1v=usd
                        note=(note+" · " if note else "")+"L1: Näherungskurs (Beleganlage), Lesart strittig · §Dossier B/LP"
                else: typ="POOL-Interaktion"
            elif cp==DEAD: typ="BURN (neutral)";note=(note+" · " if note else "")+"kein Tausch"
            elif cp in WSET: typ="INTERN"
            else:
                typ="ERHALT (Airdrop/Zuwendung)" if direction=="IN" else "TRANSFER AN Dritte"
                if direction=="IN": note=(note+" · " if note else "")+"Anschaffung zu Kosten 0 · §Dossier B/Airdrop"
        px,pxd=ptax_of(day)
        brl=round(usd*px,2) if (usd is not None and px) else None
        st["rows"][key]={"ts":t,"dt":day+" "+datetime.datetime.utcfromtimestamp(t).strftime("%H:%M"),
            "chain":chain,"wallet":NAME(wallet),"typ":typ,"tok":tok,"amt":r["amt"],"dir":direction,"cpa":cp,
            "kurs":kurs,"usd":round(usd,2) if usd is not None else None,"ptax":px,"brl":brl,
            "l2":round(brl,2) if (l2 and brl) else 0,"l1":round(l1v*(px or 0),2) if l1v else 0,
            "cp":NAME(cp),"signer":NAME(m["frm"]),"tx":r["tx"],"note":note}

# ── Scans (inkrementell) ──
arbHead=int(rpc(ARB,"eth_blockNumber",[]),16)
raw=[]
for tk,tag,dec in [(BURN_TK,"BURN",1e18),(STBURN_TK,"stBURN",1e18),(USDC_TK,"USDC",1e6)]:
    for r in scan_transfers(ARB,tk,st["arbBlk"],arbHead,10_000_000,dec):
        r["_tok"]=tag; raw.append(r)
seen=set(); uniq=[]
for r in raw:
    k=(r["tx"],r["li"])
    if k in seen: continue
    seen.add(k); uniq.append(r)
process("ARB",ARB,uniq,lambda r:r["_tok"])
st["arbBlk"]=arbHead
print(f"Arbitrum: {len(uniq)} neue Transfers bis Block {arbHead:,}",flush=True)

rhHead=int(rpc(RH,"eth_blockNumber",[]),16)
rawH=[]
for r in scan_transfers(RH,HOODIE_TK,st["hdBlk"],rhHead,300_000,1e18):
    r["_tok"]="HOODIE"; rawH.append(r)
seen=set(); uniqH=[]
for r in rawH:
    k=(r["tx"],r["li"])
    if k in seen: continue
    seen.add(k); uniqH.append(r)
process("RH",RH,uniqH,lambda r:"HOODIE")
st["hdBlk"]=rhHead
print(f"Robinhood: {len(uniqH)} neue Transfers bis Block {rhHead:,}",flush=True)

# ── POST-PASS: Tagespreise, OTC/Permuta/Staking-Erkennung, idempotente Neubewertung ──
def _d(r): return r["dt"][:10]
rowsL=list(st["rows"].values())
# (1) Tagespreise NUR aus echten Market-Paaren (Swap-Txs)
mk_u={};mk_t={}
for r in rowsL:
    if r["chain"]!="ARB": continue
    if r["typ"] in ("VERKAUFS-Erlös (USDC)","KAUF-Zahlung (USDC)"): mk_u[r["tx"]]=mk_u.get(r["tx"],0)+r["amt"]
    if r["typ"] in ("VERKAUF (Market)","KAUF (Market)") and r["tok"]=="BURN":
        e=mk_t.setdefault(r["tx"],{"b":0,"d":_d(r)}); e["b"]+=r["amt"]
dayPx={}
for tx,u in mk_u.items():
    e=mk_t.get(tx)
    if e and e["b"]>0: dayPx.setdefault(e["d"],[]).append(u/e["b"])
dayPx={d:sum(v)/len(v) for d,v in dayPx.items()}
def px_of(day):
    if day in dayPx: return dayPx[day]
    dd=datetime.date.fromisoformat(day)
    for off in range(1,60):
        for c in [(dd-datetime.timedelta(days=off)).isoformat(),(dd+datetime.timedelta(days=off)).isoformat()]:
            if c in dayPx: return dayPx[c]
    return None
# (2) Contract vs. Person (eth_getCode, gecacht)
st.setdefault("code",{})
def is_contract(addr):
    a=addr.lower()
    if a not in st["code"]:
        try: st["code"][a]=len(rpc(ARB,"eth_getCode",[a,"latest"]) or "0x")>4
        except Exception: st["code"][a]=False
    return st["code"][a]
# (3) Paar-Erkennung (Typen setzen; Werte kommen aus Pass 4)
outs=[r for r in rowsL if r["chain"]=="ARB" and r.get("dir")=="OUT" and r["tok"] in ("BURN","stBURN")
      and (("TRANSFER" in r["typ"]) or ("OTC" in r["typ"]) or ("PERMUTA" in r["typ"]) or ("STAKING" in r["typ"]))]
ins_u=[r for r in rowsL if r["chain"]=="ARB" and r.get("dir")=="IN" and r["tok"]=="USDC"
      and (("TRANSFER" in r["typ"]) or ("OTC" in r["typ"]) or ("ERLÖS" in r["typ"]))]
ins_t=[r for r in rowsL if r["chain"]=="ARB" and r.get("dir")=="IN" and r["tok"] in ("BURN","stBURN")
      and (("TRANSFER" in r["typ"]) or ("PERMUTA" in r["typ"]) or ("STAKING" in r["typ"]))]
for o in outs:
    for i in ins_u:
        if i.get("cpa")==o.get("cpa") and abs(i["ts"]-o["ts"])<14*86400:
            o["typ"]="OTC-VERKAUF (Token-Lieferung)"
            i["typ"]="OTC-VERKAUF (Erlös)"
            i["_pairnote"]=f"OTC: {o['amt']:,.0f} {o['tok']} geliefert {_d(o)}"
            o["_pairnote"]=f"OTC-Paar mit USDC-Eingang {_d(i)}"
    for i in ins_t:
        if i.get("cpa")==o.get("cpa") and abs(i["ts"]-o["ts"])<5*86400 and i["tok"]!=o["tok"]:
            if is_contract(o["cpa"]):
                o["typ"]=f"STAKING/WRAP ({o['tok']}→{i['tok']})"
                i["typ"]=f"STAKING/WRAP-Erhalt ({i['tok']})"
            else:
                o["typ"]=f"PERMUTA ({o['tok']}→{i['tok']}, {o['cp']})"
                i["typ"]=f"PERMUTA-Erhalt ({i['tok']}, {i['cp']})"
# (3b) HOODIE-Tagespreise aus eigenen Market-Swaps; LP-Zeilen (RH) idempotent bewerten
hdDayPx={}
for r in rowsL:
    if r["chain"]=="RH" and "Market" in r["typ"] and (r.get("usd") or 0)>0 and r["amt"]>0:
        hdDayPx.setdefault(_d(r),[]).append(r["usd"]/r["amt"])
hdDayPx={d:sum(v)/len(v) for d,v in hdDayPx.items()}
def px_hd(day):
    if day in hdDayPx: return hdDayPx[day],"Tagespreis aus eigenen HD-Trades"
    if day in HD_PX_ASSUME: return HD_PX_ASSUME[day],"Näherungskurs (Beleganlage)"
    dd=datetime.date.fromisoformat(day)
    for off in range(1,30):
        for c in [(dd-datetime.timedelta(days=off)).isoformat(),(dd+datetime.timedelta(days=off)).isoformat()]:
            if c in hdDayPx: return hdDayPx[c],f"Näherung: HD-Kurs vom {c}"
            if c in HD_PX_ASSUME: return HD_PX_ASSUME[c],f"Näherung: Belegkurs vom {c}"
    return None,None
for r in rowsL:
    if r["chain"]!="RH": continue
    if r["typ"] not in ("LP-EINLAGE","LP-ENTNAHME"): continue
    day=_d(r)
    if day<RESIDENZ: continue
    hp,src=px_hd(day)
    if not hp: continue
    px,_pd=ptax_of(day)
    r["kurs"]=hp; r["usd"]=round(r["amt"]*hp,2); r["ptax"]=px
    r["brl"]=round(r["usd"]*px,2) if px else None
    r["l1"]=r["brl"] or 0; r["l2"]=0
    base=r.get("note","").split(" · L1:")[0]
    r["note"]=(base+" · " if base else "")+f"L1: {src} · Lesart strittig · §Dossier B/LP"

# (4) Idempotente Neubewertung aller ARB-Zeilen (BURN/stBURN/USDC)
for r in rowsL:
    if r["chain"]!="ARB": continue
    day=_d(r); pre=day<RESIDENZ
    px,_pd=ptax_of(day)
    base=r.get("note","").split(" · §")[0].split(" · L1:")[0].split(" · OTC")[0].split(" · Krypto")[0].split(" · USDC von")[0]
    r["l1"]=0; r["l2"]=0
    t=r["typ"]
    def setv(usd,ref):
        r["kurs"]=(usd/r["amt"]) if r["amt"] else None
        r["usd"]=round(usd,2); r["ptax"]=px
        r["brl"]=round(usd*px,2) if px else None
        r["note"]=(base+" · " if base else "")+ref
    if r["tok"]=="USDC":
        usd=r["amt"]
        kr=(r.get("cpa","") or "").lower() in OFFRAMPS
        rampname="Kraken" if (r.get("cpa","") or "").lower()==KRAKEN else "Crypto.com"
        if t=="VERKAUFS-Erlös (USDC)": setv(usd,"Market-Verkaufserlös · zählt · §Dossier B/Verkauf"); r["l2"]=0 if pre else (r["brl"] or 0)
        elif t=="LP-COLLECT (Fills/Entnahme)": setv(usd,"LP-Fill-Erlös · zählt · §Dossier B/Fills"); r["l2"]=0 if pre else (r["brl"] or 0)
        elif t=="LP-EINLAGE": setv(usd,"USDC-Seite LP-Einlage · Lesart strittig · §Dossier B/LP"); r["l1"]=0 if pre else (r["brl"] or 0)
        elif t=="OTC-VERKAUF (Erlös)": setv(usd,(r.pop("_pairnote","OTC"))+" · zählt (Veräußerung) · §Dossier B/OTC"); r["l2"]=0 if pre else (r["brl"] or 0)
        elif t=="KAUF-Zahlung (USDC)": setv(usd,"Kaufpreis (Anschaffung) · §Dossier B/Kauf")
        elif kr and r.get("dir")=="OUT":
            r["typ"]=f"OFF-RAMP {rampname} (Veräußerung)"
            setv(usd,f"USDC→{rampname} (Off-Ramp, USDC→EUR/Fiat→Bankkonto) = Veräußerung · Transfertag als Näherung · §Dossier B/Verkauf"); r["l2"]=0 if pre else (r["brl"] or 0)
        elif kr and r.get("dir")=="IN":
            r["typ"]=f"{rampname}-Rückfluss (neutral, prüfen)"
            setv(usd,f"USDC-Rückfluss von {rampname}-Adresse — keine Veräußerung (zurückgewiesene/teilw. Einzahlung); Zuordnung mit Contadora prüfen · neutral")
        elif "TRANSFER VON" in t and usd>=500 and not pre:
            r["typ"]="ERLÖS-Eingang (Zuordnung prüfen)"
            setv(usd,"USDC von Person ohne erkanntes Gegen-Asset — konservativ als Erlös gezählt · §Dossier B/OTC"); r["l2"]=r["brl"] or 0
        else: setv(usd,base or "Transfer")
    else:
        bp=px_of(day)
        if t.startswith("PERMUTA (") and not pre:
            wrapper=(set((r["tok"],)) | {"BURN","stBURN"})=={"BURN","stBURN"}
            ref="Krypto-zu-Krypto-Tausch = Veräußerung (SC COSIT 214/2021) · konservativ gezählt"+(" · GEGENAUFFASSUNG dokumentiert: gedeckter Wrapper-Tausch, kein Vermögenszuwachs — §Dossier B/Wrapper" if wrapper else "")+" · §Dossier A.3"
            if bp: setv(r["amt"]*bp,(r.pop("_pairnote","")+" · " if r.get("_pairnote") else "")+ref); r["l2"]=r["brl"] or 0
        elif t.startswith("STAKING/WRAP (") and not pre:
            if bp: setv(r["amt"]*bp,"Staking-Hin-/Rücktausch über Kontrakt · Lesart strittig (wie LP) · §Dossier B/LP"); r["l1"]=r["brl"] or 0
        elif t=="OTC-VERKAUF (Token-Lieferung)":
            r["note"]=(base+" · " if base else "")+(r.pop("_pairnote","")+" · " if r.get("_pairnote") else "")+"Erlös auf USDC-Zeile · §Dossier B/OTC"
        elif t=="LP-EINLAGE" and not pre:
            if bp: setv(r["amt"]*bp,"L1: Tagespreis aus eigenen Trades · Lesart strittig · §Dossier B/LP"); r["l1"]=r["brl"] or 0
        elif t=="LP-COLLECT (Token zurück)" and r.get("dir")=="IN" and not pre:
            if bp: setv(r["amt"]*bp,"L1: Rücktausch-Bewertung · Lesart strittig · §Dossier B/LP"); r["l1"]=r["brl"] or 0
        elif t.startswith("BURN (neutral)"):
            r["note"]=(base+" · " if base else "")+"kein Tausch, kein Erwerber · neutral · §Dossier B/Burn"

# DE-Periode einheitlich kennzeichnen (Erklärungen in DE bis einschl. 2025 abgegeben)
DE_TXT="DE-Periode bis 12.09.2025 (deutsche Steuererklärung abgegeben) — für BR nur Kostenbasis"
for r in st["rows"].values():
    if _d(r)<RESIDENZ:
        rest=r.get("note","").replace("vor Steuerresidenz (12.09.2025) — nur Kostenbasis","").replace("vor Steuerresidenz (nur Kostenbasis)","").strip(" ·")
        r["note"]=DE_TXT+((" · "+rest) if rest else "")
        r["l1"]=0;r["l2"]=0

# ── Monatsaggregation + Ledger schreiben ──
months={}
for r in st["rows"].values():
    mon=r["dt"][:7]
    g=months.setdefault(mon,{"l2":0.0,"l1":0.0,"n":0})
    g["l2"]+=r["l2"] or 0; g["l1"]+=r["l1"] or 0; g["n"]+=1
for g in months.values():
    g["l2"]=round(g["l2"],2); g["l1"]=round(g["l1"],2); g["l1total"]=round(g["l2"]+g["l1"],2)
rows=sorted(st["rows"].values(),key=lambda r:r["ts"],reverse=True)
json.dump({"v":1,"updated":datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
           "residenz":RESIDENZ,"limite":35000.0,"months":months,"rows":rows[:600]},open(LEDGER,"w"))
json.dump(st,open(STATE,"w"))
print(f"LEDGER: {len(st['rows'])} Zeilen gesamt, {len(months)} Monate. Aktuell {sorted(months)[-1]}: L2 R${months[sorted(months)[-1]]['l2']:,.2f} / L1-Gesamt R${months[sorted(months)[-1]]['l1total']:,.2f}",flush=True)
