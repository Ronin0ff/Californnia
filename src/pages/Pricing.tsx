import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Check,
  X,
  Crown,
  Rocket,
  CreditCard,
  Shield,
  ArrowRight,
  Sparkles,
  BarChart3,
  Store,
  Bot,
  Users,
  Headphones,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/ThemeProvider';
import { createClient } from '@metagptx/web-sdk';

const client = createClient();

interface PlanFeature {
  name: string;
  standard: boolean | string;
  pro: boolean | string;
  enterprise: boolean | string;
}

const plans = [
  {
    id: 'standard',
    name: 'Стандарт',
    price: 2500,
    period: '/мес',
    description: 'Для начинающих продавцов',
    icon: Rocket,
    color: 'text-blue-400',
    lightColor: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
    lightBgColor: 'bg-blue-50',
    borderColor: 'border-blue-500/30',
    lightBorderColor: 'border-blue-200',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 4990,
    period: '/мес',
    description: 'Для растущих продавцов',
    icon: Sparkles,
    color: 'text-emerald-400',
    lightColor: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10',
    lightBgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-500/30',
    lightBorderColor: 'border-emerald-200',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 19990,
    period: '/мес',
    description: 'Для крупных бизнесов',
    icon: Crown,
    color: 'text-amber-400',
    lightColor: 'text-amber-600',
    bgColor: 'bg-amber-500/10',
    lightBgColor: 'bg-amber-50',
    borderColor: 'border-amber-500/30',
    lightBorderColor: 'border-amber-200',
    popular: false,
  },
];

const features: PlanFeature[] = [
  { name: 'SKU для отслеживания', standard: 'До 10', pro: 'До 50', enterprise: 'Безлимит' },
  { name: 'Маркетплейсы', standard: 'WB + Ozon', pro: 'WB + Ozon', enterprise: 'WB + Ozon' },
  { name: 'Калькулятор прибыли', standard: true, pro: true, enterprise: true },
  { name: 'Email-уведомления', standard: true, pro: true, enterprise: true },
  { name: 'Репрайсер', standard: false, pro: true, enterprise: true },
  { name: 'AI-рекомендации', standard: false, pro: true, enterprise: true },
  { name: 'Биддер рекламный', standard: false, pro: true, enterprise: true },
  { name: 'Аналитика конкурентов', standard: 'Базовая', pro: 'Расширенная', enterprise: 'Полная' },
  { name: 'Уведомления', standard: 'Email', pro: 'Email + Telegram', enterprise: 'Все каналы' },
  { name: 'Экспорт отчётов', standard: false, pro: 'CSV', enterprise: 'CSV + Excel + PDF' },
  { name: 'API доступ', standard: false, pro: true, enterprise: true },
  { name: 'Приоритетная поддержка', standard: false, pro: false, enterprise: true },
  { name: 'Персональный менеджер', standard: false, pro: false, enterprise: true },
  { name: 'SLA 99.9%', standard: false, pro: false, enterprise: true },
];

const featureIcons: Record<string, React.ElementType> = {
  'SKU для отслеживания': BarChart3,
  'Маркетплейсы': Store,
  'AI-рекомендации': Bot,
  'Приоритетная поддержка': Headphones,
  'Персональный менеджер': Users,
};

