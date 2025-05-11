import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeroSectionComponent } from './hero-section.component';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStoreService } from '@core/store/auth-store.service';
import { BehaviorSubject } from 'rxjs';
import { Component, Input } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-image',
  template: '',
  standalone: true
})
class MockAppImageComponent {
  @Input() src = '';
  @Input() alt = '';
  @Input() width: string | number = '';
  @Input() height: string | number = '';
  @Input() class = '';
}

@Component({
  selector: 'app-search-bar',
  template: '',
  standalone: true
})
class MockSearchBarComponent {
  @Input() initialQuery = '';
}

describe('HeroSectionComponent', () => {
  let component: HeroSectionComponent;
  let fixture: ComponentFixture<HeroSectionComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let authServiceMock: {
    isAuthenticated$: BehaviorSubject<boolean>;
    user$: BehaviorSubject<{ name: string } | null>;
  };

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    authServiceMock = {
      isAuthenticated$: new BehaviorSubject<boolean>(false),
      user$: new BehaviorSubject<{ name: string } | null>(null)
    };

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        HeroSectionComponent
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthStoreService, useValue: authServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .overrideComponent(HeroSectionComponent, {
        set: {
          imports: [CommonModule, MockAppImageComponent, MockSearchBarComponent]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(HeroSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should subscribe to isAuthenticated$ and update isAuthenticated property', () => {
      expect(component.isAuthenticated).toBeFalse();

      authServiceMock.isAuthenticated$.next(true);
      fixture.detectChanges();

      expect(component.isAuthenticated).toBeTrue();
    });

    it('should subscribe to user$ and update userName property when user exists', () => {
      expect(component.userName).toBeNull();

      authServiceMock.user$.next({ name: 'John Doe' });
      fixture.detectChanges();

      expect(component.userName).toBe('John Doe');
    });

    it('should keep userName as null when user is null', () => {
      authServiceMock.user$.next({ name: 'John Doe' });
      fixture.detectChanges();
      expect(component.userName).toBe('John Doe');

      authServiceMock.user$.next(null);
      fixture.detectChanges();
      expect(component.userName).toBeNull();
    });
  });

  describe('onSearchPerformed', () => {
    it('should navigate to search route with query param', () => {
      const searchQuery = 'pasta recipes';

      component.onSearchPerformed(searchQuery);

      expect(routerSpy.navigate).toHaveBeenCalledWith(
        ['/search'],
        { queryParams: { query: searchQuery } }
      );
    });

    it('should navigate with empty query when given empty string', () => {
      component.onSearchPerformed('');

      expect(routerSpy.navigate).toHaveBeenCalledWith(
        ['/search'],
        { queryParams: { query: '' } }
      );
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from subscriptions', () => {
      const subscriptionsProp = 'subscriptions';
      const unsubscribeSpy = spyOn(component[subscriptionsProp], 'unsubscribe');

      component.ngOnDestroy();

      expect(unsubscribeSpy).toHaveBeenCalled();
    });
  });

  it('should initialize initialSearchQuery as empty string', () => {
    expect(component.initialSearchQuery).toBe('');
  });
});
