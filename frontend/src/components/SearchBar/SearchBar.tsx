import SearchIcon from '@mui/icons-material/Search';
import { IconButton, Paper, TextField } from '@mui/material';
import { motion } from 'framer-motion';
import type { SearchBarProps } from '../../types/components';

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  isLoading
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper 
        component="form" 
        onSubmit={onSubmit}
        elevation={2}
        sx={{ 
          p: 2,
          display: 'flex',
          gap: 1,
          mb: 4,
          borderRadius: 3,
          position: 'sticky',
          top: 16,
          zIndex: 1000,
          backgroundColor: 'background.paper'
        }}
      >
        <TextField
          fullWidth
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search anything..."
          variant="outlined"
          size="medium"
          disabled={isLoading}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: 'action.hover'
            }
          }}
        />
        <IconButton 
          type="submit" 
          color="primary"
          disabled={isLoading}
          sx={{ 
            p: 2,
            bgcolor: 'primary.main',
            color: 'white',
            borderRadius: 2,
            '&:hover': {
              bgcolor: 'primary.dark'
            },
            '&.Mui-disabled': {
              bgcolor: 'action.disabledBackground'
            }
          }}
        >
          <SearchIcon />
        </IconButton>
      </Paper>
    </motion.div>
  );
}; 