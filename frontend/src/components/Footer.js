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
            <p>Clean India begins with us.</p>
            <p>Let’s build a greener, prouder India together.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/issues">     Browse Issues</a></li>
              <li><a href="/report">     Report Issue</a></li>
              <li><a href="/about">     About Us</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Connect With Us</h4>
            <div className="social-links">
              <ul>
                <li><a href="#"><i className="fab fa-facebook-f"></i>  facebook</a></li>
                <li><a href="https://www.linkedin.com/in/adarshsingh1705"><i className="fab fa-linkedin"></i>  linkedin</a> </li>
                <li><a href="https://www.instagram.com/abu.obaida.00/"><i className="fab fa-instagram"></i>  instagram</a> </li>
                <li><a href="https://x.com/ADNAN621636?t=OCuLwhVJ3PdWdR5l4-XBWQ&s=08"><i className="fab fa-twitter"></i>  x</a> </li>
              </ul>
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
