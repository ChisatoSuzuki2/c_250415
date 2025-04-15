'use client';

import { useCallback, useEffect, useState } from 'react';
import { BotDefinitions, Conversation, Message } from '@/app/types/chat';
import { components } from '@/app/types/api';
import toast from 'react-hot-toast';
import { useServerState } from '@/components/Provider/ServerStateProvider';
import {
  useAppState,
  useAppStateDispatch,
} from '@/components/Provider/AppStateContextProvider';
import { createParser } from 'eventsource-parser';
import { ParseEvent } from 'eventsource-parser/src/types';
import { useTranslation } from '@/app/i18n/client';
import { tags } from '@/app/server_actions/tags';
import { reload } from '@/app/server_actions/reload';

export const useSendMessage = () => {
  const { t } = useTranslation('chat');

  const { basePath } = useServerState();

  const { selectedConversationId, conversations, currentMessage } =
    useAppState();

  const dispatch = useAppStateDispatch();

  const [cancel, setCancel] = useState(() => () => {});

  const sendMessage = useCallback(
    async (message: Message, deleteCount = 0) => {
      if (!selectedConversationId) return;

      const selectedConversation = conversations.find(
        (c) => c.id === selectedConversationId,
      );
      if (!selectedConversation) return;
      if (!selectedConversation.teamId) return;
      if (!selectedConversation.llmModelId) return;

      const updatedMessages = [...selectedConversation.messages];
      updatedMessages.splice(
        selectedConversation.messages.length - deleteCount,
        deleteCount,
        message,
      );

      let updatedConversation = {
        ...selectedConversation,
        messages: updatedMessages,
      };

      dispatch({
        type: 'conversationUpdated',
        conversation: updatedConversation,
      });
      dispatch({ type: 'chatbotAsked' });

      const controller = new AbortController();
      const cancelPromise = new Promise<undefined>((resolve, reject) => {
        controller.signal.addEventListener('abort', reject);
      });
      const cancel = () => {
        controller.abort('canceled by user');
        dispatch({ type: 'chatbotCompleted' });
      };
      setCancel(() => cancel);

      const messages = updatedConversation.messages;
      const chatBody: components['schemas']['LLMParameters'] = {
        team_id: selectedConversation.teamId,
        llm_model_id: selectedConversation.llmModelId,
        input: messages[messages.length - 1].content,
        history: messages.slice(0, messages.length - 1).map((m) => ({
          role: m.role,
          content: m.content,
        })),
      };
      const requestBody:
        | components['schemas']['LLMParameters']
        | components['schemas']['RAGParameters'] =
        updatedConversation.botType === 'llm-only'
          ? chatBody
          : {
              ...chatBody,
              settings_id: selectedConversation.settingsId,
              strategy: BotDefinitions[updatedConversation.botType].strategy,
              size: null,
              document_separator: null,
              document_template: null,
              prompt_template: null,
            };
      const response = await fetch(
        basePath + BotDefinitions[updatedConversation.botType].endpoint,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'text/event-stream',
          },
          signal: controller.signal,
          body: JSON.stringify(requestBody),
        },
      );

      if (!response.ok) {
        dispatch({ type: 'chatbotCompleted' });

        if (response.status === 404) {
          toast.error(t('This team has been deleted. Please contact the administrator.'));
          reload(tags.teamsTag());
        } else {
          toast.error(response.statusText);
        }

        dispatch({
          type: 'conversationUpdated',
          conversation: {
            ...updatedConversation,
            messages: updatedConversation.messages.slice(
              0,
              updatedConversation.messages.length - 1,
            ),
          },
        });

        return;
      }

      const data = response.body;

      if (!data) {
        dispatch({ type: 'chatbotCompleted' });
        return;
      }

      if (updatedConversation.messages.length === 1) {
        const { content } = message;
        const customName =
          content.length > 30 ? content.substring(0, 30) + '...' : content;

        updatedConversation = {
          ...updatedConversation,
          name: customName,
        };
      }

      dispatch({ type: 'chatbotStreamingStarted' });
      let text = '';
      updatedConversation = {
        ...updatedConversation,
        messages: [
          ...updatedConversation.messages,
          {
            role: 'assistant',
            content: '',
            configuration: {
              botType: selectedConversation.botType,
              llmModelId: selectedConversation.llmModelId,
              settingsId: selectedConversation.settingsId,
            },
          },
        ],
      };
      dispatch({
        type: 'conversationUpdated',
        conversation: updatedConversation,
      });

      const llmStream = consumeLangChainDataStream(data);
      while (true) {
        const result = await Promise.race([cancelPromise, llmStream.next()]);
        if (result == null) break;
        if (result.done) break;
        const langChainData = result.value;

        if (langChainData.status_code != null) {
          dispatch({ type: 'chatbotCompleted' });
          toast.error(langChainData.message);

          const messages = [...updatedConversation.messages];
          messages.pop();
          messages.pop();
          updatedConversation = {
            ...updatedConversation,
            messages,
          };
          dispatch({
            type: 'conversationUpdated',
            conversation: updatedConversation,
          });

          console.error(`error returned: ${langChainData.message}`);
          return;
        }

        if (langChainData.answer) text += langChainData.answer;

        const updatedMessages = updatedConversation.messages.map(
          (message, index) => {
            if (index !== updatedConversation.messages.length - 1)
              return message;

            if (message.role !== 'assistant') {
              console.warn(
                'unexpected condition: last message is not assistant message.',
              );
              return message;
            }

            const context = [
              ...(message.context || []),
              ...(langChainData.context || []),
            ];

            return {
              ...message,
              content: text,
              context: context.length > 0 ? context : undefined,
            };
          },
        );

        updatedConversation = {
          ...updatedConversation,
          messages: updatedMessages,
        };

        dispatch({
          type: 'conversationUpdated',
          conversation: updatedConversation,
        });
      }

      const updatedConversations: Conversation[] = conversations.map(
        (conversation) => {
          if (conversation.id === selectedConversation.id) {
            return updatedConversation;
          }

          return conversation;
        },
      );

      if (updatedConversations.length === 0) {
        updatedConversations.push(updatedConversation);
      }

      dispatch({
        type: 'conversationsUpdated',
        conversations: updatedConversations,
      });

      dispatch({ type: 'chatbotCompleted' });
    },
    [basePath, conversations, selectedConversationId, t, dispatch],
  );

  useEffect(() => {
    if (currentMessage) {
      sendMessage(currentMessage);
      dispatch({ type: 'currentMessageUpdated', message: null });
    }
  }, [currentMessage, sendMessage, dispatch]);

  return { sendMessage, cancel };
};

export type LangChainContext = {
  page_content: string;
  metadata: any;
};

export type LangChainData = {
  context?: LangChainContext[];
  answer?: string;

  status_code: undefined;
};

export type LangChainError = {
  status_code: number;
  message: string;
};

export async function* consumeLangChainDataStream(
  source: ReadableStream<Uint8Array>,
) {
  const decoder = new TextDecoder();

  let langChainDataList: (LangChainData | LangChainError)[] = [];

  const parser = createParser((event: ParseEvent) => {
    if (event.type !== 'event') return;

    if (event.event === 'error') {
      langChainDataList.push(JSON.parse(event.data));
      return;
    }

    if (event.event !== 'data') return;

    langChainDataList.push(JSON.parse(event.data));
  });

  const reader = source.getReader();

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;

    parser.feed(decoder.decode(value));

    while (langChainDataList.length > 0) yield langChainDataList.shift()!!;
  }
}
