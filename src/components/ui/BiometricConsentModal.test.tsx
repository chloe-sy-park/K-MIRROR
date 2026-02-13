import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BiometricConsentModal from './BiometricConsentModal';

const renderModal = (props = {}) => {
  const defaultProps = {
    isOpen: true,
    onAccept: vi.fn(),
    onDecline: vi.fn(),
    ...props,
  };
  return {
    ...render(
      <MemoryRouter>
        <BiometricConsentModal {...defaultProps} />
      </MemoryRouter>,
    ),
    props: defaultProps,
  };
};

describe('BiometricConsentModal', () => {
  it('renders when isOpen is true', () => {
    renderModal();
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('calls onAccept when accept button is clicked', () => {
    const { props } = renderModal();
    fireEvent.click(screen.getByText('consent.biometricAccept'));
    expect(props.onAccept).toHaveBeenCalledOnce();
  });

  it('calls onDecline when decline button is clicked', () => {
    const { props } = renderModal();
    fireEvent.click(screen.getByText('consent.biometricDecline'));
    expect(props.onDecline).toHaveBeenCalledOnce();
  });

  it('has aria-modal attribute', () => {
    renderModal();
    expect(screen.getByRole('alertdialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('contains link to privacy policy', () => {
    renderModal();
    const link = screen.getByText('consent.biometricLearnMore');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/privacy');
  });
});
