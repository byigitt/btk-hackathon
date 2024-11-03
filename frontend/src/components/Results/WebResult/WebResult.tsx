import { Box, Link, Paper, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { WebResultProps } from '../../../types/props';
import { useIntl } from 'react-intl';

export const WebResult: React.FC<WebResultProps> = ({ websites }) => {
  const intl = useIntl();

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        {intl.formatMessage({ id: 'results.web.title' })}
      </Typography>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {websites.map((site) => (
            <Box key={site.url}>
              <Link 
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  textDecoration: 'none',
                  color: 'primary.main',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  {site.title}
                </Typography>
              </Link>
              <Typography variant="body2" color="text.secondary">
                {site.description}
              </Typography>
            </Box>
          ))}
        </Box>
      </motion.div>
    </Paper>
  );
}; 