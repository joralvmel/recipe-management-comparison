import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';

import { AppButtonComponent } from './app-button.component';

describe('AppButtonComponent', () => {
  let component: AppButtonComponent;
  let fixture: ComponentFixture<AppButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AppButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('default properties', () => {
    it('should have default type as primary', () => {
      expect(component.type).toBe('primary');
    });

    it('should have default size as medium', () => {
      expect(component.size).toBe('medium');
    });

    it('should not be disabled by default', () => {
      expect(component.disabled).toBeFalse();
    });

    it('should not be full width by default', () => {
      expect(component.fullWidth).toBeFalse();
    });

    it('should have default button type as button', () => {
      expect(component.buttonType).toBe('button');
    });

    it('should not be loading by default', () => {
      expect(component.loading).toBeFalse();
    });
  });

  describe('buttonClasses getter', () => {
    it('should return primary and medium classes by default', () => {
      expect(component.buttonClasses).toBe('primary-button medium-button ');
    });

    it('should return secondary class when type is secondary', () => {
      component.type = 'secondary';
      expect(component.buttonClasses).toBe('secondary-button medium-button ');
    });

    it('should return tertiary class when type is tertiary', () => {
      component.type = 'tertiary';
      expect(component.buttonClasses).toBe('tertiary-button medium-button ');
    });

    it('should return small class when size is small', () => {
      component.size = 'small';
      expect(component.buttonClasses).toBe('primary-button small-button ');
    });

    it('should return large class when size is large', () => {
      component.size = 'large';
      expect(component.buttonClasses).toBe('primary-button large-button ');
    });

    it('should include full-width class when fullWidth is true', () => {
      component.fullWidth = true;
      expect(component.buttonClasses).toBe('primary-button medium-button full-width');
    });

    it('should combine all classes correctly', () => {
      component.type = 'secondary';
      component.size = 'large';
      component.fullWidth = true;
      expect(component.buttonClasses).toBe('secondary-button large-button full-width');
    });
  });

  describe('DOM rendering', () => {
    it('should render a button element with correct type', () => {
      const buttonElement = fixture.debugElement.query(By.css('button')).nativeElement;
      expect(buttonElement.type).toBe('button');

      component.buttonType = 'submit';
      fixture.detectChanges();
      expect(buttonElement.type).toBe('submit');
    });

    it('should apply the correct classes to the button element', () => {
      component.type = 'secondary';
      component.size = 'large';
      fixture.detectChanges();

      const buttonElement = fixture.debugElement.query(By.css('button')).nativeElement;
      expect(buttonElement.className).toContain('secondary-button');
      expect(buttonElement.className).toContain('large-button');
    });

    it('should disable the button when disabled is true', () => {
      component.disabled = true;
      fixture.detectChanges();

      const buttonElement = fixture.debugElement.query(By.css('button')).nativeElement;
      expect(buttonElement.disabled).toBeTrue();
    });

    it('should show loading indicator when loading is true', () => {
      component.loading = true;
      fixture.detectChanges();

      const loadingElement = fixture.debugElement.query(
        By.css('.loading-spinner, .spinner, [data-loading="true"], [aria-busy="true"]')
      );
      expect(loadingElement).toBeTruthy('Loading indicator should be visible when loading=true');
    });

    it('should project content', () => {
      const testText = 'Test Button';
      const hostFixture = TestBed.createComponent(TestHostComponent);
      hostFixture.componentInstance.buttonText = testText;
      hostFixture.detectChanges();

      const buttonContent = hostFixture.nativeElement.querySelector('button').textContent;
      expect(buttonContent.trim()).toBe(testText);
    });
  });

  describe('event handling', () => {
    it('should emit buttonClick event when clicked', () => {
      spyOn(component.buttonClick, 'emit');
      const buttonElement = fixture.debugElement.query(By.css('button'));

      buttonElement.triggerEventHandler('click', { type: 'click' });

      expect(component.buttonClick.emit).toHaveBeenCalled();
    });

    it('should not emit buttonClick when disabled', () => {
      spyOn(component.buttonClick, 'emit');
      component.disabled = true;
      fixture.detectChanges();

      const buttonElement = fixture.debugElement.query(By.css('button'));
      buttonElement.triggerEventHandler('click', { type: 'click' });

      expect(component.buttonClick.emit).not.toHaveBeenCalled();
    });

    it('should not emit buttonClick when loading', () => {
      spyOn(component.buttonClick, 'emit');
      component.loading = true;
      fixture.detectChanges();

      const buttonElement = fixture.debugElement.query(By.css('button'));
      buttonElement.triggerEventHandler('click', { type: 'click' });

      expect(component.buttonClick.emit).not.toHaveBeenCalled();
    });
  });
});

@Component({
  template: '<app-button>{{buttonText}}</app-button>',
  standalone: true,
  imports: [AppButtonComponent]
})
class TestHostComponent {
  buttonText = '';
}
