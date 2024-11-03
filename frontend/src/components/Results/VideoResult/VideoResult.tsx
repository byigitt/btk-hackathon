import { Box, Paper, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { VideoResultProps } from '../../../types/props';
import { VideoCard } from './VideoCard';
import { useIntl } from 'react-intl';
import type { GoogleResult } from '../../../types/websocket';

export const VideoResult: React.FC<VideoResultProps> = ({ videos, isLoading }) => {
  const intl = useIntl();

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        {intl.formatMessage({ id: 'results.video.title' })}
      </Typography>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          flexWrap: 'wrap',
          minHeight: 160
        }}>
          {isLoading ? (
            ['sk1', 'sk2', 'sk3', 'sk4'].map((skeletonId) => (
              <VideoCard 
                key={skeletonId}
                video={{} as GoogleResult} 
                isLoading={true} 
              />
            ))
          ) : (
            videos.map((video) => (
              <VideoCard key={video.url} video={video} isLoading={false} />
            ))
          )}
        </Box>
      </motion.div>
    </Paper>
  );
}; 