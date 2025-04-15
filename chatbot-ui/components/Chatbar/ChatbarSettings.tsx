import { Import } from '../Settings/Import';
import { ClearConversations } from './ClearConversations';
import Export from '@/components/Settings/Export';
import Settings from '@/components/Chatbar/Settings';

export const ChatbarSettings = () => {
  return (
    <div className="flex flex-col items-center space-y-1 border-t border-white/20 pt-1 text-sm">
      <ClearConversations />

      <Settings />

      <Import />

      <Export />
    </div>
  );
};
