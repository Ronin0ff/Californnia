import { SubscriptionPlan } from '@/contexts/AuthContext';

export interface PlanLimits {
  maxSkus: number;
  maxIntegrations: number;
  exportEnabled: boolean;
  aiRecommendations: boolean;
  competitorAnalytics: boolean;
  repricer: boolean;
  bidder: boolean;
  teamMembers: number;
  trialDays: number;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  standard: {
    maxSkus: 10,
    maxIntegrations: 1,
    exportEnabled: true,
    aiRecommendations: false,
    competitorAnalytics: false,
    repricer: false,
    bidder: false,
    teamMembers: 0,
    trialDays: 0,
  },
  pro: {
    maxSkus: 50,
    maxIntegrations: 3,
    exportEnabled: true,
    aiRecommendations: true,
    competitorAnalytics: true,
    repricer: true,
    bidder: true,
    teamMembers: 5,
    trialDays: 0,
  },
  enterprise: {
    maxSkus: Infinity,
    maxIntegrations: Infinity,
    exportEnabled: true,
    aiRecommendations: true,
    competitorAnalytics: true,
    repricer: true,
    bidder: true,
    teamMembers: Infinity,
    trialDays: 0,
  },
  trial: {
    maxSkus: 50,
    maxIntegrations: 3,
    exportEnabled: true,
    aiRecommendations: true,
    competitorAnalytics: true,
    repricer: true,
    bidder: true,
    teamMembers: 5,
    trialDays: 14,
  },
};

export function getPlanLimits(plan: SubscriptionPlan): PlanLimits {
  return PLAN_LIMITS[plan || ''] || PLAN_LIMITS.standard;
}

export function canCreateSku(plan: SubscriptionPlan, currentCount: number): boolean {
  const limits = getPlanLimits(plan);
  return currentCount < limits.maxSkus;
}

export function getSkuUsagePercent(plan: SubscriptionPlan, currentCount: number): number {
  const limits = getPlanLimits(plan);
  if (limits.maxSkus === Infinity) return 0;
  return Math.min(100, Math.round((currentCount / limits.maxSkus) * 100));
}
