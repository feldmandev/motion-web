import type {MotionLevel} from './motion-button.js';
export class MotionCard extends HTMLElement {
  selected: boolean;
  position: 'alone' | 'start' | 'middle' | 'end';
}
export class MotionShape extends HTMLElement { morphed: boolean; }
export interface MotionDropdownOption {value: string; label: string; disabled?: boolean;}
export class MotionDropdown extends HTMLElement {
  options: MotionDropdownOption[];
  value: string;
  label: string;
  disabled: boolean;
  open(): void;
  close(focus?: boolean): void;
}
