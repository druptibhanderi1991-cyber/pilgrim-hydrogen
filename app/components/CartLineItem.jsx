import {Link} from 'react-router';
import {useCart} from '~/components/CartProvider';
import {Image} from '@shopify/hydrogen';

export function CartLineItem({line, layout}) {
  const { updateCartLine, removeCartLine, isCartLoading } = useCart();

  if (!line?.id) return null;

  return (
    <li key={line.id} className="cart-line">
      <div className="cart-line-inner">
        {line.image && (
          <Image
            alt={line.title}
            data={{url: line.image, altText: line.title}}
            height={100}
            width={100}
            loading="lazy"
          />
        )}

        <div>
          <Link
            prefetch="intent"
            to={`/product/${line.baseProductId}`} // Using ID here as handle might not be available
            onClick={() => {
              if (layout === 'aside') {
                window.location.href = `/product/${line.baseProductId}`;
              }
            }}
          >
            <p><strong>{line.title}</strong></p>
          </Link>
          <p className="small" style={{ opacity: 0.7 }}>{line.variantTitle !== 'Default Title' ? line.variantTitle : ''}</p>
          
          <div className="cart-line-quantity" style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div className="quantity-selector-styled" style={{ opacity: isCartLoading ? 0.5 : 1 }}>
              <button 
                disabled={isCartLoading || line.quantity <= 1}
                onClick={() => updateCartLine(line.id, line.quantity - 1)}
              >
                -
              </button>
              <span>{line.quantity}</span>
              <button 
                disabled={isCartLoading}
                onClick={() => updateCartLine(line.id, line.quantity + 1)}
              >
                +
              </button>
            </div>
            
            <button
              onClick={() => removeCartLine(line.id)}
              disabled={isCartLoading}
              style={{ background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}
            >
              Remove
            </button>
          </div>
        </div>
        
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <p>₹{line.price}</p>
        </div>
      </div>
    </li>
  );
}
