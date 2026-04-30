import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Store,
  Key,
  Check,
  X,
  RefreshCw,
  ArrowRightLeft,
  Package,
  ShoppingCart,
  Megaphone,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

interface MarketplaceIntegration {
  id: string;
  name: string;
  description: string;
  color: string;
  bgColor: string;
  connected: boolean;
  apiKey: string;
  lastSync: string;
  autoImport: {
    orders: boolean;
    stocks: boolean;
    ads: boolean;
  };
}

interface SyncRecord {
  id: number;
  marketplace: string;
  type: string;
  status: 'success' | 'error' | 'in_progress';
  items: number;
  date: string;
  duration: string;
}

const initialIntegrations: MarketplaceIntegration[] = [
  {
    id: 'wb',
    name: 'Wildberries',
    description: 'Синхронизация заказов, остатков и рекламных кампаний через API WB',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    connected: false,
    apiKey: '',
    lastSync: '',
    autoImport: { orders: false, stocks: false, ads: false },
  },
  {
    id: 'ozon',
    name: 'Ozon',
    description: 'Импорт данных о продажах, складах и продвижении через Ozon API',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    connected: false,
    apiKey: '',
    lastSync: '',
    autoImport: { orders: false, stocks: false, ads: false },
  },
];

const mockSyncHistory: SyncRecord[] = [
  { id: 1, marketplace: 'Wildberries', type: 'Заказы', status: 'success', items: 156, date: '2026-04-28 10:30', duration: '12 сек' },
  { id: 2, marketplace: 'Wildberries', type: 'Остатки', status: 'success', items: 423, date: '2026-04-28 10:30', duration: '8 сек' },
  { id: 3, marketplace: 'Ozon', type: 'Заказы', status: 'success', items: 89, date: '2026-04-28 09:15', duration: '15 сек' },
  { id: 4, marketplace: 'Wildberries', type: 'Реклама', status: 'error', items: 0, date: '2026-04-28 09:00', duration: '—' },
  { id: 5, marketplace: 'Ozon', type: 'Остатки', status: 'success', items: 312, date: '2026-04-28 09:15', duration: '10 сек' },
  { id: 6, marketplace: 'Wildberries', type: 'Заказы', status: 'success', items: 134, date: '2026-04-27 10:30', duration: '11 сек' },
  { id: 7, marketplace: 'Ozon', type: 'Заказы', status: 'success', items: 76, date: '2026-04-27 09:15', duration: '14 сек' },
  { id: 8, marketplace: 'Wildberries', type: 'Остатки', status: 'success', items: 418, date: '2026-04-27 10:30', duration: '9 сек' },
];

