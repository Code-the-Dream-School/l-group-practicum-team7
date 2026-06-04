import { useState } from 'react';
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Home,
  Info,
  MessageCircle,
  PawPrint,
  Wrench,
} from 'lucide-react';

import './RightNavDrawer.css';

export type DrawerRoute =
  | 'backend'
  | 'home'
  | 'today'
  | 'history'
  | 'profile'
  | 'about'
  | 'auth'
  | 'tools'
  | 'insights'
  | 'dialogues'
  | 'novel'
  | 'checkout'
  | 'checkout_success';

type RightNavDrawerProps = {
  user?: {
    email?: string;
    name?: string;
    username?: string;
  } | null;
  activeRoute?: DrawerRoute;
  onNavigate: (route: DrawerRoute) => void;
  onLogout?: () => void;
};

const navItems: Array<{
  route: DrawerRoute;
  label: string;
  icon: typeof Home;
}> = [
  {
    route: 'profile',
    label: 'Profile',
    icon: CircleUserRound,
  },
  {
    route: 'backend',
    label: 'Dashboard',
    icon: Home,
  },
  {
    route: 'history',
    label: 'History',
    icon: Clock3,
  },
  {
    route: 'about',
    label: 'About',
    icon: Info,
  },
  {
    route: 'dialogues',
    label: 'Dialogues',
    icon: MessageCircle,
  },
  {
    route: 'tools',
    label: 'Tools',
    icon: Wrench,
  },
];

function RightNavDrawer({
  user,
  activeRoute = 'backend',
  onNavigate,
  onLogout,
}: RightNavDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const displayName = user?.name || user?.username || 'User';
  const displayEmail = user?.email || 'No email';

  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  function handleNavigate(route: DrawerRoute) {
    onNavigate(route);
    setIsOpen(false);
  }

  function isRouteActive(route: DrawerRoute) {
    if ((activeRoute === 'home' || activeRoute === 'today') && route === 'backend') {
      return true;
    }

    if (activeRoute === 'novel' && route === 'dialogues') {
      return true;
    }

    return activeRoute === route;
  }

  return (
    <>
      <aside className={`right-drawer ${isOpen ? 'open' : ''}`}>
        <div className="right-drawer-brand">
          <div className="right-drawer-brand-mark">
            <Activity aria-hidden="true" />
          </div>

          <span>PulseMind</span>
        </div>

        <nav className="right-drawer-nav" aria-label="Drawer navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isRouteActive(item.route);

            return (
              <button
                key={item.route}
                type="button"
                className={active ? 'active' : undefined}
                onClick={() => handleNavigate(item.route)}
                aria-current={active ? 'page' : undefined}
              >
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="right-drawer-bottom">
          <div className="right-drawer-user">
            <div className="right-drawer-user-avatar">{initials}</div>

            <div>
              <strong>{displayName}</strong>
              <span>{displayEmail}</span>
            </div>
          </div>

          {onLogout && (
            <button
              type="button"
              className="right-drawer-logout"
              onClick={onLogout}
            >
              Logout
            </button>
          )}
        </div>
      </aside>

      <button
        type="button"
        className={`right-drawer-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen((current) => !current)}
        aria-label={isOpen ? 'Close navigation drawer' : 'Open navigation drawer'}
      >
        {isOpen ? (
          <ChevronLeft aria-hidden="true" />
        ) : (
          <ChevronRight aria-hidden="true" />
        )}
      </button>

      {isOpen && (
        <button
          type="button"
          className="right-drawer-backdrop"
          onClick={() => setIsOpen(false)}
          aria-label="Close navigation drawer"
        />
      )}
    </>
  );
}

export default RightNavDrawer;
