const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const mix = (from, to, amount) => from + (to - from) * amount;
const ease = value => value * value * (3 - 2 * value);
const focusStops = [.18, .39, .60, .81];

/** A scroll scene with a readable, ordinary document layout as its fallback. */
export function createAelinShowcase(section) {
  if (!section) return {setEnabled() {}, update() {}};

  const stage = section.querySelector('.aelin-stage');
  const devices = [...section.querySelectorAll('.aelin-device[data-screen]')];
  const details = [...section.querySelectorAll('.aelin-detail[data-detail]')];
  const buttons = [...section.querySelectorAll('button[data-aelin-step]')];
  const counter = section.querySelector('.aelin-progress-number');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let requested = false;
  let animated = false;
  let visible = false;
  let active = -1;
  let pointerFrame = 0;
  let pointerX = 0;
  let pointerY = 0;
  let targetX = 0;
  let targetY = 0;

  function resetPointer() {
    if (pointerFrame) cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    pointerX = pointerY = targetX = targetY = 0;
    stage?.style.setProperty('--pointer-x', '0');
    stage?.style.setProperty('--pointer-y', '0');
  }

  function pointerTick() {
    pointerFrame = 0;
    if (!animated || !visible || !finePointer.matches || document.hidden) {
      resetPointer();
      return;
    }
    pointerX = mix(pointerX, targetX, .16);
    pointerY = mix(pointerY, targetY, .16);
    const unsettled = Math.abs(pointerX - targetX) + Math.abs(pointerY - targetY) > .015;
    if (!unsettled) {
      pointerX = targetX;
      pointerY = targetY;
    }
    stage.style.setProperty('--pointer-x', pointerX.toFixed(3));
    stage.style.setProperty('--pointer-y', pointerY.toFixed(3));
    if (unsettled) pointerFrame = requestAnimationFrame(pointerTick);
  }

  stage?.addEventListener('pointermove', event => {
    if (!animated || !visible || !finePointer.matches || event.pointerType !== 'mouse') return;
    const bounds = stage.getBoundingClientRect();
    targetX = (clamp((event.clientX - bounds.left) / Math.max(1, bounds.width)) * 2 - 1) * 5;
    targetY = (clamp((event.clientY - bounds.top) / Math.max(1, bounds.height)) * 2 - 1) * 5;
    if (!pointerFrame) pointerFrame = requestAnimationFrame(pointerTick);
  }, {passive: true});
  stage?.addEventListener('pointerleave', resetPointer);
  finePointer.addEventListener('change', resetPointer);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) resetPointer();
  });

  function select(index, force = false) {
    if (active === index && !force) return;
    active = index;
    section.dataset.activeScreen = String(index);
    devices.forEach(device => device.classList.toggle('is-active', Number(device.dataset.screen) === index));
    details.forEach(detail => {
      const current = Number(detail.dataset.detail) === index;
      const concealed = animated && !current;
      detail.hidden = concealed;
      detail.inert = concealed;
      if (concealed) detail.setAttribute('aria-hidden', 'true');
      else detail.removeAttribute('aria-hidden');
      detail.classList.toggle('is-active', current);
    });
    buttons.forEach(button => {
      const current = Number(button.dataset.aelinStep) === index;
      button.classList.toggle('is-active', current);
      if (current) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    if (counter) counter.textContent = `${String(index + 1).padStart(2, '0')} / 04`;
  }

  function reconcileLayout() {
    const next = requested && !reducedMotion.matches && innerWidth >= 1000 && innerHeight >= 700 && !!stage;
    if (next === animated) return;
    animated = next;
    section.classList.toggle('is-animated', animated);
    resetPointer();
    select(Math.max(0, active), true);
    if (!animated) {
      devices.forEach(device => {
        ['--device-x', '--device-y', '--device-scale', '--device-rotate', '--device-yaw', '--device-alpha']
          .forEach(property => device.style.removeProperty(property));
        device.style.removeProperty('z-index');
      });
      section.style.removeProperty('--aelin-progress');
    }
  }

  function focusPose(index, focus, width, deviceWidth) {
    const distance = index - focus;
    if (!distance) return {x: 0, y: 0, scale: 1, rotate: 0, yaw: 0, alpha: 1};
    const magnitude = Math.abs(distance);
    const direction = Math.sign(distance);
    const edge = Math.max(70, width / 2 - deviceWidth * .31 - 18);
    const flank = Math.min(width * .31, edge * .78);
    const separation = Math.max(8, (edge - flank) / 2);
    return {
      x: direction * Math.min(edge, flank + (magnitude - 1) * separation),
      y: 24 + magnitude * 14,
      scale: Math.max(.46, .69 - (magnitude - 1) * .09),
      rotate: direction * (3 + magnitude),
      yaw: -direction * (7 + magnitude * 2),
      alpha: 1
    };
  }

  function groupPose(index, width, deviceWidth, opening = false) {
    const scale = Math.min(.70, Math.max(.49, (width - 50) / Math.max(1, deviceWidth * 4.5)));
    const spacing = Math.min(width / 4.15, deviceWidth * scale * 1.08);
    const offset = index - 1.5;
    return {
      x: offset * spacing,
      y: opening ? 50 + Math.abs(offset) * 15 : Math.abs(offset) * 8,
      scale,
      rotate: opening ? offset * 3 : offset * 1.2,
      yaw: -offset * (opening ? 5 : 2),
      alpha: 1
    };
  }

  function render(progress) {
    const width = stage.clientWidth;
    const deviceWidth = devices[0]?.offsetWidth || Math.min(innerHeight * .61, 580) * 390 / 902;
    const frames = [
      {at: 0, pose: index => ({x: (index - 1.5) * 12, y: 130 + index * 12, scale: .58, rotate: 0, yaw: 0, alpha: 0})},
      {at: .07, pose: index => groupPose(index, width, deviceWidth, true)},
      {at: .135, focus: 0}, {at: .225, focus: 0},
      {at: .345, focus: 1}, {at: .435, focus: 1},
      {at: .555, focus: 2}, {at: .645, focus: 2},
      {at: .765, focus: 3},
      {at: 1, focus: 3}
    ];
    let frameIndex = 0;
    while (frameIndex < frames.length - 2 && progress > frames[frameIndex + 1].at) frameIndex++;
    const from = frames[frameIndex];
    const to = frames[frameIndex + 1];
    const amount = ease(clamp((progress - from.at) / (to.at - from.at)));
    devices.forEach(device => {
      const index = Number(device.dataset.screen);
      const start = from.pose ? from.pose(index) : focusPose(index, from.focus, width, deviceWidth);
      const end = to.pose ? to.pose(index) : focusPose(index, to.focus, width, deviceWidth);
      const value = key => mix(start[key], end[key], amount);
      device.style.setProperty('--device-x', `${value('x').toFixed(2)}px`);
      device.style.setProperty('--device-y', `${value('y').toFixed(2)}px`);
      device.style.setProperty('--device-scale', value('scale').toFixed(4));
      device.style.setProperty('--device-rotate', `${value('rotate').toFixed(3)}deg`);
      device.style.setProperty('--device-yaw', `${value('yaw').toFixed(3)}deg`);
      device.style.setProperty('--device-alpha', value('alpha').toFixed(3));
      device.style.zIndex = String(10 + Math.round(value('scale') * 100));
    });
    const index = focusStops.reduce((closest, stop, i) =>
      Math.abs(progress - stop) < Math.abs(progress - focusStops[closest]) ? i : closest, 0);
    select(index);
    section.style.setProperty('--aelin-progress', progress.toFixed(4));
  }

  function update() {
    reconcileLayout();
    const bounds = section.getBoundingClientRect();
    visible = bounds.bottom > 0 && bounds.top < innerHeight;
    if (!visible) resetPointer();
    if (!animated) return;
    const distance = Math.max(1, section.offsetHeight - innerHeight);
    render(clamp(-bounds.top / distance));
  }

  buttons.forEach(button => button.addEventListener('click', () => {
    const index = clamp(Number(button.dataset.aelinStep), 0, devices.length - 1);
    if (animated) {
      const start = section.getBoundingClientRect().top + scrollY;
      scrollTo({top: start + Math.max(1, section.offsetHeight - innerHeight) * focusStops[index], behavior: 'smooth'});
    } else {
      select(index);
      devices.find(device => Number(device.dataset.screen) === index)?.scrollIntoView({
        behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'center'
      });
    }
  }));

  select(0, true);
  return {
    setEnabled(value) {
      requested = Boolean(value);
      update();
    },
    update
  };
}
