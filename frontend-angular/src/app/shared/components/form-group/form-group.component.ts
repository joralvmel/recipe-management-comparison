import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
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
export class FormGroupComponent implements OnInit {
  @Input() label = '';
  @Input() type = 'text';
  @Input() name = '';
  @Input() value = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() placeholder = '';
  @Input() id = '';

  @Output() valueChange = new EventEmitter<string>();
  @Output() enter = new EventEmitter<void>();

  readonly groupId = `form-group-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  inputId = '';

  ngOnInit(): void {
    this.inputId = this.id || (this.name ? `${this.name}-field` : this.groupId);
  }

  onValueChange(newValue: string): void {
    this.valueChange.emit(newValue);
  }

  onEnter(): void {
    this.enter.emit();
  }
}
