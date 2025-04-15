'use client';

import React, { createContext } from 'react';
import { initReactI18next } from 'react-i18next';
import i18next from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { fallbackLng, getOptions } from '@/app/i18n/settings';

// on client side the normal singleton is ok
i18next
  .use(initReactI18next)
  .use(
    resourcesToBackend(
      (language: string, namespace: string) =>
        import(`./locales/${language}/${namespace}.json`),
    ),
  )
  .init(getOptions());

export const I18nContext = createContext(fallbackLng);

export const I18nContextProvider = ({
  children,
  language,
}: {
  children: React.ReactNode;
  language: string;
}) => {
  return (
    <I18nContext.Provider value={language}>{children}</I18nContext.Provider>
  );
};
