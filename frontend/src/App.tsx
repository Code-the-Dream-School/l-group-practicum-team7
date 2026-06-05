import React, { useCallback, useEffect, useRef, useState } from "react";

import AuthModal from "./components/Auth/AuthModal";
import AppHeader from "./components/Layout/AppHeader";
import BottomNav, { type MobileTab } from "./components/Layout/BottomNav";
import About from "./pages/About";
import HistoryPage from "./pages/HistoryPage";
import HomePage from "./pages/Home";
import NovelPage from "./pages/NovelPage";
import ProfilePage from "./pages/ProfilePage";
import TodayPage from "./pages/TodayPage";
import ToolsPage from "./pages/ToolsPage";
import { getEntries, getInsights } from "./services/wellnessApi";
import type { Entry, InsightsResponse } from "./types/wellness";

import "./App.css";
import "./styles/App.css";

const API: string = import.meta.env.VITE_API_BASE || "http://localhost:8080";

type AuthMode = "login" | "register" | "signup";

type Route =
  | "backend"
  | "about"
  | "search"
  | "auth"
  | "tools"
  | "insights"
  | "dialogues"
  | "novel"
  | "landing";

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
  const [checking, setChecking] = useState<boolean>(() => Boolean(localStorage.getItem("token")));
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [route, setRoute] = useState<Route>(() =>
    localStorage.getItem("token") ? "backend" : "landing"
  );
  const [mobileTab, setMobileTab] = useState<MobileTab>("today");
  const [pendingRoute, setPendingRoute] = useState<Route | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState<boolean>(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const dashboardRequestId = useRef<number>(0);

  const loadDashboardData = useCallback(async (token: string): Promise<void> => {
    const requestId = dashboardRequestId.current + 1;
    dashboardRequestId.current = requestId;
    setDashboardLoading(true);
    setDashboardError(null);

    try {
      const [savedEntries, generatedInsights] = await Promise.all([
        getEntries(token),
        getInsights(token),
      ]);

      if (requestId !== dashboardRequestId.current) {
        return;
      }

      setEntries(savedEntries);
      setInsights(generatedInsights);
    } catch (error) {
      if (requestId !== dashboardRequestId.current) {
        return;
      }

      const message = error instanceof Error ? error.message : "Unable to load dashboard data";
      setDashboardError(message);
      setEntries([]);
      setInsights(null);
    } finally {
      if (requestId === dashboardRequestId.current) {
        setDashboardLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const onOpenTools = () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setPendingRoute("tools");
        setAuthMode("login");
        setShowAuth(true);
        return;
      }

      setRoute("tools");
    };

    window.addEventListener("openTools", onOpenTools);

    const token = localStorage.getItem("token");

    if (!token) {
      return () => {
        window.removeEventListener("openTools", onOpenTools);
      };
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
        setRoute("backend");
        void loadDashboardData(token);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
        setRoute("landing");
        setAuthMode("login");
        setShowAuth(false);
      })
      .finally(() => {
        setChecking(false);
      });

    return () => {
      window.removeEventListener("openTools", onOpenTools);
    };
  }, [loadDashboardData]);

  const handleAuthed = (userData: User | null): void => {
    setUser(userData);

    if (userData?.token) {
      localStorage.setItem("token", userData.token);
      void loadDashboardData(userData.token);
    }

    setShowAuth(false);

    if (pendingRoute) {
      setRoute(pendingRoute);
      setPendingRoute(null);
    } else {
      setRoute("backend");
      setMobileTab("today");
    }
  };

  const handleLogout = (): void => {
    localStorage.removeItem("token");
    dashboardRequestId.current += 1;
    setUser(null);
    setEntries([]);
    setInsights(null);
    setDashboardLoading(false);
    setDashboardError(null);
    setPendingRoute(null);
    setRoute("landing");
    setAuthMode("login");
    setShowAuth(false);
  };

  const handleEntryCreated = (): void => {
    if (user?.token) {
      void loadDashboardData(user.token);
    }

    window.dispatchEvent(new Event("entriesChanged"));
  };

  const handleMobileTabChange = (tab: MobileTab): void => {
    setMobileTab(tab);

    if (route === "tools" || route === "dialogues") {
      setRoute("backend");
    }
  };

  if (checking) {
    return (
      <div className="app">
        <p>Loading...</p>
      </div>
    );
  }

  const showToolPage = route === "tools" && user;
  const showDialoguePage = route === "dialogues" && user;
  const showMainTabs = !showToolPage && !showDialoguePage;

  return (
    <div className="app">
      {route === "landing" ? (
        <HomePage
          onStartHere={() => {
            setAuthMode("register");
            setShowAuth(true);
          }}
        />
      ) : (
        <section className="app-shell">
          <AppHeader onEntryCreated={handleEntryCreated} />

          {showToolPage && <ToolsPage />}
          {showDialoguePage && <NovelPage />}

          {showMainTabs && (
            <>
              {mobileTab === "today" && (
                <TodayPage
                  entries={entries}
                  insights={insights}
                  loading={dashboardLoading}
                  error={dashboardError}
                />
              )}
              {mobileTab === "history" && <HistoryPage />}
              {mobileTab === "profile" && (
                <ProfilePage user={user ?? undefined} onLogout={handleLogout} />
              )}
              {mobileTab === "about" && <About />}
            </>
          )}

          <BottomNav activeTab={mobileTab} onTabChange={handleMobileTabChange} />
        </section>
      )}

      {showAuth && (
        <AuthModal
          initialMode={authMode === "signup" ? "register" : authMode}
          disableClose={false}
          onClose={() => {
            setShowAuth(false);
          }}
          onAuthed={handleAuthed}
        />
      )}
    </div>
  );
}

export default App;
