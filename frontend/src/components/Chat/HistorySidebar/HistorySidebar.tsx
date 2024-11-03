import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import MenuIcon from '@mui/icons-material/Menu';
import {
    Box,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import type React from 'react';
import { useState } from 'react';
import type { HistorySidebarProps } from '../../../types/props';
import { useIntl } from 'react-intl';

const DRAWER_WIDTH = 240;

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  searchHistory,
  onSelectHistory,
  onDeleteHistory,
  currentTimestamp
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isOpen, setIsOpen] = useState(!isMobile);
  const intl = useIntl();

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <IconButton
        onClick={toggleDrawer}
        size="small"
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        sx={{
          position: 'fixed',
          left: isOpen ? DRAWER_WIDTH - 44 : 16,
          top: 16,
          zIndex: 1300,
          bgcolor: 'background.paper',
          boxShadow: 2,
          transition: 'all 0.3s ease-in-out',
          width: 36,
          height: 36,
          '&:hover': {
            bgcolor: 'action.hover',
            transform: 'scale(1.1)'
          }
        }}
      >
        <MenuIcon />
      </IconButton>
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.default',
            pt: 6,
            zIndex: 1200
          },
        }}
      >
        <Box sx={{ px: 1.5, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography 
            variant="subtitle2" 
            color="text.secondary"
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: 0.5
            }}
          >
            <HistoryIcon sx={{ fontSize: '0.9rem' }} />
            {intl.formatMessage({ id: 'chat.sidebar.title' })}
          </Typography>
        </Box>
        <List sx={{ pt: 0 }}>
          {searchHistory.map((search) => (
            <ListItem 
              key={search.timestamp}
              disablePadding
              secondaryAction={
                <IconButton 
                  edge="end" 
                  size="small"
                  onClick={() => onDeleteHistory(search.timestamp)}
                  sx={{ 
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    mr: 0.5,
                    '.MuiListItem-root:hover &': {
                      opacity: 0.5
                    },
                    '&:hover': {
                      opacity: '1 !important'
                    }
                  }}
                >
                  <DeleteIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
              }
              sx={{
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Tooltip title={search.query} placement="right">
                <ListItemButton 
                  selected={currentTimestamp === search.timestamp}
                  onClick={() => onSelectHistory(search)}
                  sx={{ 
                    py: 1.5,
                    px: 1.5,
                    '&.Mui-selected': {
                      bgcolor: 'action.selected',
                      borderLeft: '3px solid',
                      borderColor: 'primary.main',
                    }
                  }}
                >
                  <ListItemText
                    primary={search.query}
                    secondary={new Date(search.timestamp).toLocaleString()}
                    primaryTypographyProps={{
                      variant: 'body2',
                      sx: { 
                        fontWeight: 500,
                        mb: 0.5,
                        fontSize: '0.8rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }
                    }}
                    secondaryTypographyProps={{
                      variant: 'caption',
                      sx: { 
                        fontSize: '0.65rem',
                        color: 'text.secondary',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }
                    }}
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
}; 