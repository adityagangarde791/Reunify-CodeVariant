import { describe, it, expect } from 'vitest';
import { ClaimStatus } from '../types';

describe('Claims Verification State Machine', () => {
  const validTransitions: Record<ClaimStatus, ClaimStatus[]> = {
    pending: ['submitted', 'under_review', 'withdrawn', 'cancelled'],
    submitted: ['under_review', 'cancelled', 'rejected', 'withdrawn'],
    under_review: ['approved', 'rejected', 'cancelled', 'withdrawn'],
    approved: ['handover_pending', 'returned', 'cancelled'],
    handover_pending: ['returned', 'cancelled'],
    returned: [], // Terminal state
    rejected: ['under_review'], // Can be reopened on appeal
    withdrawn: [], // Terminal state
    cancelled: [], // Terminal state
  };

  function canTransition(from: ClaimStatus, to: ClaimStatus): boolean {
    return validTransitions[from]?.includes(to) ?? false;
  }

  it('allows valid transitions from submitted to under_review and approved', () => {
    expect(canTransition('submitted', 'under_review')).toBe(true);
    expect(canTransition('under_review', 'approved')).toBe(true);
    expect(canTransition('approved', 'returned')).toBe(true);
  });

  it('prevents illegal transitions such as returning a submitted claim directly', () => {
    expect(canTransition('submitted', 'returned')).toBe(false);
    expect(canTransition('returned', 'submitted')).toBe(false);
  });

  it('validates handover pass token format', () => {
    const testCode = 'REUN-8492-SEC';
    const regex = /^REUN-\d{4}-(SEC|DESK)$/;
    expect(regex.test(testCode)).toBe(true);
    expect(regex.test('INVALID-CODE')).toBe(false);
  });
});
