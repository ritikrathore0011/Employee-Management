import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css';
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
import "react-toastify/dist/ReactToastify.css";

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <GoogleOAuthProvider clientId="778560140140-qruh67umtre36assgsg5r9b3p9k6of0b.apps.googleusercontent.com">
    <App />
    </GoogleOAuthProvider>
  // </StrictMode>,
)
