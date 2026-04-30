import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  FileText,
  Search,
  Sparkles,
  FlaskConical,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Copy,
  RefreshCw,
  Loader2,
  BarChart3,
  TrendingUp,
  Eye,
  MousePointerClick,
  Star,
  Image,
  Tag,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Lightbulb,
  Target,
  Zap,
  ExternalLink,
  Plus,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

// ─── Types ───────────────────────────────────────────────────

interface ProductCard {
  id: number;
  sku: string;
  name: string;
  marketplace: string;
  category: string;
  title: string;
  description: string;
  seoScore: number;
  imageCount: number;
  rating: number;
  reviews: number;
  views: number;
  ctr: number;
  conversion: number;
  abTestActive: boolean;
  auditScore: number;
  status: 'published' | 'draft' | 'moderation';
}

interface SeoCheck {
  id: number;
  check: string;
  status: 'pass' | 'fail' | 'warning';
  value: string;
  recommendation?: string;
}

interface ABTest {
  id: number;
  sku: string;
  productName: string;
  variantA: string;
  variantB: string;
  metric: string;
  valueA: number;
  valueB: number;
  impressions: number;
  confidence: number;
  status: 'running' | 'completed' | 'draft';
  winner?: 'A' | 'B' | 'none';
}

interface AuditMetric {
  name: string;
  score: number;
  maxScore: number;
  category: string;
}

// ─── Mock Data ───────────────────────────────────────────────

const initialCards: ProductCard[] = [
  {
    id: 1, sku: 'WB-12847', name: 'Футболка "Базовая"', marketplace: 'Wildberries',
    category: 'Одежда', title: 'Футболка мужская базовая хлопок 100%', description: 'Качественная базовая футболка из 100% хлопка...',
    seoScore: 72, imageCount: 8, rating: 4.5, reviews: 234, views: 15600, ctr: 4.2, conversion: 3.1,
    abTestActive: true, auditScore: 68, status: 'published',
  },
  {
    id: 2, sku: 'WB-23456', name: 'Кроссовки "Спринт"', marketplace: 'Wildberries',
    category: 'Обувь', title: 'Кроссовки спортивные мужские беговые', description: 'Лёгкие беговые кроссовки с амортизацией...',
    seoScore: 85, imageCount: 12, rating: 4.7, reviews: 567, views: 28900, ctr: 5.8, conversion: 4.5,
    abTestActive: false, auditScore: 82, status: 'published',
  },
  {
    id: 3, sku: 'OZ-34567', name: 'Рюкзак "Ультра"', marketplace: 'Ozon',
    category: 'Аксессуары', title: 'Рюкзак городской 30л ноутбук 15.6"', description: 'Стильный городской рюкзак на 30 литров...',
    seoScore: 58, imageCount: 5, rating: 4.2, reviews: 89, views: 8400, ctr: 3.1, conversion: 2.0,
    abTestActive: true, auditScore: 52, status: 'published',
  },
  {
    id: 4, sku: 'WB-45678', name: 'Худи "Комфорт"', marketplace: 'Wildberries',
    category: 'Одежда', title: 'Худи женское оверсайз хлопок', description: 'Мягкое худи оверсайз из плотного хлопка...',
    seoScore: 91, imageCount: 15, rating: 4.8, reviews: 892, views: 42000, ctr: 6.5, conversion: 5.2,
    abTestActive: false, auditScore: 88, status: 'published',
  },
  {
    id: 5, sku: 'OZ-56789', name: 'Джинсы "Классик"', marketplace: 'Ozon',
    category: 'Одежда', title: 'Джинсы мужские классические стрейч', description: 'Классические мужские джинсы с добавлением стрейча...',
    seoScore: 45, imageCount: 3, rating: 3.9, reviews: 45, views: 5200, ctr: 2.1, conversion: 1.3,
    abTestActive: false, auditScore: 38, status: 'draft',
  },
  {
    id: 6, sku: 'OZ-67890', name: 'Пальто "Элегант"', marketplace: 'Ozon',
    category: 'Верхняя одежда', title: 'Пальто женское шерстяное демисезонное', description: 'Элегантное демисезонное пальто из шерсти...',
    seoScore: 76, imageCount: 10, rating: 4.6, reviews: 312, views: 19800, ctr: 4.8, conversion: 3.7,
    abTestActive: true, auditScore: 74, status: 'published',
  },
];

