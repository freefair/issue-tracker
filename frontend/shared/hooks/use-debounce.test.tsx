import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './use-debounce';

describe('useDebounce', () => {
  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', async () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'initial', delay: 100 },
    });

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 100 });
    expect(result.current).toBe('initial'); // Still initial

    act(() => {
      vi.runAllTimers();
    });

    expect(result.current).toBe('updated');

    vi.useRealTimers();
  });

  it('should cancel previous timeout on rapid changes', async () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 100), {
      initialProps: { value: 'first' },
    });

    rerender({ value: 'second' });
    rerender({ value: 'third' });

    act(() => {
      vi.runAllTimers();
    });

    expect(result.current).toBe('third');

    vi.useRealTimers();
  });

  it('should handle different types', async () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 100), {
      initialProps: { value: 123 },
    });

    expect(result.current).toBe(123);

    rerender({ value: 456 });

    act(() => {
      vi.runAllTimers();
    });

    expect(result.current).toBe(456);

    vi.useRealTimers();
  });
});
