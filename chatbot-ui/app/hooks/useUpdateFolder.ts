import { useAppStateDispatch } from '@/components/Provider/AppStateContextProvider';
import { useCallback } from 'react';

export const useUpdateFolder = () => {
  const dispatch = useAppStateDispatch();

  return useCallback(
    (folderId: string, name: string) => {
      dispatch({ type: 'folderUpdated', folderId, name });
    },
    [dispatch],
  );
};
