import { InitOptions } from 'i18next';

export const fallbackLng = 'en';
export const languages = [fallbackLng, 'ja'];
export const defaultNS = 'translation';
export const cookieName = 'i18next';

export function getOptions(
  lng = fallbackLng,
  ns: string | string[] = defaultNS,
): InitOptions {
  return {
    lng,
    ns,
    fallbackLng,
    defaultNS,
    supportedLngs: languages,
    detection: {
      order: ['path', 'htmlTag', 'cookie', 'navigator'],
    },
    preload: [],
  };
}
