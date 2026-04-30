import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  User,
  Mail,
  Phone,
  Bell,
  Store,
  Key,
  CreditCard,
  ArrowUpRight,
  Check,
  X,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';

// Mock data
const mockPaymentHistory = [
  { id: 1, date: '2026-04-15', amount: 4990, plan: 'Pro', status: 'Оплачено' },
  { id: 2, date: '2026-03-15', amount: 4990, plan: 'Pro', status: 'Оплачено' },
  { id: 3, date: '2026-02-15', amount: 0, plan: 'Free', status: 'Бесплатно' },
  { id: 4, date: '2026-01-15', amount: 0, plan: 'Free', status: 'Бесплатно' },
];

const mockMarketplaces = [
  { id: 'wb', name: 'Wildberries', connected: false, apiKey: '', lastSync: '' },
  { id: 'ozon', name: 'Ozon', connected: false, apiKey: '', lastSync: '' },
];

const mockNotificationSettings = [
  { id: 'price_changes', label: 'Изменение цен конкурентов', enabled: true },
  { id: 'low_stock', label: 'Низкие остатки на складе', enabled: true },
  { id: 'repricer_actions', label: 'Действия репрайсера', enabled: false },
  { id: 'bidder_alerts', label: 'Уведомления биддера', enabled: true },
  { id: 'weekly_report', label: 'Еженедельный отчёт', enabled: true },
  { id: 'ai_recommendations', label: 'AI-рекомендации', enabled: false },
];

