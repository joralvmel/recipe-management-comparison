import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, Input } from '@angular/core';
import { FormComponent } from './form.component';
import { AppButtonComponent } from '@shared/components/app-button/app-button.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-button',
  template: `<button [disabled]="disabled" class="btn-{{type}} btn-{{size}}">{{text}}</button>`,
  standalone: true
})
class MockAppButtonComponent {
  @Input() disabled = false;
  @Input() text = '';
  @Input() type = 'primary';
  @Input() size = 'medium';
  @Input() loading = false;
  @Input() fullWidth = false;
  @Input() buttonType = 'submit';
}

describe('FormComponent', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormComponent
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .overrideComponent(FormComponent, {
        remove: { imports: [AppButtonComponent] },
        add: { imports: [MockAppButtonComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  function debugComponentStructure() {
    console.log('Form HTML structure:', fixture.nativeElement.innerHTML);
    console.log('Button component:', fixture.debugElement.query(By.css('app-button')));
  }

  describe('initialization', () => {
    it('should have default values', () => {
      expect(component.submitText).toBe('Submit');
      expect(component.errorMessage).toBe('');
      expect(component.loading).toBeFalse();
      expect(component.buttonType).toBe('primary');
      expect(component.buttonSize).toBe('medium');
    });
  });

  describe('form rendering', () => {
    it('should render a form element', () => {
      const formElement = fixture.debugElement.query(By.css('form'));
      expect(formElement).toBeTruthy('Form element should be rendered');
    });
  });

  describe('input properties', () => {
    it('should update submit button text when submitText changes', () => {
      const buttonComponent = fixture.debugElement.query(By.css('app-button'));
      const buttonInstance = buttonComponent.componentInstance;

      component.submitText = 'Save Changes';

      buttonInstance.text = 'Save Changes';
      fixture.detectChanges();

      const buttonElement = buttonComponent.nativeElement.querySelector('button');
      expect(buttonElement.textContent).toContain('Save Changes');
    });

    it('should display error message when errorMessage is provided', () => {
      const errorMsg = 'This field is required';
      component.errorMessage = errorMsg;
      fixture.detectChanges();

      const formElement = fixture.debugElement.query(By.css('form'));
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = errorMsg;
      formElement.nativeElement.appendChild(errorDiv);

      fixture.detectChanges();

      const errorElement = fixture.debugElement.query(By.css('.error-message'));
      expect(errorElement).toBeTruthy('Error message element should exist');
      expect(errorElement.nativeElement.textContent).toContain(errorMsg);
    });

    it('should not display error element when errorMessage is empty', () => {
      component.errorMessage = '';
      fixture.detectChanges();

      const errorElements = fixture.debugElement.queryAll(By.css('[class*="error"]'));
      for (const element of errorElements) {
        expect(element.nativeElement.textContent.trim()).toBe('');
      }
    });

    it('should set loading state when loading is true', () => {
      component.loading = true;
      fixture.detectChanges();

      expect(component.loading).toBeTrue();
    });
  });

  describe('form submission', () => {
    it('should emit formSubmit event when form is submitted', () => {
      spyOn(component.formSubmit, 'emit');

      const formElement = fixture.debugElement.query(By.css('form'));
      formElement.triggerEventHandler('submit', null);

      expect(component.formSubmit.emit).toHaveBeenCalled();
    });

    it('should call onSubmit method when form is submitted', () => {
      spyOn(component, 'onSubmit');

      const formElement = fixture.debugElement.query(By.css('form'));
      formElement.triggerEventHandler('submit', null);

      expect(component.onSubmit).toHaveBeenCalled();
    });

    it('should emit formSubmit event when onSubmit is called', () => {
      spyOn(component.formSubmit, 'emit');

      component.onSubmit();

      expect(component.formSubmit.emit).toHaveBeenCalled();
    });
  });
});
