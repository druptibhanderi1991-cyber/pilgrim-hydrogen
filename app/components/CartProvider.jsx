import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart, addToCart as apiAddToCart, updateCartLine as apiUpdateCartLine, removeCartLine as apiRemoveCartLine } from '~/lib/shopify';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [isCartLoading, setIsCartLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    try {
      const data = await getCart();
      setCart(data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setIsCartLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (variantId, quantity = 1) => {
    setIsCartLoading(true);
    await apiAddToCart(variantId, quantity);
    await fetchCart();
  };

  const updateCartLine = async (lineId, quantity) => {
    setIsCartLoading(true);
    await apiUpdateCartLine(lineId, quantity);
    await fetchCart();
  };

  const removeCartLine = async (lineId) => {
    setIsCartLoading(true);
    await apiRemoveCartLine(lineId);
    await fetchCart();
  };

  return (
    <CartContext.Provider value={{ cart, isCartLoading, addToCart, updateCartLine, removeCartLine, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
