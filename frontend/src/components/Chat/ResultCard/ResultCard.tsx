import { Box, Paper, Skeleton, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { ResultCardProps } from '../../../types/props/resultCardProps';
import { StreamingText } from '../StreamingText/StreamingText';

export const ResultCard: React.FC<ResultCardProps> = ({
  response,
  isLoading
}) => {
  const renderSkeleton = () => (
    <Box sx={{ minHeight: 200 }}>
      <Skeleton variant="text" width="100%" height={24} />
      <Skeleton variant="text" width="95%" height={24} />
      <Skeleton variant="text" width="90%" height={24} />
      <Box sx={{ mt: 2 }}>
        <Skeleton variant="text" width="97%" height={24} />
        <Skeleton variant="text" width="85%" height={24} />
      </Box>
      <Box sx={{ mt: 2 }}>
        <Skeleton variant="text" width="92%" height={24} />
        <Skeleton variant="text" width="88%" height={24} />
      </Box>
    </Box>
  );

  return (
    <Paper 
      elevation={1}
      sx={{ 
        p: 3, 
        mb: 3,
        borderRadius: 3,
        minHeight: 200 // Maintain minimum height to prevent jumping
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
        Result
      </Typography>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Box sx={{ mb: 4 }}>
          {isLoading && !response ? (
            renderSkeleton()
          ) : (
            <StreamingText 
              text={response || ''}
              isLoading={isLoading}
            />
          )}
        </Box>
      </motion.div>
    </Paper>
  );
}; 