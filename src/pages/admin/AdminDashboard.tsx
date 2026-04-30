import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  UserPlus,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  BarChart3,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

// ─── Mock Data ───────────────────────────────────────────────

const mrrData = [
  { month: 'Окт', mrr: 285000, arr: 3420000 },
  { month: 'Ноя', mrr: 312000, arr: 3744000 },
  { month: 'Дек', mrr: 298000, arr: 3576000 },
  { month: 'Янв', mrr: 345000, arr: 4140000 },
  { month: 'Фев', mrr: 378000, arr: 4536000 },
  { month: 'Мар', mrr: 412000, arr: 4944000 },
  { month: 'Апр', mrr: 445000, arr: 5340000 },
];

const registrationsData = [
  { date: '22 Апр', free: 12, pro: 3, enterprise: 1 },
  { date: '23 Апр', free: 18, pro: 5, enterprise: 0 },
  { date: '24 Апр', free: 15, pro: 4, enterprise: 2 },
  { date: '25 Апр', free: 22, pro: 6, enterprise: 1 },
  { date: '26 Апр', free: 19, pro: 7, enterprise: 1 },
  { date: '27 Апр', free: 25, pro: 8, enterprise: 2 },
  { date: '28 Апр', free: 14, pro: 4, enterprise: 1 },
];

const conversionData = [
  { week: 'Нед 1', rate: 8.2 },
  { week: 'Нед 2', rate: 9.1 },
  { week: 'Нед 3', rate: 7.8 },
  { week: 'Нед 4', rate: 10.5 },
  { week: 'Нед 5', rate: 11.2 },
  { week: 'Нед 6', rate: 9.8 },
  { week: 'Нед 7', rate: 12.1 },
  { week: 'Нед 8', rate: 11.5 },
];

const recentEvents = [
  { id: 1, type: 'registration', user: 'ivan@example.com', detail: 'Регистрация Free', time: '2 мин назад' },
  { id: 2, type: 'upgrade', user: 'maria@shop.ru', detail: 'Free → Pro', time: '15 мин назад' },
  { id: 3, type: 'payment', user: 'alex@brand.com', detail: 'Оплата Enterprise 49 900₽', time: '32 мин назад' },
  { id: 4, type: 'downgrade', user: 'elena@market.ru', detail: 'Pro → Free', time: '1 ч назад' },
  { id: 5, type: 'registration', user: 'dmitry@new.ru', detail: 'Регистрация Free', time: '1.5 ч назад' },
  { id: 6, type: 'upgrade', user: 'olga@store.ru', detail: 'Free → Pro', time: '2 ч назад' },
  { id: 7, type: 'payment', user: 'sergey@biz.ru', detail: 'Оплата Pro 4 990₽', time: '3 ч назад' },
  { id: 8, type: 'registration', user: 'nina@fashion.ru', detail: 'Регистрация Free', time: '4 ч назад' },
];

const planDistribution = [
  { plan: 'Free', count: 2847, pct: 71, color: '#94a3b8' },
  { plan: 'Pro', count: 892, pct: 22, color: '#2563eb' },
  { plan: 'Enterprise', count: 261, pct: 7, color: '#7c3aed' },
];

const mrrChartConfig: ChartConfig = {
  mrr: { label: 'MRR', color: '#7c3aed' },
};

const regChartConfig: ChartConfig = {
  free: { label: 'Free', color: '#94a3b8' },
  pro: { label: 'Pro', color: '#2563eb' },
  enterprise: { label: 'Enterprise', color: '#7c3aed' },
};

const convChartConfig: ChartConfig = {
  rate: { label: 'Конверсия %', color: '#059669' },
};

// ─── Component ───────────────────────────────────────────────

