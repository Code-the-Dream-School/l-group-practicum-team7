import React, { useEffect, useState } from 'react';

import AuthModal from './components/Auth/AuthModal';
import Header from './components/Layout/Header';
import About from './pages/About';
import Insights from './components/Insights/Insights';
import EntryForm from './components/Forms/EntryForm';
import ToolsPage from './pages/ToolsPage';
import NovelPage from './pages/NovelPage';

import AppHeader from './components/Layout/AppHeader';
import BottomNav, { type MobileTab } from './components/Layout/BottomNav';
import TodayPage from './pages/TodayPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';

import './App.css';
import './styles/App.css';

// const API: string = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

const API: string = import.meta.env.VITE_API_BASE as string;

type AuthMode = 'login' | 'signup';

type Route =
  | 'backend'
  | 'about'
  | 'search'
  | 'auth'
  | 'tools'
  | 'insights'
  | 'dialogues'
  | 'novel';

type User = {
  token?: string;
  email?: string;
  name?: string;
  username?: string;
  userId?: string;
  id?: string;
  _id?: string;
  [key: string]: unknown;
};

type MeResponse = Record<string, unknown>;

function App(): React.ReactElement {
  const [checking, setChecking] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [route, setRoute] = useState<Route>('backend');
  const [mobileTab, setMobileTab] = useState<MobileTab>('today');
  const [, setInsightsRefreshKey] = useState<number>(0);
  const [lastEntryText, setLastEntryText] = useState<string>('');
  const [pendingRoute, setPendingRoute] = useState<Route | null>(null);

  useEffect(() => {
  const onOpenTools = () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setPendingRoute('tools');
      setAuthMode('login');
      setShowAuth(true);
      setRoute('auth');
      return;
    }

    setRoute('tools');
  };

  window.addEventListener('openTools', onOpenTools);

  const token = localStorage.getItem('token');

  if (!token) {
    setUser(null);
    setChecking(false);
    setRoute('auth');
    setAuthMode('login');
    setShowAuth(true);

    return () => {
      window.removeEventListener('openTools', onOpenTools);
    };
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
      setRoute('backend');
    })
    .catch(() => {
      localStorage.removeItem('token');
      setUser(null);
      setRoute('auth');
      setAuthMode('login');
      setShowAuth(true);
    })
    .finally(() => {
      setChecking(false);
    });

  return () => {
    window.removeEventListener('openTools', onOpenTools);
  };
}, []);

  const handleAuthed = (userData: User | null): void => {
    setUser(userData);

    if (userData?.token) {
      localStorage.setItem('token', userData.token);
    }

    setShowAuth(false);

    if (pendingRoute) {
      setRoute(pendingRoute);
      setPendingRoute(null);
    } else {
      setRoute('backend');
    }
  };

  const handleLoginOpen = (mode?: AuthMode): void => {
    setAuthMode(mode || 'login');
    setShowAuth(true);
    setRoute('auth');
  };

  const handleLogout = (): void => {
    localStorage.removeItem('token');
    setUser(null);
    setPendingRoute(null);
    setRoute('auth');
    setAuthMode('login');
    setShowAuth(true);
  };

  const handleNavigate = (nextRoute: Route): void => {
    if (!user && nextRoute !== 'about') {
      setPendingRoute(nextRoute);
      setAuthMode('login');
      setShowAuth(true);
      setRoute('auth');
      return;
    }

    if (nextRoute === 'insights') {
      try {
        window.dispatchEvent(
          new CustomEvent('insights.entry', {
            detail: { text: lastEntryText },
          })
        );
      } catch (e) {}

      setRoute('backend');
      return;
    }

    if (nextRoute === 'novel') {
      setRoute('dialogues');
      return;
    }

    setRoute(nextRoute);
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
      <section className="app-shell">
        <AppHeader />

        {mobileTab === 'today' && <TodayPage />}
        {mobileTab === 'history' && <HistoryPage />}
        {mobileTab === 'profile' && (
          <ProfilePage user={user ?? undefined} onLogout={handleLogout} />
        )}

        <BottomNav activeTab={mobileTab} onTabChange={setMobileTab} />
      </section>

      <section className="backend-front-section">
        <h2 className="backend-front-title">&lt;backend front&gt;</h2>

        <Header
          user={user ?? undefined}
          onLogin={handleLoginOpen}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />

        <main className="app-main">
          {route === 'backend' &&
            (user ? (
              <>
                <h1>Dashboard</h1>

                <EntryForm
                  onEntryCreated={(text?: string) => {
                    setInsightsRefreshKey((prev) => prev + 1);

                    if (typeof text === 'string') {
                      setLastEntryText(text);
                    }

                    try {
                      window.dispatchEvent(
                        new CustomEvent('insights.entry', {
                          detail: { text: text || '' },
                        })
                      );
                    } catch (e) {}
                  }}
                />

                <hr style={{ margin: '2rem 0' }} />

                <Insights />
              </>
            ) : (
              <p>Please log in to continue.</p>
            ))}

          {route === 'dialogues' &&
            (user ? <NovelPage /> : <p>Please log in to continue.</p>)}

          {route === 'tools' &&
            (user ? <ToolsPage /> : <p>Please log in to continue.</p>)}

          {route === 'about' && <About />}

          {route === 'search' &&
            (user ? (
              <p>Search page placeholder</p>
            ) : (
              <p>Please log in to continue.</p>
            ))}

          {route === 'auth' && !user && <p>Please log in to continue.</p>}
        </main>
      </section>

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