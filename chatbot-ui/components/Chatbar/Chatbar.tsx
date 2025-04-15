import { ChatFolders } from '../Folders/Chat/ChatFolders';
import { Search } from '../Sidebar/Search';
import { ChatbarSettings } from './ChatbarSettings';
import { Conversations } from './Conversations';
import { SearchTermProvider } from '@/components/Provider/SearchTermProvider';
import NewChatButton from '@/components/Chatbar/NewChatButton';
import NewFolderButton from '@/components/Chatbar/NewFolderButton';

export const Chatbar = () => {
  return (
    <div className="fixed bottom-0 top-0 z-20 flex h-full w-[260px] flex-none flex-col space-y-2 bg-chatbot-950 p-2 transition-all sm:relative sm:top-0">
      <SearchTermProvider>
        <div className="flex items-center">
          <NewChatButton />
          <NewFolderButton />
        </div>

        <Search placeholder="Search conversations..." />

        <div className="flex-grow overflow-auto">
          <ChatFolders />

          <Conversations />
        </div>

        <ChatbarSettings />
      </SearchTermProvider>
    </div>
  );
};
