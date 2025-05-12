import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, Input, Output, EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { provideRouter } from '@angular/router';

import { CardComponent } from './card.component';
import { RecipeType } from '@models/recipe.model';
import { FavoriteButtonComponent } from '@shared/components/favorite-button/favorite-button.component';
import { AppImageComponent } from '@shared/components/app-image/app-image.component';

@Component({
  selector: 'app-favorite-button',
  template: '<button (click)="toggleFavorite.emit(recipeId)">Favorite</button>',
  standalone: true
})
class MockFavoriteButtonComponent {
  @Input() recipeId!: number;
  @Input() isFavorite = false;
  @Input() isLoading = false;
  @Output() toggleFavorite = new EventEmitter<number>();
}

@Component({
  selector: 'app-image',
  template: '<img [src]="src" [alt]="alt">',
  standalone: true
})
class MockAppImageComponent {
  @Input() src = '';
  @Input() alt = '';
  @Input() width = 0;
  @Input() height = 0;
  @Input() cssClass = '';
  @Input() priority = false;
  @Input() lazy = true;
  @Input() useLazyDirective = false;
}

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;
  let mockRecipe: RecipeType;

  beforeEach(async () => {
    mockRecipe = {
      _id: { $oid: '123456789' },
      id: 123,
      title: 'Test Recipe',
      image: 'test-image.jpg',
      readyInMinutes: 30,
      healthScore: 85,
      cuisines: ['Italian', 'Mediterranean'],
      dishTypes: ['main course', 'dinner'],
      diets: ['vegetarian']
    };

    await TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]), // Use RouterModule.forRoot() to provide the routerLink directive
        CardComponent
      ],
      schemas: [NO_ERRORS_SCHEMA], // NO_ERRORS_SCHEMA is important here
      providers: [
        provideRouter([]),
      ]
    })
      .overrideComponent(CardComponent, {
        remove: { imports: [FavoriteButtonComponent, AppImageComponent] },
        add: { imports: [MockFavoriteButtonComponent, MockAppImageComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    component.recipe = mockRecipe;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('default properties', () => {
    it('should have recipe input defined', () => {
      expect(component.recipe).toEqual(mockRecipe);
    });

    it('should have default isFavorite as false', () => {
      expect(component.isFavorite).toBeFalse();
    });

    it('should have default showFavoriteButton as true', () => {
      expect(component.showFavoriteButton).toBeTrue();
    });

    it('should have default isLoadingFavorite as false', () => {
      expect(component.isLoadingFavorite).toBeFalse();
    });
  });

  describe('DOM rendering', () => {
    it('should display recipe title', () => {
      const titleElement = fixture.debugElement.query(
        By.css('.card-title, h2, h3, .title, [data-testid="recipe-title"], [class*="title"]')
      );

      if (!titleElement) {
        console.log('DOM content:', fixture.debugElement.nativeElement.innerHTML);
        expect(fixture.debugElement.nativeElement.textContent).toContain('Test Recipe');
      } else {
        expect(titleElement.nativeElement.textContent).toContain('Test Recipe');
      }
    });

    it('should display recipe image using AppImageComponent', () => {
      const imageComponent = fixture.debugElement.query(By.css('app-image'));
      expect(imageComponent).toBeTruthy();
    });

    it('should include a link to the recipe detail', () => {
      const linkElement = fixture.debugElement.query(
        By.css('a[routerLink], a[href], a')
      );

      if (!linkElement) {
        console.log('DOM content:', fixture.debugElement.nativeElement.innerHTML);
      }

      expect(linkElement).toBeTruthy('Expected to find a link element');
    });

    it('should show favorite button when showFavoriteButton is true', () => {
      component.showFavoriteButton = true;
      fixture.detectChanges();

      const favoriteBtn = fixture.debugElement.query(By.css('app-favorite-button'));
      expect(favoriteBtn).toBeTruthy();
    });

    it('should hide favorite button when showFavoriteButton is false', () => {
      component.showFavoriteButton = false;
      fixture.detectChanges();

      const favoriteBtn = fixture.debugElement.query(By.css('app-favorite-button'));
      expect(favoriteBtn).toBeFalsy();
    });
  });

  describe('favorite button interaction', () => {
    it('should pass isFavorite to favorite button component', () => {
      component.isFavorite = true;
      fixture.detectChanges();

      const favoriteBtn = fixture.debugElement.query(By.css('app-favorite-button'));
      expect(favoriteBtn.componentInstance.isFavorite).toBeTrue();
    });

    it('should pass isLoadingFavorite to favorite button component', () => {
      component.isLoadingFavorite = true;
      fixture.detectChanges();

      const favoriteBtn = fixture.debugElement.query(By.css('app-favorite-button'));
      expect(favoriteBtn.componentInstance.isLoading).toBeTrue();
    });

    it('should emit toggleFavorite event with recipe id when favorite button is clicked', () => {
      spyOn(component.toggleFavorite, 'emit');

      const favoriteBtn = fixture.debugElement.query(By.css('app-favorite-button'));
      favoriteBtn.triggerEventHandler('toggleFavorite', mockRecipe.id);

      expect(component.toggleFavorite.emit).toHaveBeenCalledWith(mockRecipe.id);
    });

    it('should call onToggleFavorite method when favorite button is clicked', () => {
      spyOn(component, 'onToggleFavorite');

      const favoriteBtn = fixture.debugElement.query(By.css('app-favorite-button'));
      favoriteBtn.triggerEventHandler('toggleFavorite', mockRecipe.id);

      expect(component.onToggleFavorite).toHaveBeenCalledWith(mockRecipe.id);
    });
  });

  describe('component methods', () => {
    it('onToggleFavorite should emit the recipe id', () => {
      spyOn(component.toggleFavorite, 'emit');

      component.onToggleFavorite(mockRecipe.id);

      expect(component.toggleFavorite.emit).toHaveBeenCalledWith(mockRecipe.id);
    });
  });
});
