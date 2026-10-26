import { useEffect, useState } from 'react';
const cache = new Map();
export const CENSUS_DOCS = 'https://www.census.gov/programs-surveys/acs';
export function useCensus(geoid) {
 const [attempt,setAttempt]=useState(0); const [state,setState]=useState({status:'loading'});
 useEffect(()=>{ const controller=new AbortController(); let active=true;
 const tract=geoid && /^42101\d{6}$/.test(geoid) ? geoid.slice(5) : null;
 const id=geoid || 'county';
 if(geoid && !tract){setState({status:'unavailable'});return;}
 if(cache.has(id)){setState({status:'ready',data:cache.get(id)});return;}
 setState({status:'loading'});
 const params=new URLSearchParams({get:'NAME,B01003_001E,B19013_001E,B23025_003E,B23025_005E',for:tract?`tract:${tract}`:'county:101',in:tract?'state:42 county:101':'state:42'});
 if(import.meta.env.VITE_CENSUS_API_KEY) params.set('key',import.meta.env.VITE_CENSUS_API_KEY);
 const timeout=setTimeout(()=>controller.abort(),15000);
 fetch(`https://api.census.gov/data/2024/acs/acs5?${params}`,{signal:controller.signal}).then(async r=>{if(r.status===204)return null;if(!r.ok)throw Error();const body=await r.text();if(body.includes('Missing Key'))throw Error('key');return JSON.parse(body);}).then(rows=>{
 if(!active)return;if(!rows || rows.length<2){setState({status:'unavailable'});return;}
 const [name,pop,income,labor,unemployed]=rows[1]; const valid=v=>v!==null&&v!==''&&Number.isFinite(Number(v))&&Number(v)>=0?Number(v):null;
 const data={name,population:valid(pop),income:valid(income),unemployment:valid(labor)>0&&valid(unemployed)!==null?Number(unemployed)/Number(labor)*100:null};cache.set(id,data);setState({status:'ready',data});
 }).catch(error=>{if(active)setState({status:error.message==='key'?'key-required':'error'});}).finally(()=>clearTimeout(timeout));
 return()=>{active=false;clearTimeout(timeout);controller.abort();};
 },[geoid,attempt]);
 return {...state,retry:()=>setAttempt(v=>v+1)};
}
