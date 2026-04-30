import { describe, it, expect } from 'vitest';
import { getPlanLimits, canCreateSku, getSkuUsagePercent } from '../lib/plan-limits';

describe('getPlanLimits', () => {
  it('returns standard limits', () => {
    const limits = getPlanLimits('standard');
    expect(limits.maxSkus).toBe(10);
    expect(limits.aiRecommendations).toBe(false);
    expect(limits.repricer).toBe(false);
  });

  it('returns pro limits', () => {
    const limits = getPlanLimits('pro');
    expect(limits.maxSkus).toBe(50);
    expect(limits.aiRecommendations).toBe(true);
    expect(limits.repricer).toBe(true);
  });

  it('returns enterprise limits with unlimited SKUs', () => {
    const limits = getPlanLimits('enterprise');
    expect(limits.maxSkus).toBe(Infinity);
    expect(limits.teamMembers).toBe(Infinity);
  });

  it('returns standard for null plan', () => {
    const limits = getPlanLimits(null);
    expect(limits.maxSkus).toBe(10);
  });
});

describe('canCreateSku', () => {
  it('allows creation under limit', () => {
    expect(canCreateSku('standard', 5)).toBe(true);
    expect(canCreateSku('pro', 49)).toBe(true);
  });

  it('blocks creation at limit', () => {
    expect(canCreateSku('standard', 10)).toBe(false);
    expect(canCreateSku('pro', 50)).toBe(false);
  });

  it('always allows for enterprise', () => {
    expect(canCreateSku('enterprise', 10000)).toBe(true);
  });
});

describe('getSkuUsagePercent', () => {
  it('calculates percentage correctly', () => {
    expect(getSkuUsagePercent('standard', 5)).toBe(50);
    expect(getSkuUsagePercent('standard', 10)).toBe(100);
    expect(getSkuUsagePercent('pro', 25)).toBe(50);
  });

  it('returns 0 for enterprise (unlimited)', () => {
    expect(getSkuUsagePercent('enterprise', 500)).toBe(0);
  });

  it('caps at 100%', () => {
    expect(getSkuUsagePercent('standard', 15)).toBe(100);
  });
});
