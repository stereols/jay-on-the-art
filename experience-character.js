const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
const bell = value => Math.sin(Math.PI * clamp(value));
const EMPTY = {energy: 0, progress: 0, arrival: 0, entry: 0, exit: 0, visible: false};

/** A single portrait and a single brief pet visit, contained in the career arrival. */
export function createExperienceCharacter(section = document.querySelector('#threshold')) {
  const character = section?.querySelector('.experience-character');
  if (!character) return {update: () => ({...EMPTY}), setEnabled() {}, dispose() {}};
  const pet = character.querySelector('.experience-pet');
  const art = character.querySelector('.experience-pet-art');
  const leftWing = character.querySelector('.experience-pet-wing-left');
  const rightWing = character.querySelector('.experience-pet-wing-right');
  const petBody = character.querySelector('.experience-pet-body');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let enabled = true, motion = true, visible = false, ready = false, visited = false, disposed = false;
  let scene = {}, options = {}, state = 'hidden', startedAt = 0, stateAt = 0, suspendedAt = 0, raf = 0;
  let latest = {...EMPTY}, petPose = {x: 0, y: 0, rotate: 0, scale: 1}, departure = null;

  function overlayOpen() {
    return !!document.querySelector('dialog[open], #mobile-nav:not([hidden]), #map-panel:not([hidden])') ||
      document.body.classList.contains('reading-resume');
  }
  function active() { return enabled && motion && !reduced.matches && !document.hidden && !disposed && !overlayOpen(); }
  function stopFrame() { cancelAnimationFrame(raf); raf = 0; }
  function hidePet() {
    stopFrame();
    state = 'hidden';
    suspendedAt = 0;
    if (!pet) return;
    pet.hidden = true;
    pet.disabled = true;
    pet.tabIndex = -1;
    pet.dataset.state = state;
    if (document.activeElement === pet) pet.blur();
  }
  function setState(next, now) { state = next; stateAt = now; pet.dataset.state = next; }
  function depart(now) {
    departure = {...petPose};
    setState('flyout', now);
    pet.disabled = true;
    pet.tabIndex = -1;
  }
  function tick(now) {
    raf = 0;
    if (!pet || state === 'hidden') return;
    if (document.hidden) { suspendedAt = now; return; }
    if (!active() || !visible || latest.arrival < .7) { hidePet(); return; }
    if (state === 'enter' && now - stateAt >= 550) setState('hover', now);
    if (state === 'react' && now - stateAt >= 360) depart(now);
    if (state === 'hover' && now - startedAt >= 4000) depart(now);

    const time = (now - startedAt) / 1000;
    let x = Math.sin(time * 1.15) * 7;
    let y = Math.cos(time * 1.62) * 5;
    let rotate = Math.sin(time * 1.15) * 3;
    let scale = 1 + Math.sin(time * 1.05) * .015;
    let alpha = 1;
    if (state === 'enter') {
      const entry = smooth((now - stateAt) / 550);
      x += (1 - entry) * 13;
      y += (1 - entry) * 12;
      alpha = entry;
      scale *= .86 + entry * .14;
    } else if (state === 'react') {
      const pulse = bell((now - stateAt) / 360);
      y -= pulse * 9;
      rotate -= pulse * 7;
      scale += pulse * .06;
    } else if (state === 'flyout') {
      const flight = clamp((now - stateAt) / 900);
      const ease = flight * flight;
      x = departure.x + ease * Math.min(105, character.clientWidth * .3);
      y = departure.y - Math.sin(flight * Math.PI * .65) * 64;
      rotate = departure.rotate + flight * 14;
      scale = departure.scale * (1 - flight * .32);
      alpha = 1 - smooth((flight - .25) / .75);
      if (flight >= 1) { hidePet(); return; }
    }
    petPose = {x, y, rotate, scale};
    art.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) rotate(${rotate.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
    pet.style.opacity = alpha.toFixed(3);
    pet.tabIndex = alpha > .65 && state !== 'flyout' ? 0 : -1;
    const flap = Math.sin(time * Math.PI * (state === 'flyout' ? 13 : 9));
    leftWing.style.transform = `rotateY(${(12 + flap * 20).toFixed(2)}deg) rotateZ(${(-flap).toFixed(2)}deg)`;
    rightWing.style.transform = `rotateY(${(-12 - flap * 20).toFixed(2)}deg) rotateZ(${flap.toFixed(2)}deg)`;
    petBody.style.transform = `translateY(${(Math.sin(time * 4.5) * .6).toFixed(2)}px)`;
    raf = requestAnimationFrame(tick);
  }
  function visit() {
    if (!pet || !ready || visited || !active() || !visible || latest.arrival <= .8 || latest.entry <= .8 || latest.exit > .15) return;
    visited = true;
    startedAt = performance.now();
    setState('enter', startedAt);
    pet.hidden = false;
    pet.disabled = false;
    pet.tabIndex = -1;
    pet.style.opacity = '0';
    raf = requestAnimationFrame(tick);
  }
  function update(nextScene = scene, nextOptions = options) {
    if (disposed) return {...EMPTY};
    scene = nextScene || scene;
    options = nextOptions || options;
    motion = options.motionEnabled !== false;
    const sectionRect = section.getBoundingClientRect();
    const bounds = character.getBoundingClientRect();
    const viewport = Math.max(1, innerHeight);
    const progress = clamp(-sectionRect.top / Math.max(1, sectionRect.height - viewport));
    const arrivalValue = parseFloat(section.style.getPropertyValue('--career-arrival'));
    const arrival = Number.isFinite(arrivalValue) ? clamp(arrivalValue) : 1;
    const pinned = document.documentElement.classList.contains('motion-layout');
    const entry = pinned ? smooth(arrival) : smooth((viewport * .95 - bounds.top) / Math.max(1, viewport * .5));
    const exit = pinned ? smooth((progress - .86) / .14) : smooth((viewport * .2 - bounds.bottom) / Math.max(1, bounds.height * .6));
    visible = bounds.bottom > 50 && bounds.top < viewport - 40 && arrival > .02;
    const moving = active();
    character.classList.toggle('experience-character-active', moving && visible);
    character.style.setProperty('--experience-character-entry', moving ? entry.toFixed(4) : '1');
    character.style.setProperty('--experience-character-exit', moving ? exit.toFixed(4) : '0');
    const entryEnergy = pinned ? bell(smooth((progress - .49) / .25)) * smooth(arrival) : bell(entry);
    latest = {energy: moving && visible ? Math.max(entryEnergy, bell(exit) * .8) : 0,
      progress, arrival, entry, exit, visible};
    if (!moving || !visible || arrival < .7) {
      // Keep a hidden tab's short visit suspended; other departures end it.
      if (!document.hidden || !enabled || !motion || reduced.matches || !visible) hidePet();
    } else visit();
    return {...latest};
  }
  function react() {
    if (!active() || !['enter', 'hover'].includes(state)) return;
    setState('react', performance.now());
    pet.tabIndex = -1;
  }
  function visibilityChanged() {
    if (document.hidden) {
      if (state !== 'hidden') suspendedAt = performance.now();
      stopFrame();
      character.classList.remove('experience-character-active');
    } else {
      if (suspendedAt && state !== 'hidden') {
        const pause = performance.now() - suspendedAt;
        startedAt += pause;
        stateAt += pause;
        suspendedAt = 0;
      }
      update();
      if (state !== 'hidden' && !raf && active() && visible) raf = requestAnimationFrame(tick);
    }
  }
  const reconcile = () => update();
  const observer = new MutationObserver(records => {
    if (records.some(record => !character.contains(record.target))) update();
  });
  observer.observe(document.body, {subtree: true, attributes: true, attributeFilter: ['hidden', 'open']});
  pet?.addEventListener('click', react);
  document.addEventListener('visibilitychange', visibilityChanged);
  reduced.addEventListener('change', reconcile);
  window.addEventListener('resize', reconcile, {passive: true});
  hidePet();
  const petImages = [leftWing, rightWing, petBody];
  if (pet && art && petImages.every(Boolean)) {
    Promise.all(petImages.map(image => image.decode())).then(() => {ready = true; update();}).catch(hidePet);
  }
  return {update, setEnabled(value) {enabled = Boolean(value); update();}, dispose() {
    disposed = true;
    hidePet();
    observer.disconnect();
    pet?.removeEventListener('click', react);
    document.removeEventListener('visibilitychange', visibilityChanged);
    reduced.removeEventListener('change', reconcile);
    window.removeEventListener('resize', reconcile);
    character.classList.remove('experience-character-active');
  }};
}
