import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeaturesSectionComponent } from './features-section.component';
import { CommonModule } from '@angular/common';
import { DebugElement } from '@angular/core';

describe('FeaturesSectionComponent', () => {
  let component: FeaturesSectionComponent;
  let fixture: ComponentFixture<FeaturesSectionComponent>;
  let el: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturesSectionComponent, CommonModule]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FeaturesSectionComponent);
    component = fixture.componentInstance;
    el = fixture.debugElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty features array', () => {
    fixture.detectChanges();
    expect(component.features).toEqual([]);
  });

  it('should accept features input and render them', () => {
    const testFeatures = [
      {
        id: 1,
        title: 'Test Feature 1',
        description: 'Test Description 1',
        icon: 'test-icon-1'
      },
      {
        id: 2,
        title: 'Test Feature 2',
        description: 'Test Description 2',
        icon: 'test-icon-2'
      }
    ];

    component.features = testFeatures;
    fixture.detectChanges();

    const hostElement = fixture.nativeElement;
    const componentHTML = hostElement.textContent;

    expect(componentHTML).toContain('Test Feature 1');
    expect(componentHTML).toContain('Test Description 1');
    expect(componentHTML).toContain('Test Feature 2');
    expect(componentHTML).toContain('Test Description 2');
  });

  describe('trackByFn', () => {
    it('should return feature id when available', () => {
      const feature = { id: 123, title: 'Test', description: 'Desc' };
      expect(component.trackByFn(5, feature)).toBe(123);
    });

    it('should return index when feature has no id', () => {
      const feature = { title: 'Test', description: 'Desc' };
      expect(component.trackByFn(5, feature)).toBe(5);
    });

    it('should return string id when feature id is a string', () => {
      const feature = { id: 'abc', title: 'Test', description: 'Desc' };
      expect(component.trackByFn(5, feature)).toBe('abc');
    });
  });

  it('should handle empty features array gracefully', () => {
    component.features = [];
    fixture.detectChanges();

    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should handle features with missing optional properties', () => {
    const incompleteFeatures = [
      { title: 'No ID', description: 'Missing ID' },
      { id: 1, title: 'No Icon', description: 'Missing icon' }
    ];

    component.features = incompleteFeatures;
    fixture.detectChanges();

    const hostElement = fixture.nativeElement;
    const componentHTML = hostElement.textContent;

    expect(componentHTML).toContain('No ID');
    expect(componentHTML).toContain('Missing ID');
    expect(componentHTML).toContain('No Icon');
    expect(componentHTML).toContain('Missing icon');
  });
});
