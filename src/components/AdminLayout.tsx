import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  Settings,
  ScrollText,
  ArrowLeft,
  Shield,
} from 'lucide-react';

const adminNavItems = [
  { path: '/app/admin', label: 'Дашборд', icon: LayoutDashboard, exact: true },
  { path: '/app/admin/users', label: 'Пользователи', icon: Users },
  { path: '/app/admin/subscriptions', label: 'Подписки', icon: CreditCard },
  { path: '/app/admin/content', label: 'Контент', icon: FileText },
  { path: '/app/admin/settings', label: 'Настройки', icon: Settings },
  { path: '/app/admin/logs', label: 'Логи', icon: ScrollText },
];

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-white border-r border-violet-100 flex flex-col fixed h-full z-30">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-violet-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Admin</span>
              <span className="text-xs text-violet-400 block -mt-1">ProfitPilot</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-violet-50 text-violet-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-violet-600' : 'text-slate-400'}`} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Back to App */}
        <div className="p-4 border-t border-violet-100">
          <NavLink to="/app">
            <Button variant="outline" size="sm" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Вернуться в приложение
            </Button>
          </NavLink>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64">
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;