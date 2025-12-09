import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Notifications from './Notifications';
import './Header.css';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

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
          <h1>Clean India</h1>
        </Link>
        
        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <nav className={`nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <Link to="/issues" onClick={() => setIsMobileMenuOpen(false)}>Issues</Link>
          <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
          
          {currentUser ? (
            <>
              <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
              <Link to="/report" onClick={() => setIsMobileMenuOpen(false)}>Report Issue</Link>
              
              {currentUser.role === 'admin' && (
                <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>Admin</Link>
              )}
              
              <Notifications />
              
              <div className="user-menu">
                <div className="user-menu-trigger" onClick={toggleMenu}>
                  <span className="user-greeting">Hello, {currentUser.name}</span>
                  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Jhon?size=30px" className="Avatar" loading="lazy" alt="Avatar1" />
                </div>
                <div className={`user-menu-dropdown ${isMenuOpen ? 'show' : ''}`}>
                  <Link to="/profile" className="dropdown-item" onClick={() => { setIsMenuOpen(false); setIsMobileMenuOpen(false); }}>
                    <span role="img" aria-label="profile">👤</span> Profile
                  </Link>
                  <button className="dropdown-item logout-btn" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>
                    <span role="img" aria-label="logout">🚪</span> Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="auth-links">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>Register</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
