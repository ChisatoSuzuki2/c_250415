import { useTranslation } from '@/app/i18n/client';
import { v4 as uuidv4 } from 'uuid';
import { useAppStateDispatch } from '@/components/Provider/AppStateContextProvider';
import { useCallback } from 'react';
import { BotTypes } from '@/app/types/chat';

export const useCreateConversation = () => {
  const dispatch = useAppStateDispatch();
  const { t } = useTranslation('chat');

  return useCallback(() => {
    const newConversation = {
      id: uuidv4(),
      name: t('New Conversation'),
      messages: [],
      botType: BotTypes[0],
      folderId: null,
      teamId: null,
      llmModelId: null,
      settingsId: null,
    };

    dispatch({ type: 'conversationCreated', newConversation });
  }, [dispatch, t]);
};
