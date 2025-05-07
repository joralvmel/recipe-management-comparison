import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<Notification | null>(null);
  notification$ = this.notificationSubject.asObservable();

  showNotification(message: string, severity: 'success' | 'error' | 'info' | 'warning', duration = 5000): void {
    this.notificationSubject.next({ message, severity, duration });

    if (duration > 0) {
      setTimeout(() => this.clearNotification(), duration);
    }
  }

  clearNotification(): void {
    this.notificationSubject.next(null);
  }
}
