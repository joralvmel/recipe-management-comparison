import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { UserType } from '@models/user.model';
import { userData } from '@app/data/mock-users';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'gastronest_user';
  private userSignal = signal<UserType | null>(this.getStoredUser());

  private userSubject = new BehaviorSubject<UserType | null>(this.getStoredUser());

  constructor(private router: Router) {}

  get currentUser() {
    return this.userSignal();
  }

  get isAuthenticated(): boolean {
    return !!this.userSignal();
  }

  getUserObservable(): Observable<UserType | null> {
    return this.userSubject.asObservable();
  }

  getUserById(userId: string): Observable<UserType | null> {
    if (this.currentUser && this.currentUser.id === userId) {
      return of(this.currentUser);
    }

    const user = userData.find(u => u.id === userId);
    if (user) {
      const { password: _, ...secureUser } = user;
      return of(secureUser as UserType);
    }
    return of(null);
  }

  login(email: string, password: string): boolean {
    const user = userData.find(u => u.email === email && u.password === password);

    if (user) {
      const { password: _, ...secureUser } = user;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(secureUser));
      this.userSignal.set(secureUser as UserType);
      this.userSubject.next(secureUser as UserType);
      return true;
    }

    return false;
  }

  register(name: string, email: string, password: string): boolean {
    if (userData.some(u => u.email === email)) {
      return false;
    }

    const newUser: UserType = {
      id: this.generateId(),
      name,
      email,
      password,
      createdAt: Date.now()
    };

    userData.push(newUser);
    return true;
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.userSignal.set(null);
    this.userSubject.next(null);
    this.router.navigate(['/']);
  }

  private getStoredUser(): UserType | null {
    const storedUser = localStorage.getItem(this.STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
  }
}
