import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

function ThrowingChild({ message }: { message: string }) {
  throw new Error(message);
}

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <p>Safe content</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('Safe content')).toBeInTheDocument();
  });

  it('shows full-page fallback UI when a child throws', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowingChild message="Test crash" />
      </ErrorBoundary>,
    );

    expect(screen.getByText('K-MIRROR — Runtime Error')).toBeInTheDocument();
    expect(screen.getByText(/Test crash/)).toBeInTheDocument();
    expect(screen.getByText('Reload')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('shows inline fallback UI when inline prop is true', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary inline>
        <ThrowingChild message="Inline crash" />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Inline crash')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('does not show error UI when children render successfully', () => {
    render(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>,
    );

    expect(screen.queryByText('K-MIRROR — Runtime Error')).not.toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });
});
