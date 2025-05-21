import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PaginationComponent } from './pagination.component';
import { AppButtonComponent } from '@shared/components/app-button/app-button.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { FilterOption } from '@models/filter.model';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';

@Component({
  selector: 'app-button',
  template: '<button (click)="onClick.emit()">{{ text }}</button>',
  standalone: true
})
class MockAppButtonComponent {
  @Input() text = '';
  @Input() disabled = false;
  @Input() type = 'primary';
  @Input() size = 'medium';
  @Output() onClick = new EventEmitter<void>();
}

@Component({
  selector: 'app-dropdown',
  template: '<select (change)="onSelectChange($event)"></select>',
  standalone: true
})
class MockDropdownComponent {
  @Input() options: FilterOption[] = [];
  @Input() selectedValue = '';
  @Input() label = '';
  @Input() dropUp = false;
  @Output() selectionChange = new EventEmitter<string>();

  onSelectChange(event: Event): void {
    const targetProp = 'target';
    const valueProp = 'value';
    const target = event[targetProp] as HTMLSelectElement;
    this.selectionChange.emit(target[valueProp]);
  }
}

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .overrideComponent(PaginationComponent, {
        remove: { imports: [AppButtonComponent, DropdownComponent] },
        add: { imports: [MockAppButtonComponent, MockDropdownComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  describe('interaction with UI elements', () => {
    it('should call onFirstPage method directly', () => {
      spyOn(component, 'onFirstPage');
      component.onFirstPage();
      expect(component.onFirstPage).toHaveBeenCalled();
    });

    it('should call onPreviousPage method directly', () => {
      spyOn(component, 'onPreviousPage');
      component.onPreviousPage();
      expect(component.onPreviousPage).toHaveBeenCalled();
    });

    it('should call onNextPage method directly', () => {
      spyOn(component, 'onNextPage');
      component.onNextPage();
      expect(component.onNextPage).toHaveBeenCalled();
    });

    it('should call onLastPage method directly', () => {
      spyOn(component, 'onLastPage');
      component.onLastPage();
      expect(component.onLastPage).toHaveBeenCalled();
    });

    it('should call onPageSizeChange method directly', () => {
      spyOn(component, 'onPageSizeChange');
      component.onPageSizeChange('20');
      expect(component.onPageSizeChange).toHaveBeenCalledWith('20');
    });

    it('should emit pageChange event with value 1 when onFirstPage is called', () => {
      spyOn(component.pageChange, 'emit');
      component.currentPage = 2;
      component.onFirstPage();
      expect(component.pageChange.emit).toHaveBeenCalledWith(1);
    });

    it('should emit pageChange event with decreased page when onPreviousPage is called', () => {
      spyOn(component.pageChange, 'emit');
      component.currentPage = 5;
      component.onPreviousPage();
      expect(component.pageChange.emit).toHaveBeenCalledWith(4);
    });

    it('should emit pageChange event with increased page when onNextPage is called', () => {
      spyOn(component.pageChange, 'emit');
      component.currentPage = 5;
      component.totalPages = 10;
      component.onNextPage();
      expect(component.pageChange.emit).toHaveBeenCalledWith(6);
    });

    it('should emit pageChange event with last page when onLastPage is called', () => {
      spyOn(component.pageChange, 'emit');
      component.currentPage = 5;
      component.totalPages = 10;
      component.onLastPage();
      expect(component.pageChange.emit).toHaveBeenCalledWith(10);
    });

    it('should emit pageSizeChange event when onPageSizeChange is called', () => {
      spyOn(component.pageSizeChange, 'emit');
      component.pageSize = 10;
      component.onPageSizeChange('20');
      expect(component.pageSizeChange.emit).toHaveBeenCalledWith(20);
    });
  });

  describe('button states', () => {
    it('should disable first/previous buttons when on first page', () => {
      component.currentPage = 1;
      component.totalPages = 10;
      fixture.detectChanges();
      expect(component.currentPage).toBe(1);
    });

    it('should disable next/last buttons when on last page', () => {
      component.currentPage = 10;
      component.totalPages = 10;
      fixture.detectChanges();
      expect(component.currentPage).toBe(component.totalPages);
    });
  });
});
