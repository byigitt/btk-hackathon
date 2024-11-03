import type React from 'react';
import { IntlProvider as ReactIntlProvider } from 'react-intl';
import { messages, defaultLocale, getNavigatorLocale } from './config';
import type { SupportedLocales } from './types';

interface Props {
    children: React.ReactNode;
    forcedLocale?: SupportedLocales;
}

export function IntlProvider({ children, forcedLocale }: Props) {
    const locale: SupportedLocales = forcedLocale || getNavigatorLocale();

    return (
        <ReactIntlProvider
            messages={messages[locale]}
            locale={locale}
            defaultLocale={defaultLocale}
        >
            {children}
        </ReactIntlProvider>
    );
} 