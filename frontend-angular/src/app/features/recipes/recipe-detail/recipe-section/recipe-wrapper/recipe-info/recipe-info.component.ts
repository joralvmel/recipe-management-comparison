import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recipe-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'recipe-info.component.html',
})
export class RecipeInfoComponent {
  @Input() readyInMinutes = 0;
  @Input() healthScore = 0;
  @Input() cuisines: string[] = [];
  @Input() dishTypes: string[] = [];
  @Input() diets: string[] = [];
}