const Integrations: React.FC = () => {
  const [integrations, setIntegrations] = useState<MarketplaceIntegration[]>(initialIntegrations);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [selectedMp, setSelectedMp] = useState<string>('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [syncing, setSyncing] = useState<string>('');

  const handleConnect = () => {
    if (!apiKeyInput.trim()) {
      toast.error('Введите API-ключ');
      return;
    }
    setIntegrations(prev =>
      prev.map(mp =>
        mp.id === selectedMp
          ? { ...mp, connected: true, apiKey: apiKeyInput, lastSync: '—', autoImport: { orders: true, stocks: true, ads: false } }
          : mp
      )
    );
    toast.success('Маркетплейс подключён');
    setConnectDialogOpen(false);
    setApiKeyInput('');
  };

  const handleDisconnect = (id: string) => {
    setIntegrations(prev =>
      prev.map(mp =>
        mp.id === id
          ? { ...mp, connected: false, apiKey: '', lastSync: '', autoImport: { orders: false, stocks: false, ads: false } }
          : mp
      )
    );
    toast.success('Маркетплейс отключён');
  };

  const handleSync = (id: string) => {
    setSyncing(id);
    setTimeout(() => {
      setSyncing('');
      setIntegrations(prev =>
        prev.map(mp =>
          mp.id === id ? { ...mp, lastSync: new Date().toLocaleString('ru-RU') } : mp
        )
      );
      toast.success('Синхронизация завершена');
    }, 2000);
  };

  const toggleAutoImport = (mpId: string, field: 'orders' | 'stocks' | 'ads') => {
    setIntegrations(prev =>
      prev.map(mp =>
        mp.id === mpId
          ? { ...mp, autoImport: { ...mp.autoImport, [field]: !mp.autoImport[field] } }
          : mp
      )
    );
    toast.success('Настройки автоимпорта обновлены');
  };

  const openConnectDialog = (mpId: string) => {
    setSelectedMp(mpId);
    setApiKeyInput('');
    setConnectDialogOpen(true);
  };

  const statusIcon = (status: SyncRecord['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'in_progress':
        return <Loader2 className="h-4 w-4 text-amber-400 animate-spin" />;
    }
  };

  const statusLabel = (status: SyncRecord['status']) => {
    switch (status) {
      case 'success': return 'Успешно';
      case 'error': return 'Ошибка';
      case 'in_progress': return 'В процессе';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Интеграции</h1>
        <p className="text-slate-300 dark:text-white/30 mt-1">Подключение маркетплейсов и управление синхронизацией данных</p>
      </div>

      {/* Marketplace Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map(mp => (
          <Card key={mp.id} className={`bg-white dark:bg-[#0d0d14] ${!mp.connected ? 'border-dashed border-white/[0.1]' : 'border-slate-200 dark:border-white/[0.06]'}`}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 mb-4">
                <div className={`h-11 w-11 rounded-lg ${mp.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <Store className={`h-5 w-5 ${mp.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{mp.name}</h3>
                    {mp.connected ? (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10 text-xs">
                        <Check className="h-3 w-3 mr-0.5" />Подключён
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs bg-white/[0.04] text-slate-300 dark:text-white/30">
                        Не подключён
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 dark:text-white/30 mt-1">{mp.description}</p>
                </div>
              </div>

              {mp.connected && (
                <>
                  <div className="flex items-center gap-2 text-xs text-slate-300 dark:text-white/30 mb-3 bg-white/[0.03] rounded-md px-3 py-2">
                    <Key className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{mp.apiKey.slice(0, 12)}...{mp.apiKey.slice(-4)}</span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-medium text-slate-400 dark:text-white/40">Авто-импорт:</p>
                    {[
                      { key: 'orders' as const, label: 'Заказы', icon: ShoppingCart },
                      { key: 'stocks' as const, label: 'Остатки', icon: Package },
                      { key: 'ads' as const, label: 'Реклама', icon: Megaphone },
                    ].map(item => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.key}
                          onClick={() => toggleAutoImport(mp.id, item.key)}
                          className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded-md transition-colors w-full ${
                            mp.autoImport[item.key]
                              ? 'bg-violet-500/10 text-violet-400'
                              : 'bg-white/[0.03] text-slate-300 dark:text-white/20'
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {item.label}
                          {mp.autoImport[item.key] ? <Check className="h-3 w-3 ml-auto" /> : <X className="h-3 w-3 ml-auto" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-300 dark:text-white/20 mb-4">
                    <Clock className="h-3.5 w-3.5" />
                    Последняя синхронизация: {mp.lastSync}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1 border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 hover:text-slate-500 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.04]"
                      onClick={() => handleSync(mp.id)}
                      disabled={syncing === mp.id}
                    >
                      {syncing === mp.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )}
                      {syncing === mp.id ? 'Синхронизация...' : 'Синхронизировать'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-300 dark:text-white/20 hover:text-red-400 hover:bg-red-500/10"
                      onClick={() => handleDisconnect(mp.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </>
              )}

              {!mp.connected && (
                <Button
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-1"
                  onClick={() => openConnectDialog(mp.id)}
                >
                  <ExternalLink className="h-4 w-4" />Подключить
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sync History */}
      <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900 dark:text-white">История синхронизаций</CardTitle>
              <CardDescription className="text-slate-300 dark:text-white/30">Последние операции импорта данных</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-1 border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 hover:text-slate-500 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.04]">
              <RefreshCw className="h-3.5 w-3.5" />Обновить
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/[0.06]">
                  <th className="text-left py-3 px-2 font-medium text-slate-300 dark:text-white/30">Маркетплейс</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-300 dark:text-white/30">Тип</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-300 dark:text-white/30">Статус</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-300 dark:text-white/30">Записей</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-300 dark:text-white/30">Дата</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-300 dark:text-white/30">Длительность</th>
                </tr>
              </thead>
              <tbody>
                {mockSyncHistory.map(record => (
                  <tr key={record.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="py-3 px-2 font-medium text-slate-600 dark:text-white/70">{record.marketplace}</td>
                    <td className="py-3 px-2 text-slate-400 dark:text-white/40">
                      <div className="flex items-center gap-1.5">
                        <ArrowRightLeft className="h-3.5 w-3.5 text-slate-300 dark:text-white/20" />
                        {record.type}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1.5">
                        {statusIcon(record.status)}
                        <span className={record.status === 'success' ? 'text-emerald-400' : record.status === 'error' ? 'text-red-400' : 'text-amber-400'}>
                          {statusLabel(record.status)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-slate-400 dark:text-white/40">{record.items > 0 ? record.items : '—'}</td>
                    <td className="py-3 px-2 text-slate-300 dark:text-white/30">{record.date}</td>
                    <td className="py-3 px-2 text-slate-300 dark:text-white/30">{record.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Connect Dialog */}
      <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">Подключение маркетплейса</DialogTitle>
            <DialogDescription className="text-slate-300 dark:text-white/30">
              Введите API-ключ для подключения {integrations.find(m => m.id === selectedMp)?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 dark:text-white/50">API-ключ</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 dark:text-white/20" />
                <Input
                  value={apiKeyInput}
                  onChange={e => setApiKeyInput(e.target.value)}
                  placeholder="Введите API-ключ маркетплейса"
                  className="pl-9 bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white placeholder:text-slate-900 dark:text-white/15"
                />
              </div>
              <p className="text-xs text-slate-300 dark:text-white/20">
                API-ключ можно получить в личном кабинете маркетплейса в разделе настроек интеграций
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConnectDialogOpen(false)} className="border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 hover:text-slate-500 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.04]">Отмена</Button>
            <Button onClick={handleConnect} className="bg-violet-600 hover:bg-violet-700 text-white">Подключить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Integrations;