
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ChatbotPage from './pages/ChatbotPage';
import PredictionPage from './pages/PredictionPage';
import PredictionDetailPage from './pages/PredictionDetailPage';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/prediction" element={<PredictionPage />} />
          <Route path="/prediction/:diseaseId" element={<PredictionDetailPage />} />
        </Routes>
      </HashRouter>
    </div>
  );
};

export default App;
