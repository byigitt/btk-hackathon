import {
    Avatar,
    Box,
    Card,
    CardContent,
    CardMedia,
    Container,
    Grid,
    Link,
    Skeleton,
    Stack,
    Typography,
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { wsService } from '../../../services/websocket';
import type { SearchHistory } from '../../../types/search';
import type { GoogleResult } from '../../../types/websocket';
import CustomButton from '../../Common/CustomButton';
import { SearchBar } from '../../SearchBar/SearchBar';
import { HistorySidebar } from '../HistorySidebar/HistorySidebar';
import { ResultCard } from '../ResultCard/ResultCard';
import { SourcesCard } from '../SourcesCard/SourcesCard';

const ChatPage: React.FC = () => {
  const [searchHistory, setSearchHistory] = useLocalStorage<SearchHistory[]>('searchHistory', []);
  const [currentSearch, setCurrentSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [selectedTimestamp, setSelectedTimestamp] = useState<number | undefined>();

  // Get the current search from history based on selected timestamp
  const currentSearchItem = useMemo(() => {
    return searchHistory.find(search => search.timestamp === selectedTimestamp) || searchHistory[0];
  }, [searchHistory, selectedTimestamp]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    wsService.connect((response) => {
      console.log('📩 Raw WebSocket Response:', response);

      if (response?.success && response?.data?.event === 'searchPartialResult') {
        const searchData = response.data.data;
        console.log('📝 Processed Response:', {
          type: searchData.type,
          aiResponse: searchData.aiResponse,
          googleResults: searchData.googleResults
        });

        setSearchHistory(prev => {
          const updated = [...prev];
          const lastSearch = updated[0];
          
          if (lastSearch) {
            lastSearch.response = searchData.aiResponse || lastSearch.response || '';
            
            if (Array.isArray(searchData.googleResults) && searchData.googleResults.length > 0) {
              lastSearch.googleResults = searchData.googleResults;
            }
          }
          
          return updated;
        });
      } else if (response?.success && response?.data?.event === 'searchComplete') {
        console.log('🏁 Search Complete');
        setIsLoading(false);
      }
    });

    return () => {
      wsService.disconnect();
    };
  }, [setSearchHistory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSearch.trim() || isLoading) return;

    const message = {
      event: 'search',
      data: currentSearch
    };

    setSearchHistory(prev => {
      const newSearch = {
        query: currentSearch,
        response: '',
        timestamp: Date.now()
      };
      
      const filteredHistory = prev.filter(search => 
        search.query.toLowerCase() !== currentSearch.toLowerCase()
      );

      return [newSearch, ...filteredHistory];
    });

    wsService.send(message);
    setCurrentSearch('');
    setIsLoading(true);
  };

  const renderStreamingSkeleton = () => (
    <Box sx={{ mt: 3 }}>
      <Stack spacing={1}>
        {[1, 2, 3].map((i) => (
          <Skeleton 
            key={i} 
            variant="text" 
            width={`${Math.random() * 40 + 60}%`} 
            sx={{ 
              opacity: 1 - (i * 0.2),
              height: 20
            }}
          />
        ))}
      </Stack>
    </Box>
  );

  const renderSourcesSkeleton = () => (
    <Box sx={{ mt: 4, mb: 3 }}>
      <Skeleton variant="text" width="15%" sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
        {[1, 2, 3].map((i) => (
          <Skeleton 
            key={i}
            variant="rounded" 
            width={120} 
            height={32} 
            sx={{ borderRadius: '100px' }}
          />
        ))}
      </Box>
      
      <Skeleton variant="text" width="15%" sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', gap: 2, overflow: 'hidden' }}>
        {[1, 2].map((i) => (
          <Box key={i}>
            <Skeleton variant="rectangular" width={200} height={100} />
            <Skeleton variant="text" width={180} sx={{ mt: 1 }} />
            <Skeleton variant="text" width={100} />
          </Box>
        ))}
      </Box>
    </Box>
  );

  const renderVideo = (result: GoogleResult) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Link 
        href={result.url}
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
            image={result.thumbnail}
            alt={result.title}
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
              {result.title}
            </Typography>
            {result.videoInfo && (
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  fontSize: '0.65rem',
                  display: 'block',
                  mt: 0.5
                }}
              >
                {result.videoInfo.duration}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );

  const renderGoogleResults = (results: GoogleResult[]) => {
    if (!results?.length) return null;

    return (
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={1}>
          {/* Web Sources Section */}
          {results.filter(r => r.type === 'organic').length > 0 && (
            <Grid item xs={12}>
              <Stack 
                direction="row" 
                spacing={1}
                sx={{ 
                  flexWrap: 'wrap',
                  gap: '4px !important',
                  mb: 1
                }}
              >
                {results
                  .filter(r => r.type === 'organic')
                  .map((result) => (
                    <motion.div
                      key={result.url}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link 
                        href={result.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        underline="none"
                      >
                        <Box
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            py: 0.25,
                            px: 1,
                            borderRadius: '4px',
                            bgcolor: 'action.hover',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              bgcolor: 'primary.main',
                              '& .MuiTypography-root': {
                                color: 'white'
                              }
                            }
                          }}
                        >
                          {result.favicon && (
                            <Avatar 
                              src={result.favicon} 
                              sx={{ 
                                width: 12, 
                                height: 12,
                              }}
                              variant="rounded"
                            />
                          )}
                          <Typography 
                            variant="caption"
                            color="text.primary"
                            sx={{ 
                              fontSize: '0.7rem',
                              maxWidth: '120px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {result.title}
                          </Typography>
                        </Box>
                      </Link>
                    </motion.div>
                  ))}
              </Stack>
            </Grid>
          )}

          {/* Videos Section */}
          {results.filter(r => r.type === 'video').length > 0 && (
            <Grid item xs={12}>
              <Stack 
                direction="row" 
                spacing={1} 
                sx={{ 
                  overflowX: 'auto', 
                  pb: 1,
                  '&::-webkit-scrollbar': {
                    height: 3,
                  },
                  '&::-webkit-scrollbar-track': {
                    bgcolor: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    bgcolor: 'rgba(0,0,0,0.1)',
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: 'rgba(0,0,0,0.2)'
                    }
                  },
                }}
              >
                {results
                  .filter(r => r.type === 'video')
                  .map((result) => (
                    <Box key={result.url}>
                      {renderVideo(result)}
                    </Box>
                  ))}
              </Stack>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };

  const handleSelectHistory = (search: SearchHistory) => {
    setSelectedTimestamp(search.timestamp);
  };

  const handleDeleteHistory = (timestamp: number) => {
    setSearchHistory(prev => prev.filter(search => search.timestamp !== timestamp));
    if (selectedTimestamp === timestamp) {
      setSelectedTimestamp(undefined);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <HistorySidebar 
        searchHistory={searchHistory}
        onSelectHistory={handleSelectHistory}
        onDeleteHistory={handleDeleteHistory}
        currentTimestamp={selectedTimestamp}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          px: { xs: 2, sm: 3 },
          py: 4
        }}
      >
        <Container 
          maxWidth="md" 
          sx={{ 
            mx: 'auto',
            px: { xs: 0, sm: 2 }
          }}
        >
          {/* Navigation Bar */}
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
              position: 'sticky',
              top: 0,
              zIndex: 1100,
              bgcolor: 'background.default',
              py: 2
            }}
          >
            <CustomButton 
              label="← Back to Home" 
              onClick={() => navigate('/')}
              variant="text"
              color="primary"
            />
          </Box>

          {/* Search Bar */}
          <SearchBar
            value={currentSearch}
            onChange={setCurrentSearch}
            onSubmit={handleSearch}
            isLoading={isLoading}
          />

          {/* Search Results - Now only showing current search */}
          <AnimatePresence mode="wait">
            {currentSearchItem && (
              <motion.div
                key={currentSearchItem.timestamp}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <Box sx={{ mb: 4 }}>
                  {/* Query Title */}
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 600,
                      color: 'text.primary',
                      fontSize: { xs: '1.25rem', sm: '1.5rem' },
                      mb: 3
                    }}
                  >
                    {currentSearchItem.query}
                  </Typography>

                  {/* Sources Card */}
                  {(currentSearchItem.googleResults || (isLoading && currentSearchItem.timestamp === selectedTimestamp)) && (
                    <SourcesCard
                      googleResults={currentSearchItem.googleResults}
                      isLoading={isLoading && currentSearchItem.timestamp === selectedTimestamp}
                      renderGoogleResults={renderGoogleResults}
                      renderSourcesSkeleton={renderSourcesSkeleton}
                    />
                  )}

                  {/* Result Card */}
                  <ResultCard
                    response={currentSearchItem.response}
                    isLoading={isLoading && currentSearchItem.timestamp === selectedTimestamp}
                    renderStreamingSkeleton={renderStreamingSkeleton}
                  />

                  {/* Timestamp */}
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: '0.75rem',
                      display: 'block',
                      textAlign: 'right',
                      mt: 1
                    }}
                  >
                    {new Date(currentSearchItem.timestamp).toLocaleString()}
                  </Typography>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </Box>
    </Box>
  );
};

export default ChatPage;