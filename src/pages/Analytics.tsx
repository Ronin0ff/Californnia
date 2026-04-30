import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  PieChart as PieIcon,
  MapPin,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Package,
  ArrowUpDown,
  Layers,
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
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis,
  Legend,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';

// ─── Mock Data ───────────────────────────────────────────────

const abcXyzData = [
  { sku: 'Футболка "Базовая"', revenue: 1240000, cv: 8.2, abc: 'A', xyz: 'X', category: 'AX' },
  { sku: 'Кроссовки "Спринт"', revenue: 980000, cv: 12.1, abc: 'A', xyz: 'X', category: 'AX' },
  { sku: 'Рюкзак "Ультра"', revenue: 870000, cv: 15.4, abc: 'A', xyz: 'Y', category: 'AY' },
  { sku: 'Худи "Комфорт"', revenue: 720000, cv: 22.3, abc: 'B', xyz: 'Y', category: 'BY' },
  { sku: 'Джинсы "Классик"', revenue: 650000, cv: 18.7, abc: 'B', xyz: 'X', category: 'BX' },
  { sku: 'Куртка "Ветер"', revenue: 540000, cv: 35.2, abc: 'B', xyz: 'Z', category: 'BZ' },
  { sku: 'Шорты "Лето"', revenue: 420000, cv: 28.9, abc: 'B', xyz: 'Y', category: 'BY' },
  { sku: 'Носки "Премиум"', revenue: 380000, cv: 9.5, abc: 'C', xyz: 'X', category: 'CX' },
  { sku: 'Ремень "Стиль"', revenue: 310000, cv: 42.1, abc: 'C', xyz: 'Z', category: 'CZ' },
  { sku: 'Шапка "Зима"', revenue: 240000, cv: 38.6, abc: 'C', xyz: 'Z', category: 'CZ' },
  { sku: 'Перчатки "Тепло"', revenue: 220000, cv: 31.4, abc: 'C', xyz: 'Z', category: 'CZ' },
  { sku: 'Платок "Шёлк"', revenue: 230000, cv: 45.8, abc: 'C', xyz: 'Z', category: 'CZ' },
];

const abcXyzMatrix = [
  { x: 'X', a: 2, b: 1, c: 1 },
  { x: 'Y', a: 1, b: 2, c: 0 },
  { x: 'Z', a: 0, b: 1, c: 4 },
];

const returnsData = [
  { month: 'Янв', returns: 89, returnRate: 4.2, reasonDefect: 28, reasonSize: 35, reasonOther: 26 },
  { month: 'Фев', returns: 76, returnRate: 3.8, reasonDefect: 22, reasonSize: 30, reasonOther: 24 },
  { month: 'Мар', returns: 102, returnRate: 4.6, reasonDefect: 34, reasonSize: 40, reasonOther: 28 },
  { month: 'Апр', returns: 95, returnRate: 4.1, reasonDefect: 30, reasonSize: 38, reasonOther: 27 },
];

const returnsBySku = [
  { sku: 'Кроссовки "Спринт"', returns: 34, rate: 6.8, mainReason: 'Размер не подошёл' },
  { sku: 'Куртка "Ветер"', returns: 28, rate: 5.9, mainReason: 'Брак' },
  { sku: 'Джинсы "Классик"', returns: 22, rate: 4.3, mainReason: 'Размер не подошёл' },
  { sku: 'Худи "Комфорт"', returns: 18, rate: 3.2, mainReason: 'Цвет отличается' },
  { sku: 'Футболка "Базовая"', returns: 15, rate: 2.1, mainReason: 'Брак' },
];

const returnReasons = [
  { name: 'Размер не подошёл', value: 38, color: '#2563eb' },
  { name: 'Брак / дефект', value: 25, color: '#dc2626' },
  { name: 'Цвет отличается', value: 15, color: '#f59e0b' },
  { name: 'Не тот товар', value: 12, color: '#7c3aed' },
  { name: 'Другое', value: 10, color: '#64748b' },
];

