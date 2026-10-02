import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './api/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.tsx';
import './index.css';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId = {import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <App />
        </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
