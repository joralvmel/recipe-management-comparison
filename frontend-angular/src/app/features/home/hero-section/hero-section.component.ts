import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthStoreService } from '@core/store/auth-store.service';
import { AppImageComponent } from '@shared/components/app-image/app-image.component';
import { SearchBarComponent } from '@shared/components/search-bar/search-bar.component';

@Component({
  selector: 'app-hero-section',
  templateUrl: './hero-section.component.html',
  standalone: true,
  imports: [
    CommonModule,
    AppImageComponent,
    SearchBarComponent
  ],
})
export class HeroSectionComponent implements OnInit, OnDestroy {
  initialSearchQuery = '';
  isAuthenticated = false;
  userName: string | null = null;

  private subscriptions = new Subscription();

  constructor(
    private router: Router,
    public authStore: AuthStoreService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.authStore.isAuthenticated$.subscribe(isAuth => {
        this.isAuthenticated = isAuth;
      })
    );

    this.subscriptions.add(
      this.authStore.user$.subscribe(user => {
        this.userName = user?.name || null;
      })
    );
  }

  onSearchPerformed(query: string) {
    this.router.navigate(['/search'], { queryParams: { query } });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
