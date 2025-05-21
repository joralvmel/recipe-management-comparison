import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { shareReplay, finalize } from 'rxjs/operators';

interface CacheEntry<T> {
  data: Observable<T>;
  expiresAt: number;
  isLoading: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private loadingSubjects: Map<string, Subject<boolean>> = new Map();
  private DEFAULT_STALE_TIME = 5 * 60 * 1000;
  private DEFAULT_CACHE_TIME = 60 * 60 * 1000;

  constructor() {
    setInterval(() => this.cleanCache(), 5 * 60 * 1000);
  }

  get<T>(
    key: string,
    fetchFn: () => Observable<T>,
    staleTime = this.DEFAULT_STALE_TIME
  ): { data: Observable<T>, isLoading$: Observable<boolean> } {
    const existingEntry = this.cache.get(key);
    const now = Date.now();

    if (existingEntry && existingEntry.expiresAt > now) {
      return {
        data: existingEntry.data as Observable<T>,
        isLoading$: this.getLoadingObservable(key, false)
      };
    }

    let loadingSubject = this.loadingSubjects.get(key);
    if (!loadingSubject) {
      loadingSubject = new Subject<boolean>();
      this.loadingSubjects.set(key, loadingSubject);
    }

    loadingSubject.next(true);

    const data$ = fetchFn().pipe(
      shareReplay(1),
      finalize(() => {
        if (loadingSubject) {
          loadingSubject.next(false);
        }
      })
    );

    this.cache.set(key, {
      data: data$,
      expiresAt: now + staleTime,
      isLoading: true
    });

    setTimeout(() => {
      this.invalidateCache(key);
    }, this.DEFAULT_CACHE_TIME);

    return {
      data: data$,
      isLoading$: this.getLoadingObservable(key, true)
    };
  }

  invalidateCache(key: string): void {
    this.cache.delete(key);
  }

  private cleanCache(): void {
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }

  private getLoadingObservable(key: string, initialValue: boolean): Observable<boolean> {
    let subject = this.loadingSubjects.get(key);
    if (!subject) {
      subject = new Subject<boolean>();
      subject.next(initialValue);
      this.loadingSubjects.set(key, subject);
    }
    return subject.asObservable();
  }
}
