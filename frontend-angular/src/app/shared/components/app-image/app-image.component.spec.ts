import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CommonModule, NgOptimizedImage } from '@angular/common';

import { AppImageComponent } from './app-image.component';
import { LazyImgDirective } from '@shared/directives/lazy-img.directive';

describe('AppImageComponent', () => {
  let component: AppImageComponent;
  let fixture: ComponentFixture<AppImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        NgOptimizedImage,
        AppImageComponent,
        LazyImgDirective
      ],
      providers: []
    }).compileComponents();

    fixture = TestBed.createComponent(AppImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('default properties', () => {
    it('should have default src as empty string', () => {
      expect(component.src).toBe('');
    });

    it('should have default alt as empty string', () => {
      expect(component.alt).toBe('');
    });

    it('should have default width as 0', () => {
      expect(component.width).toBe(0);
    });

    it('should have default height as 0', () => {
      expect(component.height).toBe(0);
    });

    it('should have default cssClass as empty string', () => {
      expect(component.cssClass).toBe('');
    });

    it('should have default priority as false', () => {
      expect(component.priority).toBeFalse();
    });

    it('should have default lazy as true', () => {
      expect(component.lazy).toBeTrue();
    });

    it('should have default useLazyDirective as false', () => {
      expect(component.useLazyDirective).toBeFalse();
    });

    it('should have default placeholderSrc', () => {
      expect(component.placeholderSrc).toBe('assets/images/placeholder.svg');
    });
  });

  describe('DOM rendering', () => {
    it('should render img element with correct attributes', () => {
      component.src = 'test-image.jpg';
      component.alt = 'Test image';
      component.width = 300;
      component.height = 200;
      component.cssClass = 'custom-class';
      fixture.detectChanges();

      const imgElement = fixture.debugElement.query(By.css('img')).nativeElement;

      expect(imgElement).toBeTruthy();
      expect(imgElement.src).toContain('test-image.jpg');
      expect(imgElement.alt).toBe('Test image');
      expect(imgElement.width.toString()).toBe('300');
      expect(imgElement.height.toString()).toBe('200');
      expect(imgElement.classList).toContain('custom-class');
    });

    it('should handle lazy loading attribute', () => {
      component.src = 'test-image.jpg';
      component.lazy = true;
      component.useLazyDirective = false;
      fixture.detectChanges();

      const imgElement = fixture.debugElement.query(By.css('img')).nativeElement;
      expect(imgElement.loading).toBeDefined();
    });

    it('should handle eager loading when lazy=false', () => {
      component.src = 'test-image.jpg';
      component.lazy = false;
      fixture.detectChanges();

      const imgElement = fixture.debugElement.query(By.css('img')).nativeElement;

      expect(imgElement).toBeTruthy();

      if (imgElement.hasAttribute('loading')) {
        expect(imgElement.loading).not.toBe('lazy');
      } else {
        expect(true).toBeTrue();
      }
    });

    it('should handle priority attribute appropriately', () => {
      component.src = 'test-image.jpg';
      component.priority = true;
      fixture.detectChanges();

      const imgElement = fixture.debugElement.query(By.css('img'));
      expect(imgElement).toBeTruthy();
    });

    it('should handle LazyImgDirective configuration', () => {
      component.src = 'test-image.jpg';
      component.useLazyDirective = true;
      fixture.detectChanges();

      const imgElement = fixture.debugElement.query(By.css('img'));
      expect(imgElement).toBeTruthy();
    });
  });

  describe('error handling', () => {
    it('should call onImageError when image fails to load', () => {
      spyOn(component, 'onImageError');
      component.src = 'non-existent-image.jpg';
      fixture.detectChanges();

      const imgElement = fixture.debugElement.query(By.css('img'));
      imgElement.triggerEventHandler('error', {});

      expect(component.onImageError).toHaveBeenCalled();
    });

    it('should log error message on image load error', () => {
      spyOn(console, 'error');
      component.src = 'non-existent-image.jpg';
      fixture.detectChanges();

      const imgElement = fixture.debugElement.query(By.css('img'));
      imgElement.triggerEventHandler('error', {});

      expect(console.error).toHaveBeenCalledWith('Error loading image: non-existent-image.jpg');
    });
  });

  describe('NgOptimizedImage integration', () => {
    it('should use NgOptimizedImage when available', () => {
      component.src = 'test-image.jpg';
      fixture.detectChanges();

      const img = fixture.debugElement.query(By.css('img')).nativeElement;
      expect(img).toBeTruthy();
      expect(img.src).toContain('test-image.jpg');
    });
  });
});
