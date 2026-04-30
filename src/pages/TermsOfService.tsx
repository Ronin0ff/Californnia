import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white/80">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="text-white/40 hover:text-white/70 -ml-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              На главную
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Пользовательское соглашение</h1>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-white/70 leading-relaxed">
          <p className="text-sm text-white/40">Дата последнего обновления: 30 апреля 2026 г.</p>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">1. Предмет соглашения</h2>
            <p>Настоящее Пользовательское соглашение (далее — Соглашение) регулирует отношения между Оператором сервиса ProfitPilot AI (далее — Сервис) и пользователем (далее — Пользователь).</p>
            <p>Сервис предоставляет инструменты для расчёта юнит-экономики товаров на маркетплейсах Wildberries и Ozon, включая калькулятор себестоимости, AI-рекомендации, репрайсер и аналитику.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">2. Регистрация и доступ</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Доступ к Сервису осуществляется после оплаты подписки</li>
              <li>Пользователь получает данные для входа на указанный email</li>
              <li>Пользователь обязуется не передавать данные для входа третьим лицам</li>
              <li>Демо-версия доступна без регистрации с ограниченным функционалом</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">3. Тарифные планы</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-white/90">Стандарт (2 500 ₽/мес)</strong> — до 10 SKU, базовые функции</li>
              <li><strong className="text-white/90">Pro (4 990 ₽/мес)</strong> — до 50 SKU, репрайсер, AI-рекомендации, биддер</li>
              <li><strong className="text-white/90">Enterprise (19 990 ₽/мес)</strong> — безлимит SKU, приоритетная поддержка, SLA</li>
            </ul>
            <p>При годовой оплате предоставляется скидка ~17%. Триальный период — 14 дней с полным доступом к функциям Pro.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">4. Оплата и возврат</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Оплата осуществляется через ЮKassa банковской картой</li>
              <li>Подписка продлевается автоматически, если не отменена за 3 дня до окончания</li>
              <li>Возврат средств возможен в течение 14 дней после первой оплаты при отсутствии активного использования</li>
              <li>При смене тарифа разница пересчитывается пропорционально оставшемуся периоду</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">5. Ограничения ответственности</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Сервис предоставляется «как есть» (as is)</li>
              <li>Мы не гарантируем увеличение прибыли — рекомендации носят информационный характер</li>
              <li>Мы не несём ответственности за убытки, связанные с решениями на основе данных Сервиса</li>
              <li>Мы не несём ответственности за работоспособность API Wildberries и Ozon</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">6. Интеллектуальная собственность</h2>
            <p>Все права на Сервис, включая алгоритмы, дизайн, код и контент, принадлежат Оператору. Пользователь получает неисключительную лицензию на использование Сервиса в рамках оплаченной подписки.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">7. Запрещённые действия</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Обратная разработка, декомпиляция или копирование Сервиса</li>
              <li>Автоматизированный сбор данных (скрапинг) без разрешения</li>
              <li>Использование Сервиса для нарушения законодательства</li>
              <li>Передача доступа к аккаунту третьим лицам</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">8. Изменение условий</h2>
            <p>Оператор вправе изменять условия Соглашения. Уведомление о существенных изменениях направляется на email не менее чем за 30 дней. Продолжение использования Сервиса означает согласие с изменениями.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">9. Контакты</h2>
            <p>Email: <a href="mailto:support@profitpilot.ai" className="text-emerald-400 hover:underline">support@profitpilot.ai</a></p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
