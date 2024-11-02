import type React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './components/Main';
import { ChatPage } from './components/Chat';
import { ThemeProvider } from './contexts/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle/ThemeToggle';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import { useThemeIcons } from './hooks/useThemeIcons';

const AppContent: React.FC = () => {
  useThemeIcons();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <ThemeToggle />
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="chat/:timestamp" element={<ChatPage />} />
        </Routes>
      </Router>
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <CssBaseline />
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
