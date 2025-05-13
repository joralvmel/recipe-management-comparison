import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthStoreService } from '@core/store/auth-store.service';
import { of } from 'rxjs';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

interface Feature {
  title: string;
  description: string;
}

@Component({
  selector: 'app-hero-section',
  template: '',
  standalone: true
})
class MockHeroSectionComponent {}

@Component({
  selector: 'app-features-section',
  template: '',
  standalone: true
})
class MockFeaturesSectionComponent {
  @Input() features: Feature[] = [];
}

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    const authStoreMock = {
      isAuthenticated$: of(false),
      user$: of(null),
      loading$: of(false),
      error$: of(null),
    };

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MockHeroSectionComponent,
        MockFeaturesSectionComponent
      ],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        { provide: AuthStoreService, useValue: authStoreMock }
      ]
    })
      .overrideComponent(HomeComponent, {
        set: {
          imports: [CommonModule, MockHeroSectionComponent, MockFeaturesSectionComponent],
          template: `
          <app-hero-section></app-hero-section>
          <app-features-section [features]="features"></app-features-section>
        `
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize features array with correct data', () => {
    expect(component.features.length).toBe(3);

    expect(component.features[0].title).toBe('Explore Recipes');
    expect(component.features[0].description).toBe('Find recipes from around the world.');

    expect(component.features[1].title).toBe('Save Favorites');
    expect(component.features[1].description).toBe('Keep track of your favorite recipes.');

    expect(component.features[2].title).toBe('Share with Friends');
    expect(component.features[2].description).toBe('Share your favorite recipes with friends and family.');
  });

  it('should render child components', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const heroSection = compiled.querySelector('app-hero-section');
    const featuresSection = compiled.querySelector('app-features-section');

    expect(heroSection).toBeTruthy();
    expect(featuresSection).toBeTruthy();
  });
});
