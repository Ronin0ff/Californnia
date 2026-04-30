import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CreditCard,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  XCircle,
  CheckCircle,
  Clock,
  Calendar,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

// ─── Mock Data ───────────────────────────────────────────────

interface Subscription {
  id: string;
  userId: string;
  userName: string;
  email: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  startDate: string;
  nextBilling: string;
  amount: number;
  paymentMethod: string;
}

interface Payment {
  id: string;
  subscriptionId: string;
  userName: string;
  amount: number;
  date: string;
  status: 'success' | 'failed' | 'refunded';
  method: string;
}

const mockSubscriptions: Subscription[] = [
  { id: 's1', userId: 'u1', userName: 'Иван Петров', email: 'ivan@example.com', plan: 'pro', status: 'active', startDate: '2025-12-15', nextBilling: '2026-05-15', amount: 4990, paymentMethod: 'Карта •••• 4242' },
  { id: 's2', userId: 'u2', userName: 'Мария Сидорова', email: 'maria@shop.ru', plan: 'enterprise', status: 'active', startDate: '2025-11-03', nextBilling: '2026-05-03', amount: 49900, paymentMethod: 'Карта •••• 8888' },
  { id: 's3', userId: 'u3', userName: 'Алексей Козлов', email: 'alex@brand.com', plan: 'pro', status: 'active', startDate: '2026-01-20', nextBilling: '2026-05-20', amount: 4990, paymentMethod: 'Карта •••• 1234' },
  { id: 's4', userId: 'u4', userName: 'Елена Волкова', email: 'elena@market.ru', plan: 'free', status: 'active', startDate: '2026-03-10', nextBilling: '—', amount: 0, paymentMethod: '—' },
  { id: 's5', userId: 'u6', userName: 'Ольга Морозова', email: 'olga@store.ru', plan: 'pro', status: 'past_due', startDate: '2025-10-22', nextBilling: '2026-04-22', amount: 4990, paymentMethod: 'Карта •••• 5678' },
  { id: 's6', userId: 'u7', userName: 'Сергей Лебедев', email: 'sergey@biz.ru', plan: 'enterprise', status: 'active', startDate: '2025-09-05', nextBilling: '2026-05-05', amount: 49900, paymentMethod: 'Карта •••• 9999' },
  { id: 's7', userId: 'u9', userName: 'Павел Соколов', email: 'pavel@goods.ru', plan: 'pro', status: 'cancelled', startDate: '2026-01-08', nextBilling: '—', amount: 0, paymentMethod: '—' },
  { id: 's8', userId: 'u8', userName: 'Нина Кузнецова', email: 'nina@fashion.ru', plan: 'free', status: 'trialing', startDate: '2026-04-01', nextBilling: '2026-05-01', amount: 0, paymentMethod: '—' },
];

const mockPayments: Payment[] = [
  { id: 'p1', subscriptionId: 's1', userName: 'Иван Петров', amount: 4990, date: '2026-04-15', status: 'success', method: 'Карта •••• 4242' },
  { id: 'p2', subscriptionId: 's2', userName: 'Мария Сидорова', amount: 49900, date: '2026-04-03', status: 'success', method: 'Карта •••• 8888' },
  { id: 'p3', subscriptionId: 's3', userName: 'Алексей Козлов', amount: 4990, date: '2026-04-20', status: 'success', method: 'Карта •••• 1234' },
  { id: 'p4', subscriptionId: 's5', userName: 'Ольга Морозова', amount: 4990, date: '2026-04-22', status: 'failed', method: 'Карта •••• 5678' },
  { id: 'p5', subscriptionId: 's6', userName: 'Сергей Лебедев', amount: 49900, date: '2026-04-05', status: 'success', method: 'Карта •••• 9999' },
  { id: 'p6', subscriptionId: 's1', userName: 'Иван Петров', amount: 4990, date: '2026-03-15', status: 'success', method: 'Карта •••• 4242' },
  { id: 'p7', subscriptionId: 's9', userName: 'Павел Соколов', amount: 4990, date: '2026-03-08', status: 'refunded', method: 'Карта •••• 3333' },
  { id: 'p8', subscriptionId: 's2', userName: 'Мария Сидорова', amount: 49900, date: '2026-03-03', status: 'success', method: 'Карта •••• 8888' },
];

