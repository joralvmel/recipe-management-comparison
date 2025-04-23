import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import useDropdown from '@hooks/useDropdown';

describe('useDropdown', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  let eventMap: Record<string, EventListenerOrEventListenerObject> = {};

  beforeEach(() => {
    eventMap = {};

    document.addEventListener = vi.fn((event, callback) => {
      eventMap[event] = callback;
    });

    document.removeEventListener = vi.fn((event, callback) => {
      if (eventMap[event] === callback) {
        delete eventMap[event];
      }
    });
  });

  it('initializes with the correct initial value', () => {
    const { result } = renderHook(() => useDropdown('option1', options));

    expect(result.current.isOpen).toBe(false);
    expect(result.current.selectedValue).toBe('option1');
    expect(result.current.dropdownRef.current).toBe(null);
  });

  it('toggles dropdown state when calling toggleDropdown', () => {
    const { result } = renderHook(() => useDropdown('option1', options));

    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.toggleDropdown();
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.toggleDropdown();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('selects an option when calling handleOptionClick', () => {
    const { result } = renderHook(() => useDropdown('option1', options));

    act(() => {
      result.current.handleOptionClick(options[1]);
    });

    expect(result.current.selectedValue).toBe('option2');
    expect(result.current.isOpen).toBe(false);
  });

  it('adds event listener when dropdown is open and removes it when closed', () => {
    const { result } = renderHook(() => useDropdown('option1', options));

    act(() => {
      result.current.toggleDropdown();
    });

    expect(document.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));

    act(() => {
      result.current.toggleDropdown();
    });

    expect(document.removeEventListener).toHaveBeenCalledWith('click', expect.any(Function));
  });

  it('closes dropdown when clicking outside', () => {
    const { result } = renderHook(() => useDropdown('option1', options));

    const mockRefElement = document.createElement('div');
    Object.defineProperty(result.current.dropdownRef, 'current', {
      value: mockRefElement,
      writable: true
    });

    act(() => {
      result.current.toggleDropdown();
    });

    expect(result.current.isOpen).toBe(true);

    const outsideElement = document.createElement('div');
    act(() => {
      const clickEvent = new MouseEvent('click');
      Object.defineProperty(clickEvent, 'target', { value: outsideElement });
      if (eventMap.click) {
        (eventMap.click as EventListener)(clickEvent);
      }
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('keeps dropdown open when clicking inside', () => {
    const { result } = renderHook(() => useDropdown('option1', options));

    const mockRefElement = document.createElement('div');
    Object.defineProperty(result.current.dropdownRef, 'current', {
      value: mockRefElement,
      writable: true
    });

    act(() => {
      result.current.toggleDropdown();
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      const clickEvent = new MouseEvent('click');
      Object.defineProperty(clickEvent, 'target', { value: mockRefElement });
      if (eventMap.click) {
        (eventMap.click as EventListener)(clickEvent);
      }
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('initializes with provided value prop if specified', () => {
    const { result } = renderHook(() => useDropdown('option1', options, 'option3'));

    expect(result.current.selectedValue).toBe('option3');
  });

  it('updates selected value when value prop changes', () => {
    const { result, rerender } = renderHook(
      ({ initialValue, optionsArray, valueInput }) =>
        useDropdown(initialValue, optionsArray, valueInput),
      { initialProps: { initialValue: 'option1', optionsArray: options, valueInput: 'option2' } }
    );

    expect(result.current.selectedValue).toBe('option2');

    rerender({ initialValue: 'option1', optionsArray: options, valueInput: 'option3' });

    expect(result.current.selectedValue).toBe('option3');
  });

  it('cleans up event listeners when unmounting', () => {
    const { result, unmount } = renderHook(() => useDropdown('option1', options));

    act(() => {
      result.current.toggleDropdown();
    });

    expect(document.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));

    unmount();

    expect(document.removeEventListener).toHaveBeenCalledWith('click', expect.any(Function));
  });
});