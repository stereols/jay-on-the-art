const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
const bell = value => Math.sin(Math.PI * clamp(value));
const EMPTY = {energy: 0, progress: 0, arrival: 0, entry: 0, exit: 0, visible: false,
  presence: 0, hand: null, glow: null, portrait: null};

/** Layout anchors for the portrait and the shared Three scene; no separate animation loop. */
export function createExperienceCharacter(section = document.querySelector('#threshold')) {
  const character = section?.querySelector('.experience-character');
  const portrait = character?.querySelector('.experience-person');
  if (!character || !portrait) return {update: () => ({...EMPTY}), setEnabled() {}, dispose() {}};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const history = document.getElementById('career-history');
  const artwork = character.querySelector('.experience-character-float');
  const stage = document.createElement('div');
  stage.className = 'experience-character experience-character-stage';
  stage.setAttribute('aria-hidden', 'true');
  stage.hidden = true;
  document.body.append(stage);
  let enabled = true, disposed = false, scene = {}, options = {};
  let latest = {...EMPTY};

  function measureAnchors() {
    const rect = portrait.getBoundingClientRect();
    const width = Math.max(1, innerWidth), height = Math.max(1, innerHeight);
    const point = (x, y) => ({x: (rect.left + rect.width * x) / width,
      y: (rect.top + rect.height * y) / height});
    // Coordinates refer to the complete 1024 x 1536 transparent source, not its opaque pixels.
    return {
      portrait: {left: rect.left / width, top: rect.top / height,
        width: rect.width / width, height: rect.height / height},
      hand: point(.89, .30),
      glow: {...point(.89, .25), radius: rect.width * .095 / width}
    };
  }

  function update(nextScene = scene, nextOptions = options) {
    if (disposed) return {...EMPTY};
    scene = nextScene || scene;
    options = nextOptions || options;
    const viewport = Math.max(1, innerHeight);
    const sectionRect = section.getBoundingClientRect();
    const sourceBounds = character.getBoundingClientRect();
    const progress = clamp(-sectionRect.top / Math.max(1, sectionRect.height - viewport));
    const arrivalValue = parseFloat(section.style.getPropertyValue('--career-arrival'));
    const arrival = Number.isFinite(arrivalValue) ? clamp(arrivalValue) : 1;
    const pinned = document.documentElement.classList.contains('motion-layout');
    const continuous = pinned && !!history && !!artwork;
    if (continuous) {
      if (artwork.parentElement !== stage) stage.append(artwork);
      // Keep a stable viewport anchor through the list and its fade-out.
      // Scroll-driven displacement here races the separate WebGL render loop.
      const introductionRelease = Math.max(0, -sectionRect.top - Math.max(0, sectionRect.height - viewport));
      stage.style.left = `${sourceBounds.left}px`;
      stage.style.top = `${sourceBounds.top + introductionRelease}px`;
      stage.style.width = `${sourceBounds.width}px`;
      stage.style.height = `${sourceBounds.height}px`;
      stage.hidden = false;
    } else {
      if (artwork && artwork.parentElement !== character) character.append(artwork);
      stage.hidden = true;
    }
    const surface = continuous ? stage : character;
    const bounds = surface.getBoundingClientRect();
    const entry = pinned ? smooth(arrival) : smooth((viewport * .92 - bounds.top) / Math.max(1, viewport * .48));
    const exit = continuous ? smooth((viewport * .95 - history.getBoundingClientRect().bottom) / (viewport * .42)) : pinned ? smooth((progress - .86) / .14) : smooth((viewport * .16 - bounds.bottom) / Math.max(1, bounds.height * .6));
    const presence = arrival * (continuous ? 1 - exit : 1);
    const visible = bounds.bottom > 0 && bounds.top < viewport && presence > .001;
    const moving = enabled && options.motionEnabled !== false && !reduced.matches && !document.hidden;
    const entryEnergy = pinned ? bell(smooth((progress - .49) / .25)) * smooth(arrival) : bell(entry);
    // A reversible displacement keeps the exact same hand position on a return scroll.
    // There is deliberately no independent CSS float: the 3D portrait, hand light and trail share these anchors.
    const drift = moving ? Math.sin((progress - .51) * Math.PI * 2) * 5 * entry : 0;
    surface.style.setProperty('--experience-character-entry', moving ? entry.toFixed(4) : '1');
    surface.style.setProperty('--experience-character-exit', moving && !continuous ? exit.toFixed(4) : '0');
    surface.style.setProperty('--experience-character-drift', `${drift.toFixed(3)}px`);
    surface.style.opacity = continuous ? String(presence) : '';
    surface.classList.toggle('experience-character-active', moving && visible);
    const anchors = measureAnchors();
    latest = {
      energy: moving && visible ? Math.max(entryEnergy, bell(exit) * .85) : 0,
      progress, arrival, entry, exit, visible, pinned,
      presence: visible ? presence : 0,
      ...anchors
    };
    return {...latest};
  }
  const reconcile = () => update();
  reduced.addEventListener('change', reconcile);
  window.addEventListener('resize', reconcile, {passive: true});
  document.addEventListener('visibilitychange', reconcile);
  portrait.decode().then(reconcile).catch(() => {});

  return {update, measureAnchors, setEnabled(value) {enabled = Boolean(value); update();}, dispose() {
    disposed = true;
    reduced.removeEventListener('change', reconcile);
    window.removeEventListener('resize', reconcile);
    document.removeEventListener('visibilitychange', reconcile);
    character.classList.remove('experience-character-active');
    if (artwork) character.append(artwork);
    stage.remove();
  }};
}
