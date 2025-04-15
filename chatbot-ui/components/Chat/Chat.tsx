'use client';

import { memo, useRef } from 'react';
import { ChatInput } from './ChatInput';
import { useAppState } from '@/components/Provider/AppStateContextProvider';
import ChatStartConversationView from '@/components/Chat/ChatStartConversationView';
import ChatMessages from '@/components/Chat/ChatMessages';

export const Chat = memo(() => {
  const { selectedConversationId, conversations } = useAppState();
  const conversation = conversations.find(
    (c) => c.id === selectedConversationId,
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!conversation) {
    return <></>;
  }

  return (
    <div className="relative h-full flex-1 overflow-hidden bg-chatbot-900">
      <div className="h-full">
        {conversation.messages.length === 0 ? (
          <div className="h-full overflow-scroll">
            <ChatStartConversationView conversation={conversation} />
            <div className="h-[162px]" />
          </div>
        ) : (
          <ChatMessages
            conversation={conversation}
            onScrollToEnd={() => textareaRef.current?.focus()}
          />
        )}
      </div>

      <div className="absolute bottom-0 left-0 w-full">
        <ChatInput
          textareaRef={textareaRef}
          conversationIsEmpty={conversation.messages.length === 0}
        />
      </div>
    </div>
  );
});
Chat.displayName = 'Chat';
