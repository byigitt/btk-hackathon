import { Box, Paper, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import type { TextResultProps } from '../../../types/components';

export const TextResult: React.FC<TextResultProps> = ({ content }) => {
  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Text Result
      </Typography>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Box>
          <ReactMarkdown>{content}</ReactMarkdown>
        </Box>
      </motion.div>
    </Paper>
  );
}; 