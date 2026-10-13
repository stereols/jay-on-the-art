import * as THREE from './vendor/three.module.js';

// Original procedural scene. No screenshot or generated still is used as 3D geometry.
// The static concept image is a separate, accessible rendering fallback in CSS.
export function createCosmos(canvas, options = {}) {
  const renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
  renderer.setClearColor(0xf5f4f0,0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38,1,.1,90);
  const universe = new THREE.Group();
  scene.add(universe);
  const mobile = () => innerWidth < 760;
  let seed = 39261;
  const random = () => { seed=(seed*1664525+1013904223)>>>0; return seed/4294967296; };
  const TAU = Math.PI*2;
  const colors = {teal:0x77aaa5,lilac:0xb9a8cd,coral:0xdca38e,pearl:0xece6d8,gold:0xc6a66c};
  const shaderUniforms=[];
  const orbiters=[];
  const planets=[];

  const noise = /* glsl */`
    float hash(vec3 p){p=fract(p*.3183099+vec3(.17,.23,.31));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
    float noise3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
    float fbm(vec3 p){float f=0.;float a=.5;for(int i=0;i<4;i++){f+=a*noise3(p);p=p*2.03+vec3(2.7,3.1,1.2);a*=.5;}return f;}
  `;
  function pearlMaterial(tint,offset,detail=1) {
    const uniforms={uTint:{value:new THREE.Color(tint)},uTime:{value:0},uOffset:{value:offset},uDetail:{value:detail}};
    shaderUniforms.push(uniforms);
    return new THREE.ShaderMaterial({uniforms,
      vertexShader:/* glsl */`
        varying vec3 vPosition;varying vec3 vNormal;varying vec3 vView;
        void main(){vPosition=position;vNormal=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vView=-mv.xyz;gl_Position=projectionMatrix*mv;}
      `,
      fragmentShader:/* glsl */`
        uniform vec3 uTint;uniform float uTime,uOffset,uDetail;
        varying vec3 vPosition,vNormal,vView;
        ${noise}
        void main(){
          vec3 p=normalize(vPosition);
          vec3 q=vec3(fbm(p*3.3+uOffset),fbm(p*3.3+vec3(4.1,8.3,2.7)),fbm(p*3.3+vec3(9.2,2.1,5.8)));
          float terrain=fbm(p*4.8+q*3.5+uOffset);
          float cells=fbm(p*12.0+q*5.0+uOffset);
          float vein=1.-smoothstep(.005,.027,abs(cells-.46));
          float micro=fbm(p*65.0+q*5.);
          float striation=.5+.5*sin(terrain*48.+p.y*11.+q.x*6.);
          vec3 cream=vec3(.88,.86,.78);
          vec3 mineral=mix(uTint*.52,uTint*1.2,smoothstep(.25,.66,terrain));
          vec3 base=mix(mineral,cream,smoothstep(.51,.73,terrain));
          base=mix(base,vec3(.77,.60,.33),vein*.27*uDetail);
          base*=.87+micro*.19+striation*.07;
          vec3 N=normalize(vNormal);vec3 V=normalize(vView);vec3 L=normalize(vec3(-.7,1.1,1.6));
          float diffuse=max(dot(N,L),0.);
          float fresnel=pow(1.-max(dot(N,V),0.),3.);
          float sheen=pow(max(dot(reflect(-L,N),V),0.),35.);
          float broad=pow(max(dot(N,normalize(L+V)),0.),6.);
          vec3 iridescent=.5+.5*cos(vec3(0.,2.1,4.2)+dot(N,V)*8.+terrain*4.);
          vec3 color=base*(.27+diffuse*.81)+vec3(1.,.96,.84)*sheen*.65+vec3(.22,.24,.22)*broad;
          color=mix(color,vec3(.91,.94,.90),fresnel*.58);
          color+=iridescent*fresnel*.09;
          color+=vein*vec3(.18,.12,.035)*max(diffuse,.1)*uDetail;
          gl_FragColor=vec4(color,1.);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `});
  }
  const sphereGeometry=new THREE.SphereGeometry(1,96,64);
  const smallGeometry=new THREE.SphereGeometry(1,40,28);
  function makePlanet(position,radius,tint,offset,detail=1) {
    const group=new THREE.Group();group.position.set(...position);
    const surface=new THREE.Mesh(radius>.9?sphereGeometry:smallGeometry,pearlMaterial(tint,offset,detail));
    surface.scale.setScalar(radius);group.add(surface);
    universe.add(group);planets.push({group,surface,baseY:position[1],radius});
    return group;
  }
  const main=makePlanet([2.35,.14,0],1.66,colors.teal,1.8,1);
  makePlanet([-.2,1.7,-3.8],.59,colors.lilac,4.1,.5);
  makePlanet([4.9,2.6,-3.3],.63,colors.pearl,8.1,.7);
  makePlanet([.1,-2.55,-1.1],.63,colors.coral,11.1,.8);
  makePlanet([5.6,-2.9,-1.8],1.12,colors.lilac,7.4,.75);
  makePlanet([-6,4,-12],.42,colors.teal,3.2,.2);
  // Chapter worlds form a two-column constellation; the camera follows its route.
  makePlanet([7.4,.2,-2.8],1.16,colors.coral,17.2,.8);
  const nightWorld=makePlanet([7.1,-6.1,-2.8],1.7,0x8899bd,23.7,1);
  makePlanet([4.3,-4.7,-4.9],.41,colors.gold,21.2,.5);
  makePlanet([-4.5,-5.2,-3.1],1.52,colors.teal,13.7,1);
  makePlanet([-4.2,-11.4,-2.8],1.35,colors.lilac,28.3,.8);
  makePlanet([5.9,-11.4,-2.6],1.6,colors.pearl,32.8,1);
  const nightRing=new THREE.Mesh(new THREE.TorusGeometry(2.15,.008,8,220),new THREE.MeshBasicMaterial({color:0xbcb1ce,transparent:true,opacity:.7}));
  nightRing.rotation.set(.8,.2,-.5);nightWorld.add(nightRing);

  // A transparent, asymmetrically ribbed crystal envelope around the hero world.
  const shellGeo=new THREE.SphereGeometry(1,128,80);
  const shellPos=shellGeo.attributes.position;
  const v=new THREE.Vector3();
  for(let i=0;i<shellPos.count;i++){
    v.fromBufferAttribute(shellPos,i);
    const theta=Math.atan2(v.z,v.x), phi=Math.acos(THREE.MathUtils.clamp(v.y,-1,1));
    const petals=Math.pow(Math.abs(Math.sin(theta*4.+phi*2.3)),7)*Math.pow(Math.sin(phi),2);
    const r=1.705+petals*.21;
    v.multiplyScalar(r);shellPos.setXYZ(i,v.x,v.y,v.z);
  }
  shellGeo.computeVertexNormals();
  const shell=new THREE.Mesh(shellGeo,new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.FrontSide,uniforms:{},
    vertexShader:`varying vec3 vNormal;varying vec3 vView;varying vec3 vP;void main(){vP=position;vNormal=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vView=-mv.xyz;gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`varying vec3 vNormal,vView,vP;void main(){float f=pow(1.-abs(dot(normalize(vNormal),normalize(vView))),3.);float t=.5+.5*sin(vP.y*4.+vP.x*2.);vec3 c=mix(vec3(.70,.83,.82),vec3(.92,.79,.63),t);gl_FragColor=vec4(c,.04+f*.43);#include <colorspace_fragment>}`.replace(';#include',';\n#include')
  }));main.add(shell);

  // Raised crystal membranes share a radial origin, like an asymmetrical living seed.
  // Their geometry, ribbing and shadows remain dimensional as the camera moves.
  const corolla=new THREE.Group();corolla.rotation.set(.82,.30,-.48);main.add(corolla);
  const membraneMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,
    vertexShader:`varying vec2 vUv;varying vec3 vN,vV;void main(){vUv=uv;vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vV=-mv.xyz;gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`varying vec2 vUv;varying vec3 vN,vV;void main(){float f=pow(1.-abs(dot(normalize(vN),normalize(vV))),2.5);float edge=pow(abs(vUv.y*2.-1.),12.);float rib=pow(.5+.5*cos(vUv.y*23.+vUv.x*13.),20.);vec3 pearl=mix(vec3(.65,.80,.79),vec3(.87,.75,.69),vUv.x);pearl=mix(pearl,vec3(.96,.94,.83),edge*.7+f*.3);gl_FragColor=vec4(pearl,.07+f*.35+edge*.39+rib*.025);#include <colorspace_fragment>}`.replace(';#include',';\n#include')
  });
  const membraneLines=[];
  function petalPoint(u,v,angle,width){
    const phi=.07+u*2.30;
    const theta=angle+v*width*Math.pow(Math.sin(u*Math.PI),.85)+.17*Math.sin(phi*2.);
    const r=1.73+.24*Math.sin(u*Math.PI)*Math.cos(v*Math.PI*.5)+.012*Math.cos(v*20.)*Math.sin(u*Math.PI);
    return new THREE.Vector3(r*Math.sin(phi)*Math.cos(theta),r*Math.cos(phi),r*Math.sin(phi)*Math.sin(theta));
  }
  for(let petal=0;petal<7;petal++){
    const angle=petal/7*TAU, width=.29+(petal%3)*.045;
    const positions=[],uvs=[],indices=[];const rows=54,cols=18;
    for(let row=0;row<=rows;row++)for(let col=0;col<=cols;col++){
      const u=row/rows,v=col/cols*2-1,p=petalPoint(u,v,angle,width);
      positions.push(p.x,p.y,p.z);uvs.push(u,col/cols);
      if(row<rows&&col<cols){const a=row*(cols+1)+col,b=a+cols+1;indices.push(a,b,a+1,b,b+1,a+1);}
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();corolla.add(new THREE.Mesh(geo,membraneMaterial));
    for(const side of [-1,0,1])for(let i=1;i<=84;i++){
      const a=petalPoint((i-1)/84,side,angle,width).multiplyScalar(1.002),b=petalPoint(i/84,side,angle,width).multiplyScalar(1.002);
      membraneLines.push(a.x,a.y,a.z,b.x,b.y,b.z);
    }
    for(let branch=1;branch<13;branch++)for(const side of [-1,1])for(let k=1;k<=20;k++){
      const t=(k-1)/20,t2=k/20,u=branch/14;
      const a=petalPoint(u+t*.08,t*side,angle,width).multiplyScalar(1.003),b=petalPoint(u+t2*.08,t2*side,angle,width).multiplyScalar(1.003);
      membraneLines.push(a.x,a.y,a.z,b.x,b.y,b.z);
    }
  }
  const membraneLineGeo=new THREE.BufferGeometry();membraneLineGeo.setAttribute('position',new THREE.Float32BufferAttribute(membraneLines,3));
  corolla.add(new THREE.LineSegments(membraneLineGeo,new THREE.LineBasicMaterial({color:0xd6c09a,transparent:true,opacity:.57,depthWrite:false})));

  function lineGeometry(segments) {
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(segments,3));
    return geometry;
  }
  const filaments=[];
  function addSegment(list,a,b){list.push(a.x,a.y,a.z,b.x,b.y,b.z);}
  // Flow lines follow the sphere's curved surface; fine branches give it organic detail.
  for(let j=0;j<62;j++){
    const longitude=random()*TAU;
    const phase=random()*TAU;
    let previous=null;
    for(let i=0;i<=76;i++){
      const t=i/76;
      const phi=.18+t*2.78;
      const theta=longitude+Math.sin(phi*3.+phase)*.16+Math.sin(phi*9.+phase)*.024;
      const r=1.67+Math.sin(t*Math.PI)*.008;
      const point=new THREE.Vector3(r*Math.sin(phi)*Math.cos(theta),r*Math.cos(phi),r*Math.sin(phi)*Math.sin(theta));
      if(previous)addSegment(filaments,previous,point);
      if(i%18===0&&i>0){const branch=point.clone().multiplyScalar(1.012);branch.y+=.09;branch.x+=.04;addSegment(filaments,point,branch);}
      previous=point;
    }
  }
  main.add(new THREE.LineSegments(lineGeometry(filaments),new THREE.LineBasicMaterial({color:0xc7b386,transparent:true,opacity:.34,depthWrite:false})));

  const seedGeo=new THREE.SphereGeometry(1,8,6);
  const beadMaterial=new THREE.MeshBasicMaterial({color:0xe4c794,transparent:true,opacity:.78});
  const beads=new THREE.InstancedMesh(seedGeo,beadMaterial,380);
  const dummy=new THREE.Object3D();
  for(let i=0;i<380;i++){
    const theta=random()*TAU, z=random()*2-1, r=Math.sqrt(1-z*z);
    dummy.position.set(r*Math.cos(theta)*1.687,z*1.687,r*Math.sin(theta)*1.687);
    dummy.scale.setScalar(.004+random()*.011);dummy.updateMatrix();beads.setMatrixAt(i,dummy.matrix);
  }
  main.add(beads);

  // Inclined, layered orbits connect the worlds with long, continuous curves.
  const ringSystem=new THREE.Group();ringSystem.rotation.set(.48,.15,-.38);main.add(ringSystem);
  const ringSegments=[];
  for(let j=0;j<13;j++){
    const radius=2.20+j*.018;
    let previous=null;
    for(let i=0;i<=280;i++){
      const t=i/280*TAU;
      const point=new THREE.Vector3(Math.cos(t)*radius,Math.sin(t)*radius*.49,Math.sin(t*3+j*.15)*.022+Math.sin(t)*.13);
      if(previous)addSegment(ringSegments,previous,point);previous=point;
    }
  }
  ringSystem.add(new THREE.LineSegments(lineGeometry(ringSegments),new THREE.LineBasicMaterial({color:0xbaa578,transparent:true,opacity:.38,depthWrite:false})));
  const orbitalParticles=[];
  for(let i=0;i<220;i++){
    const t=random()*TAU,r=2.20+random()*.24;
    orbitalParticles.push(Math.cos(t)*r,Math.sin(t)*r*.49,Math.sin(t)*.13+(random()-.5)*.035);
  }
  const ringDots=new THREE.BufferGeometry();ringDots.setAttribute('position',new THREE.Float32BufferAttribute(orbitalParticles,3));
  ringSystem.add(new THREE.Points(ringDots,new THREE.PointsMaterial({color:0xd3bc8c,size:.018,transparent:true,opacity:.8,depthWrite:false})));
  for(let i=0;i<3;i++){
    const dot=new THREE.Mesh(new THREE.SphereGeometry(.035+i*.009,16,12),pearlMaterial(i===1?colors.coral:colors.pearl,i*3,.2));
    ringSystem.add(dot);orbiters.push({mesh:dot,phase:i*2.1,radius:2.24+i*.055});
  }

  // Two streams of fine mineral dust form a wide galactic arc with visible depth.
  const galaxyPositions=[],galaxyColors=[],galaxySizes=[];
  const palette=[0x90b5ad,0xc4b3cf,0xddb8a2,0xd6c7a6,0xe6e8db].map(c=>new THREE.Color(c));
  const count=mobile()?3300:6200;
  for(let i=0;i<count;i++){
    const t=random()*TAU, band=i%2;
    const radius=4.0+random()*1.8;
    const spread=(random()-.5)*.4;
    const x=1.7+Math.cos(t)*radius;
    const y=Math.sin(t)*radius*.38+Math.cos(t)*1.32+spread+(band?-.27:.22);
    const z=-2.6+Math.sin(t)*2.3+(random()-.5)*.7;
    galaxyPositions.push(x,y,z);
    const color=palette[Math.floor(random()*palette.length)];galaxyColors.push(color.r,color.g,color.b);
    galaxySizes.push(.4+Math.pow(random(),5)*2.0);
  }
  const galaxyGeo=new THREE.BufferGeometry();
  galaxyGeo.setAttribute('position',new THREE.Float32BufferAttribute(galaxyPositions,3));
  galaxyGeo.setAttribute('color',new THREE.Float32BufferAttribute(galaxyColors,3));
  galaxyGeo.setAttribute('aSize',new THREE.Float32BufferAttribute(galaxySizes,1));
  const galaxyMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,vertexColors:true,uniforms:{uPixelRatio:{value:1}},
    vertexShader:`attribute float aSize;uniform float uPixelRatio;varying vec3 vColor;void main(){vColor=color;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=clamp(aSize*uPixelRatio*18./-mv.z,1.,9.);gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`varying vec3 vColor;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;float a=pow(1.-d*2.,1.6)*.70;gl_FragColor=vec4(vColor,a);#include <colorspace_fragment>}`.replace(';#include',';\n#include')
  });
  const galaxy=new THREE.Points(galaxyGeo,galaxyMat);universe.add(galaxy);

  const longLines=[];
  for(let j=0;j<16;j++){
    let previous=null;
    for(let i=0;i<=200;i++){
      const t=i/200*TAU;
      const r=4.2+j*.023;
      const point=new THREE.Vector3(1.7+Math.cos(t)*r,Math.sin(t)*r*.38+Math.cos(t)*1.32+j*.012,-2.6+Math.sin(t)*2.3);
      if(previous)addSegment(longLines,previous,point);previous=point;
    }
  }
  universe.add(new THREE.LineSegments(lineGeometry(longLines),new THREE.LineBasicMaterial({color:0xc7c8b4,transparent:true,opacity:.18,depthWrite:false})));

  // Keyframes are tied to narrative chapters, not absolute document pixel lengths.
  const frames=[
    {c:[0,.2,9.1],t:[0,0,0],r:[0,0,0]},
    {c:[.6,.4,8.1],t:[1,0,0],r:[0,0,0]},
    {c:[8,1.5,10.2],t:[6.1,.1,-2],r:[0,0,0]},
    {c:[5.6,-2.9,.5],t:[5.6,-2.9,-1.8],r:[0,0,0]},
    {c:[8,-5.4,7.7],t:[6,-5.5,-2.5],r:[0,0,0]},
    {c:[-3.1,-5.3,10.8],t:[-4,-5.5,-2],r:[0,0,0]},
    {c:[-3.1,-11,10.1],t:[-4,-10.6,-2],r:[0,0,0]},
    {c:[6,-11.3,9.4],t:[5,-10.8,-2],r:[0,0,0]},
    {c:[.2,-5.5,19],t:[1,-5,-3],r:[0,0,0]}
  ];
  let progress=0,current=0,paused=!!options.paused,reducedMotion=!!options.reducedMotion;
  let time=0,previousTime=0,lastDraw=0,raf=0,disposed=false,dirty=true,contextLost=false,drawCount=0;
  const pointer=new THREE.Vector2(),softPointer=new THREE.Vector2();
  const target=new THREE.Vector3();
  function onPointer(e){if(!paused&&!reducedMotion){pointer.set(e.clientX/innerWidth-.5,e.clientY/innerHeight-.5);dirty=true;}}
  function onPointerLeave(){pointer.set(0,0);}
  function resize(){
    const ratio=Math.min(devicePixelRatio||1,mobile()?1.4:1.6);
    renderer.setPixelRatio(ratio);renderer.setSize(innerWidth,innerHeight,false);
    camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
    galaxyMat.uniforms.uPixelRatio.value=ratio;
    dirty=true;renderFrame();
  }
  function updateCamera(){
    const stage=reducedMotion?0:current;
    const a=frames[Math.min(frames.length-1,Math.floor(stage))];
    const b=frames[Math.min(frames.length-1,Math.floor(stage)+1)];
    const f=stage%1;
    const lerp=(x,y)=>THREE.MathUtils.lerp(x,y,f);
    camera.position.set(lerp(a.c[0],b.c[0]),lerp(a.c[1],b.c[1]),lerp(a.c[2],b.c[2]));
    target.set(lerp(a.t[0],b.t[0]),lerp(a.t[1],b.t[1]),lerp(a.t[2],b.t[2]));
    if(mobile()){
      camera.position.z+=4.6;
      if(stage<1){target.x+=1.3;target.y-=2.1;}
      universe.position.set(0,0,0);
    }else{universe.position.set(0,0,0);}
    camera.position.x+=softPointer.x*.7;camera.position.y-=softPointer.y*.5;
    target.x-=softPointer.x*.14;target.y+=softPointer.y*.12;
    camera.lookAt(target);
    universe.rotation.set(lerp(a.r[0],b.r[0]),lerp(a.r[1],b.r[1]),lerp(a.r[2],b.r[2]));
  }
  function renderFrame(){
    if(disposed||contextLost)return;
    updateCamera();
    main.rotation.y=time*.027+softPointer.x*.06;
    main.rotation.x=softPointer.y*.045;
    shell.rotation.y=-time*.015;
    planets.forEach((planet,i)=>{if(i>0){planet.surface.rotation.y=time*.018*(i%2?1:-1);planet.group.position.y=planet.baseY+Math.sin(time*.13+i)*.035;}});
    orbiters.forEach(o=>{const t=o.phase+time*.04;o.mesh.position.set(Math.cos(t)*o.radius,Math.sin(t)*o.radius*.49,Math.sin(t)*.13);});
    renderer.render(scene,camera);
    canvas.dataset.scene=String(current.toFixed(3));
    canvas.dataset.frame=String(++drawCount);
  }
  function tick(now){
    if(disposed)return;
    raf=requestAnimationFrame(tick);
    if(document.hidden){previousTime=now;return;}
    if(now-lastDraw<1000/45)return;
    const dt=Math.min((now-previousTime)/1000,.07)||0;previousTime=now;lastDraw=now;
    if(!paused&&!reducedMotion){
      time+=dt;current=THREE.MathUtils.damp(current,progress,4.4,dt);
      softPointer.lerp(pointer,.07);dirty=true;
    }
    if(dirty){renderFrame();dirty=false;}
  }
  const onLost = event => {
    event.preventDefault();contextLost=true;cancelAnimationFrame(raf);
    document.documentElement.classList.remove('webgl-ready');
    document.documentElement.dataset.renderMode='fallback';
    document.dispatchEvent(new CustomEvent('cosmos-render-state',{detail:'fallback'}));
  };
  const onRestored = () => {contextLost=false;dirty=true;previousTime=0;document.documentElement.classList.add('webgl-ready');document.documentElement.dataset.renderMode='webgl';document.dispatchEvent(new CustomEvent('cosmos-render-state',{detail:'webgl'}));raf=requestAnimationFrame(tick);};
  canvas.addEventListener('webglcontextlost',onLost);
  canvas.addEventListener('webglcontextrestored',onRestored);
  addEventListener('pointermove',onPointer,{passive:true});
  document.addEventListener('pointerleave',onPointerLeave);
  addEventListener('resize',resize,{passive:true});
  resize();
  document.documentElement.classList.add('webgl-ready');
  document.documentElement.dataset.renderMode='webgl';
  raf=requestAnimationFrame(tick);
  return {
    setProgress(value){progress=THREE.MathUtils.clamp(value,0,frames.length-1);},
    setPaused(value){paused=value;dirty=true;canvas.dataset.motion=paused?'paused':'playing';},
    setReducedMotion(value){reducedMotion=value;current=value?0:progress;dirty=true;},
    dispose(){disposed=true;cancelAnimationFrame(raf);removeEventListener('pointermove',onPointer);removeEventListener('resize',resize);document.removeEventListener('pointerleave',onPointerLeave);canvas.removeEventListener('webglcontextlost',onLost);canvas.removeEventListener('webglcontextrestored',onRestored);scene.traverse(o=>{o.geometry?.dispose();if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());}});renderer.dispose();}
  };
}
