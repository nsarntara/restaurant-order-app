import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { OrderProvider } from './context/OrderContext';
import { LanguageProvider, useLang, LangToggle } from './context/LanguageContext';
import MenuPage from './pages/MenuPage';
import KitchenPage from './pages/KitchenPage';
import ReportPage from './pages/ReportPage';

const TABLES = [1, 2, 3, 4, 5, 6, 7, 8];

function QRCode({ table }) {
  const { t } = useLang();
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-16 h-16 bg-gray-900 rounded-lg p-1.5">
        <div className="w-full h-full grid grid-cols-5 gap-px">
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className="rounded-sm"
              style={{ backgroundColor: [0,1,5,6,7,11,12,13,17,18,19,23,24].includes(i) ? 'white' : 'transparent' }}
            />
          ))}
        </div>
      </div>
      <span className="text-xs text-gray-500 font-medium">{t('table', { n: table })}</span>
    </div>
  );
}

function Home() {
  const { t } = useLang();

  const steps = [
    { icon: '📱', key: 'home_step1' },
    { icon: '🍔', key: 'home_step2' },
    { icon: '👨‍🍳', key: 'home_step3' },
    { icon: '✅', key: 'home_step4' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col items-center justify-center p-6">
      {/* Brand */}
      <div className="text-center mb-10 relative">
        {/* Language toggle — top right of brand area */}
        <div className="absolute -top-2 right-0">
          <LangToggle className="bg-white shadow text-gray-700 border border-gray-200" />
        </div>
        <div className="w-20 h-20 bg-amber-500 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg shadow-amber-200">
          🍽
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Bistro Deluxe</h1>
        <p className="text-gray-500 mt-2">{t('home_subtitle')}</p>
      </div>

      <div className="w-full max-w-lg space-y-4">
        {/* Customer section */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">📱</span>
            <h2 className="font-bold text-gray-800">{t('home_customer_title')}</h2>
          </div>
          <p className="text-gray-400 text-sm mb-5">{t('home_customer_desc')}</p>
          <div className="grid grid-cols-4 gap-3">
            {TABLES.map(tbl => (
              <Link
                key={tbl}
                to={`/menu/${tbl}`}
                className="flex flex-col items-center bg-gray-50 hover:bg-amber-50 border border-gray-100 hover:border-amber-200 rounded-2xl py-4 px-2 transition-all hover:scale-105 hover:shadow-md"
              >
                <QRCode table={tbl} />
              </Link>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">{t('home_customer_hint')}</p>
        </div>

        {/* Kitchen section */}
        <Link
          to="/kitchen"
          className="block bg-gray-900 text-white rounded-3xl shadow-lg p-6 hover:bg-gray-800 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform">
              👨‍🍳
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold">{t('home_kitchen_title')}</h2>
              <p className="text-gray-400 text-sm">{t('home_kitchen_desc')}</p>
            </div>
            <span className="text-gray-400 text-2xl group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </Link>

        {/* Reports link */}
        <Link
          to="/reports"
          className="block bg-white rounded-3xl shadow-lg p-5 hover:bg-amber-50 transition-colors group border border-amber-100"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform">
              📊
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-gray-800">{t('report_title')}</h2>
              <p className="text-gray-400 text-sm">{t('report_trend_title')} · {t('report_peak_hours_title')} · {t('report_peak_days_title')}</p>
            </div>
            <span className="text-gray-400 text-xl group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </Link>

        {/* How it works */}
        <div className="bg-white/70 rounded-2xl p-5 text-sm text-gray-600">
          <p className="font-semibold text-gray-700 mb-3">{t('home_how_title')}</p>
          <div className="space-y-2">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-lg">{step.icon}</span>
                <span>{t(step.key)}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3 pt-3 border-t">{t('home_sync_note')}</p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <OrderProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/"              element={<Home />} />
            <Route path="/menu/:tableId" element={<MenuPage />} />
            <Route path="/kitchen"       element={<KitchenPage />} />
            <Route path="/reports"       element={<ReportPage />} />
          </Routes>
        </BrowserRouter>
      </OrderProvider>
    </LanguageProvider>
  );
}
