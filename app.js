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
var TGT=[.20,.30,.50,1,2,5,10,20,30,50,100], SEL=[10000,50000,100000,180000];
var MY_BURN=0, MY_STBURN=0, INVESTED=3350, AVG_ENTRY=0.003682;
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
  {id:"eth",symbol:"ETH",name:"Ethereum",geckoId:"ethereum",amount:0.856702,avgEntry:2344.42,totalCost:2008.50,source:"ledger",decimals:6,contract:null}
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
var LP=LP_FALLBACK.concat([LP_DAO]);
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
var MS=[{d:"05.12.25",b:10500,u:1196,n:"Market"}];
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
function F(n,d){if(d==null)d=2;if(!isFinite(n))return"—";var a=Math.abs(n);if(a>=1e9)return(n/1e9).toFixed(2)+"B";if(a>=1e6)return(n/1e6).toFixed(1)+"M";if(d===0)return(Math.round(n/10)*10).toLocaleString("en");if(a>=1e3)return(n/1e3).toFixed(d)+"K";return n.toFixed(d)}
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
var prevPrice=0, notifOn=false, soundOn=false, audioCtx=null;
function reqNotif(){if(!("Notification" in window)){alert("Browser does not support notifications");return;}
  Notification.requestPermission().then(function(p){if(p==="granted"){notifOn=true;alert("🔔 Alerts enabled!");
    // Subscribe to Web Push
    if('serviceWorker' in navigator){navigator.serviceWorker.ready.then(function(reg){
      reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBase64ToUint8Array(VAPID_PUBLIC)}).then(function(sub){
        window._pushSub=sub;localStorage.setItem('push_sub',JSON.stringify(sub.toJSON()));
        console.log('Push subscribed! Copy this to server:');console.log(JSON.stringify(sub.toJSON()));
      }).catch(function(e){console.log('Push subscribe err:',e);});
    });}
  }});}
function notify(title,body){if(notifOn&&Notification.permission==="granted"){try{new Notification(title,{body:body});}catch(e){}}if(soundOn)beep();}
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

