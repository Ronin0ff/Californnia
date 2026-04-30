import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@metagptx/web-sdk';
import { useAuth, PermissionMap, SECTION_LABELS, NO_PERMISSIONS, DEFAULT_PERMISSIONS } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Users, UserPlus, Trash2, Edit, Shield, Mail, CheckCircle, XCircle } from 'lucide-react';

const client = createClient();

interface Manager {
  id: number;
  email: string;
  name: string;
  permissions: string;
  status: string;
  created_at?: string;
}

const MAX_MANAGERS = 3;

export default function Team() {
  const { user, isOwner, refreshRole } = useAuth();
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPermissions, setNewPermissions] = useState<PermissionMap>({ ...DEFAULT_PERMISSIONS });
  const [editingManager, setEditingManager] = useState<Manager | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchManagers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await client.entities.managers.query({
        query: {},
        sort: '-created_at',
        limit: 100,
      });
      setManagers(res.data?.items || []);
    } catch (err) {
      console.error('Failed to fetch managers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchManagers();
  }, [fetchManagers]);

  const handleAddManager = async () => {
    if (!newName.trim() || !newEmail.trim()) return;
    if (managers.length >= MAX_MANAGERS) return;
    setSaving(true);
    try {
      await client.entities.managers.create({
        data: {
          name: newName.trim(),
          email: newEmail.trim().toLowerCase(),
          permissions: JSON.stringify(newPermissions),
          status: 'active',
        },
      });
      setAddOpen(false);
      setNewName('');
      setNewEmail('');
      setNewPermissions({ ...DEFAULT_PERMISSIONS });
      await fetchManagers();
    } catch (err) {
      console.error('Failed to add manager:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEditManager = async () => {
    if (!editingManager) return;
    setSaving(true);
    try {
      await client.entities.managers.update({
        id: String(editingManager.id),
        data: {
          name: editingManager.name,
          email: editingManager.email,
          permissions: JSON.stringify(newPermissions),
          status: editingManager.status,
        },
      });
      setEditOpen(false);
      setEditingManager(null);
      setNewPermissions({ ...DEFAULT_PERMISSIONS });
      await fetchManagers();
    } catch (err) {
      console.error('Failed to update manager:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteManager = async () => {
    if (!deleteId) return;
    try {
      await client.entities.managers.delete({ id: String(deleteId) });
      setDeleteId(null);
      await fetchManagers();
    } catch (err) {
      console.error('Failed to delete manager:', err);
    }
  };

  const handleToggleStatus = async (mgr: Manager) => {
    try {
      const newStatus = mgr.status === 'active' ? 'inactive' : 'active';
      await client.entities.managers.update({
        id: String(mgr.id),
        data: { status: newStatus },
      });
      await fetchManagers();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const openEditDialog = (mgr: Manager) => {
    setEditingManager(mgr);
    try {
      const parsed = typeof mgr.permissions === 'string' ? JSON.parse(mgr.permissions) : mgr.permissions;
      setNewPermissions({ ...NO_PERMISSIONS, ...parsed });
    } catch {
      setNewPermissions({ ...NO_PERMISSIONS });
    }
    setEditOpen(true);
  };

  const togglePermission = (key: keyof PermissionMap, value: boolean) => {
    setNewPermissions((prev) => ({ ...prev, [key]: value }));
  };

  const enableAll = () => setNewPermissions({ ...DEFAULT_PERMISSIONS });
  const disableAll = () => setNewPermissions({ ...NO_PERMISSIONS, profile: true });

  const permissionSections: (keyof PermissionMap)[] = [
    'dashboard', 'skus', 'calculator', 'recommendations', 'alerts',
    'analytics', 'competitors', 'repricer', 'bidder', 'cards',
    'integrations', 'pricing', 'team',
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Команда</h1>
          <p className="text-muted-foreground mt-1">
            Управление менеджерами и настройка прав доступа (максимум {MAX_MANAGERS})
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button disabled={managers.length >= MAX_MANAGERS}>
              <UserPlus className="mr-2 h-4 w-4" />
              Добавить менеджера
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Новый менеджер</DialogTitle>
              <DialogDescription>
                Добавьте менеджера и настройте права доступа к разделам
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Имя</Label>
                  <Input
                    placeholder="Иван Петров"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="ivan@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Права доступа</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={enableAll}>
                      Включить все
                    </Button>
                    <Button variant="outline" size="sm" onClick={disableAll}>
                      Отключить все
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {permissionSections.map((key) => (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <span className="text-sm">{SECTION_LABELS[key]}</span>
                      <Switch
                        checked={newPermissions[key]}
                        onCheckedChange={(v) => togglePermission(key, v)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>
                Отмена
              </Button>
              <Button
                onClick={handleAddManager}
                disabled={!newName.trim() || !newEmail.trim() || saving}
              >
                {saving ? 'Сохранение...' : 'Добавить'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-violet-100 p-2 dark:bg-violet-900/30">
                <Users className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{managers.length}</p>
                <p className="text-sm text-muted-foreground">из {MAX_MANAGERS} менеджеров</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {managers.filter((m) => m.status === 'active').length}
                </p>
                <p className="text-sm text-muted-foreground">активных</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/30">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {managers.filter((m) => m.status === 'inactive').length}
                </p>
                <p className="text-sm text-muted-foreground">неактивных</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manager Cards */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Загрузка...</div>
      ) : managers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Нет менеджеров</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Добавьте до {MAX_MANAGERS} менеджеров и настройте им доступ к разделам
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {managers.map((mgr) => {
            let parsedPerms: PermissionMap = NO_PERMISSIONS;
            try {
              const p = typeof mgr.permissions === 'string' ? JSON.parse(mgr.permissions) : mgr.permissions;
              parsedPerms = { ...NO_PERMISSIONS, ...p };
            } catch { /* keep defaults */ }
            const enabledCount = permissionSections.filter((k) => parsedPerms[k]).length;

            return (
              <Card key={mgr.id} className={mgr.status === 'inactive' ? 'opacity-60' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30">
                        <span className="text-sm font-semibold text-violet-600">
                          {mgr.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-base">{mgr.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {mgr.email}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={mgr.status === 'active' ? 'default' : 'secondary'}>
                        {mgr.status === 'active' ? 'Активен' : 'Неактивен'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(mgr)}
                      >
                        {mgr.status === 'active' ? 'Отключить' : 'Включить'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(mgr)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setDeleteId(mgr.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Доступ: {enabledCount} из {permissionSections.length} разделов
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {permissionSections.map((key) => (
                      <Badge
                        key={key}
                        variant={parsedPerms[key] ? 'default' : 'outline'}
                        className={
                          parsedPerms[key]
                            ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
                            : 'text-muted-foreground'
                        }
                      >
                        {SECTION_LABELS[key]}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать менеджера</DialogTitle>
            <DialogDescription>
              Измените права доступа для {editingManager?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Имя</Label>
                <Input value={editingManager?.name || ''} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={editingManager?.email || ''} disabled className="bg-muted" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Права доступа</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={enableAll}>
                    Включить все
                  </Button>
                  <Button variant="outline" size="sm" onClick={disableAll}>
                    Отключить все
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {permissionSections.map((key) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <span className="text-sm">{SECTION_LABELS[key]}</span>
                    <Switch
                      checked={newPermissions[key]}
                      onCheckedChange={(v) => togglePermission(key, v)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleEditManager} disabled={saving}>
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить менеджера?</AlertDialogTitle>
            <AlertDialogDescription>
              Менеджер потеряет доступ ко всем разделам. Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteManager}
              className="bg-red-600 hover:bg-red-700"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}