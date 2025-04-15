'use client';

import { IconCheck, IconTrash, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { SidebarButton } from '../Sidebar/SidebarButton';
import { useClearConversations } from '@/app/hooks/useClearConversations';
import { useTranslation } from '@/app/i18n/client';
import { useAppState } from '@/components/Provider/AppStateContextProvider';

export const ClearConversations = () => {
  const { t } = useTranslation('sidebar');

  const { conversations } = useAppState();

  const [isConfirming, setIsConfirming] = useState<boolean>(false);

  const clearConversations = useClearConversations();

  const handleClearConversations = () => {
    clearConversations();
    setIsConfirming(false);
  };

  if (conversations.length === 0) return <></>;

  return isConfirming ? (
    <div className="flex w-full cursor-pointer items-center rounded-lg px-3 py-3 hover:bg-gray-500/10">
      <IconTrash size={18} />

      <div className="ml-3 flex-1 text-left text-[12.5px] leading-3 text-white">
        {t('Are you sure?')}
      </div>

      <div className="flex w-[40px]">
        <IconCheck
          className="ml-auto mr-1 min-w-[20px] text-neutral-400 hover:text-neutral-100"
          size={18}
          onClick={(e) => {
            e.stopPropagation();
            handleClearConversations();
          }}
        />

        <IconX
          className="ml-auto min-w-[20px] text-neutral-400 hover:text-neutral-100"
          size={18}
          onClick={(e) => {
            e.stopPropagation();
            setIsConfirming(false);
          }}
        />
      </div>
    </div>
  ) : (
    <SidebarButton
      text={t('Clear conversations')}
      icon={<IconTrash size={18} />}
      onClick={() => setIsConfirming(true)}
    />
  );
};
