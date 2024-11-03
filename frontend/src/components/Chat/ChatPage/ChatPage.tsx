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
    Paper,
    Button,
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { wsService } from '../../../services/websocket';
import type { SearchHistory } from '../../../types/search';
import type { GoogleResult, WebSocketResponse } from '../../../types/websocket';
import CustomButton from '../../Common/CustomButton';
import { SearchBar } from '../../SearchBar/SearchBar';
import { HistorySidebar } from '../HistorySidebar/HistorySidebar';
import { ResultCard } from '../ResultCard/ResultCard';
import ReplyIcon from '@mui/icons-material/Reply';
import { useIntl } from 'react-intl';
import { useLocale } from '../../../hooks/useLocale';

// Add suggested follow-up questions
const FOLLOW_UP_SUGGESTIONS = [
  {
    type: 'clarify',
    questionKeys: [
      'followup.clarify.1',
      'followup.clarify.2',
      'followup.clarify.3'
    ]
  },
  {
    type: 'expand',
    questionKeys: [
      'followup.expand.1',
      'followup.expand.2',
      'followup.expand.3'
    ]
  },
  {
    type: 'compare',
    questionKeys: [
      'followup.compare.1',
      'followup.compare.2',
      'followup.compare.3'
    ]
  }
];

const ChatPage: React.FC = () => {
  const [searchHistory, setSearchHistory] = useLocalStorage<SearchHistory[]>('searchHistory', []);
  const [currentSearch, setCurrentSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [selectedTimestamp, setSelectedTimestamp] = useState<number | undefined>();
  const [showSourcesSkeleton, setShowSourcesSkeleton] = useState(false);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [originalQuery, setOriginalQuery] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const intl = useIntl();
  const { currentLocale } = useLocale();

  // Get the current search from history based on selected timestamp
  const currentSearchItem = useMemo(() => {
    return searchHistory.find(search => search.timestamp === selectedTimestamp) || searchHistory[0];
  }, [searchHistory, selectedTimestamp]);

  // Generate follow-up questions based on the current response
  const generateFollowUps = useCallback((query: string, response: string) => {
    const selectedQuestions = FOLLOW_UP_SUGGESTIONS.map(type => 
      intl.formatMessage({ id: type.questionKeys[Math.floor(Math.random() * type.questionKeys.length)] })
    );
    setFollowUps(selectedQuestions);
    if (!query.includes('Regarding')) {
      setOriginalQuery(query);
    }
  }, [intl]);

  // Handle follow-up question click
  const handleFollowUp = (question: string) => {
    const contextualQuery = `Regarding "${originalQuery}": ${question}`;
    handleSearchWithQuery(contextualQuery, false);
  };
  const handleSearchWithQuery = async (query: string, gsearch = true) => {
    if (!query.trim() || isLoading) {
      return;
    }

    try {
      const timestamp = Date.now();
      setSearchHistory(prev => {
        const newSearch = {
          query,
          response: '',
          timestamp,
          googleResults: !gsearch && currentSearchItem?.googleResults 
            ? currentSearchItem.googleResults 
            : []
        };
        
        const filteredHistory = prev.filter(search => 
          search.query.toLowerCase() !== query.toLowerCase()
        );

        return [newSearch, ...filteredHistory];
      });

      setSelectedTimestamp(timestamp);
      setIsLoading(true);
      setShowSourcesSkeleton(gsearch);

      console.log('📤 Sending search request:', {
        event: 'search',
        data: {
          query: query.trim(),
          gsearch: gsearch
        }
      });

      wsService.send({
        event: 'search',
        data: {
          query: query.trim(),
          gsearch: gsearch
        }
      });
      
      generateFollowUps(query, '');
      setCurrentSearch('');
    } catch (error) {
      console.error('❌ Search error:', error);
      setIsLoading(false);
      setShowSourcesSkeleton(false);
    }
  };

  // Modify original handleSearch to use the new helper with gsearch: true
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchWithQuery(currentSearch, true);
  };

  const renderSourcesSkeleton = () => (
    <>
      {/* Web Sources Loading */}
      <Box sx={{ mb: 3 }}>
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton 
                key={i}
                variant="rounded" 
                width={120} 
                height={32} 
                sx={{ 
                  borderRadius: '100px',
                  bgcolor: 'action.hover',
                  animation: 'pulse 1.5s infinite ease-in-out',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 0.5 },
                    '50%': { opacity: 0.8 }
                  }
                }}
              />
            ))}
          </Box>
        </motion.div>
      </Box>

      {/* Videos Loading */}
      <Box 
          sx={{ 
            display: 'flex', 
            gap: 2, 
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
            },
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
            >
              <Box>
                <Skeleton 
                  variant="rectangular" 
                  width={160} 
                  height={90} 
                  sx={{ 
                    borderRadius: 1,
                    bgcolor: 'action.hover',
                    animation: 'pulse 1.5s infinite ease-in-out',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 0.5 },
                      '50%': { opacity: 0.8 }
                    }
                  }}
                />
                <Skeleton 
                  variant="text" 
                  width={140} 
                  sx={{ 
                    mt: 1,
                    bgcolor: 'action.hover',
                    animation: 'pulse 1.5s infinite ease-in-out',
                    animationDelay: '0.2s'
                  }} 
                />
                <Skeleton 
                  variant="text" 
                  width={80} 
                  sx={{ 
                    bgcolor: 'action.hover',
                    animation: 'pulse 1.5s infinite ease-in-out',
                    animationDelay: '0.4s'
                  }} 
                />
              </Box>
            </motion.div>
          ))}
      </Box>
    </>
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    console.log('🔌 Connecting to WebSocket...');
    
    const handleOpen = () => {
      console.log('🟢 WebSocket Connected');
      setIsConnected(true);
    };

    const handleClose = () => {
      console.log('🔴 WebSocket Disconnected');
      setIsConnected(false);
    };

    const handleWebSocketMessage = (response: WebSocketResponse) => {
      console.log('📩 Raw WebSocket Response:', response);
      
      if (response?.success && response?.message === 'Connected to WebSocket server') {
        setIsConnected(true);
      }
      
      if (response?.success && response?.data?.event === 'searchPartialResult') {
        const searchData = response.data.data;
        if (!searchData) return;

        setSearchHistory(prev => {
          const updated = [...prev];
          const lastSearch = updated[0];
          
          if (lastSearch) {
            if (searchData.aiResponse) {
              lastSearch.response = searchData.aiResponse;
              setIsLoading(false);
            }
            
            if (Array.isArray(searchData.googleResults)) {
              if (searchData.googleResults.length > 0) {
                lastSearch.googleResults = searchData.googleResults;
              } else if (showSourcesSkeleton) {
                setShowSourcesSkeleton(false);
              }
            }
          }
          
          return updated;
        });
      }
      else if (response?.success && response?.data?.event === 'searchComplete') {
        console.log('🏁 Search Complete');
        setIsLoading(false);
        setShowSourcesSkeleton(false);
      }
    };

    wsService.connect(handleWebSocketMessage, handleOpen, handleClose);
    setIsConnected(wsService.isConnected());

    return () => {
      console.log('🔌 Disconnecting WebSocket...');
      wsService.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBackToHome = () => {
    navigate(`/${currentLocale}`);
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
              label={intl.formatMessage({ id: 'nav.backToHome' })} 
              onClick={handleBackToHome}
              variant="text"
              color="primary"
            />
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: isConnected ? 'success.main' : 'error.main',
                  transition: 'background-color 0.3s ease'
                }}
              />
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: '0.75rem' }}
              >
                {intl.formatMessage({ 
                  id: isConnected ? 'nav.connected' : 'nav.disconnected' 
                })}
              </Typography>
            </Box>
          </Box>

          {/* Search Bar - Now using the state for disabled status */}
          <Box sx={{ position: 'relative' }}>
            <SearchBar
              value={currentSearch}
              onChange={setCurrentSearch}
              onSubmit={handleSearch}
              isLoading={isLoading}
              disabled={!isConnected}
            />
            {!isConnected && (
              <Paper
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  p: 2,
                  bgcolor: 'warning.light',
                  borderRadius: 1,
                  zIndex: 1,
                  textAlign: 'center',
                  width: '90%',
                  maxWidth: 400
                }}
              >
                <Typography variant="body2" color="warning.dark">
                  {intl.formatMessage({ id: 'chat.websocket.disconnected' })}
                </Typography>
              </Paper>
            )}
          </Box>

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
                  {currentSearchItem && (
                    (showSourcesSkeleton || (currentSearchItem.googleResults && currentSearchItem.googleResults.length > 0)) && (
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
                          {showSourcesSkeleton ? (
                            renderSourcesSkeleton()
                          ) : (
                            currentSearchItem.googleResults && renderGoogleResults(currentSearchItem.googleResults)
                          )}
                        </motion.div>
                      </Paper>
                    )
                  )}

                  {/* Result Card */}
                  <ResultCard
                    response={currentSearchItem?.response}
                    isLoading={isLoading}
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

          {/* Follow-up Questions */}
          {!isLoading && followUps.length > 0 && currentSearchItem?.response && (
            <Box sx={{ mt: 4 }}>
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
                {intl.formatMessage({ id: 'chat.followUp.title' })}
              </Typography>
              <Stack spacing={2}>
                {followUps.map((question, index) => (
                  <motion.div
                    key={question}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleFollowUp(question)}
                      startIcon={<ReplyIcon />}
                      fullWidth
                      sx={{
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        py: 1,
                        borderRadius: 2,
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                    >
                      {question}
                    </Button>
                  </motion.div>
                ))}
              </Stack>
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default ChatPage;