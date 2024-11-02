import { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const useThemeIcons = () => {
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const theme = isDarkMode ? 'light' : 'dark';
    
    // Update favicon
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon) {
      favicon.href = `${process.env.PUBLIC_URL}/icons/${theme}/favicon.png`;
    }

    // Update apple-touch-icon
    const touchIcon = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
    if (touchIcon) {
      touchIcon.href = `${process.env.PUBLIC_URL}/icons/${theme}/search-icon-192.png`;
    }

    // Update manifest
    const manifest = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (manifest) {
      const manifestData = {
        "short_name": "Search App",
        "name": "Advanced Search Application",
        "icons": [
          {
            "src": `icons/${theme}/favicon.png`,
            "sizes": "32x32",
            "type": "image/png"
          },
          {
            "src": `icons/${theme}/search-icon-192.png`,
            "type": "image/png",
            "sizes": "192x192"
          },
          {
            "src": `icons/${theme}/search-icon-512.png`,
            "type": "image/png",
            "sizes": "512x512"
          }
        ],
        "start_url": ".",
        "display": "standalone",
        "theme_color": "#2196f3",
        "background_color": isDarkMode ? "#121212" : "#ffffff"
      };

      const blob = new Blob([JSON.stringify(manifestData)], { type: 'application/json' });
      manifest.href = URL.createObjectURL(blob);
    }
  }, [isDarkMode]);
}; 