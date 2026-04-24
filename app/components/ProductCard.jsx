import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const [quantity, setQuantity] = useState(1);

  const increase = () => setQuantity(q => q + 1);
  const decrease = () => setQuantity(q => q > 1 ? q - 1 : 1);

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <div className="product-image-container">
          {product.badge && <div className="product-badge-ribbon">{product.badge}</div>}
          {product.circleBadge && <div className="product-circle-badge">{product.circleBadge}</div>}
          <img src={product.image} alt={product.name} className="product-image" />
        </div>
      </Link>
      <div className="product-info">
        {product.rankText && <div className="product-rank">{product.rankText}</div>}
        <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 className="product-title">{product.name}</h3>
        </Link>
        {product.subtitle && <p className="product-subtitle">{product.subtitle}</p>}
        
        <div className="product-rating">
          <div className="stars">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={14} fill="#2A5C38" color="#2A5C38" />
            ))}
          </div>
          <span className="rating-count">({product.reviews} reviews)</span>
        </div>
        
        {product.size && <div className="product-size">{product.size}</div>}
        
        <div className="product-price-row">
          <span className="current-price">From ₹{product.price}</span>
        </div>
        
        <div className="product-action-row">
          <div className="quantity-selector">
            <button onClick={decrease}>-</button>
            <span>{quantity}</span>
            <button onClick={increase}>+</button>
          </div>
          <button className="btn-primary add-to-cart-btn">
            Add to cart <ShoppingCart size={16} style={{marginLeft: '8px'}} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
