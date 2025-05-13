import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaRegSmile } from 'react-icons/fa';
import axios from 'axios';
import './Chatbot.css';

// Configure axios with the backend URL
const API_URL = 'http://localhost:3001';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: 'Hello! I\'m Alex, your Real Estate Assistant. 👋',
    },
    {
      type: 'bot',
      content: 'With 10 years of experience in the real estate market, I\'m here to help you with any property-related questions. How can I assist you today?',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const userId = localStorage.getItem('userId') || `user-${Date.now()}`;

  useEffect(() => {
    if (!localStorage.getItem('userId')) {
      localStorage.setItem('userId', userId);
    }
  }, [userId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = inputValue;
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setInputValue('');
    setIsTyping(true);

    try {
      console.log('Sending request to:', `${API_URL}/api/chatbot/chat`);
      
      // Call backend API with full URL
      const response = await axios.post(`${API_URL}/api/chatbot/chat`, {
        message: userMessage,
        userId: userId
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Received response:', response.data);

      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to get response');
      }

      // Add bot response
      setMessages(prev => [...prev, {
        type: 'bot',
        content: response.data.response || response.data
      }]);
    } catch (error) {
      console.error('Chat Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      setMessages(prev => [...prev, {
        type: 'bot',
        content: error.response?.data?.message || "I apologize, but I'm having trouble connecting right now. Please try again later."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chatbot-container">
      {/* Chat Icon Button */}
      <button className="chat-toggle-button" onClick={toggleChat}>
        {isOpen ? <FaTimes /> : <FaRobot />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="bot-info">
              <div className="bot-avatar">
                <FaRobot />
              </div>
              <div className="bot-status">
                <h3>Alex - Real Estate Agent</h3>
                <p>Your Personal Property Advisor</p>
              </div>
            </div>
            <button className="close-button" onClick={toggleChat}>
              <FaTimes />
            </button>
          </div>

          <div className="messages-container">
            {messages.map((message, index) => (
              <div
                key={index}
                className={'message ' + (message.type === 'bot' ? 'bot' : 'user')}
              >
                {message.type === 'bot' && (
                  <div className="bot-avatar-small">
                    <FaRobot />
                  </div>
                )}
                <div className="message-content">
                  {message.content.split('\n').map((text, i) => (
                    <p key={i} style={{ margin: '0.2em 0' }}>{text}</p>
                  ))}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="message bot">
                <div className="bot-avatar-small">
                  <FaRobot />
                </div>
                <div className="message-content typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="input-container">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything about real estate..."
              className="message-input"
            />
            <button type="button" className="emoji-button">
              <FaRegSmile />
            </button>
            <button type="submit" className="send-button">
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot; 