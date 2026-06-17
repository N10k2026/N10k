import type { KeyboardEvent } from 'react';

/** Keyboard activation for div/span elements acting as buttons (Enter/Space). */
export function handleKeyboardClick(
  event: KeyboardEvent,
  action: () => void,
): void {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    action();
  }
}

export const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
