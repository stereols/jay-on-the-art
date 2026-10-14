import * as THREE from './vendor/three.module.js';

const clamp = THREE.MathUtils.clamp;
const mix = THREE.MathUtils.lerp;

// Four screen-space landmarks form a broad closed loop. The visible ribbon is
// built from where the light actually travelled, never a drawn path.
const ROUTE = [
  [-.12, -.10, 5.3], [1.12, .18, 8.8],
  [.52, 1.12, 10.2], [-.14, .48, 8.6]
];
const LOOP_SECONDS = 24;
const SAMPLES = 112;
const CAPACITY = 256;

function cubic(a, b, c, d, t) {
  return b + .5 * t * (c - a + t * (2 * a - 5 * b + 4 * c - d + t * (3 * (b - c) + d - a)));
}

function routePoint(phase, output) {
  const cycle = ((phase % 1) + 1) % 1;
  const scaled = cycle * ROUTE.length;
  const index = Math.floor(scaled), t = scaled - index, length = ROUTE.length;
  const a = ROUTE[(index - 1 + length) % length], b = ROUTE[index % length];
  const c = ROUTE[(index + 1) % length], d = ROUTE[(index + 2) % length];
  output.set(cubic(a[0], b[0], c[0], d[0], t), cubic(a[1], b[1], c[1], d[1], t),
    cubic(a[2], b[2], c[2], d[2], t));
}

/**
 * Shared-scene luminous point, true movement history, and tapered silk trail.
 * dt/time are seconds; pointer is normalized to [-.5,.5]. No listeners, RAF,
 * DOM or textures.
 */
