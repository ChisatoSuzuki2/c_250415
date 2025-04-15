'use client';

import { IconPlus } from '@tabler/icons-react';
import { useCreateConversation } from '@/app/hooks/useCreateConversation';
import { useSearchTerm } from '@/components/Provider/SearchTermProvider';
import { useTranslation } from '@/app/i18n/client';
import { useAppState } from '@/components/Provider/AppStateContextProvider';
import { clsx } from 'clsx';

const NewChatButton = () => {
  const { t } = useTranslation('sidebar');

  const { chatbotState } = useAppState();

  const createConversation = useCreateConversation();
  const searchTerm = useSearchTerm();

  return (
    <button
      className={clsx(
        ['flex', 'flex-shrink-0'],
        'w-[190px]',
        'select-none',
        'items-center',
        'gap-3',
        'rounded-md',
        ['border', 'border-white/20'],
        'p-3',
        'text-[14px]',
        'leading-normal',
        'text-white',
        'transition-colors',
        'duration-200',
        'hover:bg-gray-500/10',
        ['cursor-pointer', 'disabled:cursor-not-allowed'],
      )}
      onClick={() => {
        createConversation();
        searchTerm.set('');
      }}
      disabled={chatbotState !== 'waiting-for-question'}
    >
      <IconPlus size={18} />
      {t('New chat')}
    </button>
  );
};

export default NewChatButton;
