import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Notifications from './Notifications';
import './Header.css';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-menu')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

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
                <Link to="/admin/issues">Admin Panel</Link>
              )}
              
              <Notifications />
              
              <div className="user-menu">
        
                <div className="user-menu-trigger" onClick={toggleMenu}>
                  <span>Hello, {currentUser.name}</span>
                  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Jhon?size=30px" className="Avatar" loading="lazy" alt="Avatar1" />
                </div>
                <div className={`user-menu-dropdown ${isMenuOpen ? 'show' : ''}`}>
                  <Link to="/profile" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                    <span role="img" aria-label="profile">👤</span> Profile
                  </Link>
                  <button className="dropdown-item logout-btn" onClick={handleLogout}>
                    <span role="img" aria-label="logout">🚪</span> Logout

                  </button>
                </div>
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
