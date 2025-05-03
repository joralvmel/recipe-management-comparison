import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppButtonComponent } from '@shared/components/app-button/app-button.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  standalone: true,
  imports: [
    CommonModule,
    AppButtonComponent,
    FormsModule,
  ],
})
export class FormComponent {
  @Input() submitText = 'Submit';
  @Input() errorMessage = '';
  @Input() loading = false;
  @Input() buttonType: 'primary' | 'secondary' | 'tertiary' = 'primary';
  @Input() buttonSize: 'small' | 'medium' | 'large' = 'medium';

  @Output() formSubmit = new EventEmitter<void>();

  onSubmit(): void {
    this.formSubmit.emit();
  }
}
