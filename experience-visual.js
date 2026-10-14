import * as THREE from './vendor/three.module.js';

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

  const light = new THREE.Group();
  light.name = 'experience-hand-light';
  light.visible = false;
  scene.add(light);
  const pink = new THREE.Color('#FF616B');
  const glowMaterial = new THREE.ShaderMaterial({transparent:true, depthWrite:false,
    uniforms:{uTint:{value:pink},uAlpha:{value:0}},
    vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`uniform vec3 uTint;uniform float uAlpha;varying vec2 vUv;
      void main(){float d=length(vUv-.5)*2.;float halo=exp(-d*d*7.)*(1.-smoothstep(.7,1.,d));
      float core=exp(-d*d*120.);vec3 color=uTint;
      gl_FragColor=vec4(color,(halo*.27+core*.48)*uAlpha);
      #include <colorspace_fragment>
      }`});
  glowMaterial.userData.atmosphereAccent=true;
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(3.5,3.5),glowMaterial);
  light.add(glow);
  const centerMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,
    uniforms:{uTint:{value:pink},uAlpha:{value:0}},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`uniform vec3 uTint;uniform float uAlpha;varying vec2 vUv;
      void main(){float d=length(vUv-.5)*2.;float solid=1.-smoothstep(.55,1.,d);
      gl_FragColor=vec4(uTint,solid*.76*uAlpha);
      #include <colorspace_fragment>
      }`});
  centerMaterial.userData.atmosphereAccent=true;
  const centerPoint=new THREE.Mesh(new THREE.PlaneGeometry(.38,.38),centerMaterial);
  centerPoint.name='experience-fixed-point';
  centerPoint.position.z=.12;
  light.add(centerPoint);
  const arcs=[];
  for(let i=0;i<3;i++){
    const material=new THREE.MeshBasicMaterial({color:i===1?0xffc2c8:0xff616b,
      transparent:true,opacity:0,depthWrite:false,toneMapped:false});
    material.userData.atmosphereAccent=true;
    const arc = new THREE.Mesh(new THREE.TorusGeometry(.76+i*.1,.012-i*.002,6,96),material);
    light.add(arc);
    arcs.push(arc);
  }
  const sparks = [];
  const sparkGeometry = new THREE.SphereGeometry(.036,12,8);
  const sparkMaterial = new THREE.MeshBasicMaterial({color:0xffa3b2,transparent:true,opacity:0,toneMapped:false});
  sparkMaterial.userData.atmosphereAccent=true;
  for(let i=0;i<5;i++){const spark=new THREE.Mesh(sparkGeometry,sparkMaterial);light.add(spark);sparks.push(spark);}
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
    update({camera,experience={},time=0,paused=false,visibility=1,mobile=false}){
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
      glowMaterial.uniforms.uAlpha.value=alpha*(.84+Math.sin(time*1.8)*.08);
      centerMaterial.uniforms.uAlpha.value=alpha;
      arcs.forEach((arc,i)=>{
        arc.rotation.set(.4+i*.62,.65+i*.85,time*(i%2?-.32:.26)+i*1.9);
        arc.material.opacity=alpha*(i===1?.55:.82);
      });
      sparkMaterial.opacity=alpha*.9;
      sparks.forEach((spark,i)=>{const a=time*(.34+i*.03)+i*Math.PI*2/5;
        spark.position.set(Math.cos(a)*(.78+i*.045),Math.sin(a)*.7,Math.sin(a*2+i)*.38);});
      return true;
    },
    dispose(){disposed=true;scene.remove(portrait,light);texture.dispose();planeGeometry.dispose();portraitMaterial.dispose();
      glow.geometry.dispose();glowMaterial.dispose();arcs.forEach(arc=>{arc.geometry.dispose();arc.material.dispose();});
      centerPoint.geometry.dispose();centerMaterial.dispose();
      sparkGeometry.dispose();sparkMaterial.dispose();}
  };
}
