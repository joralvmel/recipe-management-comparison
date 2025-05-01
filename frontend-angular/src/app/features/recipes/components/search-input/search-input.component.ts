import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-search-input',
  templateUrl: './search-input.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class SearchInputComponent implements OnInit {
  @Input() placeholder = 'Search...';
  @Input() initialValue = '';
  @Input() debounceTime = 300;

  @Output() valueChange = new EventEmitter<string>();

  inputValue = '';
  private searchSubject = new Subject<string>();

  ngOnInit() {
    this.inputValue = this.initialValue;

    this.searchSubject.pipe(
      debounceTime(this.debounceTime),
      distinctUntilChanged()
    ).subscribe(value => {
      this.valueChange.emit(value);
    });
  }

  onInputChange(value: string) {
    this.searchSubject.next(value);
  }
}