// ═══ FETCH: Wallet (Ledger) ═══
async function fetchWal(){
  try{
    var lb=await rpc(BURN_TK,bof(W_LEDGER)),ls=await rpc(STBURN_TK,bof(W_LEDGER));
    var newB=Math.round(h2n(lb)),newS=Math.round(h2n(ls));
    // Safety: never overwrite valid balances with 0 (RPC failure)
    if(newB<=0&&MY_BURN>0)return;
    if(newS<=0&&MY_STBURN>0)return;
    wal.prev.burn=MY_BURN;wal.prev.st=MY_STBURN;
    MY_BURN=newB;MY_STBURN=newS;
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
  var totalBurnEq=MY_BURN+(MY_STBURN*stR);

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

  $("walGrid").innerHTML=
    banner+
    '<div style="display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap;margin-bottom:8px">'+
      '<span style="color:'+bClr+';font-weight:600">'+(bDrop?"":"+")+F(MY_BURN,0)+' BURN</span>'+
      '<span style="color:var(--dm)">·</span>'+
      '<span style="color:'+sClr+';font-weight:600">'+(sDrop?"":"+")+F(MY_STBURN,0)+' stBURN</span>'+
      '<span style="color:var(--dm)">·</span>'+
      '<span style="color:'+totalClr+';font-weight:700">'+totalAlertIcon+F(totalTokens,0)+' Total</span>'+
      (oldDropAlert?' <span style="color:var(--r);font-weight:700">⚠ DROP</span>':'')+
    '</div>'+
    '<div style="text-align:center">'+
      '<span style="font-size:9px;color:#ffffff;text-transform:uppercase;letter-spacing:1.2px;font-weight:600">BURN-Equivalent ≈</span> '+
      '<span style="color:var(--cy);font-weight:700;font-size:17px;margin-left:2px">'+F(totalBurnEq,0)+'</span>'+
      '<span style="font-size:11px;color:var(--cy);margin-left:4px;font-weight:500;opacity:.8">BURN</span>'+
    '</div>';
}

// Confirm wallet balance change — invoked by inline onclick

function walConfirmChange(){
  var totalNow=MY_BURN+MY_STBURN;
  localStorage.setItem("walConfirmedTotal",totalNow.toString());
  localStorage.removeItem("walNotifKey");
  // Sync to Hetzner server (so monitor stops alerting)
  try{
    fetch("http://95.216.152.31:8082/wallet/confirm",{method:"POST",mode:"cors"})
      .then(function(r){return r.json();})
      .then(function(d){console.log("server confirm:",d);})
      .catch(function(e){console.log("server confirm sync failed (browser blocks HTTP, APK ok):",e&&e.message);});
  }catch(e){}
  try{renderWal();}catch(e){}
}

// Hydrate from server on app load — server is source of truth
function fetchServerWalletState(){
  try{
    fetch("http://95.216.152.31:8082/wallet/state",{mode:"cors"})
      .then(function(r){return r.json();})
      .then(function(d){
        if(!d||d.error)return;
        // Sync confirmed_total — server wins
        if(d.confirmed_total>0){
          localStorage.setItem("walConfirmedTotal",d.confirmed_total.toString());
        }
        // ETH balance: take higher value (server vs local cache)
        if(d.eth>0&&typeof ptfAssets!=="undefined"){
          for(var i=0;i<ptfAssets.length;i++){
            if(ptfAssets[i].id==="eth"&&d.eth>ptfAssets[i].amount){
              ptfAssets[i].amount=d.eth;
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
        newLP.push({b:Math.round(bDep),lo:Math.round(pLo*10000)/10000,hi:Math.round(pHi*10000)/10000,label:"Sell"});
      }catch(e2){continue;}
    }
    if(newLP.length>0){
      // Detect closed LPs before overwriting LP[]
      try{detectClosedLPs(newLP);}catch(e){console.log("detectClose err:",e);}
      // Keep DAO Full Range, replace user LPs
      var dao=null;for(var di=0;di<LP.length;di++){if(LP[di].fr)dao=LP[di];}
      newLP.sort(function(a,b){return a.lo-b.lo;});
      LP=newLP;if(dao)LP.push(dao);
      LP.sort(function(a,b){if(a.fr)return 1;if(b.fr)return-1;return a.lo-b.lo;});
      ALP=0;for(var ai2=0;ai2<LP.length;ai2++)if(!LP[ai2].fr)ALP+=LP[ai2].b;
      lpLive=true;
      console.log("LP[] updated from chain:",newLP.length,"positions, ALP="+ALP);
      // Save state for next close detection
      lpPrevious=LP.filter(function(lp){return!lp.fr;}).map(function(lp){
        var cv2=v3(lp.b,lp.lo,lp.hi,P);
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
    var bestNf=null,bestHi=Infinity;
    for(var nf=0;nf<LP.length;nf++){if(LP[nf].fr)continue;
      // LP's hi must be above current P (not yet filled). Pick lowest hi.
      if(LP[nf].hi>P&&LP[nf].hi<bestHi){bestHi=LP[nf].hi;bestNf=nf;}}
    if(bestNf!==null){var nfDist=((LP[bestNf].hi-P)/P*100);
      var nfBuy=0,nfSrc="";
      var nfEst=buyflowEstimate(P,LP[bestNf].hi);
      nfBuy=nfEst.usdc;nfSrc=nfEst.src;
      console.log("NEXTFILL:","P=$"+P.toFixed(4),"target=$"+LP[bestNf].hi.toFixed(2),"src="+nfSrc+(lmapCache&&lmapCache.length>0?" ("+lmapCache.length+" buckets)":""),"K="+K.toFixed(0),"Y="+Y.toFixed(0),"nfBuy=$"+nfBuy.toFixed(0));
      // Sanity: cap absurd values (>$10M) — likely DAO full-range pollution in lmap buckets
      if(!isFinite(nfBuy)||nfBuy<0)nfBuy=0;
      if(nfBuy>10000000){console.log("NEXTFILL: capped from $"+nfBuy.toFixed(0)+" — likely DAO full-range pollution");nfBuy=0;}
      var nfV=v3(LP[bestNf].b,LP[bestNf].lo,LP[bestNf].hi,LP[bestNf].hi);
      nxtFill='<div style="line-height:1.8">Next Fill: <b style="color:var(--o)">$'+LP[bestNf].hi.toFixed(2)+'</b> <span style="color:var(--tx)">(↑'+nfDist.toFixed(0)+'%)</span><br>'+
        '<span style="color:var(--cy)">$'+F(nfBuy,0)+'</span> <span style="color:var(--tx)">buying power needed</span> · '+
        '<b style="color:var(--g)">$'+nfV.usdc.toLocaleString("en",{maximumFractionDigits:0})+'</b> <span style="color:var(--tx)">earnings when filled</span> · '+
        '<span style="color:var(--o)">'+F(LP[bestNf].b,0)+'</span> <span style="color:var(--tx)">BURN position</span></div>';}}
  $("nextFill").innerHTML=nxtFill||'<span style="color:var(--g)">All active positions filled ✓</span>';

  // P&L ACTIVE (compute early, needed by portfolio + P&L section)
  var pD=0,pL=0,pU=0,maxU=0;for(var pi=0;pi<LP.length;pi++){if(LP[pi].fr)continue;var pv=v3(LP[pi].b,LP[pi].lo,LP[pi].hi,P);pD+=LP[pi].b;pL+=pv.left;pU+=pv.usdc;var pf=v3(LP[pi].b,LP[pi].lo,LP[pi].hi,LP[pi].hi);maxU+=pf.usdc;}
  var lpV=pL*P+pU,hdV=pD*P,il=lpV-hdV,ilP=hdV>0?(il/hdV*100):0;
  var outU=maxU-pU,fillPct=maxU>0?(pU/maxU*100):0;

  // PORTFOLIO (unified) — TOTAL_BURN_EQUIVALENT is the single source of truth
  var bEq=MY_STBURN*stR;
  var TOTAL_BURN_EQ=MY_BURN+bEq+pL;
  var portUsd=TOTAL_BURN_EQ*P+pU;
  var mult=P>0&&AVG_ENTRY>0?P/AVG_ENTRY:0;
  // Group 1 — Investment (Entry + Invested merged)
  $("portG1").innerHTML=[
    '<div class="mb" style="padding:14px"><small style="color:#fff">AVG ENTRY</small><b class="neon-w" style="color:#fff;font-size:18px;font-weight:700;display:block">$'+AVG_ENTRY.toFixed(4)+'</b><span style="font-size:9px;color:var(--mt);display:block;margin-top:2px">$'+F(INVESTED,0)+' invested</span></div>',
    '<div class="mb" style="padding:14px"><small style="color:#fff">CURRENT PRICE</small><b class="key-val" style="color:'+(P>=AVG_ENTRY?"var(--g)":"var(--r)")+'">'+FP(P)+'</b></div>',
    '<div class="mb" style="padding:14px"><small style="color:#fff">MULTIPLE</small><b class="key-val" style="color:'+(mult>=10?"var(--g)":mult>=2?"var(--o)":"var(--tx)")+'">'+(mult>0?mult.toFixed(1)+"x":"…")+'</b></div>'
  ].join("");
  // Group 2 — Holdings (guarded)
  if(wal.ok||MY_BURN>0){
  $("portG2").innerHTML=[
    MB("BURN",F(MY_BURN,0),"var(--o)"),MB("stBURN",F(MY_STBURN,0),"var(--p)"),MB("LP Left",F(pL,0),"var(--b)")
  ].join("");}
  // Portfolio Real — V3 sell impact via lmapCache (more accurate for V3 pool than V2 K=X*Y)
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
  // Group 3 — Value (guarded)
  if(wal.ok||MY_BURN>0){
  var realizedProfit=TR-(TS*AVG_ENTRY);
  $("portG3").innerHTML=[
    '<div class="mb"><small>PORTFOLIO</small><b class="key-val neon-w" style="color:var(--br)">$'+F(portUsd,0)+'</b><span style="font-size:9px;color:var(--mt);display:block;margin-top:2px">on paper</span></div>',
    '<div class="mb"><small>PORTFOLIO REAL</small><b class="key-val neon-cy" style="color:var(--cy)">$'+F(portReal,0)+'</b><span style="font-size:9px;color:var(--mt);display:block;margin-top:2px">'+realImpact.toFixed(0)+'% slippage <span style="color:var(--dm);font-size:8px">'+realSrc+'</span></span></div>',
    MB("Realized","$"+realizedProfit.toLocaleString("en",{minimumFractionDigits:0,maximumFractionDigits:0}),"var(--g)"),
    '<div class="mb"><small>PROFIT REAL</small><b class="key-val neon-cy" style="color:'+(portReal+TR-INVESTED>=0?"var(--cy)":"var(--r)")+'">'+(portReal+TR-INVESTED>=0?"+":"-")+"$"+F(Math.abs(portReal+TR-INVESTED),0)+'</b><span style="font-size:9px;color:var(--mt);display:block;margin-top:2px">if sold now</span></div>'
  ].join("");}

  // stBURN Yield (yield value emphasized)
  if(stOK){
    var stV=bEq*P,stY=bEq-MY_STBURN,stYP=MY_STBURN>0?(stY/MY_STBURN*100):0;
    $("stGrid").innerHTML=[MB("stBURN",F(MY_STBURN,0),"var(--p)"),MB("Ratio "+(stSrc==="chain"?"⛓":"◇"),stR.toFixed(6),"var(--cy)"),
      MB("BURN Equiv",F(bEq,0),"var(--o)")].join("")+
      '<div class="mb"><small>YIELD</small><b class="yield-big neon-g" style="color:'+(stY>=0?"var(--g)":"var(--r)")+'">+'+(stY>=0?F(stY,0):0)+' BURN</b></div>'+
      [MB("Yield $","$"+F(stY*P,0),stY>=0?"var(--g)":"var(--r)"),MB("Yield %",stYP.toFixed(2)+"%",stYP>=0?"var(--g)":"var(--r)")].join("");
  }

  // SUPPLY
  if(sup.total>0){var bP=sup.total>0?(sup.burned/sup.total*100):0;
    $("supplyGrid").innerHTML=[MB("Total Supply",F(sup.total,0),"var(--br)"),MB("Burned",F(sup.burned,0)+" ("+bP.toFixed(1)+"%"+")","var(--r)"),
      MB("Locked",F(sup.locked,0),"var(--dm)"),MB("Circulating",F(sup.circ,0),"var(--o)"),
      MB("stBURN Supply",F(sup.stSup,0),"var(--p)"),MB("Circ MCap","$"+F(sup.circ*P,0),"var(--g)")].join("");
  }else{$("supplyGrid").innerHTML='<div class="ld">Loading on-chain supply data</div>';}

  // P&L ACTIVE (display)
  var maxHi=0;for(var mh=0;mh<LP.length;mh++){if(!LP[mh].fr&&LP[mh].hi>maxHi)maxHi=LP[mh].hi;}
  var lpExposure=portUsd>0?(lpV/portUsd*100):0;
  // P&L Hero: USDC Earned
  $("pnlHero").innerHTML='<div class="mb" style="padding:16px;text-align:center"><small>USDC EARNED</small><b class="key-val neon-g" style="color:var(--g)">$'+F(pU,2)+'</b></div>';
  // P&L Grid
  $("pnlGrid").innerHTML=[MB("Deposited",F(pD,0)+" BURN","var(--o)"),MB("Left",F(pL,0)+" BURN","var(--tx)"),
    MB("100% Filled","$"+F(maxU,0)+" @ $"+maxHi.toFixed(2),"var(--br)"),MB("Outstanding","$"+F(outU,0),"var(--cy)"),
    MB("Filled",fillPct.toFixed(1)+"%",fillPct>50?"var(--g)":fillPct>0?"var(--o)":"var(--mt)"),
    MB("LP Exposure",lpExposure.toFixed(1)+"%","var(--dm)")].join("");

  // HISTORY
  var hR="";for(var hi2=0;hi2<CL.length;hi2++){var hp=CL[hi2],hr=(hp.lo>0&&hp.hi>0)?FP(hp.lo)+"–"+FP(hp.hi):"Ø "+FP(hp.u/hp.b);
    hR+='<tr><td style="color:var(--mt)">'+hp.d+'</td><td style="color:var(--o)">'+F(hp.b,0)+'</td><td style="font-size:10px;color:var(--dm)">'+hr+'</td><td style="color:var(--g)">$'+F(hp.u,2)+'</td><td style="font-size:9px;color:var(--mt)">$'+(hp.u/hp.b).toFixed(4)+'</td></tr>';}
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

  // LP TABLE
  var cS=0,cU=0;for(var li=0;li<LP.length;li++){if(LP[li].fr)continue;var cv=v3(LP[li].b,LP[li].lo,LP[li].hi,P);cS+=(LP[li].b-cv.left);cU+=cv.usdc;}
  function ring(p,cl,tx){p=Math.max(0,Math.min(100,p||0));return'<div style="width:44px;height:44px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:conic-gradient('+cl+' '+p+'%,#1a2235 '+p+'% 100%)"><div style="width:34px;height:34px;border-radius:50%;background:#0c1220;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:'+cl+'">'+tx+'</div></div>';}
  var lpR="",tBI=0,tBL=0,tU2=0;
  for(var lp=0;lp<LP.length;lp++){var pos=LP[lp],st,cl,bI,bL,uE,rng,pTxt,ringH,distH="";
    if(pos.fr)continue; // DAO shown in Pool Liquidity Map, not here
    rng="$"+pos.lo.toFixed(pos.lo<1?3:2)+" → $"+pos.hi.toFixed(2);bI=pos.b;var v=v3(pos.b,pos.lo,pos.hi,P);bL=v.left;uE=v.usdc;
      var dLo=pos.lo>0?((P-pos.lo)/pos.lo*100):0,dHi=P>0?((pos.hi-P)/P*100):0;
      if(P<pos.lo){ringH=ring(0,"#334155","—");distH='<span style="font-size:12px;color:var(--dm)">↑'+Math.abs(((pos.lo-P)/P)*100).toFixed(0)+'%</span>';}
      else if(P>=pos.hi){ringH=ring(100,"#34d399","✓");distH='<span style="font-size:12px;color:var(--g)">✓</span>';}
      else{var fp=v.pct;ringH=ring(fp,"#34d399",fp.toFixed(0)+"%");distH='<span style="font-size:11px;color:var(--mt)">↓'+dLo.toFixed(0)+'%</span><br><span style="font-size:11px;color:var(--tx)">↑'+dHi.toFixed(0)+'%</span>';}
    // USDC to Fill — uses buyflowEstimate (same V3/V2 hierarchy as Next Fill + Market Analysis)
    var fillH="";
    if(P>=pos.hi){fillH='<span style="color:var(--g);font-size:10px">Filled</span>';}
    else if(P<pos.lo){fillH='<span style="color:var(--dm);font-size:9px">Below</span>';}
    else{var bfFill=buyflowEstimate(P,pos.hi);var dU2=bfFill.usdc;fillH=dU2>0?'<span style="color:var(--cy)">$'+F(dU2,0)+'</span>':'—';}
    // 100% filled USDC
    var vMax=v3(pos.b,pos.lo,pos.hi,pos.hi);var maxH='<span style="color:var(--cy)">$'+vMax.usdc.toLocaleString("en",{maximumFractionDigits:0})+'</span>';
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
  try{checkAlerts();}catch(e){}
  try{renderStakingApy();}catch(e){}

  // BUYFLOW — V3 concentrated liquidity calculation using real LP scan data
  function v3BuyflowCalc(curP,tgtP){
    if(!lmapCache||!curP||!tgtP||tgtP<=curP)return{usdc:0,burn:0};
    var totalUsdc=0,totalBurn=0;
    for(var bi=0;bi<lmapCache.length;bi++){
      var bk=lmapCache[bi];
      if(bk.hi<=curP||bk.lo>=tgtP||bk.burn<=0)continue;
      var pStart=Math.max(curP,bk.lo),pEnd=Math.min(tgtP,bk.hi);
      // Fraction of bucket's BURN sold in overlap
      var sqLo=1/Math.sqrt(bk.lo),sqHi=1/Math.sqrt(bk.hi);
      var fullRange=sqLo-sqHi;
      if(fullRange<=0)continue;
      var overlapRange=1/Math.sqrt(pStart)-1/Math.sqrt(pEnd);
      var frac=overlapRange/fullRange;
      var burnSold=bk.burn*frac;
      // USDC needed: derive L from burn, then L*(sqrt(pEnd)-sqrt(pStart))
      var L=bk.burn/fullRange;
      var usdcNeeded=L*(Math.sqrt(pEnd)-Math.sqrt(pStart));
      totalBurn+=burnSold;
      totalUsdc+=usdcNeeded;
    }
    return{usdc:totalUsdc,burn:totalBurn};
  }
  // SHARED: identical buyflow estimation for Next Fill + Market Analysis.
  // 3-tier hierarchy: V3 buckets (most accurate, post-LP-scan) → V2 K=X*Y → 0
  // POOL_LIQ tier removed because it includes DAO Full-Range liq → unrealistic for wide price moves.
  function buyflowEstimate(curP,tgtP){
    if(!curP||!tgtP||tgtP<=curP)return{usdc:0,burn:0,src:""};
    if(lmapCache&&lmapCache.length>0){
      var bf=v3BuyflowCalc(curP,tgtP);
      return{usdc:bf.usdc,burn:bf.burn,src:"V3"};
    }
    if(K>0&&Y>0&&X>0){
      var u=Math.sqrt(K*tgtP)-Y;
      var b=X-Math.sqrt(K/tgtP);
      return{usdc:Math.max(0,u),burn:Math.max(0,b),src:"V2"};
    }
    return{usdc:0,burn:0,src:""};
  }
  var bR="",hasV3=lmapCache&&lmapCache.length>0;
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
  var siR="",siSrc=lmapCache&&lmapCache.length>0?"V3":"V2";
  for(var s=0;s<SEL.length;s++){
    var n=SEL[s],uo=0,np=0,imp=0;
    var v3si=v3SellImpact(n);
    if(v3si){
      uo=v3si.usdc;np=v3si.newPrice;imp=P>0?((np-P)/P)*100:0;
    }else if(K>0&&Y>0){
      // V2 K=X*Y fallback
      var xn=X+n,yn=K/xn;np=yn/xn;imp=P>0?((np-P)/P)*100:0;uo=Math.max(0,Y-yn);
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
    minAgo:minAgo,blk:blk,wallet:wallet};}

function tradeRow(t){
  var agoT=t.minAgo<1?"now":t.minAgo<60?t.minAgo+"m":t.minAgo<1440?Math.round(t.minAgo/60)+"h":Math.round(t.minAgo/1440)+"d";
  var clr=t.isBuy?"var(--g)":"var(--r)";
  var wS=t.wallet.length>10?t.wallet.slice(0,6)+"…"+t.wallet.slice(-4):"—";
  var bD=t.burn>=100000?F(t.burn,1):t.burn.toLocaleString("en",{maximumFractionDigits:2});
  var uD="$"+(t.usdc>=100000?F(t.usdc,1):t.usdc.toLocaleString("en",{minimumFractionDigits:2,maximumFractionDigits:2}));
  var whaleTag=t.usdc>=WHALE_MIN?"🐋 ":"";
  var wLink=t.wallet?'<a href="https://arbiscan.io/address/'+t.wallet+'" target="_blank" rel="noopener" style="font-size:9px;color:var(--b)">'+wS+'</a>':'<span style="font-size:9px;color:var(--dm)">—</span>';
  var whaleBg=t.usdc>=1000?"background:rgba(251,191,36,.04);":t.usdc>=500?"background:rgba(251,191,36,.02);":"";
  return'<tr style="'+whaleBg+'"><td style="color:var(--mt)">'+agoT+'</td><td style="color:'+clr+';font-weight:600">'+(t.isBuy?"BUY":"SELL")+'</td><td style="color:var(--o)">'+bD+'</td><td style="color:var(--g)">'+whaleTag+uD+'</td><td>'+FP(t.price)+'</td><td>'+wLink+'</td></tr>';}

function renderTrades(){
  // Top 5 always visible
  var top1="";if(allTrades.length>0)top1=tradeRow(allTrades[0]);
  $("tradeTop").innerHTML=top1||'<tr><td colspan="6"><span class="skel" style="width:100%;height:12px"></span></td></tr>';
  $("tradeCnt").textContent=allTrades.length;
  // Paginated all
  var pages=Math.max(1,Math.ceil(allTrades.length/TRADES_PP));
  if(tradePg_>=pages)tradePg_=pages-1;
  var start=tradePg_*TRADES_PP,rows="";
  for(var j=start;j<Math.min(start+TRADES_PP,allTrades.length);j++)rows+=tradeRow(allTrades[j]);
  $("tradeAll").innerHTML=rows||'<tr><td colspan="6" style="color:var(--dm)">No trades</td></tr>';
  $("tPgInfo").textContent=(tradePg_+1)+"/"+pages;
  $("tPrev").disabled=tradePg_<=0;$("tNext").disabled=tradePg_>=pages-1;
  try{renderWhales();}catch(e){}
  try{renderCapitalFlow();}catch(e){}
  try{renderPoolHealth();}catch(e){}
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
      renderTrades();
      whaleFirstLoad=false;
      var initDays=Math.round(BLOCK_CHUNK*0.26/86400);
      $("tLoadStat").textContent="Loaded ~"+initDays+"d";
      tradeCacheSave();
      // Kick off backfill to reach target depth
      setTimeout(function(){tradeAutoBackfill();},3000);
    }else{
      // Merge new trades at front, dedupe by block
      var added=0;
      for(var i2=0;i2<logs.length;i2++){var t2=decodeSwap(logs[i2],tradeLatest);if(t2&&t2.blk>topBlk){allTrades.unshift(t2);added++;}}
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
    renderTrades();
    tradeCacheSave();
    var days=Math.round((tradeLatest-from)*0.26/86400);
    $("tLoadStat").textContent=allTrades.length+" trades · ~"+days+"d history";
  }catch(e){$("tLoadStat").textContent="Error loading";}
  $("tMore").disabled=false;}

// ═══ POOL LIQUIDITY MAP (bitmap + subgraph) ═══
var lmapCache=null,lmapTs=0;
// Load cached LP owners from localStorage (closed LPs never change)
try{
  var cachedOwners=localStorage.getItem("lmap_owners");
  if(cachedOwners){window._lpOwners=JSON.parse(cachedOwners);console.log("LMAP: loaded "+window._lpOwners.length+" cached LP owners");}
}catch(e){}

// Render cached LPs immediately when section is toggled open
var _origTog=window.tog;
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
var LMAP_BUCKETS=[.05,.10,.12,.14,.16,.18,.20,.25,.30,.50,.75,1,1.5,2,3,5,10];


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

async function scanLiqMap(){
  if(lmapCache&&lmapTs>Date.now()-600000){renderLmap(lmapCache);return;}
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
      var txSet={};
      for(var ml=0;ml<mintLogs.length;ml++){if(mintLogs[ml].transactionHash)txSet[mintLogs[ml].transactionHash]=1;}
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
                allTokenIds.push({id:tokenId,minter:minter,tx:txList[ti].slice(0,10)});
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
          lpOwners.push({lo:ppLo,hi:ppHi,owner:owner,isMe:isMe,liq:Number(pLiq),closed:isClosed,tokenId:tid.toString(),tL:ptL,tU:ptU,burnOut:0,usdcOut:0});
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
    var ranges=[];
    var below=tickData.filter(function(t){return t.tick<=curTick;}).sort(function(a,b){return b.tick-a.tick;});
    var L=curLiq,prev=curTick;
    for(var b2=0;b2<below.length;b2++){
      if(prev!==below[b2].tick)ranges.push({tL:below[b2].tick,tH:prev,liq:L});
      L-=below[b2].liqNet;prev=below[b2].tick;}
    var above=tickData.filter(function(t){return t.tick>curTick;}).sort(function(a,b){return a.tick-b.tick;});
    L=curLiq;prev=curTick;
    for(var a2=0;a2<above.length;a2++){
      if(prev!==above[a2].tick)ranges.push({tL:prev,tH:above[a2].tick,liq:L});
      L+=above[a2].liqNet;prev=above[a2].tick;}

    // 6. Aggregate into price buckets
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
      var owners=[];
      for(var oi=0;oi<lpOwners.length;oi++){if(lpOwners[oi].hi>bLo&&lpOwners[oi].lo<bHi)owners.push(lpOwners[oi]);}
      owners.sort(function(a,b2){return b2.liq-a.liq;});
      buckets.push({lo:bLo,hi:bHi,burn:burnD,usdc:burnD*(bLo+bHi)/2,active:P>=bLo&&P<bHi,owners:owners});}
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
        }
        console.log("LMAP CALIBRATION: raw-sum="+F(sumBucketBurn,0)+" BURN → on-chain aB="+F(aB,0)+" (factor "+calB.toFixed(4)+") | usdc factor "+calU.toFixed(4));
      }
    }catch(e){console.log("LMAP calib err:",e.message);}
    var bucketsWithOwners=0;for(var boi=0;boi<buckets.length;boi++){if(buckets[boi].owners&&buckets[boi].owners.length>0)bucketsWithOwners++;}
    console.log("LMAP: "+buckets.length+" buckets, "+bucketsWithOwners+" have LP owners assigned");
    lmapCache=buckets;lmapTs=Date.now();
    // Cache closed LPs permanently (they never change)
    try{
      var closedLPs=[];
      for(var cli=0;cli<lpOwners.length;cli++){if(lpOwners[cli].closed)closedLPs.push(lpOwners[cli]);}
      if(closedLPs.length>0)localStorage.setItem("lmap_closed",JSON.stringify(closedLPs));
      localStorage.setItem("lmap_owners",JSON.stringify(lpOwners));
      window._lpOwners=lpOwners;
      console.log("LMAP: cached "+closedLPs.length+" closed + "+lpOwners.length+" total LPs");
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
  }catch(e){console.log("LMAP err:",e);
    // Keep previous owners if scan fails
    if(!window._lpOwners||window._lpOwners.length===0){
      try{var co=localStorage.getItem("lmap_owners");if(co)window._lpOwners=JSON.parse(co);}catch(e2){}
    }
    var cachedOwn=window._lpOwners||[];
    if(cachedOwn.length>0){
      $("lmapB").innerHTML='<tr><td colspan="6" style="color:var(--warn);text-align:center;font-size:10px">Live scan failed — showing '+cachedOwn.length+' cached positions <button class="btn" onclick="lmapCache=null;lmapTs=0;scanLiqMap()">retry</button></td></tr>';
      renderLmap([]);
    }else{
      $("lmapB").innerHTML='<tr><td colspan="6" style="color:var(--r);text-align:center">Liquidity scan unavailable — <button class="btn" onclick="scanLiqMap()">retry</button></td></tr>';
    }
    $("lmapStatus").textContent="";}
}

function renderLmap(buckets){
  var lpOwners=window._lpOwners||[];
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
    if(!dl||!dl.liq||dl.liq<=0||P<=0)return{b:bn,u:uc};
    try{
      var sqP=Math.sqrt(1e12/P);
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
    var WALLET_LABELS={"0x72ade1":"DAO Vault","0x505042":"Noah (DeFi)","0x6e37cc":"Noah (Alt)","0x1b5b96":"Elite","0x0e7121":"Founder","0x6324b1":"Private","0x988966":"Private"};
    var wLabel="";for(var wk in WALLET_LABELS){if(ow.addr.indexOf(wk)===0){wLabel=WALLET_LABELS[wk];break;}}
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
          if(isFullRange&&P>0){
            // Exact V3: compute amounts from liquidity + sqrtPrices
            // Raw sqrtPrice = sqrt(1e12/P) to match tick-based sqrtPL/sqrtPU
            var sqrtP2=Math.sqrt(1e12/P);
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
          } else if(burnDep>0&&P>0&&!isFullRange){
            var cv=v3(burnDep,lp.lo,lp.hi,P);lpLeft=cv.left;lpUsdc=cv.usdc;lpPct=cv.pct;
          }
        }catch(e){}
        // Calculate projected USDC when fully filled
        var ifFilled=0;
        if(!isFullRange&&burnDep>0){
          var avgSell=(lp.lo+lp.hi)/2;
          ifFilled=burnDep*avgSell;
        }else if(isFullRange){
          ifFilled=lpLeft*P+lpUsdc; // Current total value
        }
        var isInRange=P>=lp.lo&&P<lp.hi;
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
}

// ═══ WALLET TRACKER (isolated module) ═══
var WT_NFT="0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
var wtCache=null,wtCacheTs=0;
function wtPad(n){return BigInt(n).toString(16).padStart(64,"0");}
function wtI24(hex){var v=parseInt(hex,16);return v>=0x800000?v-0x1000000:v;}
function wtTickToPrice(tick){return 1e12/Math.pow(1.0001,tick);}
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
        var cv=v3(bDep,pLo,pHi,P);
        lps.push({lo:pLo,hi:pHi,burn:bDep,left:cv.left,usdc:cv.usdc,pct:cv.pct,id:tId.toString(),closed:false});
      }catch(e2){console.log("WT NFT["+i+"] err:",e2);continue;}
    }
    console.log("WT found",lps.length,"BURN/USDC LPs");
    var bEq2=wBurn+wSt*stR,lpB=0,lpU=0;
    for(var j=0;j<lps.length;j++){lpB+=lps[j].left;lpU+=lps[j].usdc;}
    var tEq=bEq2+lpB,tVal=tEq*P+lpU;
    var res={addr:addr,burn:wBurn,stBurn:wSt,lps:lps,bEq:bEq2,lpBurn:lpB,lpUsdc:lpU,totalEq:tEq,totalVal:tVal};
    wtCache=res;wtCacheTs=Date.now();
    wtRender(res);
  }catch(e){console.log("WT err:",e);$("wtResult").innerHTML='<span style="color:var(--r)">Wallet data unavailable</span>';}
  $("wtBtn").disabled=false;$("wtBtn").textContent="Load";
}

