import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroSectionComponent } from '@features/home/components/hero-section/hero-section.component';
import { FeaturesSectionComponent } from '@features/home/components/features-section/features-section.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [HeroSectionComponent, CommonModule, FeaturesSectionComponent],
})
export class HomeComponent {
  features = [
    {
      title: 'Explore Recipes',
      description: 'Find recipes from around the world.'
    },
    {
      title: 'Save Favorites',
      description: 'Keep track of your favorite recipes.'
    },
    {
      title: 'Share with Friends',
      description: 'Share your favorite recipes with friends and family.'
    }
  ];
}
