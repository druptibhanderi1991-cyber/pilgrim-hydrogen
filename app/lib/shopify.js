// Shopify Client API Layer
// This file cleanly separates all data fetching logic to hit our internal /api endpoints.

export async function fetchProducts() {
  try {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error('Failed to fetch products');
    const data = await res.json();
    return data.products;
  } catch (error) {
    console.error('shopify.js: Error fetching products', error);
    return [];
  }
}

export async function getCart(cartId) {
  try {
    const res = await fetch(`/api/cart?cartId=${encodeURIComponent(cartId)}`);
    if (!res.ok) throw new Error('Failed to fetch cart');
    const data = await res.json();
    return data.cart;
  } catch (error) {
    console.error('shopify.js: Error getting cart', error);
    return null;
  }
}

export async function createCart(variantId, quantity = 1) {
  try {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actionType: 'createCart',
        variantId,
        quantity
      }),
    });
    if (!res.ok) throw new Error('Failed to create cart');
    const data = await res.json();
    return data.cart;
  } catch (error) {
    console.error('shopify.js: Error creating cart', error);
    return null;
  }
}

export async function addToCart(cartId, variantId, quantity = 1) {
  if (!cartId) {
    return createCart(variantId, quantity);
  }

  try {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actionType: 'addToCart',
        cartId,
        variantId,
        quantity
      }),
    });
    if (!res.ok) throw new Error('Failed to add to cart');
    const data = await res.json();
    return data.cart;
  } catch (error) {
    console.error('shopify.js: Error adding to cart', error);
    return null;
  }
}

export async function updateCartQuantity(cartId, lineId, quantity) {
  try {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actionType: 'updateQuantity',
        cartId,
        lineId,
        quantity
      }),
    });
    if (!res.ok) throw new Error('Failed to update cart quantity');
    const data = await res.json();
    return data.cart;
  } catch (error) {
    console.error('shopify.js: Error updating cart quantity', error);
    return null;
  }
}
