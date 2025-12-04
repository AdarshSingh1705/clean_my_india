import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Register.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="container">
        <div className="register-form">
          <h2>Reset Password</h2>
          {error && <div className="error-message">{error}</div>}
          {success && (
            <div style={{ 
              background: '#d1fae5', 
              color: '#065f46', 
              padding: '1rem', 
              borderRadius: '8px', 
              marginBottom: '1rem',
              border: '1px solid #10b981'
            }}>
              ✅ Password reset email sent! Please check your inbox and click the link to reset your password.
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit}>
              <p style={{ marginBottom: '1rem', color: '#666' }}>
                Enter your email address and we'll send you a link to reset your password.
              </p>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" disabled={loading} className="cta-button">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <p style={{ marginTop: '1rem' }}>
            Remember your password? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
