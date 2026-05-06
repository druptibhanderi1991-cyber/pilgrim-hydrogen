import {Link} from 'react-router';
import {useAside} from '~/components/Aside';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
import {useCart} from '~/components/CartProvider';

export function CartMain({layout}) {
  const {cart, isCartLoading} = useCart();
  const {close} = useAside();

  const items    = cart?.items || [];
  const hasItems = items.length > 0;

  /* ── Empty / loading ─────────────────────────────────── */
  if (isCartLoading && !hasItems) {
    return (
      <section className="drawer-cart" aria-label="Cart drawer">
        <div className="drawer-loading">
          <span className="drawer-loading-spin" />
        </div>
      </section>
    );
  }

  if (!hasItems) {
    return (
      <section className="drawer-cart" aria-label="Cart drawer">
        <div className="drawer-empty">
          <div className="drawer-empty-icon">
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </div>
          <h3>Your bag is empty</h3>
          <p>Discover our pure Ayurvedic formulas</p>
          <Link to="/collections/all" className="drawer-shop-btn" onClick={close}>
            Shop now →
          </Link>
        </div>
      </section>
    );
  }

  /* ── Items ───────────────────────────────────────────── */
  return (
    <section className="drawer-cart" aria-label="Cart drawer">
      <div className="drawer-lines">
        <ul>
          {items.map((line, i) => (
            <CartLineItem key={line.lineId || line.id} line={line} index={i} />
          ))}
        </ul>
      </div>

      <CartSummary cart={cart} layout={layout} />
    </section>
  );
}
