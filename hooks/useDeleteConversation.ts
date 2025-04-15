import { Conversation } from '@/app/types/chat';
import { useAppStateDispatch } from '@/components/Provider/AppStateContextProvider';
import { useCallback } from 'react';

export const useDeleteConversation = () => {
  const dispatch = useAppStateDispatch();

  return useCallback(
    (conversation: Conversation) => {
      dispatch({
        type: 'conversationDeleted',
        conversationId: conversation.id,
      });
    },
    [dispatch],
  );
};