function wtRender(d){
  var wS=d.addr.slice(0,6)+"…"+d.addr.slice(-4);
  var h='<div style="margin-bottom:8px"><a href="https://arbiscan.io/address/'+d.addr+'" target="_blank" style="color:var(--b);font-size:10px">'+wS+'</a></div>';
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

// ═══ PRICE SCENARIO SIMULATION ═══
var simCache={};

function runSim(focus){
  if(P<=0||K<=0){$("simStatus").textContent="Need price data first";return;}
  // Highlight active button
  [30,90,180,365].forEach(function(d){$("sim"+d).style.borderColor=d===focus?"var(--b)":"";});

  // Calculate daily metrics from trade data
  var buyVol=0,sellVol=0,tradeDays=0;
  if(allTrades.length>1){
    var oldest=allTrades[allTrades.length-1].minAgo;
    tradeDays=Math.max(1,oldest/1440);
    for(var i=0;i<allTrades.length;i++){if(allTrades[i].isBuy)buyVol+=allTrades[i].usdc;else sellVol+=allTrades[i].usdc;}
  }else{tradeDays=15;buyVol=500;sellVol=200;}
  var dailyNetInflow=tradeDays>0?(buyVol-sellVol)/tradeDays:0;
  var dailyBuyVol=tradeDays>0?buyVol/tradeDays:0;

  // Price change from trades (momentum)
  var dailyReturn=0;
  if(allTrades.length>=2){
    var pOld=allTrades[allTrades.length-1].price,pNew=allTrades[0].price;
    if(pOld>0&&tradeDays>0)dailyReturn=(Math.pow(pNew/pOld,1/tradeDays)-1);
  }

  // Generate projections for each day
  var horizons=[30,90,180,365];
  var maxDays=focus;
  var momentum=[],inflow=[],liquidity=[];

  for(var d=0;d<=maxDays;d++){
    // Model 1: Momentum (compound daily return)
    var mP=P*Math.pow(1+dailyReturn,d);
    momentum.push(mP);

    // Model 2: Capital Inflow (buy pressure vs x*y=k)
    var simY2=Y+dailyNetInflow*d;
    var iP=simY2>0?simY2*simY2/K:P;
    if(iP<P*0.1)iP=P*0.1; // floor
    inflow.push(iP);

    // Model 3: Liquidity-constrained (step through LP ranges)
    var totalBuy=dailyBuyVol*d;
    var simX3=X,simY3=Y;
    // Simulate buys: USDC in, BURN out
    if(totalBuy>0&&simX3>0){simY3=Y+totalBuy;simX3=K/simY3;}
    var lP=simY3/simX3;
    // Cap at realistic max (can't go infinite)
    if(lP>P*100)lP=P*100;
    liquidity.push(lP);
  }

  // Summary table for all horizons
  var rows="";
  var models=[
    {name:"Momentum",clr:"var(--cy)",pts:function(dd){return P*Math.pow(1+dailyReturn,dd);}},
    {name:"Capital Inflow",clr:"var(--g)",pts:function(dd){var sy=Y+dailyNetInflow*dd;return sy>0?sy*sy/K:P;}},
    {name:"Liquidity",clr:"var(--o)",pts:function(dd){var sy=Y+dailyBuyVol*dd;var sx=K/sy;return sy/sx;}}
  ];
  for(var mi=0;mi<models.length;mi++){
    var m=models[mi];
    rows+='<tr><td style="color:'+m.clr+';font-weight:600">'+m.name+'</td>';
    for(var hi=0;hi<horizons.length;hi++){
      var fp=m.pts(horizons[hi]);
      var mult=fp/P;
      rows+='<td style="color:'+(fp>=P?"var(--g)":"var(--r)")+'">'+FP(fp)+'<br><span style="font-size:8px;color:var(--dm)">'+mult.toFixed(1)+'x</span></td>';}
    rows+='</tr>';}
  $("simB").innerHTML=rows;

  // Summary grid
  $("simGrid").innerHTML=
    MB("Daily Return",(dailyReturn*100).toFixed(2)+"%",dailyReturn>=0?"var(--g)":"var(--r)")+
    MB("Daily Buy Vol","$"+F(dailyBuyVol,0),"var(--cy)")+
    MB("Net Inflow/Day","$"+F(dailyNetInflow,0),dailyNetInflow>=0?"var(--g)":"var(--r)")+
    MB("Trade Days",Math.round(tradeDays)+"d","var(--br)");

  // Draw chart
  drawSimChart(focus,momentum,inflow,liquidity);
  $("simStatus").textContent="Based on "+allTrades.length+" trades over "+Math.round(tradeDays)+"d · "+new Date().toLocaleTimeString();
}

function drawSimChart(days,mom,inf,liq){
  // Find min/max across all series
  var allPts=mom.concat(inf).concat(liq);
  var mn=Math.min.apply(null,allPts),mx=Math.max.apply(null,allPts);
  if(mx<=mn)mx=mn*1.1||1;
  var w=700,h=180,pad=40,pw=w-pad*2,ph=h-30;

  function toX(i){return pad+i/(days)*pw;}
  function toY(v){return 10+ph-(v-mn)/(mx-mn)*ph;}
  function line(pts,clr){
    var d="";for(var i=0;i<pts.length;i++){d+=(i===0?"M":"L")+toX(i).toFixed(1)+","+toY(pts[i]).toFixed(1);}
    return'<path d="'+d+'" fill="none" stroke="'+clr+'" stroke-width="1.5" opacity=".8"/>';}

  // Price line at current
  var curY=toY(P);
  var svg='<svg viewBox="0 0 '+w+' '+h+'" style="width:100%;height:100%" xmlns="http://www.w3.org/2000/svg">';
  // Grid lines
  var steps=5;
  for(var gi=0;gi<=steps;gi++){
    var gv=mn+(mx-mn)*gi/steps;var gy=toY(gv);
    svg+='<line x1="'+pad+'" y1="'+gy.toFixed(1)+'" x2="'+(w-10)+'" y2="'+gy.toFixed(1)+'" stroke="rgba(30,41,59,.3)" stroke-width="0.5"/>';
    svg+='<text x="2" y="'+(gy+3).toFixed(1)+'" fill="#94a3b8" font-size="8" font-family="JetBrains Mono">'+FP(gv)+'</text>';}
  // Current price line
  svg+='<line x1="'+pad+'" y1="'+curY.toFixed(1)+'" x2="'+(w-10)+'" y2="'+curY.toFixed(1)+'" stroke="rgba(226,232,240,.15)" stroke-width="1" stroke-dasharray="4,4"/>';
  // Day labels
  var dayMarks=[0,Math.round(days/4),Math.round(days/2),Math.round(days*3/4),days];
  for(var di2=0;di2<dayMarks.length;di2++){
    var dx=toX(dayMarks[di2]);
    svg+='<text x="'+dx.toFixed(1)+'" y="'+(h-2)+'" fill="#94a3b8" font-size="8" text-anchor="middle" font-family="JetBrains Mono">'+dayMarks[di2]+'d</text>';}
  // Lines
  svg+=line(mom,"#22d3ee");
  svg+=line(inf,"#34d399");
  svg+=line(liq,"#fb923c");
  // Legend
  svg+='<circle cx="'+(w-140)+'" cy="12" r="3" fill="#22d3ee"/><text x="'+(w-133)+'" y="15" fill="#94a3b8" font-size="8" font-family="Inter">Momentum</text>';
  svg+='<circle cx="'+(w-140)+'" cy="24" r="3" fill="#34d399"/><text x="'+(w-133)+'" y="27" fill="#94a3b8" font-size="8" font-family="Inter">Inflow</text>';
  svg+='<circle cx="'+(w-140)+'" cy="36" r="3" fill="#fb923c"/><text x="'+(w-133)+'" y="39" fill="#94a3b8" font-size="8" font-family="Inter">Liquidity</text>';
  svg+='</svg>';
  $("simChart").innerHTML=svg;
}

// ═══ LP P&L DETAIL ═══
function renderLpPnl(){
  try{
    if(!$("lpPnlB")||P<=0)return;
    var rows="",tVN=0,tHV=0,tIL=0,tSold=0,tUsdc=0;
    // Active LPs
    for(var i=0;i<LP.length;i++){
      if(LP[i].fr)continue;
      if(LP[i].lo<=0||LP[i].hi<=0)continue;
      var cv=v3(LP[i].b,LP[i].lo,LP[i].hi,P);
      var sold=LP[i].b-cv.left;
      var avgSell=sold>0?cv.usdc/sold:0;
      var valueNow=cv.left*P+cv.usdc;
      var hodlValue=LP[i].b*P;
      var il=valueNow-hodlValue;
      var ilPct=hodlValue>0?(il/hodlValue*100):0;
      var ff=v3(LP[i].b,LP[i].lo,LP[i].hi,LP[i].hi);
      var rng="$"+LP[i].lo.toFixed(LP[i].lo<1?3:2)+" → $"+LP[i].hi.toFixed(2);
      var avgClr=avgSell>P?"var(--g)":avgSell>0?"var(--r)":"var(--dm)";
      var ilClr=il>=0?"var(--g)":"var(--r)";
      tVN+=valueNow;tHV+=hodlValue;tIL+=il;tSold+=sold;tUsdc+=cv.usdc;
      rows+='<tr><td class="bld">'+rng+' <span style="font-size:8px;color:var(--g)">ACTIVE</span></td><td style="color:var(--o)">'+F(sold,0)+'</td>';
      rows+='<td style="color:'+avgClr+'">'+(sold>0?"$"+avgSell.toFixed(4):"—")+'</td>';
      rows+='<td style="color:var(--br)">$'+F(valueNow,2)+'</td>';
      rows+='<td style="color:var(--dm)">$'+F(hodlValue,2)+'</td>';
      rows+='<td style="color:'+ilClr+'">'+(il>=0?"+":"-")+"$"+F(Math.abs(il),2)+'</td>';
      rows+='<td style="color:'+ilClr+'">'+ilPct.toFixed(1)+'%</td>';
      rows+='<td style="color:var(--g)">$'+F(ff.usdc,0)+'</td></tr>';
    }
    // Closed LPs
    for(var ci2=0;ci2<CL.length;ci2++){
      var c=CL[ci2];
      var cAvg=c.b>0?c.u/c.b:0;
      var cHodl=c.b*P;
      var cIl=c.u-cHodl;
      var cIlPct=cHodl>0?(cIl/cHodl*100):0;
      var cRng=(c.lo>0&&c.hi>0)?"$"+c.lo.toFixed(c.lo<1?3:2)+"→$"+c.hi.toFixed(2):"Ø $"+(c.u/c.b).toFixed(4);
      var cAvgClr=cAvg>P?"var(--g)":"var(--r)";
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
      var mHodl=m.b*P;
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

// ═══ WHALE TRADE DETECTOR ═══
var WHALE_MIN=501;
var whaleFirstLoad=true;

function detectWhales(){
  if(!allTrades||allTrades.length===0)return[];
  return allTrades.filter(function(t){return t.usdc>=WHALE_MIN;});
}

function renderWhales(){
  try{
    if(!$("whaleTableB"))return;
    var whales=detectWhales();
    if(whales.length===0){
      $("whaleTableB").innerHTML='<tr><td colspan="6" style="color:var(--dm);text-align:center">No whale activity detected</td></tr>';
      $("whaleSummary").innerHTML="";
      return;
    }
    var buyVol=0,sellVol=0,biggest=whales[0];
    for(var i=0;i<whales.length;i++){
      if(whales[i].isBuy)buyVol+=whales[i].usdc;else sellVol+=whales[i].usdc;
      if(whales[i].usdc>biggest.usdc)biggest=whales[i];
    }
    $("whaleSummary").innerHTML=MB("Whale Trades",whales.length,"var(--br)")+
      MB("Buy Volume","$"+F(buyVol,0),"var(--g)")+MB("Sell Volume","$"+F(sellVol,0),"var(--r)")+
      MB("Biggest","$"+F(biggest.usdc,0)+" "+(biggest.isBuy?"BUY":"SELL"),biggest.isBuy?"var(--g)":"var(--r)");
    var rows="";
    for(var j=0;j<Math.min(20,whales.length);j++){
      var w=whales[j];
      var agoT=w.minAgo<1?"now":w.minAgo<60?w.minAgo+"m":w.minAgo<1440?Math.round(w.minAgo/60)+"h":Math.round(w.minAgo/1440)+"d";
      var wS=w.wallet&&w.wallet.length>10?w.wallet.slice(0,6)+"…"+w.wallet.slice(-4):"—";
      var wLink=w.wallet?'<a href="https://arbiscan.io/address/'+w.wallet+'" target="_blank" style="font-size:9px;color:var(--b)">'+wS+'</a>':wS;
      var rowBg=w.usdc>1000?"background:rgba(251,191,36,.06);":w.usdc>500?"background:rgba(251,191,36,.03);":"";
      rows+='<tr style="'+rowBg+'"><td style="color:var(--mt)">'+agoT+'</td>';
      rows+='<td style="color:'+(w.isBuy?"var(--g)":"var(--r)")+';font-weight:600">'+(w.isBuy?"BUY":"SELL")+'</td>';
      rows+='<td style="color:var(--o)">'+F(w.burn,0)+'</td>';
      rows+='<td style="color:var(--g)">🐋 $'+F(w.usdc,0)+'</td>';
      rows+='<td>'+FP(w.price)+'</td><td>'+wLink+'</td></tr>';
    }
    $("whaleTableB").innerHTML=rows;
  }catch(e){console.log("renderWhales err:",e);}
}

// ═══ TAX REPORT ═══

function parseDateDE(d){
  var p=d.split(".");if(p.length!==3)return null;
  var day=parseInt(p[0]),mon=parseInt(p[1])-1,yr=parseInt(p[2]);
  if(yr<100)yr+=2000;
  return new Date(yr,mon,day);
}

function renderTaxReport(){
  try{
    if(!$("taxTableB"))return;
    var allSales=[];
    for(var i=0;i<CL.length;i++){
      var c=CL[i];
      allSales.push({date:c.d,type:c.n&&c.n.indexOf("Market")>=0?"Market":"LP",burn:c.b,usdc:c.u,note:c.n||""});
    }
    for(var j=0;j<MS.length;j++){
      var m=MS[j];
      allSales.push({date:m.d,type:"Market",burn:m.b,usdc:m.u,note:m.n||""});
    }
    allSales.sort(function(a,b){var da=parseDateDE(a.date),db=parseDateDE(b.date);return da&&db?da-db:0;});

    var tProceeds=0,tCost=0,tProfit=0;
    var yearData={};
    var rows="";

    for(var k=0;k<allSales.length;k++){
      var s=allSales[k];
      var cost=s.burn*AVG_ENTRY;
      var profit=s.usdc-cost;
      var profitPct=cost>0?(profit/cost*100):0;
      var sp=s.burn>0?s.usdc/s.burn:0;
      var sellDate=parseDateDE(s.date);
      tProceeds+=s.usdc;tCost+=cost;tProfit+=profit;
      var yr=sellDate?sellDate.getFullYear():"?";
      if(!yearData[yr])yearData[yr]={proceeds:0,cost:0,profit:0,count:0};
      yearData[yr].proceeds+=s.usdc;yearData[yr].cost+=cost;yearData[yr].profit+=profit;
      yearData[yr].count++;
      var profitClr=profit>=0?"var(--g)":"var(--r)";
      rows+='<tr>';
      rows+='<td style="color:var(--br);white-space:nowrap">'+s.date+'</td>';
      rows+='<td style="color:'+(s.type==="LP"?"var(--cy)":"var(--o)")+'">'+s.type+'</td>';
      rows+='<td style="color:var(--o)">'+F(s.burn,0)+'</td>';
      rows+='<td>$'+sp.toFixed(4)+'</td>';
      rows+='<td style="color:var(--g)">$'+F(s.usdc,2)+'</td>';
      rows+='<td style="color:var(--dm)">$'+AVG_ENTRY.toFixed(4)+'</td>';
      rows+='<td style="color:var(--dm)">$'+F(cost,2)+'</td>';
      rows+='<td style="color:'+profitClr+'">'+(profit>=0?"+":"")+"$"+F(Math.abs(profit),2)+'</td>';
      rows+='<td style="color:'+profitClr+'">'+(profitPct>=0?"+":"")+profitPct.toFixed(0)+'%</td>';
      rows+='</tr>';
    }
    var tProfitClr=tProfit>=0?"var(--g)":"var(--r)";
    rows+='<tr style="border-top:2px solid var(--bd);background:rgba(8,12,22,.5)">';
    rows+='<td class="bld">GESAMT</td><td></td>';
    rows+='<td style="color:var(--o);font-weight:600">'+F(TS,0)+'</td><td></td>';
    rows+='<td style="color:var(--g);font-weight:600">$'+F(tProceeds,2)+'</td>';
    rows+='<td></td><td style="color:var(--dm)">$'+F(tCost,2)+'</td>';
    rows+='<td style="color:'+tProfitClr+';font-weight:600">'+(tProfit>=0?"+":"")+"$"+F(Math.abs(tProfit),2)+'</td>';
    rows+='<td></td></tr>';
    $("taxTableB").innerHTML=rows;
    $("taxSummary").innerHTML=
      MB("Erlöse","$"+F(tProceeds,0),"var(--br)")+
      MB("Anschaffung","$"+F(tCost,0),"var(--dm)")+
      MB("Gewinn",(tProfit>=0?"+":"")+"$"+F(Math.abs(tProfit),0),tProfit>=0?"var(--g)":"var(--r)")+
      MB("Gewinn %",tCost>0?((tProfit/tCost)*100).toFixed(0)+"%":"—",tProfit>=0?"var(--g)":"var(--r)");
    var yH="";
    var years=Object.keys(yearData).sort();
    for(var yi=0;yi<years.length;yi++){
      var yd=yearData[years[yi]];
      yH+='<div style="margin-bottom:6px"><div style="font-size:10px;font-weight:600;color:var(--br);margin-bottom:4px">'+years[yi]+' ('+yd.count+' Verkäufe)</div>';
      yH+='<div class="mg">'+
        MB("Erlöse","$"+F(yd.proceeds,0),"var(--br)")+
        MB("Kosten","$"+F(yd.cost,0),"var(--dm)")+
        MB("Gewinn",(yd.profit>=0?"+":"")+"$"+F(Math.abs(yd.profit),0),yd.profit>=0?"var(--g)":"var(--r)")+
        '</div></div>';
    }
    $("taxYears").innerHTML=yH||'<span style="color:var(--dm)">Keine Daten</span>';
  }catch(e){console.log("tax report err:",e);}
}

function taxExportCSV(){
  try{
    var csv="Datum;Typ;BURN;Sell Preis;Erlös;Buy Preis;Kosten;Gewinn;Gewinn %\n";
    var allSales=[];
    for(var i=0;i<CL.length;i++){var c=CL[i];allSales.push({date:c.d,type:"LP",burn:c.b,usdc:c.u});}
    for(var j=0;j<MS.length;j++){var m=MS[j];allSales.push({date:m.d,type:"Market",burn:m.b,usdc:m.u});}
    allSales.sort(function(a,b){var da=parseDateDE(a.date),db=parseDateDE(b.date);return da&&db?da-db:0;});
    for(var k=0;k<allSales.length;k++){
      var s=allSales[k];
      var sellPrice=s.burn>0?s.usdc/s.burn:0;
      var cost=s.burn*AVG_ENTRY;
      var profit=s.usdc-cost;
      var profitPct=cost>0?(profit/cost*100):0;
      csv+=s.date+";"+s.type+";"+s.burn.toFixed(0)+";"+sellPrice.toFixed(6)+";"+s.usdc.toFixed(2)+";"+AVG_ENTRY.toFixed(6)+";"+cost.toFixed(2)+";"+profit.toFixed(2)+";"+profitPct.toFixed(1)+"%\n";
    }
    var blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
    var url=URL.createObjectURL(blob);
    var a=document.createElement("a");a.href=url;
    a.download="burn-tax-report-"+new Date().toISOString().split("T")[0]+".csv";
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }catch(e){console.log("tax export err:",e);}
}

function taxExportExcel(exportYear){
  try{
    var curYear=exportYear||new Date().getFullYear();
    var allSales=[];
    for(var i=0;i<CL.length;i++){var c=CL[i];allSales.push({date:c.d,type:"LP",burn:c.b,usdc:c.u,note:c.n||""});}
    for(var j=0;j<MS.length;j++){var m=MS[j];allSales.push({date:m.d,type:"Market",burn:m.b,usdc:m.u,note:m.n||""});}
    allSales.sort(function(a,b){var da=parseDateDE(a.date),db=parseDateDE(b.date);return da&&db?da-db:0;});
    allSales=allSales.filter(function(s){var sd=parseDateDE(s.date);return sd&&sd.getFullYear()===curYear;});
    var css='<style>td,th{padding:4px 8px;border:1px solid #ccc;font-family:Arial;font-size:11px}th{background:#1a2744;color:#fff;font-weight:bold}.g{color:#22aa55}.r{color:#cc3333}.h{background:#f0f4ff}h2{font-family:Arial;color:#1a2744}h3{font-family:Arial;color:#334155;margin-top:20px}</style>';
    var html='<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8">'+css+'</head><body>';
    html+='<h2>BURN Token — Steuerreport '+curYear+'</h2>';
    html+='<p style="font-family:Arial;font-size:10px;color:#666">Erstellt: '+new Date().toLocaleDateString("de-DE")+'<br>Durchschnittlicher Kaufpreis: $'+AVG_ENTRY.toFixed(6)+'<br>Gesamtinvestition: $'+F(INVESTED,2)+'<br>Steuerresidenz: Brasilien</p>';
    html+='<h3>Veräußerungen (Ganho de Capital)</h3>';
    html+='<table><tr><th>Nr</th><th>Verkaufsdatum</th><th>Typ</th><th>BURN Menge</th><th>Verkaufspreis (Ø)</th><th>Erlös (USDC)</th><th>Kaufpreis (Ø)</th><th>Anschaffungskosten</th><th>Gewinn/Verlust</th><th>Gewinn %</th><th>Bemerkung</th></tr>';
    var tP=0,tC=0,tG=0;
    for(var k=0;k<allSales.length;k++){
      var s=allSales[k];
      var sellPrice=s.burn>0?s.usdc/s.burn:0;
      var cost=s.burn*AVG_ENTRY;
      var profit=s.usdc-cost;
      var profitPct=cost>0?(profit/cost*100):0;
      tP+=s.usdc;tC+=cost;tG+=profit;
      html+='<tr><td>'+(k+1)+'</td><td>'+s.date+'</td><td>'+s.type+'</td>';
      html+='<td style="text-align:right">'+(Math.round(s.burn/10)*10).toLocaleString("en")+'</td>';
      html+='<td style="text-align:right">$'+sellPrice.toFixed(6)+'</td>';
      html+='<td style="text-align:right" class="g">$'+s.usdc.toFixed(2)+'</td>';
      html+='<td style="text-align:right">$'+AVG_ENTRY.toFixed(6)+'</td>';
      html+='<td style="text-align:right">$'+cost.toFixed(2)+'</td>';
      html+='<td style="text-align:right" class="'+(profit>=0?"g":"r")+'">'+(profit>=0?"+":"")+'$'+profit.toFixed(2)+'</td>';
      html+='<td style="text-align:right">'+(profitPct>=0?"+":"")+profitPct.toFixed(1)+'%</td>';
      html+='<td>'+s.note+'</td></tr>';
    }
    html+='<tr class="h"><td colspan="3"><b>GESAMT</b></td>';
    html+='<td style="text-align:right"><b>'+(Math.round(TS/10)*10).toLocaleString("en")+'</b></td><td></td>';
    html+='<td style="text-align:right" class="g"><b>$'+tP.toFixed(2)+'</b></td><td></td>';
    html+='<td style="text-align:right"><b>$'+tC.toFixed(2)+'</b></td>';
    html+='<td style="text-align:right" class="'+(tG>=0?"g":"r")+'"><b>'+(tG>=0?"+":"")+'$'+tG.toFixed(2)+'</b></td>';
    html+='<td colspan="2"></td></tr></table>';
    html+='<h3>Bestand am 31.12.'+curYear+' — Declaração DIRPF (Bens e Direitos)</h3>';
    var yeSnap=taxYearEnd[curYear.toString()];
    var yeNote=yeSnap?"Preise vom Stichtag "+yeSnap.date:"Preise zum aktuellen Zeitpunkt — für DIRPF den Kurs am 31.12. verwenden.";
    html+='<p style="font-family:Arial;font-size:10px;color:#666">'+yeNote+'<br>BCB-Wechselkurs am 31.12. für BRL-Umrechnung verwenden.</p>';
    html+='<table><tr><th>Asset</th><th>Menge</th><th>Kaufpreis (Ø)</th><th style="background:#1a4427;color:#fff">Custo de Aquisição</th><th>Preis 31.12</th><th>Wert 31.12</th><th>Unrealisierter Gewinn</th><th>Anmerkung</th></tr>';
    var burnPrice=yeSnap?yeSnap.burnPrice:(P||0);
    var yeHold=yeSnap?yeSnap.holdings:null;
    var burnItems=[{name:"BURN (Wallet)",amount:yeHold?yeHold.MY_BURN:MY_BURN,entry:AVG_ENTRY,price:burnPrice,note:"Durchschnittsmethode"},{name:"stBURN (Staking)",amount:(yeHold?yeHold.MY_STBURN:MY_STBURN)*stR,entry:AVG_ENTRY,price:burnPrice,note:"Durchschnittsmethode"},{name:"BURN (in LPs)",amount:yeHold?yeHold.ALP:ALP,entry:AVG_ENTRY,price:burnPrice,note:"Durchschnittsmethode"}];
    var tHV=0,tHC=0,tcBurn=0;
    for(var bi=0;bi<burnItems.length;bi++){var it=burnItems[bi];var val=it.amount*it.price;var cst=it.amount*it.entry;var ug=val-cst;tHV+=val;tHC+=cst;tcBurn+=cst;
      html+='<tr><td>'+it.name+'</td><td style="text-align:right">'+(Math.round(it.amount/10)*10).toLocaleString("en")+'</td>';
      html+='<td style="text-align:right">$'+it.entry.toFixed(6)+'</td>';
      html+='<td style="text-align:right;background:#f0fff4"><b>$'+cst.toFixed(2)+'</b></td>';
      html+='<td style="text-align:right">$'+FP(it.price)+'</td><td style="text-align:right" class="g">$'+val.toFixed(2)+'</td>';
      html+='<td style="text-align:right" class="'+(ug>=0?"g":"r")+'">'+(ug>=0?"+":"")+'$'+ug.toFixed(2)+'</td>';
      html+='<td>'+it.note+'</td></tr>';}
    html+='<tr class="h"><td colspan="3"><b>BURN Gesamt</b></td><td style="text-align:right;background:#e8f5e9"><b>$'+tcBurn.toFixed(2)+'</b></td><td></td><td style="text-align:right" class="g"><b>$'+(tHV).toFixed(2)+'</b></td><td></td><td></td></tr>';
    var tcAlt=0,tAltV=0;
    if(typeof ptfAssets!=="undefined"&&ptfAssets.length>0){
      for(var pi=0;pi<ptfAssets.length;pi++){var pa=ptfAssets[pi];var pp=yeSnap?taxGetYearEndPrice(curYear.toString(),pa.geckoId):(typeof ptfPrices!=="undefined"&&ptfPrices[pa.geckoId]?ptfPrices[pa.geckoId].usd:0);var pv=pa.amount*pp;var pc=pa.totalCost||0;var pg=pv-pc;tHV+=pv;tHC+=pc;tcAlt+=pc;tAltV+=pv;
        html+='<tr><td>'+pa.symbol+' ('+pa.name+')</td><td style="text-align:right">'+pa.amount.toFixed(pa.decimals||2)+'</td>';
        html+='<td style="text-align:right">'+(pa.avgEntry>0?"$"+pa.avgEntry.toFixed(pa.avgEntry>100?0:pa.avgEntry>1?2:4):"—")+'</td>';
        html+='<td style="text-align:right;background:#f0fff4"><b>'+(pc>0?"$"+pc.toFixed(2):"$0.00")+'</b></td>';
        html+='<td style="text-align:right">'+(pp>0?"$"+pp.toFixed(pp>100?0:pp>1?2:4):"—")+'</td>';
        html+='<td style="text-align:right" class="g">'+(pv>0?"$"+pv.toFixed(2):"—")+'</td>';
        html+='<td style="text-align:right" class="'+(pg>=0?"g":"r")+'">'+(pc>0?(pg>=0?"+":"")+"$"+pg.toFixed(2):"—")+'</td>';
        html+='<td>'+(pa.source==="ledger"?"Ledger Wallet":"Manual/Exchange")+'</td></tr>';}}
    html+='<tr class="h"><td colspan="3"><b>Altcoins Gesamt</b></td><td style="text-align:right;background:#e8f5e9"><b>$'+tcAlt.toFixed(2)+'</b></td><td></td><td style="text-align:right" class="g"><b>$'+tAltV.toFixed(2)+'</b></td><td></td><td></td></tr>';
    html+='<tr style="background:#c8e6c9"><td colspan="3"><b style="font-size:14px">TOTAL CUSTO DE AQUISIÇÃO</b></td>';
    html+='<td style="text-align:right;font-size:14px;background:#a5d6a7"><b>$'+(tcBurn+tcAlt).toFixed(2)+'</b></td>';
    html+='<td></td><td style="text-align:right;font-size:14px" class="g"><b>$'+tHV.toFixed(2)+'</b></td>';
    html+='<td style="text-align:right;font-size:14px" class="'+(tHV-tHC>=0?"g":"r")+'"><b>'+(tHV-tHC>=0?"+":"")+'$'+(tHV-tHC).toFixed(2)+'</b></td>';
    html+='<td>Für DIRPF</td></tr></table>';

    // ═══ SHEET: Vendas Tributáveis (Taxable Sells >$5000/month) ═══
    html+='<br><br><h2>Vendas Tributáveis — Monate über $5.000 / R$35.000</h2>';
    html+='<p style="font-family:Arial;font-size:10px;color:#666">Brasilien: Ganho de Capital nur fällig wenn monatliche Verkäufe R$35.000 (~$5.000) übersteigen.<br>Nur Monate mit Verkäufen über dem Freibetrag sind hier aufgeführt.</p>';
    var TAX_THRESHOLD=5000;
    var monthSales={};
    for(var ms=0;ms<allSales.length;ms++){
      var msd=parseDateDE(allSales[ms].date);
      if(!msd)continue;
      var mKey=(msd.getMonth()+1).toString().padStart(2,"0")+"/"+msd.getFullYear();
      if(!monthSales[mKey])monthSales[mKey]={proceeds:0,cost:0,profit:0,sales:[]};
      var mCost=allSales[ms].burn*AVG_ENTRY;
      var mProfit=allSales[ms].usdc-mCost;
      monthSales[mKey].proceeds+=allSales[ms].usdc;
      monthSales[mKey].cost+=mCost;
      monthSales[mKey].profit+=mProfit;
      monthSales[mKey].sales.push(allSales[ms]);
    }
    var taxableMonths=Object.keys(monthSales).filter(function(k){return monthSales[k].proceeds>=TAX_THRESHOLD;}).sort();
    if(taxableMonths.length>0){
      html+='<table><tr><th>Monat</th><th>Anzahl Verkäufe</th><th>Gesamterlös</th><th>Gesamtkosten</th><th>Steuerpflichtiger Gewinn</th></tr>';
      var ttP=0,ttC=0,ttG=0;
      for(var tm=0;tm<taxableMonths.length;tm++){
        var md=monthSales[taxableMonths[tm]];ttP+=md.proceeds;ttC+=md.cost;ttG+=md.profit;
        html+='<tr><td><b>'+taxableMonths[tm]+'</b></td><td style="text-align:right">'+md.sales.length+'</td>';
        html+='<td style="text-align:right" class="g">$'+md.proceeds.toFixed(2)+'</td>';
        html+='<td style="text-align:right">$'+md.cost.toFixed(2)+'</td>';
        html+='<td style="text-align:right" class="'+(md.profit>=0?"g":"r")+'">'+(md.profit>=0?"+":"")+'$'+md.profit.toFixed(2)+'</td></tr>';
        for(var tms=0;tms<md.sales.length;tms++){
          var ts2=md.sales[tms];var tsp=ts2.burn>0?ts2.usdc/ts2.burn:0;var tsc=ts2.burn*AVG_ENTRY;var tsg=ts2.usdc-tsc;
          html+='<tr style="background:#fff8e1"><td style="padding-left:20px;color:#666">↳ '+ts2.date+'</td><td style="color:#666">'+ts2.type+'</td>';
          html+='<td style="text-align:right;color:#666">$'+ts2.usdc.toFixed(2)+'</td>';
          html+='<td style="text-align:right;color:#666">$'+tsc.toFixed(2)+'</td>';
          html+='<td style="text-align:right" class="'+(tsg>=0?"g":"r")+'">'+(tsg>=0?"+":"")+'$'+tsg.toFixed(2)+'</td></tr>';}
      }
      html+='<tr class="h"><td><b>TOTAL TRIBUTÁVEL</b></td><td></td>';
      html+='<td style="text-align:right" class="g"><b>$'+ttP.toFixed(2)+'</b></td>';
      html+='<td style="text-align:right"><b>$'+ttC.toFixed(2)+'</b></td>';
      html+='<td style="text-align:right" class="'+(ttG>=0?"g":"r")+'"><b>'+(ttG>=0?"+":"")+'$'+ttG.toFixed(2)+'</b></td></tr></table>';
    }else{
      html+='<table><tr><td style="padding:12px;color:#22aa55;font-weight:bold;font-size:13px">✓ Kein Monat hat $5.000 Verkäufe überschritten — keine Ganho de Capital fällig.</td></tr></table>';
      html+='<p style="font-family:Arial;font-size:10px;color:#666">Monatliche Verkäufe:</p><table><tr><th>Monat</th><th>Erlös</th><th>Status</th></tr>';
      var allMonths=Object.keys(monthSales).sort();
      for(var am=0;am<allMonths.length;am++){
        html+='<tr><td>'+allMonths[am]+'</td><td style="text-align:right">$'+monthSales[allMonths[am]].proceeds.toFixed(2)+'</td>';
        html+='<td class="g">Unter Freibetrag</td></tr>';}
      html+='</table>';
    }

    html+='<p style="font-family:Arial;font-size:9px;color:#999;margin-top:20px">My Crypto Portfolio · '+new Date().toLocaleString("de-DE")+'<br>Keine Steuerberatung. Brasilien: Ganho de Capital auf Krypto, Verkäufe unter R$35.000/Monat ggf. befreit.</p>';
    html+='</body></html>';
    var blob=new Blob(["\ufeff"+html],{type:"application/vnd.ms-excel;charset=utf-8"});
    var url=URL.createObjectURL(blob);
    var a=document.createElement("a");a.href=url;
    a.download="BURN-Steuerreport-"+curYear+"-"+new Date().toISOString().split("T")[0]+".xls";
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }catch(e){console.log("tax excel export err:",e);}
}

// ═══ TAX YEAR-END SNAPSHOTS ═══
var taxYearEnd={};
try{var tyeStr=localStorage.getItem("tax_yearend");if(tyeStr)taxYearEnd=JSON.parse(tyeStr);}catch(e){}

// Hardcoded 31.12.2025 prices (approximate, from market data)
if(!taxYearEnd["2025"]){
  taxYearEnd["2025"]={
    date:"31.12.2025",
    burnPrice:0.130,
    holdings:{MY_BURN:450000,MY_STBURN:350000,ALP:40300},
    altcoins:{
      bitcoin:87502,ethereum:2900,chainlink:12.50,"ondo-finance":1.40,
      "render-token":5.20,monad:0.25,centrifuge:0.18,"fetch-ai":1.15,
      aave:180,"sky":0.065,"crypto-com-chain":0.09,uniswap:12.50,
      arbitrum:0.60,"maple-finance":0.24,eigenlayer:2.80,arweave:18,
      celestia:3.80,bittensor:380,"akash-network":2.50
    }
  };
  try{localStorage.setItem("tax_yearend",JSON.stringify(taxYearEnd));}catch(e){}
}

function taxSaveYearEnd(){
  var yr=new Date().getFullYear();
  var snapshot={
    date:new Date().toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"}),
    burnPrice:P||0,
    holdings:{MY_BURN:MY_BURN,MY_STBURN:MY_STBURN,ALP:ALP},
    altcoins:{}
  };
  if(typeof ptfPrices!=="undefined"){
    for(var key in ptfPrices){if(ptfPrices[key]&&ptfPrices[key].usd)snapshot.altcoins[key]=ptfPrices[key].usd;}
  }
  taxYearEnd[yr.toString()]=snapshot;
  try{localStorage.setItem("tax_yearend",JSON.stringify(taxYearEnd));}catch(e){}
  $("taxYearEndStatus").innerHTML='<span style="color:var(--g)">✓ Stichtag '+yr+' gespeichert ('+snapshot.date+')</span>';
  console.log("TAX: year-end "+yr+" saved",snapshot);
}

function taxGetYearEndPrice(yr,geckoId){
  if(!taxYearEnd[yr]||!taxYearEnd[yr].altcoins)return 0;
  return taxYearEnd[yr].altcoins[geckoId]||0;
}

// Auto-prompt in late December
(function(){
  var now=new Date();
  if(now.getMonth()===11&&now.getDate()>=28){
    var yr=now.getFullYear().toString();
    if(!taxYearEnd[yr]){
      setTimeout(function(){
        if($("taxYearEndStatus"))$("taxYearEndStatus").innerHTML='<span style="color:var(--o)">⚠ Stichtag 31.12.'+yr+' noch nicht gespeichert — <button class="btn" onclick="taxSaveYearEnd()" style="font-size:9px">Jetzt speichern</button></span>';
      },5000);
    }
  }
})();

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
    for(var ci2=0;ci2<clExtra.length;ci2++){
      var isDupe=false;
      for(var cj=0;cj<CL.length;cj++){if(clExtra[ci2].d===CL[cj].d&&clExtra[ci2].b===CL[cj].b&&clExtra[ci2].n===CL[cj].n){isDupe=true;break;}}
      if(!isDupe){CL.push(clExtra[ci2]);TS+=clExtra[ci2].b;TR+=clExtra[ci2].u;}
    }
  }
}catch(e){}

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
      var entry={
        d:new Date().toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"2-digit"}),
        b:prev.b, lo:prev.lo, hi:prev.hi,
        u:Math.round(prev.usdc*100)/100,
        n:"🔄 $"+prev.lo.toFixed(3)+"→$"+prev.hi.toFixed(2)+" ("+prev.pct.toFixed(0)+"% filled)",
        left:Math.round(prev.left), pct:prev.pct
      };
      CL.push(entry);TS+=entry.b;TR+=entry.u;
      detected.push(entry);
      clSeen[key]=Date.now();
      console.log("LP CLOSED detected: "+entry.n+" USDC earned: $"+entry.u);
    }
  }
  if(detected.length>0){
    try{localStorage.setItem("cl_history",JSON.stringify(CL.filter(function(c){return c.n&&c.n.indexOf("🔄")===0;})));
      localStorage.setItem("cl_seen",JSON.stringify(clSeen));}catch(e){}
    if(typeof beep==="function"&&typeof soundOn!=="undefined"&&soundOn)beep();
  }
}

