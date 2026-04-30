import React, { useState, useEffect } from 'react';
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
import { Progress } from '@/components/ui/progress';
import {
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Zap,
  DollarSign,
  RefreshCw,
  Play,
  Pause,
  Loader2,
  ArrowUp,
  ArrowDown,
  Minus,
  BarChart3,
  Shield,
  Gauge,
  History,
  Bell,
  ChevronDown,
  ChevronUp,
  Settings2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

// ─── Types ───────────────────────────────────────────────────

type BidStrategy = 'top3' | 'min_bid' | 'roi_optimize';

interface Campaign {
  id: number;
  name: string;
  sku: string;
  marketplace: string;
  strategy: BidStrategy;
  currentBid: number;
  recommendedBid: number;
  position: number;
  targetPosition: number;
  impressions: number;
  clicks: number;
  ctr: number;
  spend: number;
  revenue: number;
  drr: number;
  targetDrr: number;
  enabled: boolean;
  lastBidUpdate: string;
  autoRefresh: boolean;
  status: 'active' | 'paused' | 'alert' | 'idle';
}

interface BidHistoryEntry {
  id: number;
  campaignId: number;
  timestamp: string;
  oldBid: number;
  newBid: number;
  reason: string;
  strategy: BidStrategy;
}

// ─── Mock Data ───────────────────────────────────────────────

const initialCampaigns: Campaign[] = [
  {
    id: 1, name: 'Футболка "Базовая"', sku: 'WB-12847', marketplace: 'Wildberries',
    strategy: 'top3', currentBid: 45, recommendedBid: 52, position: 4, targetPosition: 3,
    impressions: 12400, clicks: 620, ctr: 5.0, spend: 27900, revenue: 89000, drr: 31.3, targetDrr: 30,
    enabled: true, lastBidUpdate: '3 мин назад', autoRefresh: true, status: 'alert',
  },
  {
    id: 2, name: 'Кроссовки "Спринт"', sku: 'WB-23456', marketplace: 'Wildberries',
    strategy: 'roi_optimize', currentBid: 78, recommendedBid: 72, position: 2, targetPosition: 5,
    impressions: 8900, clicks: 356, ctr: 4.0, spend: 27768, revenue: 142000, drr: 19.6, targetDrr: 25,
    enabled: true, lastBidUpdate: '7 мин назад', autoRefresh: true, status: 'active',
  },
  {
    id: 3, name: 'Рюкзак "Ультра"', sku: 'OZ-34567', marketplace: 'Ozon',
    strategy: 'min_bid', currentBid: 32, recommendedBid: 32, position: 8, targetPosition: 8,
    impressions: 5600, clicks: 168, ctr: 3.0, spend: 5376, revenue: 32000, drr: 16.8, targetDrr: 25,
    enabled: true, lastBidUpdate: '12 мин назад', autoRefresh: true, status: 'active',
  },
  {
    id: 4, name: 'Худи "Комфорт"', sku: 'WB-45678', marketplace: 'Wildberries',
    strategy: 'top3', currentBid: 55, recommendedBid: 60, position: 5, targetPosition: 3,
    impressions: 9200, clicks: 414, ctr: 4.5, spend: 22770, revenue: 60000, drr: 38.0, targetDrr: 30,
    enabled: true, lastBidUpdate: '5 мин назад', autoRefresh: true, status: 'alert',
  },
  {
    id: 5, name: 'Джинсы "Классик"', sku: 'OZ-56789', marketplace: 'Ozon',
    strategy: 'roi_optimize', currentBid: 65, recommendedBid: 58, position: 3, targetPosition: 5,
    impressions: 7100, clicks: 284, ctr: 4.0, spend: 18460, revenue: 78000, drr: 23.7, targetDrr: 25,
    enabled: false, lastBidUpdate: '1 ч назад', autoRefresh: false, status: 'paused',
  },
  {
    id: 6, name: 'Пальто "Элегант"', sku: 'OZ-67890', marketplace: 'Ozon',
    strategy: 'min_bid', currentBid: 90, recommendedBid: 85, position: 6, targetPosition: 6,
    impressions: 3400, clicks: 102, ctr: 3.0, spend: 9180, revenue: 55000, drr: 16.7, targetDrr: 20,
    enabled: true, lastBidUpdate: '9 мин назад', autoRefresh: true, status: 'active',
  },
];

const bidHistoryData: BidHistoryEntry[] = [
  { id: 1, campaignId: 1, timestamp: '28 апр 14:32', oldBid: 42, newBid: 45, reason: 'Конкурент повысил ставку, позиция упала до #4', strategy: 'top3' },
  { id: 2, campaignId: 2, timestamp: '28 апр 14:25', oldBid: 80, newBid: 78, reason: 'ROI выше целевого, снижение ставки для оптимизации', strategy: 'roi_optimize' },
  { id: 3, campaignId: 4, timestamp: '28 апр 14:18', oldBid: 50, newBid: 55, reason: 'Позиция #5, цель — топ-3', strategy: 'top3' },
  { id: 4, campaignId: 1, timestamp: '28 апр 13:45', oldBid: 40, newBid: 42, reason: 'Конкурент вышел вперёд', strategy: 'top3' },
  { id: 5, campaignId: 3, timestamp: '28 апр 13:30', oldBid: 30, newBid: 32, reason: 'Минимальная ставка для позиции #8 повышена площадкой', strategy: 'min_bid' },
  { id: 6, campaignId: 6, timestamp: '28 апр 13:15', oldBid: 95, newBid: 90, reason: 'DRR ниже целевого, снижение для оптимизации', strategy: 'min_bid' },
  { id: 7, campaignId: 4, timestamp: '28 апр 12:50', oldBid: 48, newBid: 50, reason: 'Позиция упала до #6', strategy: 'top3' },
  { id: 8, campaignId: 2, timestamp: '28 апр 12:30', oldBid: 85, newBid: 80, reason: 'ROI оптимизация — снижение при сохранении позиции', strategy: 'roi_optimize' },
];

const drrTimelineData = [
  { time: '10:00', 'Футболка': 28, 'Кроссовки': 22, 'Худи': 35 },
  { time: '11:00', 'Футболка': 29, 'Кроссовки': 20, 'Худи': 33 },
  { time: '12:00', 'Футболка': 30, 'Кроссовки': 21, 'Худи': 36 },
  { time: '13:00', 'Футболка': 31, 'Кроссовки': 19, 'Худи': 37 },
  { time: '14:00', 'Футболка': 31.3, 'Кроссовки': 19.6, 'Худи': 38 },
  { time: '15:00', 'Футболка': 30.5, 'Кроссовки': 20.2, 'Худи': 37.5 },
];

const spendRevenueData = [
  { time: '10:00', spend: 4200, revenue: 13500 },
  { time: '11:00', spend: 5100, revenue: 16200 },
  { time: '12:00', spend: 4800, revenue: 14800 },
  { time: '13:00', spend: 5500, revenue: 17100 },
  { time: '14:00', spend: 6200, revenue: 19200 },
  { time: '15:00', spend: 5800, revenue: 18000 },
];

// ─── Chart Configs ───────────────────────────────────────────

const drrChartConfig: ChartConfig = {
  'Футболка': { label: 'Футболка "Базовая"', color: '#dc2626' },
  'Кроссовки': { label: 'Кроссовки "Спринт"', color: '#059669' },
  'Худи': { label: 'Худи "Комфорт"', color: '#d97706' },
};

const spendChartConfig: ChartConfig = {
  spend: { label: 'Расход', color: '#dc2626' },
  revenue: { label: 'Выручка', color: '#059669' },
};

// ─── Helpers ─────────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString('ru-RU');

const strategyLabel = (s: BidStrategy) =>
  s === 'top3' ? 'Удержание топ-3' : s === 'min_bid' ? 'Мин. ставка' : 'Оптимизация ROI';

const strategyIcon = (s: BidStrategy) =>
  s === 'top3' ? <Target className="h-4 w-4 text-blue-400" />
  : s === 'min_bid' ? <DollarSign className="h-4 w-4 text-violet-400" />
  : <TrendingUp className="h-4 w-4 text-emerald-400" />;

// ─── Component ───────────────────────────────────────────────

const Bidder: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(300);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleAutoRefresh();
          return 300;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAutoRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const handleToggleEnabled = (id: number) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, enabled: !c.enabled, status: !c.enabled ? 'active' : 'paused' }
          : c
      )
    );
  };

  const handleApplyBid = (id: number) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, currentBid: c.recommendedBid, lastBidUpdate: 'только что' }
          : c
      )
    );
  };

  const handleApplyAllBids = () => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.enabled ? { ...c, currentBid: c.recommendedBid, lastBidUpdate: 'только что' } : c
      )
    );
  };

  const handleStrategyChange = (id: number, strategy: BidStrategy) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, strategy } : c))
    );
  };

  const activeCampaigns = campaigns.filter((c) => c.enabled);
  const alertCampaigns = campaigns.filter((c) => c.status === 'alert');
  const totalSpend = activeCampaigns.reduce((s, c) => s + c.spend, 0);
  const totalRevenue = activeCampaigns.reduce((s, c) => s + c.revenue, 0);
  const avgDrr = totalRevenue > 0 ? ((totalSpend / totalRevenue) * 100) : 0;

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const filteredHistory = selectedCampaign
    ? bidHistoryData.filter((h) => h.campaignId === selectedCampaign)
    : bidHistoryData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Биддер</h1>
          <p className="text-slate-300 dark:text-white/30 mt-1">Автоматическое управление ставками и контроль DRR</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-300 dark:text-white/30">
            <Clock className="h-4 w-4" />
            Обновление через: <span className="font-mono font-medium text-slate-500 dark:text-white/60">{formatCountdown(countdown)}</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleAutoRefresh} disabled={isRefreshing} className="border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 hover:text-slate-500 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.04]">
            {isRefreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Обновить
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-slate-300 dark:text-white/30 uppercase">Активных кампаний</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{activeCampaigns.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-slate-300 dark:text-white/30 uppercase">Общий расход</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{fmt(totalSpend)} ₽</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-slate-300 dark:text-white/30 uppercase">Общая выручка</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{fmt(totalRevenue)} ₽</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-slate-300 dark:text-white/30 uppercase">Средний DRR</p>
            <p className={`text-2xl font-bold mt-1 ${avgDrr > 30 ? 'text-red-400' : 'text-emerald-400'}`}>{avgDrr.toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-slate-300 dark:text-white/30 uppercase">Алерты DRR</p>
            <p className="text-2xl font-bold text-amber-400 mt-1 flex items-center gap-1">
              <AlertTriangle className="h-5 w-5" />
              {alertCampaigns.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* DRR Alerts */}
      {alertCampaigns.length > 0 && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-amber-400 text-sm">Превышение целевого DRR</p>
                <div className="mt-2 space-y-1">
                  {alertCampaigns.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 text-sm">
                      <span className="font-medium text-slate-600 dark:text-white/70">{c.name}</span>
                      <Badge variant="destructive" className="text-xs">DRR {c.drr}% / цель {c.targetDrr}%</Badge>
                      <Button variant="outline" size="sm" className="h-6 text-xs border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 hover:text-slate-500 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.04]" onClick={() => handleApplyBid(c.id)}>
                        Применить рекомендованную ставку
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="campaigns" className="space-y-6">
        <TabsList className="bg-white/[0.04] border border-slate-200 dark:border-white/[0.06]">
          <TabsTrigger value="campaigns" className="gap-2 text-slate-400 dark:text-white/40 data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400">
            <Target className="h-4 w-4" />
            Кампании
          </TabsTrigger>
          <TabsTrigger value="drr" className="gap-2 text-slate-400 dark:text-white/40 data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400">
            <Gauge className="h-4 w-4" />
            DRR мониторинг
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2 text-slate-400 dark:text-white/40 data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400">
            <History className="h-4 w-4" />
            История ставок
          </TabsTrigger>
        </TabsList>

        {/* ─── Campaigns Tab ───────────────────────────────── */}
        <TabsContent value="campaigns" className="space-y-4">
          {/* Bulk Actions */}
          <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-slate-300 dark:text-white/30" />
                  <span className="text-sm font-medium text-slate-400 dark:text-white/50">Массовые действия</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleApplyAllBids} className="border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 hover:text-slate-500 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.04]">
                    <Zap className="mr-2 h-4 w-4" />
                    Применить все рекомендованные ставки
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Campaign Table */}
          <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200 dark:border-white/[0.06] hover:bg-transparent">
                      <TableHead className="text-xs text-slate-300 dark:text-white/30 w-10">Вкл</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30">Кампания</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30">МП</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30">Стратегия</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30 text-right">Ставка</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30 text-right">Реком.</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30 text-center">Позиция</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30 text-right">DRR</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30 text-right">Расход</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30 text-right">Выручка</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30">Статус</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30 text-center">⚙</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((c) => {
                      const isExpanded = expandedRow === c.id;
                      const drrOver = c.drr > c.targetDrr;
                      return (
                        <React.Fragment key={c.id}>
                          <TableRow className={`${c.enabled ? '' : 'opacity-50'} border-white/[0.04] hover:bg-white/[0.02]`}>
                            <TableCell>
                              <Switch checked={c.enabled} onCheckedChange={() => handleToggleEnabled(c.id)} />
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-white/70">{c.name}</p>
                                <p className="text-xs text-slate-300 dark:text-white/20 font-mono">{c.sku}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40">
                                {c.marketplace === 'Wildberries' ? 'WB' : c.marketplace === 'Ozon' ? 'OZ' : 'ЯМ'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Select value={c.strategy} onValueChange={(v) => handleStrategyChange(c.id, v as BidStrategy)}>
                                <SelectTrigger className="h-7 text-xs w-[140px] bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-white/60">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="top3">
                                    <span className="flex items-center gap-1.5"><Target className="h-3 w-3 text-blue-400" />Топ-3</span>
                                  </SelectItem>
                                  <SelectItem value="min_bid">
                                    <span className="flex items-center gap-1.5"><DollarSign className="h-3 w-3 text-violet-400" />Мин. ставка</span>
                                  </SelectItem>
                                  <SelectItem value="roi_optimize">
                                    <span className="flex items-center gap-1.5"><TrendingUp className="h-3 w-3 text-emerald-400" />ROI оптимизация</span>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-sm text-right font-medium text-slate-500 dark:text-white/60">{c.currentBid} ₽</TableCell>
                            <TableCell className="text-sm text-right">
                              <span className={`font-semibold ${c.recommendedBid > c.currentBid ? 'text-red-400' : c.recommendedBid < c.currentBid ? 'text-emerald-400' : 'text-slate-300 dark:text-white/30'}`}>
                                {c.recommendedBid} ₽
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant={c.position <= 3 ? 'default' : 'secondary'} className={`text-xs ${c.position <= 3 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40'}`}>
                                #{c.position}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-right">
                              <span className={`font-medium ${drrOver ? 'text-red-400' : 'text-emerald-400'}`}>
                                {c.drr}%
                              </span>
                              <span className="text-xs text-slate-300 dark:text-white/20"> / {c.targetDrr}%</span>
                            </TableCell>
                            <TableCell className="text-sm text-right text-red-400">{fmt(c.spend)} ₽</TableCell>
                            <TableCell className="text-sm text-right text-emerald-400">{fmt(c.revenue)} ₽</TableCell>
                            <TableCell>
                              {c.status === 'active' && (
                                <Badge className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10">
                                  <Play className="h-3 w-3 mr-1" />Активна
                                </Badge>
                              )}
                              {c.status === 'paused' && (
                                <Badge className="text-xs bg-white/[0.04] text-slate-400 dark:text-white/40 border-slate-200 dark:border-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.04]">
                                  <Pause className="h-3 w-3 mr-1" />Пауза
                                </Badge>
                              )}
                              {c.status === 'alert' && (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertTriangle className="h-3 w-3 mr-1" />DRR!
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-300 dark:text-white/30 hover:text-slate-500 dark:text-white/60" onClick={() => setExpandedRow(isExpanded ? null : c.id)}>
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                            </TableCell>
                          </TableRow>
                          {/* Expanded Details */}
                          {isExpanded && (
                            <TableRow className="bg-white/[0.02]">
                              <TableCell colSpan={12} className="p-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                  <div>
                                    <p className="text-xs text-slate-300 dark:text-white/30">Показы</p>
                                    <p className="text-sm font-medium text-slate-500 dark:text-white/60">{fmt(c.impressions)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-300 dark:text-white/30">Клики</p>
                                    <p className="text-sm font-medium text-slate-500 dark:text-white/60">{fmt(c.clicks)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-300 dark:text-white/30">CTR</p>
                                    <p className="text-sm font-medium text-slate-500 dark:text-white/60">{c.ctr}%</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-300 dark:text-white/30">Целевая позиция</p>
                                    <p className="text-sm font-medium text-slate-500 dark:text-white/60">#{c.targetPosition}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex-1">
                                    <p className="text-xs text-slate-300 dark:text-white/30 mb-1">DRR: {c.drr}% (цель: {c.targetDrr}%)</p>
                                    <Progress
                                      value={(c.drr / (c.targetDrr * 1.5)) * 100}
                                      className="h-2"
                                    />
                                  </div>
                                  <Button size="sm" onClick={() => handleApplyBid(c.id)} disabled={!c.enabled} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                                    <Zap className="mr-2 h-4 w-4" />
                                    Применить {c.recommendedBid} ₽
                                  </Button>
                                </div>
                                <div className="mt-3 p-2.5 rounded-md bg-blue-500/10 text-blue-400 text-xs flex items-center gap-2 border border-blue-500/20">
                                  {strategyIcon(c.strategy)}
                                  Стратегия «{strategyLabel(c.strategy)}»:
                                  {c.strategy === 'top3' && ' автоматически повышает ставку для удержания позиции в топ-3.'}
                                  {c.strategy === 'min_bid' && ' устанавливает минимальную ставку для заданной позиции.'}
                                  {c.strategy === 'roi_optimize' && ' оптимизирует ставку для максимизации ROI при контроле DRR.'}
                                </div>
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
        </TabsContent>

        {/* ─── DRR Monitoring Tab ──────────────────────────── */}
        <TabsContent value="drr" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {campaigns.filter((c) => c.enabled).map((c) => {
              const drrOver = c.drr > c.targetDrr;
              const drrPct = Math.min((c.drr / (c.targetDrr * 1.5)) * 100, 100);
              return (
                <Card key={c.id} className={`bg-white dark:bg-[#0d0d14] ${drrOver ? 'border-red-500/20' : 'border-slate-200 dark:border-white/[0.06]'}`}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-slate-600 dark:text-white/70">{c.name}</p>
                      {drrOver && <AlertTriangle className="h-4 w-4 text-red-400" />}
                    </div>
                    <div className="flex items-end gap-2 mb-2">
                      <span className={`text-3xl font-bold ${drrOver ? 'text-red-400' : 'text-emerald-400'}`}>
                        {c.drr}%
                      </span>
                      <span className="text-sm text-slate-300 dark:text-white/20 mb-1">/ {c.targetDrr}%</span>
                    </div>
                    <Progress value={drrPct} className="h-2 mb-3" />
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-slate-300 dark:text-white/30">Расход</p>
                        <p className="font-medium text-red-400">{fmt(c.spend)} ₽</p>
                      </div>
                      <div>
                        <p className="text-slate-300 dark:text-white/30">Выручка</p>
                        <p className="font-medium text-emerald-400">{fmt(c.revenue)} ₽</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* DRR Timeline */}
          <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">DRR по времени (кампании с алертами)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={drrChartConfig} className="h-[280px] w-full">
                <LineChart data={drrTimelineData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#4a4a5a" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#4a4a5a" domain={[15, 45]} unit="%" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="Футболка" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} name="Футболка" />
                  <Line type="monotone" dataKey="Кроссовки" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} name="Кроссовки" />
                  <Line type="monotone" dataKey="Худи" stroke="#d97706" strokeWidth={2} dot={{ r: 3 }} name="Худи" />
                </LineChart>
              </ChartContainer>
              <div className="flex items-center justify-center gap-4 mt-2 text-xs text-slate-300 dark:text-white/30">
                <span className="flex items-center gap-1"><span className="w-8 h-0.5 bg-red-500 inline-block" /> Футболка (цель 30%)</span>
                <span className="flex items-center gap-1"><span className="w-8 h-0.5 bg-emerald-500 inline-block" /> Кроссовки (цель 25%)</span>
                <span className="flex items-center gap-1"><span className="w-8 h-0.5 bg-amber-500 inline-block" /> Худи (цель 30%)</span>
              </div>
            </CardContent>
          </Card>

          {/* Spend vs Revenue */}
          <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Расход vs Выручка (все кампании)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={spendChartConfig} className="h-[250px] w-full">
                <AreaChart data={spendRevenueData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#4a4a5a" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#4a4a5a" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="revenue" stroke="#059669" fill="url(#fillRevenue)" strokeWidth={2} name="revenue" />
                  <Area type="monotone" dataKey="spend" stroke="#dc2626" fill="url(#fillSpend)" strokeWidth={2} name="spend" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Bid History Tab ─────────────────────────────── */}
        <TabsContent value="history" className="space-y-4">
          <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">История изменений ставок</CardTitle>
              <Select value={selectedCampaign?.toString() || 'all'} onValueChange={(v) => setSelectedCampaign(v === 'all' ? null : Number(v))}>
                <SelectTrigger className="w-[200px] h-8 text-xs bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-white/60">
                  <SelectValue placeholder="Все кампании" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все кампании</SelectItem>
                  {campaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="max-h-[500px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200 dark:border-white/[0.06] hover:bg-transparent">
                      <TableHead className="text-xs text-slate-300 dark:text-white/30">Время</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30">Кампания</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30">Стратегия</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30 text-right">Старая ставка</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30 text-right">Новая ставка</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30 text-right">Δ</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30">Причина</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistory.map((h) => {
                      const campaign = campaigns.find((c) => c.id === h.campaignId);
                      const diff = h.newBid - h.oldBid;
                      return (
                        <TableRow key={h.id} className="border-white/[0.04] hover:bg-white/[0.02]">
                          <TableCell className="text-xs text-slate-300 dark:text-white/20 font-mono">{h.timestamp}</TableCell>
                          <TableCell className="text-sm font-medium text-slate-600 dark:text-white/70">{campaign?.name || '—'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs flex items-center gap-1 w-fit border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40">
                              {strategyIcon(h.strategy)}
                              {strategyLabel(h.strategy)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-right text-slate-400 dark:text-white/40">{h.oldBid} ₽</TableCell>
                          <TableCell className="text-sm text-right font-medium text-slate-500 dark:text-white/60">{h.newBid} ₽</TableCell>
                          <TableCell className="text-sm text-right">
                            <span className={`inline-flex items-center gap-0.5 font-medium ${diff > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                              {diff > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                              {Math.abs(diff)} ₽
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-slate-300 dark:text-white/30 max-w-[250px]">{h.reason}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Bidder;