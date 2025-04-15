import { Conversation } from '@/app/types/chat';
import { useAppStateDispatch } from '@/components/Provider/AppStateContextProvider';
import { useCallback } from 'react';

export const useUpdateConversation = () => {
  const dispatch = useAppStateDispatch();

  return useCallback(
    (conversation: Conversation, data: Partial<Omit<Conversation, 'id'>>) => {
      dispatch({
        type: 'conversationUpdated',
        conversation: {
          ...conversation,
          ...data,
        },
      });
    },
    [dispatch],
  );
};
