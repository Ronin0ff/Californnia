import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  DollarSign,
  Shield,
  Clock,
  Zap,
  Calculator,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Minus,
  Settings2,
  Play,
  Loader2,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

// ─── Types ───────────────────────────────────────────────────

type Strategy = 'competitor' | 'fixed' | 'protection';

interface RepricerItem {
  id: number;
  sku: string;
  name: string;
  marketplace: string;
  currentPrice: number;
  recommendedPrice: number;
  minCompetitorPrice: number;
  maxCompetitorPrice: number;
  strategy: Strategy;
  step: number;
  minLimit: number;
  maxLimit: number;
  enabled: boolean;
  lastUpdate: string;
  status: 'idle' | 'applied' | 'pending' | 'error';
}

// ─── Mock Data ───────────────────────────────────────────────

const initialItems: RepricerItem[] = [
  {
    id: 1, sku: 'WB-12847', name: 'Футболка "Базовая"', marketplace: 'Wildberries',
    currentPrice: 950, recommendedPrice: 890, minCompetitorPrice: 790, maxCompetitorPrice: 1050,
    strategy: 'competitor', step: 10, minLimit: 800, maxLimit: 1100, enabled: true, lastUpdate: '5 мин назад', status: 'idle',
  },
  {
    id: 2, sku: 'WB-23456', name: 'Кроссовки "Спринт"', marketplace: 'Wildberries',
    currentPrice: 2390, recommendedPrice: 2450, minCompetitorPrice: 2200, maxCompetitorPrice: 2600,
    strategy: 'fixed', step: 50, minLimit: 2100, maxLimit: 2700, enabled: true, lastUpdate: '12 мин назад', status: 'applied',
  },
  {
    id: 3, sku: 'OZ-34567', name: 'Рюкзак "Ультра"', marketplace: 'Ozon',
    currentPrice: 1890, recommendedPrice: 1890, minCompetitorPrice: 1750, maxCompetitorPrice: 2100,
    strategy: 'protection', step: 30, minLimit: 1700, maxLimit: 2200, enabled: true, lastUpdate: '3 мин назад', status: 'idle',
  },
  {
    id: 4, sku: 'WB-45678', name: 'Худи "Комфорт"', marketplace: 'Wildberries',
    currentPrice: 1450, recommendedPrice: 1380, minCompetitorPrice: 1200, maxCompetitorPrice: 1500,
    strategy: 'competitor', step: 20, minLimit: 1200, maxLimit: 1600, enabled: false, lastUpdate: '1 ч назад', status: 'idle',
  },
  {
    id: 5, sku: 'OZ-56789', name: 'Джинсы "Классик"', marketplace: 'Ozon',
    currentPrice: 2790, recommendedPrice: 2650, minCompetitorPrice: 2500, maxCompetitorPrice: 2900,
    strategy: 'competitor', step: 50, minLimit: 2400, maxLimit: 3000, enabled: true, lastUpdate: '8 мин назад', status: 'pending',
  },
  {
    id: 6, sku: 'OZ-67890', name: 'Пальто "Элегант"', marketplace: 'Ozon',
    currentPrice: 5490, recommendedPrice: 5490, minCompetitorPrice: 4900, maxCompetitorPrice: 5900,
    strategy: 'protection', step: 100, minLimit: 4800, maxLimit: 6000, enabled: true, lastUpdate: '20 мин назад', status: 'applied',
  },
  {
    id: 7, sku: 'WB-78901', name: 'Шорты "Лето"', marketplace: 'Wildberries',
    currentPrice: 690, recommendedPrice: 720, minCompetitorPrice: 590, maxCompetitorPrice: 750,
    strategy: 'fixed', step: 10, minLimit: 600, maxLimit: 800, enabled: true, lastUpdate: '15 мин назад', status: 'idle',
  },
  {
    id: 8, sku: 'WB-89012', name: 'Куртка "Ветровка"', marketplace: 'Wildberries',
    currentPrice: 3200, recommendedPrice: 3050, minCompetitorPrice: 2800, maxCompetitorPrice: 3400,
    strategy: 'competitor', step: 50, minLimit: 2700, maxLimit: 3500, enabled: false, lastUpdate: '2 ч назад', status: 'error',
  },
];