const seoChecks: SeoCheck[] = [
  { id: 1, check: 'Длина заголовка', status: 'pass', value: '45 символов', recommendation: undefined },
  { id: 2, check: 'Ключевые слова в заголовке', status: 'pass', value: '3 из 5', recommendation: undefined },
  { id: 3, check: 'Длина описания', status: 'warning', value: '120 символов', recommendation: 'Рекомендуется 200-500 символов для лучшей индексации' },
  { id: 4, check: 'Количество фото', status: 'fail', value: '5 фото', recommendation: 'Минимум 8 фото для категории "Аксессуары". Добавьте фото деталей, размеров, упаковки' },
  { id: 5, check: 'Заполненность характеристик', status: 'pass', value: '95%', recommendation: undefined },
  { id: 6, check: 'Наличие видео', status: 'fail', value: 'Нет', recommendation: 'Добавьте видеообзор — повышает конверсию на 15-25%' },
  { id: 7, check: 'Баркод (штрихкод)', status: 'pass', value: 'EAN-13', recommendation: undefined },
  { id: 8, check: 'Соответствие категории', status: 'warning', value: 'Частичное', recommendation: 'Рекомендуется уточнить подкатегорию для лучшего ранжирования' },
  { id: 9, check: 'Цена в диапазоне', status: 'pass', value: '1 290 ₽ (рынок: 990-1 890 ₽)', recommendation: undefined },
  { id: 10, check: 'Наличие инфографики', status: 'fail', value: 'Нет', recommendation: 'Добавьте инфографику на главное фото — повышает CTR на 20-30%' },
];

const abTests: ABTest[] = [
  {
    id: 1, sku: 'WB-12847', productName: 'Футболка "Базовая"',
    variantA: 'Футболка мужская базовая хлопок 100%',
    variantB: 'Футболка мужская базовая премиум хлопок',
    metric: 'CTR', valueA: 4.2, valueB: 5.1, impressions: 8500,
    confidence: 92, status: 'completed', winner: 'B',
  },
  {
    id: 2, sku: 'OZ-34567', productName: 'Рюкзак "Ультра"',
    variantA: 'Рюкзак городской 30л ноутбук 15.6"',
    variantB: 'Рюкзак для ноутбука 15.6" городской 30л водонепроницаемый',
    metric: 'Конверсия', valueA: 2.0, valueB: 2.8, impressions: 4200,
    confidence: 78, status: 'running',
  },
  {
    id: 3, sku: 'OZ-67890', productName: 'Пальто "Элегант"',
    variantA: 'Пальто женское шерстяное демисезонное',
    variantB: 'Пальто женское демисезонное шерсть итальянская',
    metric: 'Конверсия', valueA: 3.7, valueB: 3.5, impressions: 6100,
    confidence: 45, status: 'running',
  },
  {
    id: 4, sku: 'WB-45678', productName: 'Худи "Комфорт"',
    variantA: 'Худи женское оверсайз хлопок',
    variantB: 'Худи женское оверсайз плотный хлопок карман кенгуру',
    metric: 'CTR', valueA: 6.5, valueB: 6.3, impressions: 12000,
    confidence: 88, status: 'completed', winner: 'A',
  },
];

const auditMetrics: AuditMetric[] = [
  { name: 'Заголовок', score: 8, maxScore: 10, category: 'SEO' },
  { name: 'Описание', score: 5, maxScore: 10, category: 'SEO' },
  { name: 'Характеристики', score: 9, maxScore: 10, category: 'SEO' },
  { name: 'Ключевые слова', score: 6, maxScore: 10, category: 'SEO' },
  { name: 'Фото', score: 4, maxScore: 10, category: 'Контент' },
  { name: 'Видео', score: 0, maxScore: 10, category: 'Контент' },
  { name: 'Инфографика', score: 0, maxScore: 10, category: 'Контент' },
  { name: 'Отзывы', score: 7, maxScore: 10, category: 'Репутация' },
  { name: 'Рейтинг', score: 8, maxScore: 10, category: 'Репутация' },
  { name: 'Цена', score: 7, maxScore: 10, category: 'Ценообразование' },
  { name: 'Конкурентоспособность', score: 5, maxScore: 10, category: 'Ценообразование' },
  { name: 'CTR', score: 6, maxScore: 10, category: 'Эффективность' },
  { name: 'Конверсия', score: 5, maxScore: 10, category: 'Эффективность' },
  { name: 'Возвраты', score: 8, maxScore: 10, category: 'Эффективность' },
  { name: 'Остатки', score: 7, maxScore: 10, category: 'Логистика' },
  { name: 'Скорость доставки', score: 6, maxScore: 10, category: 'Логистика' },
  { name: 'Упаковка', score: 5, maxScore: 10, category: 'Логистика' },
  { name: 'Реклама', score: 7, maxScore: 10, category: 'Продвижение' },
  { name: 'Промо', score: 4, maxScore: 10, category: 'Продвижение' },
  { name: 'Категория', score: 6, maxScore: 10, category: 'SEO' },
  { name: 'Баркод', score: 10, maxScore: 10, category: 'SEO' },
  { name: 'Ответы на отзывы', score: 3, maxScore: 10, category: 'Репутация' },
];

