import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import useHeroSection from '@hooks/useHeroSection';
import { useRecipeSearch } from '@context/RecipeSearchContext';
import { useNavigate } from 'react-router-dom';

// Mock the dependencies
vi.mock('@context/RecipeSearchContext', () => ({
  useRecipeSearch: vi.fn()
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}));

describe('useHeroSection', () => {
  const mockSetSearchQuery = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    (useRecipeSearch as jest.Mock).mockReturnValue({
      setSearchQuery: mockSetSearchQuery
    });

    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  it('initializes with empty typed query', () => {
    const { result } = renderHook(() => useHeroSection());

    expect(result.current.typedQuery).toBe('');
  });

  it('updates typed query when setTypedQuery is called', () => {
    const { result } = renderHook(() => useHeroSection());

    act(() => {
      result.current.setTypedQuery('pasta');
    });

    expect(result.current.typedQuery).toBe('pasta');
  });

  it('sets search query and navigates to search page on handleSearch', () => {
    const { result } = renderHook(() => useHeroSection());

    act(() => {
      result.current.setTypedQuery('chicken curry');
    });

    act(() => {
      result.current.handleSearch();
    });

    expect(mockSetSearchQuery).toHaveBeenCalledWith('chicken curry');
    expect(mockNavigate).toHaveBeenCalledWith('/search');
  });

  it('handles empty search query', () => {
    const { result } = renderHook(() => useHeroSection());

    act(() => {
      result.current.handleSearch();
    });

    expect(mockSetSearchQuery).toHaveBeenCalledWith('');
    expect(mockNavigate).toHaveBeenCalledWith('/search');
  });

  it('preserves typed query across renders', () => {
    const { result, rerender } = renderHook(() => useHeroSection());

    act(() => {
      result.current.setTypedQuery('vegetable soup');
    });

    rerender();

    expect(result.current.typedQuery).toBe('vegetable soup');
  });

  it('provides the correct return value structure', () => {
    const { result } = renderHook(() => useHeroSection());

    expect(result.current).toHaveProperty('typedQuery');
    expect(result.current).toHaveProperty('setTypedQuery');
    expect(result.current).toHaveProperty('handleSearch');
    expect(typeof result.current.handleSearch).toBe('function');
  });
});