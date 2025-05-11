import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css';
import App from './App.jsx'
import { store } from './store/store';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Provider } from 'react-redux';
import { ThemeProvider } from './components/ui/themeProvider';
import { BrowserRouter } from 'react-router-dom';
import { SidebarProvider } from './components/ui/sidebar';
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;


createRoot(document.getElementById('root')).render(
  <StrictMode>
     <GoogleOAuthProvider clientId={clientId}>
    <Provider store={store}>
    <ThemeProvider>
    <BrowserRouter>
    <SidebarProvider>
    <App />
    </SidebarProvider>
    </BrowserRouter>
   </ThemeProvider>
  </Provider>
  </GoogleOAuthProvider>
  </StrictMode>
)
