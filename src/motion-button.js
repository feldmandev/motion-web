const feldmanFontUrl = new URL('./fonts/feldman_font.ttf', import.meta.url).href;
const materialSymbolsUrl = new URL('./fonts/material_symbols_rounded.ttf', import.meta.url).href;

function ensureMotionStyles() {
  if (document.getElementById('motion-web-fonts')) return;
  const style = document.createElement('style');
  style.id = 'motion-web-fonts';
  style.textContent = `
    @font-face {
      font-family: 'Motion Feldman Font';
      src: url('${feldmanFontUrl}') format('truetype');
      font-weight: 1 1000;
      font-stretch: 25% 151%;
      font-style: normal;
    }
    @font-face {
      font-family: 'Motion Material Symbols Rounded';
      src: url('${materialSymbolsUrl}') format('truetype');
      font-weight: 100 700;
      font-style: normal;
    }
    @property --motion-symbol-fill {
      syntax: '<number>';
      inherits: true;
      initial-value: 0;
    }
  `;
  document.head.append(style);
}

// Name of the event MotionButton/MotionSplitButton listen for to re-resolve
// the inherited `--motion-level` default at runtime.
export const MOTION_LEVEL_CHANGE_EVENT = 'motion-level-change';

// Set the site-wide default motion level by writing the inherited
// `--motion-level` custom property (declarative equivalent: a CSS rule such as
// `:root { --motion-level: high }`). Individual controls that set their own
// `motion-level` attribute keep their value. Dispatches an event so already
// rendered controls re-resolve immediately.
export function setDefaultMotionLevel(level, target = document.documentElement) {
  if (level) target.style.setProperty('--motion-level', level);
  else target.style.removeProperty('--motion-level');
  document.dispatchEvent(new CustomEvent(MOTION_LEVEL_CHANGE_EVENT));
}

const motionSpecs = {
  none: {
    corner: { type: 'snap' },
    font: { type: 'snap' },
    color: { duration: 0, easing: 'linear' },
    symbol: { duration: 0, easing: 'linear' },
  },
  low: {
    corner: { type: 'spring', dampingRatio: 0.42, stiffness: 1050 },
    font: { type: 'spring', dampingRatio: 0.32, stiffness: 800 },
    color: { duration: 90, easing: 'linear' },
    symbol: { duration: 100, easing: 'cubic-bezier(0, 0, .2, 1)' },
  },
  medium: {
    corner: { type: 'spring', dampingRatio: 0.4, stiffness: 400 },
    font: { type: 'spring', dampingRatio: 0.3, stiffness: 400 },
    color: { duration: 120, easing: 'cubic-bezier(.4, 0, .2, 1)' },
    symbol: { duration: 140, easing: 'cubic-bezier(.4, 0, .2, 1)' },
  },
  high: {
    corner: { type: 'spring', dampingRatio: 0.25, stiffness: 250 },
    font: { type: 'spring', dampingRatio: 0.25, stiffness: 250 },
    color: { duration: 160, easing: 'cubic-bezier(.4, 0, .2, 1)' },
    symbol: { duration: 180, easing: 'cubic-bezier(.4, 0, .2, 1)' },
  },
};

