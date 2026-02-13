import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LuxuryFileUpload from './LuxuryFileUpload';

describe('LuxuryFileUpload', () => {
  const defaultProps = {
    label: 'Your Photo',
    secondaryLabel: 'Tap to upload',
    preview: null,
    onImageSelect: vi.fn(),
  };

  it('renders label text', () => {
    render(<LuxuryFileUpload {...defaultProps} />);
    expect(screen.getByText('Your Photo')).toBeInTheDocument();
  });

  it('shows preview image when preview prop is provided', () => {
    render(<LuxuryFileUpload {...defaultProps} preview="abc123base64data" />);
    const img = screen.getByAltText('Preview');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'data:image/jpeg;base64,abc123base64data');
  });

  it('shows camera icon area when no preview', () => {
    render(<LuxuryFileUpload {...defaultProps} />);
    // When there is no preview, the secondary label text is shown
    expect(screen.getByText('Tap to upload')).toBeInTheDocument();
  });
});
