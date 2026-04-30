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
import {
  Search,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Package,
  BarChart3,
  RefreshCw,
  ArrowUpDown,
  ExternalLink,
  Loader2,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
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

// ─── Mock Data ───────────────────────────────────────────────

const competitorSearchResults = [
  {
    id: 1,
    article: 'WB-12847256',
    name: 'Футболка мужская базовая хлопок',
    brand: 'FashionLine',
    price: 890,
    ourPrice: 950,
    diff: -60,
    rating: 4.6,
    reviews: 1243,
    sales: 3200,
    stock: 580,
    marketplace: 'Wildberries',
  },
  {
    id: 2,
    article: 'OZ-98234112',
    name: 'Футболка мужская базовая белая',
    brand: 'StylePro',
    price: 920,
    ourPrice: 950,
    diff: -30,
    rating: 4.4,
    reviews: 876,
    sales: 2100,
    stock: 420,
    marketplace: 'Ozon',
  },
  {
    id: 3,
    article: 'WB-23456789',
    name: 'Футболка базовая унисекс',
    brand: 'BasicWear',
    price: 790,
    ourPrice: 950,
    diff: -160,
    rating: 4.3,
    reviews: 2341,
    sales: 5400,
    stock: 890,
    marketplace: 'Wildberries',
  },
  {
    id: 4,
    article: 'YM-34567890',
    name: 'Футболка хлопок премиум',
    brand: 'CottonKing',
    price: 1050,
    ourPrice: 950,
    diff: 100,
    rating: 4.8,
    reviews: 567,
    sales: 1500,
    stock: 310,
    marketplace: 'Ozon',
  },
  {
    id: 5,
    article: 'WB-45678901',
    name: 'Футболка мужская slim fit',
    brand: 'UrbanStyle',
    price: 870,
    ourPrice: 950,
    diff: -80,
    rating: 4.5,
    reviews: 1890,
    sales: 4100,
    stock: 650,
    marketplace: 'Wildberries',
  },
];

const priceHistoryData = [
  { date: '22 апр', 'FashionLine': 920, 'StylePro': 950, 'BasicWear': 820, ourPrice: 950 },
  { date: '23 апр', 'FashionLine': 910, 'StylePro': 940, 'BasicWear': 810, ourPrice: 950 },
  { date: '24 апр', 'FashionLine': 890, 'StylePro': 930, 'BasicWear': 800, ourPrice: 950 },
  { date: '25 апр', 'FashionLine': 900, 'StylePro': 920, 'BasicWear': 790, ourPrice: 950 },
  { date: '26 апр', 'FashionLine': 890, 'StylePro': 920, 'BasicWear': 790, ourPrice: 950 },
  { date: '27 апр', 'FashionLine': 890, 'StylePro': 920, 'BasicWear': 790, ourPrice: 950 },
  { date: '28 апр', 'FashionLine': 890, 'StylePro': 920, 'BasicWear': 790, ourPrice: 950 },
];

const competitorSalesData = [
  { date: '22 апр', 'FashionLine': 145, 'StylePro': 98, 'BasicWear': 230 },
  { date: '23 апр', 'FashionLine': 132, 'StylePro': 105, 'BasicWear': 245 },
  { date: '24 апр', 'FashionLine': 158, 'StylePro': 112, 'BasicWear': 260 },
  { date: '25 апр', 'FashionLine': 170, 'StylePro': 95, 'BasicWear': 275 },
  { date: '26 апр', 'FashionLine': 143, 'StylePro': 108, 'BasicWear': 240 },
  { date: '27 апр', 'FashionLine': 165, 'StylePro': 120, 'BasicWear': 290 },
  { date: '28 апр', 'FashionLine': 155, 'StylePro': 110, 'BasicWear': 255 },
];

const stockData = [
  { competitor: 'FashionLine', stock: 580, warehouse: 'Коледино', lastUpdate: '2 мин назад' },
  { competitor: 'StylePro', stock: 420, warehouse: 'Хоругвино', lastUpdate: '5 мин назад' },
  { competitor: 'BasicWear', stock: 890, warehouse: 'Электросталь', lastUpdate: '1 мин назад' },
  { competitor: 'CottonKing', stock: 310, warehouse: 'Казань', lastUpdate: '8 мин назад' },
  { competitor: 'UrbanStyle', stock: 650, warehouse: 'Подольск', lastUpdate: '3 мин назад' },
];

const aiAnalogs = [
  {
    ourSku: 'Футболка "Базовая"',
    analogName: 'Футболка мужская базовая хлопок',
    brand: 'FashionLine',
    price: 890,
    similarity: 94,
    recommendation: 'Прямой конкурент. Рекомендуется снизить цену до 890₽ или усилить УТП (доставка, бонусы).',
  },
  {
    ourSku: 'Футболка "Базовая"',
    analogName: 'Футболка базовая унисекс',
    brand: 'BasicWear',
    price: 790,
    similarity: 87,
    recommendation: 'Агрессивный дискаунтер. Не стоит вступать в ценовую войну — сфокусируйтесь на качестве.',
  },
  {
    ourSku: 'Кроссовки "Спринт"',
    analogName: 'Кроссовки беговые Air Max',
    brand: 'SportZone',
    price: 2450,
    similarity: 82,
    recommendation: 'Цена выше нашей. Возможность повысить маржу при сохранении объёмов.',
  },
  {
    ourSku: 'Рюкзак "Ультра"',
    analogName: 'Рюкзак городской TravelPro',
    brand: 'BagMaster',
    price: 1890,
    similarity: 78,
    recommendation: 'Схожий функционал, но наш бренд сильнее. Можно держать текущую цену.',
  },
];

// ─── Chart Configs ───────────────────────────────────────────

const priceChartConfig: ChartConfig = {
  FashionLine: { label: 'FashionLine', color: '#2563eb' },
  StylePro: { label: 'StylePro', color: '#7c3aed' },
  BasicWear: { label: 'BasicWear', color: '#f59e0b' },
  ourPrice: { label: 'Наша цена', color: '#059669' },
};

const salesChartConfig: ChartConfig = {
  FashionLine: { label: 'FashionLine', color: '#2563eb' },
  StylePro: { label: 'StylePro', color: '#7c3aed' },
  BasicWear: { label: 'BasicWear', color: '#f59e0b' },
};

// ─── Helpers ─────────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString('ru-RU');

// ─── Component ───────────────────────────────────────────────

const CompetitorAnalytics: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'article' | 'name'>('name');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiResults, setShowAiResults] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setHasSearched(true);
    }, 1200);
  };

  const handleAiSearch = () => {
    setIsAiLoading(true);
    setTimeout(() => {
      setIsAiLoading(false);
      setShowAiResults(true);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Аналитика конкурентов</h1>
        <p className="text-slate-300 dark:text-white/30 mt-1">Мониторинг цен, продаж и остатков конкурентов</p>
      </div>

      {/* Search Bar */}
      <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
        <CardContent className="p-5">
          <div className="flex gap-3">
            <Select value={searchType} onValueChange={(v) => setSearchType(v as 'article' | 'name')}>
              <SelectTrigger className="w-[160px] bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-white/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="article">По артикулу</SelectItem>
                <SelectItem value="name">По названию</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 dark:text-white/20" />
              <Input
                placeholder={searchType === 'article' ? 'Введите артикул товара...' : 'Введите название товара...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white placeholder:text-slate-900 dark:text-white/15"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              {isSearching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Найти
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="prices" className="space-y-6">
        <TabsList className="bg-white/[0.04] border border-slate-200 dark:border-white/[0.06]">
          <TabsTrigger value="prices" className="gap-2 text-slate-400 dark:text-white/40 data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400">
            <TrendingDown className="h-4 w-4" />
            Цены
          </TabsTrigger>
          <TabsTrigger value="sales" className="gap-2 text-slate-400 dark:text-white/40 data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400">
            <BarChart3 className="h-4 w-4" />
            Продажи
          </TabsTrigger>
          <TabsTrigger value="stock" className="gap-2 text-slate-400 dark:text-white/40 data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400">
            <Package className="h-4 w-4" />
            Остатки
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2 text-slate-400 dark:text-white/40 data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400">
            <Sparkles className="h-4 w-4" />
            ИИ-аналоги
          </TabsTrigger>
        </TabsList>

        {/* ─── Prices Tab ──────────────────────────────────── */}
        <TabsContent value="prices" className="space-y-6">
          {/* Competitor Price Table */}
          <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Цены конкурентов</CardTitle>
              <Button variant="outline" size="sm" className="border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 hover:text-slate-500 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.04]">
                <RefreshCw className="mr-2 h-4 w-4" />
                Обновить
              </Button>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200 dark:border-white/[0.06] hover:bg-transparent">
                      <TableHead className="text-xs text-slate-300 dark:text-white/30">Артикул</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30">Товар</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30">Бренд</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30">МП</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30 text-right">Цена конкурента</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30 text-right">Наша цена</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30 text-right">Разница</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30 text-right">Рейтинг</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30 text-right">Отзывы</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {competitorSearchResults.map((row) => (
                      <TableRow key={row.id} className="border-white/[0.04] hover:bg-white/[0.02]">
                        <TableCell className="text-xs font-mono text-slate-900 dark:text-white/25">{row.article}</TableCell>
                        <TableCell className="text-sm font-medium text-slate-600 dark:text-white/70 max-w-[200px] truncate">{row.name}</TableCell>
                        <TableCell className="text-sm text-slate-400 dark:text-white/40">{row.brand}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40">
                            {row.marketplace === 'Wildberries' ? 'WB' : row.marketplace === 'Ozon' ? 'OZ' : 'ЯМ'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-right font-medium text-slate-500 dark:text-white/60">{row.price} ₽</TableCell>
                        <TableCell className="text-sm text-right text-slate-400 dark:text-white/40">{row.ourPrice} ₽</TableCell>
                        <TableCell className="text-sm text-right">
                          <span className={`font-medium ${row.diff < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {row.diff > 0 ? '+' : ''}{row.diff} ₽
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-right">
                          <span className="flex items-center justify-end gap-1">
                            <span className="text-amber-400">★</span>
                            <span className="text-slate-400 dark:text-white/50">{row.rating}</span>
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-right text-slate-900 dark:text-white/25">{fmt(row.reviews)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Price History Chart */}
          <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">История цен конкурентов</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={priceChartConfig} className="h-[300px] w-full">
                <AreaChart data={priceHistoryData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillOurPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#4a4a5a" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#4a4a5a" domain={[700, 1000]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="ourPrice" stroke="#059669" fill="url(#fillOurPrice)" strokeWidth={2.5} strokeDasharray="8 4" name="ourPrice" />
                  <Area type="monotone" dataKey="FashionLine" stroke="#2563eb" fill="none" strokeWidth={2} name="FashionLine" />
                  <Area type="monotone" dataKey="StylePro" stroke="#7c3aed" fill="none" strokeWidth={2} name="StylePro" />
                  <Area type="monotone" dataKey="BasicWear" stroke="#f59e0b" fill="none" strokeWidth={2} name="BasicWear" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Sales Tab ───────────────────────────────────── */}
        <TabsContent value="sales" className="space-y-6">
          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
              <CardContent className="p-5">
                <p className="text-xs font-medium text-slate-300 dark:text-white/30 uppercase">Лидер продаж</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">BasicWear</p>
                <p className="text-xs text-slate-300 dark:text-white/20 mt-1">~255 шт/день</p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
              <CardContent className="p-5">
                <p className="text-xs font-medium text-slate-300 dark:text-white/30 uppercase">Наша позиция</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">4 из 5</p>
                <p className="text-xs text-amber-400 mt-1">Ниже среднего по нише</p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
              <CardContent className="p-5">
                <p className="text-xs font-medium text-slate-300 dark:text-white/30 uppercase">Потенциал роста</p>
                <p className="text-xl font-bold text-emerald-400 mt-1">+38%</p>
                <p className="text-xs text-slate-300 dark:text-white/20 mt-1">При корректировке цены</p>
              </CardContent>
            </Card>
          </div>

          {/* Sales Chart */}
          <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Продажи конкурентов (шт/день)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={salesChartConfig} className="h-[300px] w-full">
                <BarChart data={competitorSalesData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#4a4a5a" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#4a4a5a" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="FashionLine" fill="#2563eb" radius={[2, 2, 0, 0]} name="FashionLine" />
                  <Bar dataKey="StylePro" fill="#7c3aed" radius={[2, 2, 0, 0]} name="StylePro" />
                  <Bar dataKey="BasicWear" fill="#f59e0b" radius={[2, 2, 0, 0]} name="BasicWear" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Stock Tab ───────────────────────────────────── */}
        <TabsContent value="stock" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
              <CardContent className="p-5">
                <p className="text-xs font-medium text-slate-300 dark:text-white/30 uppercase">Макс. остаток</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">BasicWear — 890 шт</p>
                <p className="text-xs text-slate-300 dark:text-white/20 mt-1">Электросталь</p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
              <CardContent className="p-5">
                <p className="text-xs font-medium text-slate-300 dark:text-white/30 uppercase">Мин. остаток</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">CottonKing — 310 шт</p>
                <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Возможен дефицит
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Остатки на складах конкурентов</CardTitle>
              <Button variant="outline" size="sm" className="border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 hover:text-slate-500 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.04]">
                <RefreshCw className="mr-2 h-4 w-4" />
                Обновить
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 dark:border-white/[0.06] hover:bg-transparent">
                    <TableHead className="text-xs text-slate-300 dark:text-white/30">Конкурент</TableHead>
                    <TableHead className="text-xs text-slate-300 dark:text-white/30 text-right">Остаток</TableHead>
                    <TableHead className="text-xs text-slate-300 dark:text-white/30">Склад</TableHead>
                    <TableHead className="text-xs text-slate-300 dark:text-white/30 text-right">Обновлено</TableHead>
                    <TableHead className="text-xs text-slate-300 dark:text-white/30 text-right">Дней до 0</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockData.map((row, i) => {
                    const daysLeft = Math.round(row.stock / (competitorSalesData[competitorSalesData.length - 1][row.competitor as keyof typeof competitorSalesData[0]] as number || 100));
                    return (
                      <TableRow key={i} className="border-white/[0.04] hover:bg-white/[0.02]">
                        <TableCell className="text-sm font-medium text-slate-600 dark:text-white/70">{row.competitor}</TableCell>
                        <TableCell className="text-sm text-right">
                          <span className={`font-medium ${row.stock < 400 ? 'text-amber-400' : 'text-slate-500 dark:text-white/60'}`}>
                            {fmt(row.stock)} шт
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-slate-400 dark:text-white/40">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-300 dark:text-white/20" />
                            {row.warehouse}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-right text-slate-900 dark:text-white/25">{row.lastUpdate}</TableCell>
                        <TableCell className="text-sm text-right">
                          <Badge variant={daysLeft < 5 ? 'destructive' : daysLeft < 10 ? 'secondary' : 'outline'} className={`text-xs ${daysLeft >= 10 ? 'border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40' : ''}`}>
                            ~{daysLeft} дн.
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── AI Analogs Tab ──────────────────────────────── */}
        <TabsContent value="ai" className="space-y-6">
          <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-400" />
                ИИ-поиск аналогов
              </CardTitle>
              <p className="text-sm text-slate-300 dark:text-white/30 mt-1">
                Нейросеть найдёт товары-аналоги ваших SKU у конкурентов и даст рекомендации по ценообразованию
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 mb-6">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[200px] bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-white/60">
                    <SelectValue placeholder="Выберите SKU" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все SKU</SelectItem>
                    <SelectItem value="tshirt">Футболка "Базовая"</SelectItem>
                    <SelectItem value="sneakers">Кроссовки "Спринт"</SelectItem>
                    <SelectItem value="backpack">Рюкзак "Ультра"</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAiSearch} disabled={isAiLoading} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  {isAiLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Найти аналоги
                </Button>
              </div>

              {showAiResults && (
                <div className="space-y-4">
                  {aiAnalogs.map((analog, i) => (
                    <div key={i} className="p-4 rounded-lg border border-slate-200 dark:border-white/[0.06] hover:border-violet-500/30 transition-colors bg-white/[0.02]">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs bg-violet-500/10 text-violet-400 border-violet-500/20">
                              Наш SKU: {analog.ourSku}
                            </Badge>
                            <ArrowUpDown className="h-3 w-3 text-slate-300 dark:text-white/20" />
                            <span className="text-sm font-medium text-slate-600 dark:text-white/70">{analog.analogName}</span>
                          </div>
                          <p className="text-xs text-slate-300 dark:text-white/30 mb-2">Бренд: {analog.brand} · Цена: {analog.price} ₽</p>
                          <div className="flex items-start gap-2 p-2.5 rounded-md bg-violet-500/5 border border-violet-500/10">
                            <Sparkles className="h-4 w-4 text-violet-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-slate-400 dark:text-white/50">{analog.recommendation}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge className={`text-xs ${analog.similarity >= 90 ? 'bg-red-500/10 text-red-400 border-red-500/20' : analog.similarity >= 80 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                            Сходство: {analog.similarity}%
                          </Badge>
                          <Button variant="ghost" size="sm" className="text-xs text-slate-300 dark:text-white/30 hover:text-slate-400 dark:text-white/50">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Открыть
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!showAiResults && !isAiLoading && (
                <div className="text-center py-12 text-slate-300 dark:text-white/20">
                  <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Нажмите «Найти аналоги» для запуска ИИ-анализа</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompetitorAnalytics;