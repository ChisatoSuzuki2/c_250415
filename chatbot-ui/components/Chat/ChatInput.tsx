'use client';

import { IconPlayerStop, IconRepeat, IconSend } from '@tabler/icons-react';
import {
  ChangeEvent,
  FC,
  KeyboardEvent,
  MutableRefObject,
  useEffect,
  useState,
} from 'react';
import { useTranslation } from '@/app/i18n/client';
import { useAppState } from '@/components/Provider/AppStateContextProvider';
import { useSendMessage } from '@/app/hooks/useSendMessage';
import { useServerState } from '@/components/Provider/ServerStateProvider';

interface Props {
  conversationIsEmpty: boolean;
  textareaRef: MutableRefObject<HTMLTextAreaElement | null>;
}

export const ChatInput: FC<Props> = ({ conversationIsEmpty, textareaRef }) => {
  const { t } = useTranslation('chat');

  const { teams, embeddings, llmModels } = useServerState();
  const { chatbotState, conversations, selectedConversationId } = useAppState();
  const conversation = conversations.find(
    (c) => c.id === selectedConversationId,
  );

  const team = teams.find((t) => t.id === conversation?.teamId);
  const model = llmModels.find((m) => m.model_id === conversation?.llmModelId);
  const embedding = embeddings.find(
    (m) => m.model_id === team?.embedding_model,
  );
  const disabled =
    conversation?.teamId == null ||
    !team ||
    !model ||
    (embedding == null && conversation.botType !== 'llm-only');

  const [content, setContent] = useState<string>();
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const { sendMessage, cancel } = useSendMessage();

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
  };

  const handleSend = () => {
    if (chatbotState !== 'waiting-for-question') {
      return;
    }

    if (!content) {
      alert(t('Please enter a message'));
      return;
    }

    sendMessage({ role: 'user', content }, 0);
    setContent('');

    if (window.innerWidth < 640 && textareaRef && textareaRef.current) {
      textareaRef.current.blur();
    }
  };

  const onRegenerate = () => {
    if (conversation && conversation.messages.length > 1) {
      sendMessage(conversation.messages[conversation.messages.length - 2], 2);
    }
  };

  const handleStopConversation = () => {
    cancel();
  };

  const isMobile = () => {
    const userAgent =
      typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
    const mobileRegex =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
    return mobileRegex.test(userAgent);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !isTyping && !isMobile() && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current?.scrollHeight}px`;
      textareaRef.current.style.overflow = `${
        textareaRef?.current?.scrollHeight > 400 ? 'auto' : 'hidden'
      }`;
    }
  }, [content, textareaRef]);

  const chatInputPlaceholder = (): string => {
    if (conversation?.teamId == null)
      return t<string>('Select a team to start conversation.');

    if (team == null)
      return t<string>(
        'This team was deleted. You can only see the past conversation but not send a new message.',
      );

    if (model == null)
      return t<string>(
        'The language model was deleted. You can only see the past conversation but not send a new message.',
      );

    if (embedding == null && conversation.botType !== 'llm-only')
      return t<string>(
        'Embedding ID "{{model}}" is not deployed. RAG is disabled.',
        { model: team.embedding_model },
      );

    return t<string>('Type a message...');
  };

  return (
    <div className="border-white/20 bg-gradient-to-b from-transparent via-chatbot-900 to-chatbot-950 pt-6 md:pt-2">
      <div className="stretch mx-2 mt-4 flex flex-row gap-3 last:mb-2 md:mx-4 md:mt-[52px] md:last:mb-6 lg:mx-auto lg:max-w-3xl">
        {chatbotState !== 'waiting-for-question' && (
          <button
            className="absolute left-0 right-0 top-0 mx-auto mb-3 flex w-fit items-center gap-3 rounded border border-chatbot-700 bg-chatbot-900 px-4 py-2 text-white hover:opacity-50 md:mb-0 md:mt-2"
            onClick={handleStopConversation}
          >
            <IconPlayerStop size={16} /> {t('Stop Generating')}
          </button>
        )}

        {chatbotState === 'waiting-for-question' &&
          !conversationIsEmpty &&
          team && (
            <button
              className="absolute left-0 right-0 top-0 mx-auto mb-3 flex w-fit items-center gap-3 rounded border border-chatbot-700 bg-chatbot-900 px-4 py-2 text-white hover:opacity-50 md:mb-0 md:mt-2"
              onClick={onRegenerate}
            >
              <IconRepeat size={16} /> {t('Regenerate response')}
            </button>
          )}

        <div className="relative mx-2 flex w-full flex-grow flex-col rounded-md border border-gray-900/50 bg-chatbot-700 text-white shadow-[0_0_15px_rgba(0,0,0,0.10)] sm:mx-4">
          <textarea
            ref={textareaRef}
            className={`m-0 w-full resize-none py-2 pl-4 pr-8 md:py-3 ${
              disabled ? 'bg-chatbot-800' : 'bg-transparent'
            } rounded-md border border-transparent text-white outline-none focus:border-chatbot-400`}
            style={{
              resize: 'none',
              bottom: `${textareaRef?.current?.scrollHeight}px`,
              maxHeight: '400px',
              overflow: `${
                textareaRef.current && textareaRef.current.scrollHeight > 400
                  ? 'auto'
                  : 'hidden'
              }`,
            }}
            placeholder={chatInputPlaceholder()}
            value={content}
            rows={1}
            onCompositionStart={() => setIsTyping(true)}
            onCompositionEnd={() => setIsTyping(false)}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
          />

          <button
            className={`absolute right-2 top-2 rounded-sm p-1 opacity-60 ${
              disabled
                ? 'text-neutral-500'
                : 'bg-opacity-60 text-neutral-300 hover:bg-chatbot-400 hover:text-neutral-200'
            }`}
            onClick={handleSend}
            disabled={disabled}
          >
            {chatbotState !== 'waiting-for-question' ? (
              <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-neutral-100 opacity-60"></div>
            ) : (
              <IconSend size={18} />
            )}
          </button>
        </div>
      </div>
      <div className="px-3 pb-3 pt-2 text-center text-[12px] text-white/50 md:px-4 md:pb-6 md:pt-3">
        RAG Sample App
      </div>
    </div>
  );
};
