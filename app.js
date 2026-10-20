const API='/api/game';
const state={screen:'welcome',team:JSON.parse(localStorage.getItem('zoapmas-team')||'null'),data:null,heading:0,position:null,stream:null};
const questions=[
 {q:'Welke plant hangt men traditioneel op met Kerstmis?',options:['Maretak','Klavertje vier','Lavendel','Klimop'],answer:0},
 {q:'Hoe heet het rendier met de rode neus?',options:['Donder','Rudolf','Cupid','Blitzen'],answer:1},
 {q:'In welk land ontstond de moderne kerstboomtraditie?',options:['België','Duitsland','Canada','Noorwegen'],answer:1},
 {q:'Hoeveel punten telt een juist antwoord?',options:['5','10','15','25'],answer:2}
];
const stops=[
 {name:'Het winterplein',hint:'Volg de ster en zoek een open plek.',lat:null,lng:null},
 {name:'De stille boom',hint:'Hier wacht een raadsel tussen de takken.',lat:null,lng:null},
 {name:'Santa’s eindpost',hint:'De laatste halte voor het scorebord.',lat:null,lng:null}
];
const view=document.querySelector('#view'),nav=document.querySelector('#nav'),back=document.querySelector('#backBtn');

function toast(msg){const el=document.querySelector('#toastTemplate').content.firstElementChild.cloneNode();el.textContent=msg;document.body.append(el);setTimeout(()=>el.remove(),3100)}
function saveTeam(){localStorage.setItem('zoapmas-team',JSON.stringify(state.team))}
function escapeHtml(s=''){return s.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function go(screen){state.screen=screen;history.replaceState(null,'',`#${screen}`);render();if(screen==='scoreboard')sync();if(screen==='route')startSensors()}
function shell(title,body){return `<p class="eyebrow">Merry Zoapmas</p><h1 class="screen-title">${title}</h1>${body}`}

function render(){
 const logged=!!state.team; nav.hidden=!logged; back.hidden=state.screen==='welcome'||state.screen==='home';
 document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.screen===state.screen));
 if(!logged&&state.screen!=='register')state.screen='welcome';
 const screens={welcome,register,home,route,quiz,scoreboard,selfie};view.innerHTML=screens[state.screen]();bind();
}
function welcome(){return `<div class="hero"><p class="eyebrow">Chiro kerstspel</p><div class="hero-art">🎅🦌</div><h1>Christmas is coming</h1><p>Vorm je team, vind de kerstposten en klim naar de top van het scorebord.</p><div class="actions"><button class="btn" data-go="register">Start het spel →</button></div></div>`}
function register(){return shell('Maak je kerstteam',`<div class="card"><form id="teamForm" class="form"><div class="field"><label for="teamName">Teamnaam</label><input id="teamName" maxlength="30" required placeholder="De Kerstkrakers"></div><div class="field"><label for="teamCode">Spelcode</label><input id="teamCode" maxlength="20" required value="HELGTRE" autocapitalize="characters"></div><button class="btn red" type="submit">Team registreren</button></form></div><p class="lead">Eén registratie per ploeg. De teamgegevens blijven op deze telefoon bewaard.</p>`)}
function home(){const score=state.team?.score||0;return shell(`Dag, ${escapeHtml(state.team.name)}`,`<p class="lead">Jullie kerstmissie is begonnen. Werk samen en verzamel zoveel mogelijk punten.</p><div class="stats"><div class="card stat"><b>${score}</b><span>punten</span></div><div class="card stat"><b>${state.team.progress||0}/3</b><span>posten</span></div></div><div class="card"><h2>Volgende missie</h2><p>Gebruik gps en kompas om de volgende kerstpost te vinden.</p><div class="progress"><i style="width:${(state.team.progress||0)/3*100}%"></i></div><div class="actions"><button class="btn" data-go="route">Open route</button></div></div>`)}
function route(){const idx=Math.min(state.team.progress||0,2),stop=stops[idx];return shell('Kerstkompas',`<div class="card route-card"><div class="compass"><span id="needle" style="transform:rotate(${state.heading}deg)">↑</span></div><div><span class="pill" id="gpsStatus">Locatie zoeken...</span><h2>${stop.name}</h2><p>${stop.hint}</p></div></div><div class="status">GPS wordt alleen gebruikt om je richting en nabijheid op dit toestel te bepalen. Er wordt geen locatie opgeslagen.</div><button class="btn red" id="foundBtn">Post gevonden +20</button>`)}
function quiz(){const qIndex=Math.min(state.team.quiz||0,questions.length-1),q=questions[qIndex];if((state.team.quiz||0)>=questions.length)return shell('Quiz voltooid',`<div class="empty"><div class="emoji">🏆</div><h2>Alle vragen gespeeld</h2><p class="lead">Jullie quizpunten staan op het scorebord.</p></div>`);return shell(`Vraag ${qIndex+1}`,`<div class="card"><span class="pill">${qIndex+1} van ${questions.length}</span><h2>${q.q}</h2><div class="options">${q.options.map((o,i)=>`<button class="option" data-answer="${i}">${o}</button>`).join('')}</div></div>`)}
function scoreboard(){const teams=state.data?.teams||[];return shell('Scorebord',`<div class="card">${teams.length?teams.map((t,i)=>`<div class="rank"><span class="place">${i+1}</span><div><strong>${escapeHtml(t.name)}</strong><small>${t.progress||0} posten · ${t.quiz||0} quizvragen</small></div><b>${t.score||0}</b></div>`).join(''):`<div class="empty"><div class="emoji">🎁</div><p>Nog geen scores geladen.</p></div>`}</div><div class="status" id="syncStatus">Het scorebord wordt automatisch bijgewerkt.</div>`)}
function selfie(){return shell('AI-kerstselfie',`<p class="lead">Maak een foto en verander je team in kersthelden.</p><div class="camera"><video id="video" autoplay playsinline muted></video><img id="result" class="hidden" alt="Kerstselfie"><div class="overlay"></div></div><canvas id="canvas" class="hidden"></canvas><div class="actions"><button class="btn secondary" id="cameraBtn">Camera openen</button><button class="btn red" id="snapBtn" disabled>Maak kerstselfie</button></div><div class="status">De foto wordt alleen naar de AI-dienst gestuurd wanneer je op “Maak kerstselfie” tikt.</div>`)}

