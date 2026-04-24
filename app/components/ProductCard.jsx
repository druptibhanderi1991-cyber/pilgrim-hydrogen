import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { useCart } from '~/context/CartContext';
import { useAside } from '~/components/Aside';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { cartItems, addToCart, updateQuantity, setOptionsProduct } = useCart();
  const { open } = useAside();
  
  // Find cart items matching this product (either directly by id, or via baseProductId from variants)
  const relatedCartItems = cartItems.filter(item => item.id === product.id || item.baseProductId === product.id);
  // If there are variants in cart, we sync the stepper with the total quantity or the first variant's quantity.
  // We'll use the total quantity of all variants for display, but modify the first variant on +/-.
  const totalQuantity = relatedCartItems.reduce((acc, item) => acc + item.quantity, 0);
  const primaryCartItem = relatedCartItems[0];

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.variants && product.variants.length > 1) {
      setOptionsProduct(product);
      open('options');
    } else {
      addToCart(product, 1);
      open('cart');
    }
  };

  return (
    <div className="product-card">
      <Link to={`/product/${encodeURIComponent(product.id)}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <div className="product-image-container">
          {product.badge && <div className="product-badge-ribbon">{product.badge}</div>}
          {product.circleBadge && <div className="product-circle-badge">{product.circleBadge}</div>}
          <img src={product.image} alt={product.name} className="product-image" />
        </div>
      </Link>
      <div className="product-info">
        {product.rankText && <div className="product-rank">{product.rankText}</div>}
        <Link to={`/product/${encodeURIComponent(product.id)}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 className="product-title">{product.name}</h3>
        </Link>
        {product.subtitle && <p className="product-subtitle">{product.subtitle}</p>}
        
        {product.reviews && (
          <div className="product-rating">
            <div className="stars">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={14} fill="#2A5C38" color="#2A5C38" />
              ))}
            </div>
            <span className="rating-count">({product.reviews} reviews)</span>
          </div>
        )}
        
        {product.size && <div className="product-size">{product.size}</div>}
        
        <div className="product-price-row">
          <span className="current-price">From ₹{product.price}</span>
        </div>
        
        <div className="product-action-row">
          {relatedCartItems.length === 0 ? (
            <button 
              className="btn-primary add-to-cart-btn" 
              style={{ width: '100%' }}
              onClick={handleAddToCart}
            >
              Add to cart <ShoppingCart size={16} style={{marginLeft: '8px'}} />
            </button>
          ) : (
            <div className="quantity-selector-styled">
              <button onClick={(e) => { e.preventDefault(); updateQuantity(primaryCartItem.id, primaryCartItem.quantity - 1); }}>-</button>
              <span>{totalQuantity}</span>
              <button onClick={(e) => { 
                e.preventDefault(); 
                // If there's multiple variants, hitting + on the card will increment the first one added.
                // Alternatively, we could open the options drawer again. Let's just increment the primary one.
                updateQuantity(primaryCartItem.id, primaryCartItem.quantity + 1); 
              }}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
