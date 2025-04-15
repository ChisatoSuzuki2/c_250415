import { useAppStateDispatch } from '@/components/Provider/AppStateContextProvider';
import { useCallback } from 'react';

export const useClearConversations = () => {
  const dispatch = useAppStateDispatch();

  return useCallback(() => {
    dispatch({ type: 'conversationsCleared' });
  }, [dispatch]);
};
