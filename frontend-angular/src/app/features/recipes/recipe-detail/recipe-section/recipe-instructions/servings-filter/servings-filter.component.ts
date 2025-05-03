import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-servings-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'servings-filter.component.html',
})
export class ServingsFilterComponent {
  @Input() servings = 1;
  @Output() servingsChange = new EventEmitter<number>();

  increaseServings(): void {
    if (this.servings < 12) {
      this.servings++;
      this.onServingsChange();
    }
  }

  decreaseServings(): void {
    if (this.servings > 1) {
      this.servings--;
      this.onServingsChange();
    }
  }

  onServingsChange(): void {
    this.servingsChange.emit(this.servings);
  }
}
