import {Link} from 'react-router';
import {Money} from '@shopify/hydrogen';
import {useCart} from '~/components/CartProvider';

export const meta = () => [{title: 'Vaidhacharya — Your Bag'}];

export default function CartPage() {
  const {cart, updateCartLine, removeCartLine, isCartLoading} = useCart();
  const lines = cart?.lines?.nodes || [];
  const subtotal = cart?.cost?.subtotalAmount;
  const total    = cart?.cost?.totalAmount;
  const checkoutUrl = cart?.checkoutUrl;

  if (lines.length === 0) {
    return (
      <div className="cart-page">
        <div className="page-header">
          <div className="container">
            <h1 className="page-title">Your <em>bag</em></h1>
          </div>
        </div>
        <div className="container" style={{padding: '80px 32px', textAlign: 'center'}}>
          <div className="cart-empty-icon">◯</div>
          <h2 style={{fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 400, margin: '12px 0 10px'}}>Your bag is empty</h2>
          <p style={{color: 'var(--muted)', marginBottom: 32}}>Discover our Ayurvedic formulas and start your ritual.</p>
          <Link to="/collections/all" className="btn btn-moss">
            Shop all products <span className="arrow">→</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Your <em>bag</em></h1>
          <p className="page-sub">{lines.length} item{lines.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="container">
        <div className="cart-grid">
          {/* Items */}
          <div className="cart-items">
            {subtotal && parseFloat(subtotal.amount) < 499 && (
              <div className="cart-shipping-bar">
                <div className="cart-shipping-bar-fill" style={{width: `${(parseFloat(subtotal.amount)/499)*100}%`}}/>
                <p style={{position:'relative',zIndex:1,fontSize:13}}>
                  Add <strong>₹{(499 - parseFloat(subtotal.amount)).toFixed(0)}</strong> more for free shipping
                </p>
              </div>
            )}
            {subtotal && parseFloat(subtotal.amount) >= 499 && (
              <div className="cart-free-shipping">✓ You've unlocked free shipping!</div>
            )}

            {lines.map(line => {
              const {id, quantity, merchandise} = line;
              const {product, title: variantTitle, image, price} = merchandise;
              return (
                <div key={id} className="cart-item">
                  <Link to={`/products/${product.handle}`} className="cart-item-img">
                    {image?.url
                      ? <img src={image.url} alt={image.altText||product.title} style={{width:'100%',height:'100%',objectFit:'contain',padding:8}}/>
                      : <div style={{fontSize:28,display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:'var(--moss)',opacity:0.25}}>✦</div>
                    }
                  </Link>
                  <div className="cart-item-info">
                    <div className="cart-item-cat">{product.productType || 'Ayurvedic'}</div>
                    <Link to={`/products/${product.handle}`} className="cart-item-name">{product.title}</Link>
                    {variantTitle !== 'Default Title' && (
                      <div className="cart-item-vol">{variantTitle}</div>
                    )}
                  </div>
                  <div className="cart-item-right">
                    <div className="cart-item-price">
                      <Money data={{amount: String(parseFloat(price.amount) * quantity), currencyCode: price.currencyCode}} />
                    </div>
                    <div className="cart-item-qty">
                      <button onClick={() => quantity > 1 ? updateCartLine(id, quantity - 1) : removeCartLine(id)}>−</button>
                      <span>{quantity}</span>
                      <button onClick={() => updateCartLine(id, quantity + 1)}>+</button>
                    </div>
                    <button className="cart-item-remove" onClick={() => removeCartLine(id)}>
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <h3 className="cart-summary-title">Order summary</h3>
            <div className="cart-summary-rows">
              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span>{subtotal ? <Money data={subtotal} /> : '—'}</span>
              </div>
              <div className="cart-summary-row">
                <span>Shipping</span>
                <span>{subtotal && parseFloat(subtotal.amount) >= 499
                  ? <span style={{color:'var(--moss)'}}>Free</span>
                  : '₹79'
                }</span>
              </div>
            </div>
            <div className="cart-summary-total">
              <span>Total</span>
              <span>{total ? <Money data={total} /> : '—'}</span>
            </div>
            <p className="cart-summary-tax">Inclusive of all taxes</p>

            {checkoutUrl && (
              <a href={checkoutUrl} className="cart-checkout-btn" style={{textDecoration:'none'}}>
                {isCartLoading ? 'Updating…' : 'Proceed to checkout →'}
              </a>
            )}

            <div className="cart-trust" style={{marginTop:16}}>
              {[
                {icon:'🔒', text:'Secure Shopify checkout'},
                {icon:'↩', text:'30-day returns'},
                {icon:'🚚', text:'Fast delivery across India'},
              ].map(t => (
                <div key={t.text} className="cart-trust-item">
                  <span>{t.icon}</span>{t.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
