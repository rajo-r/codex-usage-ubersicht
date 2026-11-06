#!/usr/bin/env python3
"""Local Codex token telemetry. No network, no invented subscription limits."""
import json, os, glob
from datetime import datetime, timedelta, timezone
from collections import defaultdict
from pathlib import Path

ROOT=Path(os.environ.get('CODEX_HOME',str(Path.home()/'.codex')))/'sessions'

def main():
    daily=defaultdict(lambda:{'input':0,'cached':0,'output':0,'total':0,'events':0})
    files=0; events=0; latest=None; latest_limits={}; errors=0
    for filename in ROOT.rglob('*.jsonl') if ROOT.exists() else []:
        files+=1; previous=None
        try:
            with filename.open(encoding='utf-8',errors='replace') as stream:
                for line in stream:
                    try: obj=json.loads(line)
                    except (ValueError,TypeError): errors+=1; continue
                    p=obj.get('payload') or {}
                    if obj.get('type')!='event_msg' or p.get('type')!='token_count': continue
                    info=p.get('info') or {}
                    totals=info.get('total_token_usage') or {}
                    if not totals: continue
                    ts=obj.get('timestamp')
                    try: dt=datetime.fromisoformat(ts.replace('Z','+00:00')).astimezone()
                    except (ValueError,AttributeError): continue
                    # Per-session cumulative counters: difference consecutive totals.
                    # If counter resets, treat new total as fresh usage.
                    fields=('input_tokens','cached_input_tokens','output_tokens','total_tokens')
                    cur={k:int(totals.get(k,0) or 0) for k in fields}
                    delta={k:max(0,cur[k]-(previous or {}).get(k,0)) if previous is not None and cur[k]>=(previous or {}).get(k,0) else cur[k] for k in fields}
                    previous=cur
                    d=daily[dt.date().isoformat()]
                    for src,dst in [('input_tokens','input'),('cached_input_tokens','cached'),('output_tokens','output'),('total_tokens','total')]:d[dst]+=delta[src]
                    d['events']+=1; events+=1
                    if latest is None or dt>latest:
                        latest=dt
                        latest_limits=p.get('rate_limits') or {}
        except OSError: errors+=1
    now=datetime.now().astimezone(); today=now.date(); week=today-timedelta(days=6)
    def aggregate(days):
        keys=[(today-timedelta(days=i)).isoformat() for i in range(days)]
        return {k:sum(daily[x][k] for x in keys) for k in ('input','cached','output','total','events')}
    series=[{'date':(today-timedelta(days=i)).isoformat(),**daily[(today-timedelta(days=i)).isoformat()]} for i in range(29,-1,-1)]
    out={'ok':True,'updated':now.isoformat(timespec='seconds'),'last_event':latest.isoformat(timespec='seconds') if latest else None,'sessions':files,'events':events,'errors':errors,'today':aggregate(1),'week7':aggregate(7),'month30':aggregate(30),'series':series,'rate_limits':latest_limits,'quota_note':'Token totals are local usage, not ChatGPT subscription quota.','source':str(ROOT)}
    print(json.dumps(out,ensure_ascii=False))
if __name__=='__main__':
    try: main()
    except Exception as e: print(json.dumps({'ok':False,'error':str(e)}))
