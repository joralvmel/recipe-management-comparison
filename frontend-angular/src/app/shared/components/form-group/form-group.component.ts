import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppInputComponent } from '@shared/components/app-input/app-input.component';

@Component({
  selector: 'app-form-group',
  templateUrl: './form-group.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppInputComponent
  ],
})
export class FormGroupComponent {
  @Input() label = '';
  @Input() type = 'text';
  @Input() name = '';
  @Input() value = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() placeholder = '';

  @Output() valueChange = new EventEmitter<string>();
  @Output() enter = new EventEmitter<void>();

  onValueChange(newValue: string): void {
    this.valueChange.emit(newValue);
  }

  onEnter(): void {
    this.enter.emit();
  }
}
