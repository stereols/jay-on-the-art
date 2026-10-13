import {clamp,ease} from './worlds.js';
// A single video connects full bleed, central headline, and framed exit.
export function specialFrame(progress){
 const p=clamp(progress);
 const entrance=ease((p-.12)/.22),exit=ease((p-.59)/.2);
 return {progress:p,title:entrance*(1-exit),rise:(1-entrance)*86-exit*28,shrink:ease((p-.57)/.35)};
}
export function createSpecialFilm(section){
 const story=section.querySelector('.special-story');
 let enabled=false;
 function update(){
  const p=clamp(-story.getBoundingClientRect().top/Math.max(1,story.offsetHeight-innerHeight));
  const frame=specialFrame(p);
  story.style.setProperty('--film-inset-x',`${frame.shrink*3}%`);
  story.style.setProperty('--film-inset-y',`${frame.shrink*7}%`);
  story.style.setProperty('--film-radius',`${frame.shrink*4}px`);
  story.style.setProperty('--film-title-alpha',enabled?frame.title:1);
  story.style.setProperty('--film-title-y',`${enabled?frame.rise:0}px`);
  story.style.setProperty('--film-shade',enabled?frame.title*.38:0);
  story.dataset.phase=!enabled?'static':p<.12?'film':p<.57?'title':p<.92?'return':'framed';
  return frame;
 }
 function setEnabled(value){enabled=value;update();}
 return {update,setEnabled};
}
