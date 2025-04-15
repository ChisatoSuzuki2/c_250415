import { useAppStateDispatch } from '@/components/Provider/AppStateContextProvider';
import { useCallback } from 'react';

export const useDeleteFolder = () => {
  const dispatch = useAppStateDispatch();

  return useCallback(
    (folderId: string) => {
      dispatch({ type: 'folderDeleted', folderId });
    },
    [dispatch],
  );
};
