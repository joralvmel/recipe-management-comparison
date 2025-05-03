import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

type ButtonType = 'primary' | 'secondary' | 'tertiary';
type ButtonSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-button',
  templateUrl: './app-button.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class AppButtonComponent {
  @Input() type: ButtonType = 'primary';
  @Input() size: ButtonSize = 'medium';
  @Input() disabled = false;
  @Input() fullWidth = false;
  @Input() buttonType: 'button' | 'submit' | 'reset' = 'button';
  @Input() loading = false;

  @Output() buttonClick = new EventEmitter<MouseEvent>();

  get buttonClasses(): string {
    return `${this.type}-button ${this.size}-button ${this.fullWidth ? 'full-width' : ''}`;
  }

  onClick(event: MouseEvent) {
    if (!this.disabled && !this.loading) {
      this.buttonClick.emit(event);
    }
  }
}
