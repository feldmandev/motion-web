import {MotionValue} from './motion-value.js';

function points(kind) {
  return Array.from({length: 64}, (_, i) => {
    const a = i * Math.PI / 32;
    const r = kind === 'clover4' ? .82 + .18 * Math.cos(4 * a) : kind === 'cookie4' ? .92 + .08 * Math.cos(4 * a) : kind === 'sunny' ? .88 + .12 * Math.cos(8 * a) : 1;
    return [50 + 48 * r * Math.cos(a), 50 + 48 * r * Math.sin(a)];
  });
}
export class MotionShape extends HTMLElement {
  static observedAttributes = ['shape', 'morph-shape', 'morphed', 'motion-level'];
  constructor() {
    super(); this.attachShadow({mode: 'open'}).innerHTML = `<style>:host{display:inline-grid;place-items:center;position:relative;width:var(--motion-shape-size,56px);height:var(--motion-shape-size,56px);color:var(--motion-shape-content,var(--mat-sys-on-tertiary-container))}svg{position:absolute;inset:0;width:100%;height:100%;fill:var(--motion-shape-color,var(--mat-sys-tertiary-container))}span{position:relative;display:grid;place-items:center}</style><svg viewBox="0 0 100 100" aria-hidden="true"><path/></svg><span><slot></slot></span>`;
  }
  get morphed() {return this.hasAttribute('morphed');}
  set morphed(value) {this.toggleAttribute('morphed', Boolean(value));}
  connectedCallback() {this.progress = new MotionValue(this, this.morphed ? 1 : 0, value => this.render(value)); this.render(this.progress.value);}
  disconnectedCallback() {this.progress?.dispose();}
  attributeChangedCallback() {if (this.progress) this.progress.to(this.morphed ? 1 : 0);}
  render(progress) {
    const from = points(this.getAttribute('shape') || 'cookie4'), to = points(this.getAttribute('morph-shape') || 'clover4');
    const vertices = from.map((p, i) => [p[0] + (to[i][0] - p[0]) * progress, p[1] + (to[i][1] - p[1]) * progress]);
    this.shadowRoot.querySelector('path').setAttribute('d', vertices.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join('') + 'Z');
  }
}
if (!customElements.get('motion-shape')) customElements.define('motion-shape', MotionShape);
