import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppInputComponent } from '@shared/components/app-input/app-input.component';
import { AppButtonComponent } from '@shared/components/app-button/app-button.component';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppInputComponent,
    AppButtonComponent
  ]
})
export class SearchBarComponent {
  @Input() placeholder = 'Search...';
  @Input() buttonText = 'Search';
  @Input() buttonType: 'primary' | 'secondary' | 'tertiary' = 'tertiary';
  @Input() buttonSize: 'small' | 'medium' | 'large' = 'medium';
  @Input() initialQuery = '';

  @Output() search = new EventEmitter<string>();

  searchQuery = '';

  ngOnInit() {
    this.searchQuery = this.initialQuery;
  }

  onSearch() {
    if (this.searchQuery?.trim()) {
      this.search.emit(this.searchQuery);
    }
  }
}
