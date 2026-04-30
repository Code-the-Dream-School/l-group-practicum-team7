import React from 'react';
import './Header.css';

export default function Header({ user, onLogin, onLogout, onNavigate }) {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="brand">pulseMind</div>
        <div className="home-btn">
          <button onClick={() => onNavigate('home')}>Home</button>
        </div>
      </div>

      <div className="header-center">
        {user ? (
          <button className="search-btn" onClick={() => onNavigate('search')}>Search</button>
        ) : null}
      </div>

      <div className="header-right">
        {user ? (
          <button className="about-btn" onClick={() => onNavigate('about')}>About</button>
        ) : (
          <div style={{ width: 90 }} />
        )}

        <div className="actions">
          {!user ? (
            <>
              <button className="auth" onClick={() => onLogin('login')}>Login</button>
              <button className="auth" onClick={() => onLogin('register')}>SignUp</button>
            </>
          ) : (
            <button className="auth" onClick={onLogout}>Logout</button>
          )}
        </div>
      </div>
    </header>
  );
}
