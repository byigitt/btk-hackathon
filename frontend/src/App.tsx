import type React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import MainPage from './components/Main';
import { ChatPage } from './components/Chat';
import { ThemeProvider } from './contexts/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle/ThemeToggle';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import { useThemeIcons } from './hooks/useThemeIcons';
import { IntlProvider } from './i18n/IntlProvider';
import type { SupportedLocales } from './i18n/types';
import { defaultLocale } from './i18n/config';

const SUPPORTED_LOCALES: SupportedLocales[] = ['en', 'es', 'tr'];

const AppContent: React.FC<{ locale: SupportedLocales }> = ({ locale }) => {
  useThemeIcons();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="chat/:timestamp" element={<ChatPage />} />
      </Routes>
    </Box>
  );
};

const App: React.FC = () => {
  // Get user's browser language
  const getUserLocale = (): SupportedLocales => {
    const browserLang = navigator.language.split('-')[0] as SupportedLocales;
    return SUPPORTED_LOCALES.includes(browserLang) ? browserLang : defaultLocale;
  };

  // Store the redirect state in session storage to prevent loops
  const shouldRedirect = !sessionStorage.getItem('initialRedirect');
  if (shouldRedirect) {
    sessionStorage.setItem('initialRedirect', 'true');
  }

  return (
    <ThemeProvider>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Default route - redirect to user's locale only on first visit */}
          <Route 
            path="/" 
            element={
              shouldRedirect ? (
                <Navigate to={`/${getUserLocale()}`} replace />
              ) : (
                <Navigate to={`/${defaultLocale}`} replace />
              )
            } 
          />

          {/* Locale-specific routes */}
          {SUPPORTED_LOCALES.map((locale) => (
            <Route
              key={locale}
              path={`/${locale}/*`}
              element={
                <IntlProvider forcedLocale={locale}>
                  <AppContent locale={locale} />
                </IntlProvider>
              }
            />
          ))}

          {/* Redirect unknown paths to user's locale */}
          <Route 
            path="*" 
            element={<Navigate to={`/${getUserLocale()}`} replace />} 
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
