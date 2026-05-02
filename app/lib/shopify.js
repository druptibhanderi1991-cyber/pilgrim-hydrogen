// Shopify Client API Layer
// These functions hook into the internal Remix API routes to fetch real data from Shopify.

export async function fetchProducts(category) {
  try {
    let url = '/api/products';
    if (category) {
      url += `?category=${encodeURIComponent(category)}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch products');
    const data = await res.json();
    return data.products;
  } catch (error) {
    console.error('shopify.js: Error fetching products', error);
    return [];
  }
}

// We store the cartId in localStorage so we can retrieve the same cart
function getCartId() {
  try {
    return localStorage.getItem('shopifyCartId');
  } catch (e) {
    return null;
  }
}

function setCartId(id) {
  try {
    if (id) localStorage.setItem('shopifyCartId', id);
  } catch (e) {}
}

export async function getCart() {
  const cartId = getCartId();
  if (!cartId) return { items: [], totalQuantity: 0, cost: { totalAmount: { amount: "0.0" } } };

  try {
    const res = await fetch(`/api/cart?cartId=${encodeURIComponent(cartId)}`);
    if (!res.ok) throw new Error('Failed to fetch cart');
    const data = await res.json();
    
    // Map Shopify cart data to expected UI format
    const mappedItems = data.cart?.lines?.nodes?.map(line => {
      const variant = line.merchandise;
      const product = variant.product;
      return {
        lineId: line.id,
        id: variant.id,
        baseProductId: product.id,
        name: product.title,
        handle: product.handle,
        size: variant.title !== 'Default Title' ? variant.title : null,
        price: parseFloat(variant.price.amount),
        quantity: line.quantity,
        image: variant.image?.url || null
      };
    }) || [];
    
    return {
      items: mappedItems,
      totalQuantity: data.cart?.totalQuantity || 0,
      cost: data.cart?.cost || { totalAmount: { amount: "0.0" } },
      checkoutUrl: data.cart?.checkoutUrl
    };
  } catch (error) {
    console.error('shopify.js: Error getting cart', error);
    return { items: [], totalQuantity: 0, cost: { totalAmount: { amount: "0.0" } } };
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
    if (data.cart?.id) setCartId(data.cart.id);
    return data.cart;
  } catch (error) {
    console.error('shopify.js: Error creating cart', error);
    return null;
  }
}

export async function addToCart(variantId, quantity = 1) {
  const cartId = getCartId();
  if (!cartId) {
    await createCart(variantId, quantity);
    return getCart(); // Re-fetch to return mapped format
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
    await res.json();
    return getCart(); // Re-fetch to return mapped format
  } catch (error) {
    console.error('shopify.js: Error adding to cart', error);
    return null;
  }
}

export async function updateCartLine(lineId, quantity) {
  const cartId = getCartId();
  if (!cartId) return null;

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
    await res.json();
    return getCart(); // Re-fetch mapped cart
  } catch (error) {
    console.error('shopify.js: Error updating cart quantity', error);
    return null;
  }
}

export async function removeCartLine(lineId) {
  // Removing is just updating quantity to 0
  return updateCartLine(lineId, 0);
}
