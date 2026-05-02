import {Suspense} from 'react';
import {useAside} from '~/components/Aside';

export function CartSummary({cart, layout}) {
  const className =
    layout === 'page' ? 'cart-summary-page' : 'cart-summary-aside';

  return (
    <div aria-labelledby="cart-summary" className={className}>
      <h4 style={{ margin: '1rem 0 0.5rem' }}>Totals</h4>
      <dl className="cart-subtotal">
        <dt>Subtotal</dt>
        <dd style={{ marginLeft: 'auto' }}>
          ₹{cart.subtotal || 0}
        </dd>
      </dl>
      <p className="small" style={{ opacity: 0.7, margin: '0.5rem 0' }}>
        Taxes and shipping calculated at checkout
      </p>
      
      <div style={{ marginTop: '1rem' }}>
        <CartCheckoutActions checkoutUrl={cart.checkoutUrl} />
      </div>
    </div>
  );
}

function CartCheckoutActions({checkoutUrl}) {
  if (!checkoutUrl) return null;

  return (
    <a href={checkoutUrl} target="_self">
      <button style={{ width: '100%', padding: '15px', background: '#000', color: '#fff', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
        Continue to Checkout
      </button>
    </a>
  );
}
