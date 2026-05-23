import React, { useEffect, useState } from "react";

import AuthModal from "./components/AuthModal";
import Header from "./components/Header";
import About from "./pages/About";
import Insights from "./components/Insights";
import EntryForm from "./components/EntryForm";

import AppHeader from "./components/AppHeader";
import BottomNav, { type MobileTab } from "./components/BottomNav";
import TodayPage from "./pages/TodayPage";
import HistoryPage from "./pages/HistoryPage";
import ProfilePage from "./pages/ProfilePage";
import ToolsPage from "./pages/ToolsPage";

import "./App.css";
import "./styles/App.css";

const API: string = import.meta.env.VITE_API_BASE || "http://localhost:8080";

type AuthMode = "login" | "signup";
type Route = "home" | "about" | "search" | "auth" | "tools";

type User = {
  token?: string;
  [key: string]: unknown;
};

type MeResponse = Record<string, unknown>;

function App(): React.ReactElement {
  const [checking, setChecking] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [route, setRoute] = useState<Route>("home");
  const [mobileTab, setMobileTab] = useState<MobileTab>("today");
  const [, setInsightsRefreshKey] = useState<number>(0);

  const [unlockedTools, setUnlockedTools] = useState<string[]>([]);
  const [showTools, setShowTools] = useState(false);

  const handleOpenTools = (tools: string[]): void => {
    setUnlockedTools(tools);
    setShowTools(true);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setChecking(false);
      setRoute("auth");
      setAuthMode("login");
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
          throw new Error("not authed");
        }

        return response.json() as Promise<MeResponse>;
      })
      .then((userData) => {
        setUser({ ...userData, token });
        setRoute("home");
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
        setRoute("auth");
        setShowAuth(true);
      })
      .finally(() => {
        setChecking(false);
      });
  }, []);

  const handleAuthed = (userData: User | null): void => {
    setUser(userData);

    if (userData?.token) {
      localStorage.setItem("token", userData.token);
    }

    setShowAuth(false);
    setRoute("home");
  };

  const handleLoginOpen = (mode?: AuthMode): void => {
    setAuthMode(mode || "login");
    setShowAuth(true);
    setRoute("auth");
  };

  const handleNavigate = (nextRoute: Route): void => {
    if (!user && nextRoute !== "about") {
      setAuthMode("login");
      setShowAuth(true);
      setRoute("auth");
      return;
    }

    setRoute(nextRoute);
  };

  const handleLogout = (): void => {
    localStorage.removeItem("token");
    setUser(null);
    setRoute("auth");
    setAuthMode("login");
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
      <section className="app-shell">
        <AppHeader />

        {mobileTab === "today" && <TodayPage />}
        {mobileTab === "history" && <HistoryPage />}
        {mobileTab === "profile" && (
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
          {route === "home" &&
            (user ? (
              <>
                <h1>Dashboard</h1>

                <button
                  onClick={() =>
                    handleOpenTools([
                      "breathing",
                      "grounding",
                      "three-good-things",
                    ])
                  }
                >
                  Open Tools
                </button>
                <EntryForm
                  onEntryCreated={() => {
                    setInsightsRefreshKey((prev) => prev + 1);
                  }}
                />

                <hr style={{ margin: "2rem 0" }} />

                <Insights />
              </>
            ) : (
              <p>Welcome — please log in to continue.</p>
            ))}

          {route === "about" && <About />}

          {route === "search" &&
            (user ? (
              <p>Search page placeholder</p>
            ) : (
              <p>Please log in to continue.</p>
            ))}
          {showTools && (
            <ToolsPage
              unlockedTools={unlockedTools}
              onClose={() => setShowTools(false)}
            />
          )}
          {route === "auth" && !user && <p>Please log in to continue.</p>}
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
