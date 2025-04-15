import {
  useAppState,
  useAppStateDispatch,
} from '@/components/Provider/AppStateContextProvider';
import { useCallback } from 'react';

export const useToggleChatbar = () => {
  const { showSidebar } = useAppState();
  const dispatch = useAppStateDispatch();

  return useCallback(() => {
    dispatch({ type: 'showSidebarUpdated', showSidebar: !showSidebar });
  }, [dispatch, showSidebar]);
};
