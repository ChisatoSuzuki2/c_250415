import { ChangeEvent, FC } from 'react';
import { useTranslation } from '@/app/i18n/client';
import { BotType, BotTypes } from '@/app/types/chat';
import { useUpdateBotType } from '@/app/hooks/useUpdateBotType';

interface Props {
  botType: BotType;
}

export const BotTypeSelect: FC<Props> = ({ botType }) => {
  const { t } = useTranslation('chat');

  const updateBotType = useUpdateBotType();

  const onChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const botType =
      BotTypes.find((type) => type === e.target.value) || BotTypes[0];

    updateBotType(botType);
  };

  return (
    <div className="flex items-center">
      <label className="w-3/12 text-neutral-300">{t('RAG type')}</label>
      <div className="w-9/12 rounded-lg border border-chatbot-700 bg-transparent pr-2 text-white">
        <select
          className="w-full bg-transparent p-2 text-neutral-300"
          placeholder={t('Select a RAG type') || ''}
          value={botType}
          onChange={onChange}
        >
          {BotTypes.map((type) => (
            <option
              key={type}
              value={type}
              className="bg-chatbot-900 text-white"
            >
              {t(type)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
