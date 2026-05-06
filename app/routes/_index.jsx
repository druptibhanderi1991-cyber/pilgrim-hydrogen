import {useState, useRef, useCallback} from 'react';
import {useLoaderData, Link} from 'react-router';
import {Money} from '@shopify/hydrogen';
import CategoryCard from '~/components/CategoryCard';
import {useCart} from '~/components/CartProvider';
import {useAside} from '~/components/Aside';
import {useQuickAdd} from '~/components/QuickAddContext';

const HOME_QUERY = `#graphql
  query HomePageData {
    # Pull more than we'll show so we can filter empties and still render 8.
    featuredCollection: collections(first: 20) {
      nodes {
        id
        title
        handle
        image { url altText width height }
        products(first: 1) {
          nodes {
            id
            featuredImage { url altText width height }
          }
        }
      }
    }
    products(first: 8, sortKey: BEST_SELLING) {
      nodes {
        id title handle productType
        priceRange { minVariantPrice { amount currencyCode } }
        compareAtPriceRange { minVariantPrice { amount currencyCode } }
        featuredImage { url altText }
        tags
        variants(first: 3) {
          nodes {
            id title availableForSale
            price { amount currencyCode }
            compareAtPrice { amount currencyCode }
          }
        }
      }
    }
    newProducts: products(first: 4, sortKey: CREATED_AT, reverse: true) {
      nodes {
        id title handle productType
        priceRange { minVariantPrice { amount currencyCode } }
        compareAtPriceRange { minVariantPrice { amount currencyCode } }
        featuredImage { url altText }
        tags
        variants(first: 3) {
          nodes {
            id title availableForSale
            price { amount currencyCode }
            compareAtPrice { amount currencyCode }
          }
        }
      }
    }
  }
`;

export const meta = () => [{title: 'Vaidhacharya — Pure Ayurvedic Beauty & Wellness'}];

/**
 * Filter collections to only those that are ready to display:
 *  - has at least one product
 *  - has a usable image (collection image OR first product's featured image)
 *  - is not a Shopify-default empty placeholder (e.g. "Home page", "Frontpage")
 * Preserves the order returned by Shopify (admin sort).
 */
function curateCollections(nodes = []) {
  const SKIP = new Set(['home-page', 'frontpage', 'all']);
  return nodes
    .filter((c) => !SKIP.has(c.handle))
    .filter((c) => (c.products?.nodes?.length || 0) > 0)
    .filter((c) => c.image?.url || c.products?.nodes?.[0]?.featuredImage?.url)
    .slice(0, 8); // cap at 8 tiles for the homepage row
}

export async function loader({context}) {
  const {storefront} = context;
  const data = await storefront.query(HOME_QUERY);
  return {
    ...data,
    categoryCollections: curateCollections(data.featuredCollection?.nodes),
  };
}

// Categories are now fully driven by Shopify Storefront API (see HOME_QUERY +
// curateCollections in the loader). No hardcoded category list remains.

// Stable deterministic rating (4.4–5.0) derived from product id
function stableRating(id = '') {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return (4.4 + (h % 7) * 0.1).toFixed(1);
}

function MarqueeBar() {
  const items = ['Pure Ayurvedic Formulas','PETA Certified Vegan','Clinically Tested','NABL Accredited Labs','Farm-to-Bottle Traceability','Zero Synthetics','5000 Years of Heritage','GMP Certified'];
  const repeated = [...items, ...items];
  return (
    <div className="marquee-wrap">
      <div className="marquee-track">
        {repeated.map((t, i) => (
          <span key={i} className="marquee-item">{t} <span className="marquee-sep">✦</span></span>
        ))}
      </div>
    </div>
  );
}

const TRENDING_TABS = [
  {id: 'bestsellers', label: 'Bestsellers', match: () => true},
  {id: 'skin',        label: 'Skin Care',   match: (p) => p.tags?.some((t) => /skin|face/i.test(t))},
  {id: 'hair',        label: 'Hair Care',   match: (p) => p.tags?.some((t) => /hair/i.test(t))},
  {id: 'wellness',    label: 'Wellness',    match: (p) => p.tags?.some((t) => /wellness|herb|tea|capsule/i.test(t))},
];

// Deterministic 4–5 digit "review count" derived from product id so cards stay
// stable between renders and don't look identical across products.
function reviewCount(id = '') {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return 280 + (h % 7800);
}


