// Berechnet die Pkw-Fahrzeiten zwischen allen bekannten Städten aus index.html und schreibt data/fahrzeiten.json.
// Aufruf: node scripts/fahrzeiten.mjs   (Node 18 oder neuer, Internet nötig)
// Optional: OSRM_URL (Standard: öffentlicher Demo-Server), OUT (Standard: data/fahrzeiten.json)
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {dirname} from 'node:path';

const OSRM=process.env.OSRM_URL||'https://router.project-osrm.org';
const OUT=process.env.OUT||new URL('../data/fahrzeiten.json',import.meta.url).pathname;
const BLOCK=50; // OSRM-Demo erlaubt höchstens 100 Koordinaten je Anfrage
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const D=JSON.parse(html.match(/const D=(\{.*?\});\nconst SEED/s)[1]);
const cities=D.nodes.map(([n,lat,lon])=>({n,lat,lon}));
const N=cities.length,total=N*(N-1)/2;
const idx=(i,j)=>i*N-i*(i+1)/2+(j-i-1);   // Dreiecksindex für i<j
const min=new Array(total).fill(-2),km=new Array(total).fill(-2); // -2 = noch offen, -1 = keine Route

async function table(coords,sources,dests){
 const url=`${OSRM}/table/v1/driving/${coords.map(p=>p.lon.toFixed(5)+','+p.lat.toFixed(5)).join(';')}?sources=${sources.join(';')}&destinations=${dests.join(';')}&annotations=duration,distance`;
 for(let t=1;;t++){
  try{
   const r=await fetch(url);
   if(!r.ok)throw new Error('HTTP '+r.status);
   const j=await r.json();
   if(j.code!=='Ok')throw new Error(j.code);
   return j;
  }catch(e){if(t>=6)throw e;console.warn('Wiederholung',t,e.message);await sleep(2000*t);}
 }
}

const blocks=[];for(let i=0;i<N;i+=BLOCK)blocks.push(Array.from({length:Math.min(BLOCK,N-i)},(_,k)=>i+k));
let done=0;const need=blocks.length*(blocks.length+1)/2;
for(let a=0;a<blocks.length;a++)for(let b=a;b<blocks.length;b++){
 const A=blocks[a],B=blocks[b],same=a===b;
 const coords=(same?A:[...A,...B]).map(i=>cities[i]);
 const src=A.map((_,k)=>k),dst=same?src:B.map((_,k)=>A.length+k);
 const j=await table(coords,src,dst);
 A.forEach((i,r)=>B.forEach((jj,c)=>{
  if(i>=jj)return;
  const s=j.durations[r][c],m=j.distances?j.distances[r][c]:null,x=idx(i,jj);
  min[x]=s==null?-1:Math.min(361,Math.round(s/60)); // 361 = mehr als 6 Stunden
  km[x]=m==null?-1:Math.round(m/1000);
 }));
 console.log(`Anfrage ${++done} von ${need}`);
 await sleep(1000);
}
const open=min.filter(v=>v===-2).length;
if(open)throw new Error(open+' Verbindungen blieben offen');
mkdirSync(dirname(OUT),{recursive:true});
writeFileSync(OUT,JSON.stringify({v:1,erzeugt:new Date().toISOString().slice(0,10),quelle:'OSRM, Pkw, ohne Verkehr',cities:cities.map(c=>[c.n,c.lat,c.lon]),min,km}));
console.log('Geschrieben:',OUT,N,'Städte,',total,'Verbindungen');
