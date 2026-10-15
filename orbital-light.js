import * as THREE from './vendor/three.module.js';

// One effect, instantiated in world space for the planet and at the portrait's palm.
export function createOrbitalLight({name='orbital-light',layer=1,core=true,spherical=false,lineWeight=1}={}) {
  const light = new THREE.Group();
  light.name = name;
  light.visible = false;
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
    const arc = new THREE.Mesh(new THREE.TorusGeometry(.76+i*.1,(.012-i*.002)*lineWeight,6,96),material);
    light.add(arc);
    arcs.push(arc);
  }
  const sparks = [];
  // A translucent solid disk sits inside a wider, softly glowing halo.
  const sparkGeometry = new THREE.PlaneGeometry(.12,.12);
  const sparkMaterial = new THREE.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,
    uniforms:{uTint:{value:new THREE.Color(0xffa3b2)},uAlpha:{value:0}},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`uniform vec3 uTint;uniform float uAlpha;varying vec2 vUv;
      void main(){float d=length(vUv-.5)*2.;
      float solid=1.-smoothstep(.44,.48,d);
      float halo=exp(-d*d*4.)*(1.-smoothstep(.7,1.,d));
      float opacity=solid*.65+halo*.32*(1.-solid*.65);
      gl_FragColor=vec4(uTint,opacity*uAlpha);
      #include <colorspace_fragment>
      }`});
  sparkMaterial.userData.atmosphereAccent=true;
  for(let i=0;i<5;i++){const spark=new THREE.Mesh(sparkGeometry,sparkMaterial);light.add(spark);sparks.push(spark);}

  centerPoint.visible=core;
  light.traverse(object=>object.layers.set(layer));
  const inverseRotation=new THREE.Quaternion();
  const cameraRotation=new THREE.Quaternion();
  return {
    group:light,
    update({time=0,alpha=1,camera=null}={}) {
      light.visible=alpha>.001;
      if(!light.visible)return;
      if(camera){
        light.getWorldQuaternion(inverseRotation).invert();
        camera.getWorldQuaternion(cameraRotation);
        glow.quaternion.copy(inverseRotation).multiply(cameraRotation);
        centerPoint.quaternion.copy(glow.quaternion);
      }
      glowMaterial.uniforms.uAlpha.value=alpha*(.84+Math.sin(time*1.8)*.08);
      centerMaterial.uniforms.uAlpha.value=alpha;
      arcs.forEach((arc,i)=>{
        arc.rotation.set(.4+i*.62,.65+i*.85,time*(i%2?-.32:.26)+i*1.9);
        arc.material.opacity=alpha*(i===1?.55:.82);
      });
      sparkMaterial.uniforms.uAlpha.value=alpha*.9;
      sparks.forEach((spark,i)=>{
        const a=time*(.34+i*.03)+i*Math.PI*2/5;
        spark.position.set(Math.cos(a)*(.78+i*.045),Math.sin(a)*.7,Math.sin(a*2+i)*.38);
        if(spherical)spark.position.normalize().multiplyScalar(.86+i*.04);
        if(camera)spark.quaternion.copy(glow.quaternion);
      });
    },
    dispose(){
      light.removeFromParent();
      glow.geometry.dispose();glowMaterial.dispose();
      centerPoint.geometry.dispose();centerMaterial.dispose();
      arcs.forEach(arc=>{arc.geometry.dispose();arc.material.dispose();});
      sparkGeometry.dispose();sparkMaterial.dispose();
    }
  };
}
