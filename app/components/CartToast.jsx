import {useCart} from '~/components/CartProvider';

export function CartToast() {
  const {toast} = useCart();

  return (
    <div className={`cart-toast ${toast.visible ? 'cart-toast--visible' : ''}`} aria-live="polite">
      <span className="cart-toast-check">✓</span>
      <span>{toast.message}</span>
    </div>
  );
}
