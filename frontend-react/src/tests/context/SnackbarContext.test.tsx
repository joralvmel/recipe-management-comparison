import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { SnackbarProvider, useSnackbar } from '@context/SnackbarContext';
import '@testing-library/jest-dom';

describe('SnackbarContext', () => {
  it('initializes with default values', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SnackbarProvider>{children}</SnackbarProvider>
    );

    const { result } = renderHook(() => useSnackbar(), { wrapper });

    expect(result.current.snackbar).toEqual({
      open: false,
      message: '',
      severity: 'info'
    });
  });

  it('shows a success snackbar when showSnackbar is called with success severity', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SnackbarProvider>{children}</SnackbarProvider>
    );

    const { result } = renderHook(() => useSnackbar(), { wrapper });

    act(() => {
      result.current.showSnackbar('Operation successful', 'success');
    });

    expect(result.current.snackbar).toEqual({
      open: true,
      message: 'Operation successful',
      severity: 'success'
    });
  });

  it('shows an error snackbar when showSnackbar is called with error severity', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SnackbarProvider>{children}</SnackbarProvider>
    );

    const { result } = renderHook(() => useSnackbar(), { wrapper });

    act(() => {
      result.current.showSnackbar('An error occurred', 'error');
    });

    expect(result.current.snackbar).toEqual({
      open: true,
      message: 'An error occurred',
      severity: 'error'
    });
  });

  it('shows an info snackbar when showSnackbar is called with info severity', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SnackbarProvider>{children}</SnackbarProvider>
    );

    const { result } = renderHook(() => useSnackbar(), { wrapper });

    act(() => {
      result.current.showSnackbar('Information message', 'info');
    });

    expect(result.current.snackbar).toEqual({
      open: true,
      message: 'Information message',
      severity: 'info'
    });
  });

  it('shows a warning snackbar when showSnackbar is called with warning severity', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SnackbarProvider>{children}</SnackbarProvider>
    );

    const { result } = renderHook(() => useSnackbar(), { wrapper });

    act(() => {
      result.current.showSnackbar('Warning message', 'warning');
    });

    expect(result.current.snackbar).toEqual({
      open: true,
      message: 'Warning message',
      severity: 'warning'
    });
  });

  it('closes the snackbar when closeSnackbar is called', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SnackbarProvider>{children}</SnackbarProvider>
    );

    const { result } = renderHook(() => useSnackbar(), { wrapper });

    act(() => {
      result.current.showSnackbar('Test message', 'success');
    });

    expect(result.current.snackbar.open).toBe(true);

    act(() => {
      result.current.closeSnackbar();
    });

    expect(result.current.snackbar).toEqual({
      open: false,
      message: 'Test message',
      severity: 'success'
    });
  });

  it('allows showing multiple snackbars in sequence', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SnackbarProvider>{children}</SnackbarProvider>
    );

    const { result } = renderHook(() => useSnackbar(), { wrapper });

    act(() => {
      result.current.showSnackbar('First message', 'info');
    });

    expect(result.current.snackbar).toEqual({
      open: true,
      message: 'First message',
      severity: 'info'
    });

    act(() => {
      result.current.closeSnackbar();
    });

    act(() => {
      result.current.showSnackbar('Second message', 'warning');
    });

    expect(result.current.snackbar).toEqual({
      open: true,
      message: 'Second message',
      severity: 'warning'
    });
  });

  it('throws error when useSnackbar is used outside of SnackbarProvider', () => {
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => renderHook(() => useSnackbar())).toThrow(
      'useSnackbar must be used within a SnackbarProvider'
    );

    console.error = originalError;
  });
});