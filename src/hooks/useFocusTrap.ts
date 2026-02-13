import { useEffect, useRef, useCallback } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface UseFocusTrapOptions {
  isOpen: boolean;
  onEscape?: () => void;
}

/**
 * Manages focus trap, auto-focus, and focus restoration for modal dialogs.
 *
 * Returns a ref to attach to the dialog container and a keyDown handler.
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>({ isOpen, onEscape }: UseFocusTrapOptions) {
  const dialogRef = useRef<T>(null);
  const triggerRef = useRef<Element | null>(null);

  // Save/restore focus when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
    } else if (triggerRef.current instanceof HTMLElement) {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [isOpen]);

  // Auto-focus the first focusable element when modal opens
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      const first = dialogRef.current.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      first?.focus();
    }
  }, [isOpen]);

  // Focus trap: cycle Tab within the dialog, Escape to close
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape?.();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;

      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last!.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first!.focus();
      }
    },
    [onEscape],
  );

  return { dialogRef, handleKeyDown };
}
