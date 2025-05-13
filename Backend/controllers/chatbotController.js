const axios = require('axios');
require('dotenv').config();

// Cohere API configuration
const COHERE_API_URL = 'https://api.cohere.ai/v1/chat';
const COHERE_API_KEY = process.env.COHERE_API_KEY;

// Store conversation history
const conversationHistory = new Map();

// System prompt to guide the AI's responses
const SYSTEM_PROMPT = `You are Alex, a professional real estate assistant. Your role is to help clients with:
1. Property Search:
   - Residential properties (houses, apartments, condos)
   - Commercial properties (offices, retail spaces)
   - Luxury properties (villas, penthouses)
   - Investment properties

2. Property Details:
   - Size and layout
   - Amenities and features
   - Location and neighborhood
   - Price ranges and financing

3. Real Estate Services:
   - Property viewings
   - Market analysis
   - Investment advice
   - Legal guidance
   - Mortgage assistance

4. Location Information:
   - School districts
   - Transportation
   - Local amenities
   - Safety ratings
   - Future development plans

5. Investment Opportunities:
   - Rental properties
   - Commercial real estate
   - Development projects
   - Market trends
   - ROI analysis

Always provide:
- Professional and friendly responses
- Specific details when available
- Clear next steps
- Relevant follow-up questions
- Market insights when appropriate

Format responses with:
- Bullet points for lists
- Clear sections
- Emojis for engagement
- Specific numbers and data
- Professional tone`;

const generateChatResponse = async (req, res) => {
    try {
        const { message, userId } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        // Get or initialize conversation history for this user
        if (!conversationHistory.has(userId)) {
            conversationHistory.set(userId, []);
        }
        const userHistory = conversationHistory.get(userId);

        // Add user message to history
        userHistory.push({ role: 'user', content: message });

        try {
            // Call Cohere API
            const response = await axios.post(
                COHERE_API_URL,
                {
                    message: message,
                    chat_history: userHistory.map(msg => ({
                        role: msg.role === 'user' ? 'USER' : 'CHATBOT',
                        message: msg.content
                    })),
                    model: 'command',
                    temperature: 0.7,
                    max_tokens: 300,
                    prompt: SYSTEM_PROMPT
                },
                {
                    headers: {
                        'Authorization': `Bearer ${COHERE_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const botResponse = response.data.text;

            // Add assistant response to history
            userHistory.push({ role: 'assistant', content: botResponse });

            // Keep history manageable (last 10 messages)
            if (userHistory.length > 10) {
                userHistory.splice(0, userHistory.length - 10);
            }

            return res.status(200).json({
                success: true,
                response: botResponse
            });

        } catch (apiError) {
            console.error('Cohere API Error:', apiError.message);
            
            // Fallback responses for different types of queries
            const fallbackResponses = {
                propertySearch: "I can help you find properties based on your needs. Are you looking for residential, commercial, or luxury properties?",
                propertyDetails: "I can provide detailed information about properties. What specific details would you like to know?",
                services: "I can assist you with property viewings, market analysis, and investment advice. Which service interests you?",
                location: "I can help you explore different locations. What factors are important to you (schools, transportation, amenities)?",
                investment: "I can guide you through real estate investment opportunities. Are you interested in rental properties, commercial real estate, or development projects?",
                default: "I'm here to help with your real estate needs. Could you tell me more about what you're looking for?"
            };

            const userMessage = message.toLowerCase();
            let fallbackResponse = fallbackResponses.default;

            if (userMessage.includes('property') || userMessage.includes('house') || userMessage.includes('apartment')) {
                fallbackResponse = fallbackResponses.propertySearch;
            } else if (userMessage.includes('detail') || userMessage.includes('feature') || userMessage.includes('amenity')) {
                fallbackResponse = fallbackResponses.propertyDetails;
            } else if (userMessage.includes('service') || userMessage.includes('help') || userMessage.includes('assist')) {
                fallbackResponse = fallbackResponses.services;
            } else if (userMessage.includes('location') || userMessage.includes('area') || userMessage.includes('neighborhood')) {
                fallbackResponse = fallbackResponses.location;
            } else if (userMessage.includes('investment') || userMessage.includes('return') || userMessage.includes('profit')) {
                fallbackResponse = fallbackResponses.investment;
            }
            
            // Add fallback response to history
            userHistory.push({ role: 'assistant', content: fallbackResponse });

            return res.status(200).json({
                success: true,
                response: fallbackResponse
            });
        }

    } catch (error) {
        console.error('Error in generateChatResponse:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });

        return res.status(500).json({
            success: false,
            error: 'Failed to generate response',
            message: error.message || 'An unexpected error occurred'
        });
    }
};

module.exports = { generateChatResponse };