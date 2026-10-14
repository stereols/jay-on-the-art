import {clamp,ease} from './worlds.js';

// Both titles occupy one pin. The career list continues in normal document flow.
export function createExperience(section){
  const title=section.querySelector('.passage-heading');
  const arrival=section.querySelector('.career-arrival');
  let enabled=false;
  function update(){
    const p=clamp(-section.getBoundingClientRect().top/Math.max(1,section.offsetHeight-innerHeight));
    const titleAlpha=enabled?ease((p-.08)/.18)*(1-ease((p-.44)/.2)):1;
    const arrivalAlpha=enabled?ease((p-.51)/.2):1;
    section.style.setProperty('--passage-title',titleAlpha.toFixed(4));
    section.style.setProperty('--career-arrival',arrivalAlpha.toFixed(4));
    title.setAttribute('aria-hidden',String(enabled&&titleAlpha<.05));
    arrival.setAttribute('aria-hidden',String(enabled&&arrivalAlpha<.05));
  }
  function setEnabled(value){enabled=value;update();}
  return {update,setEnabled};
}
