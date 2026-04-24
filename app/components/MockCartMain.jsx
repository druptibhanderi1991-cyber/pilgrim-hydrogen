import React from 'react';
import { useCart } from '~/context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useAside } from './Aside';
import './MockCartMain.css';

export function MockCartMain() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, cartQuantity } = useCart();
  const navigate = useNavigate();
  const { close } = useAside();

  const handleCheckout = () => {
    close();
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="mock-cart-empty">
        <p>Looks like you haven't added anything yet!</p>
        <button className="continue-shopping-btn" onClick={close}>Continue Shopping</button>
      </div>
    );
  }

  return (
    <div className="mock-cart-container">
      <div className="mock-cart-offers">
        <div className="offer-badge">Buy 1 Get 1 FREE on all Serums!</div>
      </div>

      <div className="mock-cart-items">
        {cartItems.map((item) => (
          <div key={item.id} className="mock-cart-item">
            <img src={item.image} alt={item.name} className="cart-item-image" />
            <div className="cart-item-details">
              <h4>{item.name}</h4>
              <p className="cart-item-size">{item.size || 'Standard Size'}</p>
              <div className="cart-item-price-row">
                <span className="cart-item-price">₹{item.price}</span>
                <div className="cart-item-actions">
                  <div className="quantity-selector-small">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <button className="remove-btn" onClick={() => removeFromCart(item.id)}>×</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mock-cart-footer">
        <div className="mock-cart-summary">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{cartTotal}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span className="free-text">FREE</span>
          </div>
        </div>
        <button className="checkout-btn" onClick={handleCheckout}>
          Checkout • ₹{cartTotal}
        </button>
      </div>
    </div>
  );
}
