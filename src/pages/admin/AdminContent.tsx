import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  FileText,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Search,
  Globe,
  BookOpen,
  Save,
  Image,
} from 'lucide-react';

// ─── Mock Data ───────────────────────────────────────────────

interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft' | 'archived';
  author: string;
  publishedAt: string;
  views: number;
  category: string;
}

interface LandingBlock {
  id: string;
  section: string;
  title: string;
  subtitle: string;
  lastEdited: string;
  editedBy: string;
}

const mockArticles: BlogArticle[] = [
  { id: 'b1', title: 'Что такое unit-экономика: руководство', slug: 'chto-takoe-unit-ekonomika-rukovodstvo', status: 'published', author: 'Admin', publishedAt: '2026-04-20', views: 1245, category: 'Обучение' },
  { id: 'b2', title: 'Проблемы ценообразования на маркетплейсах', slug: 'problemy-tsenoobrazovaniya-marketplace', status: 'published', author: 'Admin', publishedAt: '2026-04-18', views: 892, category: 'Аналитика' },
  { id: 'b3', title: 'Кейс: продавец одежды на Wildberries', slug: 'keys-prodavets-odezhdy-wildberries', status: 'published', author: 'Admin', publishedAt: '2026-04-15', views: 2103, category: 'Кейсы' },
  { id: 'b4', title: 'Скрытые издержки маркетплейсов', slug: 'skrytye-izderzhki-marketplace', status: 'published', author: 'Admin', publishedAt: '2026-04-12', views: 678, category: 'Обучение' },
  { id: 'b5', title: 'AI-рекомендации по ценообразованию', slug: 'ai-rekomendatsii-tsenoobrazovanie', status: 'draft', author: 'Admin', publishedAt: '—', views: 0, category: 'AI' },
  { id: 'b6', title: 'Гайд по оптимизации цен', slug: 'gayd-optimizatsiya-tsen-marketplace', status: 'published', author: 'Admin', publishedAt: '2026-04-08', views: 1567, category: 'Обучение' },
  { id: 'b7', title: 'НДС и УСН: учёт на маркетплейсах 2026', slug: 'nds-usn-uchest-marketplace-2026', status: 'draft', author: 'Admin', publishedAt: '—', views: 0, category: 'Налоги' },
  { id: 'b8', title: 'Управление ДРР и рекламой', slug: 'upravlenie-drr-reklamoy', status: 'archived', author: 'Admin', publishedAt: '2026-03-20', views: 445, category: 'Реклама' },
];

const mockLandingBlocks: LandingBlock[] = [
  { id: 'l1', section: 'Hero', title: 'Управляйте ценами с AI', subtitle: 'Автоматический репрайсер и аналитика для маркетплейсов', lastEdited: '2026-04-25', editedBy: 'Admin' },
  { id: 'l2', section: 'Features', title: 'Возможности ProfitPilot', subtitle: 'Репрайсер, калькулятор, AI-рекомендации и аналитика конкурентов', lastEdited: '2026-04-22', editedBy: 'Admin' },
  { id: 'l3', section: 'Pricing', title: 'Тарифы', subtitle: 'Free, Pro и Enterprise — выберите подходящий план', lastEdited: '2026-04-20', editedBy: 'Admin' },
  { id: 'l4', section: 'Testimonials', title: 'Отзывы клиентов', subtitle: 'Что говорят продавцы о ProfitPilot', lastEdited: '2026-04-15', editedBy: 'Admin' },
  { id: 'l5', section: 'FAQ', title: 'Часто задаваемые вопросы', subtitle: 'Ответы на популярные вопросы о платформе', lastEdited: '2026-04-10', editedBy: 'Admin' },
  { id: 'l6', section: 'CTA', title: 'Начните бесплатно', subtitle: 'Зарегистрируйтесь и получите 14 дней Pro', lastEdited: '2026-04-08', editedBy: 'Admin' },
];

const articleStatusBadge: Record<string, string> = {
  published: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/10',
  draft: 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/10',
  archived: 'bg-white/5 text-slate-400 dark:text-white/40 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5',
};

const articleStatusLabel: Record<string, string> = {
  published: 'Опубликована',
  draft: 'Черновик',
  archived: 'Архив',
};

// ─── Component ───────────────────────────────────────────────