const competitorComparison = [
  { metric: 'Фото', you: 5, top10avg: 9 },
  { metric: 'Видео', you: 0, top10avg: 4 },
  { metric: 'Отзывы', you: 89, top10avg: 320 },
  { metric: 'Рейтинг', you: 4.2, top10avg: 4.5 },
  { metric: 'CTR %', you: 3.1, top10avg: 4.8 },
  { metric: 'Конверсия %', you: 2.0, top10avg: 3.5 },
];

const improvementPlan = [
  { step: 1, action: 'Добавить 3-5 фотографий (детали, размеры, упаковка)', impact: 'Высокий', effort: 'Низкий', category: 'Контент' },
  { step: 2, action: 'Создать инфографику для главного фото', impact: 'Высокий', effort: 'Средний', category: 'Контент' },
  { step: 3, action: 'Записать видеообзор товара (30-60 сек)', impact: 'Высокий', effort: 'Средний', category: 'Контент' },
  { step: 4, action: 'Расширить описание до 300-500 символов с ключевыми словами', impact: 'Средний', effort: 'Низкий', category: 'SEO' },
  { step: 5, action: 'Уточнить подкатегорию для лучшего ранжирования', impact: 'Средний', effort: 'Низкий', category: 'SEO' },
  { step: 6, action: 'Настроить автоматические ответы на отзывы', impact: 'Средний', effort: 'Низкий', category: 'Репутация' },
  { step: 7, action: 'Запустить A/B тест заголовка с добавлением "водонепроницаемый"', impact: 'Средний', effort: 'Низкий', category: 'Продвижение' },
  { step: 8, action: 'Оптимизировать цену — снизить на 5-8% для роста конверсии', impact: 'Средний', effort: 'Средний', category: 'Ценообразование' },
];

const radarData = [
  { subject: 'SEO', you: 72, top10: 85, fullMark: 100 },
  { subject: 'Контент', you: 40, top10: 78, fullMark: 100 },
  { subject: 'Репутация', you: 75, top10: 82, fullMark: 100 },
  { subject: 'Цена', you: 60, top10: 70, fullMark: 100 },
  { subject: 'Эффективность', you: 55, top10: 75, fullMark: 100 },
  { subject: 'Логистика', you: 60, top10: 72, fullMark: 100 },
  { subject: 'Продвижение', you: 55, top10: 68, fullMark: 100 },
];

const abChartConfig: ChartConfig = {
  variantA: { label: 'Вариант A', color: '#3b82f6' },
  variantB: { label: 'Вариант B', color: '#10b981' },
};

// ─── Helpers ─────────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString('ru-RU');

const seoColor = (score: number) =>
  score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-red-400';

const seoBg = (score: number) =>
  score >= 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : score >= 60 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20';

const statusIcon = (s: 'pass' | 'fail' | 'warning') =>
  s === 'pass' ? <CheckCircle2 className="h-4 w-4 text-emerald-400" />
  : s === 'fail' ? <XCircle className="h-4 w-4 text-red-400" />
  : <AlertTriangle className="h-4 w-4 text-amber-400" />;

const impactBadge = (impact: string) =>
  impact === 'Высокий' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20';

const effortBadge = (effort: string) =>
  effort === 'Низкий' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20';

// ─── Component ───────────────────────────────────────────────

