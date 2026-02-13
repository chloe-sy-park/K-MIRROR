import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SherlockProportionVisualizer from './ProportionVisualizer';

describe('SherlockProportionVisualizer', () => {
  const proportions = { upper: '33.2%', middle: '34.1%', lower: '32.7%' };

  it('renders all three proportion values', () => {
    render(<SherlockProportionVisualizer proportions={proportions} />);
    expect(screen.getByText('33.2%')).toBeInTheDocument();
    expect(screen.getByText('34.1%')).toBeInTheDocument();
    expect(screen.getByText('32.7%')).toBeInTheDocument();
  });

  it('renders zone labels', () => {
    render(<SherlockProportionVisualizer proportions={proportions} />);
    expect(screen.getByText('Frontal')).toBeInTheDocument();
    expect(screen.getByText('Orbital')).toBeInTheDocument();
    expect(screen.getByText('Mandibular')).toBeInTheDocument();
  });
});
