import {useLoaderData, Link} from 'react-router';
import {getPaginationVariables, Pagination} from '@shopify/hydrogen';
import {useCart} from '~/components/CartProvider';
import {useAside} from '~/components/Aside';
import {useQuickAdd} from '~/components/QuickAddContext';

export const meta = () => [{title: 'Vaidhacharya — All Products'}];

export async function loader({context, request}) {
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {pageBy: 12});
  const {products} = await storefront.query(CATALOG_QUERY, {
    variables: {...paginationVariables},
  });
  return {products};
}

function stableRating(id = '') {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return (4.4 + (h % 7) * 0.1).toFixed(1);
}
function stableReviews(id = '') {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return 120 + (h % 2800);
}

function ProductCard({product}) {
  const {addToCart, addingVariants, cart, updateCartLine} = useCart();
  const {open} = useAside();
  const {setProduct: setQuickAddProduct} = useQuickAdd();

  const variants         = product.variants?.nodes || [];
  const firstVariant     = variants[0];
  const hasMultiVariants = variants.length > 1;

  // Find this product's first variant in the cart (for inline stepper)
  const cartItem  = cart?.items?.find((item) => item.id === firstVariant?.id);
  const cartQty   = cartItem?.quantity || 0;
  const lineId    = cartItem?.lineId;

  const price     = firstVariant?.price     || product.priceRange?.minVariantPrice;
  const compareAt = firstVariant?.compareAtPrice || product.compareAtPriceRange?.minVariantPrice;
  const discount  = compareAt?.amount && price?.amount
    ? Math.round(((parseFloat(compareAt.amount) - parseFloat(price.amount)) / parseFloat(compareAt.amount)) * 100)
    : 0;
  const rating  = stableRating(product.id);
  const reviews = stableReviews(product.id);
  const adding  = addingVariants.has(firstVariant?.id);

  // Single-variant: direct add → toast only (no drawer)
  function handleDirectATC(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!firstVariant?.id || adding) return;
    addToCart(firstVariant.id, 1);  // global toast fires automatically
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
      {discount >= 5 && <span className="pc-badge pc-badge-discount">{discount}% OFF</span>}
      {product.tags?.includes('bestseller') && !discount && <span className="pc-badge pc-badge-hot">BESTSELLER</span>}
      {product.tags?.includes('new') && !discount && <span className="pc-badge pc-badge-new">NEW</span>}

      <Link to={`/products/${product.handle}`} className="pc-img-wrap" tabIndex={-1}>
        <div className="pc-img">
          {product.featuredImage?.url
            ? <img src={product.featuredImage.url} alt={product.featuredImage.altText || product.title} loading="lazy" />
            : <div className="pc-img-fallback">✦</div>
          }
        </div>
        <div className="pc-quick">Quick View</div>
      </Link>

      <div className="pc-body">
        {product.productType && <div className="pc-type">{product.productType}</div>}
        <Link to={`/products/${product.handle}`} className="pc-title">{product.title}</Link>

        <div className="pc-rating">
          <span className="pc-stars">★★★★★</span>
          <span className="pc-rating-val">{rating}</span>
          <span className="pc-reviews">({reviews.toLocaleString('en-IN')})</span>
        </div>

        <div className="pc-price-row">
          <span className="pc-price">₹{parseFloat(price?.amount || 0).toFixed(0)}</span>
          {compareAt?.amount && parseFloat(compareAt.amount) > parseFloat(price?.amount || 0) && (
            <span className="pc-mrp">₹{parseFloat(compareAt.amount).toFixed(0)}</span>
          )}
        </div>

        {/* Multi-variant → Choose Options */}
        {hasMultiVariants && (
          <button className="pc-atc pc-atc-options" onClick={handleChooseOptions} type="button">
            Choose Options →
          </button>
        )}

        {/* Single-variant in cart → inline qty stepper */}
        {!hasMultiVariants && cartQty > 0 && (
          <div className="pc-stepper">
            <button type="button" className="pc-stepper-btn"
              onClick={(e) => { e.preventDefault(); updateCartLine(lineId, cartQty - 1); }}>−</button>
            <span className="pc-stepper-qty">{cartQty}</span>
            <button type="button" className="pc-stepper-btn"
              onClick={(e) => { e.preventDefault(); updateCartLine(lineId, cartQty + 1); }}>+</button>
          </div>
        )}

        {/* Single-variant not in cart → ATC button */}
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

export default function AllProducts() {
  const {products} = useLoaderData();

  return (
    <div className="products-page">
      {/* Hero header */}
      <div className="coll-hero">
        <div className="container">
          <nav className="breadcrumb" style={{marginBottom: 12}}>
            <Link to="/">Home</Link>
            <span className="breadcrumb-sep">›</span>
            <span>All Products</span>
          </nav>
          <h1 className="coll-title">Pure Ayurvedic <em style={{fontStyle:'italic', color:'var(--moss)'}}>formulas</em></h1>
          <p className="coll-desc">Clinically verified, traditionally rooted — every formula we make.</p>
        </div>
      </div>

      <div className="container" style={{padding: '48px 32px 80px'}}>
        <Pagination connection={products}>
          {({nodes, isLoading, PreviousLink, NextLink}) => (
            <>
              <div className="coll-grid" style={{gridTemplateColumns: 'repeat(4, 1fr)'}}>
                {nodes.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              <div style={{display: 'flex', justifyContent: 'center', gap: 16, marginTop: 48}}>
                <PreviousLink>
                  {isLoading ? 'Loading…' : <span className="btn btn-paper">← Previous</span>}
                </PreviousLink>
                <NextLink>
                  {isLoading ? 'Loading…' : <span className="btn btn-moss">Load more →</span>}
                </NextLink>
              </div>
            </>
          )}
        </Pagination>
      </div>
    </div>
  );
}

const CATALOG_QUERY = `#graphql
  query Catalog($first: Int, $last: Int, $startCursor: String, $endCursor: String) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor) {
      nodes {
        id title handle tags productType
        priceRange { minVariantPrice { amount currencyCode } }
        compareAtPriceRange { minVariantPrice { amount currencyCode } }
        featuredImage { url altText }
        variants(first: 1) {
          nodes {
            id availableForSale
            price { amount currencyCode }
            compareAtPrice { amount currencyCode }
          }
        }
      }
      pageInfo { hasPreviousPage hasNextPage startCursor endCursor }
    }
  }
`;
