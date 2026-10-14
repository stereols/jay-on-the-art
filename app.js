import {createWorlds} from './worlds.js';
import {createDiscover,discoverFrame} from './discover.js';
import {createSpecialFilm} from './special-film.js';
import {createAelinShowcase} from './aelin-showcase.js';
import {createCameraTimeline} from './camera-timeline.js';
import {createExperience} from './experience.js';
(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  root.classList.add('js-enabled');
  const reveals = document.querySelectorAll('.reveal, .career-item');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -35px 0px', threshold: 0.04 });
    reveals.forEach(element => observer.observe(element));
  } else reveals.forEach(element => element.classList.add('in-view'));

  const menuButton = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-nav');
  function closeMenu(returnFocus = false) {
    menu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', '메뉴 열기');
    if (returnFocus) menuButton.focus();
  }
  menuButton.addEventListener('click', () => {
    const open = menu.hidden;
    menu.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  });
  menu.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) closeMenu(true); });
  document.addEventListener('click', e => { if (!menu.hidden && !menu.contains(e.target) && !menuButton.contains(e.target)) closeMenu(); });

  let cosmos = null;
  let atmosphereVisibility = 1;
  let paused = reduced.matches;
  let lastScene = {id:"hero",progress:0,night:0};
  const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
  const smooth=x=>x*x*(3-2*x);
  const motionButton=document.getElementById('motion-toggle');
  const sections=[...document.querySelectorAll('.scene-section')];
  const progressBar=document.getElementById('read-progress');
  const desktop=matchMedia('(min-width: 761px)');
  const pov=document.getElementById('perspective');
  const discover=document.getElementById('discover');
  const discoverScene=createDiscover(discover);
  const track=discover.querySelector('.project-grid');
  const trackWindow=discover.querySelector('.discover-window');
  const cardButtons=[...document.querySelectorAll('[data-card-direction]')];
  const works=document.getElementById('works');
  const worlds=createWorlds(works);
  const personalCards=[...track.children];
  const portal=document.getElementById('threshold');
  const experience=createExperience(portal);
  const header=document.querySelector('.topbar');
  const specialFilmSection=document.querySelector('#yigo .special-story');
  const specialStory=createSpecialFilm(document.getElementById('yigo'));
  const aelinShowcase=createAelinShowcase(document.getElementById('aelin-showcase'));
  const cameraTimeline=createCameraTimeline();
  const lab=document.getElementById('lab');
  const stepsUI=[...document.querySelectorAll('.process-list li')];
  const mapButton=document.getElementById('map-toggle');
  const mapPanel=document.getElementById('map-panel');
  const mapLinks=[...mapPanel.querySelectorAll('a')];
  let activeCard=0,scrollPending=false;
  const motionEnabled=()=>!paused;
  const pinned=()=>motionEnabled()&&desktop.matches;
  const localProgress=el=>clamp(-el.getBoundingClientRect().top/Math.max(1,el.offsetHeight-innerHeight));
  function closeMap(focusBack=false){mapPanel.hidden=true;mapButton.setAttribute('aria-expanded','false');if(focusBack)mapButton.focus();}
  mapButton.addEventListener('click',()=>{const open=mapPanel.hidden;mapPanel.hidden=!open;mapButton.setAttribute('aria-expanded',String(open));});
  document.getElementById('map-close').addEventListener('click',()=>closeMap(true));
  mapPanel.addEventListener('click',e=>{if(e.target.closest('a'))closeMap();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!mapPanel.hidden)closeMap(true);});
  document.addEventListener('click',e=>{if(!mapPanel.hidden&&!e.target.closest('.world-map'))closeMap();});

  const videos=[...document.querySelectorAll('.film-frame video')];
  const videoState=new Map(videos.map(v=>[v,{visible:false,userPaused:false}]));
  function syncVideoLabel(video){const button=video.parentElement.querySelector('.film-toggle');button.setAttribute('aria-label',video.paused?'영상 재생':'영상 일시정지');button.setAttribute('aria-pressed',String(!video.paused));button.querySelector('span').textContent=video.paused?'▷':'Ⅱ';button.querySelector('.film-toggle-label').textContent=video.paused?'영상 재생':'일시정지';}
  function loadVideo(video){const source=video.querySelector('source');if(!source.getAttribute('src')&&source.dataset.src){source.src=source.dataset.src;video.load();}}
  function syncVideo(video){const state=videoState.get(video);if(state.visible&&motionEnabled()&&!document.hidden&&!state.userPaused){loadVideo(video);video.play().catch(()=>syncVideoLabel(video));}else video.pause();}
  const videoObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{const video=entry.target;videoState.get(video).visible=entry.isIntersecting;syncVideo(video);}),{threshold:.15});
  videos.forEach(video=>{videoObserver.observe(video);video.addEventListener('play',()=>syncVideoLabel(video));video.addEventListener('pause',()=>syncVideoLabel(video));video.parentElement.querySelector('.film-toggle').addEventListener('click',()=>{const state=videoState.get(video);if(video.paused){state.userPaused=false;loadVideo(video);video.play().catch(()=>syncVideoLabel(video));}else{state.userPaused=true;video.pause();}});});
  document.addEventListener('visibilitychange',()=>videos.forEach(syncVideo));

  videos.forEach(video=>video.addEventListener('error',()=>{
    if(video.parentElement.querySelector('.film-error'))return;
    const message=document.createElement('p');message.className='film-error';message.textContent='영상을 불러오지 못했습니다.';
    const link=document.createElement('a');link.href=video.querySelector('source').dataset.src;link.textContent='영상 직접 열기 ↗';message.append(link);video.parentElement.append(message);
  }));
  let layoutInitialized=false,lastReading=null;
  function setLayout(){
    const anchor=layoutInitialized&&lastReading?.section;
    const fraction=lastReading?.fraction||0;
    const reading=anchor===works?lastReading.world:null;
    const wasPinned=root.classList.contains('motion-layout');
    trackWindow.scrollLeft=0;layoutInitialized=true;
    root.classList.toggle('pov-motion',motionEnabled());root.classList.toggle('motion-layout',pinned());root.classList.toggle('no-motion',!motionEnabled());
    worlds.setEnabled(pinned());
    discoverScene.setEnabled(pinned());
    specialStory.setEnabled(pinned());
    aelinShowcase.setEnabled(pinned());
    experience.setEnabled(pinned());
    if(!pinned())cardProgress(0);
    motionButton.setAttribute('aria-pressed',String(paused));motionButton.setAttribute('aria-label',paused?'배경과 스크롤 연출 재생':'배경과 스크롤 연출 일시정지');
    motionButton.querySelector('.motion-icon').textContent=paused?'▷':'Ⅱ';motionButton.querySelector('.motion-label').textContent=paused?'Motion off':'Motion on';
    videos.forEach(syncVideo);
    if(reading&&wasPinned!==pinned()&&reading.phase==='cards')worlds.go(reading.index,'instant');
    else if(anchor&&scrollY>0)scrollTo({top:anchor.getBoundingClientRect().top+scrollY+fraction*anchor.offsetHeight,behavior:'instant'});
    scheduleScroll();
  }
  motionButton.addEventListener('click',()=>{paused=!paused;if(!paused)cosmos?.setReducedMotion(false);cosmos?.setPaused(paused);setLayout();});
  reduced.addEventListener('change',()=>{paused=reduced.matches;cosmos?.setReducedMotion(reduced.matches);cosmos?.setPaused(paused);setLayout();});
  desktop.addEventListener('change',setLayout);
  function cardProgress(p){activeCard=Math.round(p*(personalCards.length-1));document.getElementById('discover-count').textContent=`${String(activeCard+1).padStart(2,'0')} / 06`;discover.style.setProperty('--discover-progress',(1/6+p*5/6).toFixed(3));cardButtons[0].disabled=activeCard===0;cardButtons[1].disabled=activeCard===5;}
  function goToCard(index){index=clamp(index,0,personalCards.length-1);if(pinned()){scrollTo({top:discoverScene.cardPosition(index,personalCards.length),behavior:reduced.matches?'instant':'smooth'});}else{const card=track.children[index];trackWindow.scrollTo({left:card.offsetLeft-track.children[0].offsetLeft,behavior:reduced.matches?'instant':'smooth'});}}
  cardButtons.forEach(button=>button.addEventListener('click',()=>goToCard(activeCard+Number(button.dataset.cardDirection))));
  trackWindow.addEventListener('scroll',()=>{if(!pinned())cardProgress(clamp(trackWindow.scrollLeft/Math.max(1,trackWindow.scrollWidth-trackWindow.clientWidth)));},{passive:true});
  track.addEventListener('focusin',e=>{const card=e.target.closest('.project-card');if(card&&pinned()&&personalCards.indexOf(card)!==activeCard)goToCard(personalCards.indexOf(card));});
  function revealLinkedDetail(){
    if(location.hash==='#marakun-explorer')discoverScene.openFirst();
  }
  addEventListener('hashchange',revealLinkedDetail);
  revealLinkedDetail();

  function updateScroll(){
    aelinShowcase.update();
    const marker=innerHeight*.1;
    let section=sections[0];
    for(const s of sections)if(s.getBoundingClientRect().top<=marker)section=s;
    const r=section.getBoundingClientRect();
    worlds.update();
    const scene=cameraTimeline.sample(scrollY);
    const {night,blur,wash}=scene;
    experience.update();
    root.classList.toggle('dark-chapter',night>.5);
    root.style.setProperty('--scene-dark',night.toFixed(4));
    root.style.setProperty('--scene-blur',motionEnabled()?blur.toFixed(3)+'px':'0px');
    root.style.setProperty('--scene-wash',wash.toFixed(4));
    lastScene=scene;
    cosmos?.setScene(lastScene);
    specialStory.update();
    // Header tone follows the incoming video, independently of the cosmos camera.
    const specialRect=specialFilmSection.getBoundingClientRect();
    const videoCoverage=smooth(clamp((innerHeight-specialRect.top)/innerHeight))*smooth(clamp(specialRect.bottom/innerHeight));
    const headerDark=specialRect.bottom>0?videoCoverage:night;
    header.style.setProperty('--header-dark',(headerDark*100).toFixed(3)+'%');
    const footer=document.querySelector('body > footer'),footerRect=footer.getBoundingClientRect();
    const footerArrival=smooth(clamp((innerHeight-footerRect.top)/Math.max(1,footerRect.height)));
    const povProgress=localProgress(pov);
    const filmFocus=motionEnabled()?smooth(clamp((povProgress-.24)/.13))*smooth(clamp((pov.getBoundingClientRect().bottom-innerHeight*.2)/(innerHeight*.6))):0;
    const headerProgress=(1-filmFocus)*smooth(clamp((innerHeight*.65-pov.getBoundingClientRect().top)/(innerHeight*.55)))*(1-footerArrival);
    header.style.setProperty('--header-visibility',headerProgress.toFixed(4));
    header.classList.toggle('is-visible',headerProgress>.05);
    header.classList.toggle('is-scrolled',headerProgress>.05);
    header.inert=filmFocus>.95;
    root.classList.toggle('pov-film-active',filmFocus>.95);
    atmosphereVisibility=1-Math.max(filmFocus,videoCoverage);
    cosmos?.setAtmosphere({visibility:atmosphereVisibility});
    if(filmFocus>.1&&!mapPanel.hidden)closeMap();
    if(filmFocus>.1&&!menu.hidden)closeMenu();
    progressBar.style.transform='scaleX('+clamp(scrollY/Math.max(1,root.scrollHeight-innerHeight))+')';
    mapLinks.forEach(link=>link.setAttribute('aria-current',String(link.dataset.map===section.id||(['threshold','career-history'].includes(section.id)&&link.dataset.map==='career')||(section.id==='links'&&link.dataset.map==='about'))));
    if(motionEnabled()){
      const p=povProgress,expand=smooth(clamp((p-.06)/.29));
      const diameter=clamp(innerHeight*.12,88,112),centerY=innerHeight*.81;
      pov.style.setProperty('--pov-inset-y',(centerY-diameter/2)*(1-expand)+'px');
      pov.style.setProperty('--pov-inset-x',(pov.clientWidth-diameter)/2*(1-expand)+'px');
      pov.style.setProperty('--pov-bottom',(innerHeight-centerY-diameter/2)*(1-expand)+'px');
      pov.style.setProperty('--pov-radius',diameter/2*(1-expand)+'px');
      pov.style.setProperty('--pov-video',String(smooth(clamp((expand-.12)/.42))));
      pov.style.setProperty('--pov-text',String(1-smooth(clamp((p-.02)/.16))));
      pov.style.setProperty('--pov-shift',String(expand));
      pov.style.setProperty('--pov-title',String(smooth(clamp((p-.37)/.10))));
      pov.style.setProperty('--pov-reflection',String(smooth(clamp((p-.55)/.13))));
      pov.style.setProperty('--pov-dim',String(.18+smooth(clamp((p-.37)/.10))*.37));
      pov.style.setProperty('--pov-exit-cue',String(smooth(clamp((p-.76)/.10))*(1-smooth(clamp((p-.98)/.02)))));
      pov.style.setProperty('--pov-controls',String(expand>.9?1:0));
      document.querySelector('#pov-film .film-toggle').tabIndex=expand>.9?0:-1;
    }
    if(pinned()){
      const d=localProgress(discover),distance=Math.max(0,track.scrollWidth-trackWindow.clientWidth+parseFloat(getComputedStyle(trackWindow).paddingRight)*2);
      const rail=discoverFrame(d).rail;
      discover.style.setProperty('--track-x',-distance*rail+'px');discoverScene.update(d);cardProgress(rail);
      const w=localProgress(lab);lab.style.setProperty('--workflow-progress',String(w));
      stepsUI.forEach((step,i)=>{step.classList.toggle('is-reached',w>=i*.24);const activation=smooth(clamp((w-i*.24)/.18));step.style.setProperty('--step-opacity',String(.3+activation*.7));step.style.setProperty('--step-offset',(1-activation)*18+'px');});
    }else{
      discoverScene.update(0);
      document.querySelector('#pov-film .film-toggle').tabIndex=0;
      stepsUI.forEach(step=>{step.style.setProperty('--step-opacity','1');step.style.setProperty('--step-offset','0px');});lab.style.setProperty('--workflow-progress','1');
    }
    if(root.classList.contains('motion-layout')===pinned())lastReading={section,fraction:clamp(-r.top/section.offsetHeight),world:worlds.readingPosition()};
  }
  function navigateHash(hash,behavior='instant'){
    if(hash==='#project-overview'){
      const destination=pinned()?works.getBoundingClientRect().top+scrollY+1.8*innerHeight:works.querySelector('.world-tiles').getBoundingClientRect().top+scrollY-90;
      scrollTo({top:destination,behavior});return true;
    }
    const match=/^#career-project-(\d+)$/.exec(hash);
    if(match){const index=worlds.indexForId(hash);if(index>=0)worlds.go(index,behavior);return index>=0;}
    if(hash==='#marakun-explorer'){revealLinkedDetail();return true;}
    return false;
  }
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href^="#career-project-"]');if(!link)return;
    event.preventDefault();history.pushState(null,'',link.hash);
    const index=worlds.indexForId(link.hash);
    if(index>=0)worlds.go(index,motionEnabled()?'smooth':'instant',event.detail===0&&link.classList.contains('world-tile'));
  });
  addEventListener('hashchange',()=>navigateHash(location.hash));
  addEventListener('popstate',()=>navigateHash(location.hash));
  function resumeDestination(target){
    const behavior=reduced.matches?'instant':'smooth';
    const url=new URL(location.href);url.searchParams.delete('entry');url.hash=target;
    history.pushState(null,'',url);
    if(navigateHash('#'+target,behavior))return;
    document.getElementById(target)?.scrollIntoView({behavior,block:'start'});
  }
  addEventListener('resume-navigate',event=>resumeDestination(event.detail));
  function scheduleScroll(){if(scrollPending)return;scrollPending=true;requestAnimationFrame(()=>{scrollPending=false;updateScroll();});}
  addEventListener('scroll',scheduleScroll,{passive:true});
  addEventListener('resize',()=>{scheduleScroll();if(innerWidth>760)closeMenu();},{passive:true});
  document.fonts?.ready.then(scheduleScroll);
  setLayout();updateScroll();
  requestAnimationFrame(()=>{const entry=new URLSearchParams(location.search).get('entry');if(['top','yigo','project-overview'].includes(entry))resumeDestination(entry);else navigateHash(location.hash);scheduleScroll();});
  const params=new URLSearchParams(location.search);
  if(params.get('view')==='static'){paused=true;setLayout();root.dataset.renderMode='static';motionButton.hidden=true;return;}
  import('./cosmos.bundle.js?v=20261015-atmosphere').then(module=>{cosmos=module.createCosmos(document.getElementById('cosmos-canvas'),{paused,reducedMotion:reduced.matches});cosmos.setScene(lastScene);cosmos.setAtmosphere({visibility:atmosphereVisibility});}).catch(error=>{console.warn('Living Cosmos uses the static artwork fallback.',error);root.dataset.renderMode='fallback';});
})();
