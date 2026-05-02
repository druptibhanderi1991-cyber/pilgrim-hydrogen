import {useState, useEffect} from 'react';
import {Link, useLocation} from 'react-router';
import {useCart} from '~/components/CartProvider';

const NAV_LINKS = [
  {label: 'Bestsellers', to: '/collections/all'},
  {label: 'Face Care', to: '/collections/face-care'},
  {label: 'Hair Care', to: '/collections/hair-care'},
  {label: 'Wellness', to: '/collections/wellness'},
  {label: 'Herbs & Oils', to: '/collections/herbs-oils'},
  {label: 'Rituals', to: '/collections/rituals'},
  {label: 'About', to: '/pages/about'},
];

function AnnouncementBar() {
  const messages = [
    '✦ Free shipping on orders above ₹499',
    '✦ PETA Certified Vegan · Clinically Tested',
    '✦ Use code AYURVEDA10 for 10% off your first order',
    '✦ 5000 years of Ayurvedic wisdom, clinically proven',
  ];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % messages.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="announce">
      <p className="announce-text">{messages[idx]}</p>
    </div>
  );
}

export function Header() {
  const {cart} = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const cartCount = cart?.totalQuantity || 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <AnnouncementBar />
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner container">
          <Link to="/" className="navbar-logo">
            Vaidha<span>charya</span><sup>®</sup>
          </Link>

          <nav className="nav-links">
            {NAV_LINKS.map((l) => (
              <Link key={l.label} to={l.to} className="nav-link">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="navbar-actions">
            <Link to="/search" className="navbar-icon" aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" strokeLinecap="round" />
              </svg>
            </Link>
            <Link to="/account" className="navbar-icon" aria-label="Account">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
            <Link to="/cart" className="navbar-icon navbar-cart" aria-label="Cart">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
            <button
              className="navbar-hamburger"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="mobile-menu">
            {NAV_LINKS.map((l) => (
              <Link key={l.label} to={l.to} className="mobile-link">
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </header>
    </>
  );
}

// Keep HeaderMenu exported for PageLayout backward compat
export function HeaderMenu() {
  return null;
}
