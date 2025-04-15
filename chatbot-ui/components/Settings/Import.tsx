'use client';

import { IconFileImport } from '@tabler/icons-react';
import { SidebarButton } from '../Sidebar/SidebarButton';
import { useTranslation } from '@/app/i18n/client';
import { LatestExportFormat, SupportedExportFormats } from '@/app/types/export';
import { importData } from '@/app/utils/importExport';
import { useAppStateDispatch } from '@/components/Provider/AppStateContextProvider';
import { ChangeEvent } from 'react';

export const Import = () => {
  const { t } = useTranslation('sidebar');

  const dispatch = useAppStateDispatch();

  const onImport = (data: SupportedExportFormats) => {
    const { conversations, folders }: LatestExportFormat = importData(data);
    dispatch({ type: 'conversationsUpdated', conversations });
    dispatch({
      type: 'conversationSelected',
      conversationId:
        conversations.length > 0
          ? conversations[conversations.length - 1].id
          : null,
    });
    dispatch({ type: 'foldersUpdated', folders });
  };

  return (
    <>
      <input
        id="import-file"
        className="sr-only"
        tabIndex={-1}
        type="file"
        accept=".json"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (!file) return;

          const reader = new FileReader();
          reader.onload = (e) => {
            const json = JSON.parse(e.target?.result as string);
            onImport(json);
          };
          reader.readAsText(file);
        }}
      />

      <SidebarButton
        text={t('Import data')}
        icon={<IconFileImport size={18} />}
        onClick={() => {
          const importFile = document.querySelector(
            '#import-file',
          ) as HTMLInputElement;
          if (importFile) {
            importFile.click();
          }
        }}
      />
    </>
  );
};
