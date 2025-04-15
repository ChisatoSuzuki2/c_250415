'use client';

import { IconFolderPlus } from '@tabler/icons-react';
import { useTranslation } from '@/app/i18n/client';
import { useCreateFolder } from '@/app/hooks/useCreateFolder';

const NewFolderButton = () => {
  const { t } = useTranslation('sidebar');

  const createFolder = useCreateFolder();

  return (
    <button
      className="ml-2 flex flex-shrink-0 cursor-pointer items-center gap-3 rounded-md border border-white/20 p-3 text-[14px] leading-normal text-white transition-colors duration-200 hover:bg-gray-500/10"
      onClick={() => createFolder(t('New folder'), 'chat')}
    >
      <IconFolderPlus size={18} />
    </button>
  );
};

export default NewFolderButton;