export function createLuminousTrail(scene) {
  const group = new THREE.Group();
  group.name = 'luminous-scroll-companion';
  // Alpha-tested portrait pixels write depth before the transparent ribbon.
  // Vertex positions live in world space; object-center transparent sorting
  // alone would otherwise paint a front ribbon underneath the portrait.
  group.renderOrder = 3;
  scene.add(group);

  const positions = new Float32Array(SAMPLES * 2 * 3);
  const offsets = new Float32Array(SAMPLES * 2 * 3);
  const uv = new Float32Array(SAMPLES * 2 * 2);
  const indices = new Uint16Array((SAMPLES - 1) * 6);
  for (let i = 0; i < SAMPLES; i++) {
    uv.set([i / (SAMPLES - 1), 0, i / (SAMPLES - 1), 1], i * 4);
    if (i < SAMPLES - 1) {
      const p = i * 2;
      indices.set([p, p + 1, p + 2, p + 1, p + 3, p + 2], i * 6);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));

  const shared = {
    uOpacity: {value: 1}, uMotion: {value: 0}, uNight: {value: 0},
    uTime: {value: 0}, uEnergy: {value: 0}, uPink: {value: new THREE.Color('#FF616B')}
  };
  const materials = [];
  function trailMaterial(width, opacity, filament = false) {
    const material = new THREE.ShaderMaterial({
      transparent: true, depthTest: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false,
      uniforms: {...shared, uWidth: {value: width}, uAlpha: {value: opacity}, uFilament: {value: filament ? 1 : 0}},
      vertexShader: /* glsl */`
        attribute vec3 aOffset;
        uniform float uWidth,uFilament,uTime;
        varying vec2 vUv;
        void main(){
          vUv=uv;
          float split=sin(uv.x*3.14159265)*uFilament*.65;
          vec3 sideways=aOffset*(uv.y<.5?-1.:1.);
          vec3 p=position+aOffset*uWidth+sideways*split;
          gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
        }
      `,
      fragmentShader: /* glsl */`
        uniform float uOpacity,uMotion,uNight,uAlpha,uFilament,uEnergy,uTime;
        uniform vec3 uPink;
        varying vec2 vUv;
        void main(){
          float across=abs(vUv.y*2.-1.);
          float silk=exp(-across*across*4.8)*(1.-smoothstep(.72,1.,across));
          float taper=pow(1.-vUv.x,1.05)*(1.-smoothstep(.91,1.,vUv.x));
          float current=.89+.11*sin(vUv.x*21.-uTime*2.);
          float alpha=silk*taper*uAlpha*uOpacity*current*(.68+uMotion*.32+uEnergy*.16);
          vec3 pink=mix(uPink,vec3(1.,.18,.27),uNight*.16);
          vec3 color=mix(pink,vec3(1.,.76,.71),pow(1.-across,12.)*.40);
          color=mix(color,vec3(1.,.78,.68),uFilament*.36);
          gl_FragColor=vec4(color,alpha);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `
    });
    material.userData.atmosphereAccent = true;
    materials.push(material);
    return material;
  }
  const ribbonGlow = new THREE.Mesh(geometry, trailMaterial(4.8, .12));
  const ribbon = new THREE.Mesh(geometry, trailMaterial(1, .92));
  const filament = new THREE.Mesh(geometry, trailMaterial(.18, .76, true));
  for (const mesh of [ribbonGlow, ribbon, filament]) {
    mesh.frustumCulled = false;
    group.add(mesh);
  }

  const headGeometry = new THREE.PlaneGeometry(1, 1);
  const headMaterial = new THREE.ShaderMaterial({
    transparent: true, depthTest: true, depthWrite: false, toneMapped: false,
    uniforms: shared,
    vertexShader: /* glsl */`
      varying vec2 vUv;
      void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}
    `,
    fragmentShader: /* glsl */`
      uniform vec3 uPink;
      uniform float uOpacity,uMotion,uNight,uTime,uEnergy;
      varying vec2 vUv;
      void main(){
        vec2 p=(vUv-.5)*2.;
        float r=length(p);
        float core=1.-smoothstep(.15,.34,r);
        float halo=exp(-r*r*12.)*.10;
        float alpha=(core*.64+halo)*(1.-smoothstep(.65,1.,r))*uOpacity;
        gl_FragColor=vec4(uPink,alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `
  });
  headMaterial.userData.atmosphereAccent = true;
  materials.push(headMaterial);
  const light = new THREE.Mesh(headGeometry, headMaterial);
  light.name = 'scroll-light';
  light.frustumCulled = false;
  group.add(light);

  const target = new THREE.Vector3(), head = new THREE.Vector3(), velocity = new THREE.Vector3();
  const cameraRight = new THREE.Vector3(), cameraUp = new THREE.Vector3(), cameraForward = new THREE.Vector3();
  const world = new THREE.Vector3(), side = new THREE.Vector3();
  const hx = new Float32Array(CAPACITY), hy = new Float32Array(CAPACITY), hz = new Float32Array(CAPACITY), ht = new Float64Array(CAPACITY);
  const sx = new Float32Array(SAMPLES), sy = new Float32Array(SAMPLES), sz = new Float32Array(SAMPLES);
  let write = 0, count = 0, clock = 0, lastVisible = 0;
  let initialized = false, wasPaused = false, motion = 0, disposed = false;
  let viewportWidth=0,viewportHeight=0;
  const debug = {x: 0, y: 0, depth: 0, targetX: 0, targetY: 0, points: 0, length: 0, speed: 0, visible: false};

  function historyIndex(age) { return (write - 1 - clamp(age, 0, count - 1) + CAPACITY) % CAPACITY; }
  function record(x, y, z, time) {
    hx[write] = x; hy[write] = y; hz[write] = z; ht[write] = time;
    write = (write + 1) % CAPACITY;
    count = Math.min(count + 1, CAPACITY);
  }
  function clearHistory() {
    write = 0; count = 0;
    record(head.x, head.y - .003, head.z, clock - .4);
    record(head.x, head.y, head.z, clock);
  }
  function screenToWorld(x, y, depth, camera, tangent, output) {
    const halfHeight = depth * tangent;
    output.copy(camera.position)
      .addScaledVector(cameraForward, depth)
      .addScaledVector(cameraRight, (x * 2 - 1) * halfHeight * camera.aspect)
      .addScaledVector(cameraUp, (1 - y * 2) * halfHeight);
  }

  return {
    group,
    debug,
    update({camera, dt = 1 / 45, visibility = 1, night = 0, mobile = false, paused = false} = {}) {
      if (disposed || !camera) return false;
      const step = clamp(Number.isFinite(dt) ? dt : 1 / 45, .001, .05);
      const width = typeof innerWidth === 'number' ? innerWidth : 1440;
      const height = typeof innerHeight === 'number' ? innerHeight : 1000;
      if(width!==viewportWidth||height!==viewportHeight){
        initialized=false;viewportWidth=width;viewportHeight=height;
      }
      const opacity = clamp(visibility, 0, 1);
      if (!paused) clock += step;
      // Keep the path moving at its own pace, independent of scroll or pointer.
      routePoint((clock % LOOP_SECONDS) / LOOP_SECONDS, target);
      target.x = clamp(target.x, -.28, 1.28);
      target.y = clamp(target.y, -.28, 1.28);
      target.z = Math.max(2.7, target.z);

      if (!initialized || (opacity > .01 && lastVisible <= .01) || (wasPaused && !paused)) {
        head.copy(target); velocity.set(0, 0, 0); clearHistory(); initialized = true;
      } else if (paused) {
        // Motion-off still tracks chapter navigation, but has no time animation.
        head.copy(target); velocity.set(0, 0, 0); clearHistory();
      } else {
        // Damped acceleration adds a soft overshoot. The recorded position is
        // the spring result, so no fixed spline is exposed as decoration.
        const iterations = Math.max(1, Math.ceil(step / .016));
        const substep = step / iterations;
        for (let i = 0; i < iterations; i++) {
          velocity.x += ((target.x - head.x) * 42 - velocity.x * 11.8) * substep;
          velocity.y += ((target.y - head.y) * 42 - velocity.y * 11.8) * substep;
          velocity.z += ((target.z - head.z) * 32 - velocity.z * 11) * substep;
          head.addScaledVector(velocity, substep);
        }
        record(head.x, head.y, head.z, clock);
      }
      const screenSpeed = Math.hypot(velocity.x * width, velocity.y * height);
      group.visible = opacity > .003;
      debug.visible = group.visible;
      const desiredMotion = paused ? 0 : clamp(screenSpeed / 440, 0, 1);
      motion = mix(motion, desiredMotion, 1 - Math.exp(-step * (desiredMotion > motion ? 8 : 2.6)));
      const lifetime = .7 + motion * 3.8;
      let cursor = 0, length = 0;
      for (let i = 0; i < SAMPLES; i++) {
        const requestedTime = clock - lifetime * i / (SAMPLES - 1);
        while (cursor < count - 2 && ht[historyIndex(cursor + 1)] > requestedTime) cursor++;
        const newer = historyIndex(cursor), older = historyIndex(cursor + 1);
        const next = historyIndex(cursor - 1), previous = historyIndex(cursor + 2);
        const fraction = clamp((ht[newer] - requestedTime) / Math.max(.00001, ht[newer] - ht[older]), 0, 1);
        sx[i] = cubic(hx[next], hx[newer], hx[older], hx[previous], fraction);
        sy[i] = cubic(hy[next], hy[newer], hy[older], hy[previous], fraction);
        sz[i] = cubic(hz[next], hz[newer], hz[older], hz[previous], fraction);
        if (i) length += Math.hypot((sx[i] - sx[i - 1]) * width, (sy[i] - sy[i - 1]) * height);
      }

      camera.updateMatrixWorld();
      cameraRight.setFromMatrixColumn(camera.matrixWorld, 0);
      cameraUp.setFromMatrixColumn(camera.matrixWorld, 1);
      cameraForward.setFromMatrixColumn(camera.matrixWorld, 2).negate();
      const tangent = Math.tan(THREE.MathUtils.degToRad(camera.fov) * .5);
      const basePixels = (mobile ? 1.8 : 2.3) + motion * (mobile ? 2.5 : 3.9);
      for (let i = 0; i < SAMPLES; i++) {
        const before = Math.max(0, i - 1), after = Math.min(SAMPLES - 1, i + 1);
        const dx = (sx[after] - sx[before]) * width, dy = (sy[after] - sy[before]) * height;
        const magnitude = Math.max(.001, Math.hypot(dx, dy));
        const age = i / (SAMPLES - 1);
        const taper = Math.pow(1 - age, .72) * (.78 + .22 * Math.sin(age * Math.PI));
        const pixelWorld = sz[i] * tangent * 2 / height;
        side.copy(cameraRight).multiplyScalar(-dy / magnitude)
          .addScaledVector(cameraUp, -dx / magnitude).multiplyScalar(pixelWorld * basePixels * taper);
        screenToWorld(sx[i], sy[i], sz[i], camera, tangent, world);
        const vertex = i * 6;
        positions[vertex] = positions[vertex + 3] = world.x;
        positions[vertex + 1] = positions[vertex + 4] = world.y;
        positions[vertex + 2] = positions[vertex + 5] = world.z;
        offsets[vertex] = -side.x; offsets[vertex + 3] = side.x;
        offsets[vertex + 1] = -side.y; offsets[vertex + 4] = side.y;
        offsets[vertex + 2] = -side.z; offsets[vertex + 5] = side.z;
      }
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.aOffset.needsUpdate = true;
      ribbon.visible = ribbonGlow.visible = filament.visible = !paused && length > .5;
      screenToWorld(head.x, head.y, head.z - .012, camera, tangent, light.position);
      light.quaternion.copy(camera.quaternion);
      const headPixels = (mobile ? 40 : 52) + motion * 7;
      light.scale.setScalar(headPixels * head.z * tangent * 2 / height);
      shared.uOpacity.value = opacity;
      shared.uMotion.value = motion;
      shared.uNight.value = clamp(night, 0, 1);
      shared.uTime.value = clock;
      shared.uEnergy.value = 0;
      debug.x = head.x; debug.y = head.y; debug.depth = head.z;
      debug.targetX = target.x; debug.targetY = target.y;
      debug.points = count; debug.length = length; debug.speed = screenSpeed;
      lastVisible = opacity; wasPaused = paused;
      return !paused && group.visible;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      scene.remove(group);
      geometry.dispose(); headGeometry.dispose();
      materials.forEach(material => material.dispose());
    }
  };
}
