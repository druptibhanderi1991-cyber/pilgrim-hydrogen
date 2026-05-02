import {useLoaderData, Link} from 'react-router';
import {Money} from '@shopify/hydrogen';

const HOME_QUERY = `#graphql
  query HomePageData {
    featuredCollection: collections(first: 8, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        id title handle
        image { url altText }
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

export async function loader({context}) {
  const {storefront} = context;
  const data = await storefront.query(HOME_QUERY);
  return data;
}

const CAT_STYLES = {
  'face-care':  {tint: 'rgba(200,149,42,0.18)', img: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=480&h=560&fit=crop&q=80'},
  'hair-care':  {tint: 'rgba(26,40,16,0.15)',   img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=480&h=560&fit=crop&q=80'},
  'body-care':  {tint: 'rgba(90,62,43,0.12)',   img: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=480&h=560&fit=crop&q=80'},
  'wellness':   {tint: 'rgba(45,90,27,0.15)',   img: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=480&h=560&fit=crop&q=80'},
  'herbs-oils': {tint: 'rgba(200,149,42,0.1)',  img: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=480&h=560&fit=crop&q=80'},
  'rituals':    {tint: 'rgba(26,40,16,0.1)',    img: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=480&h=560&fit=crop&q=80'},
  'gifting':    {tint: 'rgba(178,106,92,0.12)', img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=480&h=560&fit=crop&q=80'},
  'new-in':     {tint: 'rgba(58,107,26,0.1)',   img: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=480&h=560&fit=crop&q=80'},
};

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
  const {featuredCollection, products, newProducts} = useLoaderData();
  const collections = featuredCollection?.nodes || [];
  const allProducts  = products?.nodes || [];
  const newArrivals  = newProducts?.nodes || [];

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-grid container">
          <div className="hero-content">
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-line" />Ancient formula · N° 01
            </div>
            <h1 className="hero-title">Ancient Ayurveda,<br /><em>made modern.</em></h1>
            <p className="hero-sub">Clinically validated formulas rooted in the Charaka Samhita — pure, traceable, and proven to work.</p>
            <div className="hero-cta">
              <Link to="/collections/all" className="btn btn-moss">Shop all formulas <span className="arrow">→</span></Link>
              <Link to="/pages/about" className="btn btn-paper">Our story</Link>
            </div>
            <div className="hero-trust">
              {['PETA Certified','NABL Tested','GMP Grade','100% Vegan'].map(b => (
                <span key={b} className="hero-trust-pill">{b}</span>
              ))}
            </div>
          </div>
          <div className="hero-visual">
            <svg viewBox="0 0 320 420" width="320" height="420" xmlns="http://www.w3.org/2000/svg" style={{filter:'drop-shadow(0 32px 64px rgba(26,40,16,0.35))'}}>
              <defs><linearGradient id="hG" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#e8c891"/><stop offset="100%" stopColor="#8a6030"/></linearGradient></defs>
              <path d="M60 100 Q60 80 160 80 Q260 80 260 100 L248 380 Q248 400 160 400 Q72 400 72 380 Z" fill="url(#hG)"/>
              <rect x="82" y="56" width="156" height="36" rx="8" fill="#1e4010"/>
              <rect x="104" y="36" width="112" height="28" rx="7" fill="#0e2008"/>
              <rect x="72" y="136" width="176" height="196" rx="5" fill="#faf8f2" opacity="0.94"/>
              <text x="160" y="184" textAnchor="middle" fontFamily="Fraunces,Georgia,serif" fontStyle="italic" fontSize="16" fill="#1a2810">Vaidhacharya</text>
              <line x1="100" y1="196" x2="220" y2="196" stroke="#1a2810" strokeWidth="0.6"/>
              <text x="160" y="224" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="9" letterSpacing="2.5" fill="#6b7260">N° 01 — KUMKUMADI</text>
              <text x="160" y="262" textAnchor="middle" fontFamily="Fraunces,Georgia,serif" fontSize="17" fill="#3a6b1a">Brightening Face Oil</text>
              <rect x="112" y="298" width="96" height="24" rx="12" fill="#1e4010"/>
              <text x="160" y="313" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="10" fill="#e8dcc4" fontWeight="600" letterSpacing="1.2">PURE SAFFRON</text>
            </svg>
          </div>
        </div>
      </section>

      <MarqueeBar />

      {/* ── Categories ── */}
      <section className="categories container">
        <div className="cat-head">
          <div>
            <span className="eyebrow">The Ayurvedic collection</span>
            <h2 className="section-title" style={{marginTop:12}}>Shop by <em>category</em></h2>
          </div>
          <div className="cat-head-r">
            <Link to="/collections/all" className="cat-head-link">View all products →</Link>
          </div>
        </div>
        <div className="cat-grid">
          {collections.slice(0,8).map(c => {
            const s = CAT_STYLES[c.handle] || {tint:'rgba(26,40,16,0.1)', img:''};
            const imgSrc = c.image?.url || s.img;
            return (
              <Link key={c.id} to={`/collections/${c.handle}`} className="cat-tile">
                {imgSrc
                  ? <img src={imgSrc} alt={c.title} className="cat-photo" loading="lazy"/>
                  : <div className="cat-photo" style={{background:'var(--paper-2)'}}/>
                }
                <div className="cat-tint" style={{background:s.tint}}/>
                <div className="cat-overlay">
                  <span className="cat-overlay-name">{c.title}</span>
                  <span className="cat-overlay-arrow">→</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Bestsellers ── */}
      <section className="summer">
        <div className="container">
          <div className="cat-head">
            <div>
              <span className="eyebrow">Bestselling rituals</span>
              <h2 className="section-title" style={{marginTop:12}}>Top <em>formulas</em></h2>
              <p className="section-sub">Time-tested Ayurvedic formulas, backed by modern clinical research.</p>
            </div>
            <div className="cat-head-r">
              <Link to="/collections/all" className="cat-head-link">Shop all →</Link>
            </div>
          </div>
          <div className="product-grid">
            {allProducts.slice(0,4).map(p => {
              const badge = getBadge(p.tags);
              return (
                <Link key={p.id} to={`/products/${p.handle}`} className="product-card">
                  <div className="product-img" style={{background:'linear-gradient(160deg,#e8c89133,#e8c89166)'}}>
                    <span className={`product-pill ${badge.type}`}>{badge.label}</span>
                    {p.featuredImage?.url
                      ? <img src={p.featuredImage.url} alt={p.featuredImage.altText||p.title} style={{width:'100%',height:'100%',objectFit:'contain',padding:16}} loading="lazy"/>
                      : <div style={{fontSize:40,display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:'var(--moss)',opacity:0.3}}>✦</div>
                    }
                    <button className="product-quick" onClick={e=>e.preventDefault()}>Add to bag <span>+</span></button>
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{p.title}</h3>
                    <div className="product-row">
                      <span className="product-price">
                        <Money data={p.priceRange.minVariantPrice}/>
                        {p.compareAtPriceRange?.minVariantPrice?.amount > 0 && (
                          <span className="product-mrp"><Money data={p.compareAtPriceRange.minVariantPrice}/></span>
                        )}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
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
