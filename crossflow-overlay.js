const NS = 'http://www.w3.org/2000/svg';
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
const MAX_WINDOWS = 30;
let sequence = 0;
const CONTENT = [
  '.career-project-visual', '.project-image', '.tile-image', '.aelin-device-surface',
  '.profile-portrait', '.career-art', '.experience-character', 'video', '.aelin-wordmark', '.brand-logo',
  'h1', 'h2', 'h3', 'h4', 'p', 'a', 'button', 'input', 'textarea', 'select',
  'summary', '.career-project-detail', '.career-period', '.process-list li>span'
].join(',');

function node(name, attributes = {}) {
  const element = document.createElementNS(NS, name);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
  return element;
}

// This is the same camera-relative curve as cosmos-crossflow.js, including
// its local depth and the GLSL mat2 column order. Scroll reversal is exact.
function curve(route, lane, offset, width, height) {
  const points = [];
  const direction = lane < .5 ? 1 : -1;
  const slope = direction * (.52 + .16 * Math.sin(route * .83 + lane));
  const turn = Math.sin(route * .57) * .17;
  const cos = Math.cos(turn), sin = Math.sin(turn);
  for (let i = 0; i <= 80; i++) {
    const t = (i / 80 * 2 - 1) * 2.2;
    const bend = Math.sin(t * 1.15 + route * .68 + lane * 1.3) * (.23 + .09 * Math.sin(route * .7));
    const x = t - .36 * Math.cos(route * .92);
    const y = slope * t + bend + offset - .12 + Math.sin(route * .95) * .37;
    const depth = Math.sin(t * 1.4 + route * .72 + lane * 2.4) * 1.7 - lane * .35;
    const perspective = 19 / (19 - depth);
    const px = ((cos * x + sin * y) * perspective + 1) * width / 2;
    const py = (1 - (-sin * x + cos * y) * perspective) * height / 2;
    points.push(`${i ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`);
  }
  return points.join(' ');
}

function union(a, b) {
  return {left: Math.min(a.left, b.left), top: Math.min(a.top, b.top),
    right: Math.max(a.right, b.right), bottom: Math.max(a.bottom, b.bottom)};
}
const area = r => (r.right - r.left) * (r.bottom - r.top);
const contains = (a, b) => a.left <= b.left && a.top <= b.top && a.right >= b.right && a.bottom >= b.bottom;

/** Fixed decorative layer for the gaps above opaque chapter backgrounds.
 * Call after the existing scene DOM transforms have been applied. No clock,
 * event listener or animation loop is created by this module.
 */