const AdminContent: React.FC = () => {
  const [articles, setArticles] = useState(mockArticles);
  const [landingBlocks, setLandingBlocks] = useState(mockLandingBlocks);
  const [tab, setTab] = useState<'blog' | 'landing'>('blog');
  const [search, setSearch] = useState('');
  const [editBlock, setEditBlock] = useState<LandingBlock | null>(null);
  const [editArticle, setEditArticle] = useState<BlogArticle | null>(null);

  const filteredArticles = articles.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  const deleteArticle = (id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  const saveBlock = () => {
    if (!editBlock) return;
    setLandingBlocks((prev) =>
      prev.map((b) => b.id === editBlock.id ? { ...editBlock, lastEdited: new Date().toISOString().split('T')[0] } : b)
    );
    setEditBlock(null);
  };

  const saveArticle = () => {
    if (!editArticle) return;
    setArticles((prev) =>
      prev.map((a) => a.id === editArticle.id ? editArticle : a)
    );
    setEditArticle(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Управление контентом</h1>
        <p className="text-slate-400 dark:text-white/40 mt-1">Редактирование лендинга и блога</p>
      </div>

      {/* Tab Toggle */}
      <div className="flex gap-2">
        <Button
          variant={tab === 'blog' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTab('blog')}
          className={tab === 'blog' ? 'bg-violet-600 hover:bg-violet-700' : ''}
        >
          <BookOpen className="mr-2 h-4 w-4" />Блог
        </Button>
        <Button
          variant={tab === 'landing' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTab('landing')}
          className={tab === 'landing' ? 'bg-violet-600 hover:bg-violet-700' : ''}
        >
          <Globe className="mr-2 h-4 w-4" />Лендинг
        </Button>
      </div>

      {/* Blog Tab */}
      {tab === 'blog' && (
        <>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 dark:text-white/30" />
              <Input
                placeholder="Поиск статей..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button className="bg-violet-600 hover:bg-violet-700">
              <Plus className="mr-2 h-4 w-4" />Новая статья
            </Button>
          </div>

          <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 dark:border-white/[0.06] hover:bg-transparent">
                    <TableHead className="text-slate-400 dark:text-white/40">Статья</TableHead>
                    <TableHead className="text-slate-400 dark:text-white/40">Статус</TableHead>
                    <TableHead className="text-slate-400 dark:text-white/40">Категория</TableHead>
                    <TableHead className="text-slate-400 dark:text-white/40">Просмотры</TableHead>
                    <TableHead className="text-slate-400 dark:text-white/40">Дата публикации</TableHead>
                    <TableHead className="text-slate-400 dark:text-white/40">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArticles.map((a) => (
                    <TableRow key={a.id} className="border-slate-200 dark:border-white/[0.06]">
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm text-slate-900 dark:text-white">{a.title}</p>
                          <p className="text-xs text-slate-300 dark:text-white/30">/{a.slug}</p>
                        </div>
                      </TableCell>
                      <TableCell><Badge className={articleStatusBadge[a.status]}>{articleStatusLabel[a.status]}</Badge></TableCell>
                      <TableCell><Badge variant="outline" className="border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/50">{a.category}</Badge></TableCell>
                      <TableCell className="text-sm text-slate-500 dark:text-white/60">{a.views.toLocaleString('ru-RU')}</TableCell>
                      <TableCell className="text-sm text-slate-400 dark:text-white/40">{a.publishedAt}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" className="h-7 text-xs border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/60 hover:text-white hover:bg-slate-100 dark:hover:bg-white/5" onClick={() => setEditArticle(a)}>
                            <Pencil className="h-3 w-3 mr-1" />Редактировать
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 text-xs border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => deleteArticle(a.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Edit Article Dialog */}
          <Dialog open={!!editArticle} onOpenChange={() => setEditArticle(null)}>
            <DialogContent className="max-w-2xl bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
              <DialogHeader>
                <DialogTitle className="text-slate-900 dark:text-white">Редактировать статью</DialogTitle>
              </DialogHeader>
              {editArticle && (
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block text-slate-500 dark:text-white/60">Заголовок</label>
                    <Input
                      value={editArticle.title}
                      onChange={(e) => setEditArticle({ ...editArticle, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block text-slate-500 dark:text-white/60">Slug</label>
                    <Input
                      value={editArticle.slug}
                      onChange={(e) => setEditArticle({ ...editArticle, slug: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block text-slate-500 dark:text-white/60">Статус</label>
                      <Select
                        value={editArticle.status}
                        onValueChange={(v) => setEditArticle({ ...editArticle, status: v as BlogArticle['status'] })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Черновик</SelectItem>
                          <SelectItem value="published">Опубликована</SelectItem>
                          <SelectItem value="archived">Архив</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block text-slate-500 dark:text-white/60">Категория</label>
                      <Input
                        value={editArticle.category}
                        onChange={(e) => setEditArticle({ ...editArticle, category: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block text-slate-500 dark:text-white/60">Содержание (Markdown)</label>
                    <Textarea
                      placeholder="Введите содержание статьи..."
                      rows={10}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <DialogClose asChild><Button variant="outline" className="border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/60">Отмена</Button></DialogClose>
                <Button className="bg-violet-600 hover:bg-violet-700" onClick={saveArticle}>
                  <Save className="mr-2 h-4 w-4" />Сохранить
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}

      {/* Landing Tab */}
      {tab === 'landing' && (
        <div className="space-y-4">
          {landingBlocks.map((block) => (
            <Card key={block.id} className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/10">{block.section}</Badge>
                      <span className="text-xs text-slate-300 dark:text-white/30">Изменено: {block.lastEdited} ({block.editedBy})</span>
                    </div>
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{block.title}</h3>
                    <p className="text-sm text-slate-400 dark:text-white/40 mt-1">{block.subtitle}</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/60 hover:text-white hover:bg-slate-100 dark:hover:bg-white/5" onClick={() => setEditBlock(block)}>
                    <Pencil className="h-4 w-4 mr-1" />Редактировать
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Edit Block Dialog */}
          <Dialog open={!!editBlock} onOpenChange={() => setEditBlock(null)}>
            <DialogContent className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
              <DialogHeader>
                <DialogTitle className="text-slate-900 dark:text-white">Редактировать секцию «{editBlock?.section}»</DialogTitle>
              </DialogHeader>
              {editBlock && (
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block text-slate-500 dark:text-white/60">Заголовок</label>
                    <Input
                      value={editBlock.title}
                      onChange={(e) => setEditBlock({ ...editBlock, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block text-slate-500 dark:text-white/60">Подзаголовок</label>
                    <Textarea
                      value={editBlock.subtitle}
                      onChange={(e) => setEditBlock({ ...editBlock, subtitle: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <DialogClose asChild><Button variant="outline" className="border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/60">Отмена</Button></DialogClose>
                <Button className="bg-violet-600 hover:bg-violet-700" onClick={saveBlock}>
                  <Save className="mr-2 h-4 w-4" />Сохранить
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default AdminContent;