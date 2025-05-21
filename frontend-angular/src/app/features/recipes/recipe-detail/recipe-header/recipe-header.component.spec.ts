import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { RecipeHeaderComponent } from './recipe-header.component';
import { RecipeDetailUIService } from '@features/recipes/recipe-detail/services/recipe-detail-ui.service';
import { AuthStoreService } from '@core/store/auth-store.service';

describe('RecipeHeaderComponent', () => {
  let component: RecipeHeaderComponent;
  let fixture: ComponentFixture<RecipeHeaderComponent>;
  let recipeUIServiceMock: jasmine.SpyObj<RecipeDetailUIService>;

  beforeEach(() => {
    recipeUIServiceMock = jasmine.createSpyObj('RecipeDetailUIService', ['toggleFavorite']);

    TestBed.configureTestingModule({
      imports: [RecipeHeaderComponent],
      providers: [
        { provide: RecipeDetailUIService, useValue: recipeUIServiceMock },
        {
          provide: AuthStoreService,
          useValue: {
            isAuthenticated$: of(false)
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(RecipeHeaderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call toggleFavorite on the UI service when onToggleFavorite is called', () => {
    component.onToggleFavorite();
    expect(recipeUIServiceMock.toggleFavorite).toHaveBeenCalled();
  });
});
