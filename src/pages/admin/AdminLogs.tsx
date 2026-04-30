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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ScrollText,
  Search,
  Download,
  Filter,
  Calendar,
  User,
  Activity,
  AlertTriangle,
  Info,
  Shield,
  Settings,
  LogIn,
  LogOut,
  CreditCard,
  Pencil,
  Trash2,
  Eye,
} from 'lucide-react';

// ─── Mock Data ───────────────────────────────────────────────

type ActionType =
  | 'login'
  | 'logout'
  | 'plan_change'
  | 'payment'
  | 'sku_add'
  | 'sku_delete'
  | 'repricer_change'
  | 'settings_change'
  | 'user_block'
  | 'user_unblock'
  | 'content_edit'
  | 'bid_change'
  | 'card_edit'
  | 'alert_dismiss'
  | 'export_data';

interface LogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  email: string;
  action: ActionType;
  details: string;
  ip: string;
  severity: 'info' | 'warning' | 'critical';
}

const actionLabels: Record<ActionType, string> = {
  login: 'Вход',
  logout: 'Выход',
  plan_change: 'Смена тарифа',
  payment: 'Оплата',
  sku_add: 'Добавление SKU',
  sku_delete: 'Удаление SKU',
  repricer_change: 'Изменение репрайсера',
  settings_change: 'Изменение настроек',
  user_block: 'Блокировка пользователя',
  user_unblock: 'Разблокировка пользователя',
  content_edit: 'Редактирование контента',
  bid_change: 'Изменение ставки',
  card_edit: 'Редактирование карточки',
  alert_dismiss: 'Отклонение алерта',
  export_data: 'Экспорт данных',
};

const actionIcons: Record<ActionType, React.ReactNode> = {
  login: <LogIn className="h-4 w-4" />,
  logout: <LogOut className="h-4 w-4" />,
  plan_change: <CreditCard className="h-4 w-4" />,
  payment: <CreditCard className="h-4 w-4" />,
  sku_add: <Activity className="h-4 w-4" />,
  sku_delete: <Trash2 className="h-4 w-4" />,
  repricer_change: <Settings className="h-4 w-4" />,
  settings_change: <Settings className="h-4 w-4" />,
  user_block: <Shield className="h-4 w-4" />,
  user_unblock: <Shield className="h-4 w-4" />,
  content_edit: <Pencil className="h-4 w-4" />,
  bid_change: <Activity className="h-4 w-4" />,
  card_edit: <Pencil className="h-4 w-4" />,
  alert_dismiss: <AlertTriangle className="h-4 w-4" />,
  export_data: <Download className="h-4 w-4" />,
};

const severityBadge: Record<string, string> = {
  info: 'bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/10',
  warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/10',
  critical: 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/10',
};

const severityLabel: Record<string, string> = {
  info: 'Info',
  warning: 'Warning',
  critical: 'Critical',
};

const mockLogs: LogEntry[] = [
  { id: 'l1', timestamp: '2026-04-28 14:32:15', userId: 'u1', userName: 'Иван Петров', email: 'ivan@example.com', action: 'login', details: 'Вход в систему', ip: '192.168.1.45', severity: 'info' },
  { id: 'l2', timestamp: '2026-04-28 14:28:03', userId: 'u2', userName: 'Мария Сидорова', email: 'maria@shop.ru', action: 'repricer_change', details: 'Изменена стратегия репрайсера SKU-4521: Мин. ставка → Оптимизация ROI', ip: '10.0.0.12', severity: 'info' },
  { id: 'l3', timestamp: '2026-04-28 14:15:47', userId: 'u5', userName: 'Дмитрий Новиков', email: 'dmitry@new.ru', action: 'login', details: 'Попытка входа заблокированного пользователя', ip: '203.0.113.5', severity: 'warning' },
  { id: 'l4', timestamp: '2026-04-28 13:58:22', userId: 'u3', userName: 'Алексей Козлов', email: 'alex@brand.com', action: 'plan_change', details: 'Смена тарифа: Free → Pro', ip: '172.16.0.8', severity: 'info' },
  { id: 'l5', timestamp: '2026-04-28 13:45:10', userId: 'u7', userName: 'Сергей Лебедев', email: 'sergey@biz.ru', action: 'bid_change', details: 'Ставка кампании «Летняя распродажа» увеличена до 85₽ (DRR 18.2% → 22.1%)', ip: '10.0.0.99', severity: 'warning' },
  { id: 'l6', timestamp: '2026-04-28 13:30:55', userId: 'u6', userName: 'Ольга Морозова', email: 'olga@store.ru', action: 'payment', details: 'Ошибка оплаты Pro: карта отклонена', ip: '192.168.2.33', severity: 'critical' },
  { id: 'l7', timestamp: '2026-04-28 13:12:08', userId: 'u1', userName: 'Иван Петров', email: 'ivan@example.com', action: 'sku_add', details: 'Добавлено 15 SKU через импорт', ip: '192.168.1.45', severity: 'info' },
  { id: 'l8', timestamp: '2026-04-28 12:55:33', userId: 'admin', userName: 'Admin', email: 'admin@profitpilot.ai', action: 'user_block', details: 'Пользователь anna@retail.ru заблокирован: нарушение условий', ip: '10.0.0.1', severity: 'warning' },
  { id: 'l9', timestamp: '2026-04-28 12:40:19', userId: 'u2', userName: 'Мария Сидорова', email: 'maria@shop.ru', action: 'card_edit', details: 'Обновлена карточка SKU-789: заголовок, описание, характеристики', ip: '10.0.0.12', severity: 'info' },
  { id: 'l10', timestamp: '2026-04-28 12:22:41', userId: 'u9', userName: 'Павел Соколов', email: 'pavel@goods.ru', action: 'export_data', details: 'Экспорт отчёта по SKU (67 записей)', ip: '172.16.0.55', severity: 'info' },
  { id: 'l11', timestamp: '2026-04-28 11:58:07', userId: 'u4', userName: 'Елена Волкова', email: 'elena@market.ru', action: 'alert_dismiss', details: 'Отклонён алерт: DRR кампании «Зима 2026» превышен на 5%', ip: '192.168.3.22', severity: 'warning' },
  { id: 'l12', timestamp: '2026-04-28 11:30:15', userId: 'u7', userName: 'Сергей Лебедев', email: 'sergey@biz.ru', action: 'sku_delete', details: 'Удалено 3 неактивных SKU', ip: '10.0.0.99', severity: 'info' },
  { id: 'l13', timestamp: '2026-04-28 10:45:33', userId: 'admin', userName: 'Admin', email: 'admin@profitpilot.ai', action: 'settings_change', details: 'Изменена комиссия WB: 18% → 19%', ip: '10.0.0.1', severity: 'info' },
  { id: 'l14', timestamp: '2026-04-28 10:12:08', userId: 'u8', userName: 'Нина Кузнецова', email: 'nina@fashion.ru', action: 'login', details: 'Первый вход (триал)', ip: '203.0.113.42', severity: 'info' },
  { id: 'l15', timestamp: '2026-04-28 09:55:19', userId: 'u1', userName: 'Иван Петров', email: 'ivan@example.com', action: 'logout', details: 'Выход из системы', ip: '192.168.1.45', severity: 'info' },
];

