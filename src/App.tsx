import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthCallback from './pages/AuthCallback';
import AuthError from './pages/AuthError';
import { AuthProvider, useAuth, PermissionMap } from './contexts/AuthContext';
import { DemoModeProvider } from './contexts/DemoModeContext';
import AppLayout from './components/AppLayout';
import Landing from './pages/Landing';
import Demo from './pages/Demo';
import Dashboard from './pages/Dashboard';
import SkuManagement from './pages/SkuManagement';
import CostCalculator from './pages/CostCalculator';
import AiRecommendations from './pages/AiRecommendations';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import CompetitorAnalytics from './pages/CompetitorAnalytics';
import Repricer from './pages/Repricer';
import Bidder from './pages/Bidder';
import ProductCards from './pages/ProductCards';
import AdminLayout from './components/AdminLayout';
import SubscriptionGuard from './components/SubscriptionGuard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';
import AdminContent from './pages/admin/AdminContent';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLogs from './pages/admin/AdminLogs';
import Profile from './pages/Profile';
import Integrations from './pages/Integrations';
import Pricing from './pages/Pricing';
import Team from './pages/Team';
import BlogRoutes from './blog-routes';
import React from 'react';
import { ThemeProvider } from './components/ThemeProvider';

const queryClient = new QueryClient();

const PermissionGuard: React.FC<{
  permission: keyof PermissionMap;
  children: React.ReactNode;
}> = ({ permission, children }) => {
  const { permissions } = useAuth();
  if (!permissions[permission]) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="rounded-full bg-red-500/10 p-4 mb-4">
          <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white">Доступ ограничен</h2>
        <p className="mt-2 text-white/40">Эта функция недоступна на вашем тарифе. Перейдите на более высокий план.</p>
      </div>
    );
  }
  return <>{children}</>;
};

const OwnerGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOwner } = useAuth();
  if (!isOwner) {
    return <Navigate to="/app" replace />;
  }
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, loading, currentPlan } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 animate-pulse" />
          <div className="text-white/40 text-sm">Загрузка...</div>
        </div>
      </div>
    );
  }

  const authenticatedRedirect = currentPlan ? '/app' : '/app/pricing';

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={authenticatedRedirect} replace /> : <Landing />} />
      <Route path="/demo" element={<Demo />} />
      {/* App routes */}
      <Route path="/app" element={<SubscriptionGuard><AppLayout><PermissionGuard permission="dashboard"><Dashboard /></PermissionGuard></AppLayout></SubscriptionGuard>} />
      <Route path="/app/skus" element={<SubscriptionGuard><AppLayout><PermissionGuard permission="skus"><SkuManagement /></PermissionGuard></AppLayout></SubscriptionGuard>} />
      <Route path="/app/calculator" element={<SubscriptionGuard><AppLayout><PermissionGuard permission="calculator"><CostCalculator /></PermissionGuard></AppLayout></SubscriptionGuard>} />
      <Route path="/app/recommendations" element={<SubscriptionGuard><AppLayout><PermissionGuard permission="recommendations"><AiRecommendations /></PermissionGuard></AppLayout></SubscriptionGuard>} />
      <Route path="/app/alerts" element={<SubscriptionGuard><AppLayout><PermissionGuard permission="alerts"><Alerts /></PermissionGuard></AppLayout></SubscriptionGuard>} />
      <Route path="/app/analytics" element={<SubscriptionGuard><AppLayout><PermissionGuard permission="analytics"><Analytics /></PermissionGuard></AppLayout></SubscriptionGuard>} />
      <Route path="/app/competitors" element={<SubscriptionGuard><AppLayout><PermissionGuard permission="competitors"><CompetitorAnalytics /></PermissionGuard></AppLayout></SubscriptionGuard>} />
      <Route path="/app/repricer" element={<SubscriptionGuard><AppLayout><PermissionGuard permission="repricer"><Repricer /></PermissionGuard></AppLayout></SubscriptionGuard>} />
      <Route path="/app/bidder" element={<SubscriptionGuard><AppLayout><PermissionGuard permission="bidder"><Bidder /></PermissionGuard></AppLayout></SubscriptionGuard>} />
      <Route path="/app/cards" element={<SubscriptionGuard><AppLayout><PermissionGuard permission="cards"><ProductCards /></PermissionGuard></AppLayout></SubscriptionGuard>} />
      <Route path="/app/profile" element={<AppLayout><PermissionGuard permission="profile"><Profile /></PermissionGuard></AppLayout>} />
      <Route path="/app/integrations" element={<SubscriptionGuard><AppLayout><PermissionGuard permission="integrations"><Integrations /></PermissionGuard></AppLayout></SubscriptionGuard>} />
      <Route path="/app/pricing" element={<AppLayout><PermissionGuard permission="pricing"><Pricing /></PermissionGuard></AppLayout>} />
      <Route path="/app/team" element={<SubscriptionGuard><AppLayout><PermissionGuard permission="team"><Team /></PermissionGuard></AppLayout></SubscriptionGuard>} />
      {/* Admin */}
      <Route path="/app/admin" element={<OwnerGuard><AdminLayout><AdminDashboard /></AdminLayout></OwnerGuard>} />
      <Route path="/app/admin/users" element={<OwnerGuard><AdminLayout><AdminUsers /></AdminLayout></OwnerGuard>} />
      <Route path="/app/admin/subscriptions" element={<OwnerGuard><AdminLayout><AdminSubscriptions /></AdminLayout></OwnerGuard>} />
      <Route path="/app/admin/content" element={<OwnerGuard><AdminLayout><AdminContent /></AdminLayout></OwnerGuard>} />
      <Route path="/app/admin/settings" element={<OwnerGuard><AdminLayout><AdminSettings /></AdminLayout></OwnerGuard>} />
      <Route path="/app/admin/logs" element={<OwnerGuard><AdminLayout><AdminLogs /></AdminLayout></OwnerGuard>} />
      {/* Blog & Auth */}
      <Route path="/blog/*" element={<BlogRoutes />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/auth/error" element={<AuthError />} />
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DemoModeProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </DemoModeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
export { AppRoutes };
