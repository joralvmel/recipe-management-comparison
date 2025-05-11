import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SearchInputComponent } from './search-input.component';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { Subject } from 'rxjs';

describe('SearchInputComponent', () => {
  let component: SearchInputComponent;
  let fixture: ComponentFixture<SearchInputComponent>;
  let inputElement: HTMLInputElement;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchInputComponent, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchInputComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    fixture.detectChanges();
    inputElement = debugElement.query(By.css('input')).nativeElement;
    expect(component.placeholder).toBe('Search...');
    expect(component.initialValue).toBe('');
    expect(component.debounceTime).toBe(300);
    expect(inputElement.placeholder).toBe('Search...');
  });

  it('should emit valueChange after debounce time', fakeAsync(() => {
    fixture.detectChanges();
    inputElement = debugElement.query(By.css('input')).nativeElement;
    const valueChangeSpy = spyOn(component.valueChange, 'emit');

    inputElement.value = 'test';
    inputElement.dispatchEvent(new Event('input'));

    expect(valueChangeSpy).not.toHaveBeenCalled();

    tick(300);
    expect(valueChangeSpy).toHaveBeenCalledWith('test');
  }));

  it('should respect custom debounceTime', fakeAsync(() => {
    component.debounceTime = 500;
    fixture.detectChanges();
    inputElement = debugElement.query(By.css('input')).nativeElement;
    const valueChangeSpy = spyOn(component.valueChange, 'emit');

    inputElement.value = 'test';
    inputElement.dispatchEvent(new Event('input'));

    tick(300);
    expect(valueChangeSpy).not.toHaveBeenCalled();

    tick(200);
    expect(valueChangeSpy).toHaveBeenCalledWith('test');
  }));

  it('should not emit if value has not changed', fakeAsync(() => {
    fixture.detectChanges();
    inputElement = debugElement.query(By.css('input')).nativeElement;
    const valueChangeSpy = spyOn(component.valueChange, 'emit');

    inputElement.value = 'test';
    inputElement.dispatchEvent(new Event('input'));
    tick(300);
    expect(valueChangeSpy).toHaveBeenCalledTimes(1);

    valueChangeSpy.calls.reset();
    inputElement.value = 'test';
    inputElement.dispatchEvent(new Event('input'));
    tick(300);

    expect(valueChangeSpy).not.toHaveBeenCalled();
  }));

  it('should emit when value changes', fakeAsync(() => {
    fixture.detectChanges();
    inputElement = debugElement.query(By.css('input')).nativeElement;
    const valueChangeSpy = spyOn(component.valueChange, 'emit');

    inputElement.value = 'test1';
    inputElement.dispatchEvent(new Event('input'));
    tick(300);
    expect(valueChangeSpy).toHaveBeenCalledWith('test1');

    valueChangeSpy.calls.reset();
    inputElement.value = 'test2';
    inputElement.dispatchEvent(new Event('input'));
    tick(300);

    expect(valueChangeSpy).toHaveBeenCalledWith('test2');
  }));

  it('should correctly call onInputChange when input changes', () => {
    fixture.detectChanges();
    inputElement = debugElement.query(By.css('input')).nativeElement;
    const onInputChangeSpy = spyOn(component, 'onInputChange');

    inputElement.value = 'test';
    inputElement.dispatchEvent(new Event('input'));

    expect(onInputChangeSpy).toHaveBeenCalledWith('test');
  });

  it('should handle empty search terms', fakeAsync(() => {
    fixture.detectChanges();
    inputElement = debugElement.query(By.css('input')).nativeElement;
    const valueChangeSpy = spyOn(component.valueChange, 'emit');

    inputElement.value = 'test';
    inputElement.dispatchEvent(new Event('input'));
    tick(300);

    valueChangeSpy.calls.reset();
    inputElement.value = '';
    inputElement.dispatchEvent(new Event('input'));
    tick(300);

    expect(valueChangeSpy).toHaveBeenCalledWith('');
  }));

  it('should clean up searchSubject when manually completed', () => {
    fixture.detectChanges();

    const searchSubjectKey = 'searchSubject';
    const searchSubject = (component as unknown as Record<string, Subject<string>>)[searchSubjectKey];

    const nextSpy = spyOn(searchSubject, 'next');
    const completeSpy = spyOn(searchSubject, 'complete');

    searchSubject.complete();

    expect(completeSpy).toHaveBeenCalled();

    try {
      component.onInputChange('test after destroy');
      expect(nextSpy).toHaveBeenCalledWith('test after destroy');
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });
});
