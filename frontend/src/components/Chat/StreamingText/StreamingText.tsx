import { Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { StreamingTextProps } from '../../../types/props/streamingTextProps';

export const StreamingText: React.FC<StreamingTextProps> = ({ 
  text, 
  isLoading
}) => {
  const [paragraphs, setParagraphs] = useState<string[]>([]);

  useEffect(() => {
    if (!text) {
      setParagraphs([]);
      return;
    }

    // Split text into paragraphs and filter out empty ones
    const newParagraphs = text.split('\n\n').filter(p => p.trim());
    setParagraphs(newParagraphs);
  }, [text]);

  return (
    <Box sx={{ position: 'relative' }}>
      <Box 
        sx={{ 
          '& > div': { 
            lineHeight: '1.75',
            '& > *': {
              margin: 0,
              lineHeight: 'inherit'
            }
          },
          '& h1, & h2, & h3, & h4, & h5, & h6': {
            display: 'block',
            marginTop: '1em',
            marginBottom: '0.5em',
            fontWeight: 'bold'
          },
          '& h1': { fontSize: '1.5em' },
          '& h2': { fontSize: '1.3em' },
          '& h3': { fontSize: '1.1em' },
          '& ul, & ol': {
            display: 'block',
            marginTop: '0.5em',
            marginBottom: '0.5em',
            paddingLeft: '1.5em',
            listStylePosition: 'outside'
          },
          '& li': {
            display: 'list-item',
            marginBottom: '0.25em',
            paddingLeft: '0.5em'
          },
          '& p': {
            display: 'block',
            marginTop: '0.5em',
            marginBottom: '0.5em'
          },
          '& code': {
            fontFamily: 'monospace',
            backgroundColor: 'action.hover',
            padding: '0.2em 0.4em',
            borderRadius: '3px',
            fontSize: '0.9em'
          },
          '& pre': {
            display: 'block',
            padding: '1em',
            overflow: 'auto',
            backgroundColor: 'action.hover',
            borderRadius: '4px',
            marginTop: '0.5em',
            marginBottom: '0.5em'
          }
        }}
      >
        <AnimatePresence>
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {paragraphs.map((paragraph, i) => (
              <motion.div
                key={`p-${paragraph.slice(0, 20)}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5,
                  delay: i * 0.2
                }}
              >
                <ReactMarkdown>{paragraph}</ReactMarkdown>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
};