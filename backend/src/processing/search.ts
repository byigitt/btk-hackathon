import axios from 'axios';
import { WebSocket } from 'ws';
import { env } from '../config';
import { okResponse, errorResponse } from '../utils/response';
import { addToSearchHistory } from '../services/searchHistory';
import { GoogleSearch } from '../services/GoogleSearch';
import { SearchResponse, CombinedSearchResult, GoogleSearchResult } from '../types/search';
import { ProxyManager } from '../services/ProxyManager';
import { GeminiService } from '../services/GeminiService';

interface UserProfile {
    browser: string;
    os: string;
    location: string;
    preferences?: {
        [key: string]: string;
    };
}

const getDefaultProfile = (): UserProfile => ({
    browser: 'Chrome',
    os: 'Unknown',
    location: 'Turkey',
    preferences: {}
});

const getSystemPrompt = (profile: UserProfile) => `You are AIsearch, an advanced AI search assistant powered by Gemini.

# Response Length Guidelines
- Maximum response length: ~1000 words
- Aim for comprehensive but concise responses
- For longer topics, focus on the most important aspects
- Break down complex topics into clear sections

# Core Principles
- Provide accurate, detailed, and complete responses
- Write in a clear, professional tone
- Match the language of the query
- Avoid any text escaping or formatting issues
- Always provide properly formatted code blocks when showing code
- Ensure all special characters are properly escaped

# Response Format
- Use proper markdown formatting
- Ensure code blocks are properly fenced with language identifiers
- Use proper escaping for special characters
- Format lists and tables clearly
- Use proper paragraph spacing

# Response Structure
1. Direct Answer (1-2 sentences)
2. Detailed Explanation (2-3 paragraphs)
3. Examples or Applications (when relevant)
4. Additional Context (if needed)

# Special Handling

## For Code Questions
\`\`\`language
// Always wrap code in proper markdown blocks
// Include language identifier
// Ensure proper indentation
\`\`\`

## For Technical Concepts
- Break down complex ideas
- Provide clear examples
- Include practical applications
- Use analogies when helpful

## For General Knowledge
- Start with core facts
- Provide context
- Include relevant details
- End with practical implications

# Content Guidelines
- Be comprehensive but concise
- Use active voice
- Maintain objectivity
- Provide evidence-based information
- Include relevant examples

# Formatting Rules
- Use proper markdown syntax
- Ensure special characters are escaped
- Maintain consistent spacing
- Use appropriate heading levels
- Format lists properly

User Context:
- Browser: ${profile.browser}
- OS: ${profile.os}
- Location: ${profile.location}
- Time: ${new Date().toLocaleString()}
${profile.preferences ? Object.entries(profile.preferences).map(([k, v]) => `- ${k}: ${v}`).join('\n') : ''}

Remember: Always provide complete, well-formatted responses without any truncation or escaping issues.`;

interface SearchWebSocket extends WebSocket {
    id: string;
}

// Initialize services
const googleSearch = new GoogleSearch();
const proxyManager = ProxyManager.getInstance();
const geminiService = GeminiService.getInstance();

// Only initialize proxyManager once, GoogleSearch will use the same instance
proxyManager.initialize().then(() => {
    // Only initialize GoogleSearch after proxy is ready
    return googleSearch.initialize();
}).catch(console.error);

let latestAiResponse = ''; // Add this to track the latest AI response

// Mock AI response generator
const getMockAIResponse = async (
    query: string,
    onPartialResponse: (response: string) => void
): Promise<string> => {
    const mockResponse = `Here's what I found about "${query}":

## Overview
This is a simulated AI response for testing purposes. The actual Gemini service is disabled to save costs during development.

## Key Points
1. This is a mock response
2. It simulates streaming behavior
3. It helps test the UI without API costs

## Example Details
- Point A: Some details about ${query}
- Point B: More information
- Point C: Additional context

## Summary
This is a test response that helps developers test the application without incurring API costs.`;

    // Simulate streaming by sending the response in chunks
    const chunks = mockResponse.split('\n');
    let fullResponse = '';
    
    for (const chunk of chunks) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate delay
        fullResponse = `${fullResponse}${chunk}\n`; // Fixed string concatenation
        onPartialResponse(fullResponse);
    }

    return mockResponse;
};

export const handleSearch = async (
    ws: SearchWebSocket, 
    query: string, 
    userProfile: UserProfile = getDefaultProfile()
) => {
    if (typeof query !== 'string') {
        ws.send(JSON.stringify(
            errorResponse('Invalid query format')
        ));
        return;
    }

    try {
        const [googleResults, geminiResponse] = await Promise.all([
            Promise.race([
                googleSearch.search(query).catch(error => {
                    console.error('Google search error:', error.message);
                    return [];
                }),
                new Promise<GoogleSearchResult[]>((_, reject) => 
                    setTimeout(() => {
                        console.log('Google search timeout');
                        return [];
                    }, 30000)
                )
            ]).then(results => {
                ws.send(JSON.stringify(
                    okResponse('Google results received', {
                        event: 'searchPartialResult',
                        data: {
                            type: 'partial',
                            aiResponse: latestAiResponse,
                            googleResults: results
                        } as SearchResponse
                    })
                ));
                return results;
            }),
            // Replace Gemini service with mock response
            getMockAIResponse(query, (partialResponse: string) => {
                latestAiResponse = partialResponse;
                ws.send(JSON.stringify(
                    okResponse('Partial AI response received', {
                        event: 'searchPartialResult',
                        data: {
                            type: 'partial',
                            aiResponse: partialResponse,
                            googleResults: []
                        } as SearchResponse
                    })
                ));
            })
        ]);

        const combinedResult: CombinedSearchResult = {
            aiResponse: geminiResponse,
            googleResults
        };

        // Save to search history
        await addToSearchHistory(
            ws.id,
            query,
            JSON.stringify(combinedResult),
            userProfile
        );

        // Send final complete response
        ws.send(JSON.stringify(
            okResponse('Search completed', {
                event: 'searchComplete',
                data: {
                    type: 'complete',
                    aiResponse: geminiResponse,
                    googleResults
                } as SearchResponse
            })
        ));

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Search error:', errorMessage);
        ws.send(JSON.stringify(
            errorResponse(`Search failed: ${errorMessage}`)
        ));
    } finally {
        latestAiResponse = '';
    }
};