const statusBadge: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/10',
  cancelled: 'bg-white/5 text-slate-400 dark:text-white/40 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5',
  past_due: 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/10',
  trialing: 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/10',
};

const statusLabel: Record<string, string> = {
  active: 'Активна',
  cancelled: 'Отменена',
  past_due: 'Просрочена',
  trialing: 'Триал',
};

const planLabel: Record<string, string> = { free: 'Free', pro: 'Pro', enterprise: 'Enterprise' };
const planBadge: Record<string, string> = {
  free: 'bg-white/5 text-slate-400 dark:text-white/50 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5',
  pro: 'bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/10',
  enterprise: 'bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/10',
};

const paymentStatusBadge: Record<string, string> = {
  success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/10',
  failed: 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/10',
  refunded: 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/10',
};

const paymentStatusLabel: Record<string, string> = {
  success: 'Успешно',
  failed: 'Ошибка',
  refunded: 'Возврат',
};

// ─── Component ───────────────────────────────────────────────

const AdminSubscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState(mockSubscriptions);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'subscriptions' | 'payments'>('subscriptions');
  const [changePlanOpen, setChangePlanOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [newPlan, setNewPlan] = useState<string>('pro');

  const filteredSubs = subscriptions.filter((s) =>
    s.userName.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPayments = mockPayments.filter((p) =>
    p.userName.toLowerCase().includes(search.toLowerCase())
  );

  const handleChangePlan = () => {
    if (!selectedSub) return;
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === selectedSub.id
          ? { ...s, plan: newPlan as Subscription['plan'], amount: newPlan === 'pro' ? 4990 : newPlan === 'enterprise' ? 49900 : 0 }
          : s
      )
    );
    setChangePlanOpen(false);
    setSelectedSub(null);
  };

  const cancelSubscription = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => s.id === id ? { ...s, status: 'cancelled' as const, amount: 0, nextBilling: '—' } : s)
    );
  };

  const totalMRR = subscriptions
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + s.amount, 0);

  const activeCount = subscriptions.filter((s) => s.status === 'active').length;
  const pastDueCount = subscriptions.filter((s) => s.status === 'past_due').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Подписки и платежи</h1>
        <p className="text-slate-400 dark:text-white/40 mt-1">Управление подписками и историей платежей</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalMRR.toLocaleString('ru-RU')} ₽</p>
                <p className="text-sm text-slate-400 dark:text-white/40">MRR (активные)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{activeCount}</p>
                <p className="text-sm text-slate-400 dark:text-white/40">Активных подписок</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{pastDueCount}</p>
                <p className="text-sm text-slate-400 dark:text-white/40">Просроченных</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Toggle */}
      <div className="flex gap-2">
        <Button
          variant={tab === 'subscriptions' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTab('subscriptions')}
          className={tab === 'subscriptions' ? 'bg-violet-600 hover:bg-violet-700' : ''}
        >
          Подписки
        </Button>
        <Button
          variant={tab === 'payments' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTab('payments')}
          className={tab === 'payments' ? 'bg-violet-600 hover:bg-violet-700' : ''}
        >
          История платежей
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 dark:text-white/30" />
        <Input
          placeholder="Поиск..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Subscriptions Table */}
      {tab === 'subscriptions' && (
        <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 dark:border-white/[0.06] hover:bg-transparent">
                  <TableHead className="text-slate-400 dark:text-white/40">Пользователь</TableHead>
                  <TableHead className="text-slate-400 dark:text-white/40">Тариф</TableHead>
                  <TableHead className="text-slate-400 dark:text-white/40">Статус</TableHead>
                  <TableHead className="text-slate-400 dark:text-white/40">Сумма</TableHead>
                  <TableHead className="text-slate-400 dark:text-white/40">Начало</TableHead>
                  <TableHead className="text-slate-400 dark:text-white/40">След. списание</TableHead>
                  <TableHead className="text-slate-400 dark:text-white/40">Способ оплаты</TableHead>
                  <TableHead className="text-slate-400 dark:text-white/40">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubs.map((s) => (
                  <TableRow key={s.id} className="border-slate-200 dark:border-white/[0.06]">
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm text-slate-900 dark:text-white">{s.userName}</p>
                        <p className="text-xs text-slate-400 dark:text-white/40">{s.email}</p>
                      </div>
                    </TableCell>
                    <TableCell><Badge className={planBadge[s.plan]}>{planLabel[s.plan]}</Badge></TableCell>
                    <TableCell><Badge className={statusBadge[s.status]}>{statusLabel[s.status]}</Badge></TableCell>
                    <TableCell className="text-sm text-slate-500 dark:text-white/60">{s.amount > 0 ? `${s.amount.toLocaleString('ru-RU')} ₽/мес` : '—'}</TableCell>
                    <TableCell className="text-sm text-slate-400 dark:text-white/40">{s.startDate}</TableCell>
                    <TableCell className="text-sm text-slate-400 dark:text-white/40">{s.nextBilling}</TableCell>
                    <TableCell className="text-sm text-slate-400 dark:text-white/40">{s.paymentMethod}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/60 hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                          onClick={() => { setSelectedSub(s); setNewPlan(s.plan); setChangePlanOpen(true); }}
                        >
                          <ArrowUpRight className="h-3 w-3 mr-1" />Сменить
                        </Button>
                        {s.status === 'active' && s.plan !== 'free' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={() => cancelSubscription(s.id)}
                          >
                            <XCircle className="h-3 w-3 mr-1" />Отменить
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Payments Table */}
      {tab === 'payments' && (
        <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 dark:border-white/[0.06] hover:bg-transparent">
                  <TableHead className="text-slate-400 dark:text-white/40">Пользователь</TableHead>
                  <TableHead className="text-slate-400 dark:text-white/40">Сумма</TableHead>
                  <TableHead className="text-slate-400 dark:text-white/40">Дата</TableHead>
                  <TableHead className="text-slate-400 dark:text-white/40">Статус</TableHead>
                  <TableHead className="text-slate-400 dark:text-white/40">Способ оплаты</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((p) => (
                  <TableRow key={p.id} className="border-slate-200 dark:border-white/[0.06]">
                    <TableCell className="font-medium text-sm text-slate-900 dark:text-white">{p.userName}</TableCell>
                    <TableCell className="text-sm text-slate-500 dark:text-white/60">{p.amount.toLocaleString('ru-RU')} ₽</TableCell>
                    <TableCell className="text-sm text-slate-400 dark:text-white/40">{p.date}</TableCell>
                    <TableCell><Badge className={paymentStatusBadge[p.status]}>{paymentStatusLabel[p.status]}</Badge></TableCell>
                    <TableCell className="text-sm text-slate-400 dark:text-white/40">{p.method}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Change Plan Dialog */}
      <Dialog open={changePlanOpen} onOpenChange={setChangePlanOpen}>
        <DialogContent className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">Сменить тариф</DialogTitle>
          </DialogHeader>
          {selectedSub && (
            <div className="space-y-4 py-4">
              <p className="text-sm text-slate-500 dark:text-white/60">
                Пользователь: <span className="font-medium text-slate-900 dark:text-white">{selectedSub.userName}</span>
              </p>
              <p className="text-sm text-slate-500 dark:text-white/60">
                Текущий тариф: <Badge className={planBadge[selectedSub.plan]}>{planLabel[selectedSub.plan]}</Badge>
              </p>
              <div>
                <label className="text-sm font-medium mb-1 block text-slate-500 dark:text-white/60">Новый тариф</label>
                <Select value={newPlan} onValueChange={setNewPlan}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free — 0 ₽/мес</SelectItem>
                    <SelectItem value="pro">Pro — 4 990 ₽/мес</SelectItem>
                    <SelectItem value="enterprise">Enterprise — 49 900 ₽/мес</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild><Button variant="outline" className="border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/60">Отмена</Button></DialogClose>
            <Button className="bg-violet-600 hover:bg-violet-700" onClick={handleChangePlan}>Применить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSubscriptions;