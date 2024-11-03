export type SupportedLocales = 'en' | 'es' | 'tr';

export type TranslationMessages = Record<string, string>;

export interface Messages {
    en: TranslationMessages;
    es: TranslationMessages;
    tr: TranslationMessages;
} 