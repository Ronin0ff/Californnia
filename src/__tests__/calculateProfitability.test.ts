import { describe, it, expect } from 'vitest';
import { calculateProfitability } from '../lib/marketplace-api';

describe('calculateProfitability', () => {
  it('calculates profitable SKU correctly', () => {
    const result = calculateProfitability({
      purchase_price: 500,
      selling_price: 1500,
      commission_pct: 15,
      logistics_cost: 100,
      return_rate_pct: 5,
      storage_cost_monthly: 30,
      ad_spend_per_unit: 50,
      tax_rate_pct: 6,
    });

    expect(result.commission).toBe(225); // 1500 * 0.15
    expect(result.logistics).toBe(100);
    expect(result.returnCost).toBe(75); // 1500 * 0.05
    expect(result.storage).toBe(1); // 30/30
    expect(result.adSpend).toBe(50);
    expect(result.vat).toBe(90); // 1500 * 0.06
    expect(result.totalCost).toBe(1041); // 500+225+100+75+1+50+90
    expect(result.netProfit).toBe(459); // 1500 - 1041
    expect(result.marginPct).toBeCloseTo(30.6, 1);
    expect(result.status).toBe('profitable');
  });

  it('detects unprofitable SKU', () => {
    const result = calculateProfitability({
      purchase_price: 1200,
      selling_price: 1000,
      commission_pct: 20,
      logistics_cost: 150,
      return_rate_pct: 10,
      storage_cost_monthly: 60,
      ad_spend_per_unit: 100,
      tax_rate_pct: 20,
    });

    expect(result.netProfit).toBeLessThan(0);
    expect(result.status).toBe('unprofitable');
  });

  it('detects break-even SKU', () => {
    const result = calculateProfitability({
      purchase_price: 900,
      selling_price: 1000,
      commission_pct: 5,
      logistics_cost: 30,
      return_rate_pct: 1,
      storage_cost_monthly: 0,
      ad_spend_per_unit: 0,
      tax_rate_pct: 0,
    });

    // margin between 0 and 2 = break_even
    expect(result.marginPct).toBeGreaterThanOrEqual(0);
    expect(result.marginPct).toBeLessThanOrEqual(2);
    expect(result.status).toBe('break_even');
  });

  it('handles zero selling price', () => {
    const result = calculateProfitability({
      purchase_price: 100,
      selling_price: 0,
    });

    expect(result.marginPct).toBe(0);
    expect(result.netProfit).toBe(-100);
  });

  it('handles empty/partial data gracefully', () => {
    const result = calculateProfitability({});

    expect(result.totalCost).toBe(0);
    expect(result.netProfit).toBe(0);
    expect(result.marginPct).toBe(0);
    expect(result.status).toBe('break_even');
  });
});
