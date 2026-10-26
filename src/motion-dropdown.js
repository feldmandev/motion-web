import {MotionValue} from './motion-value.js';

export class MotionDropdown extends HTMLElement {
  static observedAttributes = ['label', 'disabled', 'motion-level'];
  constructor() {
    super(); this._options = []; this._value = '';
    this.attachShadow({mode: 'open'}).innerHTML = `<style>
      :host{display:block;min-width:0;font:inherit;color:var(--mat-sys-on-surface)}button{font:inherit;color:inherit;cursor:pointer}button:disabled{opacity:.4;cursor:default}
      .trigger{display:flex;align-items:center;gap:12px;width:100%;min-height:var(--motion-dropdown-height,56px);box-sizing:border-box;padding:10px 16px;border:1px solid var(--mat-sys-outline-variant);border-radius:var(--motion-dropdown-radius,20px);background:var(--motion-dropdown-background,var(--mat-sys-surface-container-high));text-align:start}
      .field{flex:1;min-width:0;display:grid;gap:3px}.label{font-size:12px;color:var(--mat-sys-on-surface-variant)}.value{font-size:var(--motion-dropdown-font-size,14px);font-weight:var(--motion-dropdown-font-weight,400);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.chevron{width:20px;height:20px;flex-shrink:0;transition:transform 180ms cubic-bezier(.4,0,.2,1)}
      button:focus-visible{outline:2px solid var(--mat-sys-tertiary);outline-offset:2px}.trigger[aria-expanded=true]{border-color:var(--mat-sys-tertiary)}
      .popup{position:fixed;inset:auto;margin:0;padding:6px;box-sizing:border-box;border:1px solid var(--mat-sys-outline-variant);border-radius:20px;background:color-mix(in srgb,var(--mat-sys-surface-container-high),transparent 8%);backdrop-filter:blur(22px);color:var(--mat-sys-on-surface);box-shadow:0 8px 28px #0003;overflow:hidden}
      .body{display:flex;flex-direction:column}.options{overflow:auto;overscroll-behavior:contain;touch-action:pan-y;scrollbar-width:none;transform-origin:top center}.options::-webkit-scrollbar{display:none}.above .options{transform-origin:bottom center}
      .option{display:flex;align-items:center;gap:12px;width:100%;border:0;border-radius:14px;min-height:52px;padding:12px 16px;background:transparent;text-align:start;font-size:14px;transition:background 140ms}.option span{flex:1}.option+.option{margin-top:2px}.option:hover{background:var(--mat-sys-surface-container-highest)}.option[aria-selected=true]{background:var(--mat-sys-tertiary-container);color:var(--mat-sys-on-tertiary-container)}
      @media(prefers-reduced-motion:reduce){*{transition:none!important}}
      </style><button class="trigger" type="button" aria-haspopup="listbox" aria-expanded="false"><span class="field"><span class="label"></span><span class="value"></span></span><svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button><div class="popup" popover="manual"><div class="body"><div class="options" role="listbox"></div></div></div>`;
    this.trigger = this.shadowRoot.querySelector('.trigger'); this.popup = this.shadowRoot.querySelector('.popup'); this.list = this.shadowRoot.querySelector('.options');
    this.trigger.addEventListener('click', () => this.toggle());
    this.list.addEventListener('wheel', event => {
      if (event.ctrlKey) return;
      event.stopPropagation();
      if (this.list.scrollHeight <= this.list.clientHeight || (event.deltaY < 0 && this.list.scrollTop <= 0) || (event.deltaY > 0 && this.list.scrollTop + this.list.clientHeight >= this.list.scrollHeight - 1)) event.preventDefault();
    }, {passive:false});
    this.shadowRoot.addEventListener('keydown', event => this.key(event));
    this.list.addEventListener('click', event => {
      const option = event.target.closest('button'); if (!option || option.disabled) return;
      this.value = this._options[Number(option.dataset.index)].value; this.dispatchEvent(new Event('change', {bubbles: true})); this.close();
    });
  }
  connectedCallback() {
    this.progress = new MotionValue(this, 0, value => this.animate(value));
    this.abort = new AbortController(); const options = {signal: this.abort.signal};
    document.addEventListener('pointerdown', event => {if (!event.composedPath().includes(this)) this.close(false);}, options);
    document.addEventListener('keydown', event => {if (event.key === 'Escape') this.close();}, options);
    window.addEventListener('resize', () => this.position(), options);
    document.addEventListener('scroll', event => {if (!event.composedPath().includes(this)) this.position();}, {...options, capture:true});
    this.closest('dialog')?.addEventListener('close', () => this.close(false), options); this.render();
  }
  disconnectedCallback() {this.abort?.abort(); this.progress?.dispose(); if (this.popup.matches(':popover-open')) this.popup.hidePopover();}
  get options() {return this._options;}
  set options(value) {const key = JSON.stringify(value || []); if (key === this.optionsKey) return; this.optionsKey = key; this._options = value || []; this.render();}
  get value() {return this._value;}
  set value(value) {this._value = String(value ?? ''); this.render();}
  get label() {return this.getAttribute('label') || '';}
  set label(value) {this.setAttribute('label', value || '');}
  get disabled() {return this.hasAttribute('disabled');}
  set disabled(value) {this.toggleAttribute('disabled', Boolean(value));}
  attributeChangedCallback() {if (this.trigger) this.render(); if (this.disabled) this.close(false);}
  render() {
    const selected = this._options.find(x => String(x.value) === this.value);
    for (const element of this.shadowRoot.querySelectorAll('.label')) {element.textContent = this.label; element.hidden = !this.label;}
    for (const element of this.shadowRoot.querySelectorAll('.value')) element.textContent = selected?.label || 'Select';
    this.trigger.disabled = this.disabled; this.trigger.setAttribute('aria-label', this.getAttribute('aria-label') || this.label || selected?.label || 'Select');
    this.list.setAttribute('aria-label', this.trigger.getAttribute('aria-label'));
    this.list.replaceChildren(...this._options.map((item, index) => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'option'; button.dataset.index = index;
      button.setAttribute('role', 'option'); button.setAttribute('aria-selected', String(String(item.value) === this.value)); button.disabled = Boolean(item.disabled);
      const text = document.createElement('span'); text.textContent = item.label; button.append(text);
      if (String(item.value) === this.value) {const check = document.createElement('span'); check.textContent = '✓'; check.style.flex = '0'; button.append(check);}
      return button;
    }));
  }
  toggle() {if (this.expanded) this.close(); else this.open();}
  open() {
    if (this.disabled) return;
    this.expanded = true; this.trigger.setAttribute('aria-expanded', 'true');
    if (!this.popup.matches(':popover-open')) this.popup.showPopover();
    this.position(); this.progress.to(1);
  }
  position() {
    if (!this.expanded) return;
    const rect = this.trigger.getBoundingClientRect(), below = innerHeight - rect.bottom - 20, above = rect.top - 20;
    this.above = below < Math.min(160, this._options.length * 54) && above > below;
    this.list.style.maxHeight = Math.min(320, Math.max(0, (this.above ? above : below) - 14)) + 'px';
    this.popup.classList.toggle('above', this.above);
    this.popup.style.width = Math.min(Math.max(rect.width, 200), innerWidth - 24) + 'px';
    this.popup.style.left = Math.max(12, Math.min(rect.left, innerWidth - parseFloat(this.popup.style.width) - 12)) + 'px';
    this.height = this.popup.getBoundingClientRect().height;
    const top = this.above ? rect.top - this.height - 8 : rect.bottom + 8;
    this.popup.style.top = top + 'px';
    this.anchorHeight = Math.min(rect.height, this.height);
    this.anchorOffset = this.above ? 8 : -8;
    this.anchorRadius = parseFloat(getComputedStyle(this.trigger).borderRadius) || 20;
    this.animate(this.progress.value);
  }
  close(focus = true) {if (!this.expanded) return; this.expanded = false; this.trigger.setAttribute('aria-expanded', 'false'); this.progress?.to(0); if (focus) this.trigger.focus();}
  animate(value) {
    const progress = Math.max(0, Math.min(1, value)), hidden = (this.height - this.anchorHeight) * (1 - progress);
    this.popup.style.clipPath = `inset(${this.above ? hidden : 0}px 0 ${this.above ? 0 : hidden}px 0 round ${this.anchorRadius + (20 - this.anchorRadius) * progress + Math.sin(progress * Math.PI) * 8}px)`;
    this.popup.style.transform = `translateY(${this.anchorOffset * (1 - progress)}px)`;
    this.list.style.opacity = Math.max(0, Math.min(1, (progress - .12) / .38));
    this.list.style.filter = `blur(${16 * (1 - Math.max(0, Math.min(1, (progress - .35) / .65)))}px)`;
    this.list.style.transform = `scaleY(${Math.max(.01, value)})`;
    for (const arrow of this.shadowRoot.querySelectorAll('.chevron')) arrow.style.transform = `rotate(${180 * progress}deg)`;
    if (!this.expanded && value <= .001 && this.popup.matches(':popover-open')) this.popup.hidePopover();
  }
  key(event) {
    if (event.key === 'Escape' && this.expanded) {event.preventDefault(); event.stopPropagation(); this.close(); return;}
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault(); if (!this.expanded) this.open();
    const buttons = [...this.list.querySelectorAll('button:not(:disabled)')], index = buttons.indexOf(this.shadowRoot.activeElement);
    const button = buttons[event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : Math.max(0, Math.min(buttons.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1)))];
    if (!button) return;
    button.focus({preventScroll:true});
    const bounds = button.getBoundingClientRect(), viewport = this.list.getBoundingClientRect();
    if (bounds.top < viewport.top) this.list.scrollTop -= viewport.top - bounds.top;
    else if (bounds.bottom > viewport.bottom) this.list.scrollTop += bounds.bottom - viewport.bottom;
  }
}
if (!customElements.get('motion-dropdown')) customElements.define('motion-dropdown', MotionDropdown);
