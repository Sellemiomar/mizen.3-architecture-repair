import { describe, expect, it } from 'vitest';
import { generateFinancingStacks } from '../src/engine/financingStackEngine';

describe('financing stack evidence boundaries', () => {
  it('does not expose UNKNOWN compatibility as a viable stack', () => {
    const result = generateFinancingStacks({
      requiredFunding: 150_000,
      candidates: [
        { programId: 'cash-a', programName: 'Cash A', role: 'primary', amount: 100_000 },
        { programId: 'cash-b', programName: 'Cash B', role: 'secondary', amount: 50_000 },
      ],
      compatibility: [
        { left: 'cash-a', right: 'cash-b', status: 'UNKNOWN', confidence: 'LOW' },
      ],
    });

    expect(result.stacks).toHaveLength(0);
    expect(result.unverifiedCombinations.length).toBeGreaterThan(0);
  });

  it('keeps guarantee coverage out of cash coverage', () => {
    const result = generateFinancingStacks({
      requiredFunding: 150_000,
      candidates: [
        { programId: 'bank', programName: 'Bank', role: 'primary', amount: 150_000 },
        { programId: 'sotugar', programName: 'SOTUGAR', role: 'guarantee', amount: 0, support: true, coveragePercentage: 0.75 },
      ],
      compatibility: [
        { left: 'bank', right: 'sotugar', status: 'VERIFIED_COMPATIBLE', confidence: 'HIGH' },
      ],
    });

    const stack = result.stacks.find((s) => s.components.some((c) => c.programId === 'bank'));
    expect(stack).toBeDefined();
    expect(stack?.verifiedCashFunding).toBe(150_000);
    expect(stack?.verifiedCashFunding).not.toBe(262_500);
  });
});
