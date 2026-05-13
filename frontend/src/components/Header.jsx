import React from 'react';
import PropTypes from 'prop-types';
import './Header.css';

export default function Header({ user, onLogin, onLogout, onNavigate }) {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="brand">pulseMind</div>

        <div className="home-btn">
          <button type="button" onClick={() => onNavigate('home')}>
            Home
          </button>
        </div>
      </div>

      <div className="header-center">
        {user && (
          <button
            type="button"
            className="search-btn"
            onClick={() => onNavigate('search')}
          >
            Search
          </button>
        )}
      </div>

      <div className="header-right">
        {user ? (
          <button
            type="button"
            className="about-btn"
            onClick={() => onNavigate('about')}
          >
            About
          </button>
        ) : (
          <div className="header-spacer" />
        )}

        <div className="actions">
          {!user ? (
            <>
              <button
                type="button"
                className="auth"
                onClick={() => onLogin('login')}
              >
                Login
              </button>

              <button
                type="button"
                className="auth"
                onClick={() => onLogin('signup')}
              >
                Sign Up
              </button>
            </>
          ) : (
            <button type="button" className="auth" onClick={onLogout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

Header.defaultProps = {
  user: null,
};

Header.propTypes = {
  user: PropTypes.oneOfType([
    PropTypes.shape({
      email: PropTypes.string,
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      token: PropTypes.string,
    }),
    PropTypes.oneOf([null]),
  ]),
  onLogin: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
};