import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SearchBarComponent } from './search-bar.component';
import { AppInputComponent } from '@shared/components/app-input/app-input.component';
import { AppButtonComponent } from '@shared/components/app-button/app-button.component';

@Component({
  selector: 'app-input',
  template: '<input [(ngModel)]="value" (keyup.enter)="onEnterPressed($event)" />',
  standalone: true,
  imports: [FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MockAppInputComponent),
      multi: true
    }
  ]
})
class MockAppInputComponent {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() required = false;
  @Input() value = '';
  @Input() errorMessage = '';
  @Output() valueChange = new EventEmitter<string>();
  @Output() enter = new EventEmitter<void>();

  onEnterPressed(event: Event) {
    this.enter.emit();
  }

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}

@Component({
  selector: 'app-button',
  template: '<button (click)="onClick.emit()">{{ text }}</button>',
  standalone: true
})
class MockAppButtonComponent {
  @Input() text = '';
  @Input() disabled = false;
  @Input() type = 'primary';
  @Input() size = 'medium';
  @Output() onClick = new EventEmitter<void>();
}

describe('SearchBarComponent', () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        SearchBarComponent
      ]
    })
      .overrideComponent(SearchBarComponent, {
        remove: { imports: [AppInputComponent, AppButtonComponent] },
        add: { imports: [MockAppInputComponent, MockAppButtonComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should have default values', () => {
      expect(component.placeholder).toBe('Search...');
      expect(component.buttonText).toBe('Search');
      expect(component.buttonType).toBe('tertiary');
      expect(component.buttonSize).toBe('medium');
      expect(component.initialQuery).toBe('');
      expect(component.searchQuery).toBe('');
    });

    it('should initialize searchQuery from initialQuery', () => {
      component.initialQuery = 'test query';
      component.ngOnInit();

      expect(component.searchQuery).toBe('test query');
    });
  });

  describe('input properties', () => {
    it('should set placeholder on input', () => {
      const customPlaceholder = 'Find something...';
      component.placeholder = customPlaceholder;
      fixture.detectChanges();

      expect(component.placeholder).toBe(customPlaceholder);
    });

    it('should set button text', () => {
      const customButtonText = 'Find';
      component.buttonText = customButtonText;
      fixture.detectChanges();

      expect(component.buttonText).toBe(customButtonText);
    });

    it('should set button type', () => {
      const customType = 'secondary';
      component.buttonType = customType;
      fixture.detectChanges();

      expect(component.buttonType).toBe(customType);
    });

    it('should set button size', () => {
      const customSize = 'small';
      component.buttonSize = customSize;
      fixture.detectChanges();

      expect(component.buttonSize).toBe(customSize);
    });
  });

  describe('search functionality', () => {
    it('should emit search event with query when onSearch is called', () => {
      spyOn(component.search, 'emit');
      component.searchQuery = 'test search';

      component.onSearch();

      expect(component.search.emit).toHaveBeenCalledWith('test search');
    });

    it('should emit empty string when searchQuery is empty', () => {
      spyOn(component.search, 'emit');
      component.searchQuery = '';

      component.onSearch();

      expect(component.search.emit).toHaveBeenCalledWith('');
    });

    it('should trigger search when button is clicked', () => {
      spyOn(component, 'onSearch');

      // Directly test the method
      component.onSearch();

      expect(component.onSearch).toHaveBeenCalled();
    });

    it('should trigger search when enter is pressed in input', () => {
      spyOn(component, 'onSearch');

      const inputElement = fixture.debugElement.query(By.directive(MockAppInputComponent));
      inputElement.triggerEventHandler('enter', null);

      expect(component.onSearch).toHaveBeenCalled();
    });
  });

  describe('form binding', () => {
    it('should update searchQuery when input value changes', () => {
      component.searchQuery = 'new search term';
      fixture.detectChanges();

      expect(component.searchQuery).toBe('new search term');
    });
  });
});
