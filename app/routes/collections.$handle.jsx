import {useState, useMemo} from 'react';
import {Link, useLoaderData, useNavigate, useSearchParams} from 'react-router';
import {Analytics} from '@shopify/hydrogen';
import {useCart} from '~/components/CartProvider';
import {useAside} from '~/components/Aside';
import {useQuickAdd} from '~/components/QuickAddContext';

/* ─── Sort options ─────────────────────────────────────────── */
const SORT_OPTIONS = [
  {label: 'Best Selling',       key: 'BEST_SELLING', reverse: false},
  {label: 'Newest',             key: 'CREATED_AT',   reverse: true},
  {label: 'Price: Low → High',  key: 'PRICE',        reverse: false},
  {label: 'Price: High → Low',  key: 'PRICE',        reverse: true},
  {label: 'Featured',           key: 'MANUAL',       reverse: false},
];

export const meta = ({data}) => [
  {title: `Vaidhacharya | ${data?.collection?.title ?? 'Collection'}`},
];

/* ─── Loader ───────────────────────────────────────────────── */
export async function loader({params, context, request}) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) throw new Response('Not found', {status: 404});

  const url = new URL(request.url);
  const sortParam  = url.searchParams.get('sort')    || 'BEST_SELLING';
  const revParam   = url.searchParams.get('reverse') === 'true';

  const {collection} = await storefront.query(COLLECTION_QUERY, {
    variables: {handle, sortKey: sortParam, reverse: revParam, first: 24},
  });

  if (!collection) throw new Response(`Collection "${handle}" not found`, {status: 404});

  return {collection, sortKey: sortParam, reverse: revParam};
}

/* ─── Simulated rating (stable per product id) ─────────────── */
function stableRating(id = '') {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return (4.4 + (h % 7) * 0.1).toFixed(1); // 4.4–5.0
}
function stableReviews(id = '') {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return 120 + (h % 2800);
}

