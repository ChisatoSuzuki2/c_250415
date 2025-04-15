import { useAppStateDispatch } from '@/components/Provider/AppStateContextProvider';
import { useCallback } from 'react';

export const useUpdateLLMModelID = () => {
  const dispatch = useAppStateDispatch();

  return useCallback(
    (llmModelId: string) => {
      dispatch({
        type: 'llmModelSelected',
        llmModelId,
      });
    },
    [dispatch],
  );
};
