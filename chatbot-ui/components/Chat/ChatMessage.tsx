'use client';

import { Message } from '@/app/types/chat';
import {
  IconCheck,
  IconCopy,
  IconEdit,
  IconListSearch,
  IconRobot,
  IconUser,
} from '@tabler/icons-react';
import { FC, memo, useCallback, useEffect, useRef, useState } from 'react';
import rehypeMathjax from 'rehype-mathjax';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { CodeBlock } from '../Markdown/CodeBlock';
import { MemoizedReactMarkdown } from '../Markdown/MemoizedReactMarkdown';
import { useTranslation } from '@/app/i18n/client';
import { useServerState } from '@/components/Provider/ServerStateProvider';
import {
  useAppState,
  useAppStateDispatch,
} from '@/components/Provider/AppStateContextProvider';
import { useUpdateConversation } from '@/app/hooks/useUpdateConversation';

interface Props {
  message: Message;
  messageIndex: number;
}

export const ChatMessage: FC<Props> = memo(({ message, messageIndex }) => {
  const { t } = useTranslation('chat');

  const { documentKeys, llmModels, settingsList } = useServerState();

  const { selectedConversationId, conversations } = useAppState();
  const dispatch = useAppStateDispatch();
  const updateConversation = useUpdateConversation();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [messageContent, setMessageContent] = useState(message.content);
  const [messagedCopied, setMessageCopied] = useState(false);
  const [contextOpened, setContextOpened] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageContent(event.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleEditMessage = () => {
    if (message.content != messageContent) {
      const newMessage = { ...message, content: messageContent };
      if (!selectedConversationId) return;

      const selectedConversation = conversations.find(
        (c) => c.id === selectedConversationId,
      );
      if (!selectedConversation) return;

      const updatedMessages = selectedConversation.messages
        .map((m, i) => {
          if (i < messageIndex) {
            return m;
          }
        })
        .filter((m) => m) as Message[];

      updateConversation(selectedConversation, { messages: updatedMessages });

      dispatch({ type: 'currentMessageUpdated', message: newMessage });
    }
    setIsEditing(false);
  };

  const handlePressEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !isTyping && !e.shiftKey) {
      e.preventDefault();
      handleEditMessage();
    }
  };

  const copyOnClick = () => {
    if (!navigator.clipboard) return;

    navigator.clipboard.writeText(message.content).then(() => {
      setMessageCopied(true);
      setTimeout(() => {
        setMessageCopied(false);
      }, 2000);
    });
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  const getModelName = useCallback(
    (modelId: string): string => {
      const model = llmModels.find((m) => m.model_id === modelId);
      if (model) return model.name;
      return modelId;
    },
    [llmModels],
  );

  const getSettingsName = useCallback(
    (settingsId: string) => {
      const settings = settingsList.find((m) => m.id === settingsId);
      if (settings) return settings.name;
      return settingsId;
    },
    [settingsList],
  );

  return (
    <div
      className={`group px-4 ${
        message.role === 'assistant'
          ? 'bg-chatbot-800 text-gray-100 shadow-lg shadow-chatbot-950/15'
          : 'text-gray-100'
      }`}
      style={{ overflowWrap: 'anywhere' }}
    >
      <div className="relative m-auto flex gap-4 p-4 text-base md:max-w-2xl md:gap-6 md:py-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
        <div className="min-w-[40px] font-bold">
          {message.role === 'assistant' ? (
            <IconRobot className="mx-auto my-0 block" size={30} />
          ) : (
            <IconUser className="mx-auto my-0 block" size={30} />
          )}

          {message.role === 'assistant' && message.context && (
            <IconListSearch
              className="mx-auto my-2 block"
              onClick={() => setContextOpened(!contextOpened)}
            />
          )}
        </div>

        <div className="prose prose-invert mt-[-2px] w-full">
          {message.role === 'user' ? (
            <div className="flex w-full">
              {isEditing ? (
                <div className="flex w-full flex-col">
                  <textarea
                    ref={textareaRef}
                    className="-m-2 w-full resize-none whitespace-pre-wrap rounded-md border-none bg-chatbot-800 p-2"
                    value={messageContent}
                    onChange={handleInputChange}
                    onKeyDown={handlePressEnter}
                    onCompositionStart={() => setIsTyping(true)}
                    onCompositionEnd={() => setIsTyping(false)}
                    style={{
                      fontFamily: 'inherit',
                      fontSize: 'inherit',
                      lineHeight: 'inherit',
                      overflow: 'hidden',
                    }}
                  />

                  <div className="mt-10 flex justify-center space-x-4">
                    <button
                      className="h-[40px] rounded-md bg-blue-500 px-4 py-1 text-sm font-medium text-white enabled:hover:bg-blue-600 disabled:opacity-50"
                      onClick={handleEditMessage}
                      disabled={messageContent.trim().length <= 0}
                    >
                      {t('Save & Submit')}
                    </button>
                    <button
                      className="h-[40px] rounded-md border border-neutral-700 px-4 py-1 text-sm font-medium text-neutral-300 hover:bg-neutral-800"
                      onClick={() => {
                        setMessageContent(message.content);
                        setIsEditing(false);
                      }}
                    >
                      {t('Cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="prose prose-invert whitespace-pre-wrap">
                  {message.content}
                </div>
              )}

              {(window.innerWidth < 640 || !isEditing) && (
                <button
                  className={`absolute translate-x-[1000px] text-gray-400 hover:text-gray-300 focus:translate-x-0 group-hover:translate-x-0 ${
                    window.innerWidth < 640
                      ? 'bottom-1 right-3'
                      : 'right-0 top-[26px]'
                  }
                    `}
                  onClick={toggleEditing}
                >
                  <IconEdit size={20} />
                </button>
              )}
            </div>
          ) : (
            <>
              <div
                className={`absolute ${
                  window.innerWidth < 640
                    ? 'bottom-1 right-3'
                    : 'right-0 top-[26px] m-0'
                }`}
              >
                {messagedCopied ? (
                  <IconCheck size={20} className="text-green-400" />
                ) : (
                  <button
                    className="translate-x-[1000px] text-gray-400 hover:text-gray-300 focus:translate-x-0 group-hover:translate-x-0"
                    onClick={copyOnClick}
                  >
                    <IconCopy size={20} />
                  </button>
                )}
              </div>

              <MemoizedReactMarkdown
                className="prose prose-invert"
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeMathjax]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');

                    return !inline && match ? (
                      <CodeBlock
                        key={Math.random()}
                        language={match[1]}
                        value={String(children).replace(/\n$/, '')}
                        {...props}
                      />
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  table({ children }) {
                    return (
                      <table className="border-collapse border border-white px-3 py-1">
                        {children}
                      </table>
                    );
                  },
                  th({ children }) {
                    return (
                      <th className="break-words border border-white bg-gray-500 px-3 py-1 text-white">
                        {children}
                      </th>
                    );
                  },
                  td({ children }) {
                    return (
                      <td className="break-words border border-white px-3 py-1">
                        {children}
                      </td>
                    );
                  },
                }}
              >
                {message.content}
              </MemoizedReactMarkdown>

              {message.configuration && (
                <div className="mt-2 text-right text-sm text-chatbot-400">
                  {t('Model')}: {getModelName(message.configuration.llmModelId)}
                  {message.configuration.settingsId && (
                    <>
                      ,&nbsp;
                      {t('Prompt settings')}:{' '}
                      {getSettingsName(message.configuration.settingsId)}
                    </>
                  )}
                </div>
              )}

              {message.context ? (
                <div
                  className={`grid font-normal transition-all ${
                    contextOpened ? 'mt-4' : 'h-0'
                  }`}
                  style={{ gridTemplateRows: contextOpened ? '1fr' : '0fr' }}
                  onClick={() => setContextOpened(true)}
                >
                  <div
                    className={`rounded-lg ${
                      contextOpened ? 'bg-gray-800' : ''
                    } overflow-hidden p-2 text-sm text-white`}
                  >
                    {message.configuration?.botType && (
                      <div className="m-2 my-2">
                        {t('RAG type')}: {t(message.configuration.botType)}
                      </div>
                    )}
                    <div className="m-2 mb-4">
                      {t(
                        'This answer was generated using following documents:',
                      )}
                    </div>
                    {message.context.map((doc, i) => (
                      <div key={i}>
                        <div className="m-2 mt-4 flex justify-between">
                          <div>
                            <b>{doc.metadata[documentKeys.source]}</b>
                            {doc.metadata[documentKeys.url] && (
                              <>
                                &nbsp;(
                                {t('URL')}:{' '}
                                <a
                                  href={doc.metadata[documentKeys.url]}
                                  target="_blank"
                                >
                                  {doc.metadata[documentKeys.url]}
                                </a>
                                )
                              </>
                            )}
                          </div>
                        </div>
                        <div className="m-2 mb-4">{doc.page_content}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
});
ChatMessage.displayName = 'ChatMessage';