// ═══ PRICE & LP ALERTS ═══
var alertCfg={hi:0,lo:0,fill1:50,fill2:90};
var alertTriggered={};
try{var ac=localStorage.getItem("burn_alerts");if(ac)alertCfg=JSON.parse(ac);}catch(e){}
try{var at2=localStorage.getItem("burn_alert_triggered");if(at2)alertTriggered=JSON.parse(at2);}catch(e){}

function saveAlerts(){
  alertCfg.hi=parseFloat($("alertHi").value)||0;
  alertCfg.lo=parseFloat($("alertLo").value)||0;
  alertCfg.fill1=parseInt($("alertFill1").value)||50;
  alertCfg.fill2=parseInt($("alertFill2").value)||90;
  alertCfg.ptfHi=parseFloat($("alertPtfHi").value)||0;
  alertCfg.ptfLo=parseFloat($("alertPtfLo").value)||0;
  alertTriggered={};
  try{localStorage.setItem("burn_alerts",JSON.stringify(alertCfg));localStorage.removeItem("burn_alert_triggered");}catch(e){}
  $("alertStatus").innerHTML='<span style="color:var(--g)">Alerts saved</span>';
  checkAlerts();
}
function clearAlerts(){
  alertCfg={hi:0,lo:0,fill1:50,fill2:90,ptfHi:0,ptfLo:0};alertTriggered={};
  try{localStorage.removeItem("burn_alerts");localStorage.removeItem("burn_alert_triggered");}catch(e){}
  $("alertHi").value="";$("alertLo").value="";$("alertFill1").value="";$("alertFill2").value="";
  try{$("alertPtfHi").value="";$("alertPtfLo").value="";}catch(e){}
  $("alertStatus").innerHTML='<span style="color:var(--dm)">Alerts cleared</span>';
  $("alertBar").style.display="none";
}
function showPushSub(){
  var sub=localStorage.getItem("push_sub");
  var fcm=localStorage.getItem("fcm_token");
  var info="";
  if(fcm)info+='<div style="margin-bottom:4px"><b>FCM Token (für Hetzner):</b><br><span style="color:var(--g);word-break:break-all">'+fcm+'</span></div>';
  if(sub)info+='<div><b>Web Push Sub:</b><br>'+sub+'</div>';
  if(!fcm&&!sub)info='<span style="color:var(--r)">Nicht subscribed. Klick erst 🔔 oben rechts.</span>';
  $("pushSubInfo").innerHTML=info;
}
function checkAlerts(){
  try{
    if(P<=0)return;
    var msgs=[];
    // Price alerts
    if(alertCfg.hi>0&&P>=alertCfg.hi&&!alertTriggered.hi){
      msgs.push("🚀 BURN above $"+alertCfg.hi.toFixed(4)+" (now $"+FP(P)+")");
      alertTriggered.hi=Date.now();
      if(typeof notify==="function")notify("🚀 Price Alert","BURN above $"+alertCfg.hi.toFixed(4)+" → $"+FP(P));
    }
    if(alertCfg.lo>0&&P<=alertCfg.lo&&!alertTriggered.lo){
      msgs.push("⚠️ BURN below $"+alertCfg.lo.toFixed(4)+" (now $"+FP(P)+")");
      alertTriggered.lo=Date.now();
      if(typeof notify==="function")notify("⚠️ Price Alert","BURN below $"+alertCfg.lo.toFixed(4)+" → $"+FP(P));
    }
    // Reset triggers when price moves back
    if(alertCfg.hi>0&&P<alertCfg.hi*0.98)delete alertTriggered.hi;
    if(alertCfg.lo>0&&P>alertCfg.lo*1.02)delete alertTriggered.lo;
    // LP Fill alerts
    for(var li=0;li<LP.length;li++){
      if(LP[li].fr)continue;
      var cv=v3(LP[li].b,LP[li].lo,LP[li].hi,P);
      var fillKey="lp_"+li+"_"+alertCfg.fill1;
      var fillKey2="lp_"+li+"_"+alertCfg.fill2;
      if(alertCfg.fill1>0&&cv.pct>=alertCfg.fill1&&!alertTriggered[fillKey]){
        msgs.push("📊 LP $"+LP[li].lo.toFixed(3)+"→$"+LP[li].hi.toFixed(2)+" reached "+cv.pct.toFixed(0)+"% filled");
        alertTriggered[fillKey]=Date.now();
        if(typeof notify==="function")notify("📊 LP Fill Alert","$"+LP[li].lo.toFixed(3)+"→$"+LP[li].hi.toFixed(2)+" at "+cv.pct.toFixed(0)+"%");
      }
      if(alertCfg.fill2>0&&cv.pct>=alertCfg.fill2&&!alertTriggered[fillKey2]){
        msgs.push("🔥 LP $"+LP[li].lo.toFixed(3)+"→$"+LP[li].hi.toFixed(2)+" reached "+cv.pct.toFixed(0)+"% filled!");
        alertTriggered[fillKey2]=Date.now();
        if(typeof notify==="function")notify("🔥 LP Fill Alert!","$"+LP[li].lo.toFixed(3)+"→$"+LP[li].hi.toFixed(2)+" at "+cv.pct.toFixed(0)+"%!");
      }
    }
    // Show alert bar
    if(msgs.length>0){
      $("alertBar").style.display="block";
      $("alertMsg").innerHTML=msgs.join(" · ");
    }
    // Update status
    var statusParts=[];
    if(alertCfg.hi>0)statusParts.push("Price >$"+alertCfg.hi.toFixed(4));
    if(alertCfg.lo>0)statusParts.push("Price <$"+alertCfg.lo.toFixed(4));
    if(alertCfg.fill1>0)statusParts.push("LP Fill "+alertCfg.fill1+"%");
    if(alertCfg.fill2>0)statusParts.push("LP Fill "+alertCfg.fill2+"%");
    if(alertCfg.ptfHi>0)statusParts.push("Portfolio >$"+F(alertCfg.ptfHi,0));
    if(alertCfg.ptfLo>0)statusParts.push("Portfolio <$"+F(alertCfg.ptfLo,0));
    if($("alertStatus"))$("alertStatus").innerHTML=statusParts.length>0?'Active: '+statusParts.join(", "):'No alerts set';
    try{localStorage.setItem("burn_alert_triggered",JSON.stringify(alertTriggered));}catch(e){}
  }catch(e){}
}
// Restore alert inputs on load
try{
  if(alertCfg.hi>0&&$("alertHi"))$("alertHi").value=alertCfg.hi;
  if(alertCfg.lo>0&&$("alertLo"))$("alertLo").value=alertCfg.lo;
  if(alertCfg.fill1&&$("alertFill1"))$("alertFill1").value=alertCfg.fill1;
  if(alertCfg.fill2&&$("alertFill2"))$("alertFill2").value=alertCfg.fill2;
  if(alertCfg.ptfHi>0&&$("alertPtfHi"))$("alertPtfHi").value=alertCfg.ptfHi;
  if(alertCfg.ptfLo>0&&$("alertPtfLo"))$("alertPtfLo").value=alertCfg.ptfLo;
}catch(e){}

