import React from 'react';
import './About.css';

export default function About() {
  return (
    <div className="about-page">
      <h1>About the Project</h1>

      <p>
        Burnout App is a proactive wellness companion designed to help users identify early signs of
        emotional and physical exhaustion. By monitoring key health indicators—such as stress levels,
        sleep quality, energy, and workload—the application provides data-driven insights to prevent
        burnout before it happens.
      </p>

      <h2>Key Features</h2>
      <ul>
        <li><strong>Vital Tracking:</strong> Monitor stress, sleep, and energy levels in real-time.</li>
        <li><strong>Workload Management:</strong> Keep a pulse on your daily tasks to avoid overextension.</li>
        <li><strong>Smart Recommendations:</strong> Receive personalized actionable advice to maintain your mental well-being.</li>
        <li><strong>Preventative Analytics:</strong> Visual trends to help you understand your state over time.</li>
      </ul>

      <h2>The Development Team</h2>
      <ul>
        <li>Alikhan Amanzhanov</li>
        <li>Eric Vasquez-Reyes</li>
        <li>Mauricio</li>
        <li>Natalia Novikova</li>
        <li>Tegegnwork Checol</li>
      </ul>
    </div>
  );
}