const Profile: React.FC = () => {
  const { user, isOwner } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'personal' | 'notifications' | 'marketplaces' | 'payments'>('personal');
  const [notifications, setNotifications] = useState(mockNotificationSettings);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [editName, setEditName] = useState(user?.name || 'Иван Петров');
  const [editEmail, setEditEmail] = useState(user?.email || 'ivan@example.com');
  const [editPhone, setEditPhone] = useState('+7 (999) 123-45-67');
  const [planDialogOpen, setPlanDialogOpen] = useState(false);

  const toggleNotification = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, enabled: !n.enabled } : n))
    );
    toast.success('Настройки уведомлений обновлены');
  };

  const copyApiKey = (key: string) => {
    toast.success('API-ключ скопирован в буфер обмена');
  };

  const tabs = [
    { id: 'personal' as const, label: 'Личные данные', icon: User },
    { id: 'notifications' as const, label: 'Уведомления', icon: Bell },
    { id: 'marketplaces' as const, label: 'Маркетплейсы', icon: Store },
    { id: 'payments' as const, label: 'Платежи', icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Профиль</h1>
          <p className="text-slate-300 dark:text-white/30 mt-1">Управление аккаунтом и настройками</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-sm px-3 py-1">
            Pro план
          </Badge>
          {isOwner && (
            <Button
              onClick={() => navigate('/app/admin')}
              className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-sm px-3 py-1 h-8"
              variant="outline"
            >
              <Shield className="h-4 w-4 mr-1" />
              Админ-панель
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/[0.04] p-1 rounded-lg w-fit">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white/[0.06] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-300 dark:text-white/30 hover:text-slate-400 dark:text-white/50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Personal Data Tab */}
      {activeTab === 'personal' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Личные данные</CardTitle>
              <CardDescription className="text-slate-300 dark:text-white/30">Обновите вашу персональную информацию</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400 dark:text-white/50">Имя</label>
                  <Input value={editName} onChange={e => setEditName(e.target.value)} className="bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400 dark:text-white/50">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 dark:text-white/20" />
                    <Input value={editEmail} onChange={e => setEditEmail(e.target.value)} className="pl-9 bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400 dark:text-white/50">Телефон</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 dark:text-white/20" />
                    <Input value={editPhone} onChange={e => setEditPhone(e.target.value)} className="pl-9 bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400 dark:text-white/50">Дата регистрации</label>
                  <Input value="15 января 2026" disabled className="bg-white/[0.02] border-slate-200 dark:border-white/[0.06] text-slate-300 dark:text-white/30" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={() => toast.success('Данные сохранены')} className="bg-emerald-500 hover:bg-emerald-600 text-white">Сохранить изменения</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Аватар</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-2xl font-bold">
                  {editName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" className="border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 hover:text-slate-500 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.04]">Загрузить фото</Button>
              <div className="text-center text-sm">
                <p className="text-slate-500 dark:text-white/60">{editName}</p>
                <p className="text-slate-900 dark:text-white/25">{editEmail}</p>
              </div>
              <Separator className="bg-white/[0.06]" />
              <div className="w-full space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300 dark:text-white/30">Тариф</span>
                  <span className="font-medium text-violet-400">Pro</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300 dark:text-white/30">SKU</span>
                  <span className="font-medium text-slate-500 dark:text-white/60">47 / 500</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300 dark:text-white/30">Маркетплейсы</span>
                  <span className="font-medium text-slate-500 dark:text-white/60">2 / 3</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Настройки уведомлений</CardTitle>
            <CardDescription className="text-slate-300 dark:text-white/30">Выберите, о чём вы хотите получать уведомления</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {notifications.map((notif, idx) => (
              <React.Fragment key={notif.id}>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-white/60">{notif.label}</p>
                  </div>
                  <Switch
                    checked={notif.enabled}
                    onCheckedChange={() => toggleNotification(notif.id)}
                  />
                </div>
                {idx < notifications.length - 1 && <Separator className="bg-white/[0.04]" />}
              </React.Fragment>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Marketplaces Tab */}
      {activeTab === 'marketplaces' && (
        <div className="space-y-4">
          {mockMarketplaces.map(mp => (
            <Card key={mp.id} className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                      mp.id === 'wb' ? 'bg-purple-500/10' : mp.id === 'ozon' ? 'bg-blue-500/10' : 'bg-amber-500/10'
                    }`}>
                      <Store className={`h-6 w-6 ${
                        mp.id === 'wb' ? 'text-purple-400' : mp.id === 'ozon' ? 'text-blue-400' : 'text-amber-400'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{mp.name}</h3>
                        {mp.connected ? (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10">
                            <Check className="h-3 w-3 mr-1" />Подключён
                          </Badge>
                        ) : (
                          <Badge className="bg-white/[0.04] text-slate-300 dark:text-white/30 hover:bg-slate-100 dark:hover:bg-white/[0.04]">
                            <X className="h-3 w-3 mr-1" />Не подключён
                          </Badge>
                        )}
                      </div>
                      {mp.connected && (
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2 text-sm text-slate-300 dark:text-white/30">
                            <Key className="h-3.5 w-3.5" />
                            <span>API-ключ: {mp.apiKey}</span>
                            <button onClick={() => copyApiKey(mp.apiKey)} className="text-slate-300 dark:text-white/20 hover:text-slate-400 dark:text-white/40">
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setShowApiKey(prev => ({ ...prev, [mp.id]: !prev[mp.id] }))}
                              className="text-slate-300 dark:text-white/20 hover:text-slate-400 dark:text-white/40"
                            >
                              {showApiKey[mp.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                          <p className="text-xs text-slate-300 dark:text-white/20">Последняя синхронизация: {mp.lastSync}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    {mp.connected ? (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 hover:text-slate-500 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.04]">Синхронизировать</Button>
                        <Button variant="ghost" size="sm" className="text-slate-300 dark:text-white/20 hover:text-red-400 hover:bg-red-500/10">
                          Отключить
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white">
                        <ExternalLink className="h-4 w-4 mr-1" />Подключить
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-900 dark:text-white">Текущий тариф</CardTitle>
                  <CardDescription className="text-slate-300 dark:text-white/30">Ваш активный план подписки</CardDescription>
                </div>
                <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-1 border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 hover:text-slate-500 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.04]">
                      <ArrowUpRight className="h-4 w-4" />Сменить тариф
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
                    <DialogHeader>
                      <DialogTitle className="text-slate-900 dark:text-white">Смена тарифа</DialogTitle>
                      <DialogDescription className="text-slate-300 dark:text-white/30">Выберите новый тарифный план</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3 py-4">
                      {[
                        { name: 'Стандарт', price: '2 500 ₽/мес', current: false },
                        { name: 'Pro', price: '4 990 ₽/мес', current: true },
                        { name: 'Enterprise', price: '19 990 ₽/мес', current: false },
                      ].map(plan => (
                        <button
                          key={plan.name}
                          onClick={() => { toast.success(`Тариф изменён на ${plan.name}`); setPlanDialogOpen(false); }}
                          className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                            plan.current
                              ? 'border-violet-500/50 bg-violet-500/10'
                              : 'border-slate-200 dark:border-white/[0.06] hover:border-violet-500/30'
                          }`}
                        >
                          <div className="text-left">
                            <p className="font-semibold text-slate-900 dark:text-white">{plan.name}</p>
                            <p className="text-sm text-slate-300 dark:text-white/30">{plan.price}</p>
                          </div>
                          {plan.current && <Badge className="bg-violet-600 text-white">Текущий</Badge>}
                        </button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <CreditCard className="h-8 w-8 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Pro</h3>
                  <p className="text-slate-300 dark:text-white/30">4 990 ₽/мес • Следующее списание: 15.05.2026</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">История платежей</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/[0.06]">
                      <th className="text-left py-3 px-2 font-medium text-slate-300 dark:text-white/30">Дата</th>
                      <th className="text-left py-3 px-2 font-medium text-slate-300 dark:text-white/30">Тариф</th>
                      <th className="text-left py-3 px-2 font-medium text-slate-300 dark:text-white/30">Сумма</th>
                      <th className="text-left py-3 px-2 font-medium text-slate-300 dark:text-white/30">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockPaymentHistory.map(payment => (
                      <tr key={payment.id} className="border-b border-white/[0.04]">
                        <td className="py-3 px-2 text-slate-500 dark:text-white/60">{payment.date}</td>
                        <td className="py-3 px-2">
                          <Badge variant="secondary" className="bg-white/[0.04] text-slate-400 dark:text-white/40">{payment.plan}</Badge>
                        </td>
                        <td className="py-3 px-2 font-medium text-slate-500 dark:text-white/60">
                          {payment.amount > 0 ? `${payment.amount.toLocaleString()} ₽` : 'Бесплатно'}
                        </td>
                        <td className="py-3 px-2">
                          <Badge className={payment.status === 'Оплачено' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10' : 'bg-white/[0.04] text-slate-300 dark:text-white/30 hover:bg-slate-100 dark:hover:bg-white/[0.04]'}>
                            {payment.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Profile;