import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
})
export class LoaderComponent {
  @Input() message = 'Loading...';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
}
