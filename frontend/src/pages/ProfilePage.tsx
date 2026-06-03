import { useEffect, useState } from 'react';
import { Crown, Lock, LogOut, Mail, Palette, Save, UserRound } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

type ProfilePageProps = {
  user?: {
    email?: string;
    name?: string;
    username?: string;
  } | null;
  onLogout: () => void;
  onOpenCheckout?: () => void;
  isPremium?: boolean;
};

type ProfileResponse = {
  id?: string;
  name?: string;
  email?: string;
};

function ProfilePage({
  user,
  onLogout,
  onOpenCheckout,
  isPremium = false,
}: ProfilePageProps) {
  const [name, setName] = useState(user?.name || user?.username || 'User');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPassword1, setNewPassword1] = useState('');
  const [message, setMessage] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const displayName = name || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    setName(user?.name || user?.username || 'User');
    setEmail(user?.email || '');
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, []);

  function handleOpenCheckout() {
    if (onOpenCheckout) {
      onOpenCheckout();
      return;
    }

    window.dispatchEvent(new CustomEvent('openCheckout'));
  }

  async function loadProfile() {
    const token = localStorage.getItem('token');

    if (!token) return;

    try {
      const response = await fetch(`${API}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data: ProfileResponse = await response.json();

      if (!response.ok) {
        throw new Error('Failed to load profile');
      }

      setName(data.name || 'User');
      setEmail(data.email || '');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to load profile');
    }
  }

  async function saveProfile() {
    const token = localStorage.getItem('token');

    if (!token) {
      setMessage('Please log in again.');
      return;
    }

    setMessage('');
    setIsSavingProfile(true);

    try {
      const response = await fetch(`${API}/api/auth/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to update profile');
      }

      setName(data.name || name);
      setEmail(data.email || email);
      setMessage('Profile updated.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function savePassword() {
    const token = localStorage.getItem('token');

    if (!token) {
      setMessage('Please log in again.');
      return;
    }

    setMessage('');
    setIsSavingPassword(true);

    try {
      const response = await fetch(`${API}/api/auth/me/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          newPassword1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to update password');
      }

      setCurrentPassword('');
      setNewPassword('');
      setNewPassword1('');
      setMessage('Password updated.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setIsSavingPassword(false);
    }
  }

  return (
    <main className="mobile-page profile-page" aria-label="Profile page">
      <section className="compact-page-shell">
        <section className="page-hero compact-hero">
          <p className="page-eyebrow">Account center</p>
          <h1>Profile</h1>
          <p>Your account and app settings.</p>
        </section>

        {message && <div className="profile-message">{message}</div>}

        <section className="profile-card profile-user-card">
          <div className="profile-avatar" aria-hidden="true">
            {initial}
          </div>

          <div className="profile-user-info">
            <h2>{displayName}</h2>
            <p>
              <Mail size={16} aria-hidden="true" />
              {email || 'No email available'}
            </p>
          </div>
        </section>

        <section className="profile-card profile-form-card">
          <div className="profile-card-icon">
            <Crown size={22} aria-hidden="true" />
          </div>

          <div className="profile-form-content">
            <h2>PulseMind PRO</h2>

            <p>
              {isPremium
                ? 'Premium is active on your account.'
                : 'Unlock premium features for the demo version of the app.'}
            </p>

            <button
              type="button"
              className="profile-save"
              onClick={handleOpenCheckout}
              disabled={isPremium}
            >
              <Crown size={18} aria-hidden="true" />
              {isPremium ? 'Premium active' : 'Buy premium'}
            </button>
          </div>
        </section>

        <section className="profile-card profile-form-card">
          <div className="profile-card-icon">
            <UserRound size={22} aria-hidden="true" />
          </div>

          <div className="profile-form-content">
            <h2>User details</h2>

            <label>
              Display name
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <button
              type="button"
              className="profile-save"
              onClick={saveProfile}
              disabled={isSavingProfile}
            >
              <Save size={18} aria-hidden="true" />
              {isSavingProfile ? 'Saving...' : 'Save profile'}
            </button>
          </div>
        </section>

        <section className="profile-card profile-form-card">
          <div className="profile-card-icon">
            <Lock size={22} aria-hidden="true" />
          </div>

          <div className="profile-form-content">
            <h2>Password</h2>

            <label>
              Current password
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
            </label>

            <label>
              New password
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </label>

            <label>
              Repeat new password
              <input
                type="password"
                value={newPassword1}
                onChange={(event) => setNewPassword1(event.target.value)}
              />
            </label>

            <button
              type="button"
              className="profile-save"
              onClick={savePassword}
              disabled={isSavingPassword}
            >
              <Save size={18} aria-hidden="true" />
              {isSavingPassword ? 'Saving...' : 'Change password'}
            </button>
          </div>
        </section>

        <section className="profile-card disabled-card">
          <div className="profile-card-icon">
            <Palette size={22} aria-hidden="true" />
          </div>

          <div>
            <h2>Styles</h2>
            <p>Theme customization is not available yet.</p>
          </div>

          <span className="disabled-badge">Soon</span>
        </section>

        <button type="button" className="profile-logout" onClick={onLogout}>
          <LogOut size={20} aria-hidden="true" />
          Logout
        </button>
      </section>
    </main>
  );
}

export default ProfilePage;