// ═══ CAPITAL FLOW CHART ═══
function renderCapitalFlow(){
  try{
    if(!$("cflowChart")||!allTrades||allTrades.length<2)return;
    // Aggregate by day
    var days={};
    var now=Date.now();
    for(var i=0;i<allTrades.length;i++){
      var t=allTrades[i];
      var dayMs=now-t.minAgo*60000;
      var dayKey=new Date(dayMs).toISOString().split("T")[0];
      if(!days[dayKey])days[dayKey]={buy:0,sell:0,net:0,count:0};
      if(t.isBuy){days[dayKey].buy+=t.usdc;}else{days[dayKey].sell+=t.usdc;}
      days[dayKey].net+=(t.isBuy?t.usdc:-t.usdc);
      days[dayKey].count++;
    }
    var dayKeys=Object.keys(days).sort();
    if(dayKeys.length<1)return;
    var last14=dayKeys.slice(-14);
    // Summary
    var totalBuy=0,totalSell=0;
    for(var d=0;d<last14.length;d++){totalBuy+=days[last14[d]].buy;totalSell+=days[last14[d]].sell;}
    $("cflowSummary").innerHTML=MB("Buy Volume","$"+F(totalBuy,0),"var(--g)")+MB("Sell Volume","$"+F(totalSell,0),"var(--r)")+
      MB("Net Flow",(totalBuy-totalSell>=0?"+":"-")+"$"+F(Math.abs(totalBuy-totalSell),0),totalBuy>=totalSell?"var(--g)":"var(--r)")+
      MB("Days",last14.length,"var(--br)");
    // SVG bar chart
    var maxVal=1;
    for(var d2=0;d2<last14.length;d2++){var abs=Math.abs(days[last14[d2]].net);if(abs>maxVal)maxVal=abs;}
    var svgW=700,svgH=160,barW=Math.floor(svgW/last14.length)-4,midY=svgH/2;
    var svg='<svg viewBox="0 0 '+svgW+' '+(svgH+20)+'" style="width:100%;height:auto">';
    svg+='<line x1="0" y1="'+midY+'" x2="'+svgW+'" y2="'+midY+'" stroke="rgba(148,163,184,.3)" stroke-width="1" stroke-dasharray="4"/>';
    for(var d3=0;d3<last14.length;d3++){
      var dk=last14[d3];var net=days[dk].net;
      var barH=Math.abs(net)/maxVal*(midY-10);
      var x=d3*(barW+4)+2;
      var clr=net>=0?"#34d399":"#f87171";
      var y=net>=0?midY-barH:midY;
      svg+='<rect x="'+x+'" y="'+y+'" width="'+barW+'" height="'+Math.max(barH,1)+'" fill="'+clr+'" rx="2" opacity=".8"/>';
      svg+='<text x="'+(x+barW/2)+'" y="'+(svgH+14)+'" text-anchor="middle" fill="#94a3b8" font-size="7" font-family="JetBrains Mono">'+dk.slice(5)+'</text>';
    }
    svg+='<text x="4" y="12" fill="#94a3b8" font-size="8">+$'+F(maxVal,0)+'</text>';
    svg+='<text x="4" y="'+(svgH-4)+'" fill="#94a3b8" font-size="8">-$'+F(maxVal,0)+'</text>';
    svg+='</svg>';
    $("cflowChart").innerHTML=svg;
  }catch(e){console.log("cflow err:",e);}
}

