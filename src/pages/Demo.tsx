import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Package,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowRight,
  DollarSign,
  BarChart3,
  ShoppingCart,
  Compass,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
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

const demoRevenue = [
  { date: 'Пн', revenue: 285000, profit: 71200 },
  { date: 'Вт', revenue: 312000, profit: 84300 },
  { date: 'Ср', revenue: 298000, profit: 74500 },
  { date: 'Чт', revenue: 345000, profit: 93100 },
  { date: 'Пт', revenue: 367000, profit: 102800 },
  { date: 'Сб', revenue: 334000, profit: 86800 },
  { date: 'Вс', revenue: 389000, profit: 112800 },
];

const demoSkus = [
  { name: 'Футболка "Базовая"', article: 'WB-12345', margin: 42.3, profit: 524000, mp: 'Wildberries' },
  { name: 'Кроссовки "Спринт"', article: 'OZ-67890', margin: 38.7, profit: 379000, mp: 'Ozon' },
  { name: 'Рюкзак "Ультра"', article: 'WB-11223', margin: 35.1, profit: 305000, mp: 'Wildberries' },
  { name: 'Худи "Комфорт"', article: 'OZ-44556', margin: 33.8, profit: 243000, mp: 'Ozon' },
  { name: 'Джинсы "Классик"', article: 'WB-77889', margin: 31.2, profit: 203000, mp: 'Wildberries' },
];

const demoUnprofitable = [
  { name: 'Платок "Шёлк"', article: 'WB-99001', margin: -8.4, profit: -19300, mp: 'Wildberries' },
  { name: 'Перчатки "Тепло"', article: 'OZ-22334', margin: -5.2, profit: -11400, mp: 'Ozon' },
];

const demoPieData = [
  { name: 'Wildberries', value: 58, color: '#7c3aed' },
  { name: 'Ozon', value: 42, color: '#2563eb' },
];

const Demo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="border-b border-white/[0.04] bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
                <Compass className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">Profit<span className="text-emerald-400">Pilot</span></span>
            </Link>
            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/10">
              <Eye className="h-3 w-3 mr-1" />
              Демо-режим
            </Badge>
          </div>
          <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25">
            <Link to="/">
              Оформить подписку
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo Banner */}
        <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-emerald-500/10 border border-amber-500/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="font-medium text-white">Это демонстрация ProfitPilot AI</p>
              <p className="text-sm text-white/40">Все данные здесь — примеры. Оформите подписку для работы с реальными товарами.</p>
            </div>
            <Button asChild variant="outline" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 shrink-0">
              <Link to="/">Выбрать тариф</Link>
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          {[
            { label: 'Выручка за неделю', value: '2 330 000 ₽', change: '+12.4%', up: true, icon: DollarSign },
            { label: 'Чистая прибыль', value: '625 500 ₽', change: '+8.2%', up: true, icon: TrendingUp },
            { label: 'Активных SKU', value: '47', change: '+3', up: true, icon: Package },
            { label: 'Средняя маржа', value: '26.8%', change: '-1.2%', up: false, icon: BarChart3 },
          ].map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.label} className="bg-white/[0.02] border-white/[0.06]">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-emerald-400" />
                    </div>
                    <Badge className={`${kpi.up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'} border-0`}>
                      {kpi.up ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                      {kpi.change}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-white">{kpi.value}</p>
                  <p className="text-xs text-white/30 mt-1">{kpi.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/[0.03] border border-white/[0.06]">
            <TabsTrigger value="overview" className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400">Обзор</TabsTrigger>
            <TabsTrigger value="skus" className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400">SKU</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400">Аналитика</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Revenue Chart */}
              <Card className="lg:col-span-2 bg-white/[0.02] border-white/[0.06]">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Выручка и прибыль</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={demoRevenue}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={12} />
                      <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#colorRevenue)" strokeWidth={2} name="Выручка" />
                      <Area type="monotone" dataKey="profit" stroke="#3b82f6" fill="url(#colorProfit)" strokeWidth={2} name="Прибыль" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Marketplace Split */}
              <Card className="bg-white/[0.02] border-white/[0.06]">
                <CardHeader>
                  <CardTitle className="text-white text-lg">По маркетплейсам</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={demoPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={0}>
                        {demoPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex gap-4 mt-2">
                    {demoPieData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-white/50">{item.name} ({item.value}%)</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="skus" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Profitable */}
              <Card className="bg-white/[0.02] border-white/[0.06]">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                    Прибыльные SKU
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {demoSkus.map((sku) => (
                    <div key={sku.article} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <div>
                        <p className="text-sm font-medium text-white">{sku.name}</p>
                        <p className="text-xs text-white/30">{sku.article} • {sku.mp}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-emerald-400">+{sku.margin}%</p>
                        <p className="text-xs text-white/30">{(sku.profit / 1000).toFixed(0)}k ₽</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Unprofitable */}
              <Card className="bg-white/[0.02] border-white/[0.06]">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-red-400" />
                    Убыточные SKU
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {demoUnprofitable.map((sku) => (
                    <div key={sku.article} className="flex items-center justify-between p-3 rounded-lg bg-red-500/[0.02] border border-red-500/10">
                      <div>
                        <p className="text-sm font-medium text-white">{sku.name}</p>
                        <p className="text-xs text-white/30">{sku.article} • {sku.mp}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-red-400">{sku.margin}%</p>
                        <p className="text-xs text-white/30">{(sku.profit / 1000).toFixed(0)}k ₽</p>
                      </div>
                    </div>
                  ))}
                  <div className="p-4 rounded-lg border border-dashed border-white/10 text-center">
                    <Sparkles className="h-5 w-5 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm text-white/40">AI предложит оптимизацию цен для убыточных товаров</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-white/[0.02] border-white/[0.06]">
              <CardContent className="p-8 text-center">
                <BarChart3 className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Полная аналитика доступна в подписке</h3>
                <p className="text-white/40 mb-6 max-w-md mx-auto">
                  ABC-анализ, география продаж, динамика маржинальности, сравнение площадок и многое другое
                </p>
                <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25">
                  <Link to="/">
                    Оформить подписку
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Demo;
