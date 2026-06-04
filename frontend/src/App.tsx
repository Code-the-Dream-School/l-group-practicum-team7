import React, { useCallback, useEffect, useRef, useState } from "react";

import AuthModal from "./components/Auth/AuthModal";
Limport About from "./pages/About";
import ToolsPage from "./pages/ToolsPage";
import NovelPage from "./pages/NovelPage";
import HomePage from "./pages/Home";
import CheckoutPage from "./pages/CheckoutPage";
import CheckoutPageSuccess from "./pages/CheckoutPageSuccess";

import AppHeader from "./components/Layout/AppHeader";
import RightNavDrawer, { type DrawerRoute } from "./components/Layout/RightNavDrawer";
import TodayPage from "./pages/TodayPage";
import HistoryPage from "./pages/HistoryPage";
import ProfilePage from "./pages/ProfilePage";

import { getEntries, getInsights } from "./services/wellnessApi";
import type { Entry, InsightsResponse } from "./types/wellness";
import { clearToolDialogueStorage } from "./utils/clearToolDialogueStorage";

import "./App.css";
import "./styles/App.css";

const API: string = import.meta.env.VITE_API_BASE || "http://localhost:8080";

type AuthMode = "login" | "register" | "signup";
type MobileTab = "today" | "history" | "profile" | "info";

