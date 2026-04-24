// Use native Response.json for Resource Routes

const CART_FRAGMENT = `
  fragment CartFragment on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      totalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 50) {
      nodes {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            price {
              amount
              currencyCode
            }
            image {
              url
            }
            product {
              id
              title
              handle
            }
          }
        }
      }
    }
  }
`;

const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        ...CartFragment
      }
    }
  }
  ${CART_FRAGMENT}
`;

const CART_ADD_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFragment
      }
    }
  }
  ${CART_FRAGMENT}
`;

const CART_UPDATE_MUTATION = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFragment
      }
    }
  }
  ${CART_FRAGMENT}
`;

const CART_REMOVE_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFragment
      }
    }
  }
  ${CART_FRAGMENT}
`;

const CART_QUERY = `
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFragment
    }
  }
  ${CART_FRAGMENT}
`;

// GET method for fetching cart state
export async function loader({request, context}) {
  const url = new URL(request.url);
  const cartId = url.searchParams.get('cartId');

  if (!cartId) {
    return Response.json({error: 'Cart ID is required'}, {status: 400});
  }

  try {
    const {cart} = await context.storefront.query(CART_QUERY, {
      variables: {cartId},
    });
    return Response.json({cart});
  } catch (error) {
    return Response.json({error: 'Failed to fetch cart'}, {status: 500});
  }
}

// POST method for mutations
export async function action({request, context}) {
  const {storefront} = context;
  const body = await request.json();
  const {actionType, cartId, variantId, quantity, lineId} = body;

  try {
    if (actionType === 'createCart') {
      const {cartCreate} = await storefront.mutate(CART_CREATE_MUTATION, {
        variables: {
          input: {
            lines: [{merchandiseId: variantId, quantity}],
          },
        },
      });
      return Response.json({cart: cartCreate.cart});
    }

    if (actionType === 'addToCart') {
      const {cartLinesAdd} = await storefront.mutate(CART_ADD_MUTATION, {
        variables: {
          cartId,
          lines: [{merchandiseId: variantId, quantity}],
        },
      });
      return Response.json({cart: cartLinesAdd.cart});
    }

    if (actionType === 'updateQuantity') {
      if (quantity === 0) {
        // Remove item
        const {cartLinesRemove} = await storefront.mutate(CART_REMOVE_MUTATION, {
          variables: {
            cartId,
            lineIds: [lineId],
          },
        });
        return Response.json({cart: cartLinesRemove.cart});
      } else {
        // Update item
        const {cartLinesUpdate} = await storefront.mutate(CART_UPDATE_MUTATION, {
          variables: {
            cartId,
            lines: [{id: lineId, quantity}],
          },
        });
        return Response.json({cart: cartLinesUpdate.cart});
      }
    }

    return Response.json({error: 'Invalid actionType'}, {status: 400});
  } catch (error) {
    console.error('Cart mutation error:', error);
    return Response.json({error: 'Cart mutation failed'}, {status: 500});
  }
}
