import { Paper, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { GoogleResult } from '../../../types/websocket';

interface SourcesCardProps {
  googleResults?: GoogleResult[];
  isLoading: boolean;
  renderGoogleResults: (results: GoogleResult[]) => React.ReactNode;
  renderSourcesSkeleton: () => React.ReactNode;
}

export const SourcesCard: React.FC<SourcesCardProps> = ({
  googleResults,
  isLoading,
  renderGoogleResults,
  renderSourcesSkeleton
}) => {
  if (!googleResults?.length && !isLoading) return null;

  return (
    <Paper 
      elevation={1}
      sx={{ 
        p: 3, 
        mb: 3,
        borderRadius: 3
      }}
    >
      <Typography 
        variant="subtitle1"
        color="text.secondary"
        sx={{ 
          mb: 2,
          fontWeight: 500,
          fontSize: '0.9rem',
          textTransform: 'uppercase',
          letterSpacing: 0.5
        }}
      >
        Sources & Related Content
      </Typography>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {googleResults ? 
          renderGoogleResults(googleResults) : 
          renderSourcesSkeleton()
        }
      </motion.div>
    </Paper>
  );
}; 