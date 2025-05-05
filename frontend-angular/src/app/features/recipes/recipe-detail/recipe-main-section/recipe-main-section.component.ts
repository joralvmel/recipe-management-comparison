import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppImageComponent } from '@shared/components/app-image/app-image.component';

@Component({
  selector: 'app-recipe-main-section',
  standalone: true,
  imports: [CommonModule, AppImageComponent],
  templateUrl: 'recipe-main-section.component.html',
})
export class RecipeMainSectionComponent {
  @Input() imageUrl = '';
  @Input() title = '';
}
