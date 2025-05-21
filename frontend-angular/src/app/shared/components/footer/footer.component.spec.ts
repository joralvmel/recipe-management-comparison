import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set currentYear to the current year', () => {
    const currentYear = new Date().getFullYear();
    expect(component.currentYear).toBe(currentYear);
  });

  it('should display the current year in the template', () => {
    const currentYear = new Date().getFullYear();
    const yearElement = fixture.debugElement.query(By.css('.year, [class*="year"], [class*="copyright"], footer'));

    if (yearElement) {
      expect(yearElement.nativeElement.textContent).toContain(currentYear.toString());
    } else {
      expect(fixture.nativeElement.textContent).toContain(currentYear.toString());
    }
  });

  it('should have copyright text in the template', () => {
    const footerText = fixture.nativeElement.textContent;
    expect(footerText).toMatch(/copyright|©|rights reserved|all rights/i);
  });
});
