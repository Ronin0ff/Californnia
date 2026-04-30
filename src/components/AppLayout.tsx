import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth, PermissionMap } from '@/contexts/AuthContext';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Package,
  Calculator,
  Sparkles,
  Bell,
  LogIn,
  LogOut,
  BookOpen,
  BarChart3,
  Users,
  DollarSign,
  Target,
  FileText,
  Shield,
  UserCircle,
  Plug,
  CreditCard,
  UserCog,
  Compass,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: keyof PermissionMap;
  ownerOnly?: boolean;
}

const navItems: NavItem[] = [
  { path: '/app', label: 'Дашборд', icon: LayoutDashboard, permission: 'dashboard' },
  { path: '/app/analytics', label: 'Аналитика', icon: BarChart3, permission: 'analytics' },
  { path: '/app/competitors', label: 'Конкуренты', icon: Users, permission: 'competitors' },
  { path: '/app/repricer', label: 'Репрайсер', icon: DollarSign, permission: 'repricer' },
  { path: '/app/bidder', label: 'Биддер', icon: Target, permission: 'bidder' },
  { path: '/app/cards', label: 'Карточки', icon: FileText, permission: 'cards' },
  { path: '/app/skus', label: 'SKU', icon: Package, permission: 'skus' },
  { path: '/app/calculator', label: 'Калькулятор', icon: Calculator, permission: 'calculator' },
  { path: '/app/recommendations', label: 'AI Рекомендации', icon: Sparkles, permission: 'recommendations' },
  { path: '/app/alerts', label: 'Уведомления', icon: Bell, permission: 'alerts' },
  { path: '/app/integrations', label: 'Интеграции', icon: Plug, permission: 'integrations' },
  { path: '/app/pricing', label: 'Тарифы', icon: CreditCard, permission: 'pricing' },
  { path: '/app/team', label: 'Команда', icon: UserCog, permission: 'team' },
  { path: '/app/profile', label: 'Профиль', icon: UserCircle, permission: 'profile' },
  { path: '/app/admin', label: 'Админ', icon: Shield, ownerOnly: true },
  { path: '/blog/', label: 'Блог', icon: BookOpen },
];

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, login, logout, permissions, isOwner } = useAuth();
  const { setDemoMode } = useDemoMode();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  // Force demo mode OFF inside the app — demo is only accessible from landing
  useEffect(() => {
    setDemoMode(false);
  }, [setDemoMode]);

  const visibleItems = navItems.filter((item) => {
    if (item.ownerOnly) return isOwner;
    if (!item.permission) return true;
    return permissions[item.permission];
  });

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-[#0a0a0f]' : 'bg-slate-50'}`}>
      {/* Sidebar */}
      <aside className={`w-64 flex flex-col fixed h-full z-30 border-r ${isDark ? 'bg-[#0d0d14] border-white/[0.06]' : 'bg-white border-slate-200'}`}>
        {/* Logo */}
        <div className={`h-16 flex items-center px-6 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
              <Compass className="h-5 w-5 text-white relative z-10" />
            </div>
            <span className={`font-bold text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Profit<span className="text-emerald-400">Pilot</span></span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === '/app'
              ? location.pathname === '/app'
              : location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : isDark
                      ? 'text-white/40 hover:bg-white/[0.04] hover:text-white/70'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-emerald-400' : isDark ? 'text-white/20' : 'text-slate-400'}`} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Demo toggle + Theme toggle + User section */}
        <div className="p-4 border-t border-white/[0.06] space-y-3">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className={`w-full justify-start text-xs ${isDark ? 'text-white/30 hover:text-white/50 hover:bg-white/[0.04]' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 mr-2" />
                Светлая тема
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 mr-2" />
                Тёмная тема
              </>
            )}
          </Button>
          {loading ? (
            <div className="h-10 flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500" />
            </div>
          ) : user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-emerald-400">
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span className={`text-sm truncate ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{user.email || 'Пользователь'}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={logout} title="Выйти" className={isDark ? 'text-white/20 hover:text-white/40 hover:bg-white/[0.04]' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" className={`w-full ${isDark ? 'border-white/10 text-white/40 hover:text-white/60 hover:bg-white/[0.04]' : 'border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`} onClick={login}>
              <LogIn className="mr-2 h-4 w-4" />
              Войти
            </Button>
          )}
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

export default AppLayout;