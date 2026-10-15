import * as THREE from './vendor/three.module.js';
import {createOrbitalLight} from './orbital-light.js';

// The portrait and its light occupy the same depth-tested scene as the planets
// and the moving thread. Alpha-tested pixels, never a rectangular matte, write depth.
export function createExperienceVisual(scene, onReady = () => {}) {
  const planeGeometry = new THREE.PlaneGeometry(1, 1);
  const portraitMaterial = new THREE.MeshBasicMaterial({transparent:true, alphaTest:.015,
    depthWrite:true, toneMapped:false, opacity:0});
  portraitMaterial.userData.atmosphereAccent = true;
  const portrait = new THREE.Mesh(planeGeometry, portraitMaterial);
  portrait.name = 'experience-portrait';
  portrait.visible = false;
  scene.add(portrait);
  let ready = false, disposed = false, displayedAlpha = 0, previousAlphaTime = null;
  const texture = new THREE.TextureLoader().load('assets/characters/jay-hero.webp', image => {
    if(disposed){image.dispose();return;}
    image.colorSpace = THREE.SRGBColorSpace;
    image.anisotropy = 4;
    portraitMaterial.map = image;
    portraitMaterial.needsUpdate = true;
    ready = true;
    onReady();
  });

  const handLight=createOrbitalLight({name:'experience-hand-light'});
  const light=handLight.group;
  scene.add(light);
  const point=new THREE.Vector3();
  portrait.layers.set(1);
  light.traverse(object=>object.layers.set(1));
  function place(object,x,y,depth,camera){
    const height=2*Math.tan(THREE.MathUtils.degToRad(camera.fov)*.5)*depth;
    point.set((x-.5)*height*camera.aspect,(.5-y)*height,-depth).applyMatrix4(camera.matrixWorld);
    object.position.copy(point);object.quaternion.copy(camera.quaternion);
    return height;
  }
  return {
    update({camera,experience={},time=0,effectTime=time,paused=false,visibility=1,mobile=false}){
      const rect=experience.portrait;
      const targetAlpha=experience.visible?Math.max(0,Math.min(1,experience.presence??experience.arrival??0))*visibility:0;
      const delta=previousAlphaTime===null?1/60:Math.min(.1,Math.max(0,time-previousAlphaTime));
      previousAlphaTime=time;
      displayedAlpha+=(targetAlpha-displayedAlpha)*(1-Math.exp(-delta/.1));
      const alpha=displayedAlpha;
      portrait.visible=ready&&!paused&&alpha>.001&&!!rect;
      light.visible=portrait.visible&&!!(experience.glow||experience.hand);
      if(!portrait.visible)return false;
      const height=place(portrait,rect.left+rect.width*.5,rect.top+rect.height*.5,8,camera);
      portrait.scale.set(rect.width*height*camera.aspect,rect.height*height,1);
      portraitMaterial.opacity=alpha;
      const anchor=experience.glow||experience.hand;
      const lightHeight=place(light,anchor.x,anchor.y,7.72,camera);
      const radius=Math.min(mobile?31:47,rect.height*innerHeight*.086);
      light.scale.setScalar(lightHeight*radius/innerHeight);
      handLight.update({time:effectTime,alpha});
      return true;
    },
    dispose(){disposed=true;scene.remove(portrait,light);texture.dispose();planeGeometry.dispose();portraitMaterial.dispose();
      handLight.dispose();}
  };
}
