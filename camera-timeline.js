import {worldFrame, worldLength} from './worlds.js';

export const CAMERA_POSES={
  hero:{c:[0,.2,9.1],t:[0,0,0],o:0},
  perspective:{c:[.6,.4,8.1],t:[1,0,0],o:.4},
  intro:{c:[1,.8,10.6],t:[1.25,.2,-.3],o:.65},
  rightEntry:{c:[1.2,.9,10.9],t:[1.45,.3,-.6],o:.7},
  tiles:{c:[8.2,1.4,16.3],t:[6.9,.3,-2.5],o:1.15},
  focus:{c:[8.1,.9,10.6],t:[7.2,.2,-2.8],o:1.3},
  cards:{c:[8.1,.95,13.7],t:[7.2,.2,-2.8],o:1.34},
  yigoEntry:{c:[8,-4.7,12.4],t:[6.4,-5.1,-2.6],o:1.65},
  yigo:{c:[8.1,-5.4,10.7],t:[6.7,-5.6,-2.8],o:1.9},
  discover:{c:[8.5,-5.3,10],t:[7,-5.6,-2.8],o:2.05},
  nightEntry:{c:[8.15,-5.5,4.4],t:[7.1,-6.1,-2.8],o:2.3},
  nightClose:{c:[8.8,-5.9,1.15],t:[7.1,-6.1,-2.8],o:2.7},
  emerge:{c:[-1.3,-5.1,13.6],t:[-3.2,-5.5,-2.8],o:3.25},
  career:{c:[-3.1,-5.3,15.2],t:[-4,-5.5,-2.9],o:3.4},
  careerReveal:{c:[-3.8,-4.6,14.1],t:[-5.6,-5.4,-3.1],o:3.413},
  careerRelease:{c:[-2.4,-5.6,16.3],t:[-4.8,-5.6,-2.9],o:3.424},
  careerSettled:{c:[-3.1,-5.3,15.2],t:[-4,-5.5,-2.9],o:3.425},
  careerEnd:{c:[-3,-5.4,15.4],t:[-4,-5.5,-2.9],o:3.43},
  lab:{c:[-3.1,-11,12.4],t:[-4,-10.6,-2.8],o:3.85},
  about:{c:[6,-11.3,15.8],t:[5,-10.8,-2.6],o:4.3},
  links:{c:[.2,-5.5,21],t:[1,-5,-3],o:4.6}
};

const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value));
const ease=value=>{const t=clamp(value);return t*t*(3-2*t);};
const mix=(a,b,t)=>t===0?a:t===1?b:a+(b-a)*t;
const vectorMix=(a,b,t)=>a.map((value,index)=>mix(value,b[index],t));
const phaseRank={intro:0,tile:1,focus:2,cards:3};
const sceneIds=['top','perspective','works','yigo','discover','threshold','career-history','lab','about','links'];
const semanticId=id=>id==='top'?'hero':id==='threshold'?'passage':id==='career-history'?'career':id;

function frame(name,night=0,blur=0,wash=0){
  const pose=CAMERA_POSES[name];
    const reading=['cards','career','careerReveal','careerRelease','careerSettled','careerEnd','about','links'].includes(name);
  return {
    position:pose.c.slice(),target:pose.t.slice(),orbit:pose.o,
    night,blur,wash,pointerStrength:reading?.22:name==='focus'?.4:1,
    mobileZ:name==='nightClose'?2.2:4.6,
    mobileTarget:name==='hero'?[1.3,-2.1]:[0,0]
  };
}

// A single interpolator owns pose, lighting, blur, wash and mobile framing.
// Adjacent segments use the very same endpoint object, in either direction.
export function sampleCameraKeyframes(keyframes,scroll){
  if(!keyframes.length)return frame('hero');
  const y=clamp(Number.isFinite(scroll)?scroll:0,keyframes[0].at,keyframes.at(-1).at);
  let index=0;
  while(index<keyframes.length-2&&y>keyframes[index+1].at)index++;
  const a=keyframes[index],b=keyframes[Math.min(index+1,keyframes.length-1)];
  const t=b.at>a.at?ease((y-a.at)/(b.at-a.at)):0;
  const sampled={
    position:vectorMix(a.position,b.position,t),target:vectorMix(a.target,b.target,t),
    mobileTarget:vectorMix(a.mobileTarget,b.mobileTarget,t),
    landmarkFrom:a.name,landmarkTo:b.name,landmarkProgress:t
  };
  for(const key of ['orbit','night','blur','wash','pointerStrength','mobileZ'])sampled[key]=mix(a[key],b[key],t);
  return sampled;
}

