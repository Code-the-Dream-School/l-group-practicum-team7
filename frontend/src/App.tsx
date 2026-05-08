import AppHeader from './components/AppHeader';
import BottomNav from './components/BottomNav';
import TodayPage from './pages/TodayPage';

import './styles/App.css';

function App() {
  return (
    <div className="app-shell">
      <AppHeader />
      <TodayPage />
      <BottomNav />
    </div>
  );
}

export default App;