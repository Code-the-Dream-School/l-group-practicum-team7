import { useEffect, useState } from "react";
const API = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export default function Insights() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("No token found. Please log in again.");
      setLoading(false);
      return;
    }

    fetch(`${API}/api/insights`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch insights: ${res.status}`);
        }

        return res.json();
      })
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching insights:", err);
        setError(err.message || "Error fetching insights");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading insights...</p>;
  if (error) return <p>{error}</p>;
  if (!data) return <p>No data available</p>;

  const insights = data.insights || {};

  return (
    <div style={styles.container}>
      <h2>Insights Dashboard</h2>

      {/* today */}

      <div style={styles.card}>
        <h3>Today</h3>
        <p>Stress: {data.today?.stress}</p>
        <p>Sleep: {data.today?.sleep} hrs</p>
        <p>Energy: {data.today?.energy}</p>
        <p>Burnout Score: {data.today?.burnoutScore}</p>
        <p>Burnout Level: {data.today?.burnoutLevel}</p>

        <h4>Today Insights</h4>
        {insights.today?.length ? (
          <ul>
            {insights.today.map((i: string, idx: number) => (
              <li key={idx}>{i}</li>
            ))}
          </ul>
        ) : (
          <p>No today insights</p>
        )}
      </div>

      {/* averages */}
      <div style={styles.card}>
        <h3>Averages</h3>
        <p>2-Day Stress: {data.averages?.last2DaysStress?.toFixed(2)}</p>
        <p>7-Day Stress: {data.averages?.last7DaysStress?.toFixed(2)}</p>
        <p>7-Day Energy: {data.averages?.last7DaysEnergy?.toFixed(2)}</p>
        <p>7-Day Burnout: {data.averages?.last7DaysBurnout?.toFixed(2)}</p>
      </div>

      {/* trend */}
      <div style={styles.card}>
        <h3>Trend</h3>
        {insights.trend?.length ? (
          <ul>
            {insights.trend.map((i: string, idx: number) => (
              <li key={idx}>{i}</li>
            ))}
          </ul>
        ) : (
          <p>No trend insights</p>
        )}
      </div>

      {/* weekly */}
      <div style={styles.card}>
        <h3>Weekly</h3>
        {insights.weekly?.length ? (
          <ul>
            {insights.weekly.map((i: string, idx: number) => (
              <li key={idx}>{i}</li>
            ))}
          </ul>
        ) : (
          <p>No weekly insights</p>
        )}
      </div>

      {/* advanced */}
      <div style={styles.card}>
        <h3>Advanced Insights</h3>
        {insights.advanced?.length ? (
          <ul>
            {insights.advanced.map((i: string, idx: number) => (
              <li key={idx}>{i}</li>
            ))}
          </ul>
        ) : (
          <p>No advanced insights</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "600px",
    margin: "20px auto",
    fontFamily: "Arial",
  },
  card: {
    border: "1px solid #ccc",
    borderRadius: "10px",
    padding: "15px",
    marginBottom: "15px",
    background: "#f9f9f9",
  },
};