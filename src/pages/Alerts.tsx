import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bell, CheckCheck, AlertTriangle, TrendingDown, Info, Trash2, Filter } from 'lucide-react';
import { toast } from 'sonner';
import {
  alertApi,
  skuApi,
  type Alert,
  type Sku,
} from '@/lib/marketplace-api';

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [skus, setSkus] = useState<Sku[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRead, setFilterRead] = useState<string>('unread');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [alertsData, skusData] = await Promise.all([
        alertApi.getAll(),
        skuApi.getAll(),
      ]);
      setAlerts(alertsData);
      setSkus(skusData);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (alert: Alert) => {
    try {
      await alertApi.update(alert.id, { is_read: true });
      loadData();
    } catch (error: any) {
      toast.error('Ошибка обновления');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const unread = alerts.filter((a) => !a.is_read);
      await Promise.all(unread.map((a) => alertApi.update(a.id, { is_read: true })));
      toast.success('Все уведомления отмечены как прочитанные');
      loadData();
    } catch (error: any) {
      toast.error('Ошибка обновления');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await alertApi.delete(id);
      toast.success('Уведомление удалено');
      loadData();
    } catch (error: any) {
      toast.error('Ошибка удаления');
    }
  };

  const getSkuName = (skuId: number | null) => {
    if (!skuId) return null;
    return skus.find((s) => s.id === skuId)?.name || `SKU #${skuId}`;
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'unprofitable_sku':
        return <TrendingDown className="h-5 w-5 text-red-400" />;
      case 'low_margin':
        return <AlertTriangle className="h-5 w-5 text-amber-400" />;
      default:
        return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  const getAlertBg = (alert: Alert) => {
    if (alert.is_read) return 'bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]';
    switch (alert.type) {
      case 'unprofitable_sku':
        return 'bg-red-500/5 border-red-500/20';
      case 'low_margin':
        return 'bg-amber-500/5 border-amber-500/20';
      default:
        return 'bg-blue-500/5 border-blue-500/20';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'unprofitable_sku': return 'Убыточный SKU';
      case 'low_margin': return 'Низкая маржа';
      case 'price_change': return 'Изменение цены';
      default: return type;
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    const matchType = filterType === 'all' || alert.type === filterType;
    const matchRead = filterRead === 'all' ||
      (filterRead === 'unread' && !alert.is_read) ||
      (filterRead === 'read' && alert.is_read);
    return matchType && matchRead;
  });

  const unreadCount = alerts.filter((a) => !a.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Уведомления</h1>
          <p className="text-slate-300 dark:text-white/30 mt-1">
            {unreadCount > 0
              ? `${unreadCount} непрочитанных уведомлений`
              : 'Нет новых уведомлений'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllRead} className="border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 hover:text-slate-500 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.04]">
            <CheckCheck className="mr-2 h-4 w-4" />
            Прочитать все
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-300 dark:text-white/20" />
              <span className="text-sm text-slate-300 dark:text-white/30">Фильтры:</span>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px] bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-white/60">
                <SelectValue placeholder="Тип" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                <SelectItem value="unprofitable_sku">Убыточные</SelectItem>
                <SelectItem value="low_margin">Низкая маржа</SelectItem>
                <SelectItem value="price_change">Изменение цены</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterRead} onValueChange={setFilterRead}>
              <SelectTrigger className="w-[160px] bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-white/60">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="unread">Непрочитанные</SelectItem>
                <SelectItem value="read">Прочитанные</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 mx-auto mb-3 text-slate-200 dark:text-white/10" />
            <p className="text-slate-300 dark:text-white/30">Нет уведомлений</p>
            <p className="text-sm text-slate-300 dark:text-white/20 mt-1">
              Уведомления появляются автоматически при добавлении убыточных SKU
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <Card key={alert.id} className={`border ${getAlertBg(alert)}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="mt-0.5">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40">
                        {getTypeLabel(alert.type)}
                      </Badge>
                      {!alert.is_read && (
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      )}
                    </div>
                    <p className={`text-sm ${alert.is_read ? 'text-slate-300 dark:text-white/30' : 'text-slate-600 dark:text-white/70 font-medium'}`}>
                      {alert.message}
                    </p>
                    {alert.sku_id && (
                      <p className="text-xs text-slate-300 dark:text-white/20 mt-1">
                        SKU: {getSkuName(alert.sku_id)}
                      </p>
                    )}
                    {alert.threshold_value !== null && alert.current_value !== null && (
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-slate-300 dark:text-white/20">
                          Порог: {alert.threshold_value}{alert.type === 'low_margin' ? '%' : ''}
                        </span>
                        <span className="text-xs text-slate-300 dark:text-white/20">
                          Текущее: {alert.current_value?.toFixed(1)}{alert.type === 'low_margin' ? '%' : ''}
                        </span>
                      </div>
                    )}
                    {alert.created_at && (
                      <p className="text-xs text-slate-900 dark:text-white/15 mt-2">
                        {new Date(alert.created_at).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {!alert.is_read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMarkRead(alert)}
                        title="Отметить как прочитанное"
                        className="text-slate-300 dark:text-white/20 hover:text-slate-400 dark:text-white/50"
                      >
                        <CheckCheck className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(alert.id)}
                      title="Удалить"
                      className="text-slate-300 dark:text-white/20 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alerts;