
import { createRoot } from 'react-dom/client'
import './index.css';
import App from './App.jsx'
import { store } from './store/store';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Provider } from 'react-redux';
import { ThemeProvider } from './components/ui/themeProvider';

import { SidebarProvider } from './components/ui/sidebar';
import { HashRouter } from 'react-router-dom';
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;


createRoot(document.getElementById('root')).render(
  
     <GoogleOAuthProvider clientId={clientId}>
    <Provider store={store}>
    <ThemeProvider>
    <HashRouter>
    <SidebarProvider>
    <App />
    </SidebarProvider>
    </HashRouter>
   </ThemeProvider>
  </Provider>
  </GoogleOAuthProvider>
  
)
