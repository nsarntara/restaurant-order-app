import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { CATEGORIES, MENU_ITEMS } from '../data/menu';
import { useOrders } from '../context/OrderContext';
import { useLang, LangToggle } from '../context/LanguageContext';

/* ── Status Progress Bar ──────────────────────────── */
function StatusProgress({ status }) {
  const { t } = useLang();
  const steps  = ['pending', 'in-kitchen', 'done'];
  const current = steps.indexOf(status);
  const labels  = [t('confirmed_step_received'), t('confirmed_step_cooking'), t('confirmed_step_served')];
  const icons   = ['📋', '👨‍🍳', '✅'];

  return (
    <div className="flex items-center gap-1 w-full">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center flex-1 last:flex-none">
          <div className={`flex flex-col items-center gap-1 ${i <= current ? 'opacity-100' : 'opacity-30'}`}>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all ${
              i < current   ? 'bg-green-100' :
              i === current ? 'bg-amber-100 ring-2 ring-amber-400 ring-offset-1' :
              'bg-gray-100'
            }`}>
              {icons[i]}
            </div>
            <span className={`text-xs font-semibold ${i === current ? 'text-amber-600' : 'text-gray-400'}`}>
              {labels[i]}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 mb-4 rounded-full transition-all ${i < current ? 'bg-green-300' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Status config (style-only, no text) ─────────────── */
const STATUS_STYLE = {
  pending:      { badge: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-500',  labelKey: 'status_pending'    },
  'in-kitchen': { badge: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500',   labelKey: 'status_in_kitchen' },
  done:         { badge: 'bg-green-100 text-green-700',  dot: 'bg-green-500',  labelKey: 'status_done'       },
};

/* ── Order Confirmed Screen ───────────────────────── */
function OrderConfirmed({ orderId, tableId, onAddMore, onShowHistory }) {
  const { orders } = useOrders();
  const { t, itemName } = useLang();
  const order = orders.find(o => o.id === orderId);
  if (!order) return null;

  const total = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const cfg = STATUS_STYLE[order.status];
  const canAddMore = order.status === 'pending';

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-6 max-w-sm w-full">
        <div className="text-center mb-5">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">{t('confirmed_title')}</h2>
          <p className="text-gray-400 text-sm mt-0.5">{t('table', { n: tableId })}</p>
        </div>

        {/* Order number + live status */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-4 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{t('confirmed_order_label')}</p>
          <p className="text-4xl font-extrabold text-amber-500">#{order.orderNumber}</p>
          <span className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-bold ${cfg.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {t(cfg.labelKey)}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-4 px-1">
          <StatusProgress status={order.status} />
        </div>

        {/* Items */}
        <div className="space-y-1.5 mb-3">
          {order.items.map(item => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {item.emoji} {itemName(item)} <span className="text-gray-400">×{item.quantity}</span>
              </span>
              <span className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between font-bold text-sm">
            <span>{t('total')}</span>
            <span className="text-amber-600">${total.toFixed(2)}</span>
          </div>
        </div>

        {order.notes && (
          <div className="bg-gray-50 rounded-xl px-3 py-2 text-xs text-gray-500 mb-3">📝 {order.notes}</div>
        )}

        {/* Actions */}
        <div className="space-y-2 mt-4">
          <button
            onClick={onAddMore}
            className={`w-full font-bold py-3 rounded-2xl text-sm transition-colors ${
              canAddMore ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {canAddMore ? t('confirmed_add_more', { n: order.orderNumber }) : t('confirmed_order_more')}
          </button>
          <button
            onClick={onShowHistory}
            className="w-full border border-gray-200 text-gray-500 font-semibold py-3 rounded-2xl text-sm hover:bg-gray-50 transition-colors"
          >
            {t('confirmed_view_history')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Order History Panel ──────────────────────────── */
function HistoryPanel({ tableId, onClose, onAddToOrder }) {
  const { orders } = useOrders();
  const { t, itemName } = useLang();

  const tableOrders = useMemo(
    () => [...orders.filter(o => String(o.tableNumber) === String(tableId))]
            .sort((a, b) => b.createdAt - a.createdAt),
    [orders, tableId]
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl flex flex-col max-h-[85vh] shadow-2xl">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>
        <div className="flex items-center justify-between px-5 pb-3 pt-1 border-b">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{t('history_title')}</h2>
            <p className="text-xs text-gray-400">
              {tableOrders.length === 1
                ? t('history_subtitle',    { n: tableId, count: tableOrders.length })
                : t('history_subtitle_pl', { n: tableId, count: tableOrders.length })}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 text-lg">×</button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-3">
          {tableOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-sm">{t('history_empty')}</p>
            </div>
          ) : (
            tableOrders.map(order => {
              const cfg   = STATUS_STYLE[order.status];
              const total = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
              return (
                <div key={order.id} className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-extrabold text-gray-900">#{order.orderNumber}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${cfg.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {t(cfg.labelKey)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1 mb-2">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-xs text-gray-600">
                        <span>{item.emoji} {itemName(item)} ×{item.quantity}</span>
                        <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-xs font-bold text-gray-500">{t('history_total', { amount: total.toFixed(2) })}</span>
                    {order.status === 'pending' && (
                      <button
                        onClick={() => { onAddToOrder(order.id); onClose(); }}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        {t('history_add_items')}
                      </button>
                    )}
                  </div>
                  {order.notes && <p className="text-xs text-gray-400 mt-1">📝 {order.notes}</p>}
                </div>
              );
            })
          )}
        </div>

        <div className="px-4 pb-8 pt-3 border-t">
          <button onClick={onClose} className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-2xl text-sm">
            {t('back_to_menu')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Cart Modal ───────────────────────────────────── */
function CartModal({ cartItems, onClose, onUpdateCart, notes, setNotes, onSubmit, tableId, totalPrice, pendingOrder, appendToOrderId, onToggleAppend }) {
  const { t, itemName } = useLang();
  const isAppending = !!appendToOrderId && !!pendingOrder;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl flex flex-col max-h-[90vh] shadow-2xl">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 pb-3 pt-1 border-b">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isAppending ? t('menu_add_to_order', { n: pendingOrder.orderNumber }) : t('menu_new_order')}
            </h2>
            <p className="text-xs text-gray-400">{t('table', { n: tableId })}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 text-lg">×</button>
        </div>

        {/* Append toggle */}
        {pendingOrder && (
          <div className="mx-4 mt-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <div className="min-w-0 mr-3">
              <p className="text-xs font-bold text-amber-800 truncate">{t('menu_pending_notice', { n: pendingOrder.orderNumber })}</p>
              <p className="text-xs text-amber-600">
                {isAppending ? t('menu_pending_sub_append') : t('menu_pending_sub_new')}
              </p>
            </div>
            <button
              onClick={onToggleAppend}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                isAppending ? 'bg-amber-500 text-white' : 'bg-white border border-amber-300 text-amber-600'
              }`}
            >
              {isAppending ? t('menu_toggle_adding') : t('menu_toggle_add')}
            </button>
          </div>
        )}

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {cartItems.map(item => (
            <div key={item.id} className="flex items-center gap-3">
              <span className="text-3xl flex-shrink-0">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">{itemName(item)}</p>
                <p className="text-xs text-gray-400">${item.price.toFixed(2)} / {t('each')}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => onUpdateCart(item.id, -1)} className="w-8 h-8 rounded-full bg-gray-100 font-bold text-lg flex items-center justify-center hover:bg-gray-200">−</button>
                <span className="font-bold w-5 text-center text-sm">{item.quantity}</span>
                <button onClick={() => onUpdateCart(item.id, 1)} className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold text-lg flex items-center justify-center hover:bg-amber-600">+</button>
              </div>
              <span className="font-bold text-sm w-14 text-right">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}

          <div className="pt-2">
            <label className="text-sm font-semibold text-gray-700 block mb-2">{t('menu_special_instr')}</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={t('menu_notes_placeholder')}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>
        </div>

        <div className="px-5 pt-3 pb-8 border-t bg-white">
          <div className="flex justify-between items-center mb-4">
            <span className="text-base font-semibold text-gray-700">
              {isAppending ? t('menu_adding') : t('total')}
            </span>
            <span className="text-2xl font-extrabold text-amber-600">${totalPrice.toFixed(2)}</span>
          </div>
          <button
            onClick={onSubmit}
            className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold py-4 rounded-2xl text-lg transition-colors shadow-lg shadow-amber-200"
          >
            {isAppending
              ? t('menu_add_btn', { n: pendingOrder.orderNumber })
              : t('menu_place_btn')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Menu Item Card ───────────────────────────────── */
function MenuItemCard({ item, quantity, onUpdate }) {
  const { t, itemName, itemDesc } = useLang();
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col">
      <div className="text-5xl text-center py-3 bg-gray-50 rounded-xl mb-3">{item.emoji}</div>
      <div className="flex-1">
        <h3 className="font-bold text-gray-900 text-sm leading-tight">{itemName(item)}</h3>
        <p className="text-gray-400 text-xs mt-1 leading-relaxed">{itemDesc(item)}</p>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        <span className="font-extrabold text-amber-600">${item.price.toFixed(2)}</span>
        <div className="flex items-center gap-2">
          {quantity > 0 ? (
            <>
              <button onClick={() => onUpdate(item.id, -1)} className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold text-lg flex items-center justify-center hover:bg-amber-200 transition-colors">−</button>
              <span className="font-bold w-5 text-center text-sm">{quantity}</span>
              <button onClick={() => onUpdate(item.id, 1)} className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold text-lg flex items-center justify-center hover:bg-amber-600 transition-colors">+</button>
            </>
          ) : (
            <button onClick={() => onUpdate(item.id, 1)} className="px-4 py-1.5 rounded-full bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition-colors">
              {t('menu_add')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main Menu Page ───────────────────────────────── */
export default function MenuPage() {
  const { tableId } = useParams();
  const { orders, placeOrder, appendToOrder } = useOrders();
  const { t } = useLang();

  const [category, setCategory]               = useState('All');
  const [cart, setCart]                       = useState({});
  const [showCart, setShowCart]               = useState(false);
  const [notes, setNotes]                     = useState('');
  const [submittedOrderId, setSubmittedOrderId] = useState(null);
  const [showHistory, setShowHistory]         = useState(false);
  const [appendToOrderId, setAppendToOrderId] = useState(null);

  const tableOrders = useMemo(
    () => orders.filter(o => String(o.tableNumber) === String(tableId)),
    [orders, tableId]
  );
  const pendingOrder = useMemo(
    () => tableOrders.find(o => o.status === 'pending') || null,
    [tableOrders]
  );

  const filtered = useMemo(
    () => category === 'All' ? MENU_ITEMS : MENU_ITEMS.filter(i => i.category === category),
    [category]
  );

  // Spread full item (includes nameTH/descTH) so kitchen can display correctly
  const cartItems = useMemo(
    () => MENU_ITEMS.filter(i => cart[i.id] > 0).map(i => ({ ...i, quantity: cart[i.id] })),
    [cart]
  );

  const totalItems = useMemo(() => Object.values(cart).reduce((s, q) => s + q, 0), [cart]);
  const totalPrice = useMemo(() => cartItems.reduce((s, i) => s + i.price * i.quantity, 0), [cartItems]);

  const updateCart = (itemId, delta) =>
    setCart(prev => ({ ...prev, [itemId]: Math.max(0, (prev[itemId] || 0) + delta) }));

  const handleSubmit = () => {
    if (cartItems.length === 0) return;
    const targetId = appendToOrderId && pendingOrder?.id === appendToOrderId ? appendToOrderId : null;
    if (targetId) {
      appendToOrder(targetId, cartItems, notes);
      setSubmittedOrderId(targetId);
    } else {
      const order = placeOrder(tableId, cartItems, notes);
      setSubmittedOrderId(order.id);
    }
    setCart({});
    setNotes('');
    setShowCart(false);
    setAppendToOrderId(null);
  };

  const handleAddMore = (fromOrderId) => {
    const order = orders.find(o => o.id === fromOrderId);
    setAppendToOrderId(order?.status === 'pending' ? fromOrderId : null);
    setSubmittedOrderId(null);
  };

  const categoryEmoji = { All: '🍽', Appetizers: '🥗', Mains: '🍔', Drinks: '🥤', Desserts: '🍰' };

  /* ── Confirmed Screen ── */
  if (submittedOrderId) {
    return (
      <>
        <OrderConfirmed
          orderId={submittedOrderId}
          tableId={tableId}
          onAddMore={() => handleAddMore(submittedOrderId)}
          onShowHistory={() => { setSubmittedOrderId(null); setShowHistory(true); }}
        />
        {showHistory && (
          <HistoryPanel
            tableId={tableId}
            onClose={() => setShowHistory(false)}
            onAddToOrder={(id) => { setAppendToOrderId(id); setSubmittedOrderId(null); }}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <header className="bg-amber-500 text-white px-4 py-4 sticky top-0 z-20 shadow-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold tracking-tight">🍽 Bistro Deluxe</h1>
            <p className="text-amber-100 text-xs mt-0.5">{t('table_dine_in', { n: tableId })}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Language toggle */}
            <LangToggle className="bg-amber-400 hover:bg-amber-300 text-white" />
            {/* History button */}
            <button
              onClick={() => setShowHistory(true)}
              className="relative bg-amber-400 hover:bg-amber-300 text-white px-3 py-2 rounded-full flex items-center gap-1.5 text-sm font-semibold transition-colors"
            >
              📋
              {tableOrders.length > 0 && (
                <span className="bg-white text-amber-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {tableOrders.length}
                </span>
              )}
            </button>
            {/* Cart button */}
            {totalItems > 0 && (
              <button
                onClick={() => setShowCart(true)}
                className="bg-white text-amber-600 font-bold px-4 py-2 rounded-full flex items-center gap-2 text-sm shadow-md hover:shadow-lg transition-shadow"
              >
                🛒
                <span className="bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{totalItems}</span>
                <span>${totalPrice.toFixed(2)}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Append-mode banner ── */}
      {appendToOrderId && pendingOrder && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <p className="text-xs text-amber-800 font-semibold">
              ➕ {t('menu_adding_banner', { n: pendingOrder.orderNumber })}
            </p>
            <button onClick={() => setAppendToOrderId(null)} className="text-xs text-amber-600 underline ml-4 flex-shrink-0">
              {t('menu_cancel_new')}
            </button>
          </div>
        </div>
      )}

      {/* ── Category Tabs ── */}
      <div className={`sticky z-10 bg-white border-b shadow-sm ${appendToOrderId ? 'top-[108px]' : 'top-[72px]'}`}>
        <div className="max-w-2xl mx-auto flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                category === cat ? 'bg-amber-500 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {categoryEmoji[cat]} {t(`cat_${cat}`)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Menu Grid ── */}
      <main className="max-w-2xl mx-auto px-4 py-5 pb-32">
        <h2 className="text-lg font-bold text-gray-700 mb-4">
          {category === 'All' ? t('menu_full_menu') : t(`cat_${category}`)}
          <span className="text-sm text-gray-400 font-normal ml-2">{filtered.length} {t('menu_items_label')}</span>
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered.map(item => (
            <MenuItemCard key={item.id} item={item} quantity={cart[item.id] || 0} onUpdate={updateCart} />
          ))}
        </div>
      </main>

      {/* ── Sticky Cart Bar ── */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur border-t z-20">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setShowCart(true)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-2xl flex items-center justify-between px-5 shadow-lg shadow-amber-200 transition-colors"
            >
              <span className="bg-white/30 text-white text-sm font-bold px-2.5 py-0.5 rounded-full">
                {totalItems > 1 ? t('menu_items_count_pl', { n: totalItems }) : t('menu_items_count', { n: totalItems })}
              </span>
              <span>{appendToOrderId && pendingOrder ? t('menu_add_to_order', { n: pendingOrder.orderNumber }) : t('menu_view_order')}</span>
              <span className="font-extrabold">${totalPrice.toFixed(2)}</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Cart Modal ── */}
      {showCart && (
        <CartModal
          cartItems={cartItems}
          onClose={() => setShowCart(false)}
          onUpdateCart={updateCart}
          notes={notes}
          setNotes={setNotes}
          onSubmit={handleSubmit}
          tableId={tableId}
          totalPrice={totalPrice}
          pendingOrder={pendingOrder}
          appendToOrderId={appendToOrderId}
          onToggleAppend={() => setAppendToOrderId(prev => prev ? null : pendingOrder?.id)}
        />
      )}

      {/* ── History Panel ── */}
      {showHistory && (
        <HistoryPanel
          tableId={tableId}
          onClose={() => setShowHistory(false)}
          onAddToOrder={(id) => { setAppendToOrderId(id); setShowHistory(false); }}
        />
      )}
    </div>
  );
}
