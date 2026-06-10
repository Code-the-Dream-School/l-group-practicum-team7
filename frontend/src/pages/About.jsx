import React from 'react';
import { Activity, BarChart3, HeartPulse, Lightbulb, ListChecks, UsersRound } from 'lucide-react';
import './About.css';

export default function About() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <span className="about-hero-icon">
          <HeartPulse aria-hidden="true" />
        </span>

        <div>
          <p className="about-eyebrow">PulseMind</p>
          <h1>About the Project</h1>

          <p>
            PluseMind is a proactive wellness companion designed to help users identify early signs of
            emotional and physical exhaustion. By monitoring key health indicators—such as stress levels,
            sleep quality, energy, and workload—the application provides data-driven insights to prevent
            burnout before it happens.
          </p>
        </div>
      </section>

      <section className="about-card">
        <h2>Key Features</h2>
        <ul className="feature-list">
          <li>
            <span className="about-list-icon">
              <Activity aria-hidden="true" />
            </span>
            <span><strong>Vital Tracking:</strong> Monitor stress, sleep, and energy levels in real-time.</span>
          </li>
          <li>
            <span className="about-list-icon">
              <ListChecks aria-hidden="true" />
            </span>
            <span><strong>Workload Management:</strong> Keep a pulse on your daily tasks to avoid overextension.</span>
          </li>
          <li>
            <span className="about-list-icon">
              <Lightbulb aria-hidden="true" />
            </span>
            <span><strong>Smart Recommendations:</strong> Receive personalized actionable advice to maintain your mental well-being.</span>
          </li>
          <li>
            <span className="about-list-icon">
              <BarChart3 aria-hidden="true" />
            </span>
            <span><strong>Preventative Analytics:</strong> Visual trends to help you understand your state over time.</span>
          </li>
        </ul>
      </section>

      <section className="about-card">
        <h2>
          <UsersRound aria-hidden="true" />
          The Development Team
        </h2>
        <ul className="team-list">
          <li>Alikhan Amanzhanov</li>
          <li>Eric Vasquez-Reyes</li>
          <li>Mauricio Morales</li>
          <li>Natalia Novikova</li>
          <li>Tegegnwork Checol</li>
        </ul>
      </section>
    </main>
  );
}
