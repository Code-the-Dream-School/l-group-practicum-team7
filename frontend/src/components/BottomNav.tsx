import { Activity, CircleUserRound, History } from 'lucide-react';

function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      <a href="#" className="active" aria-current="page">
        <Activity aria-hidden="true" />
        Today
      </a>
      <a href="#">
        <History aria-hidden="true" />
        History
      </a>
      <a href="#">
        <CircleUserRound aria-hidden="true" />
        Profile
      </a>
    </nav>
  );
}

export default BottomNav;
