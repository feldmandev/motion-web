import {MotionValue} from './motion-value.js';

export class MotionCard extends HTMLElement {
  static observedAttributes = ['selected', 'position', 'motion-level'];
  get selected() {return this.hasAttribute('selected');}
  set selected(value) {this.toggleAttribute('selected', Boolean(value));}
  get position() {return this.getAttribute('position') || 'alone';}
  set position(value) {this.setAttribute('position', value);}
  connectedCallback() {
    if (!document.getElementById('motion-card-styles')) {const style = document.createElement('style'); style.id = 'motion-card-styles'; style.textContent = 'motion-card{display:block}'; document.head.append(style);}
    const [top, bottom] = this.radii();
    this.top = new MotionValue(this, top, value => {this.style.borderTopLeftRadius = this.style.borderTopRightRadius = Math.max(0, value) + 'px';});
    this.bottom = new MotionValue(this, bottom, value => {this.style.borderBottomLeftRadius = this.style.borderBottomRightRadius = Math.max(0, value) + 'px';});
    this.abort = new AbortController(); const options = {signal: this.abort.signal};
    this.addEventListener('pointerenter', () => {this.hoverTimer = setTimeout(() => {this.hoverHeld = true; this.update();}, 400);}, options);
    this.addEventListener('pointerleave', () => {clearTimeout(this.hoverTimer); this.hoverHeld = false; this.release();}, options);
    this.addEventListener('pointerdown', event => {
      if (event.button !== 0 || event.composedPath().some(x => x.matches?.('button,input,textarea,motion-button,motion-dropdown'))) return;
      this.origin = [event.clientX, event.clientY];
      this.holdTimer = setTimeout(() => {this.longHeld = true; this.update();}, 400);
    }, options);
    this.addEventListener('pointermove', event => {if (this.origin && Math.hypot(event.clientX - this.origin[0], event.clientY - this.origin[1]) > 8) this.release();}, options);
    for (const name of ['pointerup', 'pointercancel']) this.addEventListener(name, () => this.release(), options);
    this.addEventListener('click', event => {if (this.suppressClick) {this.suppressClick = false; event.preventDefault(); event.stopImmediatePropagation();}}, {...options, capture: true});
    this.observer = new MutationObserver(() => this.updateShapes()); this.observer.observe(this, {childList: true, subtree: true});
    this.update();
  }
  disconnectedCallback() {this.abort?.abort(); this.observer?.disconnect(); clearTimeout(this.hoverTimer); clearTimeout(this.holdTimer); this.top?.dispose(); this.bottom?.dispose();}
  attributeChangedCallback() {if (this.isConnected && this.top) this.update();}
  release() {clearTimeout(this.holdTimer); this.origin = null; if (this.longHeld) this.suppressClick = true; this.longHeld = false; this.update();}
  radii() {
    const css = getComputedStyle(this), outer = parseFloat(css.getPropertyValue('--motion-card-outer-radius')) || 28, inner = parseFloat(css.getPropertyValue('--motion-card-inner-radius')) || 8;
    if (this.selected || this.hoverHeld || this.longHeld) return [outer, outer];
    return [this.position === 'alone' || this.position === 'start' ? outer : inner, this.position === 'alone' || this.position === 'end' ? outer : inner];
  }
  updateShapes() {for (const shape of this.querySelectorAll('motion-shape')) shape.morphed = this.selected || this.hoverHeld || this.longHeld;}
  update() {const [top, bottom] = this.radii(); this.top?.to(top); this.bottom?.to(bottom); this.updateShapes();}
}
if (!customElements.get('motion-card')) customElements.define('motion-card', MotionCard);
