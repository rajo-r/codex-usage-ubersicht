// Codex local usage dashboard for Übersicht. Read-only; no network requests.
export const command = '/usr/bin/env python3 codex-usage.widget/fetch-usage.py';
export const refreshFrequency = 60000;
export const className = `
  position:absolute; bottom:20px; left:20px; width:390px;
  font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;
  color:#171717;
  .card{background:#f2ede2;box-shadow:0 9px 32px #0003;border:1px solid #1c1c1c;border-radius:12px;padding:20px;box-sizing:border-box}
  .head{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #171717;padding-bottom:13px}
  .tag{font-weight:900;font-size:24px;letter-spacing:1px}.badge{background:#171717;color:white;padding:5px 9px;font-size:10px;letter-spacing:1px}
  .muted{font-size:11px;color:#656565}.big{font-weight:900;font-size:36px;margin-top:7px}.unit{font-size:12px;font-weight:500}
  .row{display:flex;justify-content:space-between;align-items:baseline;margin-top:15px}.row b{font-size:17px}
  .track{height:7px;background:#ded8c9;margin-top:7px;overflow:hidden}.fill{height:100%;background:linear-gradient(90deg,#3a9d5d,#f4c430,#e63946)}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:16px}.box{background:#fff;padding:11px}.box b{display:block;font-size:18px;margin-top:4px}
  .chart{height:68px;display:flex;align-items:flex-end;gap:3px;margin-top:15px;border-bottom:1px solid #aaa}.bar{flex:1;min-width:2px;background:#10a37f}
  .footer{border-top:1px solid #bbb;margin-top:14px;padding-top:10px;line-height:1.5}
  .error{color:#a22;font-size:12px;word-break:break-word}
`;
const fmt = (v) => {const n=Number(v||0);return n>=1e9?(n/1e9).toFixed(2)+'B':n>=1e6?(n/1e6).toFixed(2)+'M':n>=1e3?(n/1e3).toFixed(1)+'k':String(n)};
const time = (s) => {if(!s)return '—';const d=new Date(s);return isNaN(d.getTime())?'—':d.toLocaleString()};
export const render = ({output,error}) => {
 let d;try{d=JSON.parse(output||'{}')}catch(e){d={ok:false,error:String(e)}}
 if(error||!d.ok)return <div className="card"><div className="tag">CODEX USAGE</div><p className="error">{error||d.error||'Waiting for local data…'}</p></div>;
 const max=Math.max(1,...d.series.map(x=>x.total));
 const input=d.month30.input||0,cached=d.month30.cached||0;
 const cacheShare=input>0?Math.min(100,100*cached/input):0;
 return <div className="card">
   <div className="head"><div><div className="tag">CODEX USAGE</div><div className="muted">LOCAL SESSION TELEMETRY</div></div><div className="badge">30 DAYS</div></div>
   <div className="row"><span className="muted">LAST 7 DAYS</span><span className="muted">TOKENS</span></div>
   <div className="big">{fmt(d.week7.total)} <span className="unit">tokens</span></div>
   <div className="grid">
    <div className="box"><span className="muted">TODAY</span><b>{fmt(d.today.total)}</b></div>
    <div className="box"><span className="muted">30 DAYS</span><b>{fmt(d.month30.total)}</b></div>
    <div className="box"><span className="muted">INPUT / 30 DAYS</span><b>{fmt(d.month30.input)}</b></div>
    <div className="box"><span className="muted">OUTPUT / 30 DAYS</span><b>{fmt(d.month30.output)}</b></div>
   </div>
   <div className="row"><span className="muted">CACHED INPUT / 30 DAYS</span><b>{cacheShare.toFixed(1)}%</b></div>
   <div className="track"><div className="fill" style={{width:cacheShare+'%'}}/></div>
   <div className="row"><span className="muted">DENNÁ SPOTREBA · 30 DAYS</span><span className="muted">MAX {fmt(max)}</span></div>
   <div className="chart">{d.series.map(x=><div key={x.date} className="bar" title={x.date+': '+fmt(x.total)+' tokens'} style={{height:Math.max(1,x.total/max*100)+'%'}}/>)}</div>
   <div className="footer muted">Sessions: {d.sessions} · Token events: {d.events}<br/>Last event: {time(d.last_event)}<br/>Updated: {time(d.updated)}<br/><strong>Subscription limits: unknown.</strong> Local tokens do not indicate weekly quota usage.</div>
 </div>;
};
