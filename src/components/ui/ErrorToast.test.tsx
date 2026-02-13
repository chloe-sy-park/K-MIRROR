import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorToast from './ErrorToast';

describe('ErrorToast', () => {
  it('renders nothing when message is null', () => {
    const { container } = render(<ErrorToast message={null} onDismiss={vi.fn()} />);
    expect(container.textContent).toBe('');
  });

  it('renders error message when provided', () => {
    render(<ErrorToast message="Something went wrong" onDismiss={vi.fn()} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('calls onDismiss when X button is clicked', () => {
    const onDismiss = vi.fn();
    render(<ErrorToast message="Error occurred" onDismiss={onDismiss} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
