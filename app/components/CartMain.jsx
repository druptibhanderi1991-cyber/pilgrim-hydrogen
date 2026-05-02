import {Link} from 'react-router';
import {useAside} from '~/components/Aside';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
import {useCart} from '~/components/CartProvider';

export function CartMain({layout}) {
  const { cart, isCartLoading } = useCart();

  const linesCount = Boolean(cart?.items?.length || 0);
  const className = `cart-main`;
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;

  return (
    <section
      className={className}
      aria-label={layout === 'page' ? 'Cart page' : 'Cart drawer'}
    >
      <CartEmpty hidden={linesCount} layout={layout} isLoading={isCartLoading} />
      <div className="cart-details">
        <p id="cart-lines" className="sr-only">Line items</p>
        <div>
          <ul aria-labelledby="cart-lines">
            {(cart?.items || []).map((line) => (
              <CartLineItem
                key={line.id}
                line={line}
                layout={layout}
              />
            ))}
          </ul>
        </div>
        {cartHasItems && <CartSummary cart={cart} layout={layout} />}
      </div>
    </section>
  );
}

function CartEmpty({hidden = false, isLoading}) {
  const {close} = useAside();
  
  if (hidden) return null;
  
  if (isLoading) {
    return (
      <div>
        <br />
        <p>Loading your cart...</p>
      </div>
    );
  }

  return (
    <div>
      <br />
      <p>
        Looks like you haven&rsquo;t added anything yet, let&rsquo;s get you
        started!
      </p>
      <br />
      <Link to="/" onClick={close} prefetch="viewport">
        Continue shopping →
      </Link>
    </div>
  );
}
