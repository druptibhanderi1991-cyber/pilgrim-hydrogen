// Shopify Client API Layer
// All cart mutations return the full updated cart directly — no second GET needed.

export async function fetchProducts(category) {
  try {
    let url = '/api/products';
    if (category) url += `?category=${encodeURIComponent(category)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch products');
    const data = await res.json();
    return data.products;
  } catch (error) {
    console.error('shopify.js: Error fetching products', error);
    return [];
  }
}

/* ── Cart ID persistence (localStorage) ──────────────────── */
function getCartId() {
  try { return localStorage.getItem('shopifyCartId'); } catch { return null; }
}
function setCartId(id) {
  try { if (id) localStorage.setItem('shopifyCartId', id); } catch {}
}

/* ── Cart shape mapper ────────────────────────────────────── */
// Converts raw Shopify GraphQL cart → UI-friendly shape.
// Used after every mutation so we never need a follow-up GET.
function parseCart(rawCart) {
  if (!rawCart) return { items: [], totalQuantity: 0, cost: { totalAmount: { amount: '0.0' } } };

  const items = (rawCart.lines?.nodes || []).map((line) => {
    const variant = line.merchandise;
    const product = variant?.product || {};
    return {
      lineId:       line.id,
      id:           variant?.id,
      baseProductId: product.id,
      name:         product.title,
      handle:       product.handle,
      size:         variant?.title !== 'Default Title' ? variant?.title : null,
      price:        parseFloat(variant?.price?.amount || 0),
      quantity:     line.quantity,
      image:        variant?.image?.url || null,
    };
  });

  return {
    items,
    totalQuantity: rawCart.totalQuantity || 0,
    cost:         rawCart.cost || { totalAmount: { amount: '0.0' } },
    checkoutUrl:  rawCart.checkoutUrl,
  };
}

/* ── GET cart (initial page load only) ───────────────────── */
export async function getCart() {
  const cartId = getCartId();
  if (!cartId) return parseCart(null);

  try {
    const res = await fetch(`/api/cart?cartId=${encodeURIComponent(cartId)}`);
    if (!res.ok) throw new Error('Failed to fetch cart');
    const data = await res.json();
    return parseCart(data.cart);
  } catch (error) {
    console.error('shopify.js: getCart error', error);
    return parseCart(null);
  }
}

/* ── Add to cart (create or append) ─────────────────────── */
export async function addToCart(variantId, quantity = 1) {
  const cartId = getCartId();

  try {
    let endpoint, body;

    if (!cartId) {
      body = { actionType: 'createCart', variantId, quantity };
    } else {
      body = { actionType: 'addToCart', cartId, variantId, quantity };
    }

    const res = await fetch('/api/cart', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Failed to add to cart');

    const data = await res.json();
    const rawCart = data.cart;
    if (rawCart?.id) setCartId(rawCart.id);
    return parseCart(rawCart);
  } catch (error) {
    console.error('shopify.js: addToCart error', error);
    return null;
  }
}

/* ── Update quantity ─────────────────────────────────────── */
export async function updateCartLine(lineId, quantity) {
  const cartId = getCartId();
  if (!cartId) return null;

  try {
    const res = await fetch('/api/cart', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ actionType: 'updateQuantity', cartId, lineId, quantity }),
    });
    if (!res.ok) throw new Error('Failed to update cart');
    const data = await res.json();
    return parseCart(data.cart);
  } catch (error) {
    console.error('shopify.js: updateCartLine error', error);
    return null;
  }
}

/* ── Remove line (quantity → 0) ─────────────────────────── */
export async function removeCartLine(lineId) {
  return updateCartLine(lineId, 0);
}
