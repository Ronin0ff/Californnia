import { describe, it, expect } from 'vitest';
import {
  DEFAULT_PERMISSIONS,
  NO_PERMISSIONS,
  STANDARD_PERMISSIONS,
  PRO_PERMISSIONS,
  ENTERPRISE_PERMISSIONS,
} from '../contexts/AuthContext';

describe('Permission maps', () => {
  it('NO_PERMISSIONS denies everything', () => {
    const values = Object.values(NO_PERMISSIONS);
    expect(values.every(v => v === false)).toBe(true);
  });

  it('DEFAULT_PERMISSIONS grants everything', () => {
    const values = Object.values(DEFAULT_PERMISSIONS);
    expect(values.every(v => v === true)).toBe(true);
  });

  it('STANDARD has dashboard, skus, calculator, alerts, integrations, profile, pricing', () => {
    expect(STANDARD_PERMISSIONS.dashboard).toBe(true);
    expect(STANDARD_PERMISSIONS.skus).toBe(true);
    expect(STANDARD_PERMISSIONS.calculator).toBe(true);
    expect(STANDARD_PERMISSIONS.alerts).toBe(true);
    expect(STANDARD_PERMISSIONS.integrations).toBe(true);
    expect(STANDARD_PERMISSIONS.profile).toBe(true);
    expect(STANDARD_PERMISSIONS.pricing).toBe(true);
  });

  it('STANDARD does not have analytics, competitors, repricer, bidder, cards, team', () => {
    expect(STANDARD_PERMISSIONS.analytics).toBe(false);
    expect(STANDARD_PERMISSIONS.competitors).toBe(false);
    expect(STANDARD_PERMISSIONS.repricer).toBe(false);
    expect(STANDARD_PERMISSIONS.bidder).toBe(false);
    expect(STANDARD_PERMISSIONS.cards).toBe(false);
    expect(STANDARD_PERMISSIONS.team).toBe(false);
  });

  it('PRO has all features except team', () => {
    expect(PRO_PERMISSIONS.analytics).toBe(true);
    expect(PRO_PERMISSIONS.competitors).toBe(true);
    expect(PRO_PERMISSIONS.repricer).toBe(true);
    expect(PRO_PERMISSIONS.bidder).toBe(true);
    expect(PRO_PERMISSIONS.cards).toBe(true);
    expect(PRO_PERMISSIONS.team).toBe(false);
  });

  it('ENTERPRISE matches DEFAULT_PERMISSIONS', () => {
    for (const key of Object.keys(DEFAULT_PERMISSIONS)) {
      expect(ENTERPRISE_PERMISSIONS[key as keyof typeof ENTERPRISE_PERMISSIONS])
        .toBe(DEFAULT_PERMISSIONS[key as keyof typeof DEFAULT_PERMISSIONS]);
    }
  });
});