const AdminDashboard: React.FC = () => {
  const fmt = (n: number) => n.toLocaleString('ru-RU');
  const fmtCurrency = (n: number) => `${fmt(n)} ₽`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Админ-панель</h1>
        <p className="text-slate-400 dark:text-white/40 mt-1">Аналитика платформы ProfitPilot</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-violet-400" />
              </div>
              <Badge className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/10">
                <ArrowUpRight className="h-3 w-3 mr-0.5" />+8.1%
              </Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{fmtCurrency(445000)}</p>
            <p className="text-sm text-slate-400 dark:text-white/40 mt-1">MRR</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <Badge className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/10">
                <ArrowUpRight className="h-3 w-3 mr-0.5" />+12.3%
              </Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{fmt(4000)}</p>
            <p className="text-sm text-slate-400 dark:text-white/40 mt-1">Всего пользователей</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>
              <Badge className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/10">
                <ArrowUpRight className="h-3 w-3 mr-0.5" />+2.4%
              </Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">11.5%</p>
            <p className="text-sm text-slate-400 dark:text-white/40 mt-1">Конверсия Free → Pro</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-amber-400" />
              </div>
              <Badge className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/10">
                <ArrowDownRight className="h-3 w-3 mr-0.5" />-5.2%
              </Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{fmt(125)}</p>
            <p className="text-sm text-slate-400 dark:text-white/40 mt-1">Новые за неделю</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* MRR Chart */}
        <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">MRR / ARR</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={mrrChartConfig} className="h-[250px] w-full">
              <AreaChart data={mrrData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} stroke="#4a4a5a" />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} stroke="#4a4a5a" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="mrr" stroke="#7c3aed" fill="url(#mrrGrad)" strokeWidth={2} name="mrr" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Registrations Chart */}
        <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Регистрации (7 дней)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={regChartConfig} className="h-[250px] w-full">
              <BarChart data={registrationsData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} stroke="#4a4a5a" />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} stroke="#4a4a5a" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="free" stackId="a" fill="#94a3b8" radius={[0, 0, 0, 0]} name="free" />
                <Bar dataKey="pro" stackId="a" fill="#2563eb" radius={[0, 0, 0, 0]} name="pro" />
                <Bar dataKey="enterprise" stackId="a" fill="#7c3aed" radius={[4, 4, 0, 0]} name="enterprise" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Conversion + Plan Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Conversion Chart */}
        <Card className="lg:col-span-2 bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Конверсия Free → Pro (по неделям)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={convChartConfig} className="h-[200px] w-full">
              <AreaChart data={conversionData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#6b7280' }} stroke="#4a4a5a" />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} stroke="#4a4a5a" domain={[0, 15]} tickFormatter={(v) => `${v}%`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="rate" stroke="#059669" fill="url(#convGrad)" strokeWidth={2} name="rate" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Распределение по тарифам</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {planDistribution.map((p) => (
              <div key={p.plan}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{p.plan}</span>
                  </div>
                  <span className="text-sm text-slate-400 dark:text-white/40">{fmt(p.count)} ({p.pct}%)</span>
                </div>
                <Progress value={p.pct} className="h-2" />
              </div>
            ))}
            <div className="pt-3 border-t border-slate-200 dark:border-white/[0.06]">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400 dark:text-white/40">Итого</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{fmt(4000)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
            <Activity className="h-5 w-5 text-violet-400" />
            Последние события
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentEvents.map((e) => (
              <div key={e.id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                <div className="flex items-center gap-3">
                  {e.type === 'registration' && (
                    <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center">
                      <UserPlus className="h-4 w-4 text-slate-400 dark:text-white/40" />
                    </div>
                  )}
                  {e.type === 'upgrade' && (
                    <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                    </div>
                  )}
                  {e.type === 'downgrade' && (
                    <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    </div>
                  )}
                  {e.type === 'payment' && (
                    <div className="h-8 w-8 rounded-full bg-violet-500/10 flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-violet-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{e.user}</p>
                    <p className="text-xs text-slate-400 dark:text-white/40">{e.detail}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-300 dark:text-white/30">{e.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;