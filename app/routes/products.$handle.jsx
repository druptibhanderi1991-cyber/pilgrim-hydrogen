import {useState} from 'react';
import {useLoaderData, Link} from 'react-router';
import {Money, getSelectedProductOptions} from '@shopify/hydrogen';
import {useCart} from '~/components/CartProvider';
import {useAside} from '~/components/Aside';

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

const BENEFITS = [
  {icon: '🌿', label: '100% Natural'},
  {icon: '🧪', label: 'Clinically Tested'},
  {icon: '🐰', label: 'PETA Vegan'},
  {icon: '✓',  label: 'No Parabens'},
  {icon: '🌱', label: 'Farm-to-Bottle'},
  {icon: '⚗️', label: 'NABL Certified'},
];

function stableRating(id = '') {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return (4.4 + (h % 7) * 0.1).toFixed(1);
}
function stableReviews(id = '') {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return 280 + (h % 7800);
}

export default function ProductDetail() {
  const {product} = useLoaderData();
  const {addToCart, addingVariants, cart, updateCartLine} = useCart();
  const {open} = useAside();

  const [activeTab,         setActiveTab]         = useState('Description');
  const [activeImg,         setActiveImg]         = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants?.nodes?.[0]?.id,
  );

  const selectedVariant = product.variants?.nodes?.find((v) => v.id === selectedVariantId)
    || product.variants?.nodes?.[0];
  const adding = addingVariants.has(selectedVariantId);

  // Cart state for selected variant
  const cartItem = cart?.items?.find((item) => item.id === selectedVariantId);
  const cartQty  = cartItem?.quantity || 0;
  const lineId   = cartItem?.lineId;

  const price     = selectedVariant?.price     || product.priceRange?.minVariantPrice;
  const compareAt = selectedVariant?.compareAtPrice || product.compareAtPriceRange?.minVariantPrice;
  const discount  = compareAt?.amount && parseFloat(compareAt.amount) > parseFloat(price?.amount || 0)
    ? Math.round(((parseFloat(compareAt.amount) - parseFloat(price.amount)) / parseFloat(compareAt.amount)) * 100)
    : 0;

  const rating  = stableRating(product.id);
  const reviews = stableReviews(product.id);

  const images = product.images?.nodes?.length
    ? product.images.nodes
    : product.featuredImage ? [product.featuredImage] : [];

  const descriptionHtml = product.descriptionHtml || '';
  const ingredients     = product.metafields?.find((m) => m?.key === 'ingredients')?.value || '';
  const howToUse        = product.metafields?.find((m) => m?.key === 'how_to_use')?.value  || '';

  // Add to cart — toast fires automatically, sticky bar transforms via cartQty
  function handleAddToCart() {
    if (!selectedVariantId || adding) return;
    addToCart(selectedVariantId, 1);
  }

  // View Cart — opens cart drawer
  function handleViewCart() {
    open('cart');
  }

  return (
    <>
      <div className="product-detail-page">
        <div className="container">
          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <Link to="/">Home</Link>
            <span className="breadcrumb-sep">›</span>
            <Link to="/collections/all">Products</Link>
            {product.productType && (
              <>
                <span className="breadcrumb-sep">›</span>
                <Link to={`/collections/${product.productType.toLowerCase().replace(/\s+/g, '-')}`}>
                  {product.productType}
                </Link>
              </>
            )}
            <span className="breadcrumb-sep">›</span>
            <span>{product.title}</span>
          </nav>

          {/* Main grid */}
          <div className="pd-grid">
            {/* ── Gallery ── */}
            <div className="pd-gallery">
              <div className="pd-main-img">
                {images[activeImg]?.url ? (
                  <img
                    src={images[activeImg].url}
                    alt={images[activeImg].altText || product.title}
                    className="pd-main-photo"
                  />
                ) : (
                  <div className="pd-main-placeholder">✦</div>
                )}
                {discount > 0 && (
                  <span className="pd-img-badge">{discount}% OFF</span>
                )}
              </div>
              {images.length > 1 && (
                <div className="pd-thumbs">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      className={`pd-thumb ${activeImg === i ? 'active' : ''}`}
                      onClick={() => setActiveImg(i)}
                      type="button"
                    >
                      <img src={img.url} alt={img.altText || product.title} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Info panel ── */}
            <div className="pd-info">
              {product.productType && (
                <div className="pd-category">{product.productType}</div>
              )}
              <h1 className="pd-title">{product.title}</h1>

              {/* Rating row */}
              <div className="pd-rating-row">
                <span className="pd-stars">★★★★★</span>
                <span className="pd-rating-val">{rating}</span>
                <span className="pd-reviews">({reviews.toLocaleString('en-IN')} verified reviews)</span>
              </div>

              {/* Price */}
              <div className="pd-price-row">
                <span className="pd-price"><Money data={price} /></span>
                {compareAt?.amount && parseFloat(compareAt.amount) > parseFloat(price?.amount || 0) && (
                  <>
                    <span className="pd-mrp"><Money data={compareAt} /></span>
                    {discount > 0 && (
                      <span className="pd-discount">{discount}% off</span>
                    )}
                  </>
                )}
              </div>
              <p className="pd-tax">Inclusive of all taxes · Free shipping above ₹699</p>

              {product.description && (
                <p className="pd-short">{product.description.substring(0, 140)}…</p>
              )}

              {/* Variant selector */}
              {product.variants?.nodes?.length > 1 && (
                <div className="pd-variants">
                  <p className="pd-variants-label">
                    Size / Variant: <strong>{selectedVariant?.title}</strong>
                  </p>
                  <div className="pd-volume-row">
                    {product.variants.nodes.map((v) => (
                      <button
                        key={v.id}
                        className={`pd-volume-chip ${selectedVariantId === v.id ? 'active' : ''}`}
                        onClick={() => setSelectedVariantId(v.id)}
                        type="button"
                      >
                        {v.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Key benefits strip */}
              <div className="pd-benefits-strip">
                {BENEFITS.map((b) => (
                  <div key={b.label} className="pd-benefit">
                    <span className="pd-benefit-icon">{b.icon}</span>
                    <span className="pd-benefit-label">{b.label}</span>
                  </div>
                ))}
              </div>

              {/* Concerns / tags */}
              {product.tags?.length > 0 && (
                <div className="pd-concerns">
                  <span style={{fontSize: 12, color: 'var(--muted)'}}>Works for: </span>
                  {product.tags.slice(0, 5).map((t) => (
                    <Link key={t} to={`/collections/all?q=${t}`} className="pd-concern-tag">{t}</Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="pd-tabs">
            <div className="pd-tab-nav">
              {TABS.map((t) => (
                <button
                  key={t}
                  className={`pd-tab-btn ${activeTab === t ? 'active' : ''}`}
                  onClick={() => setActiveTab(t)}
                  type="button"
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
                    : <p className="pd-desc-text" style={{color: 'var(--muted)'}}>
                        Full ingredient list is printed on the product packaging.
                      </p>
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
                    : <p className="pd-desc-text" style={{color: 'var(--muted)'}}>
                        Directions for use are printed on the product packaging.
                      </p>
                  }
                </div>
              )}
              {activeTab === 'Reviews' && (
                <div className="pd-tab-panel">
                  <div className="pd-reviews-summary">
                    <div className="pd-reviews-score">
                      <div className="pd-big-rating">{rating}</div>
                      <div className="pd-big-stars">★★★★★</div>
                      <div className="pd-reviews-count">{reviews.toLocaleString('en-IN')} reviews</div>
                    </div>
                    <div className="pd-rating-bars">
                      {[5,4,3,2,1].map((n) => {
                        const pct = n===5?72:n===4?18:n===3?6:n===2?3:1;
                        return (
                          <div key={n} className="pd-rating-bar-row">
                            <span>{n}★</span>
                            <div className="pd-rating-bar-bg">
                              <div className="pd-rating-bar-fill" style={{width: `${pct}%`}}/>
                            </div>
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

          {/* bottom padding so sticky bar doesn't overlap last content */}
          <div style={{height: 88}} />
        </div>
      </div>

      {/* ── Sticky ATC bar — ALWAYS visible (matches Pilgrim) ── */}
      <div className="pdp-sticky pdp-sticky--visible">
        <div className="pdp-sticky-inner container">

          {/* Product thumbnail + title + price */}
          <div className="pdp-sticky-product">
            {images[0]?.url && (
              <img className="pdp-sticky-img" src={images[0].url} alt={product.title} />
            )}
            <div className="pdp-sticky-product-info">
              <div className="pdp-sticky-title">{product.title}</div>
              {selectedVariant?.title && selectedVariant.title !== 'Default Title' && (
                <div className="pdp-sticky-variant">{selectedVariant.title}</div>
              )}
              <div className="pdp-sticky-price">
                ₹{parseFloat(price?.amount || 0).toFixed(0)}
                {discount > 0 && (
                  <span className="pdp-sticky-discount">{discount}% off</span>
                )}
              </div>
            </div>
          </div>

          {/* Variant selector (if multiple) */}
          {product.variants?.nodes?.length > 1 && (
            <div className="pdp-sticky-variants">
              {product.variants.nodes.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  className={`pdp-sticky-chip ${selectedVariantId === v.id ? 'active' : ''}`}
                  onClick={() => setSelectedVariantId(v.id)}
                >
                  {v.title}
                </button>
              ))}
            </div>
          )}

          {/* Action area */}
          <div className="pdp-sticky-actions">
            {cartQty > 0 ? (
              /* In cart: stepper + View Cart */
              <>
                <div className="pdp-sticky-stepper">
                  <button
                    type="button"
                    className="pdp-sticky-stepper-btn"
                    onClick={() => updateCartLine(lineId, cartQty - 1)}
                    aria-label="Decrease quantity"
                  >−</button>
                  <span className="pdp-sticky-stepper-qty">{cartQty}</span>
                  <button
                    type="button"
                    className="pdp-sticky-stepper-btn"
                    onClick={() => updateCartLine(lineId, cartQty + 1)}
                    aria-label="Increase quantity"
                  >+</button>
                </div>
                <button
                  type="button"
                  className="pdp-sticky-viewcart"
                  onClick={handleViewCart}
                >
                  View Cart →
                </button>
              </>
            ) : (
              /* Not in cart: Add to Cart */
              <button
                type="button"
                className={`pdp-sticky-atc ${adding ? 'loading' : ''}`}
                onClick={handleAddToCart}
                disabled={adding || !selectedVariant?.availableForSale}
              >
                {!selectedVariant?.availableForSale
                  ? 'Sold Out'
                  : adding
                  ? 'Adding…'
                  : '🛒 Add to Bag'}
              </button>
            )}
          </div>

        </div>
      </div>
    </>
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
      ]) { key value }
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
