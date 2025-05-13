import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { LoaderComponent } from './loader.component';

describe('LoaderComponent', () => {
  let component: LoaderComponent;
  let fixture: ComponentFixture<LoaderComponent>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoaderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LoaderComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('default values', () => {
    it('should have default message "Loading..."', () => {
      expect(component.message).toBe('Loading...');
    });

    it('should have default size "medium"', () => {
      expect(component.size).toBe('medium');
    });
  });

  describe('input properties', () => {
    it('should update message when input changes', () => {
      const newMessage = 'Please wait...';
      component.message = newMessage;
      fixture.detectChanges();

      expect(component.message).toBe(newMessage);

      const messageElement = findMessageElement();
      if (messageElement) {
        expect(messageElement.nativeElement.textContent).toContain(newMessage);
      } else {
        expect(fixture.nativeElement.textContent).toContain(newMessage);
      }
    });

    it('should update size when input changes', () => {
      const sizeValues: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large'];

      for (const size of sizeValues) {
        component.size = size;
        fixture.detectChanges();

        expect(component.size).toBe(size);

        const loaderElement = findLoaderElement();
        if (loaderElement) {
          const hasExpectedClass = loaderElement.classes[`loader-${size}`] ||
            loaderElement.classes[size] ||
            Object.keys(loaderElement.classes).some(className =>
              className.includes(size)
            );

          expect(hasExpectedClass).toBeTruthy(`Loader should have class related to size "${size}"`);
        }
      }
    });
  });

  describe('rendering', () => {
    it('should render a loader element', () => {
      const loaderElement = findLoaderElement();
      expect(loaderElement).toBeTruthy('Should render a loader element');
    });

    it('should render the message', () => {
      const messageElement = findMessageElement();

      if (messageElement) {
        expect(messageElement.nativeElement.textContent).toContain('Loading...');
      } else {
        expect(fixture.nativeElement.textContent).toContain('Loading...');
      }
    });

    it('should have appropriate class based on size', () => {
      const sizeValue = 'large';
      component.size = sizeValue;
      fixture.detectChanges();

      const loaderElement = findLoaderElement();

      if (loaderElement) {
        const hasLargeClass = loaderElement.classes[`loader-${sizeValue}`] ||
          loaderElement.classes[sizeValue] ||
          Object.keys(loaderElement.classes).some(className =>
            className.includes(sizeValue)
          );

        expect(hasLargeClass).toBeTruthy(`Loader should have class indicating ${sizeValue} size`);
      }
    });
  });

  function findLoaderElement(): DebugElement | null {
    return debugElement.query(By.css('.loader, .spinner, [class*="spinner"], [class*="loader"]'));
  }

  function findMessageElement(): DebugElement | null {
    return debugElement.query(By.css('.message, .loader-text, [class*="message"], [class*="text"]'));
  }
});