/* ─── Product Card ─────────────────────────────────────────── */
function ProductCard({product}) {
  const {addToCart, addingVariants, cart, updateCartLine} = useCart();
  const {open} = useAside();
  const {setProduct: setQuickAddProduct} = useQuickAdd();

  const variants         = product.variants?.nodes || [];
  const firstVariant     = variants[0];
  const hasMultiVariants = variants.length > 1;

  const cartItem = cart?.items?.find((item) => item.id === firstVariant?.id);
  const cartQty  = cartItem?.quantity || 0;
  const lineId   = cartItem?.lineId;
  const adding   = addingVariants.has(firstVariant?.id);

  const price     = firstVariant?.price || product.priceRange?.minVariantPrice;
  const compareAt = firstVariant?.compareAtPrice || product.compareAtPriceRange?.minVariantPrice;
  const discount  = compareAt?.amount && price?.amount
    ? Math.round(((parseFloat(compareAt.amount) - parseFloat(price.amount)) / parseFloat(compareAt.amount)) * 100)
    : 0;

  const rating  = stableRating(product.id);
  const reviews = stableReviews(product.id);

  // Single-variant: silent add → toast only
  function handleDirectATC(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!firstVariant?.id || adding) return;
    addToCart(firstVariant.id, 1);
  }

  // Multi-variant: open Quick Add panel
  function handleChooseOptions(e) {
    e.preventDefault();
    e.stopPropagation();
    setQuickAddProduct(product);
    open('options');
  }

  return (
    <div className="pc">
      {/* Badges */}
      {discount >= 5 && (
        <span className="pc-badge pc-badge-discount">{discount}% OFF</span>
      )}
      {product.tags?.includes('bestseller') && !discount && (
        <span className="pc-badge pc-badge-hot">BESTSELLER</span>
      )}
      {product.tags?.includes('new') && !discount && (
        <span className="pc-badge pc-badge-new">NEW</span>
      )}

      {/* Image */}
      <Link to={`/products/${product.handle}`} className="pc-img-wrap" tabIndex={-1}>
        <div className="pc-img">
          {product.featuredImage?.url ? (
            <img
              src={product.featuredImage.url}
              alt={product.featuredImage.altText || product.title}
              loading="lazy"
            />
          ) : (
            <div className="pc-img-fallback">✦</div>
          )}
        </div>
        <div className="pc-quick">Quick View</div>
      </Link>

      {/* Body */}
      <div className="pc-body">
        {product.productType && (
          <div className="pc-type">{product.productType}</div>
        )}
        <Link to={`/products/${product.handle}`} className="pc-title">
          {product.title}
        </Link>
        {product.description && (
          <p className="pc-desc">{product.description.slice(0, 72)}…</p>
        )}

        {/* Rating */}
        <div className="pc-rating">
          <span className="pc-stars">★★★★★</span>
          <span className="pc-rating-val">{rating}</span>
          <span className="pc-reviews">({reviews.toLocaleString('en-IN')})</span>
        </div>

        {/* Price row */}
        <div className="pc-price-row">
          <span className="pc-price">
            ₹{parseFloat(price?.amount || 0).toFixed(0)}
          </span>
          {compareAt?.amount && parseFloat(compareAt.amount) > parseFloat(price?.amount || 0) && (
            <span className="pc-mrp">
              ₹{parseFloat(compareAt.amount).toFixed(0)}
            </span>
          )}
        </div>

        {/* Multi-variant → Quick Add panel */}
        {hasMultiVariants && (
          <button className="pc-atc pc-atc-options" onClick={handleChooseOptions} type="button">
            Choose Options →
          </button>
        )}

        {/* Single-variant in cart → inline stepper */}
        {!hasMultiVariants && cartQty > 0 && (
          <div className="pc-stepper">
            <button type="button" className="pc-stepper-btn"
              onClick={(e) => { e.preventDefault(); updateCartLine(lineId, cartQty - 1); }}>−</button>
            <span className="pc-stepper-qty">{cartQty}</span>
            <button type="button" className="pc-stepper-btn"
              onClick={(e) => { e.preventDefault(); updateCartLine(lineId, cartQty + 1); }}>+</button>
          </div>
        )}

        {/* Single-variant not in cart → ATC */}
        {!hasMultiVariants && cartQty === 0 && (
          <button
            className={`pc-atc ${adding ? 'pc-atc-loading' : ''}`}
            onClick={handleDirectATC}
            disabled={adding || !firstVariant?.availableForSale}
            type="button"
          >
            {!firstVariant?.availableForSale ? 'Sold Out' : adding ? 'Adding…' : 'Add to Cart'}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Main Collection component ────────────────────────────── */
export default function Collection() {
  const {collection, sortKey, reverse} = useLoaderData();
  const navigate   = useNavigate();
  const [searchParams] = useSearchParams();

  const products = collection.products?.nodes || [];

  // Client-side filters
  const [maxPrice,       setMaxPrice]       = useState(5000);
  const [selectedTypes,  setSelectedTypes]  = useState([]);
  const [sidebarOpen,    setSidebarOpen]    = useState(false);

  // Unique product types in this collection
  const allTypes = useMemo(() => {
    const types = new Set(products.map((p) => p.productType).filter(Boolean));
    return [...types];
  }, [products]);

  // Apply client-side filters
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const priceOK = parseFloat(p.priceRange?.minVariantPrice?.amount || 0) <= maxPrice;
      const typeOK  = selectedTypes.length === 0 || selectedTypes.includes(p.productType);
      return priceOK && typeOK;
    });
  }, [products, maxPrice, selectedTypes]);

  function handleSort(e) {
    const val = e.target.value;
    const [key, rev] = val.split('|');
    const params = new URLSearchParams(searchParams);
    params.set('sort', key);
    params.set('reverse', rev);
    navigate(`?${params.toString()}`, {replace: true});
  }

  function toggleType(type) {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  }

  const currentSortVal = `${sortKey}|${reverse}`;

  return (
    <>
      {/* ── Collection hero header ── */}
      <div className="coll-hero">
        <div className="container">
          <nav className="breadcrumb" style={{marginBottom: 12}}>
            <Link to="/">Home</Link>
            <span className="breadcrumb-sep">›</span>
            <span>{collection.title}</span>
          </nav>
          <h1 className="coll-title">{collection.title}</h1>
          {collection.description && (
            <p className="coll-desc">{collection.description}</p>
          )}
          <div className="coll-meta">
            <span>{filtered.length} products</span>
          </div>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="container">
        <div className="coll-layout">
          {/* ── Sidebar ── */}
          <aside className={`coll-sidebar ${sidebarOpen ? 'open' : ''}`}>
            <div className="csb-head">
              <span>Filters</span>
              {(selectedTypes.length > 0 || maxPrice < 5000) && (
                <button
                  className="csb-clear"
                  onClick={() => { setSelectedTypes([]); setMaxPrice(5000); }}
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Price range */}
            <div className="csb-section">
              <h4 className="csb-label">Price Range</h4>
              <div className="csb-price-display">
                <span>₹0</span><span>Up to ₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min={100}
                max={5000}
                step={100}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="csb-range"
              />
            </div>

            {/* Product type */}
            {allTypes.length > 0 && (
              <div className="csb-section">
                <h4 className="csb-label">Product Type</h4>
                <ul className="csb-list">
                  {allTypes.map((type) => (
                    <li key={type}>
                      <label className="csb-check">
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(type)}
                          onChange={() => toggleType(type)}
                        />
                        <span>{type}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Concern tags */}
            <div className="csb-section">
              <h4 className="csb-label">Skin / Hair Concern</h4>
              <div className="csb-tags">
                {['Brightening', 'Anti-Aging', 'Hydration', 'Hair Growth', 'Scalp Care', 'Acne', 'Pigmentation'].map((c) => (
                  <span key={c} className="csb-tag">{c}</span>
                ))}
              </div>
            </div>
          </aside>

          {/* ── Product grid ── */}
          <div className="coll-main">
            {/* Toolbar */}
            <div className="coll-toolbar">
              <button
                className="coll-filter-btn"
                onClick={() => setSidebarOpen((v) => !v)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="6" x2="20" y2="6"/>
                  <line x1="8" y1="12" x2="20" y2="12"/>
                  <line x1="12" y1="18" x2="20" y2="18"/>
                </svg>
                Filters
                {(selectedTypes.length > 0 || maxPrice < 5000) && (
                  <span className="coll-filter-count">
                    {selectedTypes.length + (maxPrice < 5000 ? 1 : 0)}
                  </span>
                )}
              </button>

              <span className="coll-count">{filtered.length} products</span>

              <select
                className="coll-sort"
                value={currentSortVal}
                onChange={handleSort}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={`${o.key}|${o.reverse}`} value={`${o.key}|${o.reverse}`}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Grid */}
            {filtered.length > 0 ? (
              <div className="coll-grid">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="coll-empty">
                <p>No products match your filters.</p>
                <button onClick={() => { setSelectedTypes([]); setMaxPrice(5000); }}>
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Analytics.CollectionView
        data={{collection: {id: collection.id, handle: collection.handle}}}
      />
    </>
  );
}

/* ─── GraphQL ──────────────────────────────────────────────── */
const COLLECTION_QUERY = `#graphql
  query CollectionPage(
    $handle: String!
    $first: Int
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
  ) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(first: $first, sortKey: $sortKey, reverse: $reverse) {
        nodes {
          id
          handle
          title
          description
          productType
          tags
          featuredImage { url altText width height }
          priceRange {
            minVariantPrice { amount currencyCode }
            maxVariantPrice { amount currencyCode }
          }
          compareAtPriceRange {
            minVariantPrice { amount currencyCode }
          }
          variants(first: 3) {
            nodes {
              id
              title
              availableForSale
              price { amount currencyCode }
              compareAtPrice { amount currencyCode }
            }
          }
        }
      }
    }
  }
`;
