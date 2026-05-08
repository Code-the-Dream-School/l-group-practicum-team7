import AppHeader from './components/AppHeader';
import BottomNav from './components/BottomNav';
import TodayPage from './pages/TodayPage';
import DailyLog from "./components/daily-log/DailyLog";

import './styles/App.css';

function App() {
  return (
    <div className="app-shell">
      <AppHeader />
      <TodayPage />
      <BottomNav />
      <DailyLog />
    </div>
  );
}

export default App;