import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { VIEW_TYPE, type ViewType } from '../../../shared/constants/app-constants';

/**
 * Hook for managing view state via URL parameters
 * Syncs current view (board/backlog/archive) with URL
 */
export function useViewState() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentView = useMemo<ViewType>(() => {
    const viewParam = searchParams.get('view');
    if (
      viewParam === VIEW_TYPE.BOARD ||
      viewParam === VIEW_TYPE.BACKLOG ||
      viewParam === VIEW_TYPE.ARCHIVE
    ) {
      return viewParam;
    }
    return VIEW_TYPE.BOARD; // Default view
  }, [searchParams]);

  const currentBoardId = useMemo(() => {
    return searchParams.get('board') || undefined;
  }, [searchParams]);

  const setView = useCallback(
    (view: ViewType, boardId?: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('view', view);

      if (boardId) {
        params.set('board', boardId);
      }

      router.push(`/?${params.toString()}`);
    },
    [searchParams, router]
  );

  const setBoardId = useCallback(
    (boardId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('board', boardId);
      router.push(`/?${params.toString()}`);
    },
    [searchParams, router]
  );

  return {
    currentView,
    currentBoardId,
    setView,
    setBoardId,
    isBoard: currentView === VIEW_TYPE.BOARD,
    isBacklog: currentView === VIEW_TYPE.BACKLOG,
    isArchive: currentView === VIEW_TYPE.ARCHIVE,
  };
}
