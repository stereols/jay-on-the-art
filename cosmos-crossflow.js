import * as THREE from './vendor/three.module.js';

// The route is sampled from the same absolute orbit as the camera. There are no
// autonomous clocks: reversing a chapter reproduces the identical ribbon pose.
const STRENGTH = [
  [0, 1], [.4, .6], [.65, .34], [1.15, .48], [1.34, .2],
  [1.65, .12], [1.9, .24], [2.05, .38], [2.4, 0], [2.95, 0],
  [3.4, .16], [3.43, .16], [3.85, .24], [4.3, .18], [4.6, .42]
];

function strengthAt(route) {
  let index = 0;
  while (index < STRENGTH.length - 2 && route > STRENGTH[index + 1][0]) index++;
  const a = STRENGTH[index], b = STRENGTH[index + 1];
  const mix = THREE.MathUtils.smoothstep(route, a[0], b[0]);
  return THREE.MathUtils.lerp(a[1], b[1], mix);
}

export function createCrossflow(scene) {
  const group = new THREE.Group();
  group.name = 'chapter-crossflow';
  scene.add(group);
  const uniforms = {
    uRoute: {value: 0}, uSize: {value: new THREE.Vector2(1, 1)},
    uOpacity: {value: 1}, uNight: {value: 0}
  };
  const materials = [], threads = [];
  const positions = [], uvs = [], indices = [];
  const segments = 128;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    positions.push((t * 2 - 1) * 2.2, -1, 0, (t * 2 - 1) * 2.2, 1, 0);
    uvs.push(t, 0, t, 1);
    if (i < segments) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);

  function ribbon(lane, offset, width, tint, opacity, thread = false) {
    const material = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
      uniforms: {...uniforms, uLane: {value: lane}, uOffset: {value: offset},
        uWidth: {value: width}, uTint: {value: new THREE.Color(tint)}, uAlpha: {value: opacity}},
      vertexShader: /* glsl */`
        uniform float uRoute,uLane,uOffset,uWidth;
        uniform vec2 uSize;
        varying vec2 vUv;
        varying float vDepth;
        void main(){
          vUv=uv;
          float t=position.x;
          float route=uRoute;
          float direction=uLane<.5?1.:-1.;
          float slope=direction*(.52+.16*sin(route*.83+uLane));
          float bend=sin(t*1.15+route*.68+uLane*1.3)*(.23+.09*sin(route*.7));
          float x=t-.36*cos(route*.92);
          float y=slope*t+bend+uOffset-.12+sin(route*.95)*.37;
          y+=position.y*uWidth;
          float turn=sin(route*.57)*.17;
          vec2 p=mat2(cos(turn),-sin(turn),sin(turn),cos(turn))*vec2(x,y);
          float depth=sin(t*1.4+route*.72+uLane*2.4)*1.7-uLane*.35;
          vDepth=depth;
          gl_Position=projectionMatrix*modelViewMatrix*vec4(p*uSize,depth,1.);
        }
      `,
      fragmentShader: /* glsl */`
        uniform vec3 uTint;
        uniform float uOpacity,uAlpha,uNight;
        varying vec2 vUv;
        varying float vDepth;
        void main(){
          float edge=1.-smoothstep(.58,1.,abs(vUv.y*2.-1.));
          float ends=smoothstep(0.,.16,vUv.x)*(1.-smoothstep(.84,1.,vUv.x));
          float sheen=pow(max(0.,1.-abs(vUv.y-.28)*2.),10.);
          vec3 color=mix(uTint,vec3(1.,.72,.68),sheen*.2);
          color=mix(color,vec3(.57,.19,.29),uNight*.7);
          gl_FragColor=vec4(color,edge*ends*uAlpha*uOpacity*(.88+vDepth*.035));
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `
    });
    materials.push(material);
    const mesh = new THREE.Mesh(geometry, material);
    // Positions are reconstructed in the vertex shader, outside the CPU bounds.
    mesh.frustumCulled = false;
    group.add(mesh);
    if (thread) threads.push(mesh);
  }
  ribbon(0, 0, .021, 0xff616b, .3);
  ribbon(1, .035, .013, 0x635b61, .15);
  for (const lane of [0, 1]) {
    for (const offset of [-.09, -.045, .045, .09]) {
      ribbon(lane, offset, .0009, lane ? 0xa89b96 : 0xe48b91, .42, true);
    }
  }
  const direction = new THREE.Vector3();

  return {
    update({camera, orbit, night = 0, visibility = 1, mobile = false, reducedMotion = false}) {
      const opacity = strengthAt(orbit) * visibility * (mobile ? .65 : 1) * (reducedMotion ? .65 : 1);
      group.visible = opacity > .002;
      if (!group.visible) return;
      // A deep camera-relative plane makes the ribbons pass behind real worlds;
      // their local depth still supplies perspective and intersection parallax.
      const depth = 19;
      camera.getWorldDirection(direction);
      group.position.copy(camera.position).addScaledVector(direction, depth);
      group.quaternion.copy(camera.quaternion);
      const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * depth;
      uniforms.uSize.value.set(halfHeight * camera.aspect, halfHeight);
      uniforms.uRoute.value = orbit;
      uniforms.uOpacity.value = opacity;
      uniforms.uNight.value = night;
      threads.forEach((mesh, index) => {mesh.visible = !mobile || index % 2 === 0;});
    },
    dispose() {
      scene.remove(group);
      geometry.dispose();
      materials.forEach(material => material.dispose());
    }
  };
}
