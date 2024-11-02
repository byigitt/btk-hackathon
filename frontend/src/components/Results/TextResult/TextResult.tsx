import { Box, Paper, Skeleton, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import type { TextResultProps } from '../../../types/props';

export const TextResult: React.FC<TextResultProps> = ({ content, isLoading }) => {
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
        borderRadius: 2,
        minHeight: 200 // Maintain minimum height
      }}
    >
      <Typography variant="h6" gutterBottom>
        Text Result
      </Typography>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Box>
          {isLoading ? renderSkeleton() : <ReactMarkdown>{content}</ReactMarkdown>}
        </Box>
      </motion.div>
    </Paper>
  );
}; 