import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import useLazyLoad from '@hooks/useLazyLoad';

describe('useLazyLoad', () => {
  let mockObserve: ReturnType<typeof vi.fn>;
  let mockDisconnect: ReturnType<typeof vi.fn>;
  let mockIntersectionObserver: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockObserve = vi.fn();
    mockDisconnect = vi.fn();
    mockIntersectionObserver = vi.fn();

    mockIntersectionObserver.mockImplementation((callback) => {
      return {
        observe: mockObserve,
        disconnect: mockDisconnect,
        triggerCallback: (entries: IntersectionObserverEntry[]) => callback(entries, {} as IntersectionObserver),
      };
    });

    global.IntersectionObserver = mockIntersectionObserver;
  });

  it('initializes with isVisible as false', () => {
    const { result } = renderHook(() => useLazyLoad());

    const [isVisible] = result.current;
    expect(isVisible).toBe(false);
  });

  it('calls observe with the provided ref', () => {
    const mockElement = document.createElement('div');

    const { result } = renderHook(() => {
      const [isVisible, ref] = useLazyLoad();
      if (ref.current === null) {
        Object.defineProperty(ref, 'current', {
          value: mockElement,
          writable: true
        });
      }
      return { isVisible, ref };
    });

    expect(result.current.ref.current).toBe(mockElement);

    expect(mockObserve).toHaveBeenCalledWith(mockElement);
  });

  it('updates isVisible when element becomes visible', async () => {
    const { result } = renderHook(() => useLazyLoad());

    const observer = mockIntersectionObserver.mock.results[0].value;

    await act(async () => {
      observer.triggerCallback([{ isIntersecting: true } as IntersectionObserverEntry]);
    });

    expect(result.current[0]).toBe(true);
  });

  it('disconnects observer when triggerOnce is true and element intersects', async () => {
    renderHook(() => useLazyLoad({ triggerOnce: true }));

    const observer = mockIntersectionObserver.mock.results[0].value;

    mockDisconnect.mockReset();

    await act(async () => {
      observer.triggerCallback([{ isIntersecting: true } as IntersectionObserverEntry]);
    });

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('creates IntersectionObserver with default options if not provided', () => {
    renderHook(() => useLazyLoad());

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        threshold: 0.1,
        root: null,
        rootMargin: '0px',
      }
    );
  });

  it('creates IntersectionObserver with custom options when provided', () => {
    const customOptions = {
      threshold: 0.5,
      rootMargin: '10px',
      triggerOnce: true,
    };

    renderHook(() => useLazyLoad(customOptions));

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        threshold: 0.5,
        root: null,
        rootMargin: '10px',
      }
    );
  });

  it('disconnects observer on unmount', () => {
    const { unmount } = renderHook(() => useLazyLoad());

    mockDisconnect.mockReset();

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('does not observe if ref is null', () => {
    renderHook(() => {
      const [isVisible, ref] = useLazyLoad();
      Object.defineProperty(ref, 'current', {
        value: null,
        writable: true
      });
      return { isVisible, ref };
    });

    expect(mockObserve).not.toHaveBeenCalled();
  });
});