import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  BarChart3,
  Brain,
  Calculator,
  LineChart,
  Shield,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Check,
  Menu,
  X,
  Eye,
  Compass,
  Crown,
  Rocket,
  Loader2,
  LogIn,
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@metagptx/web-sdk';

const client = createClient();

const NAV_LINKS = [
  { label: 'Возможности', href: '#benefits' },
  { label: 'Тарифы', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

const BENEFITS = [
  {
    icon: Calculator,
    title: 'Калькулятор юнит-экономики',
    description: 'Точный расчёт себестоимости, комиссий, логистики и чистой прибыли по каждому SKU с учётом всех скрытых издержек WB и Ozon.',
  },
  {
    icon: Brain,
    title: 'AI-рекомендации по ценам',
    description: 'Нейросеть анализирует конкурентов, сезонность и эластичность спроса — предлагает оптимальную цену для максимизации прибыли.',
  },
  {
    icon: BarChart3,
    title: 'Аналитика WB и Ozon',
    description: 'Wildberries и Ozon — все данные в одном окне. Сравнивайте маржинальность и выбирайте лучшую площадку для каждого товара.',
  },
  {
    icon: TrendingUp,
    title: 'Автоматический репрайсер',
    description: 'Отслеживайте изменения цен конкурентов в реальном времени и автоматически корректируйте свои цены для максимальной прибыли.',
  },
  {
    icon: Shield,
    title: 'Защита от убыточных SKU',
    description: 'Система автоматически выявляет товары с отрицательной маржинальностью и предлагает варианты оптимизации.',
  },
  {
    icon: LineChart,
    title: 'Работа без API',
    description: 'Добавляйте товары вручную по SKU и артикулу — API маркетплейсов подключается опционально для автоматической синхронизации.',
  },
];

const PRICING_PLANS = [
  {
    id: 'standard',
    name: 'Стандарт',
    price: '2 500',
    period: '₽/мес',
    description: 'Для начинающих продавцов',
    icon: Rocket,
    features: [
      'До 10 SKU',
      'Калькулятор прибыли',
      'Базовая аналитика',
      'Email-уведомления',
      'WB + Ozon',
    ],
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '4 990',
    period: '₽/мес',
    description: 'Для растущих продавцов',
    icon: Sparkles,
    features: [
      'До 50 SKU',
      'Репрайсер',
      'AI-рекомендации',
      'Биддер рекламный',
      'Расширенная аналитика',
      'Email + Telegram',
      'WB + Ozon',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '19 990',
    period: '₽/мес',
    description: 'Для крупных бизнесов',
    icon: Crown,
    features: [
      'Безлимит SKU',
      'Все функции Pro',
      'Приоритетная поддержка',
      'Персональный менеджер',
      'SLA 99.9%',
      'Команда и роли',
      'WB + Ozon',
    ],
    popular: false,
  },
];

const FAQ_ITEMS = [
  {
    question: 'Какие маркетплейсы поддерживаются?',
    answer: 'Мы работаем с Wildberries и Ozon. Все данные из обоих маркетплейсов отображаются в едином интерфейсе для удобного сравнения и управления.',
  },
  {
    question: 'Можно ли работать без подключения API маркетплейса?',
    answer: 'Да! Вы можете добавлять товары вручную по SKU или артикулу и вести полный расчёт юнит-экономики без API. Подключение API — опция для автоматической синхронизации данных.',
  },
  {
    question: 'Как происходит оплата и получение доступа?',
    answer: 'Вы выбираете тариф, оплачиваете через ЮKassa (карты, СБП, электронные кошельки). После оплаты на вашу почту приходит приветственное письмо с данными для входа. Регистрация не требуется.',
  },
  {
    question: 'Можно ли отменить подписку?',
    answer: 'Да, вы можете отменить подписку в любой момент без штрафов. Доступ сохраняется до конца оплаченного периода.',
  },
  {
    question: 'Что такое демо-режим?',
    answer: 'Демо-режим позволяет ознакомиться со всеми функциями платформы на тестовых данных без оплаты. Вы увидите, как работает дашборд, аналитика и другие инструменты.',
  },
  {
    question: 'Как работает AI-рекомендации?',
    answer: 'Наша модель анализирует цены конкурентов, историю продаж, сезонные тренды и эластичность спроса. На основе этого система предлагает оптимальную цену для максимизации прибыли.',
  },
];

export default function Landing() {
  const { user, login } = useAuth();
  const { setDemoMode } = useDemoMode();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [paymentEmail, setPaymentEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmationUrl, setConfirmationUrl] = useState('');

  const handleDemoClick = () => {
    setDemoMode(true);
    window.location.href = '/demo';
  };

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    setPaymentDialogOpen(true);
    setConfirmationUrl('');
  };

  const handlePayment = async () => {
    if (!paymentEmail.trim() || !paymentEmail.includes('@')) {
      toast.error('Введите корректный email');
      return;
    }

    setIsProcessing(true);
    try {
      const plan = PRICING_PLANS.find(p => p.id === selectedPlan);
      const amount = parseInt(plan?.price.replace(/\s/g, '') || '0');

      const response = await client.apiCall.invoke({
        url: '/api/v1/payments/create',
        method: 'POST',
        data: {
          plan_id: selectedPlan,
          amount,
          email: paymentEmail,
          description: `Подписка ProfitPilot AI — ${plan?.name}`,
        },
      });

      const data = response.data;
      if (data.confirmation_url) {
        setConfirmationUrl(data.confirmation_url);
        toast.success('Перенаправление на страницу оплаты...');
        setTimeout(() => {
          window.open(data.confirmation_url, '_blank');
        }, 1000);
      } else {
        throw new Error('Не получена ссылка на оплату');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка при создании платежа. Попробуйте позже.';
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#0a0a0f]" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-emerald-500/20 via-emerald-500/5 to-transparent rounded-full blur-[120px]" />
        </div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/8 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-blue-500/6 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-violet-500/5 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
                <Compass className="w-5 h-5 text-white relative z-10" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Profit<span className="text-emerald-400">Pilot</span> <span className="text-xs font-normal text-white/30">AI</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} className="text-sm font-medium text-white/50 hover:text-white transition-colors duration-200">
                  {link.label}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" onClick={handleDemoClick} className="text-white/50 hover:text-white hover:bg-white/5 gap-2">
                <Eye className="w-4 h-4" />
                Демо
              </Button>
              {user ? (
                <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium shadow-lg shadow-emerald-500/25">
                  <a href="/app">
                    Перейти в приложение
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </a>
                </Button>
              ) : (
                <Button onClick={login} className="bg-white/10 hover:bg-white/15 text-white border border-white/10 gap-2">
                  <LogIn className="w-4 h-4" />
                  Войти
                </Button>
              )}
            </div>

            <button className="md:hidden p-2 text-white/60" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0d0d14] border-t border-white/[0.04] px-4 py-4 space-y-3">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="block text-sm text-white/50 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>
                {link.label}
              </a>
            ))}
            <div className="pt-3 border-t border-white/[0.06] flex flex-col gap-2">
              <Button variant="ghost" onClick={handleDemoClick} className="justify-start text-white/50 hover:text-white gap-2">
                <Eye className="w-4 h-4" /> Демо
              </Button>
              {user ? (
                <Button asChild className="bg-emerald-500 text-white">
                  <a href="/app">Перейти в приложение</a>
                </Button>
              ) : (
                <Button onClick={login} className="bg-white/10 text-white border border-white/10 gap-2">
                  <LogIn className="w-4 h-4" /> Войти
                </Button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10 px-4 py-1.5 mb-6">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Оптимизатор юнит-экономики для WB и Ozon
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Увеличьте прибыль на
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300"> маркетплейсах</span>
            <br />с помощью AI
          </h1>
          <p className="text-lg sm:text-xl text-white/40 max-w-3xl mx-auto mb-10 leading-relaxed">
            ProfitPilot AI рассчитывает юнит-экономику каждого SKU, находит убыточные товары и автоматически оптимизирует цены на Wildberries и Ozon
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button onClick={() => handleSelectPlan('pro')} size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 h-12 shadow-xl shadow-emerald-500/25 text-base">
              Начать за 4 990 ₽/мес
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="ghost" onClick={handleDemoClick} size="lg" className="text-white/60 hover:text-white hover:bg-white/5 h-12 px-8 text-base gap-2">
              <Eye className="w-5 h-5" />
              Посмотреть демо
            </Button>
          </div>
          <p className="mt-4 text-xs text-white/25">
            После оплаты вы получите данные для входа на email • Работает без API маркетплейсов
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Всё для прибыльных продаж</h2>
            <p className="text-white/40 max-w-2xl mx-auto">Полный контроль над юнит-экономикой каждого товара на WB и Ozon</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <Card key={benefit.title} className="bg-white/[0.02] border-white/[0.06] hover:border-emerald-500/20 transition-all duration-300 group hover:bg-white/[0.04]">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/15 transition-colors">
                      <Icon className="h-6 w-6 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                    <p className="text-sm text-white/40 leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Тарифы</h2>
            <p className="text-white/40 max-w-2xl mx-auto">Оплатите — получите данные для входа на email. Никакой регистрации.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {PRICING_PLANS.map((plan) => {
              const Icon = plan.icon;
              return (
                <Card key={plan.id} className={`relative bg-white/[0.02] border-white/[0.06] ${plan.popular ? 'border-emerald-500/30 shadow-xl shadow-emerald-500/5 scale-[1.02]' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-emerald-500 hover:bg-emerald-500 px-3 py-1 text-white shadow-lg">
                        <Sparkles className="h-3 w-3 mr-1" />Популярный
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-6 pt-8 text-center">
                    <div className="h-14 w-14 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-7 w-7 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                    <p className="text-sm text-white/30 mb-4">{plan.description}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      <span className="text-sm text-white/30 ml-1">{plan.period}</span>
                    </div>
                    <Button
                      onClick={() => handleSelectPlan(plan.id)}
                      className={`w-full mb-6 ${plan.popular ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25' : 'bg-white/10 hover:bg-white/15 text-white'}`}
                    >
                      Оплатить и начать
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                    <div className="space-y-3 text-left">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2.5">
                          <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                          <span className="text-sm text-white/50">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-10 py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Частые вопросы</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {FAQ_ITEMS.map((item, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`} className="border border-white/[0.06] rounded-xl px-6 bg-white/[0.02]">
                <AccordionTrigger className="text-left text-white/80 hover:text-white py-5 text-base">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-white/40 pb-5 leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.04] py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">ProfitPilot <span className="text-emerald-400">AI</span></span>
          </div>
          <p className="text-sm text-white/30">© 2026 ProfitPilot AI. Оптимизация прибыли на WB и Ozon.</p>
        </div>
      </footer>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="bg-[#0d0d14] border-white/[0.08] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Оплата тарифа {PRICING_PLANS.find(p => p.id === selectedPlan)?.name}
            </DialogTitle>
            <DialogDescription className="text-white/40">
              После оплаты на вашу почту придёт приветственное письмо с данными для входа
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <div className="flex justify-between items-center">
                <span className="text-white/60">Тариф</span>
                <span className="font-semibold text-white">{PRICING_PLANS.find(p => p.id === selectedPlan)?.name}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-white/60">Сумма</span>
                <span className="font-bold text-emerald-400 text-lg">{PRICING_PLANS.find(p => p.id === selectedPlan)?.price} ₽/мес</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-white/60">Email для получения данных входа</Label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={paymentEmail}
                onChange={(e) => setPaymentEmail(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-emerald-500/50"
              />
            </div>
            {confirmationUrl && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-sm text-emerald-400 mb-2">Ссылка на оплату готова:</p>
                <a href={confirmationUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-300 underline break-all">
                  {confirmationUrl}
                </a>
              </div>
            )}
          </div>
          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-11 shadow-lg shadow-emerald-500/25"
          >
            {isProcessing ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Создание платежа...</>
            ) : (
              <>Перейти к оплате<ArrowRight className="h-4 w-4 ml-2" /></>
            )}
          </Button>
          <p className="text-xs text-white/25 text-center">
            Безопасная оплата через ЮKassa • Карты, СБП, электронные кошельки
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
