import type { Routes } from '@angular/router';
import { HomeComponent } from '@features/home/home.component';
import { LoginComponent } from '@features/auth/login/login.component';
import { RegisterComponent } from '@features/auth/register/register.component';
import { SearchComponent } from '@features/recipes/search/search.component';
import { FavoritesComponent } from '@features/recipes/favorites/favorites.component';
import { RecipeDetailComponent } from '@features/recipes/recipe-detail/recipe-detail.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'search', component: SearchComponent },
  { path: 'favorites', component: FavoritesComponent },
  { path: 'recipe/:id', component: RecipeDetailComponent },
  { path: '**', redirectTo: '' }
];
