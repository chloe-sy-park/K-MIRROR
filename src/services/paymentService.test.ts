import { describe, it, expect } from 'vitest';
import { isPaymentEnabled } from './paymentService';

describe('paymentService', () => {
  it('isPaymentEnabled is false when Stripe key is not set', () => {
    expect(isPaymentEnabled).toBe(false);
  });
});
