import { Paper, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { SourcesCardProps } from '../../../types/props';
import { useIntl } from 'react-intl';

export const SourcesCard: React.FC<SourcesCardProps> = ({
  googleResults,
  isLoading,
  renderGoogleResults,
  renderSourcesSkeleton
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
        {intl.formatMessage({ id: 'chat.sources.title' })}
      </Typography>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {isLoading ? renderSourcesSkeleton() : (
          googleResults && googleResults.length > 0 && renderGoogleResults(googleResults)
        )}
      </motion.div>
    </Paper>
  );
}; 