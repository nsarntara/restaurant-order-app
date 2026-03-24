import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'bistro_orders';
const OrderContext = createContext(null);

function loadOrders() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function persist(orders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(loadOrders);

  // Cross-tab sync via storage event
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        try { setOrders(JSON.parse(e.newValue || '[]')); } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Same-tab polling so kitchen page picks up customer orders in real-time
  useEffect(() => {
    const id = setInterval(() => {
      const stored = loadOrders();
      setOrders(prev =>
        JSON.stringify(prev) === JSON.stringify(stored) ? prev : stored
      );
    }, 800);
    return () => clearInterval(id);
  }, []);

  const placeOrder = useCallback((tableNumber, items, notes) => {
    const order = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      orderNumber: String(Math.floor(Math.random() * 900) + 100),
      tableNumber,
      items, // [{ id, name, price, quantity, emoji }]
      notes: notes.trim(),
      status: 'pending', // pending | in-kitchen | done
      createdAt: Date.now(),
    };
    setOrders(prev => {
      const next = [...prev, order];
      persist(next);
      return next;
    });
    return order;
  }, []);

  const updateStatus = useCallback((orderId, status) => {
    setOrders(prev => {
      const next = prev.map(o => o.id === orderId ? { ...o, status } : o);
      persist(next);
      return next;
    });
  }, []);

  // Merge new items into an existing pending order
  const appendToOrder = useCallback((orderId, newItems, extraNotes) => {
    setOrders(prev => {
      const next = prev.map(o => {
        if (o.id !== orderId) return o;
        const merged = [...o.items];
        newItems.forEach(ni => {
          const existing = merged.find(i => i.id === ni.id);
          if (existing) existing.quantity += ni.quantity;
          else merged.push(ni);
        });
        const notes = [o.notes, extraNotes].filter(Boolean).join(' · ');
        return { ...o, items: merged, notes };
      });
      persist(next);
      return next;
    });
  }, []);

  const clearDone = useCallback(() => {
    setOrders(prev => {
      const next = prev.filter(o => o.status !== 'done');
      persist(next);
      return next;
    });
  }, []);

  return (
    <OrderContext.Provider value={{ orders, placeOrder, appendToOrder, updateStatus, clearDone }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrders = () => useContext(OrderContext);
