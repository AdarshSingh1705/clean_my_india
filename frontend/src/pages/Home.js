import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <h1>Together We Can Clean India</h1>
          <p>Report cleanliness issues in your area and help make India cleaner</p>
          {user ? (
            <Link to="/report" className="cta-button">Report an Issue</Link>
          ) : (
            <Link to="/register" className="cta-button">Join Us Now</Link>
          )}
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>How It Works</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">1</div>
              <h3>Report</h3>
              <p>Take a photo of cleanliness issues in your area and report them through our app</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">2</div>
              <h3>Track</h3>
              <p>Monitor the status of your reports and see when they get resolved</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">3</div>
              <h3>Impact</h3>
              <p>Join a community of citizens making a real difference in their neighborhoods</p>
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
              <p>Issues Reported</p>
            </div>
            <div className="stat">
              <h3>893</h3>
              <p>Issues Resolved</p>
            </div>
            <div className="stat">
              <h3>4,521</h3>
              <p>Active Users</p>
            </div>
            <div className="stat">
              <h3>42</h3>
              <p>Cities Covered</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
