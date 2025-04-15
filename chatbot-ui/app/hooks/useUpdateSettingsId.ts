import { useAppStateDispatch } from '@/components/Provider/AppStateContextProvider';
import { useCallback } from 'react';

export const useUpdateSettingsId = () => {
  const dispatch = useAppStateDispatch();

  return useCallback(
    (settingsId: string) => {
      dispatch({
        type: 'settingsSelected',
        settingsId,
      });
    },
    [dispatch],
  );
};