// ═══ POOL HEALTH DASHBOARD ═══
function renderPoolHealth(){
  try{
    if(!$("phealthGrid")||!allTrades||allTrades.length<2)return;
    var now=Date.now();
    var h24={buy:0,sell:0,buyC:0,sellC:0,wallets:{}};
    var d7={buy:0,sell:0,buyC:0,sellC:0,wallets:{}};
    for(var i=0;i<allTrades.length;i++){
      var t=allTrades[i];
      var ageMs=t.minAgo*60000;
      if(ageMs<=86400000){
        if(t.isBuy){h24.buy+=t.usdc;h24.buyC++;}else{h24.sell+=t.usdc;h24.sellC++;}
        if(t.wallet)h24.wallets[t.wallet]=1;
      }
      if(ageMs<=604800000){
        if(t.isBuy){d7.buy+=t.usdc;d7.buyC++;}else{d7.sell+=t.usdc;d7.sellC++;}
        if(t.wallet)d7.wallets[t.wallet]=1;
      }
    }
    var ratio24=h24.sell>0?(h24.buy/h24.sell):h24.buy>0?999:1;
    var ratio7=d7.sell>0?(d7.buy/d7.sell):d7.buy>0?999:1;
    // Pool TVL from existing data
    var poolBurn=typeof POOL_BURN!=="undefined"?POOL_BURN:0;
    var poolUsdc=typeof POOL_USDC!=="undefined"?POOL_USDC:0;
    var tvl=poolBurn*P+poolUsdc;
    $("phealthGrid").innerHTML=
      MB("TVL","$"+F(tvl,0),"var(--br)")+
      MB("24h Volume","$"+F(h24.buy+h24.sell,0),"var(--cy)")+
      MB("24h Buy/Sell",ratio24.toFixed(2)+"x",ratio24>1?"var(--g)":"var(--r)")+
      MB("7d Buy/Sell",ratio7.toFixed(2)+"x",ratio7>1?"var(--g)":"var(--r)")+
      MB("24h Traders",Object.keys(h24.wallets).length,"var(--br)")+
      MB("7d Traders",Object.keys(d7.wallets).length,"var(--br)");
    var pressure=ratio24>1.5?"🟢 Strong buying":ratio24>1?"🟢 Slight buying":ratio24>0.7?"🟡 Neutral":"🔴 Selling pressure";
    $("phealthDetail").innerHTML=pressure+" · 24h: "+h24.buyC+" buys / "+h24.sellC+" sells · 7d: "+d7.buyC+" buys / "+d7.sellC+" sells";
  }catch(e){console.log("phealth err:",e);}
}

