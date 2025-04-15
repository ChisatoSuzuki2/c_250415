import ChatHeader from '@/components/Chat/ChatHeader';
import { ChatMessage } from '@/components/Chat/ChatMessage';
import { ChatLoader } from '@/components/Chat/ChatLoader';
import { Conversation } from '@/app/types/chat';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useAppState } from '@/components/Provider/AppStateContextProvider';
import { IconArrowDown } from '@tabler/icons-react';

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): T {
  let lastFunc: ReturnType<typeof setTimeout>;
  let lastRan: number;

  return ((...args) => {
    if (!lastRan) {
      func(...args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  }) as T;
}

type Props = {
  conversation: Conversation;
  onScrollToEnd: () => void;
};

const ChatMessages: FC<Props> = ({ conversation, onScrollToEnd }) => {
  const { chatbotState } = useAppState();

  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);
  const [showScrollDownButton, setShowScrollDownButton] =
    useState<boolean>(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      onScrollToEnd();
    }
  }, [autoScrollEnabled, messagesEndRef, onScrollToEnd]);

  const handleScrollDown = () => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      const bottomTolerance = 30;

      if (scrollTop + clientHeight < scrollHeight - bottomTolerance) {
        setAutoScrollEnabled(false);
        setShowScrollDownButton(true);
      } else {
        setAutoScrollEnabled(true);
        setShowScrollDownButton(false);
      }
    }
  };

  const scrollDown = () => {
    if (autoScrollEnabled) {
      onScrollToEnd();
      messagesEndRef.current?.scrollIntoView(true);
    }
  };

  const throttledScrollDown = throttle(scrollDown, 250);

  useEffect(() => {
    throttledScrollDown();
    if (!conversation) return;
  }, [conversation, conversation?.messages, throttledScrollDown]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setAutoScrollEnabled(entry.isIntersecting);
        if (entry.isIntersecting) {
          onScrollToEnd();
        }
      },
      {
        root: null,
        threshold: 0.5,
      },
    );
    const messagesEndElement = messagesEndRef.current;
    if (messagesEndElement) {
      observer.observe(messagesEndElement);
    }
    return () => {
      if (messagesEndElement) {
        observer.unobserve(messagesEndElement);
      }
    };
  }, [messagesEndRef, onScrollToEnd]);

  return (
    <div className="flex h-full flex-col">
      <ChatHeader conversation={conversation} />

      <div
        className="h-full flex-1 overflow-x-hidden"
        ref={chatContainerRef}
        onScroll={handleScroll}
      >
        {conversation.messages.map((message, index) => (
          <ChatMessage key={index} message={message} messageIndex={index} />
        ))}

        {chatbotState === 'requesting' && <ChatLoader />}

        <div className="h-[162px]" ref={messagesEndRef} />
      </div>

      {showScrollDownButton && (
        <div className="absolute bottom-6 right-0 z-10 mb-4 mr-4 pb-20">
          <button
            className="flex h-7 w-7 items-center justify-center rounded-full bg-chatbot-700 text-neutral-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={handleScrollDown}
          >
            <IconArrowDown size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatMessages;
