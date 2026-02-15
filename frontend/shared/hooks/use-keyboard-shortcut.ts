import { useEffect } from 'react';

interface KeyboardShortcutOptions {
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
}

/**
 * Reusable keyboard shortcut hook
 * @param key - Key to listen for
 * @param callback - Function to call on key press
 * @param options - Modifier keys (ctrl, meta, shift, alt)
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: KeyboardShortcutOptions = {}
): void {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const matchesKey = event.key.toLowerCase() === key.toLowerCase();
      const matchesCtrl = options.ctrl === undefined || event.ctrlKey === options.ctrl;
      const matchesMeta = options.meta === undefined || event.metaKey === options.meta;
      const matchesShift = options.shift === undefined || event.shiftKey === options.shift;
      const matchesAlt = options.alt === undefined || event.altKey === options.alt;

      if (matchesKey && matchesCtrl && matchesMeta && matchesShift && matchesAlt) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback, options]);
}
