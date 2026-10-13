// One absolute scroll position describes both the project wall and the card stage.
export const clamp=(v,min=0,max=1)=>Math.max(min,Math.min(max,v));
export const ease=v=>{v=clamp(v);return v*v*(3-2*v);};
export const PRELUDE=3.2;
export const CARD_SPAN=1.12;
export const worldLength=count=>PRELUDE+(count-1)*CARD_SPAN+1;
export function worldFrame(units,count){
 const u=clamp(units,0,worldLength(count));
 if(u<.6)return {phase:'intro',progress:u/.6,index:0,part:0,push:0};
 if(u<2.2)return {phase:'tile',progress:clamp((u-.6)/1.1),index:0,part:0,push:0};
 if(u<PRELUDE)return {phase:'focus',progress:(u-2.2),index:0,part:0,push:0};
 const raw=(u-PRELUDE)/CARD_SPAN,index=Math.min(count-1,Math.floor(raw+1e-9)),part=Math.max(0,raw-index);
 return {phase:'cards',progress:clamp((u-PRELUDE)/(worldLength(count)-PRELUDE)),index,part,push:index<count-1?ease((part-.72)/.28):0};
}

export function createWorlds(section){
 const pin=section.querySelector('.worlds-pin'),intro=section.querySelector('.journey-intro'),wall=section.querySelector('.world-tiles');
 const tiles=[...section.querySelectorAll('.world-tile')],cards=[...section.querySelectorAll('.career-project')];
 const hud=section.querySelector('.worlds-hud'),buttons=[...section.querySelectorAll('[data-world-direction]')],count=section.querySelector('#worlds-count');
 const set=(el,name,value)=>el.style.setProperty(name,String(value));
 const lerp=(a,b,p)=>a+(b-a)*p;
 let enabled=false,current=worldFrame(0,cards.length),lastAccessible='',pendingFocus=false;
 hud.tabIndex=-1;
 section.style.setProperty('--world-span',worldLength(cards.length)+1);
 function top(){return section.getBoundingClientRect().top+scrollY;}
 function projectScroll(index){return top()+(PRELUDE+clamp(index,0,cards.length-1)*CARD_SPAN+.56*CARD_SPAN)*innerHeight;}
 function go(index,behavior='smooth',focusStage=false){
  index=clamp(index,0,cards.length-1);
  pendingFocus=enabled&&focusStage;
  if(enabled)scrollTo({top:projectScroll(index),behavior});
  else cards[index].scrollIntoView({behavior,block:'start'});
 }
 buttons.forEach(button=>button.addEventListener('click',()=>go(current.index+Number(button.dataset.worldDirection))));
 // Layout coordinates remain valid even when opening a deep link beyond the wall.
 function layoutBox(el){let left=0,top=0,node=el;while(node&&node!==pin){left+=node.offsetLeft;top+=node.offsetTop;node=node.offsetParent;}return {x:left,y:top,w:el.offsetWidth,h:el.offsetHeight};}
 function accessibility(frame){
  const state=enabled?`${frame.phase}:${frame.index}`:'static';
  if(state===lastAccessible)return;
  lastAccessible=state;
  intro.inert=enabled&&frame.phase!=='intro';intro.setAttribute('aria-hidden',String(intro.inert));
  wall.inert=enabled&&frame.phase!=='tile';wall.setAttribute('aria-hidden',String(wall.inert));
  hud.inert=enabled&&['intro','tile'].includes(frame.phase);hud.setAttribute('aria-hidden',String(hud.inert||!enabled));
  cards.forEach((card,i)=>{const hidden=enabled&&(frame.phase!=='cards'||i!==frame.index);card.inert=hidden;card.setAttribute('aria-hidden',String(hidden));});
 }
 function update(){
  const u=clamp((scrollY-top())/innerHeight,0,worldLength(cards.length));current=worldFrame(u,cards.length);
  accessibility(current);
  if(!enabled)return {...current,phase:'cards',progress:1};
  if(pendingFocus&&current.phase==='cards'){hud.focus({preventScroll:true});pendingFocus=false;}
  const vw=innerWidth,vh=innerHeight,slide=ease((u-.6)/1.1);
  set(pin,'--intro-x',`${-vw*slide}px`);set(pin,'--intro-alpha',1-ease((u-.95)/.6));
  set(pin,'--wall-x',`${vw*(1-slide)}px`);set(pin,'--wall-scale',1.2-.2*slide);
  set(pin,'--world-veil',.08+.72*slide);
  const zoom=ease(u-2.2);set(pin,'--wall-alpha',u<.6?0:(1-ease(zoom/.82)));set(pin,'--hud-alpha',ease((u-2.85)/.25));
  tiles[0].querySelector('.tile-image').style.visibility=u>=2.2?'hidden':'';
  const baseW=Math.min(vw*.76,(vh-225)*16/9),baseH=baseW*9/16;
  const center={x:(vw-baseW)/2,y:(vh-baseH)/2+6,w:baseW,h:baseH};
  const start=layoutBox(tiles[0].querySelector('.tile-image'));
  const active=current.index,next=active+1,push=current.push;
  cards.forEach((card,i)=>{
   const visible=u>=2.2&&(i===active||(current.phase==='cards'&&push>0&&i===next));
   card.style.opacity=visible?'1':'0';card.style.visibility=visible?'visible':'hidden';card.classList.toggle('is-active',i===active&&current.phase==='cards');
   if(!visible)return;
   let rect={...center},desc=0,y=0;
   if(current.phase==='focus'){for(const key of ['x','y','w','h'])rect[key]=lerp(start[key],center[key],zoom);}
   if(current.phase==='cards'){
    const part=i===active?current.part:0;
    desc=i===0?ease((part-.18)/.2):1;
    const detailW=Math.min(vw*.60,(vh-240)*16/9),detailH=detailW*9/16;
    rect={x:lerp(center.x,vw*.37,desc),y:lerp(center.y,(vh-detailH)/2+6,desc),w:lerp(center.w,detailW,desc),h:lerp(center.h,detailH,desc)};
    const nextW=Math.min(vw*.60,(vh-240)*16/9),nextTop=(vh-nextW*9/16)/2+6;
    const incomingTop=lerp(vh+60,nextTop,push);
    y=i===active?Math.min(0,incomingTop-24-(rect.y+rect.h)):incomingTop-rect.y;
    if(i===active&&push>.9)card.style.opacity=String(1-ease((push-.9)/.1));
   }
   set(card,'--card-y',`${y}px`);set(card,'--card-x',`${rect.x}px`);set(card,'--card-top',`${rect.y}px`);set(card,'--card-w',`${rect.w}px`);set(card,'--card-h',`${rect.h}px`);
   set(card,'--card-rotate',`${-2.5*desc}deg`);set(card,'--card-radius',`${4+4*zoom}px`);
   set(card,'--copy-x',`${-(1-desc)*vw*.45}px`);set(card,'--copy-alpha',desc);
   set(card,'--disclosure-alpha',current.phase==='focus'?ease((zoom-.55)/.4):1);
   card.querySelector('.career-project-copy').setAttribute('aria-hidden',String(desc<.95));
  });
  count.textContent=`${String(current.index+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;
  buttons[0].disabled=current.index===0;buttons[1].disabled=current.index===cards.length-1;
  return current;
 }
 function setEnabled(value){
  enabled=value;lastAccessible='';
  if(!value){cards.forEach(card=>{card.style.opacity='';card.style.visibility='';card.classList.remove('is-active');card.querySelector('.career-project-copy').removeAttribute('aria-hidden');});tiles[0].querySelector('.tile-image').style.visibility='';}
  update();
 }
 function readingPosition(){
  if(enabled)return {index:current.index,phase:current.phase,part:current.part};
  const card=cards.find(card=>card.getBoundingClientRect().bottom>innerHeight*.25);
  return {index:Math.max(0,cards.indexOf(card)),phase:'cards',part:.56};
 }
 return {update,setEnabled,go,projectScroll,readingPosition,count:cards.length};
}
