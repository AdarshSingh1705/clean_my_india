import React from 'react';
import HeroSection from '../components/HeroSection';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <HeroSection />

      <section className="features">
        <div className="container">
          <h2>How It Works</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">📸</div>
              <h3>Report Issues</h3>
              <p>Capture and report cleanliness problems in your area with just a few taps. Our intuitive interface makes it easy to document issues with photos and descriptions.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Track Progress</h3>
              <p>Monitor the status of your reports in real-time. Get updates when authorities acknowledge your issue and celebrate when problems get resolved.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌟</div>
              <h3>Make Impact</h3>
              <p>Join thousands of citizens working together to create cleaner, healthier communities. Every report contributes to a cleaner India.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="container">
          <h2>Our Impact So Far</h2>
          <div className="stats-grid">
            <div className="stat">
              <h3>1,245</h3>
              <p>🗂️ Issues Reported</p>
            </div>
            <div className="stat">
              <h3>893</h3>
              <p>✅ Issues Resolved</p>
            </div>
            <div className="stat">
              <h3>4,521</h3>
              <p>👥 Active Users</p>
            </div>
            <div className="stat">
              <h3>42</h3>
              <p>🏙️ Cities Covered</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
