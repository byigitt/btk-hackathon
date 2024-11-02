import type React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './components/Main';
import { ChatPage } from './components/Chat';
import { ThemeProvider } from './contexts/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle/ThemeToggle';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <CssBaseline />
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
    </ThemeProvider>
  );
};

export default App;
