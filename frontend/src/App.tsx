import React, { useCallback, useEffect, useRef, useState } from "react";

import AuthModal from "./components/Auth/AuthModal";
import About from "./pages/About";
import ToolsPage from "./pages/ToolsPage";
import NovelPage from "./pages/NovelPage";
import HomePage from "./pages/Home";
import CheckoutPage from "./pages/CheckoutPage";
import CheckoutPageSuccess from "./pages/CheckoutPageSuccess";
import NotFoundPage from "./pages/NotFoundPage";

import AppHeader from "./components/Layout/AppHeader";
import RightNavDrawer, { type DrawerRoute } from "./components/Layout/RightNavDrawer";
import TodayPage, { type TodayCounts, type TodayNavigateTarget } from "./pages/TodayPage";
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
  | "insights"
  | "landing"
  | "checkout"
  | "checkout_success"
  | "notFound";

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
type ResolvedPathRoute = DrawerRoute | "landing" | "notFound";

const drawerRouteToPath: Partial<Record<DrawerRoute, string>> = {
  backend: "/dashboard",
  today: "/dashboard",
  home: "/dashboard",
  history: "/history",
  dialogues: "/dialogues",
  novel: "/dialogues",
  tools: "/tools",
  profile: "/profile",
  about: "/about",
  checkout: "/checkout",
  checkout_success: "/checkout/success",
  auth: "/auth",
};

function pathToAppRoute(pathname: string): ResolvedPathRoute {
  if (pathname === "/") return "landing";
  if (pathname === "/dashboard") return "backend";
  if (pathname === "/history") return "history";
  if (pathname === "/dialogues") return "dialogues";
  if (pathname === "/tools") return "tools";
  if (pathname === "/profile") return "profile";
  if (pathname === "/about") return "about";
  if (pathname === "/checkout/success") return "checkout_success";
  if (pathname === "/checkout") return "checkout";
  if (pathname === "/auth") return "auth";

  return "notFound";
}

function updateBrowserPath(route: DrawerRoute, replace = false) {
  const nextPath = drawerRouteToPath[route] || "/dashboard";

  if (window.location.pathname === nextPath) {
    return;
  }

  if (replace) {
    window.history.replaceState({}, "", nextPath);
    return;
  }

  window.history.pushState({}, "", nextPath);
}

function getArrayFromResponse(data: unknown, keys: string[]) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];

  const record = data as Record<string, unknown>;

  for (const key of keys) {
    if (Array.isArray(record[key])) {
      return record[key] as unknown[];
    }
  }

  return [];
}

