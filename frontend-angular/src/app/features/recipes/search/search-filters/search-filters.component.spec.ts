import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchFiltersComponent } from './search-filters.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { NotificationService } from '@shared/services/notification.service';
import { Filter } from '@models/filter.model';

@Component({
  selector: 'app-dropdown',
  template: '',
  standalone: true
})
class MockDropdownComponent {
  @Input() label = '';
  @Input() options: Array<{value: string; label: string}> = [];
  @Input() selectedValue = '';
}

@Component({
  selector: 'app-button',
  template: '',
  standalone: true
})
class MockButtonComponent {
  @Input() type = 'primary';
  @Input() disabled = false;
  @Input() fullWidth = false;
  @Input() small = false;
}

@Component({
  selector: 'app-search-bar',
  template: '',
  standalone: true
})
class MockSearchBarComponent {
  @Input() value = '';
  @Input() placeholder = '';
}

describe('SearchFiltersComponent', () => {
  let component: SearchFiltersComponent;
  let fixture: ComponentFixture<SearchFiltersComponent>;
  let notificationServiceMock: jasmine.SpyObj<NotificationService>;

  const mealTypeKey = 'meal-type';
  const cuisineKey = 'cuisine';
  const dietKey = 'diet';

  const mockFilters: Filter[] = [
    {
      id: mealTypeKey,
      label: 'Meal Type',
      options: [
        { value: 'breakfast', label: 'Breakfast' },
        { value: 'lunch', label: 'Lunch' },
        { value: 'dinner', label: 'Dinner' }
      ]
    },
    {
      id: cuisineKey,
      label: 'Cuisine',
      options: [
        { value: 'italian', label: 'Italian' },
        { value: 'mexican', label: 'Mexican' }
      ]
    },
    {
      id: dietKey,
      label: 'Diet',
      options: [
        { value: 'vegetarian', label: 'Vegetarian' },
        { value: 'keto', label: 'Keto' }
      ]
    }
  ];

  beforeEach(async () => {
    notificationServiceMock = jasmine.createSpyObj('NotificationService', ['showNotification']);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        SearchFiltersComponent,
      ],
      providers: [
        { provide: NotificationService, useValue: notificationServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchFiltersComponent);
    component = fixture.componentInstance;
    component.filters = mockFilters;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with empty search query and filters', () => {
      fixture.detectChanges();

      expect(component.searchQuery).toBe('');
      expect(component.selectedFilters[mealTypeKey]).toBe('');
      expect(component.selectedFilters[cuisineKey]).toBe('');
      expect(component.selectedFilters[dietKey]).toBe('');
    });

    it('should accept filters as input', () => {
      fixture.detectChanges();

      expect(component.filters).toEqual(mockFilters);
      expect(component.filters.length).toBe(3);
    });
  });

  describe('Search functionality', () => {
    it('should update searchQuery when onSearchQueryChange is called', () => {
      const testQuery = 'pizza recipe';

      spyOn(component, 'onSearch');

      component.onSearchQueryChange(testQuery);

      expect(component.searchQuery).toBe(testQuery);
      expect(component.onSearch).toHaveBeenCalled();
    });

    it('should emit search event with correct values when onSearch is called', () => {
      component.searchQuery = 'pizza';
      component.selectedFilters[mealTypeKey] = 'dinner';
      component.selectedFilters[cuisineKey] = 'italian';
      component.selectedFilters[dietKey] = 'vegetarian';

      spyOn(component.search, 'emit');

      component.onSearch();

      expect(component.search.emit).toHaveBeenCalledWith({
        query: 'pizza',
        mealType: 'dinner',
        cuisine: 'italian',
        diet: 'vegetarian'
      });
    });

    it('should update selected filters when onFilterChange is called', () => {
      component.selectedFilters[cuisineKey] = '';

      component.onFilterChange(cuisineKey, 'mexican');

      expect(component.selectedFilters[cuisineKey]).toBe('mexican');
    });
  });

  describe('Reset functionality', () => {
    it('should reset all filters and emit reset event when onReset is called', () => {
      component.searchQuery = 'pizza';
      component.selectedFilters[mealTypeKey] = 'dinner';
      component.selectedFilters[cuisineKey] = 'italian';
      component.selectedFilters[dietKey] = 'vegetarian';

      spyOn(component.reset, 'emit');

      component.onReset();

      expect(component.searchQuery).toBe('');
      expect(component.selectedFilters[mealTypeKey]).toBe('');
      expect(component.selectedFilters[cuisineKey]).toBe('');
      expect(component.selectedFilters[dietKey]).toBe('');
      expect(component.reset.emit).toHaveBeenCalled();
      expect(notificationServiceMock.showNotification).toHaveBeenCalledWith('Filters reset', 'info');
    });
  });
});
