import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search, Package, Download, Upload, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import {
  skuApi,
  marketplaceApi,
  costStructureApi,
  alertApi,
  type Sku,
  type Marketplace,
  calculateProfitability,
} from '@/lib/marketplace-api';
import { useAuth } from '@/contexts/AuthContext';
import { canCreateSku, getPlanLimits, getSkuUsagePercent } from '@/lib/plan-limits';
import { Progress } from '@/components/ui/progress';

const SkuManagement: React.FC = () => {
  const { currentPlan, isOwner } = useAuth();
  const [skus, setSkus] = useState<Sku[]>([]);
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSku, setEditingSku] = useState<Sku | null>(null);
  const [filterMarketplace, setFilterMarketplace] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const emptyForm = {
    marketplace_id: '',
    article: '',
    name: '',
    category: '',
    purchase_price: '',
    selling_price: '',
    commission_pct: '',
    logistics_cost: '',
    return_rate_pct: '',
    storage_cost_monthly: '',
    ad_spend_per_unit: '',
    tax_rate_pct: '',
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadData();
  }, []);

  const DEFAULT_MARKETPLACES: Marketplace[] = [
    { id: 1, slug: 'wildberries', name: 'Wildberries', base_commission_pct: 15, logistics_base_cost: 80, return_cost_pct: 5, storage_daily_cost: 5, is_active: true },
    { id: 2, slug: 'ozon', name: 'Ozon', base_commission_pct: 12, logistics_base_cost: 70, return_cost_pct: 4, storage_daily_cost: 4, is_active: true },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const [skusData, mpData] = await Promise.all([
        skuApi.getAll(),
        marketplaceApi.getAll().catch(() => []),
      ]);
      setSkus(skusData);
      setMarketplaces(mpData.length > 0 ? mpData : DEFAULT_MARKETPLACES);
    } catch (error) {
      console.error('Failed to load data:', error);
      setMarketplaces(DEFAULT_MARKETPLACES);
    } finally {
      setLoading(false);
    }
  };

  const planLimits = getPlanLimits(currentPlan);
  const skuUsagePercent = getSkuUsagePercent(currentPlan, skus.length);
  const canAdd = isOwner || canCreateSku(currentPlan, skus.length);

  const openCreate = () => {
    if (!canAdd) {
      toast.error(`Лимит SKU для тарифа ${currentPlan || 'free'}: ${planLimits.maxSkus}. Перейдите на более высокий тариф.`);
      return;
    }
    setEditingSku(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (sku: Sku) => {
    setEditingSku(sku);
    setForm({
      marketplace_id: String(sku.marketplace_id),
      article: sku.article,
      name: sku.name,
      category: sku.category || '',
      purchase_price: String(sku.purchase_price),
      selling_price: String(sku.selling_price),
      commission_pct: String(sku.commission_pct || ''),
      logistics_cost: String(sku.logistics_cost || ''),
      return_rate_pct: String(sku.return_rate_pct || ''),
      storage_cost_monthly: String(sku.storage_cost_monthly || ''),
      ad_spend_per_unit: String(sku.ad_spend_per_unit || ''),
      tax_rate_pct: String(sku.tax_rate_pct || ''),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.article || !form.purchase_price || !form.selling_price) {
      toast.error('Заполните обязательные поля: артикул, название, цены');
      return;
    }

    const mpId = parseInt(form.marketplace_id) || 1;
    const mp = marketplaces.find((m) => m.id === mpId) || marketplaces[0];

    const skuData: Partial<Sku> = {
      marketplace_id: mpId,
      article: form.article,
      name: form.name,
      category: form.category,
      purchase_price: parseFloat(form.purchase_price) || 0,
      selling_price: parseFloat(form.selling_price) || 0,
      commission_pct: form.commission_pct !== '' ? parseFloat(form.commission_pct) : (mp?.base_commission_pct || 0),
      logistics_cost: form.logistics_cost !== '' ? parseFloat(form.logistics_cost) : (mp?.logistics_base_cost || 0),
      return_rate_pct: form.return_rate_pct !== '' ? parseFloat(form.return_rate_pct) : (mp?.return_cost_pct || 0),
      storage_cost_monthly: parseFloat(form.storage_cost_monthly) || 0,
      ad_spend_per_unit: parseFloat(form.ad_spend_per_unit) || 0,
      tax_rate_pct: parseFloat(form.tax_rate_pct) || 0,
    };

    const calc = calculateProfitability(skuData);
    skuData.net_profit = calc.netProfit;
    skuData.margin_pct = calc.marginPct;
    skuData.status = calc.status;

    try {
      if (editingSku) {
        await skuApi.update(editingSku.id, skuData);
        const existingCosts = await costStructureApi.getBySkuId(editingSku.id);
        const costData = {
          sku_id: editingSku.id,
          commission_amount: calc.commission,
          logistics_amount: calc.logistics,
          return_cost_amount: calc.returnCost,
          storage_amount: calc.storage,
          ad_spend_amount: calc.adSpend,
          vat_amount: calc.vat,
          total_cost: calc.totalCost,
          net_profit: calc.netProfit,
          margin_pct: calc.marginPct,
        };
        if (existingCosts.length > 0) {
          await costStructureApi.update(existingCosts[0].id, costData);
        } else {
          await costStructureApi.create(costData);
        }
        toast.success('SKU обновлён');
      } else {
        const newSku = await skuApi.create(skuData);
        await costStructureApi.create({
          sku_id: newSku.id,
          commission_amount: calc.commission,
          logistics_amount: calc.logistics,
          return_cost_amount: calc.returnCost,
          storage_amount: calc.storage,
          ad_spend_amount: calc.adSpend,
          vat_amount: calc.vat,
          total_cost: calc.totalCost,
          net_profit: calc.netProfit,
          margin_pct: calc.marginPct,
        });

        if (calc.status === 'unprofitable') {
          await alertApi.create({
            sku_id: newSku.id,
            type: 'unprofitable_sku',
            message: `SKU "${skuData.name}" убыточен: маржа ${calc.marginPct.toFixed(1)}%`,
            threshold_value: 0,
            current_value: calc.marginPct,
            is_read: false,
          });
        } else if (calc.marginPct < 5) {
          await alertApi.create({
            sku_id: newSku.id,
            type: 'low_margin',
            message: `SKU "${skuData.name}" низкая маржа: ${calc.marginPct.toFixed(1)}%`,
            threshold_value: 5,
            current_value: calc.marginPct,
            is_read: false,
          });
        }

        toast.success('SKU создан');
      }

      setDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error?.message || 'Ошибка сохранения');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить этот SKU?')) return;
    try {
      await skuApi.delete(id);
      toast.success('SKU удалён');
      loadData();
    } catch (error: any) {
      toast.error(error?.message || 'Ошибка удаления');
    }
  };

  const getMarketplaceName = (id: number) => {
    return marketplaces.find((m) => m.id === id)?.name || '—';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'profitable':
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Прибыльный</Badge>;
      case 'unprofitable':
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/20">Убыточный</Badge>;
      default:
        return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">Безубыточный</Badge>;
    }
  };

  const exportCSV = () => {
    const headers = ['Артикул', 'Название', 'Категория', 'Маркетплейс', 'Закупочная цена', 'Цена продажи', 'Комиссия %', 'Логистика', 'Возврат %', 'Хранение/мес', 'Реклама', 'НДС %', 'Прибыль', 'Маржа %', 'Статус'];
    const rows = filteredSkus.map(s => [
      s.article, s.name, s.category, getMarketplaceName(s.marketplace_id),
      s.purchase_price, s.selling_price, s.commission_pct, s.logistics_cost,
      s.return_rate_pct, s.storage_cost_monthly, s.ad_spend_per_unit, s.tax_rate_pct,
      s.net_profit, s.margin_pct, s.status,
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profitpilot-skus-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Экспортировано ${filteredSkus.length} SKU`);
  };

  const importCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const text = ev.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) {
          toast.error('Файл пуст или содержит только заголовки');
          return;
        }
        let imported = 0;
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim());
          if (cols.length < 12) continue;
          const mp = marketplaces.find(m => m.name.toLowerCase() === cols[3].toLowerCase());
          const data: Partial<Sku> = {
            article: cols[0],
            name: cols[1],
            category: cols[2],
            marketplace_id: mp?.id || marketplaces[0]?.id || 1,
            purchase_price: parseFloat(cols[4]) || 0,
            selling_price: parseFloat(cols[5]) || 0,
            commission_pct: parseFloat(cols[6]) || 0,
            logistics_cost: parseFloat(cols[7]) || 0,
            return_rate_pct: parseFloat(cols[8]) || 0,
            storage_cost_monthly: parseFloat(cols[9]) || 0,
            ad_spend_per_unit: parseFloat(cols[10]) || 0,
            tax_rate_pct: parseFloat(cols[11]) || 0,
          };
          const calc = calculateProfitability(data);
          data.net_profit = calc.netProfit;
          data.margin_pct = calc.marginPct;
          data.status = calc.status;
          await skuApi.create(data);
          imported++;
        }
        toast.success(`Импортировано ${imported} SKU`);
        loadData();
      } catch (err: any) {
        toast.error(err?.message || 'Ошибка импорта CSV');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredSkus = skus.filter((sku) => {
    const matchSearch =
      !search ||
      sku.name.toLowerCase().includes(search.toLowerCase()) ||
      sku.article.toLowerCase().includes(search.toLowerCase());
    const matchMp = filterMarketplace === 'all' || String(sku.marketplace_id) === filterMarketplace;
    const matchStatus = filterStatus === 'all' || sku.status === filterStatus;
    return matchSearch && matchMp && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Управление SKU</h1>
          <p className="text-slate-300 dark:text-white/30 mt-1">Добавляйте и редактируйте товары для анализа прибыльности</p>
          {planLimits.maxSkus !== Infinity && (
            <div className="flex items-center gap-3 mt-2">
              <Progress value={skuUsagePercent} className="h-1.5 w-32 bg-white/[0.06]" />
              <span className="text-xs text-white/30">{skus.length} / {planLimits.maxSkus} SKU</span>
              {!canAdd && <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs"><AlertTriangle className="h-3 w-3 mr-1" />Лимит</Badge>}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV} className="border-white/10 text-white/50 hover:text-white hover:bg-white/5" title="Экспорт CSV">
            <Download className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Экспорт</span>
          </Button>
          <Button variant="outline" size="sm" className="border-white/10 text-white/50 hover:text-white hover:bg-white/5 relative" title="Импорт CSV">
            <Upload className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Импорт</span>
            <input type="file" accept=".csv" onChange={importCSV} className="absolute inset-0 opacity-0 cursor-pointer" />
          </Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Plus className="mr-2 h-4 w-4" /> Добавить SKU
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-white">{editingSku ? 'Редактировать SKU' : 'Добавить SKU'}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label className="text-slate-400 dark:text-white/50">Маркетплейс *</Label>
                <Select
                  value={form.marketplace_id}
                  onValueChange={(v) => setForm({ ...form, marketplace_id: v })}
                >
                  <SelectTrigger className="bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white">
                    <SelectValue placeholder="Выберите маркетплейс" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
                    {marketplaces.map((mp) => (
                      <SelectItem key={mp.id} value={String(mp.id)}>
                        {mp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400 dark:text-white/50">Артикул *</Label>
                <Input
                  value={form.article}
                  onChange={(e) => setForm({ ...form, article: e.target.value })}
                  placeholder="Например: WB-12345"
                  className="bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white placeholder:text-slate-900 dark:text-white/15"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-slate-400 dark:text-white/50">Название товара *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Например: Футболка мужская хлопок"
                  className="bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white placeholder:text-slate-900 dark:text-white/15"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400 dark:text-white/50">Категория</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Например: Одежда"
                  className="bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white placeholder:text-slate-900 dark:text-white/15"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400 dark:text-white/50">Цена закупки (₽) *</Label>
                <Input
                  type="number"
                  value={form.purchase_price}
                  onChange={(e) => setForm({ ...form, purchase_price: e.target.value })}
                  placeholder="0"
                  className="bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white placeholder:text-slate-900 dark:text-white/15"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400 dark:text-white/50">Цена продажи (₽) *</Label>
                <Input
                  type="number"
                  value={form.selling_price}
                  onChange={(e) => setForm({ ...form, selling_price: e.target.value })}
                  placeholder="0"
                  className="bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white placeholder:text-slate-900 dark:text-white/15"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400 dark:text-white/50">Комиссия (%)</Label>
                <Input
                  type="number"
                  value={form.commission_pct}
                  onChange={(e) => setForm({ ...form, commission_pct: e.target.value })}
                  placeholder="Авто из маркетплейса"
                  className="bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white placeholder:text-slate-900 dark:text-white/15"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400 dark:text-white/50">Логистика (₽)</Label>
                <Input
                  type="number"
                  value={form.logistics_cost}
                  onChange={(e) => setForm({ ...form, logistics_cost: e.target.value })}
                  placeholder="0"
                  className="bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white placeholder:text-slate-900 dark:text-white/15"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400 dark:text-white/50">Процент возвратов (%)</Label>
                <Input
                  type="number"
                  value={form.return_rate_pct}
                  onChange={(e) => setForm({ ...form, return_rate_pct: e.target.value })}
                  placeholder="0"
                  className="bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white placeholder:text-slate-900 dark:text-white/15"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400 dark:text-white/50">Хранение в месяц (₽)</Label>
                <Input
                  type="number"
                  value={form.storage_cost_monthly}
                  onChange={(e) => setForm({ ...form, storage_cost_monthly: e.target.value })}
                  placeholder="0"
                  className="bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white placeholder:text-slate-900 dark:text-white/15"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400 dark:text-white/50">Реклама на единицу (₽)</Label>
                <Input
                  type="number"
                  value={form.ad_spend_per_unit}
                  onChange={(e) => setForm({ ...form, ad_spend_per_unit: e.target.value })}
                  placeholder="0"
                  className="bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white placeholder:text-slate-900 dark:text-white/15"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400 dark:text-white/50">НДС (%)</Label>
                <Input
                  type="number"
                  value={form.tax_rate_pct}
                  onChange={(e) => setForm({ ...form, tax_rate_pct: e.target.value })}
                  placeholder="0"
                  className="bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white placeholder:text-slate-900 dark:text-white/15"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/[0.06]">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 hover:text-slate-500 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.04]">
                Отмена
              </Button>
              <Button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                {editingSku ? 'Сохранить' : 'Создать'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 dark:text-white/20" />
              <Input
                className="pl-9 bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white placeholder:text-slate-900 dark:text-white/15"
                placeholder="Поиск по названию или артикулу..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={filterMarketplace} onValueChange={setFilterMarketplace}>
              <SelectTrigger className="w-[180px] bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white">
                <SelectValue placeholder="Маркетплейс" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
                <SelectItem value="all">Все маркетплейсы</SelectItem>
                {marketplaces.map((mp) => (
                  <SelectItem key={mp.id} value={String(mp.id)}>
                    {mp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[160px] bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="profitable">Прибыльные</SelectItem>
                <SelectItem value="unprofitable">Убыточные</SelectItem>
                <SelectItem value="break_even">Безубыточные</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* SKU Table */}
      <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
        <CardContent className="p-0">
          {filteredSkus.length === 0 ? (
            <div className="text-center py-12 text-slate-300 dark:text-white/20">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Нет SKU для отображения</p>
              <Button variant="outline" size="sm" className="mt-3 border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 hover:text-slate-500 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.04]" onClick={openCreate}>
                Добавить первый SKU
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 dark:border-white/[0.06] hover:bg-transparent">
                  <TableHead className="text-slate-300 dark:text-white/30">Название</TableHead>
                  <TableHead className="text-slate-300 dark:text-white/30">Маркетплейс</TableHead>
                  <TableHead className="text-slate-300 dark:text-white/30 text-right">Закупка</TableHead>
                  <TableHead className="text-slate-300 dark:text-white/30 text-right">Продажа</TableHead>
                  <TableHead className="text-slate-300 dark:text-white/30 text-right">Прибыль</TableHead>
                  <TableHead className="text-slate-300 dark:text-white/30 text-right">Маржа</TableHead>
                  <TableHead className="text-slate-300 dark:text-white/30">Статус</TableHead>
                  <TableHead className="text-slate-300 dark:text-white/30 text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSkus.map((sku) => (
                  <TableRow key={sku.id} className="border-white/[0.04] hover:bg-white/[0.02]">
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-600 dark:text-white/70">{sku.name}</p>
                        <p className="text-xs text-slate-300 dark:text-white/20">{sku.article}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-400 dark:text-white/40">{getMarketplaceName(sku.marketplace_id)}</TableCell>
                    <TableCell className="text-right text-slate-400 dark:text-white/40">{(sku.purchase_price || 0).toLocaleString('ru-RU')} ₽</TableCell>
                    <TableCell className="text-right text-slate-400 dark:text-white/40">{(sku.selling_price || 0).toLocaleString('ru-RU')} ₽</TableCell>
                    <TableCell className={`text-right font-medium ${
                      (sku.net_profit || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {(sku.net_profit || 0).toLocaleString('ru-RU')} ₽
                    </TableCell>
                    <TableCell className={`text-right font-medium ${
                      (sku.margin_pct || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {(sku.margin_pct || 0).toFixed(1)}%
                    </TableCell>
                    <TableCell>{getStatusBadge(sku.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(sku)} className="text-slate-300 dark:text-white/30 hover:text-slate-500 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.04]">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(sku.id)} className="text-slate-300 dark:text-white/20 hover:text-red-400 hover:bg-red-500/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SkuManagement;