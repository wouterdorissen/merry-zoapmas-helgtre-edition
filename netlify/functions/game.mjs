import { getStore } from '@netlify/blobs';

const headers={'content-type':'application/json','cache-control':'no-store'};
const GAME_ID='helgtre-main';
const clean=s=>String(s||'').trim().slice(0,40);
const id=()=>crypto.randomUUID();
async function load(code){const store=getStore('zoapmas-games');return {store,data:await store.get(code,{type:'json'})||{teams:[],updatedAt:null}}}
export default async req=>{
 try{
  if(req.method==='GET'){
   const code=GAME_ID;
   const {data}=await load(code);return new Response(JSON.stringify(data),{headers});
  }
  if(req.method!=='POST')return new Response('',{status:405,headers});
  const body=await req.json(),action=body.action;
  if(action==='register'){
   const name=clean(body.name),gameCode=GAME_ID;if(!name)return new Response(JSON.stringify({error:'Vul een teamnaam in'}),{status:400,headers});
   const {store,data}=await load(gameCode);const team={id:id(),name,gameCode,score:0,progress:0,quiz:0,updatedAt:new Date().toISOString()};data.teams.push(team);data.updatedAt=team.updatedAt;await store.setJSON(gameCode,data);return new Response(JSON.stringify({...data,team}),{headers});
  }
  if(action==='update'){
   const incoming=body.team,gameCode=clean(incoming?.gameCode).toUpperCase();if(!gameCode||!incoming?.id)return new Response(JSON.stringify({error:'Ongeldig team'}),{status:400,headers});
   const {store,data}=await load(gameCode);const i=data.teams.findIndex(t=>t.id===incoming.id);if(i<0)return new Response(JSON.stringify({error:'Team niet gevonden'}),{status:404,headers});
   data.teams[i]={...data.teams[i],name:clean(incoming.name),score:Math.max(0,Number(incoming.score)||0),progress:Math.min(3,Math.max(0,Number(incoming.progress)||0)),quiz:Math.min(4,Math.max(0,Number(incoming.quiz)||0)),updatedAt:new Date().toISOString()};data.teams.sort((a,b)=>b.score-a.score);data.updatedAt=new Date().toISOString();await store.setJSON(gameCode,data);return new Response(JSON.stringify(data),{headers});
  }
  return new Response(JSON.stringify({error:'Onbekende actie'}),{status:400,headers});
 }catch(error){console.error(error);return new Response(JSON.stringify({error:'Synchronisatie is tijdelijk niet beschikbaar'}),{status:500,headers})}
};
