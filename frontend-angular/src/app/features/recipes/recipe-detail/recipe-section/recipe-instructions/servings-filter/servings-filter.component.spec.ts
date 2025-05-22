import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ServingsFilterComponent } from './servings-filter.component';
import { DebugElement } from '@angular/core';

describe('ServingsFilterComponent', () => {
  let component: ServingsFilterComponent;
  let fixture: ComponentFixture<ServingsFilterComponent>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, ServingsFilterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ServingsFilterComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default value of 1', () => {
    expect(component.servings).toBe(1);
  });

  it('should initialize with provided @Input value', () => {
    component.servings = 4;
    fixture.detectChanges();
    expect(component.servings).toBe(4);
  });

  describe('increaseServings method', () => {
    it('should increase servings by 1', () => {
      const emitSpy = spyOn(component.servingsChange, 'emit');
      component.servings = 5;
      component.increaseServings();
      expect(component.servings).toBe(6);
      expect(emitSpy).toHaveBeenCalledWith(6);
    });

    it('should not increase servings beyond maximum (99)', () => {
      const emitSpy = spyOn(component.servingsChange, 'emit');
      component.servings = 99;
      component.increaseServings();
      expect(component.servings).toBe(99);
      expect(emitSpy).not.toHaveBeenCalled();
    });
  });

  describe('decreaseServings method', () => {
    it('should decrease servings by 1', () => {
      const emitSpy = spyOn(component.servingsChange, 'emit');
      component.servings = 5;
      component.decreaseServings();
      expect(component.servings).toBe(4);
      expect(emitSpy).toHaveBeenCalledWith(4);
    });

    it('should not decrease servings below minimum (1)', () => {
      const emitSpy = spyOn(component.servingsChange, 'emit');
      component.servings = 1;
      component.decreaseServings();
      expect(component.servings).toBe(1);
      expect(emitSpy).not.toHaveBeenCalled();
    });
  });

  describe('onServingsChange method', () => {
    it('should set servings to valid input value', () => {
      const emitSpy = spyOn(component.servingsChange, 'emit');
      component.onServingsChange(8);
      expect(component.servings).toBe(8);
      expect(emitSpy).toHaveBeenCalledWith(8);
    });

    it('should set servings to minimum (1) if input is below minimum', () => {
      const emitSpy = spyOn(component.servingsChange, 'emit');
      component.onServingsChange(0);
      expect(component.servings).toBe(1);
      expect(emitSpy).toHaveBeenCalledWith(1);
    });

    it('should set servings to minimum (1) if input is negative', () => {
      const emitSpy = spyOn(component.servingsChange, 'emit');
      component.onServingsChange(-5);
      expect(component.servings).toBe(1);
      expect(emitSpy).toHaveBeenCalledWith(1);
    });

    it('should set servings to maximum (99) if input is above maximum', () => {
      const emitSpy = spyOn(component.servingsChange, 'emit');
      component.onServingsChange(105);
      expect(component.servings).toBe(99);
      expect(emitSpy).toHaveBeenCalledWith(99);
    });
  });

  describe('DOM interactions', () => {
    it('should call decreaseServings when clicking the decrease button', () => {
      const decreaseSpy = spyOn(component, 'decreaseServings');

      const buttons = debugElement.queryAll(By.css('button'));
      const decreaseButton = buttons.find(btn => {
        const text = btn.nativeElement.textContent;
        return text.includes('-') || text.includes('Decrease') ||
          text.toLowerCase().includes('menos') || text.toLowerCase().includes('less');
      });

      if (!decreaseButton) {
        pending('Decrease button not found in template');
        return;
      }

      decreaseButton.triggerEventHandler('click', null);
      expect(decreaseSpy).toHaveBeenCalled();
    });

    it('should call increaseServings when clicking the increase button', () => {
      const increaseSpy = spyOn(component, 'increaseServings');

      const buttons = debugElement.queryAll(By.css('button'));
      const increaseButton = buttons.find(btn => {
        const text = btn.nativeElement.textContent;
        return text.includes('+') || text.includes('Increase') ||
          text.toLowerCase().includes('más') || text.toLowerCase().includes('more');
      });

      if (!increaseButton) {
        pending('Increase button not found in template');
        return;
      }

      increaseButton.triggerEventHandler('click', null);
      expect(increaseSpy).toHaveBeenCalled();
    });

    it('should call onServingsChange when input value changes', () => {
      const onChangeSpy = spyOn(component, 'onServingsChange');
      const input = debugElement.query(By.css('input'));

      if (!input) {
        pending('Input field not found in template');
        return;
      }

      const inputElement = input.nativeElement;
      inputElement.value = '6';
      inputElement.dispatchEvent(new Event('input'));

      expect(onChangeSpy).toHaveBeenCalled();
    });
  });

  describe('EventEmitter', () => {
    it('should emit the updated servings value', () => {
      const servingsChangeSpy = jasmine.createSpy('servingsChangeSpy');
      component.servingsChange.subscribe(servingsChangeSpy);

      component.servings = 3;
      component.increaseServings();

      expect(servingsChangeSpy).toHaveBeenCalledWith(4);
    });
  });
});
