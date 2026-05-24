import React, { useState } from "react";

const API = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export default function EntryForm({ onEntryCreated }) {
  const [form, setForm] = useState({
    stress: 3,
    workload: 3,
    sleepHours: 7,
    energy: 3,
  });

  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setPending(true);
    setMessage("");
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError("You need to log in first.");
      setPending(false);
      return;
    }

    try {
      const response = await fetch(`${API}/api/entries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.msg || "Failed to create entry");
      }

      setMessage("Entry created successfully.");

      if (onEntryCreated) {
        onEntryCreated(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  };

  return (
    <section style={styles.card}>
      <h2>Create Daily Entry</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          Stress: {form.stress}
          <input
            name="stress"
            type="range"
            min="1"
            max="5"
            value={form.stress}
            onChange={handleChange}
          />
        </label>

        <label style={styles.label}>
          Workload: {form.workload}
          <input
            name="workload"
            type="range"
            min="1"
            max="5"
            value={form.workload}
            onChange={handleChange}
          />
        </label>

        <label style={styles.label}>
          Sleep Hours
          <input
            name="sleepHours"
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={form.sleepHours}
            onChange={handleChange}
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          Energy: {form.energy}
          <input
            name="energy"
            type="range"
            min="1"
            max="5"
            value={form.energy}
            onChange={handleChange}
          />
        </label>

        {error && <p style={styles.error}>{error}</p>}
        {message && <p style={styles.success}>{message}</p>}

        <button type="submit" disabled={pending} style={styles.button}>
          {pending ? "Saving..." : "Create Entry"}
        </button>
      </form>
    </section>
  );
}

const styles = {
  card: {
    maxWidth: "600px",
    margin: "20px auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "12px",
    background: "#f9f9f9",
    fontFamily: "Arial, sans-serif",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    fontWeight: "bold",
  },
  input: {
    padding: "8px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "none",
    background: "#28268b",
    color: "white",
    cursor: "pointer",
  },
  error: {
    color: "crimson",
  },
  success: {
    color: "green",
  },
};