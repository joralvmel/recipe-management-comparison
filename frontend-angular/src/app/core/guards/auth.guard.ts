import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthStoreService } from '@core/store/auth-store.service';
import { NotificationService } from '@shared/services/notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authStore: AuthStoreService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this.authStore.isAuthenticated) {
      return true;
    }

    console.log('You must be logged in to access this page');
    this.router.navigate(['/']);
    this.notificationService.showNotification('You must be logged in to access this page', 'error');
    return false;
  }
}
