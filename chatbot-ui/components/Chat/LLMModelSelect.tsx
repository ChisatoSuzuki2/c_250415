import { FC, useEffect } from 'react';
import { useTranslation } from '@/app/i18n/client';
import { useServerState } from '@/components/Provider/ServerStateProvider';
import { useUpdateLLMModelID } from '@/app/hooks/useUpdateLLMModelID';

interface Props {
  llmModelId: string | null;
}

export const LLMModelSelect: FC<Props> = ({ llmModelId }) => {
  const { t } = useTranslation('chat');

  const { llmModels } = useServerState();

  const updateLLMModelID = useUpdateLLMModelID();

  const onChange = (modelId: string) => {
    updateLLMModelID(modelId);
  };

  useEffect(() => {
    const m = llmModels.find((m) => m.model_id === llmModelId);
    if (!m && llmModels.length > 0) updateLLMModelID(llmModels[0].model_id);
  }, [llmModels, llmModelId, updateLLMModelID]);

  return (
    <div className="flex items-center">
      <label className="w-3/12 text-neutral-300">{t('Model')}</label>
      <div className="w-9/12 rounded-lg border border-chatbot-700 bg-transparent pr-2 text-white">
        <select
          className="w-full bg-transparent p-2 text-neutral-300"
          placeholder={t('Select a LLM model') || ''}
          value={llmModelId || undefined}
          onChange={(e) => onChange(e.target.value)}
        >
          {llmModels.map((model) => (
            <option
              key={model.model_id}
              value={model.model_id}
              className="bg-chatbot-900 text-white"
            >
              {model.name} ({model.type})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
