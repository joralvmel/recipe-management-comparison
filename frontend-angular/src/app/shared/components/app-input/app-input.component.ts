import { Component, EventEmitter, forwardRef, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input',
  templateUrl: './app-input.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppInputComponent),
      multi: true
    }
  ]
})
export class AppInputComponent implements ControlValueAccessor, OnInit {
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() label = '';
  @Input() id = '';
  @Input() name = '';
  @Input() cssClass = 'input-text';

  @Output() enter = new EventEmitter<void>();

  value = '';
  touched = false;
  private uniqueId = `input-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  inputId = '';

  ngOnInit(): void {
    this.inputId = this.id || this.uniqueId;
  }

  get inputName(): string {
    return this.name || this.inputId;
  }

  onChange: (value: string) => void = () => {};
  onTouch: () => void = () => {};

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInputChange(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;
    this.value = inputValue;
    this.onChange(inputValue);
  }

  onInputBlur(): void {
    this.touched = true;
    this.onTouch();
  }

  onKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.enter.emit();
    }
  }
}