// ═══ STAKING APY TRACKER ═══
var stapyHistory=[];
try{var sh=localStorage.getItem("stapy_history");if(sh)stapyHistory=JSON.parse(sh);}catch(e){}

function renderStakingApy(){
  try{
    if(!$("stapySummary")||typeof stR==="undefined"||stR<=0)return;
    // Save snapshot every hour
    var lastSnap=stapyHistory.length>0?stapyHistory[stapyHistory.length-1]:null;
    if(!lastSnap||Date.now()-lastSnap[0]>3600000){
      stapyHistory.push([Date.now(),stR]);
      if(stapyHistory.length>8760)stapyHistory.shift();
      try{localStorage.setItem("stapy_history",JSON.stringify(stapyHistory));}catch(e){}
    }
    // Calculate APY from ratio change
    var currentRatio=stR;
    var dailyYield=0,weeklyYield=0,monthlyYield=0,apy=0;
    if(stapyHistory.length>=2){
      var oldest=stapyHistory[0];
      var dayMs=Date.now()-oldest[0];
      var days=dayMs/86400000;
      if(days>0){
        var totalGrowth=(currentRatio-oldest[1])/oldest[1];
        var dailyRate=totalGrowth/days;
        dailyYield=dailyRate*100;
        weeklyYield=dailyRate*7*100;
        monthlyYield=dailyRate*30*100;
        apy=((Math.pow(1+dailyRate,365))-1)*100;
      }
    }
    // Summary
    var burnValue=typeof MY_STBURN!=="undefined"?MY_STBURN*stR*P:0;
    var stBurnYield=typeof MY_STBURN!=="undefined"?MY_STBURN*(stR-1):0;
    $("stapySummary").innerHTML=
      MB("stBURN/BURN Ratio",currentRatio.toFixed(6),"var(--cy)")+
      MB("Est. APY",apy>0?apy.toFixed(2)+"%":"collecting...","var(--g)")+
      MB("Daily Yield",dailyYield>0?"+"+dailyYield.toFixed(4)+"%":"—","var(--g)")+
      MB("stBURN Value","$"+F(burnValue,0),"var(--br)")+
      MB("Yield Earned",F(stBurnYield,0)+" BURN","var(--o)")+
      MB("Data Points",stapyHistory.length,"var(--dm)");
    // Mini chart of ratio history
    if(stapyHistory.length>=3){
      var svgW=700,svgH=80;
      var pts=stapyHistory;
      var minR=pts[0][1],maxR=pts[0][1];
      for(var i=0;i<pts.length;i++){if(pts[i][1]<minR)minR=pts[i][1];if(pts[i][1]>maxR)maxR=pts[i][1];}
      var pad=(maxR-minR)*0.1||0.0001;minR-=pad;maxR+=pad;
      var path="M";
      var step=pts.length>300?Math.ceil(pts.length/300):1;
      for(var j=0;j<pts.length;j+=step){
        var x=(j/(pts.length-1))*svgW;
        var y=svgH-(pts[j][1]-minR)/(maxR-minR)*svgH;
        path+=(j===0?"":"L")+x.toFixed(1)+","+y.toFixed(1);
      }
      var svg='<svg viewBox="0 0 '+svgW+' '+(svgH+4)+'" style="width:100%;height:auto">';
      svg+='<path d="'+path+'" fill="none" stroke="#c084fc" stroke-width="2"/>';
      svg+='<text x="4" y="10" fill="#94a3b8" font-size="8">'+maxR.toFixed(6)+'</text>';
      svg+='<text x="4" y="'+svgH+'" fill="#94a3b8" font-size="8">'+minR.toFixed(6)+'</text>';
      svg+='</svg>';
      $("stapyChart").innerHTML=svg;
    }else{
      $("stapyChart").innerHTML='<span style="color:var(--dm);font-size:10px">Collecting ratio data... chart after 3+ snapshots</span>';
    }
  }catch(e){console.log("stapy err:",e);}
}

