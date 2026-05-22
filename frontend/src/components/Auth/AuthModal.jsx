import React, { useState } from "react";
import "./AuthModal.css";

// const API = import.meta.env.VITE_API_BASE || "http://localhost:8080";
const API = import.meta.env.VITE_API_BASE;

export default function AuthModal({ onClose, onAuthed, disableClose=false, initialMode='login' }) {
  const [mode, setMode] = useState(initialMode);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
      password1: form.get("password1"),
    };
    try {
      const url =
        mode === "login" ? `${API}/api/auth/logon` : `${API}/api/auth/register`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Auth failed");
      let me = data.user;
      if (!me && data?.token) {
        me = await fetch(`${API}/api/auth/me`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${data.token}` },
        }).then((r) => (r.ok ? r.json() : null));
      }
      if (me?.email) {
        onAuthed({ ...me, token: data?.token || "" });
        onClose?.();
      } else throw new Error("No user returned");
    } catch (e) {
      setError(e.message);
    } finally {
      setPending(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const email = form.get("email");
    await new Promise((r) => setTimeout(r, 700));
    setPending(false);
    alert(`If ${email} exists, a reset link would be sent (nominal).`);
    setMode("login");
  };

  return (
    <div className="auth-overlay" onClick={() => { if (!disableClose) onClose?.(); }}>
      <div className="auth-card" onClick={(e) => e.stopPropagation()}>
        {!disableClose && <button className="close" onClick={onClose}>X</button>}

        <div className="auth-header">{mode === "login" ? "Login" : mode === "register" ? "SignUp" : mode === "forgot" ? "Forgot password?" : "Reset password"}</div>

        {mode === "forgot" ? (
          <form onSubmit={handleForgot} className="auth-form">
            <label>
              Email
              <input name="email" type="email" required />
            </label>
            <div className="actions">
              <button type="submit" disabled={pending} className="primary">{pending ? "..." : "Send Reset Link"}</button>
              <button type="button" onClick={() => setMode("login")}>Back to Login</button>
            </div>
          </form>
        ) : (
          <>
            <div className="tabs">
              <button className={mode === "login" ? "tab active" : "tab"} onClick={() => setMode("login")}>Login</button>
              <button className={mode === "register" ? "tab active" : "tab"} onClick={() => setMode("register")}>SignUp</button>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {mode === "register" && (
                <label>
                  Name
                  <input name="name" required />
                </label>
              )}
              <label>
                Email
                <input name="email" type="email" required />
              </label>
              <label>
                Password
                <input name="password" type="password" required />
              </label>
              {mode === "register" && (
                <label>
                  Confirm Password
                  <input name="password1" type="password" required />
                </label>
              )}
              {error && <div className="flash error">{error}</div>}
              <div className="actions">
                <button type="submit" disabled={pending} className="primary">{pending ? "..." : mode === "login" ? "Login" : "SignUp"}</button>
              </div>
            </form>

            <div className="aux">
              {mode === "login" && (
                <button className="link" onClick={() => setMode("forgot")}>Forgot password</button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
