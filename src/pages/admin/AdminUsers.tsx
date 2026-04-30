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
  Search,
  UserPlus,
  Ban,
  CheckCircle,
  Eye,
  Mail,
  MoreHorizontal,
  Filter,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ─── Mock Data ───────────────────────────────────────────────

interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'blocked';
  registeredAt: string;
  lastActive: string;
  skus: number;
  revenue: number;
}

const mockUsers: User[] = [
  { id: 'u1', email: 'ivan@example.com', name: 'Иван Петров', plan: 'pro', status: 'active', registeredAt: '2025-12-15', lastActive: '2026-04-28', skus: 156, revenue: 4990 },
  { id: 'u2', email: 'maria@shop.ru', name: 'Мария Сидорова', plan: 'enterprise', status: 'active', registeredAt: '2025-11-03', lastActive: '2026-04-28', skus: 892, revenue: 49900 },
  { id: 'u3', email: 'alex@brand.com', name: 'Алексей Козлов', plan: 'pro', status: 'active', registeredAt: '2026-01-20', lastActive: '2026-04-27', skus: 234, revenue: 4990 },
  { id: 'u4', email: 'elena@market.ru', name: 'Елена Волкова', plan: 'free', status: 'active', registeredAt: '2026-03-10', lastActive: '2026-04-25', skus: 12, revenue: 0 },
  { id: 'u5', email: 'dmitry@new.ru', name: 'Дмитрий Новиков', plan: 'free', status: 'blocked', registeredAt: '2026-02-14', lastActive: '2026-03-01', skus: 3, revenue: 0 },
  { id: 'u6', email: 'olga@store.ru', name: 'Ольга Морозова', plan: 'pro', status: 'active', registeredAt: '2025-10-22', lastActive: '2026-04-28', skus: 89, revenue: 4990 },
  { id: 'u7', email: 'sergey@biz.ru', name: 'Сергей Лебедев', plan: 'enterprise', status: 'active', registeredAt: '2025-09-05', lastActive: '2026-04-28', skus: 1245, revenue: 49900 },
  { id: 'u8', email: 'nina@fashion.ru', name: 'Нина Кузнецова', plan: 'free', status: 'active', registeredAt: '2026-04-01', lastActive: '2026-04-26', skus: 8, revenue: 0 },
  { id: 'u9', email: 'pavel@goods.ru', name: 'Павел Соколов', plan: 'pro', status: 'active', registeredAt: '2026-01-08', lastActive: '2026-04-27', skus: 67, revenue: 4990 },
  { id: 'u10', email: 'anna@retail.ru', name: 'Анна Попова', plan: 'free', status: 'blocked', registeredAt: '2026-02-28', lastActive: '2026-03-15', skus: 2, revenue: 0 },
];

const planBadge: Record<string, string> = {
  free: 'bg-white/5 text-slate-400 dark:text-white/50 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5',
  pro: 'bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/10',
  enterprise: 'bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/10',
};

const planLabel: Record<string, string> = { free: 'Free', pro: 'Pro', enterprise: 'Enterprise' };

