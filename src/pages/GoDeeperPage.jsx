import MissionSeriesPage from '../components/MissionSeriesPage';
import { GO_DEEPER_PAGES } from '../data/goDeeperPages';
import siteContent from '../data/siteContent.json';

const goDeeperCopy = siteContent.goDeeper;

export default function GoDeeperPage({
  pageNumber = 1,
  onBack,
  onNext,
  onSelectPage,
  onGoTechnical,
  onBackToCaseBoard,
}) {
  const isLastPage = pageNumber >= GO_DEEPER_PAGES.length;

  const secondaryAction = isLastPage
    ? onGoTechnical && {
        label: goDeeperCopy.secondaryActions.lastPage.label,
        title: goDeeperCopy.secondaryActions.lastPage.title,
        onClick: onGoTechnical,
      }
    : pageNumber === 4 && onBackToCaseBoard
    ? {
        label: goDeeperCopy.secondaryActions.page4.label,
        title: goDeeperCopy.secondaryActions.page4.title,
        onClick: onBackToCaseBoard,
      }
    : null;

  const finalAction = onBackToCaseBoard && {
    label: goDeeperCopy.finalAction.label,
    title: goDeeperCopy.finalAction.title,
    onClick: onBackToCaseBoard,
  };

  return (
    <MissionSeriesPage
      pages={GO_DEEPER_PAGES}
      pageNumber={pageNumber}
      sectionLabel={goDeeperCopy.sectionLabel}
      backRootLabel={goDeeperCopy.backRootLabel}
      onBack={onBack}
      onNext={onNext}
      onSelectPage={onSelectPage}
      secondaryAction={secondaryAction}
      finalAction={finalAction}
    />
  );
}