const strategyComparisonData = [
  { name: 'Футболка', current: 950, recommended: 890 },
  { name: 'Кроссовки', current: 2390, recommended: 2450 },
  { name: 'Рюкзак', current: 1890, recommended: 1890 },
  { name: 'Худи', current: 1450, recommended: 1380 },
  { name: 'Джинсы', current: 2790, recommended: 2650 },
  { name: 'Пальто', current: 5490, recommended: 5490 },
  { name: 'Шорты', current: 690, recommended: 720 },
  { name: 'Куртка', current: 3200, recommended: 3050 },
];

// ─── Chart Config ────────────────────────────────────────────

const chartConfig: ChartConfig = {
  current: { label: 'Текущая цена', color: '#94a3b8' },
  recommended: { label: 'Рекомендованная', color: '#2563eb' },
};

// ─── Strategy Card Component ─────────────────────────────────

interface StrategyCardProps {
  type: Strategy;
  title: string;
  description: string;
  icon: React.ReactNode;
  active: boolean;
  count: number;
  onClick: () => void;
}

const StrategyCard: React.FC<StrategyCardProps> = ({ type, title, description, icon, active, count, onClick }) => {
  const borderColor = active
    ? type === 'competitor' ? 'border-blue-500/50 bg-blue-500/5'
    : type === 'fixed' ? 'border-indigo-500/50 bg-indigo-500/5'
    : 'border-amber-500/50 bg-amber-500/5'
    : 'border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#0d0d14]';

  return (
    <Card className={`cursor-pointer transition-all border ${borderColor} hover:shadow-md hover:shadow-black/20`} onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${active ? (type === 'competitor' ? 'bg-blue-500/10 text-blue-400' : type === 'fixed' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-400') : 'bg-white/[0.04] text-slate-300 dark:text-white/20'}`}>
              {icon}
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-900 dark:text-white">{title}</p>
              <p className="text-xs text-slate-300 dark:text-white/30 mt-0.5">{description}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs bg-white/[0.06] text-slate-400 dark:text-white/40">{count} SKU</Badge>
        </div>
      </CardContent>
    </Card>
  );
};

// ─── Main Component ──────────────────────────────────────────

const Repricer: React.FC = () => {
  const [items, setItems] = useState<RepricerItem[]>(initialItems);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | 'all'>('all');
  const [isBulkCalculating, setIsBulkCalculating] = useState(false);
  const [bulkCalcDone, setBulkCalcDone] = useState(false);
  const [expandedSettings, setExpandedSettings] = useState<number | null>(null);
  const [globalStep, setGlobalStep] = useState(10);
  const [globalMinLimit, setGlobalMinLimit] = useState(0);
  const [globalMaxLimit, setGlobalMaxLimit] = useState(0);

  const filteredItems = selectedStrategy === 'all'
    ? items
    : items.filter((item) => item.strategy === selectedStrategy);

  const strategyCounts = {
    competitor: items.filter((i) => i.strategy === 'competitor').length,
    fixed: items.filter((i) => i.strategy === 'fixed').length,
    protection: items.filter((i) => i.strategy === 'protection').length,
  };

  const enabledCount = items.filter((i) => i.enabled).length;
  const pendingCount = items.filter((i) => i.status === 'pending').length;
  const appliedCount = items.filter((i) => i.status === 'applied').length;

  const handleToggleEnabled = (id: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  const handleStrategyChange = (id: number, strategy: Strategy) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, strategy } : item
      )
    );
  };

  const handleStepChange = (id: number, step: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, step } : item
      )
    );
  };

  const handleLimitChange = (id: number, field: 'minLimit' | 'maxLimit', value: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleBulkCalculate = () => {
    setIsBulkCalculating(true);
    setBulkCalcDone(false);
    setTimeout(() => {
      setIsBulkCalculating(false);
      setBulkCalcDone(true);
      setItems((prev) =>
        prev.map((item) => {
          if (!item.enabled) return item;
          return { ...item, status: 'pending' as const };
        })
      );
    }, 2000);
  };

  const handleApplyAll = () => {
    setItems((prev) =>
      prev.map((item) => {
        if (!item.enabled || item.status !== 'pending') return item;
        return { ...item, currentPrice: item.recommendedPrice, status: 'applied' as const };
      })
    );
  };

  const handleApplySingle = (id: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return { ...item, currentPrice: item.recommendedPrice, status: 'applied' as const };
      })
    );
  };

  const toggleSettings = (id: number) => {
    setExpandedSettings((prev) => (prev === id ? null : id));
  };

  const priceDiff = (item: RepricerItem) => item.recommendedPrice - item.currentPrice;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Репрайсер</h1>
          <p className="text-slate-300 dark:text-white/30 mt-1">Автоматическое управление ценами на маркетплейсах</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 hover:text-slate-500 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.04]">
            <RefreshCw className="mr-2 h-4 w-4" />
            Обновить данные
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-slate-300 dark:text-white/30 uppercase">Всего SKU</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{items.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-slate-300 dark:text-white/30 uppercase">Активных</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{enabledCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-slate-300 dark:text-white/30 uppercase">Ожидают применения</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-slate-300 dark:text-white/30 uppercase">Применено</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">{appliedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Strategy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StrategyCard
          type="competitor"
          title="По конкурентам"
          description="Подстройка под мин/макс цену конкурентов"
          icon={<DollarSign className="h-5 w-5" />}
          active={selectedStrategy === 'competitor'}
          count={strategyCounts.competitor}
          onClick={() => setSelectedStrategy(selectedStrategy === 'competitor' ? 'all' : 'competitor')}
        />
        <StrategyCard
          type="fixed"
          title="Фиксированная цена"
          description="Установка цены по расписанию"
          icon={<Clock className="h-5 w-5" />}
          active={selectedStrategy === 'fixed'}
          count={strategyCounts.fixed}
          onClick={() => setSelectedStrategy(selectedStrategy === 'fixed' ? 'all' : 'fixed')}
        />
        <StrategyCard
          type="protection"
          title="Защита от автоакций"
          description="Вывод из автоматических скидок"
          icon={<Shield className="h-5 w-5" />}
          active={selectedStrategy === 'protection'}
          count={strategyCounts.protection}
          onClick={() => setSelectedStrategy(selectedStrategy === 'protection' ? 'all' : 'protection')}
        />
      </div>

      {/* Bulk Actions */}
      <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-slate-300 dark:text-white/30" />
              <span className="text-sm font-medium text-slate-400 dark:text-white/50">Массовые настройки:</span>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-slate-300 dark:text-white/30">Шаг</Label>
              <Input
                type="number"
                value={globalStep}
                onChange={(e) => setGlobalStep(Number(e.target.value))}
                className="w-20 h-8 text-sm bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white"
              />
              <span className="text-xs text-slate-300 dark:text-white/20">₽</span>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-slate-300 dark:text-white/30">Мин. предел</Label>
              <Input
                type="number"
                value={globalMinLimit || ''}
                onChange={(e) => setGlobalMinLimit(Number(e.target.value))}
                placeholder="0"
                className="w-24 h-8 text-sm bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white"
              />
              <span className="text-xs text-slate-300 dark:text-white/20">₽</span>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-slate-300 dark:text-white/30">Макс. предел</Label>
              <Input
                type="number"
                value={globalMaxLimit || ''}
                onChange={(e) => setGlobalMaxLimit(Number(e.target.value))}
                placeholder="∞"
                className="w-24 h-8 text-sm bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white"
              />
              <span className="text-xs text-slate-300 dark:text-white/20">₽</span>
            </div>
            <div className="flex gap-2 ml-auto">
              <Button
                onClick={handleBulkCalculate}
                disabled={isBulkCalculating}
                variant="outline"
                size="sm"
                className="border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 hover:text-slate-500 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.04]"
              >
                {isBulkCalculating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Calculator className="mr-2 h-4 w-4" />
                )}
                Предрассчёт
              </Button>
              <Button
                onClick={handleApplyAll}
                disabled={pendingCount === 0}
                size="sm"
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                <Play className="mr-2 h-4 w-4" />
                Применить все ({pendingCount})
              </Button>
            </div>
          </div>
          {bulkCalcDone && (
            <div className="mt-3 p-2.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Предрассчёт завершён. Рекомендованные цены обновлены для {enabledCount} активных SKU.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Price Comparison Chart */}
      <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Текущие vs Рекомендованные цены</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart data={strategyComparisonData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#4a4a5a" />
              <YAxis tick={{ fontSize: 11 }} stroke="#4a4a5a" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="current" fill="#4a4a5a" radius={[2, 2, 0, 0]} name="current" />
              <Bar dataKey="recommended" radius={[2, 2, 0, 0]} name="recommended">
                {strategyComparisonData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.recommended < entry.current ? '#ef4444' : entry.recommended > entry.current ? '#10b981' : '#3b82f6'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
          <div className="flex items-center justify-center gap-6 mt-2 text-xs text-slate-300 dark:text-white/30">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#4a4a5a] inline-block" /> Текущая</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block" /> Снижение</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> Повышение</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" /> Без изменений</span>
          </div>
        </CardContent>
      </Card>

      {/* SKU Table */}
      <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
            Товары {selectedStrategy !== 'all' && (
              <Badge variant="outline" className="ml-2 text-xs border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40">
                {selectedStrategy === 'competitor' ? 'По конкурентам' : selectedStrategy === 'fixed' ? 'Фиксированная' : 'Защита'}
              </Badge>
            )}
          </CardTitle>
          <Badge variant="secondary" className="text-xs bg-white/[0.06] text-slate-400 dark:text-white/40">{filteredItems.length} шт</Badge>
        </CardHeader>
        <CardContent>
          <div className="max-h-[600px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 dark:border-white/[0.06] hover:bg-transparent">
                  <TableHead className="text-xs text-slate-300 dark:text-white/30 w-10">Вкл</TableHead>
                  <TableHead className="text-xs text-slate-300 dark:text-white/30">SKU</TableHead>
                  <TableHead className="text-xs text-slate-300 dark:text-white/30">Товар</TableHead>
                  <TableHead className="text-xs text-slate-300 dark:text-white/30">МП</TableHead>
                  <TableHead className="text-xs text-slate-300 dark:text-white/30 text-right">Текущая</TableHead>
                  <TableHead className="text-xs text-slate-300 dark:text-white/30 text-right">Реком.</TableHead>
                  <TableHead className="text-xs text-slate-300 dark:text-white/30 text-right">Δ</TableHead>
                  <TableHead className="text-xs text-slate-300 dark:text-white/30">Стратегия</TableHead>
                  <TableHead className="text-xs text-slate-300 dark:text-white/30">Статус</TableHead>
                  <TableHead className="text-xs text-slate-300 dark:text-white/30 text-center">⚙</TableHead>
                  <TableHead className="text-xs text-slate-300 dark:text-white/30 text-center">Действие</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const diff = priceDiff(item);
                  const isExpanded = expandedSettings === item.id;
                  return (
                    <React.Fragment key={item.id}>
                      <TableRow className={`border-white/[0.04] ${item.enabled ? 'hover:bg-white/[0.02]' : 'opacity-50'}`}>
                        <TableCell>
                          <Switch
                            checked={item.enabled}
                            onCheckedChange={() => handleToggleEnabled(item.id)}
                          />
                        </TableCell>
                        <TableCell className="text-xs font-mono text-slate-900 dark:text-white/25">{item.sku}</TableCell>
                        <TableCell className="text-sm font-medium text-slate-600 dark:text-white/70 max-w-[160px] truncate">{item.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40">
                            {item.marketplace === 'Wildberries' ? 'WB' : item.marketplace === 'Ozon' ? 'OZ' : 'ЯМ'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-right font-medium text-slate-500 dark:text-white/60">{item.currentPrice.toLocaleString('ru-RU')} ₽</TableCell>
                        <TableCell className="text-sm text-right font-semibold text-slate-900 dark:text-white">{item.recommendedPrice.toLocaleString('ru-RU')} ₽</TableCell>
                        <TableCell className="text-sm text-right">
                          <span className={`inline-flex items-center gap-0.5 font-medium ${diff < 0 ? 'text-red-400' : diff > 0 ? 'text-emerald-400' : 'text-slate-900 dark:text-white/25'}`}>
                            {diff < 0 ? <ArrowDown className="h-3 w-3" /> : diff > 0 ? <ArrowUp className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                            {Math.abs(diff).toLocaleString('ru-RU')} ₽
                          </span>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={item.strategy}
                            onValueChange={(v) => handleStrategyChange(item.id, v as Strategy)}
                          >
                            <SelectTrigger className="h-7 text-xs w-[130px] bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-white/60">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="competitor">
                                <span className="flex items-center gap-1.5">
                                  <DollarSign className="h-3 w-3 text-blue-400" />
                                  По конкурентам
                                </span>
                              </SelectItem>
                              <SelectItem value="fixed">
                                <span className="flex items-center gap-1.5">
                                  <Clock className="h-3 w-3 text-indigo-400" />
                                  Фиксированная
                                </span>
                              </SelectItem>
                              <SelectItem value="protection">
                                <span className="flex items-center gap-1.5">
                                  <Shield className="h-3 w-3 text-amber-400" />
                                  Защита от акций
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {item.status === 'applied' && (
                            <Badge className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Применено
                            </Badge>
                          )}
                          {item.status === 'pending' && (
                            <Badge className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/10">
                              <Clock className="h-3 w-3 mr-1" />
                              Ожидает
                            </Badge>
                          )}
                          {item.status === 'error' && (
                            <Badge variant="destructive" className="text-xs">
                              <XCircle className="h-3 w-3 mr-1" />
                              Ошибка
                            </Badge>
                          )}
                          {item.status === 'idle' && (
                            <Badge variant="outline" className="text-xs text-slate-900 dark:text-white/25 border-slate-200 dark:border-white/[0.06]">
                              <Minus className="h-3 w-3 mr-1" />
                              Ожидание
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-300 dark:text-white/20 hover:text-slate-400 dark:text-white/40 hover:bg-slate-100 dark:hover:bg-white/[0.04]" onClick={() => toggleSettings(item.id)}>
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 hover:text-slate-500 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.04]"
                            disabled={item.status === 'applied' || !item.enabled}
                            onClick={() => handleApplySingle(item.id)}
                          >
                            Применить
                          </Button>
                        </TableCell>
                      </TableRow>
                      {/* Expanded Settings Row */}
                      {isExpanded && (
                        <TableRow className="bg-white/[0.02]">
                          <TableCell colSpan={11} className="p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <Label className="text-xs text-slate-300 dark:text-white/30">Шаг изменения</Label>
                                <div className="flex items-center gap-1 mt-1">
                                  <Input
                                    type="number"
                                    value={item.step}
                                    onChange={(e) => handleStepChange(item.id, Number(e.target.value))}
                                    className="h-8 text-sm w-24 bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white"
                                  />
                                  <span className="text-xs text-slate-300 dark:text-white/20">₽</span>
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs text-slate-300 dark:text-white/30">Мин. предел</Label>
                                <div className="flex items-center gap-1 mt-1">
                                  <Input
                                    type="number"
                                    value={item.minLimit}
                                    onChange={(e) => handleLimitChange(item.id, 'minLimit', Number(e.target.value))}
                                    className="h-8 text-sm w-24 bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white"
                                  />
                                  <span className="text-xs text-slate-300 dark:text-white/20">₽</span>
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs text-slate-300 dark:text-white/30">Макс. предел</Label>
                                <div className="flex items-center gap-1 mt-1">
                                  <Input
                                    type="number"
                                    value={item.maxLimit}
                                    onChange={(e) => handleLimitChange(item.id, 'maxLimit', Number(e.target.value))}
                                    className="h-8 text-sm w-24 bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white"
                                  />
                                  <span className="text-xs text-slate-300 dark:text-white/20">₽</span>
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs text-slate-300 dark:text-white/30">Диапазон конкурентов</Label>
                                <p className="text-sm font-medium text-slate-500 dark:text-white/60 mt-1">
                                  {item.minCompetitorPrice.toLocaleString('ru-RU')} — {item.maxCompetitorPrice.toLocaleString('ru-RU')} ₽
                                </p>
                              </div>
                            </div>
                            {item.strategy === 'competitor' && (
                              <div className="mt-3 p-2.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Стратегия «По конкурентам»: цена автоматически подстраивается под минимальную/максимальную цену конкурентов с заданным шагом.
                              </div>
                            )}
                            {item.strategy === 'fixed' && (
                              <div className="mt-3 p-2.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Стратегия «Фиксированная цена»: цена устанавливается по расписанию и не меняется при колебаниях рынка.
                              </div>
                            )}
                            {item.strategy === 'protection' && (
                              <div className="mt-3 p-2.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Стратегия «Защита от автоакций»: товар выводится из автоматических скидок маркетплейса, цена фиксируется.
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Repricer;