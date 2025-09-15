import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Notifications from './Notifications';
import './Header.css';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <h1>Clean My India</h1>
        </Link>
        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/issues">Issues</Link>
          <Link to="/about">About</Link>
          
          {currentUser ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/report">Report Issue</Link>
              
              {currentUser.role === 'admin' && (
                <Link to="/admin">Admin</Link>
              )}
              
              <Notifications />
              
              <div className="user-menu">
                <span>Hello, {currentUser.name}</span>
                <Link to="/profile">Profile</Link>
                <button onClick={handleLogout}>Logout</button>
              </div>
            </>
          ) : (
            <div className="auth-links">
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
