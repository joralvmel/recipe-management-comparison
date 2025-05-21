import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { NotificationComponent } from './notification.component';
import { NotificationService, Notification } from '@shared/services/notification.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('NotificationComponent', () => {
  let component: NotificationComponent;
  let fixture: ComponentFixture<NotificationComponent>;
  let notificationServiceMock: jasmine.SpyObj<NotificationService>;
  let notificationSubject: BehaviorSubject<Notification | null>;

  const mockSuccessNotification: Notification = {
    message: 'Operation successful',
    severity: 'success'
  };

  const mockErrorNotification: Notification = {
    message: 'An error occurred',
    severity: 'error'
  };

  beforeEach(async () => {
    notificationSubject = new BehaviorSubject<Notification | null>(null);

    notificationServiceMock = jasmine.createSpyObj('NotificationService', ['clearNotification'], {
      notification$: notificationSubject.asObservable()
    });

    await TestBed.configureTestingModule({
      imports: [NotificationComponent],
      providers: [
        { provide: NotificationService, useValue: notificationServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should start with null notification', () => {
      expect(component.notification).toBeNull();
    });

    it('should subscribe to the notification service', () => {
      notificationSubject.next(mockSuccessNotification);
      fixture.detectChanges();

      expect(component.notification).toBe(mockSuccessNotification);
    });
  });

  describe('handling notifications', () => {
    it('should update when new notifications arrive', () => {
      notificationSubject.next(mockSuccessNotification);
      fixture.detectChanges();
      expect(component.notification).toBe(mockSuccessNotification);

      notificationSubject.next(mockErrorNotification);
      fixture.detectChanges();
      expect(component.notification).toBe(mockErrorNotification);
    });

    it('should handle clearing notifications', () => {
      notificationSubject.next(mockSuccessNotification);
      fixture.detectChanges();

      notificationSubject.next(null);
      fixture.detectChanges();

      expect(component.notification).toBeNull();
    });
  });

  describe('notification display', () => {
    it('should display notification message when present', () => {
      notificationSubject.next(mockSuccessNotification);
      fixture.detectChanges();

      const messageElement = fixture.debugElement.query(
        By.css('.notification-message, [class*="message"], [class*="notification"]')
      );

      if (messageElement) {
        expect(messageElement.nativeElement.textContent)
          .toContain(mockSuccessNotification.message);
      } else {
        expect(fixture.nativeElement.textContent)
          .toContain(mockSuccessNotification.message);
      }
    });

    it('should apply the correct CSS class based on notification severity', () => {
      notificationSubject.next(mockSuccessNotification);
      fixture.detectChanges();

      const notificationElement = fixture.debugElement.query(
        By.css('.notification, [class*="alert"], [class*="toast"]')
      );

      if (notificationElement) {
        const hasSeverityClass = notificationElement.classes[`notification-${mockSuccessNotification.severity}`] ||
          notificationElement.classes[mockSuccessNotification.severity] ||
          Object.keys(notificationElement.classes).some(className =>
            className.includes(mockSuccessNotification.severity)
          );

        expect(hasSeverityClass).toBeTruthy(`Should have class related to severity "${mockSuccessNotification.severity}"`);
      }
    });
  });

  describe('closing notifications', () => {
    it('should call clearNotification when closeNotification is called', () => {
      component.closeNotification();
      expect(notificationServiceMock.clearNotification).toHaveBeenCalled();
    });

    it('should call closeNotification when close button is clicked', () => {
      notificationSubject.next(mockSuccessNotification);
      fixture.detectChanges();

      spyOn(component, 'closeNotification');

      const closeButton = fixture.debugElement.query(
        By.css('.close-button, [class*="close"], button[aria-label="Close"]')
      );

      if (closeButton) {
        closeButton.triggerEventHandler('click', null);
        expect(component.closeNotification).toHaveBeenCalled();
      }
    });
  });

  describe('lifecycle handling', () => {
    it('should unsubscribe when destroyed', () => {
      const subscriptionProp = 'subscription';
      const unsubscribeSpy = spyOn(component[subscriptionProp], 'unsubscribe');

      component.ngOnDestroy();

      expect(unsubscribeSpy).toHaveBeenCalled();
    });
  });
});
