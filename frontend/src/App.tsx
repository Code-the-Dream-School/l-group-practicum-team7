import React, { useCallback, useEffect, useRef, useState } from "react";

import AuthModal from "./components/AuthModal";
import AppHeader from "./components/AppHeader";
import BottomNav, { type MobileTab } from "./components/BottomNav";
import TodayPage from "./pages/TodayPage";
import HistoryPage from "./pages/HistoryPage";
import ProfilePage from "./pages/ProfilePage";
import { getEntries, getInsights } from "./services/wellnessApi";
import type { Entry, InsightsResponse } from "./types/wellness";

import "./App.css";
import "./styles/App.css";

const API: string = import.meta.env.VITE_API_BASE || "http://localhost:8080";

type User = {
  email?: string;
  name?: string;
  token?: string;
  username?: string;
  [key: string]: unknown;
};

type MeResponse = Record<string, unknown>;

function App(): React.ReactElement {
  const [checking, setChecking] = useState<boolean>(() => Boolean(localStorage.getItem("token")));
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState<boolean>(() => !localStorage.getItem("token"));
  const [mobileTab, setMobileTab] = useState<MobileTab>("today");
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
    } finally {
      if (requestId === dashboardRequestId.current) {
        setDashboardLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
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
        void loadDashboardData(token);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
        setShowAuth(true);
      })
      .finally(() => {
        setChecking(false);
      });
  }, [loadDashboardData]);

  const handleAuthed = (userData: User | null): void => {
    setUser(userData);

    if (userData?.token) {
      localStorage.setItem("token", userData.token);
      void loadDashboardData(userData.token);
    }

    setShowAuth(false);
  };

  const handleLogout = (): void => {
    localStorage.removeItem("token");
    dashboardRequestId.current += 1;
    setUser(null);
    setEntries([]);
    setInsights(null);
    setDashboardLoading(false);
    setDashboardError(null);
    setShowAuth(true);
  };

  const handleEntryCreated = (): void => {
    if (user?.token) {
      void loadDashboardData(user.token);
    }
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
        <AppHeader onEntryCreated={handleEntryCreated} />

        {mobileTab === "today" && (
          <TodayPage
            entries={entries}
            insights={insights}
            loading={dashboardLoading}
            error={dashboardError}
          />
        )}
        {mobileTab === "history" && (
          <HistoryPage entries={entries} loading={dashboardLoading} error={dashboardError} />
        )}
        {mobileTab === "profile" && (
          <ProfilePage user={user ?? undefined} onLogout={handleLogout} />
        )}

        <BottomNav activeTab={mobileTab} onTabChange={setMobileTab} />
      </section>

      {showAuth && (
        <AuthModal
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
