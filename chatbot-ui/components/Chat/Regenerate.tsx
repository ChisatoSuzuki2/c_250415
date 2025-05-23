'use client';

import { IconRefresh } from '@tabler/icons-react';
import { FC } from 'react';
import { useTranslation } from '@/app/i18n/client';

interface Props {
  onRegenerate: () => void;
}

export const Regenerate: FC<Props> = ({ onRegenerate }) => {
  const { t } = useTranslation('chat');
  return (
    <div className="fixed bottom-4 left-0 right-0 ml-auto mr-auto w-full px-2 sm:absolute sm:bottom-8 sm:left-[280px] sm:w-1/2 lg:left-[200px]">
      <div className="mb-4 text-center text-red-500">
        {t('Sorry, there was an error.')}
      </div>
      <button
        className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-chatbot-800 text-sm font-semibold text-neutral-200"
        onClick={onRegenerate}
      >
        <IconRefresh />
        <div>{t('Regenerate response')}</div>
      </button>
    </div>
  );
};
