import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { useLang, LangToggle } from '../context/LanguageContext';

/* ── helpers ─────────────────────────────────────── */
function timeAgo(ts, t) {
  const secs = Math.floor((Date.now() - ts) / 1000);
  if (secs < 60) return t('time_sec', { n: secs });
  const mins = Math.floor(secs / 60);
  if (mins < 60) return t('time_min', { n: mins });
  return t('time_hour', { h: Math.floor(mins / 60), m: mins % 60 });
}

const STATUS = {
  pending: {
    badge: 'bg-red-100 text-red-700', border: 'border-red-400', dot: 'bg-red-500',
    actionStyle: 'bg-blue-500 hover:bg-blue-600 text-white',
    labelKey: 'kitchen_status_new', actionKey: 'kitchen_start_cooking', next: 'in-kitchen',
  },
  'in-kitchen': {
    badge: 'bg-yellow-100 text-yellow-700', border: 'border-yellow-400', dot: 'bg-yellow-500',
    actionStyle: 'bg-green-500 hover:bg-green-600 text-white',
    labelKey: 'kitchen_status_cooking', actionKey: 'kitchen_mark_done', next: 'done',
  },
  done: {
    badge: 'bg-green-100 text-green-700', border: 'border-green-400', dot: 'bg-green-500',
    actionStyle: '',
    labelKey: 'kitchen_status_done', actionKey: null, next: null,
  },
};

