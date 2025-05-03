import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recipe-instructions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'recipe-instructions.component.html',
})
export class RecipeInstructionsComponent {
  @Input() instructions: string[] = [];
}
