import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {
  getCart,
  addToCart as apiAdd,
  updateCartLine as apiUpdate,
  removeCartLine as apiRemove,
} from '~/lib/shopify';

const CartContext = createContext();

export function CartProvider({children}) {
  const [cart, setCart] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Per-variant loading — Set of variantIds currently being added
  const [addingVariants, setAddingVariants] = useState(new Set());
  // Per-line loading — Set of lineIds currently being updated/removed
  const [pendingLines, setPendingLines] = useState(new Set());

  // Global success toast
  const [toast, setToast] = useState({visible: false, message: ''});
  const toastTimerRef = useRef(null);

  /* ── Initial load ─────────────────────────────────────── */
  useEffect(() => {
    getCart()
      .then((data) => setCart(data))
      .finally(() => setInitialLoading(false));
  }, []);

  /* ── Toast helper ─────────────────────────────────────── */
  function showToast(message = 'Added to your bag') {
    clearTimeout(toastTimerRef.current);
    setToast({visible: true, message});
    toastTimerRef.current = setTimeout(
      () => setToast({visible: false, message: ''}),
      2800,
    );
  }

  /* ── Add to cart ──────────────────────────────────────── */
  const addToCart = useCallback(async (variantId, quantity = 1) => {
    setAddingVariants((prev) => new Set([...prev, variantId]));
    try {
      const updated = await apiAdd(variantId, quantity);
      if (updated) setCart(updated);
      showToast('Added to your bag ✓');
    } finally {
      setAddingVariants((prev) => {
        const next = new Set(prev);
        next.delete(variantId);
        return next;
      });
    }
  }, []);

  /* ── Update quantity ──────────────────────────────────── */
  const updateCartLine = useCallback(async (lineId, quantity) => {
    setPendingLines((prev) => new Set([...prev, lineId]));
    try {
      const updated = await apiUpdate(lineId, quantity);
      if (updated) setCart(updated);
    } finally {
      setPendingLines((prev) => {
        const next = new Set(prev);
        next.delete(lineId);
        return next;
      });
    }
  }, []);

  /* ── Remove line ──────────────────────────────────────── */
  const removeCartLine = useCallback(async (lineId) => {
    setPendingLines((prev) => new Set([...prev, lineId]));
    try {
      const updated = await apiRemove(lineId);
      if (updated) setCart(updated);
    } finally {
      setPendingLines((prev) => {
        const next = new Set(prev);
        next.delete(lineId);
        return next;
      });
    }
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartLoading: initialLoading,
        addingVariants,  // Set<variantId> — disable only the clicked ATC button
        pendingLines,    // Set<lineId>    — disable only that line's controls
        toast,
        addToCart,
        updateCartLine,
        removeCartLine,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