const styles = `
  :host {
    display: inline-block;
    max-width: 100%;
    vertical-align: middle;
  }

  button {
    position: relative;
    isolation: isolate;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--motion-button-content-gap, 8px);
    box-sizing: border-box;
    width: var(--motion-button-width, auto);
    /* Never let the min-width force the button wider than an explicit width. */
    min-width: min(var(--motion-button-min-width, 58px), var(--motion-button-width, 9999px));
    height: var(--motion-button-height, 80px);
    margin: 0;
    overflow: hidden;
    border-style: solid;
    border-width: var(--motion-outline-width, 0px);
    border-color: var(--motion-outline-color, transparent);
    border-radius: var(--motion-radius, 999px);
    padding: var(--motion-button-padding, 0);
    color: var(--motion-fg, var(--mat-sys-on-primary, #fff));
    background-color: var(--motion-bg, var(--mat-sys-primary, #65558f));
    cursor: pointer;
    appearance: none;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    transition:
      background-color var(--motion-color-duration, 120ms) var(--motion-color-easing, cubic-bezier(.4, 0, .2, 1)),
      color var(--motion-color-duration, 120ms) var(--motion-color-easing, cubic-bezier(.4, 0, .2, 1)),
      border-color var(--motion-color-duration, 120ms) var(--motion-color-easing, cubic-bezier(.4, 0, .2, 1));
  }

  :host([vertical]) button { flex-direction: column; }

  :host([icon-trailing]:not([vertical])) button { flex-direction: row-reverse; }

  button:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--motion-bg, #65558f), transparent 38%);
    outline-offset: 3px;
  }

  button:disabled {
    color: color-mix(in srgb, var(--mat-sys-surface, #fff) 62%, var(--mat-sys-on-surface-variant, #49454f) 38%);
    background-color: color-mix(in srgb, var(--mat-sys-surface, #fff) 90%, var(--mat-sys-on-surface, #1d1b20) 10%);
    border-color: color-mix(in srgb, var(--mat-sys-surface, #fff) 62%, var(--motion-outline-color, transparent) 38%);
    cursor: default;
  }

  ::slotted([hidden]) { display: none !important; }

  ::slotted(.icon),
  ::slotted(.label) {
    position: relative;
    z-index: 1;
    pointer-events: none;
  }

  ::slotted(.icon) {
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    width: var(--motion-button-icon-size, 24px);
    height: var(--motion-button-icon-size, 24px);
    font-family: 'Motion Material Symbols Rounded';
    font-size: calc(var(--motion-button-icon-size, 24px) * .92);
    font-style: normal;
    font-weight: normal;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    white-space: nowrap;
    font-feature-settings: 'liga';
    font-variation-settings:
      'FILL' var(--motion-symbol-fill, 0),
      'wght' var(--motion-symbol-weight, 400),
      'GRAD' var(--motion-symbol-grad, 100),
      'opsz' var(--motion-symbol-opsz, 24);
    -webkit-font-smoothing: antialiased;
    transition: --motion-symbol-fill var(--motion-symbol-duration, 140ms) var(--motion-symbol-easing, cubic-bezier(.4, 0, .2, 1));
  }

  ::slotted(.label) {
    overflow: visible;
    font-family: 'Motion Feldman Font';
    font-size: var(--motion-button-font-size, 24px);
    font-style: normal;
    line-height: 1.15;
    text-align: start;
    text-overflow: clip;
    white-space: nowrap;
    font-variation-settings:
      'wght' var(--motion-font-weight, 600),
      'wdth' var(--motion-font-width, 100),
      'ROND' var(--motion-font-round, 200);
  }

  :host(:not([vertical])) ::slotted(.label) {
    flex-shrink: 0;
  }

  :host([vertical]) ::slotted(.label) {
    text-align: center;
    white-space: normal;
  }

  .ripple {
    position: absolute;
    z-index: 0;
    border-radius: 50%;
    background: currentColor;
    pointer-events: none;
    animation: motion-ripple 520ms cubic-bezier(.2, 0, 0, 1) forwards;
  }

  @keyframes motion-ripple {
    from { opacity: .18; transform: scale(0); }
    to { opacity: 0; transform: scale(1); }
  }

  @media (prefers-reduced-motion: reduce) {
    button, .icon { transition-duration: .01ms !important; }
    .ripple { animation-duration: .01ms; }
  }
`;

const fontAxes = {
  default: () => ({ weight: 600, width: 100, round: 200 }),
  defaultPressed: level => level === 'high'
    ? { weight: 500, width: 115, round: 200 }
    : level === 'medium'
      ? { weight: 550, width: 110, round: 200 }
      : level === 'low'
        ? { weight: 500, width: 105, round: 200 }
        : { weight: 600, width: 100, round: 200 },
  selected: () => ({ weight: 600, width: 110, round: 200 }),
  selectedPressed: level => level === 'high'
    ? { weight: 500, width: 85, round: 200 }
    : level === 'medium'
      ? { weight: 550, width: 90, round: 200 }
      : level === 'low'
        ? { weight: 500, width: 95, round: 200 }
        : { weight: 600, width: 110, round: 200 },
};