const Pricing: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [planSwitchDialogOpen, setPlanSwitchDialogOpen] = useState(false);
  const [switchTargetPlan, setSwitchTargetPlan] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmationUrl, setConfirmationUrl] = useState('');

  const { user, currentPlan: userPlan } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const currentPlan = userPlan || '';

  const getPrice = (plan: typeof plans[0]) => {
    return billingPeriod === 'yearly' ? Math.round(plan.price * 10) : plan.price;
  };

  const getDisplayPrice = (plan: typeof plans[0]) => {
    return billingPeriod === 'yearly' ? Math.round(plan.price * 10 / 12) : plan.price;
  };

  const getPeriodLabel = () => {
    return billingPeriod === 'yearly' ? '/мес (оплата за год)' : '/мес';
  };

  const openPaymentDialog = (planId: string) => {
    if (!user) {
      toast.error('Войдите в аккаунт для оформления подписки');
      return;
    }
    setSelectedPlan(planId);
    setConfirmationUrl('');
    setPaymentDialogOpen(true);
  };

  const handlePayment = async () => {
    if (!user) {
      toast.error('Войдите в аккаунт для оформления подписки');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await client.apiCall.invoke({
        url: '/api/v1/payments/create',
        method: 'POST',
        data: {
          plan_id: selectedPlan,
          amount: getPrice(plans.find(p => p.id === selectedPlan) || plans[0]),
          description: `Подписка ProfitPilot — ${plans.find(p => p.id === selectedPlan)?.name} (${billingPeriod === 'yearly' ? 'годовая' : 'ежемесячная'})`,
        },
      });

      const data = response.data;

      if (data.confirmation_url) {
        setConfirmationUrl(data.confirmation_url);
        toast.success('Перенаправление на страницу оплаты...');
      } else {
        throw new Error('Не получена ссылка на оплату');
      }
    } catch (error: any) {
      const message = error?.response?.data?.detail || error.message || 'Ошибка при создании платежа';
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSwitchPlan = (planId: string) => {
    if (planId === currentPlan) return;
    setSwitchTargetPlan(planId);
    setPlanSwitchDialogOpen(true);
  };

  const confirmSwitchPlan = () => {
    toast.success(`Тариф изменён на ${plans.find(p => p.id === switchTargetPlan)?.name}`);
    setPlanSwitchDialogOpen(false);
  };

  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="h-5 w-5 text-emerald-400 mx-auto" />
      ) : (
        <X className={`h-5 w-5 mx-auto ${isDark ? 'text-white/10' : 'text-slate-200'}`} />
      );
    }
    return <span className={`text-sm font-medium ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{value}</span>;
  };

  const tc = (dark: string, light: string) => isDark ? dark : light;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className={`text-3xl font-bold ${tc('text-white', 'text-slate-900')}`}>Тарифы</h1>
        <p className={`mt-2 max-w-2xl mx-auto ${tc('text-white/30', 'text-slate-500')}`}>
          Выберите подходящий план для вашего бизнеса
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-3">
        <span className={`text-sm font-medium ${billingPeriod === 'monthly' ? tc('text-white/70', 'text-slate-700') : tc('text-white/25', 'text-slate-400')}`}>
          Ежемесячно
        </span>
        <button
          onClick={() => setBillingPeriod(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            billingPeriod === 'yearly' ? 'bg-emerald-500' : tc('bg-white/10', 'bg-slate-200')
          }`}
        >
          <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-0.5'
          }`} />
        </button>
        <span className={`text-sm font-medium ${billingPeriod === 'yearly' ? tc('text-white/70', 'text-slate-700') : tc('text-white/25', 'text-slate-400')}`}>
          Ежегодно
        </span>
        {billingPeriod === 'yearly' && (
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10 ml-1">
            <Sparkles className="h-3 w-3 mr-1" />Экономия 17%
          </Badge>
        )}
      </div>

      {/* Plan Cards */}
      <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
        {plans.map(plan => {
          const Icon = plan.icon;
          const isCurrent = plan.id === currentPlan;
          return (
            <Card
              key={plan.id}
              className={`relative ${tc('bg-[#0d0d14]', 'bg-white')} ${tc('border-white/[0.06]', 'border-slate-200')} ${plan.popular ? tc('border-emerald-500/30 shadow-lg shadow-emerald-500/5', 'border-emerald-200 shadow-lg shadow-emerald-500/10') : ''} ${isCurrent ? 'ring-2 ring-emerald-500/50 ring-offset-2 ' + tc('ring-offset-[#0a0a0f]', 'ring-offset-slate-50') : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-emerald-500 hover:bg-emerald-500 px-3 py-1 text-white">
                    <Sparkles className="h-3 w-3 mr-1" />Популярный
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <div className={`h-14 w-14 rounded-xl ${tc(plan.bgColor, plan.lightBgColor)} flex items-center justify-center mx-auto mb-3`}>
                  <Icon className={`h-7 w-7 ${tc(plan.color, plan.lightColor)}`} />
                </div>
                <CardTitle className={`text-xl ${tc('text-white', 'text-slate-900')}`}>{plan.name}</CardTitle>
                <CardDescription className={tc('text-white/30', 'text-slate-500')}>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-6">
                  <span className={`text-4xl font-bold ${tc('text-white', 'text-slate-900')}`}>
                    {`${getDisplayPrice(plan).toLocaleString()} ₽`}
                  </span>
                  <span className={`text-sm ${tc('text-white/25', 'text-slate-400')}`}>{getPeriodLabel()}</span>
                  {billingPeriod === 'yearly' && (
                    <div className={`text-xs mt-1 ${tc('text-emerald-400/60', 'text-emerald-600')}`}>
                      Итого за год: {getPrice(plan).toLocaleString()} ₽
                    </div>
                  )}
                </div>

                {isCurrent ? (
                  <Button variant="outline" className={`w-full mb-4 ${tc('border-white/10 text-white/30', 'border-slate-200 text-slate-400')}`} disabled>
                    <Check className="h-4 w-4 mr-1" />Текущий тариф
                  </Button>
                ) : (
                  <Button
                    className={`w-full mb-4 ${plan.popular ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : tc('bg-white/10 hover:bg-white/15 text-white', 'bg-slate-100 hover:bg-slate-200 text-slate-700')}`}
                    onClick={() => openPaymentDialog(plan.id)}
                  >
                    Выбрать {plan.name}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                )}

                <Separator className={`my-4 ${tc('bg-white/[0.06]', 'bg-slate-100')}`} />

                <div className="space-y-3 text-left">
                  {features.filter(f => {
                    const val = f[plan.id as keyof PlanFeature];
                    return val !== false;
                  }).map(feature => {
                    const FeatureIcon = featureIcons[feature.name] || Check;
                    const val = feature[plan.id as keyof PlanFeature];
                    return (
                      <div key={feature.name} className="flex items-center gap-2">
                        <FeatureIcon className={`h-4 w-4 flex-shrink-0 ${tc('text-white/15', 'text-slate-300')}`} />
                        <span className={`text-sm ${tc('text-white/40', 'text-slate-500')}`}>
                          {typeof val === 'string' ? val : feature.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Comparison Table */}
      <Card className={`${tc('bg-[#0d0d14]', 'bg-white')} ${tc('border-white/[0.06]', 'border-slate-200')}`}>
        <CardHeader>
          <CardTitle className={tc('text-white', 'text-slate-900')}>Сравнение тарифов</CardTitle>
          <CardDescription className={tc('text-white/30', 'text-slate-500')}>Подробное сравнение всех функций</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={tc('border-b border-white/[0.06]', 'border-b border-slate-100')}>
                  <th className={`text-left py-3 px-4 font-medium w-1/4 ${tc('text-white/30', 'text-slate-400')}`}>Функция</th>
                  <th className={`text-center py-3 px-4 font-medium w-1/4 ${tc('text-white/30', 'text-slate-400')}`}>
                    <div className="flex flex-col items-center gap-1">
                      <Rocket className={`h-4 w-4 ${tc('text-blue-400', 'text-blue-500')}`} />
                      Стандарт
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 font-medium w-1/4">
                    <div className="flex flex-col items-center gap-1 text-emerald-400">
                      <Sparkles className="h-4 w-4" />
                      Pro
                    </div>
                  </th>
                  <th className={`text-center py-3 px-4 font-medium w-1/4 ${tc('text-white/30', 'text-slate-400')}`}>
                    <div className="flex flex-col items-center gap-1 text-amber-400">
                      <Crown className="h-4 w-4" />
                      Enterprise
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, idx) => (
                  <tr key={feature.name} className={idx % 2 === 0 ? tc('bg-white/[0.01]', 'bg-slate-50/50') : ''}>
                    <td className={`py-3 px-4 font-medium ${tc('text-white/50', 'text-slate-600')}`}>{feature.name}</td>
                    <td className="py-3 px-4 text-center">{renderFeatureValue(feature.standard)}</td>
                    <td className={`py-3 px-4 text-center ${tc('bg-emerald-500/[0.03]', 'bg-emerald-50/50')}`}>{renderFeatureValue(feature.pro)}</td>
                    <td className="py-3 px-4 text-center">{renderFeatureValue(feature.enterprise)}</td>
                  </tr>
                ))}
                <tr className={tc('border-t border-white/[0.06]', 'border-t border-slate-100')}>
                  <td className={`py-4 px-4 font-bold ${tc('text-white/70', 'text-slate-700')}`}>Цена</td>
                  <td className={`py-4 px-4 text-center font-bold ${tc('text-blue-400', 'text-blue-600')}`}>
                    {getDisplayPrice(plans[0]).toLocaleString()} ₽{getPeriodLabel()}
                  </td>
                  <td className={`py-4 px-4 text-center font-bold text-emerald-400 ${tc('bg-emerald-500/[0.03]', 'bg-emerald-50/50')}`}>
                    {getDisplayPrice(plans[1]).toLocaleString()} ₽{getPeriodLabel()}
                  </td>
                  <td className="py-4 px-4 text-center font-bold text-amber-400">
                    {getDisplayPrice(plans[2]).toLocaleString()} ₽{getPeriodLabel()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FAQ / Trust */}
      <div className="grid gap-4 md:grid-cols-3 max-w-4xl mx-auto">
        <Card className={`text-center ${tc('bg-[#0d0d14]', 'bg-white')} ${tc('border-white/[0.06]', 'border-slate-200')}`}>
          <CardContent className="pt-6">
            <Shield className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
            <h3 className={`font-semibold mb-1 ${tc('text-white/70', 'text-slate-700')}`}>Безопасная оплата</h3>
            <p className={`text-sm ${tc('text-white/25', 'text-slate-400')}`}>Все платежи защищены SSL-шифрованием</p>
          </CardContent>
        </Card>
        <Card className={`text-center ${tc('bg-[#0d0d14]', 'bg-white')} ${tc('border-white/[0.06]', 'border-slate-200')}`}>
          <CardContent className="pt-6">
            <CreditCard className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
            <h3 className={`font-semibold mb-1 ${tc('text-white/70', 'text-slate-700')}`}>Гарантия возврата</h3>
            <p className={`text-sm ${tc('text-white/25', 'text-slate-400')}`}>14 дней на возврат без вопросов</p>
          </CardContent>
        </Card>
        <Card className={`text-center ${tc('bg-[#0d0d14]', 'bg-white')} ${tc('border-white/[0.06]', 'border-slate-200')}`}>
          <CardContent className="pt-6">
            <Headphones className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
            <h3 className={`font-semibold mb-1 ${tc('text-white/70', 'text-slate-700')}`}>Поддержка 24/7</h3>
            <p className={`text-sm ${tc('text-white/25', 'text-slate-400')}`}>Всегда на связи, когда вам нужна помощь</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Dialog - YooKassa redirect */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className={`${tc('bg-[#0d0d14]', 'bg-white')} ${tc('border-white/[0.06]', 'border-slate-200')}`}>
          <DialogHeader>
            <DialogTitle className={tc('text-white', 'text-slate-900')}>Оформление подписки</DialogTitle>
            <DialogDescription className={tc('text-white/30', 'text-slate-500')}>
              Тариф {plans.find(p => p.id === selectedPlan)?.name} — {getDisplayPrice(plans.find(p => p.id === selectedPlan) || plans[0]).toLocaleString()} ₽{getPeriodLabel()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className={`${tc('bg-white/[0.03]', 'bg-slate-50')} rounded-lg p-4 flex items-center justify-between ${tc('border border-white/[0.06]', 'border border-slate-200')}`}>
              <div>
                <p className={`text-sm ${tc('text-white/40', 'text-slate-500')}`}>План</p>
                <p className={`font-semibold ${tc('text-white', 'text-slate-900')}`}>{plans.find(p => p.id === selectedPlan)?.name}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm ${tc('text-white/40', 'text-slate-500')}`}>Итого</p>
                <p className="font-bold text-emerald-400">{getPrice(plans.find(p => p.id === selectedPlan) || plans[0]).toLocaleString()} ₽</p>
              </div>
            </div>
            <div className={`${tc('bg-white/[0.03]', 'bg-slate-50')} rounded-lg p-3 ${tc('border border-white/[0.06]', 'border border-slate-200')}`}>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-emerald-400" />
                <span className={`text-sm font-medium ${tc('text-white/50', 'text-slate-600')}`}>Безопасная оплата через ЮKassa</span>
              </div>
              <p className={`text-xs ${tc('text-white/25', 'text-slate-400')}`}>
                Вы будете перенаправлены на защищённую страницу платёжной системы для завершения оплаты
              </p>
            </div>
            {confirmationUrl && (
              <div className={`${tc('bg-emerald-500/10', 'bg-emerald-50')} rounded-lg p-3 ${tc('border border-emerald-500/20', 'border border-emerald-200')}`}>
                <p className={`text-sm ${tc('text-emerald-400', 'text-emerald-600')} mb-2`}>Платёж создан! Перейдите на страницу оплаты:</p>
                <a
                  href={confirmationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-emerald-400 hover:text-emerald-300 underline"
                >
                  Открыть страницу оплаты <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)} className={tc('border-white/10 text-white/40 hover:text-white/60 hover:bg-white/[0.04]', 'border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50')}>
              {confirmationUrl ? 'Закрыть' : 'Отмена'}
            </Button>
            {!confirmationUrl && (
              <Button onClick={handlePayment} disabled={isProcessing} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Обработка...
                  </>
                ) : (
                  <>
                    Перейти к оплате
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Plan Switch Dialog */}
      <Dialog open={planSwitchDialogOpen} onOpenChange={setPlanSwitchDialogOpen}>
        <DialogContent className={`${tc('bg-[#0d0d14]', 'bg-white')} ${tc('border-white/[0.06]', 'border-slate-200')}`}>
          <DialogHeader>
            <DialogTitle className={tc('text-white', 'text-slate-900')}>Смена тарифа</DialogTitle>
            <DialogDescription className={tc('text-white/30', 'text-slate-500')}>
              Вы уверены, что хотите переключиться на тариф {plans.find(p => p.id === switchTargetPlan)?.name}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-sm text-amber-400">
              При понижении тарифа некоторые функции могут стать недоступны. Данные будут сохранены.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanSwitchDialogOpen(false)} className={tc('border-white/10 text-white/40 hover:text-white/60 hover:bg-white/[0.04]', 'border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50')}>Отмена</Button>
            <Button onClick={confirmSwitchPlan} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              Переключить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pricing;