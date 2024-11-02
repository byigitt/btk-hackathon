import { Box, Paper, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { VideoResultProps } from '../../../types/components';
import { VideoCard } from './VideoCard';

export const VideoResult: React.FC<VideoResultProps> = ({ videos, isLoading }) => {
  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Video Results
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
          minHeight: 160 // Maintain minimum height during loading
        }}>
          {isLoading ? (
            // Show 4 skeleton cards while loading
            Array.from({ length: 4 }).map((_, index) => (
              <VideoCard key={`skeleton-${index}`} video={{} as any} isLoading={true} />
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