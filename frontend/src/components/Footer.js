// frontend/src/components/Footer.js
import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Clean My India</h3>
            <p>Making India cleaner, one report at a time.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/issues">Browse Issues</a></li>
              <li><a href="/report">Report Issue</a></li>
              <li><a href="/about">About Us</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Connect With Us</h4>
            <div className="social-links">
              <a href="#" title="Facebook" aria-label="Facebook">
                <span role="img" aria-label="Facebook" style={{fontSize: '1.5rem'}}>🔵</span> Facebook
              </a>
              <a href="#" title="Twitter" aria-label="Twitter">
                <span role="img" aria-label="Twitter" style={{fontSize: '1.5rem'}}>🐦</span> Twitter
              </a>
              <a href="#" title="Instagram" aria-label="Instagram">
                <span role="img" aria-label="Instagram" style={{fontSize: '1.5rem'}}>📸</span> Instagram
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2023 Clean My India. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