/**
 * createCameraTimeline().sample(scrollY) remeasures real document landmarks.
 * Pass the returned object unchanged to cosmos.setScene(), and use its
 * night/blur/wash for CSS. DOM pin progress remains owned by its own scene.
 */
export function createCameraTimeline(options={}){
  const doc=options.document||document;
  const win=options.window||doc.defaultView||window;
  const isPinned=options.isPinned||(()=>doc.documentElement.classList.contains('motion-layout'));
  let keyframes=[],measured=[],signature='',maxScroll=0,viewport=1;
  let worldStart=0,worldTravel=0,worldCount=1,totalWorldUnits=1;

  function measure(element){
    if(!element)return null;
    const rect=element.getBoundingClientRect();
    const top=rect.top+win.scrollY;
    return {element,top,height:rect.height,bottom:top+rect.height};
  }
  function worldUnit(predicate){
    let low=0,high=totalWorldUnits;
    for(let i=0;i<36;i++){
      const midpoint=(low+high)/2;
      if(predicate(worldFrame(midpoint,worldCount)))high=midpoint;else low=midpoint;
    }
    return high;
  }
  function refresh(){
    viewport=Math.max(1,win.innerHeight);
    maxScroll=Math.max(0,doc.documentElement.scrollHeight-viewport);
    measured=sceneIds.map(id=>({id,...measure(doc.getElementById(id))})).filter(item=>item.element);
    const byId=Object.fromEntries(measured.map(item=>[item.id,item]));
    const pinned=!!isPinned();
    const yigoStory=measure(doc.querySelector('#aelin-story, #yigo .special-story'));
    const careerArrival=measure(doc.querySelector('.career-arrival'));
    worldCount=byId.works?.element.querySelectorAll('.career-project').length||1;
    totalWorldUnits=worldLength(worldCount);
    const nextSignature=JSON.stringify([viewport,maxScroll,pinned,worldCount,totalWorldUnits,...measured.flatMap(item=>[item.id,item.top,item.height]),yigoStory?.top,yigoStory?.height,careerArrival?.top]);
    if(signature===nextSignature)return;
    signature=nextSignature;
    const top=(id,fallback=maxScroll)=>clamp(byId[id]?.top??fallback,0,maxScroll);
    const release=(id)=>clamp((byId[id]?.bottom??maxScroll)-viewport,top(id),maxScroll);
    const nodes=[];
    const add=(at,name,night=0,blur=0,wash=0)=>nodes.push({at:clamp(at,0,maxScroll),name,...frame(name,night,blur,wash)});

    add(0,'hero');
    add(top('perspective'),'perspective',0,4,.28);
    worldStart=top('works');
    worldTravel=pinned?Math.max(0,release('works')-worldStart):Math.max(0,top('yigo')-worldStart);
    add(worldStart,'intro',0,1,.12);
    if(pinned&&worldTravel>0){
      const atUnit=unit=>worldStart+worldTravel*unit/totalWorldUnits;
      const startTile=worldUnit(state=>phaseRank[state.phase]>=1);
      const finishTile=worldUnit(state=>phaseRank[state.phase]+state.progress>=2);
      const startFocus=worldUnit(state=>phaseRank[state.phase]>=2);
      const startCards=worldUnit(state=>phaseRank[state.phase]>=3);
      const settleCards=worldUnit(state=>state.phase==='cards'&&state.progress>=.22);
      add(atUnit(startTile),'rightEntry',0,1,.12);
      add(atUnit(finishTile),'tiles',0,1,.12);
      add(atUnit(startFocus),'tiles',0,1,.12);
      add(atUnit(startCards),'focus',0,1,.12);
      add(atUnit(settleCards),'cards',0,1,.12);
      add(release('works'),'cards',0,1,.12);
    }else{
      // In the normal document flow there is no artificial multi-screen pin.
      add(worldStart+worldTravel*.15,'cards',0,1,.12);
      add(worldStart+worldTravel*.85,'cards',0,1,.12);
    }

    const yigoStart=top('yigo');
    const discoverStart=top('discover');
    const videoEnd=yigoStory?clamp(yigoStory.bottom-viewport,yigoStart,discoverStart):mix(yigoStart,discoverStart,.7);
    add(yigoStart,'yigoEntry',.7,0,0);
    add(videoEnd,'yigo',0,0,0);
    add(discoverStart,'yigo',0,1,.12);
    const discoverRelease=pinned?release('discover'):mix(discoverStart,top('threshold'),.72);
    add(mix(discoverStart,discoverRelease,.2),'discover',0,1,.12);
    add(discoverRelease,'discover',0,1,.12);

    // Discover's actual release viewport is the approach, not an obsolete intro.
    const passageStart=pinned?top('threshold'):Math.max(discoverRelease+1,top('threshold')-viewport*.35);
    add(passageStart,'nightClose',1,18,0);
    const careerStart=top('career-history');
    const passagePinEnd=pinned?release('threshold'):careerStart;
    const passageEnd=passagePinEnd>passageStart?passagePinEnd:careerStart;
    // No initial hold or second zoom-in: zoom-out begins at passage entry.
    const careerRevealAt=pinned?mix(passageStart,passageEnd,.62):Math.max(passageStart+1,Math.min(careerStart,(careerArrival?.top??careerStart)-viewport*.25));
    add(careerRevealAt,'career',0,0,.35);
    if(pinned){
      add(mix(passageStart,passageEnd,.80),'careerReveal',0,0,.26);
      add(passageEnd,'careerRelease',0,0,.32);
      add(careerStart,'careerSettled',0,0,.4);
    }else add(careerStart,'career',0,0,.4);
    add(top('lab'),'careerEnd',0,4,.35);

    // The short footer gets a measured portion of the actual remaining scroll.
    // It never attempts to run its entire path in height-minus-viewport = 1px.
    const labStart=top('lab');
    const aboutStart=top('about');
    const tailStart=Math.max(labStart,Math.min(aboutStart,maxScroll-Math.min(viewport*.8,maxScroll-labStart)));
    add(tailStart,'lab',0,5,.3);
    const linksVisible=clamp((byId.links?.top??maxScroll)-viewport*.5,tailStart,maxScroll);
    const aboutArrival=Math.max(mix(tailStart,maxScroll,.55),Math.min(linksVisible,mix(tailStart,maxScroll,.75)));
    add(aboutArrival,'about',0,5,.3);
    add(maxScroll,'links',0,1,.1);

    nodes.sort((a,b)=>a.at-b.at);
    keyframes=[];
    for(const node of nodes){
      if(keyframes.length&&Math.abs(node.at-keyframes.at(-1).at)<.001)keyframes[keyframes.length-1]=node;
      else keyframes.push(node);
    }
  }
  function sample(value=win.scrollY){
    refresh();
    const y=clamp(Number.isFinite(value)?value:0,0,maxScroll);
    const visual=sampleCameraKeyframes(keyframes,y);
    let index=0;
    for(let i=0;i<measured.length;i++)if(measured[i].top<=y)index=i;
    const section=measured[index];
    let id=semanticId(section?.id||'top');
    const start=clamp(section?.top||0,0,maxScroll);
    const end=clamp(measured[index+1]?.top??maxScroll,start,maxScroll);
    let progress=end>start?clamp((y-start)/(end-start)):1,worldPhase='intro';
    if(id==='works'){
      const current=isPinned()&&worldTravel>0?worldFrame(clamp((y-worldStart)/worldTravel)*totalWorldUnits,worldCount):{phase:'cards',progress:1};
      progress=current.progress;worldPhase=current.phase;
    }
    if(y>=maxScroll&&maxScroll>0){id='links';progress=1;}
    return {...visual,id,progress,worldPhase,scroll:y,maxScroll,timeline:true};
  }
  return {sample,refresh,getLandmarks(){refresh();return keyframes.map(node=>({...node,position:node.position.slice(),target:node.target.slice(),mobileTarget:node.mobileTarget.slice()}));}};
}