const geoRegionData = [
  { region: 'Москва', revenue: 2360000, orders: 1180, avgCheck: 2000, growth: 12.3 },
  { region: 'Санкт-Петербург', revenue: 1018000, orders: 509, avgCheck: 2000, growth: 8.7 },
  { region: 'Краснодарский край', revenue: 720000, orders: 360, avgCheck: 2000, growth: 15.2 },
  { region: 'Свердловская обл.', revenue: 596000, orders: 298, avgCheck: 2000, growth: 6.4 },
  { region: 'Новосибирская обл.', revenue: 563000, orders: 282, avgCheck: 1996, growth: 9.1 },
  { region: 'Татарстан', revenue: 489000, orders: 245, avgCheck: 1996, growth: 11.8 },
  { region: 'Нижегородская обл.', revenue: 397000, orders: 199, avgCheck: 1995, growth: 7.3 },
  { region: 'Самарская обл.', revenue: 339000, orders: 170, avgCheck: 1994, growth: 5.6 },
  { region: 'Ростовская обл.', revenue: 323000, orders: 162, avgCheck: 1994, growth: 10.4 },
  { region: 'Приморский край', revenue: 290000, orders: 145, avgCheck: 2000, growth: 18.9 },
];

const brandData = [
  { brand: 'ProfitPilot Original', revenue: 3450000, profit: 931500, margin: 27.0, skus: 42 },
  { brand: 'Urban Style', revenue: 2180000, profit: 523200, margin: 24.0, skus: 28 },
  { brand: 'TechWear Pro', revenue: 1650000, profit: 478500, margin: 29.0, skus: 18 },
  { brand: 'EcoLine', revenue: 890000, profit: 186900, margin: 21.0, skus: 15 },
  { brand: 'Premium Collection', revenue: 720000, profit: 194400, margin: 27.0, skus: 8 },
];

const categoryData = [
  { category: 'Одежда', revenue: 4120000, share: 35, margin: 26.5 },
  { category: 'Обувь', revenue: 2890000, share: 24.6, margin: 28.1 },
  { category: 'Аксессуары', revenue: 1980000, share: 16.9, margin: 32.4 },
  { category: 'Сумки', revenue: 1450000, share: 12.4, margin: 24.8 },
  { category: 'Головные уборы', revenue: 780000, share: 6.7, margin: 19.3 },
  { category: 'Спорт', revenue: 570000, share: 4.9, margin: 22.1 },
];

const categoryRadarData = [
  { subject: 'Выручка', Одежда: 85, Обувь: 72, Аксессуары: 55 },
  { subject: 'Маржа', Одежда: 65, Обувь: 70, Аксессуары: 82 },
  { subject: 'Рост', Одежда: 58, Обувь: 64, Аксессуары: 75 },
  { subject: 'Оборач.', Одежда: 72, Обувь: 60, Аксессуары: 88 },
  { subject: 'Лояльн.', Одежда: 68, Обувь: 75, Аксессуары: 62 },
];

// ─── Chart Configs ───────────────────────────────────────────

const returnsChartConfig: ChartConfig = {
  returns: { label: 'Возвраты', color: '#dc2626' },
  returnRate: { label: '% возвратов', color: '#f59e0b' },
};

const returnReasonConfig: ChartConfig = {
  'Размер не подошёл': { label: 'Размер не подошёл', color: '#2563eb' },
  'Брак / дефект': { label: 'Брак / дефект', color: '#dc2626' },
  'Цвет отличается': { label: 'Цвет отличается', color: '#f59e0b' },
  'Не тот товар': { label: 'Не тот товар', color: '#7c3aed' },
  'Другое': { label: 'Другое', color: '#64748b' },
};

const brandChartConfig: ChartConfig = {
  revenue: { label: 'Выручка', color: '#2563eb' },
  profit: { label: 'Прибыль', color: '#059669' },
};

const categoryPieConfig: ChartConfig = {
  'Одежда': { label: 'Одежда', color: '#2563eb' },
  'Обувь': { label: 'Обувь', color: '#7c3aed' },
  'Аксессуары': { label: 'Аксессуары', color: '#059669' },
  'Сумки': { label: 'Сумки', color: '#f59e0b' },
  'Головные уборы': { label: 'Головные уборы', color: '#ec4899' },
  'Спорт': { label: 'Спорт', color: '#64748b' },
};

