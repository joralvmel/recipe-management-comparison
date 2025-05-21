import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NotificationService, Notification } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('showNotification', () => {
    it('should emit notification with correct values', () => {
      const testMessage = 'Test notification';
      const testSeverity = 'success' as const;
      const testDuration = 3000;
      let receivedNotification: Notification | null = null;

      service.notification$.subscribe(notification => {
        receivedNotification = notification;
      });
      service.showNotification(testMessage, testSeverity, testDuration);

      expect(receivedNotification).toBeTruthy();
      const notif = (receivedNotification as unknown) as Notification;
      expect(notif.message).toEqual(testMessage);
      expect(notif.severity).toEqual(testSeverity);
      expect(notif.duration).toEqual(testDuration);
    });

    it('should use default duration when not specified', () => {
      let receivedNotification: Notification | null = null;

      service.notification$.subscribe(notification => {
        receivedNotification = notification;
      });
      service.showNotification('Test', 'info');

      if (receivedNotification) {
        expect(((receivedNotification as unknown) as Notification).duration).toBe(5000);
      } else {
        fail('Notification should not be null');
      }
    });

    it('should clear notification after specified duration', fakeAsync(() => {
      const duration = 2000;
      let currentNotification: Notification | null = null;

      service.notification$.subscribe(notification => {
        currentNotification = notification;
      });

      service.showNotification('Test', 'info', duration);
      expect(currentNotification).not.toBeNull();

      tick(duration - 10);
      expect(currentNotification).not.toBeNull();

      tick(10);
      expect(currentNotification).toBeNull();
    }));

    it('should not auto clear notification if duration is 0', fakeAsync(() => {
      let currentNotification: Notification | null = null;

      service.notification$.subscribe(notification => {
        currentNotification = notification;
      });

      service.showNotification('Test', 'warning', 0);
      expect(currentNotification).not.toBeNull();

      tick(10000);
      expect(currentNotification).not.toBeNull();
    }));

    it('should not auto clear notification if duration is negative', fakeAsync(() => {
      let currentNotification: Notification | null = null;

      service.notification$.subscribe(notification => {
        currentNotification = notification;
      });

      service.showNotification('Test', 'error', -100);
      expect(currentNotification).not.toBeNull();

      tick(10000);
      expect(currentNotification).not.toBeNull();
    }));
  });

  describe('clearNotification', () => {
    it('should clear the current notification', () => {
      let currentNotification: Notification | null = null;

      service.notification$.subscribe(notification => {
        currentNotification = notification;
      });

      service.showNotification('Test', 'success');
      expect(currentNotification).not.toBeNull();

      service.clearNotification();

      expect(currentNotification).toBeNull();
    });
  });

  it('should handle multiple notifications correctly', () => {
    const notifications: (Notification | null)[] = [];

    service.notification$.subscribe(notification => {
      notifications.push(notification);
    });

    service.showNotification('First', 'info');
    service.showNotification('Second', 'warning');
    service.showNotification('Third', 'error');
    service.clearNotification();

    expect(notifications.length).toBe(5);
    expect(notifications[0]).toBeNull();

    if (notifications[1]) {
      expect(notifications[1].message).toBe('First');
    }

    if (notifications[2]) {
      expect(notifications[2].message).toBe('Second');
    }

    if (notifications[3]) {
      expect(notifications[3].message).toBe('Third');
    }

    expect(notifications[4]).toBeNull();
  });
});
