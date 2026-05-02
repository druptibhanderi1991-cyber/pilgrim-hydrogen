import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';

/**
 * CategoryCard
 * Renders a single Shopify collection tile with:
 *  - Photo (collection image, falls back to first product's featured image)
 *  - Subtle bottom-fade gradient overlay
 *  - Bottom-left title + bottom-right arrow
 *  - Lazy-loaded, responsive Hydrogen <Image> with srcset
 *
 * Pixel-parity with the localhost (Vite) Categories.jsx design:
 *  .cat-tile / .cat-photo / .cat-overlay / .cat-overlay-name / .cat-overlay-arrow
 */
export default function CategoryCard({collection}) {
  if (!collection) return null;

  const {title, handle, image, products} = collection;
  const fallbackImage = products?.nodes?.[0]?.featuredImage;
  const photo = image || fallbackImage;

  return (
    <Link to={`/collections/${handle}`} className="cat-tile" aria-label={title}>
      {photo?.url ? (
        <Image
          data={photo}
          alt={photo.altText || title}
          className="cat-photo"
          loading="lazy"
          sizes="(min-width: 900px) 12vw, (min-width: 600px) 25vw, 50vw"
          aspectRatio="4/5"
        />
      ) : (
        <div className="cat-photo cat-photo-placeholder" />
      )}
      <div className="cat-overlay">
        <span className="cat-overlay-name">{title}</span>
        <span className="cat-overlay-arrow">→</span>
      </div>
    </Link>
  );
}
