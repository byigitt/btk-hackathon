import type { Messages, SupportedLocales } from './types';
import en from './translations/en';
import es from './translations/es';
import tr from './translations/tr';

export const messages: Messages = {
    en,
    es,
    tr
};

export const defaultLocale: SupportedLocales = 'en';

export function getNavigatorLocale(): SupportedLocales {
    const browserLocale = navigator.language.split('-')[0] as SupportedLocales;
    return browserLocale in messages ? browserLocale : defaultLocale;
} 