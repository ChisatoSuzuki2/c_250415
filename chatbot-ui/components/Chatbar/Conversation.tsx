import { Conversation } from '@/app/types/chat';
import {
  IconCheck,
  IconMessage,
  IconPencil,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { DragEvent, FC, KeyboardEvent, useEffect, useState } from 'react';
import {
  useAppState,
  useAppStateDispatch,
} from '@/components/Provider/AppStateContextProvider';
import { useUpdateConversation } from '@/app/hooks/useUpdateConversation';
import { useDeleteConversation } from '@/app/hooks/useDeleteConversation';
import { clsx } from 'clsx';

interface Props {
  conversation: Conversation;
}

export const ConversationComponent: FC<Props> = ({ conversation }) => {
  const { selectedConversationId, chatbotState } = useAppState();
  const dispatch = useAppStateDispatch();

  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  const updateConversation = useUpdateConversation();
  const deleteConversation = useDeleteConversation();

  const handleEnterDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      handleRename();
    }
  };

  const handleDragStart = (
    e: DragEvent<HTMLButtonElement>,
    conversation: Conversation,
  ) => {
    if (e.dataTransfer) {
      e.dataTransfer.setData('conversation', JSON.stringify(conversation));
    }
  };

  const handleRename = () => {
    if (renameValue.trim().length > 0) {
      updateConversation(conversation, { name: renameValue });
      setRenameValue('');
      setIsRenaming(false);
    }
  };

  const handleSelectConversation = () => {
    dispatch({ type: 'conversationSelected', conversationId: conversation.id });
  };

  useEffect(() => {
    if (isRenaming) {
      setIsDeleting(false);
    } else if (isDeleting) {
      setIsRenaming(false);
    }
  }, [isRenaming, isDeleting]);

  return (
    <div className="relative flex items-center">
      {isRenaming && selectedConversationId === conversation.id ? (
        <div className="flex w-full items-center gap-3 rounded-lg bg-chatbot-900/90 p-3">
          <IconMessage size={18} />
          <input
            className="mr-12 flex-1 overflow-hidden overflow-ellipsis border-neutral-400 bg-transparent text-left text-[12.5px] leading-3 text-white outline-none focus:border-neutral-100"
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={handleEnterDown}
            autoFocus
          />
        </div>
      ) : (
        <button
          className={clsx(
            'flex',
            'w-full',
            'items-center',
            'gap-3',
            'rounded-lg',
            'p-3',
            'text-sm',
            'transition-colors',
            'duration-200',
            ['cursor-pointer', 'disabled:cursor-not-allowed'],
            'hover:bg-chatbot-900/90',
            selectedConversationId === conversation.id && 'bg-chatbot-900/90',
          )}
          onClick={() => handleSelectConversation()}
          disabled={chatbotState !== 'waiting-for-question'}
          draggable="true"
          onDragStart={(e) => handleDragStart(e, conversation)}
        >
          <IconMessage size={18} />
          <div
            className={clsx(
              'relative',
              'max-h-5',
              'flex-1',
              'overflow-hidden',
              'text-ellipsis',
              'whitespace-nowrap',
              'break-all',
              'text-left',
              'text-[12.5px]',
              'leading-3',
              selectedConversationId === conversation.id ? 'pr-12' : 'pr-1',
            )}
          >
            {conversation.name}
          </div>
        </button>
      )}

      {(isDeleting || isRenaming) &&
        selectedConversationId === conversation.id && (
          <div className="absolute right-1 z-10 flex text-gray-300">
            <button
              className="min-w-[20px] p-1 text-neutral-400 hover:text-neutral-100"
              onClick={(e) => {
                e.stopPropagation();
                if (isDeleting) {
                  deleteConversation(conversation);
                } else if (isRenaming) {
                  handleRename();
                }
                setIsDeleting(false);
                setIsRenaming(false);
              }}
            >
              <IconCheck size={18} />
            </button>
            <button
              className="min-w-[20px] p-1 text-neutral-400 hover:text-neutral-100"
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleting(false);
                setIsRenaming(false);
              }}
            >
              <IconX size={18} />
            </button>
          </div>
        )}

      {selectedConversationId === conversation.id &&
        !isDeleting &&
        !isRenaming && (
          <div className="absolute right-1 z-10 flex text-gray-300">
            <button
              className="min-w-[20px] p-1 text-neutral-400 hover:text-neutral-100"
              onClick={(e) => {
                e.stopPropagation();
                setIsRenaming(true);
                setRenameValue(conversation.name);
              }}
            >
              <IconPencil size={18} />
            </button>
            <button
              className="min-w-[20px] p-1 text-neutral-400 hover:text-neutral-100"
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleting(true);
              }}
            >
              <IconTrash size={18} />
            </button>
          </div>
        )}
    </div>
  );
};
