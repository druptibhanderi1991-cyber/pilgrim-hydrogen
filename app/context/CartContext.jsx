import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as shopifyApi from '~/lib/shopify';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartId, setCartId] = useState(null);
  const [cartData, setCartData] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [optionsProduct, setOptionsProduct] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load cartId from local storage on mount
  useEffect(() => {
    try {
      const savedCartId = localStorage.getItem('shopifyCartId');
      if (savedCartId) {
        setCartId(savedCartId);
        refreshCart(savedCartId);
      }
    } catch (e) {}
  }, []);

  // Save cartId to local storage
  useEffect(() => {
    if (cartId) {
      localStorage.setItem('shopifyCartId', cartId);
    }
  }, [cartId]);

  const mapShopifyCartToUI = (cart) => {
    if (!cart) return;
    setCartData(cart);
    const mappedItems = cart.lines.nodes.map(line => {
      const variant = line.merchandise;
      const product = variant.product;
      return {
        lineId: line.id, // Store Shopify line ID for updates
        id: variant.id, // We use variant ID as the unique id for UI matching
        baseProductId: product.id,
        name: product.title,
        handle: product.handle,
        size: variant.title !== 'Default Title' ? variant.title : null,
        price: parseFloat(variant.price.amount),
        quantity: line.quantity,
        image: variant.image?.url || null
      };
    });
    setCartItems(mappedItems);
  };

  const refreshCart = async (id) => {
    setIsSyncing(true);
    const cart = await shopifyApi.getCart(id);
    mapShopifyCartToUI(cart);
    setIsSyncing(false);
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addToCart = async (productOrVariant, quantity = 1) => {
    setIsSyncing(true);
    // Determine the variantId to send to Shopify
    let variantId = productOrVariant.variantId || productOrVariant.id;
    if (!productOrVariant.variantId && productOrVariant.variants && productOrVariant.variants.length > 0) {
      variantId = productOrVariant.variants[0].id;
    }
    
    let updatedCart;
    if (!cartId) {
      updatedCart = await shopifyApi.createCart(variantId, quantity);
      if (updatedCart) setCartId(updatedCart.id);
    } else {
      updatedCart = await shopifyApi.addToCart(cartId, variantId, quantity);
    }

    if (updatedCart) {
      mapShopifyCartToUI(updatedCart);
      showToast(`Added to cart`);
      setIsDrawerOpen(true);
    }
    setIsSyncing(false);
  };

  const updateQuantity = async (lineIdOrVariantId, quantity) => {
    setIsSyncing(true);
    // Find the actual line item ID for Shopify
    const lineItem = cartItems.find(item => item.id === lineIdOrVariantId || item.lineId === lineIdOrVariantId);
    if (!lineItem || !cartId) {
       setIsSyncing(false);
       return;
    }

    const updatedCart = await shopifyApi.updateCartQuantity(cartId, lineItem.lineId, quantity);
    if (updatedCart) {
      mapShopifyCartToUI(updatedCart);
    }
    setIsSyncing(false);
  };

  const removeFromCart = async (id) => {
    await updateQuantity(id, 0);
  };

  const toggleDrawer = (isOpen) => {
    setIsDrawerOpen(isOpen !== undefined ? isOpen : !isDrawerOpen);
  };

  const cartTotal = cartData?.cost?.totalAmount?.amount 
    ? parseFloat(cartData.cost.totalAmount.amount) 
    : 0;
    
  const cartQuantity = cartData?.totalQuantity || 0;

  return (
    <CartContext.Provider value={{
      cartItems,
      cartData, // Expose raw cart data if needed (e.g., checkoutUrl)
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
      setOptionsProduct,
      isSyncing
    }}>
      {children}
      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: '#2E7D32', color: 'white', padding: '12px 24px',
          borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 99999, fontWeight: '600', animation: 'slideUp 0.3s ease'
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
