import { useState } from 'react';
import Layout from './components/Layout';
import TodayPage from './pages/TodayPage';
import CalendarPage from './pages/CalendarPage';
import StatsPage from './pages/StatsPage';
import SettingsPage from './pages/SettingsPage';

const PAGES = {
  today: TodayPage,
  calendar: CalendarPage,
  stats: StatsPage,
  settings: SettingsPage,
};

export default function App() {
  const [page, setPage] = useState('today');
  const Page = PAGES[page];

  return (
    <Layout active={page} onNavigate={setPage}>
      <Page />
    </Layout>
  );
}
