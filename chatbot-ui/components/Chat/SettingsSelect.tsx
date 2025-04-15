import { FC, useEffect } from 'react';
import { useTranslation } from '@/app/i18n/client';
import { useServerState } from '@/components/Provider/ServerStateProvider';
import { useUpdateSettingsId } from '@/app/hooks/useUpdateSettingsId';

interface Props {
  settingsId: string | null;
}

export const SettingsSelect: FC<Props> = ({ settingsId }) => {
  const { t } = useTranslation('chat');

  const { settingsList } = useServerState();

  const updateSettingsId = useUpdateSettingsId();

  const onChange = (settingsId: string) => {
    updateSettingsId(settingsId);
  };

  useEffect(() => {
    const settings = settingsList.find((s) => s.id === settingsId);
    if (settingsList.length > 0 && !settings)
      updateSettingsId(settingsList[0].id);
  }, [settingsList, settingsId, updateSettingsId]);

  const currentSettings = settingsList?.find((s) => s.id === settingsId);

  return (
    <div>
      <div className="flex items-center">
        <label className="w-3/12 text-neutral-300">
          {t('Prompt settings')}
        </label>
        <div className="w-9/12">
          <div className="rounded-lg border border-chatbot-700 bg-transparent pr-2">
            <select
              className="w-full bg-transparent p-2 text-neutral-300"
              placeholder={t('Select a LLM model') || ''}
              value={settingsId || undefined}
              onChange={(e) => onChange(e.target.value)}
            >
              {settingsList.map((settings) => (
                <option
                  key={settings.id}
                  value={settings.id}
                  className="bg-chatbot-900 text-white"
                >
                  {settings.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="flex">
        <div className="w-3/12"></div>
        <div className="w-9/12 p-3 text-neutral-300">
          {currentSettings?.description}
        </div>
      </div>
    </div>
  );
};