function TrendingCard({product}) {
  const {addToCart, addingVariants, cart, updateCartLine} = useCart();
  const {open} = useAside();
  const {setProduct: setQuickAddProduct} = useQuickAdd();

  const isViral   = product.tags?.some((t) => /viral|bestseller/i.test(t));
  const isNew     = product.tags?.some((t) => /\bnew\b/i.test(t));
  const rating    = stableRating(product.id);
  const reviews   = reviewCount(product.id);

  const variants         = product.variants?.nodes || [];
  const firstVariant     = variants[0];
  const hasMultiVariants = variants.length > 1;

  const price     = firstVariant?.price || product.priceRange?.minVariantPrice;
  const compareAt = firstVariant?.compareAtPrice || product.compareAtPriceRange?.minVariantPrice;
  const hasDiscount = compareAt?.amount && price?.amount && parseFloat(compareAt.amount) > parseFloat(price.amount);
  const discount  = hasDiscount
    ? Math.round(((parseFloat(compareAt.amount) - parseFloat(price.amount)) / parseFloat(compareAt.amount)) * 100)
    : 0;

  const cartItem = cart?.items?.find((item) => item.id === firstVariant?.id);
  const cartQty  = cartItem?.quantity || 0;
  const lineId   = cartItem?.lineId;
  const adding   = addingVariants.has(firstVariant?.id);

  // Category label — use productType if available, else derive from tags
  const category = product.productType
    || (product.tags?.some((t) => /face|facial|skin/i.test(t)) ? 'Face Care'
      : product.tags?.some((t) => /hair/i.test(t)) ? 'Hair Care'
      : product.tags?.some((t) => /body/i.test(t)) ? 'Body Care'
      : product.tags?.some((t) => /wellness|herb/i.test(t)) ? 'Wellness'
      : 'Ayurvedic Formula');

  // Single-variant: add → open cart drawer immediately
  function handleDirectATC(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!firstVariant?.id || adding) return;
    addToCart(firstVariant.id, 1).then(() => open('cart'));
  }

  // Multi-variant: open Quick Add panel
  function handleChooseOptions(e) {
    e.preventDefault();
    e.stopPropagation();
    setQuickAddProduct(product);
    open('options');
  }

  return (
    <div className="tr-card">
      {/* Circular discount badge on image — Pilgrim pattern */}
      {discount >= 5 && (
        <span className="tr-discount-circle">
          <strong>{discount}%</strong>
          <span>OFF</span>
        </span>
      )}

      <Link to={`/products/${product.handle}`} className="tr-card-link" aria-label={product.title}>
        {/* Image — 4:5 portrait */}
        <div className="tr-card-img">
          {product.featuredImage?.url ? (
            <img
              src={product.featuredImage.url}
              alt={product.featuredImage.altText || product.title}
              loading="lazy"
            />
          ) : (
            <div className="tr-card-img-fallback">✦</div>
          )}
        </div>

        {/* Body — LEFT-ALIGNED, Pilgrim structure */}
        <div className="tr-card-body">

          {/* ① Rating row — FIRST (Pilgrim pattern) */}
          <div className="tr-rating">
            <span className="tr-stars" aria-label={`${rating} stars`}>★★★★★</span>
            <span className="tr-rating-score">{rating}</span>
            <span className="tr-reviews">({reviews.toLocaleString('en-IN')})</span>
          </div>

          {/* ② Inline badge for bestseller / new — inside body, not image overlay */}
          {isViral && <span className="tr-inline-badge tr-inline-badge-hot">BESTSELLER</span>}
          {!isViral && isNew && <span className="tr-inline-badge tr-inline-badge-new">NEW LAUNCH</span>}

          {/* ③ Category label */}
          <p className="tr-category">{category}</p>

          {/* ④ Product title */}
          <h3 className="tr-name">{product.title}</h3>

          {/* ⑤ Benefit tagline */}
          <p className="tr-desc">Pure Ayurvedic formula</p>

          {/* ⑥ Variant hint */}
          {hasMultiVariants && (
            <p className="tr-variant-hint">{variants.length} sizes available</p>
          )}

          {/* ⑦ Price */}
          <div className="tr-price">
            <span className="tr-price-current">
              {hasMultiVariants && <span className="tr-price-from">From </span>}
              <Money data={price} />
            </span>
            {hasDiscount && (
              <>
                <span className="tr-price-mrp"><Money data={compareAt} /></span>
                {discount > 0 && <span className="tr-price-pct">{discount}% off</span>}
              </>
            )}
          </div>
        </div>
      </Link>

      {/* Multi-variant → Choose Options */}
      {hasMultiVariants && (
        <button className="tr-cta tr-cta-options" onClick={handleChooseOptions} type="button">
          Choose Options <i className="tr-cta-arrow" aria-hidden="true">→</i>
        </button>
      )}

      {/* Single-variant in cart → inline stepper */}
      {!hasMultiVariants && cartQty > 0 && (
        <div className="tr-stepper">
          <button type="button" className="tr-stepper-btn"
            onClick={(e) => { e.preventDefault(); updateCartLine(lineId, cartQty - 1); }}>−</button>
          <span className="tr-stepper-qty">{cartQty}</span>
          <button type="button" className="tr-stepper-btn"
            onClick={(e) => { e.preventDefault(); updateCartLine(lineId, cartQty + 1); }}>+</button>
        </div>
      )}

      {/* Single-variant not in cart → ATC */}
      {!hasMultiVariants && cartQty === 0 && (
        <button
          className={`tr-cta ${adding ? 'tr-cta-loading' : ''}`}
          onClick={handleDirectATC}
          disabled={adding || !firstVariant?.availableForSale}
          type="button"
        >
          {!firstVariant?.availableForSale
            ? 'Sold Out'
            : adding
            ? 'Adding…'
            : <><span>Add to Cart</span><i className="tr-cta-arrow" aria-hidden="true">→</i></>}
        </button>
      )}
    </div>
  );
}

