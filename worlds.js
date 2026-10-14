// One absolute scroll position describes both the project wall and the card stage.
export const clamp=(v,min=0,max=1)=>Math.max(min,Math.min(max,v));
export const ease=v=>{v=clamp(v);return v*v*(3-2*v);};
export const PRELUDE=3.2;
export const CARD_SPAN=.65;
// The final card remains readable while the next full-screen film covers it.
export const worldLength=count=>PRELUDE+(count-1)*CARD_SPAN+1.8;
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
 const years=section.querySelector('.world-year-nav'),yearPlot=years?.querySelector('.world-year-plot');
 const yearLinks=[...section.querySelectorAll('.world-year-link')],yearStops=[...section.querySelectorAll('.world-year-stop')];
 const yearName=years?.querySelector('.world-year-name'),yearPeriod=years?.querySelector('.world-year-period');
 const yearConnectors=years?.querySelector('.world-year-connectors');
 const monthPoint=value=>{const [year,month]=String(value||'2006-01').split('-').map(Number);return clamp(((year-2006)*12+month-1)/227);};
 const projects=cards.map(card=>({id:card.id,name:card.querySelector('h3').textContent.trim(),start:card.dataset.start,end:card.dataset.end,
  startPoint:monthPoint(card.dataset.start),endPoint:monthPoint(card.dataset.end)}));
 const set=(el,name,value)=>el.style.setProperty(name,String(value));
 const lerp=(a,b,p)=>a+(b-a)*p;
 let enabled=false,current=worldFrame(0,cards.length),lastAccessible='',pendingFocus=false,lastYear=-1,yearGeometry='';
 hud.tabIndex=-1;
 cards.forEach(card=>card.tabIndex=-1);
 section.style.setProperty('--world-span',worldLength(cards.length)+1);
 function top(){return section.getBoundingClientRect().top+scrollY;}
 function indexForId(value){return cards.findIndex(card=>card.id===String(value).replace(/^#/,''));}
 function projectScroll(index){return top()+(PRELUDE+clamp(index,0,cards.length-1)*CARD_SPAN+.56*CARD_SPAN)*innerHeight;}
 function go(index,behavior='smooth',focusStage=false){
  if(!Number.isFinite(Number(index)))return false;
  index=clamp(Math.round(Number(index)),0,cards.length-1);
  pendingFocus=enabled&&focusStage;
  if(enabled)scrollTo({top:projectScroll(index),behavior});
  else{cards[index].scrollIntoView({behavior,block:'start'});if(focusStage)cards[index].focus({preventScroll:true});}
  return true;
 }
 buttons.forEach(button=>button.addEventListener('click',()=>go(current.index+Number(button.dataset.worldDirection))));
 years?.addEventListener('keydown',event=>{
  const index=yearLinks.indexOf(event.target.closest('.world-year-link'));if(index<0)return;
  const next=event.key==='Home'?0:event.key==='End'?yearLinks.length-1:
   ['ArrowDown','ArrowRight'].includes(event.key)?Math.min(index+1,yearLinks.length-1):
   ['ArrowUp','ArrowLeft'].includes(event.key)?Math.max(0,index-1):-1;
  if(next<0)return;event.preventDefault();yearLinks[next].focus();
 });
 // Labels avoid collisions; their leader lines still meet the true start month.
 // The two projects starting in 2006.12 remain separate links at one date.
 function layoutYears(){
  if(!yearPlot||!enabled)return;
  const height=yearPlot.clientHeight,signature=`${height}:${innerWidth}`;
  if(yearGeometry===signature||height<1)return;yearGeometry=signature;
  const half=15,gap=Math.min(37,Math.max(0,(height-half*2)/Math.max(1,projects.length-1)));
  const positions=projects.map(project=>clamp(project.startPoint*height,half,height-half));
  for(let i=1;i<positions.length;i++)positions[i]=Math.max(positions[i],positions[i-1]+gap);
  positions[positions.length-1]=Math.min(positions.at(-1),height-half);
  for(let i=positions.length-2;i>=0;i--)positions[i]=Math.min(positions[i],positions[i+1]-gap);
  yearConnectors?.setAttribute('viewBox',`0 0 20 ${height}`);
  yearStops.forEach((stop,index)=>{
   set(stop,'--year-label-y',`${positions[index]}px`);
   const line=yearConnectors?.children[index];
   line?.setAttribute('y1',String(projects[index].startPoint*height));line?.setAttribute('y2',String(positions[index]));
  });
 }
 function updateYears(frame,alpha){
  if(!years)return;
  const project=projects[frame.index],next=projects[Math.min(frame.index+1,projects.length-1)];
  set(years,'--year-alpha',enabled?alpha:1);
  // This is movement between project starts, not an invented date/completion value.
  set(years,'--year-point',`${lerp(project.startPoint,next.startPoint,frame.push)*100}%`);
  set(years,'--year-start',`${project.startPoint*100}%`);
  set(years,'--year-duration',`${(project.endPoint-project.startPoint)*100}%`);
  if(lastYear!==frame.index){
   lastYear=frame.index;
   yearName.textContent=project.name;yearPeriod.textContent=`${project.start.replace('-','.')} — ${project.end.replace('-','.')}`;
   yearLinks.forEach((link,index)=>{if(index===frame.index)link.setAttribute('aria-current','true');else link.removeAttribute('aria-current');});
   yearStops.forEach((stop,index)=>stop.classList.toggle('is-current',index===frame.index));
  }
  layoutYears();
 }
 function staticIndex(){let index=0;cards.forEach((card,i)=>{if(card.getBoundingClientRect().top<=innerHeight*.3)index=i;});return index;}
 // Layout coordinates remain valid even when opening a deep link beyond the wall.
 function layoutBox(el){let left=0,top=0,node=el;while(node&&node!==pin){left+=node.offsetLeft;top+=node.offsetTop;node=node.offsetParent;}return {x:left,y:top,w:el.offsetWidth,h:el.offsetHeight};}
 function accessibility(frame,yearAlpha){
  const yearHidden=enabled&&(frame.phase==='intro'||yearAlpha<.98);
  const state=enabled?`${frame.phase}:${frame.index}:${yearHidden}`:'static';
  if(state===lastAccessible)return;
  lastAccessible=state;
  intro.inert=enabled&&frame.phase!=='intro';intro.setAttribute('aria-hidden',String(intro.inert));
  wall.inert=enabled&&frame.phase!=='tile';wall.setAttribute('aria-hidden',String(wall.inert));
  hud.inert=enabled&&['intro','tile'].includes(frame.phase);hud.setAttribute('aria-hidden',String(hud.inert||!enabled));
  if(years){years.inert=yearHidden;years.setAttribute('aria-hidden',String(yearHidden));}
  cards.forEach((card,i)=>{const hidden=enabled&&(frame.phase!=='cards'||i!==frame.index);card.inert=hidden;card.setAttribute('aria-hidden',String(hidden));});
 }
 function update(){
  const u=clamp((scrollY-top())/innerHeight,0,worldLength(cards.length));current=worldFrame(u,cards.length);
  if(!enabled)current={phase:'cards',progress:1,index:staticIndex(),part:0,push:0};
  const yearAlpha=ease((u-1.05)/.4);
  accessibility(current,yearAlpha);updateYears(current,yearAlpha);
  if(!enabled)return current;
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
  const copy=cards[0].querySelector('.career-project-copy'),copyStyle=getComputedStyle(copy);
  const copyRight=parseFloat(copyStyle.left)+copy.offsetWidth;
  const axisLeft=years?years.getBoundingClientRect().left:vw-vw*.12;
  const detailX=Math.max(vw*.32,copyRight+Math.max(20,vw*.018));
  const detailW=Math.max(160,Math.min(axisLeft-detailX-Math.max(22,vw*.02),(vh-240)*16/9));
  const detailH=detailW*9/16,detailY=(vh-detailH)/2+6;
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
    rect={x:lerp(center.x,detailX,desc),y:lerp(center.y,detailY,desc),w:lerp(center.w,detailW,desc),h:lerp(center.h,detailH,desc)};
    const incomingTop=lerp(vh+60,detailY,push);
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
  enabled=value;lastAccessible='';yearGeometry='';
  if(!value){cards.forEach(card=>{card.style.opacity='';card.style.visibility='';card.classList.remove('is-active');card.querySelector('.career-project-copy').removeAttribute('aria-hidden');});tiles[0].querySelector('.tile-image').style.visibility='';}
  update();
 }
 function readingPosition(){
  if(enabled)return {index:current.index,phase:current.phase,part:current.part};
  const card=cards.find(card=>card.getBoundingClientRect().bottom>innerHeight*.25);
  return {index:Math.max(0,cards.indexOf(card)),phase:'cards',part:.56};
 }
 return {update,setEnabled,go,projectScroll,readingPosition,indexForId,count:cards.length};
}
