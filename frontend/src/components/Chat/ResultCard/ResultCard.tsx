import { Box, Paper, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { ResultCardProps } from '../../../types/props';
import { StreamingText } from '../StreamingText/StreamingText';
import { useIntl } from 'react-intl';

export const ResultCard: React.FC<ResultCardProps> = ({
  response,
  isLoading
}) => {
  const intl = useIntl();

  return (
    <Paper 
      elevation={1}
      sx={{ 
        p: 3, 
        mb: 3,
        borderRadius: 3,
        minHeight: 200
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
        {intl.formatMessage({ id: 'chat.result.title' })}
      </Typography>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Box sx={{ mb: 4 }}>
          <StreamingText 
            text={response || ''}
            isLoading={isLoading}
          />
        </Box>
      </motion.div>
    </Paper>
  );
}; 