import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Cookie } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'profitpilot_cookie_consent';

const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-4xl mx-auto bg-[#141420] border border-white/10 rounded-2xl p-5 shadow-2xl shadow-black/50 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Cookie className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-white/80">
              Мы используем cookies для аутентификации и улучшения работы сервиса.{' '}
              <Link to="/privacy" className="text-emerald-400 hover:underline">
                Политика конфиденциальности
              </Link>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={decline}
            className="text-white/40 hover:text-white/70"
          >
            Отклонить
          </Button>
          <Button
            size="sm"
            onClick={accept}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            Принять
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