type Route =
  | "backend"
  | "about"
  | "search"
  | "auth"
  | "tools"
  | "dialogues"
  | "novel"
  | "landing"
  | "checkout"
  | "checkout_success";

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
  const [checking, setChecking] = useState<boolean>(() =>
    Boolean(localStorage.getItem("token")),
  );
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [route, setRoute] = useState<Route>("landing");
  const [mobileTab, setMobileTab] = useState<MobileTab>("today");

  const [entries, setEntries] = useState<Entry[]>([]);
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState<boolean>(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const [pendingRoute, setPendingRoute] = useState<Route | null>(null);
  const [lastOrderId, setLastOrderId] = useState<string>("");
  const [isPremium, setIsPremium] = useState<boolean>(false);

  const authRequestId = useRef<number>(0);
  const dashboardRequestId = useRef<number>(0);

  const isCheckoutRoute = route === "checkout" || route === "checkout_success";

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

      const message =
        error instanceof Error ? error.message : "Unable to load dashboard data";

      setDashboardError(message);
    } finally {
      if (requestId === dashboardRequestId.current) {
        setDashboardLoading(false);
      }
    }
  }, []);

  const resetDashboardData = useCallback(() => {
    dashboardRequestId.current += 1;
    setEntries([]);
    setInsights(null);
    setDashboardLoading(false);
    setDashboardError(null);
  }, []);

  const syncPremiumStatus = useCallback(async (token?: string) => {
    const activeToken = token || localStorage.getItem("token");

    if (!activeToken) {
      setIsPremium(false);
      return;
    }

    try {
      const response = await fetch(`${API}/api/subscription/me`, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });

      if (!response.ok) {
        setIsPremium(false);
        return;
      }

      const data = await response.json();

      setIsPremium(data?.premium === true);
    } catch {
      setIsPremium(false);
    }
  }, []);

  useEffect(() => {
    const onOpenTools = () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setPendingRoute("tools");
        setAuthMode("login");
        setShowAuth(true);
        setRoute("auth");
        return;
      }

      setRoute("tools");
    };

    const onOpenCheckout = () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setPendingRoute("checkout");
        setAuthMode("login");
        setShowAuth(true);
        setRoute("auth");
        return;
      }

      setRoute("checkout");
    };

    const onCheckoutSuccess = async (event: Event) => {
      const customEvent = event as CustomEvent<{ orderId?: string }>;

      setLastOrderId(customEvent.detail?.orderId || "");
      await syncPremiumStatus();
      setRoute("checkout_success");
    };

    window.addEventListener("openTools", onOpenTools);
    window.addEventListener("openCheckout", onOpenCheckout);
    window.addEventListener("checkoutSuccess", onCheckoutSuccess);

    return () => {
      window.removeEventListener("openTools", onOpenTools);
      window.removeEventListener("openCheckout", onOpenCheckout);
      window.removeEventListener("checkoutSuccess", onCheckoutSuccess);
    };
  }, [syncPremiumStatus]);

  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem("token");
    const requestId = authRequestId.current + 1;

    authRequestId.current = requestId;

    if (!token) {
      setUser(null);
      setIsPremium(false);
      resetDashboardData();
      setChecking(false);
      setRoute("landing");
      setAuthMode("login");
      setShowAuth(false);

      return () => {
        controller.abort();
      };
    }

    fetch(`${API}/api/auth/me`, {
      signal: controller.signal,
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
        if (requestId !== authRequestId.current) {
          return;
        }

        setUser({ ...userData, token });
        setRoute("backend");
        setMobileTab("today");

        void loadDashboardData(token);
        void syncPremiumStatus(token);
      })
      .catch(() => {
        if (controller.signal.aborted || requestId !== authRequestId.current) {
          return;
        }

        localStorage.removeItem("token");
        localStorage.removeItem("premiumStatus");
        clearToolDialogueStorage();

        setUser(null);
        setIsPremium(false);
        setPendingRoute(null);
        resetDashboardData();
        setRoute("landing");
        setAuthMode("login");
        setShowAuth(false);
      })
      .finally(() => {
        if (!controller.signal.aborted && requestId === authRequestId.current) {
          setChecking(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [loadDashboardData, resetDashboardData, syncPremiumStatus]);

  const handleAuthed = (userData: User | null): void => {
    setUser(userData);

    if (userData?.token) {
      localStorage.setItem("token", userData.token);
      void loadDashboardData(userData.token);
      void syncPremiumStatus(userData.token);
    }

    window.dispatchEvent(new Event("authChanged"));
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
    localStorage.removeItem("premiumStatus");
    clearToolDialogueStorage();

    authRequestId.current += 1;

    setUser(null);
    setIsPremium(false);
    setPendingRoute(null);
    setLastOrderId("");
    setMobileTab("today");
    resetDashboardData();
    setRoute("landing");
    setAuthMode("login");
    setShowAuth(false);

    window.dispatchEvent(new Event("authChanged"));
  };

  const handleEntryCreated = (): void => {
    const token = user?.token || localStorage.getItem("token");

    if (token) {
      void loadDashboardData(token);
    }

    try {
      window.dispatchEvent(
        new CustomEvent("insights.entry", {
          detail: { text: "" },
        }),
      );
    } catch {}
  };

  const renderProtectedRoute = (content: React.ReactElement) => {
    if (!user) {
      return <p>Please log in to continue.</p>;
    }

    return content;
  };

  const activeMobileTab = mobileTab as string;

  function getDrawerActiveRoute(): DrawerRoute {
    if (route === "checkout" || route === "checkout_success") {
      return route;
    }

    if (route === "tools") {
      return "tools";
    }

    if (route === "dialogues" || route === "novel") {
      return "dialogues";
    }

    if (route === "about") {
      return "about";
    }

    if (route === "auth") {
      return "auth";
    }

    if (activeMobileTab === "history") {
      return "history";
    }

    if (activeMobileTab === "profile") {
      return "profile";
    }

    if (activeMobileTab === "info" || activeMobileTab === "about") {
      return "about";
    }

    return "backend";
  }

  function handleDrawerNavigate(nextRoute: DrawerRoute): void {
    if (!user && nextRoute !== "about") {
      const protectedRoute =
        nextRoute === "novel"
          ? "dialogues"
          : nextRoute === "today" || nextRoute === "history" || nextRoute === "profile"
            ? "backend"
            : nextRoute;

      setPendingRoute(protectedRoute as Route);
      setAuthMode("login");
      setShowAuth(true);
      setRoute("auth");
      return;
    }

    if (nextRoute === "backend" || nextRoute === "home" || nextRoute === "today") {
      setRoute("backend");
      setMobileTab("today");
      return;
    }

    if (nextRoute === "history") {
      setRoute("backend");
      setMobileTab("history");
      return;
    }

    if (nextRoute === "profile") {
      setRoute("backend");
      setMobileTab("profile");
      return;
    }

    if (nextRoute === "about") {
      setRoute("backend");
      setMobileTab("info" as MobileTab);
      return;
    }

    if (nextRoute === "dialogues" || nextRoute === "novel") {
      setRoute("dialogues");
      return;
    }

    if (nextRoute === "tools") {
      setRoute("tools");
      return;
    }

    if (nextRoute === "checkout" || nextRoute === "checkout_success") {
      setRoute(nextRoute);
    }
  }

  if (checking) {
    return (
      <div className="app">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {route === "landing" && (
        <HomePage
          onStartHere={() => {
            setAuthMode("register");
            setShowAuth(true);
            setRoute("auth");
          }}
        />
      )}

      {route !== "landing" && (
        <section className="app-shell">
          <AppHeader onEntryCreated={handleEntryCreated} />

          {route === "checkout" && user && (
            <CheckoutPage
              onSuccess={async (orderId) => {
                setLastOrderId(orderId);
                await syncPremiumStatus();
                setRoute("checkout_success");
              }}
              onCancel={() => {
                setRoute("backend");
                setMobileTab("profile");
              }}
            />
          )}

          {route === "checkout_success" && (
            <CheckoutPageSuccess
              orderId={lastOrderId}
              onGoProfile={() => {
                setMobileTab("profile");
                setRoute("backend");
              }}
            />
          )}

          {!isCheckoutRoute && route === "backend" && (
            <>
              {activeMobileTab === "today" && (
                <TodayPage
                  entries={entries}
                  insights={insights}
                  loading={dashboardLoading}
                  error={dashboardError}
                />
              )}

              {activeMobileTab === "history" && <HistoryPage />}

              {activeMobileTab === "profile" && (
                <ProfilePage
                  user={user ?? undefined}
                  onLogout={handleLogout}
                  isPremium={isPremium}
                  onOpenCheckout={() => setRoute("checkout")}
                />
              )}

              {(activeMobileTab === "info" || activeMobileTab === "about") && (
                <About />
              )}
            </>
          )}

          {!isCheckoutRoute &&
            route === "dialogues" &&
            renderProtectedRoute(<NovelPage />)}

          {!isCheckoutRoute &&
            route === "tools" &&
            renderProtectedRoute(<ToolsPage />)}

          {!isCheckoutRoute && route === "about" && <About />}

          {!isCheckoutRoute && route === "search" && (
            user ? <p>Search page placeholder</p> : <p>Please log in to continue.</p>
          )}

          {!isCheckoutRoute && route === "auth" && !user && (
            <p>Please log in to continue.</p>
          )}
        </section>
      )}

      {user && route !== "landing" && (
        <RightNavDrawer
          user={user}
          activeRoute={getDrawerActiveRoute()}
          onNavigate={handleDrawerNavigate}
          onLogout={handleLogout}
        />
      )}

      {showAuth && (
        <AuthModal
          initialMode={authMode === "signup" ? "register" : authMode}
          disableClose={false}
          onClose={() => {
            setShowAuth(false);

            if (!user && route === "auth") {
              setRoute("landing");
            }
          }}
          onAuthed={handleAuthed}
        />
      )}
    </div>
  );
}

export default App;

