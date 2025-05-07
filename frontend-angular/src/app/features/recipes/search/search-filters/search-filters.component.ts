import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { AppButtonComponent } from '@shared/components/app-button/app-button.component';
import { SearchBarComponent } from '@shared/components/search-bar/search-bar.component';
import { Filter } from '@models/filter.model';
import { NotificationService } from '@shared/services/notification.service';

const MEAL_TYPE = 'meal-type';
const CUISINE = 'cuisine';
const DIET = 'diet';

@Component({
  selector: 'app-search-filters',
  templateUrl: './search-filters.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownComponent,
    AppButtonComponent,
    SearchBarComponent
  ]
})
export class SearchFiltersComponent {
  @Input() filters: Filter[] = [];

  @Output() search = new EventEmitter<{
    query: string;
    mealType: string;
    cuisine: string;
    diet: string;
  }>();

  @Output() reset = new EventEmitter<void>();

  searchQuery = '';
  selectedFilters: Record<string, string> = {
    [MEAL_TYPE]: '',
    [CUISINE]: '',
    [DIET]: ''
  };

  constructor(private notificationService: NotificationService) {}

  onSearchQueryChange(query: string): void {
    this.searchQuery = query;
    this.onSearch();
  }

  onSearch(): void {
    this.search.emit({
      query: this.searchQuery,
      mealType: this.selectedFilters[MEAL_TYPE],
      cuisine: this.selectedFilters[CUISINE],
      diet: this.selectedFilters[DIET]
    });
  }

  onReset(): void {
    this.searchQuery = '';
    this.selectedFilters = {
      [MEAL_TYPE]: '',
      [CUISINE]: '',
      [DIET]: ''
    };
    this.reset.emit();
    this.notificationService.showNotification('Filters reset', 'info');
  }

  onFilterChange(filterId: string, value: string): void {
    this.selectedFilters[filterId] = value;
  }
}
