import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, ShoppingCart, Sparkles, Droplets, ShieldCheck, Smile, Wind, Feather, Lock, Truck } from 'lucide-react';
import '../styles/ProductDetail.css';

const productData = {
  id: '1',
  name: '10% Vitamin C Face Serum For Triple Glow+++',
  subtitle: 'Discover Glowing, Brighter Skin',
  price: 645,
  originalPrice: 695,
  rating: 4.8,
  reviews: 5476,
  size: '30ml',
  badge: 'NEW & IMPROVED FORMULA',
  circleBadge: 'NEW',
  rankText: '#1 IN SKINCARE',
  image: '/gold_serum.png',
  images: ['/gold_serum.png', '/after_skin.png', '/before_skin.png'],
  description: 'Achieve glowing, brighter skin in just 5 days* with the advanced 2.0 formula, now enriched with 10% Vitamin C (3-O-Ethyl Ascorbic Acid) and 5% Niacinamide for even faster, more effective results.',
  benefits: ['Brightens Skin', 'Fades Dark Spots', 'Evens Skin Tone']
};

const reviewsMockData = [
  {
    id: 1,
    name: "Aarti Sharma",
    verified: true,
    rating: 5,
    date: "2 days ago",
    text: "Absolutely love this serum! It has completely changed my skincare game. The dark spots on my cheeks are visibly lighter.",
    images: ["/after_skin.png", "/before_skin.png"]
  },
  {
    id: 2,
    name: "Pooja Reddy",
    verified: true,
    rating: 4,
    date: "1 week ago",
    text: "Very gentle and nice texture. Absorbs quickly. Waiting to see more results on pigmentation but overall a great product.",
    images: []
  },
  {
    id: 3,
    name: "Neha K.",
    verified: true,
    rating: 5,
    date: "2 weeks ago",
    text: "The best vitamin c serum I have used. So lightweight and doesn't feel sticky at all.",
    images: ["/after_skin.png"]
  }
];

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [activeAccordion, setActiveAccordion] = useState(1);
  const [sliderPos, setSliderPos] = useState(50);
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  
  const [pincode, setPincode] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [countdown, setCountdown] = useState('');

  React.useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0);
      const diff = tomorrow - now;
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setCountdown(`${h} hrs ${m} mins`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkPincode = async () => {
    if (pincode.length !== 6) return;
    setIsChecking(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();
      if (data[0] && data[0].Status === "Success") {
        const city = data[0].PostOffice[0].District;
        const state = data[0].PostOffice[0].State;
        const d = new Date();
        d.setDate(d.getDate() + 3);
        const dateStr = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        
        setDeliveryInfo({ city, state, date: dateStr, error: null });
      } else {
        setDeliveryInfo({ error: "Invalid pincode. Please try again." });
      }
    } catch (err) {
      setDeliveryInfo({ error: "Could not fetch details. Please check your connection." });
    }
    setIsChecking(false);
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const increase = () => setQuantity(q => q + 1);
  const decrease = () => setQuantity(q => q > 1 ? q - 1 : 1);

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  // In a real app, fetch product by id. Here we use mock data.
  const product = productData;

  return (
    <div className="product-detail-page">
      <div className="breadcrumb container">
        Home &gt; Skin Care &gt; Face Serum &gt; <span>{product.name}</span>
      </div>

      <div className="product-main container">
        <div className="product-gallery-new">
          <div className="thumbnail-list-vertical">
            {product.images.map((img, idx) => (
              <div 
                key={idx} 
                className={`thumbnail-v ${activeImageIndex === idx ? 'active' : ''}`}
                onClick={() => setActiveImageIndex(idx)}
                onMouseEnter={() => setActiveImageIndex(idx)}
              >
                <img src={img} alt={`thumb ${idx}`} />
              </div>
            ))}
          </div>
          
          <div className="main-image-wrapper" onClick={() => setIsLightboxOpen(true)}>
            <div className="image-badges-overlay">
              {product.badge && <span className="overlay-badge">{product.badge}</span>}
            </div>
            <div className="zoom-container">
              <img src={product.images[activeImageIndex]} alt={product.name} className="main-image-zoom" />
            </div>
          </div>
        </div>

        {/* Right Column: Product Info */}
        <div className="product-details-content">
          <div className="highlight-banner">
            50,000+ items sold in the last 30 days
          </div>
          
          <div className="pdp-rank-tag">{product.rankText}</div>
          
          <div className="pdp-rating" style={{marginBottom: '5px'}}>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={16} fill="#00b0b9" color="#00b0b9" />
              ))}
            </div>
            <span className="rating-text">4.8/5 <span style={{textDecoration: 'underline', color: '#666'}}>({product.reviews} Reviews)</span></span>
          </div>

          <h1 className="pdp-title">{product.name}</h1>
          <p className="pdp-subtitle">{product.subtitle}</p>

          {/* Trust Badges Grid */}
          <div className="trust-badges-container">
            <div className="trust-badges-grid-new">
              <div className="trust-item-new"><Sparkles size={28} color="#00b0b9" strokeWidth={1.5} /> <span>Glowing, Brighter<br/>Skin</span></div>
              <div className="trust-item-new"><Droplets size={28} color="#00b0b9" strokeWidth={1.5} /> <span>Reduces Dark Spots</span></div>
              <div className="trust-item-new"><ShieldCheck size={28} color="#00b0b9" strokeWidth={1.5} /> <span>For all skin types</span></div>
              <div className="trust-item-new"><Smile size={28} color="#00b0b9" strokeWidth={1.5} /> <span>Beginner- Friendly</span></div>
              <div className="trust-item-new"><Wind size={28} color="#00b0b9" strokeWidth={1.5} /> <span>Fragrance free</span></div>
              <div className="trust-item-new"><Feather size={28} color="#00b0b9" strokeWidth={1.5} /> <span>Lightweight & Non-<br/>sticky</span></div>
            </div>
          </div>

          <div className="pdp-price-section">
            <span className="pdp-current-price">₹{product.price}</span>
          </div>
          <p className="inclusive-taxes">MRP Inclusive of all taxes<br/>30 ml | 1.01 fl. oz.</p>

          <div className="pdp-size-selector">
            <h4>Size: <span>{product.size}</span></h4>
            <div className="size-options-new">
              <div className="size-card active">
                <img src={product.image} alt="30ml variant" />
                <span className="size-card-vol">Size:{product.size}</span>
                <span className="size-card-price">₹{product.price}</span>
              </div>
            </div>
          </div>

          {/* Why You'll Love It Accordion */}
          <div className="why-love-container">
            <h3 className="why-love-title">Why you'll Love it</h3>
            <div className="why-love-accordion">
              {/* Item 1 */}
              <div className={`accordion-item ${activeAccordion === 1 ? 'open' : ''}`}>
                <div className="accordion-header" onClick={() => toggleAccordion(1)}>
                  <div className="accordion-title-area">
                    <Sparkles size={18} color="#2E7D32" />
                    <span>Glowing, Brighter Skin in 5 Days</span>
                  </div>
                  <div className="accordion-icon">{activeAccordion === 1 ? '-' : '+'}</div>
                </div>
                <div className="accordion-body">
                  <div className="accordion-inner">
                    <div className="accordion-content">
                      Formulated with 10% Vitamin C and 5% Niacinamide, this powerful serum delivers visible brightening and an unmatched glow in just under a week.
                    </div>
                  </div>
                </div>
              </div>

              {/* Item 2 */}
              <div className={`accordion-item ${activeAccordion === 2 ? 'open' : ''}`}>
                <div className="accordion-header" onClick={() => toggleAccordion(2)}>
                  <div className="accordion-title-area">
                    <ShieldCheck size={18} color="#2E7D32" />
                    <span>Melanin Blocking Technology</span>
                  </div>
                  <div className="accordion-icon">{activeAccordion === 2 ? '-' : '+'}</div>
                </div>
                <div className="accordion-body">
                  <div className="accordion-inner">
                    <div className="accordion-content">
                      Targets the root cause of dark spots by effectively inhibiting melanin production for an even, flawless complexion.
                    </div>
                  </div>
                </div>
              </div>

              {/* Item 3 */}
              <div className={`accordion-item ${activeAccordion === 3 ? 'open' : ''}`}>
                <div className="accordion-header" onClick={() => toggleAccordion(3)}>
                  <div className="accordion-title-area">
                    <Feather size={18} color="#2E7D32" />
                    <span>Gentle Formula For Sensitive Skin</span>
                  </div>
                  <div className="accordion-icon">{activeAccordion === 3 ? '-' : '+'}</div>
                </div>
                <div className="accordion-body">
                  <div className="accordion-inner">
                    <div className="accordion-content">
                      Dermatologically tested and free from harsh chemicals. Lightweight and non-sticky, making it perfect for daily use on all skin types.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Consumer Study Section */}
          <div className="consumer-study-container">
            <h3 className="consumer-study-title">Consumer Study*</h3>
            
            <div className="before-after-slider">
              <img src="/after_skin.png" alt="After" className="slider-img after-img" />
              <img 
                src="/before_skin.png" 
                alt="Before" 
                className="slider-img before-img" 
                style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }} 
              />
              <div className="slider-divider" style={{ left: `${sliderPos}%` }}>
                <div className="slider-handle"></div>
              </div>
              <div className="slider-labels">
                <span className="label-before">Before</span>
                <span className="label-after">After</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={sliderPos} 
                onChange={(e) => setSliderPos(e.target.value)} 
                className="slider-input" 
              />
            </div>

            <div className="study-stats">
              <div className="stat-item">
                <div className="stat-icon"><Sparkles size={22} color="#2E7D32" /></div>
                <div className="stat-content">
                  <span className="stat-percent">100%</span>
                  <span className="stat-text">noticed visibly brighter and glowing skin in 5 days</span>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon"><Droplets size={22} color="#2E7D32" /></div>
                <div className="stat-content">
                  <span className="stat-percent">98%</span>
                  <span className="stat-text">said it reduced dark spots in 3 days</span>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon"><Smile size={22} color="#2E7D32" /></div>
                <div className="stat-content">
                  <span className="stat-percent">97%</span>
                  <span className="stat-text">experienced a more even skin tone</span>
                </div>
              </div>
            </div>
            
            <div className="study-disclaimer">
              *Based on an independent consumer study. Individual results may vary.
            </div>
          </div>

          {/* Estimated Delivery Section */}
          <div className="delivery-check-container">
            <h3 className="delivery-check-title">Estimated Delivery Date</h3>
            <div className="delivery-input-group">
              <input 
                type="text" 
                maxLength="6"
                placeholder="Enter Pincode" 
                value={pincode} 
                onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
                className="delivery-input"
              />
              <button 
                onClick={checkPincode} 
                disabled={isChecking || pincode.length !== 6}
                className="delivery-btn"
              >
                {isChecking ? 'Checking...' : 'Check'}
              </button>
            </div>
            
            {deliveryInfo && deliveryInfo.error && (
              <div className="delivery-error">{deliveryInfo.error}</div>
            )}
            
            {deliveryInfo && !deliveryInfo.error && (
              <div className="delivery-details">
                <div className="delivery-line">
                  <span className="delivery-icon">📍</span>
                  <span>Delivering to <strong>{deliveryInfo.city}, {deliveryInfo.state}</strong></span>
                </div>
                <div className="delivery-line">
                  <span className="delivery-icon">🚚</span>
                  <span>Delivery by <strong>{deliveryInfo.date}</strong></span>
                </div>
                <div className="delivery-line">
                  <span className="delivery-icon">⏱</span>
                  <span>Order within <strong style={{color: '#e55a30'}}>{countdown}</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Accordion Tabs */}
          <div className="pdp-tabs">
            <div className="tab-headers">
              <button 
                className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
              >Description</button>
              <button 
                className={`tab-btn ${activeTab === 'ingredients' ? 'active' : ''}`}
                onClick={() => setActiveTab('ingredients')}
              >Ingredients</button>
            </div>
            <div className="tab-content">
              {activeTab === 'description' && (
                <div>
                  <p>{product.description}</p>
                  <ul>
                    {product.benefits.map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                </div>
              )}
              {activeTab === 'ingredients' && (
                <p>Purified Water, 3-O-Ethyl Ascorbic Acid, Niacinamide, Glycerin, Phenoxyethanol...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* How To Use Section */}
      <div className="how-to-use-wrapper">
        <div className="container how-to-use-content">
          <h2 className="section-title">How to use</h2>
          <div className="video-container">
            <iframe 
              width="100%" 
              height="500"
              src="https://www.youtube.com/embed/LXb3EKWsInQ?mute=1&autoplay=0" 
              title="How to use product"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen>
            </iframe>
          </div>
          <div className="usage-steps">
            <div className="step-item">
              <div className="step-number">1</div>
              <p>Apply 3–5 drops on clean face</p>
            </div>
            <div className="step-item">
              <div className="step-number">2</div>
              <p>Gently massage</p>
            </div>
            <div className="step-item">
              <div className="step-number">3</div>
              <p>Use daily for best results</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Icons Bar */}
      <div className="trust-icons-bar-wrapper">
        <div className="container trust-icons-content">
          <div className="trust-icon-item">
            <ShieldCheck size={28} color="#2E7D32" strokeWidth={1.5} />
            <span>100% Genuine</span>
          </div>
          <div className="trust-icon-item">
            <Lock size={28} color="#2E7D32" strokeWidth={1.5} />
            <span>Secure Payment</span>
          </div>
          <div className="trust-icon-item">
            <Truck size={28} color="#2E7D32" strokeWidth={1.5} />
            <span>Fast Shipping</span>
          </div>
        </div>
      </div>

      {/* Ratings on Other Platforms */}
      <div className="other-platforms-wrapper">
        <div className="container">
          <h2 className="section-title text-center">Our Rating on Other Platforms</h2>
          <div className="platform-cards">
            {/* Nykaa */}
            <div className="platform-card">
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/a8/Nykaa_logo.svg" alt="Nykaa" className="platform-logo" />
              <div className="platform-rating">
                <span className="platform-star">⭐</span>
                <span className="platform-score">4.5/5</span>
              </div>
              <div className="platform-reviews">1.9k ratings & 527 reviews</div>
            </div>
            
            {/* Flipkart */}
            <div className="platform-card">
              <img src="https://upload.wikimedia.org/wikipedia/en/7/7a/Flipkart_logo.svg" alt="Flipkart" className="platform-logo" />
              <div className="platform-rating">
                <span className="platform-star">⭐</span>
                <span className="platform-score">4.4/5</span>
              </div>
              <div className="platform-reviews">2.1k ratings & 843 reviews</div>
            </div>

            {/* Amazon */}
            <div className="platform-card">
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon" className="platform-logo" />
              <div className="platform-rating">
                <span className="platform-star">⭐</span>
                <span className="platform-score">4.6/5</span>
              </div>
              <div className="platform-reviews">5.2k ratings & 1,420 reviews</div>
            </div>
          </div>
        </div>
      </div>

      {/* Ratings & Reviews Section */}
      <div className="ratings-reviews-wrapper">
        <div className="container">
          
          {/* Header */}
          <div className="reviews-header">
            <div>
              <h2 className="section-title" style={{marginBottom: '5px'}}>Ratings & Reviews</h2>
              <div className="reviews-overall-rating">
                <span className="reviews-score">4.8</span>
                <span className="platform-star" style={{color: '#F5B041'}}>⭐</span>
                <span className="reviews-total">({product.reviews} reviews)</span>
              </div>
            </div>
            <button className="write-review-btn">Rate</button>
          </div>

          {/* Customer Photos */}
          <div className="customer-photos-section">
            <div className="photos-header">
              <h4>Customer Photos</h4>
              <a href="#see-more" className="see-more-link">See more</a>
            </div>
            <div className="customer-photos-gallery">
              <img src="/after_skin.png" alt="review 1" />
              <img src="/before_skin.png" alt="review 2" />
              <img src="/after_skin.png" alt="review 3" />
              <img src="/before_skin.png" alt="review 4" />
            </div>
          </div>

          {/* Sorting Option */}
          <div className="reviews-sort-section">
            <select className="sort-dropdown">
              <option value="most_recent">Most Recent</option>
              <option value="highest_rating">Highest Rating</option>
              <option value="with_images">With Images</option>
            </select>
          </div>

          {/* Reviews List */}
          <div className="reviews-list">
            {reviewsMockData.map(review => (
              <div key={review.id} className="review-card">
                <div className="review-meta">
                  <div className="review-author">
                    <span className="author-name">{review.name}</span>
                    {review.verified && <span className="verified-badge"><ShieldCheck size={14} color="#2E7D32"/> Verified Buyer</span>}
                  </div>
                  <div className="review-date">{review.date}</div>
                </div>
                
                <div className="review-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < review.rating ? "#F5B041" : "#ddd"} color={i < review.rating ? "#F5B041" : "transparent"} strokeWidth={i < review.rating ? 0 : 1} />
                  ))}
                </div>
                
                <p className="review-text">{review.text}</p>
                
                {review.images && review.images.length > 0 && (
                  <div className="review-images">
                    {review.images.map((img, idx) => (
                      <img key={idx} src={img} alt={`review content ${idx}`} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="sticky-bottom-bar-new">
        <div className="sticky-content-new container">
          <div className="sticky-left">
            <img src={product.image} alt="product thumb" />
            <div className="sticky-text-new">
              <div className="sticky-title-new">{product.name}</div>
              <div className="sticky-price-new">₹{product.price}</div>
            </div>
          </div>
          
          <div className="sticky-right">
            <div className="sticky-size-dropdown">
              <select>
                <option value="30ml">30ml</option>
              </select>
            </div>
            
            <button className="view-cart-btn">
              <ShoppingCart size={20} color="#222" />
              <span>View Cart</span>
            </button>

            <div className="sticky-yellow-action">
              <button onClick={decrease}>-</button>
              <span>{quantity}</span>
              <button onClick={increase}>+</button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="lightbox-overlay" onClick={() => setIsLightboxOpen(false)}>
          <button className="lightbox-close" onClick={() => setIsLightboxOpen(false)}>✕</button>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-nav prev" onClick={handlePrevImage}>❮</button>
            <img src={product.images[activeImageIndex]} alt="Fullscreen view" className="lightbox-image" />
            <button className="lightbox-nav next" onClick={handleNextImage}>❯</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
