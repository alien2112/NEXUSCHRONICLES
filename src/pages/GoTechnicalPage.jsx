import MissionSeriesPage from '../components/MissionSeriesPage';
import { GO_TECHNICAL_PAGES } from '../data/goTechnicalPages';

export default function GoTechnicalPage({
  pageNumber = 1,
  onBack,
  onNext,
  onSelectPage,
  onGoDeeper,
  onBackToCaseBoard,
}) {
  const isLastPage = pageNumber >= GO_TECHNICAL_PAGES.length;

  const secondaryAction =
    isLastPage && onGoDeeper
      ? {
          label: 'Go deeper',
          title: 'Explore Go deeper: Science Behind It',
          onClick: onGoDeeper,
        }
      : null;

  const finalAction = onBackToCaseBoard && {
    label: 'Back to Case Board',
    title: 'Return to Investigation Case Board',
    onClick: onBackToCaseBoard,
  };

  return (
    <MissionSeriesPage
      pages={GO_TECHNICAL_PAGES}
      pageNumber={pageNumber}
      sectionLabel="ENGINEERING THE MISSION"
      backRootLabel="Case Board"
      onBack={onBack}
      onNext={onNext}
      onSelectPage={onSelectPage}
      secondaryAction={secondaryAction}
      finalAction={finalAction}
    />
  );
}
