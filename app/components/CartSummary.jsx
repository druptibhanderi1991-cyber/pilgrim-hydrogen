export function CartSummary({cart, layout}) {
  const subtotal = cart?.cost?.totalAmount?.amount
    ? parseFloat(cart.cost.totalAmount.amount).toFixed(0)
    : (cart?.items || []).reduce((s, l) => s + (parseFloat(l.price) || 0) * l.quantity, 0).toFixed(0);

  const freeShippingThreshold = 699;
  const remaining = Math.max(0, freeShippingThreshold - parseFloat(subtotal));
  const pct = Math.min(100, (parseFloat(subtotal) / freeShippingThreshold) * 100);

  return (
    <div className="drawer-summary">
      {/* Free shipping progress */}
      <div className="ds-shipping">
        <div className="ds-shipping-bar">
          <div className="ds-shipping-fill" style={{width: `${pct}%`}} />
        </div>
        {remaining > 0 ? (
          <p className="ds-shipping-txt">
            Add <strong>₹{remaining.toFixed(0)}</strong> more for free delivery
          </p>
        ) : (
          <p className="ds-shipping-txt ds-shipping-done">
            🎉 You qualify for free delivery!
          </p>
        )}
      </div>

      {/* Trust badges */}
      <div className="ds-trust">
        {['100% Authentic', 'Free Returns', 'Secure Pay'].map((b) => (
          <span key={b} className="ds-trust-badge">{b}</span>
        ))}
      </div>

      {/* Subtotal row */}
      <div className="ds-total-row">
        <span>Subtotal</span>
        <strong>₹{subtotal}</strong>
      </div>
      <p className="ds-tax-note">Taxes & shipping calculated at checkout</p>

      {/* Checkout CTA */}
      {cart?.checkoutUrl && (
        <a href={cart.checkoutUrl} className="ds-checkout-btn">
          Proceed to Checkout →
        </a>
      )}

      {/* Continue shopping */}
      <div className="ds-continue">
        or{' '}
        <a href="/collections/all" className="ds-continue-link">
          continue shopping
        </a>
      </div>
    </div>
  );
}