const symbolAxes = {
  default: () => ({ weight: 400, fill: 0, grad: 100, opsz: 24 }),
  defaultPressed: level => level === 'high'
    ? { weight: 200, fill: 0, grad: 50, opsz: 30 }
    : level === 'medium'
      ? { weight: 300, fill: 0, grad: 70, opsz: 10 }
      : level === 'low'
        ? { weight: 700, fill: 0, grad: 40, opsz: 12 }
        : { weight: 400, fill: 0, grad: 100, opsz: 24 },
  selected: level => level === 'none'
    ? { weight: 700, fill: 1, grad: 100, opsz: 24 }
    : level === 'low'
      ? { weight: 600, fill: 1, grad: 100, opsz: 12 }
      : { weight: 500, fill: 1, grad: 100, opsz: 24 },
  selectedPressed: level => level === 'high'
    ? { weight: 200, fill: 1, grad: -30, opsz: 16 }
    : level === 'medium'
      ? { weight: 300, fill: 1, grad: 0, opsz: 20 }
      : level === 'low'
        ? { weight: 300, fill: 1, grad: 20, opsz: 24 }
        : { weight: 700, fill: 1, grad: 100, opsz: 24 },
};

export class MotionButton extends HTMLElement {
  static observedAttributes = [
    'icon', 'label', 'aria-label', 'selected', 'disabled', 'vertical',
    'haptics-enabled', 'motion-level', 'width', 'height', 'font-size',
    'icon-size', 'content-padding', 'content-gap',
  ];

