import MissionSeriesPage from '../components/MissionSeriesPage';
import { GO_DEEPER_PAGES } from '../data/goDeeperPages';

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
        label: 'Go technical',
        title: 'Explore Go technical: Engineering the Mission',
        onClick: onGoTechnical,
      }
    : pageNumber === 4 && onBackToCaseBoard
    ? {
        label: 'Review Case 1094',
        title: 'Return to Case 1094 Case Board',
        onClick: onBackToCaseBoard,
      }
    : null;

  const finalAction = onBackToCaseBoard && {
    label: 'Back to Case Board',
    title: 'Return to Investigation Case Board',
    onClick: onBackToCaseBoard,
  };

  return (
    <MissionSeriesPage
      pages={GO_DEEPER_PAGES}
      pageNumber={pageNumber}
      sectionLabel="SCIENCE BEHIND IT"
      backRootLabel="Case Board"
      onBack={onBack}
      onNext={onNext}
      onSelectPage={onSelectPage}
      secondaryAction={secondaryAction}
      finalAction={finalAction}
    />
  );
}
