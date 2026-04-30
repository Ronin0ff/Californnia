import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Package,
  Calculator,
  Plug,
  BarChart3,
  ArrowRight,
  X,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

const ONBOARDING_KEY = 'profitpilot_onboarding_completed';

interface Step {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action: string;
  path: string;
}

const steps: Step[] = [
  {
    icon: Package,
    title: 'Добавьте товары',
    description: 'Начните с добавления SKU вручную или импорта CSV файла',
    action: 'Добавить SKU',
    path: '/app/skus',
  },
  {
    icon: Plug,
    title: 'Подключите маркетплейс',
    description: 'Подключите API Wildberries или Ozon для автоматической синхронизации',
    action: 'Настроить API',
    path: '/app/integrations',
  },
  {
    icon: Calculator,
    title: 'Рассчитайте юнит-экономику',
    description: 'Используйте калькулятор для расчёта себестоимости и маржи',
    action: 'Открыть калькулятор',
    path: '/app/calculator',
  },
  {
    icon: BarChart3,
    title: 'Анализируйте данные',
    description: 'Отслеживайте прибыльность и получайте AI-рекомендации',
    action: 'Аналитика',
    path: '/app/analytics',
  },
];

const OnboardingTour: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setVisible(false);
  };

  const goToStep = (path: string) => {
    dismiss();
    navigate(path);
  };

  if (!visible) return null;

  return (
    <Card className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-500/20 mb-6">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Добро пожаловать в ProfitPilot AI!</h3>
              <p className="text-sm text-white/40">Начните работу за 4 простых шага</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={dismiss} className="text-white/20 hover:text-white/40">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === currentStep;
            return (
              <button
                key={i}
                onClick={() => {
                  setCurrentStep(i);
                  goToStep(step.path);
                }}
                className={`text-left p-4 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-emerald-500/20' : 'bg-white/[0.04]'}`}>
                    <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-white/30'}`} />
                  </div>
                  <span className="text-xs text-white/20 font-medium">Шаг {i + 1}</span>
                </div>
                <h4 className={`text-sm font-medium mb-1 ${isActive ? 'text-emerald-400' : 'text-white/70'}`}>{step.title}</h4>
                <p className="text-xs text-white/30 line-clamp-2">{step.description}</p>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default OnboardingTour;
