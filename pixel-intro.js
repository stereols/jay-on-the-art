// Reveal the first hero frame, then release all temporary drawing resources.
export function createPixelIntro({root, reduced}) {
  const params = new URLSearchParams(location.search);
  if (params.get('view') === 'static') return null;
  const preview = params.get('intro') === 'pixel';
  const storageKey = 'jay-on-art:pixel-intro:v1';
  const eligibleEntry = (!location.hash || location.hash === '#top') &&
    (!params.has('entry') || params.get('entry') === 'top');
  let seen = false;
  try { seen = sessionStorage.getItem(storageKey) === 'seen'; } catch {}
  let cosmos, overlay, snapshot, small, frame = 0, pending = 0, events, generation = 0;
  let started = 0, duration = 1800, lastBlock = -1, running = false;
  const host = document.getElementById('cosmos');
  const panel = document.createElement('aside');
  panel.className = 'pixel-intro-preview';
  panel.setAttribute('aria-label', '인트로 미리보기');
  panel.innerHTML = '<span>인트로 미리보기</span><button type="button" data-intro-play>다시 재생</button><button type="button" data-intro-slow>느리게 재생</button><button type="button" data-intro-stop>연출 끄기</button><output aria-live="polite"></output>';
  if (preview) document.body.append(panel);
  const output = panel.querySelector('output');
  const setState = (state, text) => { root.dataset.pixelIntro = state; output.textContent = text; };

  function finish(reason = 'complete') {
    generation++;
    cancelAnimationFrame(frame); clearTimeout(pending);
    events?.abort(); events = null; running = false;
    overlay?.remove(); overlay = null;
    // Release the full-size temporary buffers after the transition.
    if (snapshot) snapshot.width = snapshot.height = 1;
    if (small) small.width = small.height = 1;
    snapshot = small = null;
    root.classList.remove('pixel-intro-pending', 'pixel-intro-active', 'pixel-intro-revealing');
    // Do not reintroduce the old 1.8s opacity fade after an interruption.
    root.classList.add('pixel-intro-settled');
    root.style.removeProperty('--intro-copy-opacity');
    delete root.dataset.pixelIntroBlock;
    setState(reason, reason === 'complete' ? '원본 화면' : reason === 'reduced' ? '동작 줄이기 적용' : reason === 'waiting' ? '배경 준비 중' : '원본 화면');
  }

  function arm() {
    root.classList.add('pixel-intro-pending');
    setState('waiting', '배경 준비 중');
    events = new AbortController();
    const options = {passive: true, signal: events.signal};
    for (const name of ['wheel', 'touchstart', 'pointerdown', 'resize', 'pagehide']) {
      addEventListener(name, () => finish('interrupted'), options);
    }
    addEventListener('scroll', () => { if (scrollY > 8) finish('interrupted'); }, options);
    addEventListener('keydown', event => {
      if (!['Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) finish('interrupted');
    }, {signal: events.signal});
    document.addEventListener('visibilitychange', () => { if (document.hidden) finish('interrupted'); }, options);
    document.addEventListener('cosmos-render-state', event => {
      if (event.detail === 'fallback') finish('fallback');
    }, {signal: events.signal});
    // A failed/slow renderer must never leave the hero copy hidden.
    pending = setTimeout(() => finish('fallback'), 4000);
  }

  function draw(block) {
    if (block === lastBlock) return;
    lastBlock = block;
    const context = overlay.getContext('2d');
    if (block === 1) {
      context.clearRect(0, 0, overlay.width, overlay.height);
      context.drawImage(snapshot, 0, 0);
    } else {
      small.width = Math.max(1, Math.ceil(innerWidth / block));
      small.height = Math.max(1, Math.ceil(innerHeight / block));
      const sample = small.getContext('2d');
      sample.imageSmoothingEnabled = true;
      sample.imageSmoothingQuality = 'high';
      sample.drawImage(snapshot, 0, 0, small.width, small.height);
      context.clearRect(0, 0, overlay.width, overlay.height);
      context.imageSmoothingEnabled = false;
      context.drawImage(small, 0, 0, overlay.width, overlay.height);
    }
    root.dataset.pixelIntroBlock = String(block);
  }

  function tick(now) {
    if (!running) return;
    const elapsed = (now - started) * 1800 / duration;
    if (elapsed >= 1800) { finish(); return; }
    const stages = innerWidth <= 760 ? [32, 16, 8, 4, 2, 1] : [64, 32, 16, 8, 4, 2, 1];
    const stage = elapsed < 300 ? 0 : Math.min(stages.length - 1, Math.floor((elapsed - 300) / (1200 / stages.length)));
    draw(stages[stage]);
    if (elapsed >= 1500) {
      root.classList.add('pixel-intro-revealing');
      const mix = Math.min(1, (elapsed - 1500) / 300);
      overlay.style.opacity = String(1 - mix);
      root.style.setProperty('--intro-copy-opacity', String(mix));
    }
    frame = requestAnimationFrame(tick);
  }

  function start(ms = 1800) {
    if (reduced.matches) { finish('reduced'); return; }
    if (!cosmos || scrollY > 8 || document.hidden) { finish('skipped'); return; }
    clearTimeout(pending);
    try {
      snapshot = document.createElement('canvas');
      small = document.createElement('canvas');
      overlay = document.createElement('canvas');
      overlay.className = 'pixel-intro-canvas';
      overlay.setAttribute('aria-hidden', 'true');
      // Capture synchronously after a render: the WebGL buffer is transient.
      cosmos.captureFrame(source => {
        snapshot.width = overlay.width = source.width;
        snapshot.height = overlay.height = source.height;
        snapshot.getContext('2d').drawImage(source, 0, 0);
      });
      host.insertBefore(overlay, host.querySelector('.cosmos-wash'));
      lastBlock = -1;
      draw(innerWidth <= 760 ? 32 : 64);
      root.classList.replace('pixel-intro-pending', 'pixel-intro-active');
      setState('playing', ms > 1800 ? '느리게 재생 중' : '재생 중');
      try { sessionStorage.setItem(storageKey, 'seen'); } catch {}
      duration = ms; started = performance.now(); running = true;
      frame = requestAnimationFrame(tick);
    } catch (error) {
      console.warn('Pixel intro skipped; original scene remains available.', error);
      finish('fallback');
    }
  }

  function replay(ms) {
    finish('waiting');
    if (reduced.matches) { finish('reduced'); return; }
    const current = generation;
    window.scrollTo({top: 0, behavior: 'instant'});
    // Let the existing scroll/camera timeline settle before taking its frame.
    requestAnimationFrame(() => {
      if (current !== generation) return;
      requestAnimationFrame(() => { if (current === generation) { arm(); start(ms); } });
    });
  }
  panel.querySelector('[data-intro-play]').addEventListener('click', () => replay(1800));
  panel.querySelector('[data-intro-slow]').addEventListener('click', () => replay(5400));
  panel.querySelector('[data-intro-stop]').addEventListener('click', () => finish('interrupted'));
  reduced.addEventListener('change', () => { if (reduced.matches) finish('reduced'); });
  if (eligibleEntry && !seen && !reduced.matches && scrollY <= 8) arm();
  else setState(reduced.matches ? 'reduced' : 'skipped', reduced.matches ? '동작 줄이기 적용' : '원본 화면');

  return {
    ready(value) {
      cosmos = value;
      requestAnimationFrame(() => {
        if (root.classList.contains('pixel-intro-pending')) start();
      });
    },
    cancel() { finish('fallback'); }
  };
}
