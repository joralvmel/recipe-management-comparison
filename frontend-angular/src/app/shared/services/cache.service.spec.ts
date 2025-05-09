import { TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { CacheService } from './cache.service';
import { Observable, of, Subject } from 'rxjs';

interface CacheEntry<T> {
  data: Observable<T>;
  expiresAt: number;
  isLoading: boolean;
}

describe('CacheService', () => {
  let service: CacheService;

  interface CacheServicePrivate {
    cache: Map<string, CacheEntry<unknown>>;
    loadingSubjects: Map<string, Subject<boolean>>;
    DEFAULT_STALE_TIME: number;
    DEFAULT_CACHE_TIME: number;
    cleanCache: () => void;
    getLoadingObservable: (key: string, initialValue: boolean) => Observable<boolean>;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get', () => {
    it('should call fetchFn and cache the result when key does not exist', () => {
      const mockData = { id: 1, name: 'Test' };
      const fetchFn = jasmine.createSpy('fetchFn').and.returnValue(of(mockData));

      const result = service.get('test-key', fetchFn);

      expect(fetchFn).toHaveBeenCalledTimes(1);
      result.data.subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const servicePrivate = service as unknown as CacheServicePrivate;
      expect(servicePrivate.cache.has('test-key')).toBeTrue();
    });

    it('should return cached data when key exists and has not expired', () => {
      const mockData = { id: 1, name: 'Test' };
      const fetchFn = jasmine.createSpy('fetchFn').and.returnValue(of(mockData));

      service.get('test-key', fetchFn);
      expect(fetchFn).toHaveBeenCalledTimes(1);

      const fetchFn2 = jasmine.createSpy('fetchFn2').and.returnValue(of({ id: 2, name: 'Other' }));
      service.get('test-key', fetchFn2);
      expect(fetchFn2).not.toHaveBeenCalled();
    });

    it('should call fetchFn when key exists but has expired', fakeAsync(() => {
      const mockData1 = { id: 1, name: 'Test' };
      const mockData2 = { id: 2, name: 'Updated' };
      const fetchFn1 = jasmine.createSpy('fetchFn1').and.returnValue(of(mockData1));
      const fetchFn2 = jasmine.createSpy('fetchFn2').and.returnValue(of(mockData2));

      const staleTime = 500; // 500ms

      const result1 = service.get('test-key', fetchFn1, staleTime);
      result1.data.subscribe();
      expect(fetchFn1).toHaveBeenCalledTimes(1);
      tick(staleTime + 100);

      const result2 = service.get('test-key', fetchFn2, staleTime);
      result2.data.subscribe(data => {
        expect(data).toEqual(mockData2);
      });
      expect(fetchFn2).toHaveBeenCalledTimes(1);

      discardPeriodicTasks();
    }));

    it('should handle custom stale time', fakeAsync(() => {
      const mockData1 = { id: 1, name: 'Test' };
      const mockData2 = { id: 2, name: 'Updated' };
      const fetchFn1 = jasmine.createSpy('fetchFn1').and.returnValue(of(mockData1));
      const fetchFn2 = jasmine.createSpy('fetchFn2').and.returnValue(of(mockData2));

      const customStaleTime = 200;

      service.get('test-key', fetchFn1, customStaleTime);
      expect(fetchFn1).toHaveBeenCalledTimes(1);

      tick(customStaleTime - 50);
      service.get('test-key', fetchFn2);
      expect(fetchFn2).not.toHaveBeenCalled();

      tick(100);
      service.get('test-key', fetchFn2);
      expect(fetchFn2).toHaveBeenCalledTimes(1);

      discardPeriodicTasks();
    }));
  });

  describe('invalidateCache', () => {
    it('should remove the entry from cache', () => {
      const mockData = { id: 1, name: 'Test' };
      const fetchFn = jasmine.createSpy('fetchFn').and.returnValue(of(mockData));

      service.get('test-key', fetchFn);

      const servicePrivate = service as unknown as CacheServicePrivate;
      expect(servicePrivate.cache.has('test-key')).toBeTrue();
      service.invalidateCache('test-key');
      expect(servicePrivate.cache.has('test-key')).toBeFalse();

      const fetchFn2 = jasmine.createSpy('fetchFn2').and.returnValue(of(mockData));
      service.get('test-key', fetchFn2);
      expect(fetchFn2).toHaveBeenCalled();
    });
  });

  describe('cleanCache', () => {
    it('should remove expired entries', () => {
      const servicePrivate = service as unknown as CacheServicePrivate;

      const now = Date.now();

      servicePrivate.cache.set('expired-key', {
        data: of({ id: 1 }),
        expiresAt: now - 1000,
        isLoading: false
      });

      servicePrivate.cache.set('valid-key', {
        data: of({ id: 2 }),
        expiresAt: now + 60000,
        isLoading: false
      });

      servicePrivate.cleanCache();

      expect(servicePrivate.cache.has('expired-key')).toBeFalse();
      expect(servicePrivate.cache.has('valid-key')).toBeTrue();
    });

    it('should run cleanCache periodically', () => {
      const originalSetInterval = window.setInterval;
      let intervalCalled = false;

      try {
        window.setInterval = jasmine.createSpy().and.callFake(() => {
          intervalCalled = true;
          return 999;
        });

        const newService = new CacheService();

        expect(intervalCalled).toBeTrue();
      } finally {
        window.setInterval = originalSetInterval;
      }
    });
  });

  describe('automatic cache invalidation', () => {
    it('should setup automatic cache invalidation with correct timeout', () => {
      spyOn(service, 'invalidateCache');

      const originalSetTimeout = window.setTimeout;
      let storedCallback: () => void = () => {};
      let storedTime = 0;

      try {
        window.setTimeout = jasmine.createSpy().and.callFake((callback: () => void, time: number) => {
          storedCallback = callback;
          storedTime = time;
          return 999;
        }) as unknown as typeof window.setTimeout;

        const servicePrivate = service as unknown as CacheServicePrivate;
        const expectedTime = servicePrivate.DEFAULT_CACHE_TIME;

        const mockData = { id: 1, name: 'Test' };
        const fetchFn = jasmine.createSpy('fetchFn').and.returnValue(of(mockData));
        service.get('test-key', fetchFn);

        expect(storedTime).toBe(expectedTime);

        storedCallback();

        expect(service.invalidateCache).toHaveBeenCalledWith('test-key');
      } finally {
        window.setTimeout = originalSetTimeout;
      }
    });
  });

  describe('getLoadingObservable', () => {
    it('should create a new loading subject if one does not exist', () => {
      const servicePrivate = service as unknown as CacheServicePrivate;
      expect(servicePrivate.loadingSubjects.has('new-key')).toBeFalse();
      const loadingObservable = servicePrivate.getLoadingObservable('new-key', true);
      expect(servicePrivate.loadingSubjects.has('new-key')).toBeTrue();
      loadingObservable.subscribe(isLoading => {
        expect(isLoading).toBeTrue();
      });
    });

    it('should return existing loading subject if one exists', () => {
      const servicePrivate = service as unknown as CacheServicePrivate;
      const subject = new Subject<boolean>();
      servicePrivate.loadingSubjects.set('existing-key', subject);
      const loadingObservable = servicePrivate.getLoadingObservable('existing-key', false);
      const loadingValues: boolean[] = [];
      loadingObservable.subscribe(value => loadingValues.push(value));

      subject.next(true);
      subject.next(false);

      expect(loadingValues).toEqual([true, false]);
    });
  });
});
