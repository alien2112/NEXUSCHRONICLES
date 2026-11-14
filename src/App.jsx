import { lazy, Suspense, useEffect, useState } from 'react';
import useHashNavigation from './hooks/useHashNavigation';
import HomePage from './pages/HomePage';
import siteContent from './data/siteContent.json';
import Navbar from './components/navigation/Navbar';
import SearchModal from './components/navigation/SearchModal';
import DrawerMenu from './components/navigation/DrawerMenu';
import ChooseWorld from './pages/ChooseWorld';
import MarsPage from './pages/MarsPage';
import MarsMissionsPage from './pages/MarsMissionsPage';
import MarsInsightPage from './pages/MarsInsightPage';
import InsightMissionPage from './pages/InsightMissionPage';
import InsightStory1Page from './pages/InsightStory1Page';
import InsightStoryPage from './pages/InsightStoryPage';
import GoDeeperPage from './pages/GoDeeperPage';
import GoTechnicalPage from './pages/GoTechnicalPage';
import PageBoundary from './components/PageBoundary';

const InvestigationPage = lazy(() => import('./pages/InvestigationPage'));
const SurvivalProtocolPage = lazy(() => import('./pages/SurvivalProtocolPage'));

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
  const [case1094Progress, setCase1094Progress] = useState(null);
  const goDeeperNumber = currentPage.startsWith('go-deeper-')
    ? Number(currentPage.slice('go-deeper-'.length))
    : null;
  const goTechnicalNumber = currentPage.startsWith('go-technical-')
    ? Number(currentPage.slice('go-technical-'.length))
    : null;
  const insightStoryNumber = currentPage.startsWith('insight-story-')
    ? Number(currentPage.slice('insight-story-'.length))
    : null;

  return (
    <div className="relative min-h-screen w-full flex flex-col font-public select-none overflow-x-hidden bg-[#030611]">
      
      {/* Shared navigation remains mounted across page changes. */}
      <Navbar
        currentPage={currentPage}
        onNavigate={navigate}
      />

      <PageBoundary key={currentPage}>
      <Suspense fallback={<main className="relative z-10 min-h-screen pt-28 px-6 text-white" role="status">{siteContent.app.loadingLabel}</main>}>
      <RouteFocus currentPage={currentPage} />
      {currentPage === 'investigation' || currentPage === 'case-board' ? (
        <InvestigationPage
          key={currentPage}
          initialScene={currentPage === 'case-board' ? 'case-board' : 'intro1-1'}
          savedProgress={currentPage === 'case-board' ? case1094Progress : null}
          onSaveProgress={setCase1094Progress}
          onGoDeeper={() => navigate('go-deeper-1')}
          onGoTechnical={() => navigate('go-technical-1')}
          onSurvivalProtocol={() => navigate('survival-protocol')}
          onBack={() => navigate('home')}
        />
      ) : currentPage === 'survival-protocol' ? (
        <SurvivalProtocolPage
          onReturnToNexus={() => navigate('case-board')}
        />
      ) : goDeeperNumber !== null ? (
        <GoDeeperPage
          pageNumber={goDeeperNumber}
          onBack={() =>
            navigate(goDeeperNumber === 1 ? 'case-board' : `go-deeper-${goDeeperNumber - 1}`)
          }
          onNext={() =>
            navigate(goDeeperNumber < 6 ? `go-deeper-${goDeeperNumber + 1}` : 'case-board')
          }
          onSelectPage={(num) => navigate(`go-deeper-${num}`)}
          onGoTechnical={() => navigate('go-technical-1')}
          onBackToCaseBoard={() => navigate('case-board')}
          onSurvivalProtocol={() => navigate('survival-protocol')}
        />
      ) : goTechnicalNumber !== null ? (
        <GoTechnicalPage
          pageNumber={goTechnicalNumber}
          onBack={() =>
            navigate(goTechnicalNumber === 1 ? 'case-board' : `go-technical-${goTechnicalNumber - 1}`)
          }
          onNext={() =>
            navigate(goTechnicalNumber < 10 ? `go-technical-${goTechnicalNumber + 1}` : 'case-board')
          }
          onSelectPage={(num) => navigate(`go-technical-${num}`)}
          onGoDeeper={() => navigate('go-deeper-1')}
          onBackToCaseBoard={() => navigate('case-board')}
          onSurvivalProtocol={() => navigate('survival-protocol')}
        />
      ) : currentPage === 'insight-story-1' ? (
        <InsightStory1Page
          onBack={() => navigate('insight-mission')}
          onNext={() => navigate('insight-story-2')}
        />
      ) : insightStoryNumber !== null && insightStoryNumber >= 2 ? (
        <InsightStoryPage
          storyNumber={insightStoryNumber}
          onBack={() => navigate(`insight-story-${insightStoryNumber - 1}`)}
          onNext={() =>
            navigate(
              insightStoryNumber < 6 ? `insight-story-${insightStoryNumber + 1}` : 'investigation'
            )
          }
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
