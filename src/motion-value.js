import {stepSpring, MOTION_LEVEL_CHANGE_EVENT} from './motion-button.js';

export function motionLevel(host) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return 'none';
  return host.getAttribute('motion-level') || getComputedStyle(host).getPropertyValue('--motion-level').trim() || 'medium';
}

// Interruptible values retain their velocity when the target changes, as Motion Qt does.
export class MotionValue {
  constructor(host, value, render) {
    this.host = host; this.value = this.target = value; this.velocity = 0; this.render = render;
    this.changed = () => this.to(this.target);
    document.addEventListener(MOTION_LEVEL_CHANGE_EVENT, this.changed);
  }
  to(target) {
    this.target = target;
    if (motionLevel(this.host) === 'none') {cancelAnimationFrame(this.frame); this.frame = 0; this.value = target; this.velocity = 0; this.render(target); return;}
    if (this.frame) return;
    let previous = performance.now();
    const tick = now => {
      const level = motionLevel(this.host), spec = {type: 'spring', dampingRatio: level === 'high' ? .48 : level === 'low' ? .85 : .65, stiffness: level === 'high' ? 350 : 500};
      const next = stepSpring(this.value, this.velocity, this.target, Math.max(.001, Math.min(.032, (now - previous) / 1000)), spec);
      previous = now; this.value = next.value; this.velocity = next.velocity; this.render(this.value);
      this.frame = next.finished ? 0 : requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
  }
  dispose() {cancelAnimationFrame(this.frame); document.removeEventListener(MOTION_LEVEL_CHANGE_EVENT, this.changed);}
}