// ─── Component ───────────────────────────────────────────────

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', plan: 'free' as User['plan'] });

  const filtered = users.filter((u) => {
    const matchSearch = u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.name.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === 'all' || u.plan === planFilter;
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchPlan && matchStatus;
  });

  const toggleBlock = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === 'blocked' ? 'active' : 'blocked' } : u
      )
    );
  };

  const changePlan = (id: string, plan: User['plan']) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, plan } : u)));
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) return;
    const user: User = {
      id: `u${Date.now()}`,
      email: newUser.email,
      name: newUser.name,
      plan: newUser.plan,
      status: 'active',
      registeredAt: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString().split('T')[0],
      skus: 0,
      revenue: 0,
    };
    setUsers((prev) => [user, ...prev]);
    setNewUser({ name: '', email: '', plan: 'free' });
    setAddOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Пользователи</h1>
          <p className="text-slate-400 dark:text-white/40 mt-1">Управление пользователями платформы</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-violet-600 hover:bg-violet-700">
              <UserPlus className="mr-2 h-4 w-4" />
              Добавить
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-white">Новый пользователь</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-1 block text-slate-500 dark:text-white/60">Имя</label>
                <Input
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Иван Петров"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block text-slate-500 dark:text-white/60">Email</label>
                <Input
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="ivan@example.com"
                  type="email"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block text-slate-500 dark:text-white/60">Тариф</label>
                <Select value={newUser.plan} onValueChange={(v) => setNewUser({ ...newUser, plan: v as User['plan'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline" className="border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/60">Отмена</Button></DialogClose>
              <Button className="bg-violet-600 hover:bg-violet-700" onClick={handleAddUser}>Создать</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 dark:text-white/30" />
              <Input
                placeholder="Поиск по имени или email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Тариф" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все тарифы</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Статус" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="blocked">Заблокированные</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="text-xs border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/50">{filtered.length} из {users.length}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 dark:border-white/[0.06] hover:bg-transparent">
                <TableHead className="text-slate-400 dark:text-white/40">Пользователь</TableHead>
                <TableHead className="text-slate-400 dark:text-white/40">Тариф</TableHead>
                <TableHead className="text-slate-400 dark:text-white/40">Статус</TableHead>
                <TableHead className="text-slate-400 dark:text-white/40">SKU</TableHead>
                <TableHead className="text-slate-400 dark:text-white/40">Выручка</TableHead>
                <TableHead className="text-slate-400 dark:text-white/40">Регистрация</TableHead>
                <TableHead className="text-slate-400 dark:text-white/40">Последняя активность</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id} className="border-slate-200 dark:border-white/[0.06]">
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm text-slate-900 dark:text-white">{u.name}</p>
                      <p className="text-xs text-slate-400 dark:text-white/40">{u.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={planBadge[u.plan]}>{planLabel[u.plan]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/10' : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/10'}>
                      {u.status === 'active' ? 'Активен' : 'Заблокирован'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500 dark:text-white/60">{u.skus}</TableCell>
                  <TableCell className="text-sm text-slate-500 dark:text-white/60">{u.revenue > 0 ? `${u.revenue.toLocaleString('ru-RU')} ₽` : '—'}</TableCell>
                  <TableCell className="text-sm text-slate-400 dark:text-white/40">{u.registeredAt}</TableCell>
                  <TableCell className="text-sm text-slate-400 dark:text-white/40">{u.lastActive}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 dark:text-white/40 hover:text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
                        <DropdownMenuItem onClick={() => setSelectedUser(u)} className="text-slate-500 dark:text-white/60 focus:text-white focus:bg-white/5">
                          <Eye className="mr-2 h-4 w-4" />Детали
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleBlock(u.id)} className="text-slate-500 dark:text-white/60 focus:text-white focus:bg-white/5">
                          {u.status === 'blocked' ? (
                            <><CheckCircle className="mr-2 h-4 w-4" />Разблокировать</>
                          ) : (
                            <><Ban className="mr-2 h-4 w-4" />Заблокировать</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => changePlan(u.id, 'free')} className="text-slate-500 dark:text-white/60 focus:text-white focus:bg-white/5">
                          <Mail className="mr-2 h-4 w-4" />Назначить Free
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => changePlan(u.id, 'pro')} className="text-slate-500 dark:text-white/60 focus:text-white focus:bg-white/5">
                          <Mail className="mr-2 h-4 w-4" />Назначить Pro
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => changePlan(u.id, 'enterprise')} className="text-slate-500 dark:text-white/60 focus:text-white focus:bg-white/5">
                          <Mail className="mr-2 h-4 w-4" />Назначить Enterprise
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-lg bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-white/[0.06]">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">Детали пользователя</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-violet-500/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-violet-400">
                    {selectedUser.name[0]}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-lg text-slate-900 dark:text-white">{selectedUser.name}</p>
                  <p className="text-sm text-slate-400 dark:text-white/40">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/[0.03] rounded-lg p-3">
                  <p className="text-xs text-slate-400 dark:text-white/40">Тариф</p>
                  <Badge className={planBadge[selectedUser.plan]}>{planLabel[selectedUser.plan]}</Badge>
                </div>
                <div className="bg-white/[0.03] rounded-lg p-3">
                  <p className="text-xs text-slate-400 dark:text-white/40">Статус</p>
                  <Badge className={selectedUser.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/10' : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/10'}>
                    {selectedUser.status === 'active' ? 'Активен' : 'Заблокирован'}
                  </Badge>
                </div>
                <div className="bg-white/[0.03] rounded-lg p-3">
                  <p className="text-xs text-slate-400 dark:text-white/40">SKU</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{selectedUser.skus}</p>
                </div>
                <div className="bg-white/[0.03] rounded-lg p-3">
                  <p className="text-xs text-slate-400 dark:text-white/40">Выручка</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{selectedUser.revenue > 0 ? `${selectedUser.revenue.toLocaleString('ru-RU')} ₽/мес` : '—'}</p>
                </div>
                <div className="bg-white/[0.03] rounded-lg p-3">
                  <p className="text-xs text-slate-400 dark:text-white/40">Регистрация</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedUser.registeredAt}</p>
                </div>
                <div className="bg-white/[0.03] rounded-lg p-3">
                  <p className="text-xs text-slate-400 dark:text-white/40">Последняя активность</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedUser.lastActive}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/60 hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                  onClick={() => { toggleBlock(selectedUser.id); setSelectedUser({ ...selectedUser, status: selectedUser.status === 'blocked' ? 'active' : 'blocked' }); }}
                >
                  {selectedUser.status === 'blocked' ? <><CheckCircle className="mr-1 h-4 w-4" />Разблокировать</> : <><Ban className="mr-1 h-4 w-4" />Заблокировать</>}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;