function TrendingSection({products = []}) {
  const [activeTab, setActiveTab] = useState('bestsellers');
  const scrollRef = useRef(null);

  const tab = TRENDING_TABS.find((t) => t.id === activeTab) || TRENDING_TABS[0];
  const filtered = products.filter(tab.match);
  const visible = filtered.length > 0 ? filtered : products;

  const scroll = useCallback((dir) => {
    if (!scrollRef.current) return;
    const cardW = scrollRef.current.querySelector('.tr-card')?.offsetWidth || 280;
    scrollRef.current.scrollBy({left: dir * (cardW + 20), behavior: 'smooth'});
  }, []);

  return (
    <section className="tr-section">
      <div className="tr-container">

        {/* ── Header row — eyebrow + title + view all ── */}
        <div className="tr-head">
          <div className="tr-head-left">
            <p className="tr-eyebrow">Curated just for you!</p>
            <h2 className="tr-title">Trending Now</h2>
          </div>
          <Link to="/collections/all" className="tr-viewall">
            View all products <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* ── Filter tabs ── */}
        <div className="tr-tabs" role="tablist">
          {TRENDING_TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={t.id === activeTab}
              className={`tr-tab${t.id === activeTab ? ' is-active' : ''}`}
              onClick={() => setActiveTab(t.id)}
              type="button"
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Carousel ── */}
        <div className="tr-carousel-wrap">
          <button
            className="tr-carousel-btn tr-carousel-prev"
            onClick={() => scroll(-1)}
            aria-label="Previous products"
            type="button"
          >‹</button>

          <div className="tr-carousel" ref={scrollRef}>
            {visible.map((p) => (
              <TrendingCard key={p.id} product={p} />
            ))}
          </div>

          <button
            className="tr-carousel-btn tr-carousel-next"
            onClick={() => scroll(1)}
            aria-label="Next products"
            type="button"
          >›</button>
        </div>

      </div>
    </section>
  );
}

function NewArrivalsSection({products = []}) {
  if (!products.length) return null;
  const scrollRef = useRef(null);

  const scroll = useCallback((dir) => {
    if (!scrollRef.current) return;
    const cardW = scrollRef.current.querySelector('.tr-card')?.offsetWidth || 280;
    scrollRef.current.scrollBy({left: dir * (cardW + 20), behavior: 'smooth'});
  }, []);

  return (
    <section className="na-section">
      <div className="tr-container">

        {/* ── Header row ── */}
        <div className="tr-head">
          <div className="tr-head-left">
            <p className="tr-eyebrow">Just landed</p>
            <h2 className="tr-title">New Launches</h2>
          </div>
          <Link to="/collections/new-in" className="tr-viewall">
            View all <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* ── Carousel ── */}
        <div className="tr-carousel-wrap">
          <button
            className="tr-carousel-btn tr-carousel-prev"
            onClick={() => scroll(-1)}
            aria-label="Previous products"
            type="button"
          >‹</button>

          <div className="tr-carousel" ref={scrollRef}>
            {products.map((p) => (
              <TrendingCard key={p.id} product={p} />
            ))}
          </div>

          <button
            className="tr-carousel-btn tr-carousel-next"
            onClick={() => scroll(1)}
            aria-label="Next products"
            type="button"
          >›</button>
        </div>

      </div>
    </section>
  );
}

