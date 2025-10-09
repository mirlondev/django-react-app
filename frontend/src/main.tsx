import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import "../i18n";
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
    <ThemeProvider>
      <App />
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);