// ═══ PORTFOLIO SYNC TO SERVER ═══
var SYNC_URL="http://95.216.152.31:8081";
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
  return true;}catch(e){return false;}}

// ═══ PULL-TO-REFRESH ═══
var ptrY=0,ptrActive=false;
document.addEventListener("touchstart",function(e){if(window.scrollY===0)ptrY=e.touches[0].clientY;},{passive:true});
document.addEventListener("touchmove",function(e){if(ptrY>0&&window.scrollY===0){var dy=e.touches[0].clientY-ptrY;
  if(dy>50&&!ptrActive){ptrActive=true;$("ptr").classList.add("show");}}},{passive:true});
document.addEventListener("touchend",function(){if(ptrActive){ptrActive=false;$("ptr").classList.remove("show");go();fetchSt();fetchTrades();}ptrY=0;});

// ═══ PORTFOLIO TERMINAL FUNCTIONS ═══
function ptfSave(){try{localStorage.setItem("ptf_assets",JSON.stringify(ptfAssets));localStorage.setItem("ptf_ledger",JSON.stringify(ptfLedger));ptfSyncServer();}catch(e){console.log("PTF save err:",e);}}

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
    var data={assets:assets,burnPrice:P||0,stRatio:stR||1,myBurn:MY_BURN||0,myStburn:MY_STBURN||0,ts:Date.now()};
    fetch("http://95.216.152.31:8081",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)}).then(function(r){
      if(r.ok)console.log("PTF synced to server");
    }).catch(function(){});
  }catch(e){}
}
function ptfLoad(){try{
  var a=localStorage.getItem("ptf_assets");var l=localStorage.getItem("ptf_ledger");var t=localStorage.getItem("ptf_targets");
  if(a)ptfAssets=JSON.parse(a); else ptfAssets=JSON.parse(JSON.stringify(PTF_DEFAULTS));
  if(l)ptfLedger=JSON.parse(l);
  if(t)ptfSimTargets=JSON.parse(t);
  try{var sn=localStorage.getItem("ptf_snapshots");if(sn){ptfSnapshots=JSON.parse(sn);ptfSnapshots=ptfSnapshots.map(function(s){return Array.isArray(s)?s:[s.ts,s.value];});}}catch(e){}
  // Merge server history (Hetzner collects data 24/7 even when app is closed)
  setTimeout(function(){try{
    fetch("http://95.216.152.31:8082/history").then(function(r){return r.json();}).then(function(data){
      if(!data||!data.length)return;
      var existing={};
      for(var mi=0;mi<ptfSnapshots.length;mi++){existing[ptfSnapshots[mi][0]]=true;}
      var added=0;
      for(var mj=0;mj<data.length;mj++){if(!existing[data[mj][0]]){ptfSnapshots.push(data[mj]);added++;}}
      if(added>0){
        ptfSnapshots.sort(function(a,b){return a[0]-b[0];});
        if(ptfSnapshots.length>200000)ptfSnapshots=ptfSnapshots.slice(-200000);
        try{localStorage.setItem("ptf_snapshots",JSON.stringify(ptfSnapshots));}catch(e2){}
        console.log("PTF: merged "+added+" server snapshots (total: "+ptfSnapshots.length+")");
        ptfRenderTimeline();
      }
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
              console.log("PTF balance: "+a.symbol+" updated "+a.amount+" → "+bal);
              a.amount=bal;changed=true;updates++;
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
          ptfLastBalances.eth=ea?ea.amount:0;
          ptfLastBalances.btc=ba?ba.amount:0;
          try{localStorage.setItem("ptf_last_balances",JSON.stringify(ptfLastBalances));}catch(e){}
          // Still update amounts silently on first run
          if(ea&&newEth>0)ea.amount=newEth;
          if(ba&&newBtc>0)ba.amount=newBtc;
          ptfSave();ptfRenderTable();
          console.log("PTF detect: calibrated (first run)");
          return;
        }
        var changed=false;
        // Check ETH delta
        var ethDelta=newEth-ptfLastBalances.eth;
        if(newEth>0&&Math.abs(ethDelta)>0.001){
          ptfShowDetection("ETH",ethDelta,newEth);
        }
        // BTC detection DISABLED — managed via manual "+ BTC Kauf" Banner (Ledger uses rotating addresses)
        // Update stored balances + ETH asset amount only
        var ea2=null;
        for(var j=0;j<ptfAssets.length;j++){if(ptfAssets[j].id==="eth"){ea2=ptfAssets[j];break;}}
        if(newEth>0){ptfLastBalances.eth=newEth;if(ea2)ea2.amount=newEth;}
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
  // Recalc avgEntry
  var asset=null;
  for(var i=0;i<ptfAssets.length;i++){if(ptfAssets[i].id===d.symbol){asset=ptfAssets[i];break;}}
  if(asset){
    var entries=ptfLedger.filter(function(e){return e.asset===d.symbol;});
    var sumCost=0,sumAmt=0;
    for(var j=0;j<entries.length;j++){sumCost+=entries[j].total;sumAmt+=entries[j].amount;}
    if(sumAmt>0){asset.avgEntry=sumCost/sumAmt;asset.totalCost=sumCost;}
    asset.amount=d.newBalance;
  }
  ptfSave();ptfRenderTable();ptfRenderLedger();
  console.log("PTF: "+d.symbol+" "+(d.isBuy?"purchase":"sell")+" recorded: "+d.delta+" @ $"+price+" (mode:"+ptfDetectMode+")");
  ptfPendingDetection=null;$("ptfDetectDiv").innerHTML="";
}

function ptfDismissDetection(){
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
  // Recalc avgEntry/totalCost from full ledger
  var entries=ptfLedger.filter(function(e){return e.asset==="btc";});
  var sumCost=0,sumAmt=0;
  for(var j=0;j<entries.length;j++){sumCost+=entries[j].total;sumAmt+=entries[j].amount;}
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
      rows.push('<tr><td class="bld">'+a.symbol+failBadge+'<div style="font-size:8px;color:'+srcClr+'">'+a.name+'</div></td><td>'+F(a.amount,a.decimals)+'</td><td>'+entryH+'</td><td>'+(price>0?"$"+ptfFP(price):"—")+' '+chgH+'</td><td style="color:var(--dm)">'+costH+'</td><td style="color:var(--g)">$'+F(val,2)+'</td><td>'+pnlH+'</td><td>'+pctH+'</td><td>'+actH+'</td></tr>');
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
  var entries=ptfLedger.filter(function(e){return e.asset===assetId;});
  var asset=null;
  for(var i=0;i<ptfAssets.length;i++){if(ptfAssets[i].id===assetId){asset=ptfAssets[i];break;}}
  if(!asset)return;
  var totalCost=0,totalAmt=0;
  for(var j=0;j<entries.length;j++){totalCost+=entries[j].total;totalAmt+=entries[j].amount;}
  asset.totalCost=totalCost;
  asset.avgEntry=totalAmt>0?totalCost/totalAmt:0;
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

function ptfRenderTimeline(){
  var el=$("ptfChartTimeline");if(!el)return;
  try{
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
  try{
    var data={version:PTF_VERSION,exportDate:new Date().toISOString(),assets:ptfAssets,ledger:ptfLedger,targets:ptfSimTargets,snapshots:ptfSnapshots||[]};
    var json=JSON.stringify(data,null,2);
    var blob=new Blob([json],{type:"application/json"});
    var url=URL.createObjectURL(blob);
    var a=document.createElement("a");
    a.href=url;a.download="altcoin-portfolio-"+new Date().toISOString().split("T")[0]+".json";
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }catch(e){console.log("PTF export err:",e);}
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
    // Auto LP Map scan every 5 min (count 5 = 5*60s = 300s)
    if(_refreshCount%5===0){try{lmapCache=null;lmapTs=0;scanLiqMap();}catch(e){}}
    // Sync portfolio to Hetzner for push alerts
    if(_refreshCount%5===0){try{syncPortfolioToServer();}catch(e){}}
    if(_refreshCount%60===0){try{fetchBurn30d();}catch(e){}}
    // Check portfolio value alerts
    try{checkPortfolioAlerts();}catch(e){}
    saveOffline();updateSysStatus();},60000);
}

// ═══ PORTFOLIO VALUE ALERTS ═══
function checkPortfolioAlerts(){
  try{
    if(!alertCfg||!P||P<=0)return;
    // Calculate total portfolio value
    var burnVal=(MY_BURN||0)*P + (MY_STBURN||0)*stR*P + (ALP||0)*P;
    var altVal=0;
    if(typeof ptfAssets!=="undefined"&&typeof ptfPrices!=="undefined"){
      for(var i=0;i<ptfAssets.length;i++){
        var pa=ptfAssets[i];
        var pp=ptfPrices[pa.geckoId]?ptfPrices[pa.geckoId].usd:0;
        altVal+=pa.amount*pp;
      }
    }
    var totalVal=burnVal+altVal;
    if(totalVal<=0)return;
    // Portfolio above threshold
    if(alertCfg.ptfHi&&alertCfg.ptfHi>0&&totalVal>=alertCfg.ptfHi&&!alertTriggered.ptfHi){
      var msg="Portfolio $"+F(totalVal,0)+" (above $"+F(alertCfg.ptfHi,0)+")";
      if(typeof notify==="function")notify("Portfolio Alert",msg);
      alertTriggered.ptfHi=Date.now();
    }
    // Portfolio below threshold
    if(alertCfg.ptfLo&&alertCfg.ptfLo>0&&totalVal<=alertCfg.ptfLo&&!alertTriggered.ptfLo){
      var msg2="Portfolio $"+F(totalVal,0)+" (below $"+F(alertCfg.ptfLo,0)+")";
      if(typeof notify==="function")notify("Portfolio Alert",msg2);
      alertTriggered.ptfLo=Date.now();
    }
    // Reset with 2% hysteresis
    if(alertCfg.ptfHi&&alertCfg.ptfHi>0&&totalVal<alertCfg.ptfHi*0.98)delete alertTriggered.ptfHi;
    if(alertCfg.ptfLo&&alertCfg.ptfLo>0&&totalVal>alertCfg.ptfLo*1.02)delete alertTriggered.ptfLo;
    try{localStorage.setItem("burn_alert_triggered",JSON.stringify(alertTriggered));}catch(e){}
  }catch(e){}
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
try{ptfFetchPrices();ptfDetectBalances();ptfDetectLedgerBalances();}catch(e){}
// Auto-scan LP Map after 10s (let other data load first)
setTimeout(function(){try{scanLiqMap();}catch(e){}},10000);
setTimeout(function(){try{syncPortfolioToServer();}catch(e){}},15000);
setTimeout(function(){try{fetchServerWalletState();}catch(e){}},5000);
startRefresh();
document.addEventListener("visibilitychange",function(){if(!document.hidden){go();fetchSt();fetchTrades();fetchWal();startRefresh();}});
