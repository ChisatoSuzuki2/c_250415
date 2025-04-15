import { Folder, FolderType } from '@/app/types/folder';
import { v4 as uuidv4 } from 'uuid';
import { useAppStateDispatch } from '@/components/Provider/AppStateContextProvider';
import { useCallback } from 'react';

export const useCreateFolder = () => {
  const dispatch = useAppStateDispatch();

  return useCallback(
    (name: string, type: FolderType) => {
      const newFolder: Folder = {
        id: uuidv4(),
        name,
        type,
      };

      dispatch({ type: 'folderCreated', newFolder });
    },
    [dispatch],
  );
};
