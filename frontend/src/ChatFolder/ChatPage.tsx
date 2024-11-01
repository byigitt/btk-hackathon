import React, { useState } from 'react';
import './ChatPage.css';
import CustomButton from '../MainFolder/ButtonFolder/CustomButton';
import { useNavigate } from 'react-router-dom';


const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input) {
      setMessages([...messages, input]);
      setInput('');
    }
  };

const navigator = useNavigate();
const handleNavigate = () => {
  navigator('/'); 
};
  return (
    <div className="chat-container">
      <div className="chat-box">
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className="message">
              {msg}
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} className="input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="input-field"
          />
          <button type="submit" className="send-button">Send</button>
        </form>
      </div>
      <CustomButton label='home' onClick={handleNavigate}></CustomButton>
    </div>
  );
};

export default ChatPage;
