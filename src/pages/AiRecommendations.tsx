import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, Send, Check, X, Loader2, Brain, TrendingUp, TrendingDown, Package } from 'lucide-react';
import { toast } from 'sonner';
import {
  client,
  skuApi,
  aiRecommendationApi,
  type Sku,
  type AiRecommendation,
} from '@/lib/marketplace-api';

const AiRecommendations: React.FC = () => {
  const [skus, setSkus] = useState<Sku[]>([]);
  const [recommendations, setRecommendations] = useState<AiRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkuId, setSelectedSkuId] = useState<string>('');
  const [scenarioType, setScenarioType] = useState<string>('price_optimization');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const streamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [skusData, recsData] = await Promise.all([
        skuApi.getAll(),
        aiRecommendationApi.getAll(),
      ]);
      setSkus(skusData);
      setRecommendations(recsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedSkuId) {
      toast.error('Выберите SKU для анализа');
      return;
    }

    const sku = skus.find((s) => String(s.id) === selectedSkuId);
    if (!sku) return;

    setGenerating(true);
    setStreamedText('');

    try {
      const prompt = `Ты — аналитик маркетплейсов. Проанализируй следующий SKU и дай рекомендации по оптимизации прибыли.

Данные SKU:
- Название: ${sku.name}
- Артикул: ${sku.article}
- Цена закупки: ${sku.purchase_price} ₽
- Цена продажи: ${sku.selling_price} ₽
- Комиссия: ${sku.commission_pct}%
- Логистика: ${sku.logistics_cost} ₽
- Процент возвратов: ${sku.return_rate_pct}%
- Хранение: ${sku.storage_cost_monthly} ₽/мес
- Реклама: ${sku.ad_spend_per_unit} ₽/шт
- НДС: ${sku.tax_rate_pct}%
- Текущая маржа: ${sku.margin_pct?.toFixed(1) || '0'}%
- Статус: ${sku.status === 'profitable' ? 'прибыльный' : sku.status === 'unprofitable' ? 'убыточный' : 'безубыточный'}

Тип сценария: ${scenarioType === 'price_optimization' ? 'Оптимизация цены' :
  scenarioType === 'cost_reduction' ? 'Снижение затрат' :
  scenarioType === 'discontinue_analysis' ? 'Анализ целесообразности' : 'Комплексный анализ'}

${customPrompt ? `Дополнительный запрос: ${customPrompt}` : ''}

Ответь в формате JSON:
{
  "recommended_price": число (рекомендуемая цена в рублях),
  "predicted_margin_pct": число (прогнозируемая маржа в %),
  "predicted_sales_change_pct": число (прогнозируемое изменение продаж в %),
  "predicted_profit_monthly": число (прогнозируемая прибыль в месяц при 100 продажах),
  "reasoning": "подробное объяснение рекомендаций",
  "scenario_type": "${scenarioType}"
}`;

      let fullText = '';

      await client.ai.gentxt({
        messages: [{ role: 'user', content: prompt }],
        model: 'deepseek-v3.2',
        stream: true,
        onChunk: (chunk: { content?: string }) => {
          if (chunk.content) {
            fullText += chunk.content;
            setStreamedText(fullText);
            if (streamRef.current) {
              streamRef.current.scrollTop = streamRef.current.scrollHeight;
            }
          }
        },
        onComplete: () => {
          // Streaming complete
        },
        onError: (error: { message?: string }) => {
          console.error('Stream error:', error);
          toast.error('Ошибка генерации: ' + (error.message || 'Неизвестная ошибка'));
        },
        timeout: 60_000,
      });

      // Try to parse JSON from the response
      try {
        const jsonMatch = fullText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          await aiRecommendationApi.create({
            sku_id: parseInt(selectedSkuId),
            recommended_price: parsed.recommended_price || sku.selling_price,
            predicted_margin_pct: parsed.predicted_margin_pct || 0,
            predicted_sales_change_pct: parsed.predicted_sales_change_pct || 0,
            predicted_profit_monthly: parsed.predicted_profit_monthly || 0,
            reasoning: parsed.reasoning || fullText,
            scenario_type: scenarioType,
            status: 'pending',
          });
          toast.success('Рекомендация сохранена');
        }
      } catch (parseError) {
        // Save as plain text recommendation
        await aiRecommendationApi.create({
          sku_id: parseInt(selectedSkuId),
          recommended_price: sku.selling_price,
          predicted_margin_pct: 0,
          predicted_sales_change_pct: 0,
          predicted_profit_monthly: 0,
          reasoning: fullText,
          scenario_type: scenarioType,
          status: 'pending',
        });
        toast.success('Рекомендация сохранена');
      }

      loadData();
    } catch (error: any) {
      console.error('AI generation failed:', error);
      toast.error('Ошибка генерации рекомендации');
    } finally {
      setGenerating(false);
    }
  };

  const handleApplyRecommendation = async (rec: AiRecommendation) => {
    try {
      await aiRecommendationApi.update(rec.id, { status: 'applied' });
      if (rec.recommended_price) {
        const sku = skus.find((s) => s.id === rec.sku_id);
        if (sku) {
          await skuApi.update(sku.id, { selling_price: rec.recommended_price });
        }
      }
      toast.success('Рекомендация принята');
      loadData();
    } catch (error: any) {
      toast.error('Ошибка применения рекомендации');
    }
  };

  const handleRejectRecommendation = async (rec: AiRecommendation) => {
    try {
      await aiRecommendationApi.update(rec.id, { status: 'rejected' });
      toast.success('Рекомендация отклонена');
      loadData();
    } catch (error: any) {
      toast.error('Ошибка отклонения рекомендации');
    }
  };

  const getSkuName = (skuId: number) => {
    return skus.find((s) => s.id === skuId)?.name || `SKU #${skuId}`;
  };

  const getScenarioLabel = (type: string) => {
    switch (type) {
      case 'price_optimization': return 'Оптимизация цены';
      case 'cost_reduction': return 'Снижение затрат';
      case 'discontinue_analysis': return 'Анализ целесообразности';
      case 'logistics_optimization': return 'Оптимизация логистики';
      default: return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">Ожидает</Badge>;
      case 'applied':
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Принята</Badge>;
      case 'rejected':
        return <Badge className="bg-white/[0.04] text-slate-400 dark:text-white/40 border-slate-200 dark:border-white/[0.06]">Отклонена</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

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
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI Рекомендации</h1>
        <p className="text-slate-300 dark:text-white/30 mt-1">Получите персональные рекомендации по оптимизации прибыли</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generation Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-slate-900 dark:text-white">
                <Brain className="h-5 w-5 text-blue-400" />
                Новый анализ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 dark:text-white/50">Выберите SKU</label>
                <Select value={selectedSkuId} onValueChange={setSelectedSkuId}>
                  <SelectTrigger className="bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-white/60">
                    <SelectValue placeholder="Выберите SKU" />
                  </SelectTrigger>
                  <SelectContent>
                    {skus.map((sku) => (
                      <SelectItem key={sku.id} value={String(sku.id)}>
                        {sku.name} ({sku.article})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 dark:text-white/50">Тип сценария</label>
                <Select value={scenarioType} onValueChange={setScenarioType}>
                  <SelectTrigger className="bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-white/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price_optimization">Оптимизация цены</SelectItem>
                    <SelectItem value="cost_reduction">Снижение затрат</SelectItem>
                    <SelectItem value="discontinue_analysis">Анализ целесообразности</SelectItem>
                    <SelectItem value="logistics_optimization">Оптимизация логистики</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 dark:text-white/50">Дополнительный запрос</label>
                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Например: учти сезонность и конкурентов..."
                  rows={3}
                  className="bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white placeholder:text-slate-900 dark:text-white/15"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generating || !selectedSkuId}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Генерация...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Сгенерировать
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Streaming output */}
          {generating && (
            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                  <span className="text-sm font-medium text-blue-400">AI анализирует...</span>
                </div>
                <div
                  ref={streamRef}
                  className="max-h-48 overflow-y-auto text-sm text-slate-400 dark:text-white/50 whitespace-pre-wrap"
                >
                  {streamedText || 'Ожидание ответа...'}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recommendations List */}
        <div className="lg:col-span-2 space-y-4">
          {recommendations.length === 0 ? (
            <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
              <CardContent className="py-12 text-center">
                <Sparkles className="h-12 w-12 mx-auto mb-3 text-slate-200 dark:text-white/10" />
                <p className="text-slate-300 dark:text-white/30">Пока нет рекомендаций</p>
                <p className="text-sm text-slate-300 dark:text-white/20 mt-1">
                  Выберите SKU и сгенерируйте AI анализ
                </p>
              </CardContent>
            </Card>
          ) : (
            recommendations.map((rec) => (
              <Card key={rec.id} className={`bg-white dark:bg-[#0d0d14] ${rec.status === 'pending' ? 'border-amber-500/20' : 'border-slate-200 dark:border-white/[0.06]'}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="h-4 w-4 text-slate-300 dark:text-white/20" />
                        <span className="text-sm font-medium text-slate-600 dark:text-white/70">
                          {getSkuName(rec.sku_id)}
                        </span>
                        <Badge variant="outline" className="text-xs border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40">
                          {getScenarioLabel(rec.scenario_type)}
                        </Badge>
                        {getStatusBadge(rec.status)}
                      </div>

                      <p className="text-sm text-slate-400 dark:text-white/40 mb-3 line-clamp-3">
                        {rec.reasoning}
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-2 rounded bg-white/[0.03]">
                          <p className="text-xs text-slate-900 dark:text-white/25">Рекоменд. цена</p>
                          <p className="text-sm font-semibold text-slate-600 dark:text-white/70">
                            {rec.recommended_price?.toLocaleString('ru-RU') || '—'} ₽
                          </p>
                        </div>
                        <div className="p-2 rounded bg-white/[0.03]">
                          <p className="text-xs text-slate-900 dark:text-white/25">Прогноз маржи</p>
                          <p className={`text-sm font-semibold ${
                            (rec.predicted_margin_pct || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {rec.predicted_margin_pct?.toFixed(1) || '0'}%
                          </p>
                        </div>
                        <div className="p-2 rounded bg-white/[0.03]">
                          <p className="text-xs text-slate-900 dark:text-white/25">Изм. продаж</p>
                          <p className={`text-sm font-semibold ${
                            (rec.predicted_sales_change_pct || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {rec.predicted_sales_change_pct >= 0 ? '+' : ''}
                            {rec.predicted_sales_change_pct?.toFixed(1) || '0'}%
                          </p>
                        </div>
                        <div className="p-2 rounded bg-white/[0.03]">
                          <p className="text-xs text-slate-900 dark:text-white/25">Прогноз прибыли</p>
                          <p className={`text-sm font-semibold ${
                            (rec.predicted_profit_monthly || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {rec.predicted_profit_monthly?.toLocaleString('ru-RU') || '0'} ₽
                          </p>
                        </div>
                      </div>
                    </div>

                    {rec.status === 'pending' && (
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApplyRecommendation(rec)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white"
                        >
                          <Check className="mr-1 h-3 w-3" /> Принять
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectRecommendation(rec)}
                          className="border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 hover:text-slate-500 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.04]"
                        >
                          <X className="mr-1 h-3 w-3" /> Отклонить
                        </Button>
                      </div>
                    )}
                  </div>

                  {rec.created_at && (
                    <p className="text-xs text-slate-300 dark:text-white/20 mt-3">
                      {new Date(rec.created_at).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AiRecommendations;