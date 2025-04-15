'use client';

import { BotTypeSelect } from '@/components/Chat/BotTypeSelect';
import TeamSelect from '@/components/Chat/TeamSelect';
import { Conversation } from '@/app/types/chat';
import { FC } from 'react';
import { useTranslation } from '@/app/i18n/client';
import { useServerState } from '@/components/Provider/ServerStateProvider';
import { LLMModelSelect } from '@/components/Chat/LLMModelSelect';
import { SettingsSelect } from '@/components/Chat/SettingsSelect';

type Props = {
  conversation: Conversation;
};

const ChatStartConversationView: FC<Props> = ({ conversation }) => {
  const { t } = useTranslation('chat');

  const { teams } = useServerState();

  return (
    <>
      <div className="mx-auto flex w-[350px] flex-col space-y-10 pt-12 sm:w-[600px]">
        <div className="text-center text-3xl font-semibold text-gray-100">
          RAG Sample App
        </div>

        <div className="flex h-full flex-col space-y-4 p-2">
          <LLMModelSelect llmModelId={conversation.llmModelId} />
        </div>

        <div className="flex h-full flex-col space-y-4 p-2">
          <BotTypeSelect botType={conversation.botType} />
        </div>

        <div className="flex h-full flex-col space-y-4 p-2">
          <SettingsSelect settingsId={conversation.settingsId} />
        </div>

        <div className="flex h-full flex-col space-y-4 p-2">
          {teams.length === 0 ? (
            <div className="text-center">
              {t(
                'No team found. To start conversation with AI, create a team via settings on the lower left first.',
              )}
            </div>
          ) : (
            <TeamSelect teams={teams} />
          )}
        </div>
      </div>
    </>
  );
};

export default ChatStartConversationView;