export function createCrossflowOverlay() {
  const id = `crossflow-reading-mask-${++sequence}`;
  const svg = node('svg', {class: 'crossflow-overlay', 'aria-hidden': 'true', focusable: 'false', width: '100%', height: '100%'});
  const defs = node('defs');
  const filter = node('filter', {id: `${id}-soft`, x: '-5%', y: '-5%', width: '110%', height: '110%', 'color-interpolation-filters': 'sRGB'});
  const blur = node('feGaussianBlur', {stdDeviation: '4'});
  filter.append(blur);
  const mask = node('mask', {id, maskUnits: 'userSpaceOnUse', maskContentUnits: 'userSpaceOnUse', 'mask-type': 'luminance'});
  const paper = node('rect', {width: '100%', height: '100%', fill: 'white'});
  const cuts = node('g', {fill: 'black', filter: `url(#${id}-soft)`});
  const windows = Array.from({length: MAX_WINDOWS}, () => node('rect', {width: '0', height: '0', rx: '4'}));
  cuts.append(...windows);
  mask.append(paper, cuts);
  defs.append(filter, mask);
  const artwork = node('g', {mask: `url(#${id})`, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round'});
  const lines = [];
  function addLine(lane, offset, color, alpha, thick = false) {
    const path = node('path', {stroke: color, 'stroke-opacity': alpha});
    artwork.append(path);
    lines.push({path, lane, offset, thick});
  }
  addLine(0, 0, '#FF616B', .19, true);
  addLine(1, .035, '#635B61', .08, true);
  for (const lane of [0, 1]) {
    for (const offset of [-.09, -.045, .045, .09]) addLine(lane, offset, lane ? '#93888A' : '#FF616B', lane ? .25 : .34);
  }
  svg.append(defs, artwork);
  document.body.append(svg);
  // The content set is stable; only the current screen geometry is sampled.
  const content = [...document.querySelectorAll(CONTENT)].filter(element => !svg.contains(element));
  let lastGeometry = '', lastCurve = '', route = 1.9, wasEnabled = false;
  let accent = 0, passageProgress = 0;
  let disposed = false;

  function updateMask(width, height, mobile) {
    const boxes = [], styleCache = new Map();
    const style = element => {
      if (!styleCache.has(element)) styleCache.set(element, getComputedStyle(element));
      return styleCache.get(element);
    };
    const visible = element => {
      let alpha = 1;
      for (let ancestor = element; ancestor && ancestor !== document.body; ancestor = ancestor.parentElement) {
        if (ancestor.hidden) return false;
        const value = style(ancestor);
        if (value.display === 'none' || value.visibility === 'hidden') return false;
        // Reveal fades can finish after the last scroll update; reserve their
        // content before the fade instead of painting over it while idle.
        alpha *= ancestor.matches('.reveal, .career-item') ? 1 : Number(value.opacity);
        if (alpha < .045) return false;
      }
      return true;
    };
    const pad = mobile ? 9 : 14;
    for (const element of content) {
      const bounds = element.getBoundingClientRect();
      if (!bounds.width || !bounds.height || bounds.bottom <= 0 || bounds.top >= height || bounds.right <= 0 || bounds.left >= width || !visible(element)) continue;
      const box = {left: Math.max(-pad, bounds.left - pad), top: Math.max(-pad, bounds.top - pad),
        right: Math.min(width + pad, bounds.right + pad), bottom: Math.min(height + pad, bounds.bottom + pad)};
      if (boxes.some(existing => contains(existing, box))) continue;
      for (let i = boxes.length - 1; i >= 0; i--) if (contains(box, boxes[i])) boxes.splice(i, 1);
      boxes.push(box);
    }
    // Dense screens stay at 30 mask primitives. Merge the nearest two boxes
    // with the least extra area, rather than leaving any text unprotected.
    while (boxes.length > MAX_WINDOWS) {
      let pair = [0, 1], cost = Infinity;
      for (let a = 0; a < boxes.length - 1; a++) {
        for (let b = a + 1; b < boxes.length; b++) {
          const extra = area(union(boxes[a], boxes[b])) - area(boxes[a]) - area(boxes[b]);
          if (extra < cost) { cost = extra; pair = [a, b]; }
        }
      }
      boxes[pair[0]] = union(boxes[pair[0]], boxes[pair[1]]);
      boxes.splice(pair[1], 1);
    }
    windows.forEach((rect, index) => {
      const bounds = boxes[index];
      if (!bounds) { rect.setAttribute('width', '0'); return; }
      rect.setAttribute('x', bounds.left.toFixed(1));
      rect.setAttribute('y', bounds.top.toFixed(1));
      rect.setAttribute('width', (bounds.right - bounds.left).toFixed(1));
      rect.setAttribute('height', (bounds.bottom - bounds.top).toFixed(1));
    });
    blur.setAttribute('stdDeviation', mobile ? '2.5' : '4');
  }

  return {
    update(scene = {}, {visibility = 1, motionEnabled = true, emphasis = 0, experienceProgress = 0} = {}) {
      if (disposed) return;
      const width = innerWidth, height = innerHeight, mobile = width <= 760;
      const absoluteRoute = Number.isFinite(scene.orbit) ? scene.orbit : 0;
      // Pausing freezes the current drawing, while an initially reduced view
      // gets one composed still pose independent of the scroll direction.
      if (motionEnabled) {
        route = absoluteRoute;
        accent = clamp(emphasis);
        passageProgress = clamp(experienceProgress);
      }
      else if (wasEnabled) lastCurve = '';
      wasEnabled = motionEnabled;
      // Both ends meet the ordinary path exactly; the passage opens into a
      // wider sweep around its planet and portrait, then rejoins the route.
      const passageArc = Math.sin(passageProgress * Math.PI) * accent;
      const curveRoute = route + passageArc * .36;
      const arrival = smooth((absoluteRoute - .10) / .55);
      const night = clamp(scene.night || 0);
      const alpha = clamp(visibility) * arrival * (1 - night * .45) * (1 + accent * .16) * (mobile ? .85 : 1);
      svg.style.opacity = alpha.toFixed(4);
      svg.style.setProperty('--crossflow-center', (.48 - night * .43).toFixed(3));
      svg.style.visibility = alpha < .002 ? 'hidden' : 'visible';
      if (alpha < .002) return;
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      mask.setAttribute('width', String(width));
      mask.setAttribute('height', String(height));
      const curveKey = `${curveRoute.toFixed(5)}:${accent.toFixed(4)}:${passageArc.toFixed(4)}:${width}:${height}`;
      if (curveKey !== lastCurve) {
        lines.forEach((line, index) => {
          const skip = mobile && !line.thick && index % 2 === 1;
          line.path.style.display = skip ? 'none' : '';
          if (skip) return;
          const offset = line.offset * (1 + passageArc * .28) + passageArc * (line.lane ? .09 : -.065);
          line.path.setAttribute('d', curve(curveRoute, line.lane, offset, width, height));
          const ribbonWidth = height * (line.lane ? .013 : .021);
          line.path.setAttribute('stroke-width', String(line.thick ? clamp(ribbonWidth, 8, 22) * (1 + passageArc * .3) * (mobile ? .58 : 1) : mobile ? .65 : .9));
        });
        lastCurve = curveKey;
      }
      const geometryKey = `${scrollY}:${width}:${height}:${scene.id}:${scene.progress}:${scene.worldPhase}:${document.documentElement.scrollHeight}:${motionEnabled}:${experienceProgress}`;
      if (geometryKey !== lastGeometry) {
        updateMask(width, height, mobile);
        lastGeometry = geometryKey;
      }
    },
    dispose() { disposed = true; svg.remove(); }
  };
}
