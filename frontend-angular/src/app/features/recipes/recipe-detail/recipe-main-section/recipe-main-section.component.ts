import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recipe-main-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'recipe-main-section.component.html',
})
export class RecipeMainSectionComponent {
  @Input() imageUrl = '';
  @Input() title = '';
}
