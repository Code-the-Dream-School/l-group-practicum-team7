import React, { useEffect, useState } from 'react';
import './App.css'
import AuthModal from './components/AuthModal.jsx';
import Header from './components/Header.jsx';
import About from './pages/About.jsx';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

function App() {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [route, setRoute] = useState('home');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setChecking(false);
      setRoute('auth');
      setAuthMode('login');
      setShowAuth(true);
      return;
    }
    fetch(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('not authed'))))
      .then((u) => {
        setUser({ ...u, token });
      })
      .catch(() => {
        localStorage.removeItem('token');
        setShowAuth(true);
      })
      .finally(() => setChecking(false));
  }, []);

  const handleAuthed = (u) => {
    setUser(u);
    if (u?.token) localStorage.setItem('token', u.token);
    setShowAuth(false);
  };

  const handleLoginOpen = (mode) => {
    setAuthMode(mode || 'login');
    setShowAuth(true);
    setRoute('auth');
  };

  const handleNavigate = (r) => {
    if (!user && r !== 'about') {
      setShowAuth(true);
      return;
    }
    setRoute(r);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <Header user={user} onLogin={(m) => handleLoginOpen(m)} onLogout={handleLogout} onNavigate={handleNavigate} />

      <main style={{ padding: 20 }}>
        {route === 'home' && (
          user ? null : <p>Welcome — please log in to continue.</p>
        )}
        {route === 'about' && <About />}
        {route === 'search' && <p>Search page (placeholder)</p>}
      </main>

      {showAuth && (
        <AuthModal initialMode={authMode} disableClose={!user} onClose={() => { if (user) setShowAuth(false); }} onAuthed={handleAuthed} />
      )}
    </div>
  );
}

export default App;
