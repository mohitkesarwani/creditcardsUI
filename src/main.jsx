import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { setupAutoTitleCase } from './autoTitleCase';
import { setupBonusPointsFormatting } from './bonusPoints';

setupAutoTitleCase();
setupBonusPointsFormatting();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