async function readJsonSafely(response: Response | null) {
  if (!response || !response.ok) return null;

  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function loadTodayCounts(token: string): Promise<TodayCounts> {
  const [dialoguesResponse, toolsResponse] = await Promise.all([
    fetch(`${API}/api/dialogues/available`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).catch(() => null),
    fetch(`${API}/api/dialogues/tools`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).catch(() => null),
  ]);

  const dialoguesResult = await readJsonSafely(dialoguesResponse);
  const toolsResult = await readJsonSafely(toolsResponse);

  const dialogueCount = getArrayFromResponse(dialoguesResult, [
    "dialogues",
    "availableDialogues",
    "available",
    "items",
  ]).length;

  const toolCount = getArrayFromResponse(toolsResult, [
    "tools",
    "unlockedTools",
    "availableTools",
    "items",
  ]).length;

  return {
    dialogueCount,
    toolCount,
  };
}

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
  const [todayCounts, setTodayCounts] = useState<TodayCounts>({
    dialogueCount: 0,
    toolCount: 0,
  });
  const [dashboardLoading, setDashboardLoading] = useState<boolean>(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const [pendingRoute, setPendingRoute] = useState<Route | null>(null);
  const [lastOrderId, setLastOrderId] = useState<string>("");
  const [isPremium, setIsPremium] = useState<boolean>(false);

  const authRequestId = useRef<number>(0);
  const dashboardRequestId = useRef<number>(0);

  const isCheckoutRoute = route === "checkout" || route === "checkout_success";

  const resetDashboardData = useCallback(() => {
    dashboardRequestId.current += 1;
    setEntries([]);
    setInsights(null);
    setTodayCounts({
      dialogueCount: 0,
      toolCount: 0,
    });
    setDashboardLoading(false);
    setDashboardError(null);
  }, []);

  const loadDashboardData = useCallback(async (token: string): Promise<void> => {
    const requestId = dashboardRequestId.current + 1;
    dashboardRequestId.current = requestId;

    setDashboardLoading(true);
    setDashboardError(null);

    try {
      const [savedEntries, generatedInsights, loadedCounts] = await Promise.all([
        getEntries(token),
        getInsights(token),
        loadTodayCounts(token),
      ]);

      if (requestId !== dashboardRequestId.current) {
        return;
      }

      setEntries(savedEntries);
      setInsights(generatedInsights);
      setTodayCounts(loadedCounts);
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

  const goToDashboardTab = useCallback((tab: MobileTab) => {
    setRoute("backend");
    setMobileTab(tab);
  }, []);

  const goToDashboard = useCallback((shouldPush = true) => {
    setRoute("backend");
    setMobileTab("today");

    if (shouldPush) {
      updateBrowserPath("backend");
    }
  }, []);

  const handleNovelNavigate = useCallback(
    (nextRoute: string) => {
      if (nextRoute === "dashboard" || nextRoute === "today" || nextRoute === "entries") {
        goToDashboard(true);
        return;
      }

      if (nextRoute === "tools") {
        setRoute("tools");
        updateBrowserPath("tools");
        return;
      }

      if (nextRoute === "dialogues" || nextRoute === "novel") {
        setRoute("dialogues");
        updateBrowserPath("dialogues");
      }
    },
    [goToDashboard],
  );

  function handleDrawerNavigate(nextRoute: DrawerRoute, shouldPush = true): void {
    const token = localStorage.getItem("token");

    if (!user && !token && nextRoute !== "about") {
      setPendingRoute(
        nextRoute === "history" ||
          nextRoute === "profile" ||
          nextRoute === "backend" ||
          nextRoute === "today" ||
          nextRoute === "home"
          ? "backend"
          : nextRoute,
      );

      setAuthMode("login");
      setShowAuth(true);
      setRoute("auth");

      if (shouldPush) {
        updateBrowserPath("auth");
      }

      return;
    }

    if (nextRoute === "backend" || nextRoute === "today" || nextRoute === "home") {
      setRoute("backend");
      setMobileTab("today");

      if (shouldPush) {
        updateBrowserPath("backend");
      }

      return;
    }

    if (nextRoute === "history") {
      setRoute("backend");
      setMobileTab("history");

      if (shouldPush) {
        updateBrowserPath("history");
      }

      return;
    }

    if (nextRoute === "profile") {
      setRoute("backend");
      setMobileTab("profile");

      if (shouldPush) {
        updateBrowserPath("profile");
      }

      return;
    }

    if (nextRoute === "about") {
      setRoute("backend");
      setMobileTab("info");

      if (shouldPush) {
        updateBrowserPath("about");
      }

      return;
    }

    if (nextRoute === "dialogues" || nextRoute === "novel") {
      setRoute("dialogues");

      if (shouldPush) {
        updateBrowserPath("dialogues");
      }

      return;
    }

    if (nextRoute === "tools") {
      setRoute("tools");

      if (shouldPush) {
        updateBrowserPath("tools");
      }

      return;
    }

    if (nextRoute === "checkout" || nextRoute === "checkout_success") {
      setRoute(nextRoute);

      if (shouldPush) {
        updateBrowserPath(nextRoute);
      }
    }
  }

  useEffect(() => {
    const onOpenTools = () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setPendingRoute("tools");
        setAuthMode("login");
        setShowAuth(true);
        setRoute("auth");
        updateBrowserPath("auth");
        return;
      }

      setRoute("tools");
      updateBrowserPath("tools");
    };

    const onOpenDashboard = () => {
      goToDashboard(true);
    };

    const onOpenCheckout = () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setPendingRoute("checkout");
        setAuthMode("login");
        setShowAuth(true);
        setRoute("auth");
        updateBrowserPath("auth");
        return;
      }

      setRoute("checkout");
      updateBrowserPath("checkout");
    };

    const onCheckoutSuccess = async (event: Event) => {
      const customEvent = event as CustomEvent<{ orderId?: string }>;

      setLastOrderId(customEvent.detail?.orderId || "");
      await syncPremiumStatus();
      setRoute("checkout_success");
      updateBrowserPath("checkout_success");
    };

    window.addEventListener("openTools", onOpenTools);
    window.addEventListener("openDashboard", onOpenDashboard);
    window.addEventListener("openCheckout", onOpenCheckout);
    window.addEventListener("checkoutSuccess", onCheckoutSuccess);

    return () => {
      window.removeEventListener("openTools", onOpenTools);
      window.removeEventListener("openDashboard", onOpenDashboard);
      window.removeEventListener("openCheckout", onOpenCheckout);
      window.removeEventListener("checkoutSuccess", onCheckoutSuccess);
    };
  }, [goToDashboard, syncPremiumStatus]);

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
      setAuthMode("login");
      setShowAuth(false);

      const routeFromPath = pathToAppRoute(window.location.pathname);

      if (routeFromPath === "landing") {
        setRoute("landing");
      } else if (routeFromPath === "about") {
        setRoute("backend");
        setMobileTab("info");
      } else if (routeFromPath === "notFound") {
        setRoute("notFound");
      } else {
        setRoute("landing");
        try {
          window.history.replaceState({}, "", "/");
        } catch {}
      }

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

        const routeFromPath = pathToAppRoute(window.location.pathname);

        if (routeFromPath === "landing") {
          setRoute("backend");
          setMobileTab("today");
          updateBrowserPath("backend", true);
        } else if (routeFromPath === "notFound") {
          setRoute("notFound");
        } else {
          handleDrawerNavigate(routeFromPath, false);
        }

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

        const routeFromPath = pathToAppRoute(window.location.pathname);

        if (routeFromPath === "notFound") {
          setRoute("notFound");
        } else {
          setRoute("landing");
          try {
            window.history.replaceState({}, "", "/");
          } catch {}
        }

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

  useEffect(() => {
    if (checking) {
      return;
    }

    const applyCurrentPath = () => {
      const routeFromPath = pathToAppRoute(window.location.pathname);

      if (routeFromPath === "notFound") {
        setRoute("notFound");
        return;
      }

      if (routeFromPath === "landing") {
        if (user) {
          goToDashboard(false);
        } else {
          setRoute("landing");
        }

        return;
      }

      if (!user && routeFromPath !== "about") {
        setPendingRoute(
          routeFromPath === "history" ||
            routeFromPath === "profile" ||
            routeFromPath === "backend" ||
            routeFromPath === "today" ||
            routeFromPath === "home"
            ? "backend"
            : routeFromPath,
        );

        setAuthMode("login");
        setShowAuth(true);
        setRoute("auth");
        return;
      }

      handleDrawerNavigate(routeFromPath, false);
    };

    applyCurrentPath();

    window.addEventListener("popstate", applyCurrentPath);

    return () => {
      window.removeEventListener("popstate", applyCurrentPath);
    };
  }, [checking, user, goToDashboard]);

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
      if (pendingRoute === "backend") {
        setRoute("backend");
        setMobileTab("today");
        updateBrowserPath("backend");
      } else if (pendingRoute === "tools") {
        setRoute("tools");
        updateBrowserPath("tools");
      } else if (pendingRoute === "dialogues" || pendingRoute === "novel") {
        setRoute("dialogues");
        updateBrowserPath("dialogues");
      } else if (pendingRoute === "checkout") {
        setRoute("checkout");
        updateBrowserPath("checkout");
      } else {
        setRoute(pendingRoute);
      }

      setPendingRoute(null);
    } else {
      setRoute("backend");
      setMobileTab("today");
      updateBrowserPath("backend");
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

    try {
      window.history.replaceState({}, "", "/");
    } catch {}

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

  function handleTodayNavigate(nextRoute: TodayNavigateTarget): void {
    if (nextRoute === "dialogues") {
      setRoute("dialogues");
      updateBrowserPath("dialogues");
      return;
    }

    if (nextRoute === "tools") {
      setRoute("tools");
      updateBrowserPath("tools");
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
          }}
        />
      )}

      {route === "notFound" && (
        <NotFoundPage onNavigate={() => handleDrawerNavigate("backend")} />
      )}

      {route !== "landing" && route !== "notFound" && (
        <section className="app-shell">
          <AppHeader onEntryCreated={handleEntryCreated} />

          {route === "checkout" && user && (
            <CheckoutPage
              onSuccess={async (orderId) => {
                setLastOrderId(orderId);
                await syncPremiumStatus();
                setRoute("checkout_success");
                updateBrowserPath("checkout_success");
              }}
              onCancel={() => {
                setRoute("backend");
                setMobileTab("profile");
                updateBrowserPath("profile");
              }}
            />
          )}

          {route === "checkout_success" && (
            <CheckoutPageSuccess
              orderId={lastOrderId}
              onGoProfile={() => {
                setMobileTab("profile");
                setRoute("backend");
                updateBrowserPath("profile");
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
                  todayCounts={todayCounts}
                  onNavigate={handleTodayNavigate}
                />
              )}

              {activeMobileTab === "history" && <HistoryPage />}

              {activeMobileTab === "profile" && (
                <ProfilePage
                  user={user ?? undefined}
                  onLogout={handleLogout}
                  isPremium={isPremium}
                  onOpenCheckout={() => {
                    setRoute("checkout");
                    updateBrowserPath("checkout");
                  }}
                />
              )}

              {(activeMobileTab === "info" || activeMobileTab === "about") && (
                <About />
              )}
            </>
          )}

          {!isCheckoutRoute &&
            route === "dialogues" &&
            renderProtectedRoute(<NovelPage onNavigate={handleNovelNavigate} />)}

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

      {user && route !== "landing" && route !== "notFound" && (
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

              try {
                window.history.replaceState({}, "", "/");
              } catch {}
            }
          }}
          onAuthed={handleAuthed}
        />
      )}
    </div>
  );
}

export default App;