import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AuthPage from './pages/login'
import { isAuthenticated, removeAuthToken } from './api/auth'

function Root() {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());

  const handleLoginSuccess = () => {
    setAuthenticated(true);
  };

  const handleLogout = () => {
    removeAuthToken();
    setAuthenticated(false);
  };

  if (authenticated) {
    return <App onLogout={handleLogout} />;
  }

  return <AuthPage onLoginSuccess={handleLoginSuccess} />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
