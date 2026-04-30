import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PrivacyPolicy: React.FC = () => {
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
            <Shield className="h-5 w-5 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Политика конфиденциальности</h1>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-white/70 leading-relaxed">
          <p className="text-sm text-white/40">Дата последнего обновления: 30 апреля 2026 г.</p>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">1. Общие положения</h2>
            <p>Настоящая Политика конфиденциальности (далее — Политика) определяет порядок обработки и защиты персональных данных пользователей сервиса ProfitPilot AI (далее — Сервис), доступного по адресу profitpilot.ai.</p>
            <p>Оператором персональных данных является ИП/ООО ProfitPilot (далее — Оператор). Обработка персональных данных осуществляется в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных».</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">2. Какие данные мы собираем</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-white/90">Регистрационные данные:</strong> имя, email, номер телефона</li>
              <li><strong className="text-white/90">Платёжные данные:</strong> информация о транзакциях (обрабатывается ЮKassa, мы не храним данные банковских карт)</li>
              <li><strong className="text-white/90">Данные маркетплейсов:</strong> API-ключи, артикулы товаров, данные о продажах (передаются добровольно)</li>
              <li><strong className="text-white/90">Технические данные:</strong> IP-адрес, тип браузера, cookies</li>
              <li><strong className="text-white/90">Данные использования:</strong> страницы, функции, частота использования</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">3. Цели обработки данных</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Предоставление доступа к функциям Сервиса</li>
              <li>Обработка платежей и управление подписками</li>
              <li>Расчёт юнит-экономики и формирование рекомендаций</li>
              <li>Техническая поддержка и улучшение Сервиса</li>
              <li>Отправка уведомлений о работе Сервиса (с согласия)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">4. Хранение и защита данных</h2>
            <p>Персональные данные хранятся на защищённых серверах с шифрованием. Доступ к данным ограничен и предоставляется только авторизованным сотрудникам. Мы применяем организационные и технические меры защиты в соответствии с требованиями 152-ФЗ.</p>
            <p>Срок хранения данных — в течение действия подписки и 12 месяцев после её окончания, если иное не предусмотрено законодательством.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">5. Передача данных третьим лицам</h2>
            <p>Мы не продаём и не передаём ваши данные третьим лицам, за исключением:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-white/90">ЮKassa</strong> — для обработки платежей</li>
              <li><strong className="text-white/90">API маркетплейсов</strong> — по вашему запросу для синхронизации данных</li>
              <li><strong className="text-white/90">По требованию закона</strong> — при получении запроса от уполномоченных органов</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">6. Ваши права</h2>
            <p>Вы имеете право:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Запросить информацию о хранящихся данных</li>
              <li>Потребовать исправления неточных данных</li>
              <li>Потребовать удаления всех персональных данных</li>
              <li>Отозвать согласие на обработку данных</li>
              <li>Получить копию ваших данных в машиночитаемом формате</li>
            </ul>
            <p>Для реализации ваших прав обратитесь по email: <a href="mailto:privacy@profitpilot.ai" className="text-emerald-400 hover:underline">privacy@profitpilot.ai</a></p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">7. Cookies</h2>
            <p>Мы используем cookies для аутентификации, сохранения настроек и аналитики. Вы можете управлять cookies в настройках браузера. Отключение cookies может ограничить функциональность Сервиса.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">8. Контакты</h2>
            <p>По вопросам обработки персональных данных обращайтесь:</p>
            <p>Email: <a href="mailto:privacy@profitpilot.ai" className="text-emerald-400 hover:underline">privacy@profitpilot.ai</a></p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
