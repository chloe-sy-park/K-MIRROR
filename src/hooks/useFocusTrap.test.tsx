import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { useFocusTrap } from './useFocusTrap';

function TestModal({ onEscape }: { onEscape?: () => void }) {
  const [isOpen, setIsOpen] = useState(true);
  const { dialogRef, handleKeyDown } = useFocusTrap({ isOpen, onEscape: onEscape ?? (() => setIsOpen(false)) });

  if (!isOpen) return <p>Closed</p>;

  return (
    <div onKeyDown={handleKeyDown}>
      <div ref={dialogRef} role="dialog" data-testid="dialog">
        <button data-testid="first">First</button>
        <button data-testid="second">Second</button>
        <button data-testid="last">Last</button>
      </div>
    </div>
  );
}

describe('useFocusTrap', () => {
  it('auto-focuses the first focusable element on mount', () => {
    render(<TestModal />);
    expect(screen.getByTestId('first')).toHaveFocus();
  });

  it('calls onEscape when Escape key is pressed', () => {
    const onEscape = vi.fn();
    render(<TestModal onEscape={onEscape} />);
    fireEvent.keyDown(screen.getByTestId('dialog').parentElement!, { key: 'Escape' });
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('wraps focus from last to first on Tab', () => {
    render(<TestModal />);
    const last = screen.getByTestId('last');
    last.focus();
    expect(last).toHaveFocus();

    fireEvent.keyDown(screen.getByTestId('dialog').parentElement!, { key: 'Tab' });
    expect(screen.getByTestId('first')).toHaveFocus();
  });

  it('wraps focus from first to last on Shift+Tab', () => {
    render(<TestModal />);
    const first = screen.getByTestId('first');
    first.focus();
    expect(first).toHaveFocus();

    fireEvent.keyDown(screen.getByTestId('dialog').parentElement!, { key: 'Tab', shiftKey: true });
    expect(screen.getByTestId('last')).toHaveFocus();
  });
});
