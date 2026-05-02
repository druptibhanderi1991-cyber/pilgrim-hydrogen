import {useLoaderData, Link} from 'react-router';
import {getPaginationVariables, Pagination, Money} from '@shopify/hydrogen';
import {useCart} from '~/components/CartProvider';

export const meta = () => [{title: 'Vaidhacharya — All Products'}];

export async function loader({context, request}) {
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {pageBy: 12});

  const {products} = await storefront.query(CATALOG_QUERY, {
    variables: {...paginationVariables},
  });
  return {products};
}

function getBadge(tags = []) {
  if (tags.includes('bestseller')) return {label: 'BESTSELLER', type: 'hot'};
  if (tags.includes('new'))        return {label: 'NEW', type: 'new'};
  if (tags.includes('viral'))      return {label: 'VIRAL', type: 'viral'};
  return {label: 'AYURVEDIC', type: 'new'};
}

function ProductCard({product}) {
  const {addToCart} = useCart();
  const badge = getBadge(product.tags);
  const variant = product.variants?.nodes?.[0];

  function handleAdd(e) {
    e.preventDefault();
    if (variant?.id) addToCart(variant.id, 1);
  }

  return (
    <Link to={`/products/${product.handle}`} className="product-card">
      <div className="product-img" style={{background: 'linear-gradient(160deg,#e8c89122,#e8c89155)'}}>
        <span className={`product-pill ${badge.type}`}>{badge.label}</span>
        {product.featuredImage?.url ? (
          <img
            src={product.featuredImage.url}
            alt={product.featuredImage.altText || product.title}
            style={{width: '100%', height: '100%', objectFit: 'contain', padding: 16}}
            loading="lazy"
          />
        ) : (
          <div style={{fontSize: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--moss)', opacity: 0.3}}>✦</div>
        )}
        {variant?.availableForSale && (
          <button className="product-quick" onClick={handleAdd}>
            Add to bag <span>+</span>
          </button>
        )}
        {!variant?.availableForSale && (
          <button className="product-quick" style={{opacity: 0.5, cursor: 'not-allowed'}} onClick={e => e.preventDefault()}>
            Sold out
          </button>
        )}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.title}</h3>
        <div className="product-row">
          <span className="product-price">
            <Money data={product.priceRange.minVariantPrice} />
            {product.compareAtPriceRange?.minVariantPrice?.amount > 0 && (
              <span className="product-mrp">
                <Money data={product.compareAtPriceRange.minVariantPrice} />
              </span>
            )}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function AllProducts() {
  const {products} = useLoaderData();

  return (
    <div className="products-page">
      <div className="page-header">
        <div className="container">
          <span className="eyebrow" style={{color: 'var(--sand)'}}>All Products</span>
          <h1 className="page-title">Pure Ayurvedic <em>formulas</em></h1>
          <p className="page-sub">Clinically verified, traditionally rooted — every formula we make.</p>
        </div>
      </div>

      <div className="container" style={{padding: '48px 32px 80px'}}>
        <Pagination connection={products}>
          {({nodes, isLoading, PreviousLink, NextLink}) => (
            <>
              <div className="product-grid">
                {nodes.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
              <div style={{display: 'flex', justifyContent: 'center', gap: 16, marginTop: 48}}>
                <PreviousLink>
                  {isLoading ? 'Loading…' : <span className="btn btn-paper">← Previous</span>}
                </PreviousLink>
                <NextLink>
                  {isLoading ? 'Loading…' : <span className="btn btn-moss">Load more →</span>}
                </NextLink>
              </div>
            </>
          )}
        </Pagination>
      </div>
    </div>
  );
}

const CATALOG_QUERY = `#graphql
  query Catalog($first: Int, $last: Int, $startCursor: String, $endCursor: String) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor) {
      nodes {
        id title handle tags
        priceRange { minVariantPrice { amount currencyCode } }
        compareAtPriceRange { minVariantPrice { amount currencyCode } }
        featuredImage { url altText }
        variants(first: 1) { nodes { id availableForSale } }
      }
      pageInfo { hasPreviousPage hasNextPage startCursor endCursor }
    }
  }
`;
