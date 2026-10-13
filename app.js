(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  root.classList.add('js-enabled');
  const reveals = document.querySelectorAll('.reveal');
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

  const steps = [
    { title:'The repeatable unit', copy:'모든 조립은 하나의 작은 유닛에서 출발합니다. 이 단위가 반복 가능한 구조의 기준이 됩니다.', bounds:[2,62,13,29] },
    { title:'From unit to wall', copy:'유닛을 벽 부재로 확장합니다. 반복과 조합이 가능한 벽 조각이 다음 조립 단계의 재료가 됩니다.', bounds:[13,34,21,54] },
    { title:'A structure emerges', copy:'벽 부재를 조합해 집의 기본 형태를 만듭니다. 원본 자료에는 1m·2m 가이드가 함께 표시되어 있습니다.', bounds:[34,22,29,66] },
    { title:'A house takes shape', copy:'기본 구조에 상부와 지붕, 생활감 있는 요소를 더한 Tier 1 완성 하우스입니다. 모듈 조합이 한 채의 공간으로 읽히는 순간입니다.', bounds:[64,7,33,82] }
  ];
  const explorer = document.getElementById('marakun-explorer-app');
  const triggers = [...explorer.querySelectorAll('[data-marakun-step]')];
  const focus = explorer.querySelector('.marakun-focus');
  let currentStep = 0;
  function chooseStep(index) {
    currentStep = index;
    const step = steps[index];
    document.getElementById('step-count').textContent = `${String(index+1).padStart(2,'0')} / 04`;
    document.getElementById('step-title').textContent = step.title;
    document.getElementById('step-copy').textContent = step.copy;
    ['left','top','width','height'].forEach((property,i) => { focus.style[property] = `${step.bounds[i]}%`; });
    triggers.forEach(button => {
      const active = Number(button.dataset.marakunStep) === index;
      button.classList.toggle('is-active',active);
      button.setAttribute('aria-pressed',String(active));
    });
  }
  explorer.addEventListener('click', e => {
    const button = e.target.closest('[data-marakun-step]');
    if (button && explorer.contains(button)) chooseStep(Number(button.dataset.marakunStep));
  });
  explorer.querySelector('.step-nav').addEventListener('keydown', e => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return;
    e.preventDefault();
    const focused = Number(e.target.closest('[data-marakun-step]')?.dataset.marakunStep ?? currentStep);
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? 3 : (focused + (e.key === 'ArrowRight' ? 1 : 3)) % 4;
    chooseStep(next);
    explorer.querySelector(`.step-nav [data-marakun-step="${next}"]`).focus();
  });

  let cosmos = null;
  let paused = reduced.matches;
  let lastScene = 0;
  const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
  const smooth=x=>x*x*(3-2*x);
  const motionButton=document.getElementById('motion-toggle');
  const chapter=document.getElementById('scene-chapter');
  const sections=[...document.querySelectorAll('.scene-section')];
  const progressBar=document.getElementById('read-progress');
  const desktop=matchMedia('(min-width: 761px)');
  const pov=document.getElementById('perspective');
  const discover=document.getElementById('discover');
  const track=discover.querySelector('.project-grid');
  const trackWindow=discover.querySelector('.discover-window');
  const cardButtons=[...document.querySelectorAll('[data-card-direction]')];
  const projects=[...document.querySelectorAll('.career-project')];
  const portal=document.getElementById('threshold');
  const special=document.getElementById('special-film');
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
  function loadVideo(video){const source=video.querySelector('source');if(!source.src){source.src=source.dataset.src;video.load();}}
  function syncVideo(video){const state=videoState.get(video);if(state.visible&&motionEnabled()&&!document.hidden&&!state.userPaused){loadVideo(video);video.play().catch(()=>syncVideoLabel(video));}else video.pause();}
  const videoObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{const video=entry.target;videoState.get(video).visible=entry.isIntersecting;syncVideo(video);}),{threshold:.15});
  videos.forEach(video=>{videoObserver.observe(video);video.addEventListener('play',()=>syncVideoLabel(video));video.addEventListener('pause',()=>syncVideoLabel(video));video.parentElement.querySelector('.film-toggle').addEventListener('click',()=>{const state=videoState.get(video);if(video.paused){state.userPaused=false;loadVideo(video);video.play().catch(()=>syncVideoLabel(video));}else{state.userPaused=true;video.pause();}});});
  document.addEventListener('visibilitychange',()=>videos.forEach(syncVideo));

  let layoutInitialized=false;
  function setLayout(){const anchor=layoutInitialized&&sections.filter(s=>s.offsetTop<=scrollY).at(-1);const fraction=anchor?clamp((scrollY-anchor.offsetTop)/anchor.offsetHeight):0;trackWindow.scrollLeft=0;layoutInitialized=true;root.classList.toggle('motion-layout',pinned());root.classList.toggle('no-motion',!motionEnabled());motionButton.setAttribute('aria-pressed',String(paused));motionButton.setAttribute('aria-label',paused?'배경과 스크롤 연출 재생':'배경과 스크롤 연출 일시정지');motionButton.querySelector('.motion-icon').textContent=paused?'▷':'Ⅱ';motionButton.querySelector('.motion-label').textContent=paused?'Motion off':'Motion on';videos.forEach(syncVideo);if(anchor&&scrollY>0)scrollTo({top:anchor.offsetTop+fraction*anchor.offsetHeight,behavior:'instant'});scheduleScroll();}
  motionButton.addEventListener('click',()=>{paused=!paused;if(!paused)cosmos?.setReducedMotion(false);cosmos?.setPaused(paused);setLayout();});
  reduced.addEventListener('change',()=>{paused=reduced.matches;cosmos?.setReducedMotion(reduced.matches);cosmos?.setPaused(paused);setLayout();});
  desktop.addEventListener('change',setLayout);
  function cardProgress(p){activeCard=Math.round(p*5);document.getElementById('discover-count').textContent=`${String(activeCard+1).padStart(2,'0')} / 06`;discover.style.setProperty('--discover-progress',(1/6+p*5/6).toFixed(3));cardButtons[0].disabled=activeCard===0;cardButtons[1].disabled=activeCard===5;}
  function goToCard(index){index=clamp(index,0,5);if(pinned()){scrollTo({top:discover.offsetTop+index/5*(discover.offsetHeight-innerHeight),behavior:reduced.matches?'instant':'smooth'});}else{const card=track.children[index];trackWindow.scrollTo({left:card.offsetLeft-track.children[0].offsetLeft,behavior:reduced.matches?'instant':'smooth'});}}
  cardButtons.forEach(button=>button.addEventListener('click',()=>goToCard(activeCard+Number(button.dataset.cardDirection))));
  trackWindow.addEventListener('scroll',()=>{if(!pinned())cardProgress(clamp(trackWindow.scrollLeft/Math.max(1,trackWindow.scrollWidth-trackWindow.clientWidth)));},{passive:true});
  track.addEventListener('focusin',e=>{const card=e.target.closest('.project-card');if(card&&pinned())goToCard([...track.children].indexOf(card));});
  document.querySelector('.assembly-details').addEventListener('toggle',scheduleScroll);
  function revealLinkedDetail(){
    if(location.hash==='#marakun-explorer'){
      const detail=document.querySelector('.assembly-details');
      if(!detail.open){detail.open=true;requestAnimationFrame(()=>document.getElementById('marakun-explorer').scrollIntoView({behavior:'instant',block:'start'}));}
    }
  }
  addEventListener('hashchange',revealLinkedDetail);
  revealLinkedDetail();

  const wash=[0,.32,.35,0,0,.25,.3,.15,.03];
  const blur=[0,6,1,0,0,2,4,1,0];
  function updateScroll(){
    const y=scrollY+innerHeight*.25;
    let index=0;
    for(let i=0;i<sections.length;i++)if(y>=sections[i].offsetTop)index=i;
    const section=sections[index],start=section.offsetTop,end=sections[index+1]?.offsetTop||document.body.scrollHeight;
    const local=clamp((y-start)/Math.max(1,end-start));
    const blend=smooth(clamp((local-.65)/.35));
    const next=Math.min(index+1,sections.length-1);
    lastScene=index+blend;
    if(index===3){lastScene=3+smooth(local);}
    const dark=index===2?smooth(clamp((local-.96)/.04)):index===3||index===4?1:0;
    root.classList.toggle('dark-chapter',(index===3||index===4));
    root.style.setProperty('--scene-dark',dark.toFixed(3));
    root.style.setProperty('--scene-blur',`${motionEnabled()?((blur[index]+(blur[next]-blur[index])*blend)).toFixed(2):0}px`);
    root.style.setProperty('--scene-wash',(wash[index]+(wash[next]-wash[index])*blend).toFixed(3));
    chapter.textContent=section.dataset.chapter;
    document.querySelector('.topbar').classList.toggle('is-scrolled',scrollY>45);
    progressBar.style.transform=`scaleX(${clamp(scrollY/Math.max(1,root.scrollHeight-innerHeight))})`;
    mapLinks.forEach(link=>link.setAttribute('aria-current',String(link.dataset.map===section.id||(section.id==='threshold'&&link.dataset.map==='yigo')||(section.id==='links'&&link.dataset.map==='about'))));
    cosmos?.setProgress(lastScene);
    if(pinned()){
      const p=localProgress(pov),expand=smooth(clamp((p-.08)/.57));
      pov.style.setProperty('--pov-inset-y',`${69*(1-expand)}%`);
      pov.style.setProperty('--pov-inset-x',`${34*(1-expand)}%`);
      pov.style.setProperty('--pov-bottom',`${9*(1-expand)}%`);
      pov.style.setProperty('--pov-radius',`${120*(1-expand)}px`);
      pov.style.setProperty('--pov-text',String(1-smooth(clamp(p/.26))));
      pov.style.setProperty('--pov-shift',String(expand));
      pov.style.setProperty('--pov-title',String(smooth(clamp((p-.5)/.22))));
      pov.style.setProperty('--pov-controls',String(expand>.9?1:0));
      document.querySelector('#pov-film .film-toggle').tabIndex=expand>.9?0:-1;
      const d=localProgress(discover),distance=Math.max(0,track.scrollWidth-trackWindow.clientWidth+parseFloat(getComputedStyle(trackWindow).paddingRight)*2);
      discover.style.setProperty('--track-x',`${-distance*d}px`);cardProgress(d);
      const w=localProgress(lab);lab.style.setProperty('--workflow-progress',String(w));
      stepsUI.forEach((step,i)=>{step.classList.toggle('is-reached',w>=i*.24);const activation=smooth(clamp((w-i*.24)/.18));step.style.setProperty('--step-opacity',String(.3+activation*.7));step.style.setProperty('--step-offset',`${(1-activation)*18}px`);});
    }else{document.querySelector('#pov-film .film-toggle').tabIndex=0;stepsUI.forEach(step=>{step.style.setProperty('--step-opacity','1');step.style.setProperty('--step-offset','0px');});lab.style.setProperty('--workflow-progress','1');}
    const portalP=localProgress(portal);root.style.setProperty('--portal',portalP.toFixed(3));
    if(motionEnabled()){
      projects.forEach(project=>{const r=project.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;const p=clamp((innerHeight-r.top)/(innerHeight+r.height));project.style.setProperty('--project-offset',`${(p-.5)*-45}px`);project.style.setProperty('--project-scale',(1.08-p*.06).toFixed(3));});
      const sr=special.getBoundingClientRect();special.style.setProperty('--special-scale',String(.9+clamp((innerHeight-sr.top)/innerHeight)*.1));
    }
  }
  function scheduleScroll(){if(scrollPending)return;scrollPending=true;requestAnimationFrame(()=>{scrollPending=false;updateScroll();});}
  addEventListener('scroll',scheduleScroll,{passive:true});
  addEventListener('resize',()=>{scheduleScroll();if(innerWidth>760)closeMenu();},{passive:true});
  document.fonts?.ready.then(scheduleScroll);
  setLayout();updateScroll();
  const params=new URLSearchParams(location.search);
  if(params.get('view')==='static'){paused=true;setLayout();root.dataset.renderMode='static';motionButton.hidden=true;return;}
  import('./cosmos.bundle.js').then(module=>{cosmos=module.createCosmos(document.getElementById('cosmos-canvas'),{paused,reducedMotion:reduced.matches});cosmos.setProgress(lastScene);}).catch(error=>{console.warn('Living Cosmos uses the static artwork fallback.',error);root.dataset.renderMode='fallback';});
})();
