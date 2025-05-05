import { Component, Input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { LazyImgDirective } from '@shared/directives/lazy-img.directive';

@Component({
  selector: 'app-image',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, LazyImgDirective],
  templateUrl: './app-image.component.html',
})
export class AppImageComponent {
  @Input() src = '';
  @Input() alt = '';
  @Input() width = 0;
  @Input() height = 0;
  @Input() cssClass = '';
  @Input() priority = false;
  @Input() lazy = true;
  @Input() useLazyDirective = false;
  @Input() placeholderSrc = 'assets/images/placeholder.svg';

  onImageError() {
    console.error(`Error loading image: ${this.src}`);
  }
}
