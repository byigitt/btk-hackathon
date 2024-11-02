import { Box, Paper, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface ResultCardProps {
  response: string;
  isLoading: boolean;
  renderStreamingSkeleton: () => React.ReactNode;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  response,
  isLoading,
  renderStreamingSkeleton
}) => {
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
        Result
      </Typography>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Box sx={{ mb: 4 }}>
          <ReactMarkdown>{response}</ReactMarkdown>
          {isLoading && renderStreamingSkeleton()}
        </Box>
      </motion.div>
    </Paper>
  );
}; 