import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterOutlet } from '@angular/router';
import { By } from '@angular/platform-browser';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { AppComponent } from './app.component';
import { NavbarComponent } from '@shared/components/navbar/navbar.component';
import { FooterComponent } from '@shared/components/footer/footer.component';
import { NotificationComponent } from '@shared/components/notification/notification.component';

@Component({
  selector: 'app-navbar',
  template: '<div>Mock Navbar</div>',
  standalone: true
})
class MockNavbarComponent {}

@Component({
  selector: 'app-footer',
  template: '<div>Mock Footer</div>',
  standalone: true
})
class MockFooterComponent {}

@Component({
  selector: 'app-notification',
  template: '<div>Mock Notification</div>',
  standalone: true
})
class MockNotificationComponent {}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        RouterOutlet,
        MockNavbarComponent,
        MockFooterComponent,
        MockNotificationComponent
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .overrideComponent(AppComponent, {
        remove: { imports: [NavbarComponent, FooterComponent, NotificationComponent] },
        add: { imports: [MockNavbarComponent, MockFooterComponent, MockNotificationComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have the correct title 'GastroNest'`, () => {
    expect(component.title).toEqual('GastroNest');
  });

  it('should include RouterOutlet', () => {
    const outlet = fixture.debugElement.query(By.directive(RouterOutlet));
    expect(outlet).toBeTruthy('RouterOutlet should be included');
  });

  it('should include NavbarComponent', () => {
    const navbar = fixture.debugElement.query(By.css('app-navbar'));
    expect(navbar).toBeTruthy('Navbar component should be included');
  });

  it('should include FooterComponent', () => {
    const footer = fixture.debugElement.query(By.css('app-footer'));
    expect(footer).toBeTruthy('Footer component should be included');
  });

  it('should include NotificationComponent', () => {
    const notification = fixture.debugElement.query(By.css('app-notification'));
    expect(notification).toBeTruthy('Notification component should be included');
  });

  it('should render the title (if displayed in template)', () => {
    const compiled = fixture.nativeElement as HTMLElement;
  });

  it('should have the correct component structure', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const mainWrapper = compiled.querySelector('main, .main, #main, .wrapper, #wrapper');

    expect(mainWrapper).toBeTruthy('Main content wrapper should exist');
  });
});
