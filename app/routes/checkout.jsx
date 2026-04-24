import React, { useState } from 'react';
import { useCart } from '~/context/CartContext';
import { Link } from 'react-router-dom';
import '../styles/checkout.css';

export default function Checkout() {
  const { cartItems, cartTotal } = useCart();
  const [pincode, setPincode] = useState('');
  const [shippingMethod, setShippingMethod] = useState(null);
  
  const handlePincodeChange = (e) => {
    const val = e.target.value;
    setPincode(val);
    if (val.length === 6) {
      setShippingMethod('available');
    } else {
      setShippingMethod(null);
    }
  };

  const shippingCost = cartTotal > 500 ? 0 : 50;
  const finalTotal = cartTotal + shippingCost;

  if (cartItems.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Your cart is empty</h2>
        <Link to="/">Return to shop</Link>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-left">
        <h2>Checkout</h2>
        <form className="checkout-form">
          <section className="form-section">
            <h3>Contact</h3>
            <input type="email" placeholder="Email" required className="form-input" />
          </section>

          <section className="form-section">
            <h3>Delivery</h3>
            <div className="form-row">
              <select className="form-input"><option>India</option></select>
            </div>
            <div className="form-row">
              <input type="text" placeholder="Full Name" required className="form-input" />
            </div>
            <div className="form-row">
              <input type="text" placeholder="Address" required className="form-input" />
            </div>
            <div className="form-row">
              <input type="text" placeholder="Apartment, suite, etc. (optional)" className="form-input" />
            </div>
            <div className="form-row multi">
              <input type="text" placeholder="City" required className="form-input" />
              <input type="text" placeholder="State" required className="form-input" />
              <input 
                type="text" 
                placeholder="PIN code" 
                required 
                className="form-input" 
                value={pincode}
                onChange={handlePincodeChange}
                maxLength="6"
              />
            </div>
            <div className="form-row">
              <input type="tel" placeholder="Phone" required className="form-input" />
            </div>
          </section>

          {shippingMethod === 'available' && (
            <section className="form-section fade-in">
              <h3>Shipping method</h3>
              <div className="shipping-option">
                <input type="radio" id="standard" name="shipping" defaultChecked />
                <label htmlFor="standard">Standard Shipping (3-5 days)</label>
                <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
              </div>
              <div className="shipping-option">
                <input type="radio" id="cod" name="shipping" />
                <label htmlFor="cod">Cash on Delivery (COD)</label>
                <span>₹50</span>
              </div>
            </section>
          )}

          <button type="submit" className="pay-now-btn">Pay now</button>
        </form>
      </div>

      <div className="checkout-right">
        <div className="order-summary">
          <div className="summary-items">
            {cartItems.map((item) => (
              <div key={item.id} className="summary-item">
                <div className="item-image-wrapper">
                  <img src={item.image} alt={item.name} />
                  <span className="item-quantity-badge">{item.quantity}</span>
                </div>
                <div className="item-info">
                  <p className="item-name">{item.name}</p>
                  <p className="item-size">{item.size || 'Standard'}</p>
                </div>
                <div className="item-price">
                  ₹{item.price * item.quantity}
                </div>
              </div>
            ))}
          </div>

          <div className="discount-section">
            <input type="text" placeholder="Discount code or gift card" className="form-input" />
            <button className="apply-btn">Apply</button>
          </div>

          <div className="price-breakdown">
            <div className="price-row">
              <span>Subtotal</span>
              <span>₹{cartTotal}</span>
            </div>
            <div className="price-row">
              <span>Shipping</span>
              <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
            </div>
            <div className="price-row total-row">
              <span>Total</span>
              <span><span className="currency">INR</span> ₹{finalTotal}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
