import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import useMobileMenu from '@hooks/useMobileMenu';

describe('useMobileMenu', () => {
  beforeEach(() => {
    vi.spyOn(document, 'addEventListener');
    vi.spyOn(document, 'removeEventListener');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with mobile menu closed', () => {
    const { result } = renderHook(() => useMobileMenu());

    expect(result.current.isMobileMenuOpen).toBe(false);
    expect(result.current.mobileMenuRef.current).toBe(null);
  });

  it('toggles mobile menu open state', () => {
    const { result } = renderHook(() => useMobileMenu());

    act(() => {
      result.current.toggleMobileMenu();
    });

    expect(result.current.isMobileMenuOpen).toBe(true);

    act(() => {
      result.current.toggleMobileMenu();
    });

    expect(result.current.isMobileMenuOpen).toBe(false);
  });

  it('closes mobile menu', () => {
    const { result } = renderHook(() => useMobileMenu());

    act(() => {
      result.current.toggleMobileMenu();
    });
    expect(result.current.isMobileMenuOpen).toBe(true);

    act(() => {
      result.current.closeMobileMenu();
    });

    expect(result.current.isMobileMenuOpen).toBe(false);
  });

  it('adds event listener for mousedown on mount', () => {
    renderHook(() => useMobileMenu());

    expect(document.addEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
  });

  it('removes event listener on unmount', () => {
    const { unmount } = renderHook(() => useMobileMenu());

    unmount();

    expect(document.removeEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
  });

  it('closes menu when clicking outside', () => {
    const { result } = renderHook(() => useMobileMenu());

    act(() => {
      result.current.toggleMobileMenu();
    });

    const mockMenuElement = document.createElement('div');

    Object.defineProperty(result.current.mobileMenuRef, 'current', {
      value: mockMenuElement,
      writable: true
    });

    const mockEvent = new MouseEvent('mousedown');

    mockMenuElement.contains = vi.fn().mockReturnValue(false);

    act(() => {
      const handleClickOutside = (document.addEventListener as jest.Mock).mock.calls.find(
        call => call[0] === 'mousedown'
      )[1];

      handleClickOutside(mockEvent);
    });

    expect(result.current.isMobileMenuOpen).toBe(false);
  });

  it('keeps menu open when clicking inside', () => {
    const { result } = renderHook(() => useMobileMenu());

    act(() => {
      result.current.toggleMobileMenu();
    });

    const mockMenuElement = document.createElement('div');

    Object.defineProperty(result.current.mobileMenuRef, 'current', {
      value: mockMenuElement,
      writable: true
    });

    const mockEvent = new MouseEvent('mousedown');

    mockMenuElement.contains = vi.fn().mockReturnValue(true);

    act(() => {
      const handleClickOutside = (document.addEventListener as jest.Mock).mock.calls.find(
        call => call[0] === 'mousedown'
      )[1];

      handleClickOutside(mockEvent);
    });

    expect(result.current.isMobileMenuOpen).toBe(true);
  });
});