import React from 'react';
import { MessageCircle, Globe, Mail, Phone } from 'lucide-react';
import './Footer.css';

export function Footer() {
  return (
    <footer className="footer-container">
      <div className="container footer-inner">
        <div className="footer-col">
          <h3>PILGRIM</h3>
          <p>Discover the beauty secrets of the world with our vegan, cruelty-free, and FDA approved products.</p>
          <div className="social-links">
            <a href="#"><MessageCircle size={20} /></a>
            <a href="#"><Globe size={20} /></a>
            <a href="#"><Mail size={20} /></a>
            <a href="#"><Phone size={20} /></a>
          </div>
        </div>
        <div className="footer-col">
          <h4>Information</h4>
          <ul>
            <li><a href="#">Track Order</a></li>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">Store Locator</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Important Links</h4>
          <ul>
            <li><a href="#">Shipping Policy</a></li>
            <li><a href="#">Return Policy</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms & Conditions</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Pilgrim India. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