const actionTypes: ActionType[] = [
  'login', 'logout', 'plan_change', 'payment', 'sku_add', 'sku_delete',
  'repricer_change', 'settings_change', 'user_block', 'user_unblock',
  'content_edit', 'bid_change', 'card_edit', 'alert_dismiss', 'export_data',
];

// ─── Component ───────────────────────────────────────────────

const AdminLogs: React.FC = () => {
  const [logs] = useState<LogEntry[]>(mockLogs);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filtered = logs.filter((l) => {
    const matchSearch =
      l.userName.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === 'all' || l.action === actionFilter;
    const matchSeverity = severityFilter === 'all' || l.severity === severityFilter;
    const logDate = l.timestamp.split(' ')[0];
    const matchDateFrom = !dateFrom || logDate >= dateFrom;
    const matchDateTo = !dateTo || logDate <= dateTo;
    return matchSearch && matchAction && matchSeverity && matchDateFrom && matchDateTo;
  });

  const handleExport = () => {
    const headers = ['Timestamp', 'User', 'Email', 'Action', 'Details', 'IP', 'Severity'];
    const rows = filtered.map((l) => [
      l.timestamp, l.userName, l.email, actionLabels[l.action], l.details, l.ip, l.severity,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const infoCount = logs.filter((l) => l.severity === 'info').length;
  const warningCount = logs.filter((l) => l.severity === 'warning').length;
  const criticalCount = logs.filter((l) => l.severity === 'critical').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Логи действий</h1>
          <p className="text-slate-400 dark:text-white/40 mt-1">История действий пользователей на платформе</p>
        </div>
        <Button variant="outline" className="border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/60 hover:text-white hover:bg-slate-100 dark:hover:bg-white/5" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />Экспорт CSV
        </Button>
      </div>

      {/* Severity Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Info className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{infoCount}</p>
              <p className="text-sm text-slate-400 dark:text-white/40">Info</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{warningCount}</p>
              <p className="text-sm text-slate-400 dark:text-white/40">Warning</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{criticalCount}</p>
              <p className="text-sm text-slate-400 dark:text-white/40">Critical</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 dark:text-white/30" />
              <Input
                placeholder="Поиск по имени, email, действию..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Тип действия" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все действия</SelectItem>
                {actionTypes.map((a) => (
                  <SelectItem key={a} value={a}>{actionLabels[a]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Важность" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-[150px]"
              placeholder="С"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-[150px]"
              placeholder="По"
            />
            <Badge variant="outline" className="text-xs border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/50">{filtered.length} записей</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 dark:border-white/[0.06] hover:bg-transparent">
                <TableHead className="text-slate-400 dark:text-white/40">Время</TableHead>
                <TableHead className="text-slate-400 dark:text-white/40">Пользователь</TableHead>
                <TableHead className="text-slate-400 dark:text-white/40">Действие</TableHead>
                <TableHead className="text-slate-400 dark:text-white/40">Детали</TableHead>
                <TableHead className="text-slate-400 dark:text-white/40">IP</TableHead>
                <TableHead className="text-slate-400 dark:text-white/40">Важность</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((l) => (
                <TableRow key={l.id} className="border-slate-200 dark:border-white/[0.06]">
                  <TableCell className="text-xs text-slate-400 dark:text-white/40 whitespace-nowrap">{l.timestamp}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm text-slate-900 dark:text-white">{l.userName}</p>
                      <p className="text-xs text-slate-300 dark:text-white/30">{l.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300 dark:text-white/30">{actionIcons[l.action]}</span>
                      <span className="text-sm text-slate-500 dark:text-white/60">{actionLabels[l.action]}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm max-w-[300px] truncate text-slate-500 dark:text-white/60" title={l.details}>{l.details}</TableCell>
                  <TableCell className="text-xs text-slate-300 dark:text-white/30 font-mono">{l.ip}</TableCell>
                  <TableCell><Badge className={severityBadge[l.severity]}>{severityLabel[l.severity]}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogs;