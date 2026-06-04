import { Activity, CircleUserRound, History, Info } from 'lucide-react';

export type MobileTab = 'today' | 'history' | 'about' | 'profile';

type BottomNavProps = {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
};

function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      <button
        type="button"
        className={activeTab === 'today' ? 'active' : ''}
        aria-current={activeTab === 'today' ? 'page' : undefined}
        onClick={() => onTabChange('today')}
      >
        <Activity aria-hidden="true" />
        Today
      </button>

      <button
        type="button"
        className={activeTab === 'history' ? 'active' : ''}
        aria-current={activeTab === 'history' ? 'page' : undefined}
        onClick={() => onTabChange('history')}
      >
        <History aria-hidden="true" />
        History
      </button>

      <button
        type="button"
        className={activeTab === 'profile' ? 'active' : ''}
        aria-current={activeTab === 'profile' ? 'page' : undefined}
        onClick={() => onTabChange('profile')}
      >
        <CircleUserRound aria-hidden="true" />
        Profile
      </button>

      <button
        type="button"
        className={activeTab === 'about' ? 'active' : ''}
        aria-current={activeTab === 'about' ? 'page' : undefined}
        onClick={() => onTabChange('about')}
      >
        <Info aria-hidden="true" />
        Info
      </button>
    </nav>
  );
}

export default BottomNav;