const radarConfig: ChartConfig = {
  Одежда: { label: 'Одежда', color: '#2563eb' },
  Обувь: { label: 'Обувь', color: '#7c3aed' },
  Аксессуары: { label: 'Аксессуары', color: '#059669' },
};

const scatterConfig: ChartConfig = {
  revenue: { label: 'Выручка', color: '#2563eb' },
};

// ─── Helpers ─────────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString('ru-RU');
const fmtK = (n: number) =>
  n >= 1000000 ? `${(n / 1000000).toFixed(1)}М` : n >= 1000 ? `${(n / 1000).toFixed(0)}К` : fmt(n);

const getCategoryColor = (cat: string) => {
  if (cat.startsWith('A')) return cat.endsWith('X') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  if (cat.startsWith('B')) return cat.endsWith('X') ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  return cat.endsWith('Z') ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-white/[0.04] text-slate-400 dark:text-white/40 border-slate-200 dark:border-white/[0.06]';
};

const categoryPieColors = ['#2563eb', '#7c3aed', '#059669', '#f59e0b', '#ec4899', '#64748b'];

// ─── Analytics Component ─────────────────────────────────────

const Analytics: React.FC = () => {
  const [abcXyzSort, setAbcXyzSort] = useState<'revenue' | 'cv'>('revenue');
  const [geoSort, setGeoSort] = useState<'revenue' | 'growth'>('revenue');
  const [timeRange, setTimeRange] = useState('30d');

  const sortedAbcXyz = [...abcXyzData].sort((a, b) =>
    abcXyzSort === 'revenue' ? b.revenue - a.revenue : a.cv - b.cv
  );

  const sortedGeo = [...geoRegionData].sort((a, b) =>
    geoSort === 'revenue' ? b.revenue - a.revenue : b.growth - a.growth
  );

  const handleExport = (format: 'excel' | 'pdf') => {
    const msg = format === 'excel'
      ? 'Экспорт в Excel будет доступен после подключения API'
      : 'Экспорт в PDF будет доступен после подключения API';
    alert(msg);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Расширенная аналитика</h1>
          <p className="text-slate-300 dark:text-white/30 mt-1">Глубокий анализ продаж, возвратов и эффективности</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px] h-9 bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-white/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 дней</SelectItem>
              <SelectItem value="30d">30 дней</SelectItem>
              <SelectItem value="90d">90 дней</SelectItem>
              <SelectItem value="1y">1 год</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 hover:text-slate-500 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.04]" onClick={() => handleExport('excel')}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button variant="outline" size="sm" className="border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 hover:text-slate-500 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.04]" onClick={() => handleExport('pdf')}>
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="abcxyz" className="space-y-6">
        <TabsList className="bg-white/[0.04] border border-slate-200 dark:border-white/[0.06]">
          <TabsTrigger value="abcxyz" className="gap-2 text-slate-400 dark:text-white/40 data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400">
            <ArrowUpDown className="h-4 w-4" />
            ABC/XYZ
          </TabsTrigger>
          <TabsTrigger value="returns" className="gap-2 text-slate-400 dark:text-white/40 data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400">
            <RefreshCw className="h-4 w-4" />
            Возвраты
          </TabsTrigger>
          <TabsTrigger value="geography" className="gap-2 text-slate-400 dark:text-white/40 data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400">
            <MapPin className="h-4 w-4" />
            География
          </TabsTrigger>
          <TabsTrigger value="brands" className="gap-2 text-slate-400 dark:text-white/40 data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400">
            <Layers className="h-4 w-4" />
            Бренды
          </TabsTrigger>
        </TabsList>

        {/* ─── ABC/XYZ Tab ──────────────────────────────────── */}
        <TabsContent value="abcxyz" className="space-y-6">
          {/* Matrix Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Матрица ABC/XYZ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="p-3 text-left text-slate-300 dark:text-white/30 font-medium">XYZ \ ABC</th>
                        <th className="p-3 text-center font-medium text-blue-400 bg-blue-500/10 rounded-tl-lg">A</th>
                        <th className="p-3 text-center font-medium text-amber-400 bg-amber-500/10">B</th>
                        <th className="p-3 text-center font-medium text-slate-400 dark:text-white/40 bg-white/[0.04] rounded-tr-lg">C</th>
                      </tr>
                    </thead>
                    <tbody>
                      {abcXyzMatrix.map((row) => (
                        <tr key={row.x}>
                          <td className="p-3 font-medium text-slate-400 dark:text-white/40 bg-white/[0.04]">{row.x}</td>
                          <td className={`p-3 text-center ${row.x === 'X' ? 'bg-emerald-500/5' : row.x === 'Y' ? 'bg-blue-500/5' : 'bg-amber-500/5'}`}>
                            <span className="text-lg font-bold text-slate-900 dark:text-white">{row.a}</span>
                            <span className="text-xs text-slate-300 dark:text-white/20 ml-1">SKU</span>
                          </td>
                          <td className={`p-3 text-center ${row.x === 'X' ? 'bg-blue-500/5' : row.x === 'Y' ? 'bg-amber-500/5' : 'bg-red-500/5'}`}>
                            <span className="text-lg font-bold text-slate-900 dark:text-white">{row.b}</span>
                            <span className="text-xs text-slate-300 dark:text-white/20 ml-1">SKU</span>
                          </td>
                          <td className={`p-3 text-center ${row.x === 'X' ? 'bg-amber-500/5' : row.x === 'Y' ? 'bg-white/[0.02]' : 'bg-red-500/5'}`}>
                            <span className="text-lg font-bold text-slate-900 dark:text-white">{row.c}</span>
                            <span className="text-xs text-slate-300 dark:text-white/20 ml-1">SKU</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 space-y-2 text-xs text-slate-300 dark:text-white/30">
                  <p><strong className="text-slate-400 dark:text-white/50">X</strong> — стабильный спрос (CV &lt; 15%)</p>
                  <p><strong className="text-slate-400 dark:text-white/50">Y</strong> — сезонные колебания (CV 15–35%)</p>
                  <p><strong className="text-slate-400 dark:text-white/50">Z</strong> — нерегулярный спрос (CV &gt; 35%)</p>
                </div>
              </CardContent>
            </Card>

            {/* Scatter: Revenue vs CV */}
            <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Выручка vs Волатильность (CV)</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={scatterConfig} className="h-[300px] w-full">
                  <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                    <XAxis dataKey="cv" name="CV" unit="%" tick={{ fontSize: 12 }} stroke="#4a4a5a" label={{ value: 'Коэфф. вариации (%)', position: 'insideBottom', offset: -5, fontSize: 11, fill: '#4a4a5a' }} />
                    <YAxis dataKey="revenue" name="Выручка" tick={{ fontSize: 12 }} stroke="#4a4a5a" tickFormatter={(v) => fmtK(v)} label={{ value: 'Выручка', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#4a4a5a' }} />
                    <ZAxis range={[80, 200]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0d0d14', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}
                      formatter={(value: number, name: string) =>
                        name === 'Выручка' ? [fmtK(value) + ' ₽', name] : [value + '%', name]
                      }
                    />
                    <Scatter data={abcXyzData.map((d) => ({ cv: d.cv, revenue: d.revenue, abc: d.abc }))} fill="#2563eb">
                      {abcXyzData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.abc === 'A' ? '#10b981' : entry.abc === 'B' ? '#f59e0b' : '#4a4a5a'}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ChartContainer>
                <div className="flex items-center justify-center gap-4 mt-2 text-xs text-slate-300 dark:text-white/30">
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-emerald-500" /> Категория A</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-amber-500" /> Категория B</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#4a4a5a]" /> Категория C</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ABC/XYZ Table */}
          <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Детализация ABC/XYZ</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 dark:text-white/30">Сортировка:</span>
                <Select value={abcXyzSort} onValueChange={(v) => setAbcXyzSort(v as 'revenue' | 'cv')}>
                  <SelectTrigger className="w-[150px] h-8 text-xs bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-white/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">По выручке</SelectItem>
                    <SelectItem value="cv">По волатильности</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200 dark:border-white/[0.06] hover:bg-transparent">
                      <TableHead className="text-xs text-slate-300 dark:text-white/30">SKU</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30 text-right">Выручка</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30 text-right">CV (%)</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30 text-center">ABC</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30 text-center">XYZ</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30 text-center">Группа</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30">Рекомендация</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedAbcXyz.map((row, i) => (
                      <TableRow key={i} className="border-white/[0.04] hover:bg-white/[0.02]">
                        <TableCell className="text-sm font-medium text-slate-600 dark:text-white/70 max-w-[200px] truncate">{row.sku}</TableCell>
                        <TableCell className="text-sm text-right text-slate-400 dark:text-white/40">{fmtK(row.revenue)} ₽</TableCell>
                        <TableCell className="text-sm text-right text-slate-400 dark:text-white/40">{row.cv}%</TableCell>
                        <TableCell className="text-center">
                          <Badge className={`text-xs ${row.abc === 'A' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : row.abc === 'B' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-white/[0.04] text-slate-400 dark:text-white/40 border-slate-200 dark:border-white/[0.06]'}`}>
                            {row.abc}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`text-xs ${row.xyz === 'X' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : row.xyz === 'Y' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                            {row.xyz}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`text-xs ${getCategoryColor(row.category)}`}>
                            {row.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-slate-300 dark:text-white/30 max-w-[200px]">
                          {row.category === 'AX' && 'Стабильный лидер — обеспечивать наличие'}
                          {row.category === 'AY' && 'Высокая выручка, сезонность — планировать запасы'}
                          {row.category === 'BX' && 'Стабильный средний — оптимизировать расходы'}
                          {row.category === 'BY' && 'Средний, сезонный — корректировать под сезон'}
                          {row.category === 'BZ' && 'Средний, нестабильный — снизить запасы'}
                          {row.category === 'CX' && 'Низкая выручка, стабильный — автоматизировать'}
                          {row.category === 'CZ' && 'Кандидат на вывод — рассмотреть прекращение'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Returns Tab ───────────────────────────────────── */}
        <TabsContent value="returns" className="space-y-6">
          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
              <CardContent className="p-5">
                <p className="text-xs font-medium text-slate-300 dark:text-white/30 uppercase">Всего возвратов</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">362</p>
                <p className="text-xs text-red-400 mt-1">+8.4% к пред. периоду</p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
              <CardContent className="p-5">
                <p className="text-xs font-medium text-slate-300 dark:text-white/30 uppercase">Средний % возвратов</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">4.2%</p>
                <p className="text-xs text-emerald-400 mt-1">-0.3 п.п. к пред. периоду</p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
              <CardContent className="p-5">
                <p className="text-xs font-medium text-slate-300 dark:text-white/30 uppercase">Потери от возвратов</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">284К ₽</p>
                <p className="text-xs text-slate-300 dark:text-white/20 mt-1">Логистика + обработка</p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
              <CardContent className="p-5">
                <p className="text-xs font-medium text-slate-300 dark:text-white/30 uppercase">Главная причина</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Размер</p>
                <p className="text-xs text-slate-300 dark:text-white/20 mt-1">38% всех возвратов</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Returns Dynamics */}
            <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Динамика возвратов</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={returnsChartConfig} className="h-[280px] w-full">
                  <BarChart data={returnsData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#4a4a5a" />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#4a4a5a" />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#4a4a5a" domain={[0, 8]} unit="%" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar yAxisId="left" dataKey="returns" fill="#dc2626" radius={[4, 4, 0, 0]} name="returns" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Return Reasons Pie */}
            <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Причины возвратов</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={returnReasonConfig} className="h-[200px] w-full">
                  <PieChart>
                    <Pie
                      data={returnReasons}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                    >
                      {returnReasons.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
                <div className="space-y-2 mt-2">
                  {returnReasons.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-400 dark:text-white/40">{item.name}</span>
                      </div>
                      <span className="font-medium text-slate-500 dark:text-white/60">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Returns by SKU */}
          <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Возвраты по SKU</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 dark:border-white/[0.06] hover:bg-transparent">
                    <TableHead className="text-xs text-slate-300 dark:text-white/30">SKU</TableHead>
                    <TableHead className="text-xs text-slate-300 dark:text-white/30 text-right">Кол-во</TableHead>
                    <TableHead className="text-xs text-slate-300 dark:text-white/30 text-right">% возвратов</TableHead>
                    <TableHead className="text-xs text-slate-300 dark:text-white/30">Главная причина</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {returnsBySku.map((row, i) => (
                    <TableRow key={i} className="border-white/[0.04] hover:bg-white/[0.02]">
                      <TableCell className="text-sm font-medium text-slate-600 dark:text-white/70">{row.sku}</TableCell>
                      <TableCell className="text-sm text-right text-slate-400 dark:text-white/40">{row.returns}</TableCell>
                      <TableCell className="text-sm text-right">
                        <span className={row.rate > 5 ? 'text-red-400 font-medium' : 'text-slate-400 dark:text-white/50'}>
                          {row.rate}%
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-slate-300 dark:text-white/30">{row.mainReason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Geography Tab ─────────────────────────────────── */}
        <TabsContent value="geography" className="space-y-6">
          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
              <CardContent className="p-5">
                <p className="text-xs font-medium text-slate-300 dark:text-white/30 uppercase">Регионов</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">46</p>
                <p className="text-xs text-emerald-400 mt-1">+3 новых за месяц</p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
              <CardContent className="p-5">
                <p className="text-xs font-medium text-slate-300 dark:text-white/30 uppercase">Топ регион</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Москва</p>
                <p className="text-xs text-slate-300 dark:text-white/20 mt-1">28.5% всей выручки</p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
              <CardContent className="p-5">
                <p className="text-xs font-medium text-slate-300 dark:text-white/30 uppercase">Быстрорастущий</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Приморье</p>
                <p className="text-xs text-emerald-400 mt-1">+18.9% рост</p>
              </CardContent>
            </Card>
          </div>

          {/* Region Table */}
          <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Продажи по регионам</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 dark:text-white/30">Сортировка:</span>
                <Select value={geoSort} onValueChange={(v) => setGeoSort(v as 'revenue' | 'growth')}>
                  <SelectTrigger className="w-[150px] h-8 text-xs bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-white/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">По выручке</SelectItem>
                    <SelectItem value="growth">По росту</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 dark:border-white/[0.06] hover:bg-transparent">
                    <TableHead className="text-xs text-slate-300 dark:text-white/30">#</TableHead>
                    <TableHead className="text-xs text-slate-300 dark:text-white/30">Регион</TableHead>
                    <TableHead className="text-xs text-slate-300 dark:text-white/30 text-right">Выручка</TableHead>
                    <TableHead className="text-xs text-slate-300 dark:text-white/30 text-right">Заказы</TableHead>
                    <TableHead className="text-xs text-slate-300 dark:text-white/30 text-right">Средний чек</TableHead>
                    <TableHead className="text-xs text-slate-300 dark:text-white/30 text-right">Рост</TableHead>
                    <TableHead className="text-xs text-slate-300 dark:text-white/30 text-right">Доля</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedGeo.map((row, i) => {
                    const totalRev = geoRegionData.reduce((s, r) => s + r.revenue, 0);
                    const share = ((row.revenue / totalRev) * 100).toFixed(1);
                    return (
                      <TableRow key={row.region} className="border-white/[0.04] hover:bg-white/[0.02]">
                        <TableCell className="text-sm text-slate-300 dark:text-white/20">{i + 1}</TableCell>
                        <TableCell className="text-sm font-medium text-slate-600 dark:text-white/70">{row.region}</TableCell>
                        <TableCell className="text-sm text-right text-slate-400 dark:text-white/40">{fmtK(row.revenue)} ₽</TableCell>
                        <TableCell className="text-sm text-right text-slate-400 dark:text-white/40">{fmt(row.orders)}</TableCell>
                        <TableCell className="text-sm text-right text-slate-400 dark:text-white/40">{fmt(row.avgCheck)} ₽</TableCell>
                        <TableCell className="text-sm text-right">
                          <span className={`font-medium ${row.growth >= 10 ? 'text-emerald-400' : row.growth >= 5 ? 'text-blue-400' : 'text-slate-400 dark:text-white/40'}`}>
                            +{row.growth}%
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-right text-slate-400 dark:text-white/40">{share}%</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Revenue by Region Bar */}
          <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Выручка по регионам</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={brandChartConfig} className="h-[300px] w-full">
                <BarChart data={geoRegionData.slice(0, 8)} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="#4a4a5a" tickFormatter={(v) => fmtK(v)} />
                  <YAxis type="category" dataKey="region" tick={{ fontSize: 12 }} stroke="#4a4a5a" width={80} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="revenue" fill="#2563eb" radius={[0, 4, 4, 0]} name="revenue" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Brands & Categories Tab ───────────────────────── */}
        <TabsContent value="brands" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Brand Performance */}
            <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Аналитика по брендам</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={brandChartConfig} className="h-[280px] w-full">
                  <BarChart data={brandData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                    <XAxis dataKey="brand" tick={{ fontSize: 10 }} stroke="#4a4a5a" angle={-15} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 12 }} stroke="#4a4a5a" tickFormatter={(v) => fmtK(v)} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} name="revenue" />
                    <Bar dataKey="profit" fill="#059669" radius={[4, 4, 0, 0]} name="profit" />
                  </BarChart>
                </ChartContainer>
                <div className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200 dark:border-white/[0.06] hover:bg-transparent">
                        <TableHead className="text-xs text-slate-300 dark:text-white/30">Бренд</TableHead>
                        <TableHead className="text-xs text-slate-300 dark:text-white/30 text-right">Выручка</TableHead>
                        <TableHead className="text-xs text-slate-300 dark:text-white/30 text-right">Маржа</TableHead>
                        <TableHead className="text-xs text-slate-300 dark:text-white/30 text-right">SKU</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {brandData.map((row) => (
                        <TableRow key={row.brand} className="border-white/[0.04] hover:bg-white/[0.02]">
                          <TableCell className="text-sm font-medium text-slate-600 dark:text-white/70">{row.brand}</TableCell>
                          <TableCell className="text-sm text-right text-slate-400 dark:text-white/40">{fmtK(row.revenue)} ₽</TableCell>
                          <TableCell className="text-sm text-right font-medium text-emerald-400">{row.margin}%</TableCell>
                          <TableCell className="text-sm text-right text-slate-400 dark:text-white/40">{row.skus}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Аналитика по категориям</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={categoryPieConfig} className="h-[220px] w-full">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="share"
                      nameKey="category"
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={categoryPieColors[index % categoryPieColors.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
                <div className="space-y-2 mt-2">
                  {categoryData.map((item, i) => (
                    <div key={item.category} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryPieColors[i] }} />
                        <span className="text-slate-400 dark:text-white/40">{item.category}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-900 dark:text-white/25">{fmtK(item.revenue)} ₽</span>
                        <span className="font-medium text-slate-500 dark:text-white/60 w-10 text-right">{item.share}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Radar Comparison */}
          <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Сравнение категорий (радар)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={radarConfig} className="h-[350px] w-full max-w-[500px] mx-auto">
                <RadarChart data={categoryRadarData}>
                  <PolarGrid stroke="#1e1e2e" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#4a4a5a' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#4a4a5a' }} />
                  <Radar name="Одежда" dataKey="Одежда" stroke="#2563eb" fill="#2563eb" fillOpacity={0.15} />
                  <Radar name="Обувь" dataKey="Обувь" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.15} />
                  <Radar name="Аксессуары" dataKey="Аксессуары" stroke="#059669" fill="#059669" fillOpacity={0.15} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </RadarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;