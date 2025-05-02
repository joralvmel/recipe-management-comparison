import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Feature {
  id?: number | string;
  title: string;
  description: string;
  icon?: string;
}

@Component({
  selector: 'app-features-section',
  templateUrl: './features-section.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class FeaturesSectionComponent {
  @Input() features: Feature[] = [];

  trackByFn(index: number, feature: Feature): number | string {
    return feature.id || index;
  }
}
