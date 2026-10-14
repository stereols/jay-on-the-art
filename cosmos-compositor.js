import * as THREE from './vendor/three.module.js';

/**
 * Blur only layer 0, then draw layer 1 with the SAME camera and restored depth.
 * The foreground is still part of the same scene. Transparent cutouts keep
 * their alpha, and planets continue to occlude things travelling behind them.
 * `blur` is a CSS-pixel radius; width/height passed to resize are CSS pixels.
 */
export function createCosmosCompositor(renderer) {
  const floatingPoint = renderer.extensions.has('EXT_color_buffer_float');
  const textureType = floatingPoint ? THREE.HalfFloatType : THREE.UnsignedByteType;
  const background = new THREE.WebGLRenderTarget(1, 1, {
    type: textureType,
    minFilter: THREE.LinearMipmapLinearFilter,
    magFilter: THREE.LinearFilter,
    generateMipmaps: true,
    depthBuffer: true,
    stencilBuffer: false,
    colorSpace: THREE.LinearSRGBColorSpace
  });
  background.texture.name = 'cosmos-background-linear';
  background.depthTexture = new THREE.DepthTexture(1, 1, THREE.UnsignedIntType);
  background.depthTexture.format = THREE.DepthFormat;
  background.depthTexture.minFilter = THREE.NearestFilter;
  background.depthTexture.magFilter = THREE.NearestFilter;
  background.depthTexture.name = 'cosmos-background-depth';
  const horizontal = new THREE.WebGLRenderTarget(1, 1, {
    type: textureType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    generateMipmaps: false,
    depthBuffer: false,
    stencilBuffer: false,
    colorSpace: THREE.LinearSRGBColorSpace
  });
  horizontal.texture.name = 'cosmos-horizontal-blur-linear';

  // A single oversized triangle avoids a diagonal interpolation seam.
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
  const vertexShader = /* glsl */`
    varying vec2 vUv;
    void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}
  `;
  const gaussian = /* glsl */`
    uniform sampler2D tColor;
    uniform vec2 uStep;
    varying vec2 vUv;
    vec4 blurColor(){
      vec4 color=texture2D(tColor,vUv)*.2270270270;
      color+=texture2D(tColor,vUv+uStep*1.3846153846)*.3162162162;
      color+=texture2D(tColor,vUv-uStep*1.3846153846)*.3162162162;
      color+=texture2D(tColor,vUv+uStep*3.2307692308)*.0702702703;
      color+=texture2D(tColor,vUv-uStep*3.2307692308)*.0702702703;
      return color;
    }
  `;
  const blurMaterial = new THREE.ShaderMaterial({
    name: 'cosmos-horizontal-blur',
    uniforms: {tColor: {value: background.texture}, uStep: {value: new THREE.Vector2()}},
    vertexShader,
    fragmentShader: `${gaussian}\nvoid main(){gl_FragColor=blurColor();}`,
    blending: THREE.NoBlending,
    depthTest: false,
    depthWrite: false,
    toneMapped: false
  });
  const compositeMaterial = new THREE.ShaderMaterial({
    name: 'cosmos-blur-with-original-depth',
    uniforms: {
      tColor: {value: horizontal.texture},
      tDepth: {value: background.depthTexture},
      uStep: {value: new THREE.Vector2()},
      uPremultipliedOutput: {value: renderer.getContext().getContextAttributes()?.premultipliedAlpha === false ? 0 : 1}
    },
    vertexShader,
    fragmentShader: /* glsl */`
      ${gaussian}
      uniform sampler2D tDepth;
      uniform float uPremultipliedOutput;
      void main(){
        // The offscreen blend buffer contains premultiplied linear color.
        // Blur RGBA together, then unpremultiply for the output transforms;
        // this prevents dark/ivory rectangular fringes around alpha edges.
        vec4 color=blurColor();
        color.rgb=color.a>.00001?color.rgb/color.a:vec3(0.);
        gl_FragColor=color;
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        gl_FragColor.rgb*=mix(1.,gl_FragColor.a,uPremultipliedOutput);
        // Do not blur depth: a foreground strand uses real planet geometry
        // for occlusion even while the planet's color is defocused.
        gl_FragDepth=texture2D(tDepth,vUv).r;
      }
    `,
    blending: THREE.NoBlending,
    depthTest: true,
    depthFunc: THREE.AlwaysDepth,
    depthWrite: true,
    toneMapped: true
  });
  blurMaterial.userData.atmosphereAccent = true;
  compositeMaterial.userData.atmosphereAccent = true;
  const quad = new THREE.Mesh(geometry, blurMaterial);
  quad.frustumCulled = false;
  const passScene = new THREE.Scene();
  passScene.add(quad);
  const passCamera = new THREE.Camera();
  const savedViewport = new THREE.Vector4(), savedScissor = new THREE.Vector4();
  const savedClearColor = new THREE.Color();
  const drawingSize = new THREE.Vector2();
  let ratio = 1, bufferWidth = 1, bufferHeight = 1, downsample = 1, disposed = false;

  function resize(width, height, pixelRatio = renderer.getPixelRatio()) {
    ratio = Math.max(.25, Number.isFinite(pixelRatio) ? pixelRatio : 1);
    const nextWidth = Math.max(1, Math.round(width * ratio));
    const nextHeight = Math.max(1, Math.round(height * ratio));
    if (nextWidth === bufferWidth && nextHeight === bufferHeight) return;
    bufferWidth = nextWidth; bufferHeight = nextHeight;
    background.setSize(bufferWidth, bufferHeight);
    horizontal.setSize(Math.max(1, Math.ceil(bufferWidth / downsample)), Math.max(1, Math.ceil(bufferHeight / downsample)));
  }
  renderer.getSize(drawingSize);
  resize(drawingSize.x, drawingSize.y, renderer.getPixelRatio());

  return {
    resize,
    render(scene, camera, {blur = 0} = {}) {
      if (disposed) return;
      const radius = Math.max(0, Math.min(48, Number.isFinite(blur) ? blur : 0));
      const layerMask = camera.layers.mask;
      if (radius <= .05) {
        // Preserve normal MSAA and exact material color on focused scenes.
        camera.layers.enable(0); camera.layers.enable(1);
        try { renderer.render(scene, camera); }
        finally { camera.layers.mask = layerMask; }
        return;
      }
      const previousTarget = renderer.getRenderTarget();
      const previousAutoClear = renderer.autoClear;
      const previousScissorTest = renderer.getScissorTest();
      const previousBackground = scene.background;
      const previousClearAlpha = renderer.getClearAlpha();
      renderer.getClearColor(savedClearColor);
      renderer.getViewport(savedViewport);
      renderer.getScissor(savedScissor);
      // The kernel's standard deviation is ~1.42 texels. Match a CSS blur's
      // radius independently from device pixel ratio and drawing-buffer size.
      const spread = radius * ratio / 1.42;
      // Sparse taps at full resolution leave repeated rings and grid patterns
      // in finely detailed planets. Render this first pass at a mip-prefiltered
      // size so each tap sees a properly averaged neighborhood. Keep its sigma
      // around 1–2 low-resolution texels; powers of two avoid reallocating the
      // target for every fractional scroll change. Depth stays full resolution.
      const nextDownsample = Math.min(16, 2 ** Math.floor(Math.log2(Math.max(1, spread))));
      if (nextDownsample !== downsample) {
        downsample = nextDownsample;
        horizontal.setSize(Math.max(1, Math.ceil(bufferWidth / downsample)), Math.max(1, Math.ceil(bufferHeight / downsample)));
      }
      blurMaterial.uniforms.uStep.value.set(spread / bufferWidth, 0);
      compositeMaterial.uniforms.uStep.value.set(0, spread / bufferHeight);
      try {
        renderer.autoClear = false;
        renderer.setScissorTest(false);
        camera.layers.set(0);
        renderer.setRenderTarget(background);
        // Re-encode the unchanged clear color for the linear render target;
        // otherwise the previous canvas's sRGB GL clear state may leak in.
        renderer.setClearColor(savedClearColor, previousClearAlpha);
        renderer.clear(true, true, false);
        renderer.render(scene, camera);

        renderer.setRenderTarget(horizontal);
        quad.material = blurMaterial;
        renderer.render(passScene, passCamera);

        renderer.setRenderTarget(previousTarget);
        renderer.setClearColor(savedClearColor, previousClearAlpha);
        renderer.setViewport(savedViewport);
        renderer.setScissor(savedScissor);
        renderer.setScissorTest(previousScissorTest);
        renderer.clear(true, true, false);
        quad.material = compositeMaterial;
        renderer.render(passScene, passCamera);

        // Layer 1 receives the depth written by the composite; clearing here
        // would detach the foreground from the planets. Scene backgrounds
        // are temporarily omitted because their color was already composited.
        scene.background = null;
        camera.layers.set(1);
        renderer.render(scene, camera);
      } finally {
        camera.layers.mask = layerMask;
        scene.background = previousBackground;
        renderer.autoClear = previousAutoClear;
        renderer.setRenderTarget(previousTarget);
        renderer.setClearColor(savedClearColor, previousClearAlpha);
        renderer.setViewport(savedViewport);
        renderer.setScissor(savedScissor);
        renderer.setScissorTest(previousScissorTest);
      }
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      background.dispose(); horizontal.dispose();
      geometry.dispose(); blurMaterial.dispose(); compositeMaterial.dispose();
      passScene.remove(quad);
    }
  };
}
