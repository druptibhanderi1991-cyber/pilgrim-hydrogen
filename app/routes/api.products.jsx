// Use native Response.json for Resource Routes

export async function loader({context}) {
  const {storefront} = context;

  const PRODUCTS_QUERY = `
    query getProducts {
      products(first: 12) {
        nodes {
          id
          title
          handle
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          featuredImage {
            url
            altText
          }
          variants(first: 10) {
            nodes {
              id
              title
              price {
                amount
                currencyCode
              }
              availableForSale
            }
          }
        }
      }
    }
  `;

  try {
    const {products} = await storefront.query(PRODUCTS_QUERY);
    
    // Map Shopify format to a flatter, UI-friendly format
    const formattedProducts = products.nodes.map((p) => {
      return {
        id: p.id,
        name: p.title,
        handle: p.handle,
        price: parseFloat(p.priceRange.minVariantPrice.amount),
        image: p.featuredImage?.url,
        variants: p.variants.nodes.map((v) => ({
          id: v.id,
          size: v.title,
          price: parseFloat(v.price.amount),
          available: v.availableForSale,
        })),
      };
    });

    return Response.json({products: formattedProducts});
  } catch (error) {
    console.error('Error fetching products:', error);
    return Response.json({error: 'Failed to fetch products'}, {status: 500});
  }
}
