import { useLocation, useNavigate } from 'react-router-dom';
import type { SupportedLocales } from '../i18n/types';

export function useLocale() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentLocale = location.pathname.split('/')[1] as SupportedLocales;

  const changeLocale = (newLocale: SupportedLocales) => {
    const pathWithoutLocale = location.pathname.split('/').slice(2).join('/');
    navigate(`/${newLocale}/${pathWithoutLocale}${location.search}`);
  };

  return {
    currentLocale,
    changeLocale
  };
} 