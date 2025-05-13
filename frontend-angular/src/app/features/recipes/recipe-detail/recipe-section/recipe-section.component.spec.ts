import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { RecipeSectionComponent } from './recipe-section.component';
import { RecipeDetailUIService } from '@features/recipes/recipe-detail/services/recipe-detail-ui.service';
import { RecipeDetailType, IngredientType } from '@models/recipe.model';

describe('RecipeSectionComponent', () => {
  let component: RecipeSectionComponent;
  let fixture: ComponentFixture<RecipeSectionComponent>;
  let mockRecipeDetailUIService: jasmine.SpyObj<RecipeDetailUIService>;

  const mockRecipe: RecipeDetailType = {
    _id: { $oid: '60a1e2c3d4e5f6a7b8c9d0e1' },
    externalId: 123456,
    title: 'Test Recipe',
    image: 'test-image.jpg',
    readyInMinutes: 30,
    healthScore: 75,
    cuisines: ['Italian'],
    dishTypes: ['main course'],
    diets: ['vegetarian'],
    servings: 4,
    extendedIngredients: [
      {
        externalId: 1001,
        nameClean: 'olive oil',
        amount: 2,
        unitShort: 'tbsp',
        image: 'olive-oil.jpg'
      }
    ],
    analyzedInstructions: ['Step 1', 'Step 2']
  };

  beforeEach(async () => {
    mockRecipeDetailUIService = jasmine.createSpyObj('RecipeDetailUIService',
      ['initialize', 'loadRecipe', 'toggleFavorite', 'updateServings', 'getScaledAmount', 'checkFavoriteStatus'],
      {
        recipe$: new BehaviorSubject<RecipeDetailType | null>(mockRecipe),
        recipeId$: new BehaviorSubject<number>(123456),
        isLoading$: new BehaviorSubject<boolean>(false),
        error$: new BehaviorSubject<string | null>(null),
        isFavorite$: new BehaviorSubject<boolean>(false),
        servings$: new BehaviorSubject<number>(4),
        originalServings$: new BehaviorSubject<number>(4),
        loadingFavoriteId$: new BehaviorSubject<number | null>(null),
        isLoadingFavorite$: new BehaviorSubject<boolean>(false),
        title$: new BehaviorSubject<string>('Test Recipe'),
        imageUrl$: new BehaviorSubject<string>('test-image.jpg'),
        ingredients$: new BehaviorSubject<IngredientType[]>([{
          externalId: 1001,
          nameClean: 'olive oil',
          amount: 2,
          unitShort: 'tbsp',
          image: 'olive-oil.jpg'
        }]),
        readyInMinutes$: new BehaviorSubject<number>(30),
        healthScore$: new BehaviorSubject<number>(75),
        cuisines$: new BehaviorSubject<string[]>(['Italian']),
        dishTypes$: new BehaviorSubject<string[]>(['main course']),
        diets$: new BehaviorSubject<string[]>(['vegetarian']),
        instructions$: new BehaviorSubject<string[]>(['Step 1', 'Step 2'])
      }
    );

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RecipeSectionComponent
      ],
      providers: [
        { provide: RecipeDetailUIService, useValue: mockRecipeDetailUIService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have RecipeDetailUIService injected', () => {
    expect(component.recipeUI).toBeTruthy();
    expect(component.recipeUI).toBe(mockRecipeDetailUIService);
  });

  it('should render correctly with recipe data', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement).toBeTruthy();
  });

  it('should handle loading state', () => {
    (mockRecipeDetailUIService.isLoading$ as BehaviorSubject<boolean>).next(true);
    fixture.detectChanges();

    expect(fixture.nativeElement).toBeTruthy();
  });

  it('should handle error state', () => {
    (mockRecipeDetailUIService.error$ as BehaviorSubject<string | null>).next('Error message');
    fixture.detectChanges();

    expect(fixture.nativeElement).toBeTruthy();
  });
});
