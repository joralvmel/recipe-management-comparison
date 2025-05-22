import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-servings-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './servings-filter.component.html',
})
export class ServingsFilterComponent {
  @Input() servings = 1;
  @Output() servingsChange = new EventEmitter<number>();

  increaseServings(): void {
    if (this.servings < 99) {
      this.servings++;
      this.servingsChange.emit(this.servings);
    }
  }

  decreaseServings(): void {
    if (this.servings > 1) {
      this.servings--;
      this.servingsChange.emit(this.servings);
    }
  }

  onServingsChange(newServings: number): void {
    if (newServings >= 1 && newServings <= 99) {
      this.servings = newServings;
      this.servingsChange.emit(this.servings);
    } else if (newServings < 1) {
      this.servings = 1;
      this.servingsChange.emit(this.servings);
    } else if (newServings > 99) {
      this.servings = 99;
      this.servingsChange.emit(this.servings);
    }
  }
}
