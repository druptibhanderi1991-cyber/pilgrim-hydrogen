// Use native Response.json for Resource Routes

export async function loader({request, context}) {
  const {storefront} = context;
  const url = new URL(request.url);
  const category = url.searchParams.get('category');

  // Build the search query
  let searchQuery = '';
  if (category && category !== 'Top Picks for You' && category !== 'Bestsellers') {
    // We filter by title as a fallback since tags aren't set up yet
    // E.g., 'Skin Care' -> title:Skin OR title:Care
    const keywords = category.split(' ').filter(w => w.length > 2);
    searchQuery = keywords.map(w => `title:${w}`).join(' OR ');
  }

  const PRODUCTS_QUERY = `
    query getProducts($query: String) {
      products(first: 12, query: $query) {
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
          compareAtPriceRange {
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
              compareAtPrice {
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
    let {products} = await storefront.query(PRODUCTS_QUERY, {
      variables: { query: searchQuery ? searchQuery : null }
    });

    // Fallback: If strict category filtering returns 0 products, fetch all products
    if (products.nodes.length === 0 && searchQuery) {
       const allProducts = await storefront.query(PRODUCTS_QUERY, { variables: { query: null } });
       products = allProducts.products;
    }
    
    // Deterministic UI fallbacks based on ID string
    const getDeterministicFallback = (id, type) => {
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
      }
      hash = Math.abs(hash);

      if (type === 'badge') {
        const badges = ['Bestseller', 'Selling Fast', '#1 Choice', 'Trending'];
        return badges[hash % badges.length];
      }
      if (type === 'rating') {
        return (4.5 + (hash % 5) * 0.1).toFixed(1); // 4.5 to 4.9
      }
      if (type === 'reviews') {
        return 120 + (hash % 800); // 120 to 920
      }
      if (type === 'subtitle') {
        const subtitles = [
          'Glow from within',
          'Deeply nourishing formula',
          'Restore your natural radiance',
          'Essential daily care'
        ];
        return subtitles[hash % subtitles.length];
      }
      return null;
    };

    // Map Shopify format to a flatter, UI-friendly format
    const formattedProducts = products.nodes.map((p) => {
      const minPrice = parseFloat(p.priceRange.minVariantPrice.amount);
      let compareAtPrice = parseFloat(p.compareAtPriceRange?.minVariantPrice?.amount || '0');
      
      // If no compareAtPrice in Shopify, deterministically generate one for the demo UI
      if (!compareAtPrice || compareAtPrice <= minPrice) {
         compareAtPrice = Math.round(minPrice * 1.25); // 25% markup
      }

      const discountPercentage = Math.round(((compareAtPrice - minPrice) / compareAtPrice) * 100);

      return {
        id: p.id,
        name: p.title,
        handle: p.handle,
        subtitle: getDeterministicFallback(p.id, 'subtitle'),
        badge: getDeterministicFallback(p.id, 'badge'),
        rating: getDeterministicFallback(p.id, 'rating'),
        reviews: getDeterministicFallback(p.id, 'reviews'),
        price: minPrice,
        compareAtPrice: compareAtPrice,
        discountPercentage: discountPercentage > 0 ? discountPercentage : null,
        image: p.featuredImage?.url,
        variants: p.variants.nodes.map((v) => ({
          id: v.id,
          size: v.title,
          price: parseFloat(v.price.amount),
          compareAtPrice: parseFloat(v.compareAtPrice?.amount || '0'),
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
