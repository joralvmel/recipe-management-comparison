import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormGroupComponent } from './form-group.component';
import { AppInputComponent } from '@shared/components/app-input/app-input.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';

describe('FormGroupComponent', () => {
  let component: FormGroupComponent;
  let fixture: ComponentFixture<FormGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule
      ],
      declarations: [],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();

    TestBed.overrideComponent(FormGroupComponent, {
      set: {
        imports: [FormsModule],
      }
    });

    fixture = TestBed.createComponent(FormGroupComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should have default values', () => {
      expect(component.label).toBe('');
      expect(component.type).toBe('text');
      expect(component.name).toBe('');
      expect(component.value).toBe('');
      expect(component.required).toBeFalse();
      expect(component.disabled).toBeFalse();
      expect(component.placeholder).toBe('');
      expect(component.id).toBe('');
    });

    it('should generate a unique groupId', () => {
      expect(component.groupId).toMatch(/form-group-\d+-\d+/);
    });

    it('should set inputId to id when provided', () => {
      component.id = 'custom-id';
      component.ngOnInit();
      expect(component.inputId).toBe('custom-id');
    });

    it('should set inputId based on name when id is not provided', () => {
      component.name = 'username';
      component.id = '';
      component.ngOnInit();
      expect(component.inputId).toBe('username-field');
    });

    it('should set inputId to groupId when neither id nor name is provided', () => {
      component.name = '';
      component.id = '';
      component.ngOnInit();
      expect(component.inputId).toBe(component.groupId);
    });
  });

  describe('event handling', () => {
    it('should emit valueChange event when input value changes', () => {
      spyOn(component.valueChange, 'emit');

      component.onValueChange('new value');

      expect(component.valueChange.emit).toHaveBeenCalledWith('new value');
    });

    it('should emit enter event when enter is pressed', () => {
      spyOn(component.enter, 'emit');

      component.onEnter();

      expect(component.enter.emit).toHaveBeenCalled();
    });
  });
});