const ProductCards: React.FC = () => {
  const [cards] = useState<ProductCard[]>(initialCards);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState<number>(3);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [newTestVariant, setNewTestVariant] = useState('');

  const filteredCards = cards.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selected = cards.find((c) => c.id === selectedCard);

  const handleGenerateContent = (type: 'title' | 'description') => {
    setIsGenerating(true);
    setTimeout(() => {
      if (type === 'title') {
        setGeneratedTitle('Рюкзак городской водонепроницаемый 30л для ноутбука 15.6" — дорожный бизнес');
      } else {
        setGeneratedDescription(
          'Стильный городской рюкзак объёмом 30 литров с отделением для ноутбука до 15.6". ' +
          'Водонепроницаемая ткань, эргономичная спинка, множество карманов для организации вещей. ' +
          'Идеален для ежедневных поездок, командировок и учёбы. Усиленное дно, светоотражающие элементы, ' +
          'мягкие лямки с вентиляцией. Доступен в 5 цветах.'
        );
      }
      setIsGenerating(false);
    }, 2000);
  };

  const totalAuditScore = selected
    ? Math.round((auditMetrics.reduce((s, m) => s + m.score, 0) / auditMetrics.reduce((s, m) => s + m.maxScore, 0)) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Карточки товаров</h1>
          <p className="text-slate-300 dark:text-white/30 mt-1">SEO-оптимизация, AI-генерация контента, A/B тесты, аудит SKU 360</p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="cards" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid bg-white/[0.04]">
          <TabsTrigger value="cards" className="gap-2 text-slate-400 dark:text-white/40 data-[state=active]:text-white data-[state=active]:bg-white/[0.06]">
            <FileText className="h-4 w-4" />
            Карточки
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-2 text-slate-400 dark:text-white/40 data-[state=active]:text-white data-[state=active]:bg-white/[0.06]">
            <Search className="h-4 w-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2 text-slate-400 dark:text-white/40 data-[state=active]:text-white data-[state=active]:bg-white/[0.06]">
            <Sparkles className="h-4 w-4" />
            AI Генерация
          </TabsTrigger>
          <TabsTrigger value="ab" className="gap-2 text-slate-400 dark:text-white/40 data-[state=active]:text-white data-[state=active]:bg-white/[0.06]">
            <FlaskConical className="h-4 w-4" />
            A/B Тесты
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2 text-slate-400 dark:text-white/40 data-[state=active]:text-white data-[state=active]:bg-white/[0.06]">
            <ShieldCheck className="h-4 w-4" />
            SKU 360
          </TabsTrigger>
        </TabsList>

        {/* ─── Cards Tab ───────────────────────────────────── */}
        <TabsContent value="cards" className="space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 dark:text-white/20" />
            <Input
              placeholder="Поиск по названию или SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white placeholder:text-slate-900 dark:text-white/15"
            />
          </div>

          {/* Cards Table */}
          <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200 dark:border-white/[0.06] hover:bg-transparent">
                      <TableHead className="text-xs text-slate-300 dark:text-white/30">Товар</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30">МП</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30 text-center">SEO</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30 text-center">Фото</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30 text-center">Рейтинг</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30 text-right">Отзывы</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30 text-right">Просмотры</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30 text-center">CTR</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30 text-center">Конверсия</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30 text-center">Аудит</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30">Статус</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCards.map((c) => (
                      <TableRow
                        key={c.id}
                        className={`cursor-pointer hover:bg-white/[0.02] border-white/[0.04] ${selectedCard === c.id ? 'bg-white/[0.04]' : ''}`}
                        onClick={() => setSelectedCard(c.id)}
                      >
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium text-slate-600 dark:text-white/70">{c.name}</p>
                            <p className="text-xs text-slate-300 dark:text-white/20 font-mono">{c.sku}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40">
                            {c.marketplace === 'Wildberries' ? 'WB' : c.marketplace === 'Ozon' ? 'OZ' : 'ЯМ'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`text-xs ${seoBg(c.seoScore)}`}>{c.seoScore}</Badge>
                        </TableCell>
                        <TableCell className="text-center text-sm text-slate-400 dark:text-white/40">{c.imageCount}</TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm flex items-center justify-center gap-1 text-slate-400 dark:text-white/50">
                            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                            {c.rating}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-right text-slate-400 dark:text-white/40">{fmt(c.reviews)}</TableCell>
                        <TableCell className="text-sm text-right text-slate-400 dark:text-white/40">{fmt(c.views)}</TableCell>
                        <TableCell className="text-sm text-center text-slate-400 dark:text-white/40">{c.ctr}%</TableCell>
                        <TableCell className="text-sm text-center text-slate-400 dark:text-white/40">{c.conversion}%</TableCell>
                        <TableCell className="text-center">
                          <Badge className={`text-xs ${seoBg(c.auditScore)}`}>{c.auditScore}</Badge>
                        </TableCell>
                        <TableCell>
                          {c.status === 'published' && (
                            <Badge className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10">Опубликована</Badge>
                          )}
                          {c.status === 'draft' && (
                            <Badge className="text-xs bg-white/[0.04] text-slate-300 dark:text-white/30 hover:bg-slate-100 dark:hover:bg-white/[0.04]">Черновик</Badge>
                          )}
                          {c.status === 'moderation' && (
                            <Badge className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/10">Модерация</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Selected Card Preview */}
          {selected && (
            <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                  <FileText className="h-5 w-5 text-blue-400" />
                  {selected.name} — <span className="text-slate-300 dark:text-white/20 font-mono text-sm">{selected.sku}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-slate-300 dark:text-white/30 mb-1">Заголовок</p>
                    <p className="text-sm text-slate-500 dark:text-white/60">{selected.title}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-300 dark:text-white/30 mb-1">Описание</p>
                    <p className="text-sm text-slate-400 dark:text-white/40">{selected.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                  <div className="text-center p-2 rounded-md bg-white/[0.03]">
                    <Eye className="h-4 w-4 text-slate-300 dark:text-white/20 mx-auto mb-1" />
                    <p className="text-xs text-slate-900 dark:text-white/25">Просмотры</p>
                    <p className="text-sm font-semibold text-slate-500 dark:text-white/60">{fmt(selected.views)}</p>
                  </div>
                  <div className="text-center p-2 rounded-md bg-white/[0.03]">
                    <MousePointerClick className="h-4 w-4 text-slate-300 dark:text-white/20 mx-auto mb-1" />
                    <p className="text-xs text-slate-900 dark:text-white/25">CTR</p>
                    <p className="text-sm font-semibold text-slate-500 dark:text-white/60">{selected.ctr}%</p>
                  </div>
                  <div className="text-center p-2 rounded-md bg-white/[0.03]">
                    <TrendingUp className="h-4 w-4 text-slate-300 dark:text-white/20 mx-auto mb-1" />
                    <p className="text-xs text-slate-900 dark:text-white/25">Конверсия</p>
                    <p className="text-sm font-semibold text-slate-500 dark:text-white/60">{selected.conversion}%</p>
                  </div>
                  <div className="text-center p-2 rounded-md bg-white/[0.03]">
                    <Star className="h-4 w-4 text-amber-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-900 dark:text-white/25">Рейтинг</p>
                    <p className="text-sm font-semibold text-slate-500 dark:text-white/60">{selected.rating}</p>
                  </div>
                  <div className="text-center p-2 rounded-md bg-white/[0.03]">
                    <Image className="h-4 w-4 text-slate-300 dark:text-white/20 mx-auto mb-1" />
                    <p className="text-xs text-slate-900 dark:text-white/25">Фото</p>
                    <p className="text-sm font-semibold text-slate-500 dark:text-white/60">{selected.imageCount}</p>
                  </div>
                  <div className="text-center p-2 rounded-md bg-white/[0.03]">
                    <MessageSquare className="h-4 w-4 text-slate-300 dark:text-white/20 mx-auto mb-1" />
                    <p className="text-xs text-slate-900 dark:text-white/25">Отзывы</p>
                    <p className="text-sm font-semibold text-slate-500 dark:text-white/60">{fmt(selected.reviews)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ─── SEO Tab ─────────────────────────────────────── */}
        <TabsContent value="seo" className="space-y-4">
          <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">SEO-проверка карточки</CardTitle>
                {selected && (
                  <Badge className={`${seoBg(selected.seoScore)} text-sm px-3 py-1`}>
                    SEO-оценка: {selected.seoScore}/100
                  </Badge>
                )}
              </div>
              {selected && (
                <p className="text-sm text-slate-300 dark:text-white/30">{selected.name} ({selected.sku})</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="max-h-[500px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200 dark:border-white/[0.06] hover:bg-transparent">
                      <TableHead className="text-xs w-10 text-slate-300 dark:text-white/30">✓</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30">Проверка</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30">Значение</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30">Рекомендация</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {seoChecks.map((check) => (
                      <TableRow key={check.id} className="border-white/[0.04]">
                        <TableCell>{statusIcon(check.status)}</TableCell>
                        <TableCell className="text-sm font-medium text-slate-500 dark:text-white/60">{check.check}</TableCell>
                        <TableCell className="text-sm text-slate-400 dark:text-white/40">{check.value}</TableCell>
                        <TableCell className="text-xs text-slate-900 dark:text-white/25 max-w-[300px]">
                          {check.recommendation || '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 p-3 rounded-md bg-blue-500/10 text-blue-400 text-sm flex items-start gap-2 border border-blue-500/20">
                <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">ИИ-рекомендация</p>
                  <p className="mt-1 text-blue-400/70">
                    Приоритетные действия: 1) Добавить инфографику на главное фото (+20-30% CTR),
                    2) Увеличить количество фото до 8+ (+15% конверсия),
                    3) Добавить видеообзор (+15-25% конверсия).
                    Ожидаемый рост SEO-оценки: 72 → 88+
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Semantic Collection */}
          <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                <Tag className="h-5 w-5 text-indigo-400" />
                Сбор семантики
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-300 dark:text-white/30 mb-2">Высокочастотные</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['рюкзак', 'рюкзак городской', 'рюкзак для ноутбука', 'рюкзак 30 литров'].map((kw) => (
                      <Badge key={kw} variant="outline" className="text-xs bg-red-500/10 text-red-400 border-red-500/20">{kw}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-300 dark:text-white/30 mb-2">Среднечастотные</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['рюкзак водонепроницаемый', 'рюкзак с отделением для ноутбука', 'рюкзак дорожный', 'рюкзак бизнес'].map((kw) => (
                      <Badge key={kw} variant="outline" className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/20">{kw}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-300 dark:text-white/30 mb-2">Низкочастотные</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['рюкзак для ноутбука 15.6 водонепроницаемый', 'рюкзак городской эргономичный', 'рюкзак с USB портом'].map((kw) => (
                      <Badge key={kw} variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{kw}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── AI Generation Tab ────────────────────────────── */}
        <TabsContent value="ai" className="space-y-4">
          <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                <Sparkles className="h-5 w-5 text-purple-400" />
                AI-генерация контента
              </CardTitle>
              <p className="text-sm text-slate-300 dark:text-white/30">
                Генерация заголовков и описаний с помощью gpt-5.4
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title Generation */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-slate-400 dark:text-white/50">Генерация заголовка</p>
                  <Button
                    size="sm"
                    onClick={() => handleGenerateContent('title')}
                    disabled={isGenerating}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    {isGenerating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Сгенерировать
                  </Button>
                </div>
                {selected && (
                  <div className="p-3 rounded-md bg-white/[0.03] mb-2">
                    <p className="text-xs text-slate-900 dark:text-white/25 mb-1">Текущий заголовок:</p>
                    <p className="text-sm text-slate-500 dark:text-white/60">{selected.title}</p>
                  </div>
                )}
                {generatedTitle && (
                  <div className="p-3 rounded-md bg-purple-500/10 border border-purple-500/20">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-purple-400">Сгенерированный заголовок:</p>
                      <Button variant="ghost" size="sm" className="h-6 text-xs text-slate-300 dark:text-white/30 hover:text-slate-400 dark:text-white/50">
                        <Copy className="h-3 w-3 mr-1" /> Копировать
                      </Button>
                    </div>
                    <p className="text-sm font-medium text-slate-600 dark:text-white/70">{generatedTitle}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20">+15% ожидаемый CTR</Badge>
                      <Badge className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/20">5 ключевых слов</Badge>
                    </div>
                  </div>
                )}
              </div>

              {/* Description Generation */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-slate-400 dark:text-white/50">Генерация описания</p>
                  <Button
                    size="sm"
                    onClick={() => handleGenerateContent('description')}
                    disabled={isGenerating}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    {isGenerating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Сгенерировать
                  </Button>
                </div>
                {selected && (
                  <div className="p-3 rounded-md bg-white/[0.03] mb-2">
                    <p className="text-xs text-slate-900 dark:text-white/25 mb-1">Текущее описание:</p>
                    <p className="text-sm text-slate-500 dark:text-white/60">{selected.description}</p>
                  </div>
                )}
                {generatedDescription && (
                  <div className="p-3 rounded-md bg-purple-500/10 border border-purple-500/20">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-purple-400">Сгенерированное описание:</p>
                      <Button variant="ghost" size="sm" className="h-6 text-xs text-slate-300 dark:text-white/30 hover:text-slate-400 dark:text-white/50">
                        <Copy className="h-3 w-3 mr-1" /> Копировать
                      </Button>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-white/70">{generatedDescription}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20">+25% ожидаемая конверсия</Badge>
                      <Badge className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/20">380 символов</Badge>
                      <Badge className="text-xs bg-indigo-500/10 text-indigo-400 border-indigo-500/20">7 ключевых слов</Badge>
                    </div>
                  </div>
                )}
              </div>

              {/* Generation Tips */}
              <div className="p-3 rounded-md bg-amber-500/10 text-amber-400 text-sm flex items-start gap-2 border border-amber-500/20">
                <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Советы по генерации</p>
                  <ul className="mt-1 space-y-1 text-xs list-disc list-inside text-amber-400/70">
                    <li>Заголовок должен содержать 3-5 ключевых слов и быть до 70 символов</li>
                    <li>Описание 200-500 символов с ключевыми словами в первых 100 символах</li>
                    <li>Укажите уникальные преимущества товара в первых строках</li>
                    <li>Используйте слова-триггеры: «премиум», «водонепроницаемый», «эргономичный»</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── A/B Tests Tab ────────────────────────────────── */}
        <TabsContent value="ab" className="space-y-4">
          {/* Create New Test */}
          <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Plus className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-slate-400 dark:text-white/50">Новый A/B тест</span>
                <Input
                  placeholder="Введите вариант B для тестирования..."
                  value={newTestVariant}
                  onChange={(e) => setNewTestVariant(e.target.value)}
                  className="max-w-md bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white placeholder:text-slate-900 dark:text-white/15"
                />
                <Button size="sm" disabled={!newTestVariant} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  <FlaskConical className="mr-2 h-4 w-4" />
                  Создать тест
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tests List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {abTests.map((test) => (
              <Card key={test.id} className={`bg-white dark:bg-[#0d0d14] ${test.status === 'running' ? 'border-blue-500/20' : 'border-slate-200 dark:border-white/[0.06]'}`}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-white/70">{test.productName}</p>
                      <p className="text-xs text-slate-300 dark:text-white/20 font-mono">{test.sku}</p>
                    </div>
                    {test.status === 'running' && (
                      <Badge className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/10">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />Активен
                      </Badge>
                    )}
                    {test.status === 'completed' && (
                      <Badge className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10">
                        <CheckCircle2 className="h-3 w-3 mr-1" />Завершён
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="p-2.5 rounded-md bg-blue-500/10 border border-blue-500/20">
                      <p className="text-xs text-blue-400 font-medium mb-1">Вариант A</p>
                      <p className="text-xs text-slate-400 dark:text-white/50">{test.variantA}</p>
                      <p className="text-lg font-bold text-blue-400 mt-1">
                        {test.valueA}{test.metric === 'CTR' || test.metric === 'Конверсия' ? '%' : ''}
                      </p>
                    </div>
                    <div className={`p-2.5 rounded-md border ${test.winner === 'B' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/[0.03] border-slate-200 dark:border-white/[0.06]'}`}>
                      <p className="text-xs text-slate-400 dark:text-white/40 font-medium mb-1">Вариант B</p>
                      <p className="text-xs text-slate-400 dark:text-white/50">{test.variantB}</p>
                      <p className={`text-lg font-bold mt-1 ${test.winner === 'B' ? 'text-emerald-400' : 'text-slate-400 dark:text-white/50'}`}>
                        {test.valueB}{test.metric === 'CTR' || test.metric === 'Конверсия' ? '%' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-900 dark:text-white/25">Метрика: {test.metric}</span>
                    <span className="text-slate-900 dark:text-white/25">Показы: {fmt(test.impressions)}</span>
                    <span className={`font-medium ${test.confidence >= 90 ? 'text-emerald-400' : test.confidence >= 70 ? 'text-amber-400' : 'text-slate-300 dark:text-white/30'}`}>
                      Достоверность: {test.confidence}%
                    </span>
                  </div>

                  {test.winner && (
                    <div className={`mt-3 p-2 rounded text-xs font-medium flex items-center gap-1.5 ${
                      test.winner === 'B' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      <TrophyIcon className="h-3.5 w-3.5" />
                      Победитель: Вариант {test.winner}
                      {test.winner === 'B' && (
                        <span className="ml-1">
                          (+{((test.valueB - test.valueA) / test.valueA * 100).toFixed(0)}% {test.metric.toLowerCase()})
                        </span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* A/B Results Chart */}
          <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Сравнение вариантов</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={abChartConfig} className="h-[250px] w-full">
                <BarChart data={abTests.filter((t) => t.status === 'completed')} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                  <XAxis dataKey="productName" tick={{ fontSize: 11, fill: '#6b7280' }} stroke="#4a4a5a" />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} stroke="#4a4a5a" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="valueA" fill="#3b82f6" radius={[4, 4, 0, 0]} name="variantA" />
                  <Bar dataKey="valueB" fill="#10b981" radius={[4, 4, 0, 0]} name="variantB" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── SKU 360 Audit Tab ────────────────────────────── */}
        <TabsContent value="audit" className="space-y-4">
          {/* Audit Score Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-1 bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
              <CardContent className="p-6 text-center">
                <p className="text-sm font-medium text-slate-300 dark:text-white/30 mb-2">Общая оценка SKU 360</p>
                <div className={`text-5xl font-bold ${seoColor(totalAuditScore)}`}>{totalAuditScore}</div>
                <p className="text-sm text-slate-300 dark:text-white/20 mt-1">из 100</p>
                <Progress value={totalAuditScore} className="h-2 mt-3" />
                <p className="text-xs text-slate-900 dark:text-white/25 mt-2">
                  {totalAuditScore >= 80 ? 'Отлично' : totalAuditScore >= 60 ? 'Хорошо, есть что улучшить' : 'Требуется доработка'}
                </p>
              </CardContent>
            </Card>

            {/* Radar Chart */}
            <Card className="md:col-span-2 bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Сравнение с топ-10 конкурентов</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#1e1e2e" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#4a4a5a' }} />
                    <Radar name="Вы" dataKey="you" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                    <Radar name="Топ-10" dataKey="top10" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeWidth={2} strokeDasharray="5 5" />
                    <Legend wrapperStyle={{ color: '#9ca3af' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Metrics by Category */}
          <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Метрики аудита (22 показателя)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200 dark:border-white/[0.06] hover:bg-transparent">
                      <TableHead className="text-xs text-slate-300 dark:text-white/30">Метрика</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30">Категория</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30 text-center">Оценка</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30 w-[200px]">Прогресс</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditMetrics.map((m, i) => (
                      <TableRow key={i} className="border-white/[0.04]">
                        <TableCell className="text-sm font-medium text-slate-500 dark:text-white/60">{m.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs border-slate-200 dark:border-white/10 text-slate-300 dark:text-white/30">{m.category}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`text-sm font-semibold ${seoColor((m.score / m.maxScore) * 100)}`}>
                            {m.score}/{m.maxScore}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Progress
                            value={(m.score / m.maxScore) * 100}
                            className="h-2"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Competitor Comparison */}
          <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Сравнение с топ-10 конкурентами</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ you: { label: 'Вы', color: '#3b82f6' }, top10avg: { label: 'Топ-10 среднее', color: '#ef4444' } }} className="h-[250px] w-full">
                <BarChart data={competitorComparison} layout="vertical" margin={{ top: 5, right: 10, left: 60, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} stroke="#4a4a5a" />
                  <YAxis dataKey="metric" type="category" tick={{ fontSize: 12, fill: '#6b7280' }} stroke="#4a4a5a" width={55} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="you" fill="#3b82f6" radius={[0, 4, 4, 0]} name="you" />
                  <Bar dataKey="top10avg" fill="#ef4444" radius={[0, 4, 4, 0]} name="top10avg" fillOpacity={0.6} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Improvement Plan */}
          <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                <Target className="h-5 w-5 text-blue-400" />
                Пошаговый план доработок
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200 dark:border-white/[0.06] hover:bg-transparent">
                      <TableHead className="text-xs w-10 text-slate-300 dark:text-white/30">#</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30">Действие</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30">Категория</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30 text-center">Влияние</TableHead>
                      <TableHead className="text-xs text-slate-300 dark:text-white/30 text-center">Сложность</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {improvementPlan.map((step) => (
                      <TableRow key={step.step} className="border-white/[0.04]">
                        <TableCell className="text-sm font-mono text-slate-300 dark:text-white/20">{step.step}</TableCell>
                        <TableCell className="text-sm text-slate-500 dark:text-white/60">{step.action}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs border-slate-200 dark:border-white/10 text-slate-300 dark:text-white/30">{step.category}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`text-xs ${impactBadge(step.impact)}`}>{step.impact}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`text-xs ${effortBadge(step.effort)}`}>{step.effort}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 p-3 rounded-md bg-emerald-500/10 text-emerald-400 text-sm flex items-start gap-2 border border-emerald-500/20">
                <Zap className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Прогноз результата</p>
                  <p className="mt-1 text-xs text-emerald-400/70">
                    Выполнение всех шагов повысит оценку SKU 360 с {totalAuditScore} до ~85,
                    ожидаемый рост CTR +35%, конверсии +45%, позиция в поиске +12 мест.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Small trophy icon component
const TrophyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

export default ProductCards;