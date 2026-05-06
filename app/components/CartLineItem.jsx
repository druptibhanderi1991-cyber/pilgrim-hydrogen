import {Link} from 'react-router';
import {useCart} from '~/components/CartProvider';

export function CartLineItem({line, index = 0}) {
  const {updateCartLine, removeCartLine, pendingLines} = useCart();

  if (!line) return null;

  const lineId     = line.lineId || line.id;
  const isUpdating = pendingLines.has(lineId);
  const price      = typeof line.price === 'number' ? line.price : parseFloat(line.price || 0);
  const totalPrice = price * line.quantity;

  return (
    <li
      className={`dl-item ${isUpdating ? 'dl-item--updating' : ''}`}
      style={{'--i': index}}
    >
      {/* Spinner overlay while this line mutates */}
      {isUpdating && <div className="dl-spinner-overlay"><span className="dl-spin" /></div>}

      {/* Image */}
      <div className="dl-img">
        {line.image
          ? <img src={line.image} alt={line.name} loading="lazy" />
          : <div className="dl-img-placeholder">✦</div>
        }
      </div>

      {/* Info */}
      <div className="dl-info">
        <Link to={`/products/${line.handle}`} className="dl-name">
          {line.name}
        </Link>
        {line.size && <div className="dl-variant">{line.size}</div>}

        <div className="dl-row">
          {/* Quantity stepper */}
          <div className="dl-qty">
            <button
              className="dl-qty-btn"
              disabled={isUpdating || line.quantity <= 1}
              onClick={() => updateCartLine(lineId, line.quantity - 1)}
              aria-label="Decrease quantity"
              type="button"
            >−</button>
            <span className="dl-qty-val">{line.quantity}</span>
            <button
              className="dl-qty-btn"
              disabled={isUpdating}
              onClick={() => updateCartLine(lineId, line.quantity + 1)}
              aria-label="Increase quantity"
              type="button"
            >+</button>
          </div>

          {/* Line total */}
          <div className="dl-price">₹{totalPrice.toFixed(0)}</div>
        </div>

        <button
          className="dl-remove"
          disabled={isUpdating}
          onClick={() => removeCartLine(lineId)}
          type="button"
        >
          {isUpdating ? 'Removing…' : 'Remove'}
        </button>
      </div>
    </li>
  );
}
