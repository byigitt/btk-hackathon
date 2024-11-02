import { Box, Paper, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { ImageResultProps } from '../../../types/props';

export const ImageResult: React.FC<ImageResultProps> = ({ images }) => {
  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Image Results
      </Typography>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {images.map((image) => (
            <Box
              key={image.url}
              component="img"
              src={image.thumbnail}
              alt={image.title}
              sx={{
                width: 200,
                height: 150,
                objectFit: 'cover',
                borderRadius: 1,
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
              onClick={() => window.open(image.url, '_blank')}
            />
          ))}
        </Box>
      </motion.div>
    </Paper>
  );
}; 