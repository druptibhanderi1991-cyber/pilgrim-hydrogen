import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';
import '../styles/Home.css';

const categories = [
  { id: 1, name: 'Hair Care Oils', image: '/hair_care_oil.png' },
  { id: 2, name: 'Face Care Oils', image: '/face_care_oil.png' },
  { id: 3, name: 'Skin Care Oils', image: '/skin_care_oil.png' },
  { id: 4, name: 'Essential Oils', image: '/essential_oil.png' },
  { id: 5, name: 'Ayurvedic Oils', image: '/ayurvedic_oil.png' },
  { id: 6, name: 'Pain Relief Oils', image: '/pain_relief_oil.png' },
];

const trendingProducts = [
  {
    id: 1,
    name: '10% Vitamin C Face Serum',
    subtitle: 'Glowing, Brighter Skin in 5 Days*',
    price: 645,
    originalPrice: null,
    rating: 4.8,
    reviews: 5476,
    size: '30ml',
    badge: 'Bestseller',
    circleBadge: 'Clinically Tested',
    rankText: '#1 IN SKINCARE',
    image: '/gold_serum.png',
    variants: [
      { size: '30ml', price: 645, id: '1-30' },
      { size: '50ml', price: 995, id: '1-50' },
      { size: '100ml', price: 1895, id: '1-100', badge: 'BEST VALUE' }
    ]
  },
  {
    id: 2,
    name: '10% Niacinamide Face Serum',
    subtitle: 'Fades Acne Marks & Spots',
    price: 649,
    originalPrice: null,
    rating: 4.9,
    reviews: 5097,
    size: '30ml',
    badge: 'Trending',
    circleBadge: 'NEW & IMPROVED',
    rankText: '#2 IN SKINCARE',
    image: '/gold_serum.png'
  },
  {
    id: 3,
    name: 'Korean Hydra Glow Moisturizer',
    subtitle: 'Instant Glass Skin Glow',
    price: 395,
    originalPrice: null,
    rating: 4.7,
    reviews: 448,
    size: '100g',
    badge: 'Sale',
    circleBadge: 'Korean Glass Skin Glow',
    rankText: '#1 IN MOISTURIZERS',
    image: '/face_wash.png'
  },
  {
    id: 4,
    name: '25% AHA 2% BHA 5% PHA Peeling Solution',
    subtitle: '10-Mins Tan Removal',
    price: 645,
    originalPrice: null,
    rating: 4.6,
    reviews: 7778,
    size: '30ml',
    badge: 'New & Improved',
    circleBadge: 'Tan Removal',
    rankText: '#3 IN SKINCARE',
    image: '/gold_serum.png'
  }
];

const Home = () => {
  const [activePill, setActivePill] = useState('Top Picks for You');

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
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
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
