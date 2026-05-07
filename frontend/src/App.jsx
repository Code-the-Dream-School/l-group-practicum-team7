import React, { useEffect, useState } from 'react';
import './App.css';
import AuthModal from './components/AuthModal.jsx';
import Header from './components/Header.jsx';
import About from './pages/About.jsx';
import Insights from './components/Insights.tsx';
import EntryForm from './components/EntryForm.jsx';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

function App() {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [route, setRoute] = useState('home');
  const [insightsRefreshKey, setInsightsRefreshKey] = useState(0); 

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
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('not authed');
        }

        return response.json();
      })
      .then((userData) => {
        setUser({ ...userData, token });
        setRoute('home');
      })
      .catch(() => {
        localStorage.removeItem('token');
        setUser(null);
        setRoute('auth');
        setShowAuth(true);
      })
      .finally(() => {
        setChecking(false);
      });
  }, []);

  const handleAuthed = (userData) => {
    setUser(userData);

    if (userData?.token) {
      localStorage.setItem('token', userData.token);
    }

    setShowAuth(false);
    setRoute('home');
  };

  const handleLoginOpen = (mode) => {
    setAuthMode(mode || 'login');
    setShowAuth(true);
    setRoute('auth');
  };

  const handleNavigate = (nextRoute) => {
    if (!user && nextRoute !== 'about') {
      setAuthMode('login');
      setShowAuth(true);
      setRoute('auth');
      return;
    }

    setRoute(nextRoute);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setRoute('auth');
    setAuthMode('login');
    setShowAuth(true);
  };

  if (checking) {
    return (
      <div className="app">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Header
        user={user}
        onLogin={handleLoginOpen}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />

      <main className="app-main">
        {route === 'home' && (
          user ? (
            <>
              <h1>Dashboard</h1>
              <EntryForm
                onEntryCreated={() => {
                  setInsightsRefreshKey((prev) => prev + 1);
                }}
              />

              <hr style={{ margin: '2rem 0' }} />
              <Insights />
            </>
          ) : (
            <p>Welcome — please log in to continue.</p>
          )
        )}

        {route === 'about' && <About />}

        {route === 'search' && (
          user ? (
            <p>Search page placeholder</p>
          ) : (
            <p>Please log in to continue.</p>
          )
        )}

        {route === 'auth' && !user && (
          <p>Please log in to continue.</p>
        )}
      </main>

      {showAuth && (
        <AuthModal
          initialMode={authMode}
          disableClose={!user}
          onClose={() => {
            if (user) {
              setShowAuth(false);
            }
          }}
          onAuthed={handleAuthed}
        />
      )}
    </div>
  );
}

export default App;
