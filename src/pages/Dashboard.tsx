import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Package,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowRight,
  DollarSign,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Plug,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { skuApi, type Sku, calculateProfitability } from '@/lib/marketplace-api';
import OnboardingTour from '@/components/OnboardingTour';

const Dashboard: React.FC = () => {
  const { currentPlan } = useAuth();
  const [skus, setSkus] = useState<Sku[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSkus();
  }, []);

  const loadSkus = async () => {
    try {
      const data = await skuApi.getAll();
      setSkus(data);
    } catch (error) {
      console.error('Failed to load SKUs:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = skus.reduce((sum, s) => sum + (s.selling_price || 0), 0);
  const totalProfit = skus.reduce((sum, s) => sum + (s.net_profit || 0), 0);
  const profitableSkus = skus.filter(s => (s.margin_pct || 0) > 0);
  const unprofitableSkus = skus.filter(s => (s.margin_pct || 0) < 0);
  const avgMargin = skus.length > 0 ? skus.reduce((sum, s) => sum + (s.margin_pct || 0), 0) / skus.length : 0;

  const wbSkus = skus.filter(s => s.marketplace_id === 1 || s.marketplace_id === 0);
  const ozonSkus = skus.filter(s => s.marketplace_id === 2);

  const pieData = [
    { name: 'Wildberries', value: wbSkus.length || 0, color: '#7c3aed' },
    { name: 'Ozon', value: ozonSkus.length || 0, color: '#2563eb' },
  ].filter(d => d.value > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-white/40">Загрузка данных...</div>
      </div>
    );
  }

  if (skus.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Дашборд</h1>
          <p className="text-white/40 mt-1">Обзор вашего бизнеса на маркетплейсах</p>
        </div>

        <OnboardingTour />

        <Card className="bg-white/[0.02] border-white/[0.06]">
          <CardContent className="p-12 text-center">
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
              <Package className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Добро пожаловать в ProfitPilot AI!</h2>
            <p className="text-white/40 max-w-md mx-auto mb-8">
              Начните добавлять товары для расчёта юнит-экономики. Вы можете добавить SKU вручную или подключить API маркетплейса.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25">
                <Link to="/app/skus">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить SKU вручную
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/10 text-white/60 hover:text-white hover:bg-white/5">
                <Link to="/app/integrations">
                  <Plug className="h-4 w-4 mr-2" />
                  Подключить API
                </Link>
              </Button>
            </div>
            <p className="mt-6 text-xs text-white/25">
              Тариф: <span className="text-emerald-400 capitalize">{currentPlan || 'Не определён'}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Дашборд</h1>
          <p className="text-white/40 mt-1">Обзор вашего бизнеса на маркетплейсах</p>
        </div>
        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 capitalize">
          {currentPlan}
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white/[0.02] border-white/[0.06]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{totalRevenue.toLocaleString()} ₽</p>
            <p className="text-xs text-white/30 mt-1">Суммарная выручка (цены продажи)</p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.02] border-white/[0.06]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-400" />
              </div>
            </div>
            <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {totalProfit >= 0 ? '+' : ''}{totalProfit.toLocaleString()} ₽
            </p>
            <p className="text-xs text-white/30 mt-1">Чистая прибыль</p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.02] border-white/[0.06]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-purple-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{skus.length}</p>
            <p className="text-xs text-white/30 mt-1">Активных SKU</p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.02] border-white/[0.06]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-amber-400" />
              </div>
            </div>
            <p className={`text-2xl font-bold ${avgMargin >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {avgMargin.toFixed(1)}%
            </p>
            <p className="text-xs text-white/30 mt-1">Средняя маржа</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top profitable */}
        <Card className="lg:col-span-2 bg-white/[0.02] border-white/[0.06]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              Прибыльные SKU
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-white/40 hover:text-white">
              <Link to="/app/skus">Все SKU <ArrowRight className="h-3 w-3 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {profitableSkus.slice(0, 5).map((sku) => (
              <div key={sku.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <div>
                  <p className="text-sm font-medium text-white">{sku.name}</p>
                  <p className="text-xs text-white/30">{sku.article}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-400">+{(sku.margin_pct || 0).toFixed(1)}%</p>
                  <p className="text-xs text-white/30">{(sku.net_profit || 0).toLocaleString()} ₽</p>
                </div>
              </div>
            ))}
            {profitableSkus.length === 0 && (
              <div className="p-6 text-center text-white/30 text-sm">
                Нет прибыльных SKU. Добавьте товары для анализа.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Marketplace split */}
        <Card className="bg-white/[0.02] border-white/[0.06]">
          <CardHeader>
            <CardTitle className="text-white text-lg">По маркетплейсам</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" strokeWidth={0}>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 mt-3">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-white/50">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium text-white/70">{item.value} SKU</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="p-6 text-center text-white/30 text-sm">
                Добавьте SKU для отображения статистики
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Unprofitable alert */}
      {unprofitableSkus.length > 0 && (
        <Card className="bg-red-500/[0.02] border-red-500/10">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-400" />
              Убыточные SKU ({unprofitableSkus.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {unprofitableSkus.slice(0, 3).map((sku) => (
              <div key={sku.id} className="flex items-center justify-between p-3 rounded-lg bg-red-500/[0.02] border border-red-500/10">
                <div>
                  <p className="text-sm font-medium text-white">{sku.name}</p>
                  <p className="text-xs text-white/30">{sku.article}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-red-400">{(sku.margin_pct || 0).toFixed(1)}%</p>
                </div>
              </div>
            ))}
            <div className="pt-2">
              <Button asChild variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300">
                <Link to="/app/recommendations">
                  <Sparkles className="h-4 w-4 mr-1" />
                  Получить AI-рекомендации
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
