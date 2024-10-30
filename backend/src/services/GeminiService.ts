import axios, { AxiosInstance } from 'axios';
import { env } from '../config';
import { UserProfile } from '../types/search';

export class GeminiService {
    private static instance: GeminiService;
    private apiKey: string;
    private axiosInstance: AxiosInstance;

    private constructor() {
        this.apiKey = env.geminiAPIKey;
        // Create a separate axios instance that doesn't use proxy
        this.axiosInstance = axios.create({
            baseURL: 'https://generativelanguage.googleapis.com/v1beta',
            headers: {
                'Content-Type': 'application/json'
            },
            proxy: false // Explicitly disable proxy
        });
    }

    static getInstance(): GeminiService {
        if (!GeminiService.instance) {
            GeminiService.instance = new GeminiService();
        }
        return GeminiService.instance;
    }

    private getSystemPrompt(profile: UserProfile): string {
        return  `You are AIsearch, an advanced AI search assistant powered by Gemini.

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
    }

    async generateStreamingResponse(
        query: string, 
        profile: UserProfile,
        onPartialResponse: (text: string) => void
    ): Promise<string> {
        try {
            const enhancedPrompt = `${this.getSystemPrompt(profile)}

User Query: "${query}"

Provide a comprehensive response that incorporates AI knowledge. Ensure all special characters are properly escaped and all code blocks are properly formatted.`;

            const requestData = {
                contents: [{
                    parts: [{
                        text: enhancedPrompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 8192,
                    stopSequences: ["```"],
                }
            };

            const response = await this.axiosInstance.post(
                `/models/gemini-1.5-flash-latest:streamGenerateContent?key=${this.apiKey}`,
                requestData,
                {
                    responseType: 'stream'
                }
            );

            return new Promise((resolve, reject) => {
                let accumulatedText = '';

                response.data.on('data', (chunk: Buffer) => {
                    try {
                        const lines = chunk.toString().split('\n').filter(line => line.trim());
                
                        for (const line of lines) {
                            if (line.includes('"text"')) {
                                const textMatch = line.match(/"text":\s*"([^"]+)"/);
                                if (textMatch) {
                                    const text = textMatch[1]
                                        .replace(/\\n/g, '\n')
                                        .replace(/\\"/g, '"')
                                        .replace(/\\\\/g, '\\');
                                    
                                    accumulatedText += text;
                                    onPartialResponse(accumulatedText);
                                }
                            }
                        }
                    } catch (error) {
                        console.error('Error parsing chunk:', error);
                    }
                });
                
                response.data.on('end', () => resolve(accumulatedText));
                response.data.on('error', reject);
            });

        } catch (error) {
            console.error('Gemini API error:', error);
            throw error;
        }
    }
} 