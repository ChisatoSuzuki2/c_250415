'use client';

import { ConversationComponent } from './Conversation';
import { useUpdateConversation } from '@/app/hooks/useUpdateConversation';
import { IconMessagesOff } from '@tabler/icons-react';
import { useTranslation } from '@/app/i18n/client';
import { useEffect, useMemo, useState } from 'react';
import { Conversation } from '@/app/types/chat';
import { useAppState } from '@/components/Provider/AppStateContextProvider';
import { useSearchTerm } from '@/components/Provider/SearchTermProvider';

export const Conversations = () => {
  const { t } = useTranslation('sidebar');

  const { conversations: allConversations } = useAppState();
  const conversations = useMemo(
    () => allConversations.filter((c) => c.folderId == null),
    [allConversations],
  );

  const searchTerm = useSearchTerm();

  const updateConversation = useUpdateConversation();

  const handleDrop = (e: any) => {
    if (e.dataTransfer) {
      const conversation = JSON.parse(e.dataTransfer.getData('conversation'));
      updateConversation(conversation, { folderId: null });

      e.target.style.background = 'none';
    }
  };

  const allowDrop = (e: any) => {
    e.preventDefault();
  };

  const highlightDrop = (e: any) => {
    e.target.style.background = '#343541';
  };

  const removeHighlight = (e: any) => {
    e.target.style.background = 'none';
  };

  const [filteredConversations, setFilteredConversations] =
    useState<Conversation[]>(conversations);

  useEffect(() => {
    if (searchTerm.value.length > 0) {
      setFilteredConversations(
        conversations.filter((conversation) => {
          const searchable =
            conversation.name.toLocaleLowerCase() +
            ' ' +
            conversation.messages.map((message) => message.content).join(' ');
          return searchable
            .toLowerCase()
            .includes(searchTerm.value.toLowerCase());
        }),
      );
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchTerm.value, conversations]);

  if (conversations.length > 0)
    return (
      <div
        className="pt-2"
        onDrop={(e) => handleDrop(e)}
        onDragOver={allowDrop}
        onDragEnter={highlightDrop}
        onDragLeave={removeHighlight}
      >
        <div className="flex w-full flex-col gap-1">
          {filteredConversations
            .slice()
            .reverse()
            .map((conversation, index) => (
              <ConversationComponent key={index} conversation={conversation} />
            ))}
        </div>
      </div>
    );
  else
    return (
      <div className="mt-8 flex flex-col items-center gap-3 text-sm leading-normal text-white opacity-50">
        <IconMessagesOff />
        {t('No conversations.')}
      </div>
    );
};
