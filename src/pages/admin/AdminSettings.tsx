import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Settings,
  Percent,
  SlidersHorizontal,
  Shield,
  Bell,
  Save,
  RotateCcw,
  Globe,
  Zap,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────

interface PlatformSettings {
  // Commissions
  wbCommission: number;
  ozonCommission: number;
  ymCommission: number;
  // Limits
  freeSkuLimit: number;
  proSkuLimit: number;
  enterpriseSkuLimit: number;
  freeRepricerInterval: number;
  proRepricerInterval: number;
  enterpriseRepricerInterval: number;
  // Pricing
  proPrice: number;
  enterprisePrice: number;
  trialDays: number;
  // Features
  aiRecommendationsEnabled: boolean;
  autoRepricerEnabled: boolean;
  bidderEnabled: boolean;
  cardsSeoEnabled: boolean;
  // Notifications
  emailNotifications: boolean;
  drrAlerts: boolean;
  priceChangeAlerts: boolean;
  // System
  maintenanceMode: boolean;
  apiRateLimit: number;
  maxConcurrentUsers: number;
}

const defaultSettings: PlatformSettings = {
  wbCommission: 19,
  ozonCommission: 15,
  ymCommission: 12,
  freeSkuLimit: 50,
  proSkuLimit: 500,
  enterpriseSkuLimit: 5000,
  freeRepricerInterval: 60,
  proRepricerInterval: 15,
  enterpriseRepricerInterval: 5,
  proPrice: 4990,
  enterprisePrice: 49900,
  trialDays: 14,
  aiRecommendationsEnabled: true,
  autoRepricerEnabled: true,
  bidderEnabled: true,
  cardsSeoEnabled: true,
  emailNotifications: true,
  drrAlerts: true,
  priceChangeAlerts: true,
  maintenanceMode: false,
  apiRateLimit: 100,
  maxConcurrentUsers: 500,
};

