import React from 'react';

type ProfilePageProps = {
  user?: { email?: string; name?: string; username?: string } | null;
  onLogout?: () => void;
};

function ProfilePage({ user, onLogout }: ProfilePageProps): React.ReactElement {
  const display = (user?.name || user?.username || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <main className="page-content">
      <section className="page-section">
        <h1>Profile</h1>
        <p className="page-muted">Your account and app settings.</p>

        <div className="profile-card">
          <div className="profile-avatar">{display}</div>

          <div>
            <h2>{user?.name || user?.username || 'User'}</h2>
            <p>{user?.email || 'No email available'}</p>
          </div>
        </div>

        <div className="profile-card profile-card-column">
          <h2>Preferences</h2>
          <p>Theme, reminders, and personal settings can be added here later.</p>
        </div>

        {onLogout && (
          <button type="button" className="profile-logout-button" onClick={onLogout}>
            Logout
          </button>
        )}
      </section>
    </main>
  );
}

export default ProfilePage;
