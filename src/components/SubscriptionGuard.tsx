import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const SubscriptionGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isOwner, loading: authLoading, currentPlan } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 animate-pulse" />
          <div className="text-white/40 text-sm">Загрузка...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (isOwner) {
    return <>{children}</>;
  }

  if (!currentPlan) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default SubscriptionGuard;
