import {useState} from 'react';
import {useLoaderData, Link} from 'react-router';
import {Money, getSelectedProductOptions} from '@shopify/hydrogen';
import {useCart} from '~/components/CartProvider';

export const meta = ({data}) => [
  {title: `Vaidhacharya | ${data?.product?.title ?? 'Product'}`},
];

export async function loader({params, context, request}) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) throw new Response('Not found', {status: 404});

  const {product} = await storefront.query(PRODUCT_QUERY, {
    variables: {handle, selectedOptions: getSelectedProductOptions(request)},
  });

  if (!product) throw new Response('Not found', {status: 404});

  return {product};
}

const TABS = ['Description', 'Key Ingredients', 'How to Use', 'Reviews'];

export default function ProductDetail() {
  const {product} = useLoaderData();
  const {addToCart} = useCart();
  const [activeTab, setActiveTab] = useState('Description');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants?.nodes?.[0]?.id
  );

  const selectedVariant = product.variants?.nodes?.find(v => v.id === selectedVariantId)
    || product.variants?.nodes?.[0];

  const price    = selectedVariant?.price || product.priceRange?.minVariantPrice;
  const compareAt = selectedVariant?.compareAtPrice || product.compareAtPriceRange?.minVariantPrice;
  const discount = compareAt?.amount > 0
    ? Math.round(((compareAt.amount - price.amount) / compareAt.amount) * 100)
    : 0;

  async function handleAddToCart() {
    if (!selectedVariantId) return;
    await addToCart(selectedVariantId, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  // Parse Shopify metafields / description into sections
  const descriptionHtml = product.descriptionHtml || '';
  const ingredients     = product.metafields?.find(m => m?.key === 'ingredients')?.value || '';
  const howToUse        = product.metafields?.find(m => m?.key === 'how_to_use')?.value  || '';

  const images = product.images?.nodes?.length
    ? product.images.nodes
    : product.featuredImage ? [{url: product.featuredImage.url, altText: product.featuredImage.altText}] : [];

  const [activeImg, setActiveImg] = useState(0);

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb-sep">›</span>
          <Link to="/collections/all">Products</Link>
          <span className="breadcrumb-sep">›</span>
          <span>{product.title}</span>
        </nav>

        {/* Main grid */}
        <div className="pd-grid">
          {/* Gallery */}
          <div className="pd-gallery">
            <div className="pd-main-img" style={{background: 'linear-gradient(160deg,#e8c89122,#e8c89144)'}}>
              {images[activeImg]?.url ? (
                <img
                  src={images[activeImg].url}
                  alt={images[activeImg].altText || product.title}
                  style={{width: '100%', height: '100%', objectFit: 'contain', padding: 24}}
                />
              ) : (
                <div style={{fontSize: 64, color: 'var(--moss)', opacity: 0.2}}>✦</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="pd-thumbs">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className={`pd-thumb ${activeImg === i ? 'active' : ''}`}
                    onClick={() => setActiveImg(i)}
                    style={{background: 'linear-gradient(135deg,#e8c89133,#e8c89166)'}}
                  >
                    <img src={img.url} alt={img.altText || product.title} style={{width: '100%', height: '100%', objectFit: 'contain', padding: 4}} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="pd-info">
            {product.productType && (
              <div className="pd-category">{product.productType}</div>
            )}
            <h1 className="pd-title">{product.title}</h1>
            {product.description && (
              <p className="pd-short">{product.description.substring(0, 120)}…</p>
            )}

            <div className="pd-rating-row">
              <span className="pd-stars">★★★★★</span>
              <span className="pd-rating-val">4.8</span>
              <span className="pd-reviews">(verified reviews)</span>
            </div>

            <div className="pd-price-row">
              <span className="pd-price"><Money data={price} /></span>
              {compareAt?.amount > 0 && (
                <>
                  <span className="pd-mrp"><Money data={compareAt} /></span>
                  {discount > 0 && <span className="pd-discount">{discount}% off</span>}
                </>
              )}
            </div>
            <p className="pd-tax">Inclusive of all taxes · Free shipping above ₹499</p>

            {/* Variant selector */}
            {product.variants?.nodes?.length > 1 && (
              <div className="pd-volume-row">
                {product.variants.nodes.map(v => (
                  <button
                    key={v.id}
                    className={`pd-volume-chip ${selectedVariantId === v.id ? 'active' : ''}`}
                    onClick={() => setSelectedVariantId(v.id)}
                  >
                    {v.title}
                  </button>
                ))}
              </div>
            )}

            {/* Add to cart */}
            <div className="pd-actions">
              <div className="pd-qty">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => q + 1)}>+</button>
              </div>
              <button
                className={`btn btn-moss pd-atc ${added ? 'added' : ''}`}
                onClick={handleAddToCart}
                disabled={!selectedVariant?.availableForSale}
                style={{flex: 1, justifyContent: 'center'}}
              >
                {!selectedVariant?.availableForSale
                  ? 'Sold out'
                  : added ? '✓ Added to bag' : 'Add to bag'}
              </button>
            </div>

            {/* Trust badges */}
            <div className="pd-trust">
              {['PETA Certified', 'NABL Tested', 'No Parabens', 'Vegan', 'GMP Grade'].map(b => (
                <span key={b} className="pd-trust-badge">{b}</span>
              ))}
            </div>

            {/* Tags as concerns */}
            {product.tags?.length > 0 && (
              <div className="pd-concerns">
                <span className="pd-concerns-label">Works for: </span>
                {product.tags.slice(0, 5).map(t => (
                  <Link key={t} to={`/collections/all?q=${t}`} className="pd-concern-tag">{t}</Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="pd-tabs">
          <div className="pd-tab-nav">
            {TABS.map(t => (
              <button
                key={t}
                className={`pd-tab-btn ${activeTab === t ? 'active' : ''}`}
                onClick={() => setActiveTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="pd-tab-content">
            {activeTab === 'Description' && (
              <div className="pd-tab-panel">
                {descriptionHtml
                  ? <div className="pd-desc-text" dangerouslySetInnerHTML={{__html: descriptionHtml}} />
                  : <p className="pd-desc-text">{product.description || 'No description available.'}</p>
                }
              </div>
            )}
            {activeTab === 'Key Ingredients' && (
              <div className="pd-tab-panel">
                {ingredients
                  ? <div className="pd-desc-text">{ingredients}</div>
                  : <p className="pd-desc-text" style={{color: 'var(--muted)'}}>Full ingredient list printed on product packaging.</p>
                }
              </div>
            )}
            {activeTab === 'How to Use' && (
              <div className="pd-tab-panel">
                {howToUse
                  ? (
                    <div className="pd-howto">
                      <div className="pd-howto-icon">✦</div>
                      <p>{howToUse}</p>
                    </div>
                  )
                  : <p className="pd-desc-text" style={{color: 'var(--muted)'}}>Directions for use are printed on the product packaging.</p>
                }
              </div>
            )}
            {activeTab === 'Reviews' && (
              <div className="pd-tab-panel">
                <div className="pd-reviews-summary">
                  <div className="pd-reviews-score">
                    <div className="pd-big-rating">4.8</div>
                    <div className="pd-big-stars">★★★★★</div>
                    <div className="pd-reviews-count">Verified reviews</div>
                  </div>
                  <div className="pd-rating-bars">
                    {[5,4,3,2,1].map(n => {
                      const pct = n===5?72:n===4?18:n===3?6:n===2?3:1;
                      return (
                        <div key={n} className="pd-rating-bar-row">
                          <span>{n}★</span>
                          <div className="pd-rating-bar-bg"><div className="pd-rating-bar-fill" style={{width:`${pct}%`}}/></div>
                          <span>{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const PRODUCT_QUERY = `#graphql
  query Product($handle: String!, $selectedOptions: [SelectedOptionInput!]!) {
    product(handle: $handle) {
      id title description descriptionHtml productType tags
      featuredImage { url altText }
      images(first: 6) { nodes { url altText } }
      priceRange { minVariantPrice { amount currencyCode } }
      compareAtPriceRange { minVariantPrice { amount currencyCode } }
      metafields(identifiers: [
        {namespace: "custom", key: "ingredients"},
        {namespace: "custom", key: "how_to_use"}
      ]) {
        key value
      }
      variants(first: 10) {
        nodes {
          id title availableForSale
          price { amount currencyCode }
          compareAtPrice { amount currencyCode }
          selectedOptions { name value }
        }
      }
      selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions) {
        id title availableForSale
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
      }
    }
  }
`;
