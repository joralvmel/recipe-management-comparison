import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterOption } from '@models/filter.model';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

const OPTIONS = 'options';
const SELECTED_VALUE = 'selectedValue';
const ID = 'id';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class DropdownComponent implements OnInit, OnChanges, OnDestroy {
  private static activeDropdownSubject = new Subject<string>();

  @Input() options: FilterOption[] = [];
  @Input() id = '';
  @Input() selectedValue = '';
  @Input() dropUp = false;

  @Output() valueChange = new EventEmitter<string>();

  isOpen = false;
  selectedLabel = '';
  private uniqueId: string;
  private destroy$ = new Subject<void>();

  @ViewChild('dropdown') dropdownEl?: ElementRef;

  constructor() {
    this.uniqueId = this.id || `dropdown-${Math.random().toString(36).substring(2, 9)}`;
  }

  ngOnInit() {
    this.updateSelectedLabel();
    DropdownComponent.activeDropdownSubject.pipe(
      filter(id => id !== this.uniqueId && this.isOpen),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.isOpen = false;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes[OPTIONS] || changes[SELECTED_VALUE]) {
      this.updateSelectedLabel();
    }

    if (changes[ID] && !changes[ID].firstChange) {
      this.uniqueId = this.id || this.uniqueId;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      DropdownComponent.activeDropdownSubject.next(this.uniqueId);
    }
  }

  selectOption(option: FilterOption, event: Event): void {
    event.stopPropagation();
    this.selectedValue = option.value;
    this.selectedLabel = option.label;
    this.isOpen = false;
    this.valueChange.emit(option.value);
  }

  private updateSelectedLabel(): void {
    const selected = this.options.find(opt => opt.value === this.selectedValue);
    this.selectedLabel = selected ? selected.label :
      this.options.length > 0 ? this.options[0].label : '';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen && this.dropdownEl &&
      !this.dropdownEl.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}