/* ── Order Card ───────────────────────────────────── */
function OrderCard({ order, onUpdate }) {
  const { t, itemName } = useLang();
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick(n => n + 1), 15000);
    return () => clearInterval(id);
  }, []);

  const cfg     = STATUS[order.status];
  const total   = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const elapsed = Math.floor((Date.now() - order.createdAt) / 60000);
  const isUrgent = order.status === 'pending' && elapsed >= 5;

  return (
    <div className={`bg-white rounded-2xl shadow-sm border-l-4 ${cfg.border} ${isUrgent ? 'ring-2 ring-red-300' : ''} flex flex-col overflow-hidden`}>
      {isUrgent && (
        <div className="bg-red-50 px-4 py-1.5 text-xs font-semibold text-red-600 flex items-center gap-1.5 border-b border-red-100">
          {t('kitchen_urgent', { n: elapsed })}
        </div>
      )}
      <div className="p-4 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
              {t('kitchen_table', { n: order.tableNumber })}
            </p>
            <h3 className="text-2xl font-extrabold text-gray-900">#{order.orderNumber}</h3>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {t(cfg.labelKey)}
            </span>
            <p className="text-xs text-gray-400 mt-1">{timeAgo(order.createdAt, t)}</p>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 space-y-1.5 mb-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="text-lg flex-shrink-0">{item.emoji}</span>
              <span className="flex-1 text-gray-700 font-medium">{itemName(item)}</span>
              <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-lg text-xs">×{item.quantity}</span>
            </div>
          ))}
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-xs text-amber-800 mb-3">
            📝 <span className="font-medium">{t('note_label')}</span> {order.notes}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <span className="text-sm font-bold text-gray-500">${total.toFixed(2)}</span>
          {cfg.actionKey ? (
            <button
              onClick={() => onUpdate(order.id, cfg.next)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm ${cfg.actionStyle}`}
            >
              {t(cfg.actionKey)} →
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-green-100 text-green-700 text-sm font-bold">
              {t('kitchen_served')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Stats Bar ────────────────────────────────────── */
function StatsBar({ pending, inKitchen, done }) {
  const { t } = useLang();
  return (
    <div className="grid grid-cols-3 gap-3 px-6 py-4">
      <div className="bg-red-500/10 rounded-xl p-3 text-center border border-red-500/20">
        <p className="text-2xl font-extrabold text-red-400">{pending}</p>
        <p className="text-xs text-red-300 font-semibold mt-0.5">{t('kitchen_stats_new')}</p>
      </div>
      <div className="bg-yellow-500/10 rounded-xl p-3 text-center border border-yellow-500/20">
        <p className="text-2xl font-extrabold text-yellow-400">{inKitchen}</p>
        <p className="text-xs text-yellow-300 font-semibold mt-0.5">{t('kitchen_stats_cooking')}</p>
      </div>
      <div className="bg-green-500/10 rounded-xl p-3 text-center border border-green-500/20">
        <p className="text-2xl font-extrabold text-green-400">{done}</p>
        <p className="text-xs text-green-300 font-semibold mt-0.5">{t('kitchen_stats_done')}</p>
      </div>
    </div>
  );
}

/* ── Kitchen Page ─────────────────────────────────── */
export default function KitchenPage() {
  const { orders, updateStatus, clearDone } = useOrders();
  const { t } = useLang();
  const [filter, setFilter] = useState('active');
  const [time, setTime]     = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const pending   = orders.filter(o => o.status === 'pending');
  const inKitchen = orders.filter(o => o.status === 'in-kitchen');
  const done      = orders.filter(o => o.status === 'done');

  const visibleOrders = (() => {
    let list;
    if      (filter === 'active')     list = [...pending, ...inKitchen];
    else if (filter === 'pending')    list = pending;
    else if (filter === 'in-kitchen') list = inKitchen;
    else if (filter === 'done')       list = done;
    else                              list = orders;
    return [...list].sort((a, b) => b.createdAt - a.createdAt);
  })();

  const tabs = [
    { key: 'active',     label: t('kitchen_tab_active',  { n: pending.length + inKitchen.length }) },
    { key: 'pending',    label: t('kitchen_tab_new',     { n: pending.length }) },
    { key: 'in-kitchen', label: t('kitchen_tab_cooking', { n: inKitchen.length }) },
    { key: 'done',       label: t('kitchen_tab_done',    { n: done.length }) },
    { key: 'all',        label: t('kitchen_tab_all',     { n: orders.length }) },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* ── Header ── */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-xl">👨‍🍳</div>
            <div>
              <h1 className="text-lg font-extrabold">{t('kitchen_title')}</h1>
              <p className="text-gray-400 text-xs">{t('kitchen_subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {pending.length > 0 && (
              <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                <span className="text-sm font-bold">{t('kitchen_new_badge', { n: pending.length })}</span>
              </div>
            )}
            <div className="text-gray-300 text-sm font-mono bg-gray-700 px-3 py-1.5 rounded-lg">
              {time.toLocaleTimeString()}
            </div>
            {/* Language toggle */}
            <LangToggle className="bg-gray-700 text-gray-300 hover:bg-gray-600" />
            <Link to="/reports" className="text-amber-400 hover:text-amber-300 text-sm font-semibold transition-colors whitespace-nowrap">
              {t('kitchen_reports')}
            </Link>
            <Link to="/" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
              {t('kitchen_home')}
            </Link>
          </div>
        </div>

        {/* Stats */}
        <StatsBar pending={pending.length} inKitchen={inKitchen.length} done={done.length} />

        {/* Tabs */}
        <div className="flex gap-2 px-6 pb-4 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                filter === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
          {done.length > 0 && (
            <button
              onClick={clearDone}
              className="ml-auto px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:text-red-400 transition-colors whitespace-nowrap"
            >
              {t('kitchen_clear_done')}
            </button>
          )}
        </div>
      </header>

      {/* ── Orders Grid ── */}
      <main className="p-6">
        {visibleOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4 opacity-30">🍽</div>
            <p className="text-gray-500 text-lg font-semibold">
              {filter === 'done' ? t('kitchen_no_done') : t('kitchen_no_active')}
            </p>
            <p className="text-gray-600 text-sm mt-2">{t('kitchen_will_appear')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {visibleOrders.map(order => (
              <OrderCard key={order.id} order={order} onUpdate={updateStatus} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
