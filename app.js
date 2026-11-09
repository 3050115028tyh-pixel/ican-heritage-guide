(() => {
  'use strict';
  const D = window.HERITAGE;
  const PAGE = document.body.dataset.page;
  const PARAMS = new URLSearchParams(location.search);
  const KEY = 'heritage-touch-v5';
  const FILES = {home:'index.html',route:'route.html',exhibits:'exhibits.html',exhibit:'exhibit.html',qa:'qa.html',interaction:'interaction.html',help:'help.html'};
  const TITLES = {home:'非遗展厅导览',route:'路线指引',exhibits:'展厅讲解',exhibit:'展厅讲解',qa:'非遗问答',interaction:'互动体验',help:'人工帮助'};
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const paths = {
    back:'<path d="m14 5-7 7 7 7M7 12h14"/>', arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
    home:'<path d="m3 10 9-7 9 7v10H3Zm6 10v-7h6v7"/>', close:'<path d="m6 6 12 12M18 6 6 18"/>',
    route:'<circle cx="6" cy="18" r="3"/><circle cx="18" cy="6" r="3"/><path d="M6 15V8a4 4 0 0 1 4-4h2M18 9v7a4 4 0 0 1-4 4h-2"/>',
    book:'<path d="M12 5C8 3 5 3 2 4v15c3-1 6-1 10 1 4-2 7-2 10-1V4c-3-1-6-1-10 1Zm0 0v15"/>',
    chat:'<path d="M21 11a8 8 0 0 1-8 8H6l-4 3V11a9 9 0 0 1 19 0Z"/><path d="M7 9h8m-8 5h5"/>',
    flower:'<path d="M12 2c4 0 5 5 2 8 3-3 8-2 8 2s-5 5-8 2c3 3 2 8-2 8s-5-5-2-8c-3 3-8 2-8-2s5-5 8-2c-3-3-2-8 2-8Z"/><circle cx="12" cy="12" r="2"/>',
    spark:'<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/>',
    help:'<path d="M4 13v-2a8 8 0 0 1 16 0v2M2 12h4v7H2ZM18 12h4v7h-4ZM20 19v3h-6"/>',
    play:'<path d="m8 4 12 8-12 8Z"/>',pause:'<path d="M8 4v16M16 4v16"/>',next:'<path d="m5 5 10 7-10 7ZM19 5v14"/>',
    repeat:'<path d="M20 8a8 8 0 1 0 0 8M20 3v6h-6"/>',sound:'<path d="m11 5-6 4H2v6h3l6 4ZM15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/>',
    mute:'<path d="m11 5-6 4H2v6h3l6 4ZM16 9l6 6M22 9l-6 6"/>',expand:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
    battery:'<rect x="2" y="6" width="18" height="12" rx="3"/><path d="M23 10v4M6 10v4m4-4v4m4-4v4"/>',
    settings:'<path d="M4 7h16M4 17h16M8 4v6m8 4v6"/>',check:'<path d="m4 12 5 5L20 6"/>',
    pin:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/>',person:'<circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>',
    stop:'<rect x="5" y="5" width="14" height="14" rx="2"/>',send:'<path d="m3 3 19 9-19 9 3-9Zm3 9h16"/>',trash:'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>'
  };
  const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.info}</svg>`;
  const blankQuiz = () => ({phase:'intro',index:0,answers:[null,null,null],questionIds:[]});
  const blank = () => ({version:5,mapView:{x:0,y:0,w:920,h:640},selectedPerson:null,galleryFilter:'all',profile:{party:'single',people:1,mode:'adult'},audio:false,battery:86,history:[],selectedDest:'overview',selectedItems:{},readerTabs:{},readerPositions:{},tour:{status:'idle',resume:'narrating',full:false,stop:'overview',location:'entry',target:null,remaining:3200,duration:3200,startedAt:0,visited:[],skipped:[]},qa:{messages:[],count:0,context:null,stop:null,item:null,draft:''},quiz:blankQuiz(),help:{status:'none',reason:'讲解服务'},alert:null,log:[]});
  function load() {
    try{
      const saved=JSON.parse(sessionStorage.getItem(KEY)||sessionStorage.getItem('heritage-touch-v4'));
      if([4,5].includes(saved?.version)){
        const state={...blank(),...saved,version:5};
        if(state.quiz.phase!=='intro'&&(state.quiz.questionIds.length!==3||state.quiz.questionIds.some(id=>!D.quizzes.some(q=>q.id===id))))state.quiz=blankQuiz();
        return state;
      }
      const old=JSON.parse(sessionStorage.getItem('heritage-touch-v3'));
      if(old?.version===3){const state={...blank(),profile:old.profile,audio:old.audio,battery:old.battery,history:old.history,selectedDest:old.selectedDest,tour:old.tour};if(state.tour.status==='moving'){state.tour.status='paused';state.tour.resume='moving';}return state;}
    }catch{}
    return blank();
  }
  let S = load(), moveTimer = null, tickTimer = null, voiceToken = 0, speaking = false, internalNavigation = false, dialogKind = null, dialogDraft = null, toastTimer = null, ignoreBackdropUntil = 0;
  if(PAGE==='exhibit'&&PARAMS.get('id')==='craft'&&D.projects.some(p=>p.id===PARAMS.get('item'))){S.selectedItems.craft=PARAMS.get('item');}
  const canonical = () => location.pathname.split('/').pop() + location.search;
  const stopById = id => D.stops.find(s=>s.id===id) || D.stops[0];
  const currentStop = () => stopById(PARAMS.get('id') || S.tour.stop);
  const itemForStop = stop => stop.items.find(item=>item.id===S.selectedItems[stop.id])||stop.items[0];
  const currentItem = () => itemForStop(currentStop());
  const readerKey = () => currentStop().id+':'+(currentItem()?.id||'experience');
  const currentSection = () => currentItem()?.sections.find(section=>section.id===S.readerTabs[readerKey()])||currentItem()?.sections[0];
  const sectionBlocks = () => (S.profile.mode==='child'?currentSection()?.child:currentSection()?.blocks)||[];
  const positionKey = () => readerKey()+':'+(currentSection()?.id||'intro')+':'+S.profile.mode;
  const active = () => ['narrating','moving','paused'].includes(S.tour.status);
  const blocked = () => Boolean(S.alert || ['requested','taken'].includes(S.help.status));
  const guided = () => PAGE==='exhibit' && PARAMS.get('guided')==='1' && S.tour.full && S.tour.stop===currentStop().id && active();
  const profileText = () => `${S.profile.people} 人 · ${S.profile.mode==='child'?'亲子版':'大众版'}`;
  // Continuous aisle graph: adjacent exhibit bays share the aisle rather than a remote hub.
  const NODES = {entry:[165,555],doorway:[215,555],west:[215,525],southwest:[215,445],overview:[215,340],upper:[215,225],craft:[490,225],junction:[755,225],interaction:[850,225],story:[755,360],lower:[755,445],works:[650,445],corridor:[755,525],eastDoor:[755,555],rear:[755,567],rearWest:[215,567],exit:[850,555],toilet:[935,525]};
  const EDGES = [['entry','doorway'],['doorway','west'],['west','southwest'],['southwest','overview'],['overview','upper'],['upper','craft'],['craft','junction'],['junction','interaction'],['junction','story'],['story','lower'],['lower','corridor'],['corridor','eastDoor'],['eastDoor','exit'],['corridor','toilet'],['eastDoor','rear'],['doorway','rearWest']];
  const frontAisle=['southwest'],rearAisle=['rearWest'];
  for(let col=0;col<8;col++){const x=285+col*55;NODES['front_'+col]=[x,445];NODES['back_'+col]=[x,567];frontAisle.push('front_'+col);rearAisle.push('back_'+col);}
  frontAisle.push('works','lower');rearAisle.push('rear');
  for(const aisle of [frontAisle,rearAisle]){aisle.sort((a,b)=>NODES[a][0]-NODES[b][0]);for(let i=1;i<aisle.length;i++)EDGES.push([aisle[i-1],aisle[i]]);}
  D.works.forEach((w,i)=>{const col=i%8,row=Math.floor(i/8);NODES['work_'+w.id]=[285+col*55,485+row*48];EDGES.push([(row?'back_':'front_')+col,'work_'+w.id]);});
  function syncPositionNode(){
    for(let i=EDGES.length-1;i>=0;i--)if(EDGES[i].includes('position'))EDGES.splice(i,1);
    delete NODES.position;
    const p=S.tour.position;
    if(p&&p.point?.every(Number.isFinite)&&p.edge?.length===2&&p.edge.every(id=>NODES[id])&&EDGES.some(([a,b])=>a===p.edge[0]&&b===p.edge[1]||a===p.edge[1]&&b===p.edge[0])){
      NODES.position=p.point;EDGES.push([p.edge[0],'position'],['position',p.edge[1]]);
    }else if(S.tour.location==='position'){S.tour.location='entry';S.tour.position=null;}
  }
  syncPositionNode();
  const WORK_DESTS=D.works.map(w=>({id:'work_'+w.id,name:w.title,full:w.booth+' · '+w.title,work:w.id}));
  const DESTS = [...D.stops.map(s=>({id:s.id,name:s.name,full:s.full})),{id:'toilet',name:'卫生间',full:'卫生间'},{id:'exit',name:'出口',full:'出口'}];
  const destById = id => [...DESTS,...WORK_DESTS].find(d=>d.id===id) || DESTS[0];
  function save() {try{sessionStorage.setItem(KEY,JSON.stringify(S));}catch{toast('当前浏览器无法保存参观进度，请使用普通浏览窗口。');}}
  function log(text){S.log.unshift({time:new Date().toLocaleTimeString('zh-CN',{hour12:false,timeZone:'Asia/Shanghai'}),text});S.log=S.log.slice(0,35);}
  function toast(text){clearTimeout(toastTimer);$('toast').textContent=text;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,4000);}
  function fileURL(page,params={}) {const query=new URLSearchParams(params).toString();return FILES[page]+(query?'?'+query:'');}
  function navLink(page,params,cls,content){return `<a class="${cls}" href="${esc(fileURL(page,params))}" data-nav>${content}</a>`;}
  function button(action,label,cls='btn',extra='',symbol=''){return `<button type="button" class="${cls}" data-action="${action}" ${extra}>${symbol?icon(symbol):''}<span>${label}</span></button>`;}
  function stopAudio(){voiceToken++;if(window.speechSynthesis?.cancel)window.speechSynthesis.cancel();speaking=false;updateSpeechButtons();}
  function speak(text){
    stopAudio();
    if(!window.speechSynthesis || typeof window.SpeechSynthesisUtterance!=='function'){toast('当前设备不支持语音朗读。');return;}
    const voices=window.speechSynthesis.getVoices(),voice=voices.find(v=>/^zh[-_]CN/i.test(v.lang))||voices.find(v=>/^zh/i.test(v.lang));
    if(voices.length&&!voice){toast('当前设备未安装中文语音。');return;}
    const token=++voiceToken,u=new SpeechSynthesisUtterance(text);u.lang='zh-CN';u.rate=S.profile.mode==='child'?.88:.96;if(voice)u.voice=voice;
    u.onstart=()=>{if(token===voiceToken){speaking=true;updateSpeechButtons();}};
    u.onend=()=>{if(token===voiceToken){speaking=false;updateSpeechButtons();}};
    u.onerror=e=>{if(token!==voiceToken)return;speaking=false;updateSpeechButtons();if(!['canceled','interrupted'].includes(e.error))toast('语音暂不可用，可查看文字内容。');};
    try{window.speechSynthesis.speak(u);}catch{toast('语音暂不可用，可查看文字内容。');}
  }
  function updateSpeechButtons(){const b=$('read-content');if(b){b.innerHTML=icon(speaking?'stop':'sound')+`<span>${speaking?'停止朗读':'朗读'}</span>`;b.setAttribute('aria-pressed',String(speaking));}}
  function pause(reason){
    if(S.tour.status==='moving'){S.tour.remaining=Math.max(0,S.tour.remaining-(Date.now()-S.tour.startedAt));S.tour.resume='moving';S.tour.status='paused';clearMove();}
    else if(S.tour.status==='narrating'){S.tour.resume='narrating';S.tour.status='paused';}
    stopAudio();if(reason)log(reason);save();
  }
  function goURL(url,{keep=false,replace=false,back=false}={}){
    const target=new URL(url,location.href);
    if(!Object.values(FILES).includes(target.pathname.split('/').pop()))return;
    if(!keep&&active())pause('页面切换，导览暂停');
    if(!back&&canonical()!==target.pathname.split('/').pop()+target.search)S.history.push(canonical());
    S.history=S.history.slice(-25);save();internalNavigation=true;stopAudio();
    if(replace)location.replace(target.href);else location.assign(target.href);
  }
  function go(page,params={},options={}){goURL(fileURL(page,params),options);}
  function back(){let url;do{url=S.history.pop();}while(url===canonical());goURL(url||'index.html',{replace:true,back:true});}
  function goQA(){S.qa.context=(PAGE==='exhibit'||PAGE==='route')?canonical():null;S.qa.stop=PAGE==='exhibit'?currentStop().id:null;S.qa.item=PAGE==='exhibit'?currentItem()?.id:null;go('qa');}
  function returnContext(){const url=S.qa.context;if(!url){go('home');return;}if(S.history.at(-1)===url)S.history.pop();goURL(url,{replace:true,back:true});}
  function clearMove(){clearTimeout(moveTimer);clearInterval(tickTimer);moveTimer=null;tickTimer=null;}
  function edgeLength(a,b){return Math.hypot(NODES[a][0]-NODES[b][0],NODES[a][1]-NODES[b][1]);}
  function pathNodes(from,to){
    if(!NODES[from]||!NODES[to])return [];
    const distance=new Map([[from,0]]),previous=new Map(),pending=new Set(Object.keys(NODES));
    while(pending.size){
      let node=null,best=Infinity;
      for(const id of pending)if((distance.get(id)??Infinity)<best){node=id;best=distance.get(id);}
      if(node===null)break;
      if(node===to){const path=[to];while(previous.has(path[0]))path.unshift(previous.get(path[0]));return path;}
      pending.delete(node);
      for(const [a,b] of EDGES){const next=a===node?b:b===node?a:null;if(!next||!pending.has(next))continue;const cost=best+edgeLength(node,next);if(cost<(distance.get(next)??Infinity)){distance.set(next,cost);previous.set(next,node);}}
    }
    return [];
  }
  function movementProgress(){return S.tour.status==='moving'?Math.min(1,1-Math.max(0,S.tour.remaining-(Date.now()-S.tour.startedAt))/S.tour.duration):Math.max(0,1-S.tour.remaining/S.tour.duration);}
  function routePosition(progress){
    const route=pathNodes(S.tour.location,S.tour.target||S.selectedDest);
    if(route.length<2)return {point:NODES[route[0]]||NODES[S.tour.location]||NODES.entry,edge:null};
    const lengths=route.slice(1).map((id,i)=>edgeLength(route[i],id));
    let distance=lengths.reduce((a,b)=>a+b,0)*Math.max(0,Math.min(1,progress));
    for(let i=0;i<lengths.length;i++){
      if(distance<=lengths[i]||i===lengths.length-1){const a=NODES[route[i]],b=NODES[route[i+1]],t=lengths[i]?Math.min(1,distance/lengths[i]):0;return {point:[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t],edge:[route[i],route[i+1]]};}
      distance-=lengths[i];
    }
  }
  function mapPoint(progress){return routePosition(progress).point;}
  function retainCurrentPosition(){
    if(!S.tour.target||!['moving','paused'].includes(S.tour.status)||S.tour.resume!=='moving')return;
    const position=routePosition(movementProgress());if(!position.edge)return;
    // A route beginning at a saved in-aisle point still belongs to its original aisle edge.
    if(position.edge.includes('position'))position.edge=[...S.tour.position.edge];
    S.tour.position=position;S.tour.location='position';syncPositionNode();
  }
  function resetHomeState(){
    retainCurrentPosition();clearMove();stopAudio();
    const {location,position}=S.tour;
    S=blank();S.tour.location=location;S.tour.position=position||null;syncPositionNode();save();
  }
  function updateMovement(){
    if(PAGE!=='route'||S.tour.status!=='moving')return;
    const progress=movementProgress(),point=mapPoint(progress),marker=$('robot-marker'),bar=$('navigation-progress'),percent=$('navigation-percent');
    if(marker)marker.setAttribute('transform',`translate(${point[0]},${point[1]})`);
    if(bar)bar.style.width=Math.round(progress*100)+'%';if(percent)percent.textContent=Math.round(progress*100)+'%';
  }
  function armMove(){
    clearMove();if(S.tour.status!=='moving'||blocked())return;
    S.tour.startedAt=Date.now();save();
    moveTimer=setTimeout(arrive,Math.max(0,S.tour.remaining));tickTimer=setInterval(updateMovement,100);updateMovement();
  }
  function arrive(){
    if(S.tour.status!=='moving'||blocked())return;
    clearMove();const id=S.tour.target;S.tour.location=id;S.tour.position=null;syncPositionNode();S.tour.target=null;S.tour.remaining=0;
    if(D.stops.some(s=>s.id===id)){S.tour.stop=id;if(!S.tour.visited.includes(id))S.tour.visited.push(id);}
    log('模拟到达：'+destById(id).full);
    if(S.tour.full){S.tour.status='narrating';S.tour.resume='narrating';save();go('exhibit',{id,guided:'1'},{keep:true,replace:true});}
    else{S.tour.status='arrived';save();render();}
  }
  function startMove(id,full=false){
    if(blocked()){toast('当前状态需要处理，暂不能开始指引。');return;}
    retainCurrentPosition();stopAudio();clearMove();S.selectedDest=id;S.tour.full=full;S.tour.target=id;S.tour.remaining=3200;S.tour.duration=3200;S.tour.startedAt=Date.now();S.tour.status='moving';S.tour.resume='moving';
    log('开始模拟指引：'+destById(id).full);save();
    if(PAGE==='route'){render();armMove();}else go('route',{}, {keep:true});
  }
  function resume(){
    if(blocked()){toast('请先处理当前提示。');return;}
    if(S.tour.status!=='paused'){if(S.tour.status==='narrating')go('exhibit',{id:S.tour.stop,guided:'1'},{keep:true});return;}
    log('继续导览');
    if(S.tour.resume==='moving'&&S.tour.target){S.tour.status='moving';save();if(PAGE==='route'){render();armMove();}else go('route',{}, {keep:true});}
    else{S.tour.status='narrating';save();if(PAGE==='exhibit'&&currentStop().id===S.tour.stop&&PARAMS.get('guided')==='1'){render();autoRead();}else go('exhibit',{id:S.tour.stop,guided:'1'},{keep:true});}
  }
  function cancelNavigation(){retainCurrentPosition();pause();S.tour.status='idle';S.tour.full=false;S.tour.target=null;S.tour.remaining=0;log('结束路线指引');save();render();}
  function nextStation(skip=false){
    if(!guided()||blocked())return;
    if(skip&&!S.tour.skipped.includes(S.tour.stop))S.tour.skipped.push(S.tour.stop);
    const next=D.stops.findIndex(s=>s.id===S.tour.stop)+1;
    if(next>=D.stops.length){save();confirmEnd();}else startMove(D.stops[next].id,true);
  }
  function finish(){pause();clearMove();S.tour.status='idle';S.tour.full=false;S.tour.target=null;S.alert=null;S.help={status:'none',reason:'讲解服务'};log('参观结束');save();closeDialog();go('home',{}, {keep:true});}
  function fullTour(){
    const begin=()=>{if(active())pause('打开参观设置');dialogDraft={...S.profile};settingsDialog(true);};
    if(blocked()){toast('请先处理当前提示。');return;}
    if(active())confirmDialog('重新开始导览','将结束当前导览，清空本次参观、问答和答题记录。','继续设置',begin);else begin();
  }
  function beginFullTour(){
    retainCurrentPosition();const profile={...dialogDraft},audio=S.audio,{location,position}=S.tour;S=blank();S.profile=profile;S.audio=audio;S.tour.full=true;S.tour.location=location;S.tour.position=position||null;syncPositionNode();
    log(`开始全程导览：${profile.people} 人，${profile.mode==='child'?'亲子版':'大众版'}`);closeDialog();startMove('overview',true);
  }
  function confirmEnd(){pause('打开结束确认');render();confirmDialog('结束导览','结束后返回首页。','结束导览',finish);}
  function autoRead(){if(PAGE==='exhibit'&&S.audio&&guided()&&S.tour.status==='narrating'&&!blocked())setTimeout(()=>speak(readerText()),180);}
  function readerText(){
    const id=currentStop().id;
    if(id==='interaction')return '电子屏模拟制作位于互动体验区。请按路线前往体验区。';
    if(id==='overview')return '中国非遗地图。'+D.projects.map(p=>p.region+'，'+p.name+'。'+p.origin).join('');
    if(id==='story'){const p=personById(S.selectedPerson)||D.people[0];return p.name+'。'+p.title+'。'+p.blocks.map(b=>b.heading+'。'+b.text).join('');}
    if(id==='works')return '代表作品。'+D.works.map(w=>w.title+'，'+w.author+'。').join('');
    return `${currentItem().title}。${currentSection().label}。`+sectionBlocks().map(b=>b.heading+'。'+b.text).join('');
  }

  function header(){
    return `<header class="topbar"><div class="topbar-left">${PAGE==='home'?`<span class="brand-mark">${icon('flower')}</span>`:button('back','返回','nav-key','','back')+navLink('home',{},'nav-key',icon('home')+'<span>首页</span>')}<h1>${TITLES[PAGE]}</h1></div><div class="topbar-right"><span class="battery${S.battery<20?' low':''}" aria-label="模拟电量 ${S.battery}%">${icon('battery')}<span>${S.battery}%</span></span><button class="clock" id="clock" aria-label="时间，长按打开演示控制"></button>${button('audio','',`tool-key${S.audio?' selected':''}`,`aria-label="${S.audio?'关闭':'开启'}自动朗读" title="自动朗读" aria-pressed="${S.audio}"`,S.audio?'sound':'mute')}${button('fullscreen','','tool-key','aria-label="全屏" title="全屏"','expand')}</div></header>`;
  }
  function alertStrip(){if(!S.alert)return '';return `<div class="alert-strip${S.alert.staff?' critical':''}" role="alert"><div>${icon('info')}<span><strong>${esc(S.alert.title)}</strong><small>${esc(S.alert.text)}</small></span></div>${S.alert.action?button('recover',S.alert.action,'btn small outline'):navLink('help',{},'btn small outline','人工帮助')}</div>`;}
  function statusArea(){
    if(PAGE==='home'&&!active()&&!blocked())return button('profile',profileText(),'profile-control','','settings');
    let text='未开始导览',sub=profileText();
    if(!active()){
      if(PAGE==='exhibit'){text='自助讲解';sub=currentStop().name+(currentItem()?' · '+currentItem().name:'');}
      else if(PAGE==='exhibits'){text='展区选择';sub='5 个展区';}
      else if(PAGE==='qa'){text='文字问答';sub=S.qa.stop?stopById(S.qa.stop).name:'展区知识';}
      else if(PAGE==='interaction'){text='知识挑战';sub=S.quiz.phase==='intro'?'3 道题':S.quiz.phase==='result'?`答对 ${quizScore()} / 3 题`:`第 ${S.quiz.index+1} / 3 题`;}
      else if(PAGE==='help'){text='人工帮助';sub='服务台协助';}
      else if(PAGE==='route'){text='选择目的地';sub=S.tour.location==='entry'?'当前位置：入口':'当前位置：'+(S.tour.location==='position'?'通道内':destById(S.tour.location).name);}
    }
    if(active()){text={moving:'指引中',narrating:'讲解中',paused:'已暂停'}[S.tour.status];sub=`${destById(S.tour.target||S.tour.stop).name} · 已到访 ${S.tour.visited.length}/5`;}
    if(S.tour.status==='arrived'&&PAGE==='route'){text='已到达';sub=destById(S.tour.location).name;}
    if(blocked()){text=S.help.status==='taken'?'人工接管中':'等待处理';sub=S.alert?.title||'人工协助请求已记录';}
    return `<div class="status-area"><span class="status-light${blocked()?' warning':active()?' on':''}"></span><div><strong>${text}</strong><small>${esc(sub)}</small></div>${active()&&S.tour.full?button('end','结束','plain-button'):''}</div>`;
  }
  function footer(){
    let actions='';
    if(['home','exhibits'].includes(PAGE))actions=active()?button('resume','继续导览','btn primary',blocked()?'disabled':'','play'):button('full-tour','全程导览','btn primary',blocked()?'disabled':'','play');
    else if(PAGE==='exhibit'){
      if(guided())actions=button(S.tour.status==='paused'?'resume':'pause',S.tour.status==='paused'?'继续':'暂停','btn primary',blocked()?'disabled':'',S.tour.status==='paused'?'play':'pause')+(currentStop().id==='interaction'?'':button('repeat','重复','btn soft',blocked()?'disabled':'','repeat'))+button('skip','跳过','btn soft',blocked()?'disabled':'')+button('next-station',S.tour.stop==='works'?'完成':'下一站','btn soft',blocked()?'disabled':'','next');
      else {const i=D.stops.findIndex(s=>s.id===currentStop().id);actions=button('previous-exhibit','上一展区','btn soft',i===0?'disabled':'')+button('next-exhibit','下一展区','btn soft',i===4?'disabled':'');}
      actions+=button('qa','提问','btn outline','','chat');
    }else if(PAGE==='route'){
      if(['moving','paused'].includes(S.tour.status)&&S.tour.target)actions=button(S.tour.status==='moving'?'pause':'resume',S.tour.status==='moving'?'暂停':'继续','btn primary',blocked()?'disabled':'',S.tour.status==='moving'?'pause':'play')+button('cancel-nav','结束指引','btn outline');
      else if(active()&&S.tour.full)actions=button('resume','返回导览','btn primary',blocked()?'disabled':'','play');
    }else if(PAGE==='qa'){
      if(S.qa.context)actions+=button('return-context',S.qa.context.startsWith('route')?'返回指引':'返回讲解','btn primary','','back');
      actions+=button('clear-chat','清空记录','btn outline',S.qa.messages.length?'':'disabled','trash');
    }else if(PAGE==='interaction'&&active())actions=button('resume','返回导览','btn primary',blocked()?'disabled':'','play');
    else if(PAGE==='help')actions=navLink('home',{},'btn outline',icon('home')+'首页');
    if(PAGE!=='help')actions+=navLink('help',{},'btn help-button',icon('help')+'人工帮助');
    return `<footer class="bottom-bar">${statusArea()}<div class="bottom-actions">${actions}</div></footer>`;
  }
  function homePage(){
    return `<main class="screen home-screen"><div class="home-grid">
      ${navLink('route',{},'service-tile tile-route',`<span class="tile-icon">${icon('route')}</span><svg class="route-ornament" viewBox="0 0 300 200" aria-hidden="true"><path d="M35 158h72c66 0 14-102 80-102h72"/><circle cx="35" cy="158" r="14"/><circle cx="260" cy="56" r="14"/><path d="m249 28 11-17 11 17"/></svg><strong>路线指引</strong><span class="tile-arrow">${icon('arrow')}</span>`)}
      ${navLink('exhibits',{},'service-tile tile-exhibit',`<span class="tile-icon">${icon('book')}</span><img class="tile-art" src="assets/cloisonne.svg" alt=""><strong>展厅讲解</strong><span class="tile-arrow">${icon('arrow')}</span>`)}
      ${navLink('qa',{},'service-tile tile-qa',`<span class="tile-icon">${icon('chat')}</span><div class="chat-ornament" aria-hidden="true"><span></span><span></span><span></span></div><strong>非遗问答</strong><span class="tile-arrow">${icon('arrow')}</span>`)}
      ${navLink('interaction',{},'service-tile tile-interaction',`<span class="tile-icon">${icon('spark')}</span><div class="paper-ornament" aria-hidden="true">${icon('flower')}</div><strong>互动体验</strong><span class="tile-arrow">${icon('arrow')}</span>`)}
    </div></main>`;
  }
  function mapSVG(forcedTarget){
    const target=forcedTarget||((['moving','paused'].includes(S.tour.status)&&S.tour.target)?S.tour.target:S.selectedDest);
    const route=pathNodes(S.tour.location,target).map(id=>NODES[id].join(',')).join(' ');
    const point=S.tour.target&&['moving','paused'].includes(S.tour.status)?mapPoint(movementProgress()):NODES[S.tour.location]||NODES.entry;
    return `<svg class="floor-map" viewBox="0 0 1000 620" role="img" aria-label="展厅路线示意图，当前位置${esc(S.tour.location==='entry'?'入口':S.tour.location==='position'?'通道内':destById(S.tour.location).name)}，目的地${esc(destById(target).name)}">
      <rect class="map-floor" x="25" y="22" width="950" height="558" rx="28"/>
      <g class="map-room room-overview" data-action="select-dest" data-id="overview" tabindex="0" role="button" aria-label="选择非遗概览区"><rect x="48" y="78" width="140" height="410" rx="15"/><text x="118" y="266" text-anchor="middle"><tspan x="118">非遗</tspan><tspan x="118" dy="35">概览</tspan></text><path d="M78 120h80m-80 16h60m-60 16h70M77 419h81v36H77z"/></g>
      <g class="map-room room-craft" data-action="select-dest" data-id="craft" tabindex="0" role="button" aria-label="选择制作技艺区"><rect x="250" y="52" width="460" height="145" rx="15"/><text x="480" y="111" text-anchor="middle">制作技艺</text><path d="M280 143h105v25H280zm145 0h105v25H425zm145 0h105v25H570z"/></g>
      <g class="map-room room-interaction" data-action="select-dest" data-id="interaction" tabindex="0" role="button" aria-label="选择互动体验区"><rect x="760" y="52" width="190" height="145" rx="15"/><text x="855" y="117" text-anchor="middle">互动体验</text><path d="M801 143h110v26H801z"/></g>
      <g class="map-room room-story" data-action="select-dest" data-id="story" tabindex="0" role="button" aria-label="选择传承故事区"><rect x="790" y="275" width="160" height="139" rx="15"/><text x="870" y="328" text-anchor="middle"><tspan x="870">传承</tspan><tspan x="870" dy="35">故事</tspan></text></g>
      <g class="map-room room-works" data-action="select-dest" data-id="works" tabindex="0" role="button" aria-label="选择代表作品区"><rect x="250" y="470" width="460" height="90" rx="15"/><text x="480" y="465" text-anchor="middle" class="works-map-title">代表作品区</text></g>
      <circle cx="490" cy="342" r="88" class="map-core"/><circle cx="490" cy="342" r="69" class="map-core-inner"/><text x="490" y="336" text-anchor="middle" class="core-text"><tspan x="490">核心展台</tspan><tspan x="490" dy="28" class="core-small">展厅示意</tspan></text>
      <path d="M298 280h28v118h-28zm343 0h28v118h-28z" class="map-cabinets"/><path d="M275 245h74m280 0h55M293 427h63m264 0h63" class="map-detail"/>
      ${D.works.map((w,i)=>`<g class="work-map-point${target==='work_'+w.id?' chosen':''}" data-action="select-dest" data-id="work_${w.id}" tabindex="0" role="button" aria-label="${esc(w.booth+' '+w.title)}" transform="translate(${NODES['work_'+w.id]})"><rect x="-20" y="-15" width="40" height="30" rx="7"/><text text-anchor="middle" y="5">${String(i+1).padStart(2,'0')}</text></g>`).join('')}
      <polyline points="${route}" class="map-path"/>
      <g class="map-target" transform="translate(${NODES[target]})"><circle r="17"/><circle r="5"/></g>
      <g id="robot-marker" transform="translate(${point})"><circle class="robot-marker-halo" r="27"/><circle class="robot-marker-body" r="17"/><path d="m0-9 6 15-6-3-6 3Z"/></g>
      <g class="service-map-label"><text x="160" y="608" text-anchor="middle">入口</text><text x="850" y="608" text-anchor="middle">出口</text><text x="927" y="485" text-anchor="middle">卫生间</text></g>
    </svg>`;
  }
  function routePage(){
    const traveling=Boolean(S.tour.target&&['moving','paused'].includes(S.tour.status));
    const arrived=S.tour.status==='arrived';
    let panel='';
    if(traveling||arrived){
      const target=destById(traveling?S.tour.target:S.tour.location);
      panel=`<section class="destination-status"><span class="navigation-symbol">${icon(arrived?'check':S.tour.status==='paused'?'pause':'route')}</span><p class="navigation-state">${arrived?'已到达':blocked()?'等待处理':S.tour.status==='paused'?'指引已暂停':'正在前往'}</p><h2>${esc(target.full)}</h2>${traveling?`<div class="progress-track"><span id="navigation-progress" style="width:${Math.round(movementProgress()*100)}%"></span></div><span class="progress-value" id="navigation-percent">${Math.round(movementProgress()*100)}%</span>`:''}<span class="panel-note">模拟指引</span><div class="destination-actions">${arrived?(D.stops.some(s=>s.id===target.id)?navLink('exhibit',{id:target.id},'btn primary','展区讲解'):target.work?button('show-work','查看作品','btn primary',`data-work="${target.work}"`):navLink('home',{},'btn primary','返回首页')):''}${arrived?button('choose-destination','选择其他目的地','btn outline'):''}</div></section>`;
    }else panel=`<div class="destinations"><div class="panel-heading"><h2>选择目的地</h2><span>${WORK_DESTS.some(w=>w.id===S.selectedDest)?'作品展位':'7 个地点'}</span></div><div class="destination-list">${(WORK_DESTS.some(w=>w.id===S.selectedDest)?[destById(S.selectedDest),...DESTS]:DESTS).map(d=>button('select-dest',esc(d.full),`destination${S.selectedDest===d.id?' selected':''}`,`data-id="${d.id}" aria-pressed="${S.selectedDest===d.id}"`,d.id==='toilet'||d.id==='exit'?'pin':'')).join('')}</div>${button('start-nav','开始指引','btn primary wide',blocked()?'disabled':'','arrow')}</div>`;
    return `<main class="screen route-screen"><section class="map-panel"><div class="map-heading"><span>展厅平面图</span><span class="map-key"><i></i>当前位置 <b></b>目的地</span></div><div class="map-canvas">${mapSVG()}</div><div class="map-caption">${destById(S.tour.target||S.selectedDest).work?'展位 '+destById(S.tour.target||S.selectedDest).full:'展厅路线 · 05-01—05-16 为作品展位'}</div></section><aside class="destination-panel">${panel}</aside></main>`;
  }
  function exhibitsPage(){return `<main class="screen exhibits-screen"><div class="exhibits-grid">${D.stops.map((s,i)=>navLink('exhibit',{id:s.id},`exhibit-card exhibit-card-${i}`,`<div class="exhibit-thumbnail"><img src="${s.image}" alt="${esc(s.alt)}"><span class="exhibit-number">0${i+1}</span><span class="thumbnail-note">${esc(s.imageNote)}</span></div><div class="exhibit-card-label"><h2>${esc(s.full)}</h2>${icon('arrow')}</div>`)).join('')}</div></main>`;}
  function exhibitPage(){
    const stop=currentStop();
    if(stop.id==='overview')return overviewPage();
    if(stop.id==='story')return storyPage();
    if(stop.id==='works')return worksPage();
    if(stop.id==='interaction')return experiencePage();
    const item=currentItem(),section=currentSection();
    return `<main class="screen reader-screen catalog-reader"><aside class="exhibit-directory"><div class="directory-heading"><span>项目目录</span></div><div class="directory-items">${stop.items.map((entry,i)=>button('select-item',`<span class="directory-number">${String(i+1).padStart(2,'0')}</span><span><strong>${esc(entry.name)}</strong><small>${esc(entry.region)}</small></span>${icon('arrow')}`,`directory-item${item.id===entry.id?' selected':''}`,`data-item="${entry.id}" aria-pressed="${item.id===entry.id}"`)).join('')}</div><figure class="directory-art"><img src="${item.image}" alt="${esc(item.alt)}"><figcaption>${esc(item.imageNote)}</figcaption></figure></aside><section class="reader-panel"><div class="reader-heading"><span class="mode-chip">${guided()?'全程导览':'自助讲解'}</span>${button('profile',S.profile.mode==='child'?'亲子版':'大众版','plain-button','','settings')}</div><h2>${esc(item.title)}</h2><p class="reader-zone">${esc(stop.full)}<span> · ${esc(item.subtitle)}</span></p><div class="reader-tabs" role="tablist" aria-label="讲解主题">${item.sections.map(entry=>`<button role="tab" id="tab-${entry.id}" data-action="tab" data-tab="${entry.id}" aria-controls="reader-text" aria-selected="${section.id===entry.id}" tabindex="${section.id===entry.id?0:-1}">${esc(entry.label)}</button>`).join('')}</div><div class="reader-text" id="reader-text" role="tabpanel" aria-labelledby="tab-${section.id}" tabindex="0">${sectionBlocks().map((b,i)=>`<section class="reader-block"><span class="block-number">${String(i+1).padStart(2,'0')}</span><h3>${esc(b.heading)}</h3><p>${esc(b.text)}</p></section>`).join('')}</div><div class="reader-tools">${button('read','朗读','btn soft','id="read-content" aria-pressed="false"','sound')}${sourceButton(item.sources,'source-button')}${button('work-nav','导航至作品','source-button',`data-work="${item.work}"`,'pin')}${button('show-work','查看作品','source-button',`data-work="${item.work}"`)}<span class="reading-position" id="reading-position" aria-label="阅读位置"></span></div></section></main>`;
  }
  const personById=id=>D.people.find(p=>p.id===id);
  const projectById=id=>D.projects.find(p=>p.id===id);
  const mapXY=p=>[55+(p.lon-73)*11.5,32+(54-p.lat)*12.2];
  const MAP_LABELS={cloisonne:[580,140],paper:[460,172],jing:[620,180],kite:[660,220],suzhou:[718,280],yunjin:[610,255],blue:[738,325],celadon:[650,380],xuan:[530,358],huangmei:[505,307],xiang:[526,410],shujin:[345,297],mawei:[477,454],tie:[350,420],regong:[350,230],thangka:[235,360]};
  function chinaPaths(){return D.mapGeometry.map(f=>`<path class="china-province${f.line?' border-line':''}" d="${f.path}"><title>${esc(f.name||'海域界线')}</title></path>`).join('');}
  function overviewPage(){
    const view=S.mapView||{x:0,y:0,w:920,h:640};
    return `<main class="screen atlas-screen"><section class="atlas-main"><div class="atlas-heading"><div><h2>中国非遗地图</h2></div><span>16 个项目</span></div><div class="china-map-wrap"><svg id="china-map" viewBox="${view.x} ${view.y} ${view.w} ${view.h}" aria-label="中国非遗地图，可缩放拖动，点击项目进入工艺详情"><g>${chinaPaths()}<rect x="731" y="435" width="150" height="165" rx="5" class="sea-frame"/><text class="sea-title" x="744" y="615">南海诸岛</text>${D.projects.map(p=>{const [x,y]=mapXY(p),[lx,ly]=MAP_LABELS[p.id],left=lx<x;return `<a href="${fileURL('exhibit',{id:'craft',item:p.id})}" data-nav class="heritage-pin" aria-label="${esc(p.region+' '+p.name+'，'+p.origin+'，查看制作技艺')}" data-project="${p.id}"><title>${esc(p.region+' · '+p.name+'。'+p.origin)}</title><path d="M${x},${y}L${lx},${ly}" class="pin-leader"/><circle cx="${x}" cy="${y}" r="5" class="pin-dot"/><rect x="${left?lx-p.name.length*18-14:lx-6}" y="${ly-22}" width="${p.name.length*18+20}" height="36" rx="9" class="pin-label-bg"/><text x="${lx}" y="${ly+2}" text-anchor="${left?'end':'start'}">${esc(p.name)}</text></a>`;}).join('')}</g></svg><div class="map-zoom">${button('map-zoom','＋','zoom-button','data-factor="0.75" aria-label="放大地图"')}${button('map-zoom','−','zoom-button','data-factor="1.333333" aria-label="缩小地图"')}${button('map-reset','复位','zoom-button reset')}</div></div><div class="atlas-foot"><span>拖动平移 · 双指缩放 · 点击项目查看详情</span>${sourceButton('china-map')}</div></section><aside class="atlas-index"><div class="atlas-index-heading">项目索引<span>地域 / 沿革</span></div><div class="atlas-projects">${D.projects.map((p,i)=>navLink('exhibit',{id:'craft',item:p.id},'atlas-entry',`<span class="atlas-entry-number">${String(i+1).padStart(2,'0')}</span><div><h3>${esc(p.name)}</h3><span>${esc(p.region)}</span><p>${esc(p.origin)}</p></div>${icon('arrow')}`)).join('')}</div></aside></main>`;
  }
  function applyChinaView(){const svg=$('china-map');if(!svg)return;const v=S.mapView;svg.setAttribute('viewBox',`${v.x} ${v.y} ${v.w} ${v.h}`);}
  function clampView(v){v.w=Math.max(230,Math.min(920,v.w));v.h=v.w*640/920;v.x=Math.max(-25,Math.min(945-v.w,v.x));v.y=Math.max(-20,Math.min(660-v.h,v.y));return v;}
  function zoomChina(factor,point){
    if(!$('china-map'))return;
    const v=S.mapView||{x:0,y:0,w:920,h:640},cx=point?.x??v.x+v.w/2,cy=point?.y??v.y+v.h/2,ratio=Math.max(230,Math.min(920,v.w*factor))/v.w;
    S.mapView=clampView({x:cx-(cx-v.x)*ratio,y:cy-(cy-v.y)*ratio,w:v.w*ratio,h:v.h*ratio});save();applyChinaView();
  }
  function wireChinaMap(){
    const svg=$('china-map');let moved=false,gesture=null;const pointers=new Map();
    const svgPoint=(x,y)=>new DOMPoint(x,y).matrixTransform(svg.getScreenCTM().inverse());
    svg.addEventListener('wheel',e=>{e.preventDefault();zoomChina(e.deltaY<0?.85:1.18,svgPoint(e.clientX,e.clientY));},{passive:false});
    const distance=()=>{const ps=[...pointers.values()];return ps.length===2?Math.hypot(ps[0].x-ps[1].x,ps[0].y-ps[1].y):0;};
    svg.addEventListener('pointerdown',e=>{
      if(e.button!==0&&e.pointerType==='mouse')return;
      pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});moved=false;
      if(pointers.size===2){for(const id of pointers.keys())svg.setPointerCapture(id);gesture={type:'pinch',distance:distance()};moved=true;return;}
      gesture={type:'drag',start:svgPoint(e.clientX,e.clientY),view:{...S.mapView},px:e.clientX,py:e.clientY};
    });
    svg.addEventListener('pointermove',e=>{
      if(!pointers.has(e.pointerId)||!gesture)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(pointers.size===2){const dist=distance(),ps=[...pointers.values()];if(gesture.type==='pinch'&&gesture.distance>0){zoomChina(gesture.distance/dist,svgPoint((ps[0].x+ps[1].x)/2,(ps[0].y+ps[1].y)/2));}gesture={type:'pinch',distance:dist};moved=true;return;}
      if(gesture.type!=='drag')return;
      if(Math.hypot(e.clientX-gesture.px,e.clientY-gesture.py)>5){moved=true;svg.setPointerCapture(e.pointerId);}
      if(moved){const matrix=svg.getScreenCTM(),dx=(e.clientX-gesture.px)/matrix.a,dy=(e.clientY-gesture.py)/matrix.d;S.mapView=clampView({...gesture.view,x:gesture.view.x-dx,y:gesture.view.y-dy});applyChinaView();}
    });
    const end=e=>{pointers.delete(e.pointerId);if(moved)save();if(pointers.size===0)gesture=null;};
    svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);
    svg.addEventListener('click',e=>{if(moved){e.preventDefault();e.stopPropagation();moved=false;}},true);
  }
  function resetStoryEntry(){if(PAGE==='exhibit'&&currentStop().id==='story'){S.selectedPerson=null;save();}}
  function storyPage(){
    const person=personById(S.selectedPerson);
    if(person)return `<main class="screen person-screen"><figure class="person-portrait"><img src="${person.image}" alt="${esc(person.photoNote)}"><figcaption>${esc(person.photoNote)}</figcaption></figure><article class="person-article"><div class="person-topline">${button('close-person','全部故事','source-button','','back')}<span>${esc(person.craft)}</span></div><h2>${esc(person.name)}</h2><h3>${esc(person.title)}</h3><div class="story-copy">${person.blocks.map((b,i)=>`<section><span>0${i+1}</span><h4>${esc(b.heading)}</h4><p>${esc(b.text)}</p></section>`).join('')}</div><div class="person-tools">${button('read','朗读','btn soft','id="read-content"','sound')}${sourceButton(person.sources)}${navLink('exhibit',{id:'craft',item:person.project},'source-button','查看工艺 '+icon('arrow'))}</div></article></main>`;
    return `<main class="screen stories-screen"><div class="section-heading"><div><h2>传承人与故事</h2></div><span>5 位传承人</span></div><div class="people-grid">${D.people.map((p,i)=>`<button class="person-card" data-action="open-person" data-person="${p.id}"><div class="person-card-image"><img src="${p.image}" alt="${esc(p.photoNote)}"><span>0${i+1}</span></div><div class="person-card-info"><span>${esc(p.craft)}</span><h3>${esc(p.name)}</h3><p>${esc(p.title)}</p><div>查看故事 ${icon('arrow')}</div></div></button>`).join('')}</div></main>`;
  }
  function worksPage(){
    const categories=[['all','全部'],['objects','器物 / 纸艺'],['textile','织染 / 刺绣'],['painting','绘画 / 风筝']],group=id=>['cloisonne','paper','celadon','xuan'].includes(id)?'objects':['regong','thangka','kite'].includes(id)?'painting':'textile';
    const filter=S.galleryFilter||'all',works=D.works.filter(w=>filter==='all'||group(w.id)===filter);
    return `<main class="screen gallery-screen"><div class="section-heading"><div><h2>代表作品</h2></div><div class="gallery-filters" role="group" aria-label="作品类别">${categories.map(([id,label])=>button('gallery-filter',label,`gallery-filter${filter===id?' selected':''}`,`data-filter="${id}" aria-pressed="${filter===id}"`)).join('')}</div></div><div class="artwork-grid" id="gallery-scroll">${works.map(w=>`<button class="artwork-card" data-action="show-work" data-work="${w.id}" aria-label="查看${esc(w.title)}，展位${w.booth}"><div class="artwork-image"><img src="${w.image}" alt="${esc(w.alt)}" loading="lazy"><span>${w.booth}</span></div><div class="artwork-caption"><h3>${esc(w.title)}</h3><span>${esc(projectById(w.project).name)}</span></div></button>`).join('')}</div></main>`;
  }
  function showWork(id){
    const w=D.works.find(w=>w.id===id);if(!w)return;
    if(active()){pause('查看作品照片');render();}
    openDialog(w.title,`<div class="work-lightbox"><figure><img src="${w.image}" alt="${esc(w.alt)}"></figure><div class="work-lightbox-meta"><span class="mode-chip">展位 ${w.booth}</span><p>${esc(w.author)}</p><small>${esc(w.note)}</small><div>${sourceButton(w.sources)}${navLink('exhibit',{id:'craft',item:w.project},'source-button','制作技艺 '+icon('arrow'))}</div>${button('work-nav','导航至此作品','btn primary',`data-work="${w.id}"`,'route')}</div></div>`,'work',true);
  }

  function experiencePage(){
    return `<main class="screen experience-screen"><section class="experience-map"><div class="map-heading"><span>互动体验区</span></div><div class="map-canvas">${mapSVG('interaction')}</div></section><section class="experience-info"><span class="neutral-label">现场电子屏</span><h2>模拟制作体验</h2><p>在体验区电子屏上选择项目，按步骤完成制作。</p><div class="experience-projects"><div>${icon('flower')}<span><strong>剪纸纹样</strong><small>构图 · 剪刻 · 展开</small></span></div><div>${icon('spark')}<span><strong>珐琅配色</strong><small>选纹 · 填色 · 预览</small></span></div></div>${button('take-there',S.tour.location==='interaction'?'查看体验区路线':'前往体验区','btn primary large','data-id="interaction"','route')}<a class="experience-quiz" href="interaction.html" data-nav>非遗知识挑战 ${icon('arrow')}</a></section></main>`;
  }
  function sourceButton(keys,cls='source-button'){
    const valid=(Array.isArray(keys)?keys:[keys]).filter(key=>D.sources[key]);
    return valid.length?button('source','资料来源',cls,`data-source="${valid.join(',')}"`,'book'):'';
  }
  function qaPage(){
    const qaStop=S.qa.stop?stopById(S.qa.stop):null,qaItem=qaStop?.items.find(item=>item.id===S.qa.item);
    const recommendations=qaItem?.questions||qaStop?.questions||['什么是非遗？','景泰蓝只有蓝色吗？','剪纸如何做出对称？','传承人做什么？'];
    const messages=S.qa.messages.map((m,i)=>`<div class="qa-message ${m.role}"><span class="qa-avatar">${icon(m.role==='user'?'person':'book')}</span><div class="qa-bubble"><p>${esc(m.text)}</p>${m.role==='assistant'?`<div class="answer-actions">${button('read-answer','朗读','answer-action',`data-index="${i}"`,'sound')}${sourceButton(m.source,'answer-action')}${m.fallback?navLink('help',{},'answer-action',icon('help')+'人工帮助'):''}</div>`:''}</div></div>`).join('');
    return `<main class="screen qa-screen"><div class="qa-topline"><span>常见问题</span>${S.qa.stop?`<span class="context-chip">${esc(stopById(S.qa.stop).name)}${qaItem?' · '+esc(qaItem.name):''}</span>`:''}${button('knowledge','资料范围','plain-button','','info')}</div><div class="suggested-questions" style="--question-count:${recommendations.length}">${recommendations.map(q=>button('question',esc(q),'question-button',`data-question="${esc(q)}"`)).join('')}</div><section class="conversation" id="conversation" role="log" aria-label="问答记录" aria-live="polite">${messages||`<div class="qa-empty">${icon('chat')}<span>非遗知识问答</span></div>`}</section><form class="question-form" id="question-form"><label class="sr-only" for="question-input">输入问题</label><input id="question-input" autocomplete="off" maxlength="200" placeholder="输入问题" value="${esc(S.qa.draft)}"><button class="btn primary" type="submit">${icon('send')}<span>发送</span></button></form></main>`;
  }
  const quizQuestions = () => S.quiz.questionIds.map(id=>D.quizzes.find(q=>q.id===id));
  function quizScore(){return quizQuestions().filter((q,i)=>q&&S.quiz.answers[i]===q.correct).length;}
  function randomIndex(size){
    if(window.crypto?.getRandomValues){const buffer=new Uint32Array(1),limit=Math.floor(4294967296/size)*size;do{crypto.getRandomValues(buffer);}while(buffer[0]>=limit);return buffer[0]%size;}
    return Math.floor(Math.random()*size);
  }
  function startQuiz(){
    const previous=S.quiz.questionIds||[],fresh=D.quizzes.filter(q=>!previous.includes(q.id));
    const pool=[...(fresh.length>=3?fresh:D.quizzes)];
    for(let i=pool.length-1;i>0;i--){const j=randomIndex(i+1);[pool[i],pool[j]]=[pool[j],pool[i]];}
    S.quiz={phase:'question',index:0,answers:[null,null,null],questionIds:pool.slice(0,3).map(q=>q.id)};save();render();
  }
  function interactionPage(){
    const q=S.quiz;
    if(q.phase==='intro')return `<main class="screen interaction-screen"><div class="challenge-intro"><div class="challenge-emblem">${icon('book')}</div><span class="neutral-label">互动体验</span><h2>非遗知识挑战</h2><div class="challenge-meta"><span>${D.quizzes.length} 题题库</span><i></i><span>随机抽取 3 题</span></div><p class="challenge-scope">工序判断 · 材料原理 · 历史与传承</p>${button('quiz-start','开始答题','btn primary large','','arrow')}</div></main>`;
    const questions=quizQuestions();
    if(q.phase==='result')return `<main class="screen interaction-screen"><section class="quiz-result quiz-result-v4"><div class="result-copy"><span class="neutral-label">非遗知识挑战</span><h2>答题完成</h2><p class="result-score">答对 <strong>${quizScore()}</strong> / 3 题</p><div class="result-buttons">${button('quiz-restart','再答一组','btn primary','','repeat')}${button('quiz-review','查看解析','btn outline')}</div></div><div class="result-breakdown">${questions.map((question,i)=>`<div><span class="result-mark ${q.answers[i]===question.correct?'correct':'incorrect'}">${icon(q.answers[i]===question.correct?'check':'close')}</span><span><small>第 ${i+1} 题 · ${esc(question.topic)}</small><p>${esc(question.question)}</p></span></div>`).join('')}</div></section></main>`;
    const question=questions[q.index],answered=q.answers[q.index]!==null;
    return `<main class="screen interaction-screen"><section class="quiz-panel quiz-panel-v4"><div class="quiz-top"><h2>非遗知识挑战 <small>${esc(question.topic)}</small></h2><span>${q.index+1} / 3</span></div><div class="quiz-progress">${questions.map((_,i)=>`<span class="${i<=q.index?'done':''}"></span>`).join('')}</div><h3>${esc(question.question)}</h3><div class="quiz-options">${question.options.map((option,i)=>button('quiz-answer',`<b>${'ABCD'[i]}</b><span>${esc(option)}</span>`,`quiz-option${answered&&i===question.correct?' correct':answered&&i===q.answers[q.index]?' incorrect':''}`,`data-answer="${i}" ${answered?'disabled':''}`)).join('')}</div><div class="quiz-feedback" aria-live="polite">${answered?`<div><p><strong>${q.answers[q.index]===question.correct?'回答正确':'正确答案：'+'ABCD'[question.correct]}</strong> ${esc(question.explanation)}</p>${sourceButton(question.sources,'answer-action')}</div>${button('quiz-next',q.index===2?'查看结果':'下一题','btn primary','','arrow')}`:'<span>请选择一个答案</span>'}</div></section></main>`;
  }

  const HELP_REASONS=['讲解服务','问答协助','人员协助','通行异常','其他帮助'];
  function helpPage(){
    const pending=['requested','taken'].includes(S.help.status);
    if(pending)return `<main class="screen help-screen"><section class="help-status"><span class="help-status-icon">${icon(S.help.status==='taken'?'person':'help')}</span><span class="neutral-label">${esc(S.help.reason)}</span><h2>${S.help.status==='taken'?'工作人员接管中':'协助请求已登记'}</h2><ol class="handover-steps"><li class="complete">已登记</li><li class="${S.help.status==='taken'?'complete':'current'}">${S.help.status==='taken'?'已接管':'等待确认'}</li><li>处理后交还</li></ol></section></main>`;
    return `<main class="screen help-screen"><section class="help-panel"><div class="help-heading"><span class="help-heading-icon">${icon('help')}</span><h2>选择协助类型</h2></div><div class="help-reasons">${HELP_REASONS.map((reason,i)=>button('help-reason',`${icon(['book','chat','person','route','info'][i])}<span>${reason}</span>`,`help-reason${S.help.reason===reason?' selected':''}`,`data-reason="${reason}" aria-pressed="${S.help.reason===reason}"`)).join('')}</div><div class="help-submit">${button('request-help','联系工作人员','btn primary large','','arrow')}</div></section></main>`;
  }
  const renderers={home:homePage,route:routePage,exhibits:exhibitsPage,exhibit:exhibitPage,qa:qaPage,interaction:interactionPage,help:helpPage};
  function render(){
    const focused=document.activeElement?.id,selection=focused==='question-input'?document.activeElement.selectionStart:null;
    $('app').innerHTML=header()+alertStrip()+renderers[PAGE]()+footer();
    document.body.dataset.status=S.tour.status;document.body.dataset.blocked=String(blocked());
    updateClock();updateSpeechButtons();wireClock();
    if(PAGE==='qa'){
      const form=$('question-form');form.addEventListener('submit',event=>{event.preventDefault();ask($('question-input').value);});
      $('question-input').addEventListener('input',event=>{S.qa.draft=event.target.value;save();});
      const list=$('conversation');list.scrollTop=list.scrollHeight;
      if(focused==='question-input'){$('question-input').focus({preventScroll:true});if(selection!==null)$('question-input').setSelectionRange(selection,selection);}
    }
    if(PAGE==='route')updateMovement();
    if($('china-map'))wireChinaMap();
    const directory=document.querySelector('.directory-items');if(directory){if(S.directoryScroll)directory.scrollTop=S.directoryScroll;const selected=directory.querySelector('.selected');if(selected){const r=selected.getBoundingClientRect(),c=directory.getBoundingClientRect();if(r.top<c.top||r.bottom>c.bottom)directory.scrollTop=selected.offsetTop-directory.offsetTop;}}
    if(directory)directory.addEventListener('scroll',()=>{S.directoryScroll=directory.scrollTop;save();},{passive:true});
    const album=$('gallery-scroll');if(album&&S.galleryScroll)album.scrollTop=S.galleryScroll;
    if(album)album.addEventListener('scroll',()=>{S.galleryScroll=album.scrollTop;save();},{passive:true});
    const reader=$('reader-text');
    if(reader){
      const key=positionKey();reader.scrollTop=S.readerPositions[key]||0;
      const progress=()=>{const range=reader.scrollHeight-reader.clientHeight;if($('reading-position'))$('reading-position').textContent=range>2?Math.min(100,Math.round(reader.scrollTop/range*100))+'%':'全文';};
      reader.addEventListener('scroll',()=>{S.readerPositions[key]=reader.scrollTop;save();progress();},{passive:true});progress();
    }
  }
  function updateClock(){if($('clock'))$('clock').textContent=new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Asia/Shanghai'});}
  function wireClock(){let timer;const b=$('clock');b.addEventListener('pointerdown',()=>{timer=setTimeout(()=>{ignoreBackdropUntil=Date.now()+600;demoDialog();},1200);});['pointerup','pointercancel','pointerleave'].forEach(e=>b.addEventListener(e,()=>clearTimeout(timer)));b.addEventListener('contextmenu',e=>e.preventDefault());}

  function openDialog(title,body,kind='info',wide=false){
    stopAudio();dialogKind=kind;$('dialog').classList.toggle('wide-dialog',wide);
    $('dialog-content').innerHTML=`<div class="dialog-heading"><h2 id="dialog-title">${esc(title)}</h2>${button('close-dialog','','tool-key','aria-label="关闭"','close')}</div>${body}`;
    if(!$('dialog').open)$('dialog').showModal();
  }
  function closeDialog(){if($('dialog').open)$('dialog').close();dialogKind=null;}
  let confirmCallback=null;
  function confirmDialog(title,text,label,callback){confirmCallback=callback;openDialog(title,`<p class="dialog-copy">${esc(text)}</p><div class="dialog-actions">${button('close-dialog','取消','btn outline')}${button('confirm',label,'btn primary')}</div>`,'confirm');}
  function settingsDialog(start=false){
    const p=dialogDraft;
    openDialog('参观设置',`<div class="settings-group"><h3>参观人数</h3><div class="setting-options">${button('set-party','单人',`setting-option${p.party==='single'?' selected':''}`,'data-value="single"')}${button('set-party','多人',`setting-option${p.party==='group'?' selected':''}`,'data-value="group"')}</div>${p.party==='group'?`<div class="people-stepper"><span>同行人数</span><div>${button('people-minus','−','stepper-button',p.people<=2?'disabled':'')}<output>${p.people}</output>${button('people-plus','＋','stepper-button',p.people>=12?'disabled':'')}</div></div>`:''}</div><div class="settings-group"><h3>讲解模式</h3><div class="setting-options">${button('set-mode','大众版',`setting-option${p.mode==='adult'?' selected':''}`,'data-value="adult"')}${button('set-mode','亲子版',`setting-option${p.mode==='child'?' selected':''}`,'data-value="child"')}</div></div><div class="dialog-actions">${button('close-dialog','取消','btn outline')}${button(start?'begin-full-tour':'save-profile',start?'开始导览':'保存','btn primary','','arrow')}</div>`,start?'start-settings':'settings');
  }
  function sourceHTML(key){
    const source=D.sources[key];if(!source)return '';
    return `<article class="source-record"><h3>${esc(source.title)}</h3><p class="source-detail">${esc(source.detail)}</p><dl><dt>发布机构</dt><dd>${esc(source.publisher)}</dd>${source.date?`<dt>发布日期</dt><dd>${esc(source.date)}</dd>`:''}<dt>核对日期</dt><dd>${esc(source.accessed)}</dd></dl><p>${esc(source.note)}</p><a class="source-link" href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.url)} ↗</a></article>`;
  }
  function sourceDialog(keys){
    const valid=[...new Set(String(keys||'').split(','))].filter(key=>D.sources[key]);if(!valid.length)return;
    if(active()){pause('查看资料来源');render();}
    openDialog('资料来源',valid.map(sourceHTML).join(''),'source',true);
  }
  function knowledgeDialog(){
    if(active()){pause('查看资料范围');render();}
    openDialog('资料范围',`<p class="dialog-copy">覆盖16个非遗项目的地域、源流、工艺与代表作品，以及5位传承人的照片与故事。回答附有来源时，可查看对应项目档案或文章；没有明确出处的服务说明不设置来源按钮。</p>${Object.keys(D.sources).map(sourceHTML).join('')}`,'knowledge',true);
  }
  function normalize(s){return s.toLowerCase().replace(/[\s\p{P}\p{S}]/gu,'').replace(/[呀呢啊吧嘛哦]/g,'');}
  function answerFor(question){
    const q=normalize(question);let best=null,score=0;
    for(const entry of D.faq)for(const pattern of entry.patterns){const p=normalize(pattern);const s=q===p?200+p.length:p.length>=3&&q.includes(p)?p.length:0;if(s>score){best=entry;score=s;}}
    if(!best&&q.includes('非遗')&&/是什么|什么是|什么意思/.test(q))best=D.faq.find(f=>f.id==='definition');
    if(!best&&q.includes('景泰蓝')&&/只有|都是|只能/.test(q)&&q.includes('蓝'))best=D.faq.find(f=>f.id==='blueonly');
    if(!best&&q.includes('剪纸')&&q.includes('对称'))best=D.faq.find(f=>f.id==='symmetry');
    if(!best&&/掐丝|点蓝/.test(q))best=D.faq.find(f=>f.id==='wire');
    if(!best&&/(触摸|摸|碰).*(展品|文物|作品|一下)|(展品|文物|作品).*(触摸|摸|碰)/.test(q))best=D.faq.find(f=>f.id==='touch');
    if(/估价|鉴定|真伪|多少钱|市场价格|医疗诊断/.test(q))best=null;
    return best;
  }
  function ask(raw){
    const question=raw.trim().slice(0,200);if(!question)return;
    if(active())pause('文字问答，保留导览进度');
    S.qa.draft='';S.qa.count++;S.qa.messages.push({role:'user',text:question});const match=answerFor(question);
    let text=match?.answer||'暂无相关资料。可重新提问或请求人工帮助。';
    if(match?.action==='pause'&&!active())text='当前没有正在进行的导览。';
    S.qa.messages.push({role:'assistant',text,source:match?.source||null,fallback:!match||Boolean(match.fallback)});
    S.qa.messages=S.qa.messages.slice(-50);log(match?'问答命中：'+match.id:'问答无相关资料');save();render();
    if(S.audio)speak(text);
  }
  function requestHelp(){pause('登记人工协助请求');S.help.status='requested';S.alert={key:'help',title:'协助请求已登记',text:'导览暂停，等待工作人员接管。',staff:true};save();render();}
  const EVENTS={
    blocked:{title:'路线受阻',text:'指引已暂停，等待通道恢复。',action:'通道已恢复',staff:false},
    visitor:{title:'同行人员未到齐',text:'导览已暂停，等待人员归队。',action:'人员已归队',staff:false},
    location:{title:'定位异常',text:'已停止指引，需要工作人员处理。',staff:true},
    battery:{title:'电量不足',text:'已暂停导览，需要工作人员安排接替与充电。',staff:true},
    unclear:{title:'指令未确认',text:'请重新输入，或通过页面按钮操作。',action:'改用页面操作',staff:false}
  };
  function triggerEvent(key){
    if(key==='unknown'){closeDialog();S.qa.context=canonical();S.qa.stop=PAGE==='exhibit'?currentStop().id:null;ask('这件藏品估价多少？');go('qa');return;}
    if(!active()){toast('请先开始导览。');return;}
    if(blocked()){toast('请先处理当前状态。');return;}
    pause('异常演示：'+key);S.alert={...EVENTS[key],key};if(key==='battery')S.battery=15;save();closeDialog();render();
  }
  function recover(staff=false){
    if(!S.alert&&!blocked()){toast('当前没有待处理状态。');return;}
    if((S.alert?.staff||S.help.status!=='none')&&!staff){toast('需要工作人员处理。');return;}
    if(staff&&S.help.status==='requested'){toast('请先模拟工作人员接管。');return;}
    S.alert=null;S.help.status='none';if(staff)S.battery=86;log(staff?'工作人员处理完成并交还（模拟）':'异常恢复，等待确认继续');save();closeDialog();render();toast('状态已恢复，请确认继续导览。');
  }
  function demoDialog(){
    openDialog('演示控制',`<p class="dialog-note">仅模拟状态，不连接真实导航或人工呼叫系统。</p><div class="demo-grid">${[['blocked','路线受阻'],['visitor','人员掉队'],['location','定位丢失'],['battery','电量不足'],['unclear','指令未确认'],['unknown','范围外问答']].map(([key,label])=>button('demo-event',label,'setting-option',`data-event="${key}"`)).join('')}</div><div class="demo-actions">${button('staff-take','模拟人工接管','btn soft')}${button('staff-recover','处理后交还','btn soft')}${button('reset','重置演示','btn outline')}</div><details class="event-log"><summary>流程记录</summary>${S.log.slice(0,15).map(l=>`<p><time>${esc(l.time)}</time>${esc(l.text)}</p>`).join('')}</details>`,'demo',true);
  }

  function handle(action,b){
    const d=b.dataset;
    switch(action){
      case 'back':back();break;
      case 'audio':S.audio=!S.audio;save();stopAudio();render();if(S.audio&&PAGE==='exhibit')speak(readerText());toast(S.audio?'自动朗读已开启':'自动朗读已关闭');break;
      case 'fullscreen':(async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{toast('当前浏览器未允许全屏。');}})();break;
      case 'profile':if(active()){pause('打开参观设置');render();}dialogDraft={...S.profile};settingsDialog(false);break;
      case 'set-party':dialogDraft.party=d.value;dialogDraft.people=d.value==='single'?1:Math.max(2,dialogDraft.people);settingsDialog(dialogKind==='start-settings');break;
      case 'set-mode':dialogDraft.mode=d.value;settingsDialog(dialogKind==='start-settings');break;
      case 'people-minus':dialogDraft.people=Math.max(2,dialogDraft.people-1);settingsDialog(dialogKind==='start-settings');break;
      case 'people-plus':dialogDraft.people=Math.min(12,dialogDraft.people+1);settingsDialog(dialogKind==='start-settings');break;
      case 'save-profile':S.profile={...dialogDraft};save();closeDialog();render();break;
      case 'full-tour':fullTour();break;
      case 'begin-full-tour':beginFullTour();break;
      case 'pause':pause('手动暂停');render();break;
      case 'resume':resume();break;
      case 'end':confirmEnd();break;
      case 'confirm':{const fn=confirmCallback;confirmCallback=null;closeDialog();fn?.();break;}
      case 'close-dialog':closeDialog();break;
      case 'select-dest':if(S.tour.target&&active()){toast('请先结束当前指引。');break;}S.selectedDest=d.id;save();render();break;
      case 'start-nav':if(S.tour.full&&active())confirmDialog('切换路线指引','将结束当前全程导览，前往所选目的地。','开始指引',()=>startMove(S.selectedDest,false));else startMove(S.selectedDest,false);break;
      case 'choose-destination':S.tour.status='idle';save();render();break;
      case 'cancel-nav':confirmDialog('结束指引','当前位置保留，可重新选择目的地。','结束指引',()=>{cancelNavigation();});break;
      case 'take-there':S.selectedDest=d.id;save();go('route');break;
      case 'map-zoom':zoomChina(Number(d.factor));break;
      case 'map-reset':S.mapView={x:0,y:0,w:920,h:640};save();applyChinaView();break;
      case 'open-person':S.selectedPerson=d.person;save();render();autoRead();break;
      case 'close-person':S.selectedPerson=null;save();render();break;
      case 'gallery-filter':S.galleryFilter=d.filter;S.galleryScroll=0;save();render();break;
      case 'show-work':showWork(d.work);break;
      case 'work-nav':{const run=()=>{closeDialog();startMove('work_'+d.work,false);};if(S.tour.full&&active())confirmDialog('切换至作品指引','将结束当前全程导览，前往该作品展位。','开始指引',run);else run();break;}
      case 'select-item':if(currentStop().items.some(item=>item.id===d.item)){stopAudio();S.selectedItems[currentStop().id]=d.item;PARAMS.set('item',d.item);history.replaceState(null,'',fileURL('exhibit',Object.fromEntries(PARAMS)));save();render();autoRead();}break;
      case 'tab':stopAudio();S.readerTabs[readerKey()]=d.tab;save();render();autoRead();document.getElementById('tab-'+d.tab)?.focus({preventScroll:true});break;
      case 'read':if(speaking)stopAudio();else speak(readerText());break;
      case 'source':sourceDialog(d.source);break;
      case 'knowledge':knowledgeDialog();break;
      case 'repeat':if(!blocked()){stopAudio();S.tour.status='narrating';S.tour.resume='narrating';log('重复当前讲解');save();render();if(S.audio)speak(readerText());else toast('当前讲解已重新显示。');}break;
      case 'next-station':nextStation();break;
      case 'skip':nextStation(true);break;
      case 'previous-exhibit':case 'next-exhibit':{const i=D.stops.findIndex(s=>s.id===currentStop().id)+(action==='next-exhibit'?1:-1);if(D.stops[i])go('exhibit',{id:D.stops[i].id},{replace:true});break;}
      case 'qa':goQA();break;
      case 'question':ask(d.question);break;
      case 'read-answer':speak(S.qa.messages[Number(d.index)].text);break;
      case 'return-context':returnContext();break;
      case 'clear-chat':confirmDialog('清空问答记录','本次问答记录将被清空，参观进度保留。','清空',()=>{S.qa.messages=[];S.qa.draft='';save();render();});break;
      case 'quiz-start':case 'quiz-restart':startQuiz();break;
      case 'quiz-answer':if(S.quiz.phase==='question'&&S.quiz.answers[S.quiz.index]===null&&Number(d.answer)>=0&&Number(d.answer)<4){S.quiz.answers[S.quiz.index]=Number(d.answer);save();render();}break;
      case 'quiz-next':if(S.quiz.answers[S.quiz.index]===null)break;if(S.quiz.index<2)S.quiz.index++;else S.quiz.phase='result';save();render();break;
      case 'quiz-review':openDialog('答题解析',quizQuestions().map((q,i)=>`<div class="source-record"><h3>${i+1}. ${esc(q.question)}</h3><p>你的答案：${esc(q.options[S.quiz.answers[i]]||'未作答')}</p><p>正确答案：${'ABCD'[q.correct]} · ${esc(q.options[q.correct])}</p><p>${esc(q.explanation)}</p>${sourceButton(q.sources,'answer-action')}</div>`).join(''),'review',true);break;
      case 'help-reason':S.help.reason=d.reason;save();render();break;
      case 'request-help':requestHelp();break;
      case 'recover':recover();break;
      case 'demo-event':triggerEvent(d.event);break;
      case 'staff-take':if(S.help.status!=='requested'){toast('请先提交人工协助请求。');break;}S.help.status='taken';S.alert={key:'help',title:'工作人员接管中',text:'导览控制已锁定，等待处理后交还。',staff:true};log('人工接管（模拟）');save();closeDialog();render();break;
      case 'staff-recover':recover(true);break;
      case 'reset':confirmDialog('重置演示','清空本次导览、问答和答题记录，返回首页。','重置',()=>{stopAudio();clearMove();S=blank();save();go('home',{}, {keep:true,replace:true,back:true});});break;
    }
  }
  document.addEventListener('click',event=>{
    const action=event.target.closest('[data-action]');if(action&&!action.disabled){handle(action.dataset.action,action);return;}
    const link=event.target.closest('a[data-nav]');if(link&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey){event.preventDefault();if(link.getAttribute('href')==='qa.html'&&PAGE==='home'){S.qa.context=null;S.qa.stop=null;S.qa.item=null;}goURL(link.getAttribute('href'));}
  });
  document.addEventListener('keydown',event=>{
    if(event.altKey&&event.key.toLowerCase()==='d'){event.preventDefault();demoDialog();return;}
    const tab=event.target.closest('[role="tab"]');
    if(tab&&['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();const tabs=[...document.querySelectorAll('[role="tab"]')],index=tabs.indexOf(tab),next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:tabs.length-1))%tabs.length;tabs[next].click();}
    if(event.target.matches('.map-room,.work-map-point')&&['Enter',' '].includes(event.key)){event.preventDefault();handle('select-dest',event.target);}
  });
  $('dialog').addEventListener('click',event=>{if(event.target===$('dialog')&&Date.now()>ignoreBackdropUntil){const r=$('dialog').getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDialog();}});
  $('dialog').addEventListener('close',()=>{if(!$('dialog').open)dialogKind=null;});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&!internalNavigation&&active()){pause('页面进入后台，导览暂停');render();}});
  window.addEventListener('pagehide',()=>{if(!internalNavigation&&active())pause('离开页面，导览暂停');else save();clearMove();stopAudio();});
  window.addEventListener('pageshow',event=>{
    if(!event.persisted)return;
    S=load();syncPositionNode();internalNavigation=false;clearMove();stopAudio();
    if(PAGE==='home')resetHomeState();
    resetStoryEntry();
    if(S.tour.status==='moving')pause('恢复页面，指引暂停');
    render();
  });
  if(PAGE==='home')resetHomeState();
  resetStoryEntry();
  if(S.tour.status==='moving'&&PAGE!=='route')pause('恢复页面，指引暂停');
  render();setInterval(updateClock,15000);if(PAGE==='route'&&S.tour.status==='moving')armMove();autoRead();
})();
