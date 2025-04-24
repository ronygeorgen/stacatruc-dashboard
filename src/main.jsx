import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import ThemeProvider from './utils/ThemeContext';
import App from './App';
import { FiscalPeriodProvider } from './contexts/FiscalPeriodContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <ThemeProvider>
        <FiscalPeriodProvider>
          <App />
        </FiscalPeriodProvider>
      </ThemeProvider>
    </Router>
  </React.StrictMode>
);