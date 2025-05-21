import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { RecipeMainSectionComponent } from './recipe-main-section.component';
import { RecipeDetailUIService } from '@features/recipes/recipe-detail/services/recipe-detail-ui.service';
import { RecipeDetailType } from '@models/recipe.model';

describe('RecipeMainSectionComponent', () => {
  let component: RecipeMainSectionComponent;
  let fixture: ComponentFixture<RecipeMainSectionComponent>;

  beforeEach(() => {
    const mockRecipe: RecipeDetailType = {
      _id: { $oid: '123abc' },
      externalId: 123,
      title: 'Test Recipe',
      image: 'test-image.jpg',
      readyInMinutes: 30,
      healthScore: 85,
      cuisines: ['Italian'],
      dishTypes: ['Main Course'],
      diets: ['Vegetarian'],
      servings: 4,
      extendedIngredients: [
        {
          externalId: 1001,
          nameClean: 'Olive Oil',
          amount: 1,
          unitShort: 'tbsp',
          image: 'olive-oil.jpg'
        }
      ],
      analyzedInstructions: ['Step 1: Cook the food', 'Step 2: Eat the food']
    };

    const recipeUIServiceMock = {
      recipe$: of(mockRecipe),
      isLoading$: of(false),
      error$: of(null)
    };

    TestBed.configureTestingModule({
      imports: [RecipeMainSectionComponent],
      providers: [
        {
          provide: RecipeDetailUIService,
          useValue: recipeUIServiceMock
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(RecipeMainSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have access to RecipeDetailUIService', () => {
    expect(component.recipeUI).toBeTruthy();
  });
});
