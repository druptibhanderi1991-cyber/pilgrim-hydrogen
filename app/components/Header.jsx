import React from 'react';
import { Search, User, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="header-container">
      <div className="announcement-bar">
        <p>FLAT 15% OFF ON YOUR FIRST ORDER | USE CODE: PILGRIM15</p>
      </div>
      <div className="main-header">
        <div className="container header-inner">
          <div className="logo">
            <Link to="/">
              <h2>PILGRIM</h2>
            </Link>
          </div>
          <nav className="desktop-nav">
            <ul>
              <li><Link to="/">Best Sellers</Link></li>
              <li><Link to="/">Skin Care</Link></li>
              <li><Link to="/">Hair Care</Link></li>
              <li><Link to="/">Makeup</Link></li>
              <li><Link to="/">Gifting</Link></li>
            </ul>
          </nav>
          <div className="header-actions">
            <button className="icon-btn" aria-label="Search">
              <Search size={20} />
            </button>
            <button className="icon-btn" aria-label="Account">
              <User size={20} />
            </button>
            <button className="icon-btn cart-btn" aria-label="Cart">
              <ShoppingBag size={20} />
              <span className="cart-badge">0</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
