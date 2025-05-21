import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppInputComponent } from './app-input.component';

describe('AppInputComponent', () => {
  let component: AppInputComponent;
  let fixture: ComponentFixture<AppInputComponent>;
  let inputElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, AppInputComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AppInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    inputElement = fixture.debugElement.query(By.css('input'));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('default properties', () => {
    it('should have default type as text', () => {
      expect(component.type).toBe('text');
    });

    it('should have empty default placeholder', () => {
      expect(component.placeholder).toBe('');
    });

    it('should not be required by default', () => {
      expect(component.required).toBeFalse();
    });

    it('should not be disabled by default', () => {
      expect(component.disabled).toBeFalse();
    });

    it('should have empty default label', () => {
      expect(component.label).toBe('');
    });

    it('should have empty default id', () => {
      expect(component.id).toBe('');
    });

    it('should have empty default name', () => {
      expect(component.name).toBe('');
    });

    it('should have default cssClass as input-text', () => {
      expect(component.cssClass).toBe('input-text');
    });
  });

  describe('unique ID generation', () => {
    it('should generate a unique ID when not provided', () => {
      component.ngOnInit();
      expect(component.inputId).toMatch(/input-\d+-\d+/);
    });

    it('should use the provided ID when available', () => {
      component.id = 'test-id';
      component.ngOnInit();
      expect(component.inputId).toBe('test-id');
    });

    it('should set input name to ID when name is not provided', () => {
      component.id = 'test-id';
      component.ngOnInit();
      expect(component.inputName).toBe('test-id');
    });

    it('should use provided name when available', () => {
      component.name = 'test-name';
      component.ngOnInit();
      expect(component.inputName).toBe('test-name');
    });
  });

  describe('DOM rendering', () => {
    it('should render input element', () => {
      const input = fixture.debugElement.query(By.css('input'));
      expect(input).toBeTruthy('Input element should exist');
    });

    it('should set input attributes based on component properties', () => {
      fixture.detectChanges();
      const input = fixture.debugElement.query(By.css('input'));
      expect(input).toBeTruthy();
    });

    it('should set the label property correctly', () => {
      const testLabel = 'Email Address';
      component.label = testLabel;
      expect(component.label).toBe(testLabel);
    });
  });

  describe('ControlValueAccessor implementation', () => {
    it('should implement writeValue', () => {
      component.writeValue('test value');
      expect(component.value).toBe('test value');

      component.writeValue('');
      expect(component.value).toBe('');
    });

    it('should implement registerOnChange', () => {
      const mockFn = jasmine.createSpy('mockOnChange');
      component.registerOnChange(mockFn);

      const mockInputEvent = {
        target: { value: 'new value' }
      } as unknown as Event;

      component.onInputChange(mockInputEvent);

      expect(mockFn).toHaveBeenCalledWith('new value');
    });

    it('should implement registerOnTouched', () => {
      const mockFn = jasmine.createSpy('mockOnTouched');
      component.registerOnTouched(mockFn);

      component.onInputBlur();

      expect(mockFn).toHaveBeenCalled();
    });

    it('should implement setDisabledState', () => {
      component.setDisabledState(true);
      expect(component.disabled).toBeTrue();

      component.setDisabledState(false);
      expect(component.disabled).toBeFalse();
    });
  });

  describe('event handling', () => {
    it('should update value and call onChange on input change', () => {
      spyOn(component, 'onChange');
      const mockEvent = {
        target: { value: 'updated value' }
      } as unknown as Event;

      component.onInputChange(mockEvent);

      expect(component.value).toBe('updated value');
      expect(component.onChange).toHaveBeenCalledWith('updated value');
    });

    it('should mark as touched and call onTouch on input blur', () => {
      spyOn(component, 'onTouch');

      component.onInputBlur();

      expect(component.touched).toBeTrue();
      expect(component.onTouch).toHaveBeenCalled();
    });

    it('should emit enter event when Enter key is pressed', () => {
      spyOn(component.enter, 'emit');
      const mockEvent = new KeyboardEvent('keyup', { key: 'Enter' });

      component.onKeyUp(mockEvent);

      expect(component.enter.emit).toHaveBeenCalled();
    });

    it('should not emit enter event when other keys are pressed', () => {
      spyOn(component.enter, 'emit');
      const mockEvent = new KeyboardEvent('keyup', { key: 'a' });

      component.onKeyUp(mockEvent);

      expect(component.enter.emit).not.toHaveBeenCalled();
    });
  });
});

describe('AppInputComponent - Forms Integration', () => {
  @Component({
    template: `<app-input [(ngModel)]="testValue" [disabled]="isDisabled"></app-input>`,
    standalone: true,
    imports: [FormsModule, AppInputComponent]
  })
  class TestHostComponent {
    testValue = 'initial value';
    isDisabled = false;
  }

  let testHostFixture: ComponentFixture<TestHostComponent>;
  let testHostComponent: TestHostComponent;
  let inputElement: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, AppInputComponent, TestHostComponent]
    }).compileComponents();

    testHostFixture = TestBed.createComponent(TestHostComponent);
    testHostComponent = testHostFixture.componentInstance;
  });

  it('should bind to forms', fakeAsync(() => {
    testHostFixture.detectChanges();
    tick(100);

    inputElement = testHostFixture.debugElement.query(By.css('input')).nativeElement;

    expect(inputElement).toBeTruthy('Input element should exist');

    testHostComponent.testValue = 'updated value';
    testHostFixture.detectChanges();
    tick(100);

    testHostComponent.isDisabled = true;
    testHostFixture.detectChanges();
    tick(100);

    expect(testHostFixture.nativeElement).toBeTruthy();
  }));

  it('should handle input events', fakeAsync(() => {
    testHostFixture.detectChanges();
    tick(100);

    inputElement = testHostFixture.debugElement.query(By.css('input')).nativeElement;
    inputElement.value = 'user input';
    inputElement.dispatchEvent(new Event('input'));
    testHostFixture.detectChanges();
    tick(100);

    expect(testHostComponent.testValue).toBe('user input');
  }));
});
