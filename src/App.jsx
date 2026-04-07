import { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import Layout from './components/Layout';
import TodayPage from './pages/TodayPage';
import CalendarPage from './pages/CalendarPage';
import StatsPage from './pages/StatsPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';

const PAGES = {
  today: TodayPage,
  calendar: CalendarPage,
  stats: StatsPage,
  settings: SettingsPage,
};

function AppContent() {
  const { user } = useAuth();
  const [page, setPage] = useState('today');

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <span className="font-mono text-[#6b6b8a] text-xs tracking-widest animate-pulse">
          LOADING...
        </span>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  const Page = PAGES[page];
  return (
    <Layout active={page} onNavigate={setPage}>
      <Page />
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
