import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppImageComponent } from '@shared/components/app-image/app-image.component';
import { SearchBarComponent } from '@shared/components/search-bar/search-bar.component';

@Component({
  selector: 'app-hero-section',
  templateUrl: './hero-section.component.html',
  standalone: true,
  imports: [
    CommonModule,
    AppImageComponent,
    SearchBarComponent
  ],
})
export class HeroSectionComponent {
  initialSearchQuery = '';

  constructor(private router: Router) {}

  onSearchPerformed(query: string) {
    this.router.navigate(['/search'], { queryParams: { query } });
  }
}