// ─── Component ───────────────────────────────────────────────

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setSaved(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Системные настройки</h1>
          <p className="text-slate-400 dark:text-white/40 mt-1">Параметры платформы, комиссии и лимиты</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/60 hover:text-white hover:bg-slate-100 dark:hover:bg-white/5" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />Сбросить
          </Button>
          <Button className="bg-violet-600 hover:bg-violet-700" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            {saved ? 'Сохранено ✓' : 'Сохранить'}
          </Button>
        </div>
      </div>

      {/* Commissions */}
      <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
            <Percent className="h-5 w-5 text-violet-400" />
            Комиссии маркетплейсов (%)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block text-slate-500 dark:text-white/60">Wildberries</label>
              <div className="relative">
                <Input
                  type="number"
                  value={settings.wbCommission}
                  onChange={(e) => update('wbCommission', Number(e.target.value))}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-300 dark:text-white/30">%</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-slate-500 dark:text-white/60">Ozon</label>
              <div className="relative">
                <Input
                  type="number"
                  value={settings.ozonCommission}
                  onChange={(e) => update('ozonCommission', Number(e.target.value))}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-300 dark:text-white/30">%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SKU Limits */}
      <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
            <SlidersHorizontal className="h-5 w-5 text-blue-400" />
            Лимиты SKU
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block text-slate-500 dark:text-white/60">Free</label>
              <Input
                type="number"
                value={settings.freeSkuLimit}
                onChange={(e) => update('freeSkuLimit', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-slate-500 dark:text-white/60">Pro</label>
              <Input
                type="number"
                value={settings.proSkuLimit}
                onChange={(e) => update('proSkuLimit', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-slate-500 dark:text-white/60">Enterprise</label>
              <Input
                type="number"
                value={settings.enterpriseSkuLimit}
                onChange={(e) => update('enterpriseSkuLimit', Number(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Repricer Intervals */}
      <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
            <Zap className="h-5 w-5 text-amber-400" />
            Интервал репрайсера (мин)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block text-slate-500 dark:text-white/60">Free</label>
              <Input
                type="number"
                value={settings.freeRepricerInterval}
                onChange={(e) => update('freeRepricerInterval', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-slate-500 dark:text-white/60">Pro</label>
              <Input
                type="number"
                value={settings.proRepricerInterval}
                onChange={(e) => update('proRepricerInterval', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-slate-500 dark:text-white/60">Enterprise</label>
              <Input
                type="number"
                value={settings.enterpriseRepricerInterval}
                onChange={(e) => update('enterpriseRepricerInterval', Number(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
            <Globe className="h-5 w-5 text-emerald-400" />
            Цены и триал
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block text-slate-500 dark:text-white/60">Pro (₽/мес)</label>
              <Input
                type="number"
                value={settings.proPrice}
                onChange={(e) => update('proPrice', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-slate-500 dark:text-white/60">Enterprise (₽/мес)</label>
              <Input
                type="number"
                value={settings.enterprisePrice}
                onChange={(e) => update('enterprisePrice', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-slate-500 dark:text-white/60">Триал (дней)</label>
              <Input
                type="number"
                value={settings.trialDays}
                onChange={(e) => update('trialDays', Number(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Toggles */}
      <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
            <Shield className="h-5 w-5 text-violet-400" />
            Функции платформы
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">AI-рекомендации</p>
              <p className="text-xs text-slate-400 dark:text-white/40">Генерация рекомендаций по ценообразованию</p>
            </div>
            <Switch
              checked={settings.aiRecommendationsEnabled}
              onCheckedChange={(v) => update('aiRecommendationsEnabled', v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Автоматический репрайсер</p>
              <p className="text-xs text-slate-400 dark:text-white/40">Автоматическая корректировка цен</p>
            </div>
            <Switch
              checked={settings.autoRepricerEnabled}
              onCheckedChange={(v) => update('autoRepricerEnabled', v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Биддер</p>
              <p className="text-xs text-slate-400 dark:text-white/40">Автоматическое управление ставками рекламы</p>
            </div>
            <Switch
              checked={settings.bidderEnabled}
              onCheckedChange={(v) => update('bidderEnabled', v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">SEO-оптимизация карточек</p>
              <p className="text-xs text-slate-400 dark:text-white/40">Проверка и улучшение карточек товаров</p>
            </div>
            <Switch
              checked={settings.cardsSeoEnabled}
              onCheckedChange={(v) => update('cardsSeoEnabled', v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
            <Bell className="h-5 w-5 text-amber-400" />
            Уведомления
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Email-уведомления</p>
              <p className="text-xs text-slate-400 dark:text-white/40">Отправка уведомлений по email</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(v) => update('emailNotifications', v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Алерты DRR</p>
              <p className="text-xs text-slate-400 dark:text-white/40">Уведомления при превышении DRR</p>
            </div>
            <Switch
              checked={settings.drrAlerts}
              onCheckedChange={(v) => update('drrAlerts', v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Алерты изменения цен</p>
              <p className="text-xs text-slate-400 dark:text-white/40">Уведомления при изменении цен конкурентами</p>
            </div>
            <Switch
              checked={settings.priceChangeAlerts}
              onCheckedChange={(v) => update('priceChangeAlerts', v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* System */}
      <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
            <Settings className="h-5 w-5 text-slate-400 dark:text-white/40" />
            Системные параметры
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block text-slate-500 dark:text-white/60">API Rate Limit (запросов/мин)</label>
              <Input
                type="number"
                value={settings.apiRateLimit}
                onChange={(e) => update('apiRateLimit', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-slate-500 dark:text-white/60">Макс. одновременных пользователей</label>
              <Input
                type="number"
                value={settings.maxConcurrentUsers}
                onChange={(e) => update('maxConcurrentUsers', Number(e.target.value))}
              />
            </div>
            <div className="flex items-end">
              <div className="flex items-center justify-between w-full">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Режим обслуживания</p>
                  <p className="text-xs text-slate-400 dark:text-white/40">Блокировка доступа для пользователей</p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(v) => update('maintenanceMode', v)}
                />
              </div>
            </div>
          </div>
          {settings.maintenanceMode && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400 font-medium">⚠️ Режим обслуживания включён — пользователи не могут войти в систему</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;