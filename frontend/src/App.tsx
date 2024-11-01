import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './MainFolder/Main';
import ChatPage from './ChatFolder/ChatPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="chat" element={<ChatPage />} />
      </Routes>
    </Router>
  );
}

export default App;
