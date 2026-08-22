// ═══ CONTRACTS ═══
var POOL="0xdbde256870eb8fc3e7aeff5bbcbda1e00a640b37";
var BURN_TK="0xBFC6620459762a6e485eBF1cF7E532e06253B62f";
var STBURN_TK="0xd36701e8cFe1C8eDD993Fa67B90134671c8F8424";
var STBURN_POOL="0xae87c1e544cd73d6d67f29500a2969abc9f3ab75";
var DEAD_ADDR="0x1DEAd0000000000000000000000000000000DEAD";
var STAKE_VAULT="0x9ae5453F156a1f7AC297781C15C77b622E42C12c";
var CONTRIB_VAULT="0x5b08D24EfcB4B485fa34bBdCed6d63205100afd6";
var CLIENT_VAULT="0x2e9237771d0AE73B7D9a2C791209EfD5a1Ea9513";
var DAO_VAULT="0x72aDe1298731f057796ECAb891F623Ae4C18E7c1";
var RPC_LIST=["https://arb1.arbitrum.io/rpc","https://arbitrum-one-rpc.publicnode.com","https://arbitrum.drpc.org"];
var rpcIdx=0,rpcFails=[0,0,0];

async function rpcCall(to,data){
  for(var i=0;i<RPC_LIST.length;i++){
    var idx=(rpcIdx+i)%RPC_LIST.length;
    try{var ac=new AbortController();var tm=setTimeout(function(){ac.abort();},5000);
      var r=await fetch(RPC_LIST[idx],{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({jsonrpc:"2.0",method:"eth_call",params:[{to:to,data:data},"latest"],id:1}),signal:ac.signal});
      clearTimeout(tm);var j=await r.json();
      if(j.result&&j.result!=="0x"){rpcFails[idx]=0;if(idx!==rpcIdx){rpcIdx=idx;console.log("RPC switched to",RPC_LIST[idx]);}return j.result;}
      rpcFails[idx]++;
    }catch(e){clearTimeout(tm);rpcFails[idx]++;console.log("RPC["+idx+"] fail:",e.message);}
  }
  return"0x0";}
// Legacy alias
var rpc=rpcCall;

var DS="https://api.dexscreener.com/latest/dex/pairs/arbitrum/"+POOL;
var DS_TK="https://api.dexscreener.com/latest/dex/tokens/"+BURN_TK.toLowerCase();
var DS_SEARCH="https://api.dexscreener.com/latest/dex/search?q=BURN+USDC+arbitrum";
var DS_ST="https://api.dexscreener.com/latest/dex/pairs/arbitrum/"+STBURN_POOL;
var USDC_TK="0xaf88d065e77c8cC2239327C5EDb3A432268e5831";

// ═══ CONFIG ═══
var W_LEDGER="0x9fFa190b0d2543F35DFa1A2955BC2F4C544871D2";
var W_DEFI="0x505042fF781eA1689e44e1d200eFD691C30Db86C";

// ═══ ADDRESS BOOK ═══
// Discord wallet-verifizierung names → addresses (all lowercase keys for matching).
// When a known wallet trades / LPs / changes, the app shows the NAME instead of the hex.
// Verify-Bot-confirmed addresses take priority (those are the user's current verified wallet).
var ADDR_BOOK={
  "0xeede6fdd60c4b0f52701af895d881eeeb9ba6eb4":"Irena",
  "0x1e089ee228f08370e996fc135c4c23d40e0ae58b":"Philipp",
  "0x9ffa190b0d2543f35dfa1a2955bc2f4c544871d2":"Noah ⭐",
  "0x505042ff781ea1689e44e1d200efd691c30db86c":"Noah (DeFi) ⭐",
  "0x751de1df943f22b90468ed5d6b193549cd5bd4b8":"Lion",
  "0x4b29414c800f84f27056a55298eb685f134bcff4":"MartinaLartey",
  "0xbc6de8f9712f9308d368d00828944a93bb81d4ad":"chris_u",
  "0xecbcc7c2fdc04b151c9dfa8d4e2303be98a0ed61":"Little-powerprincess",
  "0xe73bcb80ec39551677b79916126d65165fe38f7a":"mislavm",
  "0xff2f41ed3ac6f2e0394c0dac26b6a356aab53547":"annablume4699",
  "0x7d32f1334265a77fbea2a03c3a5ca6b5b1319f17":"Den91Re_ETH",
  "0x1f3f931ed40273a8e71dee7771322bb3c28aa22e":"Nicole",
  "0x441c5c0aae9f9325b31f9691d19d283fbf5438ac":"Vitja",
  "0xced145bd4bcfaa9688e6006837ba51026a665911":"Viktor",
  "0x1fbaa25057578f29bcbb95a9ce833f5c5cbe93de":"Dominic",
  "0x98896671e67107e3e41c0e6c90d138b485eff3de":"Björn",
  "0x7a28a86fcac8a75bb5d1fa5777662997a5ae543d":"OFalk",
  "0xb5d252d5f996fee396d63829eaffe8fbdb1dea8b":"ManuelZ",
  "0xf5ed30e23fe38f42cf9f4c9ee06d283270f33df8":"mislavm",
  "0xe9a6e15ed22b7fe8ab804d18152c8df04bc480c3":"Christian",
  "0x9f2406cfc9738337dcaaaf16ab6382da359b6d56":"Zora",
  "0xdda2914eb046c6305e12de73fcdf6c87e4000edb":"Julian Schüle",
  "0x4489103f76d4191224b0c3b035fb310da7e4e038":"Elias",
  "0x872d3f5015a389ca46784e90cdf4901fd65e52b6":"Katja Kügler",
  "0x346303a6e64900f2c1ba7127eed94974c8b67784":"Chris",
  "0x88ea25a88a0840d30b4171c7f732271225cea270":"Stefan",
  "0xdd91ef9232047dcc5f308d5358d1b7d80da311b5":"Benny",
  "0x7635c7ca8e1c66b5a5c5203e6f4a6f12603d061d":"Sergej",
  "0xee3c4986f928ca07e3f345ef28b8bfd6cd3542a1":"Jan",
  "0xf76bb59da518be636ca3396286010493d7dc2541":"Asita",
  "0xe9956194b6e86f3f4abd89c0184deb04f3ca6d7e":"Jens",
  "0x58098a94c6ec47937557f8790a5531eaf196e939":"Halima",
  "0xe0c6e5432bf1cd3d4927d71c8fbe467ee8d91236":"_ezy_",
  "0xd1ea6173bfd0d53899b0203b9025edd74e783a48":"Alfonso",
  "0x9e4e0a1c623c4f8a8f8a2d81f1b477bc8f80b888":"Samu",
  "0xba006ccc22038cf3885ac8e7cece8957afb1b3e6":"Justin",
  "0x9b0207f16f290e0220c47baab52594356e6d45c7":"Arthur Viktor Rein",
  "0xc017eed38558e8c2d5923ff0f4a036063bb18e48":"Denis",
  "0xd1ea440cd0c1ec23e72a19e86bc78369c9ac6cce":"Satoshi_7",
  "0x141bd9c930a544b528851b4c5b6973f2562fd50d":"Alex",
  "0x0e7121299279d976c246957617db97a81a9a1a4b":"reiss.eth",
  "0x575dbf4a67b549f72f98a80fe9a2afe0925c4dca":"Mario",
  // ── Daocademy CSV: offizielle Projekt-Vaults + ergänzte Wallets ──
  "0x9ae5453f156a1f7ac297781c15c77b622e42c12c":"Stalking Vault",
  "0x5b08d24efcb4b485fa34bbdced6d63205100afd6":"Core Contributors Vault",
  "0x2e9237771d0ae73b7d9a2c791209efd5a1ea9513":"Client Vault",
  "0x521b33d8bd645986e0d7f0db01bdf8a166408aa8":"Stalking Pool",
  "0xf42904ae1b58e8e1fde7180e2f9ebacdb9c06cd5":"Staking in/out",
  "0x4cc7e699cdf6baeb850f1e5b7084ca179da98aee":"Elite Staking Pool",
  "0x1b5b969fcccc12ddcf3022bbf1c586b775ddfb42":"Elite DAO",
  "0xbb751e832d9da605eacebec153101afc3aadd154":"T-Free",
  "0x68bb36c5ec72868549a1cb4ab93eccfc39ca52d4":"Alex",
  "0x8dbd81fd2fe6074bbdca0b6b2fce05c7d54263e6":"Luis",
  "0x193b5dbdc354d1917079ae437de8b5828f53f40c":"SelfMade / Andreas"
};
// Merge any user-added names from localStorage
try{var abExtra=JSON.parse(localStorage.getItem("addr_book_extra")||"{}");for(var abk in abExtra){if(abExtra.hasOwnProperty(abk))ADDR_BOOK[abk.toLowerCase()]=abExtra[abk];}}catch(e){}
// Merge cached server addressbook (instant, works offline). Refreshed from server on start.
try{var abServerCache=JSON.parse(localStorage.getItem("addr_book_server")||"{}");for(var abs in abServerCache){if(abServerCache.hasOwnProperty(abs))ADDR_BOOK[abs.toLowerCase()]=abServerCache[abs];}}catch(e){}
try{if(!localStorage.getItem("ab_key"))localStorage.setItem("ab_key","22a91cc2875cb00a1192");}catch(e){}
// ─── SINGLE SOURCE OF TRUTH: fetch the addressbook from the server on start ───
// The server (/root/addr_book.py) is the master list. The app pulls it so both stay in
// sync automatically — add a name once on the server, the app picks it up next launch.
// Server names win over the hardcoded defaults; the local cache covers the offline case.
async function syncAddrBookFromServer(){
  try{
    var ac=new AbortController();var tm=setTimeout(function(){ac.abort();},6000);
    var r=await fetch("https://95-216-152-31.sslip.io/addressbook",{signal:ac.signal});
    clearTimeout(tm);
    if(!r.ok)return;
    var book=await r.json();
    if(book&&typeof book==="object"){
      var n=0;
      for(var k in book){if(book.hasOwnProperty(k)&&k&&book[k]){ADDR_BOOK[k.toLowerCase()]=book[k];n++;}}
      try{localStorage.setItem("addr_book_server",JSON.stringify(book));}catch(e){}
      console.log("ADDR_BOOK: synced "+n+" names from server");try{renderAddrBook();}catch(e){}
      // Re-render trades so freshly-known names show immediately.
      try{if(typeof renderTrades==="function")renderTrades();}catch(e){}
    }
  }catch(e){console.log("ADDR_BOOK sync skipped:",e.message);}
}
// Resolve an address to a display name (or shortened hex if unknown).
function addrName(addr,opts){
  opts=opts||{};
  if(!addr)return "—";
  var low=(addr+"").toLowerCase();
  var name=ADDR_BOOK[low];
  if(name)return opts.withHex?(name+" ("+addr.slice(0,6)+"…"+addr.slice(-4)+")"):name;
  return addr.length>10?addr.slice(0,6)+"…"+addr.slice(-4):addr;
}
// Add/update a name for an address (persists to localStorage)
function addrBookSet(addr,name){
  if(!addr||!name)return;
  var low=(addr+"").toLowerCase();
  ADDR_BOOK[low]=name;
  try{var ex=JSON.parse(localStorage.getItem("addr_book_extra")||"{}");ex[low]=name;localStorage.setItem("addr_book_extra",JSON.stringify(ex));}catch(e){}
  try{
    var _abp=function(k){return fetch("https://95-216-152-31.sslip.io/addressbook",{method:"POST",mode:"cors",body:JSON.stringify({addr:low,name:name,key:k})});};
    _abp(localStorage.getItem("ab_key")||"").then(function(r){
      if(r.status===403&&!window.__abAsked){window.__abAsked=1;var nk=prompt("Adressbuch-Schl\u00fcssel (einmalig, steht im Cowork-Chat):");if(nk){localStorage.setItem("ab_key",nk.trim());_abp(nk.trim());}}
      else if(r.ok){console.log("ADDR_BOOK: auf Server gespeichert");}
    }).catch(function(){});
  }catch(e){}
}
// UI: Adresse benennen/umbenennen (Stift in der Trades-Liste). Speichert lokal
// + auf dem Server (einmalige Key-Abfrage beim ersten Speichern).
function abPrompt(addr){
  if(!addr)return;
  var low=(addr+"").toLowerCase();
  var cur=(typeof ADDR_BOOK!=="undefined"&&ADDR_BOOK[low])?(ADDR_BOOK[low]+"").replace(" \u2b50",""):"";
  var nm=prompt("Name f\u00fcr "+low.slice(0,10)+"\u2026"+low.slice(-6)+":",cur);
  if(nm===null)return;
  nm=nm.trim();
  if(!nm)return;
  addrBookSet(low,nm);
  try{renderTrades();}catch(e){}
  try{renderAddrBook();}catch(e){}
}
// \u2500\u2500 Adressbuch-Card (unten, schmal): Liste + Hinzufuegen \u2500\u2500
function abToggle(){
  var b=$("abBody"),c=$("abChev");if(!b)return;
  var open=b.style.display!=="none";
  b.style.display=open?"none":"block";
  if(c)c.textContent=open?"\u25b8":"\u25be";
  if(!open)renderAddrBook();
}
function renderAddrBook(){
  var cnt=$("abCount"),el=$("abList");
  if(!cnt&&!el)return;
  var keys=Object.keys(ADDR_BOOK||{}),items=[];
  for(var i=0;i<keys.length;i++){var a=keys[i];var n=((ADDR_BOOK[a]||"")+"").replace(" \u2b50","");if(n)items.push([n,a]);}
  items.sort(function(x,y){return x[0].toLowerCase()<y[0].toLowerCase()?-1:1;});
  if(cnt)cnt.textContent="\u00b7 "+items.length;
  if(!el)return;
  var h="";
  for(var j=0;j<items.length;j++){
    h+='<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:3px 0;border-bottom:1px solid rgba(30,41,59,.35)">'
      +'<span style="color:var(--o);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:45%">'+items[j][0]+'</span>'
      +'<span style="color:var(--dm);font-family:monospace;font-size:9px;white-space:nowrap">'+items[j][1].slice(0,8)+'\u2026'+items[j][1].slice(-6)
      +' <span onclick="abPrompt(\''+items[j][1]+'\')" style="cursor:pointer;opacity:.65" title="umbenennen">\u270f\ufe0f</span></span></div>';
  }
  el.innerHTML=h||'<span style="color:var(--dm)">Noch keine Eintr\u00e4ge</span>';
}
function abAddFromCard(){
  var ae=$("abAddr"),ne=$("abName"),m=$("abMsg");
  var a=((ae&&ae.value)||"").trim().toLowerCase();
  var n=((ne&&ne.value)||"").trim();
  if(!/^0x[0-9a-f]{40}$/.test(a)){if(m)m.textContent="Ung\u00fcltige Adresse \u2014 0x + 40 Hex-Zeichen";return;}
  if(!n){if(m)m.textContent="Name fehlt";return;}
  addrBookSet(a,n);
  if(ae)ae.value="";if(ne)ne.value="";
  if(m)m.textContent="\u2713 gespeichert: "+n+" (lokal + Server)";
  renderAddrBook();
  try{renderTrades();}catch(e){}
}

var TGT=[.20,.30,.50,1,2,5,10,20,30,50,100], SEL=[10000,50000,100000,180000];
var MY_BURN=0, MY_STBURN=0, INVESTED=3876, AVG_ENTRY=0.004250;
var wal={burn:0,st:0,prev:{burn:0,st:0},ok:false};

// ═══ PORTFOLIO TERMINAL ═══
var ptfAssets=[],ptfLedger=[],ptfPrices={},ptfLastFetch=0,ptfSimTargets={},ptfSnapshots=[];
var ptfSortCol="value",ptfSortAsc=false,ptfTotalDisplay=0;
var PTF_LEDGER_WALLET="0x9fFa190b0d2543F35DFa1A2955BC2F4C544871D2";
var PTF_LEDGER_BTC_ADDR="bc1qj79tmeql5m8wqxac5wvsdkwnkns7ztyehyv5t4";
var ptfLastBalances={eth:0,btc:0},ptfPendingDetection=null;
var PTF_DEFAULTS=[
  {id:"link",symbol:"LINK",name:"Chainlink",geckoId:"chainlink",amount:32.0574,avgEntry:10.30,totalCost:330,source:"ledger",decimals:4,contract:"0xf97f4df75117a78c1A5a0DBb814Af92458539FB4"},
  {id:"ondo",symbol:"ONDO",name:"Ondo Finance",geckoId:"ondo-finance",amount:650.7351,avgEntry:0.329,totalCost:214,source:"ledger",decimals:4,contract:"0x4A03F37e7d3fC243e3f99341d36f4b829BEe5E03"},
  {id:"rndr",symbol:"RNDR",name:"Render",geckoId:"render-token",amount:63.9043,avgEntry:1.299,totalCost:83,source:"ledger",decimals:4,contract:"0xC8a4EeA31E9B6b61c406DF013DD4FEc76f21E279"},
  {id:"mon",symbol:"MON",name:"Monad",geckoId:"monad",amount:2931.1731,avgEntry:0.0201,totalCost:59,source:"ledger",decimals:4,contract:null},
  {id:"cfg",symbol:"CFG",name:"Centrifuge",geckoId:"centrifuge",amount:462.3868,avgEntry:0.1254,totalCost:58,source:"ledger",decimals:4,contract:null},
  {id:"fet",symbol:"FET",name:"Fetch.ai",geckoId:"fetch-ai",amount:389.1441,avgEntry:0.2133,totalCost:83,source:"ledger",decimals:4,contract:"0x3A8B787f78159D8Ff2b5AfD1862F3F4bC5347209"},
  {id:"aave",symbol:"AAVE",name:"Aave",geckoId:"aave",amount:0.9077,avgEntry:179.59,totalCost:163,source:"ledger",decimals:4,contract:"0xba5DdD1f9d7F570dc94a51479a000E3BCE967196"},
  {id:"sky",symbol:"SKY",name:"SKY Governance",geckoId:"sky",amount:852.1203,avgEntry:0.0645,totalCost:55,source:"ledger",decimals:4,contract:null},
  {id:"cro",symbol:"CRO",name:"Cronos",geckoId:"crypto-com-chain",amount:655.7000,avgEntry:0.093,totalCost:61,source:"ledger",decimals:4,contract:null},
  {id:"uni",symbol:"UNI",name:"Uniswap",geckoId:"uniswap",amount:9.8139,avgEntry:5.605,totalCost:55,source:"ledger",decimals:4,contract:"0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0"},
  {id:"arb",symbol:"ARB",name:"Arbitrum",geckoId:"arbitrum",amount:263.1431,avgEntry:0.209,totalCost:55,source:"ledger",decimals:4,contract:"0x912CE59144191C1204E64559FE8253a0e49E6548"},
  {id:"syrup",symbol:"SYRUP",name:"Syrup",geckoId:"syrup",amount:77.6098,avgEntry:0.425,totalCost:33,source:"ledger",decimals:4,contract:null},
  {id:"eigen",symbol:"EIGEN",name:"EigenLayer",geckoId:"eigenlayer",amount:135.127,avgEntry:0.407,totalCost:55,source:"manual",decimals:2,contract:null},
  {id:"ar",symbol:"AR",name:"Arweave",geckoId:"arweave",amount:31.920,avgEntry:3.60,totalCost:115,source:"manual",decimals:2,contract:null},
  {id:"btc",symbol:"BTC",name:"Bitcoin",geckoId:"bitcoin",amount:0.00692908,avgEntry:68000,totalCost:471.18,source:"ledger",decimals:8,contract:null},
  {id:"tia",symbol:"TIA",name:"Celestia",geckoId:"celestia",amount:97.3909,avgEntry:0.5853,totalCost:57,source:"manual",decimals:2,contract:null},
  {id:"tao",symbol:"TAO",name:"Bittensor",geckoId:"bittensor",amount:0.59,avgEntry:222.03,totalCost:131,source:"manual",decimals:4,contract:null},
  {id:"akt",symbol:"AKT",name:"Akash",geckoId:"akash-network",amount:264,avgEntry:0.3702,totalCost:97.75,source:"manual",decimals:2,contract:null},
  {id:"eth",symbol:"ETH",name:"Ethereum",geckoId:"ethereum",amount:1.531305,avgEntry:2082.50,totalCost:3188.94,source:"ledger",decimals:6,contract:null}
];
var PTF_VERSION=5;

// ═══ LP POSITIONS (fallback — overwritten by on-chain if available) ═══
var LP_FALLBACK=[
  {b:5000,lo:.14,hi:.50,label:"Sell"},
  {b:5000,lo:.50,hi:1,label:"Sell"},
  {b:5000,lo:1,hi:1.5,label:"Sell"},
  {b:5000,lo:1.5,hi:2,label:"Sell"}
];
var LP_DAO={b:6000000,lo:0,hi:0,label:"DAO Full Range",fr:true};
// Try to load cached LPs from last fetchLPs() — gives correct BURN-Equivalent instantly at startup
var LP_INITIAL=LP_FALLBACK;
try{
  var lpCacheRaw=localStorage.getItem("lp_cache");
  if(lpCacheRaw){
    var lpCacheObj=JSON.parse(lpCacheRaw);
    if(lpCacheObj&&lpCacheObj.lps&&lpCacheObj.lps.length>0){
      LP_INITIAL=lpCacheObj.lps;
      console.log("LP: loaded "+lpCacheObj.lps.length+" cached LPs from "+(lpCacheObj.ts?new Date(lpCacheObj.ts).toISOString().slice(0,16):"unknown"));
    }
  }
}catch(e){console.log("LP cache load err:",e.message);}
var LP=LP_INITIAL.concat([LP_DAO]);
LP.sort(function(a,b){if(a.fr)return 1;if(b.fr)return-1;return a.lo-b.lo;});
var ALP=0;for(var ai=0;ai<LP.length;ai++)if(!LP[ai].fr)ALP+=LP[ai].b;
var lpLive=false;

// ═══ HISTORY ═══
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
var MS=[{d:"05.12.25",b:10500,u:1196,n:"Market"},{d:"01.08.26",b:200000,u:24000,n:"OTC Björn (191.709 stBURN = 200k BURN-eq)",id:"otc-bjoern-20260801"}];
// Load persisted manual/OTC sells from localStorage and merge into MS.
// These flow automatically into: Closed Positions, Realized Profit (TS/TR),
// LP P&L, BR Tax backfill, and CSV exports — because everything reads from MS.
try{
  var msExtra=JSON.parse(localStorage.getItem("ms_extra")||"[]");
  if(Array.isArray(msExtra)){
    for(var mex=0;mex<msExtra.length;mex++){
      var me=msExtra[mex];
      if(!(me&&me.b>0&&me.u>=0&&me.d))continue; var dup=false; for(var ci2=0;ci2<MS.length;ci2++){var mm=MS[ci2]; if((me.id&&mm.id&&me.id===mm.id)||(Math.abs((mm.b||0)-me.b)<1000&&mm.d===me.d)){dup=true;break;}} if(!dup)MS.push({d:me.d,b:me.b,u:me.u,n:me.n||"OTC"});
    }
  }
}catch(e){console.log("MS extra load err:",e);}
var TS=0,TR=0;
for(var ci=0;ci<CL.length;ci++){TS+=CL[ci].b;TR+=CL[ci].u;}
for(var si2=0;si2<MS.length;si2++){TS+=MS[si2].b;TR+=MS[si2].u;}

// ═══ V3 CALC ═══
function v3(B,lo,hi,P){
  if(B<=0||lo<=0||hi<=lo)return{left:0,usdc:0,pct:0};
  if(P<=lo)return{left:B,usdc:0,pct:0};
  var sL=Math.sqrt(lo),sH=Math.sqrt(hi),L=B*sL*sH/(sH-sL);
  if(P>=hi)return{left:0,usdc:L*(sH-sL),pct:100};
  var sP=Math.sqrt(P);
  var left=L*(sH-sP)/(sP*sH);
  // pct = real BURN-fill (sold/deposited), NOT linear price interpolation
  var pct=B>0?Math.max(0,Math.min(100,((B-left)/B)*100)):0;
  return{left:left,usdc:L*(sP-sL),pct:pct};
}

// ═══ STATE ═══
var X=0,Y=0,K=0,P=0,SRC="",TAB="auto",RAW=null;
var POOL_LIQ=0;
async function fetchPoolLiq(){try{var r=await rpc(POOL,"0x1a686502");if(r&&r.length>=34)POOL_LIQ=Number(BigInt("0x"+(r||"0").slice(2)));console.log("Pool L:",POOL_LIQ);}catch(e){}}

// ═══ FETCH: 30-day BURN price (GeckoTerminal OHLCV daily) ═══
var burn30d=[];
async function fetchBurn30d(){
  // Cache hydrate first — sofortiger Sparkline-Render aus localStorage
  try{
    var cached=localStorage.getItem("burn_30d");
    if(cached){
      var c=JSON.parse(cached);
      if(c&&c.ts&&c.data&&c.data.length>0){
        // Tolerant gegen altes Format (ts,close) — auf neues (t,p) normalisieren
        burn30d=c.data.map(function(d){return d.p!==undefined?d:{t:d.ts/1000,p:d.close};}).filter(function(d){return d.p>0;});
        if(P>0)try{render();}catch(re){}
        // Wenn jünger als 6h: nicht erneut fetchen
        if(Date.now()-c.ts<6*3600*1000)return;
      }
    }
  }catch(e){}
  // Fetch frisch von GeckoTerminal
  try{
    var url="https://api.geckoterminal.com/api/v2/networks/arbitrum/pools/"+POOL+"/ohlcv/day?aggregate=1&limit=30&currency=usd";
    var ac=new AbortController();var tm=setTimeout(function(){ac.abort();},10000);
    var r=await fetch(url,{signal:ac.signal});
    clearTimeout(tm);
    if(!r||!r.ok)return;
    var j=await r.json();
    if(j&&j.data&&j.data.attributes&&j.data.attributes.ohlcv_list){
      var list=j.data.attributes.ohlcv_list.slice().sort(function(a,b){return a[0]-b[0];});
      burn30d=list.map(function(c){return{t:c[0],p:c[4]};}).filter(function(d){return d.p>0;});
      localStorage.setItem("burn_30d",JSON.stringify({ts:Date.now(),data:burn30d}));
      console.log("BURN30D loaded:",burn30d.length,"days, range $"+Math.min.apply(null,burn30d.map(function(d){return d.p;})).toFixed(4)+" → $"+Math.max.apply(null,burn30d.map(function(d){return d.p;})).toFixed(4));
      if(P>0)try{render();}catch(re){}
    }
  }catch(e){console.log("burn30d fetch err:",e.message);}
}
var aB=0,aU=0,tU=0;
var stR=1,stOK=false,stSrc="";
var sup={total:0,burned:0,locked:0,circ:0,stSup:0};
var hst=[],whl=[],pm5={v:0,s:0,b:0};
var first=true,failCount=0;
var cache={P:0,stR:1,sup:null};

// ═══ HELPERS ═══
function $(id){return document.getElementById(id)}
function sF(v){var n=parseFloat(v);return isFinite(n)?n:0;} // safe parseFloat — never NaN
function F(n,d){if(d==null)d=2;if(!isFinite(n))return"—";var a=Math.abs(n);if(a>=1e9)return(n/1e9).toFixed(2)+"B";if(a>=1e6)return(n/1e6).toFixed(1)+"M";if(d===0)return(a>=1000?Math.round(n/10)*10:Math.round(n)).toLocaleString("en");if(a>=1e3)return(n/1e3).toFixed(d)+"K";return n.toFixed(d)}
function FP(n){if(!isFinite(n)||n<=0)return"—";if(n>=1)return"$"+n.toFixed(4);if(n>=.0001)return"$"+n.toFixed(6);return"$"+n.toExponential(3)}
function TG(t,c){return'<span class="tg" style="background:'+c+'18;color:'+c+'">'+t+'</span>'}
function MB(l,v,c){return'<div class="mb"><small>'+l+'</small><b style="color:'+c+'">'+v+'</b></div>'}
// Skeleton MB: zeigt Shimmer + Status-Text statt "—" wenn Daten noch laden
function MBL(l,c,statusTxt){return'<div class="mb"><small>'+l+'</small><b style="color:'+c+';display:flex;align-items:center;gap:8px"><span class="skel" style="width:60%;height:18px;border-radius:4px"></span></b>'+(statusTxt?'<span style="font-size:8px;color:var(--dm);text-transform:uppercase;letter-spacing:.5px;margin-top:2px;display:block">'+statusTxt+'</span>':'')+'</div>'}
var LD="…";
// tog() defined in lmap section with cache support

// ═══ RPC (uses rpcCall from fallback system above) ═══
function bof(a){return"0x70a08231000000000000000000000000"+a.slice(2).toLowerCase();}
function h2n(h){if(!h||h==="0x"||h==="0x0")return 0;try{var v=Number(BigInt(h)*1000n/10n**18n)/1000;return isFinite(v)?v:0;}catch(e){var f=parseInt(h,16)/1e18;return isFinite(f)?f:0;}}
function h2n6(h){if(!h||h==="0x"||h==="0x0")return 0;var v=parseInt(h,16)/1e6;return isFinite(v)?v:0;}

// ═══ NOTIFICATIONS + SOUND ═══
var prevPrice=0, soundOn=false, audioCtx=null;
function notify(title,body){if(Notification&&Notification.permission==="granted"){try{new Notification(title,{body:body});}catch(e){}}if(soundOn)beep();}
function toggleMute(){soundOn=!soundOn;$("mutBtn").textContent=soundOn?"🔊":"🔇";if(soundOn)beep();}
function beep(){
  try{
    if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();
    var osc=audioCtx.createOscillator(),gain=audioCtx.createGain();
    osc.connect(gain);gain.connect(audioCtx.destination);
    osc.frequency.value=880;osc.type="sine";
    gain.gain.setValueAtTime(0.3,audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01,audioCtx.currentTime+0.3);
    osc.start(audioCtx.currentTime);osc.stop(audioCtx.currentTime+0.3);
  }catch(e){}}

// ═══ FETCH: Pool ═══
function extractPair(j){
  if(j.pairs&&j.pairs.length>0){
    // 1st: exact pool address match
    for(var i=0;i<j.pairs.length;i++){if(j.pairs[i].pairAddress&&j.pairs[i].pairAddress.toLowerCase()===POOL)return j.pairs[i];}
    // 2nd: any Arbitrum pair with BURN base token (avoid wrong chain!)
    for(var i=0;i<j.pairs.length;i++){if(j.pairs[i].chainId==="arbitrum"&&j.pairs[i].baseToken&&j.pairs[i].baseToken.symbol==="BURN")return j.pairs[i];}
    // NEVER fallback to pairs[0] — could be Solana/BSC/etc
  }
  if(j.pair&&j.pair.chainId==="arbitrum")return j.pair;
  return null;
}

async function go(manual){
  var btn=$("rbtn");if(manual)btn.disabled=true;
  if(first)$("lbox").classList.remove("hid");
  var urls=[DS,DS_TK,DS_SEARCH];
  var p=null,lastErr="";
  for(var ui=0;ui<urls.length&&!p;ui++){
    try{
      var ac2=new AbortController();var tm2=setTimeout(function(){ac2.abort();},10000);
      var r=await fetch(urls[ui],{signal:ac2.signal});clearTimeout(tm2);
      if(!r.ok){lastErr="API "+r.status+" ["+ui+"]";continue;}
      var j=await r.json();
      console.log("DS["+ui+"]:",JSON.stringify(j).slice(0,300));
      p=extractPair(j);
      if(!p)lastErr="Empty ["+ui+"]";
    }catch(e){lastErr=e.message;console.log("DS["+ui+"] err:",e.message);}
  }
  if(p){
    RAW=p;aB=sF(p.liquidity&&p.liquidity.base);aU=sF(p.liquidity&&p.liquidity.quote);
    tU=sF(p.liquidity&&p.liquidity.usd);var apiP=sF(p.priceUsd);
    var mv=sF(p.volume&&p.volume.m5),mb=(p.txns&&p.txns.m5&&p.txns.m5.buys)||0,ms=(p.txns&&p.txns.m5&&p.txns.m5.sells)||0;
    if(pm5.v>0){var dv=mv-pm5.v,ds=ms-pm5.s,db=mb-pm5.b;
      if(Math.abs(dv)>500&&(ds>0||db>0)){whl.unshift({t:new Date(),type:ds>db?"SELL":"BUY",vol:Math.abs(dv)});if(whl.length>15)whl.pop();}}
    pm5={v:mv,s:ms,b:mb};
    if(TAB==="auto"&&apiP>0){var vy=aU>0?aU:(tU>0?tU/2:0),vx=vy/apiP;if(vx>0&&vy>0)set(vx,vy,"api");}
    $("ebox").classList.add("hid");$("astat").innerHTML='<span class="live-dot" style="background:var(--g)"></span><span style="color:var(--g)">DexScreener · 60s</span>';sts("ok");failCount=0;
  }else{
    // ON-CHAIN FALLBACK: Uniswap V3 slot0 + pool balances
    console.log("DexScreener failed ("+lastErr+"), trying on-chain...");
    var ok2=false;
    try{
      var bH2=await rpc(BURN_TK,bof(POOL)),uH2=await rpc(USDC_TK,bof(POOL));
      var pB=h2n(bH2),pU=h2n6(uH2);
      if(pB>0&&pU>0){
        aB=pB;aU=pU;tU=pU*2;
        var s0=await rpc(POOL,"0x3850c7bd");
        if(s0&&s0.length>=66){
          var sq=BigInt("0x"+s0.slice(2,66));
          var cP=Number(10n**30n*(2n**192n)/(sq*sq))/1e18;
          console.log("On-chain price: $"+cP.toFixed(6),"pool:",pB,"BURN /",pU,"USDC");
          if(cP>0.0001&&cP<100){var vy2=pU,vx2=vy2/cP;set(vx2,vy2,"chain");ok2=true;
            $("ebox").classList.add("hid");$("astat").innerHTML='<span class="live-dot" style="background:var(--cy)"></span><span style="color:var(--cy)">On-Chain · 60s</span>';sts("ok");failCount=0;}
        }
      }
    }catch(e){console.log("On-chain err:",e);}
    if(!ok2){
      failCount++;
      if(P>0){
        // Have data — stay silent, keep last known price
        $("ebox").classList.add("hid");
        $("astat").innerHTML='<span style="color:var(--mt)">Last update '+new Date().toLocaleTimeString()+' · retry '+(failCount)+'</span>';
      }else if(failCount>=3){
        // No data at all after 3 tries — show error
        $("ebox").classList.remove("hid");$("emsg").textContent="⚠ "+lastErr;
        $("astat").innerHTML='<span style="color:var(--r)">Offline</span>';sts("err");
      }else{
        $("astat").innerHTML='<span style="color:var(--mt)">Connecting... ('+failCount+'/3)</span>';
      }
    }
  }
  $("main").classList.remove("hid");
  if(P>0||K===0)render();
  fetchPoolLiq();
  $("lbox").classList.add("hid");first=false;btn.disabled=false;
}

// ═══ FETCH: stBURN ratio (on-chain calculation) ═══
// ratio = BURN_held_by_staking / stBURN_totalSupply
var STAKE_CANDIDATES=["0x521B33D8Bd645986E0d7F0Db01bDF8a166408Aa8","0xf42904ae1b58e8E1fdE7180E2F9EBAcdB9C06cD5",STBURN_TK];
async function fetchSt(){
  try{
    // Get stBURN total supply
    var stSupHex=await rpc(STBURN_TK,"0x18160ddd");
    var stSup=h2n(stSupHex);
    if(stSup<=0)return;
    // Try each candidate: find where the backing BURN is held
    for(var ci=0;ci<STAKE_CANDIDATES.length;ci++){
      var bHex=await rpc(BURN_TK,bof(STAKE_CANDIDATES[ci]));
      var b=h2n(bHex);
      if(b>0){
        var r=b/stSup;
        // Valid ratio should be between 1.0 and 1.5 (stBURN appreciates over BURN)
        if(r>=1.0&&r<1.5){stR=r;stOK=true;stSrc="chain";return;}
      }
    }
    // Also try convertToAssets as last on-chain attempt
    var callData="0x07a2d13a0000000000000000000000000000000000000000000000000de0b6b3a7640000";
    var res=await rpc(STBURN_TK,callData);var rv=h2n(res);
    if(rv>=1.0&&rv<1.5){stR=rv;stOK=true;stSrc="chain";return;}
  }catch(e){}
  // Fallback: DexScreener
  try{var r2=await fetch(DS_ST);if(!r2.ok)return;var j=await r2.json(),p=j.pairs&&j.pairs[0];if(!p)return;
    var bs=(p.baseToken&&p.baseToken.symbol)||"";
    if(bs.indexOf("stBURN")>=0){stR=parseFloat(p.priceNative)||1;}else{stR=1/(parseFloat(p.priceNative)||1);}
    stOK=true;stSrc="dex";}catch(e){}
  if(stOK)cache.stR=stR;else if(cache.stR>1){stR=cache.stR;stOK=true;stSrc="cache";}}

// ═══ FETCH: On-chain supply ═══
async function fetchSup(){
  try{
    var tH=await rpc(BURN_TK,"0x18160ddd");
    var bH=await rpc(BURN_TK,bof(DEAD_ADDR));
    var s1=await rpc(BURN_TK,bof(STAKE_VAULT));
    var s2=await rpc(BURN_TK,bof(CONTRIB_VAULT));
    var s3=await rpc(BURN_TK,bof(CLIENT_VAULT));
    var stH=await rpc(STBURN_TK,"0x18160ddd");
    sup.total=h2n(tH);sup.burned=h2n(bH);
    sup.locked=h2n(s1)+h2n(s2)+h2n(s3);
    sup.circ=sup.total-sup.burned-sup.locked;
    sup.stSup=h2n(stH);
    if(sup.total>0)cache.sup={total:sup.total,burned:sup.burned,locked:sup.locked,circ:sup.circ,stSup:sup.stSup};
  }catch(e){if(cache.sup){sup.total=cache.sup.total;sup.burned=cache.sup.burned;sup.locked=cache.sup.locked;sup.circ=cache.sup.circ;sup.stSup=cache.sup.stSup;}}}

// ═══ FETCH: Wallet (Ledger + DeFi free BURN) ═══
var MY_DEFI_BURN=0; // free BURN sitting on the DeFi wallet (not in LPs) — e.g. OTC-received BURN
async function fetchWal(){
  try{
    var lb=await rpc(BURN_TK,bof(W_LEDGER)),ls=await rpc(STBURN_TK,bof(W_LEDGER));
    var newB=Math.round(h2n(lb)),newS=Math.round(h2n(ls));
    // Safety: never overwrite valid balances with 0 (RPC failure)
    if(newB<=0&&MY_BURN>0)return;
    if(newS<=0&&MY_STBURN>0)return;
    wal.prev.burn=MY_BURN;wal.prev.st=MY_STBURN;
    MY_BURN=newB;MY_STBURN=newS;
    // Also read FREE BURN on the DeFi wallet (W_DEFI). This is BURN that is NOT in LPs —
    // e.g. OTC-received BURN sitting in the wallet. It counts toward total BURN-equivalent.
    // LP-locked BURN is tracked separately via lpBurnLeft, so this is purely the loose balance.
    try{
      var db=await rpc(BURN_TK,bof(W_DEFI));
      var newDefiB=Math.round(h2n(db));
      if(newDefiB>=0&&isFinite(newDefiB))MY_DEFI_BURN=newDefiB;
    }catch(e){console.log("DeFi BURN bal err:",e.message);}
    try{checkBalanceDecrease();}catch(e){}
    wal.burn=MY_BURN;wal.st=MY_STBURN;
    wal.ok=true;renderWal();
  }catch(e){console.log("Wallet err:",e);}}

function renderWal(){
  if(!wal.ok)return;
  var bDrop=wal.prev.burn>0&&MY_BURN<wal.prev.burn,sDrop=wal.prev.st>0&&MY_STBURN<wal.prev.st;
  var oldDropAlert=bDrop||sDrop;
  if(oldDropAlert&&soundOn)beep();
  if(oldDropAlert)notify("⚠ Wallet Alert","Balance decreased! BURN:"+(bDrop?MY_BURN-wal.prev.burn:0)+" stBURN:"+(sDrop?MY_STBURN-wal.prev.st:0));
  var bClr=bDrop?"var(--r)":"var(--g)",sClr=sDrop?"var(--r)":"var(--g)";
  var wShort=W_LEDGER.slice(0,6)+"…"+W_LEDGER.slice(-4);
  var totalTokens=MY_BURN+MY_STBURN;
  // Calculate LP detail: BURN deposited, BURN-left (sellable), BURN already sold to USDC, USDC value
  var lpBurnLeft=0,lpBurnDeposited=0,lpBurnSold=0,lpUsdcValue=0,lpCount=0,lpPositions=[];
  try{
    if(typeof LP!=="undefined"&&typeof v3==="function"&&typeof P!=="undefined"&&P>0){
      var Pw=pxUnified(); // COHERENCE: same price as P&L card & LP table
      for(var lpi=0;lpi<LP.length;lpi++){
        if(LP[lpi].fr)continue; // skip DAO full range
        var lpv=v3(LP[lpi].b,LP[lpi].lo,LP[lpi].hi,Pw);
        var lpSoldPos=Math.max(0,LP[lpi].b-lpv.left);
        lpBurnLeft+=lpv.left;
        lpBurnDeposited+=LP[lpi].b;
        lpBurnSold+=lpSoldPos;
        lpUsdcValue+=lpv.usdc;
        lpCount++;
        lpPositions.push({lo:LP[lpi].lo,hi:LP[lpi].hi,b:LP[lpi].b,left:lpv.left,sold:lpSoldPos,usdc:lpv.usdc,fill:LP[lpi].b>0?(lpSoldPos/LP[lpi].b*100):0});
      }
      lpPositions.sort(function(a,b){return b.fill-a.fill;}); // vollste Position zuerst
    }
  }catch(e){}
  window._lpDetail={left:lpBurnLeft,deposited:lpBurnDeposited,sold:lpBurnSold,usdc:lpUsdcValue,count:lpCount,positions:lpPositions};
  var totalBurnEq=MY_BURN+(MY_STBURN*stR)+lpBurnLeft+MY_DEFI_BURN;

  // ─── Wallet Change Detection ───
  // Persist last confirmed total. If current total deviates >1 BURN → ALARM
  var lastConfirmed=parseFloat(localStorage.getItem("walConfirmedTotal")||"0");
  if(lastConfirmed===0&&totalTokens>0){
    // First-ever load: silently set baseline
    localStorage.setItem("walConfirmedTotal",totalTokens.toString());
    lastConfirmed=totalTokens;
  }
  var totalDelta=totalTokens-lastConfirmed;
  var isChanged=Math.abs(totalDelta)>1;
  // Push notification once per new change event (track via ts+delta hash)
  if(isChanged){
    var changeKey=lastConfirmed.toFixed(0)+"_"+totalTokens.toFixed(0);
    var lastNotifKey=localStorage.getItem("walNotifKey")||"";
    if(lastNotifKey!==changeKey){
      localStorage.setItem("walNotifKey",changeKey);
      var dirTxt=totalDelta>0?"+"+F(totalDelta,0):F(totalDelta,0);
      notify("⚠ Wallet Balance Changed","Total: "+F(lastConfirmed,0)+" → "+F(totalTokens,0)+" ("+dirTxt+" BURN). Tap to confirm.");
      if(soundOn)beep();
    }
  }
  var totalClr=isChanged?"var(--r)":"var(--g)";
  var totalAlertIcon=isChanged?'<span style="color:var(--r);font-weight:900;margin-right:4px;animation:skelPulse 1.5s ease-in-out infinite">⚠</span>':'';

  // ─── DeFi Wallet BURN Change Detection (mirrors ledger logic) ───
  // Same alarm + push + confirm pattern as the ledger, but for free BURN on W_DEFI.
  // Catches OTC-received BURN, transfers in/out, etc. on the DeFi wallet.
  var defiLastConfirmed=parseFloat(localStorage.getItem("defiConfirmedBurn")||"-1");
  var defiChanged=false,defiDelta=0;
  if(MY_DEFI_BURN>=0){
    if(defiLastConfirmed<0){
      // First-ever load: silently set baseline (even if 0)
      localStorage.setItem("defiConfirmedBurn",MY_DEFI_BURN.toString());
      defiLastConfirmed=MY_DEFI_BURN;
    }
    defiDelta=MY_DEFI_BURN-defiLastConfirmed;
    defiChanged=Math.abs(defiDelta)>1;
    if(defiChanged){
      var defiKey=defiLastConfirmed.toFixed(0)+"_"+MY_DEFI_BURN.toFixed(0);
      var defiNotifKey=localStorage.getItem("defiNotifKey")||"";
      if(defiNotifKey!==defiKey){
        localStorage.setItem("defiNotifKey",defiKey);
        var defiDir=defiDelta>0?"+"+F(defiDelta,0):F(defiDelta,0);
        notify("⚠ DeFi-Wallet BURN geändert","DeFi: "+F(defiLastConfirmed,0)+" → "+F(MY_DEFI_BURN,0)+" ("+defiDir+" BURN). Tap to confirm.");
        if(soundOn)beep();
      }
    }
  }
  var defiBanner='';
  if(defiChanged){
    var defiDir2=defiDelta>0?"+"+F(defiDelta,0):F(defiDelta,0);
    defiBanner='<div style="margin:-4px -2px 10px;padding:10px 12px;border-radius:10px;'+
      'background:linear-gradient(180deg,rgba(251,146,60,.15),rgba(251,146,60,.05));'+
      'border:1px solid rgba(251,146,60,.4);'+
      'box-shadow:0 0 16px rgba(251,146,60,.2),0 0 0 1px rgba(251,146,60,.15) inset;'+
      'display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">'+
      '<div style="font-size:10px;color:var(--tx);line-height:1.4">'+
        '<div style="font-weight:700;color:var(--o);text-transform:uppercase;letter-spacing:1px;font-size:9px;font-family:Inter,sans-serif;margin-bottom:2px">⚠ DeFi-Wallet BURN geändert</div>'+
        '<div style="color:var(--mt)"><span style="color:var(--dm)">prev:</span> '+F(defiLastConfirmed,0)+' → <span style="color:var(--o);font-weight:600">'+F(MY_DEFI_BURN,0)+'</span> <span style="color:'+(defiDelta>0?"var(--g)":"var(--r)")+';font-weight:600">('+defiDir2+')</span></div>'+
      '</div>'+
      '<button onclick="defiConfirmChange()" style="background:linear-gradient(180deg,rgba(52,211,153,.18),rgba(52,211,153,.05));border:1px solid rgba(52,211,153,.5);color:var(--g);padding:8px 14px;border-radius:8px;font-family:Inter,sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;cursor:pointer;min-height:36px;white-space:nowrap">✓ Ich war\'s</button>'+
    '</div>';
  }

  // Confirm banner (shown only when change detected)
  var banner='';
  if(isChanged){
    var dirTxt2=totalDelta>0?"+"+F(totalDelta,0):F(totalDelta,0);
    banner='<div style="margin:-4px -2px 10px;padding:10px 12px;border-radius:10px;'+
      'background:linear-gradient(180deg,rgba(248,113,113,.15),rgba(248,113,113,.05));'+
      'border:1px solid rgba(248,113,113,.4);'+
      'box-shadow:0 0 16px rgba(248,113,113,.2),0 0 0 1px rgba(248,113,113,.15) inset;'+
      'display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">'+
      '<div style="font-size:10px;color:var(--tx);line-height:1.4">'+
        '<div style="font-weight:700;color:var(--r);text-transform:uppercase;letter-spacing:1px;font-size:9px;font-family:Inter,sans-serif;margin-bottom:2px">⚠ Balance Changed</div>'+
        '<div style="color:var(--mt)"><span style="color:var(--dm)">prev:</span> '+F(lastConfirmed,0)+' → <span style="color:var(--br);font-weight:600">'+F(totalTokens,0)+'</span> <span style="color:'+(totalDelta>0?"var(--g)":"var(--r)")+';font-weight:600">('+dirTxt2+')</span></div>'+
      '</div>'+
      '<button onclick="walConfirmChange()" style="background:linear-gradient(180deg,rgba(52,211,153,.18),rgba(52,211,153,.05));border:1px solid rgba(52,211,153,.5);color:var(--g);padding:8px 14px;border-radius:8px;font-family:Inter,sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;cursor:pointer;min-height:36px;white-space:nowrap">✓ Ich war\'s</button>'+
    '</div>';
  }

  // ─── HOODIE Bestand (Ledger) + Änderungs-Alarm (≥1 Token) ───
  var hdBalNow=(typeof _hd!=="undefined"&&_hd.bal>0)?_hd.bal:0;
  var hdBanner='',hdLine='';
  if(hdBalNow>0){
    var hdLastConf=parseFloat(localStorage.getItem("hdConfirmedBal")||"-1");
    if(hdLastConf<0){localStorage.setItem("hdConfirmedBal",hdBalNow.toString());hdLastConf=hdBalNow;}
    var hdDelta=hdBalNow-hdLastConf;
    var hdChanged=Math.abs(hdDelta)>=1;
    if(hdChanged){
      var hdKey=hdLastConf.toFixed(0)+"_"+hdBalNow.toFixed(0);
      var hdNotifKey=localStorage.getItem("hdNotifKey")||"";
      if(hdNotifKey!==hdKey){
        localStorage.setItem("hdNotifKey",hdKey);
        var hdDir=hdDelta>0?"+"+F(hdDelta,0):F(hdDelta,0);
        notify("⚠ HOODIE Bestand geändert","HOODIE: "+F(hdLastConf,0)+" → "+F(hdBalNow,0)+" ("+hdDir+"). Tap to confirm.");
        if(soundOn)beep();
      }
    }
    var hdClr=hdChanged?"var(--r)":"var(--g)";
    var hdIcon=hdChanged?'<span style="color:var(--r);font-weight:900;margin-right:4px;animation:skelPulse 1.5s ease-in-out infinite">⚠</span>':'';
    hdLine='<div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:8px;font-size:12px">'
      +'<span style="font-size:13px">🧥</span>'
      +'<span style="color:'+hdClr+';font-weight:600">'+hdIcon+F(hdBalNow,0)+' HOODIE</span>'
      +'</div>';
    if(hdChanged){
      var hdDir2=hdDelta>0?"+"+F(hdDelta,0):F(hdDelta,0);
      hdBanner='<div style="margin:-4px -2px 10px;padding:10px 12px;border-radius:10px;background:linear-gradient(180deg,rgba(248,113,113,.15),rgba(248,113,113,.05));border:1px solid rgba(248,113,113,.4);box-shadow:0 0 16px rgba(248,113,113,.2),0 0 0 1px rgba(248,113,113,.15) inset;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">'
        +'<div style="font-size:10px;color:var(--tx);line-height:1.4">'
          +'<div style="font-weight:700;color:var(--r);text-transform:uppercase;letter-spacing:1px;font-size:9px;font-family:Inter,sans-serif;margin-bottom:2px">⚠ HOODIE Bestand geändert</div>'
          +'<div style="color:var(--mt)"><span style="color:var(--dm)">prev:</span> '+F(hdLastConf,0)+' → <span style="color:var(--br);font-weight:600">'+F(hdBalNow,0)+'</span> <span style="color:'+(hdDelta>0?"var(--g)":"var(--r)")+';font-weight:600">('+hdDir2+')</span></div>'
        +'</div>'
        +'<button onclick="hdConfirmChange()" style="background:linear-gradient(180deg,rgba(52,211,153,.18),rgba(52,211,153,.05));border:1px solid rgba(52,211,153,.5);color:var(--g);padding:8px 14px;border-radius:8px;font-family:Inter,sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;cursor:pointer;min-height:36px;white-space:nowrap">✓ Ich war\'s</button>'
      +'</div>';
    }
  }

  $("walGrid").innerHTML=
    banner+
    defiBanner+
    hdBanner+
    '<div style="display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap;margin-bottom:8px">'+
      '<span style="color:'+bClr+';font-weight:600">'+(bDrop?"":"+")+F(MY_BURN,0)+' BURN</span>'+
      '<span style="color:var(--dm)">·</span>'+
      '<span style="color:'+sClr+';font-weight:600">'+(sDrop?"":"+")+F(MY_STBURN,0)+' stBURN</span>'+
      '<span style="color:var(--dm)">·</span>'+
      '<span style="color:'+totalClr+';font-weight:700">'+totalAlertIcon+F(totalTokens,0)+' Total</span>'+
      (oldDropAlert?' <span style="color:var(--r);font-weight:700">⚠ DROP</span>':'')+
    '</div>'+
    hdLine+
    '<div style="text-align:center">'+
      '<span style="font-size:9px;color:#ffffff;text-transform:uppercase;letter-spacing:1.2px;font-weight:600">BURN-Equivalent ≈</span> '+
      '<span style="color:var(--cy);font-weight:700;font-size:17px;margin-left:2px">'+F(totalBurnEq,0)+'</span>'+
      '<span style="font-size:11px;color:var(--cy);margin-left:4px;font-weight:500;opacity:.8">BURN</span>'+
      (lpBurnLeft>0?'<div style="font-size:9px;color:var(--mt);margin-top:3px;letter-spacing:.3px">incl. <span style="color:var(--b);font-weight:600">'+F(lpBurnLeft,0)+'</span> BURN in LPs</div>':'')+
      (MY_DEFI_BURN>0?'<div style="font-size:9px;color:var(--mt);margin-top:2px;letter-spacing:.3px">incl. <span style="color:var(--o);font-weight:600">'+F(MY_DEFI_BURN,0)+'</span> BURN auf DeFi-Wallet</div>':'')+
    '</div>';
  try{renderStrategy(MY_BURN,MY_STBURN,lpBurnLeft,MY_DEFI_BURN);}catch(e){console.log("strat err:",e.message);}
}

// ═══ STRATEGY COCKPIT ═══
// Visual long/mid-term plan: what I own (BURN/stBURN/equiv), what I plan to HOLD,
// what I've already SOLD (+profit), and what's FREE to deploy into LPs / further sells.
var STRAT_HOLD_TARGET=parseFloat(localStorage.getItem("strat_hold_target")||"600000");
function setStratHoldTarget(){
  var v=prompt("Wie viele BURN willst du mittelfristig (z.B. nächstes Jahr) mindestens HALTEN?\n\nAktuell: "+F(STRAT_HOLD_TARGET,0)+" BURN",STRAT_HOLD_TARGET);
  if(v===null)return;
  var n=parseFloat((v+"").replace(/[^0-9.]/g,""));
  if(n>0){STRAT_HOLD_TARGET=n;localStorage.setItem("strat_hold_target",n.toString());try{renderWal();}catch(e){}}
}
function renderStrategy(burn,stburn,lpLeft,defiBurn){
  var box=document.getElementById("stratBox");if(!box)return;
  burn=burn||0;stburn=stburn||0;lpLeft=lpLeft||0;
  var ratio=(typeof stR!=="undefined"&&stR>0)?stR:1.038;
  var price=(typeof P!=="undefined"&&P>0)?P:0;
  var avgEntry=(typeof AVG_ENTRY!=="undefined")?AVG_ENTRY:0.003682;
  // OWNERSHIP
  var stburnEq=stburn*ratio;
  var ownedEquiv=burn+stburnEq+lpLeft+(defiBurn||0); // total BURN-equivalent incl LP + DeFi-Wallet
  // SOLD
  var sold=(typeof TS!=="undefined")?TS:0;
  var soldUsdc=(typeof TR!=="undefined")?TR:0;
  var realizedProfit=soldUsdc-(sold*avgEntry);
  var avgSell=sold>0?soldUsdc/sold:0;
  // PLAN
  var holdTarget=STRAT_HOLD_TARGET;
  var surplus=Math.max(0,ownedEquiv-holdTarget); // free to sell/LP
  var holdPctOfOwned=ownedEquiv>0?Math.min(100,holdTarget/ownedEquiv*100):0;
  // VALUES at current price
  var ownedValue=ownedEquiv*price;
  var holdValue=holdTarget*price;
  var surplusValue=surplus*price;
  var unrealizedVsEntry=(price-avgEntry)*ownedEquiv;
  // "Journey" totals: originally had owned+sold
  var lifetimeBurn=ownedEquiv+sold;
  var soldPctOfLifetime=lifetimeBurn>0?(sold/lifetimeBurn*100):0;
  var heldPctOfLifetime=lifetimeBurn>0?(ownedEquiv/lifetimeBurn*100):0;

  function fmtUsd(n){return "$"+Math.round(n).toLocaleString("en");}
  function card(label,val,sub,color){
    return '<div style="flex:1;min-width:130px;background:rgba(8,12,22,.55);border:1px solid '+color+'33;border-radius:10px;padding:11px 12px">'+
      '<div style="font-size:8.5px;color:var(--dm);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">'+label+'</div>'+
      '<div style="font-size:18px;font-weight:700;color:'+color+';font-family:Geist Mono,monospace;line-height:1.1">'+val+'</div>'+
      (sub?'<div style="font-size:9px;color:var(--mt);margin-top:3px">'+sub+'</div>':'')+
    '</div>';
  }

  var html="";

  // ─── SECTION 1: Lifetime journey bar (held vs sold) ───
  html+='<div style="margin-bottom:16px">'+
    '<div style="display:flex;justify-content:space-between;font-size:9px;color:var(--dm);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px"><span>BURN-Reise gesamt</span><span>'+F(lifetimeBurn,0)+' BURN</span></div>'+
    '<div style="display:flex;height:26px;border-radius:7px;overflow:hidden;border:1px solid rgba(48,54,68,.5)">'+
      '<div style="width:'+heldPctOfLifetime.toFixed(1)+'%;background:linear-gradient(180deg,#22d3ee,#0891b2);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#04141a" title="Noch gehalten">'+(heldPctOfLifetime>12?F(ownedEquiv,0):'')+'</div>'+
      '<div style="width:'+soldPctOfLifetime.toFixed(1)+'%;background:linear-gradient(180deg,#34d399,#059669);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#04140c" title="Verkauft">'+(soldPctOfLifetime>12?F(sold,0):'')+'</div>'+
    '</div>'+
    '<div style="display:flex;justify-content:space-between;font-size:9px;margin-top:5px">'+
      '<span style="color:var(--cy)">▮ Gehalten '+heldPctOfLifetime.toFixed(0)+'%</span>'+
      '<span style="color:var(--g)">Verkauft '+soldPctOfLifetime.toFixed(0)+'% ▮</span>'+
    '</div>'+
  '</div>';

  // ─── SECTION 2: Ownership cards (both views) ───
  html+='<div style="font-size:9px;color:var(--mt);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">📦 Was ich besitze</div>';
  html+='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">'+
    card("BURN (Ledger)",F(burn,0),fmtUsd(burn*price),"#fb923c")+
    card("stBURN",F(stburn,0),"≈ "+F(stburnEq,0)+" BURN","#a78bfa")+
  '</div>';
  html+='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">'+
    card("In LPs (BURN übrig)",F(lpLeft,0),fmtUsd(lpLeft*price),"#60a5fa")+
    card("BURN-Äquiv. gesamt",F(ownedEquiv,0),fmtUsd(ownedValue),"#22d3ee")+
  '</div>';

  // ─── SECTION 2b: LP detail block ───
  var lpd=window._lpDetail||{left:lpLeft,deposited:0,sold:0,usdc:0,count:0};
  if(lpd.deposited>0||lpd.left>0){
    var lpFillPct=lpd.deposited>0?(lpd.sold/lpd.deposited*100):0;
    html+='<div style="font-size:9px;color:var(--mt);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">💧 In Liquidity-Positionen ('+lpd.count+')</div>';
    // Pro aktive Position: eigener Balken mit Range + Füllgrad (blau = BURN übrig, grün = zu USDC)
    var _ppHtml='';var _pp=(lpd.positions||[]);
    if(_pp.length){
      _ppHtml='<div style="margin-top:11px;border-top:1px solid rgba(48,54,68,.4);padding-top:9px">'+
        '<div style="font-size:8px;color:var(--dm);text-transform:uppercase;letter-spacing:.8px;margin-bottom:7px">Pro Position ('+_pp.length+') · nach Füllgrad</div>';
      for(var _pi=0;_pi<_pp.length;_pi++){
        var _p=_pp[_pi];
        var _rng=(_p.hi>9999)?"Full-Range":("$"+(+_p.lo).toFixed(3)+"–$"+(+_p.hi).toFixed(3));
        var _fw=Math.max(0,Math.min(100,_p.fill));
        _ppHtml+='<div style="margin-bottom:8px">'+
          '<div style="display:flex;justify-content:space-between;font-size:8.5px;margin-bottom:3px">'+
            '<span style="color:var(--tx);font-family:Geist Mono,monospace">'+_rng+'</span>'+
            '<span style="color:var(--mt)">'+F(_p.b,0)+' BURN · <b style="color:'+(_fw>=99?"var(--g)":"var(--cy)")+'">'+_fw.toFixed(0)+'%</b> → '+fmtUsd(_p.usdc)+'</span>'+
          '</div>'+
          '<div style="display:flex;height:10px;border-radius:5px;overflow:hidden;border:1px solid rgba(48,54,68,.5)">'+
            '<div style="width:'+(100-_fw).toFixed(1)+'%;background:linear-gradient(180deg,#60a5fa,#2563eb)" title="BURN übrig (verkaufbar)"></div>'+
            '<div style="width:'+_fw.toFixed(1)+'%;background:linear-gradient(180deg,#34d399,#059669)" title="schon zu USDC"></div>'+
          '</div>'+
        '</div>';
      }
      _ppHtml+='</div>';
    }
    html+='<div style="background:rgba(8,12,22,.55);border:1px solid rgba(96,165,250,.25);border-radius:10px;padding:12px;margin-bottom:16px">'+
      '<div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:7px"><span style="color:var(--mt)">Eingezahlt: <b style="color:var(--o)">'+F(lpd.deposited,0)+'</b> BURN</span><span style="color:var(--mt)">'+lpFillPct.toFixed(0)+'% gefüllt</span></div>'+
      '<div style="display:flex;height:20px;border-radius:6px;overflow:hidden;border:1px solid rgba(48,54,68,.5)">'+
        '<div style="width:'+(100-lpFillPct).toFixed(1)+'%;background:linear-gradient(180deg,#60a5fa,#2563eb);display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:#fff" title="BURN übrig (verkaufbar)">'+((100-lpFillPct)>18?F(lpd.left,0)+' BURN':'')+'</div>'+
        '<div style="width:'+lpFillPct.toFixed(1)+'%;background:linear-gradient(180deg,#34d399,#059669);display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:#04140c" title="schon zu USDC">'+(lpFillPct>18?fmtUsd(lpd.usdc):'')+'</div>'+
      '</div>'+
      '<div style="display:flex;justify-content:space-between;font-size:9px;margin-top:6px">'+
        '<span style="color:#60a5fa">▮ '+F(lpd.left,0)+' BURN übrig</span>'+
        '<span style="color:var(--g)">verkauft → '+fmtUsd(lpd.usdc)+' ▮</span>'+
      '</div>'+
      _ppHtml+
    '</div>';
  }

  // ─── SECTION 3: Hold plan ───
  html+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'+
    '<span style="font-size:9px;color:var(--mt);text-transform:uppercase;letter-spacing:1px">🎯 Mein Hold-Plan</span>'+
    '<button onclick="setStratHoldTarget()" style="background:rgba(167,139,250,.15);border:1px solid rgba(167,139,250,.4);color:#a78bfa;font-size:9px;padding:4px 10px;border-radius:6px;cursor:pointer;font-weight:600">Ziel ändern</button>'+
  '</div>';
  // Hold target bar: how much of owned is "locked for hold" vs "surplus/free"
  var holdFillPct=ownedEquiv>0?Math.min(100,holdTarget/ownedEquiv*100):0;
  var surplusPct=100-holdFillPct;
  html+='<div style="background:rgba(8,12,22,.55);border:1px solid rgba(167,139,250,.25);border-radius:10px;padding:12px;margin-bottom:8px">'+
    '<div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:7px"><span style="color:var(--mt)">Halten-Ziel: <b style="color:#a78bfa">'+F(holdTarget,0)+'</b></span><span style="color:var(--mt)">Besitz: <b style="color:var(--cy)">'+F(ownedEquiv,0)+'</b></span></div>'+
    '<div style="display:flex;height:22px;border-radius:6px;overflow:hidden;border:1px solid rgba(48,54,68,.5)">'+
      '<div style="width:'+holdFillPct.toFixed(1)+'%;background:linear-gradient(180deg,#a78bfa,#7c3aed);display:flex;align-items:center;justify-content:center;font-size:8.5px;font-weight:700;color:#fff" title="Halten">'+(holdFillPct>15?'HALTEN':'')+'</div>'+
      '<div style="width:'+surplusPct.toFixed(1)+'%;background:linear-gradient(180deg,#34d399,#059669);display:flex;align-items:center;justify-content:center;font-size:8.5px;font-weight:700;color:#04140c" title="Frei">'+(surplusPct>15?'FREI':'')+'</div>'+
    '</div>'+
    (ownedEquiv>=holdTarget?
      '<div style="font-size:10px;color:var(--g);margin-top:8px">✓ Ziel erreicht — <b>'+F(surplus,0)+' BURN frei</b> ('+fmtUsd(surplusValue)+') für LPs / Verkäufe</div>':
      '<div style="font-size:10px;color:var(--o);margin-top:8px">⚠ Noch <b>'+F(holdTarget-ownedEquiv,0)+' BURN</b> unter Ziel — aktuell nichts frei zum Verkaufen</div>')+
  '</div>';

  // ─── SECTION 4: Free-to-deploy + sold/profit cards ───
  html+='<div style="font-size:9px;color:var(--mt);text-transform:uppercase;letter-spacing:1px;margin:14px 0 8px">💰 Verkauft & Frei</div>';
  html+='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">'+
    card("Frei verfügbar",F(surplus,0),fmtUsd(surplusValue)+" @ Spot","#34d399")+
    card("Schon verkauft",F(sold,0),fmtUsd(soldUsdc)+" erhalten","#f59e0b")+
  '</div>';
  html+='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">'+
    card("Realisierter Gewinn",fmtUsd(realizedProfit),"Ø Verkauf $"+avgSell.toFixed(4),"#34d399")+
    card("Unrealisiert (vs Entry)",fmtUsd(unrealizedVsEntry),"bei Spot $"+price.toFixed(4),price>avgEntry?"#22d3ee":"#f87171")+
  '</div>';

  // ─── SECTION 5: Price scenarios for held stack (REALISTIC exit value) ───
  html+='<div style="font-size:9px;color:var(--mt);text-transform:uppercase;letter-spacing:1px;margin:14px 0 8px">📈 Realer Wert meines Hold-Stacks bei Preis X</div>';
  html+='<div style="background:rgba(8,12,22,.55);border:1px solid rgba(48,54,68,.4);border-radius:10px;padding:10px">';
  var scenarios=[0.50,1.00,2.00,5.00];
  html+='<div style="display:flex;flex-direction:column;gap:9px">';
  scenarios.forEach(function(sp){
    var book=holdTarget*sp;
    var rv=(typeof holdStackRealValue==="function")?holdStackRealValue(holdTarget,sp):null;
    var real=(rv&&rv.model==="v3")?rv.real:book;
    var avgP=(rv&&rv.model==="v3"&&rv.avgPrice>0)?rv.avgPrice:sp;
    var isModel=(rv&&rv.model==="v3");
    var pctOfBook=book>0?(real/book*100):0;
    var barW=Math.min(100,sp/5.00*100);
    var realBarW=book>0?Math.min(100,real/book*barW):0; // green fill scaled to realistic fraction
    html+='<div>'+
      '<div style="display:flex;align-items:center;gap:8px">'+
        '<span style="font-size:10px;color:var(--tx);width:42px;font-family:Geist Mono,monospace">$'+sp.toFixed(2)+'</span>'+
        '<div style="flex:1;height:16px;background:rgba(8,12,22,.6);border-radius:4px;overflow:hidden;position:relative">'+
          '<div style="position:absolute;top:0;left:0;height:100%;width:'+barW.toFixed(0)+'%;background:rgba(167,139,250,.18);border-radius:4px"></div>'+
          '<div style="position:absolute;top:0;left:0;height:100%;width:'+realBarW.toFixed(0)+'%;background:linear-gradient(90deg,#22d3ee,#34d399);border-radius:4px"></div>'+
        '</div>'+
        '<span style="font-size:10px;color:var(--g);width:78px;text-align:right;font-family:Geist Mono,monospace;font-weight:600">'+fmtUsd(real)+'</span>'+
      '</div>'+
      '<div style="display:flex;align-items:center;gap:8px;margin-top:2px;padding-left:50px">'+
        '<span style="font-size:8px;color:var(--dm);flex:1">Buchwert <span style="text-decoration:line-through">'+fmtUsd(book)+'</span>'+(isModel?' · real Ø $'+avgP.toFixed(4)+' ('+pctOfBook.toFixed(0)+'%)':'')+'</span>'+
      '</div>'+
    '</div>';
  });
  html+='</div>';
  html+='<div style="font-size:8.5px;color:var(--dm);margin-top:8px;text-align:center;line-height:1.5">'+
    '<span style="color:var(--g)">Grün</span> = realer Verkaufserlös für '+F(holdTarget,0)+' BURN, wenn der Preis durch echte Käufe auf $X getrieben wäre und du dann verkaufst.<br>'+
    '<span style="color:var(--dm)">Modell: heutige Pool-Tiefe + nötiges Kaufvolumen. Kein Zukunfts-Orakel — bei höheren Preisen kämen real neue LPs dazu.</span></div>';
  html+='</div>';

  box.innerHTML=html;
}


// Confirm HOODIE balance change (resets baseline, stops the alarm).
function hdConfirmChange(){
  try{
    if(typeof _hd!=="undefined"&&_hd.bal>0)localStorage.setItem("hdConfirmedBal",_hd.bal.toString());
    localStorage.removeItem("hdNotifKey");
    renderWal();
  }catch(e){console.log("hdConfirm err:",e&&e.message);}
}

function walConfirmChange(){
  var totalNow=MY_BURN+MY_STBURN;
  localStorage.setItem("walConfirmedTotal",totalNow.toString());
  localStorage.removeItem("walNotifKey");
  // Sync to Hetzner server (so monitor stops alerting)
  try{
    fetch("https://95-216-152-31.sslip.io/wallet/confirm",{method:"POST",mode:"cors"})
      .then(function(r){return r.json();})
      .then(function(d){console.log("server confirm:",d);})
      .catch(function(e){console.log("server confirm sync failed (browser blocks HTTP, APK ok):",e&&e.message);});
  }catch(e){}
  try{renderWal();}catch(e){}
}

// Confirm DeFi-wallet BURN change (resets baseline, stops the alarm).
function defiConfirmChange(){
  localStorage.setItem("defiConfirmedBurn",MY_DEFI_BURN.toString());
  localStorage.removeItem("defiNotifKey");
  // Sync to Hetzner server (so the monitor stops alerting too)
  try{
    fetch("https://95-216-152-31.sslip.io/defi/confirm",{method:"POST",mode:"cors"})
      .then(function(r){return r.json();})
      .then(function(d){console.log("server defi confirm:",d);})
      .catch(function(e){console.log("server defi confirm sync failed (browser blocks HTTP, APK ok):",e&&e.message);});
  }catch(e){}
  try{renderWal();}catch(e){}
}
function fetchServerWalletState(){
  try{
    fetch("https://95-216-152-31.sslip.io/wallet/state",{mode:"cors"})
      .then(function(r){return r.json();})
      .then(function(d){
        if(!d||d.error)return;
        // Sync confirmed_total — but DON'T overwrite a locally-known baseline on every load.
        // If we already have a local confirmed total, keep it so the app can detect deviations
        // against the real on-chain balance. Only seed from server if we have nothing yet.
        // (Previously "server wins" wiped the baseline → -100 BURN changes went undetected.)
        var localConfirmed=localStorage.getItem("walConfirmedTotal");
        if(d.confirmed_total>0&&(!localConfirmed||parseFloat(localConfirmed)<=0)){
          localStorage.setItem("walConfirmedTotal",d.confirmed_total.toString());
        }
        // DeFi-wallet baseline: adopt the SERVER's confirmed baseline as source of truth.
        // The server runs 24/7 and tracks the last confirmed DeFi balance. By using its
        // defi_confirmed as our baseline, an unconfirmed change the server saw (its defi_alarm)
        // surfaces in the app too — even if the change happened while the app was closed.
        // (We only adopt downward/equal or when local is empty, so a locally-confirmed higher
        // baseline isn't wiped — mirrors the ledger's conservative seeding.)
        var localDefiConfirmed=localStorage.getItem("defiConfirmedBurn");
        if(typeof d.defi_confirmed!=="undefined"&&d.defi_confirmed>=0){
          if(localDefiConfirmed===null||localDefiConfirmed===""){
            localStorage.setItem("defiConfirmedBurn",d.defi_confirmed.toString());
          }else if(d.defi_alarm===true){
            // Server flags an open DeFi change → align our baseline to the server's confirmed
            // value so renderWal() shows the same alarm (prev → current) instead of silence.
            localStorage.setItem("defiConfirmedBurn",d.defi_confirmed.toString());
          }
        }
        // ETH balance: take higher value (server vs local cache)
        if(d.eth>0&&typeof ptfAssets!=="undefined"){
          for(var i=0;i<ptfAssets.length;i++){
            if(ptfAssets[i].id==="eth"&&d.eth>ptfAssets[i].amount){
              // Use safe update: scales cost on decrease, holds cost on increase (avgEntry recomputed)
              ptfSafeSetAmount(ptfAssets[i],d.eth,{amountOnly:true});
            }
          }
          try{ptfSave();ptfRenderTable();}catch(e){}
        }
        try{renderWal();}catch(e){}
        console.log("server wallet state hydrated:",d);
      })
      .catch(function(e){console.log("server state fetch failed (browser blocks HTTP, APK ok):",e&&e.message);});
  }catch(e){}
}

// ═══ FETCH: Live LP Positions (DeFi wallet NFTs) ═══
async function fetchLPs(){
  try{
    // FALLBACK ONLY: scanLiqMap() is the primary source for LP[] (single source of truth).
    // Runs only as bootstrap before the first full pool scan, so the "My Active LP" table
    // shows something on cold start. Once scanLiqMap runs, it owns LP[] (avoids two-scan drift).
    if(window._lmapRanges&&window._lmapRanges.length>0&&lpLive){return;}
    var nH=await rpc(WT_NFT,bof(W_DEFI));var nC=parseInt(nH,16);if(nC>50)nC=50;
    if(nC<=0)return;
    var newLP=[],bLow=BURN_TK.toLowerCase(),uLow=USDC_TK.toLowerCase();
    for(var i=0;i<nC;i++){
      try{
        var tH=await wtRpc(WT_NFT,"0x2f745c59"+W_DEFI.slice(2).toLowerCase().padStart(64,"0")+wtPad(i));
        if(!tH)continue;
        var tId=BigInt("0x"+tH.slice(2));
        var pH=await wtRpc(WT_NFT,"0x99fbab88"+wtPad(tId));
        if(!pH||pH.length<770)continue;
        var d=pH.slice(2);
        var t0="0x"+d.slice(152,192),t1="0x"+d.slice(216,256);
        if(t0.toLowerCase()!==uLow||t1.toLowerCase()!==bLow)continue;
        var tL=wtI24(d.slice(378,384)),tU=wtI24(d.slice(442,448));
        var liq=BigInt("0x"+d.slice(448,512));
        if(liq<=0n)continue;
        var pHi=wtTickToPrice(tL),pLo=wtTickToPrice(tU);
        if(pLo<=0||pHi<=pLo)continue;
        var bDep=wtLiqToBurn(Number(liq),tL,tU);
        if(bDep<=0)continue;
        newLP.push({b:Math.round(bDep),lo:Math.round(pLo*1000000)/1000000,hi:Math.round(pHi*1000000)/1000000,label:"Sell"}); // COHERENCE v3: tick-exact bounds (4-dec rounding shifted fill by up to 5% in 0.1-cent ranges)
      }catch(e2){window._lpScanErrs=(window._lpScanErrs||0)+1;continue;}
    }
    // Leeres Ergebnis zaehlt, wenn der Scan fehlerfrei lief (kein RPC-Fehler):
    // dann sind wirklich alle eigenen Positionen zu -> Anzeige leeren statt einfrieren.
    if(newLP.length===0&&!window._lpScanErrs){
      try{detectClosedLPs(newLP);}catch(e){}
      var daoOnly=null;for(var d0=0;d0<LP.length;d0++){if(LP[d0].fr)daoOnly=LP[d0];}
      LP=daoOnly?[daoOnly]:[];ALP=0;lpLive=true;
      lpPrevious=[];
      try{localStorage.setItem("lp_cache",JSON.stringify({lps:[],ts:Date.now()}));}catch(e){}
      try{localStorage.setItem("lp_previous","[]");}catch(e){}
      console.log("LP[] cleared: keine eigenen aktiven Positionen mehr");
      if(P>0)render();
    }
    window._lpScanErrs=0;
    if(newLP.length>0){
      // Detect closed LPs before overwriting LP[]
      try{detectClosedLPs(newLP);}catch(e){console.log("detectClose err:",e);}
      // Detect NEW LP mints (in newLP but not in lpPrevious)
      try{detectNewLPMints(newLP);}catch(e){console.log("detectMint err:",e);}
      // Keep DAO Full Range, replace user LPs
      var dao=null;for(var di=0;di<LP.length;di++){if(LP[di].fr)dao=LP[di];}
      newLP.sort(function(a,b){return a.lo-b.lo;});
      LP=newLP;if(dao)LP.push(dao);
      LP.sort(function(a,b){if(a.fr)return 1;if(b.fr)return-1;return a.lo-b.lo;});
      ALP=0;for(var ai2=0;ai2<LP.length;ai2++)if(!LP[ai2].fr)ALP+=LP[ai2].b;
      lpLive=true;
      console.log("LP[] updated from chain:",newLP.length,"positions, ALP="+ALP);
      // Cache LP[] (excl DAO) so BURN-Equivalent shows correct value instantly on next app start
      try{
        var lpCache=LP.filter(function(lp){return!lp.fr;}).map(function(lp){
          return{b:lp.b,lo:lp.lo,hi:lp.hi,label:lp.label||""};
        });
        localStorage.setItem("lp_cache",JSON.stringify({lps:lpCache,ts:Date.now()}));
      }catch(e){}
      // Save state for next close detection — use EXACT pool price (not DexScreener spot)
      // so the captured left/usdc match Uniswap. This is what a partial close books as
      // returned BURN + received USDC, so it must be the on-chain-accurate value.
      var _ppPrev=poolPriceExact();
      lpPrevious=LP.filter(function(lp){return!lp.fr;}).map(function(lp){
        var cv2=v3(lp.b,lp.lo,lp.hi,_ppPrev);
        return{b:lp.b,lo:lp.lo,hi:lp.hi,left:cv2.left,usdc:cv2.usdc,pct:cv2.pct,ts:Date.now()};
      });
      try{localStorage.setItem("lp_previous",JSON.stringify(lpPrevious));}catch(e){}
      if(P>0)render();
    }
  }catch(e){console.log("fetchLPs err:",e);}}

function sts(s){var t=new Date().toLocaleTimeString();$("sts").innerHTML=s==="err"?'<span class="dot" style="background:var(--r)"></span>'+t:'<span class="live-dot" style="background:var(--g)"></span>'+t;}
function set(x,y,src){X=x;Y=y;K=x*y;P=y/x;SRC=src;if(P>0)cache.P=P;hst.push(P);if(hst.length>120)hst.shift();if(K>0&&P>0){$("main").classList.remove("hid");render();saveOffline();}}

function doMan(){var x=parseFloat($("mx").value),y=parseFloat($("my").value);
  if(x>0&&y>0){$("mp").innerHTML='<span style="color:var(--br);font-weight:600">'+FP(y/x)+'</span>';set(x,y,"manual");}else $("mp").innerHTML="";}

// ═══════════════════════════════════════════════════════
// RENDER
// ═══════════════════════════════════════════════════════
function render(){
  var d=RAW||{},vol=parseFloat(d.volume&&d.volume.h24)||0,pct=parseFloat(d.priceChange&&d.priceChange.h24)||0;
  var b24=(d.txns&&d.txns.h24&&d.txns.h24.buys)||0,s24=(d.txns&&d.txns.h24&&d.txns.h24.sells)||0;
  var m5v=parseFloat(d.volume&&d.volume.m5)||0;

  // PRICE CIRCLES
  $("dPrice").textContent=P>0?FP(P):"";
  if(P<=0)$("dPrice").innerHTML='<span class="skel" style="width:100px;height:22px"></span>';
  var ptfPart=typeof ptfTotalDisplay==="number"&&ptfTotalDisplay>0?" | $"+F(ptfTotalDisplay,0):"";
  document.title=P>0?FP(P)+ptfPart+" | My Crypto Portfolio":"My Crypto Portfolio";
  // Pulse on price change
  if(prevPrice>0&&P!==prevPrice){var orbEl=document.querySelector(".orb-main");if(orbEl){orbEl.classList.remove("orb-pulse");void orbEl.offsetWidth;orbEl.classList.add("orb-pulse");}}
  $("dPct").innerHTML=pct?(pct>=0?"▲":"▼")+" "+Math.abs(pct).toFixed(2)+"%":"";
  $("dPct").style.color=pct>=0?"var(--g)":"var(--r)";
  // stBURN: only show when ratio is confirmed
  if(stOK){
    $("stPrice").textContent=FP(P*stR);
    $("stPriceSub").textContent="via "+stSrc;
    $("dRatio").textContent=stR.toFixed(6);
  }else{
    $("stPrice").innerHTML='<span class="skel" style="width:80px;height:18px"></span>';
    $("stPriceSub").textContent="loading";
    $("dRatio").innerHTML='<span class="skel" style="width:80px;height:18px"></span>';
  }
  $("dSrc").innerHTML=TG(SRC==="api"?"✓ LIVE":"◇ "+SRC,SRC==="api"?"#34d399":"#fb923c");

  // Sparkline — prefers 30-day history from GeckoTerminal, falls back to session hst[]
  var sparkData=null,sparkLabel="";
  if(burn30d&&burn30d.length>=7){
    sparkData=burn30d.map(function(d){return d.p;});
    if(P>0)sparkData.push(P); // append today's live price
    sparkLabel="30d";
  } else if(hst.length>=2){
    sparkData=hst;
    sparkLabel="session";
  }
  if(sparkData&&sparkData.length>=2){
    var mn=Math.min.apply(null,sparkData),mx2=Math.max.apply(null,sparkData),rg=mx2-mn||mn*.01;
    var sw=300,sh=60,co=[];
    for(var si=0;si<sparkData.length;si++)co.push(((si/(sparkData.length-1))*sw).toFixed(1)+","+(sh-((sparkData[si]-mn)/rg)*(sh-8)-4).toFixed(1));
    var sparkColor=sparkData[sparkData.length-1]>=sparkData[0]?"var(--g)":"var(--r)";
    var lastPt=co[co.length-1].split(",");
    // Build SVG with gradient fill area + line + endpoint dot
    var areaPath="M0,"+sh+" L"+co.join(" L")+" L"+sw+","+sh+" Z";
    $("spark").innerHTML='<div style="position:relative"><svg viewBox="0 0 '+sw+' '+sh+'" preserveAspectRatio="none" style="width:100%;height:50px;display:block">'+
      '<defs><linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="'+sparkColor+'" stop-opacity=".25"/><stop offset="100%" stop-color="'+sparkColor+'" stop-opacity="0"/></linearGradient></defs>'+
      '<path d="'+areaPath+'" fill="url(#sparkGrad)"/>'+
      '<polyline points="'+co.join(" ")+'" fill="none" stroke="'+sparkColor+'" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" filter="drop-shadow(0 0 4px '+sparkColor+')"/>'+
      '<circle cx="'+lastPt[0]+'" cy="'+lastPt[1]+'" r="2.5" fill="'+sparkColor+'"><animate attributeName="r" values="2.5;5;2.5" dur="2s" repeatCount="indefinite"/></circle>'+
      '</svg>'+
      '<div style="display:flex;justify-content:space-between;font-size:8px;color:var(--dm);margin-top:2px;letter-spacing:1px;text-transform:uppercase;opacity:.7">'+
        '<span>'+FP(mn)+'</span><span>'+sparkLabel+' · '+sparkData.length+'pt</span><span>'+FP(mx2)+'</span>'+
      '</div></div>';
  }

  // NEXT FILL — show LP with lowest hi above current price (next to be fully filled)
  var nxtFill="";
  if(P>0){
    var Pnf=pxUnified(); // COHERENCE: exact pool price (fresh) for fill; spot (P) still drives pool buyflow
    var bestNf=null,bestHi=Infinity;
    for(var nf=0;nf<LP.length;nf++){if(LP[nf].fr)continue;
      // LP's hi must be above current pool price (not yet filled). Pick lowest hi.
      if(LP[nf].hi>Pnf&&LP[nf].hi<bestHi){bestHi=LP[nf].hi;bestNf=nf;}}
    if(bestNf!==null){var nfDist=((LP[bestNf].hi-Pnf)/Pnf*100);
      var nfBuy=0,nfSrc="";
      var nfEst=buyflowEstimate(P,LP[bestNf].hi);
      nfBuy=nfEst.usdc;nfSrc=nfEst.src;
      console.log("NEXTFILL:","P=$"+P.toFixed(4),"target=$"+LP[bestNf].hi.toFixed(2),"src="+nfSrc+(lmapCache&&lmapCache.length>0?" ("+lmapCache.length+" buckets)":""),"K="+K.toFixed(0),"Y="+Y.toFixed(0),"nfBuy=$"+nfBuy.toFixed(0));
      // Sanity: cap absurd values (>$10M) — likely DAO full-range pollution in lmap buckets
      if(!isFinite(nfBuy)||nfBuy<0)nfBuy=0;
      if(nfBuy>10000000){console.log("NEXTFILL: capped from $"+nfBuy.toFixed(0)+" — likely DAO full-range pollution");nfBuy=0;}
      var nfV=v3(LP[bestNf].b,LP[bestNf].lo,LP[bestNf].hi,LP[bestNf].hi);
      // ── ZWEI GETRENNTE METRIKEN (vorher vermischt → Zahlen gingen nicht auf) ──
      // METRIK 1 (position-spezifisch): wie viel USDC noch in MEINE Position fließt bis 100%.
      //   = IF_FILLED.usdc − NOW.usdc. Konsistent mit der LP-Tabelle.
      var nfNow=v3(LP[bestNf].b,LP[bestNf].lo,LP[bestNf].hi,Pnf);
      var nfPosRemaining=Math.max(0,nfV.usdc-nfNow.usdc);
      var nfBurnLeft=Math.max(0,nfNow.left);
      var nfFillPct=nfV.usdc>0?(nfNow.usdc/nfV.usdc*100):0;
      // METRIK 2 (pool-weit): wie viel USDC ein Käufer TOTAL reinpumpen muss um Spot→hi zu treiben.
      //   Verteilt sich auf ALLE LPs (deine + DAO Full-Range + andere) → immer ≥ Metrik 1.
      //   Das ist nfBuy (buyflowEstimate), oben bereits berechnet + gegen DAO-Pollution gecappt.
      var nfPoolValid=(nfBuy>0&&isFinite(nfBuy));
      // Is this position even ACTIVE yet? A single-sided BURN LP only starts filling once the
      // price reaches its lower bound (lo). If price is still BELOW lo, it holds 100% BURN and
      // is "waiting" — show how much buy-pressure is needed just to ACTIVATE it (reach lo).
      // "Not active" = price still below the position's lower bound. Use a tiny tolerance so a
      // sub-tick rounding difference (e.g. price 0.17640 vs lo 0.17642) doesn't flip it to
      // "not active" when it's effectively at the boundary.
      // "Not active" = price still below the position's lower bound. Use the MORE CURRENT price:
      // Pnf (pool-derived) can be stale when offline, while P (spot from DexScreener) may be fresher.
      // Take the higher of the two so a position that's actually active isn't shown as "waiting".
      var pActive=Math.max(Pnf,P);
      var nfNotActive=(pActive < LP[bestNf].lo*0.999);
      var nfActBuy=0,nfActValid=false,nfActDist=0;
      if(nfNotActive){
        nfActDist=((LP[bestNf].lo-pActive)/pActive*100);
        var nfActEst=buyflowEstimate(P,LP[bestNf].lo);
        nfActBuy=nfActEst.usdc;
        if(!isFinite(nfActBuy)||nfActBuy<0)nfActBuy=0;
        if(nfActBuy>10000000)nfActBuy=0;
        nfActValid=(nfActBuy>0&&isFinite(nfActBuy));
      }
      nxtFill='<div style="line-height:1.7">'+
        '<div style="margin-bottom:6px">Next Fill: <b style="color:var(--o)">$'+LP[bestNf].hi.toFixed(3)+'</b> '+
          '<span style="color:var(--tx)">(↑'+nfDist.toFixed(0)+'%)</span> · '+
          (nfNotActive
            ?'<span style="color:var(--warn)">⏳ noch nicht aktiv</span>'
            :'<span style="color:'+(nfFillPct>=90?"var(--g)":"var(--cy)")+'">'+nfFillPct.toFixed(0)+'% gefüllt</span>')+'</div>'+
        // If not active yet: show the activation threshold (buy-pressure to reach lo) FIRST.
        (nfNotActive?
          '<div style="font-size:11px;margin-bottom:3px;background:rgba(251,191,36,.08);border-left:2px solid var(--warn);padding:3px 8px;border-radius:0 4px 4px 0">'+
            '<span style="color:var(--warn)">➜ Aktiviert sich bei $'+LP[bestNf].lo.toFixed(4)+'</span> '+
            '<span style="color:var(--tx)">(↑'+nfActDist.toFixed(1)+'%)</span>'+
            (nfActValid?'<br><span style="color:var(--tx)">nötiger Kaufdruck bis dahin:</span> <b style="color:var(--warn)">$'+F(nfActBuy,0)+'</b>':'')+'</div>'
          :'')+
        // Metrik 1 — meine Position
        '<div style="font-size:11px;margin-bottom:3px">'+
          '<span style="color:var(--tx)">➜ In meine Position:</span> '+
          '<b style="color:var(--cy)">$'+F(nfPosRemaining,0)+'</b> '+
          '<span style="color:var(--dm)">('+F(nfBurnLeft,0)+' BURN bis voll'+(nfNotActive?', ab Aktivierung':'')+')</span></div>'+
        // Metrik 2 — pool-weiter Kaufdruck
        (nfPoolValid?
          '<div style="font-size:11px;margin-bottom:3px">'+
            '<span style="color:var(--tx)">➜ Pool-Kaufdruck bis $'+LP[bestNf].hi.toFixed(3)+':</span> '+
            '<b style="color:#a78bfa">$'+F(nfBuy,0)+'</b> '+
            '<span style="color:var(--dm)">(alle LPs inkl. DAO)</span></div>'
          :'')+
        // Ertrag bei Fill
        '<div style="font-size:11px">'+
          '<span style="color:var(--tx)">➜ Ertrag bei voll:</span> '+
          '<b style="color:var(--g)">$'+nfV.usdc.toLocaleString("en",{maximumFractionDigits:0})+'</b> '+
          '<span style="color:var(--dm)">('+F(LP[bestNf].b,0)+' BURN Position)</span></div>'+
      '</div>';}}
  var _ownLp=0;for(var _ol=0;_ol<LP.length;_ol++)if(!LP[_ol].fr)_ownLp++;
  $("nextFill").innerHTML=nxtFill||(_ownLp===0?'<span style="color:var(--dm)">🪜 Keine aktiven LPs — Leiter legen, wenn der nächste Zyklus startet</span>':'<span style="color:var(--g)">All active positions filled ✓</span>');

  // P&L ACTIVE (compute early, needed by portfolio + P&L section)
  var Pux=pxUnified(); // COHERENCE: same price as LP table & renderLpPnl (was: spot P)
  var pD=0,pL=0,pU=0,maxU=0;for(var pi=0;pi<LP.length;pi++){if(LP[pi].fr)continue;var pv=v3(LP[pi].b,LP[pi].lo,LP[pi].hi,Pux);pD+=LP[pi].b;pL+=pv.left;pU+=pv.usdc;var pf=v3(LP[pi].b,LP[pi].lo,LP[pi].hi,LP[pi].hi);maxU+=pf.usdc;}
  var lpV=pL*Pux+pU,hdV=pD*Pux,il=lpV-hdV,ilP=hdV>0?(il/hdV*100):0;
  var outU=maxU-pU,fillPct=maxU>0?(pU/maxU*100):0;

  // PORTFOLIO (unified) — TOTAL_BURN_EQUIVALENT is the single source of truth
  var bEq=MY_STBURN*stR;
  var TOTAL_BURN_EQ=MY_BURN+bEq+pL;
  var portUsd=TOTAL_BURN_EQ*P+pU;
  var mult=P>0&&AVG_ENTRY>0?P/AVG_ENTRY:0;
  // Group 1 — BURN + stBURN (top, key holdings)
  if(wal.ok||MY_BURN>0){
    $("portG1").innerHTML=[
      MB("BURN",F(MY_BURN,0),"var(--o)"),
      MB("stBURN",F(MY_STBURN,0),"var(--p)")
    ].join("");
  }
  // Group 2 — Entry / Current Price
  $("portG2").innerHTML=[
    '<div class="mb" style="padding:14px"><small style="color:#fff">AVG ENTRY</small><b class="neon-w" style="color:#fff;font-size:18px;font-weight:700;display:block">$'+AVG_ENTRY.toFixed(4)+'</b><span style="font-size:9px;color:var(--mt);display:block;margin-top:2px">$'+F(INVESTED,0)+' invested</span></div>',
    '<div class="mb" style="padding:14px"><small style="color:#fff">CURRENT PRICE</small><b class="key-val" style="color:'+(P>=AVG_ENTRY?"var(--g)":"var(--r)")+'">'+FP(P)+'</b></div>'
  ].join("");
  // Group 3 — Multiple + LP Left
  if(wal.ok||MY_BURN>0){
    $("portG3").innerHTML=[
      '<div class="mb" style="padding:14px"><small style="color:#fff">MULTIPLE</small><b class="key-val" style="color:'+(mult>=10?"var(--g)":mult>=2?"var(--o)":"var(--tx)")+'">'+(mult>0?mult.toFixed(1)+"x":"…")+'</b></div>',
      MB("LP Left",F(pL,0),"var(--b)")
    ].join("");
  }
  // Portfolio Real — V3 sell impact via lmapCache (always uses live data when available)
  var realSellUsdc=0,realImpact=0,realSrc="V2";
  if(TOTAL_BURN_EQ>0){
    if(lmapCache&&lmapCache.length>0){
      var v3SellPort=v3SellImpact(TOTAL_BURN_EQ);
      if(v3SellPort){
        realSellUsdc=v3SellPort.usdc;
        realSrc="V3";
      }else if(X>0&&K>0){
        var newX=X+TOTAL_BURN_EQ,newY=K/newX;realSellUsdc=Y-newY;
      }
    }else if(X>0&&K>0){
      var newX2=X+TOTAL_BURN_EQ,newY2=K/newX2;realSellUsdc=Y-newY2;
    }
    realImpact=portUsd>0?((realSellUsdc+pU-portUsd)/portUsd*100):0;
  }
  var portReal=realSellUsdc+pU;
  // Group 4 — Portfolio (paper) + Portfolio Real (with realized as subtitle)
  if(wal.ok||MY_BURN>0){
    var realizedProfit=TR-(TS*AVG_ENTRY);
    var realizedSubtitle=realizedProfit>0?'+$'+F(realizedProfit,0)+' realized · ':'';
    $("portG4").innerHTML=[
      '<div class="mb"><small>PORTFOLIO</small><b class="key-val neon-w" style="color:var(--br)">$'+F(portUsd,0)+'</b><span style="font-size:9px;color:var(--mt);display:block;margin-top:2px">on paper</span></div>',
      '<div class="mb"><small>PORTFOLIO REAL</small><b class="key-val neon-cy" style="color:var(--cy)">$'+F(portReal,0)+'</b><span style="font-size:9px;color:var(--mt);display:block;margin-top:2px">'+realizedSubtitle+realImpact.toFixed(0)+'% slippage <span style="color:var(--dm);font-size:8px">'+realSrc+'</span></span></div>'
    ].join("");
  }

  // stBURN Yield (yield value emphasized — stBURN count removed (already shown in Group 1))
  if(stOK){
    var stV=bEq*P,stY=bEq-MY_STBURN,stYP=MY_STBURN>0?(stY/MY_STBURN*100):0;
    $("stGrid").innerHTML=[MB("Ratio "+(stSrc==="chain"?"⛓":"◇"),stR.toFixed(6),"var(--cy)"),
      MB("BURN Equiv",F(bEq,0),"var(--o)")].join("")+
      '<div class="mb"><small>YIELD</small><b class="yield-big neon-g" style="color:'+(stY>=0?"var(--g)":"var(--r)")+'">+'+(stY>=0?F(stY,0):0)+' BURN</b></div>'+
      [MB("Yield $","$"+F(stY*P,0),stY>=0?"var(--g)":"var(--r)"),MB("Yield %",stYP.toFixed(2)+"%",stYP>=0?"var(--g)":"var(--r)")].join("");
  }

  // P&L ACTIVE (display)
  var maxHi=0;for(var mh=0;mh<LP.length;mh++){if(!LP[mh].fr&&LP[mh].hi>maxHi)maxHi=LP[mh].hi;}
  var lpExposure=portUsd>0?(lpV/portUsd*100):0;
  // P&L Hero: USDC Earned
  var _hdLine='';
  if(window._hdMy&&window._hdMy.ready&&window._hdMy.eth>0.5){
    _hdLine='<div style="font-size:10px;color:var(--cy);margin-top:4px">+ 🧥 HOODIE-LP ETH-Seite: $'+F(window._hdMy.eth,0)+' ('+F(window._hdMy.hd,0)+' HD warten)</div>'
      +'<div style="font-size:12px;color:var(--g);margin-top:4px;font-weight:700">Σ Gesamt (BURN + HOODIE LP): $'+F(pU+window._hdMy.eth,2)+'</div>';
  }
  $("pnlHero").innerHTML='<div class="mb" style="padding:16px;text-align:center"><small>USDC EARNED</small><b class="key-val neon-g" style="color:var(--g)">$'+F(pU,2)+'</b>'+_hdLine+'</div>';
  // P&L Grid
  $("pnlGrid").innerHTML=[MB("Deposited",F(pD,0)+" BURN","var(--o)"),MB("Left",F(pL,0)+" BURN","var(--tx)"),
    MB("100% Filled","$"+F(maxU,0)+" @ $"+maxHi.toFixed(2),"var(--br)"),MB("Outstanding","$"+F(outU,0),"var(--cy)"),
    MB("Filled",fillPct.toFixed(1)+"%",fillPct>50?"var(--g)":fillPct>0?"var(--o)":"var(--mt)"),
    MB("LP Exposure",lpExposure.toFixed(1)+"%","var(--dm)")].join("");

  // HISTORY
  var hR="";for(var hi2=0;hi2<CL.length;hi2++){var hp=CL[hi2];
    if((hp.u||0)<0.01)continue; // Closes ohne Erlös: raus — nur reale Verkäufe zählen
    var hr=(hp.lo>0&&hp.hi>0)?FP(hp.lo)+"–"+FP(hp.hi):(hp.b>0?"Ø "+FP(hp.u/hp.b):"—");
    hR+='<tr><td style="color:var(--mt)">'+hp.d+'</td><td style="color:var(--o)">'+F(hp.b,0)+'</td><td style="font-size:10px;color:var(--dm)">'+hr+'</td><td style="color:var(--g)">$'+F(hp.u,2)+'</td><td style="font-size:9px;color:var(--mt)">'+(hp.b>0?"$"+(hp.u/hp.b).toFixed(4):"—")+'</td></tr>';}
  for(var mi=0;mi<MS.length;mi++){var ms2=MS[mi];hR+='<tr style="background:#60a5fa04"><td style="color:var(--mt)">'+ms2.d+'</td><td style="color:var(--o)">'+F(ms2.b,0)+'</td><td style="color:var(--dm)">Market</td><td style="color:var(--g)">$'+F(ms2.u,2)+'</td><td style="font-size:9px;color:var(--mt)">$'+(ms2.u/ms2.b).toFixed(4)+'</td></tr>';}
  hR+='<tr style="border-top:2px solid var(--bd);background:#080c16"><td class="bld">TOTAL</td><td style="color:var(--o);font-weight:600">'+F(TS,0)+'</td><td></td><td style="color:var(--g);font-weight:600">$'+TR.toLocaleString("en",{minimumFractionDigits:2,maximumFractionDigits:2})+'</td><td style="font-size:9px;color:var(--mt)">Ø $'+(TR/TS).toFixed(4)+'</td></tr>';
  $("histB").innerHTML=hR;
  var avgSell=TS>0?TR/TS:0,realMult=AVG_ENTRY>0?avgSell/AVG_ENTRY:0;
  var closedProfit=TR-(TS*AVG_ENTRY);
  $("histSummary").innerHTML=[MB("BURN Sold",F(TS,0),"var(--o)"),
    MB("USDC Total","$"+TR.toLocaleString("en",{minimumFractionDigits:2,maximumFractionDigits:2}),"var(--br)"),
    MB("Ø Sell Price","$"+avgSell.toFixed(4),"var(--br)"),
    MB("Realized Profit","$"+closedProfit.toLocaleString("en",{minimumFractionDigits:2,maximumFractionDigits:2}),"var(--g)"),
    MB("vs Entry",realMult>0?realMult.toFixed(1)+"x":"…",realMult>=10?"var(--g)":"var(--o)")].join("");
  try{renderTaxReport();}catch(e){}

  // LP TABLE — use EXACT pool price (from on-chain tick) for fill math, not DexScreener spot.
  // For positions near a range edge, the rounded/laggy spot distorts "BURN left" (277 vs 540).
  var Pp=pxUnified(); // COHERENCE: falls back to spot P if tick >5min stale
  var cS=0,cU=0;for(var li=0;li<LP.length;li++){if(LP[li].fr)continue;var cv=v3(LP[li].b,LP[li].lo,LP[li].hi,Pp);cS+=(LP[li].b-cv.left);cU+=cv.usdc;}
  function ring(p,cl,tx){p=Math.max(0,Math.min(100,p||0));return'<div style="width:44px;height:44px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:conic-gradient('+cl+' '+p+'%,#1a2235 '+p+'% 100%)"><div style="width:34px;height:34px;border-radius:50%;background:#0c1220;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:'+cl+'">'+tx+'</div></div>';}
  var lpR="",tBI=0,tBL=0,tU2=0;
  for(var lp=0;lp<LP.length;lp++){var pos=LP[lp],st,cl,bI,bL,uE,rng,pTxt,ringH,distH="";
    if(pos.fr)continue; // DAO shown in Pool Liquidity Map, not here
    rng="$"+pos.lo.toFixed(pos.lo<1?3:2)+" → $"+pos.hi.toFixed(2);bI=pos.b;var v=v3(pos.b,pos.lo,pos.hi,Pp);bL=v.left;uE=v.usdc;
      var dLo=pos.lo>0?((Pp-pos.lo)/pos.lo*100):0,dHi=Pp>0?((pos.hi-Pp)/Pp*100):0;
      if(Pp<pos.lo){ringH=ring(0,"#334155","—");distH='<span style="font-size:12px;color:var(--dm)">↑'+Math.abs(((pos.lo-Pp)/Pp)*100).toFixed(0)+'%</span>';}
      else if(Pp>=pos.hi){ringH=ring(100,"#34d399","✓");distH='<span style="font-size:12px;color:var(--g)">✓</span>';}
      else{var fp=v.pct;ringH=ring(fp,"#34d399",fp.toFixed(0)+"%");distH='<span style="font-size:11px;color:var(--mt)">↓'+dLo.toFixed(0)+'%</span><br><span style="font-size:11px;color:var(--tx)">↑'+dHi.toFixed(0)+'%</span>';}
    // USDC to Fill — THIS position's remaining USDC (100% value minus current USDC).
    // Previously used buyflowEstimate(P,pos.hi) which returned the POOL-WIDE USDC needed to
    // push price to pos.hi (incl. DAO + all other LPs) → wrong: showed $72k for a small LP.
    // Correct: how much more USDC THIS position receives as its remaining BURN sells off.
    var fillH="";
    var vMaxCalc=v3(pos.b,pos.lo,pos.hi,pos.hi); // position fully filled → all USDC
    if(Pp>=pos.hi){fillH='<span style="color:var(--g);font-size:10px">Filled</span>';}
    else if(Pp<pos.lo){fillH='<span style="color:var(--dm);font-size:9px">Below</span>';}
    else{var toFillU=Math.max(0,vMaxCalc.usdc-uE);fillH=toFillU>0?'<span style="color:var(--cy)">$'+F(toFillU,0)+'</span>':'—';}
    // 100% filled USDC
    var vMax=vMaxCalc;var maxH='<span style="color:var(--cy)">$'+vMax.usdc.toLocaleString("en",{maximumFractionDigits:0})+'</span>';
    var bSold=Math.max(0,bI-bL);
    tBI+=bI;tBL+=bL;tU2+=uE;
    lpR+='<tr><td class="bld">'+rng+'</td><td style="color:var(--o)">'+F(bI,0)+'</td><td style="color:var(--cy)">'+F(bSold,0)+'</td><td>'+F(bL,0)+'</td><td style="color:var(--g)">$'+F(uE,2)+'</td><td>'+maxH+'</td><td>'+fillH+'</td><td>'+distH+'</td><td style="text-align:center">'+ringH+'</td></tr>';}
  lpR+='<tr style="border-top:1px solid var(--bd)"><td class="bld">TOT</td><td style="color:var(--o)">'+F(tBI,0)+'</td><td style="color:var(--cy)">'+F(Math.max(0,tBI-tBL),0)+'</td><td>'+F(tBL,0)+'</td><td style="color:var(--g);font-weight:600">$'+F(tU2,2)+'</td><td></td><td></td><td></td><td></td></tr>';
  $("lpB").innerHTML=lpR;
  // Dynamic status: which LPs have current price within their range
  var lpsActive=[],lpsBelow=0,lpsFilled=0;
  for(var lsi=0;lsi<LP.length;lsi++){var ls=LP[lsi];if(ls.fr)continue;
    if(P>=ls.lo&&P<ls.hi)lpsActive.push(ls);
    else if(P<ls.lo)lpsBelow++;
    else lpsFilled++;
  }
  if(lpsActive.length===0){
    $("lpS").textContent=lpsBelow>0?lpsBelow+" position"+(lpsBelow>1?"s":"")+" above current price.":"All "+lpsFilled+" filled.";
  }else{
    var actBurn=0;for(var lai=0;lai<lpsActive.length;lai++){var av=v3(lpsActive[lai].b,lpsActive[lai].lo,lpsActive[lai].hi,P);actBurn+=(lpsActive[lai].b-av.left);}
    $("lpS").textContent=lpsActive.length+" active in $"+lpsActive[0].lo.toFixed(lpsActive[0].lo<1?3:2)+"–$"+lpsActive[lpsActive.length-1].hi.toFixed(2)+" range · "+F(actBurn,0)+" BURN sold";
  }
  $("lpProg").style.width=fillPct.toFixed(1)+"%";
  try{renderLpPnl();}catch(e){}
  try{renderPushStatus();}catch(e){}

  // BUYFLOW — V3 concentrated liquidity calculation using real LP scan data
  function v3BuyflowCalc(curP,tgtP){
    if(!lmapCache||!curP||!tgtP||tgtP<=curP)return{usdc:0,burn:0};
    // Build sorted list of bucket coverage (only buckets WITH liquidity count as "V3 covered")
    var coveredRanges=[];
    for(var bi=0;bi<lmapCache.length;bi++){
      var bk=lmapCache[bi];
      if(bk.burn<=0)continue;
      coveredRanges.push({lo:bk.lo,hi:bk.hi,bucket:bk});
    }
    coveredRanges.sort(function(a,b2){return a.lo-b2.lo;});
    // Walk from curP to tgtP: use V3 in covered ranges, V2 in gaps
    var totalUsdc=0,totalBurn=0;
    var p=curP;
    while(p<tgtP){
      // Find next covered range that overlaps current position
      var nextCovered=null;
      for(var ci=0;ci<coveredRanges.length;ci++){
        var cr=coveredRanges[ci];
        if(cr.hi<=p)continue;
        if(cr.lo<=p){nextCovered={lo:p,hi:Math.min(cr.hi,tgtP),bucket:cr.bucket};break;}
        // Gap before this covered range — fill with V2
        if(cr.lo>p){
          var gapEnd=Math.min(cr.lo,tgtP);
          if(K>0&&Y>0&&X>0){
            var Lv2g=Math.sqrt(K);
            totalUsdc+=Math.max(0,Lv2g*(Math.sqrt(gapEnd)-Math.sqrt(p)));
            totalBurn+=Math.max(0,Lv2g*(1/Math.sqrt(p)-1/Math.sqrt(gapEnd)));
          }
          p=gapEnd;
          if(p>=tgtP)break;
          if(cr.lo<=p){nextCovered={lo:p,hi:Math.min(cr.hi,tgtP),bucket:cr.bucket};break;}
        }
      }
      if(nextCovered){
        // V3 calculation in this covered range
        var bk2=nextCovered.bucket;
        var sqLo2=1/Math.sqrt(bk2.lo),sqHi2=1/Math.sqrt(bk2.hi);
        var fullRange2=sqLo2-sqHi2;
        if(fullRange2>0){
          var overlapRange2=1/Math.sqrt(nextCovered.lo)-1/Math.sqrt(nextCovered.hi);
          var frac2=overlapRange2/fullRange2;
          var L2=bk2.burn/fullRange2;
          totalBurn+=bk2.burn*frac2;
          totalUsdc+=L2*(Math.sqrt(nextCovered.hi)-Math.sqrt(nextCovered.lo));
        }
        p=nextCovered.hi;
      }else{
        // No more covered ranges — fill rest with V2
        if(K>0&&Y>0&&X>0){
          var Lv2e=Math.sqrt(K);
          totalUsdc+=Math.max(0,Lv2e*(Math.sqrt(tgtP)-Math.sqrt(p)));
          totalBurn+=Math.max(0,Lv2e*(1/Math.sqrt(p)-1/Math.sqrt(tgtP)));
        }
        p=tgtP;
      }
    }
    return{usdc:totalUsdc,burn:totalBurn};
  }
  // SHARED: buyflow estimation for Next Fill + Market Analysis.
  // Uses real tick-liquidity (simBuyImpactToPrice) when scan data present → V2 fallback → 0.
  // This walks to a TARGET PRICE and returns the USDC + BURN consumed to get there.
  function buyflowEstimate(curP,tgtP){
    if(!curP||!tgtP||tgtP<=curP)return{usdc:0,burn:0,src:""};
    // V3 exact: walk tick segments from curP up to tgtP using summed liquidity
    if(window._lmapRanges&&window._lmapRanges.length>0&&typeof simBuyToPrice==="function"){
      var bf=simBuyToPrice(tgtP);
      if(bf&&bf.burn>0)return{usdc:bf.usdc,burn:bf.burn,src:"V3"};
    }
    if(K>0&&Y>0&&X>0){
      var u=Math.sqrt(K*tgtP)-Y;
      var b=X-Math.sqrt(K/tgtP);
      return{usdc:Math.max(0,u),burn:Math.max(0,b),src:"V2"};
    }
    return{usdc:0,burn:0,src:""};
  }
  var bR="",hasV3=(window._lmapRanges&&window._lmapRanges.length>0);
  for(var i=0;i<TGT.length;i++){var tp=TGT[i],ok=tp>P&&P>0,m=P>0?tp/P:0;
    var uN=0,bB=0,bSrc="";
    if(ok){
      var bfE=buyflowEstimate(P,tp);
      uN=bfE.usdc;bB=bfE.burn;bSrc=bfE.src;
    }
    var lS=0,lU=0;if(ok){for(var lj=0;lj<LP.length;lj++){if(LP[lj].fr)continue;var tv=v3(LP[lj].b,LP[lj].lo,LP[lj].hi,tp);lS+=(LP[lj].b-tv.left);lU+=tv.usdc;}}
    var dS=lS-cS,dU=lU-cU;
    bR+='<tr style="opacity:'+(ok?1:.3)+'"><td class="bld">$'+tp.toFixed(2)+'</td><td style="color:'+(ok?"var(--g)":"var(--mt)")+'">'+(ok?"$"+F(uN,0):"—")+(ok&&bSrc?' <span style="font-size:7px;color:var(--dm)">'+bSrc+'</span>':"")+'</td><td style="color:var(--o)">'+(ok?F(bB,0):"—")+'</td><td style="color:var(--cy)">'+(ok&&dS>0?F(dS,0):"—")+'</td><td style="color:var(--g)">'+(ok&&dU>0?"$"+F(dU,0):"—")+'</td><td>'+TG(m.toFixed(1)+"x",m>5?"#c084fc":m>2?"#fb923c":"#60a5fa")+'</td></tr>';}
  $("bfB").innerHTML=bR;

  // SELL IMPACT — V3 walks down through buckets, V2 fallback as labeled estimate
  function v3SellImpact(burnSold){
    if(!lmapCache||lmapCache.length===0||!burnSold||burnSold<=0||P<=0)return null;
    // Sort buckets descending (highest hi first), walk down from current price
    var sorted=lmapCache.slice().sort(function(a,b){return b.hi-a.hi;});
    var remaining=burnSold,usdcOut=0,curP=P;
    for(var si=0;si<sorted.length;si++){
      var bk=sorted[si];
      if(bk.lo>=curP||bk.burn<=0||bk.lo<=0)continue;
      // Walk down from min(curP, bk.hi) to bk.lo
      var pHi=Math.min(curP,bk.hi),pLo=bk.lo;
      var sqHi=1/Math.sqrt(bk.lo),sqLo2=1/Math.sqrt(bk.hi);
      var fullRange=sqHi-sqLo2;
      if(fullRange<=0)continue;
      var L=bk.burn/fullRange;
      // BURN that fits in this bucket from pHi down to pLo
      var burnAvail=L*(1/Math.sqrt(pLo)-1/Math.sqrt(pHi));
      if(burnAvail<=0)continue;
      if(remaining<=burnAvail){
        // Sale ends within this bucket — solve for endP
        var endInvSq=1/Math.sqrt(pHi)+remaining/L;
        var endP=1/(endInvSq*endInvSq);
        usdcOut+=L*(Math.sqrt(pHi)-Math.sqrt(endP));
        curP=endP;remaining=0;break;
      }else{
        usdcOut+=L*(Math.sqrt(pHi)-Math.sqrt(pLo));
        remaining-=burnAvail;curP=pLo;
      }
    }
    if(remaining>0)return null; // Not enough liquidity
    return{usdc:usdcOut,newPrice:curP};
  }
  var siR="",siSrc=(window._lmapRanges&&window._lmapRanges.length>0)?"V3":"V2";
  for(var s=0;s<SEL.length;s++){
    var n=SEL[s],uo=0,np=0,imp=0;
    var v3si=(typeof simSellImpact==="function"&&siSrc==="V3")?simSellImpact(n):null;
    if(v3si){
      uo=v3si.usdc;np=v3si.newPrice;imp=P>0?((np-P)/P)*100:0;
    }else if(K>0&&Y>0){
      // V2 K=X*Y fallback
      var xn=X+n,yn=K/xn;np=yn/xn;imp=P>0?((np-P)/P)*100:0;uo=Math.max(0,Y-yn);
      siSrc="V2";
    }
    siR+='<tr><td class="bld">'+F(n,0)+'</td><td style="color:var(--g)">$'+F(uo,2)+(siSrc?' <span style="font-size:7px;color:var(--dm)">'+siSrc+'</span>':'')+'</td><td style="color:var(--o)">'+FP(np)+'</td><td>'+TG(imp.toFixed(1)+"%",imp<-50?"#f87171":imp<-20?"#fb923c":"#60a5fa")+'</td></tr>';
  }
  $("siB").innerHTML=siR;

  // NOTIFICATIONS
  if(prevPrice>0&&P!==prevPrice){
    // LP range crossing
    for(var ni=0;ni<LP.length;ni++){if(LP[ni].fr)continue;
      if(prevPrice<LP[ni].lo&&P>=LP[ni].lo)notify("LP Range Entered","Price crossed $"+LP[ni].lo.toFixed(3)+" — position now active");
      if(prevPrice<LP[ni].hi&&P>=LP[ni].hi)notify("LP Position Filled","Price crossed $"+LP[ni].hi.toFixed(2)+" — position fully converted");}
    // Targets
    for(var ti=0;ti<TGT.length;ti++){if(prevPrice<TGT[ti]&&P>=TGT[ti])notify("Target Reached","BURN hit $"+TGT[ti].toFixed(2)+"!");}
  }
  prevPrice=P;

  $("foot").innerHTML="My Crypto Portfolio · "+SRC.toUpperCase()+" · "+new Date().toLocaleTimeString()+" · stBURN "+(stOK?"✓":"…")+" · Supply "+(sup.total>0?"✓":"…");
}

// ═══ TRADES: On-Chain Swap Events ═══
var SWAP_SIG="0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67";
var allTrades=[],tradeLatest=0,tradeOldestFetched=0,tradePg_=0,TRADES_PP=20,BLOCK_CHUNK=5000000;
// Trade Cache: persist all fetched trades for simulation + history
// Target: 370 days (~123M blocks @ 0.26s/block on Arbitrum)
var TRADE_CACHE_TARGET_DAYS=370;
var TRADE_CACHE_TARGET_BLOCKS=Math.round(TRADE_CACHE_TARGET_DAYS*86400/0.26);
var tradeBackfillRunning=false;
function tradeCacheLoad(){
  try{
    var raw=localStorage.getItem("trades_cache");
    if(!raw)return false;
    var c=JSON.parse(raw);
    if(!c||!c.trades||!Array.isArray(c.trades)||c.trades.length===0)return false;
    allTrades=c.trades;
    tradeOldestFetched=c.oldestBlock||0;
    dedupeTrades(); // clean any duplicates that got saved by older buggy merge logic
    console.log("TRADE CACHE: hydrated "+allTrades.length+" trades, oldest block "+tradeOldestFetched);
    return true;
  }catch(e){console.log("trade cache load err:",e.message);return false;}
}
function tradeCacheSave(){
  try{
    // Cap at 10000 trades to stay safely under 5MB localStorage limit
    var slice=allTrades.length>10000?allTrades.slice(0,10000):allTrades;
    localStorage.setItem("trades_cache",JSON.stringify({trades:slice,oldestBlock:tradeOldestFetched,ts:Date.now()}));
  }catch(e){console.log("trade cache save err:",e.message);}
}
async function tradeAutoBackfill(){
  if(tradeBackfillRunning)return;
  tradeBackfillRunning=true;
  try{
    if(!tradeLatest||!tradeOldestFetched){tradeBackfillRunning=false;return;}
    var targetBlock=Math.max(300000000,tradeLatest-TRADE_CACHE_TARGET_BLOCKS);
    var chunksFetched=0,maxChunksPerCall=20;
    while(tradeOldestFetched>targetBlock&&chunksFetched<maxChunksPerCall){
      var to=tradeOldestFetched-1;
      var from=Math.max(targetBlock,to-BLOCK_CHUNK);
      if(from<=300000000)break;
      try{
        var logs=await fetchTradesChunk(from,to);
        if(!Array.isArray(logs)){tradeBackfillRunning=false;return;}
        if(logs.length===0){tradeOldestFetched=from;chunksFetched++;continue;}
        logs.reverse();
        var added=0;
        for(var i=0;i<logs.length;i++){var t=decodeSwap(logs[i],tradeLatest);if(t){allTrades.push(t);added++;}}
        tradeOldestFetched=from;
        chunksFetched++;
        var days=Math.round((tradeLatest-tradeOldestFetched)*0.26/86400);
        try{$("tLoadStat").textContent=allTrades.length+" trades · ~"+days+"d history (backfilling)";}catch(e){}
        // Save after each chunk so partial progress survives reload
        tradeCacheSave();
        // Yield to event loop, throttle RPC
        await new Promise(function(r){setTimeout(r,250);});
      }catch(e){console.log("backfill chunk err:",e.message);break;}
    }
    var finalDays=Math.round((tradeLatest-tradeOldestFetched)*0.26/86400);
    try{$("tLoadStat").textContent=allTrades.length+" trades · ~"+finalDays+"d history";}catch(e){}
    console.log("TRADE BACKFILL: "+chunksFetched+" chunks, "+allTrades.length+" total, "+finalDays+"d depth");
    tradeCacheSave();
    try{renderTrades();}catch(e){}
  }catch(e){console.log("backfill err:",e.message);}
  tradeBackfillRunning=false;
}

// Unique key for a trade — txHash+logIndex is globally unique on-chain (one swap event = one key).
// Falls back to block+amounts for legacy cached trades that predate txHash storage.
function tradeKey(t){
  if(t.txHash)return t.txHash+":"+(t.logIdx||"0");
  return t.blk+":"+Math.round(t.burn)+":"+Math.round(t.usdc*100);
}
// Remove duplicate trades in-place, keeping the first occurrence (newest, since list is desc).
function dedupeTrades(){
  var seen={},out=[];
  for(var i=0;i<allTrades.length;i++){
    var k=tradeKey(allTrades[i]);
    if(seen[k])continue;
    seen[k]=1;out.push(allTrades[i]);
  }
  if(out.length!==allTrades.length)allTrades=out;
}
function decodeSwap(log,latest){
  var data=log.data||"";if(data.length<258)return null;
  var a0=BigInt("0x"+data.slice(2,66)),a1=BigInt("0x"+data.slice(66,130));
  if(a0>=2n**255n)a0=a0-2n**256n;if(a1>=2n**255n)a1=a1-2n**256n;
  var usdc=Number(a0)/1e6;
  var burn=a1<0n?Number((-a1)*1000n/10n**18n)/1000:Number(a1*1000n/10n**18n)/1000;
  var isBuy=usdc>0,blk=parseInt(log.blockNumber,16);
  var secAgo=(latest-blk)*0.26,minAgo=Math.round(secAgo/60);
  var wallet=log.topics&&log.topics.length>2?"0x"+log.topics[2].slice(26):"";
  return{isBuy:isBuy,burn:Math.abs(burn),usdc:Math.abs(usdc),price:Math.abs(burn)>0?Math.abs(usdc)/Math.abs(burn):0,
    minAgo:minAgo,blk:blk,wallet:wallet,txHash:log.transactionHash||"",logIdx:log.logIndex||"0"};}

// ─── SIGNER RESOLUTION (match the server) ───
// The Swap event's recipient (topics[2]) is often a router/receiver wallet, not the person.
// The SERVER resolves names from tx.from (who signed), so multi-wallet users like Dominic
// are named correctly there but not in the app. This fetches tx.from for a txHash (cached),
// so the app can show the same signer-based name. Called lazily for VISIBLE trades only.
var signerCache={};
try{var scStored=localStorage.getItem("signer_cache");if(scStored)signerCache=JSON.parse(scStored);}catch(e){}
var signerPending={};
async function resolveSigner(txHash){
  if(!txHash)return null;
  if(signerCache[txHash])return signerCache[txHash];
  if(signerPending[txHash])return null; // already fetching
  signerPending[txHash]=1;
  for(var i=0;i<RPC_LIST.length;i++){
    var idx=(rpcIdx+i)%RPC_LIST.length;
    try{
      var ac=new AbortController();var tm=setTimeout(function(){ac.abort();},5000);
      var r=await fetch(RPC_LIST[idx],{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({jsonrpc:"2.0",method:"eth_getTransactionByHash",params:[txHash],id:77}),signal:ac.signal});
      clearTimeout(tm);var j=await r.json();
      if(j.result&&j.result.from){
        var from=j.result.from.toLowerCase();
        signerCache[txHash]=from;
        try{localStorage.setItem("signer_cache",JSON.stringify(signerCache));}catch(e){}
        delete signerPending[txHash];
        return from;
      }
    }catch(e){}
  }
  delete signerPending[txHash];
  return null;
}
// Fallback for cached trades that have no txHash: fetch the block, find the Swap log in the
// pool whose recipient matches, take its transactionHash, then resolve tx.from. Cached by block+recipient.
async function resolveSignerByBlock(blk,recipient){
  if(!blk||!recipient)return null;
  var ckey="blk:"+blk+":"+recipient.toLowerCase();
  if(signerCache[ckey])return signerCache[ckey];
  if(signerPending[ckey])return null;
  signerPending[ckey]=1;
  var hexBlk="0x"+blk.toString(16);
  for(var i=0;i<RPC_LIST.length;i++){
    var idx=(rpcIdx+i)%RPC_LIST.length;
    try{
      var ac=new AbortController();var tm=setTimeout(function(){ac.abort();},6000);
      // Get all Swap logs from the pool in this block, match the one for our recipient.
      var r=await fetch(RPC_LIST[idx],{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({jsonrpc:"2.0",method:"eth_getLogs",params:[{address:POOL,topics:[SWAP_SIG],fromBlock:hexBlk,toBlock:hexBlk}],id:78}),signal:ac.signal});
      clearTimeout(tm);var j=await r.json();
      if(j.result&&j.result.length){
        var rlow=recipient.toLowerCase(),txh="";
        for(var L=0;L<j.result.length;L++){
          var lg=j.result[L];
          var recip=lg.topics&&lg.topics.length>2?("0x"+lg.topics[2].slice(26)).toLowerCase():"";
          if(recip===rlow){txh=lg.transactionHash;break;}
        }
        if(txh){
          var from=await resolveSigner(txh);
          if(from){signerCache[ckey]=from;try{localStorage.setItem("signer_cache",JSON.stringify(signerCache));}catch(e){}delete signerPending[ckey];return from;}
        }
      }
      break; // logs came back (maybe empty) — don't hammer other RPCs
    }catch(e){}
  }
  delete signerPending[ckey];
  return null;
}
// Resolve signers for the currently visible trades, then re-render if any name was found.
async function enrichTradeSigners(trades){
  if(!trades||!trades.length)return;
  var changed=false;
  for(var i=0;i<trades.length;i++){
    var t=trades[i];
    if(t.signerResolved)continue;
    // Only bother if the recipient wallet is NOT already a known name (else no need).
    var recipKnown=t.wallet&&ADDR_BOOK[(t.wallet+"").toLowerCase()];
    if(recipKnown){t.signerResolved=true;continue;}
    var signer=null;
    if(t.txHash){signer=await resolveSigner(t.txHash);}       // fast path (new trades)
    else if(t.blk&&t.wallet){signer=await resolveSignerByBlock(t.blk,t.wallet);} // cached trades
    t.signerResolved=true;
    if(signer&&ADDR_BOOK[signer]){
      t.signer=signer;           // store resolved signer
      t.wallet=signer;           // use it as the display wallet → name shows
      changed=true;
    }
    await new Promise(function(r){setTimeout(r,70);}); // gentle throttle
  }
  if(changed){try{renderTrades();}catch(e){}try{tradeCacheSave();}catch(e){}}
}

function tradeRow(t){
  var agoT=t.minAgo<1?"now":t.minAgo<60?t.minAgo+"m":t.minAgo<1440?Math.round(t.minAgo/60)+"h":Math.round(t.minAgo/1440)+"d";
  var clr=t.isBuy?"var(--g)":"var(--r)";
  var isKnown=t.wallet&&typeof ADDR_BOOK!=="undefined"&&ADDR_BOOK[(t.wallet+"").toLowerCase()];
  var bD=t.burn>=100000?F(t.burn,1):t.burn.toLocaleString("en",{maximumFractionDigits:2});
  var uD="$"+(t.usdc>=100000?F(t.usdc,1):t.usdc.toLocaleString("en",{minimumFractionDigits:2,maximumFractionDigits:2}));
  var whaleTag=t.usdc>=WHALE_MIN?"🐋 ":"";
  // Wallet column: NAME if known (clickable → filter trades), else short hex with Arbiscan link.
  var wLink;
  if(isKnown){
    var nm=addrName(t.wallet);
    wLink='<span onclick="filterTradesByWallet(\''+t.wallet+'\')" style="font-size:9px;color:var(--o);font-weight:600;cursor:pointer;text-decoration:underline;text-decoration-style:dotted" title="Alle Trades von '+nm+' zeigen">'+nm+'</span>';
  }else if(t.wallet){
    var wS=t.wallet.slice(0,6)+"…"+t.wallet.slice(-4);
    wLink='<a href="https://arbiscan.io/address/'+t.wallet+'" target="_blank" rel="noopener" style="font-size:9px;color:var(--b)" onclick="event.stopPropagation()">'+wS+'</a>';
  }else{
    wLink='<span style="font-size:9px;color:var(--dm)">—</span>';
  }
  var whaleBg=t.usdc>=1000?"background:rgba(251,191,36,.04);":t.usdc>=500?"background:rgba(251,191,36,.02);":"";
  return'<tr style="'+whaleBg+'"><td style="color:var(--mt)">'+agoT+'</td><td style="color:'+clr+';font-weight:600">'+(t.isBuy?"BUY":"SELL")+'</td><td style="color:var(--o)">'+bD+'</td><td style="color:var(--g)">'+whaleTag+uD+'</td><td>'+FP(t.price)+'</td><td>'+wLink+'</td></tr>';}

var tradeWalletFilter=null; // null = alle, sonst lowercase Adresse
function filterTradesByWallet(addr){
  if(!addr)return;
  tradeWalletFilter=(addr+"").toLowerCase();
  tradePg_=0;
  try{renderTrades();}catch(e){}
  // Zur Trade-Sektion scrollen
  try{var el=$("tradeAll");if(el)el.scrollIntoView({behavior:"smooth",block:"center"});}catch(e){}
}
function clearTradeFilter(){
  tradeWalletFilter=null;
  tradePg_=0;
  try{renderTrades();}catch(e){}
}
function renderTrades(){
  // Filter anwenden falls gesetzt
  var list=allTrades;
  if(tradeWalletFilter){
    list=allTrades.filter(function(t){return t.wallet&&(t.wallet+"").toLowerCase()===tradeWalletFilter;});
  }
  // Filter-Banner anzeigen/verstecken
  var fb=$("tradeFilterBanner");
  if(fb){
    if(tradeWalletFilter){
      var fname=addrName(tradeWalletFilter);
      var buys=0,sells=0,buyU=0,sellU=0;
      for(var fi=0;fi<list.length;fi++){if(list[fi].isBuy){buys++;buyU+=list[fi].usdc;}else{sells++;sellU+=list[fi].usdc;}}
      fb.style.display="block";
      fb.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;background:rgba(251,146,60,.1);border:1px solid rgba(251,146,60,.4);border-radius:8px;padding:8px 12px;margin-bottom:8px">'+
        '<div style="font-size:11px"><span style="color:var(--o);font-weight:700">'+fname+'</span> <span style="color:var(--mt)">· '+list.length+' Trades ('+buys+' Buy / '+sells+' Sell)</span><br><span style="font-size:9px;color:var(--g)">Buy $'+F(buyU,0)+'</span> <span style="font-size:9px;color:var(--r)">Sell $'+F(sellU,0)+'</span></div>'+
        '<button onclick="clearTradeFilter()" style="background:rgba(48,54,68,.4);border:1px solid rgba(48,54,68,.6);color:var(--mt);font-size:10px;padding:5px 10px;border-radius:6px;cursor:pointer;white-space:nowrap">✕ Filter</button>'+
      '</div>';
    }else{
      fb.style.display="none";fb.innerHTML="";
    }
  }
  // Top 1 always visible (immer aus voller Liste)
  var top1="";if(allTrades.length>0)top1=tradeRow(allTrades[0]);
  $("tradeTop").innerHTML=top1||'<tr><td colspan="6"><span class="skel" style="width:100%;height:12px"></span></td></tr>';
  $("tradeCnt").textContent=tradeWalletFilter?list.length:allTrades.length;
  // Paginated
  var pages=Math.max(1,Math.ceil(list.length/TRADES_PP));
  if(tradePg_>=pages)tradePg_=pages-1;
  var start=tradePg_*TRADES_PP,rows="";
  for(var j=start;j<Math.min(start+TRADES_PP,list.length);j++)rows+=tradeRow(list[j]);
  $("tradeAll").innerHTML=rows||'<tr><td colspan="6" style="color:var(--dm)">No trades</td></tr>';
  $("tPgInfo").textContent=(tradePg_+1)+"/"+pages;
  $("tPrev").disabled=tradePg_<=0;$("tNext").disabled=tradePg_>=pages-1;
  try{renderCapitalFlow();}catch(e){}
  // Resolve signer names (tx.from) for the visible trades only — matches the server's naming.
  // Runs async in the background; re-renders if a name is found. Cached per txHash.
  try{
    var visible=[];
    if(allTrades.length>0)visible.push(allTrades[0]);
    for(var vj=start;vj<Math.min(start+TRADES_PP,list.length);vj++)visible.push(list[vj]);
    if(typeof enrichTradeSigners==="function")enrichTradeSigners(visible);
  }catch(e){}
}
function tradePg(d){tradePg_+=d;renderTrades();}

async function fetchTradesChunk(fromBlock,toBlock){
  for(var ri=0;ri<RPC_LIST.length;ri++){
    var idx=(rpcIdx+ri)%RPC_LIST.length;
    try{var ac=new AbortController();var tm=setTimeout(function(){ac.abort();},8000);
      var logR=await fetch(RPC_LIST[idx],{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({jsonrpc:"2.0",method:"eth_getLogs",params:[{address:POOL,topics:[SWAP_SIG],fromBlock:"0x"+fromBlock.toString(16),toBlock:"0x"+toBlock.toString(16)}],id:100}),signal:ac.signal});
      clearTimeout(tm);var logJ=await logR.json();
      if(Array.isArray(logJ.result))return logJ.result;
    }catch(e){clearTimeout(tm);}
  }
  return[];}

async function fetchTrades(){
  try{
    var bnJ=null;
    for(var ri=0;ri<RPC_LIST.length;ri++){
      var idx=(rpcIdx+ri)%RPC_LIST.length;
      try{var ac=new AbortController();var tm=setTimeout(function(){ac.abort();},5000);
        var bnR=await fetch(RPC_LIST[idx],{method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({jsonrpc:"2.0",method:"eth_blockNumber",params:[],id:99}),signal:ac.signal});
        clearTimeout(tm);bnJ=await bnR.json();if(bnJ&&bnJ.result)break;
      }catch(e){clearTimeout(tm);}
    }
    if(!bnJ||!bnJ.result)return;
    tradeLatest=parseInt(bnJ.result,16);
    if(!tradeLatest)return;
    var hadCache=allTrades.length>0;
    var topBlk=hadCache?allTrades[0].blk:0;
    // Determine fetch range:
    // - If cache present and fresh: just fetch from top of cache to latest
    // - If cache stale (>1 chunk gap): fetch last BLOCK_CHUNK like initial
    // - If no cache: initial fetch of last BLOCK_CHUNK
    var from;
    if(hadCache&&topBlk>0&&(tradeLatest-topBlk)<BLOCK_CHUNK){
      from=topBlk+1;
    }else{
      from=tradeLatest-BLOCK_CHUNK;
      if(!hadCache)tradeOldestFetched=from;
    }
    var logs=await fetchTradesChunk(from,tradeLatest);
    if(!Array.isArray(logs))return;
    logs.reverse();
    if(!hadCache){
      // First-ever load (no cache hydrated)
      allTrades=[];
      for(var i=0;i<logs.length;i++){var t=decodeSwap(logs[i],tradeLatest);if(t)allTrades.push(t);}
      dedupeTrades();
      renderTrades();
      whaleFirstLoad=false;
      var initDays=Math.round(BLOCK_CHUNK*0.26/86400);
      $("tLoadStat").textContent="Loaded ~"+initDays+"d";
      tradeCacheSave();
      // Kick off backfill to reach target depth
      setTimeout(function(){tradeAutoBackfill();},3000);
    }else{
      // Merge new trades at front, dedupe by unique key (txHash+logIndex, not just block —
      // several swaps can share a block, and overlapping fetches re-return the same logs).
      var added=0;
      var existingKeys={};
      for(var ek=0;ek<allTrades.length;ek++)existingKeys[tradeKey(allTrades[ek])]=1;
      for(var i2=0;i2<logs.length;i2++){var t2=decodeSwap(logs[i2],tradeLatest);if(t2&&!existingKeys[tradeKey(t2)]){allTrades.unshift(t2);existingKeys[tradeKey(t2)]=1;added++;}}
      dedupeTrades();
      // Update time estimates
      for(var u=0;u<allTrades.length;u++){allTrades[u].minAgo=Math.round((tradeLatest-allTrades[u].blk)*0.26/60);}
      var top1="";if(allTrades.length>0)top1=tradeRow(allTrades[0]);
      $("tradeTop").innerHTML=top1||'';
      $("tradeCnt").textContent=allTrades.length;
      if(added>0){
        renderTrades();
        tradeCacheSave();
        if(!whaleFirstLoad){
          for(var wi2=0;wi2<added;wi2++){if(allTrades[wi2].usdc>=WHALE_MIN){
            if(typeof beep==="function"&&typeof soundOn!=="undefined"&&soundOn)beep();
            console.log("🐋 WHALE: "+(allTrades[wi2].isBuy?"BUY":"SELL")+" $"+allTrades[wi2].usdc.toFixed(0));break;}}
        }
      }
      whaleFirstLoad=false;
      // Continue backfill if we haven't reached target depth yet
      var depthDays=Math.round((tradeLatest-tradeOldestFetched)*0.26/86400);
      if(depthDays<TRADE_CACHE_TARGET_DAYS-30&&!tradeBackfillRunning){
        setTimeout(function(){tradeAutoBackfill();},5000);
      }
    }
  }catch(e){console.log("Trades err:",e);}}

async function fetchTradesOlder(){
  if(!tradeOldestFetched||tradeOldestFetched<300000000){$("tLoadStat").textContent="All history loaded";return;}
  $("tMore").disabled=true;$("tLoadStat").textContent="Loading...";
  try{
    var to=tradeOldestFetched-1;var from=to-BLOCK_CHUNK;if(from<300000000)from=300000000;
    var logs=await fetchTradesChunk(from,to);
    if(!Array.isArray(logs)||logs.length===0){$("tLoadStat").textContent="No older trades";$("tMore").disabled=false;return;}
    tradeOldestFetched=from;
    logs.reverse();
    for(var i=0;i<logs.length;i++){var t=decodeSwap(logs[i],tradeLatest);if(t)allTrades.push(t);}
    dedupeTrades();
    renderTrades();
    tradeCacheSave();
    var days=Math.round((tradeLatest-from)*0.26/86400);
    $("tLoadStat").textContent=allTrades.length+" trades · ~"+days+"d history";
  }catch(e){$("tLoadStat").textContent="Error loading";}
  $("tMore").disabled=false;}

// ═══ POOL LIQUIDITY MAP (bitmap + subgraph) ═══
var lmapCache=null,lmapTs=0;

// ═══ TRADE SIMULATOR (Market Analysis) ═══
// Standalone buy/sell price-impact simulator. Uses calibrated V3 buckets (lmapCache)
// which already aggregate ALL LP positions scaled to real on-chain pool reserves.
// Falls back to V2 K=X*Y when no scan data is available.
// which already aggregate ALL LP positions scaled to real on-chain pool reserves.
// Falls back to V2 K=X*Y when no scan data is available.
//
// EXACT V3 MATH: uses window._lmapRanges (raw tick ranges with real liquidity L).
// At any tick, active liquidity = sum of all LP positions covering that tick — exactly
// how a real V3 pool routes a swap. Lb (BURN-unit liq) = L_raw / 1e12 (derived from the
// scan's own burn formula). Price convention: price_human = 1e12 / 1.0001^tick.
// sqrtInv(tick) = 1/sqrt(price) = 1.0001^(tick/2) / 1e6.
function _siv(tick){return Math.pow(1.0001,tick/2)/1e6;} // 1/sqrt(price_human) at tick
// Build a sorted list of "active liquidity per tick segment" by accumulating range liq.
function _activeLiqSegments(){
  var ranges=window._lmapRanges;
  if(!ranges||!ranges.length)return null;
  // Collect all boundary ticks
  var bounds={};
  for(var i=0;i<ranges.length;i++){if(ranges[i].liq>0){bounds[ranges[i].tL]=1;bounds[ranges[i].tH]=1;}}
  var ticks=Object.keys(bounds).map(Number).sort(function(a,b){return a-b;});
  var segs=[];
  for(var j=0;j<ticks.length-1;j++){
    var tl=ticks[j],th=ticks[j+1],mid=(tl+th)/2,L=0;
    for(var k=0;k<ranges.length;k++){var r=ranges[k];if(r.liq>0&&r.tL<=mid&&r.tH>=mid)L+=r.liq;}
    if(L>0)segs.push({tL:tl,tH:th,Lb:L/1e12});
  }
  return segs;
}
function simSellImpact(burnSold){
  // Sell BURN → price DOWN → tick UP (price=1e12/1.0001^tick). Walk segments toward higher ticks.
  if(!burnSold||burnSold<=0||P<=0)return null;
  var segs=_activeLiqSegments();if(!segs||!segs.length)return null;
  var curTick=window._lmapCurTick;
  var asc=segs.filter(function(s){return s.tH>curTick;}).sort(function(a,b){return a.tL-b.tL;});
  var remaining=burnSold,usdcOut=0,invCur=_siv(curTick),tickPos=curTick;
  for(var i=0;i<asc.length;i++){
    var s=asc[i];if(s.Lb<=0)continue;
    var tStart=Math.max(tickPos,s.tL),tEnd=s.tH;
    var invStart=_siv(tStart),invEnd=_siv(tEnd); // invEnd>invStart (higher tick = lower price = higher 1/sqrtP)
    var burnCap=s.Lb*(invEnd-invStart); // BURN absorbable in this segment
    if(burnCap<=0)continue;
    if(remaining<=burnCap){
      var invFinal=invStart+remaining/s.Lb;
      var spStart=1/invStart,spFinal=1/invFinal;
      usdcOut+=s.Lb*(spStart-spFinal);
      invCur=invFinal;remaining=0;
      var pEnd=1/(invFinal*invFinal);
      return {usdc:usdcOut,newPrice:pEnd};
    }else{
      var sp1=1/invStart,sp2=1/invEnd;
      usdcOut+=s.Lb*(sp1-sp2);
      remaining-=burnCap;tickPos=tEnd;invCur=invEnd;
    }
  }
  // ran out of liquidity
  var pEnd2=1/(invCur*invCur);
  return {usdc:usdcOut,newPrice:pEnd2,partial:true,filled:burnSold-remaining};
}
// ─── REALISTIC hold-stack value at a target price ───
// Models: (1) the price is pushed from spot up to tgtP by real buying (which DEEPENS the
// pool with USDC and removes BURN, using today's tick liquidity), then (2) you sell your
// whole stack back DOWN into that deepened pool. Returns the realistic USD you'd net,
// far below the naive (amount × price) book value but above today's thin-pool exit.
// Falls back to book value if V3 tick data isn't available.
function holdStackRealValue(burnAmount, tgtP){
  if(!burnAmount||burnAmount<=0||!tgtP||tgtP<=0)return null;
  var hasV3=window._lmapRanges&&window._lmapRanges.length>0&&typeof _activeLiqSegments==="function";
  if(!hasV3||P<=0)return {real:burnAmount*tgtP, book:burnAmount*tgtP, avgPrice:tgtP, model:"book"};
  var segs=_activeLiqSegments();if(!segs||!segs.length)return {real:burnAmount*tgtP, book:burnAmount*tgtP, avgPrice:tgtP, model:"book"};
  var curTick=window._lmapCurTick;
  var tgtTick=Math.round(Math.log(1e12/tgtP)/Math.log(1.0001));
  // If target is at/below current price, selling just uses the current pool (no pump needed).
  // Sell your stack DOWN from tgtTick (the pumped state) through the tick segments.
  // Selling BURN → price DOWN → tick UP. Walk ascending from tgtTick.
  var startTick=(tgtTick<curTick)?tgtTick:curTick; // if tgt above spot, start at pumped tick
  var asc=segs.filter(function(s){return s.tH>startTick;}).sort(function(a,b){return a.tL-b.tL;});
  var remaining=burnAmount,usdcOut=0,invCur=_siv(startTick),tickPos=startTick;
  for(var i=0;i<asc.length;i++){
    var s=asc[i];if(s.Lb<=0)continue;
    var tStart=Math.max(tickPos,s.tL),tEnd=s.tH;
    if(tEnd<=tStart)continue;
    var invStart=_siv(tStart),invEnd=_siv(tEnd);
    var burnCap=s.Lb*(invEnd-invStart);
    if(burnCap<=0)continue;
    if(remaining<=burnCap){
      var invFinal=invStart+remaining/s.Lb;
      usdcOut+=s.Lb*(1/invStart-1/invFinal);
      remaining=0;break;
    }else{
      usdcOut+=s.Lb*(1/invStart-1/invEnd);
      remaining-=burnCap;tickPos=tEnd;
    }
  }
  var sold=burnAmount-remaining;
  var book=burnAmount*tgtP;
  var avgPrice=sold>0?usdcOut/sold:0;
  return {real:usdcOut, book:book, avgPrice:avgPrice, sold:sold, unsold:remaining, model:"v3"};
}
function simBuyImpact(burnBought){
  // Buy BURN → price UP → tick DOWN. Walk segments toward lower ticks.
  if(!burnBought||burnBought<=0||P<=0)return null;
  var segs=_activeLiqSegments();if(!segs||!segs.length)return null;
  var curTick=window._lmapCurTick;
  var desc=segs.filter(function(s){return s.tL<curTick;}).sort(function(a,b){return b.tH-a.tH;});
  var remaining=burnBought,usdcIn=0,invCur=_siv(curTick),tickPos=curTick;
  for(var i=0;i<desc.length;i++){
    var s=desc[i];if(s.Lb<=0)continue;
    var tHi=Math.min(tickPos,s.tH),tLo=s.tL;
    var invHi=_siv(tHi),invLo=_siv(tLo); // invHi>invLo (tHi higher → larger 1/sqrtP)
    var burnCap=s.Lb*(invHi-invLo); // BURN available going up in price (down in tick)
    if(burnCap<=0)continue;
    if(remaining<=burnCap){
      var invFinal=invHi-remaining/s.Lb;
      if(invFinal<=0){return {usdc:usdcIn,newPrice:1e9,partial:true,filled:burnBought-remaining};}
      var spHi=1/invHi,spFinal=1/invFinal;
      usdcIn+=s.Lb*(spFinal-spHi);
      remaining=0;
      var pEnd=1/(invFinal*invFinal);
      return {usdc:usdcIn,newPrice:pEnd};
    }else{
      var sp1=1/invHi,sp2=1/invLo;
      usdcIn+=s.Lb*(sp2-sp1);
      remaining-=burnCap;tickPos=tLo;invCur=invLo;
    }
  }
  var pEnd2=1/(invCur*invCur);
  return {usdc:usdcIn,newPrice:pEnd2,partial:true,filled:burnBought-remaining};
}
function simBuyToPrice(tgtP){
  // How much USDC + BURN to push price UP from current spot to tgtP.
  // Symmetric to simSellImpact (verified vs Uniswap): walks tick segments using the
  // SAME real per-segment liquidity from all scanned LP ranges. Buying raises price →
  // tick DECREASES (price=1e12/1.0001^tick). We walk from curTick down to tgtTick.
  if(!tgtP||tgtP<=P||P<=0)return null;
  var segs=_activeLiqSegments();if(!segs||!segs.length)return null;
  var curTick=window._lmapCurTick;
  var tgtTick=Math.round(Math.log(1e12/tgtP)/Math.log(1.0001));
  if(tgtTick>=curTick)return {usdc:0,burn:0}; // target not above current price
  // Segments below current tick (= above current price). Walk from highest tick down.
  var desc=segs.filter(function(s){return s.tL<curTick;}).sort(function(a,b){return b.tH-a.tH;});
  var usdcIn=0,burnOut=0,tickPos=curTick;
  for(var i=0;i<desc.length;i++){
    var s=desc[i];if(s.Lb<=0)continue;
    // Active span within this segment as we descend: from min(tickPos,tH) down to max(tgtTick,tL)
    var tHi=Math.min(tickPos,s.tH),tLo=Math.max(tgtTick,s.tL);
    if(tHi<=tLo)continue;
    var invHi=_siv(tHi),invLo=_siv(tLo); // invHi>invLo (higher tick → larger 1/sqrtP)
    var spHi=1/invHi,spLo=1/invLo;        // spHi<spLo (sqrtPrice); price rises as tick falls
    // USDC consumed pushing price up across this span = L*(spLo - spHi)
    usdcIn+=s.Lb*(spLo-spHi);
    // BURN received = L*(1/spHi - 1/spLo) = L*(invHi - invLo)
    burnOut+=s.Lb*(invHi-invLo);
    tickPos=tLo;
    if(tickPos<=tgtTick)break;
  }
  return {usdc:usdcIn,burn:burnOut};
}
function runTradeSim(side){
  var amt=parseFloat(document.getElementById("simAmt").value);
  var box=document.getElementById("simResult");
  if(!amt||amt<=0){box.innerHTML='<span style="color:var(--warn)">Bitte eine gültige BURN-Menge eingeben.</span>';return;}
  if(P<=0){box.innerHTML='<span style="color:var(--warn)">Preis noch nicht geladen — kurz warten.</span>';return;}
  var hasV3=window._lmapRanges&&window._lmapRanges.length>0;
  var res,label,color,arrow;
  if(side==="buy"){
    res=hasV3?simBuyImpact(amt):null;
    if(!res&&K>0&&Y>0&&X>0){
      var xn=X-amt;
      if(xn<=0){box.innerHTML='<span style="color:var(--r)">Nicht genug Liquidität im Pool für diese Menge.</span>';return;}
      var yn=K/xn;res={usdc:yn-Y,newPrice:yn/xn,v2:true};
    }
    label="Kauf";color="var(--g)";arrow="▲";
  }else{
    res=hasV3?simSellImpact(amt):null;
    if(!res&&K>0&&Y>0){
      var xn2=X+amt,yn2=K/xn2;res={usdc:Math.max(0,Y-yn2),newPrice:yn2/xn2,v2:true};
    }
    label="Verkauf";color="var(--r)";arrow="▼";
  }
  if(!res){box.innerHTML='<span style="color:var(--warn)">Keine Liquiditätsdaten — bitte erst die Pool Liquidity Map scannen lassen.</span>';return;}
  var impact=P>0?((res.newPrice-P)/P)*100:0;        // FINAL marginal price impact (where price ends up)
  var src=res.v2?"V2 Schätzung":"V3 live (alle LPs)";
  var effAmt=res.partial?res.filled:amt;
  var avgPx=effAmt>0?res.usdc/effAmt:0;
  // AVG price impact = what you actually pay/lose vs spot (the real slippage)
  var avgImpact=P>0?((avgPx-P)/P)*100:0;
  var spotValue=effAmt*P;                            // value at current spot price
  var lossUsd=side==="buy"?(res.usdc-spotValue):(spotValue-res.usdc); // $ lost to slippage+fee
  var lossPct=spotValue>0?(lossUsd/spotValue)*100:0;
  var lossColor=Math.abs(lossPct)>10?"var(--r)":Math.abs(lossPct)>3?"var(--o)":"var(--g)";
  var partialNote=res.partial?'<div style="color:var(--warn);font-size:9px;margin-top:6px">⚠ Pool-Liquidität reicht nur für '+F(res.filled,0)+' BURN ('+(side==="buy"?"darüber kein Angebot":"darunter keine Nachfrage")+')</div>':'';
  box.innerHTML=
    '<div style="background:rgba(8,12,22,.5);border:1px solid '+(side==="buy"?"rgba(34,197,94,.25)":"rgba(248,113,113,.25)")+';border-radius:10px;padding:13px">'+
      '<div style="display:flex;justify-content:space-between;margin-bottom:7px"><span style="color:var(--mt)">'+arrow+' '+label+'</span><span style="color:'+color+';font-weight:700">'+F(effAmt,0)+' BURN</span></div>'+
      '<div style="display:flex;justify-content:space-between;margin-bottom:7px"><span style="color:var(--mt)">'+(side==="buy"?"Kostet dich":"Bringt dir")+'</span><span style="color:var(--tx);font-weight:700">$'+F(res.usdc,2)+' USDC</span></div>'+
      '<div style="display:flex;justify-content:space-between;margin-bottom:7px"><span style="color:var(--mt)">Ø Preis</span><span style="color:var(--tx)">'+FP(avgPx)+'</span></div>'+
      '<div style="display:flex;justify-content:space-between;margin-bottom:9px;padding-bottom:9px;border-bottom:1px solid rgba(48,54,68,.4)"><span style="color:var(--mt)">Preis vorher → danach</span><span style="color:var(--tx)">'+FP(P)+' → <span style="color:'+color+'">'+FP(res.newPrice)+'</span></span></div>'+
      '<div style="display:flex;justify-content:space-between;margin-bottom:7px"><span style="color:var(--tx);font-weight:600">Dein Verlust (Slippage)</span><span style="color:'+lossColor+';font-weight:700">−$'+F(Math.abs(lossUsd),2)+' ('+lossPct.toFixed(2)+'%)</span></div>'+
      '<div style="display:flex;justify-content:space-between"><span style="color:var(--dm);font-size:9px">Finaler Preis-Impact</span><span style="color:var(--dm);font-size:9px">'+(impact>=0?"+":"")+impact.toFixed(2)+'%</span></div>'+
      '<div style="font-size:8px;color:var(--dm);text-align:right;margin-top:7px">'+src+'</div>'+
      partialNote+
    '</div>';
}

// Load cached LP owners from localStorage (closed LPs never change)
try{
  var cachedOwners=localStorage.getItem("lmap_owners");
  if(cachedOwners){window._lpOwners=JSON.parse(cachedOwners);console.log("LMAP: loaded "+window._lpOwners.length+" cached LP owners");}
}catch(e){}

// Render cached LPs immediately when section is toggled open
var _origTog=window.tog;
// Bottom-Nav: springt zur passenden Sektion (öffnet sie, falls eingeklappt) und scrollt hin.
function navJump(which,el){
  try{
    var tabs=document.querySelectorAll(".abar .it");
    for(var i=0;i<tabs.length;i++)tabs[i].classList.remove("on");
    if(el)el.classList.add("on");
    var map={ueber:null,markt:"sec-mkt",steuer:"sec-tax",wallet:"sec-wt-wrap"};
    var secId=map[which];
    if(!secId){window.scrollTo({top:0,behavior:"smooth"});return;}
    var sec=document.getElementById(secId);if(!sec)return;
    var hdr=sec.previousElementSibling;
    // Sektion öffnen, falls eingeklappt
    if(sec.classList.contains("col-b")&&!sec.classList.contains("open")&&hdr&&hdr.classList.contains("col")){
      try{hdr.click();}catch(e){}
    }
    setTimeout(function(){try{(hdr&&hdr.classList.contains("col")?hdr:sec).scrollIntoView({behavior:"smooth",block:"start"});}catch(e){}},90);
  }catch(e){console.log("navJump err:",e&&e.message);}
}
function tog(el,id){
  // Call original toggle
  var body=$(id);if(!body)return;
  var isOpening=!body.classList.contains("open");
  el.classList.toggle("open");body.classList.toggle("open");
  // If opening LP Map and no scan data yet, render from cache
  if(isOpening&&id==="sec-lmap"&&(!lmapCache||lmapTs===0)){
    var cached=window._lpOwners||[];
    if(cached.length>0&&aB>0){
      console.log("LMAP: rendering "+cached.length+" cached owners");
      renderLmap([]);
    }
  }
}
var LMAP_BUCKETS=[.05,.10,.12,.14,.16,.18,.20,.25,.30,.50,.75,1,1.5,2,3,5,10,20,50,100];


async function batchRpc(calls){
  // arb1 has CORS bug with batch requests (duplicate * header) — use dedicated batch endpoints
  var BE=RPC_LIST;
  for(var ri=0;ri<BE.length;ri++){
    try{var ac=new AbortController();var tm=setTimeout(function(){ac.abort();},20000);
      var r=await fetch(BE[ri],{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify(calls),signal:ac.signal});
      clearTimeout(tm);
      if(r.status===429){console.log("Batch["+ri+"] 429, waiting 5s");await new Promise(function(w){setTimeout(w,5000);});continue;}
      var j=await r.json();
      if(Array.isArray(j)&&j.length>0){console.log("Batch OK via "+BE[ri].split("/")[2]);return j;}
    }catch(e){clearTimeout(tm);console.log("Batch["+ri+"] err:",e.message);}
  }
  return null;}

function encI256(v){if(v>=0)return BigInt(v).toString(16).padStart(64,"0");return(2n**256n+BigInt(v)).toString(16);}
function priceToTick(p){if(p<=0)return 0;return Math.round(Math.log(1e12/p)/Math.log(1.0001));}

// Manual "Scan Pool" button: ALWAYS force a fresh scan — invalidate the cache and release the
// concurrency guard (the user explicitly asked; auto-scan politeness rules don't apply here).
// ═══ LP ACTIVITY LOG — who opened/closed which position, when ═══
// Backfill: every known position gets an "open" event with its real mint-block time (works for
// the entire pool history). Closes discovered before the log existed get ts=null ("vor Log-Start");
// closes detected live (position was active on the previous scan, now closed/gone) get the
// detection timestamp. Persisted in localStorage "lp_events", deduped per tokenId+type.
function lpWalletName(addr){
  var a=(addr||"").toLowerCase();
  if(typeof ADDR_BOOK!=="undefined"&&ADDR_BOOK[a])return ADDR_BOOK[a].replace(" ⭐","");
  var PFX={"0x72ade1":"DAO Vault","0x505042":"Noah (DeFi)","0x6e37cc":"Noah (Alt)","0x1b5b96":"Elite","0x0e7121":"Founder","0x6324b1":"Private","0x988966":"Private","0x9ffa19":"Noah"};
  for(var k in PFX){if(a.indexOf(k)===0)return PFX[k];}
  return a.slice(0,6)+"…"+a.slice(-4);
}
function lpLogEvents(lpOwners,headBlk){
  try{
    var ev=[];try{ev=JSON.parse(localStorage.getItem("lp_events")||"[]");}catch(e){}
    var have={};for(var i=0;i<ev.length;i++)have[ev[i].tokenId+":"+ev[i].type]=ev[i];
    var firstRun=(localStorage.getItem("lp_events_backfilled")!=="1");
    var added=0;
    for(var p=0;p<lpOwners.length;p++){
      var o=lpOwners[p];if(!o.tokenId)continue;
      // OPEN event — real time from the mint block (Arbitrum ~0.26 s/block).
      if(!have[o.tokenId+":open"]){
        var ots=(o.mintBlk>0&&headBlk>0)?(Date.now()-(headBlk-o.mintBlk)*260):null;
        var burnAmt=null;
        try{if(!o.closed&&o.liq>0)burnAmt=wtLiqToBurn(o.liq,o.tL,o.tU);}catch(e){}
        var e1={ts:ots,type:"open",tokenId:o.tokenId,owner:o.owner,lo:o.lo,hi:o.hi,burn:burnAmt};
        ev.push(e1);have[o.tokenId+":open"]=e1;added++;
      }else if(have[o.tokenId+":open"]&&have[o.tokenId+":open"].burn==null&&!o.closed&&o.liq>0){
        try{have[o.tokenId+":open"].burn=wtLiqToBurn(o.liq,o.tL,o.tU);}catch(e){}
      }
      // CLOSE event
      if(o.closed&&!have[o.tokenId+":close"]){
        var cts=firstRun?null:Date.now(); // pre-log closes have no reliable time; live ones do
        var openEv=have[o.tokenId+":open"];
        var e2={ts:cts,type:"close",tokenId:o.tokenId,owner:o.owner,lo:o.lo,hi:o.hi,burn:openEv?openEv.burn:null};
        ev.push(e2);have[o.tokenId+":close"]=e2;added++;
      }
    }
    if(added>0||firstRun){
      // newest first (null-ts events sink to the bottom)
      ev.sort(function(a,b){return (b.ts||0)-(a.ts||0);});
      if(ev.length>500)ev=ev.slice(0,500);
      try{localStorage.setItem("lp_events",JSON.stringify(ev));}catch(e){}
      localStorage.setItem("lp_events_backfilled","1");
      console.log("LP-LOG: "+added+" neue Events, gesamt "+ev.length);
    }
    try{renderLpEvents();}catch(e){}
  }catch(e){console.log("lpLogEvents err:",e.message);}
}
function renderLpEvents(){
  var box=$("lpEvB");if(!box)return;
  var ev=[];try{ev=JSON.parse(localStorage.getItem("lp_events")||"[]");}catch(e){}
  if(!ev.length){box.innerHTML='<tr><td colspan="5" style="color:var(--mt);text-align:center;font-size:10px;padding:10px">Noch keine Events — einmal die Liquidity Map scannen.</td></tr>';return;}
  var rows="",shown=0;
  var _Pnow=(typeof P!=="undefined"&&P>0)?P:0; // BURN-Kurs für $-Wert des LP-Kapitals
  for(var i=0;i<ev.length&&shown<80;i++){
    var e=ev[i];shown++;
    var d=e.ts?new Date(e.ts):null;
    var when=d?(d.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"2-digit"})+"<br><span style='color:var(--dm)'>"+d.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})+"</span>"):'<span style="color:var(--dm)">vor Log-Start</span>';
    var badge=e.type==="open"
      ?'<span style="color:#34d399;font-weight:700">➕ OPEN</span>'
      :'<span style="color:#f87171;font-weight:700">➖ CLOSE</span>';
    var name=lpWalletName(e.owner);
    var isMe=(e.owner||"").indexOf("0x9ffa19")===0||(e.owner||"").indexOf("0x505042")===0||(e.owner||"").indexOf("0x6e37cc")===0;
    var rangeTxt=(e.hi>9999)?"Full-Range":("$"+(+e.lo).toFixed(3)+"–"+(+e.hi).toFixed(3));
    var burnTxt=e.burn?(e.burn>=1000?(e.burn/1000).toFixed(1)+"k":Math.round(e.burn)):"—";
    var usdVal=(e.burn&&_Pnow>0)?e.burn*_Pnow:0;
    var usdTxt=usdVal>0?(e.type==="open"?"+":"−")+"$"+F(usdVal,0):"";
    var usdClr=e.type==="open"?"#34d399":"#f87171"; // rein = grün, raus = rot
    rows+='<tr>'+
      '<td style="font-size:8.5px;line-height:1.3">'+when+'</td>'+
      '<td style="font-size:8.5px">'+badge+'</td>'+
      '<td style="font-size:9px;color:'+(isMe?"var(--cy)":"var(--tx)")+'">'+(isMe?"⭐ ":"")+name+'</td>'+
      '<td style="font-size:8.5px;font-family:Geist Mono,monospace">'+rangeTxt+'</td>'+
      '<td style="font-size:8.5px;text-align:right;color:#fdba74;font-family:Geist Mono,monospace">'+burnTxt+' BURN'+(usdTxt?'<br><span style="color:'+usdClr+';font-size:8px;font-weight:600">'+usdTxt+'</span>':'')+'</td>'+
    '</tr>';
  }
  box.innerHTML=rows;
  var st=$("lpEvStatus");if(st)st.textContent=ev.length+" Events · Open-Zeiten on-chain · Close-Zeiten ab Log-Start live";
}
// Fetch REAL close times on-chain: the NFT manager emits DecreaseLiquidity(tokenId indexed,...)
// so we can query logs filtered to exactly our closed tokenIds. Scans BACKWARDS from head
// (closes are usually recent → early exit) in 2M chunks. The LAST (highest-block) event per
// tokenId = the final close. Updates lp_events with real timestamps, then re-sorts + re-renders.
async function lpBackfillCloseTimes(lpOwners,headBlk){
  try{
    if(!headBlk)return;
    var ev=[];try{ev=JSON.parse(localStorage.getItem("lp_events")||"[]");}catch(e){}
    var needIds=[],minMint=headBlk;
    for(var i=0;i<lpOwners.length;i++){
      var o=lpOwners[i];if(!o.closed||!o.tokenId)continue;
      var hasTs=false;
      for(var j=0;j<ev.length;j++){if(ev[j].tokenId===o.tokenId&&ev[j].type==="close"&&ev[j].ts){hasTs=true;break;}}
      if(!hasTs){
        needIds.push("0x"+BigInt(o.tokenId).toString(16).padStart(64,"0"));
        if(o.mintBlk>0&&o.mintBlk<minMint)minMint=o.mintBlk;
      }
    }
    if(!needIds.length)return;
    if(minMint>=headBlk)minMint=100000000;
    var DEC_SIG="0x26f6a048ee9138f2c0ce266f322cb99228e8d619ae2bff30c67f8dcf9d2377b4";
    var found={},foundCount=0;
    $("lmapStatus").textContent="Hole Close-Zeiten ("+needIds.length+" Positionen)...";
    for(var to=headBlk;to>minMint&&foundCount<needIds.length;to-=2000000){
      var from=Math.max(minMint,to-2000000);
      try{
        var r=await batchRpc([{jsonrpc:"2.0",method:"eth_getLogs",params:[{
          address:WT_NFT,topics:[DEC_SIG,needIds],
          fromBlock:"0x"+from.toString(16),toBlock:"0x"+to.toString(16)}],id:0}]);
        if(r&&r[0]&&Array.isArray(r[0].result)){
          for(var L=0;L<r[0].result.length;L++){
            var lg=r[0].result[L];
            var tid=BigInt(lg.topics[1]).toString();
            var blk=parseInt(lg.blockNumber,16);
            if(!found[tid]||blk>found[tid]){if(!found[tid])foundCount++;found[tid]=blk;}
          }
        }
      }catch(e){}
      await new Promise(function(rs){setTimeout(rs,120);});
    }
    var updated=0;
    for(var tid2 in found){
      var cts=Date.now()-(headBlk-found[tid2])*260;
      var got=false;
      for(var k=0;k<ev.length;k++){
        if(ev[k].tokenId===tid2&&ev[k].type==="close"){ev[k].ts=cts;got=true;updated++;break;}
      }
      if(!got){ // close event not yet logged (edge case) — find owner/range from lpOwners
        for(var m=0;m<lpOwners.length;m++){if(lpOwners[m].tokenId===tid2){
          ev.push({ts:cts,type:"close",tokenId:tid2,owner:lpOwners[m].owner,lo:lpOwners[m].lo,hi:lpOwners[m].hi,burn:null});updated++;break;}}
      }
    }
    if(updated>0){
      ev.sort(function(a,b){return (b.ts||0)-(a.ts||0);});
      try{localStorage.setItem("lp_events",JSON.stringify(ev));}catch(e){}
      console.log("LP-LOG: "+updated+" Close-Zeiten on-chain nachgetragen");
      try{renderLpEvents();}catch(e){}
    }
  }catch(e){console.log("lpBackfillCloseTimes err:",e.message);}
}
function forceScanLiqMap(){
  lmapTs=0;
  window._lmapScanning=false;
  try{clearTimeout(window._lmapGuardTimer);}catch(e){}
  try{$("lmapStatus").textContent="Scanning ticks...";}catch(e){}
  // Button-Feedback: alle Scan-Buttons dimmen, nach Scan-Ende zurücksetzen
  var _bs=[];try{_bs=Array.prototype.slice.call(document.querySelectorAll('button[onclick*="forceScanLiqMap"]'));}catch(e){}
  _bs.forEach(function(b){b.disabled=true;b.style.opacity=".5";b.dataset._t=b.textContent;b.textContent="⏳ Scan…";});
  var _done=function(){_bs.forEach(function(b){try{b.disabled=false;b.style.opacity="1";if(b.dataset._t)b.textContent=b.dataset._t;}catch(e){}});};
  try{var _p=scanLiqMap();if(_p&&_p.finally)_p.finally(_done);else setTimeout(_done,30000);}catch(e){_done();}
}
async function scanLiqMap(){
  // Cache lifetime: 4 min (shorter than 5-min auto-scan interval)
  if(lmapCache&&lmapTs>Date.now()-240000){renderLmap(lmapCache);return;}
  // Concurrency guard: never run two scans at once (auto-scan + manual could collide → slow/duplicate work).
  if(window._lmapScanning){console.log("scanLiqMap: already running, skipped");return;}
  window._lmapScanning=true;
  // Safety net: if a scan hangs (RPC timeout), auto-release the guard after 90s so future
  // scans aren't blocked forever.
  try{clearTimeout(window._lmapGuardTimer);}catch(e){}
  window._lmapGuardTimer=setTimeout(function(){window._lmapScanning=false;},90000);
  var hasCached=window._lpOwners&&window._lpOwners.length>0;
  if(!hasCached){
    $("lmapB").innerHTML='<tr><td colspan="6"><span class="skel" style="width:100%;height:14px"></span></td></tr><tr><td colspan="6"><span class="skel" style="width:100%;height:14px"></span></td></tr>';
  }
  $("lmapStatus").textContent=hasCached?"Refreshing...":"Scanning ticks...";
  try{
    // 1. slot0 + tickSpacing + liquidity (3 calls)
    var s0=await wtRpc(POOL,"0x3850c7bd");
    if(!s0||s0.length<130)throw"slot0 fail";
    var curTickB=BigInt("0x"+s0.slice(66,130));
    if(curTickB>=2n**255n)curTickB-=2n**256n;
    var curTick=Number(curTickB);
    var tsH=await wtRpc(POOL,"0xd0c93a7c");
    var tSpacing=60;
    if(tsH&&tsH.length>2){var tsB=BigInt("0x"+tsH.slice(2));if(tsB>=2n**255n)tsB-=2n**256n;tSpacing=Number(tsB);}
    if(tSpacing<=0)tSpacing=60;
    var liqH=await wtRpc(POOL,"0x1a686502");
    var curLiq=0;if(liqH&&liqH.length>2)curLiq=Number(BigInt("0x"+liqH.slice(2)));
    POOL_LIQ=curLiq; // Also update global for buyflow
    console.log("LMAP: tick="+curTick+" spacing="+tSpacing+" liq="+curLiq);

    // 2. Batch bitmap scan (±8 words)
    var curComp=Math.floor(curTick/tSpacing);
    var curWord=curComp>=0?curComp>>8:Math.floor(curComp/256);
    var bmCalls=[];
    for(var w=curWord-8;w<=curWord+8;w++){
      bmCalls.push({jsonrpc:"2.0",method:"eth_call",params:[{to:POOL,data:"0x5339c296"+encI256(w)},"latest"],id:bmCalls.length,_w:w});}
    $("lmapStatus").textContent="Scanning "+bmCalls.length+" bitmap words...";
    var bmResults=await batchRpc(bmCalls.map(function(c){return{jsonrpc:c.jsonrpc,method:c.method,params:c.params,id:c.id};}));
    var initTicks=[];
    if(bmResults){for(var bi2=0;bi2<bmResults.length;bi2++){
      var br=bmResults[bi2];if(!br||!br.result||br.result==="0x"||br.result.length<66)continue;
      var bm=BigInt("0x"+br.result.slice(2));if(bm===0n)continue;
      var wordIdx=bmCalls[bi2]._w;
      for(var bit=0;bit<256;bit++){if((bm>>BigInt(bit))&1n){initTicks.push((wordIdx*256+bit)*tSpacing);}}}}
    initTicks.sort(function(a,b){return a-b;});
    console.log("LMAP: "+initTicks.length+" initialized ticks");
    await new Promise(function(r){setTimeout(r,1000);}); // cooldown after bitmap batch

    // 3. Batch tick data reads (30 per batch, 500ms delay)
    $("lmapStatus").textContent="Reading "+initTicks.length+" ticks...";
    var tickData=[];
    var tickCalls=initTicks.slice(0,120).map(function(t,i){
      return{jsonrpc:"2.0",method:"eth_call",params:[{to:POOL,data:"0xf30dba93"+encI256(t)},"latest"],id:i,_tick:t};});
    for(var b=0;b<tickCalls.length;b+=10){
      if(b>0)await new Promise(function(r){setTimeout(r,2500);});
      var batch=tickCalls.slice(b,b+10);
      var tMeta=batch.map(function(c){return c._tick;});
      var tRes=await batchRpc(batch.map(function(c){return{jsonrpc:c.jsonrpc,method:c.method,params:c.params,id:c.id};}));
      if(!tRes)continue;
      for(var ri=0;ri<tRes.length;ri++){
        if(!tRes[ri]||!tRes[ri].result||tRes[ri].result.length<130)continue;
        var lnB=BigInt("0x"+tRes[ri].result.slice(66,130));
        if(lnB>=2n**255n)lnB-=2n**256n;
        tickData.push({tick:tMeta[ri],liqNet:Number(lnB)});}
      $("lmapStatus").textContent="Read "+Math.min(b+10,tickCalls.length)+"/"+tickCalls.length+" ticks ("+tickData.length+" active)";}
    console.log("LMAP: "+tickData.length+" tick data decoded");

    // 4. Find LP owners: Pool Mint Events → Receipts → Token IDs → ownerOf
    var lpOwners=[];
    var _prevOwners=window._lpOwners||[];
    $("lmapStatus").textContent="Scanning pool history...";
    try{
      var myD=W_DEFI.toLowerCase(),myL=W_LEDGER.toLowerCase();
      var nfmLow=WT_NFT.toLowerCase();
      var MINT_SIG="0x7a53080ba414158be7ec69b987b5fb7d07dee101fe85488f0853ae16239d0bde";
      var XFER_SIG="0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

      // STEP 1: Get ALL Pool Mint events (entire history)
      var bnRes2=await batchRpc([{jsonrpc:"2.0",method:"eth_blockNumber",params:[],id:0}]);
      var headBlk=0;if(bnRes2&&bnRes2[0]&&bnRes2[0].result)headBlk=parseInt(bnRes2[0].result,16);
      var mintLogs=[];
      if(headBlk>0){
        for(var mc=100000000;mc<headBlk;mc+=2000000){
          try{
            var mTo=Math.min(mc+2000000,headBlk);
            var mR=await batchRpc([{jsonrpc:"2.0",method:"eth_getLogs",params:[{
              address:POOL,topics:[MINT_SIG],
              fromBlock:"0x"+mc.toString(16),toBlock:"0x"+mTo.toString(16)
            }],id:0}]);
            if(mR&&mR[0]&&Array.isArray(mR[0].result)&&mR[0].result.length>0){
              mintLogs=mintLogs.concat(mR[0].result);
            }
          }catch(e3){}
          await new Promise(function(r){setTimeout(r,150);});
        }
      }
      console.log("LMAP: "+mintLogs.length+" Pool Mint events found (total history)");
      $("lmapStatus").textContent=mintLogs.length+" liquidity additions found...";

      // STEP 2: Get receipts → extract NFT token IDs
      var txSet={},txBlk={};
      for(var ml=0;ml<mintLogs.length;ml++){if(mintLogs[ml].transactionHash){txSet[mintLogs[ml].transactionHash]=1;
        try{txBlk[mintLogs[ml].transactionHash]=parseInt(mintLogs[ml].blockNumber,16);}catch(e){}}}
      var txList=Object.keys(txSet);
      console.log("LMAP: "+txList.length+" unique Mint transactions");
      var allTokenIds=[];

      for(var ti=0;ti<txList.length;ti++){
        try{
          var receipt=null;
          for(var rci=0;rci<RPC_LIST.length&&!receipt;rci++){
            try{
              var ac3=new AbortController();var tm3=setTimeout(function(){ac3.abort();},12000);
              var rr3=await fetch(RPC_LIST[rci],{method:"POST",headers:{"Content-Type":"application/json"},
                body:JSON.stringify({jsonrpc:"2.0",method:"eth_getTransactionReceipt",params:[txList[ti]],id:1}),signal:ac3.signal});
              clearTimeout(tm3);
              var rj3=await rr3.json();
              if(rj3.result&&rj3.result.logs)receipt=rj3.result;
            }catch(erc3){clearTimeout(tm3);}
          }
          if(!receipt){console.log("LMAP: receipt failed tx "+txList[ti].slice(0,10));continue;}
          // Find NFT mint events (Transfer from 0x0 on NFM)
          for(var rli=0;rli<receipt.logs.length;rli++){
            var rl=receipt.logs[rli];
            if(!rl.address||!rl.topics||rl.topics.length<4)continue;
            if(rl.address.toLowerCase()===nfmLow&&rl.topics[0]===XFER_SIG){
              var from3="0x"+rl.topics[1].slice(26);
              if(from3==="0x0000000000000000000000000000000000000000"){
                var minter="0x"+rl.topics[2].slice(26).toLowerCase();
                var tokenId=BigInt(rl.topics[3]);
                allTokenIds.push({id:tokenId,minter:minter,tx:txList[ti].slice(0,10),mintBlk:txBlk[txList[ti]]||0});
              }
            }
          }
        }catch(eti){console.log("LMAP: receipt err:",eti.message);}
        if(ti%5===0){
          $("lmapStatus").textContent="Receipts "+(ti+1)+"/"+txList.length+" ("+allTokenIds.length+" NFTs)";
          await new Promise(function(r){setTimeout(r,150);});
        }
      }
      console.log("LMAP: "+allTokenIds.length+" LP NFT token IDs extracted from receipts");

      // STEP 3+4: For each token ID → ownerOf + positions
      $("lmapStatus").textContent="Checking "+allTokenIds.length+" LP NFTs...";
      var nftChecked=0,nftActive=0,uniqueOwners={};
      var closedIds=[];

      for(var ni2=0;ni2<allTokenIds.length;ni2++){
        try{
          nftChecked++;
          var tid=allTokenIds[ni2].id;
          var ownerHex=await wtRpc(WT_NFT,"0x6352211e"+wtPad(tid));
          var owner=allTokenIds[ni2].minter;
          if(ownerHex&&ownerHex.length>=66){
            owner="0x"+ownerHex.slice(26,66).toLowerCase();
          }
          var psH=await wtRpc(WT_NFT,"0x99fbab88"+wtPad(tid));
          if(!psH||psH.length<770){
            console.log("LMAP: NFT #"+tid+" — reverted (burned?)");continue;
          }
          var pd=psH.slice(2);
          var pt0="0x"+pd.slice(152,192),pt1="0x"+pd.slice(216,256);
          if(pt0.toLowerCase()!==USDC_TK.toLowerCase()||pt1.toLowerCase()!==BURN_TK.toLowerCase()){continue;}
          var pLiq=BigInt("0x"+pd.slice(448,512));
          var isClosed=pLiq<=0n;
          if(isClosed){
            console.log("LMAP: NFT #"+tid+" owner="+owner.slice(0,8)+"..."+owner.slice(-4)+" — closed");
            closedIds.push(tid);
          }
          var ptL=wtI24(pd.slice(378,384)),ptU=wtI24(pd.slice(442,448));
          var isFullRange=Math.abs(ptU-ptL)>800000;
          var ppHi,ppLo;
          if(isFullRange){ppLo=0.0001;ppHi=999999;}
          else{ppHi=wtTickToPrice(ptL);ppLo=wtTickToPrice(ptU);}
          if(ppLo<=0||ppHi<=ppLo)continue;
          var myAlt="0x6e37cc";
          var isMe=owner===myD||owner===myL||owner.indexOf(myAlt)===0;
          if(!isClosed)nftActive++;
          uniqueOwners[owner]=1;
          if(!isClosed)console.log("LMAP: ✅ #"+tid+" owner="+owner.slice(0,8)+"..."+owner.slice(-4)+" "+(isFullRange?"FULL RANGE":"$"+ppLo.toFixed(3)+"→$"+ppHi.toFixed(2))+" liq="+pLiq+(isMe?" ⭐":""));
          lpOwners.push({lo:ppLo,hi:ppHi,owner:owner,isMe:isMe,liq:Number(pLiq),closed:isClosed,tokenId:tid.toString(),tL:ptL,tU:ptU,burnOut:0,usdcOut:0,mintBlk:allTokenIds[ni2].mintBlk||0});
        }catch(e5){continue;}
        if(ni2%5===0){
          $("lmapStatus").textContent="NFT "+(ni2+1)+"/"+allTokenIds.length+" ("+nftActive+" active)";
          await new Promise(function(r){setTimeout(r,100);});
        }
      }

      // STEP 4b: Fetch Collect events for closed LPs to get withdrawn amounts
      if(closedIds.length>0){
        $("lmapStatus").textContent="Reading "+closedIds.length+" closed LP histories...";
        var COLLECT_SIG="0x40d0efd1a53d60ecbf40971b9daf7dc90178c3aadc7aab1765632738fa8b8f01";
        for(var ci4=0;ci4<closedIds.length;ci4++){
          try{
            var cTid=closedIds[ci4];
            var tidHex="0x"+BigInt(cTid).toString(16).padStart(64,"0");
            var cR=await batchRpc([{jsonrpc:"2.0",method:"eth_getLogs",params:[{
              address:WT_NFT,
              topics:[COLLECT_SIG,tidHex],
              fromBlock:"0x5F5E100",
              toBlock:"latest"
            }],id:0}]);
            if(cR&&cR[0]&&Array.isArray(cR[0].result)&&cR[0].result.length>0){
              var totalUsdc=0,totalBurn=0;
              for(var ce=0;ce<cR[0].result.length;ce++){
                var cData=cR[0].result[ce].data;
                if(!cData||cData.length<194)continue;
                var cd=cData.slice(2);
                var amt0=parseInt(cd.slice(64,128),16)/1e6;
                var amt1raw=cd.slice(128,192);
                var amt1=0;
                try{amt1=Number(BigInt("0x"+amt1raw))/1e18;}catch(e){amt1=parseInt(amt1raw,16)/1e18;}
                totalUsdc+=amt0;
                totalBurn+=amt1;
              }
              // Find this LP in lpOwners and update
              for(var lo2=0;lo2<lpOwners.length;lo2++){
                if(lpOwners[lo2].tokenId===cTid.toString()&&lpOwners[lo2].closed){
                  lpOwners[lo2].usdcOut=Math.round(totalUsdc*100)/100;
                  lpOwners[lo2].burnOut=Math.round(totalBurn);
                  console.log("LMAP: #"+cTid+" collected: "+totalBurn.toFixed(0)+" BURN + $"+totalUsdc.toFixed(2)+" USDC");
                  // Bridge to realized history: if this is MY closed position and the
                  // lpPrevious-diff missed it (opened+closed between scans), book it now.
                  try{
                    if(lpOwners[lo2].isMe&&typeof reconcileClosedFromChain==="function"){
                      reconcileClosedFromChain(cTid.toString(),lpOwners[lo2].lo,lpOwners[lo2].hi,totalBurn,totalUsdc);
                    }
                  }catch(eRec){}
                  break;
                }
              }
            }
          }catch(e7){}
          if(ci4%3===0){await new Promise(function(r){setTimeout(r,200);});
            $("lmapStatus").textContent="History "+(ci4+1)+"/"+closedIds.length;}
        }
      }

      // STEP 5: Also scan extra wallets from input field
      try{
        var extraInput=$("lmapExtra")?$("lmapExtra").value:"";
        // ALWAYS scan: DAO Vault + Ledger + DeFi — guarantees they appear even if Mint-event scan misses them
        var alwaysScan=[DAO_VAULT.toLowerCase(),W_LEDGER.toLowerCase(),W_DEFI.toLowerCase()];
        var extras=extraInput?extraInput.split(/[,\n\s]+/).map(function(a){return a.trim().toLowerCase();}).filter(function(a){return/^0x[0-9a-f]{40}$/.test(a);}):[];
        for(var asi=0;asi<alwaysScan.length;asi++){if(extras.indexOf(alwaysScan[asi])===-1)extras.push(alwaysScan[asi]);}
        if(extras.length>0){
          for(var ei=0;ei<extras.length;ei++){
            var eAddr=extras[ei];
            if(uniqueOwners[eAddr])continue; // already found via Mint scan
            try{
              var enH=await rpc(WT_NFT,bof(eAddr));
              var enC=parseInt(enH,16);
              if(enC<=0||enC>200)continue;
              console.log("LMAP: extra wallet "+eAddr.slice(0,8)+"... has "+enC+" NFTs");
              for(var eni=0;eni<enC&&eni<50;eni++){
                try{
                  var etiH=await wtRpc(WT_NFT,"0x2f745c59"+eAddr.slice(2).padStart(64,"0")+wtPad(eni));
                  if(!etiH)continue;
                  var etId=BigInt("0x"+etiH.slice(2));
                  var epsH=await wtRpc(WT_NFT,"0x99fbab88"+wtPad(etId));
                  if(!epsH||epsH.length<770)continue;
                  var epd=epsH.slice(2);
                  var ept0="0x"+epd.slice(152,192),ept1="0x"+epd.slice(216,256);
                  if(ept0.toLowerCase()!==USDC_TK.toLowerCase()||ept1.toLowerCase()!==BURN_TK.toLowerCase())continue;
                  var epLiq=BigInt("0x"+epd.slice(448,512));
                  if(epLiq<=0n)continue;
                  var eptL=wtI24(epd.slice(378,384)),eptU=wtI24(epd.slice(442,448));
                  var eisFR=Math.abs(eptU-eptL)>800000;
                  var eppHi,eppLo;
                  if(eisFR){eppLo=0.0001;eppHi=999999;}
                  else{eppHi=wtTickToPrice(eptL);eppLo=wtTickToPrice(eptU);}
                  if(eppLo<=0||eppHi<=eppLo)continue;
                  var eisMe=eAddr===myD||eAddr===myL;
                  nftActive++;
                  console.log("LMAP: ✅ EXTRA #"+etId+" owner="+eAddr.slice(0,8)+"... "+(eisFR?"FULL":"$"+eppLo.toFixed(3)+"→$"+eppHi.toFixed(2)));
                  lpOwners.push({lo:eppLo,hi:eppHi,owner:eAddr,isMe:eisMe,liq:Number(epLiq),tL:eptL,tU:eptU,closed:false,tokenId:etId.toString()});
                }catch(e5b){continue;}
              }
            }catch(e4b){continue;}
          }
          if(extraInput)localStorage.setItem("lmap_extra",extraInput);
        }
      }catch(ee2){}

      console.log("LMAP FINAL: "+allTokenIds.length+" NFTs from Mint events, "+nftChecked+" checked, "+nftActive+" active, "+Object.keys(uniqueOwners).length+" unique owners");
    }catch(e6){console.log("LMAP owner scan err:",e6);}

    // 5. Reconstruct liquidity per range
    var MIN_TICK=-887272,MAX_TICK=887272; // Uniswap V3 absolute tick bounds
    var ranges=[];
    var below=tickData.filter(function(t){return t.tick<=curTick;}).sort(function(a,b){return b.tick-a.tick;});
    var L=curLiq,prev=curTick;
    for(var b2=0;b2<below.length;b2++){
      if(prev!==below[b2].tick)ranges.push({tL:below[b2].tick,tH:prev,liq:L});
      L-=below[b2].liqNet;prev=below[b2].tick;}
    // Tail below: remaining liquidity after last boundary belongs to full-range positions (DAO).
    // Extend it down to MIN_TICK so price can rise (tick falls) past the last LP without freezing.
    if(L>0&&prev>MIN_TICK)ranges.push({tL:MIN_TICK,tH:prev,liq:L});
    var above=tickData.filter(function(t){return t.tick>curTick;}).sort(function(a,b){return a.tick-b.tick;});
    L=curLiq;prev=curTick;
    for(var a2=0;a2<above.length;a2++){
      if(prev!==above[a2].tick)ranges.push({tL:prev,tH:above[a2].tick,liq:L});
      L+=above[a2].liqNet;prev=above[a2].tick;}
    // Tail above: remaining liquidity extends up to MAX_TICK (price falls / sell side full-range depth).
    if(L>0&&prev<MAX_TICK)ranges.push({tL:prev,tH:MAX_TICK,liq:L});

    // 6. Aggregate into price buckets
    // Identify DAO full-range liquidity (owner position with hi>100000 = full range marker).
    // Its liquidity L is constant across all ticks, so we compute its BURN share per bucket
    // via the V3 formula and separate it from external concentrated LPs.
    var daoLiq=0;
    for(var doi2=0;doi2<lpOwners.length;doi2++){
      var dp=lpOwners[doi2];
      if(!dp.closed&&dp.hi>100000&&dp.liq>0)daoLiq+=dp.liq;
    }
    var buckets=[];
    for(var bi=0;bi<LMAP_BUCKETS.length-1;bi++){
      var bLo=LMAP_BUCKETS[bi],bHi=LMAP_BUCKETS[bi+1];
      var bkTickHi=priceToTick(bLo),bkTickLo=priceToTick(bHi);
      var burnD=0;
      for(var ri2=0;ri2<ranges.length;ri2++){
        var rr=ranges[ri2];if(rr.liq<=0)continue;
        var oL=Math.max(rr.tL,bkTickLo),oH=Math.min(rr.tH,bkTickHi);
        if(oL>=oH)continue;
        burnD+=rr.liq*(Math.pow(1.0001,oH/2)-Math.pow(1.0001,oL/2))/1e18;}
      // DAO's BURN in this bucket: same V3 formula, but only the DAO's constant liquidity.
      var daoBurnD=0;
      if(daoLiq>0){
        var dcL=Math.max(bkTickLo,-887272),dcH=Math.min(bkTickHi,887272);
        if(dcH>dcL){
          var dv=daoLiq*(Math.pow(1.0001,dcH/2)-Math.pow(1.0001,dcL/2))/1e18;
          if(isFinite(dv)&&dv>0)daoBurnD=dv;
        }
      }
      if(daoBurnD>burnD)daoBurnD=burnD; // never more than total
      var extBurnD=Math.max(0,burnD-daoBurnD);
      var owners=[];
      for(var oi=0;oi<lpOwners.length;oi++){if(lpOwners[oi].hi>bLo&&lpOwners[oi].lo<bHi)owners.push(lpOwners[oi]);}
      owners.sort(function(a,b2){return b2.liq-a.liq;});
      var midP=(bLo+bHi)/2;
      buckets.push({lo:bLo,hi:bHi,burn:burnD,daoBurn:daoBurnD,extBurn:extBurnD,usdc:burnD*midP,extUsdc:extBurnD*midP,active:P>=bLo&&P<bHi,owners:owners});}
    // CALIBRATE BUCKETS to on-chain pool reserves — eliminates wtLiqToBurn() Full-Range overflow
    // Without this, DAO 6M BURN deposit pollutes every bucket via tick-overlap math.
    // Strategy: keep relative distribution across price ranges, scale absolute values to aB/aU truth.
    try{
      var sumBucketBurn=0,sumBucketUsdc=0;
      for(var sbi=0;sbi<buckets.length;sbi++){sumBucketBurn+=buckets[sbi].burn;sumBucketUsdc+=buckets[sbi].usdc;}
      if(sumBucketBurn>0&&aB>0){
        var calB=aB/sumBucketBurn;
        var calU=(sumBucketUsdc>0&&aU>0)?(aU/sumBucketUsdc):calB;
        for(var cbi=0;cbi<buckets.length;cbi++){
          buckets[cbi].burnRaw=buckets[cbi].burn;
          buckets[cbi].usdcRaw=buckets[cbi].usdc;
          buckets[cbi].burn*=calB;
          buckets[cbi].usdc*=calU;
          // Keep the DAO/external split consistent with the calibrated totals.
          if(buckets[cbi].daoBurn)buckets[cbi].daoBurn*=calB;
          if(buckets[cbi].extBurn)buckets[cbi].extBurn*=calB;
          if(buckets[cbi].extUsdc)buckets[cbi].extUsdc*=calU;
        }
        console.log("LMAP CALIBRATION: raw-sum="+F(sumBucketBurn,0)+" BURN → on-chain aB="+F(aB,0)+" (factor "+calB.toFixed(4)+") | usdc factor "+calU.toFixed(4));
      }
    }catch(e){console.log("LMAP calib err:",e.message);}
    var bucketsWithOwners=0;for(var boi=0;boi<buckets.length;boi++){if(buckets[boi].owners&&buckets[boi].owners.length>0)bucketsWithOwners++;}
    console.log("LMAP: "+buckets.length+" buckets, "+bucketsWithOwners+" have LP owners assigned");
    lmapCache=buckets;lmapTs=Date.now();
    // Store raw tick ranges (with REAL on-chain liquidity L) + current tick globally,
    // so the trade simulator can use exact V3 concentrated-liquidity math instead of
    // the coarse bucket approximation. Lb (BURN-unit liquidity) = L_raw / 1e12.
    window._lmapRanges=ranges;window._lmapCurTick=curTick;
    // Pool reserves + price for the heatmap (BURN above price calibrates to aB, USDC below to aU).
    try{window._poolAB=aB;window._poolAU=aU;window._lmapP=P;localStorage.setItem("lmap_reserves",JSON.stringify({aB:aB,aU:aU,p:P,ts:Date.now()}));}catch(e){}
    // Cache closed LPs permanently (they never change)
    try{
      var closedLPs=[];
      for(var cli=0;cli<lpOwners.length;cli++){if(lpOwners[cli].closed)closedLPs.push(lpOwners[cli]);}
      if(closedLPs.length>0)localStorage.setItem("lmap_closed",JSON.stringify(closedLPs));
      localStorage.setItem("lmap_owners",JSON.stringify(lpOwners));
      // Cache buckets so V3 buyflow works immediately on next app start
      try{localStorage.setItem("lmap_buckets",JSON.stringify({buckets:buckets,ts:Date.now()}));}catch(e3){}
      // Cache raw ranges + curTick so the trade simulator / market analysis use exact
      // V3 tick-liquidity immediately on next app start (instead of falling back to V2).
      try{
        var slimRanges=[];
        for(var ri=0;ri<ranges.length;ri++){if(ranges[ri].liq>0)slimRanges.push({tL:ranges[ri].tL,tH:ranges[ri].tH,liq:ranges[ri].liq});}
        localStorage.setItem("lmap_ranges",JSON.stringify({ranges:slimRanges,curTick:curTick,ts:Date.now()}));
      }catch(e4){}
      window._lpOwners=lpOwners;
      try{lpLogEvents(lpOwners,headBlk);}catch(e){console.log("lp-log err:",e.message);}
      try{await lpBackfillCloseTimes(lpOwners,headBlk);}catch(e){console.log("close-times err:",e.message);}
      console.log("LMAP: cached "+closedLPs.length+" closed + "+lpOwners.length+" total LPs + "+buckets.length+" buckets");
    }catch(e){}
    // Update DAO Full Range LP with real on-chain data
    try{
      var daoAddr=DAO_VAULT.toLowerCase();
      for(var doi=0;doi<lpOwners.length;doi++){
        if(lpOwners[doi].owner.toLowerCase()===daoAddr&&!lpOwners[doi].closed&&lpOwners[doi].hi>100000){
          // Full range: can't use wtLiqToBurn (overflow). Use pool reserves proportion.
          var poolLiq3=POOL_LIQ||0;
          if(poolLiq3>0&&aB>0){
            var realBurn=aB*(lpOwners[doi].liq/poolLiq3);
            if(realBurn>0){LP_DAO.b=realBurn;console.log("LMAP: DAO LP updated: "+realBurn.toFixed(0)+" BURN (pool share: "+(lpOwners[doi].liq/poolLiq3*100).toFixed(1)+"%)");}
          }
          break;
        }
      }
    }catch(e){}
    renderLmap(buckets);
    // ═══ SINGLE SOURCE OF TRUTH ═══
    // Rebuild LP[] (the "My Active LP Positions" table) from THE SAME scan data (lpOwners),
    // instead of a separate fetchLPs() scan. This guarantees both tables show identical
    // numbers — they now share one scan, one price, one moment. Filters to MY wallets (isMe).
    try{
      var myLPs=[];
      for(var ml=0;ml<lpOwners.length;ml++){
        var lo3=lpOwners[ml];
        if(!lo3.isMe||lo3.closed)continue;
        if(lo3.hi>100000)continue; // skip full-range (DAO-style), shown separately
        // Convert this position's on-chain liquidity to BURN deposited (burnIn)
        var burnIn=0;
        try{burnIn=wtLiqToBurn(lo3.liq,lo3.tL,lo3.tU);}catch(e){}
        if(!(burnIn>0))continue;
        myLPs.push({b:Math.round(burnIn),lo:Math.round(lo3.lo*1000000)/1000000,hi:Math.round(lo3.hi*1000000)/1000000,label:"Sell"}); // COHERENCE v3: tick-exact bounds
      }
      if(lpOwners.length>0){
        // WICHTIG: auch bei 0 eigenen Positionen LP[] neu setzen — sonst bleiben
        // rausgezogene Positionen (Next Fill / My Active LPs) fuer immer stehen.
        myLPs.sort(function(a,b){return a.lo-b.lo;});
        var daoKeep=null;for(var dk=0;dk<LP.length;dk++){if(LP[dk].fr)daoKeep=LP[dk];}
        try{detectClosedLPs(myLPs);}catch(e){console.log("detectClose(lmap) err:",e);}
        LP=myLPs.slice();if(daoKeep)LP.push(daoKeep);
        LP.sort(function(a,b){if(a.fr)return 1;if(b.fr)return-1;return a.lo-b.lo;});
        ALP=0;for(var al=0;al<LP.length;al++)if(!LP[al].fr)ALP+=LP[al].b;
        lpLive=true;
        console.log("LP[] synced from scanLiqMap: "+myLPs.length+" of my positions (single source)");
        try{
          var slimMy=[];for(var sm=0;sm<myLPs.length;sm++)slimMy.push(myLPs[sm]);
          localStorage.setItem("lp_cache",JSON.stringify({lps:slimMy,ts:Date.now()}));
        }catch(e){}
        var _ppPrev2=0;try{_ppPrev2=poolPriceExact();}catch(e){}
        lpPrevious=myLPs.map(function(lp){
          var cv3=_ppPrev2>0?v3(lp.b,lp.lo,lp.hi,_ppPrev2):{left:lp.b,usdc:0,pct:0};
          return{b:lp.b,lo:lp.lo,hi:lp.hi,left:cv3.left,usdc:cv3.usdc,pct:cv3.pct,ts:Date.now()};
        });
        try{localStorage.setItem("lp_previous",JSON.stringify(lpPrevious));}catch(e){}
        try{render();}catch(e){}
      }
    }catch(e){console.log("LP sync err:",e.message);}
    if($("lmapStatus"))$("lmapStatus").innerHTML='<span style="color:var(--g)">✓ Live scan · '+new Date().toLocaleTimeString()+'</span>';
    // Re-render Market Analysis + Sell Impact with fresh V3 data
    console.log("LMAP DONE: cache="+(lmapCache?lmapCache.length:0)+" buckets, P="+P+", calling render()");
    try{if(P>0){render();console.log("LMAP: post-render done, hasV3="+(lmapCache&&lmapCache.length>0));}}catch(e){console.log("post-lmap render err:",e.message);}
  }catch(e){console.log("LMAP err:",e);
    // Keep previous owners if scan fails
    if(!window._lpOwners||window._lpOwners.length===0){
      try{var co=localStorage.getItem("lmap_owners");if(co)window._lpOwners=JSON.parse(co);}catch(e2){}
    }
    var cachedOwn=window._lpOwners||[];
    if(cachedOwn.length>0){
      $("lmapB").innerHTML='<tr><td colspan="6" style="color:var(--warn);text-align:center;font-size:10px">Live scan failed — showing '+cachedOwn.length+' cached positions <button class="btn" onclick="lmapCache=null;forceScanLiqMap()">retry</button></td></tr>';
      renderLmap([]);
    }else{
      $("lmapB").innerHTML='<tr><td colspan="6" style="color:var(--r);text-align:center">Liquidity scan unavailable — <button class="btn" onclick="scanLiqMap()">retry</button></td></tr>';
    }
    $("lmapStatus").textContent="";}
  window._lmapScanning=false;
  try{clearTimeout(window._lmapGuardTimer);}catch(e){}
}

// ═══ VISUAL DEPTH CHART: BURN distribution across price ranges ═══
// Horizontal bars per price bucket — instantly shows WHERE (which price) HOW MUCH BURN sits.
// Current price marked, own positions highlighted, DAO full-range shown separately.
// Standalone Depth-Chart card — renders BURN distribution from the live lmapCache into its own
// card below the Liquidity Map. If nothing scanned yet, kicks off a scan first.
// How much USDC do you get by selling BURN until the price drops to targetPrice (< current)?
// Walks the active liquidity segments downward (selling BURN pushes price down = tick up).
// Returns {usdc, burn} — the USDC received and BURN sold to reach targetPrice.
function sellDownToPrice(targetPrice){
  if(!targetPrice||P<=0||targetPrice>=P)return{usdc:0,burn:0};
  var segs=_activeLiqSegments();if(!segs||!segs.length)return{usdc:0,burn:0};
  var curTick=window._lmapCurTick;
  var targetTick=priceToTick(targetPrice); // lower price = higher tick
  var asc=segs.filter(function(s){return s.tH>curTick;}).sort(function(a,b){return a.tL-b.tL;});
  var usdcOut=0,burnSold=0;
  var tickPos=curTick;
  for(var i=0;i<asc.length;i++){
    var s=asc[i];if(s.Lb<=0)continue;
    var tStart=Math.max(tickPos,s.tL),tEnd=Math.min(s.tH,targetTick);
    if(tEnd<=tStart)continue;
    var invStart=_siv(tStart),invEnd=_siv(tEnd);
    var burnCap=s.Lb*(invEnd-invStart);
    var spStart=1/invStart,spEnd=1/invEnd;
    usdcOut+=s.Lb*(spStart-spEnd);
    burnSold+=burnCap;
    tickPos=tEnd;
    if(tickPos>=targetTick)break;
  }
  return{usdc:usdcOut,burn:burnSold};
}
function showDepthCard(){
  var box=$("depthChartCard");if(!box)return;
  if(lmapCache&&lmapCache.length){
    renderDepthChart(lmapCache,"depthChartCard");
  }else{
    box.innerHTML='<div style="color:var(--mt);font-size:10px;text-align:center;padding:16px">Scanne Pool Liquidity Map… <br>einen Moment, dann erscheint der Chart.</div>';
    try{forceScanLiqMap();}catch(e){}
    var tries=0;var iv=setInterval(function(){
      tries++;
      if(lmapCache&&lmapCache.length){clearInterval(iv);renderDepthChart(lmapCache,"depthChartCard");}
      else if(tries>30){clearInterval(iv);box.innerHTML='<div style="color:var(--warn);font-size:10px;text-align:center;padding:16px">Scan hat zu lange gedauert. Bitte oben manuell „Scan Pool" drücken, dann hier erneut.</div>';}
    },1000);
  }
}
// ═══ PROFESSIONAL TWO-SIDED DEPTH CHART ═══
// Current price in the middle. ABOVE = sell walls (BURN that must be bought to push price up).
// BELOW = support depth (USDC you'd receive selling down to each level). This matches how a
// trader actually reads a BURN market: resistance above, realizable value below.
function renderDepthChart(buckets,targetId){
  // ═══ LIQUIDITY HEATMAP (orderbook-style, Bookmap-inspired) ═══
  // Vertical price ladder in uniform 1-cent steps. ABOVE the current price only BURN sits
  // (sell walls — the pool can only hold BURN there); BELOW the price only USDC sits (the
  // BURN there is already bought; USDC waits as buy support). Bar intensity = amount (heatmap).
  // Computed EXACTLY from the raw tick ranges (V3 math), calibrated to on-chain reserves.
  var box=$(targetId||"depthChart");if(!box)return;
  var ranges=window._lmapRanges,curTick=window._lmapCurTick;
  var px=(typeof P!=="undefined"&&P>0)?P:(window._lmapP||0);
  if(!ranges||!ranges.length||!curTick||!(px>0)){
    box.innerHTML='<div style="color:var(--mt);font-size:10px;text-align:center;padding:16px">Erst die Pool Liquidity Map scannen lassen.</div>';return;}
  function p2t(p){return Math.round(Math.log(1e12/p)/Math.log(1.0001));}
  // BURN (token1) in tick span [oL,oH]: L·(1.0001^(oH/2)−1.0001^(oL/2))/1e18
  function burnIn(oL,oH){var s=0;for(var i=0;i<ranges.length;i++){var r=ranges[i];if(r.liq<=0)continue;
    var a=Math.max(r.tL,oL),b=Math.min(r.tH,oH);if(a>=b)continue;
    s+=r.liq*(Math.pow(1.0001,b/2)-Math.pow(1.0001,a/2))/1e18;}return s;}
  // USDC (token0) in tick span [oL,oH]: L·(1.0001^(−oL/2)−1.0001^(−oH/2))/1e6
  function usdcIn(oL,oH){var s=0;for(var i=0;i<ranges.length;i++){var r=ranges[i];if(r.liq<=0)continue;
    var a=Math.max(r.tL,oL),b=Math.min(r.tH,oH);if(a>=b)continue;
    s+=r.liq*(Math.pow(1.0001,-a/2)-Math.pow(1.0001,-b/2))/1e6;}return s;}
  // ── Build uniform 1-cent price buckets around the price, coarser far above ──
  var cent=0.01;
  var loStart=Math.max(0.01,Math.floor((px-0.06)*100)/100);   // ~6 cents below
  var edges=[];
  for(var e=loStart;e<px;e+=cent)edges.push(Math.round(e*100)/100);
  edges.push(px);                                              // exact price boundary
  var upFine=Math.ceil(px*100)/100;
  if(upFine-px<0.0005)upFine+=cent;
  for(var e2=upFine;e2<=Math.min(px+0.14,0.30)+1e-9;e2+=cent)edges.push(Math.round(e2*100)/100);
  [0.35,0.40,0.50,0.75,1.00].forEach(function(x){if(x>edges[edges.length-1])edges.push(x);});
  // ── Compute rows: BURN above price, USDC below ──
  var rowsUp=[],rowsDn=[],rawB=0,rawU=0;
  for(var bi=0;bi<edges.length-1;bi++){
    var pLo=edges[bi],pHi=edges[bi+1];
    var tHi=p2t(pLo),tLo=p2t(pHi);      // higher price = lower tick
    if(pLo>=px-1e-9){                    // fully ABOVE price → BURN only
      var bAmt=burnIn(Math.max(tLo,-887272),Math.min(tHi,curTick));
      if(bAmt>0.5){rowsUp.push({lo:pLo,hi:pHi,v:bAmt});rawB+=bAmt;}
    }else if(pHi<=px+1e-9){              // fully BELOW price → USDC only
      var uAmt=usdcIn(Math.max(tLo,curTick),Math.min(tHi,887272));
      if(uAmt>0.5){rowsDn.push({lo:pLo,hi:pHi,v:uAmt});rawU+=uAmt;}
    }
  }
  // ── Calibrate to on-chain reserves (all pool BURN sits above price, all USDC below) ──
  var cB=(window._poolAB>0&&rawB>0)?window._poolAB/rawB:1;
  var cU=(window._poolAU>0&&rawU>0)?window._poolAU/rawU:1;
  var i2;for(i2=0;i2<rowsUp.length;i2++)rowsUp[i2].v*=cB;
  for(i2=0;i2<rowsDn.length;i2++)rowsDn[i2].v*=cU;
  var sumB=0,sumU=0,maxB=0,maxU=0;
  for(i2=0;i2<rowsUp.length;i2++){sumB+=rowsUp[i2].v;if(rowsUp[i2].v>maxB)maxB=rowsUp[i2].v;}
  for(i2=0;i2<rowsDn.length;i2++){sumU+=rowsDn[i2].v;if(rowsDn[i2].v>maxU)maxU=rowsDn[i2].v;}
  if(maxB<=0)maxB=1;if(maxU<=0)maxU=1;
  // My positions (stars on rows that overlap my active LPs)
  function myRow(lo,hi){try{for(var m=0;m<LP.length;m++){if(!LP[m].closed&&LP[m].hi>lo&&LP[m].lo<hi)return true;}}catch(e){}return false;}
  function fmtAmt(v,isU){if(isU)return v>=1000?"$"+(v/1000).toFixed(1)+"k":"$"+F(v,0);return v>=1000?(v/1000).toFixed(1)+"k":F(v,0);}
  function priceLbl(lo,hi){var d=(lo<0.1||hi<0.1)?3:(hi-lo<0.011?(lo===Math.round(lo*100)/100?2:3):2);
    return "$"+lo.toFixed(hi-lo<0.011&&Math.abs(lo*100-Math.round(lo*100))>0.001?4:2)+"–"+hi.toFixed(Math.abs(hi*100-Math.round(hi*100))>0.001?4:2);}
  // ── Render: premium orderbook heatmap v2 — framed panel, section headers, 3D bars ──
  var mono="font-family:'Geist Mono',ui-monospace,monospace";
  if(!document.getElementById("hmStyle")){
    var st=document.createElement("style");st.id="hmStyle";
    st.textContent="@keyframes hmPulse{0%,100%{box-shadow:0 0 4px rgba(249,115,22,.8),0 0 10px rgba(249,115,22,.35)}50%{box-shadow:0 0 7px rgba(249,115,22,1),0 0 18px rgba(249,115,22,.55)}}@media(prefers-reduced-motion:reduce){.hmDot{animation:none!important}}";
    document.head.appendChild(st);
  }
  // A single ladder row: price label | 3D bar | amount. Bar has gradient body, top edge
  // highlight (depth), and glow scaled to weight — the walls literally light up.
  function row(lbl,star,rel,amtHtml,cR,cG,cB,shareTxt){
    var pct=Math.max(3,Math.min(100,Math.sqrt(rel)*100));
    var a=0.32+0.68*Math.sqrt(rel);
    var glow=rel>0.55?("box-shadow:0 0 "+(6+10*rel).toFixed(0)+"px rgba("+cR+","+cG+","+cB+","+(0.25+0.3*rel).toFixed(2)+");"):"";
    return '<div style="display:flex;align-items:center;gap:7px;margin-bottom:3px">'+
      '<span style="font-size:8.5px;color:var(--tx);width:74px;text-align:right;'+mono+';flex-shrink:0;letter-spacing:-.2px">'+lbl+star+'</span>'+
      '<div style="flex:1;height:16px;background:rgba(5,8,16,.7);border-radius:3px;overflow:hidden;border:1px solid rgba(48,54,68,.45);box-shadow:inset 0 1px 3px rgba(0,0,0,.5)">'+
        '<div style="height:100%;width:'+pct.toFixed(1)+'%;border-radius:2px;'+glow+
          'background:linear-gradient(180deg,rgba('+cR+','+cG+','+cB+','+Math.min(1,a+0.15).toFixed(2)+') 0%,rgba('+cR+','+cG+','+cB+','+(a*0.55).toFixed(2)+') 100%);position:relative">'+
          '<div style="position:absolute;top:0;left:0;right:0;height:1px;background:rgba(255,255,255,.25)"></div>'+
        '</div>'+
      '</div>'+
      '<span style="font-size:8.5px;width:76px;text-align:right;'+mono+';flex-shrink:0">'+amtHtml+
        (shareTxt?'<br><span style="font-size:6.5px;color:var(--dm)">'+shareTxt+'</span>':'')+'</span>'+
    '</div>';
  }
  function secHead(txt,color){
    return '<div style="display:flex;align-items:center;gap:7px;margin:7px 0 5px">'+
      '<span style="font-size:7.5px;color:'+color+';text-transform:uppercase;letter-spacing:1.4px;font-weight:700">'+txt+'</span>'+
      '<div style="flex:1;height:1px;background:linear-gradient(90deg,'+color+'33,transparent)"></div></div>';
  }
  var html='<div style="background:linear-gradient(180deg,rgba(15,20,34,.4),rgba(8,12,22,.15));border:1px solid rgba(48,54,68,.5);border-radius:10px;padding:11px 12px 10px">'+
    '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px">'+
      '<span style="font-size:10px;color:#e2e8f0;text-transform:uppercase;letter-spacing:1.4px;font-weight:700">Liquidity Heatmap</span>'+
      '<span style="font-size:7px;color:'+((window._poolAB>0&&window._poolAU>0)?"var(--dm)":"var(--warn)")+';'+mono+'">'+((window._poolAB>0&&window._poolAU>0)?"on-chain · kalibriert":"relativ · Scan läuft…")+'</span></div>'+
    '<div style="font-size:7.5px;color:var(--dm);margin-bottom:2px">Intensit\u00e4t = Menge \u00b7 <span style="color:var(--cy)">\u2605 meine Range</span></div>';
  // \u2500\u2500 Auf einen Blick: Widerstand (BURN $ \u00fcber Preis) vs. Support (USDC $ unter Preis) \u2500\u2500
  var _resUsd=sumB*px,_supUsd=sumU,_totLiq=_resUsd+_supUsd;
  var _resPct=_totLiq>0?(_resUsd/_totLiq*100):50;
  html+='<div style="margin:7px 0 9px;padding:8px 10px;background:rgba(8,12,22,.5);border:1px solid rgba(48,54,68,.5);border-radius:8px">'+
    '<div style="display:flex;justify-content:space-between;font-size:8.5px;margin-bottom:5px;'+mono+'">'+
      '<span style="color:#fb923c;font-weight:700">\u25b2 Widerstand $'+F(_resUsd,0)+'</span>'+
      '<span style="color:#34d399;font-weight:700">$'+F(_supUsd,0)+' Support \u25bc</span>'+
    '</div>'+
    '<div style="display:flex;height:9px;border-radius:5px;overflow:hidden;border:1px solid rgba(48,54,68,.5)">'+
      '<div style="width:'+_resPct.toFixed(1)+'%;background:linear-gradient(90deg,#f97316,#fb923c)"></div>'+
      '<div style="width:'+(100-_resPct).toFixed(1)+'%;background:linear-gradient(90deg,#34d399,#059669)"></div>'+
    '</div>'+
    '<div style="font-size:7.5px;color:var(--dm);text-align:center;margin-top:5px">'+
      (_totLiq<=0?'Scan l\u00e4uft \u2014 noch keine kalibrierte Tiefe':(_resUsd>_supUsd*1.15?'\u2191 Mehr Verkaufsdruck \u00fcber dem Preis':(_supUsd>_resUsd*1.15?'\u2193 Mehr Kaufunterst\u00fctzung unter dem Preis':'\u2248 Ausgeglichen um den Preis')))+
    '</div>'+
  '</div>';
  html+=secHead("\u25b2 Widerstand \u2014 BURN-Verkaufsw\u00e4nde","#fb923c");
  var up=rowsUp.slice().reverse();
  for(i2=0;i2<up.length;i2++){
    var r=up[i2],rel=r.v/maxB;
    var star=myRow(r.lo,r.hi)?' <span style="color:var(--cy)">\u2605</span>':'';
    var amt='<span style="color:#fdba74">'+fmtAmt(r.v,false)+'</span><span style="color:var(--dm);font-size:7px"> B</span>';
    var share=sumB>0?((r.v/sumB*100).toFixed(0)+"%"):"";
    html+=row(priceLbl(r.lo,r.hi),star,rel,amt,249,115,22,share);
  }
  // Live price hub — pulsing dot + glowing badge (echoes the gauge rings)
  html+='<div style="display:flex;align-items:center;gap:9px;margin:9px 0">'+
    '<div style="flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(249,115,22,.7))"></div>'+
    '<div style="display:flex;align-items:center;gap:6px;padding:3px 11px;border:1px solid rgba(249,115,22,.55);border-radius:999px;background:rgba(12,10,8,.9);box-shadow:0 0 16px rgba(249,115,22,.2),inset 0 0 8px rgba(249,115,22,.07)">'+
      '<span class="hmDot" style="width:6px;height:6px;border-radius:50%;background:#f97316;animation:hmPulse 2s ease-in-out infinite"></span>'+
      '<span style="font-size:11px;color:#fdba74;font-weight:700;'+mono+'">$'+px.toFixed(4)+'</span>'+
      '<span style="font-size:7px;color:var(--dm);text-transform:uppercase;letter-spacing:.8px">Spot</span>'+
    '</div>'+
    '<div style="flex:1;height:1px;background:linear-gradient(90deg,rgba(249,115,22,.7),transparent)"></div></div>';
  html+=secHead("\u25bc Support \u2014 USDC-Kauftiefe","#34d399");
  var dn=rowsDn.slice().reverse();
  for(i2=0;i2<dn.length;i2++){
    var r2=dn[i2],rel2=r2.v/maxU;
    var star2=myRow(r2.lo,r2.hi)?' <span style="color:var(--cy)">\u2605</span>':'';
    var amt2='<span style="color:#6ee7b7">'+fmtAmt(r2.v,true)+'</span>';
    var share2=sumU>0?((r2.v/sumU*100).toFixed(0)+"%"):"";
    html+=row(priceLbl(r2.lo,r2.hi),star2,rel2,amt2,52,211,153,share2);
  }
  html+='<div style="display:flex;gap:8px;margin-top:10px">'+
    '<div style="flex:1;text-align:center;padding:5px 4px;border:1px solid rgba(249,115,22,.35);border-radius:7px;background:rgba(249,115,22,.06)">'+
      '<div style="font-size:11px;color:#fdba74;font-weight:700;'+mono+'">'+(sumB>=1000?(sumB/1000).toFixed(0)+"k":F(sumB,0))+'</div>'+
      '<div style="font-size:6.5px;color:var(--dm);text-transform:uppercase;letter-spacing:.7px">BURN \u00fcber Preis</div></div>'+
    '<div style="flex:1;text-align:center;padding:5px 4px;border:1px solid rgba(52,211,153,.35);border-radius:7px;background:rgba(52,211,153,.06)">'+
      '<div style="font-size:11px;color:#6ee7b7;font-weight:700;'+mono+'">$'+(sumU>=1000?(sumU/1000).toFixed(1)+"k":F(sumU,0))+'</div>'+
      '<div style="font-size:6.5px;color:var(--dm);text-transform:uppercase;letter-spacing:.7px">USDC Support</div></div>'+
  '</div></div>';
  box.innerHTML=html;
}
function renderDepthChart_OLD(buckets,targetId){
  var box=$(targetId||"depthChart");if(!box)return;
  if(!buckets||!buckets.length){box.innerHTML='<div style="color:var(--mt);font-size:10px;text-align:center;padding:16px">Erst die Pool Liquidity Map scannen lassen.</div>';return;}
  // Sensible range around the current price — not to infinity. Show from a bit below the
  // lowest external LP up to where real concentrated LPs sit (cap ~$1.00 by default).
  var pxNow=(typeof P!=="undefined"&&P>0)?P:0.17;
  // Find price band that actually contains external (non-DAO) liquidity.
  var loBand=pxNow*0.5, hiBand=pxNow*3;
  for(var s=0;s<buckets.length;s++){
    if((buckets[s].extBurn||0)>1){
      if(buckets[s].lo<loBand)loBand=buckets[s].lo;
      if(buckets[s].hi>hiBand)hiBand=buckets[s].hi;
    }
  }
  hiBand=Math.min(hiBand,1.0); // cap so a huge tail doesn't flatten the chart
  loBand=Math.max(loBand,0.001);
  var vis=buckets.filter(function(b){return b.lo>=loBand*0.999&&b.hi<=hiBand*1.001&&(b.burn>0);});
  if(!vis.length)vis=buckets.filter(function(b){return b.burn>0;});
  if(!vis.length){box.innerHTML='<div style="color:var(--mt);font-size:10px;text-align:center;padding:16px">Keine BURN-Liquidität im Bereich.</div>';return;}
  // Scale bars to the largest EXTERNAL burn so external LPs dominate the visual;
  // the DAO portion is drawn as a faint segment on top (context, not the star).
  var maxExt=0,sumExt=0,sumDao=0,sumUsdc=0;
  for(var i=0;i<vis.length;i++){
    var e=vis[i].extBurn||0;
    if(e>maxExt)maxExt=e;
    sumExt+=e;sumDao+=(vis[i].daoBurn||0);sumUsdc+=(vis[i].extUsdc||0);
  }
  if(maxExt<=0)maxExt=1;
  function hasMe(b){if(!b.owners)return false;for(var k=0;k<b.owners.length;k++){if(b.owners[k].isMe&&!b.owners[k].closed)return true;}return false;}
  var rows="";
  for(var j=0;j<vis.length;j++){
    var b=vis[j];
    var ext=b.extBurn||0, dao=b.daoBurn||0;
    var extPct=Math.min(100,ext/maxExt*100);
    var daoPct=Math.min(100-extPct,dao/maxExt*100*0.5); // DAO shown at half-weight, capped
    var mine=hasMe(b);
    var isActive=b.active;
    var extClr=isActive?"linear-gradient(90deg,#f59e0b,#fbbf24)":(mine?"linear-gradient(90deg,#22d3ee,#34d399)":"linear-gradient(90deg,#6366f1,#a78bfa)");
    var labelClr=isActive?"var(--o)":(mine?"var(--cy)":"var(--tx)");
    var extLabel=ext>=1000?(ext/1000).toFixed(1)+"k":F(ext,0);
    var uLabel=(b.extUsdc>=1000)?"$"+(b.extUsdc/1000).toFixed(1)+"k":"$"+F(b.extUsdc||0,0);
    rows+='<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">'+
      '<span style="font-size:8.5px;color:'+labelClr+';width:64px;text-align:right;font-family:Geist Mono,monospace;flex-shrink:0">$'+b.lo.toFixed(b.lo<0.1?4:3)+(isActive?' ◀':'')+(mine?' ★':'')+'</span>'+
      '<div style="flex:1;height:15px;background:rgba(8,12,22,.5);border-radius:3px;overflow:hidden;position:relative;display:flex">'+
        '<div style="height:100%;width:'+extPct.toFixed(1)+'%;background:'+extClr+';border-radius:3px 0 0 3px'+(isActive?';box-shadow:0 0 8px rgba(245,158,11,.5)':'')+'"></div>'+
        (daoPct>0.5?'<div style="height:100%;width:'+daoPct.toFixed(1)+'%;background:repeating-linear-gradient(90deg,rgba(148,163,184,.25),rgba(148,163,184,.25) 3px,rgba(148,163,184,.12) 3px,rgba(148,163,184,.12) 6px)" title="DAO Full-Range"></div>':'')+
        '<span style="position:absolute;right:5px;top:50%;transform:translateY(-50%);font-size:8px;color:var(--tx);font-family:Geist Mono,monospace;text-shadow:0 0 3px #000">'+extLabel+'</span>'+
      '</div>'+
      '<span style="font-size:7.5px;color:var(--g);width:44px;text-align:right;flex-shrink:0;font-family:Geist Mono,monospace">'+uLabel+'</span>'+
    '</div>';
  }
  box.innerHTML=
    '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px">'+
      '<span style="font-size:9px;color:var(--mt);text-transform:uppercase;letter-spacing:.8px">Liquidität pro Preisbereich</span>'+
      '<span style="font-size:8px;color:var(--dm)">$'+loBand.toFixed(2)+'–$'+hiBand.toFixed(2)+'</span>'+
    '</div>'+
    '<div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:8px;color:var(--dm)"><span>Preis · Balken=BURN</span><span>USDC-Wert →</span></div>'+
    rows+
    '<div style="border-top:1px solid rgba(48,54,68,.4);margin-top:8px;padding-top:7px;display:flex;justify-content:space-between;font-size:8.5px">'+
      '<span style="color:var(--tx)">Extern: <b style="color:var(--cy)">'+(sumExt>=1000?(sumExt/1000).toFixed(0)+"k":F(sumExt,0))+'</b> BURN · <b style="color:var(--g)">$'+(sumUsdc>=1000?(sumUsdc/1000).toFixed(1)+"k":F(sumUsdc,0))+'</b></span>'+
      '<span style="color:var(--dm)">DAO: '+(sumDao>=1000?(sumDao/1000).toFixed(0)+"k":F(sumDao,0))+' BURN</span>'+
    '</div>'+
    '<div style="display:flex;gap:9px;margin-top:6px;font-size:7.5px;color:var(--dm);flex-wrap:wrap;justify-content:center;align-items:center">'+
      '<span><span style="color:var(--o)">◀</span> Preis</span>'+
      '<span><span style="color:var(--cy)">★</span> meine Pos</span>'+
      '<span><span style="color:#a78bfa">▬</span> externe LP</span>'+
      '<span><span style="color:#94a3b8">▨</span> DAO Full-Range</span>'+
    '</div>';
}
function toggleDepthDAO(){
  // kept for backward compat; DAO is now always shown as a faint overlay
  try{if(lmapCache)renderDepthChart(lmapCache);}catch(e){}
}
function renderLmap(buckets){
  var lpOwners=window._lpOwners||[];
  var Pm=pxUnified(); // COHERENCE v2: owner table uses same live price as P&L card & LP table
  var tB=0,tU=0,allOwn={},activeOwn={};
  for(var i=0;i<buckets.length;i++){tB+=buckets[i].burn;tU+=buckets[i].usdc;}
  // Group lpOwners by wallet
  var ownerMap={};
  for(var oi=0;oi<lpOwners.length;oi++){
    var lp=lpOwners[oi];
    if(!ownerMap[lp.owner])ownerMap[lp.owner]={addr:lp.owner,isMe:lp.isMe,positions:[],activeLiq:0,activeCount:0,closedCount:0};
    ownerMap[lp.owner].positions.push(lp);
    allOwn[lp.owner]=1;
    if(!lp.closed){ownerMap[lp.owner].activeLiq+=lp.liq;ownerMap[lp.owner].activeCount++;activeOwn[lp.owner]=1;}
    else{ownerMap[lp.owner].closedCount++;}
  }
  // Sort owners: active first (by liquidity desc), then closed
  var owners=Object.values(ownerMap);
  owners.sort(function(a,b){
    if(a.activeCount>0&&b.activeCount===0)return-1;
    if(a.activeCount===0&&b.activeCount>0)return 1;
    return b.activeLiq-a.activeLiq;
  });
  // Per-LP BURN/USDC via V3 EXACT MATH using liquidity + tick range.
  // CRITICAL: sqrtP = sqrt(1e12 / P) — NOT sqrt(P) — because pool stores token1/token0
  // with USDC (1e6) and BURN (1e18) decimal scaling.
  // Out-of-range LPs (current price outside their tL/tU) hold either pure BURN or pure USDC,
  // calculated correctly without depending on POOL_LIQ (which only reflects active-tick liq).
  function lpToBurnUsdc(dl){
    var bn=0,uc=0;
    if(!dl||!dl.liq||dl.liq<=0||Pm<=0)return{b:bn,u:uc};
    try{
      var sqP=Math.sqrt(1e12/Pm);
      var sL=Math.pow(1.0001,(dl.tL!==undefined?dl.tL:-887272)/2);
      var sU=Math.pow(1.0001,(dl.tU!==undefined?dl.tU:887272)/2);
      if(sqP<=sL){
        // Price below range — LP is 100% USDC
        uc=dl.liq*(1/sL-1/sU)/1e6;
      }else if(sqP>=sU){
        // Price above range — LP is 100% BURN
        bn=dl.liq*(sU-sL)/1e18;
      }else{
        // In range — mixed
        bn=dl.liq*(sqP-sL)/1e18;
        uc=dl.liq*(1/sqP-1/sU)/1e6;
      }
      // Full-range overflow guard: if Math.pow yields infinity for extreme ticks, fall back to pool-share
      if(!isFinite(bn)||!isFinite(uc)||bn>1e10||uc>1e15){
        if(POOL_LIQ>0&&aB>0){bn=aB*(dl.liq/POOL_LIQ);if(aU>0)uc=aU*(dl.liq/POOL_LIQ);}
        else{bn=0;uc=0;}
      }
    }catch(e){}
    if(isNaN(bn)||bn<0)bn=0;
    if(isNaN(uc)||uc<0)uc=0;
    return{b:bn,u:uc};
  }
  // Compute DAO vs non-DAO BURN/USDC split (active only) — V3 exact math
  var daoBurn=0,nonDaoBurn=0,daoUsdc=0,nonDaoUsdc=0,sumActiveBurn=0,sumActiveUsdc=0;
  for(var ddi=0;ddi<lpOwners.length;ddi++){
    var dl=lpOwners[ddi];if(dl.closed)continue;
    var bu=lpToBurnUsdc(dl);
    sumActiveBurn+=bu.b;sumActiveUsdc+=bu.u;
    if(dl.hi>100000){daoBurn+=bu.b;daoUsdc+=bu.u;}
    else{nonDaoBurn+=bu.b;nonDaoUsdc+=bu.u;}
  }
  // Per-card loading state: skeleton shimmer + status text instead of empty "—"
  var poolReady=aB>0&&aU>0;
  var lpScanReady=lpOwners&&lpOwners.length>0;
  var splitReady=daoBurn>0||nonDaoBurn>0;
  $("lmapSummary").innerHTML=
    (poolReady?MB("Pool BURN (on-chain)",F(aB,0),"var(--br)"):MBL("Pool BURN (on-chain)","var(--br)","fetching pool"))+
    (poolReady?MB("Pool USDC (on-chain)","$"+F(aU,0),"var(--g)"):MBL("Pool USDC (on-chain)","var(--g)","fetching pool"))+
    (splitReady?MB("DAO BURN",daoBurn>0?F(daoBurn,0):"—","var(--p)"):MBL("DAO BURN","var(--p)",lpScanReady?"calculating":"scanning LPs"))+
    (splitReady?MB("LP BURN (excl. DAO)",nonDaoBurn>0?F(nonDaoBurn,0):"—","var(--cy)"):MBL("LP BURN (excl. DAO)","var(--cy)",lpScanReady?"calculating":"scanning LPs"))+
    (sumActiveBurn>0?MB("Sum All LPs",F(sumActiveBurn,0)+" BURN","var(--o)"):MBL("Sum All LPs","var(--o)",lpScanReady?"summing":"scanning LPs"))+
    (lpScanReady?MB("Active LPs",Object.keys(activeOwn).length+" wallets","var(--br)"):MBL("Active LPs","var(--br)","scanning pool ticks"));
  console.log("LMAP SUMMARY (V3 exact math): aB="+(aB?F(aB,0):"?")+" aU=$"+(aU?F(aU,0):"?")+" | LP-sum BURN="+F(sumActiveBurn,0)+" USDC=$"+F(sumActiveUsdc,0)+" | DAO="+F(daoBurn,0)+" BURN ($"+F(daoUsdc,0)+" USDC), others="+F(nonDaoBurn,0)+" BURN");
  // Render by wallet
  var rows="";
  for(var wi=0;wi<owners.length;wi++){
    var ow=owners[wi];
    var wS=ow.addr.slice(0,6)+"…"+ow.addr.slice(-4);
    // Special labels for pool/vault wallets. NOTE: prefix matching is fragile — a short prefix
    // like "0x988966" also matches Björn's 0x98896671… address. So we check the EXACT full-address
    // ADDR_BOOK (now synced from the server) FIRST, and only fall back to prefix labels if unknown.
    var WALLET_LABELS={"0x72ade1":"DAO Vault","0x505042":"Noah (DeFi)","0x6e37cc":"Noah (Alt)","0x1b5b96":"Elite","0x0e7121":"Founder","0x6324b1":"Private","0x988966":"Private"};
    var wLabel="";
    // 1. Exact full-address match wins (no prefix collisions).
    if(typeof ADDR_BOOK!=="undefined"){var abnExact=ADDR_BOOK[(ow.addr+"").toLowerCase()];if(abnExact)wLabel=abnExact.replace(" ⭐","");}
    // 2. Only if still unknown, use the prefix labels (DAO/Elite/Founder etc.).
    if(!wLabel){for(var wk in WALLET_LABELS){if(ow.addr.toLowerCase().indexOf(wk)===0){wLabel=WALLET_LABELS[wk];break;}}}
    var wLink='<a href="https://arbiscan.io/address/'+ow.addr+'" target="_blank" style="color:'+(ow.isMe?"var(--cy)":ow.activeCount>0?"var(--g)":"var(--dm)")+'">'+(ow.isMe?"⭐ ":"")+wS+'</a>';
    var labelHtml=wLabel?' <span style="font-size:9px;color:var(--cy);margin-left:4px">'+wLabel+'</span>':'';
    var statusTxt=ow.activeCount>0?ow.activeCount+" active"+(ow.closedCount>0?", "+ow.closedCount+" closed":""):ow.closedCount+" closed";
    // Wallet header row
    rows+='<tr style="background:rgba(30,41,59,.3);border-top:2px solid var(--bd)"><td colspan="6" style="padding:8px 6px">'+
      '<span style="font-weight:600;font-size:11px">'+wLink+'</span>'+labelHtml+
      ' <span style="font-size:8px;color:var(--dm);margin-left:6px">'+statusTxt+'</span></td></tr>';
    // Sort positions: active first, then by lo price
    ow.positions.sort(function(a,b){
      if(!a.closed&&b.closed)return-1;
      if(a.closed&&!b.closed)return 1;
      return a.lo-b.lo;
    });
    // Calculate max liquidity for bar scaling
    var maxLiq=0;
    for(var ml2=0;ml2<ow.positions.length;ml2++){if(!ow.positions[ml2].closed&&ow.positions[ml2].liq>maxLiq)maxLiq=ow.positions[ml2].liq;}
    // Position rows
    for(var pi=0;pi<ow.positions.length;pi++){
      var lp=ow.positions[pi];
      var isFullRange=lp.hi>100000;
      var rng=isFullRange?"$0 → ∞ (Full Range)":"$"+lp.lo.toFixed(lp.lo<1?3:2)+" → $"+lp.hi.toFixed(lp.hi<1?3:2);
      if(lp.closed){
        var nftLink=lp.tokenId?'<a href="https://arbiscan.io/nft/0xC36442b4a4522E871399CD717aBDD847Ab11FE88/'+lp.tokenId+'" target="_blank" style="font-size:9px;color:var(--dm)">#'+lp.tokenId+'</a>':'';
        var cBurn=lp.burnOut>0?F(lp.burnOut,0):'—';
        var cUsdc=lp.usdcOut>0?'$'+F(lp.usdcOut,0):'—';
        rows+='<tr><td style="padding-left:20px;font-weight:600;font-size:10px;color:var(--r)">'+rng+'</td>';
        rows+='<td style="color:var(--o)">'+cBurn+'</td>';
        rows+='<td style="color:var(--dm)">—</td>';
        rows+='<td style="color:var(--g)">'+cUsdc+'</td>';
        rows+='<td>'+nftLink+'</td>';
        rows+='<td style="color:var(--r);font-weight:600">CLOSED</td></tr>';
      }else{
        // Calculate BURN deposited using wtLiqToBurn with original ticks
        var burnDep=0,lpLeft=0,lpUsdc=0,lpPct=0;
        try{
          if(lp.tL!==undefined&&lp.tU!==undefined&&lp.liq>0){
            burnDep=wtLiqToBurn(lp.liq,lp.tL,lp.tU);
            // Sanity check: if overflow or negative, estimate from pool share
            if(isFullRange&&(isNaN(burnDep)||burnDep<=0||burnDep>1e12)){
              var poolLiq=POOL_LIQ||0;
              burnDep=(poolLiq>0&&aB>0)?aB*(lp.liq/poolLiq):0;
            }
          }
          if(isFullRange&&Pm>0){
            // Exact V3: compute amounts from liquidity + sqrtPrices
            // Raw sqrtPrice = sqrt(1e12/Pm) to match tick-based sqrtPL/sqrtPU
            var sqrtP2=Math.sqrt(1e12/Pm);
            var sqrtPL2=Math.pow(1.0001,lp.tL/2);
            var sqrtPU2=Math.pow(1.0001,lp.tU/2);
            if(sqrtP2<=sqrtPL2){
              lpLeft=0;lpUsdc=lp.liq*(1/sqrtPL2-1/sqrtPU2)/1e6;
            }else if(sqrtP2>=sqrtPU2){
              lpLeft=lp.liq*(sqrtPU2-sqrtPL2)/1e18;lpUsdc=0;
            }else{
              lpUsdc=lp.liq*(1/sqrtP2-1/sqrtPU2)/1e6;
              lpLeft=lp.liq*(sqrtP2-sqrtPL2)/1e18;
            }
            if(lpLeft<0)lpLeft=0;if(lpUsdc<0)lpUsdc=0;
            lpPct=burnDep>0?Math.max(0,((burnDep-lpLeft)/burnDep)*100):0;
          } else if(burnDep>0&&Pm>0&&!isFullRange){
            var cv=v3(burnDep,lp.lo,lp.hi,Pm);lpLeft=cv.left;lpUsdc=cv.usdc;lpPct=cv.pct;
          }
        }catch(e){}
        // Calculate projected USDC when fully filled
        var ifFilled=0;
        if(!isFullRange&&burnDep>0){
          var avgSell=(lp.lo+lp.hi)/2;
          ifFilled=burnDep*avgSell;
        }else if(isFullRange){
          ifFilled=lpLeft*Pm+lpUsdc; // Current total value
        }
        var isInRange=Pm>=lp.lo&&Pm<lp.hi;
        // Fill bar as percentage
        var fillClr=lpPct>=90?"var(--r)":lpPct>=50?"var(--warn)":lpPct>0?"var(--g)":"var(--dm)";
        rows+='<tr style="'+(isInRange?"background:rgba(251,146,60,.04);":"")+'"><td style="padding-left:20px;font-weight:600;font-size:10px;color:var(--g)">'+(isInRange?"► ":"")+rng+'</td>';
        rows+='<td style="color:var(--o)">'+F(burnDep,0)+'</td>';
        rows+='<td style="color:var(--cy)">'+F(lpLeft,0)+'</td>';
        rows+='<td style="color:var(--g)">$'+F(lpUsdc,0)+'</td>';
        rows+='<td style="color:var(--cy)">$'+F(ifFilled,0)+'</td>';
        rows+='<td style="color:'+fillClr+';font-weight:600">'+lpPct.toFixed(0)+'%</td></tr>';
      }
    }
  }
  $("lmapB").innerHTML=rows||'<tr><td colspan="6" style="color:var(--dm)">No data</td></tr>';
  $("lmapStatus").textContent=Object.keys(activeOwn).length+" active / "+Object.keys(allOwn).length+" total LP providers · "+lpOwners.length+" positions · "+new Date().toLocaleTimeString();
  try{renderDepthChart(buckets);}catch(e){console.log("depthChart err:",e.message);}
  // Keep the standalone Depth-Chart card in sync too (if it's been opened at least once).
  try{if($("depthChartCard")&&$("depthChartCard").innerHTML.indexOf("Erst")<0)renderDepthChart(buckets,"depthChartCard");}catch(e){}
}

// ═══ WALLET TRACKER (isolated module) ═══
var WT_NFT="0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
var wtCache=null,wtCacheTs=0;
function wtPad(n){return BigInt(n).toString(16).padStart(64,"0");}
function wtI24(hex){var v=parseInt(hex,16);return v>=0x800000?v-0x1000000:v;}
function wtTickToPrice(tick){return 1e12/Math.pow(1.0001,tick);}
// Exact pool price from the on-chain current tick (matches Uniswap precisely).
// Used for position fill math instead of the DexScreener spot, which is rounded/laggy
// and — for positions near a range edge — distorts "BURN left" badly (e.g. 277 vs 540).
// Falls back to global P (DexScreener spot) only when no tick is available yet (cold start).
function poolPriceExact(){
  var t=window._lmapCurTick;
  if(typeof t==="number"&&isFinite(t)){var pp=1e12/Math.pow(1.0001,t);if(pp>0&&isFinite(pp))return pp;}
  return P;
}
// ═══ PRICE COHERENCE FIX (v=20260705a) ═══
// Problem: P&L card, LP table, renderLpPnl, wallet detail & tracker each read a
// DIFFERENT price (DexScreener spot P vs. stale scan tick) → same-minute views
// disagreed by ~$300 ($1.73K vs $1.41K). In a 0.1-cent range, 6 ticks ≈ 11pp fill.
// Fix: ONE price for all fill math. refreshPoolTick() fetches slot0 every 60s and,
// if the tick changed, re-renders all P&L views together with the same price.
function pxUnified(){
  var ts=window._lmapTickTs||0;
  if(Date.now()-ts<300000)return poolPriceExact(); // tick fresh (<5min) → exact pool price
  return P; // stale/cold start → DexScreener spot
}
var _ptkBusy=false;
async function refreshPoolTick(){
  if(_ptkBusy)return;_ptkBusy=true;
  try{
    var s0=await rpcCall(POOL,"0x3850c7bd");
    if(!s0||s0.length<130)throw"slot0 fail";
    var tB=BigInt("0x"+s0.slice(66,130));
    if(tB>=2n**255n)tB-=2n**256n;
    var t=Number(tB);
    if(!isFinite(t))throw"bad tick";
    var changed=(window._lmapCurTick!==t);
    window._lmapCurTick=t;window._lmapTickTs=Date.now();
    if(changed){
      console.log("TICK refresh: "+t+" → $"+poolPriceExact().toFixed(6)+" (re-render)");
      try{if(P>0)render();}catch(e){}
      try{renderWal();}catch(e){}
      try{if(typeof lmapCache!=="undefined"&&lmapCache&&lmapCache.length)renderLmap(lmapCache);}catch(e){}
    }
  }catch(e){console.log("refreshPoolTick err:",e&&e.message||e);}
  _ptkBusy=false;
}
function wtLiqToBurn(liq,tL,tU){var sL=Math.pow(1.0001,tL/2),sU=Math.pow(1.0001,tU/2);return liq*(sU-sL)/1e18;}

// Dedicated RPC for WT — no "0x" filter, longer timeout, tries each endpoint
async function wtRpc(to,data){
  for(var i=0;i<RPC_LIST.length;i++){
    var idx=(rpcIdx+i)%RPC_LIST.length;
    try{var ac=new AbortController();var tm=setTimeout(function(){ac.abort();},8000);
      var r=await fetch(RPC_LIST[idx],{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({jsonrpc:"2.0",method:"eth_call",params:[{to:to,data:data},"latest"],id:1}),signal:ac.signal});
      clearTimeout(tm);var j=await r.json();
      if(j.result&&j.result.length>2)return j.result;
      if(j.error)console.log("WT RPC["+idx+"] error:",j.error.message);
    }catch(e){clearTimeout(tm);console.log("WT RPC["+idx+"] fail:",e.message);}
  }
  return null;}

async function wtLoad(){
  var addr=$("wtInput").value.trim();
  if(!/^0x[0-9a-fA-F]{40}$/.test(addr)){$("wtResult").innerHTML='<span style="color:var(--r)">Invalid wallet address</span>';return;}
  if(wtCache&&wtCacheTs>Date.now()-60000&&wtCache.addr===addr){wtRender(wtCache);return;}
  $("wtResult").innerHTML=
    '<div style="margin-bottom:8px"><span class="skel" style="width:90px;height:10px"></span></div>'+
    '<div class="mg">'+
      '<div class="mb"><span class="skel" style="width:35px;height:8px;margin-bottom:4px"></span><span class="skel" style="width:55px;height:16px"></span></div>'+
      '<div class="mb"><span class="skel" style="width:40px;height:8px;margin-bottom:4px"></span><span class="skel" style="width:55px;height:16px"></span></div>'+
      '<div class="mb"><span class="skel" style="width:50px;height:8px;margin-bottom:4px"></span><span class="skel" style="width:65px;height:16px"></span></div>'+
      '<div class="mb"><span class="skel" style="width:35px;height:8px;margin-bottom:4px"></span><span class="skel" style="width:55px;height:16px"></span></div>'+
    '</div>'+
    '<div style="margin-top:10px"><span class="skel" style="width:100px;height:8px;margin-bottom:6px"></span>'+
      '<div style="display:flex;gap:8px;margin-top:6px">'+
        '<span class="skel" style="flex:1;height:14px"></span><span class="skel" style="flex:1;height:14px"></span><span class="skel" style="flex:1;height:14px"></span>'+
      '</div>'+
      '<div style="display:flex;gap:8px;margin-top:4px">'+
        '<span class="skel" style="flex:1;height:14px"></span><span class="skel" style="flex:1;height:14px"></span><span class="skel" style="flex:1;height:14px"></span>'+
      '</div>'+
    '</div>';
  $("wtBtn").disabled=true;$("wtBtn").textContent="Loading…";
  var sec=$("sec-wt");if(sec&&!sec.classList.contains("open")){sec.classList.add("open");$("wtCol").classList.add("open");}
  try{
    // Balances
    var bH=await rpc(BURN_TK,bof(addr)),sH=await rpc(STBURN_TK,bof(addr));
    var wBurn=h2n(bH),wSt=h2n(sH);
    console.log("WT balances:",wBurn,"BURN",wSt,"stBURN");
    // LP NFTs
    var nH=await rpc(WT_NFT,bof(addr));var nC=parseInt(nH,16);if(nC>50)nC=50;
    console.log("WT NFT count:",nC,"raw:",nH);
    var lps=[],bLow=BURN_TK.toLowerCase(),uLow=USDC_TK.toLowerCase();
    console.log("WT filter: t0="+uLow+" t1="+bLow);
    for(var i=0;i<nC;i++){
      try{
        var tH=await wtRpc(WT_NFT,"0x2f745c59"+addr.slice(2).toLowerCase().padStart(64,"0")+wtPad(i));
        if(!tH){console.log("WT NFT["+i+"] tokenOfOwnerByIndex failed");continue;}
        var tId=BigInt("0x"+tH.slice(2));
        console.log("WT NFT["+i+"] tokenId:",tId.toString());
        var pH=await wtRpc(WT_NFT,"0x99fbab88"+wtPad(tId));
        if(!pH||pH.length<770){console.log("WT NFT["+i+"] positions() returned:",pH?pH.length:"null");continue;}
        var d=pH.slice(2);
        var t0="0x"+d.slice(152,192),t1="0x"+d.slice(216,256);
        console.log("WT NFT["+i+"] t0="+t0+" t1="+t1);
        if(t0.toLowerCase()!==uLow||t1.toLowerCase()!==bLow){console.log("WT NFT["+i+"] SKIP: not BURN/USDC");continue;}
        var tL=wtI24(d.slice(378,384)),tU=wtI24(d.slice(442,448));
        var liq=BigInt("0x"+d.slice(448,512));
        var isClosed=liq<=0n;
        console.log("WT NFT["+i+"] ticks:",tL,tU,"liq:",liq.toString(),isClosed?"(CLOSED)":"");
        var pHi=wtTickToPrice(tL),pLo=wtTickToPrice(tU);
        console.log("WT NFT["+i+"] prices: $"+pLo.toFixed(4)+" → $"+pHi.toFixed(4));
        if(pLo<=0||pHi<=pLo){console.log("WT NFT["+i+"] SKIP: invalid prices");continue;}
        if(isClosed){
          lps.push({lo:pLo,hi:pHi,burn:0,left:0,usdc:0,pct:0,id:tId.toString(),closed:true});
          continue;
        }
        var bDep=wtLiqToBurn(Number(liq),tL,tU);
        console.log("WT NFT["+i+"] BURN deposited:",bDep.toFixed(0));
        if(bDep<=0)continue;
        var cv=v3(bDep,pLo,pHi,pxUnified()); // COHERENCE: same price as main LP views
        lps.push({lo:pLo,hi:pHi,burn:bDep,left:cv.left,usdc:cv.usdc,pct:cv.pct,id:tId.toString(),closed:false});
      }catch(e2){console.log("WT NFT["+i+"] err:",e2);continue;}
    }
    console.log("WT found",lps.length,"BURN/USDC LPs");
    var bEq2=wBurn+wSt*stR,lpB=0,lpU=0;
    for(var j=0;j<lps.length;j++){lpB+=lps[j].left;lpU+=lps[j].usdc;}
    var tEq=bEq2+lpB,tVal=tEq*pxUnified()+lpU;
    var res={addr:addr,burn:wBurn,stBurn:wSt,lps:lps,bEq:bEq2,lpBurn:lpB,lpUsdc:lpU,totalEq:tEq,totalVal:tVal};
    wtCache=res;wtCacheTs=Date.now();
    wtRender(res);
  }catch(e){console.log("WT err:",e);$("wtResult").innerHTML='<span style="color:var(--r)">Wallet data unavailable</span>';}
  $("wtBtn").disabled=false;$("wtBtn").textContent="Load";
}

function wtRender(d){
  var wS=addrName(d.addr);
  var isKnown=typeof ADDR_BOOK!=="undefined"&&ADDR_BOOK[(d.addr+"").toLowerCase()];
  var h='<div style="margin-bottom:8px"><a href="https://arbiscan.io/address/'+d.addr+'" target="_blank" style="color:'+(isKnown?"var(--o)":"var(--b)")+';font-size:10px;font-weight:'+(isKnown?"600":"400")+'">'+wS+'</a></div>';
  h+='<div class="mg">'+MB("BURN",F(d.burn,0),"var(--o)")+MB("stBURN",F(d.stBurn,0),"var(--p)")+
    MB("BURN Equiv",F(d.totalEq,0),"var(--br)")+MB("Value","$"+F(d.totalVal,0),"var(--g)")+'</div>';
  if(d.lps.length>0){
    var activeLps=d.lps.filter(function(l){return!l.closed;});
    var closedLps=d.lps.filter(function(l){return l.closed;});
    h+='<div style="margin-top:10px"><div class="lb">LP Positions ('+activeLps.length+' active, '+closedLps.length+' closed)</div>';
    h+='<div class="ov"><table class="lp-tbl"><thead><tr><th>Range</th><th>Deposited</th><th>Left</th><th>USDC</th><th>Status</th></tr></thead><tbody>';
    for(var i=0;i<activeLps.length;i++){var lp=activeLps[i];
      h+='<tr><td class="bld">$'+lp.lo.toFixed(lp.lo<1?3:2)+' → $'+lp.hi.toFixed(2)+'</td>';
      h+='<td style="color:var(--o)">'+F(lp.burn,0)+'</td><td>'+F(lp.left,0)+'</td>';
      h+='<td style="color:var(--g)">$'+F(lp.usdc,2)+'</td><td style="color:var(--cy)">'+lp.pct.toFixed(0)+'%</td></tr>';}
    for(var i2=0;i2<closedLps.length;i2++){var clp=closedLps[i2];
      h+='<tr style="opacity:.4"><td style="text-decoration:line-through">$'+clp.lo.toFixed(clp.lo<1?3:2)+' → $'+clp.hi.toFixed(2)+'</td>';
      h+='<td>—</td><td>—</td><td>—</td><td style="color:var(--r);font-size:8px">CLOSED</td></tr>';}
    h+='</tbody></table></div></div>';}
  else if(d.burn<=0&&d.stBurn<=0){h+='<div style="margin-top:8px;color:var(--dm);font-size:10px">No BURN holdings found</div>';}
  $("wtResult").innerHTML=h;
  var sec=$("sec-wt");if(sec&&!sec.classList.contains("open")){sec.classList.add("open");$("wtCol").classList.add("open");}
}

// ═══ LP P&L DETAIL ═══
function renderLpPnl(){
  try{
    if(!$("lpPnlB")||P<=0)return;
    var Pl=pxUnified(); // COHERENCE: same price as P&L card & LP table
    var rows="",tVN=0,tHV=0,tIL=0,tSold=0,tUsdc=0;
    // Active LPs
    for(var i=0;i<LP.length;i++){
      if(LP[i].fr)continue;
      if(LP[i].lo<=0||LP[i].hi<=0)continue;
      var cv=v3(LP[i].b,LP[i].lo,LP[i].hi,Pl);
      var sold=LP[i].b-cv.left;
      var avgSell=sold>0?cv.usdc/sold:0;
      var valueNow=cv.left*Pl+cv.usdc;
      var hodlValue=LP[i].b*Pl;
      var il=valueNow-hodlValue;
      var ilPct=hodlValue>0?(il/hodlValue*100):0;
      var ff=v3(LP[i].b,LP[i].lo,LP[i].hi,LP[i].hi);
      var rng="$"+LP[i].lo.toFixed(LP[i].lo<1?3:2)+" → $"+LP[i].hi.toFixed(2);
      var avgClr=avgSell>Pl?"var(--g)":avgSell>0?"var(--r)":"var(--dm)";
      var ilClr=il>=0?"var(--g)":"var(--r)";
      tVN+=valueNow;tHV+=hodlValue;tIL+=il;tSold+=sold;tUsdc+=cv.usdc;
      rows+='<tr><td class="bld">'+rng+' <span style="font-size:8px;color:var(--g)">ACTIVE</span></td><td style="color:var(--o)">'+F(sold,0)+'</td>';
      rows+='<td style="color:'+avgClr+'">'+(sold>0?"$"+avgSell.toFixed(4):"—")+'</td>';
      rows+='<td style="color:var(--br)">$'+F(cv.usdc,2)+'</td>';
      rows+='<td style="color:var(--dm)">$'+F(hodlValue,2)+'</td>';
      rows+='<td style="color:'+ilClr+'">'+(il>=0?"+":"-")+"$"+F(Math.abs(il),2)+'</td>';
      rows+='<td style="color:'+ilClr+'">'+ilPct.toFixed(1)+'%</td>';
      rows+='<td style="color:var(--dm)">active</td></tr>';
    }
    // Closed LPs
    for(var ci2=0;ci2<CL.length;ci2++){
      var c=CL[ci2];
      var cAvg=c.b>0?c.u/c.b:0;
      var cHodl=c.b*Pl;
      var cIl=c.u-cHodl;
      var cIlPct=cHodl>0?(cIl/cHodl*100):0;
      var cRng=(c.lo>0&&c.hi>0)?"$"+c.lo.toFixed(c.lo<1?3:2)+"→$"+c.hi.toFixed(2):"Ø $"+(c.u/c.b).toFixed(4);
      var cAvgClr=cAvg>Pl?"var(--g)":"var(--r)";
      var cIlClr=cIl>=0?"var(--g)":"var(--r)";
      tVN+=c.u;tHV+=cHodl;tIL+=cIl;tSold+=c.b;tUsdc+=c.u;
      rows+='<tr style="opacity:.7"><td class="bld" style="font-size:10px">'+cRng+' <span style="font-size:8px;color:var(--dm)">'+c.d+'</span></td><td style="color:var(--o)">'+F(c.b,0)+'</td>';
      rows+='<td style="color:'+cAvgClr+'">$'+cAvg.toFixed(4)+'</td>';
      rows+='<td style="color:var(--g)">$'+F(c.u,2)+'</td>';
      rows+='<td style="color:var(--dm)">$'+F(cHodl,2)+'</td>';
      rows+='<td style="color:'+cIlClr+'">'+(cIl>=0?"+":"-")+"$"+F(Math.abs(cIl),2)+'</td>';
      rows+='<td style="color:'+cIlClr+'">'+cIlPct.toFixed(1)+'%</td>';
      rows+='<td style="color:var(--dm)">closed</td></tr>';
    }
    // Market sales
    for(var mi2=0;mi2<MS.length;mi2++){
      var m=MS[mi2];
      var mAvg=m.b>0?m.u/m.b:0;
      var mHodl=m.b*Pl;
      var mIl=m.u-mHodl;
      var mIlClr=mIl>=0?"var(--g)":"var(--r)";
      tVN+=m.u;tHV+=mHodl;tIL+=mIl;tSold+=m.b;tUsdc+=m.u;
      rows+='<tr style="opacity:.7"><td class="bld" style="font-size:10px">Market <span style="font-size:8px;color:var(--dm)">'+m.d+'</span></td><td style="color:var(--o)">'+F(m.b,0)+'</td>';
      rows+='<td style="color:var(--dm)">$'+mAvg.toFixed(4)+'</td>';
      rows+='<td style="color:var(--g)">$'+F(m.u,2)+'</td>';
      rows+='<td style="color:var(--dm)">$'+F(mHodl,2)+'</td>';
      rows+='<td style="color:'+mIlClr+'">'+(mIl>=0?"+":"-")+"$"+F(Math.abs(mIl),2)+'</td>';
      rows+='<td style="color:'+mIlClr+'">'+(mHodl>0?(mIl/mHodl*100).toFixed(1):0)+'%</td>';
      rows+='<td style="color:var(--dm)">market</td></tr>';
    }
    $("lpPnlB").innerHTML=rows||'<tr><td colspan="8" style="color:var(--dm)">No LP data</td></tr>';
    var wAvgSell=tSold>0?tUsdc/tSold:0;
    $("lpPnlSummary").innerHTML=MB("Total Realized","$"+F(tUsdc,0),"var(--g)")+MB("If HODL","$"+F(tHV,0),"var(--dm)")+
      MB("LP vs HODL",(tIL>=0?"+":"-")+"$"+F(Math.abs(tIL),0),tIL>=0?"var(--g)":"var(--r)")+
      MB("Avg Sell",wAvgSell>0?"$"+wAvgSell.toFixed(4):"—","var(--cy)")+
      MB("Total BURN Sold",F(tSold,0),"var(--o)");
  }catch(e){console.log("lpPnl err:",e);}
}

// ═══ WHALE TRADE MARKER (only used for visual badges in trade list) ═══
var WHALE_MIN=501;
var whaleFirstLoad=true;

// ═══ BR TAX COMPLIANCE MODULE (Lei 14.754/2023) ═══

// PTAX Wechselkurs Cache (USD/BRL)
var BR_PTAX_CACHE={};  // {YYYY-MM-DD: rate}
var BR_PTAX_CURRENT=5.50;  // Fallback if API fails
var BR_PTAX_LAST_FETCH=0;

// BR Tax Residency Start Date — alle Trades davor zählen NICHT als Gewinn/Verlust
// (waren in Deutschland unter Freigrenze)
var BR_TAX_RESIDENCY_START="2025-09-12";

// Tax Mode (user-switchable):
//   "35k" = klassische Capital Gain mit R$35k/Monat Freigrenze (Steuerberater Default-Position)
//   "lei14754" = pauschal 15% auf alle Gewinne (Auslandsregime, konservativ)
var BR_TAX_MODE="35k";
try{var tm=localStorage.getItem("br_tax_mode");if(tm)BR_TAX_MODE=tm;}catch(e){}

// Yearly snapshots (31.12 Bestand) for IRPF Bens e Direitos
var BR_YEAR_SNAPSHOTS={};  // {YYYY: {date, holdings:{ASSET:{qty,avgCostBrl,fmvBrl,fmvUsd}}}}
try{var yss=localStorage.getItem("br_year_snapshots");if(yss)BR_YEAR_SNAPSHOTS=JSON.parse(yss);}catch(e){}

// Permuta Events (steuerauslösende Krypto-zu-Krypto Tausche, LP-Mints, Fills)
// Each: {ts, date, type, asset, qty, usd, brl, costBasisBrl, profitBrl, ptax, note}
var BR_PERMUTAS=[];

// Custo Médio Ponderado pro Asset {asset: {qty, totalCostBrl, avgCostBrl}}
var BR_CUSTO_MEDIO={};

// ═══ STEUER-MODUL (BR) v3 — Premium Compliance-Dashboard ═══
// Datenquelle: /root/tax_extract.py (Server-Ledger). Die App zeigt nur an.
function brAddPermuta(){/* obsolet — Erfassung on-chain durch Server-Extraktor */}
var _taxL=null;
async function taxLoad(force){
  var el=$("taxBody");
  try{
    if(force&&el)el.innerHTML='<div class="tx-load">Ledger wird geladen…</div>';
    var r=await fetch("https://95-216-152-31.sslip.io/taxledger"+(force?"?t="+Date.now():""),{mode:"cors"});
    _taxL=await r.json();
    taxRender();
  }catch(e){if(el)el.innerHTML='<div class="tx-empty"><b>Ledger nicht erreichbar</b><span>'+((e&&e.message)||"Netzwerkfehler")+' — Server-Extraktor prüfen.</span></div>';}
}

// ── Formatierung ──
function txBRL(v){if(v==null||v==="")return"—";return"R$ "+Number(v).toLocaleString("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2});}
function txBRL0(v){if(v==null||v==="")return"—";return"R$ "+Number(v).toLocaleString("de-DE",{maximumFractionDigits:0});}
function txAmt(n){n=Number(n)||0;var a=Math.abs(n);if(a>=1e6)return(n/1e6).toLocaleString("de-DE",{maximumFractionDigits:2})+"M";if(a>=1e3)return(n/1e3).toLocaleString("de-DE",{maximumFractionDigits:a>=1e5?0:1})+"K";if(a>=1)return n.toLocaleString("de-DE",{maximumFractionDigits:2});return n.toLocaleString("de-DE",{maximumFractionDigits:4});}

// ── Line-Icons (monochrom, stroke=currentColor) ──
var TX_ICONS={
  offramp:'<path d="M3 8.5 10 4l7 4.5M4 8.5v7M16 8.5v7M3 16h14M7 11v2.5M10 11v2.5M13 11v2.5"/>',
  swap:'<path d="M4 7h9m0 0-2.5-2.5M13 7l-2.5 2.5M16 13H7m0 0 2.5-2.5M7 13l2.5 2.5"/>',
  sell:'<path d="M4 6l4 5 3-2.5 5 5M16 13.5V9m0 4.5h-4.5"/>',
  buy:'<path d="M4 14l4-5 3 2.5 5-5M16 6.5V11m0-4.5h-4.5"/>',
  coins:'<path d="M10 6.5c3.3 0 6-.9 6-2s-2.7-2-6-2-6 .9-6 2 2.7 2 6 2Z" transform="translate(0 1.5)"/><path d="M4 8v3c0 1.1 2.7 2 6 2s6-.9 6-2V8" transform="translate(0 1.5)"/>',
  lp:'<path d="M10 3 4.5 8.5a5 5 0 1 0 11 0L10 3Z"/>',
  lpout:'<path d="M10 3 4.5 8.5a5 5 0 1 0 11 0L10 3Z" opacity=".5"/><path d="M8 10.5h4"/>',
  burn:'<path d="M10 3s3 3 3 6a3 3 0 0 1-6 0c0-1.2.6-2.2 1.2-3 .2 1 .8 1.5 1.3 1.5.6 0 .8-.7.5-1.5-.4-1.2-.5-2.5 0-3Z"/>',
  tout:'<path d="M4 10h9m0 0-3-3m3 3-3 3M14 5h2v10h-2"/>',
  tin:'<path d="M16 10H7m0 0 3-3m-3 3 3 3M6 5H4v10h2"/>',
  airdrop:'<path d="M10 3v7m0 0L7 7m3 3 3-3M4 13v2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2"/>',
  refund:'<path d="M5 10a5 5 0 1 1 1.5 3.5M5 10V6.5M5 10h3.5"/>',
  stake:'<path d="M6 9V6.5a4 4 0 0 1 8 0V9M5 9h10v7H5z"/>',
  intern:'<path d="M4 7h9m0 0-2.5-2.5M13 7l-2.5 2.5M16 13H7m0 0 2.5-2.5M7 13l2.5 2.5" opacity=".55"/>',
  dot:'<circle cx="10" cy="10" r="2.5"/>'
};
function txIcon(k){return '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'+(TX_ICONS[k]||TX_ICONS.dot)+'</svg>';}

// ── Klassifizierung: roher Ledger-Typ → {icon, label, sub, tone} ──
// tone: 'count' (L2, zählt) · 'l1' (strittig) · 'neutral'
function txClassify(r){
  var t=r.typ||"",cp=r.cp||"",tok=r.tok||"";
  var name=(cp&&cp.indexOf("0x")!==0)?cp:"";
  var tone=r.l2>0?"count":(r.l1>0?"l1":"neutral");
  function P(icon,label,sub){return{icon:icon,label:label,sub:sub||"",tone:tone};}
  if(/OFF-RAMP/i.test(t)){var ex=/Crypto\.com/i.test(t)?"Crypto.com":"Kraken";return P("offramp","Off-Ramp → "+ex,"Verkauf an Börse (→ EUR)");}
  if(/^PERMUTA \(/i.test(t)){var mm=t.match(/PERMUTA \(([^)]+)\)/);var inner=mm?mm[1]:"";var who=inner.split(",").pop().trim();var pair=inner.split(",")[0].trim();return P("swap","Tausch "+pair,(who&&who.indexOf("0x")!==0?"mit "+who:"Krypto-Tausch")+" · Veräußerung");}
  if(/PERMUTA-Erhalt/i.test(t))return P("swap","Tausch erhalten · "+tok,"Gegenwert aus Permuta");
  if(/STAKING\/WRAP \(/i.test(t)){var sm=t.match(/\(([^)]+)\)/);return P("stake","Staking · "+(sm?sm[1]:""),"über Protokoll · strittig");}
  if(/STAKING\/WRAP-Erhalt/i.test(t))return P("stake","Staking erhalten · "+tok,"");
  if(/OTC-VERKAUF \(Erl/i.test(t))return P("coins","OTC-Verkauf",(name?name+" · ":"")+"Veräußerung");
  if(/OTC-VERKAUF \(Token/i.test(t))return P("swap","OTC-Lieferung · "+tok,"Erlös separat gebucht");
  if(/VERKAUF \(Market\)/i.test(t))return P("sell","Verkauf","Markt · "+tok+" → "+(tok==="HOODIE"?"ETH":"USDC"));
  if(/KAUF \(Market\)/i.test(t))return P("buy","Kauf","Markt · → "+tok);
  if(/VERKAUFS-Erl/i.test(t))return P("coins","Verkaufserlös","aus Markt-Swap");
  if(/KAUF-Zahlung/i.test(t))return P("buy","Kaufzahlung","Anschaffung · USDC");
  if(/LP-COLLECT \(Fills/i.test(t))return P("coins","LP-Erlös","Fills aus Liquidität");
  if(/LP-COLLECT \(Token/i.test(t))return P("lpout","LP-Token zurück","aus Liquidität");
  if(/LP-EINLAGE/i.test(t))return P("lp","LP-Einlage · "+tok,"in Pool · strittig");
  if(/LP-ENTNAHME/i.test(t))return P("lpout","LP-Entnahme · "+tok,"aus Pool · strittig");
  if(/BURN \(neutral\)/i.test(t))return P("burn","Burn · "+tok,"vernichtet · kein Verkauf");
  if(/^INTERN/i.test(t))return P("intern","Interner Transfer · "+tok,"eigene Wallets");
  if(/ERHALT \(Airdrop/i.test(t))return P("airdrop","Erhalt · "+tok,"Airdrop · Kostenbasis 0");
  if(/ERLÖS-Eingang/i.test(t))return P("coins","Erlös-Eingang",(name?"von "+name+" · ":"")+"prüfen");
  if(/Rückfluss/i.test(t))return P("refund","Rückfluss · "+tok,"von Börse zurück");
  if(/TRANSFER AN/i.test(t))return P("tout","Transfer · "+tok,(name?"an "+name:"an Dritte"));
  if(/TRANSFER VON/i.test(t))return P("tin","Transfer · "+tok,(name?"von "+name:"von Dritten"));
  return P("dot",t,name);
}

// ── SVG-Ring (% der Freigrenze) ──
function txRing(pct,tone){
  var R=54,C=2*Math.PI*R,cap=Math.min(pct,100),off=C*(1-cap/100);
  var col=tone==="over"?"var(--r)":(tone==="near"?"var(--warn)":"var(--g)");
  return '<svg class="tx-ring" viewBox="0 0 128 128">'
    +'<circle cx="64" cy="64" r="'+R+'" fill="none" stroke="rgba(148,163,184,.13)" stroke-width="9"/>'
    +'<circle class="tx-ring-arc" cx="64" cy="64" r="'+R+'" fill="none" stroke="'+col+'" stroke-width="9" stroke-linecap="round" '
    +'stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+C.toFixed(1)+'" data-off="'+off.toFixed(1)+'" transform="rotate(-90 64 64)"/></svg>';
}

var _taxOpen={};
function taxToggleMonth(m){
  var b=$("txm-"+m),a=$("txa-"+m);if(!b)return;
  var open=b.classList.toggle("open");_taxOpen[m]=open;
  if(a)a.style.transform=open?"rotate(90deg)":"";
}
function taxScrollToMonth(m){
  if(!_taxOpen[m])taxToggleMonth(m);
  var c=$("txcard-"+m);if(c)c.scrollIntoView({behavior:"smooth",block:"start"});
}

function taxRender(){
  var el=$("taxBody");if(!el||!_taxL)return;
  var L=_taxL,lim=L.limite||35000;
  var mons=Object.keys(L.months||{}).sort();
  if(!mons.length){el.innerHTML='<div class="tx-empty"><b>Noch keine Daten</b><span>Der Extraktor hat noch keine Transaktionen erfasst.</span></div>';return;}
  var cur=mons[mons.length-1],cm=L.months[cur];
  var pct=cm.l2/lim*100, tone=cm.l2>lim?"over":((lim-cm.l2)<lim*0.15?"near":"free"), luft=lim-cm.l2;
  var yy=cur.slice(0,4), mLabel=curMonthLabel(cur);

  var h='';
  // ── EYEBROW ──
  h+='<div class="tx-eyebrow"><span>Steuer · Brasilien</span><span class="tx-eyebrow-dim">Freigrenze R$ 35.000 / Monat</span></div>';

  // ── HERO: Ring + aktueller Monat ──
  h+='<div class="tx-hero tx-hero-'+tone+'">'
    +'<div class="tx-hero-ring">'+txRing(pct,tone)
      +'<div class="tx-ring-center"><span class="tx-ring-pct">'+Math.round(pct)+'<i>%</i></span><span class="tx-ring-lbl">der Grenze</span></div></div>'
    +'<div class="tx-hero-main">'
      +'<div class="tx-hero-month">'+mLabel+'</div>'
      +'<div class="tx-hero-val">'+txBRL0(cm.l2)+'</div>'
      +'<div class="tx-hero-sub">steuerbare Veräußerungen (L2)</div>';
  if(tone==="over") h+='<div class="tx-status tx-status-over"><span class="tx-dot"></span>Über der Freigrenze · DARF '+txBRL(cm.darf)+' + DeCripto fällig</div>';
  else if(tone==="near") h+='<div class="tx-status tx-status-near"><span class="tx-dot"></span>Noch '+txBRL(luft)+' bis zur Grenze — keine Verkäufe</div>';
  else h+='<div class="tx-status tx-status-free"><span class="tx-dot"></span>Unter der Freigrenze · '+txBRL0(luft)+' Spielraum</div>';
  h+='<div class="tx-hero-l1">Mit LP/Staking (strittig): '+txBRL0(cm.l1total)+'</div>'
    +'</div></div>';

  // ── SIGNATURE: Jahresverlauf mit Schwellenlinie ──
  var vals=mons.map(function(m){return L.months[m].l2;});
  var maxV=Math.max.apply(null,vals.concat([lim*1.15]));
  var thrPct=lim/maxV*100;
  var overCount=mons.filter(function(m){return L.months[m].l2>lim;}).length;
  h+='<div class="tx-sig">'
    +'<div class="tx-sig-head"><span class="tx-lbl">Jahresverlauf</span>'
      +'<span class="tx-sig-note">'+(overCount?overCount+' Monat über der Grenze':'kein Monat über der Grenze')+'</span></div>'
    +'<div class="tx-spark">'
      +'<div class="tx-thresh" style="bottom:'+thrPct.toFixed(1)+'%"><span>R$ 35k</span></div>';
  mons.forEach(function(m){
    var v=L.months[m].l2, hp=Math.max(v/maxV*100,v>0?3:0), o=v>lim, isCur=m===cur;
    var bcol=o?"var(--r)":(v<=0?"rgba(148,163,184,.22)":"var(--g)");
    h+='<div class="tx-bar-wrap" onclick="taxScrollToMonth(\''+m+'\')" title="'+m+': '+txBRL0(v)+'">'
      +'<div class="tx-bar'+(isCur?' tx-bar-cur':'')+'" style="height:'+hp.toFixed(1)+'%;background:'+bcol+'"></div></div>';
  });
  h+='</div><div class="tx-spark-axis"><span>'+mons[0].replace("-","·")+'</span><span>'+cur.replace("-","·")+'</span></div></div>';

  // ── MONATSLISTE ──
  h+='<div class="tx-lbl tx-lbl-mt">Monate</div><div class="tx-months">';
  for(var i=mons.length-1;i>=0;i--){
    var mk=mons[i],m=L.months[mk];
    var mo=m.l2>lim, mnear=!mo&&(lim-m.l2)<lim*0.15&&m.l2>0, mzero=m.l2<=0;
    var mtone=mo?"over":(mzero?"zero":(mnear?"near":"free"));
    var mcol=mo?"var(--r)":(mzero?"var(--dm)":(mnear?"var(--warn)":"var(--g)"));
    var mpct=Math.min(m.l2/lim*100,100);
    var isCur=mk===cur, openNow=_taxOpen[mk]!==undefined?_taxOpen[mk]:isCur;
    _taxOpen[mk]=openNow;
    var statusTxt=mo?"DARF-pflichtig":(mzero?"keine Verkäufe":(mnear?"knapp":"steuerfrei"));
    var rows=(L.rows||[]).filter(function(r){return r.dt.slice(0,7)===mk;}).filter(function(r){var cc=txClassify(r);if(cc.tone!=="count"&&cc.tone!=="l1")return false;var u=Math.abs(r.usd||0);if(u<5&&r.tok!=="HOODIE"&&r.tok!=="stBURN")return false;return true;}).sort(function(a,b){var bb=Math.abs(b.l2||0)+Math.abs(b.l1||0),aaa=Math.abs(a.l2||0)+Math.abs(a.l1||0);if(bb!==aaa)return bb-aaa;return b.ts-a.ts;});
    h+='<div class="tx-card tx-card-'+mtone+'" id="txcard-'+mk+'">'
      +'<button class="tx-card-head" onclick="taxToggleMonth(\''+mk+'\')">'
        +'<svg class="tx-chev" id="txa-'+mk+'"'+(openNow?' style="transform:rotate(90deg)"':'')+' viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4l4 4-4 4"/></svg>'
        +'<div class="tx-card-info">'
          +'<div class="tx-card-top"><span class="tx-card-month'+(isCur?" tx-cur":"")+'">'+monthLabel(mk)+'</span>'
            +'<span class="tx-card-val" style="color:'+mcol+'">'+txBRL0(m.l2)+'</span></div>'
          +'<div class="tx-card-track"><div class="tx-card-fill" style="width:'+mpct.toFixed(1)+'%;background:'+mcol+'"></div></div>'
          +'<div class="tx-card-meta"><span>'+m.n+' Vorgänge</span><span class="tx-card-status" style="color:'+mcol+'">'+statusTxt+'</span></div>'
        +'</div></button>'
      +'<div class="tx-card-body'+(openNow?" open":"")+'" id="txm-'+mk+'">';
    if(!rows.length){h+='<div class="tx-none">Keine steuerrelevanten Transaktionen in diesem Monat.</div>';}
    else{
      rows.forEach(function(r){
        var c=txClassify(r);
        var chip=c.tone==="count"?'<span class="tx-chip tx-chip-count">zählt</span>'
                :(c.tone==="l1"?'<span class="tx-chip tx-chip-l1">L1</span>':'<span class="tx-chip tx-chip-neutral">neutral</span>');
        h+='<div class="tx-tx">'
          +'<span class="tx-ico tx-ico-'+c.tone+'">'+txIcon(c.icon)+'</span>'
          +'<div class="tx-tx-main"><span class="tx-tx-label">'+c.label+'</span>'
            +'<span class="tx-tx-sub">'+fmtDay(r.dt)+(c.sub?' · '+c.sub:'')+'</span></div>'
          +'<div class="tx-tx-amt"><span class="tx-tx-tok">'+txAmt(r.amt)+' '+r.tok+'</span>'
            +'<span class="tx-tx-brl'+(c.tone==="count"?" tx-brl-count":"")+'">'+(r.brl!=null?txBRL0(r.brl):"—")+'</span></div>'
          +chip+'</div>';
      });
      var hiddenN=Math.max((m.n||0)-rows.length,0);
      if(hiddenN>0) h+='<div class="tx-none" style="opacity:.72">+ '+hiddenN+' weitere Bewegungen (neutral · Staub · &lt;5 US$) — vollständig in der Monatsakte gelistet.</div>';
      var akteBtn=m.l2>0?'<button class="tx-mini tx-mini-akte" onclick="event.stopPropagation();window.open(\'https://95-216-152-31.sslip.io/steuer/monate/'+mk+'.pdf\',\'_blank\')">📄 Monatsakte</button>':'';
      var detBtn=(m.l2>0||m.l1total>0)?'<button class="tx-mini tx-mini-akte" onclick="event.stopPropagation();taxDetail(\''+mk+'\')">⚖ Verteidigung</button>':'';
      h+='<div class="tx-card-foot"><span>Σ steuerbar <b style="color:'+mcol+'">'+txBRL0(m.l2)+'</b> · LP/Staking '+txBRL0(m.l1total)+'</span>'
        +detBtn+akteBtn+'<button class="tx-mini" onclick="event.stopPropagation();taxCsv(\''+mk+'\')">CSV kopieren</button></div>'
        +'<div class="tx-detail" id="txdetail-'+mk+'" style="display:none"></div>';
    }
    h+='</div></div>';
  }
  h+='</div>';

  // ── FUSS ──
  h+='<div class="tx-actions">'
    +'<button class="tx-btn" onclick="taxLoad(true)">Aktualisieren</button>'
    +'<button class="tx-btn tx-btn-ghost" onclick="window.open(\'https://95-216-152-31.sslip.io/steuer/Steuer_Komplettdossier_Juni2026.pdf\',\'_blank\')">Komplett-Dossier</button>'
    +'<button class="tx-btn tx-btn-ghost" onclick="window.open(\'https://95-216-152-31.sslip.io/steuer/Fristen-Kalender.pdf\',\'_blank\')">Fristen</button>'
    +'<button class="tx-btn tx-btn-ghost" onclick="window.open(\'https://95-216-152-31.sslip.io/dossier\',\'_blank\')">Grundsatz-Dossier</button></div>'
    +'<p class="tx-foot">Automatischer On-Chain-Extraktor · alle Wallets, beide Chains · 6-Stunden-Takt. <b>Zählt</b> = steuerbare Veräußerung (L2, Freigrenze R$ 35.000). <b>L1</b> = LP/Staking nach permuta-Lesart (SC COSIT 214/2021 analog, strittig). Beträge in BRL zum PTAX-venda (BCB). Jede Zeile mit Tx-Hash im CSV für die Steuerberatung. Stand '+(L.updated||"—")+' · Steuerresidenz '+(L.residenz||"—")+'.</p>';

  el.innerHTML=h;
  // Ring-Animation triggern
  requestAnimationFrame(function(){var a=el.querySelector(".tx-ring-arc");if(a)requestAnimationFrame(function(){a.style.strokeDashoffset=a.getAttribute("data-off");});});
}

// ── Monatslabels (deutsch) ──
var MON_DE=["Jan","Feb","März","Apr","Mai","Juni","Juli","Aug","Sept","Okt","Nov","Dez"];
var MON_DE_LONG=["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
function monthLabel(mk){var p=mk.split("-");return MON_DE[+p[1]-1]+" "+p[0];}
function curMonthLabel(mk){var p=mk.split("-");return MON_DE_LONG[+p[1]-1]+" "+p[0];}
function fmtDay(dt){var p=dt.split(" ");var d=p[0].split("-");return d[2]+". "+MON_DE[+d[1]-1]+(p[1]?" · "+p[1]:"");}

function taxCsv(mon){
  if(!_taxL)return;
  var mons=Object.keys(_taxL.months||{}).sort();
  var cur=mon||mons[mons.length-1];
  var rows=(_taxL.rows||[]).filter(function(r){return r.dt.slice(0,7)===cur;}).sort(function(a,b){return a.ts-b.ts;});
  var csv="Datum;Chain;Wallet;Typ;Menge;Token;Kurs;USD;PTAX;BRL;L2_BRL;L1_BRL;Ganho_BRL;Custo_BRL;AvgEinstand_USD;Gegenpartei;TxHash;Notiz\n";
  rows.forEach(function(r){csv+=[r.dt,r.chain,r.wallet,r.typ,r.amt,r.tok,r.kurs||"",r.usd||"",r.ptax||"",r.brl||"",r.l2||"",r.l1||"",r.ganho||"",r.custo||"",r.avgUSD||"",r.cp,r.tx,(r.note||"").replace(/;/g,",")].join(";")+"\n";});
  var _mm=(_taxL.months||{})[cur]||{};csv+="\nMONAT;"+cur+";;;;;;;;;L2="+(_mm.l2||0)+";L1total="+(_mm.l1total||0)+";Ganho="+(_mm.ganho||0)+";Custo="+(_mm.custo||0)+";DARF="+(_mm.darf||0)+"\n";try{navigator.clipboard.writeText(csv);alert("CSV "+cur+" ("+rows.length+" Zeilen + Monats-DARF) kopiert — an die Steuerberatung mailen.");}catch(e){alert("Zwischenablage nicht verfügbar.");}
}

// ── Verteidigungsansicht pro Monat (live aus /taxdetail) ──
function txEsc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function taxDetailStyle(){
  if(document.getElementById("txDetailCss"))return;
  var s=document.createElement("style");s.id="txDetailCss";
  s.textContent=".tx-detail{padding:6px 10px 10px;border-top:1px solid rgba(148,163,184,.2);margin-top:4px}.tx-detail-h{font-weight:700;font-size:11.5px;margin:10px 0 4px;color:#1f3a5f}.tx-dtable{width:100%;border-collapse:collapse;font-size:10.5px;margin-bottom:2px}.tx-dtable th{text-align:left;background:#1f3a5f;color:#fff;padding:3px 5px;font-weight:600}.tx-dtable td{padding:3px 5px;border-bottom:1px solid rgba(148,163,184,.18);vertical-align:top}.tx-detail-p{font-size:10.5px;line-height:1.5;margin:6px 0}";
  document.head.appendChild(s);
}
function taxDetail(mk){
  var box=document.getElementById("txdetail-"+mk);if(!box)return;
  taxDetailStyle();
  if(box.getAttribute("data-loaded")==="1"){box.style.display=box.style.display==="none"?"block":"none";return;}
  box.style.display="block";box.innerHTML='<div class="tx-none">Lade Verteidigungsansicht…</div>';
  fetch("https://95-216-152-31.sslip.io/taxdetail?month="+encodeURIComponent(mk),{mode:"cors"}).then(function(r){return r.json();}).then(function(d){
    var h='';
    h+='<div class="tx-detail-h">Szenario-Matrix (Schalter B4 / LP-Fills)</div>';
    h+='<table class="tx-dtable"><tr><th>Reading</th><th style="text-align:right">Volumen</th><th style="text-align:right">Gewinn</th><th style="text-align:right">DARF</th></tr>';
    ["11","10","01","00"].forEach(function(k){var s=(d.scenarios||{})[k];if(!s)return;var rec=k===d.recommended;
      var dc=s.darf===0?"#177245":(s.darf>6000?"#9c2b2b":"#1a1a1a");
      h+='<tr'+(rec?' style="background:#fff7e6"':'')+'><td>'+txEsc(s.label)+'</td><td style="text-align:right">'+txBRL0(s.vol)+'</td><td style="text-align:right">'+txBRL0(s.gain)+'</td><td style="text-align:right;font-weight:700;color:'+dc+'">'+txBRL(s.darf)+'</td></tr>';});
    h+='</table>';
    var tx=d.transactions||[];
    h+='<div class="tx-detail-h">Transaktionen ('+tx.length+')</div>';
    h+='<table class="tx-dtable"><tr><th>Datum</th><th>Asset</th><th>Vorgang</th><th style="text-align:right">BRL</th><th style="text-align:center">35k</th><th>DeCripto</th><th>Ref</th></tr>';
    tx.forEach(function(t){h+='<tr><td>'+txEsc((t.dt||"").slice(0,10))+'</td><td>'+txEsc(t.tok)+'</td><td>'+txEsc((t.typ||"").slice(0,22))+'</td><td style="text-align:right">'+(t.brl!=null?txBRL0(t.brl):"—")+'</td><td style="text-align:center">'+(t.zaehlt?'<b>J</b>':'n')+'</td><td>'+txEsc(t.reg)+'</td><td><b>'+txEsc(t.ref)+'</b></td></tr>';});
    h+='</table>';
    if(d.footnotes&&d.footnotes.length){h+='<div class="tx-detail-h">Rechtsgrundlagen &amp; Entscheidungen (Steuerberater)</div>';
      h+='<table class="tx-dtable"><tr><th>Ref</th><th>Entscheidung — warum so</th><th>Rechtsgrundlage</th></tr>';
      d.footnotes.forEach(function(f){h+='<tr><td><b>'+txEsc(f.ref)+'</b></td><td>'+txEsc(f.decision)+'</td><td>'+txEsc(f.law)+'</td></tr>';});h+='</table>';}
    if(d.handlung){h+='<div class="tx-detail-h">Handlungsbedarf — muss ich zahlen? was melden?</div>';
      h+='<div class="tx-detail-p"><b>Zahlen:</b> '+txEsc(d.handlung.zahlen)+'<br><b>Melden:</b> '+txEsc(d.handlung.melden)+'</div>';}
    h+='<div class="tx-detail-p" style="opacity:.68">Live aus dem On-Chain-Ledger berechnet · Basis Consulta Mychel Mendes (CRC 28007/O-DF) · keine offizielle RFB-Position. Vollständige Monatsakte als PDF oben.</div>';
    box.innerHTML=h;box.setAttribute("data-loaded","1");
  }).catch(function(e){box.innerHTML='<div class="tx-none">Verteidigungsansicht nicht verfügbar (Server nicht erreichbar).</div>';});
}


// ═══ AUTO-DETECT CLOSED LPs ═══
var lpPrevious=[];
try{var lpPrevStr=localStorage.getItem("lp_previous");if(lpPrevStr)lpPrevious=JSON.parse(lpPrevStr);}catch(e){}
var clSeen={};
try{var csStr=localStorage.getItem("cl_seen");if(csStr)clSeen=JSON.parse(csStr);}catch(e){}
// Load auto-detected closed positions from localStorage
try{
  var clStored=localStorage.getItem("cl_history");
  if(clStored){
    var clExtra=JSON.parse(clStored);
    // ONE-TIME CLEANUP: older builds booked dry-pull closes (closed with $0 USDC, BURN returned
    // to wallet) with b = full deposit, inflating "sold" tokens and tanking the avg sell price.
    // Correct any stored $0-close so its sold-token count is 0 (nothing was actually sold).
    for(var cz=0;cz<clExtra.length;cz++){
      if(clExtra[cz]&&(clExtra[cz].u||0)<1&&(clExtra[cz].b||0)>0){
        clExtra[cz].left=Math.round(clExtra[cz].b);
        clExtra[cz].b=0;
        if(clExtra[cz].n&&clExtra[cz].n.indexOf("nur Token")<0)clExtra[cz].n=clExtra[cz].n.replace(/\(.*\)/,"(nur Token zurück)");
      }
    }
    try{localStorage.setItem("cl_history",JSON.stringify(clExtra));}catch(e){}
    for(var ci2=0;ci2<clExtra.length;ci2++){
      var isDupe=false;
      for(var cj=0;cj<CL.length;cj++){if(clExtra[ci2].d===CL[cj].d&&clExtra[ci2].b===CL[cj].b&&clExtra[ci2].n===CL[cj].n){isDupe=true;break;}}
      if(!isDupe){CL.push(clExtra[ci2]);TS+=clExtra[ci2].b;TR+=clExtra[ci2].u;}
    }
  }
}catch(e){}

// ═══ EXACT CLOSE AMOUNTS from on-chain Burn event ═══
// When an LP is closed, Uniswap emits a Burn(owner,tickLower,tickUpper,amount,amount0,amount1)
// event on the POOL with the EXACT token amounts removed — real numbers, not a calculation.
// We match by the position's tick range and read amount0 (USDC) + amount1 (BURN) directly.
// This runs AFTER detectClosedLPs flags a close, then patches the entry with exact values.
var BURN_EVT_SIG="0x0c396cd989a39f4459b5fa1aed6a9a8dcdbc45908acfd67e028cd568da98982c";
function _tickFromPrice(p){ // inverse of wtTickToPrice: tick = log(1e12/p)/log(1.0001)
  return Math.round(Math.log(1e12/p)/Math.log(1.0001));
}
async function fetchExactCloseAmounts(entry){
  try{
    // The pool stores ticks as token0/token1 ordering. Our lo/hi are human BURN prices.
    // wtTickToPrice(tick)=1e12/1.0001^tick, so price=hi → lower tick, price=lo → higher tick.
    var tickAtHi=_tickFromPrice(entry.hi), tickAtLo=_tickFromPrice(entry.lo);
    var tLower=Math.min(tickAtHi,tickAtLo), tUpper=Math.max(tickAtHi,tickAtLo);
    var bnRes=await batchRpc([{jsonrpc:"2.0",method:"eth_blockNumber",params:[],id:0}]);
    var head=0;if(bnRes&&bnRes[0]&&bnRes[0].result)head=parseInt(bnRes[0].result,16);
    if(!head)return null;
    // Scan recent blocks for Burn events (Arbitrum ~4 blk/s → ~1 day = 350k blocks).
    var from=head-400000;
    var logs=null;
    for(var ri=0;ri<RPC_LIST.length&&!logs;ri++){
      try{
        var idx=(rpcIdx+ri)%RPC_LIST.length;
        var r=await fetch(RPC_LIST[idx],{method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({jsonrpc:"2.0",method:"eth_getLogs",params:[{
            address:POOL,topics:[BURN_EVT_SIG],
            fromBlock:"0x"+from.toString(16),toBlock:"latest"}],id:0})});
        var j=await r.json();
        if(j&&Array.isArray(j.result))logs=j.result;
      }catch(e){}
    }
    if(!logs||!logs.length)return null;
    // Match by tick range (topics[2]=tickLower, topics[3]=tickUpper as int24, padded).
    function parseTick(hex){var v=parseInt(hex.slice(-6),16);if(v>=0x800000)v-=0x1000000;return v;}
    var best=null;
    for(var i=logs.length-1;i>=0;i--){ // newest first
      var lg=logs[i];
      if(!lg.topics||lg.topics.length<4)continue;
      var tL=parseTick(lg.topics[2]), tU=parseTick(lg.topics[3]);
      if(Math.abs(tL-tLower)<=2&&Math.abs(tU-tUpper)<=2){ // tick spacing tolerance
        best=lg;break;
      }
    }
    if(!best)return null;
    // data = amount(liq, uint128) | amount0 (uint256) | amount1 (uint256)
    var d=best.data.slice(2);
    var amount0=parseInt(d.slice(64,128),16)/1e6;   // USDC (6 decimals)
    var amount1=parseInt(d.slice(128,192),16)/1e18;  // BURN (18 decimals)
    // Sanity: amounts must be finite & non-negative
    if(!isFinite(amount0)||!isFinite(amount1)||amount0<0||amount1<0)return null;
    return{usdc:amount0,burnReturned:amount1,txHash:best.transactionHash};
  }catch(e){console.log("fetchExactCloseAmounts err:",e.message);return null;}
}
// After a close is detected, refine the entry with exact on-chain amounts (async, non-blocking).
async function refineClosedWithExact(entry){
  var exact=await fetchExactCloseAmounts(entry);
  if(!exact)return false; // keep calculated values (fallback)
  // exact.burnReturned = BURN that came back to wallet; exact.usdc = USDC received.
  // Sold BURN = deposited − returned.
  var soldBurn=Math.max(0,(entry.bDeposited||entry.b)-Math.round(exact.burnReturned));
  // Adjust the running totals: remove old (calculated), add exact.
  TS+=(soldBurn-entry.b);
  TR+=(exact.usdc-entry.u);
  entry.b=soldBurn;
  entry.u=Math.round(exact.usdc*100)/100;
  entry.left=Math.round(exact.burnReturned);
  entry.exact=true;
  entry.n="🔄 $"+entry.lo.toFixed(3)+"→$"+entry.hi.toFixed(2)+" (exakt"+(entry.left>0?", "+F(entry.left,0)+" BURN zurück":"")+")";
  console.log("LP CLOSE refined with EXACT on-chain: sold "+soldBurn+" BURN → $"+entry.u+(entry.left>0?", "+entry.left+" BURN returned":""));
  // Re-record BR event with exact values (replace the estimated one).
  try{
    if(typeof brAddPermuta==="function"&&soldBurn>0){
      var dDate=new Date().toISOString().split("T")[0];
      brAddPermuta("lp_fill","BURN",soldBurn,entry.u,
        "Auto-exakt: LP "+entry.lo.toFixed(3)+"-"+entry.hi.toFixed(2)+" closed (on-chain)",dDate);
    }
  }catch(e){}
  try{localStorage.setItem("closed_lps",JSON.stringify(CL));}catch(e){}
  if(typeof render==="function")render();
  return true;
}
function detectClosedLPs(newLPs){
  if(!lpPrevious||lpPrevious.length===0)return;
  var detected=[];
  for(var i=0;i<lpPrevious.length;i++){
    var prev=lpPrevious[i];
    var found=false;
    for(var j=0;j<newLPs.length;j++){
      if(Math.abs(newLPs[j].lo-prev.lo)<0.001&&Math.abs(newLPs[j].hi-prev.hi)<0.001&&Math.abs(newLPs[j].b-prev.b)<prev.b*0.05){found=true;break;}
    }
    if(!found){
      var key=prev.b.toFixed(0)+"_"+prev.lo.toFixed(4)+"_"+prev.hi.toFixed(4);
      if(clSeen[key])continue;
      // Partial-close correctness: only the BURN that actually SOLD counts as realized.
      // A 95%-filled position returns (prev.left) BURN + (prev.usdc) USDC when closed.
      // The returned BURN flows back into the wallet/ledger on the next scan, so we must
      // NOT book the full deposited amount as sold — only (prev.b − prev.left).
      var soldBurn=Math.max(0,prev.b-Math.round(prev.left||0));
      var leftBurn=Math.round(prev.left||0);
      // DRY-PULL GUARD: if the position closed with ~$0 USDC, NOTHING was sold — the BURN
      // came back to the wallet. Without this, a position the app thought was "full" (left=0)
      // would book the whole deposit as sold for $0, inflating "sold" and tanking the avg price.
      // When usdc≈0, force soldBurn=0 and treat the full deposit as returned BURN.
      if((prev.usdc||0)<1){
        soldBurn=0;
        leftBurn=Math.round(prev.b);
      }
      var entry={
        d:new Date().toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"2-digit"}),
        b:soldBurn, lo:prev.lo, hi:prev.hi,
        u:Math.round(prev.usdc*100)/100,
        n:"🔄 $"+prev.lo.toFixed(3)+"→$"+prev.hi.toFixed(2)+" ("+(soldBurn>0?prev.pct.toFixed(0)+"% filled":"nur Token zurück")+(leftBurn>0&&soldBurn>0?", "+F(leftBurn,0)+" BURN zurück":"")+")",
        left:leftBurn, pct:prev.pct, bDeposited:prev.b
      };
      CL.push(entry);TS+=entry.b;TR+=entry.u;
      detected.push(entry);
      clSeen[key]=Date.now();
      console.log("LP CLOSED detected: "+entry.n+" sold "+soldBurn+" BURN → $"+entry.u+(leftBurn>0?" ("+leftBurn+" BURN returned to wallet)":""));
      // Auto-add as BR Permuta Event (lp_fill = BURN→USDC) — only the SOLD burn.
      try{
        if(typeof brAddPermuta==="function"&&soldBurn>0){
          var dDate=new Date().toISOString().split("T")[0];
          brAddPermuta("lp_fill","BURN",soldBurn,entry.u,
            "Auto: LP "+entry.lo.toFixed(3)+"-"+entry.hi.toFixed(2)+" closed"+(leftBurn>0?" ("+F(leftBurn,0)+" BURN zurück)":""),dDate);
          console.log("BR Permuta auto-recorded: lp_fill BURN "+soldBurn);
        }
      }catch(e){console.log("BR auto-permuta err:",e.message);}
      // Refine with EXACT on-chain Burn-event amounts (async, non-blocking).
      // Calculated values show immediately; exact values patch in a few seconds later.
      try{refineClosedWithExact(entry);}catch(e){console.log("refine err:",e.message);}
    }
  }
  if(detected.length>0){
    try{localStorage.setItem("cl_history",JSON.stringify(CL.filter(function(c){return c.n&&c.n.indexOf("🔄")===0;})));
      localStorage.setItem("cl_seen",JSON.stringify(clSeen));}catch(e){}
    if(typeof beep==="function"&&typeof soundOn!=="undefined"&&soundOn)beep();
  }
}

// ─── RECONCILE: catch closed LPs that detectClosedLPs MISSED ───
// detectClosedLPs only sees a position close if it was in lpPrevious (i.e. a scan ran while
// it was open). A position opened AND closed between two scans is never in lpPrevious, so its
// realized USDC never enters the CL history — even though the on-chain Liquidity-Map (lpOwners)
// reads it correctly with real Collect-event amounts. This bridges that gap: given a closed
// NFT's real burnOut/usdcOut from the chain, add it to the CL history if not already there.
// Matched by tokenId so we never double-count a position detectClosedLPs already handled.
var clTokenIds={};
try{var cti=localStorage.getItem("cl_token_ids");if(cti)clTokenIds=JSON.parse(cti);}catch(e){}
function reconcileClosedFromChain(tokenId,lo,hi,burnOut,usdcOut){
  try{
    if(!tokenId)return false;
    tokenId=tokenId.toString();
    if(clTokenIds[tokenId])return false;            // already reconciled this NFT
    if(!(usdcOut>0))return false;                    // no USDC realized → nothing to add (dry pull)
    // Also skip if an existing CL entry already covers this range+usdc (detectClosedLPs path).
    for(var i=0;i<CL.length;i++){
      var c=CL[i];
      if(c&&Math.abs((c.lo||0)-lo)<0.001&&Math.abs((c.hi||0)-hi)<0.001&&Math.abs((c.u||0)-usdcOut)<Math.max(2,usdcOut*0.03)){
        clTokenIds[tokenId]=Date.now();              // mark seen so we don't re-check forever
        try{localStorage.setItem("cl_token_ids",JSON.stringify(clTokenIds));}catch(e){}
        return false;
      }
    }
    // burnOut from Collect = BURN that came BACK (unsold remainder). We don't know the exact
    // deposited amount here, so book the USDC as realized and record returned BURN for clarity.
    var entry={
      d:new Date().toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"2-digit"}),
      b:0, lo:lo, hi:hi,
      u:Math.round(usdcOut*100)/100,
      n:"🔄 $"+lo.toFixed(3)+"→$"+hi.toFixed(2)+" (exakt on-chain, #"+tokenId.slice(-6)+")",
      left:Math.round(burnOut||0), pct:100, exact:true, fromChain:true
    };
    CL.push(entry);TR+=entry.u;
    clTokenIds[tokenId]=Date.now();
    try{
      localStorage.setItem("cl_token_ids",JSON.stringify(clTokenIds));
      localStorage.setItem("closed_lps",JSON.stringify(CL));
      localStorage.setItem("cl_history",JSON.stringify(CL.filter(function(c){return c.n&&c.n.indexOf("🔄")===0;})));
    }catch(e){}
    console.log("RECONCILED missed close from chain: #"+tokenId+" $"+entry.u+" USDC ("+lo.toFixed(3)+"-"+hi.toFixed(2)+")");
    if(typeof brAddPermuta==="function"){
      try{
        var dDate=new Date().toISOString().split("T")[0];
        brAddPermuta("lp_fill","BURN",0,entry.u,"Auto-reconcile: LP "+lo.toFixed(3)+"-"+hi.toFixed(2)+" closed on-chain",dDate);
      }catch(e){}
    }
    if(typeof renderWal==="function")try{renderWal();}catch(e){}
    return true;
  }catch(e){console.log("reconcileClosed err:",e.message);return false;}
}


try{var lms=localStorage.getItem("lp_mint_seen");if(lms)lpMintSeen=JSON.parse(lms);}catch(e){}

function detectNewLPMints(currentLPs){
  if(!lpPrevious)return;  // Skip first run (no previous state)
  var detected=[];
  for(var i=0;i<currentLPs.length;i++){
    var cur=currentLPs[i];
    var found=false;
    for(var j=0;j<lpPrevious.length;j++){
      // Match by lo/hi range (b might differ slightly due to fee accumulation)
      if(Math.abs(lpPrevious[j].lo-cur.lo)<0.001&&Math.abs(lpPrevious[j].hi-cur.hi)<0.001){found=true;break;}
    }
    if(!found){
      // New LP mint detected
      var key=cur.b.toFixed(0)+"_"+cur.lo.toFixed(4)+"_"+cur.hi.toFixed(4);
      if(lpMintSeen[key])continue;
      lpMintSeen[key]=Date.now();
      detected.push(cur);
      console.log("LP MINT detected: $"+cur.lo.toFixed(3)+"-$"+cur.hi.toFixed(2)+" "+cur.b+" BURN");
      // Auto BR Permuta Event for LP-Mint
      try{
        if(typeof brAddPermuta==="function"&&typeof P!=="undefined"&&P>0){
          var dDate=new Date().toISOString().split("T")[0];
          var usdValue=cur.b*P;  // FMV at mint time
          brAddPermuta("lp_mint","BURN",cur.b,usdValue,
            "Auto: LP $"+cur.lo.toFixed(3)+"-$"+cur.hi.toFixed(2)+" minted",dDate);
        }
      }catch(e){console.log("BR LP-mint permuta err:",e.message);}
    }
  }
  if(detected.length>0){
    try{localStorage.setItem("lp_mint_seen",JSON.stringify(lpMintSeen));}catch(e){}
  }
}

// ═══ PUSH STATUS / FCM TOKEN SYNC ═══
var FCM_REGISTER_URL="https://95-216-152-31.sslip.io/fcm/register";

function showPushSub(){
  var sub=localStorage.getItem("push_sub");
  var fcm=localStorage.getItem("fcm_token");
  var info="";
  if(fcm)info+='<div style="margin-bottom:4px"><b>FCM Token:</b><br><span style="color:var(--g);word-break:break-all">'+fcm+'</span></div>';
  if(sub)info+='<div><b>Web Push Sub:</b><br>'+sub+'</div>';
  if(!fcm&&!sub)info='<span style="color:var(--r)">Kein Token gefunden. APK öffnen oder Browser-Push aktivieren.</span>';
  $("pushSubInfo").innerHTML=info;
}

function copyFcmToken(){
  var fcm=localStorage.getItem("fcm_token");
  if(!fcm){alert("Kein FCM Token gefunden.");return;}
  try{
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(fcm).then(function(){
        $("pushStatus").innerHTML='<span style="color:var(--g)">✓ Token in Zwischenablage kopiert</span>';
      }).catch(function(){
        // Fallback
        var ta=document.createElement("textarea");ta.value=fcm;document.body.appendChild(ta);ta.select();
        try{document.execCommand("copy");$("pushStatus").innerHTML='<span style="color:var(--g)">✓ Token kopiert</span>';}catch(e){alert("FCM Token:\n\n"+fcm);}
        document.body.removeChild(ta);
      });
    }else{
      alert("FCM Token:\n\n"+fcm);
    }
  }catch(e){alert("FCM Token:\n\n"+fcm);}
}

function syncFcmToServer(){
  var fcm=localStorage.getItem("fcm_token");
  if(!fcm){
    $("pushStatus").innerHTML='<span style="color:var(--r)">⚠ Kein FCM Token im localStorage. APK öffnen damit Token gesetzt wird.</span>';
    return;
  }
  $("pushStatus").innerHTML='<span style="color:var(--cy)">Sende Token an Hetzner…</span>';
  fetch(FCM_REGISTER_URL,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({token:fcm,ts:Date.now()})
  }).then(function(r){
    if(r.ok){
      $("pushStatus").innerHTML='<span style="color:var(--g)">✓ Token an Hetzner gesendet</span>';
      try{localStorage.setItem("fcm_synced_ts",Date.now().toString());localStorage.setItem("fcm_synced_value",fcm);}catch(e){}
    }else{
      $("pushStatus").innerHTML='<span style="color:var(--o)">⚠ Server antwortet '+r.status+'. Endpoint POST /fcm/register evtl. noch nicht aktiv. Token alternativ kopieren und manuell auf Hetzner ablegen.</span>';
    }
  }).catch(function(e){
    $("pushStatus").innerHTML='<span style="color:var(--o)">⚠ Sync fehlgeschlagen: '+e.message+'. Endpoint evtl. noch nicht live — Token kopieren und manuell auf Hetzner.</span>';
  });
}

function renderPushStatus(){
  try{
    if(!$("pushStatus"))return;
    var fcm=localStorage.getItem("fcm_token");
    var sub=localStorage.getItem("push_sub");
    var syncedTs=localStorage.getItem("fcm_synced_ts");
    var html="";
    if(fcm){
      var shortFcm=fcm.slice(0,12)+"…"+fcm.slice(-8);
      html+='<span style="color:var(--g)">✓ FCM Token aktiv</span> <span style="color:var(--dm);font-size:9px">('+shortFcm+')</span>';
    }else if(sub){
      html+='<span style="color:var(--cy)">Web Push aktiv</span> <span style="color:var(--dm);font-size:9px">(kein FCM)</span>';
    }else{
      html+='<span style="color:var(--r)">Kein Token gefunden</span>';
    }
    if(syncedTs){
      var ageMs=Date.now()-parseInt(syncedTs);
      var ageStr=ageMs<60000?"gerade":ageMs<3600000?Math.round(ageMs/60000)+"m":ageMs<86400000?Math.round(ageMs/3600000)+"h":Math.round(ageMs/86400000)+"d";
      html+=' · <span style="color:var(--dm);font-size:9px">letzter Sync: '+ageStr+' her</span>';
    }
    $("pushStatus").innerHTML=html;
  }catch(e){}
}


// ═══ CAPITAL FLOW CHART ═══
var cflowMode="day";
function setCflowMode(m){
  cflowMode=m;
  var bd=$("cflowBtnDay"),bm=$("cflowBtnMonth");
  if(bd&&bm){
    if(m==="day"){
      bd.style.background="rgba(96,165,250,.18)";bd.style.borderColor="rgba(96,165,250,.5)";bd.style.color="var(--b)";
      bm.style.background="";bm.style.borderColor="";bm.style.color="";
    }else{
      bm.style.background="rgba(96,165,250,.18)";bm.style.borderColor="rgba(96,165,250,.5)";bm.style.color="var(--b)";
      bd.style.background="";bd.style.borderColor="";bd.style.color="";
    }
  }
  renderCapitalFlow();
}
function renderCapitalFlow(){
  try{
    if(!$("cflowChart")||!allTrades||allTrades.length<2)return;
    var now=Date.now();
    var isMonth=(cflowMode==="month");
    // Aggregate by day OR month
    var buckets={};
    for(var i=0;i<allTrades.length;i++){
      var t=allTrades[i];
      var ms=now-t.minAgo*60000;
      var dt=new Date(ms);
      var key=isMonth?(dt.toISOString().slice(0,7)):(dt.toISOString().split("T")[0]); // YYYY-MM or YYYY-MM-DD
      if(!buckets[key])buckets[key]={buy:0,sell:0,net:0,count:0};
      if(t.isBuy){buckets[key].buy+=t.usdc;}else{buckets[key].sell+=t.usdc;}
      buckets[key].net+=(t.isBuy?t.usdc:-t.usdc);
      buckets[key].count++;
    }
    var keys=Object.keys(buckets).sort();
    if(keys.length<1)return;
    var shown=isMonth?keys.slice(-12):keys.slice(-14);
    // Summary
    var totalBuy=0,totalSell=0;
    for(var d=0;d<shown.length;d++){totalBuy+=buckets[shown[d]].buy;totalSell+=buckets[shown[d]].sell;}
    $("cflowSummary").innerHTML=MB("Buy Volume","$"+F(totalBuy,0),"var(--g)")+MB("Sell Volume","$"+F(totalSell,0),"var(--r)")+
      MB("Net Flow",(totalBuy-totalSell>=0?"+":"-")+"$"+F(Math.abs(totalBuy-totalSell),0),totalBuy>=totalSell?"var(--g)":"var(--r)")+
      MB(isMonth?"Months":"Days",shown.length,"var(--br)");
    // SVG bar chart
    var maxVal=1;
    for(var d2=0;d2<shown.length;d2++){var abs=Math.abs(buckets[shown[d2]].net);if(abs>maxVal)maxVal=abs;}
    var svgW=700,svgH=160,barW=Math.floor(svgW/shown.length)-4,midY=svgH/2;
    var svg='<svg viewBox="0 0 '+svgW+' '+(svgH+22)+'" style="width:100%;height:auto">';
    svg+='<line x1="0" y1="'+midY+'" x2="'+svgW+'" y2="'+midY+'" stroke="rgba(148,163,184,.3)" stroke-width="1" stroke-dasharray="4"/>';
    var monthNames=["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"];
    for(var d3=0;d3<shown.length;d3++){
      var dk=shown[d3];var net=buckets[dk].net;
      var barH=Math.abs(net)/maxVal*(midY-10);
      var x=d3*(barW+4)+2;
      var clr=net>=0?"#34d399":"#f87171";
      var y=net>=0?midY-barH:midY;
      svg+='<rect x="'+x+'" y="'+y+'" width="'+barW+'" height="'+Math.max(barH,1)+'" fill="'+clr+'" rx="2" opacity=".85"><title>'+dk+': '+(net>=0?"+":"")+"$"+F(net,0)+' (Buy $'+F(buckets[dk].buy,0)+' / Sell $'+F(buckets[dk].sell,0)+')</title></rect>';
      // Label: month name for month mode, MM-DD for day mode
      var lbl;
      if(isMonth){var mp=dk.split("-");lbl=monthNames[parseInt(mp[1])-1]+(shown.length<=12?"":" "+mp[0].slice(2));}
      else{lbl=dk.slice(5);}
      svg+='<text x="'+(x+barW/2)+'" y="'+(svgH+14)+'" text-anchor="middle" fill="#94a3b8" font-size="'+(isMonth?9:7)+'" font-family="JetBrains Mono">'+lbl+'</text>';
    }
    svg+='<text x="4" y="12" fill="#94a3b8" font-size="8">+$'+F(maxVal,0)+'</text>';
    svg+='<text x="4" y="'+(svgH-4)+'" fill="#94a3b8" font-size="8">-$'+F(maxVal,0)+'</text>';
    svg+='</svg>';
    $("cflowChart").innerHTML=svg;
  }catch(e){console.log("cflow err:",e);}
}

// ═══ CAPITAL FLOW FULLSCREEN ═══
var cflowFsMode="month";
function openCflowFullscreen(){
  cflowFsMode=cflowMode; // start in same mode as inline
  var ov=$("cflowFsOverlay");if(ov)ov.style.display="block";
  setCflowFsMode(cflowFsMode);
}
function closeCflowFullscreen(){var ov=$("cflowFsOverlay");if(ov)ov.style.display="none";}
function setCflowFsMode(m){
  cflowFsMode=m;
  var bd=$("cflowFsBtnDay"),bm=$("cflowFsBtnMonth");
  if(bd&&bm){
    if(m==="day"){
      bd.style.background="rgba(96,165,250,.18)";bd.style.borderColor="rgba(96,165,250,.5)";bd.style.color="var(--b)";
      bm.style.background="";bm.style.borderColor="";bm.style.color="";
    }else{
      bm.style.background="rgba(96,165,250,.18)";bm.style.borderColor="rgba(96,165,250,.5)";bm.style.color="var(--b)";
      bd.style.background="";bd.style.borderColor="";bd.style.color="";
    }
  }
  renderCflowFullscreen();
}
function renderCflowFullscreen(){
  try{
    var box=$("cflowFsContent");if(!box||!allTrades||allTrades.length<2){if(box)box.innerHTML='<div style="color:var(--dm);font-size:12px">Keine Trade-Daten.</div>';return;}
    var now=Date.now();
    var isMonth=(cflowFsMode==="month");
    var buckets={};
    for(var i=0;i<allTrades.length;i++){
      var t=allTrades[i];
      var ms=now-t.minAgo*60000;var dt=new Date(ms);
      var key=isMonth?(dt.toISOString().slice(0,7)):(dt.toISOString().split("T")[0]);
      if(!buckets[key])buckets[key]={buy:0,sell:0,net:0,count:0};
      if(t.isBuy){buckets[key].buy+=t.usdc;}else{buckets[key].sell+=t.usdc;}
      buckets[key].net+=(t.isBuy?t.usdc:-t.usdc);buckets[key].count++;
    }
    var keys=Object.keys(buckets).sort();
    var shown=isMonth?keys.slice(-24):keys.slice(-60); // more history in fullscreen
    var monthNames=["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"];
    // Summary
    var totalBuy=0,totalSell=0;
    for(var s=0;s<shown.length;s++){totalBuy+=buckets[shown[s]].buy;totalSell+=buckets[shown[s]].sell;}
    var net=totalBuy-totalSell;
    var html='<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px">'+
      '<div style="flex:1;min-width:120px;background:rgba(8,12,22,.6);border:1px solid rgba(52,211,153,.25);border-radius:10px;padding:12px"><div style="font-size:9px;color:var(--dm);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Buy Volume</div><div style="font-size:20px;font-weight:700;color:var(--g)">$'+F(totalBuy,0)+'</div></div>'+
      '<div style="flex:1;min-width:120px;background:rgba(8,12,22,.6);border:1px solid rgba(248,113,113,.25);border-radius:10px;padding:12px"><div style="font-size:9px;color:var(--dm);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Sell Volume</div><div style="font-size:20px;font-weight:700;color:var(--r)">$'+F(totalSell,0)+'</div></div>'+
      '<div style="flex:1;min-width:120px;background:rgba(8,12,22,.6);border:1px solid '+(net>=0?"rgba(52,211,153,.25)":"rgba(248,113,113,.25)")+';border-radius:10px;padding:12px"><div style="font-size:9px;color:var(--dm);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Net Flow</div><div style="font-size:20px;font-weight:700;color:'+(net>=0?"var(--g)":"var(--r)")+'">'+(net>=0?"+":"-")+"$"+F(Math.abs(net),0)+'</div></div>'+
    '</div>';
    // ─── KUMULATIVER NET-FLOW (Pool-Tiefe-Verlauf) ───
    // Summiert den monatlichen Net-Flow auf → zeigt ob Kapital netto rein- oder rausfließt über Zeit.
    // Das ist das Frühwarnsystem: steigende Linie = These intakt, fallende = Zuflüsse versiegen.
    if(isMonth&&shown.length>=2){
      var cum=0,cumPts=[],cumLabels=[];
      for(var cf=0;cf<shown.length;cf++){
        cum+=buckets[shown[cf]].net;
        cumPts.push(cum);
        var cmp=shown[cf].split("-");cumLabels.push(monthNames[parseInt(cmp[1])-1]);
      }
      var cMin=Math.min.apply(null,cumPts),cMax=Math.max.apply(null,cumPts);
      var cRange=Math.max(1,cMax-cMin);
      var W=320,H=90,pad=4;
      var stepX=cumPts.length>1?(W-pad*2)/(cumPts.length-1):0;
      var pts="",areaPts="";
      for(var cp=0;cp<cumPts.length;cp++){
        var px=pad+cp*stepX;
        var py=H-pad-((cumPts[cp]-cMin)/cRange)*(H-pad*2);
        pts+=(cp===0?"":" ")+px.toFixed(1)+","+py.toFixed(1);
      }
      var lastCum=cumPts[cumPts.length-1];
      var firstCum=cumPts[0];
      var cumTrend=lastCum>=firstCum;
      var lineColor=cumTrend?"#34d399":"#f87171";
      // Zero-Linie Position (falls im Bereich)
      var zeroY=null;
      if(cMin<0&&cMax>0){zeroY=(H-pad-((0-cMin)/cRange)*(H-pad*2));}
      var areaPath="M "+pad+","+(H-pad)+" L "+pts.replace(/ /g," L ")+" L "+(pad+(cumPts.length-1)*stepX).toFixed(1)+","+(H-pad);
      html+='<div style="background:rgba(8,12,22,.6);border:1px solid '+(cumTrend?"rgba(52,211,153,.3)":"rgba(248,113,113,.3)")+';border-radius:10px;padding:14px;margin-bottom:20px">'+
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'+
          '<span style="font-size:10px;color:var(--mt);text-transform:uppercase;letter-spacing:1px">📈 Kumulativer Kapitalzufluss</span>'+
          '<span style="font-size:14px;font-weight:700;color:'+lineColor+';font-family:Geist Mono,monospace">'+(lastCum>=0?"+":"-")+"$"+F(Math.abs(lastCum),0)+'</span>'+
        '</div>'+
        '<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:auto;display:block">'+
          '<defs><linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="'+lineColor+'" stop-opacity="0.25"/><stop offset="100%" stop-color="'+lineColor+'" stop-opacity="0"/></linearGradient></defs>'+
          (zeroY!==null?'<line x1="'+pad+'" y1="'+zeroY.toFixed(1)+'" x2="'+(W-pad)+'" y2="'+zeroY.toFixed(1)+'" stroke="rgba(148,163,184,.3)" stroke-width="1" stroke-dasharray="3,3"/>':'')+
          '<path d="'+areaPath+' Z" fill="url(#cumGrad)"/>'+
          '<polyline points="'+pts+'" fill="none" stroke="'+lineColor+'" stroke-width="2" stroke-linejoin="round"/>'+
          '<circle cx="'+(pad+(cumPts.length-1)*stepX).toFixed(1)+'" cy="'+(H-pad-((lastCum-cMin)/cRange)*(H-pad*2)).toFixed(1)+'" r="3.5" fill="'+lineColor+'"/>'+
        '</svg>'+
        '<div style="display:flex;justify-content:space-between;font-size:8px;color:var(--dm);margin-top:4px"><span>'+cumLabels[0]+'</span><span>'+cumLabels[cumLabels.length-1]+'</span></div>'+
        '<div style="font-size:9px;color:var(--mt);text-align:center;margin-top:8px;line-height:1.5">'+
          (cumTrend?'✅ Netto fließt Kapital in den Pool — Liquidität wächst':'⚠️ Netto fließt Kapital ab — Zuflüsse beobachten')+
        '</div>'+
      '</div>';

      // ─── TRADE-AKTIVITÄT: Anzahl + Ø-Größe ───
      // Steigende Trade-Zahl = mehr Teilnehmer (Adoption). Steigende Ø-Größe = größere Tickets.
      // Beides zusammen = gesundes organisches Wachstum (nicht nur ein paar Wale).
      var counts=[],avgSizes=[],actLabels=[];
      for(var ac=0;ac<shown.length;ac++){
        var b=buckets[shown[ac]];
        counts.push(b.count);
        avgSizes.push(b.count>0?(b.buy+b.sell)/b.count:0);
        var amp=shown[ac].split("-");actLabels.push(monthNames[parseInt(amp[1])-1]);
      }
      var maxCount=Math.max.apply(null,counts)||1;
      var maxAvg=Math.max.apply(null,avgSizes)||1;
      // Trend: vergleiche letzte 3 vs erste 3 (oder weniger)
      function trendOf(arr){
        if(arr.length<2)return 0;
        var h=Math.ceil(arr.length/2);
        var early=arr.slice(0,h).reduce(function(a,b){return a+b;},0)/h;
        var late=arr.slice(-h).reduce(function(a,b){return a+b;},0)/h;
        return late-early;
      }
      var countTrend=trendOf(counts)>=0;
      var avgTrend=trendOf(avgSizes)>=0;
      var lastCount=counts[counts.length-1];
      var lastAvg=avgSizes[avgSizes.length-1];

      // Mini-Balken-Builder
      function miniBars(vals,labels,maxV,color){
        var bars='<div style="display:flex;align-items:flex-end;gap:3px;height:48px;margin:6px 0">';
        for(var mb=0;mb<vals.length;mb++){
          var h=maxV>0?(vals[mb]/maxV*100):0;
          var isLast=(mb===vals.length-1);
          bars+='<div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;height:100%">'+
            '<div style="width:100%;height:'+Math.max(3,h).toFixed(0)+'%;background:'+(isLast?color:color+"88")+';border-radius:2px 2px 0 0"></div>'+
          '</div>';
        }
        bars+='</div>';
        return bars;
      }

      html+='<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px">'+
        // Trade-Anzahl
        '<div style="flex:1;min-width:150px;background:rgba(8,12,22,.6);border:1px solid '+(countTrend?"rgba(96,165,250,.3)":"rgba(148,163,184,.2)")+';border-radius:10px;padding:12px">'+
          '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px"><span style="font-size:9px;color:var(--dm);text-transform:uppercase;letter-spacing:1px">Trades / Monat</span><span style="font-size:16px;font-weight:700;color:#60a5fa;font-family:Geist Mono,monospace">'+lastCount+'</span></div>'+
          miniBars(counts,actLabels,maxCount,"#60a5fa")+
          '<div style="display:flex;justify-content:space-between;font-size:8px;color:var(--dm)"><span>'+actLabels[0]+'</span><span>'+actLabels[actLabels.length-1]+'</span></div>'+
          '<div style="font-size:8.5px;color:'+(countTrend?"var(--g)":"var(--mt)")+';margin-top:6px">'+(countTrend?"↗ mehr Teilnehmer":"↘ flach/rückläufig")+'</div>'+
        '</div>'+
        // Ø Trade-Größe
        '<div style="flex:1;min-width:150px;background:rgba(8,12,22,.6);border:1px solid '+(avgTrend?"rgba(167,139,250,.3)":"rgba(148,163,184,.2)")+';border-radius:10px;padding:12px">'+
          '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px"><span style="font-size:9px;color:var(--dm);text-transform:uppercase;letter-spacing:1px">Ø Trade-Größe</span><span style="font-size:16px;font-weight:700;color:#a78bfa;font-family:Geist Mono,monospace">$'+F(lastAvg,0)+'</span></div>'+
          miniBars(avgSizes,actLabels,maxAvg,"#a78bfa")+
          '<div style="display:flex;justify-content:space-between;font-size:8px;color:var(--dm)"><span>'+actLabels[0]+'</span><span>'+actLabels[actLabels.length-1]+'</span></div>'+
          '<div style="font-size:8.5px;color:'+(avgTrend?"var(--g)":"var(--mt)")+';margin-top:6px">'+(avgTrend?"↗ größere Tickets":"↘ kleinere Tickets")+'</div>'+
        '</div>'+
      '</div>';
      // Gesamt-Bewertung
      var bothUp=countTrend&&avgTrend;
      html+='<div style="background:rgba(8,12,22,.4);border:1px solid rgba(48,54,68,.4);border-radius:8px;padding:10px 12px;margin-bottom:20px;font-size:9.5px;color:var(--mt);line-height:1.5;text-align:center">'+
        (bothUp?'🟢 <b style="color:var(--g)">Gesundes Wachstum:</b> mehr Trades UND größere Tickets — breite Adoption, nicht Wal-getrieben':
         countTrend&&!avgTrend?'🟡 Mehr Teilnehmer, aber kleinere Tickets — Retail wächst, Volumen pro Trade sinkt':
         !countTrend&&avgTrend?'🟡 Weniger, aber größere Trades — eher Wal-getrieben, weniger Breite':
         '🟠 Aktivität flacht ab — Trade-Zahl und -Größe beobachten')+
      '</div>';
    }
    // Horizontal bar list — each row shows period + buy/sell/net explicitly
    html+='<div style="display:flex;flex-direction:column;gap:8px">';
    var maxAbs=1;
    for(var m2=0;m2<shown.length;m2++){var a=Math.max(buckets[shown[m2]].buy,buckets[shown[m2]].sell);if(a>maxAbs)maxAbs=a;}
    // Show newest first
    for(var d=shown.length-1;d>=0;d--){
      var dk=shown[d];var bk=buckets[dk];
      var lbl;
      if(isMonth){var mp=dk.split("-");lbl=monthNames[parseInt(mp[1])-1]+" "+mp[0];}
      else{lbl=dk;}
      var buyW=bk.buy/maxAbs*100,sellW=bk.sell/maxAbs*100;
      var netColor=bk.net>=0?"var(--g)":"var(--r)";
      html+='<div style="background:rgba(8,12,22,.5);border:1px solid rgba(48,54,68,.4);border-radius:10px;padding:12px">'+
        '<div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="font-weight:700;color:var(--tx);font-size:13px;font-family:Geist Mono,monospace">'+lbl+'</span><span style="font-weight:700;color:'+netColor+';font-size:13px">Net '+(bk.net>=0?"+":"-")+"$"+F(Math.abs(bk.net),0)+'</span></div>'+
        // Buy bar
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px"><span style="font-size:9px;color:var(--g);width:34px">Buy</span><div style="flex:1;height:14px;background:rgba(8,12,22,.6);border-radius:4px;overflow:hidden"><div style="height:100%;width:'+buyW.toFixed(1)+'%;background:#34d399;border-radius:4px"></div></div><span style="font-size:10px;color:var(--g);width:70px;text-align:right;font-family:Geist Mono,monospace">$'+F(bk.buy,0)+'</span></div>'+
        // Sell bar
        '<div style="display:flex;align-items:center;gap:8px"><span style="font-size:9px;color:var(--r);width:34px">Sell</span><div style="flex:1;height:14px;background:rgba(8,12,22,.6);border-radius:4px;overflow:hidden"><div style="height:100%;width:'+sellW.toFixed(1)+'%;background:#f87171;border-radius:4px"></div></div><span style="font-size:10px;color:var(--r);width:70px;text-align:right;font-family:Geist Mono,monospace">$'+F(bk.sell,0)+'</span></div>'+
        '<div style="font-size:8px;color:var(--dm);text-align:right;margin-top:5px">'+bk.count+' Trades</div>'+
      '</div>';
    }
    html+='</div>';
    box.innerHTML=html;
  }catch(e){console.log("cflow fs err:",e);if($("cflowFsContent"))$("cflowFsContent").innerHTML='<div style="color:var(--r)">Fehler beim Rendern.</div>';}
}

// ═══ PORTFOLIO SYNC TO SERVER ═══
var SYNC_URL="https://95-216-152-31.sslip.io";
function syncPortfolioToServer(){
  try{
    if(typeof ptfAssets==="undefined"||!ptfAssets||ptfAssets.length===0)return;
    var assets=[];
    for(var i=0;i<ptfAssets.length;i++){
      var a=ptfAssets[i];
      var pp=typeof ptfPrices!=="undefined"&&ptfPrices[a.geckoId]?ptfPrices[a.geckoId].usd:0;
      assets.push({symbol:a.symbol,geckoId:a.geckoId,amount:a.amount,price:pp,totalCost:a.totalCost||0});
    }
    var data={assets:assets,burnPrice:P||0,myBurn:MY_BURN||0,myStBurn:MY_STBURN||0,stRatio:stR||1,ts:Date.now()};
    fetch(SYNC_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data),mode:"cors"}).catch(function(){});
  }catch(e){}
}

// ═══ BALANCE DECREASE DETECTION ═══
var _prevBurn=0,_prevStburn=0;
function checkBalanceDecrease(){
  try{
    if(!MY_BURN||!MY_STBURN||MY_BURN<=0)return;
    if(_prevBurn===0){_prevBurn=MY_BURN;_prevStburn=MY_STBURN;return;}
    var burnDrop=_prevBurn-MY_BURN;
    var stDrop=_prevStburn-MY_STBURN;
    if(burnDrop>100){
      if(typeof notify==="function")notify("⚠️ BURN Balance Drop",burnDrop.toFixed(0)+" BURN removed from wallet!");
      var el=$("walGrid");if(el)el.style.borderColor="var(--r)";
    }
    if(stDrop>100){
      if(typeof notify==="function")notify("⚠️ stBURN Balance Drop",stDrop.toFixed(0)+" stBURN removed from wallet!");
    }
    _prevBurn=MY_BURN;_prevStburn=MY_STBURN;
  }catch(e){}
}

// ═══ OFFLINE CACHE ═══
function saveOffline(){try{localStorage.setItem("burn_cache",JSON.stringify({P:P,stR:stR,stOK:stOK,stSrc:stSrc,sup:sup,X:X,Y:Y,K:K,SRC:SRC,MY_BURN:MY_BURN,MY_STBURN:MY_STBURN,wal:wal,ts:Date.now()}));}catch(e){}}
function loadOffline(){try{var c=JSON.parse(localStorage.getItem("burn_cache"));if(!c||!c.P)return false;
  X=c.X;Y=c.Y;K=c.K;P=c.P;SRC="offline";stR=c.stR||1;stOK=c.stOK||false;stSrc=c.stSrc||"cache";
  if(c.MY_BURN>0){MY_BURN=c.MY_BURN;MY_STBURN=c.MY_STBURN;}
  if(c.wal&&c.wal.ok){wal=c.wal;wal.prev.burn=MY_BURN;wal.prev.st=MY_STBURN;renderWal();}
  if(c.sup){sup.total=c.sup.total;sup.burned=c.sup.burned;sup.locked=c.sup.locked;sup.circ=c.sup.circ;sup.stSup=c.sup.stSup;}
  $("main").classList.remove("hid");render();
  var ago=Math.round((Date.now()-(c.ts||0))/60000);
  $("astat").innerHTML='<span style="color:var(--mt)">Offline · last data '+ago+'m ago</span>';
  // Also flip the LIVE badge — it must NOT show green "✓ LIVE" while we're on stale cached data.
  try{$("dSrc").innerHTML=TG("◇ Offline","#fb923c");}catch(e){}
  // The chart's "LIVE" pill (in HTML) is stale too; grey it out if it exists.
  try{var lp=$("sparkLive");if(lp)lp.innerHTML='<span style="color:var(--mt)">◇ Cache</span>';}catch(e){}
  return true;}catch(e){return false;}}

// ═══ PULL-TO-REFRESH ═══
var ptrY=0,ptrActive=false;
document.addEventListener("touchstart",function(e){if(window.scrollY===0)ptrY=e.touches[0].clientY;},{passive:true});
document.addEventListener("touchmove",function(e){if(ptrY>0&&window.scrollY===0){var dy=e.touches[0].clientY-ptrY;
  if(dy>50&&!ptrActive){ptrActive=true;$("ptr").classList.add("show");}}},{passive:true});
document.addEventListener("touchend",function(){if(ptrActive){ptrActive=false;$("ptr").classList.remove("show");go();fetchSt();fetchTrades();}ptrY=0;});

// ═══ PORTFOLIO TERMINAL FUNCTIONS ═══
function ptfSave(){try{localStorage.setItem("ptf_assets",JSON.stringify(ptfAssets));localStorage.setItem("ptf_ledger",JSON.stringify(ptfLedger));ptfSyncServer();}catch(e){console.log("PTF save err:",e);}}

// ═══ SAFE AMOUNT UPDATE — preserves cost basis ═══
// Updates an asset's amount when detected on-chain, WITHOUT corrupting avgEntry/totalCost.
// - If amount DECREASED (sent/sold): scale totalCost down proportionally (keep avgEntry).
// - If amount INCREASED (bought): we DON'T know the buy price here, so we keep the existing
//   totalCost and avgEntry UNCHANGED and just sync amount. The proper cost update happens
//   via the buy-detection dialog (ptfConfirmDetection). This prevents the bug where amount
//   grows but cost stays flat → fake gains. Instead avgEntry is recomputed from the new amount
//   ONLY if no dialog mechanism exists, by holding totalCost constant (conservative).
// Returns true if the asset was modified.
// ─── PENDING BUY-PRICE QUEUE ───
// When a ledger balance increases (a deposit/buy) but we don't know the buy price, we queue it and
// keep prompting — on detection AND on every app start — until the user enters a price. This stops
// silent un-priced buys from messing up avgEntry / gains.
var pendingPrices=[];
try{pendingPrices=JSON.parse(localStorage.getItem("pending_prices")||"[]");}catch(e){pendingPrices=[];}
function savePendingPrices(){try{localStorage.setItem("pending_prices",JSON.stringify(pendingPrices));}catch(e){}}
function queuePendingPrice(symbol,addedAmount,contract){
  // Merge into an existing pending entry for the same symbol (multiple small deposits → one prompt).
  for(var i=0;i<pendingPrices.length;i++){
    if(pendingPrices[i].symbol===symbol){pendingPrices[i].amount+=addedAmount;savePendingPrices();return;}
  }
  pendingPrices.push({symbol:symbol,amount:addedAmount,contract:contract||"",ts:Date.now()});
  savePendingPrices();
}
var _processingPending=false;
// Manually log a missed ETH buy (e.g. an ETH transfer the auto-detection didn't catch).
// Asks for amount + price and books it into the cost basis. Callable anytime.
function ethKaufNachtragen(){
  var eth=null;for(var i=0;i<ptfAssets.length;i++){if(ptfAssets[i].id==="eth"){eth=ptfAssets[i];break;}}
  if(!eth){alert("Kein ETH-Asset gefunden.");return;}
  var curP=eth.price>0?eth.price:0;
  var amtIn=prompt("💰 ETH-Kauf nachtragen\n\nWie viel ETH hast du gekauft/erhalten?\n\n(Aktuelle Gesamtmenge: "+F(eth.amount,6)+" ETH)","");
  if(amtIn===null)return;
  var amt=parseFloat((amtIn||"").replace(",","."));
  if(!(amt>0)){alert("Ungültige Menge.");return;}
  var prIn=prompt("Zu welchem Preis (USD pro ETH)?"+(curP>0?"\n\nAktueller Kurs: $"+curP.toFixed(2):""),curP>0?curP.toFixed(2):"");
  if(prIn===null)return;
  var pr=parseFloat((prIn||"").replace(",","."));
  if(!(pr>0)){alert("Ungültiger Preis.");return;}
  eth.totalCost=(eth.totalCost||0)+amt*pr;
  if(eth.amount>0)eth.avgEntry=eth.totalCost/eth.amount;
  try{ptfSave();ptfRenderTable();}catch(e){}
  alert("✓ Eingetragen: "+F(amt,6)+" ETH @ $"+pr.toFixed(2)+"\nNeuer Ø-Einstieg: $"+eth.avgEntry.toFixed(2));
}
function processPendingPrices(){
  if(_processingPending)return;
  if(!pendingPrices.length)return;
  // DOUBLE-BOOK GUARD: if a detection banner for the same symbol is active, the banner owns the
  // booking (its confirm clears this queue). Prompting in parallel double-booked ETH cost once
  // (banner +$226.50 AND prompt +$223.75 for the same 08.07. deposit).
  var p0=pendingPrices[0];
  if(ptfPendingDetection&&ptfPendingDetection.symbol===(p0.symbol||"").toLowerCase())return;
  _processingPending=true;
  // Ask for the oldest pending entry.
  var p=pendingPrices[0];
  var asset=null;
  for(var i=0;i<ptfAssets.length;i++){if(ptfAssets[i].symbol===p.symbol){asset=ptfAssets[i];break;}}
  var curPrice=asset&&asset.price>0?asset.price:0;
  var hint=curPrice>0?("\n\nAktueller Kurs: $"+curPrice.toFixed(2)):"";
  var msg="💰 Einkaufspreis eintragen\n\nDu hast "+F(p.amount,p.amount<10?4:2)+" "+p.symbol+" erhalten.\nZu welchem Preis (USD pro "+p.symbol+") hast du gekauft?"+hint+"\n\n(Leer lassen = später fragen)";
  var input=prompt(msg,curPrice>0?curPrice.toFixed(2):"");
  _processingPending=false;
  if(input===null||input.trim()===""){
    // User dismissed — keep it in the queue, ask again next start.
    return;
  }
  var price=parseFloat(input.replace(",","."));
  if(!(price>0)){
    // Invalid → keep in queue, try again.
    alert("Ungültiger Preis — ich frage später nochmal.");
    return;
  }
  // Apply the buy price properly (average it in).
  if(asset){
    var bought=p.amount;
    var addCost=bought*price;
    asset.totalCost=(asset.totalCost||0)+addCost;
    if(asset.amount>0)asset.avgEntry=asset.totalCost/asset.amount;
    try{ptfSave();ptfRenderTable();}catch(e){}
  }
  // Remove this entry, then continue with the next pending one.
  pendingPrices.shift();savePendingPrices();
  // DOUBLE-BOOK GUARD (reverse direction): the prompt booked it → kill any matching banner so
  // its confirm can't add the same cost again.
  try{if(ptfPendingDetection&&ptfPendingDetection.symbol===(p.symbol||"").toLowerCase()){ptfPendingDetection=null;$("ptfDetectDiv").innerHTML="";}}catch(e){}
  if(pendingPrices.length){setTimeout(processPendingPrices,400);}
}
function ptfSafeSetAmount(asset,newAmount,opts){
  opts=opts||{};
  if(!asset||!(newAmount>0))return false;
  var oldAmount=asset.amount||0;
  if(Math.abs(newAmount-oldAmount)/Math.max(oldAmount,0.0001)<=0.001)return false; // no real change
  if(newAmount<oldAmount){
    // Sold/sent portion → reduce totalCost proportionally, avgEntry unchanged
    if(asset.totalCost>0&&oldAmount>0){
      asset.totalCost=asset.totalCost*(newAmount/oldAmount);
    }
    asset.amount=newAmount;
    return true;
  }else{
    // Increased. If caller provides a buyPrice, average it in properly.
    if(opts.buyPrice>0){
      var bought=newAmount-oldAmount;
      var addCost=bought*opts.buyPrice;
      asset.totalCost=(asset.totalCost||0)+addCost;
      asset.amount=newAmount;
      asset.avgEntry=asset.totalCost/newAmount;
      return true;
    }
    // No buy price known: keep totalCost, update amount, recompute avgEntry so it stays consistent.
    // This means avgEntry DROPS (more tokens, same cost) — conservative but never inflates gains.
    // The buy dialog (if it fires) will correct this with the real price.
    if(opts.amountOnly){
      asset.amount=newAmount;
      if(asset.totalCost>0)asset.avgEntry=asset.totalCost/newAmount;
      return true;
    }
    // Default: don't touch amount on unconfirmed increase (wait for dialog).
    return false;
  }
}

// Sync portfolio to Hetzner for push notifications
var _ptfLastSync=0;
function ptfSyncServer(){
  try{
    if(Date.now()-_ptfLastSync<300000)return; // max every 5 min
    _ptfLastSync=Date.now();
    var assets=[];
    for(var i=0;i<ptfAssets.length;i++){
      var a=ptfAssets[i];
      assets.push({symbol:a.symbol,geckoId:a.geckoId,amount:a.amount,totalCost:a.totalCost||0,avgEntry:a.avgEntry||0});
    }
    var ledgerOut=[];
    try{for(var _li=0;_li<ptfLedger.length;_li++){var _e=ptfLedger[_li];ledgerOut.push({asset:_e.asset,amount:_e.amount,price:_e.price,total:_e.total,date:_e.date,wallet:_e.wallet||"",note:_e.note||""});}}catch(e){}
    var data={ptfKey:"43dcb5719607e92861ff",assets:assets,ledger:ledgerOut,burnPrice:P||0,stRatio:stR||1,myBurn:MY_BURN||0,myStburn:MY_STBURN||0,ts:Date.now()};
    fetch("https://95-216-152-31.sslip.io/ptf",{method:"POST",mode:"cors",body:JSON.stringify(data)}).then(function(r){ // 8082 = aus der APK bewiesener Kanal; kein Content-Type → kein CORS-Preflight
      var el=$("syncStat");
      if(r.ok){console.log("PTF synced to server");if(el)el.innerHTML="v"+APP_V+' · Server-Sync <span style="color:var(--g)">✓ '+new Date().toLocaleTimeString().slice(0,5)+"</span>";}
      else{if(el)el.innerHTML="v"+APP_V+' · Server-Sync <span style="color:var(--r)">✗ HTTP '+r.status+"</span>";}
    }).catch(function(e){
      var el=$("syncStat");if(el)el.innerHTML="v"+APP_V+' · Server-Sync <span style="color:var(--r)">✗ '+((e&&e.message)||"blockiert")+"</span>";
      console.log("PTF sync failed:",e&&e.message);
    });
  }catch(e){}
}
function ptfLoad(){try{
  var a=localStorage.getItem("ptf_assets");var l=localStorage.getItem("ptf_ledger");var t=localStorage.getItem("ptf_targets");
  if(a)ptfAssets=JSON.parse(a); else ptfAssets=JSON.parse(JSON.stringify(PTF_DEFAULTS));
  if(l)ptfLedger=JSON.parse(l);
  if(t)ptfSimTargets=JSON.parse(t);
  // ── One-time cleanup: strip stray TEST test-data (asset + ledger) ──
  try{
    var _hadTest=false;
    if(ptfAssets&&ptfAssets.length){var _na=ptfAssets.filter(function(a){var s=((a.symbol||a.id||"")+"").toUpperCase();if(s==="TEST"){_hadTest=true;return false;}return true;});if(_na.length!==ptfAssets.length)ptfAssets=_na;}
    if(ptfLedger&&ptfLedger.length){var _nl=ptfLedger.filter(function(e){var s=((e.asset||"")+"").toUpperCase();if(s==="TEST"){_hadTest=true;return false;}return true;});if(_nl.length!==ptfLedger.length)ptfLedger=_nl;}
    if(_hadTest){try{localStorage.setItem("ptf_assets",JSON.stringify(ptfAssets));localStorage.setItem("ptf_ledger",JSON.stringify(ptfLedger));}catch(e){}}
  }catch(e){}
  // One-time: verifizierte BURN/stBURN-Kaeufe ins Cost-Basis-Ledger (on-chain belegt)
  try{
    if(!localStorage.getItem("ptf_burnseed_v1")){
      var _bs=[["burn","2025-04-16",100163.21,0.001557,156.00],["stburn","2025-04-16",18269.4,0.001596,29.16],["burn","2025-04-19",182037.08,0.001843,335.49],["burn","2025-04-21",221782.31,0.00255,565.59],["burn","2025-04-23",101423.90,0.002772,281.10],["burn","2025-04-29",15516.4,0.003643,56.52],["stburn","2025-05-06",65858.3,0.003766,248.01],["burn","2025-05-13",52157,0.003815,199.00],["stburn","2025-05-29",96438,0.004354,419.93],["stburn","2025-06-01",15754,0.009459,149.01],["stburn","2025-06-17",23377.8,0.016487,385.42],["burn","2025-08-11",16026.5,0.032679,523.73]];
      var _have={};for(var _bi=0;_bi<ptfLedger.length;_bi++){var _le=ptfLedger[_bi];_have[((_le.asset||"")+"").toLowerCase()+"|"+(_le.date||"")+"|"+Math.round(_le.amount||0)]=1;}
      var _added=0;
      for(var _bj=0;_bj<_bs.length;_bj++){var _b=_bs[_bj];
        if(_have[_b[0]+"|"+_b[1]+"|"+Math.round(_b[2])])continue;
        ptfLedger.push({id:"ptx_bseed"+_bj,asset:_b[0],amount:_b[2],price:_b[3],total:_b[4],date:_b[1],wallet:"Uniswap",note:"on-chain verifiziert"});_added++;}
      localStorage.setItem("ptf_burnseed_v1","1");
    }
    if(!localStorage.getItem("ptf_burnseed_v2")){
      var _bs2=[["burn","2025-06-04",2967.2,0.012170,36.11],["burn","2025-10-16",89.9,0.111182,10.00]];
      var _hv2={};for(var _ci=0;_ci<ptfLedger.length;_ci++){var _ce=ptfLedger[_ci];_hv2[((_ce.asset||"")+"").toLowerCase()+"|"+(_ce.date||"")+"|"+Math.round(_ce.amount||0)]=1;}
      for(var _cj=0;_cj<_bs2.length;_cj++){var _c=_bs2[_cj];
        if(_hv2[_c[0]+"|"+_c[1]+"|"+Math.round(_c[2])])continue;
        ptfLedger.push({id:"ptx_bseed2_"+_cj,asset:_c[0],amount:_c[2],price:_c[3],total:_c[4],date:_c[1],wallet:"Uniswap",note:"on-chain verifiziert"});}
      localStorage.setItem("ptf_burnseed_v2","1");
      try{localStorage.setItem("ptf_ledger",JSON.stringify(ptfLedger));}catch(e){}
      if(_added){try{localStorage.setItem("ptf_ledger",JSON.stringify(ptfLedger));}catch(e){}console.log("PTF: "+_added+" verifizierte BURN-Kaeufe ins Ledger uebernommen");}
    }
    if(!localStorage.getItem("ptf_altseed_v1")){
      var _as=[["link",32.0574,10.3],["ondo",650.7351,0.329],["rndr",63.9043,1.299],["mon",2931.1731,0.0201],["cfg",462.3868,0.1254],["fet",389.1441,0.2133],["aave",0.9077,179.59],["sky",852.1203,0.0645],["cro",655.7,0.093],["uni",9.8139,5.605],["arb",263.1431,0.209],["syrup",77.6098,0.425],["eigen",135.127,0.407],["ar",31.92,3.6],["tia",97.3909,0.5853],["tao",0.59,222.03],["akt",264,0.3702]];
      var _hv3={};for(var _di=0;_di<ptfLedger.length;_di++){var _de=ptfLedger[_di];_hv3[((_de.asset||"")+"").toLowerCase()]=1;}
      var _na=0;
      for(var _dj=0;_dj<_as.length;_dj++){var _d=_as[_dj];
        if(_hv3[_d[0]])continue;
        ptfLedger.push({id:"ptx_altseed"+_dj,asset:_d[0],amount:_d[1],price:_d[2],total:Math.round(_d[1]*_d[2]*100)/100,date:"2026-05-01",wallet:"Kraken/Bitpanda",note:"Einstand aus App-Daten, Datum geschaetzt"});_na++;}
      localStorage.setItem("ptf_altseed_v1","1");
      if(_na){try{localStorage.setItem("ptf_ledger",JSON.stringify(ptfLedger));}catch(e){}
        try{ptfSyncServer();}catch(e){}
        console.log("PTF: "+_na+" Altcoin-Einstaende ins Ledger uebernommen");}
    }
    // One-time: ETH 1,53130508 + Ø-Einstand $2.082,50 (gewichteter Durchschnitt aus 23 on-chain-Zugaengen zum ETH-Tageskurs), 25.07.2026
    if(!localStorage.getItem("ptf_ethfix_v4")){
      for(var _ei=0;_ei<ptfAssets.length;_ei++){if(ptfAssets[_ei].id==="eth"){ptfAssets[_ei].amount=1.531305;ptfAssets[_ei].avgEntry=2082.50;ptfAssets[_ei].totalCost=3188.94;break;}}
      try{var _pp=JSON.parse(localStorage.getItem("pending_prices")||"[]");_pp=_pp.filter(function(x){return ((x.symbol||"")+"").toUpperCase()!=="ETH";});localStorage.setItem("pending_prices",JSON.stringify(_pp));if(typeof pendingPrices!=="undefined"&&pendingPrices){for(var _pi=pendingPrices.length-1;_pi>=0;_pi--){if(((pendingPrices[_pi].symbol||"")+"").toUpperCase()==="ETH")pendingPrices.splice(_pi,1);}}}catch(e){}
      localStorage.setItem("ptf_ethfix_v1","1");localStorage.setItem("ptf_ethfix_v2","1");localStorage.setItem("ptf_ethfix_v3","1");localStorage.setItem("ptf_ethfix_v4","1");
      try{localStorage.setItem("ptf_assets",JSON.stringify(ptfAssets));}catch(e){}
      try{ptfSyncServer();}catch(e){}
      console.log("PTF: ETH auf 1,531305 @ Ø $2.082,50 korrigiert (aus 23 Zugaengen berechnet)");
    }
    // v5: ETH-Einstand ON-CHAIN VERIFIZIERT setzen + haengenden "Einkaufspreis eintragen"-Prompt raeumen.
    // Ledger 0x9fFa19..871D2: 25 Zugaenge = 2.008479 ETH, kein Abgang. Jeder Zugang zum ETH-Kurs am Zugangstag
    // bewertet -> Kosten $4.086,99, Ø $2.034,87. Vor heute 1,561 ETH @ ~$2.081; heute +0,447 ETH @ $1.874 -> Ø faellt.
    if(!localStorage.getItem("ptf_ethfix_v5")){
      var _ETHAMT=2.008479,_ETHAVG=2034.87,_ETHCOST=4086.99;
      try{for(var _q5=0;_q5<ptfAssets.length;_q5++){if(ptfAssets[_q5].id==="eth"){ptfAssets[_q5].amount=_ETHAMT;ptfAssets[_q5].avgEntry=_ETHAVG;ptfAssets[_q5].totalCost=_ETHCOST;break;}}}catch(e){}
      try{var _p5=JSON.parse(localStorage.getItem("pending_prices")||"[]");_p5=_p5.filter(function(x){return ((x.symbol||"")+"").toUpperCase()!=="ETH";});localStorage.setItem("pending_prices",JSON.stringify(_p5));}catch(e){}
      try{if(typeof pendingPrices!=="undefined"&&pendingPrices){for(var _pj=pendingPrices.length-1;_pj>=0;_pj--){if(((pendingPrices[_pj].symbol||"")+"").toUpperCase()==="ETH")pendingPrices.splice(_pj,1);}}}catch(e){}
      try{if(typeof ptfPendingDetection!=="undefined"&&ptfPendingDetection&&((ptfPendingDetection.symbol||"")+"").toLowerCase()==="eth"){ptfPendingDetection=null;var _dd5=document.getElementById("ptfDetectDiv");if(_dd5)_dd5.innerHTML="";}}catch(e){}
      try{var _lb5=JSON.parse(localStorage.getItem("ptf_last_balances")||"{}");_lb5.eth=_ETHAMT;if(!(_lb5.btc>0)){for(var _r5=0;_r5<ptfAssets.length;_r5++){if(ptfAssets[_r5].id==="btc"){_lb5.btc=ptfAssets[_r5].amount;break;}}}localStorage.setItem("ptf_last_balances",JSON.stringify(_lb5));if(typeof ptfLastBalances!=="undefined"){ptfLastBalances.eth=_ETHAMT;if(_lb5.btc>0)ptfLastBalances.btc=_lb5.btc;}}catch(e){}
      try{localStorage.setItem("ptf_assets",JSON.stringify(ptfAssets));}catch(e){}
      try{ptfSyncServer();}catch(e){}
      localStorage.setItem("ptf_ethfix_v5","1");
      console.log("PTF: v5 — ETH auf Ø $2.034,87 (2.008479 ETH, Kosten $4.086,99) gesetzt, haengender Preis-Prompt geraeumt");
    }
    // v6: Einstand aus Bitpanda-Daten korrigiert (voll verifiziert). Nur diese 4 sind 100% belegt;
    // BTC/LINK (teilweise) + die 12 Kraken-Coins bleiben bis zum Kraken/DEX-Export unangetastet.
    if(!localStorage.getItem("ptf_altfix_v6")){
      var _CB6={uni:5.9315,arb:0.2207,eigen:0.4316,ar:3.6691};
      try{for(var _v6=0;_v6<ptfAssets.length;_v6++){var _a6=ptfAssets[_v6];var _k6=((_a6.id||"")+"").toLowerCase();if(_CB6[_k6]!=null&&_a6.amount>0){_a6.avgEntry=_CB6[_k6];_a6.totalCost=Math.round(_a6.amount*_CB6[_k6]*100)/100;}}}catch(e){}
      try{localStorage.setItem("ptf_assets",JSON.stringify(ptfAssets));}catch(e){}
      try{ptfSyncServer();}catch(e){}
      localStorage.setItem("ptf_altfix_v6","1");
      console.log("PTF: v6 — UNI/ARB/EIGEN/AR Einstand aus Bitpanda korrigiert");
    }
    // v7: aus Kraken-Trades verifiziert (TIA/AKT/TAO/CFG + BTC-Blend). ONDO/LINK bleiben (nur teilw. belegt),
    // RNDR/FET/AAVE/SKY/CRO/SYRUP offen bis DEX-Check.
    if(!localStorage.getItem("ptf_altfix_v7")){
      var _CB7={tia:0.5899,akt:0.375,tao:226.1443,cfg:0.1245,btc:69950};
      try{for(var _v7=0;_v7<ptfAssets.length;_v7++){var _a7=ptfAssets[_v7];var _k7=((_a7.id||"")+"").toLowerCase();if(_CB7[_k7]!=null&&_a7.amount>0){_a7.avgEntry=_CB7[_k7];_a7.totalCost=Math.round(_a7.amount*_CB7[_k7]*100)/100;}}}catch(e){}
      try{localStorage.setItem("ptf_assets",JSON.stringify(ptfAssets));}catch(e){}
      try{ptfSyncServer();}catch(e){}
      localStorage.setItem("ptf_altfix_v7","1");
      console.log("PTF: v7 — TIA/AKT/TAO/CFG/BTC Einstand aus Kraken verifiziert");
    }
    // v8: aus On-Chain-DEX-Käufen (bb500/Wallet2) verifiziert. RNDR/FET waren bereits exakt.
    if(!localStorage.getItem("ptf_altfix_v8")){
      var _CB8={rndr:1.299,fet:0.2133,aave:180.95,link:10.387,ondo:0.3533};
      try{for(var _v8=0;_v8<ptfAssets.length;_v8++){var _a8=ptfAssets[_v8];var _k8=((_a8.id||"")+"").toLowerCase();if(_CB8[_k8]!=null&&_a8.amount>0){_a8.avgEntry=_CB8[_k8];_a8.totalCost=Math.round(_a8.amount*_CB8[_k8]*100)/100;}}}catch(e){}
      try{localStorage.setItem("ptf_assets",JSON.stringify(ptfAssets));}catch(e){}
      try{ptfSyncServer();}catch(e){}
      localStorage.setItem("ptf_altfix_v8","1");
      console.log("PTF: v8 — RNDR/FET/AAVE/LINK/ONDO Einstand aus DEX-Käufen verifiziert");
    }
  }catch(e){}
  try{var sn=localStorage.getItem("ptf_snapshots");if(sn){ptfSnapshots=JSON.parse(sn);ptfSnapshots=ptfSnapshots.map(function(s){return Array.isArray(s)?s:[s.ts,s.value];});}}catch(e){}
  // Merge server history (Hetzner collects data 24/7 even when app is closed).
  // Server = source of truth: overwrite local values for matching timestamps so corrected
  // history propagates. One-time full reset (RK) purges the old cached glitch dips once.
  setTimeout(function(){try{
    fetch("https://95-216-152-31.sslip.io/history").then(function(r){return r.json();}).then(function(data){
      if(!data||!data.length)return;
      var RK="ptf_snap_srvwin1";
      var byTs={};
      if(localStorage.getItem(RK)==="1"){
        for(var mi=0;mi<ptfSnapshots.length;mi++){byTs[ptfSnapshots[mi][0]]=ptfSnapshots[mi];}
      }
      for(var mj=0;mj<data.length;mj++){byTs[data[mj][0]]=data[mj];}
      var merged=[];for(var mk in byTs){if(byTs.hasOwnProperty(mk))merged.push(byTs[mk]);}
      merged.sort(function(a,b){return a[0]-b[0];});
      if(merged.length>200000)merged=merged.slice(-200000);
      ptfSnapshots=merged;
      try{localStorage.setItem("ptf_snapshots",JSON.stringify(ptfSnapshots));}catch(e2){}
      localStorage.setItem(RK,"1");
      console.log("PTF: synced "+data.length+" server snapshots (server-wins, total: "+ptfSnapshots.length+")");
      ptfRenderTimeline();
    }).catch(function(){});
  }catch(e3){}},5000);
  try{var lb=localStorage.getItem("ptf_last_balances");if(lb)ptfLastBalances=JSON.parse(lb);}catch(e){}
  var storedVer=localStorage.getItem("ptf_version");
  if(!storedVer||parseInt(storedVer)<PTF_VERSION){
    ptfAssets=JSON.parse(JSON.stringify(PTF_DEFAULTS));
    localStorage.setItem("ptf_version",String(PTF_VERSION));
    ptfSave();
    console.log("PTF: defaults reset to v"+PTF_VERSION);
  }
}catch(e){console.log("PTF load err:",e);ptfAssets=JSON.parse(JSON.stringify(PTF_DEFAULTS));}}
function ptfSimSave(){try{localStorage.setItem("ptf_targets",JSON.stringify(ptfSimTargets));}catch(e){}}

function ptfFetchPrices(){
  try{
    if(Date.now()-ptfLastFetch<60000)return;
    var ids=[];
    for(var i=0;i<ptfAssets.length;i++){if(ptfAssets[i].geckoId)ids.push(ptfAssets[i].geckoId);}
    if(ids.length===0)return;
    var unique={};for(var u=0;u<ids.length;u++)unique[ids[u]]=1;ids=Object.keys(unique);
    ptfLastFetch=Date.now();
    fetch("https://api.coingecko.com/api/v3/simple/price?ids="+ids.join(",")+"&vs_currencies=usd&include_24hr_change=true")
      .then(function(r){return r.json();})
      .then(function(data){
        for(var k in data){if(data.hasOwnProperty(k))ptfPrices[k]={usd:data[k].usd||0,change:data[k].usd_24h_change||0};}
        console.log("PTF: prices fetched for "+Object.keys(data).length+" assets");
        ptfRenderTable();
        ptfSyncServer();
      }).catch(function(e){console.log("PTF CoinGecko err:",e);});
  }catch(e){console.log("PTF fetchPrices err:",e);}
}

var ptfLastBalanceCheck=0;
var PTF_ETH_RPC=["https://eth.llamarpc.com","https://ethereum-rpc.publicnode.com","https://1rpc.io/eth"];

// Arbitrum ERC-20 balance check (silent update, no dialog)
function ptfDetectBalances(){
  try{
    if(Date.now()-ptfLastBalanceCheck<300000)return;
    ptfLastBalanceCheck=Date.now();
    var changed=false,updates=0;
    var ledgerAssets=[];
    for(var i=0;i<ptfAssets.length;i++){if(ptfAssets[i].source==="ledger"&&ptfAssets[i].contract)ledgerAssets.push(ptfAssets[i]);}
    var idx=0;
    function nextBalance(){
      if(idx>=ledgerAssets.length){
        if(changed){ptfSave();ptfRenderTable();}
        console.log("PTF: arb balance check complete, "+updates+" updates");
        return;
      }
      var a=ledgerAssets[idx];idx++;
      try{
        rpc(a.contract,bof(PTF_LEDGER_WALLET)).then(function(hex){
          if(hex&&hex!=="0x"){
            var bal=h2n(hex);
            if(bal<=0&&a.amount>0){console.log("PTF balance: "+a.symbol+" returned 0, keeping stored "+a.amount);}
            else if(bal>0&&Math.abs(bal-a.amount)/Math.max(a.amount,0.0001)>0.001){
              var oldA=a.amount;
              // Safe update: on decrease scale cost down; on increase hold cost (avgEntry recomputed).
              // Prevents fake gains from un-priced buys. Real buy price comes via DCA dialog.
              ptfSafeSetAmount(a,bal,{amountOnly:true});
              // If this was an INCREASE (deposit/buy), queue a price prompt so we ask for the buy price.
              if(bal>oldA){queuePendingPrice(a.symbol,bal-oldA,a.contract);}
              console.log("PTF balance: "+a.symbol+" "+oldA+" → "+bal+" (cost basis preserved: $"+(a.totalCost||0).toFixed(2)+")");
              changed=true;updates++;
            }
          }
          nextBalance();
        }).catch(function(){nextBalance();});
      }catch(e2){nextBalance();}
    }
    nextBalance();
  }catch(e){console.log("PTF detectBalances err:",e);}
}

// ETH (Mainnet) + BTC detection with change dialog
var ptfLastLedgerDetect=0;
// Failure tracking for ETH/BTC fetch — 3 retries with 30s delay, then alert
var ptfFetchFails={eth:0,btc:0,ethLastErr:0,btcLastErr:0};
function ptfDetectLedgerBalances(){
  try{
    if(Date.now()-ptfLastLedgerDetect<300000)return;
    ptfLastLedgerDetect=Date.now();
    // Step 1: Fetch ETH via Mainnet (3 retries with 30s delay built-in via cycle re-runs)
    var tried=0;
    function fetchEth(cb){
      if(tried>=PTF_ETH_RPC.length){
        // All RPCs failed this cycle
        ptfFetchFails.eth++;
        ptfFetchFails.ethLastErr=Date.now();
        console.log("PTF detect: ETH fetch failed (attempt "+ptfFetchFails.eth+"/3)");
        if(ptfFetchFails.eth>=3){
          notify("⚠ ETH Balance Check Failed","Using cached value. RPC unreachable after 3 attempts.");
          ptfFetchFails.eth=0; // Reset, will warn again on next failure cycle
        }
        cb(0);return;
      }
      var url=PTF_ETH_RPC[tried];tried++;
      var ac=new AbortController();var tm=setTimeout(function(){ac.abort();},8000);
      fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({jsonrpc:"2.0",method:"eth_getBalance",params:[PTF_LEDGER_WALLET,"latest"],id:1}),signal:ac.signal})
        .then(function(r){clearTimeout(tm);return r.json();})
        .then(function(j){if(j.result){ptfFetchFails.eth=0;cb(parseInt(j.result,16)/1e18);}else{fetchEth(cb);}})
        .catch(function(){clearTimeout(tm);fetchEth(cb);});
    }
    // Step 2: Fetch BTC via Mempool with fallback to blockstream
    function fetchBtc(cb){
      var btcTried=0;
      var btcUrls=[
        "https://mempool.space/api/address/"+PTF_LEDGER_BTC_ADDR,
        "https://blockstream.info/api/address/"+PTF_LEDGER_BTC_ADDR
      ];
      function tryNext(){
        if(btcTried>=btcUrls.length){
          ptfFetchFails.btc++;
          ptfFetchFails.btcLastErr=Date.now();
          console.log("PTF detect: BTC fetch failed (attempt "+ptfFetchFails.btc+"/3)");
          if(ptfFetchFails.btc>=3){
            notify("⚠ BTC Balance Check Failed","Using cached value. Both APIs unreachable.");
            ptfFetchFails.btc=0;
          }
          cb(0);return;
        }
        var u=btcUrls[btcTried];btcTried++;
        var ac=new AbortController();var tm=setTimeout(function(){ac.abort();},10000);
        fetch(u,{signal:ac.signal})
          .then(function(r){clearTimeout(tm);return r.json();})
          .then(function(d){
            if(d&&d.chain_stats){
              var sat=(d.chain_stats.funded_txo_sum||0)-(d.chain_stats.spent_txo_sum||0);
              ptfFetchFails.btc=0;cb(sat/100000000);
            }else{tryNext();}
          }).catch(function(){clearTimeout(tm);tryNext();});
      }
      tryNext();
    }
    fetchEth(function(newEth){
      fetchBtc(function(newBtc){
        console.log("PTF detect: ETH="+newEth.toFixed(6)+" BTC="+newBtc.toFixed(8));
        // Calibrate on first run
        if(ptfLastBalances.eth===0&&ptfLastBalances.btc===0){
          var ea=null,ba=null;
          for(var i=0;i<ptfAssets.length;i++){if(ptfAssets[i].id==="eth")ea=ptfAssets[i];if(ptfAssets[i].id==="btc")ba=ptfAssets[i];}
          // If the on-chain ETH balance is HIGHER than the stored amount, that's an un-priced buy/
          // deposit that happened while the app wasn't tracking (e.g. an ETH transfer in). Queue a
          // price prompt for the difference instead of silently swallowing it into the baseline.
          if(ea&&newEth>0&&(ea.amount||0)>0&&newEth>ea.amount*1.0001){
            queuePendingPrice("ETH",newEth-ea.amount,"");
          }
          ptfLastBalances.eth=ea?ea.amount:0;
          ptfLastBalances.btc=ba?ba.amount:0;
          try{localStorage.setItem("ptf_last_balances",JSON.stringify(ptfLastBalances));}catch(e){}
          // First-run amount sync: use SAFE update so cost basis isn't destroyed when the
          // on-chain balance differs from the stored default amount. avgEntry recomputed to
          // keep totalCost intact (never inflates gains). The DCA dialog handles real buy prices.
          if(ea&&newEth>0)ptfSafeSetAmount(ea,newEth,{amountOnly:true});
          if(ba&&newBtc>0)ptfSafeSetAmount(ba,newBtc,{amountOnly:true});
          ptfSave();ptfRenderTable();
          // If we queued an un-priced ETH buy, ask right away.
          try{if(pendingPrices&&pendingPrices.length)setTimeout(processPendingPrices,1500);}catch(e){}
          console.log("PTF detect: calibrated (first run) — cost basis preserved");
          return;
        }
        var changed=false;
        // Check ETH delta
        var ethDelta=newEth-ptfLastBalances.eth;
        var ethDialogShown=false;
        if(newEth>0&&Math.abs(ethDelta)>0.001){
          ptfShowDetection("ETH",ethDelta,newEth);
          ethDialogShown=true;
          // Also queue it persistently so a restart / dismiss doesn't lose the un-priced buy.
          if(ethDelta>0.001){queuePendingPrice("ETH",ethDelta,"");}
        }
        // BTC detection DISABLED — managed via manual "+ BTC Kauf" Banner (Ledger uses rotating addresses)
        // Update ETH amount ONLY when:
        //   - No dialog shown (delta < 0.001 = no real change, just amount sync)
        //   - User will confirm via ptfConfirmDetection() which updates amount + cost basis correctly
        // This prevents the bug where amount got updated but avgEntry didn't, corrupting cost basis.
        var ea2=null;
        for(var j=0;j<ptfAssets.length;j++){if(ptfAssets[j].id==="eth"){ea2=ptfAssets[j];break;}}
        if(newEth>0){
          ptfLastBalances.eth=newEth;
          // Only sync amount when no DCA dialog is pending — otherwise wait for user confirmation.
          // Safe helper preserves cost basis (scales on decrease, recomputes avgEntry on increase).
          if(!ethDialogShown&&ea2)ptfSafeSetAmount(ea2,newEth,{amountOnly:true});
        }
        ptfSave();ptfRenderTable();
        try{localStorage.setItem("ptf_last_balances",JSON.stringify(ptfLastBalances));}catch(e){}
      });
    });
  }catch(e){console.log("PTF detectLedger err:",e);}
}

function ptfShowDetection(symbol,delta,newBalance){
  var isBuy=delta>0;var absDelta=Math.abs(delta);
  var label=isBuy?"New "+symbol+" detected":symbol+" sent";
  var sign=isBuy?"+":"-";
  var headerClr=isBuy?"var(--g)":"var(--r)";
  var headerBg=isBuy?"rgba(52,211,153,.15)":"rgba(248,113,113,.15)";
  var headerBgFade=isBuy?"rgba(52,211,153,.05)":"rgba(248,113,113,.05)";
  var headerBd=isBuy?"rgba(52,211,153,.4)":"rgba(248,113,113,.4)";
  var headerShadow=isBuy?"rgba(52,211,153,.2)":"rgba(248,113,113,.2)";
  var btnClr=isBuy?"var(--g)":"var(--o)";
  var btnBg=isBuy?"rgba(52,211,153,.18)":"rgba(251,146,60,.18)";
  var btnBd=isBuy?"rgba(52,211,153,.5)":"rgba(251,146,60,.5)";
  ptfPendingDetection={symbol:symbol.toLowerCase(),delta:absDelta,isBuy:isBuy,newBalance:newBalance};
  $("ptfDetectDiv").innerHTML=
    '<div style="margin-bottom:10px;padding:12px 14px;border-radius:12px;'+
      'background:linear-gradient(180deg,'+headerBg+','+headerBgFade+');'+
      'border:1px solid '+headerBd+';'+
      'box-shadow:0 0 24px '+headerShadow+',0 0 0 1px '+headerShadow+' inset">'+
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">'+
        '<div style="font-weight:700;color:'+headerClr+';text-transform:uppercase;letter-spacing:1.2px;font-size:9px;font-family:Inter,sans-serif">'+(isBuy?"⚡ ":"⚠ ")+label+'</div>'+
        '<div style="flex:1"></div>'+
        '<div style="font-size:18px;font-weight:700;color:'+headerClr+';font-family:Geist Mono,monospace">'+sign+absDelta.toFixed(symbol==="BTC"?8:6)+' '+symbol+'</div>'+
      '</div>'+
      '<div style="font-size:9px;color:var(--mt);margin-bottom:10px;letter-spacing:.5px">New balance: <span style="color:var(--br);font-weight:600">'+newBalance.toFixed(symbol==="BTC"?8:6)+' '+symbol+'</span></div>'+
      // Mode toggle
      '<div style="display:flex;gap:6px;margin-bottom:8px">'+
        '<button id="ptfModeP" onclick="ptfSetMode(\'price\')" style="flex:1;padding:6px;font-size:8px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;background:rgba(96,165,250,.18);border:1px solid rgba(96,165,250,.5);color:var(--b);border-radius:6px;cursor:pointer">Price/Token</button>'+
        '<button id="ptfModeT" onclick="ptfSetMode(\'total\')" style="flex:1;padding:6px;font-size:8px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;background:rgba(12,18,32,.6);border:1px solid rgba(60,80,110,.3);color:var(--dm);border-radius:6px;cursor:pointer">Total USD</button>'+
      '</div>'+
      '<div style="display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap">'+
        '<div style="flex:1;min-width:130px"><div id="ptfDetectLbl" style="font-size:8px;color:var(--dm);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">'+(isBuy?"Purchase":"Sell")+' price per '+symbol+' (USD)</div>'+
          '<input class="inp" id="ptfDetectPrice" type="number" step="any" oninput="ptfUpdatePreview()" style="width:100%;font-size:13px;padding:8px;background:rgba(8,12,22,.6);border:1px solid rgba(60,80,110,.4);border-radius:6px;color:var(--br)" placeholder="'+(symbol==="BTC"?"68000":"2300")+'"></div>'+
        '<button onclick="ptfConfirmDetection()" style="background:linear-gradient(180deg,'+btnBg+',rgba(0,0,0,.05));border:1px solid '+btnBd+';color:'+btnClr+';padding:9px 14px;border-radius:8px;font-family:Inter,sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;cursor:pointer;min-height:38px;white-space:nowrap">✓ Save</button>'+
        '<button onclick="ptfDismissDetection()" style="background:rgba(12,18,32,.6);border:1px solid rgba(60,80,110,.3);color:var(--dm);padding:9px 12px;border-radius:8px;font-family:Inter,sans-serif;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:1px;cursor:pointer;min-height:38px">Dismiss</button>'+
      '</div>'+
      '<div id="ptfDetectPreview" style="margin-top:8px;font-size:9px;color:var(--dm);letter-spacing:.3px;min-height:14px"></div>'+
    '</div>';
  ptfDetectMode="price";
}

var ptfDetectMode="price";
function ptfSetMode(m){
  ptfDetectMode=m;
  var sym=ptfPendingDetection?ptfPendingDetection.symbol.toUpperCase():"";
  var pBtn=document.getElementById("ptfModeP"),tBtn=document.getElementById("ptfModeT");
  var lbl=document.getElementById("ptfDetectLbl"),inp=document.getElementById("ptfDetectPrice");
  if(m==="price"){
    if(pBtn){pBtn.style.background="rgba(96,165,250,.18)";pBtn.style.borderColor="rgba(96,165,250,.5)";pBtn.style.color="var(--b)";}
    if(tBtn){tBtn.style.background="rgba(12,18,32,.6)";tBtn.style.borderColor="rgba(60,80,110,.3)";tBtn.style.color="var(--dm)";}
    if(lbl)lbl.textContent=(ptfPendingDetection&&ptfPendingDetection.isBuy?"Purchase":"Sell")+" price per "+sym+" (USD)";
    if(inp)inp.placeholder=sym==="BTC"?"68000":(sym==="ETH"?"2300":"0");
  }else{
    if(tBtn){tBtn.style.background="rgba(96,165,250,.18)";tBtn.style.borderColor="rgba(96,165,250,.5)";tBtn.style.color="var(--b)";}
    if(pBtn){pBtn.style.background="rgba(12,18,32,.6)";pBtn.style.borderColor="rgba(60,80,110,.3)";pBtn.style.color="var(--dm)";}
    if(lbl)lbl.textContent="Total "+(ptfPendingDetection&&ptfPendingDetection.isBuy?"paid":"received")+" (USD)";
    if(inp)inp.placeholder="500";
  }
  ptfUpdatePreview();
}

function ptfUpdatePreview(){
  if(!ptfPendingDetection)return;
  var inp=document.getElementById("ptfDetectPrice"),pv=document.getElementById("ptfDetectPreview");
  if(!inp||!pv)return;
  var val=parseFloat(inp.value);
  if(!val||val<=0){pv.textContent="";return;}
  var d=ptfPendingDetection,sym=d.symbol.toUpperCase();
  if(ptfDetectMode==="price"){
    var total=d.delta*val;
    pv.innerHTML='= <span style="color:var(--cy);font-weight:600">$'+total.toFixed(2)+'</span> total for '+d.delta.toFixed(6)+' '+sym;
  }else{
    var price=val/d.delta;
    pv.innerHTML='= <span style="color:var(--cy);font-weight:600">$'+price.toFixed(2)+'</span> per '+sym;
  }
}

function ptfConfirmDetection(){
  if(!ptfPendingDetection)return;
  var inputVal=parseFloat($("ptfDetectPrice").value);
  if(!inputVal||inputVal<=0){$("ptfDetectPrice").style.borderColor="var(--r)";return;}
  var d=ptfPendingDetection;
  // Convert input to price/token based on mode
  var price;
  if(ptfDetectMode==="total"){
    price=inputVal/d.delta;
  }else{
    price=inputVal;
  }
  ptfLedger.push({id:"ptx_"+Date.now(),asset:d.symbol,amount:d.delta,price:price,total:d.delta*price,
    date:new Date().toISOString().split("T")[0],wallet:"Ledger",note:d.isBuy?"Auto detected transfer":"Auto detected outflow"});
  // Auto BR Permuta Event
  try{
    if(typeof brAddPermuta==="function"){
      var assetU=d.symbol.toUpperCase();
      var qty=Math.abs(d.delta);
      var usd=Math.abs(d.delta*price);
      var dateNow=new Date().toISOString().split("T")[0];
      brAddPermuta(d.isBuy?"buy":"sell",assetU,qty,usd,
        d.isBuy?"Auto-detected buy":"Auto-detected sell",dateNow);
    }
  }catch(e){console.log("BR auto-permuta confirm err:",e.message);}
  // Recalc avgEntry (case-insensitive match — d.symbol is "ETH"/"BTC", asset.id is "eth"/"btc")
  var asset=null;
  var symLower=(d.symbol||"").toLowerCase();
  for(var i=0;i<ptfAssets.length;i++){
    if((ptfAssets[i].id||"").toLowerCase()===symLower){asset=ptfAssets[i];break;}
  }
  if(asset){
    // Average the new buy/sell into the EXISTING cost basis (don't replace with ledger-only sum,
    // because the original baseline cost may not be in the ledger as an entry).
    if(d.isBuy){
      // Buy: add this purchase's cost on top of existing totalCost, recompute avg
      var addCost=d.delta*price;
      asset.totalCost=(asset.totalCost||0)+addCost;
      asset.amount=d.newBalance;
      asset.avgEntry=asset.amount>0?asset.totalCost/asset.amount:price;
      console.log("PTF buy: "+asset.id+" +"+d.delta.toFixed(6)+" @ $"+price.toFixed(4)+" → totalCost $"+asset.totalCost.toFixed(2)+", avgEntry $"+asset.avgEntry.toFixed(4)+", amount "+asset.amount);
    }else{
      // Sell: reduce totalCost proportionally (realized portion leaves at avgEntry), keep avgEntry
      var soldFraction=asset.amount>0?Math.abs(d.delta)/asset.amount:0;
      if(soldFraction>0&&soldFraction<=1){
        asset.totalCost=(asset.totalCost||0)*(1-soldFraction);
      }
      asset.amount=d.newBalance;
      // avgEntry stays the same on a sell (cost basis per unit unchanged)
      console.log("PTF sell: "+asset.id+" -"+Math.abs(d.delta).toFixed(6)+" → totalCost $"+(asset.totalCost||0).toFixed(2)+", avgEntry $"+(asset.avgEntry||0).toFixed(4)+", amount "+asset.amount);
    }
  }else{
    console.log("PTF: WARNING — no asset found for "+d.symbol+" (lowercase "+symLower+"), cost basis NOT updated");
  }
  ptfSave();ptfRenderTable();ptfRenderLedger();
  console.log("PTF: "+d.symbol+" "+(d.isBuy?"purchase":"sell")+" recorded: "+d.delta+" @ $"+price+" (mode:"+ptfDetectMode+")");
  // Banner handled it → clear any matching persistent pending-price entry so we don't double-ask.
  try{
    var sym=(d.symbol||"").toUpperCase();
    pendingPrices=pendingPrices.filter(function(p){return p.symbol!==sym;});
    savePendingPrices();
  }catch(e){}
  ptfPendingDetection=null;$("ptfDetectDiv").innerHTML="";
}

function ptfDismissDetection(){
  // Only hide the banner — the persistent pending-price entry STAYS, so we ask again on next start
  // until a price is actually entered. (User asked: keep asking until it's filled in.)
  ptfPendingDetection=null;$("ptfDetectDiv").innerHTML="";
}

// ═══ BTC manueller Kauf-Banner (für Ledger-Adress-Rotation Workaround) ═══
function btcAddBuyBanner(){
  // Find current BTC asset
  var btcAsset=null;
  for(var i=0;i<ptfAssets.length;i++){if(ptfAssets[i].id==="btc"){btcAsset=ptfAssets[i];break;}}
  if(!btcAsset){alert("BTC asset not found");return;}
  var currentAmount=btcAsset.amount||0;
  $("ptfDetectDiv").innerHTML=
    '<div style="margin-bottom:10px;padding:14px 14px 12px 14px;border-radius:12px;'+
      'background:linear-gradient(180deg,rgba(247,147,26,.12),rgba(247,147,26,.03));'+
      'border:1px solid rgba(247,147,26,.4);'+
      'box-shadow:0 0 24px rgba(247,147,26,.15),0 0 0 1px rgba(247,147,26,.15) inset">'+
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">'+
        '<div style="font-weight:700;color:#f7931a;text-transform:uppercase;letter-spacing:1.2px;font-size:9px;font-family:Inter,sans-serif">+ BTC Kauf hinzufügen</div>'+
        '<div style="flex:1"></div>'+
        '<div style="font-size:9px;color:var(--mt)">aktuell: <span style="color:#f7931a;font-weight:600;font-family:Geist Mono,monospace">'+currentAmount.toFixed(8)+' BTC</span></div>'+
      '</div>'+
      '<div style="display:flex;flex-direction:column;gap:8px">'+
        '<div>'+
          '<div style="font-size:8px;color:var(--dm);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Neue Total-Menge BTC (laut Ledger Live)</div>'+
          '<input class="inp" id="btcNewAmount" type="number" step="any" oninput="btcUpdatePreview()" style="width:100%;font-size:13px;padding:9px;background:rgba(8,12,22,.6);border:1px solid rgba(60,80,110,.4);border-radius:6px;color:var(--br);font-family:Geist Mono,monospace" placeholder="z.B. '+(currentAmount+0.001).toFixed(8)+'">'+
        '</div>'+
        '<div>'+
          '<div style="font-size:8px;color:var(--dm);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Bezahlt für diese Tranche (USD)</div>'+
          '<input class="inp" id="btcPaidUsd" type="number" step="any" oninput="btcUpdatePreview()" style="width:100%;font-size:13px;padding:9px;background:rgba(8,12,22,.6);border:1px solid rgba(60,80,110,.4);border-radius:6px;color:var(--br);font-family:Geist Mono,monospace" placeholder="z.B. 100.50">'+
        '</div>'+
      '</div>'+
      '<div id="btcBuyPreview" style="margin-top:10px;padding:8px 10px;border-radius:6px;background:rgba(8,12,22,.4);font-size:9px;color:var(--dm);min-height:14px;font-family:Inter,sans-serif"></div>'+
      '<div style="display:flex;gap:8px;margin-top:10px">'+
        '<button onclick="btcConfirmBuy()" style="flex:1;background:linear-gradient(180deg,rgba(52,211,153,.18),rgba(0,0,0,.05));border:1px solid rgba(52,211,153,.5);color:var(--g);padding:10px 14px;border-radius:8px;font-family:Inter,sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;cursor:pointer;min-height:40px">✓ Kauf speichern</button>'+
        '<button onclick="ptfDismissDetection()" style="background:rgba(12,18,32,.6);border:1px solid rgba(60,80,110,.3);color:var(--dm);padding:10px 14px;border-radius:8px;font-family:Inter,sans-serif;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:1px;cursor:pointer;min-height:40px">Abbrechen</button>'+
      '</div>'+
    '</div>';
  setTimeout(function(){var inp=document.getElementById("btcNewAmount");if(inp)inp.focus();},100);
}

function btcUpdatePreview(){
  var btcAsset=null;
  for(var i=0;i<ptfAssets.length;i++){if(ptfAssets[i].id==="btc"){btcAsset=ptfAssets[i];break;}}
  if(!btcAsset)return;
  var pv=document.getElementById("btcBuyPreview");
  var newAmtInp=document.getElementById("btcNewAmount"),paidInp=document.getElementById("btcPaidUsd");
  if(!pv||!newAmtInp||!paidInp)return;
  var newAmt=parseFloat(newAmtInp.value),paid=parseFloat(paidInp.value);
  var current=btcAsset.amount||0;
  if(!newAmt||newAmt<=0){pv.innerHTML='<span style="color:var(--mt)">Neue Total-Menge eingeben...</span>';return;}
  if(newAmt<=current){pv.innerHTML='<span style="color:var(--r)">⚠ Neue Menge ('+newAmt.toFixed(8)+') muss größer sein als aktuell ('+current.toFixed(8)+')</span>';return;}
  var delta=newAmt-current;
  if(!paid||paid<=0){
    pv.innerHTML='Δ <span style="color:#f7931a;font-weight:600">+'+delta.toFixed(8)+' BTC</span> · Bezahlten Betrag eingeben...';
    return;
  }
  var pricePerBtc=paid/delta;
  var oldCost=btcAsset.totalCost||0;
  var newTotalCost=oldCost+paid;
  var newAvgEntry=newAmt>0?newTotalCost/newAmt:0;
  pv.innerHTML=
    'Δ <span style="color:#f7931a;font-weight:600">+'+delta.toFixed(8)+' BTC</span> · '+
    'Buy-Preis: <span style="color:var(--cy);font-weight:600">$'+F(pricePerBtc,2)+'/BTC</span><br>'+
    'Neuer Avg: <span style="color:var(--g);font-weight:600">$'+F(newAvgEntry,2)+'</span> · '+
    'Total Cost: <span style="color:var(--g);font-weight:600">$'+F(newTotalCost,2)+'</span>';
}

function btcConfirmBuy(){
  var btcAsset=null;
  for(var i=0;i<ptfAssets.length;i++){if(ptfAssets[i].id==="btc"){btcAsset=ptfAssets[i];break;}}
  if(!btcAsset){alert("BTC asset not found");return;}
  var newAmtInp=document.getElementById("btcNewAmount"),paidInp=document.getElementById("btcPaidUsd");
  var newAmt=parseFloat(newAmtInp.value),paid=parseFloat(paidInp.value);
  var current=btcAsset.amount||0;
  if(!newAmt||newAmt<=current){newAmtInp.style.borderColor="var(--r)";return;}
  if(!paid||paid<=0){paidInp.style.borderColor="var(--r)";return;}
  var delta=newAmt-current;
  var pricePerBtc=paid/delta;
  // Check if asset has prior holdings (totalCost set) but NO ledger entries yet
  // If so, create a "Pre-existing holdings" ledger entry first to preserve old cost basis
  var existingEntries=ptfLedger.filter(function(e){return e.asset==="btc";});
  var hasPriorHoldings=current>0&&(btcAsset.totalCost||0)>0&&existingEntries.length===0;
  if(hasPriorHoldings){
    var priorAvg=btcAsset.avgEntry||(btcAsset.totalCost/current);
    ptfLedger.push({
      id:"ptx_"+(Date.now()-1),
      asset:"btc",
      amount:current,
      price:priorAvg,
      total:btcAsset.totalCost,
      date:"2024-01-01",
      wallet:"Ledger",
      note:"Pre-existing holdings (auto-imported)"
    });
    console.log("BTC: added pre-existing holdings entry: "+current+" BTC @ $"+priorAvg+" = $"+btcAsset.totalCost);
  }
  // Add the new buy
  ptfLedger.push({
    id:"ptx_"+Date.now(),
    asset:"btc",
    amount:delta,
    price:pricePerBtc,
    total:paid,
    date:new Date().toISOString().split("T")[0],
    wallet:"Ledger",
    note:"Manual BTC buy"
  });
  // Auto BR Permuta
  try{if(typeof brAddPermuta==="function")brAddPermuta("buy","BTC",delta,paid,"Manual BTC buy",new Date().toISOString().split("T")[0]);}catch(e){}
  // Recalc avgEntry/totalCost from full ledger (case-insensitive)
  var entries=ptfLedger.filter(function(e){return (e.asset||"").toLowerCase()==="btc";});
  var sumCost=0,sumAmt=0;
  for(var j=0;j<entries.length;j++){sumCost+=(entries[j].total||0);sumAmt+=(entries[j].amount||0);}
  if(sumAmt>0){
    btcAsset.avgEntry=sumCost/sumAmt;
    btcAsset.totalCost=sumCost;
  }
  btcAsset.amount=newAmt;
  ptfSave();
  try{ptfRenderTable();}catch(e){}
  try{ptfRenderLedger();}catch(e){}
  console.log("BTC buy added: +"+delta+" BTC for $"+paid+" → new total: "+newAmt+" BTC, avg $"+btcAsset.avgEntry.toFixed(2)+", cost $"+btcAsset.totalCost.toFixed(2));
  $("ptfDetectDiv").innerHTML="";
}

function ptfFP(p){if(p>=1000)return F(p,2);if(p>=1)return F(p,2);if(p>=0.01)return p.toFixed(4);return p.toFixed(6);}

function ptfGetPrice(a){
  if(a.geckoId&&ptfPrices[a.geckoId])return ptfPrices[a.geckoId].usd;
  return 0;
}
function ptfGetChange(a){
  if(a.geckoId&&ptfPrices[a.geckoId])return ptfPrices[a.geckoId].change;
  return null;
}

function ptfSort(col){
  if(ptfSortCol===col){ptfSortAsc=!ptfSortAsc;}else{ptfSortCol=col;ptfSortAsc=col==="symbol";}
  ptfRenderTable();
}

function ptfRenderTable(){
  try{
    var rows=[],totVal=0,totCost=0;
    var dir=ptfSortAsc?1:-1;
    var sorted=ptfAssets.slice().sort(function(a,b){
      var pa=ptfGetPrice(a),pb=ptfGetPrice(b);
      var va=a.amount*pa,vb=b.amount*pb;
      var pnlA=a.totalCost>0?(va-a.totalCost):0,pnlB=b.totalCost>0?(vb-b.totalCost):0;
      var pctA=a.totalCost>0?(pnlA/a.totalCost*100):0,pctB=b.totalCost>0?(pnlB/b.totalCost*100):0;
      switch(ptfSortCol){
        case"symbol":return dir*(a.symbol<b.symbol?-1:a.symbol>b.symbol?1:0);
        case"amount":return dir*(a.amount-b.amount);
        case"entry":return dir*(a.avgEntry-b.avgEntry);
        case"price":return dir*(pa-pb);
        case"cost":return dir*(a.totalCost-b.totalCost);
        case"value":return dir*(va-vb);
        case"pnl":return dir*(pnlA-pnlB);
        case"pct":return dir*(pctA-pctB);
        default:return dir*(va-vb);
      }
    });
    for(var i=0;i<sorted.length;i++){
      var a=sorted[i],price=ptfGetPrice(a);
      var val=a.amount*price;
      var pnl=a.totalCost>0?(val-a.totalCost):0;
      var pnlPct=a.totalCost>0?(pnl/a.totalCost*100):0;
      totVal+=val;if(a.totalCost>0)totCost+=a.totalCost;
      var chg=ptfGetChange(a);
      var chgH=chg!==null?'<span style="font-size:8px;color:'+(chg>=0?"var(--g)":"var(--r)")+'">'+(chg>=0?"+":"")+chg.toFixed(1)+'%</span>':"";
      var entryH=a.avgEntry>0?"$"+ptfFP(a.avgEntry):"—";
      var pnlClr=pnl>=0?"var(--g)":"var(--r)";
      var pnlH=a.totalCost>0?'<span style="color:'+pnlClr+'">'+(pnl>=0?"+$":"-$")+F(Math.abs(pnl),2)+'</span>':"—";
      var pctH=a.totalCost>0?'<span style="color:'+pnlClr+'">'+(pnlPct>=0?"+":"")+pnlPct.toFixed(1)+'%</span>':"—";
      var srcClr=a.source==="ledger"?"var(--cy)":"var(--dm)";
      // Failure indicator for ETH/BTC if recent fetch failed
      var failBadge="";
      if(a.id==="eth"&&ptfFetchFails.ethLastErr>0&&Date.now()-ptfFetchFails.ethLastErr<900000){
        failBadge=' <span style="color:var(--r);font-weight:700;font-size:11px" title="ETH balance fetch failed — using cached value">⚠</span>';
      }else if(a.id==="btc"&&ptfFetchFails.btcLastErr>0&&Date.now()-ptfFetchFails.btcLastErr<900000){
        failBadge=' <span style="color:var(--r);font-weight:700;font-size:11px" title="BTC balance fetch failed — using cached value">⚠</span>';
      }
      var actH=a.source==="ledger"?'<span class="tg" style="background:rgba(34,211,238,.1);color:var(--cy)">ledger</span>':'<span style="cursor:pointer;color:var(--r);font-size:10px" onclick="ptfRemoveAsset(\''+a.id+'\')" title="Delete">×</span>';
      var costH=a.totalCost>0?'$'+F(a.totalCost,2):"—";
      var accent=a.totalCost>0?(pnl>=0?"var(--g)":"var(--r)"):"var(--dm)";
      rows.push('<tr><td class="bld" style="border-left:3px solid '+accent+';padding:13px 10px 13px 9px"><div style="font-size:15px;font-weight:800;letter-spacing:.4px;color:#fff;line-height:1.1">'+a.symbol+failBadge+'</div><div style="font-size:9px;font-weight:500;color:'+srcClr+';margin-top:2px">'+a.name+'</div></td><td>'+F(a.amount,a.decimals)+'</td><td>'+entryH+'</td><td>'+(price>0?"$"+ptfFP(price):"—")+' '+chgH+'</td><td style="color:var(--dm)">'+costH+'</td><td style="color:var(--g)">$'+F(val,2)+'</td><td>'+pnlH+'</td><td>'+pctH+'</td><td>'+actH+'</td></tr>');
    }
    $("ptfTableB").innerHTML=rows.join("")||'<tr><td colspan="9" style="color:var(--dm);text-align:center">No assets</td></tr>';
    ptfTotalDisplay=totVal;
    var totPnl=totCost>0?(totVal-totCost):0;
    var totPnlPct=totCost>0?(totPnl/totCost*100):0;
    var tc=totPnl>=0?"var(--g)":"var(--r)";
    // Best/worst performers
    try{
      var bestSym="",bestPct=-Infinity,worstSym="",worstPct=Infinity;
      for(var pi=0;pi<sorted.length;pi++){
        var pa2=sorted[pi];if(pa2.totalCost<=0)continue;
        var pv=pa2.amount*ptfGetPrice(pa2);
        var pp=(pv-pa2.totalCost)/pa2.totalCost*100;
        if(pp>bestPct){bestPct=pp;bestSym=pa2.symbol;}
        if(pp<worstPct){worstPct=pp;worstSym=pa2.symbol;}
      }
      if(bestSym)$("ptfPerformers").innerHTML='<span style="color:var(--g)">🏆 '+bestSym+' '+(bestPct>=0?"+":"")+bestPct.toFixed(1)+'%</span> <span style="color:var(--dm)"> · </span> <span style="color:var(--r)">📉 '+worstSym+' '+(worstPct>=0?"+":"")+worstPct.toFixed(1)+'%</span>';
      else $("ptfPerformers").innerHTML="";
    }catch(e){}
    // 24h portfolio change
    var val24ago=0;
    for(var ci=0;ci<sorted.length;ci++){
      var ca=sorted[ci],cp=ptfGetPrice(ca),cc=ptfGetChange(ca);
      if(cp>0&&cc!==null&&cc!==undefined){val24ago+=ca.amount*(cp/(1+cc/100));}else{val24ago+=ca.amount*cp;}
    }
    var chg24=totVal-val24ago,chg24p=val24ago>0?(chg24/val24ago*100):0;
    var c24c=chg24>=0?"var(--g)":"var(--r)";
    $("ptfSummary").innerHTML=MB("Total Value","$"+F(totVal,2),"var(--br)")+MB("Invested","$"+F(totCost,2),"var(--dm)")+MB("Total P&L",(totPnl>=0?"+$":"-$")+F(Math.abs(totPnl),2),tc)+MB("P&L %",(totPnlPct>=0?"+":"")+totPnlPct.toFixed(1)+"%",tc)+MB("24h Change",(chg24>=0?"+$":"-$")+F(Math.abs(chg24),2)+'<div style="font-size:9px">'+(chg24p>=0?"+":"")+chg24p.toFixed(1)+"%</div>",c24c);
  }catch(e){console.log("PTF renderTable err:",e);}
  try{ptfSaveSnapshot(totVal);ptfRenderTimeline();ptfRenderPnlBars();ptfRenderAllocation();}catch(e){}
  try{ptfSimRender();ptfUpdateDropdown();}catch(e){}
}

function ptfRenderLedger(){
  try{
    var sorted=ptfLedger.slice().sort(function(a,b){return b.date>a.date?1:(b.date<a.date?-1:0);});
    var rows=[];
    for(var i=0;i<sorted.length;i++){
      var e=sorted[i];
      rows.push('<tr><td>'+e.date+'</td><td class="bld">'+e.asset.toUpperCase()+'</td><td>'+F(e.amount,4)+'</td><td>$'+ptfFP(e.price)+'</td><td style="color:var(--g)">$'+F(e.total,2)+'</td><td>'+(e.wallet||"")+'</td><td><span style="cursor:pointer;color:var(--r);font-size:10px" onclick="ptfRemovePurchase(\''+e.id+'\')" title="Delete">×</span></td></tr>');
    }
    $("ptfLedgerB").innerHTML=rows.join("")||'<tr><td colspan="7" style="color:var(--dm);text-align:center">No entries</td></tr>';
  }catch(e){console.log("PTF renderLedger err:",e);}
}

function ptfUpdateDropdown(){
  try{
    var sel=$("ptfBuyAsset"),opts="";
    for(var i=0;i<ptfAssets.length;i++){
      opts+='<option value="'+ptfAssets[i].id+'">'+ptfAssets[i].symbol+'</option>';
    }
    sel.innerHTML=opts;
  }catch(e){}
}

function ptfRecalcAsset(assetId){
  var idLow=(assetId||"").toLowerCase();
  var entries=ptfLedger.filter(function(e){return (e.asset||"").toLowerCase()===idLow;});
  var asset=null;
  for(var i=0;i<ptfAssets.length;i++){if((ptfAssets[i].id||"").toLowerCase()===idLow){asset=ptfAssets[i];break;}}
  if(!asset)return;
  if(entries.length===0)return; // no ledger entries → don't zero out existing cost basis
  var totalCost=0,totalAmt=0;
  for(var j=0;j<entries.length;j++){totalCost+=(entries[j].total||0);totalAmt+=(entries[j].amount||0);}
  if(totalAmt<=0)return; // guard against division by zero / cost wipe
  asset.totalCost=totalCost;
  asset.avgEntry=totalCost/totalAmt;
  if(asset.source==="manual")asset.amount=totalAmt;
}

function ptfAddAsset(){
  try{
    var sym=($("ptfAddSym").value||"").trim().toUpperCase();
    var gecko=($("ptfAddGecko").value||"").trim().toLowerCase();
    var amt=parseFloat($("ptfAddAmt").value)||0;
    var entry=parseFloat($("ptfAddEntry").value)||0;
    if(!sym){$("ptfAddErr").textContent="Symbol required";return;}
    if(!gecko){$("ptfAddErr").textContent="CoinGecko ID required";return;}
    if(amt<=0){$("ptfAddErr").textContent="Amount must be > 0";return;}
    var id=sym.toLowerCase();
    for(var i=0;i<ptfAssets.length;i++){if(ptfAssets[i].id===id){$("ptfAddErr").textContent="Asset already exists";return;}}
    if(ptfAssets.length>=50){$("ptfAddErr").textContent="Max 50 assets";return;}
    var dec=entry>100?4:(entry>1?2:0);
    ptfAssets.push({id:id,symbol:sym,name:sym,geckoId:gecko,amount:amt,avgEntry:entry,totalCost:amt*entry,source:"manual",decimals:dec,contract:null});
    if(amt>0&&entry>0){
      ptfLedger.push({id:"ptx_"+Date.now(),asset:id,amount:amt,price:entry,total:amt*entry,date:new Date().toISOString().split("T")[0],wallet:"",note:"Initial"});
    }
    $("ptfAddSym").value="";$("ptfAddGecko").value="";$("ptfAddAmt").value="";$("ptfAddEntry").value="";$("ptfAddErr").textContent="";
    ptfSave();ptfFetchPrices();ptfRenderTable();ptfRenderLedger();
  }catch(e){console.log("PTF addAsset err:",e);}
}

function ptfRemoveAsset(id){
  try{
    for(var i=0;i<ptfAssets.length;i++){
      if(ptfAssets[i].id===id){
        if(ptfAssets[i].source==="ledger"){$("ptfAddErr").textContent="Cannot delete — tracked via wallet";return;}
        ptfAssets.splice(i,1);break;
      }
    }
    ptfLedger=ptfLedger.filter(function(e){return e.asset!==id;});
    ptfSave();ptfRenderTable();ptfRenderLedger();
  }catch(e){console.log("PTF removeAsset err:",e);}
}

function ptfAddPurchase(){
  try{
    var assetId=$("ptfBuyAsset").value;
    var amt=parseFloat($("ptfBuyAmt").value)||0;
    var price=parseFloat($("ptfBuyPrice").value)||0;
    var date=$("ptfBuyDate").value||new Date().toISOString().split("T")[0];
    var wallet=($("ptfBuyWallet").value||"").trim();
    if(!assetId){$("ptfBuyErr").textContent="Select an asset";return;}
    if(amt<=0){$("ptfBuyErr").textContent="Amount must be > 0";return;}
    if(price<=0){$("ptfBuyErr").textContent="Price must be > 0";return;}
    if(ptfLedger.length>=500){$("ptfBuyErr").textContent="Max 500 entries";return;}
    ptfLedger.push({id:"ptx_"+Date.now(),asset:assetId,amount:amt,price:price,total:amt*price,date:date,wallet:wallet,note:""});
    // Auto BR Permuta
    try{if(typeof brAddPermuta==="function")brAddPermuta("buy",assetId.toUpperCase(),amt,amt*price,"Manual buy "+(wallet||""),date);}catch(e){}
    ptfRecalcAsset(assetId);
    $("ptfBuyAmt").value="";$("ptfBuyPrice").value="";$("ptfBuyWallet").value="";$("ptfBuyErr").textContent="";
    ptfSave();ptfRenderTable();ptfRenderLedger();
  }catch(e){console.log("PTF addPurchase err:",e);}
}

function ptfRemovePurchase(id){
  try{
    var assetId="";
    for(var i=0;i<ptfLedger.length;i++){if(ptfLedger[i].id===id){assetId=ptfLedger[i].asset;ptfLedger.splice(i,1);break;}}
    if(assetId)ptfRecalcAsset(assetId);
    ptfSave();ptfRenderTable();ptfRenderLedger();
  }catch(e){console.log("PTF removePurchase err:",e);}
}

// ═══ PORTFOLIO CHARTS ═══
var PTF_COLORS=["#22d3ee","#34d399","#fb923c","#f87171","#c084fc","#60a5fa","#fbbf24","#a78bfa","#e879f9","#2dd4bf","#94a3b8"];
var PTF_CATEGORIES={btc:"large",eth:"large",link:"mid",aave:"mid",uni:"mid",arb:"small",ondo:"small",rndr:"small",fet:"small",tia:"small",tao:"mid",ar:"small",akt:"small",cro:"small",eigen:"small",cfg:"spec",mon:"spec",sky:"spec",syrup:"spec"};
var PTF_CYCLE_MULT={large:{bear:2,base:4,super:7},mid:{bear:3,base:6,super:12},small:{bear:4,base:10,super:20},spec:{bear:2,base:15,super:40}};
var PTF_SURVIVAL={large:0.95,mid:0.75,small:0.55,spec:0.30};
var PTF_BTC_SCENARIOS={bear:110000,base:180000,super:300000};
var PTF_BTC_ADJUST={bear:0.75,base:1.0,super:1.3};
var PTF_ETH_RATIO={bear:0.045,base:0.055,super:0.07};

var ptfChartRange="7d";

function ptfSaveSnapshot(tv){
  try{
    if(tv<=0)return;
    var last=ptfSnapshots.length>0?ptfSnapshots[ptfSnapshots.length-1]:null;
    var lastTs=last?(Array.isArray(last)?last[0]:last.ts):0;
    if(Date.now()-lastTs<300000)return;
    ptfSnapshots.push([Date.now(),Math.round(tv*100)/100]);
    if(ptfSnapshots.length>105000)ptfSnapshots.shift();
    try{localStorage.setItem("ptf_snapshots",JSON.stringify(ptfSnapshots));}catch(e){console.log("PTF snapshot save err — storage may be full");}
  }catch(e){}
}

function ptfSetChartRange(range){
  ptfChartRange=range;
  var rs=["1d","7d","1m","1y","all"];
  for(var i=0;i<rs.length;i++){var b=$("ptfTR"+rs[i]);if(b)b.style.borderColor=rs[i]===range?"var(--cy)":"";}
  ptfRenderTimeline();
}

function ptfFmtDate(ts,range){
  var d=new Date(ts);
  if(range==="1d")return d.getHours().toString().padStart(2,"0")+":"+d.getMinutes().toString().padStart(2,"0");
  if(range==="7d"||range==="1m")return d.getDate().toString().padStart(2,"0")+"."+(d.getMonth()+1).toString().padStart(2,"0");
  var mo=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return mo[d.getMonth()]+" "+d.getFullYear().toString().slice(2);
}

/* ── v4: Dual-Linien Total-Chart (paper + real) + Alt-Subchart aus Server-Endpoint ── */
var ptfTotPaper=[],ptfTotReal=[],ptfTotFlows=[],ptfTotFlowsReal=[],ptfAltSeries=[],ptfLiquidSeries=[],ptfTotLoaded=false;
function ptfLoadTotalSeries(){
  try{
    fetch("https://95-216-152-31.sslip.io/history?scope=cryptototal").then(function(r){return r.json();}).then(function(d){
      if(d&&d.paper&&d.paper.length&&d.real){ptfTotPaper=d.paper;ptfTotReal=d.real;ptfTotFlows=d.flows||[];ptfTotFlowsReal=d.flowsReal||[];ptfTotLoaded=true;try{ptfRenderTimeline();}catch(e){}try{if(document.getElementById("chartModal")&&document.getElementById("chartModal").style.display==="flex")ptfRenderFullscreen();}catch(e){}}
    }).catch(function(){});
    fetch("https://95-216-152-31.sslip.io/history?scope=byclass").then(function(r){return r.json();}).then(function(d){
      if(d&&d.crypto){ptfAltSeries=d.crypto;
        try{
          var _lq=[],_cs=d.crypto,_us=d.usdc||[];
          for(var _lqi=0;_lqi<_cs.length;_lqi++){
            var _lv=_cs[_lqi][1]+((_us[_lqi]||[0,0])[1]||0);
            _lq.push([_cs[_lqi][0],Math.round(_lv*100)/100]);
          }
          ptfLiquidSeries=_lq;
        }catch(e){}
        try{ptfRenderTimeline();}catch(e){}}
    }).catch(function(){});
  }catch(e){}
}
function ptfTfFilter(series){
  if(!series||series.length<2)return series||[];
  var ranges={"1d":86400000,"7d":604800000,"1m":2592000000,"1y":31536000000,"all":Date.now()};
  var cut=Date.now()-(ranges[ptfChartRange]||604800000);
  var f=[];for(var i=0;i<series.length;i++){if(series[i][0]>=cut)f.push(series[i]);}
  if(f.length<2)f=series.slice();
  if(f.length>400){var st=Math.ceil(f.length/400);var ds=[f[0]];for(var j=st;j<f.length-1;j+=st)ds.push(f[j]);ds.push(f[f.length-1]);f=ds;}
  return f;
}
function ptfDualSvg(bigH){
  var P=ptfTfFilter(ptfTotPaper),R=ptfTfFilter(ptfTotReal);
  if(P.length<2)return "";
  var L=ptfTfFilter(ptfLiquidSeries||[]);var hasLiq=L.length>=2;
  var minV=Infinity,maxV=-Infinity,t0=Infinity,t1=-Infinity,i,v,t,all=P.concat(R);
  if(hasLiq)all=all.concat(L);
  for(i=0;i<all.length;i++){v=all[i][1];if(v<minV)minV=v;if(v>maxV)maxV=v;t=all[i][0];if(t<t0)t0=t;if(t>t1)t1=t;}
  if(!(maxV>minV))maxV=minV+1;
  var pad=(maxV-minV)*0.05;minV=Math.max(0,minV-pad);maxV+=pad;var vR=maxV-minV||1,tR=t1-t0||1;
  var W=700,H=bigH||230,px=55,py=16,cw=W-px-12,ch=H-54;
  function lp(sr){var a=[];for(var k=0;k<sr.length;k++){var x=px+(sr[k][0]-t0)/tR*cw;var y=py+ch-(sr[k][1]-minV)/vR*ch;a.push(x.toFixed(1)+","+y.toFixed(1));}return a;}
  var pa=lp(P),ra=lp(R),pathP="M"+pa.join("L"),pathR="M"+ra.join("L");
  var la=hasLiq?lp(L):[],pathL=hasLiq?("M"+la.join("L")):"";
  var fillP=pathP+"L"+(px+cw)+","+(py+ch)+"L"+px+","+(py+ch)+"Z";
  var grid="";for(var g=0;g<=4;g++){var gy=py+ch-ch*g/4;var gv=minV+(maxV-minV)*g/4;grid+='<line x1="'+px+'" y1="'+gy+'" x2="'+(W-12)+'" y2="'+gy+'" stroke="rgba(30,41,59,.35)" stroke-dasharray="4,4"/>';grid+='<text x="'+(px-4)+'" y="'+(gy+3)+'" fill="#94a3b8" font-size="8" text-anchor="end">$'+Math.round(gv).toLocaleString()+'</text>';}
  var xl="";for(var xi=0;xi<5;xi++){var idx=Math.round(xi/4*(P.length-1));var xx=px+(P[idx][0]-t0)/tR*cw;xl+='<text x="'+xx+'" y="'+(H-4)+'" fill="#94a3b8" font-size="8" text-anchor="middle">'+ptfFmtDate(P[idx][0],ptfChartRange==="all"?"1y":ptfChartRange)+'</text>';}
  var lastP=P[P.length-1][1],lastR=R[R.length-1][1],lpp=pa[pa.length-1].split(","),rpp=ra[ra.length-1].split(",");
  var lastL=hasLiq?L[L.length-1][1]:null;
  var leg='<text x="'+px+'" y="11" font-size="10"><tspan fill="#22d3ee">● Paper $'+Math.round(lastP).toLocaleString()+'</tspan>   <tspan fill="#f5b301">● Real $'+Math.round(lastR).toLocaleString()+'</tspan>'+(hasLiq?'   <tspan fill="#34d399">● Liquide $'+Math.round(lastL).toLocaleString()+'</tspan>':'')+'</text>';
  var F=ptfTfFilter(ptfTotFlows||[]);
  var FR=ptfTfFilter((ptfTotFlowsReal&&ptfTotFlowsReal.length)?ptfTotFlowsReal:(ptfTotFlows||[]));
  var dFl=(F.length>=2)?(F[F.length-1][1]-F[0][1]):0;
  var dFr=(FR.length>=2)?(FR[FR.length-1][1]-FR[0][1]):0;
  var dPp=lastP-P[0][1]-dFl, dRr=lastR-R[0][1]-dFr;
  var pPp=P[0][1]>0?dPp/P[0][1]*100:0, pRr=R[0][1]>0?dRr/R[0][1]*100:0;
  var _sg=function(n){return (n>=0?"+$":"-$")+Math.abs(Math.round(n)).toLocaleString();};
  var leg2='<text x="'+px+'" y="23" font-size="9"><tspan fill="#22d3ee">Paper '+_sg(dPp)+' · '+(pPp>=0?"+":"")+pPp.toFixed(1)+'%</tspan>  <tspan fill="#f5b301">Real '+_sg(dRr)+' · '+(pRr>=0?"+":"")+pRr.toFixed(1)+'%</tspan>'+(Math.abs(dFl)>1?'  <tspan fill="#94a3b8">o. Einzahlungen ('+_sg(dFl)+')</tspan>':'')+(hasLiq?'  <tspan fill="#34d399">Krypto-Anteil am \$100k-Ziel: '+Math.min(999,Math.round(lastL/1000))+'%</tspan>':'')+'</text>';
  return '<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:auto">'+
    '<defs><linearGradient id="ptfPap" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(34,211,238,.14)"/><stop offset="100%" stop-color="rgba(34,211,238,0)"/></linearGradient></defs>'+
    grid+xl+leg+leg2+
    '<path d="'+fillP+'" fill="url(#ptfPap)"/>'+
    (hasLiq?'<path d="'+pathL+'" fill="none" stroke="#34d399" stroke-width="1.6"/>':'')+
    '<path d="'+pathR+'" fill="none" stroke="#f5b301" stroke-width="1.8"/>'+
    '<path d="'+pathP+'" fill="none" stroke="#22d3ee" stroke-width="2"/>'+
    '<circle cx="'+lpp[0]+'" cy="'+lpp[1]+'" r="3.5" fill="#22d3ee"/>'+
    '<circle cx="'+rpp[0]+'" cy="'+rpp[1]+'" r="3.5" fill="#f5b301"/>'+
    '</svg>';
}
function ptfAltSvg(){
  var A=ptfTfFilter(ptfAltSeries);
  if(A.length<2)return "";
  var minV=Infinity,maxV=-Infinity,t0=A[0][0],t1=A[A.length-1][0];
  for(var i=0;i<A.length;i++){var v=A[i][1];if(v<minV)minV=v;if(v>maxV)maxV=v;}
  if(!(maxV>minV))maxV=minV+1;var pad=(maxV-minV)*0.08;minV=Math.max(0,minV-pad);maxV+=pad;var vR=maxV-minV||1,tR=(t1-t0)||1;
  var W=700,H=96,px=55,py=14,cw=W-px-12,ch=64,a=[];
  for(var k=0;k<A.length;k++){var x=px+(A[k][0]-t0)/tR*cw;var y=py+ch-(A[k][1]-minV)/vR*ch;a.push(x.toFixed(1)+","+y.toFixed(1));}
  var path="M"+a.join("L"),fill=path+"L"+(px+cw)+","+(py+ch)+"L"+px+","+(py+ch)+"Z",last=A[A.length-1][1];
  var grid="";for(var g=0;g<=2;g++){var gy=py+ch-ch*g/2;var gv=minV+(maxV-minV)*g/2;grid+='<line x1="'+px+'" y1="'+gy+'" x2="'+(W-12)+'" y2="'+gy+'" stroke="rgba(30,41,59,.3)" stroke-dasharray="4,4"/>';grid+='<text x="'+(px-4)+'" y="'+(gy+3)+'" fill="#94a3b8" font-size="8" text-anchor="end">$'+Math.round(gv).toLocaleString()+'</text>';}
  return '<div style="font-size:10px;color:#94a3b8;margin:6px 0 2px 4px">Altcoins (ohne BURN/HOODIE) · $'+Math.round(last).toLocaleString()+'</div>'+
    '<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:auto"><defs><linearGradient id="ptfAltF" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(139,124,246,.16)"/><stop offset="100%" stop-color="rgba(139,124,246,0)"/></linearGradient></defs>'+grid+
    '<path d="'+fill+'" fill="url(#ptfAltF)"/>'+
    '<path d="'+path+'" fill="none" stroke="#8b7cf6" stroke-width="1.8"/></svg>';
}
function ptfRenderTimeline(){
  var el=$("ptfChartTimeline");if(!el)return;
  try{
  if(ptfTotLoaded&&ptfTotPaper.length>=2){
    var _h=ptfDualSvg();var _a=ptfAltSvg();
    if(_a)_h+='<div style="border-top:1px solid rgba(30,41,59,.5);margin-top:8px;padding-top:2px"></div>'+_a;
    el.innerHTML=_h;return;
  }
  var ranges={"1d":86400000,"7d":604800000,"1m":2592000000,"1y":31536000000,"all":Date.now()};
  var cutoff=Date.now()-(ranges[ptfChartRange]||604800000);
  var filtered=[];
  for(var fi=0;fi<ptfSnapshots.length;fi++){
    var s=ptfSnapshots[fi];
    var ts=Array.isArray(s)?s[0]:s.ts;
    var val=Array.isArray(s)?s[1]:s.value;
    if(ts>=cutoff)filtered.push([ts,val]);
  }
  if(filtered.length<2){
    var msgs={"1d":"Collecting data — check back in a few hours","7d":"Not enough data for 7D view yet","1m":"Data collecting — more points coming","1y":"Data collecting — full chart builds over time"};
    el.innerHTML='<span style="color:var(--dm);font-size:10px">'+(msgs[ptfChartRange]||"Not enough data")+'</span>';
    return;
  }
  // Downsample
  var maxPts=300;
  if(filtered.length>maxPts){
    var step=Math.ceil(filtered.length/maxPts);var ds=[filtered[0]];
    for(var si=step;si<filtered.length-1;si+=step)ds.push(filtered[si]);
    if(ds[ds.length-1]!==filtered[filtered.length-1])ds.push(filtered[filtered.length-1]);
    filtered=ds;
  }
  var minV=filtered[0][1],maxV=filtered[0][1];
  for(var i=1;i<filtered.length;i++){if(filtered[i][1]<minV)minV=filtered[i][1];if(filtered[i][1]>maxV)maxV=filtered[i][1];}
  if(maxV-minV<20){minV=Math.max(0,minV-10);maxV+=10;}else{var pad2=(maxV-minV)*0.02;minV=Math.floor(Math.max(0,minV-pad2));maxV=Math.ceil(maxV+pad2);}
  var vRange=maxV-minV||1;
  var W=700,H=220,px=55,py=10,cw=W-px-10,ch=180;
  var pts=[];
  for(var j=0;j<filtered.length;j++){
    var x=px+j/(filtered.length-1)*cw;
    var y=py+ch-(filtered[j][1]-minV)/vRange*ch;
    pts.push(x.toFixed(1)+","+y.toFixed(1));
  }
  var path="M"+pts.join("L");
  var fillPath=path+"L"+(px+cw)+","+(py+ch)+"L"+px+","+(py+ch)+"Z";
  var grid="";
  for(var g=0;g<=5;g++){
    var gy=py+ch-ch*g/5;
    var gv=minV+(maxV-minV)*g/5;
    grid+='<line x1="'+px+'" y1="'+gy+'" x2="'+(W-10)+'" y2="'+gy+'" stroke="rgba(30,41,59,.3)" stroke-dasharray="4,4"/>';
    grid+='<text x="'+(px-4)+'" y="'+(gy+3)+'" fill="#94a3b8" font-size="8" text-anchor="end">$'+Math.round(gv).toLocaleString()+'</text>';
  }
  var xLabels="";
  for(var xl=0;xl<5;xl++){
    var xi=Math.round(xl/4*(filtered.length-1));
    var xx=px+xi/(filtered.length-1)*cw;
    xLabels+='<text x="'+xx+'" y="'+(H-2)+'" fill="#94a3b8" font-size="8" text-anchor="middle">'+ptfFmtDate(filtered[xi][0],ptfChartRange)+'</text>';
  }
  var firstV=filtered[0][1],lastV=filtered[filtered.length-1][1];
  var chgAmt=lastV-firstV,chgPct=firstV>0?(chgAmt/firstV*100):0;
  var chgClr=chgAmt>=0?"#34d399":"#f87171";
  var chgTxt=(chgAmt>=0?"+$":"-$")+F(Math.abs(chgAmt),2)+" ("+(chgPct>=0?"+":"")+chgPct.toFixed(1)+"%)";
  var lastPt=pts[pts.length-1].split(",");
  var valLbl="$"+Math.round(lastV).toLocaleString();
  var valY=parseFloat(lastPt[1])-8;if(valY<16)valY=parseFloat(lastPt[1])+14;
  el.innerHTML='<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:auto">'+
    grid+xLabels+
    '<text x="'+(W-10)+'" y="16" fill="'+chgClr+'" font-size="11" text-anchor="end">'+chgTxt+'</text>'+
    '<defs><linearGradient id="ptfTlFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(34,211,238,.15)"/><stop offset="100%" stop-color="rgba(34,211,238,0)"/></linearGradient></defs>'+
    '<path d="'+fillPath+'" fill="url(#ptfTlFill)"/>'+
    '<path d="'+path+'" fill="none" stroke="#22d3ee" stroke-width="2"/>'+
    '<circle cx="'+lastPt[0]+'" cy="'+lastPt[1]+'" r="4" fill="#22d3ee"/>'+
    '<text x="'+(parseFloat(lastPt[0])-6)+'" y="'+valY+'" fill="#22d3ee" font-size="9" text-anchor="end">'+valLbl+'</text>'+
    '</svg>';
  }catch(e){console.log("PTF timeline err:",e);}
}

// ═══ FULLSCREEN CHART ═══
function openChartModal(){
  var m=$("chartModal");if(!m)return;
  m.style.display="flex";m.style.flexDirection="column";
  document.body.style.overflow="hidden";
  ptfModalRange(ptfChartRange||"7d");
}
function closeChartModal(){
  var m=$("chartModal");if(m)m.style.display="none";
  document.body.style.overflow="";
}
function ptfModalRange(r){
  ptfChartRange=r;
  ["1d","7d","1m","1y","all"].forEach(function(k){
    var b=$("cmR"+k);if(b){b.style.borderColor=k===r?"var(--cy)":"";b.style.color=k===r?"var(--cy)":"";}
  });
  ptfRenderFullscreen();
}
function ptfRenderFullscreen(){
  var el=$("chartModalBody");if(!el)return;
  if(ptfTotLoaded&&ptfTotPaper.length>=2){el.innerHTML='<div style="padding:6px">'+ptfDualSvg(360)+ptfAltSvg()+'</div>';return;}
  var info=$("chartModalInfo");
  var ranges={"1d":86400000,"7d":604800000,"1m":2592000000,"1y":31536000000,"all":Date.now()};
  var cutoff=Date.now()-(ranges[ptfChartRange]||604800000);
  var filtered=[];
  for(var i=0;i<ptfSnapshots.length;i++){
    var s=ptfSnapshots[i];var ts=Array.isArray(s)?s[0]:s.ts;var val=Array.isArray(s)?s[1]:s.value;
    if(ts>=cutoff)filtered.push([ts,val]);
  }
  if(filtered.length<2){el.innerHTML='<div style="color:var(--dm);font-size:12px;text-align:center;padding:40px">Not enough data for this range</div>';return;}
  var maxPts=500;
  if(filtered.length>maxPts){var step=Math.ceil(filtered.length/maxPts);var ds=[filtered[0]];for(var si=step;si<filtered.length-1;si+=step)ds.push(filtered[si]);ds.push(filtered[filtered.length-1]);filtered=ds;}
  var minV=filtered[0][1],maxV=filtered[0][1];
  for(var i2=1;i2<filtered.length;i2++){if(filtered[i2][1]<minV)minV=filtered[i2][1];if(filtered[i2][1]>maxV)maxV=filtered[i2][1];}
  var pad3=(maxV-minV)*0.05||10;minV=Math.max(0,minV-pad3);maxV+=pad3;
  var vRange=maxV-minV||1;
  var W=1200,H=500,px=60,py=20,cw=W-px-20,ch=H-py-40;
  var pts=[];
  for(var j=0;j<filtered.length;j++){var x=px+j/(filtered.length-1)*cw;var y=py+ch-(filtered[j][1]-minV)/vRange*ch;pts.push(x.toFixed(1)+","+y.toFixed(1));}
  var path="M"+pts.join("L");
  var fillPath=path+"L"+(px+cw)+","+(py+ch)+"L"+px+","+(py+ch)+"Z";
  var grid="";
  for(var g=0;g<=8;g++){var gy=py+ch-ch*g/8;var gv=minV+(maxV-minV)*g/8;
    grid+='<line x1="'+px+'" y1="'+gy+'" x2="'+(W-20)+'" y2="'+gy+'" stroke="rgba(30,41,59,.25)" stroke-dasharray="3,3"/>';
    grid+='<text x="'+(px-6)+'" y="'+(gy+3)+'" fill="#94a3b8" font-size="10" text-anchor="end">$'+Math.round(gv).toLocaleString()+'</text>';}
  var xLabels="";var nL=ptfChartRange==="1d"?8:ptfChartRange==="7d"?7:ptfChartRange==="1m"?10:ptfChartRange==="all"?12:12;
  for(var xl=0;xl<=nL;xl++){var xi=Math.round(xl/nL*(filtered.length-1));var xx=px+xi/(filtered.length-1)*cw;
    xLabels+='<text x="'+xx+'" y="'+(H-5)+'" fill="#64748b" font-size="9" text-anchor="middle">'+ptfFmtDate(filtered[xi][0],ptfChartRange==="all"?"1y":ptfChartRange)+'</text>';}
  var firstV=filtered[0][1],lastV=filtered[filtered.length-1][1];
  var chgAmt=lastV-firstV,chgPct=firstV>0?(chgAmt/firstV*100):0;
  var chgClr=chgAmt>=0?"#34d399":"#f87171";
  var lastPt=pts[pts.length-1].split(",");
  // Chart with touch crosshair
  el.innerHTML='<div style="position:relative;width:100%;height:100%"><svg id="fsChartSvg" viewBox="0 0 '+W+' '+H+'" style="width:100%;height:100%;max-height:75vh">'+
    grid+xLabels+
    '<defs><linearGradient id="ptfFsFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(34,211,238,.2)"/><stop offset="100%" stop-color="rgba(34,211,238,0)"/></linearGradient></defs>'+
    '<path d="'+fillPath+'" fill="url(#ptfFsFill)"/>'+
    '<path d="'+path+'" fill="none" stroke="#22d3ee" stroke-width="2.5" stroke-linejoin="round"/>'+
    '<circle cx="'+lastPt[0]+'" cy="'+lastPt[1]+'" r="5" fill="#22d3ee"/>'+
    '<text x="'+(parseFloat(lastPt[0])-8)+'" y="'+(parseFloat(lastPt[1])-10)+'" fill="#22d3ee" font-size="12" text-anchor="end">$'+Math.round(lastV).toLocaleString()+'</text>'+
    '<line id="fsCross" x1="0" y1="'+py+'" x2="0" y2="'+(py+ch)+'" stroke="rgba(251,146,60,.4)" stroke-width="1" stroke-dasharray="3,3" style="display:none"/>'+
    '<circle id="fsDot" cx="0" cy="0" r="4" fill="#fb923c" style="display:none"/>'+
    '<text id="fsLabel" x="0" y="0" fill="#fb923c" font-size="10" text-anchor="middle" style="display:none"></text>'+
    '</svg><div id="fsTip" style="display:none;position:absolute;top:8px;left:50%;transform:translateX(-50%);background:rgba(5,8,15,.9);border:1px solid rgba(251,146,60,.3);border-radius:8px;padding:4px 10px;font-size:11px;color:var(--o);pointer-events:none;white-space:nowrap;z-index:10"></div></div>';
  // Touch/mouse crosshair handler
  window._fsChartData=filtered;window._fsChartParams={W:W,H:H,px:px,py:py,cw:cw,ch:ch,minV:minV,maxV:maxV};
  var svg=document.getElementById("fsChartSvg");
  if(svg){
    var handler=function(ex,ey){
      var rect=svg.getBoundingClientRect();
      var relX=(ex-rect.left)/rect.width*W;
      var idx=Math.round((relX-px)/cw*(filtered.length-1));
      idx=Math.max(0,Math.min(filtered.length-1,idx));
      var pt=filtered[idx];
      var cx=px+idx/(filtered.length-1)*cw;
      var cy=py+ch-(pt[1]-minV)/(maxV-minV)*ch;
      var cross=document.getElementById("fsCross");
      var dot=document.getElementById("fsDot");
      var tip=document.getElementById("fsTip");
      if(cross){cross.setAttribute("x1",cx);cross.setAttribute("x2",cx);cross.style.display="";}
      if(dot){dot.setAttribute("cx",cx);dot.setAttribute("cy",cy);dot.style.display="";}
      if(tip){tip.style.display="";tip.innerHTML="$"+Math.round(pt[1]).toLocaleString()+" · "+new Date(pt[0]).toLocaleDateString()+" "+new Date(pt[0]).toLocaleTimeString().slice(0,5);}
    };
    svg.addEventListener("touchmove",function(e){e.preventDefault();var t=e.touches[0];handler(t.clientX,t.clientY);},{passive:false});
    svg.addEventListener("mousemove",function(e){handler(e.clientX,e.clientY);});
    svg.addEventListener("touchend",function(){
      var c2=document.getElementById("fsCross");var d2=document.getElementById("fsDot");var t2=document.getElementById("fsTip");
      if(c2)c2.style.display="none";if(d2)d2.style.display="none";if(t2)t2.style.display="none";
    });
  }
  if(info){
    var hi=filtered.reduce(function(a,b){return b[1]>a?b[1]:a;},0);
    var lo=filtered.reduce(function(a,b){return b[1]<a?b[1]:a;},Infinity);
    info.innerHTML='<span style="color:'+chgClr+'">'+(chgAmt>=0?"+":"")+F(chgAmt,2)+' ('+chgPct.toFixed(1)+'%)</span> · '+
      'High: <span style="color:var(--g)">$'+F(hi,0)+'</span> · Low: <span style="color:var(--r)">$'+F(lo,0)+'</span> · '+
      filtered.length+' pts · '+new Date(filtered[0][0]).toLocaleDateString()+" — "+new Date(filtered[filtered.length-1][0]).toLocaleDateString();
  }
}

function ptfRenderPnlBars(){
  var el=$("ptfChartPnl");if(!el)return;
  var items=[];
  for(var i=0;i<ptfAssets.length;i++){
    var a=ptfAssets[i],price=ptfGetPrice(a),val=a.amount*price;
    if(a.totalCost<=0)continue;
    var pnlPct=(val-a.totalCost)/a.totalCost*100;
    items.push({sym:a.symbol,pct:pnlPct});
  }
  if(items.length===0){el.innerHTML='<span style="color:var(--dm);font-size:10px">No P&L data available</span>';return;}
  items.sort(function(a,b){return b.pct-a.pct;});
  var maxPct=0;for(var m=0;m<items.length;m++){if(Math.abs(items[m].pct)>maxPct)maxPct=Math.abs(items[m].pct);}
  if(maxPct===0)maxPct=1;
  var rh=28,W=700,cx=350,H=items.length*rh+20;
  var bars='<line x1="'+cx+'" y1="10" x2="'+cx+'" y2="'+(H-10)+'" stroke="rgba(30,41,59,.5)" stroke-width="1"/>';
  for(var j=0;j<items.length;j++){
    var it=items[j],y=14+j*rh;
    var bw=Math.abs(it.pct)/maxPct*280;
    var clr=it.pct>=0?"#34d399":"#f87171";
    if(it.pct>=0){
      bars+='<rect x="'+cx+'" y="'+y+'" width="'+bw+'" height="18" rx="3" fill="'+clr+'" opacity=".7"/>';
      bars+='<text x="'+(cx+bw+6)+'" y="'+(y+13)+'" fill="'+clr+'" font-size="8">+'+it.pct.toFixed(1)+'%</text>';
    }else{
      bars+='<rect x="'+(cx-bw)+'" y="'+y+'" width="'+bw+'" height="18" rx="3" fill="'+clr+'" opacity=".7"/>';
      bars+='<text x="'+(cx-bw-6)+'" y="'+(y+13)+'" fill="'+clr+'" font-size="8" text-anchor="end">'+it.pct.toFixed(1)+'%</text>';
    }
    bars+='<text x="'+(it.pct>=0?cx-6:cx+6)+'" y="'+(y+13)+'" fill="#e2e8f0" font-size="10" text-anchor="'+(it.pct>=0?"end":"start")+'">'+it.sym+'</text>';
  }
  el.innerHTML='<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:auto">'+bars+'</svg>';
}

function ptfDonutArc(cx,cy,rO,rI,sa,ea){
  if(ea-sa>=2*Math.PI)ea=sa+1.9999*Math.PI;
  var x1o=cx+rO*Math.sin(sa),y1o=cy-rO*Math.cos(sa);
  var x2o=cx+rO*Math.sin(ea),y2o=cy-rO*Math.cos(ea);
  var x1i=cx+rI*Math.sin(ea),y1i=cy-rI*Math.cos(ea);
  var x2i=cx+rI*Math.sin(sa),y2i=cy-rI*Math.cos(sa);
  var lg=(ea-sa)>Math.PI?1:0;
  return"M"+x1o.toFixed(2)+","+y1o.toFixed(2)+" A"+rO+","+rO+" 0 "+lg+" 1 "+x2o.toFixed(2)+","+y2o.toFixed(2)+" L"+x1i.toFixed(2)+","+y1i.toFixed(2)+" A"+rI+","+rI+" 0 "+lg+" 0 "+x2i.toFixed(2)+","+y2i.toFixed(2)+" Z";
}

function ptfRenderAllocation(){
  var el=$("ptfChartAlloc");if(!el)return;
  try{
  var items=[],totVal=0;
  for(var i=0;i<ptfAssets.length;i++){
    var a=ptfAssets[i],price=ptfGetPrice(a),val=a.amount*price;
    if(val<=0)continue;
    items.push({sym:a.symbol,val:val});totVal+=val;
  }
  if(items.length===0||totVal<=0){el.innerHTML='<span style="color:var(--dm);font-size:10px">No allocation data</span>';return;}
  items.sort(function(a,b){return b.val-a.val;});
  var slices=items.slice(0,10),otherVal=0;
  for(var o=10;o<items.length;o++)otherVal+=items[o].val;
  if(otherVal>0)slices.push({sym:"Others",val:otherVal});

  var cx=150,cy=150,rO=120,rI=70,gap=0.02,minAng=0.05;
  var angle=0,paths="";
  for(var s=0;s<slices.length;s++){
    var pct=slices[s].val/totVal;
    var sweep=Math.max(pct*Math.PI*2-gap,minAng);
    var sa=angle+gap/2,ea=angle+gap/2+sweep;
    paths+='<path d="'+ptfDonutArc(cx,cy,rO,rI,sa,ea)+'" fill="'+PTF_COLORS[s%PTF_COLORS.length]+'" opacity=".85"/>';
    angle+=pct*Math.PI*2;
  }
  // Center text on top of slices
  var center='<text x="'+cx+'" y="'+(cy-4)+'" fill="#94a3b8" font-size="9" text-anchor="middle" font-family="Inter,sans-serif">Total</text>';
  center+='<text x="'+cx+'" y="'+(cy+14)+'" fill="#e2e8f0" font-size="16" font-weight="600" text-anchor="middle" font-family="JetBrains Mono,monospace">$'+Math.round(totVal).toLocaleString()+'</text>';
  // Legend inside SVG right side
  var legend="";
  var col1x=290,col2x=355,startY=60;
  for(var lg=0;lg<slices.length;lg++){
    var sl=slices[lg],pc=(sl.val/totVal*100).toFixed(1);
    var lx=lg<6?col1x:col2x,ly=startY+(lg<6?lg:lg-6)*22;
    legend+='<circle cx="'+(lx)+'" cy="'+(ly-3)+'" r="4" fill="'+PTF_COLORS[lg%PTF_COLORS.length]+'"/>';
    legend+='<text x="'+(lx+8)+'" y="'+ly+'" fill="#94a3b8" font-size="9" font-family="Inter,sans-serif">'+sl.sym+' <tspan fill="#94a3b8">'+pc+'%</tspan></text>';
  }
  el.innerHTML='<svg viewBox="0 0 430 300" style="width:100%;height:auto">'+paths+center+legend+'</svg>';
  }catch(e){console.log("PTF alloc err:",e);}
}

// ═══ CYCLE SCENARIO SIMULATION ═══
function ptfCalcTarget(id,cur,scenario){
  if(id==="btc")return PTF_BTC_SCENARIOS[scenario];
  if(id==="eth")return PTF_BTC_SCENARIOS[scenario]*PTF_ETH_RATIO[scenario];
  var cat=PTF_CATEGORIES[id]||"mid";
  var mult=PTF_CYCLE_MULT[cat];
  var surv=PTF_SURVIVAL[cat];
  var adj=PTF_BTC_ADJUST[scenario];
  var raw=cur*mult[scenario]*adj;
  return raw*surv+cur*0.3*(1-surv);
}

function ptfSimRender(){
  try{
    if(!Array.isArray(ptfAssets)||ptfAssets.length===0)return;
    var rows=[],curVal=0,bearVal=0,baseVal=0,superVal=0;
    var items=[];
    for(var j=0;j<ptfAssets.length;j++){
      var a=ptfAssets[j],cur=ptfGetPrice(a);
      if(cur<=0)continue;
      var cat=PTF_CATEGORIES[a.id]||"mid";
      var tb=ptfSimTargets[a.id+"_bear"]||ptfCalcTarget(a.id,cur,"bear");
      var tbs=ptfSimTargets[a.id+"_base"]||ptfCalcTarget(a.id,cur,"base");
      var ts=ptfSimTargets[a.id+"_super"]||ptfCalcTarget(a.id,cur,"super");
      var cv=a.amount*cur;
      curVal+=cv;bearVal+=a.amount*tb;baseVal+=a.amount*tbs;superVal+=a.amount*ts;
      items.push({a:a,cur:cur,cat:cat,bear:tb,base:tbs,super:ts,baseVal:a.amount*tbs});
    }
    items.sort(function(x,y){return y.baseVal-x.baseVal;});
    var catLabels={large:"L",mid:"M",small:"S",spec:"?"};
    var catClrs={large:"var(--cy)",mid:"var(--g)",small:"var(--o)",spec:"var(--p)"};
    for(var i=0;i<items.length;i++){
      var it=items[i],a2=it.a;
      var isBtcEth=a2.id==="btc"||a2.id==="eth";
      var bg=isBtcEth?"background:rgba(34,211,238,.04);":"";
      var obear=ptfSimTargets[a2.id+"_bear"]?"✎ ":"";
      var obase=ptfSimTargets[a2.id+"_base"]?"✎ ":"";
      var osuper=ptfSimTargets[a2.id+"_super"]?"✎ ":"";
      rows.push('<tr style="'+bg+'"><td class="bld">'+a2.symbol+'<div style="font-size:8px;color:var(--dm)">'+a2.name+'</div></td>'+
        '<td><span class="tg" style="background:rgba(30,41,59,.4);color:'+catClrs[it.cat]+'">'+catLabels[it.cat]+'</span></td>'+
        '<td style="color:var(--dm)">$'+ptfFP(it.cur)+'</td>'+
        '<td style="color:var(--o)">'+obear+'$'+ptfFP(it.bear)+'<div style="font-size:8px;color:var(--dm)">×'+(it.bear/it.cur).toFixed(1)+'</div></td>'+
        '<td style="color:var(--g)">'+obase+'$'+ptfFP(it.base)+'<div style="font-size:8px;color:var(--dm)">×'+(it.base/it.cur).toFixed(1)+'</div></td>'+
        '<td style="color:var(--cy)">'+osuper+'$'+ptfFP(it.super)+'<div style="font-size:8px;color:var(--dm)">×'+(it.super/it.cur).toFixed(1)+'</div></td></tr>');
    }
    $("ptfSimTableB").innerHTML=rows.join("")||'<tr><td colspan="6" style="text-align:center;color:var(--dm);font-size:10px">Waiting for prices...</td></tr>';
    var bearM=curVal>0?bearVal/curVal:0,baseM=curVal>0?baseVal/curVal:0,superM=curVal>0?superVal/curVal:0;
    $("ptfSimSummary").innerHTML=
      MB("Current","$"+F(curVal,2),"var(--dm)")+
      MB("Bear","$"+F(bearVal,2)+" · "+bearM.toFixed(1)+"×","var(--o)")+
      MB("Base","$"+F(baseVal,2)+" · "+baseM.toFixed(1)+"×","var(--g)")+
      MB("Super","$"+F(superVal,2)+" · "+superM.toFixed(1)+"×","var(--cy)");
    // Override table
    var oRows="";
    for(var k=0;k<items.length;k++){
      var oi=items[k],oa=oi.a;
      oRows+='<tr><td class="bld">'+oa.symbol+'</td>'+
        '<td><input class="inp" type="number" step="any" value="'+(ptfSimTargets[oa.id+"_bear"]||oi.bear).toFixed(2)+'" oninput="ptfSimOverride(\''+oa.id+'\',\'bear\',this.value)" style="width:70px;font-size:10px"></td>'+
        '<td><input class="inp" type="number" step="any" value="'+(ptfSimTargets[oa.id+"_base"]||oi.base).toFixed(2)+'" oninput="ptfSimOverride(\''+oa.id+'\',\'base\',this.value)" style="width:70px;font-size:10px"></td>'+
        '<td><input class="inp" type="number" step="any" value="'+(ptfSimTargets[oa.id+"_super"]||oi.super).toFixed(2)+'" oninput="ptfSimOverride(\''+oa.id+'\',\'super\',this.value)" style="width:70px;font-size:10px"></td></tr>';
    }
    $("ptfSimOverrideB").innerHTML=oRows;
  }catch(e){console.log("ptfSim render err:",e);}
}

function ptfSimOverride(assetId,scenario,value){
  var price=parseFloat(value);
  if(price>0){ptfSimTargets[assetId+"_"+scenario]=price;}
  else{delete ptfSimTargets[assetId+"_"+scenario];}
  ptfSimSave();ptfSimRender();
}

// ═══ EXPORT / IMPORT ═══
var ptfPendingImport=null;
function ptfExport(){
  var st=$("ptfImportErr");
  try{
    var data={ptfKey:"43dcb5719607e92861ff",version:PTF_VERSION,exportDate:new Date().toISOString(),assets:ptfAssets,ledger:ptfLedger,targets:ptfSimTargets,snapshots:ptfSnapshots||[]};
    var json=JSON.stringify(data,null,2);
    if(st)st.innerHTML='<span style="color:var(--dm)">Sichere…</span>';
    // 1) Server-Backup (bewiesener Kanal — APK blockt Blob-Downloads)
    fetch("https://95-216-152-31.sslip.io/ptfbackup",{method:"POST",mode:"cors",body:json})
      .then(function(r){if(st)st.innerHTML=r.ok?'<span style="color:var(--g)">✓ Backup auf Server gespeichert ('+new Date().toLocaleString("de-DE",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})+')</span>':'<span style="color:var(--r)">Server-Backup fehlgeschlagen (HTTP '+r.status+')</span>';})
      .catch(function(e){if(st)st.innerHTML='<span style="color:var(--r)">Server-Backup fehlgeschlagen: '+((e&&e.message)||"Netz")+'</span>';});
    // 2) Zusätzlich in die Zwischenablage (zum Einfügen in Notiz/Mail)
    try{if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(json);}catch(e){}
    // 3) Datei-Download versuchen (funktioniert im Browser, nicht in der APK)
    try{
      var blob=new Blob([json],{type:"application/json"});
      var url=URL.createObjectURL(blob);
      var a=document.createElement("a");
      a.href=url;a.download="altcoin-portfolio-"+new Date().toISOString().split("T")[0]+".json";
      document.body.appendChild(a);a.click();document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }catch(e){}
  }catch(e){if(st)st.innerHTML='<span style="color:var(--r)">Export-Fehler: '+e.message+'</span>';}
}
function ptfRestoreServer(){
  var st=$("ptfImportErr");
  if(!confirm("Portfolio vom Server-Backup wiederherstellen? Überschreibt lokale Assets/Ledger."))return;
  fetch("https://95-216-152-31.sslip.io/ptfbackup",{mode:"cors"}).then(function(r){return r.json();}).then(function(data){
    if(!data||!data.assets||!Array.isArray(data.assets)){if(st)st.innerHTML='<span style="color:var(--r)">Kein gültiges Server-Backup gefunden</span>';return;}
    ptfAssets=data.assets;ptfLedger=data.ledger||[];ptfSimTargets=data.targets||{};ptfSnapshots=data.snapshots||[];
    ptfSave();try{renderPtf();}catch(e){}
    if(st)st.innerHTML='<span style="color:var(--g)">✓ Wiederhergestellt (Stand '+(data.serverSavedAt||data.exportDate||"?").slice(0,16)+', '+data.assets.length+' Assets)</span>';
  }).catch(function(e){if(st)st.innerHTML='<span style="color:var(--r)">Laden fehlgeschlagen: '+((e&&e.message)||"Netz")+'</span>';});
}
function ptfImport(){
  try{
    var input=document.createElement("input");
    input.type="file";input.accept=".json";
    input.onchange=function(){
      if(!input.files||!input.files[0])return;
      var reader=new FileReader();
      reader.onload=function(){
        try{
          var data=JSON.parse(reader.result);
          if(!data.assets||!Array.isArray(data.assets)){$("ptfImportErr").innerHTML='<span style="color:var(--r)">Invalid file: missing assets array</span>';return;}
          for(var i=0;i<data.assets.length;i++){
            var a=data.assets[i];
            if(!a.id||!a.symbol||typeof a.amount==="undefined"){$("ptfImportErr").innerHTML='<span style="color:var(--r)">Invalid asset at index '+i+'</span>';return;}
          }
          ptfPendingImport=data;
          $("ptfImportErr").innerHTML='<span style="color:var(--o)">Import '+data.assets.length+' assets and '+(data.ledger?data.ledger.length:0)+' ledger entries? <button class="btn" onclick="ptfImportConfirm()" style="font-size:9px">Confirm</button></span>';
        }catch(e2){$("ptfImportErr").innerHTML='<span style="color:var(--r)">Invalid JSON file</span>';}
      };
      reader.readAsText(input.files[0]);
    };
    input.click();
  }catch(e){console.log("PTF import err:",e);}
}

function ptfImportConfirm(){
  try{
    if(!ptfPendingImport)return;
    ptfAssets=ptfPendingImport.assets;
    ptfLedger=ptfPendingImport.ledger||[];
    ptfSimTargets=ptfPendingImport.targets||{};
    ptfSnapshots=ptfPendingImport.snapshots||[];
    ptfSave();
    try{localStorage.setItem("ptf_snapshots",JSON.stringify(ptfSnapshots));}catch(e){}
    try{localStorage.setItem("ptf_targets",JSON.stringify(ptfSimTargets));}catch(e){}
    ptfPendingImport=null;
    $("ptfImportErr").innerHTML='<span style="color:var(--g)">Imported successfully!</span>';
    ptfRenderTable();ptfRenderLedger();
  }catch(e){console.log("PTF importConfirm err:",e);}
}

// ═══ START ═══
var _refreshId=null,_refreshCount=0;
function startRefresh(){
  if(_refreshId)clearInterval(_refreshId);
  _refreshId=setInterval(function(){if(document.hidden)return;_refreshCount++;
    if(TAB==="auto")go();fetchSt();fetchSup();fetchTrades();fetchWal();
    if(_refreshCount%5===0){fetchLPs();try{ptfFetchPrices();ptfDetectBalances();}catch(e){}}
    if(_refreshCount%5===0){try{ptfDetectLedgerBalances();}catch(e){}}
    // Auto LP Map scan every 5 min (5 × 60s)
    if(_refreshCount%5===0){try{scanLiqMap();}catch(e){}}
    // Sync portfolio to Hetzner for push alerts
    if(_refreshCount%5===0){try{syncPortfolioToServer();}catch(e){}}
    if(_refreshCount%60===0){try{fetchBurn30d();}catch(e){}}
    // Check portfolio value alerts
    saveOffline();updateSysStatus();},60000);
}

function updateSysStatus(){
  var rpcOk=rpcFails[rpcIdx]<3,apiOk=P>0&&SRC!=="",walOk=wal.ok||MY_BURN>0;
  var parts=["RPC:"+(rpcOk?"<span style='color:var(--g)'>OK</span>":"<span style='color:var(--r)'>FAIL</span>"),
    "API:"+(apiOk?"<span style='color:var(--g)'>OK</span>":"<span style='color:var(--o)'>"+SRC+"</span>"),
    "WAL:"+(walOk?"<span style='color:var(--g)'>OK</span>":"<span style='color:var(--dm)'>…</span>"),
    "LP:"+(lpLive?"<span style='color:var(--g)'>LIVE</span>":"<span style='color:var(--o)'>static</span>")];
  $("foot").innerHTML="My Crypto Portfolio · "+new Date().toLocaleTimeString()+" · "+parts.join(" · ");
}

loadOffline();
if(tradeCacheLoad()){try{renderTrades();}catch(e){}}
ptfLoad();
try{ptfLoadTotalSeries();setInterval(ptfLoadTotalSeries,300000);}catch(e){}
// ── ONE-TIME ETH COST-BASIS FIX (v3 — verified against full timeline) ──
// Reconstruction (verified to 4 decimals): app amount 1.401147 = code-default 0.856702 (which
// ALREADY includes the May-3 buy) + the 4 ledger-tracked June buys (0.5112) + the small Jun-29
// buy 0.0333 that entered the AMOUNT but never got its cost booked. So exactly ONE buy's cost
// is missing: $58.21. Correct total = $2888.21 → avgEntry ≈ $2061 (down from the old $2344 —
// the cheap June buys DID pull the average down; the app's $2020 was slightly TOO low).
try{
  if(localStorage.getItem("eth_cost_fix_v4")!=="1"){
    for(var _ei=0;_ei<ptfAssets.length;_ei++){
      if(ptfAssets[_ei].id==="eth"){
        var _e=ptfAssets[_ei];
        // DYNAMIC rebuild from the ledger (robust against any prior wrong fix and against new
        // buys booked meanwhile): verified pre-June base $2008.50 (0.856702 ETH @ ~$2344, incl.
        // the May-3 buy) + every ETH buy booked in the cost-basis ledger + the ONE un-booked
        // Jun-29 buy ($58.21 — its amount was absorbed on-chain but its cost never was).
        var _ledgerSum=0;
        try{for(var _li=0;_li<ptfLedger.length;_li++){var _le=ptfLedger[_li];
          if(_le&&(_le.asset+"").toLowerCase()==="eth"&&_le.total>0)_ledgerSum+=_le.total;}}catch(e){}
        _e.totalCost=2008.50+_ledgerSum+58.21;
        if(_e.amount>0)_e.avgEntry=_e.totalCost/_e.amount;
        console.log("ETH fix v4: ledgerSum=$"+_ledgerSum.toFixed(2)+" → totalCost=$"+_e.totalCost.toFixed(2)+", avgEntry=$"+_e.avgEntry.toFixed(2));
        break;
      }
    }
    localStorage.setItem("eth_cost_fix_v4","1");
    // Neutralize all earlier fix flags so none can apply on any device state.
    try{localStorage.setItem("eth_cost_fix_20260703","1");}catch(e){}
    try{localStorage.setItem("eth_cost_rebuild_v2","1");}catch(e){}
    try{localStorage.setItem("eth_cost_fix_v3","1");}catch(e){}
    try{ptfSave();}catch(e){}
  }
}catch(e){console.log("eth cost fix v4 err:",e.message);}
// ── ONE-TIME SNAPSHOT SPIKE CLEANUP ──
// The value timeline had spikes from the ETH amount flapping between the stored (0.857) and
// on-chain (1.401) reading — single snapshots ~$940 above the baseline, then back. Those are
// artifacts, not real value moves. Remove SINGLE-POINT outliers: a point that deviates >15%
// from BOTH neighbors while the neighbors agree with each other (<10% apart). A genuine level
// change (like the final, correct jump to $4.4k) keeps its new level across many points and is
// therefore NOT removed. Runs once.
try{
  if(localStorage.getItem("snap_spike_clean_v1")!=="1"&&ptfSnapshots&&ptfSnapshots.length>4){
    var _cleaned=[],_removed=0;
    for(var _si=0;_si<ptfSnapshots.length;_si++){
      var _cur=ptfSnapshots[_si];
      var _cv=Array.isArray(_cur)?_cur[1]:_cur.v;
      var _pv=null,_nv=null;
      if(_si>0){var _p=ptfSnapshots[_si-1];_pv=Array.isArray(_p)?_p[1]:_p.v;}
      if(_si<ptfSnapshots.length-1){var _n=ptfSnapshots[_si+1];_nv=Array.isArray(_n)?_n[1]:_n.v;}
      var _isSpike=false;
      if(_pv&&_nv&&_pv>0&&_nv>0){
        var _dP=Math.abs(_cv-_pv)/_pv, _dN=Math.abs(_cv-_nv)/_nv, _dPN=Math.abs(_pv-_nv)/_pv;
        if(_dP>0.15&&_dN>0.15&&_dPN<0.10)_isSpike=true;
      }
      if(_isSpike){_removed++;}else{_cleaned.push(_cur);}
    }
    if(_removed>0){
      ptfSnapshots=_cleaned;
      try{localStorage.setItem("ptf_snapshots",JSON.stringify(ptfSnapshots));}catch(e){}
      console.log("Snapshot cleanup: removed "+_removed+" spike artifacts");
    }
    localStorage.setItem("snap_spike_clean_v1","1");
  }
}catch(e){console.log("snap cleanup err:",e.message);}
// One-time BTC migration v4: HARD RESET — recreates BTC asset if missing, clears all BTC ledger entries, sets clean state
try{
  var migrated=localStorage.getItem("btc_migration_v4");
  if(!migrated){
    var btcA=null,btcIdx=-1;
    for(var bi=0;bi<ptfAssets.length;bi++){if(ptfAssets[bi].id==="btc"){btcA=ptfAssets[bi];btcIdx=bi;break;}}
    // 1. If BTC asset is missing → recreate it from PTF_DEFAULTS
    if(!btcA){
      btcA={id:"btc",symbol:"BTC",name:"Bitcoin",geckoId:"bitcoin",amount:0,avgEntry:0,totalCost:0,source:"ledger",decimals:8,contract:null};
      // Insert at same position as in PTF_DEFAULTS (after AR, before TIA)
      var insertPos=ptfAssets.length;
      for(var ai=0;ai<ptfAssets.length;ai++){if(ptfAssets[ai].id==="ar"){insertPos=ai+1;break;}}
      ptfAssets.splice(insertPos,0,btcA);
      console.log("BTC migration v4: BTC asset was MISSING — recreated");
    }
    // 2. Remove ALL existing BTC entries from ledger
    var beforeCount=ptfLedger.length;
    ptfLedger=ptfLedger.filter(function(e){return e.asset!=="btc";});
    var removed=beforeCount-ptfLedger.length;
    // 3. Add ONE clean Pre-existing holdings entry
    ptfLedger.unshift({
      id:"ptx_pre_btc",asset:"btc",amount:0.00692908,price:68000,total:471.18,
      date:"2024-01-01",wallet:"Ledger",note:"Pre-existing holdings"
    });
    // 4. Add the buy from 2026-05-03
    var newBuyAmt=0.00075;var newBuyCost=58.50;
    ptfLedger.push({
      id:"ptx_buy_20260503",asset:"btc",amount:newBuyAmt,price:newBuyCost/newBuyAmt,total:newBuyCost,
      date:"2026-05-03",wallet:"Ledger",note:"Bitpanda buy"
    });
    // 5. Recalc asset from clean ledger
    var allBtc=ptfLedger.filter(function(e){return e.asset==="btc";});
    var finalAmt=0,finalCost=0;
    for(var bk=0;bk<allBtc.length;bk++){finalAmt+=allBtc[bk].amount;finalCost+=allBtc[bk].total;}
    btcA.amount=finalAmt;
    btcA.totalCost=finalCost;
    btcA.avgEntry=finalCost/finalAmt;
    ptfSave();
    console.log("BTC migration v4 (HARD RESET): removed "+removed+" old entries, set: "+finalAmt.toFixed(8)+" BTC, avg $"+btcA.avgEntry.toFixed(2)+", cost $"+finalCost.toFixed(2));
    localStorage.setItem("btc_migration_v4","done");
  }
}catch(e){console.log("BTC migration error:",e);}
// One-time ETH double-book fix (08.07.2026): the detection banner AND the pending-price prompt
// both booked the same ~0.13-ETH deposit @ $1740 (banner $226.50 + prompt $223.75 = observed +$450
// cost jump for +0.1302 ETH). Remove the prompt's duplicate $223.75; the banner booking stays.
// Guard: only fires while cost still carries the duplicate (>$3,200). NEVER touches ptfLedger.
try{
  if(localStorage.getItem("eth_double_book_fix_v1")!=="1"){
    var _edf=null;for(var _ei=0;_ei<ptfAssets.length;_ei++){if(ptfAssets[_ei].id==="eth"){_edf=ptfAssets[_ei];break;}}
    if(_edf&&_edf.totalCost>3200&&_edf.amount>1.4){
      var _old=_edf.totalCost;
      _edf.totalCost=_edf.totalCost-223.75;
      if(_edf.amount>0)_edf.avgEntry=_edf.totalCost/_edf.amount;
      ptfSave();
      console.log("ETH double-book fix v1: cost $"+_old.toFixed(2)+" → $"+_edf.totalCost.toFixed(2)+", avg $"+_edf.avgEntry.toFixed(2));
    }
    localStorage.setItem("eth_double_book_fix_v1","1");
  }
}catch(e){console.log("eth double-book fix err:",e);}
// One-time BTC migration v5: fix amount that was overwritten by ptfDetectBalances after v4
try{
  var migratedV5=localStorage.getItem("btc_migration_v5");
  if(!migratedV5){
    var btcA5=null;
    for(var bi5=0;bi5<ptfAssets.length;bi5++){if(ptfAssets[bi5].id==="btc"){btcA5=ptfAssets[bi5];break;}}
    if(btcA5){
      // Recompute from existing ledger entries (Migration v4 already created clean ledger)
      var allBtc5=ptfLedger.filter(function(e){return e.asset==="btc";});
      var fAmt=0,fCost=0;
      for(var bk5=0;bk5<allBtc5.length;bk5++){fAmt+=allBtc5[bk5].amount;fCost+=allBtc5[bk5].total;}
      if(fAmt>0){
        btcA5.amount=fAmt;
        btcA5.totalCost=fCost;
        btcA5.avgEntry=fCost/fAmt;
        // Also reset ptfLastBalances.btc so detection won't override
        if(typeof ptfLastBalances!=="undefined")ptfLastBalances.btc=fAmt;
        try{localStorage.setItem("ptf_last_balances",JSON.stringify(ptfLastBalances));}catch(e){}
        ptfSave();
        console.log("BTC migration v5: re-fixed amount to "+fAmt.toFixed(8)+" BTC, cost $"+fCost.toFixed(2));
      }
    }
    localStorage.setItem("btc_migration_v5","done");
  }
}catch(e){console.log("BTC migration v5 err:",e);}
ptfRenderTable();ptfRenderLedger();ptfUpdateDropdown();
try{$("ptfBuyDate").value=new Date().toISOString().split("T")[0];}catch(e){}
go(); fetchSt(); fetchSup(); fetchTrades(); fetchWal(); fetchLPs();
fetchBurn30d().then(function(){if(P>0)try{render();}catch(e){}});
try{var savedExtra=localStorage.getItem("lmap_extra");if(savedExtra&&$("lmapExtra"))$("lmapExtra").value=savedExtra;}catch(e){}
// Restore cached raw ranges + curTick so trade simulator / market analysis use exact V3
// tick-liquidity immediately at app start (instead of V2 fallback until manual rescan).
try{
  var rcacheRaw=localStorage.getItem("lmap_ranges");
  if(rcacheRaw){
    var rcache=JSON.parse(rcacheRaw);
    if(rcache&&rcache.ranges&&rcache.ranges.length>0){
      window._lmapRanges=rcache.ranges;
      window._lmapCurTick=rcache.curTick;
      console.log("LMAP: restored "+rcache.ranges.length+" ranges for V3 simulator (curTick "+rcache.curTick+")");
      // Re-render market analysis so Buyflow + Sell Impact tables use V3 (not V2) right away
      try{if(P>0&&typeof render==="function")render();}catch(e){}
    }
  }
}catch(e){}
// Restore cached pool reserves so the Liquidity-Heatmap is correctly calibrated at app start
// (without this the bars fall back to relative scaling after every restart — Audit M7).
try{
  var rsvRaw=localStorage.getItem("lmap_reserves");
  if(rsvRaw){var rsv=JSON.parse(rsvRaw);if(rsv&&rsv.aB>0&&rsv.aU>0){window._poolAB=rsv.aB;window._poolAU=rsv.aU;if(rsv.p>0)window._lmapP=rsv.p;}}
}catch(e){}
// Load cached buckets so V3 buyflow works immediately at app start (before scan completes)
try{
  var bcacheRaw=localStorage.getItem("lmap_buckets");
  if(bcacheRaw){
    var bcache=JSON.parse(bcacheRaw);
    if(bcache&&bcache.buckets&&bcache.buckets.length>0){
      lmapCache=bcache.buckets;
      lmapTs=bcache.ts||0;
      var cacheAgeMin=lmapTs?Math.round((Date.now()-lmapTs)/60000):999;
      console.log("LMAP: cached "+bcache.buckets.length+" buckets, age "+cacheAgeMin+" min");
      // Render strategy: <5min instant, 5-30min with "updating" hint, >30min show loading
      if(cacheAgeMin<5){
        try{if(typeof renderLmap==="function")renderLmap(lmapCache);}catch(e){console.log("init renderLmap err:",e.message);}
      }else if(cacheAgeMin<=30){
        try{
          if(typeof renderLmap==="function")renderLmap(lmapCache);
          if($("lmapStatus"))$("lmapStatus").innerHTML='<span style="color:var(--o)">⟳ Updating ('+cacheAgeMin+'min old cache shown)…</span>';
        }catch(e){console.log("init renderLmap err:",e.message);}
      }else{
        // Stale cache — don't render, show loading instead
        if($("lmapB"))$("lmapB").innerHTML='<tr><td colspan="6" style="color:var(--dm);text-align:center;padding:14px">Loading fresh scan… (cache '+cacheAgeMin+'min old)</td></tr>';
        if($("lmapStatus"))$("lmapStatus").textContent="Scanning…";
      }
    }
  }
}catch(e){console.log("LMAP cache load err:",e.message);}
try{ptfFetchPrices();ptfDetectBalances();ptfDetectLedgerBalances();}catch(e){}
// Smart cost-basis repair at app start. Multi-level strategy:
//   1. Recalculate avgEntry/totalCost from ptfLedger entries (case-insensitive)
//   2. If ledger has fewer entries than expected OR repaired totalCost is much smaller
//      than PTF_DEFAULTS.totalCost, prefer the PTF_DEFAULTS value (these are the audited
//      historical entry prices from when the app was first set up).
//   3. Never zero-out totalCost or avgEntry — preserves user's investment record.
// This fixes positions corrupted by the DCA case-mismatch bug (where amount got
// updated but avgEntry didn't, causing huge phantom gains).
try{
  if(typeof ptfAssets!=="undefined"){
    var repaired=0,restored=0;
    // Build PTF_DEFAULTS lookup
    var defaultsById={};
    if(typeof PTF_DEFAULTS!=="undefined"){
      for(var di=0;di<PTF_DEFAULTS.length;di++){defaultsById[PTF_DEFAULTS[di].id]=PTF_DEFAULTS[di];}
    }
    for(var ri=0;ri<ptfAssets.length;ri++){
      var ra=ptfAssets[ri];if(!ra.id)continue;
      var raLow=ra.id.toLowerCase();
      var def=defaultsById[ra.id]||defaultsById[raLow]||null;
      // Step 1: Compute from ledger
      var rentries=(ptfLedger||[]).filter(function(e){return (e.asset||"").toLowerCase()===raLow;});
      var rSumCost=0,rSumAmt=0;
      for(var rj=0;rj<rentries.length;rj++){rSumCost+=(rentries[rj].total||0);rSumAmt+=(rentries[rj].amount||0);}
      var ledgerAvg=rSumAmt>0?rSumCost/rSumAmt:0;
      // Step 2: Decide which source to use
      var oldAvg=ra.avgEntry||0,oldCost=ra.totalCost||0;
      var newAvg=oldAvg,newCost=oldCost,reason="";
      // Case A: Asset has reasonable existing values → keep them (idempotent)
      // Case B: Asset has BROKEN values (totalCost much smaller than default → corruption)
      var isBroken=false;
      if(def&&def.totalCost){
        // If current totalCost is < 30% of default and amount is similar → CORRUPTION
        var amtRatio=def.amount?ra.amount/def.amount:1;
        if(oldCost>0&&oldCost<def.totalCost*0.3&&amtRatio>0.5){isBroken=true;reason="corrupted (cost "+oldCost.toFixed(2)+" vs default "+def.totalCost.toFixed(2)+")";}
        // If avgEntry is suspiciously off (>50% off from default) and amount matches → corruption
        if(!isBroken&&oldAvg>0&&def.avgEntry&&Math.abs(oldAvg-def.avgEntry)/def.avgEntry>0.5&&amtRatio>0.5){isBroken=true;reason="avgEntry drifted (was "+oldAvg.toFixed(4)+" vs default "+def.avgEntry.toFixed(4)+")";}
      }
      if(isBroken&&def){
        // CORRUPTION DETECTED — combine DEFAULTS (baseline) + LEDGER (subsequent DCA buys).
        // Defaults represent everything before the app started tracking precisely.
        // Ledger entries are user-confirmed buys recorded SINCE then.
        // To avoid double-counting, only include ledger entries with non-"Initial" notes.
        var ledgerExtraAmt=0,ledgerExtraCost=0,ledgerExtraCount=0;
        for(var lj=0;lj<rentries.length;lj++){
          var le=rentries[lj];
          // Skip entries that look like the initial seed (matches default amount+price closely)
          if(le.note==="Initial")continue;
          if(def.amount&&Math.abs((le.amount||0)-def.amount)/def.amount<0.05&&def.avgEntry&&Math.abs((le.price||0)-def.avgEntry)/def.avgEntry<0.05)continue;
          ledgerExtraAmt+=(le.amount||0);
          ledgerExtraCost+=(le.total||0);
          ledgerExtraCount++;
        }
        var combinedAmt=def.amount+ledgerExtraAmt;
        var combinedCost=def.totalCost+ledgerExtraCost;
        var combinedAvg=combinedAmt>0?combinedCost/combinedAmt:def.avgEntry;
        ra.avgEntry=combinedAvg;ra.totalCost=combinedCost;
        restored++;
        console.log("PTF restore: "+ra.id+" "+reason+" → defaults ($"+def.totalCost.toFixed(2)+", "+def.amount+") + "+ledgerExtraCount+" DCA ledger entries ($"+ledgerExtraCost.toFixed(2)+", "+ledgerExtraAmt.toFixed(4)+") = avgEntry $"+combinedAvg.toFixed(2)+", totalCost $"+combinedCost.toFixed(2));
      }else if(rSumAmt>0&&ledgerAvg>0){
        // Ledger has data and asset doesn't look broken → use ledger only if it's MORE than current
        // (additive: user may have added entries; don't reduce a known-good totalCost)
        if(rSumCost>oldCost*1.05){
          ra.avgEntry=ledgerAvg;ra.totalCost=rSumCost;
          repaired++;
          console.log("PTF repair: "+ra.id+" avgEntry "+oldAvg.toFixed(4)+"→"+ledgerAvg.toFixed(4)+", totalCost "+oldCost.toFixed(2)+"→"+rSumCost.toFixed(2)+" (from "+rentries.length+" ledger entries)");
        }
      }
    }
    if(repaired>0||restored>0){
      try{ptfSave();}catch(e){}
      console.log("PTF repair complete: "+repaired+" recalculated from ledger, "+restored+" restored from defaults");
    }
  }
}catch(e){console.log("PTF repair err:",e.message);}
// Steuer-Modul v2: Server-Ledger laden
setTimeout(function(){try{taxLoad();}catch(e){console.log("taxLoad err:",e);}},4000);
// Auto-scan LP Map immediately at startup (force fresh, ignore cache age)
try{lmapTs=0;scanLiqMap();}catch(e){console.log("init scanLiqMap err:",e.message);}
try{renderLpEvents();}catch(e){}
setTimeout(function(){try{syncPortfolioToServer();}catch(e){}},15000);
setTimeout(function(){try{fetchServerWalletState();}catch(e){}},5000);
// Pull the master addressbook from the server on startup (single source of truth).
setTimeout(function(){try{syncAddrBookFromServer();}catch(e){}},2500);
// Ask for any un-priced buys (deposits detected earlier) — keeps asking each start until filled in.
setTimeout(function(){try{if(pendingPrices&&pendingPrices.length)processPendingPrices();}catch(e){}},8000);
// One-time ETH cost-basis reconcile: if the on-chain ETH amount exceeds the amount we actually
// have a purchase price for (totalCost/avgEntry), there's an un-priced deposit (e.g. a transfer in
// that the live detection missed). Queue it so the app asks for the price — and keeps asking.
setTimeout(function(){try{
  if(localStorage.getItem("eth_reconcile_done")==="1")return;
  var eth=null;for(var i=0;i<ptfAssets.length;i++){if(ptfAssets[i].id==="eth"){eth=ptfAssets[i];break;}}
  if(!eth||!(eth.amount>0))return;
  var pricedAmount=(eth.avgEntry>0)?(eth.totalCost/eth.avgEntry):0;
  var unpriced=eth.amount-pricedAmount;
  // Only if there's a meaningful un-priced chunk (>0.5% and >0.001 ETH).
  if(unpriced>0.001&&unpriced>eth.amount*0.005){
    var already=false;for(var j=0;j<pendingPrices.length;j++){if(pendingPrices[j].symbol==="ETH")already=true;}
    if(!already){queuePendingPrice("ETH",unpriced,"");console.log("ETH reconcile: queued "+unpriced.toFixed(6)+" un-priced ETH");}
    setTimeout(function(){try{processPendingPrices();}catch(e){}},2000);
  }
  localStorage.setItem("eth_reconcile_done","1");
}catch(e){console.log("eth reconcile err:",e.message);}},11000);
// Auto-sync FCM token to Hetzner on startup (silent, only if token exists & changed since last sync)
setTimeout(function(){
  try{
    var fcm=localStorage.getItem("fcm_token");
    if(!fcm)return;
    var lastSynced=localStorage.getItem("fcm_synced_value");
    if(lastSynced===fcm)return; // already synced this exact token, skip
    fetch(FCM_REGISTER_URL,{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({token:fcm,ts:Date.now()})}).then(function(r){
      if(r.ok){
        try{localStorage.setItem("fcm_synced_value",fcm);localStorage.setItem("fcm_synced_ts",Date.now().toString());}catch(e){}
        console.log("FCM auto-synced to Hetzner");
        try{renderPushStatus();}catch(e){}
      }
    }).catch(function(e){console.log("FCM auto-sync skipped:",e.message);});
  }catch(e){}
},8000);
// ═══ HOODIE (Robinhood Chain, Uniswap V4) ═══
// Verified 08.07.2026: chainId 4663, decimals 18, CORS ok (RPC + GT API).
var RH_RPC="https://95-216-152-31.sslip.io/rhrpc"; // RH-RPC via eigenen Caddy-Proxy (Original blockt Mobile-Clients; VPS-Route bewiesen)
var HOODIE_TK="0x91b7304099f0be58029fb4269ad6aa0bf601e666";
var HOODIE_GT="https://api.geckoterminal.com/api/v2/networks/robinhood/pools/0x9286edc5798ca4e2279297d27bf5edfc9b639c94c772303b0d62e434785cba19";
var HOODIE_CHART="https://www.geckoterminal.com/robinhood/pools/0x9286edc5798ca4e2279297d27bf5edfc9b639c94c772303b0d62e434785cba19";
var W_HOODIE="0x6E37Cc7D415466909db6102b6Dc34473AC1bb500"; // Noah Alt (…b500)
var _hd={px:0,chg:0,vol:0,bal:0,ts:0};
try{var _hdc=JSON.parse(localStorage.getItem("hd_cache")||"null");if(_hdc&&_hdc.px>0)_hd=_hdc;}catch(e){}
// ═══ NOAHS HOODIE-SICHT: 3 Wallets, eigene LPs, Next-Fill, P&L-Anteil ═══
var MY_HD_WALLETS=[
  "0x6e37cc7d415466909db6102b6dc34473ac1bb500", // Noah Alt (b500)
  "0x505042ff781ea1689e44e1d200efd691c30db86c", // Noah DeFi (86C) — signiert die LPs
  "0x9ffa190b0d2543f35dfa1a2955bc2f4c544871d2"  // Noah Ledger (Hodl 45M)
];
window._hdMy={eth:0,hd:0,ready:false};
function hdMyPositions(){
  var out=[],lps=_hdScan.lps||[];
  for(var i=0;i<lps.length;i++){
    var p=lps[i];
    if(p.liq>1&&MY_HD_WALLETS.indexOf((p.w||"").toLowerCase())>=0)out.push(p);
  }
  return out;
}
function hdRenderMine(){
  var el=$("hdMyLps");
  var eU=_hd.ethUsd||0,px=_hd.px||0,tick=hdTick();
  var mine=hdMyPositions();
  window._hdMy={eth:0,hd:0,ready:(tick!==null&&eU>0)};
  if(!el)return;
  if(!mine.length||tick===null||!(eU>0)){
    el.innerHTML=mine.length?'<div style="font-size:10px;color:var(--dm);margin-top:8px">🧥 HOODIE-LPs: Preise laden…</div>':"";
    return;
  }
  var rows="";
  for(var i=0;i<mine.length;i++){
    var p=mine[i];
    var spL=Math.pow(1.0001,p.tL/2),spU=Math.pow(1.0001,p.tU/2);
    var tc=Math.min(Math.max(tick,p.tL),p.tU);
    var sp=Math.pow(1.0001,tc/2);
    var hd=p.liq*(sp-spL)/1e18,eth=p.liq*(1/sp-1/spU)/1e18;
    if(!isFinite(hd)||hd<0)hd=0;if(!isFinite(eth)||eth<0)eth=0;
    window._hdMy.eth+=eth*eU;window._hdMy.hd+=hd;
    var fill=(spU-spL)>0?(1-(sp-spL)/(spU-spL))*100:0;
    var pLo=eU/Math.pow(1.0001,p.tU),pHi=eU/Math.pow(1.0001,p.tL);
    var inR=(tick>p.tL&&tick<p.tU);
    rows+='<tr'+(inR?' style="background:rgba(52,211,153,.06)"':'')+'>'
      +'<td style="font-size:10px">'+(inR?'► ':'')+'$'+pLo.toPrecision(3)+'–$'+pHi.toPrecision(3)+'</td>'
      +'<td style="color:var(--g)">'+F(hd,0)+'</td>'
      +'<td style="color:var(--cy)">$'+F(eth*eU,0)+'</td>'
      +'<td style="color:'+(fill>50?'var(--warn)':'var(--dm)')+'">'+fill.toFixed(0)+'%</td></tr>';
  }
  el.innerHTML='<div class="lb" style="margin-top:12px">🧥 MEINE HOODIE LPs ('+mine.length+')</div>'
    +'<div class="ov"><table class="lp-tbl"><thead><tr><th>Range</th><th>HD Left</th><th>ETH ($)</th><th>Fill</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
}
function hdRenderNextFill(){
  var el=$("nextFillHd");if(!el)return;
  var eU=_hd.ethUsd||0,px=_hd.px||0,tick=hdTick();
  var mine=hdMyPositions();
  if(!mine.length){el.innerHTML='<span style="color:var(--dm);font-size:11px">🧥 HOODIE: keine aktiven LPs — Leiter legen, wenn der nächste Zyklus startet</span>';return;}
  if(tick===null||!(eU>0&&px>0)){el.innerHTML='<span style="color:var(--dm);font-size:11px">🧥 HOODIE Next Fill: Preise laden…</span>';return;}
  // "Nächste" Position: in-range zuerst, sonst die mit der niedrigsten Untergrenze über dem Preis
  var cand=null;
  for(var i=0;i<mine.length;i++){
    var p=mine[i];
    var inR=(tick>p.tL&&tick<p.tU);
    if(inR){cand=p;break;}
    if(tick>=p.tU){ // Range liegt komplett über dem Preis
      if(!cand||p.tU>cand.tU)cand=p; // höchster tU = niedrigster USD-Startpreis
    }
  }
  if(!cand){el.innerHTML='<span style="color:var(--g);font-size:11px">🧥 Alle HOODIE-LPs voll gefüllt ✓</span>';return;}
  var spL=Math.pow(1.0001,cand.tL/2),spU=Math.pow(1.0001,cand.tU/2);
  var tc=Math.min(Math.max(tick,cand.tL),cand.tU);
  var sp=Math.pow(1.0001,tc/2);
  var fill=(spU-spL)>0?(1-(sp-spL)/(spU-spL))*100:0;
  var pTop=eU/Math.pow(1.0001,cand.tL);
  var ethRemain=cand.liq*(1/spL-1/sp)/1e18*eU; if(!isFinite(ethRemain)||ethRemain<0)ethRemain=0;
  var pr=hdPressure(cand.tL); // Pool-Kaufdruck bis Range-Oberkante (alle LPs)
  var press=pr?pr.eth*eU:0;
  el.innerHTML='Next Fill 🧥: <b style="color:var(--g)">$'+pTop.toPrecision(3)+'</b> (↑'+((pTop/px-1)*100).toFixed(0)+'%) · <span style="color:var(--cy)">'+fill.toFixed(0)+'% gefüllt</span>'
    +'<div style="font-size:11px;margin-top:6px">➜ Ertrag bis voll: <b style="color:var(--g)">$'+F(ethRemain,0)+'</b> · Pool-Kaufdruck bis dahin: <b style="color:var(--p)">$'+F(press,0)+'</b></div>';
}
function hdFmtPx(p){if(!(p>0))return"—";return p<0.001?"$"+p.toPrecision(4):"$"+p.toFixed(4);}
// Kostenbasis (on-chain, 08.07.2026): Kauf 426.512.167 HD für 0,1699 ETH, Verkauf 106.628.042 HD für +0,1286 ETH,
// 150M versendet (Airdrop-Verteilung). Netto 0,0413 ETH ≈ $72 @ ~$1.750 für den Restbestand.
var HD_COST_USD=72;
function renderHoodie(){
  try{
    var o=$("hdPrice");
    if(o)o.innerHTML=_hd.px>0?hdFmtPx(_hd.px):'<span class="skel" style="width:80px;height:18px"></span>';
    var s=$("hdPriceSub");
    if(s){var c=_hd.chg;
      s.innerHTML=(_hd.px>0&&isFinite(c)&&c!==0)?('<span style="color:'+(c>=0?"var(--g)":"var(--r)")+'">'+(c>=0?"+":"")+(Math.abs(c)>=1000?F(c,0):c.toFixed(1))+'% 24h</span>'):"Robinhood";}
    var b=$("hdBody");
    if(b&&(_hd.px>0||_hd.bal>0)){
      var val=_hd.bal*_hd.px;
      var pnl=val-HD_COST_USD,mult=HD_COST_USD>0?val/HD_COST_USD:0;
      var entry=_hd.bal>0?HD_COST_USD/_hd.bal:0;
      // REALER WERT: Buchwert ist Kurs×Menge — entnehmbar ist nur die ETH-Seite des Pools.
      // Exit-Erlös bei "alles in den Pool verkaufen" (constant product): ethSide × bal/(bal+poolHd).
      var poolHd=_hd.pool||0;
      var ethSideUsd=Math.max(0,(_hd.resUsd||0)-poolHd*_hd.px);
      var realExit=(poolHd>0&&_hd.bal>0&&ethSideUsd>0)?ethSideUsd*_hd.bal/(_hd.bal+poolHd):0;
      var realPnl=realExit-HD_COST_USD,realMult=(HD_COST_USD>0&&realExit>0)?realExit/HD_COST_USD:0;
      b.innerHTML='<div style="display:flex;gap:8px;flex-wrap:wrap">'
        +MB("Bestand (3 Wallets)",_hd.bal>0?F(_hd.bal,0):"—","var(--g)")
        +MB("Buchwert",val>0?"$"+F(val,0):"—","var(--g)")
        +MB("Realer Exit (alles)",realExit>0?"~$"+F(realExit,0)+" ("+F(realMult,0)+"×)":"—","var(--warn)")
        +MB("Pool-ETH-Seite",ethSideUsd>0?"$"+F(ethSideUsd,0):"—","var(--cy)")
        +MB("Preis",hdFmtPx(_hd.px),"var(--cy)")
        +MB("P&L Buch",(val>0?(pnl>=0?"+":"−")+"$"+F(Math.abs(pnl),0)+" ("+F(mult,0)+"×)":"—"),pnl>=0?"var(--g)":"var(--r)")
        +MB("Einstand",entry>0?"$"+entry.toPrecision(2):"—","var(--dm)")
        +MB("24h Vol",_hd.vol>0?"$"+F(_hd.vol,0):"—","var(--dm)")
        +MB("🔥 Verbrannt",(_hd.dead>0?F(_hd.dead,0)+" ("+(_hd.dead/1e9*100).toFixed(1)+"%)":"—"),"var(--o)")
        +'</div>'
        +'<div style="font-size:9px;color:var(--dm);margin-top:8px">Netto-Einsatz ~$'+HD_COST_USD+' (0,0413 ETH) · Pool gesamt $'+F(_hd.resUsd||0,0)+' · HOODIE/WETH 0,3% · Uniswap V4 · <a href="'+HOODIE_CHART+'" target="_blank" style="color:var(--cy)">Chart auf GeckoTerminal</a>'
        +(_hd.ts?' · Stand '+new Date(_hd.ts).toLocaleTimeString().slice(0,5):'')+'</div>';
    }
  }catch(e){console.log("renderHoodie err:",e&&e.message);}
}
var _hdBusy=false;
async function fetchHoodie(){
  if(_hdBusy)return;_hdBusy=true;
  try{fetchEthHist();}catch(e){}
  try{
    try{
      var r=await fetch(HOODIE_GT,{headers:{"Accept":"application/json"}});
      var j=await r.json();
      var at=j&&j.data&&j.data.attributes;
      if(at){
        var px=parseFloat(at.base_token_price_usd);
        if(px>0)_hd.px=px;
        _hd.chg=parseFloat((at.price_change_percentage||{}).h24)||0;
        _hd.vol=parseFloat((at.volume_usd||{}).h24)||0;
        _hd.resUsd=parseFloat(at.reserve_in_usd)||_hd.resUsd||0;
        var ep=parseFloat(at.quote_token_price_usd);if(ep>0)_hd.ethUsd=ep;
      }
    }catch(e){console.log("HD GT err:",e&&e.message);}
    // LIVE-PREIS on-chain: Uniswap-V4 slot0 (sqrtPriceX96) × Live-ETH. GeckoTerminal-Kurs lagt
    // (stale WETH-$) und der Robinhood-Pool wird oft rate-limitiert (429) — on-chain ist Echtzeit.
    try{
      var _s0=await hdRpc("eth_call",[{to:HD_PM,data:"0x1e2eaeafca84f784a2cb352b80f590c4ed7b76f2eb66f866ced0ee049c95b0dafaf8a615"},"latest"]);
      if(_s0&&_s0!=="0x"){
        var _sq=BigInt(_s0)&((1n<<160n)-1n);
        var _ratio=Math.pow(Number(_sq)/Math.pow(2,96),2); // HOODIE pro ETH (beide 18 dec)
        var _eU=_hd.ethUsd||0;
        try{var _er=await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");var _ej=await _er.json();var _ev=_ej&&_ej.ethereum&&_ej.ethereum.usd;if(_ev>0){_eU=_ev;_hd.ethUsd=_ev;}}catch(e){}
        if(_ratio>0&&_eU>0){_hd.px=_eU/_ratio;_hd.pxSrc="onchain";}
      }
    }catch(e){console.log("HD slot0 err:",e&&e.message);}
    try{
      try{
        var dd=await hdCall(HOODIE_TK,"0x70a08231"+"000000000000000000000000000000000000dEaD".toLowerCase().padStart(64,"0"));
        if(dd!==null)_hd.dead=dd;
      }catch(e){}
      var balSum=0,balOk=false;
      for(var wi=0;wi<MY_HD_WALLETS.length;wi++){
        var b1=await hdCall(HOODIE_TK,"0x70a08231"+MY_HD_WALLETS[wi].slice(2).padStart(64,"0"));
        if(b1!==null){balSum+=b1;balOk=true;}
      }
      if(balOk)_hd.bal=balSum;
      var pool=await hdCall(HOODIE_TK,"0x70a08231"+HD_PM.slice(2).toLowerCase().padStart(64,"0"));
      if(pool!==null)_hd.pool=pool;
    }catch(e){console.log("HD RPC err:",e&&e.message);}
    _hd.ts=Date.now();
    try{localStorage.setItem("hd_cache",JSON.stringify(_hd));}catch(e){}
    renderHoodie();
    try{renderWal();}catch(e){} // HOODIE-Zeile + Alarm in den Ledger-Beständen aktualisieren
    try{hdRenderMine();hdRenderNextFill();}catch(e){}
    try{if(window._invOpen)renderInvestors();}catch(e){}
    // Incremental scan keeps Trades/LP feed fresh once the first full scan ran.
    try{if(_hdScan.lastBlk>0)hdScan();}catch(e){}
  }catch(e){console.log("fetchHoodie err:",e&&e.message);}
  _hdBusy=false;
}
// ═══ HOODIE ANALYSE: Trades + LP-Map via Uniswap-V4-Event-Replay ═══
// Pool ist jung (Initialize Block 4268344) → komplette Historie per getLogs rekonstruierbar.
// Sigs aus echten Txs verifiziert (08.07.2026). ModifyLiquidity-Sender ist der PositionManager,
// echter Owner = tx.from (gleiche Situation wie bei BURN-V3-NFTs).
var HD_PM="0x8366a39CC670B4001A1121B8F6A443A643e40951";
var HD_POOLID="0x9286edc5798ca4e2279297d27bf5edfc9b639c94c772303b0d62e434785cba19";
var HD_SWAP_SIG="0x40e9cecb9f5f1f1c5b9c97dec2917b7ee92e57ba5563708daca94dd84ad7112f";
var HD_MODLIQ_SIG="0xf208f4912782fd25c7f114ca3723a2d5dd6f3bcc3ac8db5af63baa85f711d5ec";
var HD_INIT_BLK=4268344;
var _hdScan={lastBlk:0,trades:[],lps:[]};
try{var _hds=JSON.parse(localStorage.getItem("hd_scan")||"null");if(_hds&&_hds.lastBlk>0&&_hds.v===3)_hdScan=_hds;}catch(e){} // v2: mit LP-Event-Log; aeltere Caches -> Rescan ab Pool-Geburt (billig, Pool ist jung)
var _hdTxFrom={},_hdBlkTs={};
async function hdRpc(method,params){
  var ac=(typeof AbortController!=="undefined")?new AbortController():null;
  var to=ac?setTimeout(function(){ac.abort();},25000):null;
  try{
    var r=await fetch(RH_RPC,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:1,method:method,params:params}),signal:ac?ac.signal:undefined});
    var j=await r.json();
    if(j&&j.error)throw new Error(j.error.message||"rpc err");
    return j?j.result:null;
  }finally{if(to)clearTimeout(to);}
}
async function hdCall(to,data){
  var res=await hdRpc("eth_call",[{to:to,data:data},"latest"]);
  if(!res||res==="0x")return null;
  var v=Number(BigInt(res))/1e18;
  return isFinite(v)&&v>=0?v:null;
}
function hdI(hexWord){var v=BigInt("0x"+hexWord);if(v>=(2n**255n))v-=(2n**256n);return v;}
// ── ETH-Kurshistorie für zeitkorrekte $-Werte vergangener Events (CoinGecko, stündlich) ──
var _ethHist=[];var _ethHistTs=0;
try{var _eh=JSON.parse(localStorage.getItem("hd_ethhist")||"null");if(_eh&&_eh.length){_ethHist=_eh;_ethHistTs=Date.now()-3600000;}}catch(e){}
async function fetchEthHist(){
  if(Date.now()-_ethHistTs<21600000&&_ethHist.length)return;
  try{
    var to=Math.floor(Date.now()/1000),fr=to-14*86400;
    var r=await fetch("https://api.coingecko.com/api/v3/coins/ethereum/market_chart/range?vs_currency=usd&from="+fr+"&to="+to);
    var j=await r.json();
    if(j&&j.prices&&j.prices.length){_ethHist=j.prices;_ethHistTs=Date.now();
      try{localStorage.setItem("hd_ethhist",JSON.stringify(_ethHist));}catch(e){}}
  }catch(e){console.log("ethHist err:",e&&e.message);}
}
function ethUsdAt(ts){ // ETH-$ zum Zeitpunkt ts; >12h ohne Datenpunkt -> aktueller Kurs
  if(!ts||!_ethHist.length)return _hd.ethUsd||0;
  var best=null,bd=Infinity;
  for(var i=0;i<_ethHist.length;i++){var d=Math.abs(_ethHist[i][0]-ts);if(d<bd){bd=d;best=_ethHist[i][1];}}
  return (best&&bd<43200000)?best:(_hd.ethUsd||best||0);
}
var _hdScanBusy=false;
// Robuster Scan: adaptive Chunk-Größen (Mobile-RPC wirft große getLogs ab), Fortschritt wird pro
// Chunk persistiert (Abbruch verliert nichts), 25s-Timeout statt Ewig-Hänger, Retry-Button im UI.
async function hdProcessLogs(logs){
  for(var i=0;i<logs.length;i++){
    var l=logs[i],d=(l.data||"0x").slice(2),t0=l.topics[0],blk=parseInt(l.blockNumber,16);
    var txh=l.transactionHash;
    var evk=txh+":"+(l.logIndex||"");
    if(!_hdScan.seen)_hdScan.seen={};
    if(_hdScan.seen[evk])continue;
    _hdScan.seen[evk]=1;
    var frm=_hdTxFrom[txh];
    if(!frm){try{var tx=await hdRpc("eth_getTransactionByHash",[txh]);frm=((tx||{}).from||"").toLowerCase();_hdTxFrom[txh]=frm;}catch(e){frm="";}}
    var ts=_hdBlkTs[blk];
    if(!ts){try{var bo=await hdRpc("eth_getBlockByNumber",["0x"+blk.toString(16),false]);ts=parseInt((bo||{}).timestamp||"0x0",16)*1000;_hdBlkTs[blk]=ts;}catch(e){ts=0;}}
    if(t0===HD_SWAP_SIG&&d.length>=128){
      var a0=Number(hdI(d.slice(0,64)))/1e18,a1=Number(hdI(d.slice(64,128)))/1e18;
      if(Math.abs(a1)<1)continue;
      // Tick zum Trade-Zeitpunkt (Data-Wort 5) — Basis fuer zeitexakte LP-Event-Zerlegung
      var swTk=d.length>=320?Number(hdI(d.slice(256,320))):null;
      _hdScan.trades.push({k:evk,b:blk,t:ts,ty:a1>0?"BUY":"SELL",hd:Math.abs(a1),e:Math.abs(a0),w:frm,tk:swTk});
    }else if(t0===HD_MODLIQ_SIG&&d.length>=192){
      var tL=Number(hdI(d.slice(0,64))),tU=Number(hdI(d.slice(64,128))),dL=Number(hdI(d.slice(128,192)));
      var salt=d.slice(192,256)||"";
      var pk=frm+":"+tL+":"+tU+":"+salt,found=null;
      for(var p2=0;p2<_hdScan.lps.length;p2++){if(_hdScan.lps[p2].pk===pk){found=_hdScan.lps[p2];break;}}
      if(!found){found={pk:pk,w:frm,tL:tL,tU:tU,liq:0,t:ts};_hdScan.lps.push(found);}
      found.liq+=dL;if(ts)found.t=ts;
      if(!_hdScan.ev)_hdScan.ev=[];
      _hdScan.ev.push({k:evk,b:blk,t:ts,ty:dL>0?"MINT":"CLOSE",w:frm,tL:tL,tU:tU,dL:Math.abs(dL)});
      if(_hdScan.ev.length>200)_hdScan.ev=_hdScan.ev.slice(-200);
    }
  }
}
var _hdSrvTs=0;
function hdSaveScan(){
  if(_hdScan.trades.length>1000)_hdScan.trades=_hdScan.trades.slice(-1000);
  _hdScan.trades.sort(function(a,b){return b.b-a.b;});
  var payload=JSON.stringify({v:3,lastBlk:_hdScan.lastBlk,trades:_hdScan.trades,lps:_hdScan.lps,ev:_hdScan.ev||[]});
  try{localStorage.setItem("hd_scan",payload);}catch(e){}
  // Server-Backup (throttled): Neuinstallation der App verliert damit keine Historie mehr
  if(Date.now()-_hdSrvTs>60000){_hdSrvTs=Date.now();
    try{fetch("https://95-216-152-31.sslip.io/hdscan",{method:"POST",mode:"cors",body:payload}).catch(function(){});}catch(e){}}
}
// Frisch-Install-Hydration: kein lokaler Scan-Stand -> vom Server laden
setTimeout(async function(){
  if(_hdScan.lastBlk>0)return;
  try{
    var r=await fetch("https://95-216-152-31.sslip.io/hdscan",{mode:"cors"});
    var j=await r.json();
    if(j&&j.v===3&&j.lastBlk>0){_hdScan=j;
      try{localStorage.setItem("hd_scan",JSON.stringify(j));}catch(e){}
      console.log("hd_scan vom Server hydriert: Block "+j.lastBlk);
      try{renderHdAna();}catch(e){}}
  }catch(e){}
},3500);
function _hdBtn(txt,dis){try{var b=$("hdScanBtn");if(b){if(txt)b.textContent=txt;b.disabled=!!dis;b.style.opacity=dis?".5":"1";}}catch(e){}}
async function hdScan(){
  if(_hdScanBusy){var s0=$("hdAnaStatus");if(s0)s0.textContent="Scan läuft bereits – Fortschritt siehe Button/Status…";return;}
  _hdScanBusy=true;
  _hdBtn("⏳ Scan läuft… 0%",true);
  var st=$("hdAnaStatus");
  try{
    var bn=await hdRpc("eth_blockNumber",[]);
    var head=parseInt(bn,16);
    var from=_hdScan.lastBlk>0?_hdScan.lastBlk+1:HD_INIT_BLK;
    var sizes=[400000,150000,50000];
    while(from<=head){
      var part=null,used=0,lastErr=null;
      for(var si=0;si<sizes.length;si++){
        var hi=Math.min(from+sizes[si]-1,head);
        var _pct=Math.round((from-HD_INIT_BLK)/(head-HD_INIT_BLK+1)*100);
        if(st)st.textContent="Scanne Blöcke "+from+"–"+hi+" ("+_pct+"%)…";
        _hdBtn("⏳ Scan läuft… "+_pct+"%",true);
        try{
          part=await hdRpc("eth_getLogs",[{address:HD_PM,fromBlock:"0x"+from.toString(16),toBlock:"0x"+hi.toString(16),topics:[[HD_SWAP_SIG,HD_MODLIQ_SIG],HD_POOLID]}]);
          used=sizes[si];break;
        }catch(e){lastErr=e;part=null;}
      }
      if(part===null)throw lastErr||new Error("getLogs fail");
      if(part.length)await hdProcessLogs(part);
      from=Math.min(from+used,head+1);
      _hdScan.lastBlk=from-1;
      hdSaveScan(); // Fortschritt sichern — Abbruch kostet ab jetzt nur den Rest
    }
    hdSaveScan();
    renderHdAna();
    try{hdRenderMine();hdRenderNextFill();}catch(e){}
    _hdBtn("↻ Scan starten / fortsetzen",false);
    var stOk=$("hdAnaStatus");if(stOk)stOk.textContent="Scan komplett · Stand Block "+_hdScan.lastBlk;
  }catch(e){
    console.log("hdScan err:",e&&e.message||e);
    var st2=$("hdAnaStatus");
    if(st2)st2.innerHTML='Scan-Fehler: '+((e&&e.message)||e)+' bei Block '+(_hdScan.lastBlk||HD_INIT_BLK)+' — <b>↻ Scan fortsetzen</b> drücken (Fortschritt bleibt erhalten)';
    try{renderHdAna();}catch(e2){}
    _hdBtn("↻ Scan fortsetzen",false);
  }
  _hdScanBusy=false;
}
// Tick zum Zeitpunkt eines Blocks: naechstliegender Swap (Swaps tragen den Pool-Tick).
function hdTickAtBlock(b){
  var best=null,bd=Infinity,tr=_hdScan.trades||[];
  for(var i=0;i<tr.length;i++){
    var t=tr[i];if(t.tk===null||t.tk===undefined)continue;
    var d=Math.abs(t.b-b)+(t.b>b?0.5:0); // bei Gleichstand den frueheren Swap bevorzugen
    if(d<bd){bd=d;best=t.tk;}
  }
  return best;
}
function hdTick(){
  // Bevorzugt den ON-CHAIN-Tick des neuesten gescannten Swaps (exakt wie Uniswap ihn sieht).
  // GT-Ableitung (zwei getrennte USD-Preise) kippt an Range-Grenzen — Fix für falsches Fill%.
  try{
    var tr=_hdScan.trades||[];
    var newest=null;
    for(var i=0;i<tr.length;i++){if(tr[i].tk!==null&&tr[i].tk!==undefined){if(!newest||tr[i].b>newest.b)newest=tr[i];}}
    // Kein Zeitfenster: V4-Preis bewegt sich NUR durch Swaps — der letzte Swap-Tick IST der Pool-Tick,
    // bis der nächste Trade kommt (den der 90s-Scan einsammelt).
    if(newest)return newest.tk;
  }catch(e){}
  return hdTickGT();
}
function hdTickGT(){ // aktueller V4-Tick aus USD-Preisen (price = token1/token0 = HOODIE pro ETH)
  if(!(_hd.px>0&&_hd.ethUsd>0))return null;
  return Math.log(_hd.ethUsd/_hd.px)/Math.log(1.0001);
}
// Pool-Reserven (x=HOODIE, y=ETH) aus Live-Daten — Basis für alle Markt-Rechnungen.
// Exakt, solange die Liquidität Full-Range ist (aktuell: 1 Position); sonst gute Näherung.
function hdPoolXY(){
  var eU=_hd.ethUsd||0,px=_hd.px||0,poolHd=_hd.pool||0;
  if(!(eU>0&&px>0&&poolHd>0&&_hd.resUsd>0))return null;
  var yUsd=Math.max(0,_hd.resUsd-poolHd*px);
  if(yUsd<=0)return null;
  var y=yUsd/eU,x=poolHd;
  return {x:x,y:y,k:x*y,eU:eU,px:px};
}
// ─── Tick-exakte Band-Mathe (V4, token0=ETH, token1=HOODIE, USD-Preis = eU/1.0001^tick) ───
function hdSp(t){return Math.pow(1.0001,t/2);}
function hdTickOfUsd(p){var eU=_hd.ethUsd||0;if(!(eU>0&&p>0))return null;return Math.log(eU/p)/Math.log(1.0001);}
function hdActivePos(){
  var out=[],a=_hdScan.lps||[];
  for(var i=0;i<a.length;i++){if(a[i].liq>1)out.push({tL:a[i].tL,tU:a[i].tU,L:a[i].liq});}
  return out;
}
// Kaufdruck: Preis steigt => tick faellt => Pool gibt HOODIE aus Band [tickZiel, tickJetzt] ab.
function hdPressure(tickTarget){
  var tn=hdTick();if(tn===null)return null;
  var pos=hdActivePos();if(!pos.length)return null;
  var hd=0,eth=0;
  for(var i=0;i<pos.length;i++){
    var lo=Math.max(pos[i].tL,tickTarget),hi=Math.min(pos[i].tU,tn);
    if(lo<hi){hd+=pos[i].L*(hdSp(hi)-hdSp(lo))/1e18;eth+=pos[i].L*(1/hdSp(lo)-1/hdSp(hi))/1e18;}
  }
  return {hd:hd,eth:eth};
}
// Verkauf: Preis faellt => tick steigt => Pool nimmt HOODIE auf, gibt ETH aus Band [tickJetzt, tickZiel].
function hdAbsorb(tickTarget){
  var tn=hdTick();if(tn===null)return null;
  var pos=hdActivePos();if(!pos.length)return null;
  var hd=0,eth=0;
  for(var i=0;i<pos.length;i++){
    var lo=Math.max(pos[i].tL,tn),hi=Math.min(pos[i].tU,tickTarget);
    if(lo<hi){hd+=pos[i].L*(hdSp(hi)-hdSp(lo))/1e18;eth+=pos[i].L*(1/hdSp(lo)-1/hdSp(hi))/1e18;}
  }
  return {hd:hd,eth:eth};
}
function hdRenderTargets(){
  var el=$("hdAnaTargets");if(!el)return;
  var eU=_hd.ethUsd||0,px=_hd.px||0,tn=hdTick();
  var pos=hdActivePos();
  if(!(eU>0&&px>0&&tn!==null)||!pos.length){
    // Fallback constant product (kein Scan / keine Preise)
    var pl=hdPoolXY();
    if(!pl){el.innerHTML='<div style="color:var(--dm);font-size:10px">Erst LP-Scan/Preise laden…</div>';return;}
    var pNow=pl.y/pl.x*pl.eU,rows0="";
    [2,3,5,10,20].forEach(function(m){var p1=pNow*m/pl.eU,y1=Math.sqrt(pl.k*p1),dy=y1-pl.y,ab=pl.x-pl.k/y1;
      rows0+='<tr><td style="color:var(--g);font-weight:600">'+m+'× ($'+(pNow*m).toPrecision(3)+')</td><td style="color:var(--cy)">$'+F(dy*pl.eU,0)+'</td><td>'+F(ab,0)+'</td></tr>';});
    el.innerHTML='<div class="lb" style="margin-top:10px">🎯 Kaufdruck bis Preisziel (constant product)</div><div class="ov"><table class="mkt-tbl"><thead><tr><th>Ziel</th><th>$ Kaufdruck nötig</th><th>Pool gibt ab (HD)</th></tr></thead><tbody>'+rows0+'</tbody></table></div>';
    return;
  }
  var rows="";
  [1.25,1.5,2,3,5,10,20].forEach(function(m){
    var tT=hdTickOfUsd(px*m);if(tT===null)return;
    var r=hdPressure(tT);if(!r)return;
    rows+='<tr><td style="color:var(--g);font-weight:600">'+m+'× ($'+(px*m).toPrecision(3)+')</td><td style="color:var(--cy)">$'+F(r.eth*eU,0)+'</td><td>'+F(r.hd,0)+'</td></tr>';
  });
  el.innerHTML='<div class="lb" style="margin-top:10px">🎯 Kaufdruck bis Preisziel (tick-exakt, '+pos.length+' LPs)</div>'
    +'<div class="ov"><table class="mkt-tbl"><thead><tr><th>Ziel</th><th>$ Kaufdruck nötig</th><th>Pool gibt ab (HD)</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
  hdRenderHeatmap();
}
// ─── Heatmap: HOODIE-Widerstand ueber Preis / ETH-Support unter Preis (Bookmap-Stil wie BURN) ───
function hdRenderHeatmap(){
  var el=$("hdAnaHeat");if(!el)return;
  var eU=_hd.ethUsd||0,px=_hd.px||0,tn=hdTick();
  var pos=hdActivePos();
  if(!(eU>0&&px>0&&tn!==null)||!pos.length){el.innerHTML="";return;}
  var upB=[1,1.25,1.5,2,3,5,10,20],dnB=[1,0.8,0.6,0.4,0.2];
  var up=[],dn=[],maxUp=0,maxDn=0,totHd=0,totEth=0;
  for(var i=0;i<upB.length-1;i++){
    var a=hdPressure(hdTickOfUsd(px*upB[i])),b2=hdPressure(hdTickOfUsd(px*upB[i+1]));
    if(!a||!b2)continue;
    var v=Math.max(0,b2.hd-a.hd);totHd+=v;if(v>maxUp)maxUp=v;
    up.push({lab:"$"+(px*upB[i]).toPrecision(3)+"–"+(px*upB[i+1]).toPrecision(3),v:v});
  }
  for(var j=0;j<dnB.length-1;j++){
    var c=hdAbsorb(hdTickOfUsd(px*dnB[j])),d2=hdAbsorb(hdTickOfUsd(px*dnB[j+1]));
    if(!c||!d2)continue;
    var w=Math.max(0,(d2.eth-c.eth))*eU;totEth+=w;if(w>maxDn)maxDn=w;
    dn.push({lab:"$"+(px*dnB[j+1]).toPrecision(3)+"–"+(px*dnB[j]).toPrecision(3),v:w});
  }
  function bar(x,mx,col){var rel=mx>0?x/mx:0;
    return '<div style="height:12px;border-radius:6px;background:linear-gradient(90deg,'+col+'cc,'+col+'55);width:'+Math.max(3,rel*100)+'%;box-shadow:'+(rel>0.55?'0 0 8px '+col+'66':'none')+'"></div>';}
  var h='<div class="lb" style="margin-top:10px">📊 HOODIE Verteilung (Heatmap)</div>'
    +'<div style="display:flex;gap:8px;margin-bottom:6px">'
    +MB("▲ Widerstand",F(totHd,0)+" HD","var(--o)")+MB("▼ Support","$"+F(totEth,0),"var(--g)")+'</div>'
    +'<div style="font-size:9px;color:var(--o);letter-spacing:1px;margin:4px 0">▲ HOODIE-WÄNDE ÜBER PREIS</div>';
  for(var k=up.length-1;k>=0;k--){var u=up[k];
    h+='<div style="display:flex;align-items:center;gap:6px;margin:3px 0"><div style="width:150px;font-size:9px;color:var(--dm)">'+u.lab+'</div><div style="flex:1">'+bar(u.v,maxUp,"#fb923c")+'</div><div style="width:60px;text-align:right;font-size:9px;color:var(--o)">'+F(u.v,0)+'</div></div>';}
  h+='<div style="display:flex;align-items:center;gap:6px;margin:6px 0;padding:5px 0;border-top:1px dashed rgba(255,255,255,.15);border-bottom:1px dashed rgba(255,255,255,.15)"><div style="width:150px;font-size:10px;color:var(--tx);font-weight:700">➤ $'+px.toPrecision(4)+'</div><div style="flex:1;text-align:center;font-size:9px;color:var(--dm)">AKTUELLER PREIS</div><div style="width:60px"></div></div>'
    +'<div style="font-size:9px;color:var(--g);letter-spacing:1px;margin:4px 0">▼ ETH-SUPPORT UNTER PREIS</div>';
  for(var k2=0;k2<dn.length;k2++){var dd=dn[k2];
    h+='<div style="display:flex;align-items:center;gap:6px;margin:3px 0"><div style="width:150px;font-size:9px;color:var(--dm)">'+dd.lab+'</div><div style="flex:1">'+bar(dd.v,maxDn,"#34d399")+'</div><div style="width:60px;text-align:right;font-size:9px;color:var(--g)">$'+F(dd.v,0)+'</div></div>';}
  el.innerHTML=h;
}
function hdImpact(buy){
  var el=$("hdImpRes"),inp=$("hdImpAmt");if(!el||!inp)return;
  var usd=parseFloat((inp.value||"").replace(",","."));
  if(!(usd>0)){el.innerHTML='<span style="color:var(--r)">Betrag in $ eingeben</span>';return;}
  var eU=_hd.ethUsd||0,px=_hd.px||0,tn=hdTick();
  var pos=hdActivePos();
  if((eU>0&&px>0&&tn!==null)&&pos.length){
    // Tick-exakt per Binaersuche ueber den Ziel-Tick
    if(buy){
      var lo=tn-400000,hi=tn; // Preis rauf = tick runter
      for(var it=0;it<48;it++){var mid=(lo+hi)/2;var r=hdPressure(mid);if(r&&r.eth*eU<usd)hi=mid;else lo=mid;}
      var res=hdPressure(hi)||{hd:0,eth:0};
      var p1=eU/Math.pow(1.0001,hi);
      if(res.eth*eU<usd*0.98&&hi<=tn-399999){el.innerHTML='<span style="color:var(--warn)">Betrag übersteigt gesamte Pool-Liquidität</span>';return;}
      el.innerHTML='<b style="color:var(--g)">KAUF $'+F(usd,0)+'</b>: erhält <b>'+F(res.hd,0)+' HOODIE</b>'+(res.hd>0?' (Ø $'+(usd/res.hd).toPrecision(3)+')':'')+' · Preis danach <b>$'+p1.toPrecision(4)+'</b> (<span style="color:var(--g)">+'+((p1/px-1)*100).toFixed(1)+'%</span>) · tick-exakt';
    }else{
      var tok=usd/px;
      var lo2=tn,hi2=tn+400000; // Preis runter = tick rauf
      for(var it2=0;it2<48;it2++){var mid2=(lo2+hi2)/2;var r2=hdAbsorb(mid2);if(r2&&r2.hd<tok)lo2=mid2;else hi2=mid2;}
      var res2=hdAbsorb(hi2)||{hd:0,eth:0};
      var p2=eU/Math.pow(1.0001,hi2);
      var proc=res2.eth*eU,slip=(1-proc/usd)*100;
      el.innerHTML='<b style="color:var(--r)">VERKAUF '+F(tok,0)+' HD</b> (Buchwert $'+F(usd,0)+'): Erlös <b>$'+F(proc,0)+'</b> (Slippage '+slip.toFixed(0)+'%) · Preis danach <b>$'+p2.toPrecision(4)+'</b> (<span style="color:var(--r)">'+((p2/px-1)*100).toFixed(1)+'%</span>) · tick-exakt';
    }
    return;
  }
  // Fallback constant product
  var pl=hdPoolXY();
  if(!pl){el.innerHTML='<span style="color:var(--dm)">Preisdaten laden…</span>';return;}
  var pNow=pl.y/pl.x*pl.eU;
  if(buy){
    var dy=usd/pl.eU,x1=pl.k/(pl.y+dy),out=pl.x-x1,pb=(pl.y+dy)/x1*pl.eU;
    el.innerHTML='<b style="color:var(--g)">KAUF $'+F(usd,0)+'</b>: erhält <b>'+F(out,0)+' HOODIE</b> · Preis danach <b>$'+pb.toPrecision(4)+'</b> (+'+((pb/pNow-1)*100).toFixed(1)+'%)';
  }else{
    var tk=usd/pNow,x2=pl.x+tk,y2=pl.k/x2,pr=(pl.y-y2)*pl.eU,ps=y2/x2*pl.eU;
    el.innerHTML='<b style="color:var(--r)">VERKAUF '+F(tk,0)+' HD</b>: Erlös <b>$'+F(pr,0)+'</b> · Preis danach <b>$'+ps.toPrecision(4)+'</b> ('+((ps/pNow-1)*100).toFixed(1)+'%)';
  }
}
function renderHdAna(){
  var b=$("hdAnaBody");if(!b)return;
  // Statisches Skelett nur EINMAL bauen — der Impact-Rechner (Eingabefeld) darf Re-Renders überleben.
  if(!$("hdAnaSum")){
    b.innerHTML='<div id="hdAnaSum"></div><div id="hdAnaTargets"></div><div id="hdAnaHeat"></div>'
      +'<div class="lb" style="margin-top:10px">⚖️ Impact-Rechner</div>'
      +'<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">'
      +'<input id="hdImpAmt" type="number" inputmode="decimal" placeholder="$ Betrag" style="width:110px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);border-radius:8px;color:var(--tx);padding:8px 10px;font-family:inherit;font-size:12px">'
      +'<button onclick="hdImpact(true)" style="background:rgba(52,211,153,.15);border:1px solid var(--g);color:var(--g);border-radius:8px;padding:8px 14px;font-family:inherit;font-size:11px;font-weight:600">KAUF</button>'
      +'<button onclick="hdImpact(false)" style="background:rgba(248,113,113,.15);border:1px solid var(--r);color:var(--r);border-radius:8px;padding:8px 14px;font-family:inherit;font-size:11px;font-weight:600">VERKAUF</button>'
      +'</div><div id="hdImpRes" style="font-size:11px;margin-top:8px;line-height:1.5;color:var(--tx)"></div>'
      +'<div id="hdAnaLps"></div><div id="hdAnaEv"></div><div id="hdAnaTrades"></div><div style="margin-top:8px"><button id="hdScanBtn" onclick="hdScan()" style="background:rgba(34,211,238,.12);border:1px solid var(--cy);color:var(--cy);border-radius:8px;padding:7px 14px;font-family:inherit;font-size:11px;font-weight:600">↻ Scan starten / fortsetzen</button></div>'
      +'<div id="hdAnaStatus" style="font-size:9px;color:var(--dm);margin-top:6px"></div>';
  }
  var eUsd=_hd.ethUsd||0;
  var tick=hdTick();
  // LP-Zusammensetzung (V3/V4-Mathe, beide Token 18 dec, token0=ETH, token1=HOODIE)
  var lpRows="",sumHd=0,sumEthU=0;
  var act=_hdScan.lps.filter(function(x){return x.liq>1;});
  var closed=_hdScan.lps.filter(function(x){return x.liq<=1;});
  for(var i=0;i<act.length;i++){
    var p=act[i];
    var full=(p.tL<=-887200&&p.tU>=887200);
    var eth=0,hd=0;
    if(tick!==null){
      var spL=Math.pow(1.0001,p.tL/2),spU=Math.pow(1.0001,p.tU/2);
      var sp=Math.pow(1.0001,Math.min(Math.max(tick,p.tL),p.tU)/2);
      eth=p.liq*(1/sp-1/spU)/1e18;hd=p.liq*(sp-spL)/1e18;
      if(eth<0||!isFinite(eth))eth=0;if(hd<0||!isFinite(hd))hd=0;
    }
    sumHd+=hd;sumEthU+=eth*eUsd;
    var pLo=eUsd>0?eUsd/Math.pow(1.0001,p.tU):0,pHi=eUsd>0?eUsd/Math.pow(1.0001,p.tL):0;
    var rng=full?"Full Range":"$"+pLo.toPrecision(3)+"–$"+pHi.toPrecision(3);
    lpRows+='<tr><td>'+addrName(p.w)+'</td><td style="font-size:10px">'+rng+'</td><td style="color:var(--g)">'+F(hd,0)+'</td><td style="color:var(--cy)">$'+F(eth*eUsd,0)+'</td></tr>';
  }
  for(var ci=0;ci<closed.length;ci++){
    var cp=closed[ci];
    var cFull=(cp.tL<=-887200&&cp.tU>=887200);
    var cLo=eUsd>0?eUsd/Math.pow(1.0001,cp.tU):0,cHi=eUsd>0?eUsd/Math.pow(1.0001,cp.tL):0;
    var cRng=cFull?"Full Range":"$"+cLo.toPrecision(3)+"–$"+cHi.toPrecision(3);
    lpRows+='<tr style="opacity:.55"><td>'+addrName(cp.w)+'</td><td style="font-size:10px">'+cRng+'</td><td colspan="2" style="color:var(--r);font-size:10px;font-weight:600">CLOSED'+(cp.t?' · '+new Date(cp.t).toLocaleString("de-DE",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}):'')+'</td></tr>';
  }
  var sum=$("hdAnaSum");
  if(sum)sum.innerHTML='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">'
    +MB("HOODIE im Pool",F(sumHd,0),"var(--g)")
    +MB("ETH-Support",sumEthU>0?"$"+F(sumEthU,0):"—","var(--cy)")
    +MB("LP-Positionen",String(act.length),"var(--dm)")
    +MB("Trades gesamt",String(_hdScan.trades.length),"var(--dm)")
    +'</div>';
  hdRenderTargets();
  var lp=$("hdAnaLps");
  if(lp)lp.innerHTML='<div class="lb" style="margin-top:10px">LP-Positionen</div>'
    +'<div class="ov"><table class="mkt-tbl"><thead><tr><th>Wallet</th><th>Range</th><th>HOODIE</th><th>ETH ($)</th></tr></thead><tbody>'+(lpRows||'<tr><td colspan="4" style="color:var(--dm)">keine aktiven Positionen</td></tr>')+'</tbody></table></div>';
  var ev=$("hdAnaEv");
  if(ev){
    var evs=(_hdScan.ev||[]).slice().sort(function(a,b){return b.b-a.b;}).slice(0,30);
    var er="";
    for(var e2=0;e2<evs.length;e2++){
      var E=evs[e2];
      var eFull=(E.tL<=-887200&&E.tU>=887200);
      var eLo=eUsd>0?eUsd/Math.pow(1.0001,E.tU):0,eHi=eUsd>0?eUsd/Math.pow(1.0001,E.tL):0;
      var eRng=eFull?"Full Range":"$"+eLo.toPrecision(3)+"–$"+eHi.toPrecision(3);
      // Mengen zeitexakt: Tick des naechsten Swaps zum Event-Block (Fallback: heutiger Tick)
      var eHd=0,eEthU=0;
      var eTick=hdTickAtBlock(E.b);if(eTick===null)eTick=tick;
      if(eTick!==null){
        var esL=Math.pow(1.0001,E.tL/2),esU=Math.pow(1.0001,E.tU/2);
        var esc=Math.pow(1.0001,Math.min(Math.max(eTick,E.tL),E.tU)/2);
        eHd=E.dL*(esc-esL)/1e18;eEthU=E.dL*(1/esc-1/esU)/1e18*ethUsdAt(E.t); // damaliger ETH-$
        if(!isFinite(eHd)||eHd<0)eHd=0;if(!isFinite(eEthU)||eEthU<0)eEthU=0;
      }
      var eTm=E.t?new Date(E.t).toLocaleString("de-DE",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}):"—";
      er+='<tr><td style="font-size:10px">'+eTm+'</td><td style="color:'+(E.ty==="MINT"?"var(--g)":"var(--r)")+';font-weight:600">'+(E.ty==="MINT"?"🟢 OPEN":"🔴 CLOSE")+'</td><td style="font-size:10px">'+addrName(E.w)+'</td><td style="font-size:10px">'+eRng+'</td><td style="font-size:10px">'+F(eHd,0)+' HD'+(eEthU>=1?' + $'+F(eEthU,0):'')+'</td></tr>';
    }
    ev.innerHTML='<div class="lb" style="margin-top:10px">📜 LP Aktivität (Open/Close-Log)</div>'
      +'<div class="ov"><table class="mkt-tbl"><thead><tr><th>Zeit</th><th>Event</th><th>Wallet</th><th>Range</th><th>Menge</th></tr></thead><tbody>'+(er||'<tr><td colspan="5" style="color:var(--dm)">noch keine LP-Events</td></tr>')+'</tbody></table></div>';
  }
  var tr="";
  if(typeof window._hdTrAll==="undefined")window._hdTrAll=false;
  var shown=window._hdTrAll?_hdScan.trades:_hdScan.trades.slice(0,30);
  for(var j2=0;j2<shown.length;j2++){
    var t=shown[j2],usd=t.e*ethUsdAt(t.t),pxT=t.hd>0?usd/t.hd:0; // $ zum damaligen ETH-Kurs
    var tm=t.t?new Date(t.t).toLocaleString("de-DE",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}):"—";
    tr+='<tr><td style="font-size:10px">'+tm+'</td><td style="color:'+(t.ty==="BUY"?"var(--g)":"var(--r)")+';font-weight:600">'+t.ty+'</td><td>'+F(t.hd,0)+'</td><td>$'+F(usd,0)+'</td><td style="font-size:10px">$'+(pxT>0?pxT.toPrecision(3):"—")+'</td><td style="font-size:10px">'+addrName(t.w)+'</td></tr>';
  }
  var td=$("hdAnaTrades");
  var trN=_hdScan.trades.length;
  if(td)td.innerHTML='<div class="lb" style="margin-top:10px">Trades ('+(window._hdTrAll?'alle '+trN:'neueste '+Math.min(30,trN)+' von '+trN)+') <a href="javascript:void(0)" onclick="window._hdTrAll=!window._hdTrAll;renderHdAna()" style="color:var(--cy);font-size:9px;margin-left:8px">'+(window._hdTrAll?'nur 30 zeigen':'alle '+trN+' anzeigen')+'</a></div>'
    +'<div class="ov"><table class="mkt-tbl"><thead><tr><th>Zeit</th><th>Typ</th><th>HOODIE</th><th>$</th><th>Preis</th><th>Wallet</th></tr></thead><tbody>'+(tr||'<tr><td colspan="6" style="color:var(--dm)">noch keine Trades gescannt</td></tr>')+'</tbody></table></div>';
  var st=$("hdAnaStatus");
  if(st&&!_hdScanBusy)st.textContent="Stand Block "+_hdScan.lastBlk+" · Auto-Update alle 90s";
}
function hdOpenAna(){try{renderHdAna();hdScan();}catch(e){console.log("hdOpenAna err:",e);}}
// ═══ INVESTOREN-ÜBERSICHT (BURN + HOODIE): pro Wallet investiert / rausgezogen / Bestand ═══
// HOODIE: exakt ab Pool-Geburt (kompletter Event-Replay). BURN: seit Log-Beginn (allTrades-Fenster
// + Closed-LP-Entnahmen aus dem Scan) — Allzeit-Historie wäre ein separater Vollscan.
window._invOpen=false;
var _invBal={hd:{},burn:{}};
function _invAgg(){
  var eU=_hd.ethUsd||0,tick=hdTick();
  var hd={},burn={};
  function G(m,w){var k=(w||"?").toLowerCase();if(!m[k])m[k]={inv:0,out:0,lpTok:0,lpUsd:0};return m[k];}
  // HOODIE: Trades — $ zum damaligen ETH-Kurs
  (_hdScan.trades||[]).forEach(function(t){
    if(!t.w)return;var g=G(hd,t.w);
    var u=t.e*ethUsdAt(t.t);
    if(t.ty==="BUY"){g.inv+=u;g.tokIn=(g.tokIn||0)+t.hd;}
    else{g.out+=u;g.tokOut=(g.tokOut||0)+t.hd;}
  });
  // HOODIE: LP-Events — ETH-Anteil zum zeitexakten Tick, $ zum damaligen ETH-Kurs
  (_hdScan.ev||[]).forEach(function(E){
    if(!E.w)return;
    var eTick=hdTickAtBlock(E.b);if(eTick===null)eTick=tick;if(eTick===null)return;
    var esU=Math.pow(1.0001,E.tU/2);
    var esc=Math.pow(1.0001,Math.min(Math.max(eTick,E.tL),E.tU)/2);
    var ethU=E.dL*(1/esc-1/esU)/1e18*ethUsdAt(E.t);
    if(!isFinite(ethU)||ethU<0)ethU=0;
    var g=G(hd,E.w);
    if(E.ty==="MINT")g.inv+=ethU;else g.out+=ethU;
  });
  // HOODIE: aktuell in aktiven LPs (Zerlegung zum JETZT-Tick, $ zum JETZT-Kurs)
  (_hdScan.lps||[]).forEach(function(p){
    if(!(p.liq>1)||tick===null)return;
    var spL=Math.pow(1.0001,p.tL/2),spU=Math.pow(1.0001,p.tU/2);
    var sp=Math.pow(1.0001,Math.min(Math.max(tick,p.tL),p.tU)/2);
    var phd=p.liq*(sp-spL)/1e18,peth=p.liq*(1/sp-1/spU)/1e18;
    if(!isFinite(phd)||phd<0)phd=0;if(!isFinite(peth)||peth<0)peth=0;
    var g=G(hd,p.w);
    g.lpTok+=phd;g.lpUsd+=phd*(_hd.px||0)+peth*eU;
  });
  // BURN: aktuell in aktiven LPs
  (window._lpOwners||[]).forEach(function(o){
    if(!o||o.closed||!(o.liq>0)||!o.owner)return;
    try{
      var bDep=wtLiqToBurn(o.liq,o.tL,o.tU);if(!(bDep>0))return;
      var Pb=pxUnified();
      var cv=v3(bDep,o.lo,o.hi,Pb);
      var g=G(burn,o.owner);
      g.lpTok+=cv.left;g.lpUsd+=cv.left*Pb+cv.usdc;
    }catch(e){}
  });
  // BURN: Allzeit-Basis vom Server (burn_fullscan), Live-Trades nur oberhalb lastBlk (kein Doppelzählen)
  var bsBlk=0,bsV2=false;
  if(_burnStats&&_burnStats.wallets){
    bsBlk=_burnStats.lastBlk||0;bsV2=(_burnStats.v>=2);
    Object.keys(_burnStats.wallets).forEach(function(w){
      var v=_burnStats.wallets[w],g=G(burn,w);
      g.inv+=(v.inv||0)+(v.lpInUsd||0);      // Käufe + USDC in LPs eingezahlt
      g.out+=(v.out||0)+(v.lpOutUsd||0);     // Verkäufe + Collect-Entnahmen (inkl. Fees)
      g.tokIn=(g.tokIn||0)+(v.tokIn||0);g.tokOut=(g.tokOut||0)+(v.tokOut||0);
    });
  }
  (typeof allTrades!=="undefined"?allTrades:[]).forEach(function(t){
    if(t.blk<=bsBlk)return;
    var w=(typeof signerCache!=="undefined"&&signerCache[t.txHash])||t.wallet;
    if(!w)return;var g=G(burn,w);
    if(t.isBuy)g.inv+=t.usdc;else g.out+=t.usdc;
  });
  // BURN: geschlossene LPs — nur als Fallback ohne v2-Serverdaten (sonst doppelt zu Collect)
  if(!bsV2){
    (window._lpOwners||[]).forEach(function(o){
      if(o&&o.closed&&o.usdcOut>0&&o.owner){G(burn,o.owner).out+=o.usdcOut;}
    });
  }
  return {hd:hd,burn:burn};
}
var _INV_EXCL={"0xd049a54c8f8757ae7392f0c6f65a487f82ddfde9":1,"0xe7d324bfb30f7b6e314a1698cea57ac8eec4d366":1,"0x7ca7d7da54bbf2dd3bdcd12268154423d6e2eaaf":1,"0x0000000000000000000000000000000000000000":1,"0x000000000000000000000000000000000000dead":1,"0xdbde256870eb8fc3e7aeff5bbcbda1e00a640b37":1,"0xc36442b4a4522e871399cd717abdd847ab11fe88":1,"0xbfc6620459762a6e485ebf1cf7e532e06253b62f":1,"0xd36701e8cfe1c8edd993fa67b90134671c8f8424":1};
var _MY_W=["0x6e37cc7d415466909db6102b6dc34473ac1bb500","0x505042ff781ea1689e44e1d200efd691c30db86c","0x9ffa190b0d2543f35dfa1a2955bc2f4c544871d2"];
function _invWallets(m){
  // ALLE relevanten Wallets: Scan-Daten + Adressbuch + eigene — Boersen/Contracts raus.
  var set={};
  Object.keys(m||{}).forEach(function(w){set[(w||"").toLowerCase()]=1;});
  _MY_W.forEach(function(w){set[w]=1;});
  try{Object.keys(ADDR_BOOK).forEach(function(w){set[(w||"").toLowerCase()]=1;});}catch(e){}
  delete set[""];
  return Object.keys(set).filter(function(w){return !_INV_EXCL[w]&&w.length===42;});
}
window._invPg={hd:0,burn:0};
function invPg(which,d){window._invPg[which]=Math.max(0,(window._invPg[which]||0)+d);renderInvestors();}
function _invRows(m,balMap,curId){
  var ks=_invWallets(m).sort(function(a,b){
    var ba=(balMap[a]&&balMap[a].v)||0,bb=(balMap[b]&&balMap[b].v)||0;
    if(bb!==ba)return bb-ba;                              // primaer: Token-Bestand
    var ga=m[a]?((m[a].inv||0)+(m[a].out||0)):0,gb=m[b]?((m[b].inv||0)+(m[b].out||0)):0;
    return gb-ga;                                          // sekundaer: Cash-Flow
  });
  var per=15,pg=window._invPg[curId]||0,maxPg=Math.max(0,Math.ceil(ks.length/per)-1);
  if(pg>maxPg){pg=maxPg;window._invPg[curId]=pg;}
  var page=ks.slice(pg*per,pg*per+per);
  var r="";
  page.forEach(function(w){
    var g=m[w]||{inv:0,out:0,lpTok:0,lpUsd:0};
    var net=(g.out||0)-(g.inv||0);
    var b=balMap[w];
    var balTxt=b&&b.v!==undefined?F(b.v,0):"…";
    if(b&&(b.st||0)>0.5)balTxt=F(b.v,0)+'<br><span style="color:var(--dm);font-size:8.5px">'+F(b.burn||0,0)+' B + '+F(b.st,0)+' stB</span>';
    var lpTxt=(g.lpUsd||0)>0.5?(F(g.lpTok,0)+' <span style="color:var(--cy)">$'+F(g.lpUsd,0)+'</span>'):"—";
    r+='<tr><td style="font-size:10px">'+addrName(w)+'</td>'
      +'<td style="color:var(--r)">$'+F(g.inv||0,0)+'</td>'
      +'<td style="color:var(--g)">$'+F(g.out||0,0)+'</td>'
      +'<td style="color:'+(net>=0?"var(--g)":"var(--warn)")+'">'+(net>=0?"+":"−")+"$"+F(Math.abs(net),0)+'</td>'
      +'<td style="font-size:10px">'+lpTxt+'</td>'
      +'<td style="font-size:10px">'+balTxt+'</td></tr>';
  });
  return {rows:r||('<tr><td colspan="7" style="color:var(--dm)">keine Daten — '+(curId==="hd"?"HOODIE-Scan":"BURN-Scan")+' erst laufen lassen</td></tr>'),pg:pg,maxPg:maxPg,total:ks.length};
}
function _invPager(which,info){
  var bs='background:rgba(96,165,250,.12);border:1px solid var(--cy);color:var(--cy);border-radius:7px;padding:4px 12px;font-family:inherit;font-size:10px;cursor:pointer';
  var bd='background:none;border:1px solid rgba(96,165,250,.2);color:var(--dm);border-radius:7px;padding:4px 12px;font-family:inherit;font-size:10px;opacity:.4';
  return '<div style="display:flex;justify-content:space-between;align-items:center;margin:5px 0 12px">'
    +'<button onclick="invPg(\''+which+'\',-1)" style="'+(info.pg<=0?bd:bs)+'" '+(info.pg<=0?'disabled':'')+'>← zurück</button>'
    +'<span style="font-size:9px;color:var(--dm)">Seite '+(info.pg+1)+'/'+(info.maxPg+1)+' · '+info.total+' Wallets · nach Bestand sortiert</span>'
    +'<button onclick="invPg(\''+which+'\',1)" style="'+(info.pg>=info.maxPg?bd:bs)+'" '+(info.pg>=info.maxPg?'disabled':'')+'>weiter →</button></div>';
}
function renderInvestors(){
  var b=$("invBody");if(!b)return;
  var a=_invAgg();
  var ih=_invRows(a.hd,_invBal.hd,"hd");
  var ib=_invRows(a.burn,_invBal.burn,"burn");
  b.innerHTML='<div class="lb">🧥 HOODIE (komplett ab Pool-Geburt)</div>'
    +'<div class="ov"><table class="mkt-tbl"><thead><tr><th>Wallet</th><th>Investiert</th><th>Rausgezogen</th><th>Netto</th><th>In LP (Token·$)</th><th>Bestand</th></tr></thead><tbody>'+ih.rows+'</tbody></table></div>'
    +_invPager("hd",ih)
    +'<div class="lb" style="margin-top:6px">🔥 BURN ('+(_burnStats?'Allzeit ✓ bis Block '+F(_burnStats.lastBlk,0):'seit Log-Beginn — Allzeit lädt…')+(_burnStats&&_burnStats.v>=4?', inkl. OTC/Transfers ✓)':')')+'</div>'
    +'<div class="ov"><table class="mkt-tbl"><thead><tr><th>Wallet</th><th>Investiert</th><th>Rausgezogen</th><th>Netto</th><th>In LP (Token·$)</th><th>Bestand (BURN-eq)</th></tr></thead><tbody>'+ib.rows+'</tbody></table></div>'
    +_invPager("burn",ib)
    +'<div style="font-size:9px;color:var(--dm);margin-top:2px">Investiert = Käufe + LP-Einzahlungen + OTC-Zahlungen ($) · Rausgezogen = Verkäufe + LP-Entnahmen + erhaltene $ · Netto = realisierter Cash-Flow · <b>Bestand</b> = echter aktueller On-Chain-Bestand (BURN + stBURN×Ratio bzw. HOODIE, lädt automatisch, 10-min-Cache) · "…" = lädt noch · Token in aktiven LPs zählen nicht zum Wallet-Bestand</div>';
}
async function _invLoadAll(force){
  if(window._invBalBusy)return;window._invBalBusy=true;
  try{
    var a=_invAgg();
    var jobs=[["burn",a.burn],["hd",a.hd]];
    for(var j=0;j<jobs.length;j++){
      var which=jobs[j][0],bm=_invBal[which];
      var ks=_invWallets(jobs[j][1]);
      for(var i=0;i<ks.length;i++){
        var w=ks[i];
        if(!force&&bm[w]&&Date.now()-bm[w].ts<600000)continue;
        try{
          if(which==="hd"){
            var vh=await hdCall(HOODIE_TK,"0x70a08231"+w.slice(2).toLowerCase().padStart(64,"0"));
            if(vh!==null&&isFinite(vh))bm[w]={v:vh,ts:Date.now()};
          }else{
            var hx=await rpcCall(BURN_TK,"0x70a08231"+w.slice(2).toLowerCase().padStart(64,"0"));
            var hx2=await rpcCall(STBURN_TK,"0x70a08231"+w.slice(2).toLowerCase().padStart(64,"0"));
            var vb=(hx&&hx!=="0x")?Number(BigInt(hx))/1e18:0;
            var vs=(hx2&&hx2!=="0x")?Number(BigInt(hx2))/1e18:0;
            var rt=(typeof stR!=="undefined"&&stR>1)?stR:1.048;
            var v=vb+vs*rt;
            if(isFinite(v))bm[w]={v:v,burn:vb,st:vs,ts:Date.now()};
          }
        }catch(e){}
        if(i%6===5&&window._invOpen)renderInvestors();
      }
    }
    if(window._invOpen)renderInvestors();
  }catch(e){console.log("invLoadAll err:",e&&e.message);}
  window._invBalBusy=false;
}
function invLoadBal(which){_invLoadAll(true);}
var _burnStats=null,_burnStatsTs=0;
async function invLoadBurnStats(){
  if(_burnStats&&Date.now()-_burnStatsTs<600000)return;
  try{
    var r=await fetch("https://95-216-152-31.sslip.io/burnstats",{mode:"cors"});
    var j=await r.json();
    if(j&&j.wallets&&j.lastBlk>0){_burnStats=j;_burnStatsTs=Date.now();renderInvestors();}
  }catch(e){console.log("burnstats err:",e&&e.message);}
}
async function invAutoBal(){_invLoadAll(false);}
function invOpen(){window._invOpen=true;try{renderInvestors();}catch(e){console.log("invOpen err:",e);}try{invLoadBurnStats();}catch(e){}try{invAutoBal();}catch(e){}}
startRefresh();
var APP_V="20260822hd9"; // sichtbare Versions-/Sync-Anzeige — beendet das Versions-Rätselraten
try{var _ss=$("syncStat");if(_ss)_ss.textContent="v"+APP_V+" · Server-Sync: wartet…";}catch(e){}
// HOODIE: cached paint instantly, live fetch shortly after boot, then every 90s (GT limit 30/min).
try{renderHoodie();}catch(e){}
setTimeout(function(){try{fetchHoodie();}catch(e){}},2500);
setInterval(function(){if(!document.hidden){try{fetchHoodie();}catch(e){}try{if(window._invOpen)renderInvestors();}catch(e){}}},90000);
// PTF-Server-Sync auch periodisch (nicht nur bei ptfSave): haelt portfolio-data.json auf dem VPS
// frisch, damit der Push-Monitor die echten Bestaende liest statt des app.js-Fallbacks.
setInterval(function(){if(!document.hidden){try{_ptfLastSync=0;ptfSyncServer();}catch(e){}}},300000);
setTimeout(function(){try{_ptfLastSync=0;ptfSyncServer();}catch(e){}},6000);
// COHERENCE: keep the pool tick fresh so ALL P&L views compute with the same exact price.
setTimeout(function(){try{refreshPoolTick();}catch(e){}},4000);
setInterval(function(){if(!document.hidden){try{refreshPoolTick();}catch(e){}}},60000);
document.addEventListener("visibilitychange",function(){if(!document.hidden){go();fetchSt();fetchTrades();fetchWal();startRefresh();try{refreshPoolTick();}catch(e){}try{fetchHoodie();}catch(e){}}});
// ═══ UI: Altcoin-Card direkt unter die G/V-Card ziehen + Zeilen-Abstand/Trenner in der Asset-Tabelle ═══
(function(){try{
  var _mv=function(){try{
    var p=document.getElementById("sec-ptf"),g=document.getElementById("sec-pnl");
    if(!p||!g)return;
    var pc=p.closest(".acc"),gc=g.closest(".acc");
    if(pc&&gc&&pc!==gc&&gc.nextSibling!==pc){gc.parentNode.insertBefore(pc,gc.nextSibling);}
  }catch(e){}};
  var _st=function(){try{
    if(document.getElementById("ptfRowStyle"))return;
    var s=document.createElement("style");s.id="ptfRowStyle";
    s.textContent="#ptfTableB td{padding-top:11px;padding-bottom:11px;border-bottom:1px solid rgba(60,80,110,.14)}#ptfTableB tr:last-child td{border-bottom:none}";
    document.head.appendChild(s);
  }catch(e){}};
  if(document.readyState!=="loading"){_st();_mv();}
  window.addEventListener("load",function(){_st();setTimeout(_mv,250);setTimeout(_mv,1200);});
}catch(e){}})();
