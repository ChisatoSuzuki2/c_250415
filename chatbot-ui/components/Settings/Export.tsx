'use client';

import { SidebarButton } from '@/components/Sidebar/SidebarButton';
import { IconFileExport } from '@tabler/icons-react';
import { useTranslation } from '@/app/i18n/client';
import { exportData } from '@/app/utils/importExport';
import { useAppState } from '@/components/Provider/AppStateContextProvider';

const Export = () => {
  const { t } = useTranslation('sidebar');

  const { conversations, folders } = useAppState();

  const handleExportData = () => {
    exportData(conversations, folders);
  };

  return (
    <SidebarButton
      text={t('Export data')}
      icon={<IconFileExport size={18} />}
      onClick={() => handleExportData()}
    />
  );
};

export default Export;
