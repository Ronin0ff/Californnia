import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@metagptx/web-sdk';

const client = createClient();

export type UserRole = 'owner' | 'client' | 'manager';
export type SubscriptionPlan = 'standard' | 'pro' | 'enterprise' | null;

export interface PermissionMap {
  dashboard: boolean;
  skus: boolean;
  calculator: boolean;
  recommendations: boolean;
  alerts: boolean;
  analytics: boolean;
  competitors: boolean;
  repricer: boolean;
  bidder: boolean;
  cards: boolean;
  integrations: boolean;
  profile: boolean;
  pricing: boolean;
  team: boolean;
}

export const DEFAULT_PERMISSIONS: PermissionMap = {
  dashboard: true,
  skus: true,
  calculator: true,
  recommendations: true,
  alerts: true,
  analytics: true,
  competitors: true,
  repricer: true,
  bidder: true,
  cards: true,
  integrations: true,
  profile: true,
  pricing: true,
  team: true,
};

export const NO_PERMISSIONS: PermissionMap = {
  dashboard: false,
  skus: false,
  calculator: false,
  recommendations: false,
  alerts: false,
  analytics: false,
  competitors: false,
  repricer: false,
  bidder: false,
  cards: false,
  integrations: false,
  profile: false,
  pricing: false,
  team: false,
};

export const STANDARD_PERMISSIONS: PermissionMap = {
  dashboard: true,
  skus: true,
  calculator: true,
  recommendations: false,
  alerts: true,
  analytics: false,
  competitors: false,
  repricer: false,
  bidder: false,
  cards: false,
  integrations: true,
  profile: true,
  pricing: true,
  team: false,
};

export const PRO_PERMISSIONS: PermissionMap = {
  dashboard: true,
  skus: true,
  calculator: true,
  recommendations: true,
  alerts: true,
  analytics: true,
  competitors: true,
  repricer: true,
  bidder: true,
  cards: true,
  integrations: true,
  profile: true,
  pricing: true,
  team: false,
};

export const ENTERPRISE_PERMISSIONS: PermissionMap = {
  ...DEFAULT_PERMISSIONS,
};

export const SECTION_LABELS: Record<keyof PermissionMap, string> = {
  dashboard: 'Дашборд',
  skus: 'SKU',
  calculator: 'Калькулятор',
  recommendations: 'AI Рекомендации',
  alerts: 'Уведомления',
  analytics: 'Аналитика',
  competitors: 'Конкуренты',
  repricer: 'Репрайсер',
  bidder: 'Биддер',
  cards: 'Карточки',
  integrations: 'Интеграции',
  profile: 'Профиль',
  pricing: 'Тарифы',
  team: 'Команда',
};

interface User {
  id?: string;
  email?: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  role: UserRole;
  permissions: PermissionMap;
  isOwner: boolean;
  currentPlan: SubscriptionPlan;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: async () => {},
  role: 'client',
  permissions: NO_PERMISSIONS,
  isOwner: false,
  currentPlan: null,
  refreshRole: async () => {},
});

export const useAuth = () => useContext(AuthContext);

function getPermissionsForPlan(plan: SubscriptionPlan): PermissionMap {
  switch (plan) {
    case 'enterprise': return ENTERPRISE_PERMISSIONS;
    case 'pro': return PRO_PERMISSIONS;
    case 'standard': return STANDARD_PERMISSIONS;
    default: return NO_PERMISSIONS;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>('client');
  const [permissions, setPermissions] = useState<PermissionMap>(NO_PERMISSIONS);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>(null);

  const determineRole = useCallback(async (userId: string, userEmail?: string) => {
    try {
      if (userEmail && userEmail.toLowerCase() === 'lok19787@gmail.com') {
        setRole('owner');
        setPermissions(DEFAULT_PERMISSIONS);
        setCurrentPlan('enterprise');
        return;
      }

      if (userEmail) {
        try {
          const managersRes = await client.entities.managers.queryAll({
            query: { email: userEmail.toLowerCase() },
            limit: 1,
          });
          const managers = managersRes.data?.items || [];
          if (managers.length > 0) {
            const mgr = managers[0];
            if (mgr.status === 'active') {
              setRole('manager');
              try {
                const parsed = typeof mgr.permissions === 'string'
                  ? JSON.parse(mgr.permissions)
                  : mgr.permissions;
                setPermissions({ ...NO_PERMISSIONS, ...parsed, profile: true });
              } catch {
                setPermissions({ ...NO_PERMISSIONS, profile: true });
              }
              setCurrentPlan('enterprise');
              return;
            }
          }
        } catch {
          // continue
        }
      }

      // Check subscription to determine plan
      try {
        const subRes = await client.entities.subscriptions.queryAll({
          query: { user_id: userId, status: 'active' },
          limit: 1,
        });
        const subs = subRes.data?.items || [];
        if (subs.length > 0) {
          const plan = (subs[0].plan_id || subs[0].plan || 'standard') as SubscriptionPlan;
          setCurrentPlan(plan);
          setRole('client');
          setPermissions(getPermissionsForPlan(plan));
          return;
        }
      } catch {
        // no subscription found
      }

      // No subscription — minimal access (only pricing and profile)
      setRole('client');
      setCurrentPlan(null);
      setPermissions({ ...NO_PERMISSIONS, profile: true, pricing: true });
    } catch (error) {
      console.error('Failed to determine role:', error);
      setRole('client');
      setCurrentPlan(null);
      setPermissions({ ...NO_PERMISSIONS, profile: true, pricing: true });
    }
  }, []);

  const refreshRole = useCallback(async () => {
    if (user?.id) {
      await determineRole(user.id, user.email);
    }
  }, [user?.id, user?.email, determineRole]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await client.auth.me();
      if (response.data) {
        setUser(response.data);
        await determineRole(response.data.id || '', response.data.email || '');
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    client.auth.toLogin();
  };

  const logout = async () => {
    try {
      await client.auth.logout();
      setUser(null);
      setRole('client');
      setPermissions(NO_PERMISSIONS);
      setCurrentPlan(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isOwner = role === 'owner';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, role, permissions, isOwner, currentPlan, refreshRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
