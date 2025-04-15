'use client';

import { KeyPrefix, Namespace } from 'i18next';
import {
  useTranslation as useTranslationOrg,
  UseTranslationOptions,
} from 'react-i18next';
import { useContext, useEffect } from 'react';
import { I18nContext } from '@/app/i18n/I18nContextProvider';

export const useTranslation = <
  N extends Namespace,
  KPrefix extends KeyPrefix<N> = undefined,
>(
  ns?: N,
  options?: UseTranslationOptions<KPrefix>,
) => {
  const lng = useContext(I18nContext);

  const ret = useTranslationOrg(ns, options);
  const i18n = ret.i18n;

  useEffect(() => {
    if (!lng || i18n.resolvedLanguage === lng) return;
    i18n.changeLanguage(lng);
  }, [lng, i18n]);

  return ret;
};
