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

function getCountdown() {
  const target = new Date();
  target.setHours(23, 59, 59, 0);
  const diff = Math.max(0, target - new Date());
  const h = String(Math.floor(diff / 3.6e6)).padStart(2, '0');
  const m = String(Math.floor((diff / 6e4) % 60)).padStart(2, '0');
  const s = String(Math.floor((diff / 1e3) % 60)).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function AnnouncementBar() {
  const [time, setTime] = useState(getCountdown());
  useEffect(() => {
    const id = setInterval(() => setTime(getCountdown()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="announce">
      <div className="announce-inner container">
        <span className="announce-pill">
          <span className="announce-dot" />
          Free delivery above ₹699
        </span>
        <span className="announce-msg">
          100% Ayurvedic · Clinically Tested · No Harmful Chemicals
        </span>
        <span className="announce-msg">
          Offer ends in <span className="timer">{time}</span>
        </span>
      </div>
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
            <Link to="/account/wishlist" className="navbar-icon" aria-label="Wishlist">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
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
