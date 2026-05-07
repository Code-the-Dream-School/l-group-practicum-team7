import React, { useEffect, useState } from 'react';
<<<<<<< HEAD
import './App.css'

import AuthModal from './components/AuthModal';
import Header from './components/Header';
import About from './pages/About';
import Insights from './components/Insights';
import EntryForm from './components/EntryForm';

const API: string = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

=======
import './App.css';

import AuthModal from './components/AuthModal.jsx';
import Header from './components/Header.jsx';
import About from './pages/About.jsx';
import Insights from './components/Insights.tsx';
import EntryForm from './components/EntryForm.jsx';

const API: string = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

>>>>>>> 74b93ecaec3ed14181f07bb266098fc4fa349bb7
type AuthMode = 'login' | 'signup';
type Route = 'home' | 'about' | 'search' | 'auth';

type User = {
  token?: string;
  [key: string]: unknown;
};

type MeResponse = Record<string, unknown>;

<<<<<<< HEAD
function App(): React.ReactElement {
=======
function App(): JSX.Element {
>>>>>>> 74b93ecaec3ed14181f07bb266098fc4fa349bb7
  const [checking, setChecking] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [route, setRoute] = useState<Route>('home');
  const [, setInsightsRefreshKey] = useState<number>(0);

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
        return response.json() as Promise<MeResponse>;
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

  const handleAuthed = (userData: User | null): void => {
    setUser(userData);

    if (userData?.token) {
      localStorage.setItem('token', userData.token);
    }

    setShowAuth(false);
    setRoute('home');
  };

  const handleLoginOpen = (mode?: AuthMode): void => {
    setAuthMode(mode || 'login');
    setShowAuth(true);
    setRoute('auth');
  };

  const handleNavigate = (nextRoute: Route): void => {
    if (!user && nextRoute !== 'about') {
      setAuthMode('login');
      setShowAuth(true);
      setRoute('auth');
      return;
    }

    setRoute(nextRoute);
  };

  const handleLogout = (): void => {
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
        user={user ?? undefined}
        onLogin={handleLoginOpen}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />

      <main className="app-main">
        {route === 'home' &&
          (user ? (
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
          ))}

        {route === 'about' && <About />}

        {route === 'search' &&
          (user ? <p>Search page placeholder</p> : <p>Please log in to continue.</p>)}

        {route === 'auth' && !user && <p>Please log in to continue.</p>}
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
