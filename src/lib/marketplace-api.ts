import { createClient } from '@metagptx/web-sdk';

const client = createClient();

// Types
export interface Marketplace {
  id: number;
  slug: string;
  name: string;
  base_commission_pct: number;
  logistics_base_cost: number;
  return_cost_pct: number;
  storage_daily_cost: number;
  is_active: boolean;
}

export interface Sku {
  id: number;
  user_id?: string;
  marketplace_id: number;
  article: string;
  name: string;
  category: string;
  purchase_price: number;
  selling_price: number;
  commission_pct: number;
  logistics_cost: number;
  return_rate_pct: number;
  storage_cost_monthly: number;
  ad_spend_per_unit: number;
  tax_rate_pct: number;
  net_profit: number;
  margin_pct: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface CostStructure {
  id: number;
  user_id?: string;
  sku_id: number;
  commission_amount: number;
  logistics_amount: number;
  return_cost_amount: number;
  storage_amount: number;
  ad_spend_amount: number;
  vat_amount: number;
  total_cost: number;
  net_profit: number;
  margin_pct: number;
}

export interface AiRecommendation {
  id: number;
  user_id?: string;
  sku_id: number;
  recommended_price: number;
  predicted_margin_pct: number;
  predicted_sales_change_pct: number;
  predicted_profit_monthly: number;
  reasoning: string;
  scenario_type: string;
  status: string;
  created_at?: string;
}

export interface Alert {
  id: number;
  user_id?: string;
  sku_id: number | null;
  type: string;
  message: string;
  threshold_value: number | null;
  current_value: number | null;
  is_read: boolean;
  created_at?: string;
}

// Profitability calculation
export function calculateProfitability(data: Partial<Sku>) {
  const purchasePrice = data.purchase_price || 0;
  const sellingPrice = data.selling_price || 0;
  const commissionPct = data.commission_pct || 0;
  const logisticsCost = data.logistics_cost || 0;
  const returnRatePct = data.return_rate_pct || 0;
  const storageCostMonthly = data.storage_cost_monthly || 0;
  const adSpendPerUnit = data.ad_spend_per_unit || 0;
  const taxRatePct = data.tax_rate_pct || 0;

  const commission = sellingPrice * (commissionPct / 100);
  const logistics = logisticsCost;
  const returnCost = sellingPrice * (returnRatePct / 100);
  const storage = storageCostMonthly / 30; // daily cost per unit
  const adSpend = adSpendPerUnit;
  const vat = sellingPrice * (taxRatePct / 100);

  const totalCost = purchasePrice + commission + logistics + returnCost + storage + adSpend + vat;
  const netProfit = sellingPrice - totalCost;
  const marginPct = sellingPrice > 0 ? (netProfit / sellingPrice) * 100 : 0;

  let status = 'break_even';
  if (marginPct > 2) status = 'profitable';
  else if (marginPct < 0) status = 'unprofitable';

  return {
    commission,
    logistics,
    returnCost,
    storage,
    adSpend,
    vat,
    totalCost,
    netProfit,
    marginPct,
    status,
  };
}

// API helpers using web-sdk
export const marketplaceApi = {
  getAll: async (): Promise<Marketplace[]> => {
    const response = await client.entities.marketplaces.query({ query: {}, limit: 100 });
    return response.data.items || [];
  },
  getById: async (id: number): Promise<Marketplace> => {
    const response = await client.entities.marketplaces.get({ id: String(id) });
    return response.data;
  },
};

export const skuApi = {
  getAll: async (): Promise<Sku[]> => {
    const response = await client.entities.skus.queryAll({ query: {}, limit: 100, sort: '-created_at' });
    return response.data.items || [];
  },
  getById: async (id: number): Promise<Sku> => {
    const response = await client.entities.skus.get({ id: String(id) });
    return response.data;
  },
  create: async (data: Partial<Sku>): Promise<Sku> => {
    const response = await client.entities.skus.create({ data: data as Record<string, unknown> });
    return response.data;
  },
  update: async (id: number, data: Partial<Sku>): Promise<Sku> => {
    const response = await client.entities.skus.update({ id: String(id), data: data as Record<string, unknown> });
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await client.entities.skus.delete({ id: String(id) });
  },
};

export const costStructureApi = {
  getAll: async (): Promise<CostStructure[]> => {
    const response = await client.entities.cost_structures.queryAll({ query: {}, limit: 100 });
    return response.data.items || [];
  },
  getBySkuId: async (skuId: number): Promise<CostStructure[]> => {
    const response = await client.entities.cost_structures.queryAll({ query: { sku_id: skuId }, limit: 100 });
    return response.data.items || [];
  },
  create: async (data: Partial<CostStructure>): Promise<CostStructure> => {
    const response = await client.entities.cost_structures.create({ data: data as Record<string, unknown> });
    return response.data;
  },
  update: async (id: number, data: Partial<CostStructure>): Promise<CostStructure> => {
    const response = await client.entities.cost_structures.update({ id: String(id), data: data as Record<string, unknown> });
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await client.entities.cost_structures.delete({ id: String(id) });
  },
};

export const aiRecommendationApi = {
  getAll: async (): Promise<AiRecommendation[]> => {
    const response = await client.entities.ai_recommendations.queryAll({ query: {}, limit: 100, sort: '-created_at' });
    return response.data.items || [];
  },
  create: async (data: Partial<AiRecommendation>): Promise<AiRecommendation> => {
    const response = await client.entities.ai_recommendations.create({ data: data as Record<string, unknown> });
    return response.data;
  },
  update: async (id: number, data: Partial<AiRecommendation>): Promise<AiRecommendation> => {
    const response = await client.entities.ai_recommendations.update({ id: String(id), data: data as Record<string, unknown> });
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await client.entities.ai_recommendations.delete({ id: String(id) });
  },
};

export const alertApi = {
  getAll: async (): Promise<Alert[]> => {
    const response = await client.entities.alerts.queryAll({ query: {}, limit: 100, sort: '-created_at' });
    return response.data.items || [];
  },
  create: async (data: Partial<Alert>): Promise<Alert> => {
    const response = await client.entities.alerts.create({ data: data as Record<string, unknown> });
    return response.data;
  },
  update: async (id: number, data: Partial<Alert>): Promise<Alert> => {
    const response = await client.entities.alerts.update({ id: String(id), data: data as Record<string, unknown> });
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await client.entities.alerts.delete({ id: String(id) });
  },
};

export { client };