import React, { useEffect, useState } from 'react';
import './App.css'
import AuthModal from './components/AuthModal.jsx';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

function App() {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setChecking(false);
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

  return (
    <main style={{ padding: 0, margin: 0, minHeight: '100vh', background: '#fff' }}>
      {checking ? null : user ? null : showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} onAuthed={handleAuthed} />
      )}
    </main>
  );
}

export default App;