  #button;
  #icon;
  #label;
  #pressTimer = null;
  #pulseTimer = null;
  #axesPulse = false;
  #rippleTimer = null;
  #frame = null;
  #lastFrameTime = 0;
  #visuallyPressed = false;
  #initialized = false;
  #ready = false;
  #resizeObserver;
  #defaultState = {};
  #defaultPressedState = {};
  #selectedState = {};
  #selectedPressedState = {};
  #motionSpec = null;
  #values = {};
  #targets = {};
  #velocities = {};
  #resolvedLevel = 'medium';
  #onLevelChange = () => {
    if (this.hasAttribute('motion-level')) return;
    this.#resolveLevel();
    this.#syncTargetState();
  };

  constructor() {
    super();
    ensureMotionStyles();
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>${styles}</style>
      <button part="button" type="button" disabled>
        <slot name="icon"></slot>
        <slot name="label"></slot>
      </button>
    `;
    this.#button = root.querySelector('button');
    this.#resizeObserver = new ResizeObserver(() => this.#renderNumericState());

    this.#button.addEventListener('pointerdown', event => this.#onPointerDown(event));
    for (const type of ['pointerup', 'pointercancel', 'pointerleave', 'blur']) {
      this.#button.addEventListener(type, () => this.#endPress());
    }
    this.#button.addEventListener('keydown', event => this.#onKeyDown(event));
    this.#button.addEventListener('keyup', event => {
      if (event.key === ' ' || event.key === 'Enter') this.#endPress();
    });
  }

  connectedCallback() {
    this.#ensureContent();
    this.#resizeObserver.observe(this.#button);
    document.addEventListener(MOTION_LEVEL_CHANGE_EVENT, this.#onLevelChange);
    this.#initialized = false;
    queueMicrotask(() => {if (!this.isConnected) return; this.#ready = true; this.#resolveLevel(); this.#sync();});
  }

  disconnectedCallback() {
    this.#ready = false;
    this.#endPress();
    this.#resizeObserver.disconnect();
    document.removeEventListener(MOTION_LEVEL_CHANGE_EVENT, this.#onLevelChange);
    clearTimeout(this.#rippleTimer);
    cancelAnimationFrame(this.#frame);
    this.#frame = null;
    this.#button.style.width = "";
  }

  attributeChangedCallback() {
    this.#resolveLevel();
    this.#sync();
  }

  // Own `motion-level` attribute wins; otherwise inherit the `--motion-level`
  // custom property (the site-wide default); otherwise 'medium'.
  #resolveLevel() {
    const own = this.getAttribute('motion-level');
    this.#resolvedLevel = own
      || (this.isConnected ? getComputedStyle(this).getPropertyValue('--motion-level').trim() : '')
      || 'medium';
  }

  get icon() { return this.getAttribute('icon') ?? ''; }
  set icon(value) { this.#setStringAttribute('icon', value); }
  get label() { return this.getAttribute('label') ?? ''; }
  set label(value) { this.#setStringAttribute('label', value); }
  get selected() { return this.hasAttribute('selected'); }
  set selected(value) { this.toggleAttribute('selected', Boolean(value)); }
  get disabled() { return this.hasAttribute('disabled'); }
  set disabled(value) { this.toggleAttribute('disabled', Boolean(value)); }
  get motionLevel() { return this.#resolvedLevel; }
  set motionLevel(value) { this.#setStringAttribute('motion-level', value); }
  get motionSpec() { return this.#motionSpec; }
  set motionSpec(value) { this.#motionSpec = value; this.#syncTargetState(); }
  get defaultState() { return this.#defaultState; }
  set defaultState(value) { this.#defaultState = value ?? {}; this.#syncTargetState(); }
  get defaultPressedState() { return this.#defaultPressedState; }
  set defaultPressedState(value) { this.#defaultPressedState = value ?? {}; this.#syncTargetState(); }
  get selectedState() { return this.#selectedState; }
  set selectedState(value) { this.#selectedState = value ?? {}; this.#syncTargetState(); }
  get selectedPressedState() { return this.#selectedPressedState; }
  set selectedPressedState(value) { this.#selectedPressedState = value ?? {}; this.#syncTargetState(); }

  focus(options) {
    this.#button.focus(options);
  }

  #sync() {
    if (!this.#ready || !this.#button || !this.#icon || !this.#label) return;
    const icon = this.icon;
    const label = this.label;
    this.#icon.textContent = icon;
    this.#icon.hidden = !icon;
    this.#label.textContent = label;
    this.#label.hidden = !label;
    this.#button.disabled = this.disabled;
    this.#button.setAttribute('aria-label', this.getAttribute('aria-label') || label || icon);
    this.#button.setAttribute('aria-pressed', String(this.selected));

    this.#setSize('--motion-button-width', this.getAttribute('width'));
    this.#setSize('--motion-button-height', this.getAttribute('height'));
    this.#setSize('--motion-button-font-size', this.getAttribute('font-size'));
    this.#setSize('--motion-button-icon-size', this.getAttribute('icon-size'));
    this.#setSize('--motion-button-content-gap', this.getAttribute('content-gap'));
    const contentPadding = this.getAttribute('content-padding');
    if (contentPadding === null) this.#button.style.removeProperty('--motion-button-padding');
    else this.#button.style.setProperty('--motion-button-padding', contentPadding);
    this.#syncTargetState();
  }

  #ensureContent() {
    this.#icon = this.querySelector('[data-motion-icon]');
    if (!this.#icon) {
      this.#icon = document.createElement('span');
      this.#icon.dataset.motionIcon = '';
      this.#icon.className = 'icon';
      this.#icon.slot = 'icon';
      this.#icon.setAttribute('aria-hidden', 'true');
      this.append(this.#icon);
    }
    this.#label = this.querySelector('[data-motion-label]');
    if (!this.#label) {
      this.#label = document.createElement('span');
      this.#label.dataset.motionLabel = '';
      this.#label.className = 'label';
      this.#label.slot = 'label';
      this.append(this.#label);
    }
  }

  #syncTargetState() {
    if (!this.#ready) return;
    if (!this.#button) return;
    const state = this.#currentState();
    const spec = this.#currentSpec();
    let fontAxesNow = state.fontAxes;
    let symbolAxesNow = state.symbolAxes;
    if (this.#axesPulse) {
      const pressed = this.selected ? this.#resolveSelectedPressed() : this.#resolveDefaultPressed();
      fontAxesNow = pressed.fontAxes;
      symbolAxesNow = pressed.symbolAxes;
    }
    this.#button.style.setProperty('--motion-bg', state.backgroundColor);
    this.#button.style.setProperty('--motion-fg', state.contentColor);
    this.#button.style.setProperty('--motion-outline-color', state.outlineColor);
    this.#button.style.setProperty('--motion-color-duration', `${spec.color.duration}ms`);
    this.#button.style.setProperty('--motion-color-easing', spec.color.easing);
    this.#button.style.setProperty('--motion-symbol-duration', `${spec.symbol.duration}ms`);
    this.#button.style.setProperty('--motion-symbol-easing', spec.symbol.easing);
    this.#button.style.setProperty('--motion-font-round', String(fontAxesNow.round));
    this.#button.style.setProperty('--motion-symbol-fill', String(symbolAxesNow.fill));

    this.#targets = {
      cornerRadius: state.cornerRadius,
      outlineWidth: state.outlineWidth,
      fontWeight: fontAxesNow.weight,
      fontWidth: fontAxesNow.width,
      symbolWeight: symbolAxesNow.weight,
      symbolGrad: symbolAxesNow.grad,
      symbolOpsz: symbolAxesNow.opsz,
    };

    if (!this.#initialized || this.#prefersReducedMotion() || this.motionLevel === 'none') {
      this.#values = { ...this.#targets };
      this.#velocities = Object.fromEntries(Object.keys(this.#targets).map(key => [key, 0]));
      this.#initialized = true;
      this.#renderNumericState();
      this.#releaseWidth();
      return;
    }

    if (!this.#frame) {
      this.#lastFrameTime = performance.now();
      this.#frame = requestAnimationFrame(time => this.#animate(time));
    }
  }

  #animate(time) {
    const elapsed = Math.min((time - this.#lastFrameTime) / 1000, 1 / 20);
    this.#lastFrameTime = time;
    const spec = this.#currentSpec();
    let moving = false;

    for (const key of Object.keys(this.#targets)) {
      const spring = key === 'cornerRadius' || key === 'outlineWidth' ? spec.corner : spec.font;
      const next = stepSpring(this.#values[key], this.#velocities[key], this.#targets[key], elapsed, spring);
      this.#values[key] = next.value;
      this.#velocities[key] = next.velocity;
      if (!next.finished) moving = true;
    }

    this.#renderNumericState();
    if (moving) {
      this.#frame = requestAnimationFrame(nextTime => this.#animate(nextTime));
    } else {
      this.#frame = null;
      this.#releaseWidth();
    }
  }

  #releaseWidth() {
    if (!this.#visuallyPressed && !this.#axesPulse && this.#pressTimer === null) this.#button.style.width = "";
  }

  #renderNumericState() {
    if (!this.#initialized) return;
    const radiusPercent = Math.min(100, Math.max(0, Math.round(this.#values.cornerRadius)));
    const radiusPx = Math.min(this.#button.clientWidth, this.#button.clientHeight) * radiusPercent / 100;
    this.#button.style.setProperty('--motion-radius', `${radiusPx}px`);
    this.#button.style.setProperty('--motion-outline-width', `${Math.max(0, this.#values.outlineWidth)}px`);
    this.#button.style.setProperty('--motion-font-weight', String(Math.round(this.#values.fontWeight)));
    this.#button.style.setProperty('--motion-font-width', String(this.#values.fontWidth));
    this.#button.style.setProperty('--motion-symbol-weight', String(Math.round(this.#values.symbolWeight)));
    this.#button.style.setProperty('--motion-symbol-grad', String(this.#values.symbolGrad));
    this.#button.style.setProperty('--motion-symbol-opsz', String(this.#values.symbolOpsz));
  }

  #currentState() {
    if (this.selected) return this.#visuallyPressed ? this.#resolveSelectedPressed() : this.#resolveSelected();
    return this.#visuallyPressed ? this.#resolveDefaultPressed() : this.#resolveDefault();
  }

  #resolveDefault() {
    return mergeState({
      backgroundColor: 'var(--motion-button-background, var(--mat-sys-primary, #65558f))',
      contentColor: 'var(--motion-button-color, var(--mat-sys-on-primary, #fff))',
      cornerRadius: 50,
      fontAxes: fontAxes.default(),
      symbolAxes: symbolAxes.default(),
      haptic: 'toggle-on',
      outlineWidth: 0,
      outlineColor: 'var(--motion-button-outline-color, transparent)',
    }, this.#defaultState);
  }

  #resolveDefaultPressed() {
    const base = this.#resolveDefault();
    return mergeState({
      ...base,
      cornerRadius: base.cornerRadius * 0.6,
      fontAxes: fontAxes.defaultPressed(this.motionLevel),
      symbolAxes: symbolAxes.defaultPressed(this.motionLevel),
      haptic: 'long-press',
    }, this.#defaultPressedState);
  }

  #resolveSelected() {
    return mergeState({
      backgroundColor: 'var(--motion-button-selected-background, var(--mat-sys-secondary, #625b71))',
      contentColor: 'var(--motion-button-selected-color, var(--mat-sys-on-secondary, #fff))',
      cornerRadius: 25,
      fontAxes: fontAxes.selected(this.motionLevel),
      symbolAxes: symbolAxes.selected(this.motionLevel),
      haptic: 'long-press',
      outlineWidth: 0,
      outlineColor: 'var(--motion-button-selected-outline-color, transparent)',
    }, this.#selectedState);
  }

  #resolveSelectedPressed() {
    const base = this.#resolveSelected();
    return mergeState({
      ...base,
      cornerRadius: base.cornerRadius * 1.6,
      fontAxes: fontAxes.selectedPressed(this.motionLevel),
      symbolAxes: symbolAxes.selectedPressed(this.motionLevel),
      haptic: 'toggle-off',
    }, this.#selectedPressedState);
  }

  #currentSpec() {
    return this.#motionSpec ?? motionSpecs[this.motionLevel] ?? motionSpecs.medium;
  }

  #onPointerDown(event) {
    if (this.disabled || event.button !== 0) return;
    const bounds = this.#button.getBoundingClientRect();
    this.#beginPress(event.clientX - bounds.left, event.clientY - bounds.top, bounds);
  }

  #onKeyDown(event) {
    if (this.disabled || event.repeat || (event.key !== ' ' && event.key !== 'Enter')) return;
    const bounds = this.#button.getBoundingClientRect();
    this.#beginPress(bounds.width / 2, bounds.height / 2, bounds);
  }

  #beginPress(x, y, bounds) {
    this.#endPress();
    this.#button.style.width = bounds.width + "px";
    this.#performHaptic(this.#resolveDefault().haptic);
    this.#pressTimer = setTimeout(() => {
      this.#setVisuallyPressed(true);
      this.#pressTimer = null;
    }, 175);

    const size = Math.hypot(Math.max(x, bounds.width - x), Math.max(y, bounds.height - y)) * 2;
    this.shadowRoot.querySelector('.ripple')?.remove();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.part = 'ripple';
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x - size / 2}px;top:${y - size / 2}px`;
    this.#button.prepend(ripple);
    clearTimeout(this.#rippleTimer);
    this.#rippleTimer = setTimeout(() => ripple.remove(), 540);
  }

  #endPress() {
    if (this.#pressTimer !== null) {
      // Quick tap: press visuals never engaged. Dip the type and icon axes
      // through the pressed pose and spring back so taps feel alive, while
      // the corner keeps a single continuous motion toward its target.
      clearTimeout(this.#pressTimer);
      this.#pressTimer = null;
      if (this.#prefersReducedMotion() || this.motionLevel === 'none') {this.#releaseWidth(); return;}
      this.#axesPulse = true;
      this.#syncTargetState();
      clearTimeout(this.#pulseTimer);
      this.#pulseTimer = setTimeout(() => {
        this.#pulseTimer = null;
        this.#axesPulse = false;
        this.#syncTargetState();
      }, 160);
      return;
    }
    clearTimeout(this.#pulseTimer);
    this.#pulseTimer = null;
    const hadPulse = this.#axesPulse;
    this.#axesPulse = false;
    if (this.#visuallyPressed) this.#setVisuallyPressed(false);
    else if (hadPulse) this.#syncTargetState();
  }

  #setVisuallyPressed(value) {
    if (this.#visuallyPressed === value) return;
    this.#visuallyPressed = value;
    this.toggleAttribute('pressed', value);
    this.#syncTargetState();
  }

  #performHaptic(haptic) {
    if (this.getAttribute('haptics-enabled') === 'false' || !haptic || !('vibrate' in navigator)) return;
    const pattern = haptic === 'toggle-on' ? 10 : haptic === 'toggle-off' ? [8, 24, 8] : 18;
    navigator.vibrate(pattern);
  }

  #prefersReducedMotion() {
    return matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  #setStringAttribute(name, value) {
    if (value === null || value === undefined || value === '') this.removeAttribute(name);
    else this.setAttribute(name, String(value));
  }

  #setSize(property, value) {
    if (!value) {
      this.#button.style.removeProperty(property);
      return;
    }
    const normalized = /^-?\d+(\.\d+)?$/.test(value) ? `${value}px` : value;
    this.#button.style.setProperty(property, normalized);
  }
}

function mergeState(base, state = {}) {
  return {
    backgroundColor: state.backgroundColor ?? base.backgroundColor,
    contentColor: state.contentColor ?? base.contentColor,
    cornerRadius: state.cornerRadius ?? base.cornerRadius,
    fontAxes: { ...base.fontAxes, ...state.fontAxes },
    symbolAxes: { ...base.symbolAxes, ...state.symbolAxes },
    haptic: state.haptic === undefined ? base.haptic : state.haptic,
    outlineWidth: state.outlineWidth ?? base.outlineWidth,
    outlineColor: state.outlineColor ?? base.outlineColor,
  };
}

export function stepSpring(value, velocity, target, elapsed, spec) {
  if (spec.type === 'snap' || elapsed <= 0) return { value: target, velocity: 0, finished: true };
  const omega = Math.sqrt(Math.max(0.01, spec.stiffness));
  const damping = Math.max(0.01, spec.dampingRatio);
  const displacement = value - target;
  let nextDisplacement;
  let nextVelocity;

  if (damping < 1) {
    const decay = damping * omega;
    const frequency = omega * Math.sqrt(1 - damping * damping);
    const a = displacement;
    const b = (velocity + decay * displacement) / frequency;
    const envelope = Math.exp(-decay * elapsed);
    const cosine = Math.cos(frequency * elapsed);
    const sine = Math.sin(frequency * elapsed);
    const wave = a * cosine + b * sine;
    nextDisplacement = envelope * wave;
    nextVelocity = envelope * (-decay * wave - a * frequency * sine + b * frequency * cosine);
  } else if (damping === 1) {
    const b = velocity + omega * displacement;
    const envelope = Math.exp(-omega * elapsed);
    nextDisplacement = envelope * (displacement + b * elapsed);
    nextVelocity = envelope * (velocity - omega * b * elapsed);
  } else {
    const root = Math.sqrt(damping * damping - 1);
    const slow = -omega * (damping - root);
    const fast = -omega * (damping + root);
    const slowAmount = (velocity - fast * displacement) / (slow - fast);
    const fastAmount = displacement - slowAmount;
    nextDisplacement = slowAmount * Math.exp(slow * elapsed) + fastAmount * Math.exp(fast * elapsed);
    nextVelocity = slow * slowAmount * Math.exp(slow * elapsed) + fast * fastAmount * Math.exp(fast * elapsed);
  }

  const finished = Math.abs(nextDisplacement) < 0.01 && Math.abs(nextVelocity) < 0.01;
  return finished
    ? { value: target, velocity: 0, finished: true }
    : { value: target + nextDisplacement, velocity: nextVelocity, finished: false };
}

if (!customElements.get('motion-button')) {
  customElements.define('motion-button', MotionButton);
}
