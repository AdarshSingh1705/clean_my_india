import React from 'react';
import { Link } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <section className="hero-section">
      <div className="hero-overlay">
        <div className="hero-content">
          <h1 className="hero-title">Together We Can Clean India</h1>
          <p className="hero-subtitle">
            Report cleanliness issues in your area and help make India cleaner.
            Join our community of responsible citizens working towards a spotless nation.
          </p>
          <div className="hero-actions">
            {user ? (
              <Link to="/report" className="hero-cta-button primary">
                Report an Issue
              </Link>
            ) : (
              <Link to="/register" className="hero-cta-button primary">
                Join Us Now
              </Link>
            )}
            <Link to="/issues" className="hero-cta-button secondary">
              View Issues
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
