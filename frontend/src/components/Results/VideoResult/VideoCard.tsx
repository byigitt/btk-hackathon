import { Card, CardContent, CardMedia, Link, Skeleton, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { VideoCardProps } from '../../../types/props/videoCardProps';

export const VideoCard: React.FC<VideoCardProps> = ({ video, isLoading }) => {
  if (isLoading) {
    return (
      <Card 
        sx={{ 
          width: { xs: 140, sm: 160 },
          boxShadow: 1
        }}
      >
        <Skeleton 
          variant="rectangular" 
          width="100%" 
          height={80}
          animation="wave"
        />
        <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
          <Skeleton 
            variant="text" 
            width="100%" 
            height={16} 
            animation="wave"
          />
          <Skeleton 
            variant="text" 
            width="60%" 
            height={12}
            sx={{ mt: 0.5 }}
            animation="wave"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Link 
        href={video.url}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ textDecoration: 'none' }}
      >
        <Card 
          sx={{ 
            width: { xs: 140, sm: 160 },
            boxShadow: 1,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: 3,
              transform: 'translateY(-4px)',
            }
          }}
        >
          <CardMedia
            component="img"
            height="80"
            image={video.thumbnail}
            alt={video.title}
            sx={{ 
              objectFit: 'cover',
              bgcolor: 'action.hover' 
            }}
          />
          <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
            <Typography 
              variant="caption"
              sx={{ 
                fontWeight: 500,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.2,
                height: '2.4em',
                fontSize: '0.7rem'
              }}
            >
              {video.title}
            </Typography>
            {video.videoInfo && (
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  fontSize: '0.65rem',
                  display: 'block',
                  mt: 0.5
                }}
              >
                {video.videoInfo.duration}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}; 