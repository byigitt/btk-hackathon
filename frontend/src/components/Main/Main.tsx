import { Box, Button, Container, Grid, Typography, useTheme } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SearchIcon from '@mui/icons-material/Search';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { motion } from 'framer-motion';
import type React from 'react';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: <SearchIcon sx={{ fontSize: 40 }} />,
    title: 'Smart Search',
    description: 'Advanced search capabilities powered by AI to find exactly what you need'
  },
  {
    icon: <ChatBubbleOutlineIcon sx={{ fontSize: 40 }} />,
    title: 'Interactive Chat',
    description: 'Natural conversation interface for complex queries and follow-up questions'
  },
  {
    icon: <AutoAwesomeIcon sx={{ fontSize: 40 }} />,
    title: 'AI-Powered Results',
    description: 'Get intelligent, contextual responses enhanced by machine learning'
  }
];

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleNavigate = () => {
    navigate('/chat');
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        color: 'text.primary'
      }}
    >
      {/* Hero Section */}
      <Box 
        sx={{ 
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)'
            : 'linear-gradient(45deg, #42a5f5 30%, #1976d2 90%)',
          py: { xs: 8, md: 12 },
          color: 'white'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography 
                  variant="h2" 
                  component="h1" 
                  sx={{ 
                    fontWeight: 700,
                    mb: 2,
                    fontSize: { xs: '2.5rem', md: '3.5rem' }
                  }}
                >
                  Advanced Search
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    mb: 4,
                    opacity: 0.9,
                    fontSize: { xs: '1.2rem', md: '1.5rem' }
                  }}
                >
                  Experience the next generation of search with AI-powered insights and natural conversations.
                </Typography>
                <motion.div
                  whileHover={{ translateY: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleNavigate}
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.9)'
                      }
                    }}
                  >
                    Try Now
                  </Button>
                </motion.div>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Box
                  component="img"
                  src={`${process.env.PUBLIC_URL}/icons/${theme.palette.mode}/search-icon-512.png`}
                  alt="Search Illustration"
                  sx={{
                    width: '100%',
                    maxWidth: 400,
                    height: 'auto',
                    display: 'block',
                    margin: 'auto',
                    filter: 'drop-shadow(0px 4px 20px rgba(0, 0, 0, 0.2))'
                  }}
                />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={feature.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Box
                  sx={{
                    p: 4,
                    height: '100%',
                    borderRadius: 4,
                    bgcolor: 'background.paper',
                    boxShadow: theme.palette.mode === 'dark' 
                      ? '0 4px 20px rgba(0,0,0,0.4)'
                      : '0 4px 20px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)'
                    }
                  }}
                >
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {feature.description}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Box 
        component="footer" 
        sx={{ 
          mt: 'auto',
          py: 3,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider'
        }}
      >
        <Container>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            align="center"
          >
            © {new Date().getFullYear()} Advanced Search. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default MainPage; 