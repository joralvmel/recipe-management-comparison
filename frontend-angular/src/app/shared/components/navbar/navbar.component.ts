import { Component, HostListener, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthStoreService } from '@core/store/auth-store.service';
import { UserType } from '@models/user.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  standalone: true,
  imports: [RouterModule, CommonModule, NgOptimizedImage],
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMobileMenuOpen = false;
  isAuthenticated = false;
  currentUser: UserType | null = null;

  private subscriptions = new Subscription();

  constructor(
    private elementRef: ElementRef,
    public authStore: AuthStoreService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.authStore.isAuthenticated$.subscribe(isAuthenticated => {
        this.isAuthenticated = isAuthenticated;
      })
    );

    this.subscriptions.add(
      this.authStore.user$.subscribe(user => {
        this.currentUser = user;
      })
    );
  }

  toggleMobileMenu(event: Event): void {
    event.stopPropagation();
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  logout(): void {
    this.authStore.logout();
    this.isMobileMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isMobileMenuOpen) {
      const menuIconElement = this.elementRef.nativeElement.querySelector('.menu-icon');
      const mobileMenuElement = this.elementRef.nativeElement.querySelector('.mobile-menu');

      if (
        menuIconElement &&
        mobileMenuElement &&
        !menuIconElement.contains(event.target) &&
        !mobileMenuElement.contains(event.target)
      ) {
        this.isMobileMenuOpen = false;
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
