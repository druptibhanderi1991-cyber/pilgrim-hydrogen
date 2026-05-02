import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Check } from 'lucide-react';
import { useAside } from '~/components/Aside';
import { useCart } from '~/components/CartProvider';
import { Image } from '@shopify/hydrogen';
import './ProductCard.css';

const ProductCard = React.memo(({ product }) => {
  const { open } = useAside();
  const { cart, addToCart, updateCartLine } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // Safely fallback if cart doesn't exist yet
  const cartItems = cart?.items || [];
  const relatedCartItems = cartItems.filter(item => item.id === product.id || item.baseProductId === product.id || item.variantId === product.variantId);
  const totalQuantity = relatedCartItems.reduce((acc, item) => acc + item.quantity, 0);
  const primaryCartItem = relatedCartItems[0];
  const hasVariants = product.variants && product.variants.length > 1;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!product.variantId) {
      console.warn('No variant ID available for product:', product.name);
      return;
    }
    
    setIsAdding(true);
    await addToCart(product.variantId, 1);
    setIsAdding(false);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
    open('cart');
  };

  return (
    <div className="product-card">
      <Link to={`/product/${encodeURIComponent(product.handle || product.id)}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', position: 'relative' }}>
        <div className="product-image-container">
          {product.badge && <div className="product-badge-ribbon" style={{ backgroundColor: product.badge === 'Selling Fast' ? '#d32f2f' : '#111' }}>{product.badge}</div>}
          {product.discountPercentage && <div className="product-circle-badge">{product.discountPercentage}%<br/>OFF</div>}
          {product.image ? (
            <Image 
              data={{url: product.image, altText: product.name}}
              alt={product.name} 
              className="product-image" 
              width={400} 
              height={400} 
            />
          ) : (
            <div style={{ width: '100%', height: '100%', background: '#eee' }}></div>
          )}
        </div>
      </Link>
      
      <div className="product-info">
        <Link to={`/product/${encodeURIComponent(product.handle || product.id)}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 className="product-title">{product.name}</h3>
        </Link>
        
        {product.subtitle && <p className="product-subtitle">{product.subtitle}</p>}
        
        {product.rating && (
          <div className="product-rating">
            <div className="stars">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={14} fill={s <= Math.floor(product.rating) ? "#F5B041" : "transparent"} color="#F5B041" />
              ))}
            </div>
            <span className="rating-count">{product.rating} ({product.reviews})</span>
          </div>
        )}
        
        <div className="product-price-row">
          <span className="current-price">₹{product.price}</span>
          {product.compareAtPrice > product.price && (
             <span className="original-price">₹{product.compareAtPrice}</span>
          )}
        </div>
        
        <div className="product-action-row">
          {relatedCartItems.length === 0 ? (
            <button 
              className="add-to-cart-btn" 
              onClick={handleAddToCart}
              disabled={isAdding || product.available === false}
              style={{ opacity: product.available === false ? 0.5 : 1 }}
            >
              {isAdding ? (
                 <>Adding... <div className="btn-spinner"></div></>
              ) : justAdded ? (
                 <>Added! <Check size={16} style={{marginLeft: '8px'}} /></>
              ) : product.available === false ? (
                 'Out of Stock'
              ) : hasVariants ? (
                 'Select Options'
              ) : (
                 <>Add to Cart <ShoppingCart size={16} style={{marginLeft: '8px'}} /></>
              )}
            </button>
          ) : (
            <div className="quantity-selector-styled">
              <button onClick={(e) => { e.preventDefault(); updateCartLine(primaryCartItem.id, primaryCartItem.quantity - 1); }}>-</button>
              <span>{totalQuantity}</span>
              <button onClick={(e) => { 
                e.preventDefault(); 
                updateCartLine(primaryCartItem.id, primaryCartItem.quantity + 1); 
              }}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
