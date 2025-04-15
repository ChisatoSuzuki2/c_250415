'use client';

import {
  IconAlertCircle,
  IconClearAll,
  IconSettings,
} from '@tabler/icons-react';
import { BotTypeSelect } from '@/components/Chat/BotTypeSelect';
import { useTranslation } from '@/app/i18n/client';
import { Conversation } from '@/app/types/chat';
import { FC, useState } from 'react';
import { useUpdateConversation } from '@/app/hooks/useUpdateConversation';
import { useServerState } from '@/components/Provider/ServerStateProvider';
import Tooltip from '@/components/Global/Tooltip';
import { LLMModelSelect } from '@/components/Chat/LLMModelSelect';
import { SettingsSelect } from '@/components/Chat/SettingsSelect';

type Props = {
  conversation: Conversation;
};

const ChatHeader: FC<Props> = ({ conversation }) => {
  const { t } = useTranslation('chat');

  const { teams, embeddings, llmModels } = useServerState();

  const team = teams.find((t) => t.id === conversation?.teamId);
  const llmModel = llmModels.find(
    (m) => m.model_id === conversation.llmModelId,
  );
  const embedding = embeddings.find(
    (e) => e.model_id === team?.embedding_model,
  );

  const [showSettings, setShowSettings] = useState<boolean>(false);

  const updateConversation = useUpdateConversation();

  const handleSettings = () => {
    setShowSettings(!showSettings);
  };

  const onClearAll = () => {
    if (confirm(t<string>('Are you sure you want to clear all messages?'))) {
      updateConversation(conversation, { messages: [] });
    }
  };

  return (
    <>
      <div className="flex h-fit justify-center border-none bg-neutral-800 py-2 align-middle text-sm leading-none text-neutral-200">
        <span className="inline-block max-w-[40%] px-2">
          <span className="inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
            {t('Team')}: {team?.name || conversation.teamId}
          </span>
          {!team && (
            <Tooltip
              position="bottom"
              tooltipContent={<>{t<string>('This team was deleted.')}</>}
            >
              <IconAlertCircle
                className="-mt-1 ml-2 inline text-rose-500"
                size={18}
              />
            </Tooltip>
          )}
          {team && embedding == null && (
            <Tooltip
              position="bottom"
              tooltipContent={
                <>
                  {t<string>(
                    'Embedding ID "{{model}}" is not deployed. RAG is disabled.',
                    { model: team?.embedding_model },
                  )}
                </>
              }
            >
              <IconAlertCircle
                className="-mt-1 ml-2 inline text-rose-500"
                size={18}
              />
            </Tooltip>
          )}
        </span>

        {team && (
          <>
            <span className="border-x border-neutral-600 px-2">
              {t('LLM model')}:{' '}
              {`${llmModel?.name} (${llmModel?.type})` ||
                conversation.llmModelId}
            </span>

            <span className="border-x border-neutral-600 px-2">
              {t('RAG type')}: {t(conversation.botType)}
            </span>

            <button
              className="ml-2 cursor-pointer hover:opacity-50"
              onClick={handleSettings}
            >
              <IconSettings size={18} />
            </button>

            <button
              className="ml-2 cursor-pointer hover:opacity-50"
              onClick={onClearAll}
            >
              <IconClearAll size={18} />
            </button>
          </>
        )}
      </div>

      {showSettings && (
        <div className="relative h-fit w-full bg-neutral-800">
          <div className="flex h-full flex-col space-y-4 p-4">
            <LLMModelSelect llmModelId={conversation.llmModelId} />
            <BotTypeSelect botType={conversation.botType} />
            <SettingsSelect settingsId={conversation.settingsId} />
          </div>
        </div>
      )}
    </>
  );
};

export default ChatHeader;
