import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { useLang, LangToggle } from '../context/LanguageContext';

/* ── date helpers ─────────────────────────────────── */
function sameDay(a, b)   { return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
function sameMonth(a, b) { return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth(); }
function sameYear(a, b)  { return a.getFullYear()===b.getFullYear(); }

function isInPeriod(ts, period, ref) {
  const d = new Date(ts);
  if (period === 'daily')   return sameDay(d, ref);
  if (period === 'monthly') return sameMonth(d, ref);
  return sameYear(d, ref);
}

function orderTotal(order) {
  return order.items.reduce((s, i) => s + i.price * i.quantity, 0);
}

/* ── SVG Bar Chart ────────────────────────────────── */
function BarChart({ data, barW = 34, gap = 6, chartH = 150, color, peakColor, formatVal, showEvery = 1 }) {
  const slotW  = barW + gap;
  const totalW = Math.max(data.length * slotW + gap, 10);
  const maxVal = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="overflow-x-auto pb-1">
      <svg
        width={totalW}
        height={chartH + 44}
        style={{ display: 'block', minWidth: totalW }}
      >
        {/* Subtle grid lines */}
        {[0.25, 0.5, 0.75, 1].map(p => (
          <line key={p}
            x1={0} y1={chartH - p * chartH}
            x2={totalW} y2={chartH - p * chartH}
            stroke="#f3f4f6" strokeWidth={1}
          />
        ))}

        {data.map((d, i) => {
          const isPeak = d.value > 0 && d.value === maxVal;
          const barH   = d.value > 0 ? Math.max((d.value / maxVal) * chartH, 4) : 0;
          const x      = gap / 2 + i * slotW;
          const y      = chartH - barH;
          const cx     = x + barW / 2;
          const fill   = isPeak ? peakColor : color;

          return (
            <g key={i}>
              {/* Bar */}
              {barH > 0 && (
                <rect x={x} y={y} width={barW} height={barH}
                  fill={fill} rx={4} opacity={0.9}
                />
              )}
              {/* Zero bar placeholder */}
              {barH === 0 && (
                <rect x={x} y={chartH - 3} width={barW} height={3}
                  fill="#e5e7eb" rx={2}
                />
              )}

              {/* Value label above bar */}
              {d.value > 0 && (
                <text x={cx} y={y - 4}
                  textAnchor="middle"
                  fontSize={isPeak ? 9 : 8}
                  fontWeight={isPeak ? 'bold' : 'normal'}
                  fill={isPeak ? peakColor : '#9ca3af'}
                >
                  {formatVal ? formatVal(d.value) : d.value}
                </text>
              )}

              {/* X-axis label */}
              {i % showEvery === 0 && (
                <text x={cx} y={chartH + 16}
                  textAnchor="middle"
                  fontSize={9}
                  fill={isPeak ? peakColor : '#9ca3af'}
                  fontWeight={isPeak ? 'bold' : 'normal'}
                >
                  {d.label}
                </text>
              )}

              {/* Peak marker */}
              {isPeak && (
                <text x={cx} y={chartH + 28}
                  textAnchor="middle" fontSize={8}
                  fill={peakColor} fontWeight="bold"
                >
                  ▲
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ── Stat Card ────────────────────────────────────── */
function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm border-t-4 ${accent}`}>
      <p className="text-2xl mb-1">{icon}</p>
      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
      <p className="text-xl font-extrabold text-gray-900 mt-0.5 leading-tight">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>}
    </div>
  );
}

/* ── Period Navigator ─────────────────────────────── */
function PeriodNav({ period, date, onPrev, onNext, onToday, t, lang }) {
  const isToday = (() => {
    const now = new Date();
    if (period === 'daily')   return sameDay(date, now);
    if (period === 'monthly') return sameMonth(date, now);
    return sameYear(date, now);
  })();

  const label = (() => {
    if (period === 'daily') {
      const days = [t('day_0'),t('day_1'),t('day_2'),t('day_3'),t('day_4'),t('day_5'),t('day_6')];
      const mons = [t('mon_0'),t('mon_1'),t('mon_2'),t('mon_3'),t('mon_4'),t('mon_5'),
                    t('mon_6'),t('mon_7'),t('mon_8'),t('mon_9'),t('mon_10'),t('mon_11')];
      return `${days[date.getDay()]} ${date.getDate()} ${mons[date.getMonth()]} ${date.getFullYear()}`;
    }
    if (period === 'monthly') {
      return `${t(`mon_long_${date.getMonth()}`)} ${date.getFullYear()}`;
    }
    return `${date.getFullYear()}`;
  })();

  const todayKey = period === 'daily' ? 'report_today' : period === 'monthly' ? 'report_this_month' : 'report_this_year';

  return (
    <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 shadow-sm">
      <button onClick={onPrev} className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold transition-colors">‹</button>
      <div className="text-center flex-1 mx-2">
        <p className="font-bold text-gray-800 text-sm">{label}</p>
        {!isToday && (
          <button onClick={onToday} className="text-xs text-amber-600 underline mt-0.5">{t(todayKey)}</button>
        )}
      </div>
      <button
        onClick={onNext}
        disabled={isToday}
        className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-gray-600 font-bold transition-colors"
      >›</button>
    </div>
  );
}

/* ── Top Items List ───────────────────────────────── */
function TopItemsList({ periodOrders, t, itemName }) {
  const ranked = useMemo(() => {
    const map = {};
    periodOrders.forEach(o => {
      o.items.forEach(item => {
        if (!map[item.id]) map[item.id] = { item, qty: 0, revenue: 0 };
        map[item.id].qty     += item.quantity;
        map[item.id].revenue += item.price * item.quantity;
      });
    });
    return Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 8);
  }, [periodOrders]);

  if (ranked.length === 0) return null;
  const maxQty = ranked[0].qty;

  return (
    <div className="space-y-2">
      {ranked.map(({ item, qty, revenue }, i) => (
        <div key={item.id} className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-400 w-5 text-right">{i + 1}</span>
          <span className="text-xl">{item.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <p className="text-sm font-semibold text-gray-800 truncate">{itemName(item)}</p>
              <span className="text-xs font-bold text-gray-500 ml-2 flex-shrink-0">${revenue.toFixed(2)}</span>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${i === 0 ? 'bg-amber-500' : 'bg-amber-300'}`}
                style={{ width: `${(qty / maxQty) * 100}%` }}
              />
            </div>
          </div>
          <span className={`text-xs font-bold flex-shrink-0 ${i === 0 ? 'text-amber-600' : 'text-gray-400'}`}>
            ×{qty}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Main Report Page ─────────────────────────────── */
export default function ReportPage() {
  const { orders }      = useOrders();
  const { t, lang, itemName } = useLang();

  const [period, setPeriod]   = useState('daily');
  const [refDate, setRefDate] = useState(() => new Date());

  /* ── navigate period ── */
  const navigate = (dir) => {
    setRefDate(prev => {
      const d = new Date(prev);
      if (period === 'daily')   d.setDate(d.getDate() + dir);
      if (period === 'monthly') d.setMonth(d.getMonth() + dir);
      if (period === 'yearly')  d.setFullYear(d.getFullYear() + dir);
      return d;
    });
  };

  /* ── filtered orders ── */
  const periodOrders = useMemo(
    () => orders.filter(o => isInPeriod(o.createdAt, period, refDate)),
    [orders, period, refDate]
  );

  /* ── summary stats ── */
  const summary = useMemo(() => {
    const revenue = periodOrders.reduce((s, o) => s + orderTotal(o), 0);
    const count   = periodOrders.length;
    const avg     = count > 0 ? revenue / count : 0;
    const itemMap = {};
    periodOrders.forEach(o => o.items.forEach(i => {
      itemMap[i.id] = { item: i, qty: (itemMap[i.id]?.qty || 0) + i.quantity };
    }));
    const topEntry = Object.values(itemMap).sort((a, b) => b.qty - a.qty)[0];
    return { revenue, count, avg, topItem: topEntry || null };
  }, [periodOrders]);

  /* ── revenue trend data ── */
  const trendData = useMemo(() => {
    if (period === 'daily') {
      const buckets = Array.from({ length: 24 }, (_, h) => ({ label: String(h), value: 0 }));
      periodOrders.forEach(o => { buckets[new Date(o.createdAt).getHours()].value += orderTotal(o); });
      return buckets;
    }
    if (period === 'monthly') {
      const days = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 0).getDate();
      const buckets = Array.from({ length: days }, (_, d) => ({ label: String(d + 1), value: 0 }));
      periodOrders.forEach(o => { buckets[new Date(o.createdAt).getDate() - 1].value += orderTotal(o); });
      return buckets;
    }
    // yearly → 12 months
    const buckets = Array.from({ length: 12 }, (_, m) => ({ label: t(`mon_${m}`), value: 0 }));
    periodOrders.forEach(o => { buckets[new Date(o.createdAt).getMonth()].value += orderTotal(o); });
    return buckets;
  }, [periodOrders, period, refDate, t]);

  /* ── peak hours (always 24h, count of orders) ── */
  const peakHoursData = useMemo(() => {
    const buckets = Array.from({ length: 24 }, (_, h) => ({ label: String(h), value: 0 }));
    periodOrders.forEach(o => { buckets[new Date(o.createdAt).getHours()].value++; });
    return buckets;
  }, [periodOrders]);

  /* ── peak days of week ── */
  const peakDaysData = useMemo(() => {
    const buckets = Array.from({ length: 7 }, (_, d) => ({ label: t(`day_${d}`), value: 0 }));
    periodOrders.forEach(o => { buckets[new Date(o.createdAt).getDay()].value++; });
    return buckets;
  }, [periodOrders, t]);

  const hasData = periodOrders.length > 0;

  const trendSub = { daily: 'report_trend_sub_daily', monthly: 'report_trend_sub_monthly', yearly: 'report_trend_sub_yearly' };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <header className="bg-gray-900 text-white px-5 py-4 sticky top-0 z-20 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center text-lg flex-shrink-0">📊</div>
            <div>
              <h1 className="text-base font-extrabold">{t('report_title')}</h1>
              <p className="text-gray-400 text-xs">Bistro Deluxe</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LangToggle className="bg-gray-700 text-gray-300 hover:bg-gray-600" />
            <Link to="/kitchen" className="text-gray-400 hover:text-white text-sm transition-colors whitespace-nowrap">
              {t('report_back')}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-5 space-y-5">
        {/* ── Period tabs ── */}
        <div className="flex gap-2">
          {['daily', 'monthly', 'yearly'].map(p => (
            <button
              key={p}
              onClick={() => { setPeriod(p); setRefDate(new Date()); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                period === p ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-100 shadow-sm'
              }`}
            >
              {t(`report_${p}`)}
            </button>
          ))}
        </div>

        {/* ── Period navigator ── */}
        <PeriodNav
          period={period} date={refDate}
          onPrev={() => navigate(-1)} onNext={() => navigate(1)}
          onToday={() => setRefDate(new Date())}
          t={t} lang={lang}
        />

        {/* ── Summary cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon="💰" accent="border-amber-400"
            label={t('report_revenue')}
            value={`$${summary.revenue.toFixed(2)}`}
          />
          <StatCard
            icon="📋" accent="border-blue-400"
            label={t('report_orders')}
            value={summary.count}
          />
          <StatCard
            icon="📊" accent="border-purple-400"
            label={t('report_avg_order')}
            value={summary.count > 0 ? `$${summary.avg.toFixed(2)}` : '-'}
          />
          <StatCard
            icon="🏆" accent="border-green-400"
            label={t('report_top_item')}
            value={summary.topItem ? summary.topItem.item.emoji : '—'}
            sub={summary.topItem ? `${itemName(summary.topItem.item)} ×${summary.topItem.qty}` : t('report_none')}
          />
        </div>

        {!hasData ? (
          <div className="bg-white rounded-3xl shadow-sm p-16 text-center">
            <div className="text-6xl mb-4 opacity-20">📊</div>
            <p className="text-gray-500 font-semibold text-lg">{t('report_no_data')}</p>
            <p className="text-gray-400 text-sm mt-2">{t('report_no_data_sub')}</p>
          </div>
        ) : (
          <>
            {/* ── Revenue Trend ── */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-bold text-gray-800">{t('report_trend_title')}</h2>
                  <p className="text-xs text-gray-400">{t(trendSub[period])}</p>
                </div>
                <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-lg">
                  ${summary.revenue.toFixed(2)}
                </span>
              </div>
              <BarChart
                data={trendData}
                barW={period === 'daily' ? 22 : period === 'monthly' ? 20 : 32}
                gap={period === 'daily' ? 4  : period === 'monthly' ? 4  : 8}
                chartH={140}
                color="#fbbf24"
                peakColor="#d97706"
                formatVal={v => `$${v < 100 ? v.toFixed(0) : Math.round(v)}`}
                showEvery={period === 'daily' ? 3 : period === 'monthly' ? 5 : 1}
              />
            </div>

            {/* ── Peak Hours + Peak Days ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Peak Hours */}
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h2 className="font-bold text-gray-800 mb-0.5">{t('report_peak_hours_title')}</h2>
                <p className="text-xs text-gray-400 mb-4">{t('report_peak_hours_sub')}</p>
                <BarChart
                  data={peakHoursData}
                  barW={20} gap={4} chartH={120}
                  color="#93c5fd"
                  peakColor="#2563eb"
                  showEvery={3}
                />
                {/* Peak hour callout */}
                {(() => {
                  const maxH = peakHoursData.reduce((m, d, i) => d.value > m.val ? { i, val: d.value } : m, { i: -1, val: 0 });
                  if (maxH.val === 0) return null;
                  const h = maxH.i;
                  const label = h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;
                  return (
                    <div className="mt-3 bg-blue-50 rounded-xl px-3 py-2 text-xs text-blue-700 font-semibold">
                      🔵 Peak: {label} — {maxH.val} {maxH.val === 1 ? 'order' : t('report_orders').toLowerCase()}
                    </div>
                  );
                })()}
              </div>

              {/* Peak Days */}
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h2 className="font-bold text-gray-800 mb-0.5">{t('report_peak_days_title')}</h2>
                <p className="text-xs text-gray-400 mb-4">{t('report_peak_days_sub')}</p>
                <BarChart
                  data={peakDaysData}
                  barW={34} gap={8} chartH={120}
                  color="#d8b4fe"
                  peakColor="#7c3aed"
                  showEvery={1}
                />
                {/* Peak day callout */}
                {(() => {
                  const maxD = peakDaysData.reduce((m, d, i) => d.value > m.val ? { i, val: d.value } : m, { i: -1, val: 0 });
                  if (maxD.val === 0) return null;
                  return (
                    <div className="mt-3 bg-purple-50 rounded-xl px-3 py-2 text-xs text-purple-700 font-semibold">
                      🟣 Peak: {peakDaysData[maxD.i].label} — {maxD.val} {maxD.val === 1 ? 'order' : t('report_orders').toLowerCase()}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* ── Top Items ── */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="font-bold text-gray-800 mb-0.5">{t('report_top_items_title')}</h2>
              <p className="text-xs text-gray-400 mb-4">{t('report_top_items_sub')}</p>
              <TopItemsList periodOrders={periodOrders} t={t} itemName={itemName} />
            </div>
          </>
        )}

        <div className="pb-6" />
      </main>
    </div>
  );
}
