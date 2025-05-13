import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { LazyImgDirective } from './lazy-img.directive';

interface MockImageElement {
  src: string;
  onload: ((this: GlobalEventHandlers, ev: Event) => void) | null;
  onerror: OnErrorEventHandler | null;
}

describe('LazyImgDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let originalIntersectionObserver: typeof IntersectionObserver;
  let observeSpy: jasmine.Spy;
  let disconnectSpy: jasmine.Spy;
  let intersectionObserverCallback: IntersectionObserverCallback;

  class MockIntersectionObserver implements Partial<IntersectionObserver> {
    readonly root: Element | null = null;
    readonly rootMargin: string = '';
    readonly thresholds: ReadonlyArray<number> = [];

    observe = jasmine.createSpy('observe');
    unobserve = jasmine.createSpy('unobserve');
    disconnect = jasmine.createSpy('disconnect');
    takeRecords = () => [] as IntersectionObserverEntry[];

    constructor(callback: IntersectionObserverCallback) {
      intersectionObserverCallback = callback;
    }
  }

  @Component({
    selector: 'app-test-lazy-img',
    template: `<img appLazyImg="https://example.com/image.jpg" [placeholderSrc]="placeholder">`,
    standalone: true,
    imports: [LazyImgDirective]
  })
  class TestComponent {
    placeholder = 'assets/images/placeholder.svg';
  }

  beforeEach(async () => {
    originalIntersectionObserver = window.IntersectionObserver;

    const mockConstructor = MockIntersectionObserver as unknown as typeof IntersectionObserver;
    window.IntersectionObserver = mockConstructor;

    await TestBed.configureTestingModule({
      imports: [TestComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const mockPrototype = window.IntersectionObserver.prototype as unknown as MockIntersectionObserver;
    observeSpy = mockPrototype.observe;
    disconnectSpy = mockPrototype.disconnect;
  });

  afterEach(() => {
    window.IntersectionObserver = originalIntersectionObserver;
  });

  it('should create an instance', () => {
    expect(component).toBeTruthy();
    const directive = fixture.debugElement.query(By.directive(LazyImgDirective));
    expect(directive).toBeTruthy();
  });

  it('should set placeholder as initial src', () => {
    const imgElement = fixture.debugElement.query(By.css('img')).nativeElement;
    expect(imgElement.src).toContain('placeholder.svg');
    expect(imgElement.classList.contains('lazy-loading')).toBeTrue();
    expect(imgElement.classList.contains('lazy-loaded')).toBeFalse();
  });

  it('should load image when intersecting', fakeAsync(() => {
    const originalImage = window.Image;
    const mockImageInstance: MockImageElement = {
      src: '',
      onload: null,
      onerror: null
    };

    spyOn(window, 'Image').and.returnValue(mockImageInstance as unknown as HTMLImageElement);

    if (intersectionObserverCallback) {
      intersectionObserverCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    }

    expect(mockImageInstance.src).toBe('https://example.com/image.jpg');

    if (mockImageInstance.onload) {
      const eventTarget = mockImageInstance as unknown as GlobalEventHandlers;
      mockImageInstance.onload.call(eventTarget, new Event('load'));
    }

    tick();
    fixture.detectChanges();

    const imgElement = fixture.debugElement.query(By.css('img')).nativeElement;
    expect(imgElement.src).toContain('example.com/image.jpg');
    expect(imgElement.classList.contains('lazy-loaded')).toBeTrue();
    expect(imgElement.classList.contains('lazy-loading')).toBeFalse();

    window.Image = originalImage;
  }));

  it('should handle image load error', fakeAsync(() => {
    spyOn(console, 'error');

    const originalImage = window.Image;
    const mockImageInstance: MockImageElement = {
      src: '',
      onload: null,
      onerror: null
    };

    spyOn(window, 'Image').and.returnValue(mockImageInstance as unknown as HTMLImageElement);

    if (intersectionObserverCallback) {
      intersectionObserverCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    }

    if (mockImageInstance.onerror) {
      const eventTarget = mockImageInstance as unknown as GlobalEventHandlers;
      mockImageInstance.onerror.call(eventTarget, new Event('error'));
    }

    tick();
    fixture.detectChanges();

    expect(console.error).toHaveBeenCalledWith('Error loading image: https://example.com/image.jpg');

    window.Image = originalImage;
  }));

  it('should respect custom placeholder', () => {
    component.placeholder = 'assets/images/custom-placeholder.png';
    fixture.detectChanges();

    const newFixture = TestBed.createComponent(TestComponent);
    newFixture.componentInstance.placeholder = 'assets/images/custom-placeholder.png';
    newFixture.detectChanges();

    const imgElement = newFixture.debugElement.query(By.css('img')).nativeElement;
    expect(imgElement.src).toContain('custom-placeholder.png');
  });
});
