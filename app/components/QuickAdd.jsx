import {useState} from 'react';
import {Link} from 'react-router';
import {useQuickAdd} from '~/components/QuickAddContext';
import {useCart} from '~/components/CartProvider';
import {useAside} from '~/components/Aside';

function stableRating(id = '') {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return (4.4 + (h % 7) * 0.1).toFixed(1);
}

export function QuickAddPanel() {
  const {product} = useQuickAdd();
  const {addToCart, addingVariants} = useCart();
  const {open} = useAside();

  const [selectedId, setSelectedId] = useState(null);
  const [added, setAdded]           = useState(false);

  if (!product) return <div className="qa-empty" />;

  const variants       = product.variants?.nodes || [];
  const activeId       = selectedId || variants[0]?.id;
  const activeVariant  = variants.find((v) => v.id === activeId) || variants[0];
  const adding         = addingVariants.has(activeId);

  const price     = activeVariant?.price;
  const compareAt = activeVariant?.compareAtPrice;
  const discount  = compareAt?.amount && parseFloat(compareAt.amount) > parseFloat(price?.amount || 0)
    ? Math.round(((parseFloat(compareAt.amount) - parseFloat(price.amount)) / parseFloat(compareAt.amount)) * 100)
    : 0;
  const rating = stableRating(product.id);

  function handleAdd() {
    if (!activeId || adding) return;
    // Fire add, then immediately swap to cart drawer
    addToCart(activeId, 1);
    setAdded(true);
    setTimeout(() => {
      open('cart');
      setAdded(false);
      setSelectedId(null);
    }, 280);
  }

  return (
    <div className="qa-panel">
      {/* Product summary */}
      <div className="qa-product">
        <div className="qa-img">
          {product.featuredImage?.url
            ? <img src={product.featuredImage.url} alt={product.featuredImage.altText || product.title} />
            : <div className="qa-img-fallback">✦</div>
          }
        </div>
        <div className="qa-meta">
          {product.productType && <div className="qa-type">{product.productType}</div>}
          <Link to={`/products/${product.handle}`} className="qa-title">{product.title}</Link>
          <div className="qa-stars">
            {'★'.repeat(5)}
            <span className="qa-rating-val">{rating}</span>
          </div>
          <div className="qa-price-row">
            <span className="qa-price">₹{parseFloat(price?.amount || 0).toFixed(0)}</span>
            {compareAt?.amount && parseFloat(compareAt.amount) > parseFloat(price?.amount || 0) && (
              <>
                <span className="qa-mrp">₹{parseFloat(compareAt.amount).toFixed(0)}</span>
                {discount > 0 && <span className="qa-disc">{discount}% off</span>}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Variant chips */}
      {variants.length > 1 && (
        <div className="qa-variants">
          <p className="qa-variants-label">Select Size / Variant</p>
          <div className="qa-chips">
            {variants.map((v) => {
              const vDiscount = v.compareAtPrice?.amount && parseFloat(v.compareAtPrice.amount) > parseFloat(v.price?.amount || 0)
                ? Math.round(((parseFloat(v.compareAtPrice.amount) - parseFloat(v.price.amount)) / parseFloat(v.compareAtPrice.amount)) * 100)
                : 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  className={`qa-chip ${activeId === v.id ? 'qa-chip--active' : ''} ${!v.availableForSale ? 'qa-chip--oos' : ''}`}
                  onClick={() => { setSelectedId(v.id); setAdded(false); }}
                  disabled={!v.availableForSale}
                >
                  <span className="qa-chip-title">{v.title}</span>
                  <span className="qa-chip-price">₹{parseFloat(v.price?.amount || 0).toFixed(0)}</span>
                  {vDiscount >= 5 && <span className="qa-chip-badge">{vDiscount}%</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ATC */}
      <button
        type="button"
        className={`qa-atc-btn ${adding ? 'qa-atc-btn--loading' : ''} ${added ? 'qa-atc-btn--done' : ''}`}
        onClick={handleAdd}
        disabled={adding || added || !activeVariant?.availableForSale}
      >
        {!activeVariant?.availableForSale
          ? 'Sold Out'
          : added
          ? '✓ Added — Opening Cart…'
          : adding
          ? 'Adding…'
          : '🛒 Add to Cart'}
      </button>

      <Link to={`/products/${product.handle}`} className="qa-pdp-link">
        View full product details →
      </Link>
    </div>
  );
}
