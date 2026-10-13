import {clamp} from './worlds.js';
export const discoverFrame=progress=>({rail:clamp(progress)});
export function createDiscover(section){
 const navigation=section.querySelector('.discover-navigation');
 let enabled=false;
 navigation.tabIndex=-1;
 navigation.setAttribute('role','group');
 navigation.setAttribute('aria-label','개인 작품 탐색');
 const top=()=>section.getBoundingClientRect().top+scrollY;
 function update(progress){return discoverFrame(enabled?progress:0);}
 function setEnabled(value){enabled=value;}
 function cardPosition(index,count){return top()+clamp(index,0,count-1)/Math.max(1,count-1)*Math.max(0,section.offsetHeight-innerHeight);}
 function openFirst(){scrollTo({top:top(),behavior:'instant'});}
 return {update,setEnabled,cardPosition,openFirst};
}
