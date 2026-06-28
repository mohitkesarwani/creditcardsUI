import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { setupAutoTitleCase } from './autoTitleCase';
// NB: setupBonusPointsFormatting deliberately removed. It rewrote every "$N"
// text node where N > 5000 into "N bonus points" — global DOM mutation that
// mangled real dollar values in the calculator, comparison table, etc.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

setupAutoTitleCase();

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
