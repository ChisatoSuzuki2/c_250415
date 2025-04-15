import { useAppStateDispatch } from '@/components/Provider/AppStateContextProvider';
import { BotType } from '@/app/types/chat';
import { useCallback } from 'react';

export const useUpdateBotType = () => {
  const dispatch = useAppStateDispatch();

  return useCallback(
    (botType: BotType) => {
      dispatch({
        type: 'botTypeSelected',
        botType,
      });
    },
    [dispatch],
  );
};
