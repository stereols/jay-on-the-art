import * as THREE from './vendor/three.module.js';
import {CAMERA_POSES} from './camera-timeline.js';
import {createLuminousTrail} from './cosmos-trail.js';
import {createExperienceVisual} from './experience-visual.js';
import {createCosmosCompositor} from './cosmos-compositor.js';
import {createOrbitalLight} from './orbital-light.js';

// Original procedural scene. No screenshot or generated still is used as 3D geometry.
// The static concept image is a separate, accessible rendering fallback in CSS.
export function createCosmos(canvas, options = {}) {
  const renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
  renderer.setClearColor(0xf6f1e8,0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  const compositor=createCosmosCompositor(renderer);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38,1,.1,90);
  const universe = new THREE.Group();
  scene.add(universe);
  const mobile = () => innerWidth < 760;
  let seed = 39261;
  const random = () => { seed=(seed*1664525+1013904223)>>>0; return seed/4294967296; };
  const TAU = Math.PI*2;
  const colors = {pink:0xff616b,teal:0x77aaa5,lilac:0xb9a8cd,coral:0xdca38e,pearl:0xece6d8,gold:0xc6a66c};
  const environment={uNight:{value:0},uFogColor:{value:new THREE.Color(0xf6f1e8)}};
  const daySky=new THREE.Color(0xf6f1e8),nightSky=new THREE.Color(0x02040d),sky=new THREE.Color();
  scene.fog=new THREE.Fog(daySky,19,60);
  const shaderUniforms=[];
  const orbiters=[];
  const planets=[];

  const noise = /* glsl */`
    float hash(vec3 p){p=fract(p*.3183099+vec3(.17,.23,.31));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
    float noise3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
    float fbm(vec3 p){float f=0.;float a=.5;for(int i=0;i<4;i++){f+=a*noise3(p);p=p*2.03+vec3(2.7,3.1,1.2);a*=.5;}return f;}
  `;
  function pearlMaterial(tint,offset,detail=1,brandPink=false) {
    const uniforms={...environment,uTint:{value:new THREE.Color(tint)},uOffset:{value:offset},uDetail:{value:detail},uBrandPink:{value:brandPink?1:0}};
    shaderUniforms.push(uniforms);
    return new THREE.ShaderMaterial({uniforms,
      vertexShader:/* glsl */`
        varying vec3 vPosition;varying vec3 vNormal;varying vec3 vView;
        void main(){vPosition=position;vNormal=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vView=-mv.xyz;gl_Position=projectionMatrix*mv;}
      `,
      fragmentShader:/* glsl */`
        uniform vec3 uTint,uFogColor;uniform float uNight,uOffset,uDetail,uBrandPink;
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
          vec3 cream=mix(vec3(.88,.86,.78),vec3(1.,.75,.73),uBrandPink);
          vec3 mineral=mix(uTint*.52,uTint*1.2,smoothstep(.25,.66,terrain));
          vec3 base=mix(mineral,cream,smoothstep(.51,.73,terrain));
          base=mix(base,mix(vec3(.77,.60,.33),vec3(.92,.36,.40),uBrandPink),vein*.27*uDetail);
          base*=.87+micro*.19+striation*.07;
          vec3 N=normalize(vNormal);vec3 V=normalize(vView);vec3 L=normalize(vec3(-.7,1.1,1.6));
          float diffuse=max(dot(N,L),0.);
          float fresnel=pow(1.-max(dot(N,V),0.),3.);
          float sheen=pow(max(dot(reflect(-L,N),V),0.),35.);
          float broad=pow(max(dot(N,normalize(L+V)),0.),6.);
          vec3 iridescent=.5+.5*cos(vec3(0.,2.1,4.2)+dot(N,V)*8.+terrain*4.);
          vec3 color=base*(.27+diffuse*.81)+vec3(1.,.96,.84)*sheen*.65+vec3(.22,.24,.22)*broad;
          color=mix(color,mix(vec3(.91,.94,.90),vec3(1.,.79,.82),uBrandPink),fresnel*.58);
          color+=mix(iridescent,vec3(.96,.27,.39),uBrandPink)*fresnel*.09;
          color+=vein*vec3(.18,.12,.035)*max(diffuse,.1)*uDetail;
          // The nocturnal view relights the actual relief rather than covering it.
          vec3 nightLight=normalize(vec3(-.86,.42,.13));
          float nightDiffuse=max(dot(N,nightLight),0.);
          float nightSpecular=pow(max(dot(reflect(-nightLight,N),V),0.),28.);
          vec3 midnight=mix(vec3(.018,.033,.084),vec3(.084,.045,.17),terrain);
          midnight=mix(midnight,mix(vec3(.06,.008,.025),vec3(.24,.025,.075),terrain),uBrandPink);
          vec3 nightColor=midnight*(.5+nightDiffuse*2.8)+uTint*nightDiffuse*.12;
          nightColor+=mix(vec3(.10,.48,.56),vec3(.85,.12,.25),uBrandPink)*fresnel*.72;
          nightColor+=mix(vec3(.46,.28,.69),vec3(.94,.35,.48),uBrandPink)*nightSpecular*.7;
          nightColor+=vein*mix(vec3(.025,.14,.20),vec3(.29,.025,.07),uBrandPink)*(.4+nightDiffuse)*uDetail;
          color=mix(color,nightColor*.62,uNight);
          float fog=smoothstep(17.,52.,length(vView))*uNight*.88;
          color=mix(color,uFogColor,fog);
          gl_FragColor=vec4(color,1.);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `});
  }
  const sphereGeometry=new THREE.SphereGeometry(1,96,64);
  const smallGeometry=new THREE.SphereGeometry(1,40,28);
  function makePlanet(position,radius,tint,offset,detail=1,brandPink=false) {
    const group=new THREE.Group();group.position.set(...position);
    const surface=new THREE.Mesh(radius>.9?sphereGeometry:smallGeometry,pearlMaterial(tint,offset,detail,brandPink));
    surface.scale.setScalar(radius);group.add(surface);
    universe.add(group);planets.push({group,surface,baseY:position[1],radius});
    return group;
  }
  const main=makePlanet([2.35,.14,0],1.66,colors.pink,1.8,1,true);
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
  const nightRingDay=new THREE.Color(0xbcb1ce),nightRingGlow=new THREE.Color(0x73bacb);
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
  const shell=new THREE.Mesh(shellGeo,new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.FrontSide,uniforms:{...environment},
    vertexShader:`varying vec3 vNormal;varying vec3 vView;varying vec3 vP;void main(){vP=position;vNormal=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vView=-mv.xyz;gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`uniform float uNight;varying vec3 vNormal,vView,vP;void main(){float f=pow(1.-abs(dot(normalize(vNormal),normalize(vView))),3.);float t=.5+.5*sin(vP.y*4.+vP.x*2.);vec3 c=mix(vec3(.94,.39,.47),vec3(1.,.77,.73),t);c=mix(c,mix(vec3(.65,.09,.23),vec3(.43,.10,.25),t),uNight);gl_FragColor=vec4(c,.04+f*.43);#include <colorspace_fragment>}`.replace(';#include',';\n#include')
  }));main.add(shell);

  // Raised crystal membranes share a radial origin, like an asymmetrical living seed.
  // Their geometry, ribbing and shadows remain dimensional as the camera moves.
  const corolla=new THREE.Group();corolla.rotation.set(.82,.30,-.48);main.add(corolla);
  const membraneMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{...environment},
    vertexShader:`varying vec2 vUv;varying vec3 vN,vV;void main(){vUv=uv;vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vV=-mv.xyz;gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`uniform float uNight;varying vec2 vUv;varying vec3 vN,vV;void main(){float f=pow(1.-abs(dot(normalize(vN),normalize(vV))),2.5);float edge=pow(abs(vUv.y*2.-1.),12.);float rib=pow(.5+.5*cos(vUv.y*23.+vUv.x*13.),20.);vec3 pearl=mix(vec3(.95,.37,.44),vec3(1.,.74,.72),vUv.x);pearl=mix(pearl,vec3(.96,.94,.83),edge*.7+f*.3);pearl=mix(pearl,vec3(.32,.04,.13)+vec3(.40,.10,.16)*(edge+f),uNight);gl_FragColor=vec4(pearl,.07+f*.35+edge*.39+rib*.025);#include <colorspace_fragment>}`.replace(';#include',';\n#include')
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
  corolla.add(new THREE.LineSegments(membraneLineGeo,new THREE.LineBasicMaterial({color:0xf2b5ad,transparent:true,opacity:.48,depthWrite:false})));

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
  main.add(new THREE.LineSegments(lineGeometry(filaments),new THREE.LineBasicMaterial({color:0xe7a09d,transparent:true,opacity:.32,depthWrite:false})));

  const seedGeo=new THREE.SphereGeometry(1,8,6);
  const beadMaterial=new THREE.MeshBasicMaterial({color:0xffc6ba,transparent:true,opacity:.74});
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
  ringSystem.add(new THREE.LineSegments(lineGeometry(ringSegments),new THREE.LineBasicMaterial({color:0xc98c93,transparent:true,opacity:.10,depthWrite:false})));
  const orbitalParticles=[];
  for(let i=0;i<220;i++){
    const t=random()*TAU,r=2.20+random()*.24;
    orbitalParticles.push(Math.cos(t)*r,Math.sin(t)*r*.49,Math.sin(t)*.13+(random()-.5)*.035);
  }
  const ringDots=new THREE.BufferGeometry();ringDots.setAttribute('position',new THREE.Float32BufferAttribute(orbitalParticles,3));
  ringSystem.add(new THREE.Points(ringDots,new THREE.PointsMaterial({color:0xf0b8ae,size:.018,transparent:true,opacity:.35,depthWrite:false})));
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
  const galaxyMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,vertexColors:true,uniforms:{...environment,uPixelRatio:{value:1}},
    vertexShader:`attribute float aSize;uniform float uPixelRatio;varying vec3 vColor;void main(){vColor=color;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=clamp(aSize*uPixelRatio*18./-mv.z,1.,9.);gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`uniform float uNight;varying vec3 vColor;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;float a=pow(1.-d*2.,1.6)*mix(.70,.95,uNight);vec3 c=mix(vColor,vColor*vec3(.42,.76,1.15),uNight);gl_FragColor=vec4(c,a);#include <colorspace_fragment>}`.replace(';#include',';\n#include')
  });
  const galaxy=new THREE.Points(galaxyGeo,galaxyMat);universe.add(galaxy);

  // Stars occupy multiple depths through the night chapter, so the passage has
  // real parallax and planet occlusion. Their brightness never flickers.
  const starPositions=[],starColors=[],starSizes=[];
  const starPalette=[0x83c8d0,0xc4b7eb,0xe4ddd3].map(c=>new THREE.Color(c));
  for(let i=0;i<(mobile()?850:1650);i++){
    starPositions.push((random()-.5)*42,-6+(random()-.5)*30,-5-random()*36);
    const tint=starPalette[i%starPalette.length];starColors.push(tint.r,tint.g,tint.b);
    starSizes.push(.35+Math.pow(random(),7)*2.3);
  }
  const starGeo=new THREE.BufferGeometry();
  starGeo.setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3));
  starGeo.setAttribute('color',new THREE.Float32BufferAttribute(starColors,3));
  starGeo.setAttribute('aSize',new THREE.Float32BufferAttribute(starSizes,1));
  const starMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,vertexColors:true,uniforms:{...environment,uPixelRatio:{value:1}},
    vertexShader:`attribute float aSize;uniform float uPixelRatio;varying vec3 vColor;varying float vDepth;void main(){vColor=color;vec4 mv=modelViewMatrix*vec4(position,1.);vDepth=-mv.z;gl_PointSize=clamp(aSize*uPixelRatio*32./max(1.,vDepth),.65,5.);gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`uniform float uNight;varying vec3 vColor;varying float vDepth;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;float a=pow(1.-2.*d,1.8)*uNight*(1.-smoothstep(30.,70.,vDepth)*.45);gl_FragColor=vec4(vColor,a);#include <colorspace_fragment>}`.replace(';#include',';\n#include')
  });
  const stars=new THREE.Points(starGeo,starMat);universe.add(stars);

  // This effect inherits the planet's center, rotation and camera perspective.
  // Layer 0 also gives its rings and glow the planet's own depth and blur pass.
  const planetLight=createOrbitalLight({name:'hero-planet-light',layer:0,core:false,spherical:true,lineWeight:.65});
  planetLight.group.scale.setScalar(2.55);
  main.add(planetLight.group);
  const lightFrustum=new THREE.Frustum(),lightProjection=new THREE.Matrix4();
  const lightBounds=new THREE.Sphere(new THREE.Vector3(),4.5);
  let lightTime=0;
  const trail=createLuminousTrail(scene);
  trail.group.traverse(object=>object.layers.set(1));
  const experienceVisual=createExperienceVisual(scene,()=>{
    document.documentElement.classList.add('experience-portrait-ready');dirty=true;
  });
  let atmosphereVisibility=1,atmosphereBlur=0,experienceState={},animationActive=true;
  main.traverse(object=>{if(object.material)object.material.userData.brandPink=true;});

  // Legacy stage coordinates remain available for older app.js callers.
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
  // Semantic endpoints are shared between adjacent scenes. Every camera and
  // object transform can be reconstructed from this absolute scroll state.
  const poses=CAMERA_POSES;
  const route=(...stops)=>stops.map(([at,name])=>({at,...poses[name]}));
  const routes={
    hero:route([0,'hero'],[1,'perspective']),
    perspective:route([0,'perspective'],[1,'intro']),
    yigo:route([0,'cards'],[.3,'yigoEntry'],[1,'yigo']),
    discover:route([0,'yigo'],[.25,'discover'],[.94,'discover'],[1,'nightClose']),
    passage:route([0,'nightClose'],[1,'career']),
    career:route([0,'career'],[1,'careerEnd']),
    lab:route([0,'careerEnd'],[1,'lab']),
    about:route([0,'lab'],[1,'about']),
    links:route([0,'about'],[1,'links'])
  };
  const worldRoutes={
    intro:route([0,'intro'],[1,'rightEntry']),
    tile:route([0,'rightEntry'],[1,'tiles']),
    focus:route([0,'tiles'],[1,'focus']),
    cards:route([0,'focus'],[.22,'cards'],[1,'cards'])
  };
  const validSceneIds=new Set(['hero','perspective','works','yigo','discover','passage','career','lab','about','links']);
  const clamp01=value=>THREE.MathUtils.clamp(Number.isFinite(value)?value:0,0,1);
  const smooth=(start,end,value)=>THREE.MathUtils.smoothstep(value,start,end);
  let progress=0,legacyMode=true,sceneState={id:'hero',progress:0,night:0,worldPhase:'intro'};
  let paused=!!options.paused,reducedMotion=!!options.reducedMotion;
  let previousTime=0,lastDraw=0,raf=0,disposed=false,dirty=true,contextLost=false,drawCount=0,poseReady=false,orbitPhase=0;
  const pointer=new THREE.Vector2(),softPointer=new THREE.Vector2();
  const target=new THREE.Vector3(),cameraBase=new THREE.Vector3(),targetBase=new THREE.Vector3();
  let mobileBaseZ=4.6,mobileBaseTarget=[0,0];
  const environmentMaterials=[];
  scene.traverse(object=>{
    const material=object.material;
    if(!material?.userData.atmosphereAccent&&(material?.isLineBasicMaterial||material?.isPointsMaterial||material?.isMeshBasicMaterial)){
      environmentMaterials.push({material,day:material.color.clone(),night:new THREE.Color(material.userData.brandPink?0xe97791:material.isLineBasicMaterial?0x659bad:0x9c9eda),opacity:material.opacity});
    }
  });
  function onPointer(e){if(!paused&&!reducedMotion){pointer.set(e.clientX/innerWidth-.5,e.clientY/innerHeight-.5);dirty=true;}}
  function onPointerLeave(){pointer.set(0,0);dirty=true;}
  function resize(){
    const ratio=Math.min(devicePixelRatio||1,mobile()?1.4:1.6);
    renderer.setPixelRatio(ratio);renderer.setSize(innerWidth,innerHeight,false);
    compositor.resize(innerWidth,innerHeight,ratio);
    camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
    galaxyMat.uniforms.uPixelRatio.value=ratio;
    starMat.uniforms.uPixelRatio.value=ratio;
    dirty=true;renderFrame();
  }
  function sampleRoute(stops,value){
    const p=clamp01(value);
    let index=0;
    while(index<stops.length-2&&p>stops[index+1].at)index++;
    const a=stops[index],b=stops[index+1];
    const mix=smooth(a.at,b.at,p);
    cameraBase.set(THREE.MathUtils.lerp(a.c[0],b.c[0],mix),THREE.MathUtils.lerp(a.c[1],b.c[1],mix),THREE.MathUtils.lerp(a.c[2],b.c[2],mix));
    targetBase.set(THREE.MathUtils.lerp(a.t[0],b.t[0],mix),THREE.MathUtils.lerp(a.t[1],b.t[1],mix),THREE.MathUtils.lerp(a.t[2],b.t[2],mix));
    orbitPhase=THREE.MathUtils.lerp(a.o,b.o,mix);
  }
  function resolvePose(){
    if(legacyMode){
      const stage=reducedMotion?0:progress;
      const index=Math.min(frames.length-2,Math.floor(stage));
      const a=frames[index],b=frames[index+1],f=stage-index;
      cameraBase.set(THREE.MathUtils.lerp(a.c[0],b.c[0],f),THREE.MathUtils.lerp(a.c[1],b.c[1],f),THREE.MathUtils.lerp(a.c[2],b.c[2],f));
      targetBase.set(THREE.MathUtils.lerp(a.t[0],b.t[0],f),THREE.MathUtils.lerp(a.t[1],b.t[1],f),THREE.MathUtils.lerp(a.t[2],b.t[2],f));
      orbitPhase=stage*.5;
    }else if(sceneState.pose&&!reducedMotion){
      cameraBase.fromArray(sceneState.pose.position);
      targetBase.fromArray(sceneState.pose.target);
      orbitPhase=sceneState.pose.orbit;
    }else if(reducedMotion){
      // Stable chapter compositions replace travel in the reduced-motion path.
      if(sceneState.id==='works')sampleRoute(worldRoutes.cards,1);
      else if(sceneState.id==='passage')sampleRoute(routes.passage,sceneState.progress<.8?.2:1);
      else sampleRoute(routes[sceneState.id],sceneState.id==='hero'?0:sceneState.id==='discover'?.25:1);
    }else{
      sampleRoute(sceneState.id==='works'?worldRoutes[sceneState.worldPhase]:routes[sceneState.id],sceneState.progress);
    }
    if(sceneState.pose&&!legacyMode&&!reducedMotion){
      mobileBaseZ=sceneState.pose.mobileZ;mobileBaseTarget=sceneState.pose.mobileTarget;
    }else{
      mobileBaseZ=sceneState.id==='passage'?2.2:4.6;
      mobileBaseTarget=(legacyMode?progress<1:sceneState.id==='hero')?[1.3,-2.1]:[0,0];
    }
    poseReady=true;
  }
  function updateEnvironment(){
    const night=legacyMode?0:sceneState.night;
    environment.uNight.value=night;
    sky.copy(daySky).lerp(nightSky,night);
    environment.uFogColor.value.copy(sky);
    renderer.setClearColor(sky,night);
    renderer.toneMappingExposure=THREE.MathUtils.lerp(1.12,.74,night);
    scene.fog.color.copy(sky);scene.fog.near=THREE.MathUtils.lerp(19,10,night);scene.fog.far=THREE.MathUtils.lerp(60,48,night);
    environmentMaterials.forEach(({material,day,night:nightTint,opacity})=>{
      material.color.copy(day).lerp(nightTint,night);
      material.opacity=Math.min(1,opacity*(1+night*.2));
    });
    stars.visible=night>.001;
    nightRing.material.color.copy(nightRingDay).lerp(nightRingGlow,night);
  }
  function updateCamera(){
    if(!paused||reducedMotion||!poseReady)resolvePose();
    camera.position.copy(cameraBase);target.copy(targetBase);
    if(mobile()){
      camera.position.z+=mobileBaseZ;
      target.x+=mobileBaseTarget[0];target.y+=mobileBaseTarget[1];
    }
    const reading=!legacyMode&&((sceneState.id==='works'&&sceneState.worldPhase==='cards')||['career','about','links'].includes(sceneState.id));
    const amplitude=paused||reducedMotion?0:sceneState.pose&&!legacyMode?sceneState.pose.pointerStrength:reading?.22:1;
    camera.position.x+=softPointer.x*.7*amplitude;camera.position.y-=softPointer.y*.5*amplitude;
    target.x-=softPointer.x*.14*amplitude;target.y+=softPointer.y*.12*amplitude;
    camera.lookAt(target);
    universe.position.set(0,0,0);universe.rotation.set(0,0,0);
  }
  function renderFrame(dt=0,time=performance.now()/1000){
    if(disposed||contextLost)return;
    updateCamera();
    updateEnvironment();
    main.rotation.y=orbitPhase*.12+softPointer.x*.04;
    main.rotation.x=softPointer.y*.03;
    shell.rotation.y=-orbitPhase*.08;
    planets.forEach((planet,i)=>{if(i>0){planet.surface.rotation.y=orbitPhase*.1*(i%2?1:-1);planet.group.position.y=planet.baseY+Math.sin(orbitPhase*.7+i)*.035;}});
    orbiters.forEach(o=>{const t=o.phase+orbitPhase*.22;o.mesh.position.set(Math.cos(t)*o.radius,Math.sin(t)*o.radius*.49,Math.sin(t)*.13);});
    camera.updateMatrixWorld();
    const moving=!paused&&!reducedMotion;
    if(moving)lightTime+=dt;
    main.getWorldPosition(lightBounds.center);
    lightProjection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
    lightFrustum.setFromProjectionMatrix(lightProjection);
    const planetLightVisible=lightFrustum.intersectsSphere(lightBounds)&&atmosphereVisibility>.001;
    planetLight.update({time:lightTime,alpha:planetLightVisible?atmosphereVisibility*(mobile()?.65:.82):0,camera});
    const trailActive=trail.update({camera,dt,
      visibility:atmosphereVisibility*(1-THREE.MathUtils.smoothstep(orbitPhase,2.60,2.7)),
      night:environment.uNight.value,mobile:mobile(),paused:!moving,pointer:softPointer});
    const portraitActive=experienceVisual.update({camera,experience:experienceState,time,effectTime:lightTime,
      paused:!moving,visibility:atmosphereVisibility,mobile:mobile()});
    animationActive=trailActive||portraitActive||(moving&&planetLightVisible);
    compositor.render(scene,camera,{blur:moving?atmosphereBlur:0});
    canvas.dataset.scene=legacyMode?String(progress.toFixed(3)):sceneState.id;
    canvas.dataset.progress=String((legacyMode?progress:sceneState.progress).toFixed(4));
    canvas.dataset.worldPhase=sceneState.worldPhase;
    canvas.dataset.night=String(environment.uNight.value.toFixed(4));
    canvas.dataset.camera=camera.position.toArray().map(value=>value.toFixed(3)).join(',');
    canvas.dataset.target=target.toArray().map(value=>value.toFixed(3)).join(',');
    canvas.dataset.orbit=orbitPhase.toFixed(5);
    canvas.dataset.timeline=String(!!sceneState.pose&&!legacyMode);
    canvas.dataset.atmosphere=atmosphereVisibility.toFixed(4);
    canvas.dataset.experienceEnergy=(experienceState.energy||0).toFixed(4);
    canvas.dataset.experienceProgress=(experienceState.progress||0).toFixed(4);
    canvas.dataset.frame=String(++drawCount);
  }
  function tick(now){
    if(disposed)return;
    raf=requestAnimationFrame(tick);
    if(document.hidden){previousTime=now;return;}
    if(now-lastDraw<1000/45)return;
    const dt=Math.min((now-previousTime)/1000,.07)||0;previousTime=now;lastDraw=now;
    if(!paused&&!reducedMotion&&softPointer.distanceToSquared(pointer)>.0000001){
      softPointer.lerp(pointer,1-Math.exp(-5.5*dt));dirty=true;
    }
    if(dirty||animationActive){renderFrame(dt,now/1000);dirty=false;}
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
  document.documentElement.classList.add('cosmos-composited');
  document.documentElement.dataset.renderMode='webgl';
  raf=requestAnimationFrame(tick);
  return {
    // Used once by the intro, before the browser clears the WebGL buffer.
    captureFrame(callback){if(disposed||contextLost)throw new Error('Cosmos frame unavailable');renderFrame();callback(canvas);},
    // Absolute timeline samples take priority over the legacy section routes.
    setScene(value={}){
      const id=validSceneIds.has(value.id)?value.id:'hero';
      const p=clamp01(value.progress);
      const nextScroll=Number.isFinite(value.scroll)?value.scroll:scrollY;
      const phase=Object.hasOwn(worldRoutes,value.worldPhase)?value.worldPhase:'intro';
      const automaticNight=id==='passage'?1-smooth(.2,.8,p):id==='discover'?smooth(.93,1,p):0;
      const night=Number.isFinite(value.night)?clamp01(value.night):automaticNight;
      const validVector=vector=>Array.isArray(vector)&&vector.length===3&&vector.every(Number.isFinite);
      const pose=validVector(value.position)&&validVector(value.target)&&Number.isFinite(value.orbit)?{
        position:value.position.slice(),target:value.target.slice(),orbit:value.orbit,
        mobileZ:Number.isFinite(value.mobileZ)?value.mobileZ:4.6,
        mobileTarget:Array.isArray(value.mobileTarget)&&value.mobileTarget.length===2&&value.mobileTarget.every(Number.isFinite)?value.mobileTarget.slice():[0,0],
        pointerStrength:Number.isFinite(value.pointerStrength)?clamp01(value.pointerStrength):1
      }:null;
      const previous=sceneState.pose;
      const poseChanged=!!pose!==!!previous||(pose&&previous&&(
        pose.position.some((v,i)=>v!==previous.position[i])||pose.target.some((v,i)=>v!==previous.target[i])||
        pose.orbit!==previous.orbit||pose.mobileZ!==previous.mobileZ||pose.pointerStrength!==previous.pointerStrength||
        pose.mobileTarget.some((v,i)=>v!==previous.mobileTarget[i])));
      if(legacyMode||id!==sceneState.id||p!==sceneState.progress||night!==sceneState.night||phase!==sceneState.worldPhase||poseChanged||nextScroll!==sceneState.scroll){
        sceneState={id,progress:p,night,worldPhase:phase,pose,scroll:nextScroll};legacyMode=false;dirty=true;
      }
    },
    // Film coverage is supplied by app.js so ornamental lines leave the stage
    // with the video instead of waiting for a chapter's semantic boundary.
    setAtmosphere(value={}){
      const visibility=Number.isFinite(value.visibility)?clamp01(value.visibility):atmosphereVisibility;
      const blur=Number.isFinite(value.blur)?Math.max(0,Math.min(24,value.blur)):atmosphereBlur;
      if(visibility!==atmosphereVisibility||blur!==atmosphereBlur||value.experience){
        atmosphereVisibility=visibility;
        atmosphereBlur=blur;
        if(value.experience){
          experienceState=value.experience;
        }
        dirty=true;
      }
    },
    setProgress(value){const next=THREE.MathUtils.clamp(Number.isFinite(value)?value:0,0,frames.length-1);if(!legacyMode||next!==progress){legacyMode=true;progress=next;dirty=true;}},
    setPaused(value){paused=!!value;pointer.set(0,0);softPointer.set(0,0);if(!paused)poseReady=false;dirty=true;canvas.dataset.motion=paused?'paused':'playing';},
    setReducedMotion(value){reducedMotion=!!value;pointer.set(0,0);softPointer.set(0,0);poseReady=false;dirty=true;},
    dispose(){disposed=true;cancelAnimationFrame(raf);trail.dispose();planetLight.dispose();experienceVisual.dispose();compositor.dispose();removeEventListener('pointermove',onPointer);removeEventListener('resize',resize);document.removeEventListener('pointerleave',onPointerLeave);canvas.removeEventListener('webglcontextlost',onLost);canvas.removeEventListener('webglcontextrestored',onRestored);scene.traverse(o=>{o.geometry?.dispose();if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());}});renderer.dispose();}
  };
}
