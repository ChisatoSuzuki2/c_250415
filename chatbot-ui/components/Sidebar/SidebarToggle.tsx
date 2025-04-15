'use client';

import { IconArrowBarLeft, IconArrowBarRight } from '@tabler/icons-react';
import { useAppState } from '@/components/Provider/AppStateContextProvider';
import { useToggleChatbar } from '@/app/hooks/useToggleChatbar';
import { FC, ReactNode } from 'react';

const SidebarToggle: FC<{ children: ReactNode }> = ({ children }) => {
  const { showSidebar } = useAppState();

  const toggleChatbar = useToggleChatbar();

  if (showSidebar) {
    return (
      <div>
        {children}

        <button
          className="fixed left-[270px] top-5 z-20 h-7 w-7 text-white hover:text-gray-300 sm:left-[270px] sm:top-0.5 sm:h-8 sm:w-8 sm:text-neutral-700"
          onClick={toggleChatbar}
        >
          <IconArrowBarLeft />
        </button>
        <div
          onClick={toggleChatbar}
          className="absolute left-0 top-0 z-10 h-full w-full bg-black opacity-70 sm:hidden"
        ></div>
      </div>
    );
  } else {
    return (
      <button
        className="fixed left-4 top-2.5 z-20 h-7 w-7 text-white hover:text-gray-300 sm:left-4 sm:top-0.5 sm:h-8 sm:w-8 sm:text-neutral-700"
        onClick={toggleChatbar}
      >
        <IconArrowBarRight />
      </button>
    );
  }
};

export default SidebarToggle;
