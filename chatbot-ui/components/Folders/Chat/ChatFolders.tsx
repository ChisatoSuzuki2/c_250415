'use client';

import { ChatFolder } from './ChatFolder';
import { useAppState } from '@/components/Provider/AppStateContextProvider';
import { useSearchTerm } from '@/components/Provider/SearchTermProvider';

export const ChatFolders = () => {
  const { folders, conversations } = useAppState();
  const chatFolders = folders.filter((folder) => folder.type === 'chat');

  const searchTerm = useSearchTerm();

  if (chatFolders.length === 0) return <></>;

  return (
    <div className="flex border-b border-white/20 pb-2">
      <div className="flex w-full flex-col pt-2">
        {folders.map((folder, index) => (
          <ChatFolder
            key={index}
            searchTerm={searchTerm.value}
            conversations={conversations.filter((c) => c.folderId)}
            currentFolder={folder}
          />
        ))}
      </div>
    </div>
  );
};
