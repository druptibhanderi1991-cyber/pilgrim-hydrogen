import {Link} from 'react-router';

const shop = [
  {label: 'Bestsellers', to: '/collections/all'},
  {label: 'Face Care', to: '/collections/face-care'},
  {label: 'Hair Care', to: '/collections/hair-care'},
  {label: 'Wellness', to: '/collections/wellness'},
  {label: 'Herbs & Oils', to: '/collections/herbs-oils'},
  {label: 'Gift Sets', to: '/collections/gifting'},
];
const help = [
  {label: 'Track order', to: '#'},
  {label: 'Contact us', to: '/pages/contact'},
  {label: 'Shipping & returns', to: '#'},
  {label: 'FAQ', to: '#'},
  {label: 'Store locator', to: '#'},
];
const company = [
  {label: 'About Vaidhacharya', to: '/pages/about'},
  {label: 'Our heritage', to: '#'},
  {label: 'Sustainability', to: '#'},
  {label: 'Press', to: '#'},
  {label: 'Careers', to: '#'},
  {label: 'Journal', to: '/blogs/journal', isNew: true},
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <div className="footer-brand-name">
              Vaidha<span style={{color: 'var(--sand)'}}>charya</span>
              <sup style={{fontSize: 12}}>®</sup>
            </div>
            <p className="footer-brand-tag">
              Five-thousand years of Ayurvedic wisdom, clinically verified for
              modern skin. Crafted in India, trusted across 28 countries.
            </p>
            <div
              className="footer-certbadges"
              style={{display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap'}}
            >
              {['PETA Certified', 'NABL Tested', 'GMP Grade', '100% Vegan'].map(
                (b) => (
                  <span
                    key={b}
                    style={{
                      fontSize: 10,
                      letterSpacing: '0.8px',
                      padding: '4px 10px',
                      border: '1px solid rgba(232,213,168,0.35)',
                      borderRadius: 20,
                      color: 'var(--sand)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {b}
                  </span>
                ),
              )}
            </div>
            <div className="footer-news">
              <div
                className="eyebrow"
                style={{color: 'var(--sand)', marginBottom: 12}}
              >
                Newsletter
              </div>
              <form
                className="footer-news-form"
                onSubmit={(e) => e.preventDefault()}
              >
                <input type="email" placeholder="Your email address" />
                <button type="submit">Subscribe</button>
              </form>
              <p
                style={{
                  fontSize: 12,
                  color: 'rgba(250,247,241,0.5)',
                  marginTop: 12,
                }}
              >
                Get 10% off your first order · No spam, ever.
              </p>
            </div>
          </div>

          <div className="footer-col">
            <h4>Shop</h4>
            <ul>
              {shop.map((x) => (
                <li key={x.label}>
                  <Link to={x.to}>{x.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>Help</h4>
            <ul>
              {help.map((x) => (
                <li key={x.label}>
                  <Link to={x.to}>{x.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              {company.map((x) => (
                <li key={x.label}>
                  <Link to={x.to}>
                    {x.label}
                    {x.isNew && <span className="perks-tag">NEW</span>}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="footer-socials" style={{marginTop: 28}}>
              <a href="#" className="footer-social" aria-label="Facebook">f</a>
              <a href="#" className="footer-social" aria-label="Instagram">✦</a>
              <a href="#" className="footer-social" aria-label="YouTube">▶</a>
              <a href="#" className="footer-social" aria-label="LinkedIn">in</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Vaidhacharya Wellness Pvt. Ltd. Made with care in India.</p>
          <p>
            <Link to="/policies/privacy-policy">Privacy Policy</Link>
            {' · '}
            <Link to="/policies/terms-of-service">Terms of Use</Link>
            {' · '}
            <Link to="/policies/refund-policy">Refund Policy</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
