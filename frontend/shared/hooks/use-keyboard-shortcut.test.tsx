import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcut } from './use-keyboard-shortcut';

describe('useKeyboardShortcut', () => {
  it('should call callback on matching key press', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('k', callback));

    const event = new KeyboardEvent('keydown', { key: 'k' });
    window.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should be case-insensitive', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('K', callback));

    const event = new KeyboardEvent('keydown', { key: 'k' });
    window.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should match ctrl modifier', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('s', callback, { ctrl: true }));

    // Without ctrl - should not call
    let event = new KeyboardEvent('keydown', { key: 's' });
    window.dispatchEvent(event);
    expect(callback).not.toHaveBeenCalled();

    // With ctrl - should call
    event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true });
    window.dispatchEvent(event);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should match meta (cmd) modifier', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('k', callback, { meta: true }));

    // Without meta - should not call
    let event = new KeyboardEvent('keydown', { key: 'k' });
    window.dispatchEvent(event);
    expect(callback).not.toHaveBeenCalled();

    // With meta - should call
    event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
    window.dispatchEvent(event);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should match shift modifier', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('A', callback, { shift: true }));

    // Without shift - should not call
    let event = new KeyboardEvent('keydown', { key: 'A' });
    window.dispatchEvent(event);
    expect(callback).not.toHaveBeenCalled();

    // With shift - should call
    event = new KeyboardEvent('keydown', { key: 'A', shiftKey: true });
    window.dispatchEvent(event);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should match multiple modifiers', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('s', callback, { ctrl: true, shift: true }));

    // Only ctrl - should not call
    let event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true });
    window.dispatchEvent(event);
    expect(callback).not.toHaveBeenCalled();

    // Both ctrl and shift - should call
    event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true, shiftKey: true });
    window.dispatchEvent(event);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should prevent default when callback is called', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('k', callback));

    const event = new KeyboardEvent('keydown', { key: 'k' });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    window.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(callback).toHaveBeenCalled();
  });

  it('should cleanup event listener on unmount', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useKeyboardShortcut('k', callback));

    unmount();

    const event = new KeyboardEvent('keydown', { key: 'k' });
    window.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });

  it('should update callback when it changes', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    const { rerender } = renderHook(({ cb }) => useKeyboardShortcut('k', cb), {
      initialProps: { cb: callback1 },
    });

    const event = new KeyboardEvent('keydown', { key: 'k' });
    window.dispatchEvent(event);

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).not.toHaveBeenCalled();

    rerender({ cb: callback2 });
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }));

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
  });
});
