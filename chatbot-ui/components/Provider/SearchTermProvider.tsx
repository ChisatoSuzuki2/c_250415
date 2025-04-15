'use client';

import { createContext, FC, ReactNode, useContext, useState } from 'react';

const SearchTermContext = createContext<{
  value: string;
  set: (value: string) => void;
}>({
  value: '',
  set: () => {},
});

export const SearchTermProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <SearchTermContext.Provider
      value={{ value: searchTerm, set: setSearchTerm }}
    >
      {children}
    </SearchTermContext.Provider>
  );
};

export const useSearchTerm = () => {
  return useContext(SearchTermContext);
};
