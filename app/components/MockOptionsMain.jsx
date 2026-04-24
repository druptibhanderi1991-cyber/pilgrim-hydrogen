import React, { useState, useEffect } from 'react';
import { useCart } from '~/context/CartContext';
import { useAside } from './Aside';
import { Star } from 'lucide-react';
import './MockOptionsMain.css';

export function MockOptionsMain() {
  const { optionsProduct, addToCart } = useCart();
  const { close, open } = useAside();
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Default to first variant if available
  useEffect(() => {
    if (optionsProduct?.variants?.length > 0) {
      setSelectedVariant(optionsProduct.variants[0]);
    }
  }, [optionsProduct]);

  if (!optionsProduct) {
    return (
      <div className="mock-options-empty">
        <p>No product selected.</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    
    // Create a specialized cart item incorporating the variant details
    const productToAdd = {
      ...optionsProduct,
      variantId: selectedVariant.id, // Explicitly pass variantId for Shopify API
      id: selectedVariant.id || `${optionsProduct.id}-${selectedVariant.size}`,
      baseProductId: optionsProduct.id,
      size: selectedVariant.size,
      price: selectedVariant.price,
      image: optionsProduct.image // keep base image
    };

    addToCart(productToAdd, 1);
    
    // Transition to cart drawer
    open('cart');
  };

  return (
    <div className="mock-options-container">
      {/* Product Header Info */}
      <div className="options-product-info">
        <img src={optionsProduct.image} alt={optionsProduct.name} className="options-main-image" />
        
        <div className="options-details">
          {optionsProduct.badge && (
            <span className="options-badge">{optionsProduct.badge}</span>
          )}
          <h3 className="options-title">{optionsProduct.name}</h3>
          
          <div className="options-rating">
            <div className="stars">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={14} fill="#2A5C38" color="#2A5C38" />
              ))}
            </div>
            <span className="rating-count">({optionsProduct.reviews} reviews)</span>
          </div>
        </div>
      </div>

      {/* Variants Selection */}
      <div className="options-variants-section">
        <h4 className="variants-heading">Select Size</h4>
        <div className="variants-grid">
          {optionsProduct.variants?.map((variant, idx) => {
            const isSelected = selectedVariant?.size === variant.size;
            return (
              <div 
                key={idx}
                className={`variant-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedVariant(variant)}
              >
                {variant.badge && (
                  <div className="variant-badge">{variant.badge}</div>
                )}
                <div className="variant-size">{variant.size}</div>
                <div className="variant-price">₹{variant.price}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="options-footer">
        <button 
          className="add-to-cart-options-btn"
          onClick={handleAddToCart}
          disabled={!selectedVariant}
        >
          Add To Cart • ₹{selectedVariant ? selectedVariant.price : '--'}
        </button>
      </div>
    </div>
  );
}
