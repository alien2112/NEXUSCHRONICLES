import MissionSeriesPage from '../components/MissionSeriesPage';
import { GO_TECHNICAL_PAGES } from '../data/goTechnicalPages';
import siteContent from '../data/siteContent.json';

const goTechnicalCopy = siteContent.goTechnical;

export default function GoTechnicalPage({
  pageNumber = 1,
  onBack,
  onNext,
  onSelectPage,
  onGoDeeper,
  onBackToCaseBoard,
  onSurvivalProtocol,
}) {
  const isLastPage = pageNumber >= GO_TECHNICAL_PAGES.length;

  const secondaryAction =
    isLastPage && onGoDeeper
      ? {
          label: goTechnicalCopy.secondaryActions.lastPage.label,
          title: goTechnicalCopy.secondaryActions.lastPage.title,
          onClick: onGoDeeper,
        }
      : null;

  const finalAction = onBackToCaseBoard && {
    label: goTechnicalCopy.finalAction.label,
    title: goTechnicalCopy.finalAction.title,
    onClick: onBackToCaseBoard,
  };

  return (
    <MissionSeriesPage
      pages={GO_TECHNICAL_PAGES}
      pageNumber={pageNumber}
      sectionLabel={goTechnicalCopy.sectionLabel}
      backRootLabel={goTechnicalCopy.backRootLabel}
      onBack={onBack}
      onNext={onNext}
      onSelectPage={onSelectPage}
      secondaryAction={secondaryAction}
      finalAction={finalAction}
      onOptionalGame={isLastPage ? onSurvivalProtocol : undefined}
    />
  );
}
