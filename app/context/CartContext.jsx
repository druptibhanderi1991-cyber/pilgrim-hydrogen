import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [optionsProduct, setOptionsProduct] = useState(null);

  // Load from local storage on mount (client side only)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mockCart');
      if (saved) setCartItems(JSON.parse(saved));
    } catch (e) {
      // ignore
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    try {
      localStorage.setItem('mockCart', JSON.stringify(cartItems));
    } catch (e) {
      // ignore
    }
  }, [cartItems]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    showToast(`Added ${product.name} to cart`);
    setIsDrawerOpen(true);
  };

  const updateQuantity = (id, quantity) => {
    setCartItems(prev => {
      if (quantity <= 0) {
        return prev.filter(item => item.id !== id);
      }
      return prev.map(item => 
        item.id === id 
          ? { ...item, quantity }
          : item
      );
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const toggleDrawer = (isOpen) => {
    setIsDrawerOpen(isOpen !== undefined ? isOpen : !isDrawerOpen);
  };

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      cartTotal,
      cartQuantity,
      isDrawerOpen,
      toggleDrawer,
      toastMessage,
      showToast,
      optionsProduct,
      setOptionsProduct
    }}>
      {children}
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#2E7D32',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 99999,
          fontWeight: '600',
          animation: 'slideUp 0.3s ease'
        }}>
          {toastMessage}
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { transform: translate(-50%, 100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}} />
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
