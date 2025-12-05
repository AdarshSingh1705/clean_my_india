import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="container">
        <h1>About Clean India</h1>
        
        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            Clean India is a citizen-driven platform that empowers residents to report 
            sanitation and cleanliness issues in real time, engages municipal authorities 
            to resolve them, and provides transparent, verifiable closure of complaints.
          </p>
        </section>

        <section className="about-section">
          <h2>How It Works</h2>
          <div className="process-steps">
            <div className="step">
              <h3>1. Report</h3>
              <p>Citizens report issues with photos, descriptions, and location data.</p>
            </div>
            <div className="step">
              <h3>2. Route</h3>
              <p>Issues are automatically routed to the appropriate municipal authority.</p>
            </div>
            <div className="step">
              <h3>3. Resolve</h3>
              <p>Authorities address the issues and provide proof of resolution.</p>
            </div>
            <div className="step">
              <h3>4. Verify</h3>
              <p>Our AI system verifies the resolution before marking as complete.</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Our Team</h2>
          <p>
            We are a group of passionate developers and civic enthusiasts who believe in 
            using technology to solve real-world problems and make our cities cleaner and 
            more livable for everyone.
          </p>
        </section>

        <section className="about-section">
          <h2>Contact Us</h2>
          <p>
            Have questions or suggestions? We'd love to hear from you!
            <br />
            Email: contact@cleanmyindia.org
            <br />
            Phone: +91-XXXXX-XXXXX
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;
