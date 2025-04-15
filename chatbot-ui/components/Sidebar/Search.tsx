'use client';

import { IconX } from '@tabler/icons-react';
import { ChangeEvent, FC } from 'react';

import { useTranslation } from '@/app/i18n/client';
import { useSearchTerm } from '@/components/Provider/SearchTermProvider';
import { useAppState } from '@/components/Provider/AppStateContextProvider';

interface Props {
  placeholder: string;
}

export const Search: FC<Props> = ({ placeholder }) => {
  const { t } = useTranslation('sidebar');

  const { conversations, folders } = useAppState();

  const searchTerm = useSearchTerm();

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    searchTerm.set(e.target.value);
  };

  const clearSearch = () => {
    searchTerm.set('');
  };

  if (conversations.length <= 1) return <></>;

  return (
    <div className="relative flex items-center">
      <input
        className="w-full flex-1 rounded-md border border-chatbot-700 bg-chatbot-950 px-4 py-3 pr-10 text-[14px] leading-3 text-white"
        type="text"
        placeholder={t(placeholder) || ''}
        value={searchTerm.value}
        onChange={handleSearchChange}
      />

      {searchTerm && (
        <IconX
          className="absolute right-4 cursor-pointer text-neutral-300 hover:text-neutral-400"
          size={18}
          onClick={clearSearch}
        />
      )}
    </div>
  );
};
