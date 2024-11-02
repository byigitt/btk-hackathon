import { Container, Grid, Paper } from '@mui/material';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../Common/CustomButton';
import './Main.css';

const MainPage: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate('chat');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((feature) => (
            <Grid item xs={6} key={feature}>
              <CustomButton 
                label={`feature ${feature}`} 
                onClick={handleNavigate}
                variant="contained"
                color={feature % 2 ? 'primary' : 'secondary'}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  );
};

export default MainPage; 