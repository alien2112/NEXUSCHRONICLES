import { lazy, Suspense, useEffect, useState } from 'react';
import useHashNavigation from './hooks/useHashNavigation';
import HomePage from './pages/HomePage';
import Navbar from './components/navigation/Navbar';
import SearchModal from './components/navigation/SearchModal';
import DrawerMenu from './components/navigation/DrawerMenu';
import ChooseWorld from './pages/ChooseWorld';
import MarsPage from './pages/MarsPage';
import MarsMissionsPage from './pages/MarsMissionsPage';
import MarsInsightPage from './pages/MarsInsightPage';
import InsightMissionPage from './pages/InsightMissionPage';
import InsightStory1Page from './pages/InsightStory1Page';
import PageBoundary from './components/PageBoundary';

const InvestigationPage = lazy(() => import('./pages/InvestigationPage'));

function RouteFocus({ currentPage }) {
  useEffect(() => {
    const main = document.querySelector('main');
    if (main) {
      main.tabIndex = -1;
      main.focus({ preventScroll: true });
    }
  }, [currentPage]);
  return null;
}

export default function App() {
  const { currentPage, navigate } = useHashNavigation();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full flex flex-col font-public select-none overflow-x-hidden bg-[#030611]">
      
      {/* Shared navigation remains mounted across page changes. */}
      <Navbar
        currentPage={currentPage}
        onNavigate={navigate}
      />

      <PageBoundary key={currentPage}>
      <Suspense fallback={<main className="relative z-10 min-h-screen pt-28 px-6 text-white" role="status">Loading investigation...</main>}>
      <RouteFocus currentPage={currentPage} />
      {currentPage === 'investigation' ? (
        <InvestigationPage
          onBack={() => navigate('insight-story-1')}
        />
      ) : currentPage === 'insight-story-1' ? (
        <InsightStory1Page
          onBack={() => navigate('insight-mission')}
          onStartInvestigation={() => navigate('investigation')}
        />
      ) : currentPage === 'insight-mission' ? (
        <InsightMissionPage
          onBack={() => navigate('mars-insight')}
          onWatchStory={() => navigate('insight-story-1')}
        />
      ) : currentPage === 'mars-insight' ? (
        <MarsInsightPage
          onBack={() => navigate('mars-missions')}
          onExploreMissions={() => navigate('insight-mission')}
        />
      ) : currentPage === 'mars-missions' ? (
        <MarsMissionsPage
          onBack={() => navigate('mars')}
          onSelectInsight={() => navigate('mars-insight')}
        />
      ) : currentPage === 'mars' ? (
        <MarsPage
          onBack={() => navigate('missions')}
          onExploreMissions={() => navigate('mars-missions')}
        />
      ) : currentPage === 'missions' ? (
        <ChooseWorld 
          onSelectMars={() => navigate('mars')}

        />
      ) : (
        <HomePage
          onBeginJourney={() => navigate('missions')}
        />
      )}

      </Suspense>
      </PageBoundary>

      {/* Interactive NASA Search Modal */}
      <SearchModal
        onNavigate={navigate}
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Interactive NASA Drawer Menu */}
      <DrawerMenu
        onNavigate={navigate}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

    </div>
  );
}
