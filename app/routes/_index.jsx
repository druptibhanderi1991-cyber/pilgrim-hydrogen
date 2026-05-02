import {useLoaderData, Link} from 'react-router';
import {Money} from '@shopify/hydrogen';
import CategoryCard from '~/components/CategoryCard';

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
        id title handle
        priceRange { minVariantPrice { amount currencyCode } }
        compareAtPriceRange { minVariantPrice { amount currencyCode } }
        featuredImage { url altText }
        tags
      }
    }
    newProducts: products(first: 4, sortKey: CREATED_AT, reverse: true) {
      nodes {
        id title handle
        priceRange { minVariantPrice { amount currencyCode } }
        featuredImage { url altText }
        tags
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

function getBadge(tags = []) {
  if (tags.includes('bestseller')) return {label: 'BESTSELLER', type: 'hot'};
  if (tags.includes('new'))        return {label: 'NEW', type: 'new'};
  if (tags.includes('viral'))      return {label: 'VIRAL', type: 'viral'};
  return {label: 'AYURVEDIC', type: 'new'};
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

const WHY_CARDS = [
  {icon: '✦', title: 'Clinically Proven',       text: 'Every formula tested in NABL-certified labs. We share the data — no empty claims.'},
  {icon: '❀', title: '5000 Years of Heritage',   text: 'Rooted in the Charaka Samhita and Ashtanga Hridayam. Tradition backed by science.'},
  {icon: '◯', title: '100% Natural & Vegan',     text: 'PETA-certified. No animal ingredients, parabens, sulphates or synthetic fragrance. Ever.'},
  {icon: '✧', title: 'Farm-to-Bottle',           text: 'Direct sourcing from 34 certified organic farms across India, Nepal and Sri Lanka.'},
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
                View all products →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Trending Now — premium minimal Ayurvedic ritual showcase ── */}
      <section className="trending">
        <div className="trending-container">
          <div className="trending-head">
            <div>
              <p className="trending-eyebrow">BEST SELLING RITUALS</p>
              <h2 className="trending-title">
                Trending <em>formulas</em>
              </h2>
              <p className="trending-sub">
                Time-tested Ayurvedic formulas, backed by modern clinical research.
              </p>
            </div>
            <Link to="/collections/all" className="trending-shopall">
              Shop all →
            </Link>
          </div>

          <div className="trending-grid">
            {allProducts.slice(0, 4).map((p) => (
              <Link key={p.id} to={`/products/${p.handle}`} className="trending-card">
                <div className="trending-img-wrap">
                  <span className="trending-badge">AYURVEDIC</span>
                  {p.featuredImage?.url ? (
                    <img
                      src={p.featuredImage.url}
                      alt={p.featuredImage.altText || p.title}
                      className="trending-img"
                      loading="lazy"
                    />
                  ) : (
                    <div className="trending-img-fallback">✦</div>
                  )}
                </div>
                <div className="trending-info">
                  <h3 className="trending-name">{p.title}</h3>
                  <div className="trending-price">
                    <Money data={p.priceRange.minVariantPrice} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Editorial Promo ── */}
      <section className="editorial container">
        <div className="editorial-grid">
          <div className="editorial-text">
            <span className="editorial-eyebrow"><span className="editorial-eyebrow-line"/>Ancient Formula · N° 01</span>
            <h2 className="editorial-title">Saffron &amp;<br/><em>radiance.</em></h2>
            <p className="editorial-lede">The legendary Kumkumadi tailam — 24 rare herbs in cold-pressed sesame oil, anchored by pure saffron. Clinically proven to reduce pigmentation by 43% in 28 days.</p>
            <div className="editorial-features">
              {['Pure saffron (kumkuma)','24 rare Ayurvedic herbs','-43% pigmentation in 28 days','Zero synthetic fragrance'].map(f=>(
                <div key={f} className="editorial-feature"><span className="editorial-feature-dot"/>{f}</div>
              ))}
            </div>
            <Link to="/collections/all" className="btn btn-paper">Shop now <span className="arrow">→</span></Link>
          </div>
          <div className="editorial-visual">
            <svg viewBox="0 0 220 380" width="220" height="380" xmlns="http://www.w3.org/2000/svg" style={{filter:'drop-shadow(0 28px 48px rgba(26,40,16,0.35))'}}>
              <defs><linearGradient id="kG" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#e8c891"/><stop offset="100%" stopColor="#8a6030"/></linearGradient></defs>
              <path d="M40 80 Q40 60 110 60 Q180 60 180 80 L168 340 Q168 360 110 360 Q52 360 52 340 Z" fill="url(#kG)"/>
              <rect x="62" y="36" width="96" height="36" rx="8" fill="#1e4010"/>
              <rect x="78" y="20" width="64" height="22" rx="6" fill="#0e2008"/>
              <rect x="50" y="118" width="120" height="168" rx="5" fill="#faf8f2" opacity="0.94"/>
              <text x="110" y="154" textAnchor="middle" fontFamily="Fraunces,Georgia,serif" fontStyle="italic" fontSize="14" fill="#1a2810">Vaidhacharya</text>
              <line x1="78" y1="166" x2="142" y2="166" stroke="#1a2810" strokeWidth="0.6"/>
              <text x="110" y="218" textAnchor="middle" fontFamily="Fraunces,Georgia,serif" fontSize="13" fill="#3a6b1a">Brightening Face Oil</text>
              <rect x="76" y="250" width="68" height="22" rx="11" fill="#1e4010"/>
              <text x="110" y="265" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="9" fill="#e8dcc4" fontWeight="600" letterSpacing="1">PURE SAFFRON</text>
            </svg>
          </div>
        </div>
      </section>

      {/* ── Why Vaidhacharya ── */}
      <section className="why">
        <div className="container">
          <div className="why-head">
            <span className="eyebrow">The Vaidhacharya promise</span>
            <h2 className="section-title" style={{marginTop:14}}>Ayurveda without <em>compromise.</em></h2>
            <p className="section-sub" style={{margin:'14px auto 0'}}>Four principles behind every formula we create.</p>
          </div>
          <div className="why-row">
            {WHY_CARDS.map(c=>(
              <div key={c.title} className="why-card">
                <div className="why-icon">{c.icon}</div>
                <h3 className="why-card-title">{c.title}</h3>
                <p className="why-card-text">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── New Arrivals ── */}
      {newArrivals.length > 0 && (
        <section className="summer" style={{background:'var(--paper-2)'}}>
          <div className="container">
            <div className="cat-head">
              <div>
                <span className="eyebrow">Just landed</span>
                <h2 className="section-title" style={{marginTop:12}}>New <em>arrivals</em></h2>
              </div>
              <div className="cat-head-r">
                <Link to="/collections/new-in" className="cat-head-link">See all new →</Link>
              </div>
            </div>
            <div className="product-grid">
              {newArrivals.map(p=>(
                <Link key={p.id} to={`/products/${p.handle}`} className="product-card">
                  <div className="product-img" style={{background:'linear-gradient(160deg,#d8e3c433,#d8e3c466)'}}>
                    <span className="product-pill new">NEW</span>
                    {p.featuredImage?.url
                      ? <img src={p.featuredImage.url} alt={p.featuredImage.altText||p.title} style={{width:'100%',height:'100%',objectFit:'contain',padding:16}} loading="lazy"/>
                      : <div style={{fontSize:40,display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:'var(--moss)',opacity:0.3}}>✦</div>
                    }
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{p.title}</h3>
                    <div className="product-row">
                      <span className="product-price"><Money data={p.priceRange.minVariantPrice}/></span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
