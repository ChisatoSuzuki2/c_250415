'use client';

import { createContext, FC, ReactNode, useContext, useState } from 'react';
import { SidebarButton } from '@/components/Sidebar/SidebarButton';
import { IconSettings } from '@tabler/icons-react';
import { useTranslation } from '@/app/i18n/client';

type DialogState = {
  isOpened: boolean;
  close: () => void;
};

const DialogContext = createContext<DialogState>({
  isOpened: false,
  close: () => undefined,
});

export const useDialog = () => {
  return useContext(DialogContext);
};

type Props = {
  children: ReactNode;
};

const Dialog: FC<Props> = ({ children }) => {
  const { t } = useTranslation('settings');

  const [isOpened, setIsOpened] = useState(false);

  return (
    <DialogContext.Provider
      value={{ isOpened, close: () => setIsOpened(false) }}
    >
      <SidebarButton
        text={t('Settings')}
        icon={<IconSettings size={18} />}
        onClick={() => setIsOpened(true)}
      />

      {isOpened && (
        <div className="relative contents" role="dialog" aria-modal="true">
          <div className="fixed inset-0 z-[25] bg-black bg-opacity-65 transition-opacity"></div>

          <div className="fixed inset-0 z-30 w-screen overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 sm:p-0">
              <div
                className="relative z-40 transform overflow-hidden rounded-lg bg-[#343541] text-left shadow-xl transition-all sm:my-8"
                onClick={(e) => e.stopPropagation()}
              >
                {children}
              </div>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
};

export default Dialog;