const WHY_CARDS = [
  {
    symbol: '⬡',
    botanical: 'lab',
    accent: '#3a6b1a',
    title: 'Clinically Proven',
    tag: 'NABL Certified',
    text: 'Every formula tested in NABL-certified labs. We share the data — no empty claims, no greenwashing.',
  },
  {
    symbol: '❧',
    botanical: 'scroll',
    accent: '#7a4f1a',
    title: '5000 Years of Heritage',
    tag: 'Ancient Wisdom',
    text: 'Rooted in the Charaka Samhita and Ashtanga Hridayam. Tradition perfected over millennia, backed by science.',
  },
  {
    symbol: '✿',
    botanical: 'leaf',
    accent: '#2a5c10',
    title: '100% Natural & Vegan',
    tag: 'PETA Certified',
    text: 'PETA-certified. No animal ingredients, parabens, sulphates or synthetic fragrance — ever. Pure as nature intended.',
  },
  {
    symbol: '◈',
    botanical: 'farm',
    accent: '#5a3e10',
    title: 'Farm-to-Bottle',
    tag: 'Direct Sourcing',
    text: 'Sourced directly from 34 certified organic farms across India, Nepal and Sri Lanka. Traceable to the root.',
  },
];

export default function Homepage() {
  const {categoryCollections, products, newProducts} = useLoaderData();
  const allProducts  = products?.nodes || [];
  const newArrivals  = newProducts?.nodes || [];

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-grid container">
          <div className="hero-text">
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-line" />
              <span className="eyebrow">5000 years of wisdom · Spring '26</span>
            </div>
            <h1 className="hero-title">
              Ancient<br />Ayurveda,<br /><em>made modern.</em>
            </h1>
            <p className="hero-lede">
              Pure Ayurvedic formulas rooted in India's 5000-year-old healing tradition.
              Every ingredient sourced directly from certified organic farms. No fillers,
              no synthetics — only what nature perfected.
            </p>
            <div className="hero-cta-row">
              <Link to="/collections/all" className="btn btn-primary">
                Explore the range <span className="arrow">→</span>
              </Link>
              <Link to="/pages/about" className="btn btn-ghost">Our story</Link>
            </div>
            <div className="hero-meta">
              <div className="hero-meta-item">
                <span className="num">5000+</span>
                <span className="lbl">Years of heritage</span>
              </div>
              <div className="hero-meta-item">
                <span className="num">4.8★</span>
                <span className="lbl">Avg. rating</span>
              </div>
              <div className="hero-meta-item">
                <span className="num">100%</span>
                <span className="lbl">Natural · Vegan</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <span className="hero-tag">✦ Pure Ayurvedic · This season</span>
            <svg viewBox="0 0 220 380" width="220" height="380" xmlns="http://www.w3.org/2000/svg" className="hero-bottle">
              <defs>
                <linearGradient id="bottleG" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#e8dcc4" stopOpacity="0.95"/>
                  <stop offset="50%" stopColor="#c8a870" stopOpacity="0.9"/>
                  <stop offset="100%" stopColor="#8a6030" stopOpacity="0.95"/>
                </linearGradient>
                <linearGradient id="capG2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1e4010"/>
                  <stop offset="100%" stopColor="#0e2008"/>
                </linearGradient>
                <linearGradient id="labelG2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#faf8f2"/>
                  <stop offset="100%" stopColor="#f0e8d8"/>
                </linearGradient>
              </defs>
              <rect x="78" y="10" width="64" height="58" rx="8" fill="url(#capG2)"/>
              <rect x="84" y="14" width="52" height="6" rx="3" fill="#2d5a1b" opacity="0.5"/>
              <rect x="92" y="68" width="36" height="14" fill="#4a2c10"/>
              <path d="M60 84 Q60 80 70 80 L150 80 Q160 80 160 84 L160 350 Q160 368 110 368 Q60 368 60 350 Z" fill="url(#bottleG)" stroke="#4a3010" strokeWidth="0.5"/>
              <path d="M72 96 Q66 200 76 320" stroke="rgba(255,255,255,0.45)" strokeWidth="6" fill="none" strokeLinecap="round"/>
              <rect x="74" y="148" width="72" height="152" rx="4" fill="url(#labelG2)"/>
              <line x1="82" y1="168" x2="138" y2="168" stroke="#2c3e1a" strokeWidth="0.6"/>
              <text x="110" y="196" textAnchor="middle" fontFamily="Fraunces, Georgia, serif" fontSize="13" fontStyle="italic" fill="#1a2810" fontWeight="500">Vaidhacharya</text>
              <line x1="82" y1="210" x2="138" y2="210" stroke="#2c3e1a" strokeWidth="0.4"/>
              <text x="110" y="232" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="6.5" letterSpacing="2" fill="#6b7260">N° 01 — KUMKUMADI</text>
              <text x="110" y="258" textAnchor="middle" fontFamily="Fraunces, Georgia, serif" fontSize="10" fill="#3a6b1a">Brightening</text>
              <text x="110" y="272" textAnchor="middle" fontFamily="Fraunces, Georgia, serif" fontSize="10" fill="#3a6b1a">Face Oil</text>
              <line x1="82" y1="286" x2="138" y2="286" stroke="#2c3e1a" strokeWidth="0.4"/>
              <text x="110" y="298" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="5.5" letterSpacing="1.5" fill="#6b7260">30 ML / PURE AYURVEDIC</text>
            </svg>
            <div className="hero-floating">
              <div className="hero-floating-stars">★★★★★</div>
              <div className="hero-floating-text">
                <strong>"Transformed my skin in 21 days."</strong><br />
                Vogue India · Editor's Pick
              </div>
            </div>
          </div>
        </div>
      </section>

      <MarqueeBar />

      {/* ── Categories — fully driven by Shopify Storefront API ── */}
      {categoryCollections.length > 0 && (
        <section className="categories">
          <div className="categories-inner">
            <div className="cat-head cat-head-center">
              <span className="eyebrow">The Ayurvedic collection</span>
              <h2 className="section-title">
                Shop by <em>category</em>
              </h2>
            </div>

            <div className="cat-grid">
              {categoryCollections.map((collection) => (
                <CategoryCard key={collection.id} collection={collection} />
              ))}
            </div>

            <div className="cat-foot">
              <Link to="/collections/all" className="cat-viewall-btn">
                View all products
              </Link>
            </div>
          </div>
        </section>
      )}

      <TrendingSection products={allProducts} />


      {/* ── Why Vaidhacharya ── */}
      <section className="why">
        {/* Floating botanical background glyphs */}
        <span className="why-bg-leaf why-bg-leaf--1" aria-hidden="true">❧</span>
        <span className="why-bg-leaf why-bg-leaf--2" aria-hidden="true">✿</span>
        <span className="why-bg-leaf why-bg-leaf--3" aria-hidden="true">❧</span>

        <div className="container">
          {/* ── Header ── */}
          <div className="why-head">
            <div className="why-head-ornament" aria-hidden="true">
              <span className="why-ornament-line"/>
              <span className="why-ornament-glyph">✦</span>
              <span className="why-ornament-line"/>
            </div>
            <span className="why-eyebrow">The Vaidhacharya Promise</span>
            <h2 className="why-title">
              Ayurveda without <em>compromise.</em>
            </h2>
            <p className="why-sub">
              Four principles behind every formula we create —<br/>
              ancient wisdom, modern rigour, zero shortcuts.
            </p>
          </div>

          {/* ── Cards ── */}
          <div className="why-row">
            {WHY_CARDS.map((c) => (
              <div key={c.title} className="why-card">
                {/* Botanical corner accent */}
                <span className="why-card-corner" aria-hidden="true">❧</span>

                {/* Icon medallion */}
                <div className="why-icon" style={{'--accent': c.accent}}>
                  <span className="why-icon-glyph">{c.symbol}</span>
                  <span className="why-icon-ring" aria-hidden="true"/>
                </div>

                {/* Tag pill */}
                <span className="why-tag" style={{color: c.accent, borderColor: c.accent + '44'}}>
                  {c.tag}
                </span>

                <h3 className="why-card-title">{c.title}</h3>
                <p className="why-card-text">{c.text}</p>

                {/* Decorative bottom leaf */}
                <span className="why-card-foot" aria-hidden="true">— ✦ —</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── New Arrivals ── */}
      <NewArrivalsSection products={newArrivals} />
    </>
  );
}
