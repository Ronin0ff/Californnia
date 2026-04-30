import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Calculator, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import {
  skuApi,
  marketplaceApi,
  type Sku,
  type Marketplace,
  calculateProfitability,
} from '@/lib/marketplace-api';

const CostCalculator: React.FC = () => {
  const [skus, setSkus] = useState<Sku[]>([]);
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkuId, setSelectedSkuId] = useState<string>('');

  const [form, setForm] = useState({
    purchase_price: '500',
    selling_price: '1000',
    commission_pct: '19',
    logistics_cost: '55',
    return_rate_pct: '5',
    storage_cost_monthly: '30',
    ad_spend_per_unit: '50',
    tax_rate_pct: '0',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [skusData, mpData] = await Promise.all([
        skuApi.getAll(),
        marketplaceApi.getAll(),
      ]);
      setSkus(skusData);
      setMarketplaces(mpData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSku = (skuId: string) => {
    setSelectedSkuId(skuId);
    if (skuId === 'custom') return;
    const sku = skus.find((s) => String(s.id) === skuId);
    if (sku) {
      setForm({
        purchase_price: String(sku.purchase_price || 0),
        selling_price: String(sku.selling_price || 0),
        commission_pct: String(sku.commission_pct || 0),
        logistics_cost: String(sku.logistics_cost || 0),
        return_rate_pct: String(sku.return_rate_pct || 0),
        storage_cost_monthly: String(sku.storage_cost_monthly || 0),
        ad_spend_per_unit: String(sku.ad_spend_per_unit || 0),
        tax_rate_pct: String(sku.tax_rate_pct || 0),
      });
    }
  };

  const handleSelectMarketplace = (slug: string) => {
    const mp = marketplaces.find((m) => m.slug === slug);
    if (mp) {
      setForm((prev) => ({
        ...prev,
        commission_pct: String(mp.base_commission_pct),
        logistics_cost: String(mp.logistics_base_cost),
        return_rate_pct: String(mp.return_cost_pct),
      }));
    }
  };

  const calc = useMemo(() => {
    return calculateProfitability({
      purchase_price: parseFloat(form.purchase_price) || 0,
      selling_price: parseFloat(form.selling_price) || 0,
      commission_pct: parseFloat(form.commission_pct) || 0,
      logistics_cost: parseFloat(form.logistics_cost) || 0,
      return_rate_pct: parseFloat(form.return_rate_pct) || 0,
      storage_cost_monthly: parseFloat(form.storage_cost_monthly) || 0,
      ad_spend_per_unit: parseFloat(form.ad_spend_per_unit) || 0,
      tax_rate_pct: parseFloat(form.tax_rate_pct) || 0,
    });
  }, [form]);

  const sellingPrice = parseFloat(form.selling_price) || 0;
  const costItems = [
    { label: 'Закупка', value: parseFloat(form.purchase_price) || 0, color: 'bg-slate-500' },
    { label: 'Комиссия', value: calc.commission, color: 'bg-blue-500' },
    { label: 'Логистика', value: calc.logistics, color: 'bg-indigo-500' },
    { label: 'Возвраты', value: calc.returnCost, color: 'bg-purple-500' },
    { label: 'Хранение', value: calc.storage, color: 'bg-cyan-500' },
    { label: 'Реклама', value: calc.adSpend, color: 'bg-amber-500' },
    { label: 'НДС', value: calc.vat, color: 'bg-rose-500' },
  ];

  const getStatusInfo = () => {
    if (calc.marginPct > 10) return { label: 'Высокоприбыльный', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: TrendingUp };
    if (calc.marginPct > 2) return { label: 'Прибыльный', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: TrendingUp };
    if (calc.marginPct > 0) return { label: 'Безубыточный', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Minus };
    return { label: 'Убыточный', color: 'text-red-400', bg: 'bg-red-500/10', icon: TrendingDown };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Калькулятор себестоимости</h1>
        <p className="text-slate-300 dark:text-white/30 mt-1">Рассчитайте полную себестоимость и маржу товара</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-slate-900 dark:text-white">Параметры расчёта</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* SKU selector */}
              <div className="space-y-2">
                <Label className="text-slate-400 dark:text-white/50">Выбрать SKU</Label>
                <Select value={selectedSkuId} onValueChange={handleSelectSku}>
                  <SelectTrigger className="bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-white/60">
                    <SelectValue placeholder="Выберите SKU или введите вручную" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Ручной ввод</SelectItem>
                    {skus.map((sku) => (
                      <SelectItem key={sku.id} value={String(sku.id)}>
                        {sku.name} ({sku.article})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quick marketplace preset */}
              <div className="space-y-2">
                <Label className="text-slate-400 dark:text-white/50">Пресет маркетплейса</Label>
                <Select onValueChange={handleSelectMarketplace}>
                  <SelectTrigger className="bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-white/60">
                    <SelectValue placeholder="Заполнить из маркетплейса" />
                  </SelectTrigger>
                  <SelectContent>
                    {marketplaces.map((mp) => (
                      <SelectItem key={mp.id} value={mp.slug}>
                        {mp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator className="bg-white/[0.06]" />

              {/* Price inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-slate-400 dark:text-white/50">Цена закупки (₽)</Label>
                  <Input
                    type="number"
                    value={form.purchase_price}
                    onChange={(e) => setForm({ ...form, purchase_price: e.target.value })}
                    className="bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400 dark:text-white/50">Цена продажи (₽)</Label>
                  <Input
                    type="number"
                    value={form.selling_price}
                    onChange={(e) => setForm({ ...form, selling_price: e.target.value })}
                    className="bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-slate-400 dark:text-white/50">Комиссия (%)</Label>
                  <Input
                    type="number"
                    value={form.commission_pct}
                    onChange={(e) => setForm({ ...form, commission_pct: e.target.value })}
                    className="bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400 dark:text-white/50">Логистика (₽)</Label>
                  <Input
                    type="number"
                    value={form.logistics_cost}
                    onChange={(e) => setForm({ ...form, logistics_cost: e.target.value })}
                    className="bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-slate-400 dark:text-white/50">Возвраты (%)</Label>
                  <Input
                    type="number"
                    value={form.return_rate_pct}
                    onChange={(e) => setForm({ ...form, return_rate_pct: e.target.value })}
                    className="bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400 dark:text-white/50">Хранение (₽/мес)</Label>
                  <Input
                    type="number"
                    value={form.storage_cost_monthly}
                    onChange={(e) => setForm({ ...form, storage_cost_monthly: e.target.value })}
                    className="bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-slate-400 dark:text-white/50">Реклама (₽/шт)</Label>
                  <Input
                    type="number"
                    value={form.ad_spend_per_unit}
                    onChange={(e) => setForm({ ...form, ad_spend_per_unit: e.target.value })}
                    className="bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400 dark:text-white/50">НДС (%)</Label>
                  <Input
                    type="number"
                    value={form.tax_rate_pct}
                    onChange={(e) => setForm({ ...form, tax_rate_pct: e.target.value })}
                    className="bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {/* Status Card */}
          <Card className={`${statusInfo.bg} border-slate-200 dark:border-white/[0.06]`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`h-14 w-14 rounded-full ${statusInfo.bg} flex items-center justify-center`}>
                    <StatusIcon className={`h-7 w-7 ${statusInfo.color}`} />
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${statusInfo.color}`}>{statusInfo.label}</p>
                    <p className="text-sm text-slate-300 dark:text-white/30">
                      Чистая прибыль: <span className={`font-semibold ${statusInfo.color}`}>
                        {calc.netProfit >= 0 ? '+' : ''}{calc.netProfit.toLocaleString('ru-RU')} ₽
                      </span> на единицу
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{calc.marginPct.toFixed(1)}%</p>
                  <p className="text-sm text-slate-300 dark:text-white/30">Маржа</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Breakdown */}
          <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-slate-900 dark:text-white">
                <Calculator className="h-5 w-5 text-slate-400 dark:text-white/40" />
                Структура затрат
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Visual bar */}
              <div className="mb-6">
                <div className="flex h-8 rounded-lg overflow-hidden">
                  {costItems.map((item) => {
                    const pct = sellingPrice > 0 ? (item.value / sellingPrice) * 100 : 0;
                    if (pct <= 0) return null;
                    return (
                      <div
                        key={item.label}
                        className={`${item.color} transition-all duration-300`}
                        style={{ width: `${pct}%` }}
                        title={`${item.label}: ${item.value.toLocaleString('ru-RU')} ₽ (${pct.toFixed(1)}%)`}
                      />
                    );
                  })}
                  {calc.netProfit > 0 && (
                    <div
                      className="bg-emerald-500 transition-all duration-300"
                      style={{ width: `${(calc.netProfit / sellingPrice) * 100}%` }}
                      title={`Прибыль: ${calc.netProfit.toLocaleString('ru-RU')} ₽`}
                    />
                  )}
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-300 dark:text-white/20">
                  <span>0 ₽</span>
                  <span>{sellingPrice.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>

              {/* Detailed breakdown */}
              <div className="space-y-3">
                {costItems.map((item) => {
                  const pct = sellingPrice > 0 ? (item.value / sellingPrice) * 100 : 0;
                  return (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${item.color}`} />
                      <span className="text-sm text-slate-400 dark:text-white/40 w-24">{item.label}</span>
                      <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all duration-300`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-600 dark:text-white/70 w-20 text-right">
                        {item.value.toLocaleString('ru-RU')} ₽
                      </span>
                      <span className="text-xs text-slate-300 dark:text-white/20 w-12 text-right">
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}

                <Separator className="bg-white/[0.06]" />

                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-white/60" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white w-24">Итого затрат</span>
                  <div className="flex-1" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white w-20 text-right">
                    {calc.totalCost.toLocaleString('ru-RU')} ₽
                  </span>
                  <span className="text-xs text-slate-300 dark:text-white/20 w-12 text-right">
                    {sellingPrice > 0 ? ((calc.totalCost / sellingPrice) * 100).toFixed(1) : '0.0'}%
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-400 w-24">Прибыль</span>
                  <div className="flex-1" />
                  <span className={`text-sm font-bold w-20 text-right ${
                    calc.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {calc.netProfit >= 0 ? '+' : ''}{calc.netProfit.toLocaleString('ru-RU')} ₽
                  </span>
                  <span className={`text-xs w-12 text-right ${
                    calc.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {calc.marginPct.toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick scenarios */}
          <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-slate-900 dark:text-white">Сценарии «Что если»</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Снижение цены на 10%', priceMod: 0.9 },
                  { label: 'Рост цены на 10%', priceMod: 1.1 },
                  { label: 'Рост комиссии на 5%', commMod: 1.05 },
                ].map((scenario) => {
                  const scenarioCalc = calculateProfitability({
                    purchase_price: parseFloat(form.purchase_price) || 0,
                    selling_price: (parseFloat(form.selling_price) || 0) * (scenario.priceMod || 1),
                    commission_pct: (parseFloat(form.commission_pct) || 0) * (scenario.commMod || 1),
                    logistics_cost: parseFloat(form.logistics_cost) || 0,
                    return_rate_pct: parseFloat(form.return_rate_pct) || 0,
                    storage_cost_monthly: parseFloat(form.storage_cost_monthly) || 0,
                    ad_spend_per_unit: parseFloat(form.ad_spend_per_unit) || 0,
                    tax_rate_pct: parseFloat(form.tax_rate_pct) || 0,
                  });
                  return (
                    <div key={scenario.label} className="p-4 rounded-lg bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
                      <p className="text-sm font-medium text-slate-400 dark:text-white/50 mb-2">{scenario.label}</p>
                      <p className={`text-xl font-bold ${
                        scenarioCalc.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {scenarioCalc.netProfit >= 0 ? '+' : ''}{scenarioCalc.netProfit.toLocaleString('ru-RU')} ₽
                      </p>
                      <p className={`text-sm ${
                        scenarioCalc.marginPct >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        Маржа: {scenarioCalc.marginPct.toFixed(1)}%
                      </p>
                      <p className={`text-xs mt-1 ${
                        scenarioCalc.marginPct > calc.marginPct ? 'text-emerald-400' :
                        scenarioCalc.marginPct < calc.marginPct ? 'text-red-400' : 'text-slate-300 dark:text-white/20'
                      }`}>
                        {scenarioCalc.marginPct > calc.marginPct ? '▲' :
                         scenarioCalc.marginPct < calc.marginPct ? '▼' : '—'}
                        {' '}{Math.abs(scenarioCalc.marginPct - calc.marginPct).toFixed(1)} п.п.
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CostCalculator;