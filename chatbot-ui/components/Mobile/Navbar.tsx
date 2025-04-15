'use client';

import { IconPlus } from '@tabler/icons-react';
import { FC } from 'react';
import { useAppState } from '@/components/Provider/AppStateContextProvider';
import { useCreateConversation } from '@/app/hooks/useCreateConversation';

interface Props {}

export const Navbar: FC<Props> = () => {
  const { selectedConversationId, conversations } = useAppState();
  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId,
  );

  const createNewConversation = useCreateConversation();

  const onClick = () => {
    createNewConversation();
  };

  return (
    <>
      {selectedConversation && (
        <nav className="flex w-full justify-between bg-chatbot-950 px-4 py-3">
          <div className="mr-4"></div>

          <div className="max-w-[240px] overflow-hidden text-ellipsis whitespace-nowrap">
            {selectedConversation.name}
          </div>

          <IconPlus
            className="mr-8 cursor-pointer hover:text-neutral-400"
            onClick={onClick}
          />
        </nav>
      )}
    </>
  );
};
