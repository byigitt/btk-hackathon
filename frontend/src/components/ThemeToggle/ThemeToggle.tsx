import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { IconButton } from '@mui/material';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <IconButton 
      onClick={toggleTheme} 
      color="inherit"
      sx={{ 
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 1200,
        bgcolor: 'background.paper',
        boxShadow: 2,
        '&:hover': {
          bgcolor: 'action.hover'
        }
      }}
    >
      {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
}; 