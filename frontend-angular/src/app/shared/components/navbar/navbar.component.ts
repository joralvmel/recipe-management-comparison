import { Component, HostListener, ElementRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  standalone: true,
  imports: [RouterModule, CommonModule, NgOptimizedImage],
})
export class NavbarComponent {
  isMobileMenuOpen = false;

  constructor(
    private elementRef: ElementRef,
    public authService: AuthService
  ) {}

  toggleMobileMenu(event: Event): void {
    event.stopPropagation();
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  logout(): void {
    this.authService.logout();
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
}
