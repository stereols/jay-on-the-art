const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const interpolate = (a, b, t) => ({x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t});
const cubic = (a, b, c, d, t) => {
  const s = 1 - t;
  return {x: s * s * s * a.x + 3 * s * s * t * b.x + 3 * s * t * t * c.x + t * t * t * d.x,
    y: s * s * s * a.y + 3 * s * s * t * b.y + 3 * s * t * t * c.y + t * t * t * d.y};
};

/** A persistent, small butterfly companion, visible only inside the Aelin story. */
export function createAelinCompanion(section = document.querySelector('#aelin-showcase')) {
  if (!section) return {update() {}, dispose() {}};
  const layer = document.createElement('div');
  layer.className = 'aelin-companion-layer';
  layer.dataset.owner = section.id;
  layer.innerHTML = `<button class="aelin-companion" type="button" aria-label="나비에게 인사하기 — 다른 자리로 날아갑니다" tabindex="-1" disabled>
    <span class="aelin-companion-art" aria-hidden="true">
      <img class="aelin-companion-wing aelin-companion-wing-left" src="assets/characters/pet-wing-left.webp" width="512" height="512" alt="" draggable="false">
      <img class="aelin-companion-wing aelin-companion-wing-right" src="assets/characters/pet-wing-right.webp" width="512" height="512" alt="" draggable="false">
      <img class="aelin-companion-body" src="assets/characters/pet-body.webp" width="512" height="512" alt="" draggable="false">
    </span>
  </button>`;
  // Fixed positioning lets the same companion stay with the long, unpinned mobile story.
  // Clipping below confines all pixels and hit targets to the section's visible part.
  document.body.append(layer);
  const button = layer.querySelector('button');
  const art = layer.querySelector('.aelin-companion-art');
  const leftWing = layer.querySelector('.aelin-companion-wing-left');
  const rightWing = layer.querySelector('.aelin-companion-wing-right');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let ready = false, disposed = false, motionEnabled = true, shown = false, moving = false;
  let raf = 0, previousTime = 0, clock = 0, deadline = 0, visit = 0, flight = null;
  let state = 'perched', pose = null, angle = 0, lastLayout = 0;
  let bounds = {left: 40, right: innerWidth - 40, top: 120, bottom: innerHeight - 80};
  let candidates = [], size = 61;

  const overlayOpen = () => !!document.querySelector('dialog[open],#mobile-nav:not([hidden]),#map-panel:not([hidden])') ||
    document.body.classList.contains('reading-resume');
  const inside = point => point.x >= bounds.left && point.x <= bounds.right && point.y >= bounds.top && point.y <= bounds.bottom;
  const usable = point => inside(point);
  const confined = point => ({x: clamp(point.x, bounds.left, bounds.right), y: clamp(point.y, bounds.top, bounds.bottom)});

  function refreshLayout(now) {
    lastLayout = now;
    const rect = section.getBoundingClientRect();
    const height = innerHeight;
    size = innerWidth <= 760 ? 47 : 61;
    const radius = size / 2;
    const top = Math.max(88, rect.top);
    const bottom = Math.min(height - 62, rect.bottom);
    bounds = {left: radius + 12, right: innerWidth - radius - 12, top: top + radius + 8, bottom: bottom - radius - 8};
    layer.style.clipPath = `inset(${Math.max(0, rect.top).toFixed(1)}px 0 ${Math.max(0, height - rect.bottom).toFixed(1)}px 0)`;
    candidates = [];
    if (bounds.bottom <= bounds.top || bounds.right <= bounds.left) return 0;
    const spanX = bounds.right - bounds.left, spanY = bounds.bottom - bounds.top;
    for (let row = 0; row <= 7; row++) {
      for (let column = 0; column <= 10; column++) {
        const point = {x: bounds.left + spanX * column / 10, y: bounds.top + spanY * row / 7};
        if (usable(point)) candidates.push(point);
      }
    }
    return smooth((bottom - top - size - 14) / 110);
  }

  function nearestSafe(point) {
    return candidates.reduce((best, next) => distance(point, next) < distance(point, best) ? next : best,
      candidates[0] || confined(point));
  }

  function controls(from, to, bend) {
    const length = Math.max(1, distance(from, to));
    const normal = {x: -(to.y - from.y) / length, y: (to.x - from.x) / length};
    const a = interpolate(from, to, .32), b = interpolate(from, to, .7);
    return [from, confined({x: a.x + normal.x * bend, y: a.y + normal.y * bend}),
      confined({x: b.x - normal.x * bend * .45, y: b.y - normal.y * bend * .45}), to];
  }

  function pathIsClear(path) {
    for (let step = 1; step <= 24; step++) {
      if (!usable(cubic(...path, step / 24))) return false;
    }
    return true;
  }

  function pickFlight(quick = false) {
    if (!pose || !candidates.length) return null;
    const span = bounds.right - bounds.left;
    const ideal = span * (quick ? .82 : .68);
    const destinationX = bounds.left + span * (quick ?
      (pose.x > (bounds.left+bounds.right)*.5 ? .08 : .92) :
      [.18,.90,.07,.78,.30,.96,.12,.68][visit % 8]);
    const destinationY = bounds.top + (bounds.bottom - bounds.top) *
      ([.23,.77,.38,.88,.14,.59][visit % 6]);
    const choices = candidates.map((point, index) => ({point, score:
      Math.abs(distance(pose, point) - ideal) * .18 + Math.abs(point.x - destinationX) +
      Math.abs(point.y - destinationY) * .7 +
      20 * Math.sin(index * 2.4 + visit * 1.7)}))
      .filter(({point}) => Math.abs(point.x - pose.x) > span * .42)
      .sort((a, b) => a.score - b.score);
    for (const {point} of choices) {
      const sign = visit % 2 ? -1 : 1;
      const bend = Math.min(distance(pose, point) * .4, (bounds.bottom - bounds.top) * .46);
      for (const amount of [bend * sign, -bend * sign, bend * .3, 0]) {
        const path = controls({...pose}, point, amount);
        if (pathIsClear(path)) return path;
      }
    }
    return null;
  }

  function depart(quick = false) {
    visit++;
    const path = pickFlight(quick);
    if (!path) { state = 'perched'; deadline = clock + 1600; return; }
    flight = {path, start: clock, duration: quick ? 780 : 3400 + Math.min(2200, distance(path[0], path[3]) * 1.8)};
    state = quick ? 'darting' : 'flying';
    button.dataset.state = state;
  }

  function paint(now) {
    if (!pose) return;
    const resting = state === 'perched' || !moving;
    const drift = moving ? Math.sin(now * .0017) * (resting ? 1 : 2) : 0;
    button.style.transform = `translate3d(${pose.x.toFixed(2)}px,${(pose.y + drift).toFixed(2)}px,0) translate(-50%,-50%)`;
    art.style.transform = `rotate(${angle.toFixed(2)}deg) scale(${resting ? 1 : 1.025})`;
    const flap = moving ? Math.sin(now * (resting ? .0034 : state === 'darting' ? .052 : .039)) : 0;
    const wingAngle = resting ? 14 + flap * 7 : 18 + flap * 36;
    leftWing.style.transform = `rotateY(${wingAngle.toFixed(2)}deg) rotateZ(${(-flap * 2).toFixed(2)}deg)`;
    rightWing.style.transform = `rotateY(${(-wingAngle).toFixed(2)}deg) rotateZ(${(flap * 2).toFixed(2)}deg)`;
    layer.dataset.state = state;
    button.dataset.state = state;
  }

  function tick(now) {
    raf = 0;
    if (!shown || !moving || document.hidden || disposed) return;
    clock += previousTime ? Math.min(40, now - previousTime) : 0;
    previousTime = now;
    if (now - lastLayout > 360) {
      refreshLayout(now);
      settleInClearSpace();
    }
    if (flight) {
      const progress = clamp((clock - flight.start) / flight.duration);
      const t = smooth(progress), before = pose;
      pose = cubic(...flight.path, t);
      const direction = clamp((pose.x - before.x) * 6, -16, 16);
      angle += (direction - angle) * .12;
      if (progress === 1) {
        flight = null;
        state = 'perched';
        deadline = clock + 2300 + (visit % 4) * 650;
      }
    } else {
      angle *= .92;
      if (clock >= deadline) depart();
    }
    paint(clock);
    raf = requestAnimationFrame(tick);
  }

  function stop() { cancelAnimationFrame(raf); raf = 0; previousTime = 0; }

  function settleInClearSpace() {
    if (!pose) {
      pose = nearestSafe({x: innerWidth * .24, y: innerHeight * .34});
      state = 'perched';
      deadline = clock + 1100;
      return;
    }
    if (usable(pose) || flight && usable(flight.path[3])) return;
    const destination = nearestSafe(pose);
    if (moving && distance(pose, destination) > 3) {
      flight = {path: controls({...pose}, destination, 24), start: clock, duration: 650};
      state = 'flying';
    } else {
      pose = destination;
      flight = null;
      state = 'perched';
      deadline = clock + 1100;
    }
  }

  function update(options = {}) {
    if (disposed) return;
    if ('motionEnabled' in options) motionEnabled = options.motionEnabled !== false;
    const now = performance.now();
    const alpha = refreshLayout(now);
    const available = ready && alpha > .005 && candidates.length && !document.hidden && !overlayOpen();
    shown = Boolean(available);
    moving = shown && motionEnabled && !reduced.matches;
    layer.style.opacity = shown ? alpha.toFixed(3) : '0';
    layer.style.visibility = shown ? 'visible' : 'hidden';
    layer.dataset.active = String(shown);
    button.disabled = !shown || alpha < .7;
    button.tabIndex = button.disabled ? -1 : 0;
    if (!shown) {
      stop();
      if (document.activeElement === button) button.blur();
      return;
    }
    settleInClearSpace();
    if (!moving) { stop(); angle = 0; paint(clock); }
    else if (!raf) { paint(clock); raf = requestAnimationFrame(tick); }
  }

  function react() {
    if (!shown || button.disabled) return;
    refreshLayout(performance.now());
    if (moving) {
      depart(true);
      if (!raf) raf = requestAnimationFrame(tick);
    } else {
      const destination = candidates.filter(point => distance(point, pose) > size * 2);
      if (destination.length) pose = destination[(visit++ * 17) % destination.length];
      paint(clock);
    }
  }

  const reconcile = () => update();
  const observer = new MutationObserver(reconcile);
  for (const element of document.querySelectorAll('#mobile-nav,#map-panel,dialog')) {
    observer.observe(element, {attributes: true, attributeFilter: ['hidden', 'open']});
  }
  // Resume/modal state can change without a scroll event.
  observer.observe(document.body, {attributes: true, attributeFilter: ['class']});
  button.addEventListener('click', react);
  document.addEventListener('visibilitychange', reconcile);
  window.addEventListener('resize', reconcile, {passive: true});
  reduced.addEventListener('change', reconcile);
  Promise.all([...layer.querySelectorAll('img')].map(image => image.decode())).then(() => {
    if (!disposed) { ready = true; update(); }
  }).catch(() => { ready = false; update(); });
  update();

  return {update, dispose() {
    disposed = true;
    stop();
    observer.disconnect();
    button.removeEventListener('click', react);
    document.removeEventListener('visibilitychange', reconcile);
    window.removeEventListener('resize', reconcile);
    reduced.removeEventListener('change', reconcile);
    layer.remove();
  }};
}