function bind(){
 document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));
 document.querySelector('#teamForm')?.addEventListener('submit',registerTeam);
 document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>answer(Number(b.dataset.answer),b));
 document.querySelector('#foundBtn')?.addEventListener('click',foundStop);
 document.querySelector('#cameraBtn')?.addEventListener('click',openCamera);
 document.querySelector('#snapBtn')?.addEventListener('click',takeSelfie);
}
async function request(action,payload={}){const res=await fetch(API,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action,...payload})});if(!res.ok)throw new Error((await res.json().catch(()=>({}))).error||'Serverfout');return res.json()}
async function registerTeam(e){e.preventDefault();const name=e.target.teamName.value.trim(),gameCode=e.target.teamCode.value.trim().toUpperCase();try{const data=await request('register',{name,gameCode});state.team=data.team;state.data=data;saveTeam();go('home');toast('Team geregistreerd 🎄')}catch(err){toast(err.message)}}
async function updateTeam(changes){state.team={...state.team,...changes};saveTeam();render();try{const data=await request('update',{team:state.team});state.data=data}catch{toast('Offline bewaard, synchronisatie volgt later')}}
async function foundStop(){const progress=Math.min(3,(state.team.progress||0)+1);await updateTeam({progress,score:(state.team.score||0)+20});toast(progress===3?'Alle posten gevonden!':'Post gevonden, +20 punten')}
async function answer(choice,button){const i=state.team.quiz||0,q=questions[i],correct=choice===q.answer;document.querySelectorAll('.option').forEach((b,j)=>{b.disabled=true;if(j===q.answer)b.classList.add('correct')});button.classList.add('selected');setTimeout(()=>updateTeam({quiz:i+1,score:(state.team.score||0)+(correct?15:0)}),900);toast(correct?'Juist, +15 punten!':'Helaas, het juiste antwoord licht groen op')}
async function sync(){try{const res=await fetch(`${API}?code=${encodeURIComponent(state.team.gameCode)}`);if(!res.ok)throw 0;state.data=await res.json();if(state.screen==='scoreboard')render()}catch{document.querySelector('#syncStatus')?.replaceChildren('Geen verbinding. We proberen later opnieuw.')}}
function startSensors(){if(navigator.geolocation)navigator.geolocation.getCurrentPosition(p=>{state.position=p.coords;const el=document.querySelector('#gpsStatus');if(el)el.textContent=`GPS nauwkeurig tot ${Math.round(p.coords.accuracy)} m`},()=>{const el=document.querySelector('#gpsStatus');if(el)el.textContent='GPS niet beschikbaar'},{enableHighAccuracy:true,timeout:10000});window.addEventListener('deviceorientationabsolute',orientation,{once:false});window.addEventListener('deviceorientation',orientation,{once:false})}
function orientation(e){const h=e.webkitCompassHeading??(e.alpha==null?0:360-e.alpha);state.heading=Math.round(h);const n=document.querySelector('#needle');if(n)n.style.transform=`rotate(${state.heading}deg)`}
async function openCamera(){try{state.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:false});document.querySelector('#video').srcObject=state.stream;document.querySelector('#snapBtn').disabled=false;toast('Camera is klaar')}catch{toast('Geef cameratoegang om een selfie te maken')}}
async function takeSelfie(){const video=document.querySelector('#video'),canvas=document.querySelector('#canvas');canvas.width=768;canvas.height=Math.round(768*video.videoHeight/video.videoWidth);canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);const image=canvas.toDataURL('image/jpeg',.82);toast('De kerstmagie wordt gemaakt...');try{const res=await fetch('/api/ai-selfie',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({image,teamName:state.team.name})});const data=await res.json();if(!res.ok)throw new Error(data.error);const img=document.querySelector('#result');img.src=data.image;img.classList.remove('hidden');video.classList.add('hidden');toast('Jullie kerstselfie is klaar!')}catch(err){toast(err.message||'AI-selfie is nog niet geconfigureerd')}}

document.querySelector('#nav').onclick=e=>{const b=e.target.closest('[data-screen]');if(b)go(b.dataset.screen)};
back.onclick=()=>go(state.team?'home':'welcome');
document.querySelector('#soundBtn').onclick=()=>toast('Kerstgeluid staat uit in deze stille versie');
if(location.hash&&state.team)state.screen=location.hash.slice(1);render();
setInterval(()=>{if(state.team)sync()},15000);
