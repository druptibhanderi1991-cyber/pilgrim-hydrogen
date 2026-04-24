import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import * as shopifyApi from '~/lib/shopify';
import '../styles/Home.css';

const categories = [
  { id: 1, name: 'Hair Care Oils', image: '/hair_care_oil.png' },
  { id: 2, name: 'Face Care Oils', image: '/face_care_oil.png' },
  { id: 3, name: 'Skin Care Oils', image: '/skin_care_oil.png' },
  { id: 4, name: 'Essential Oils', image: '/essential_oil.png' },
  { id: 5, name: 'Ayurvedic Oils', image: '/ayurvedic_oil.png' },
  { id: 6, name: 'Pain Relief Oils', image: '/pain_relief_oil.png' },
];

const Home = () => {
  const [activePill, setActivePill] = useState('Top Picks for You');
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      const products = await shopifyApi.fetchProducts();
      setTrendingProducts(products || []);
      setIsLoading(false);
    }
    loadProducts();
  }, []);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content container">
          <h1>Discover the Secrets of Jeju Island</h1>
          <p>Explore our best-selling Volcanic Ash range for clear, glowing skin.</p>
          <button className="btn-primary hero-btn">SHOP NOW &gt;&gt;</button>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section container">
        <h2 className="section-title">Shop by Category</h2>
        <div className="categories-grid">
          {categories.map((cat) => (
            <div key={cat.id} className="category-card">
              <div className="category-img-wrapper">
                <img src={cat.image} alt={cat.name} />
              </div>
              <p>{cat.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Products Section */}
      <section className="trending-section-wrapper">
        <div className="container trending-container">
          <div className="trending-header">
            <h2 className="trending-title">Trending Now</h2>
            <div className="title-divider">
              <span className="leaf-icon">🌿</span>
            </div>
            <p className="trending-subtitle">Curated just for you!</p>
          </div>

          <div className="category-pills">
            {['Top Picks for You', 'Bestsellers', 'Skin Care', 'Hair Care', 'Essential Oils', 'Ayurvedic Oils'].map((pill) => (
              <button
                key={pill}
                className={`category-pill ${activePill === pill ? 'active' : ''}`}
                onClick={() => setActivePill(pill)}
              >
                {pill}
              </button>
            ))}
          </div>

          <div className="products-grid">
          {isLoading ? (
            <div style={{textAlign: 'center', padding: '40px', gridColumn: '1 / -1'}}>
              <p>Loading live products from Shopify...</p>
            </div>
          ) : trendingProducts.length > 0 ? (
            trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div style={{textAlign: 'center', padding: '40px', gridColumn: '1 / -1'}}>
              <p>No products found.</p>
            </div>
          )}
        </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="brand-values">
        <div className="container values-inner">
          <div className="value-item">
            <div className="value-icon">🌿</div>
            <h4>100% Vegan</h4>
          </div>
          <div className="value-item">
            <div className="value-icon">🐰</div>
            <h4>Cruelty Free</h4>
          </div>
          <div className="value-item">
            <div className="value-icon">🧪</div>
            <h4>No Toxic Chemicals</h4>
          </div>
          <div className="value-item">
            <div className="value-icon">✅</div>
            <h4>FDA Approved</h4>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
