import fs from 'fs-extra';

export async function generateReactVite(config) {
  const { projectName, typescript = true, tailwind = true, authUI = false } = config;
  const ext = typescript ? 'tsx' : 'jsx';
  const configExt = typescript ? 'tsx' : 'jsx';
  
  // Create package.json
  const packageJson = {
    name: projectName,
    version: '0.1.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
      lint: 'eslint src --ext js,jsx --report-unused-disable-directives --max-warnings 0'
    },
    dependencies: {
      react: '^18.2.0',
      'react-dom': '^18.2.0',
      'react-router-dom': '^6.14.0',
      ...(authUI ? { 'zenuxs-oauth': '^1.0.0' } : {})
    },
    devDependencies: {
      vite: '^4.4.0',
      '@vitejs/plugin-react': '^4.0.0',
      'eslint': '^8.45.0',
      'eslint-plugin-react': '^7.32.2',
      'eslint-plugin-react-hooks': '^4.6.0',
      'eslint-plugin-react-refresh': '^0.4.3'
    }
  };
  
  if (typescript) {
    packageJson.devDependencies['@types/react'] = '^18.2.0';
    packageJson.devDependencies['@types/react-dom'] = '^18.2.0';
    packageJson.devDependencies.typescript = '^5.0.0';
  }
  
  if (tailwind) {
    packageJson.devDependencies.tailwindcss = '^3.3.0';
    packageJson.devDependencies.autoprefixer = '^10.4.0';
    packageJson.devDependencies.postcss = '^8.4.0';
  }
  
  await fs.writeJson('package.json', packageJson, { spaces: 2 });
  
  // Create vite config
  const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5299,
    open: true
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
`;
  await fs.writeFile('vite.config.js', viteConfig);
  
  // Create directory structure
  await fs.ensureDir('src/components');
  await fs.ensureDir('src/pages');
  await fs.ensureDir('src/styles');
  await fs.ensureDir('src/contexts');
  await fs.ensureDir('src/hooks');
  await fs.ensureDir('src/utils');
  await fs.ensureDir('public');
  
  // Create index.html
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.${configExt}"></script>
  </body>
</html>
`;
  await fs.writeFile('index.html', indexHtml);
  
  // Create main entry
  const mainContent = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.${ext}'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
`;
  await fs.writeFile(`src/main.${configExt}`, mainContent);
  
  // Create App component with AuthProvider if authUI is enabled
  let appContent;
  if (authUI) {
    appContent = `import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.${ext}'
import Home from './pages/Home.${ext}'
import ZenuxsPage from './pages/ZenuxsPage.${ext}'
import Login from './pages/Login.${ext}'
import Register from './pages/Register.${ext}'
import Dashboard from './pages/Dashboard.${ext}'
import Callback from './pages/Callback.${ext}'
import PrivateRoute from './components/PrivateRoute.${ext}'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/zenuxs" element={<ZenuxsPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/callback" element={<Callback />} />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
`;
  } else {
    appContent = `import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.${ext}'
import ZenuxsPage from './pages/ZenuxsPage.${ext}'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/zenuxs" element={<ZenuxsPage />} />
      </Routes>
    </Router>
  )
}

export default App
`;
  }
  
  await fs.writeFile(`src/App.${ext}`, appContent);
  
  // Create AuthContext if authUI is enabled
  if (authUI) {
    const authContextContent = `import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'${
      typescript ? `
interface UserInfo {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
  [key: string]: any;
}

interface SessionState {
  isAuthenticated: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  user?: UserInfo;
}

interface AuthContextType {
  oauth: any;
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  sessionState: SessionState | null;
  loading: boolean;
  error: string | null;
  login: (options?: any) => Promise<void>;
  logout: () => Promise<void>;
  getUserInfo: () => Promise<UserInfo>;
  refreshTokens: () => Promise<any>;
  exportSession: () => any;
}

interface AuthProviderProps {
  children: ReactNode;
}` : ''
    }

const AuthContext = createContext${typescript ? '<AuthContextType | undefined>' : ''}(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }${typescript ? ': AuthProviderProps' : ''}) => {
  const [oauth, setOauth] = useState${typescript ? '<any | null>' : ''}(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState${typescript ? '<UserInfo | null>' : ''}(null);
  const [sessionState, setSessionState] = useState${typescript ? '<SessionState | null>' : ''}(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState${typescript ? '<string | null>' : ''}(null);
  const [debugLogs, setDebugLogs] = useState${typescript ? '<Array<{timestamp: string, message: string, data?: string}>>' : '([])'}([]);

  const addDebugLog = useCallback((message${typescript ? ': string' : ''}, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
      timestamp,
      message,
      data: data ? JSON.stringify(data, null, 2) : null
    };
    setDebugLogs(prev => [logEntry, ...prev].slice(0, 50));
  }, []);

  // Initialize OAuth client
  useEffect(() => {
    const initOAuth = async () => {
      try {
        const config = {
          clientId: '${projectName.replace(/\s+/g, '_').toLowerCase()}_client', // Replace with your actual client ID
          authServer: 'https://api.auth.zenuxs.in',
          redirectUri: \`\${window.location.origin}/callback\`,
          scopes: 'openid profile email',
          storage: 'localStorage',
          usePKCE: true,
          autoRefresh: true,
          debug: ${process.env.NODE_ENV === 'development'},
          onBeforeLogin: () => {
            addDebugLog('Before login callback triggered');
            setLoading(true);
          },
          onAfterLogin: (tokens${typescript ? ': any' : ''}) => {
            addDebugLog('After login callback', tokens);
            setLoading(false);
          },
          onBeforeLogout: () => {
            addDebugLog('Before logout callback');
          },
          onAfterLogout: () => {
            addDebugLog('After logout callback');
            setLoading(false);
          }
        };

        // Dynamically import ZenuxOAuth to avoid SSR issues
        const ZenuxOAuth = (await import('zenuxs-oauth')).default;
        const oauthClient = new ZenuxOAuth(config);
        setOauth(oauthClient);

        // Set up event listeners
        oauthClient.on('login', (tokens${typescript ? ': any' : ''}) => {
          addDebugLog('Login event', tokens);
          setIsAuthenticated(true);
          setError(null);
          checkAuthStatus();
        });

        oauthClient.on('logout', () => {
          addDebugLog('Logout event');
          setIsAuthenticated(false);
          setUserInfo(null);
          setSessionState(null);
        });

        oauthClient.on('tokenRefresh', (tokens${typescript ? ': any' : ''}) => {
          addDebugLog('Token refresh event', tokens);
        });

        oauthClient.on('tokenExpired', () => {
          addDebugLog('Token expired event');
        });

        oauthClient.on('error', (error${typescript ? ': Error' : ''}) => {
          addDebugLog('Error event', error);
          setError(error.message);
          setLoading(false);
        });

        oauthClient.on('stateChange', (data${typescript ? ': any' : ''}) => {
          addDebugLog('State change event', data);
        });

        // Check initial auth status
        checkAuthStatus();

        addDebugLog('OAuth client initialized', {
          clientId: config.clientId,
          authServer: config.authServer
        });

      } catch (error${typescript ? ': any' : ''}) {
        console.error('Failed to initialize OAuth:', error);
        setError(\`Initialization failed: \${error.message}\`);
        addDebugLog('Initialization error', error);
      }
    };

    initOAuth();
  }, [addDebugLog]);

  const checkAuthStatus = useCallback(async () => {
    if (!oauth) return;

    try {
      const authenticated = oauth.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const state = oauth.getSessionState();
        setSessionState(state);
        addDebugLog('Auth status checked - authenticated', state);
      } else {
        addDebugLog('Auth status checked - not authenticated');
      }
    } catch (error${typescript ? ': any' : ''}) {
      addDebugLog('Error checking auth status', error);
    }
  }, [oauth, addDebugLog]);

  const login = async (options = {}) => {
    if (!oauth) {
      setError('OAuth client not initialized');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      addDebugLog('Starting login process', options);

      await oauth.login(options);
    } catch (error${typescript ? ': any' : ''}) {
      console.error('Login error:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!oauth) return;

    try {
      setLoading(true);
      addDebugLog('Starting logout process');
      
      await oauth.logout({ revokeTokens: true });
      setIsAuthenticated(false);
      setUserInfo(null);
      setSessionState(null);
      setError(null);
    } catch (error${typescript ? ': any' : ''}) {
      console.error('Logout error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getUserInfo = async ()${typescript ? ': Promise<UserInfo>' : ''} => {
    if (!oauth) throw new Error('OAuth client not initialized');

    try {
      setLoading(true);
      addDebugLog('Fetching user info');
      
      const userInfoData = await oauth.getUserInfo();
      setUserInfo(userInfoData);
      addDebugLog('User info fetched', userInfoData);
      return userInfoData;
    } catch (error${typescript ? ': any' : ''}) {
      console.error('User info error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshTokens = async () => {
    if (!oauth) throw new Error('OAuth client not initialized');

    try {
      setLoading(true);
      addDebugLog('Refreshing tokens');
      
      const newTokens = await oauth.refreshTokens();
      addDebugLog('Tokens refreshed', newTokens);
      checkAuthStatus();
      return newTokens;
    } catch (error${typescript ? ': any' : ''}) {
      console.error('Token refresh error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const exportSession = () => {
    if (!oauth) throw new Error('OAuth client not initialized');

    try {
      const session = oauth.exportSession();
      addDebugLog('Session exported', session);
      return session;
    } catch (error${typescript ? ': any' : ''}) {
      setError(\`Export failed: \${error.message}\`);
      throw error;
    }
  };

  const value = {
    oauth,
    isAuthenticated,
    userInfo,
    sessionState,
    loading,
    error,
    login,
    logout,
    getUserInfo,
    refreshTokens,
    exportSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
`;
    
    await fs.writeFile(`src/contexts/AuthContext.${ext}`, authContextContent);
    
    // Create PrivateRoute component
    const privateRouteContent = `import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.${ext}';

const PrivateRoute = ({ children }${typescript ? ': { children: React.ReactNode }' : ''}) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

export default PrivateRoute;
`;
    
    await fs.writeFile(`src/components/PrivateRoute.${ext}`, privateRouteContent);
    
    // Create Callback page
    const callbackPage = `import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.${ext}';

const Callback = () => {
  const navigate = useNavigate();
  const { oauth } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      if (!oauth) {
        navigate('/login');
        return;
      }

      try {
        await oauth.handleCallback();
        navigate('/dashboard');
      } catch (error) {
        console.error('Callback error:', error);
        navigate('/login');
      }
    };

    handleCallback();
  }, [oauth, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default Callback;
`;
    
    await fs.writeFile(`src/pages/Callback.${ext}`, callbackPage);
  }
  
  // Create Home page with Zenuxs OAuth integration if authUI is enabled
  let homePage;
  if (tailwind) {
    homePage = `import React from 'react'
import { Link } from 'react-router-dom'
${authUI ? `import { useAuth } from '../contexts/AuthContext.${ext}'` : ''}

const Home = () => {
  ${authUI ? `const { isAuthenticated, userInfo, login, logout } = useAuth();` : ''}
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Welcome to ${projectName}
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          A React application created with Zenuxs CLI
        </p>
        
        <div className="flex gap-4 mb-12">
          <Link
            to="/zenuxs"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Visit Zenuxs Page
          </Link>
          ${authUI ? `
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Dashboard
              </Link>
              <button
                onClick={() => logout()}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => login()}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Login with Zenuxs
              </button>
              <button
                onClick={() => login({ popup: true, popupWidth: 600, popupHeight: 700 })}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Login (Popup)
              </button>
            </>
          )}` : ''}
        </div>
        
        ${authUI ? `
        {isAuthenticated && userInfo && (
          <div className="mb-8 p-6 bg-white rounded-xl shadow">
            <h3 className="text-xl font-bold mb-3">Welcome, {userInfo.name || userInfo.email}!</h3>
            <p className="text-gray-600">You are authenticated with Zenuxs OAuth</p>
            {userInfo.picture && (
              <img 
                src={userInfo.picture} 
                alt="Profile" 
                className="mt-4 w-20 h-20 rounded-full"
              />
            )}
          </div>
        )}` : ''}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-3">Zenuxs Accounts</h3>
            <a href="https://zenuxs.in" className="text-blue-600 hover:underline">
              zenuxs.in →
            </a>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-3">Easy-Mongoo</h3>
            <a href="https://easy-mongoo.zenuxs.in" className="text-blue-600 hover:underline">
              easy-mongoo.zenuxs.in →
            </a>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-3">HMAX Security</h3>
            <a href="https://hmax.zenuxs.in" className="text-blue-600 hover:underline">
              hmax.zenuxs.in →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
`;
  } else {
    homePage = `import React from 'react'
import { Link } from 'react-router-dom'
import './Home.css'
${authUI ? `import { useAuth } from '../contexts/AuthContext.${ext}'` : ''}

const Home = () => {
  ${authUI ? `const { isAuthenticated, userInfo, login, logout } = useAuth();` : ''}
  
  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">
          Welcome to ${projectName}
        </h1>
        <p className="home-subtitle">
          A React application created with Zenuxs CLI
        </p>
        
        <div className="home-buttons">
          <Link
            to="/zenuxs"
            className="btn btn-primary"
          >
            Visit Zenuxs Page
          </Link>
          ${authUI ? `
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="btn btn-secondary"
              >
                Dashboard
              </Link>
              <button
                onClick={() => logout()}
                className="btn btn-danger"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => login()}
                className="btn btn-secondary"
              >
                Login with Zenuxs
              </button>
              <button
                onClick={() => login({ popup: true, popupWidth: 600, popupHeight: 700 })}
                className="btn btn-tertiary"
              >
                Login (Popup)
              </button>
            </>
          )}` : ''}
        </div>
        
        ${authUI ? `
        {isAuthenticated && userInfo && (
          <div className="user-welcome">
            <h3 className="user-welcome-title">Welcome, {userInfo.name || userInfo.email}!</h3>
            <p className="user-welcome-text">You are authenticated with Zenuxs OAuth</p>
            {userInfo.picture && (
              <img 
                src={userInfo.picture} 
                alt="Profile" 
                className="user-avatar"
              />
            )}
          </div>
        )}` : ''}
        
        <div className="home-cards">
          <div className="card">
            <h3 className="card-title">Zenuxs Accounts</h3>
            <a href="https://zenuxs.in" className="card-link">
              zenuxs.in →
            </a>
          </div>
          
          <div className="card">
            <h3 className="card-title">Easy-Mongoo</h3>
            <a href="https://easy-mongoo.zenuxs.in" className="card-link">
              easy-mongoo.zenuxs.in →
            </a>
          </div>
          
          <div className="card">
            <h3 className="card-title">HMAX Security</h3>
            <a href="https://hmax.zenuxs.in" className="card-link">
              hmax.zenuxs.in →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
`;
    
    // Create Home.css file for non-Tailwind version with OAuth styles
    const homeCss = `.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #e6f0ff 0%, #d6e4ff 100%);
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.home-content {
  max-width: 64rem;
  margin: 0 auto;
}

.home-title {
  font-size: 2.25rem;
  font-weight: bold;
  color: #1a202c;
  margin-bottom: 1.5rem;
}

.home-subtitle {
  font-size: 1.125rem;
  color: #4a5568;
  margin-bottom: 2rem;
}

.home-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.btn-secondary {
  background-color: #059669;
  color: white;
}

.btn-secondary:hover {
  background-color: #047857;
}

.btn-tertiary {
  background-color: #7c3aed;
  color: white;
}

.btn-tertiary:hover {
  background-color: #6d28d9;
}

.btn-danger {
  background-color: #dc2626;
  color: white;
}

.btn-danger:hover {
  background-color: #b91c1c;
}

.user-welcome {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.user-welcome-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #1a202c;
}

.user-welcome-text {
  color: #4a5568;
  margin-bottom: 1rem;
}

.user-avatar {
  width: 5rem;
  height: 5rem;
  border-radius: 9999px;
  object-fit: cover;
}

.home-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .home-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

.card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.75rem;
}

.card-link {
  color: #2563eb;
  text-decoration: none;
}

.card-link:hover {
  text-decoration: underline;
}
`;
    
    await fs.writeFile(`src/pages/Home.css`, homeCss);
  }
  
  await fs.writeFile(`src/pages/Home.${ext}`, homePage);
  
  // Create Zenuxs page (updated with OAuth info if enabled)
  let zenuxsPage;
  if (tailwind) {
    zenuxsPage = `import React from 'react'
${authUI ? `import { useAuth } from '../contexts/AuthContext.${ext}'` : ''}

const ZenuxsPage = () => {
  ${authUI ? `const { isAuthenticated, login } = useAuth();` : ''}
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          🚀 Project created using Zenuxs CLI
        </h1>
        
        ${authUI ? `
        <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
          <h2 className="text-2xl font-semibold mb-4 text-blue-800">🔐 Zenuxs OAuth Integration</h2>
          <p className="text-blue-700 mb-4">
            This project includes Zenuxs OAuth authentication. {isAuthenticated ? 'You are currently logged in.' : 'You are not logged in.'}
          </p>
          {!isAuthenticated && (
            <button
              onClick={() => login()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Login with Zenuxs OAuth
            </button>
          )}
        </div>` : ''}
        
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Useful Links</h2>
            <ul className="space-y-2">
              <li>
                <a href="https://zenuxs.in" className="text-blue-600 hover:underline">
                  • Zenuxs Accounts: https://zenuxs.in
                </a>
              </li>
              <li>
                <a href="https://easy-mongoo.zenuxs.in" className="text-blue-600 hover:underline">
                  • Easy-Mongoo: https://easy-mongoo.zenuxs.in
                </a>
              </li>
              <li>
                <a href="https://hmax.zenuxs.in" className="text-blue-600 hover:underline">
                  • HMAX Security: https://hmax.zenuxs.in
                </a>
              </li>
              ${authUI ? `
              <li>
                <a href="https://api.auth.zenuxs.in" className="text-blue-600 hover:underline">
                  • Zenuxs Auth API: https://api.auth.zenuxs.in
                </a>
              </li>` : ''}
            </ul>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <code className="text-sm">
              npm run dev
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ZenuxsPage
`;
  } else {
    zenuxsPage = `import React from 'react'
import './ZenuxsPage.css'
${authUI ? `import { useAuth } from '../contexts/AuthContext.${ext}'` : ''}

const ZenuxsPage = () => {
  ${authUI ? `const { isAuthenticated, login } = useAuth();` : ''}
  
  return (
    <div className="zenuxs-container">
      <div className="zenuxs-content">
        <h1 className="zenuxs-title">
          🚀 Project created using Zenuxs CLI
        </h1>
        
        ${authUI ? `
        <div className="zenuxs-oauth-info">
          <h2 className="zenuxs-oauth-title">🔐 Zenuxs OAuth Integration</h2>
          <p className="zenuxs-oauth-text">
            This project includes Zenuxs OAuth authentication. {isAuthenticated ? 'You are currently logged in.' : 'You are not logged in.'}
          </p>
          {!isAuthenticated && (
            <button
              onClick={() => login()}
              className="zenuxs-oauth-button"
            >
              Login with Zenuxs OAuth
            </button>
          )}
        </div>` : ''}
        
        <div className="zenuxs-info">
          <div>
            <h2 className="zenuxs-subtitle">Useful Links</h2>
            <ul className="zenuxs-links">
              <li>
                <a href="https://zenuxs.in" className="zenuxs-link">
                  • Zenuxs Accounts: https://zenuxs.in
                </a>
              </li>
              <li>
                <a href="https://easy-mongoo.zenuxs.in" className="zenuxs-link">
                  • Easy-Mongoo: https://easy-mongoo.zenuxs.in
                </a>
              </li>
              <li>
                <a href="https://hmax.zenuxs.in" className="zenuxs-link">
                  • HMAX Security: https://hmax.zenuxs.in
                </a>
              </li>
              ${authUI ? `
              <li>
                <a href="https://api.auth.zenuxs.in" className="zenuxs-link">
                  • Zenuxs Auth API: https://api.auth.zenuxs.in
                </a>
              </li>` : ''}
            </ul>
          </div>
          
          <div className="zenuxs-code">
            <code>
              npm run dev
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ZenuxsPage
`;
    
    // Create ZenuxsPage.css file for non-Tailwind version with OAuth styles
    const zenuxsCss = `.zenuxs-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f3ff 0%, #ffe4e6 100%);
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.zenuxs-content {
  max-width: 64rem;
  margin: 0 auto;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.zenuxs-title {
  font-size: 2.25rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 2rem;
}

.zenuxs-oauth-info {
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.zenuxs-oauth-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 0.75rem;
}

.zenuxs-oauth-text {
  color: #1e40af;
  margin-bottom: 1rem;
}

.zenuxs-oauth-button {
  padding: 0.75rem 1.5rem;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.zenuxs-oauth-button:hover {
  background-color: #1d4ed8;
}

.zenuxs-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.zenuxs-subtitle {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.zenuxs-links {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.zenuxs-link {
  color: #2563eb;
  text-decoration: none;
}

.zenuxs-link:hover {
  text-decoration: underline;
}

.zenuxs-code {
  background-color: #f7fafc;
  padding: 1rem;
  border-radius: 0.5rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
}
`;
    
    await fs.writeFile(`src/pages/ZenuxsPage.css`, zenuxsCss);
  }
  
  await fs.writeFile(`src/pages/ZenuxsPage.${ext}`, zenuxsPage);
  
  // Create auth pages if authUI is true
  if (authUI) {
    // Create Login page with Zenuxs OAuth
    let loginPage;
    if (tailwind) {
      registerPage = `import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.${ext}'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })
  const [useZenuxsOAuth, setUseZenuxsOAuth] = useState(false)
  const navigate = useNavigate()
  const { login, loading, error } = useAuth()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!')
      return
    }
    
    if (!formData.agreeToTerms) {
      alert('Please agree to the terms and conditions')
      return
    }
    
    // In a real app, you would make an API call here
    console.log('Registration data:', formData)
    
    // For demo purposes, redirect to login
    navigate('/login')
  }

  const handleZenuxsLogin = (options = {}) => {
    login(options)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center mb-2">Create Account</h1>
        <p className="text-gray-600 text-center mb-8">Get started with your free account</p>
        
        {/* OAuth Option */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Sign Up Method</h3>
            <div className="flex items-center">
              <span className={\`mr-2 text-sm \${useZenuxsOAuth ? 'text-blue-600' : 'text-gray-500'}\`}>Traditional</span>
              <button
                type="button"
                className="relative inline-flex h-6 w-11 items-center rounded-full"
                onClick={() => setUseZenuxsOAuth(!useZenuxsOAuth)}
              >
                <span className="sr-only">Toggle sign up method</span>
                <span className={\`\${useZenuxsOAuth ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition\`} />
                <span className={\`\${useZenuxsOAuth ? 'bg-blue-600' : 'bg-gray-300'} inline-block h-full w-full rounded-full\`} />
              </button>
              <span className={\`ml-2 text-sm \${useZenuxsOAuth ? 'text-blue-600 font-medium' : 'text-gray-500'}\`}>Zenuxs OAuth</span>
            </div>
          </div>
          
          {useZenuxsOAuth ? (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">🔐 Secure OAuth Registration</h4>
                <p className="text-sm text-blue-700 mb-4">
                  Register using Zenuxs OAuth 2.0. This creates a Zenuxs account that you can use across multiple applications.
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={() => handleZenuxsLogin()}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                  >
                    {loading ? 'Redirecting...' : 'Register with Zenuxs OAuth'}
                  </button>
                  
                  <button
                    onClick={() => handleZenuxsLogin({ popup: true, popupWidth: 600, popupHeight: 700 })}
                    disabled={loading}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition duration-200 disabled:opacity-50"
                  >
                    {loading ? 'Opening...' : 'Register with Popup'}
                  </button>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Already have a Zenuxs account?{' '}
                  <Link to="/login" className="text-blue-600 hover:underline">
                    Sign in instead
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="John Doe"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="you@example.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="agree-to-terms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="agree-to-terms" className="ml-2 text-sm text-gray-600">
                  I agree to the{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-800">
                    Terms & Conditions
                  </a>
                </label>
              </div>
              
              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition duration-200"
              >
                Create Account
              </button>
            </form>
          )}
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </div>
        
        {!useZenuxsOAuth && (
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or sign up with</span>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                Google
              </button>
              <button className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                GitHub
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Register
`;
    } else {
      loginPage = `import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.${ext}'
import './Login.css'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [useZenuxsOAuth, setUseZenuxsOAuth] = useState(true)
  const navigate = useNavigate()
  const { login, loading, error } = useAuth()

  const handleTraditionalSubmit = (e) => {
    e.preventDefault()
    // In a real app, you would make an API call here
    console.log('Traditional login attempt:', { email, password, rememberMe })
    
    // For demo purposes, redirect to dashboard
    navigate('/dashboard')
  }

  const handleZenuxsLogin = (options = {}) => {
    login(options)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Sign in to your account</p>
        
        {/* OAuth Option */}
        <div className="login-method">
          <div className="method-toggle">
            <h3 className="method-title">Login Method</h3>
            <div className="toggle-container">
              <span className="toggle-label ${useZenuxsOAuth ? 'toggle-label-inactive' : ''}">Traditional</span>
              <button
                type="button"
                className="toggle-button"
                onClick={() => setUseZenuxsOAuth(!useZenuxsOAuth)}
              >
                <span className="toggle-slider ${useZenuxsOAuth ? 'toggle-slider-active' : ''}" />
                <span className="toggle-track ${useZenuxsOAuth ? 'toggle-track-active' : ''}" />
              </button>
              <span className="toggle-label ${useZenuxsOAuth ? 'toggle-label-active' : ''}">Zenuxs OAuth</span>
            </div>
          </div>
          
          {useZenuxsOAuth ? (
            <div className="oauth-section">
              <div className="oauth-info">
                <h4 className="oauth-title">🔐 Secure OAuth Login</h4>
                <p className="oauth-text">
                  Login using Zenuxs OAuth 2.0 with PKCE flow. Your credentials are handled securely by Zenuxs.
                </p>
                
                <div className="oauth-buttons">
                  <button
                    onClick={() => handleZenuxsLogin()}
                    disabled={loading}
                    className="oauth-button oauth-button-primary"
                  >
                    {loading ? 'Redirecting...' : 'Login with Zenuxs OAuth'}
                  </button>
                  
                  <button
                    onClick={() => handleZenuxsLogin({ popup: true, popupWidth: 600, popupHeight: 700 })}
                    disabled={loading}
                    className="oauth-button oauth-button-secondary"
                  >
                    {loading ? 'Opening...' : 'Login with Popup'}
                  </button>
                </div>
              </div>
              
              <div className="oauth-footer">
                <p className="oauth-footer-text">
                  Don't have a Zenuxs account?{' '}
                  <a href="https://zenuxs.in/register" className="oauth-footer-link" target="_blank" rel="noopener noreferrer">
                    Create one
                  </a>
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleTraditionalSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="you@example.com"
                  required={!useZenuxsOAuth}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  placeholder="••••••••"
                  required={!useZenuxsOAuth}
                />
              </div>
              
              <div className="form-options">
                <div className="remember-me">
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="checkbox"
                  />
                  <label htmlFor="remember-me" className="checkbox-label">
                    Remember me
                  </label>
                </div>
                
                <a href="#" className="forgot-password">
                  Forgot password?
                </a>
              </div>
              
              <button
                type="submit"
                className="login-button"
              >
                Sign In
              </button>
            </form>
          )}
        </div>
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
        
        <div className="signup-section">
          <p className="signup-text">
            Don't have an account?{' '}
            <Link to="/register" className="signup-link">
              Sign up
            </Link>
          </p>
        </div>
        
        {!useZenuxsOAuth && (
          <div className="social-login">
            <div className="divider">
              <div className="divider-line"></div>
              <span className="divider-text">Or continue with</span>
              <div className="divider-line"></div>
            </div>
            
            <div className="social-buttons">
              <button className="social-button">
                Google
              </button>
              <button className="social-button">
                GitHub
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Login
`;
      
      // Create Login.css file with OAuth styles
      const loginCss = `.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.login-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 28rem;
  padding: 2rem;
}

.login-title {
  font-size: 1.875rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.login-subtitle {
  color: #6b7280;
  text-align: center;
  margin-bottom: 2rem;
}

.login-method {
  margin-bottom: 1.5rem;
}

.method-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.method-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
}

.toggle-container {
  display: flex;
  align-items: center;
}

.toggle-label {
  font-size: 0.875rem;
  transition: color 0.2s;
}

.toggle-label-active {
  color: #2563eb;
  font-weight: 500;
}

.toggle-label-inactive {
  color: #6b7280;
}

.toggle-button {
  position: relative;
  display: inline-flex;
  height: 1.5rem;
  width: 2.75rem;
  margin: 0 0.5rem;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
}

.toggle-track {
  display: inline-block;
  width: 100%;
  height: 100%;
  background-color: #d1d5db;
  border-radius: 9999px;
  transition: background-color 0.2s;
}

.toggle-track-active {
  background-color: #2563eb;
}

.toggle-slider {
  position: absolute;
  top: 0.125rem;
  left: 0.125rem;
  height: 1.25rem;
  width: 1.25rem;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.toggle-slider-active {
  transform: translateX(1.25rem);
}

.oauth-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.oauth-info {
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 0.75rem;
  padding: 1.25rem;
}

.oauth-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 0.5rem;
}

.oauth-text {
  color: #1e40af;
  font-size: 0.875rem;
  line-height: 1.4;
  margin-bottom: 1rem;
}

.oauth-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.oauth-button {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.oauth-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.oauth-button-primary {
  background-color: #2563eb;
  color: white;
}

.oauth-button-primary:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.oauth-button-secondary {
  background-color: #7c3aed;
  color: white;
}

.oauth-button-secondary:hover:not(:disabled) {
  background-color: #6d28d9;
}

.oauth-footer {
  text-align: center;
}

.oauth-footer-text {
  font-size: 0.875rem;
  color: #6b7280;
}

.oauth-footer-link {
  color: #2563eb;
  text-decoration: none;
}

.oauth-footer-link:hover {
  text-decoration: underline;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.remember-me {
  display: flex;
  align-items: center;
}

.checkbox {
  height: 1rem;
  width: 1rem;
  color: #3b82f6;
  border-radius: 0.25rem;
}

.checkbox-label {
  margin-left: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.forgot-password {
  font-size: 0.875rem;
  color: #3b82f6;
  text-decoration: none;
}

.forgot-password:hover {
  color: #1d4ed8;
}

.login-button {
  width: 100%;
  background-color: #3b82f6;
  color: white;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-button:hover {
  background-color: #2563eb;
}

.error-message {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin-bottom: 1rem;
}

.error-message p {
  color: #dc2626;
  font-size: 0.875rem;
}

.signup-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.signup-text {
  text-align: center;
  color: #6b7280;
}

.signup-link {
  color: #3b82f6;
  font-weight: 500;
  text-decoration: none;
}

.signup-link:hover {
  color: #1d4ed8;
}

.social-login {
  margin-top: 2rem;
}

.divider {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.divider-line {
  flex: 1;
  height: 1px;
  background-color: #d1d5db;
}

.divider-text {
  padding: 0 1rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.social-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.social-button {
  width: 100%;
  display: inline-flex;
  justify-content: center;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.2s;
}

.social-button:hover {
  background-color: #f9fafb;
}
`;
      
      await fs.writeFile(`src/pages/Login.css`, loginCss);
    }
    
    await fs.writeFile(`src/pages/Login.${ext}`, loginPage);
    
    // Create Register page with Zenuxs OAuth option
    let registerPage;
    if (tailwind) {
      registerPage = `import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.${ext}'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })
  const [useZenuxsOAuth, setUseZenuxsOAuth] = useState(false)
  const navigate = useNavigate()
  const { login, loading, error } = useAuth()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!')
      return
    }
    
    if (!formData.agreeToTerms) {
      alert('Please agree to the terms and conditions')
      return
    }
    
    // In a real app, you would make an API call here
    console.log('Registration data:', formData)
    
    // For demo purposes, redirect to login
    navigate('/login')
  }

  const handleZenuxsLogin = (options = {}) => {
    login(options)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center mb-2">Create Account</h1>
        <p className="text-gray-600 text-center mb-8">Get started with your free account</p>
        
        {/* OAuth Option */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Sign Up Method</h3>
            <div className="flex items-center">
              <span className={\`mr-2 text-sm \${useZenuxsOAuth ? 'text-blue-600' : 'text-gray-500'}\`}>Traditional</span>
              <button
                type="button"
                className="relative inline-flex h-6 w-11 items-center rounded-full"
                onClick={() => setUseZenuxsOAuth(!useZenuxsOAuth)}
              >
                <span className="sr-only">Toggle sign up method</span>
                <span className={\`\${useZenuxsOAuth ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition\`} />
                <span className={\`\${useZenuxsOAuth ? 'bg-blue-600' : 'bg-gray-300'} inline-block h-full w-full rounded-full\`} />
              </button>
              <span className={\`ml-2 text-sm \${useZenuxsOAuth ? 'text-blue-600 font-medium' : 'text-gray-500'}\`}>Zenuxs OAuth</span>
            </div>
          </div>
          
          {useZenuxsOAuth ? (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">🔐 Secure OAuth Registration</h4>
                <p className="text-sm text-blue-700 mb-4">
                  Register using Zenuxs OAuth 2.0. This creates a Zenuxs account that you can use across multiple applications.
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={() => handleZenuxsLogin()}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                  >
                    {loading ? 'Redirecting...' : 'Register with Zenuxs OAuth'}
                  </button>
                  
                  <button
                    onClick={() => handleZenuxsLogin({ popup: true, popupWidth: 600, popupHeight: 700 })}
                    disabled={loading}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition duration-200 disabled:opacity-50"
                  >
                    {loading ? 'Opening...' : 'Register with Popup'}
                  </button>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Already have a Zenuxs account?{' '}
                  <Link to="/login" className="text-blue-600 hover:underline">
                    Sign in instead
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="John Doe"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="you@example.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="agree-to-terms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="agree-to-terms" className="ml-2 text-sm text-gray-600">
                  I agree to the{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-800">
                    Terms & Conditions
                  </a>
                </label>
              </div>
              
              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition duration-200"
              >
                Create Account
              </button>
            </form>
          )}
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </div>
        
        {!useZenuxsOAuth && (
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or sign up with</span>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                Google
              </button>
              <button className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                GitHub
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Register
`;
    } else {
      registerPage = `import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.${ext}'
import './Register.css'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })
  const [useZenuxsOAuth, setUseZenuxsOAuth] = useState(false)
  const navigate = useNavigate()
  const { login, loading, error } = useAuth()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!')
      return
    }
    
    if (!formData.agreeToTerms) {
      alert('Please agree to the terms and conditions')
      return
    }
    
    // In a real app, you would make an API call here
    console.log('Registration data:', formData)
    
    // For demo purposes, redirect to login
    navigate('/login')
  }

  const handleZenuxsLogin = (options = {}) => {
    login(options)
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <h1 className="register-title">Create Account</h1>
        <p className="register-subtitle">Get started with your free account</p>
        
        {/* OAuth Option */}
        <div className="register-method">
          <div className="method-toggle">
            <h3 className="method-title">Sign Up Method</h3>
            <div className="toggle-container">
              <span className="toggle-label ${useZenuxsOAuth ? 'toggle-label-inactive' : ''}">Traditional</span>
              <button
                type="button"
                className="toggle-button"
                onClick={() => setUseZenuxsOAuth(!useZenuxsOAuth)}
              >
                <span className="toggle-slider ${useZenuxsOAuth ? 'toggle-slider-active' : ''}" />
                <span className="toggle-track ${useZenuxsOAuth ? 'toggle-track-active' : ''}" />
              </button>
              <span className="toggle-label ${useZenuxsOAuth ? 'toggle-label-active' : ''}">Zenuxs OAuth</span>
            </div>
          </div>
          
          {useZenuxsOAuth ? (
            <div className="oauth-section">
              <div className="oauth-info">
                <h4 className="oauth-title">🔐 Secure OAuth Registration</h4>
                <p className="oauth-text">
                  Register using Zenuxs OAuth 2.0. This creates a Zenuxs account that you can use across multiple applications.
                </p>
                
                <div className="oauth-buttons">
                  <button
                    onClick={() => handleZenuxsLogin()}
                    disabled={loading}
                    className="oauth-button oauth-button-primary"
                  >
                    {loading ? 'Redirecting...' : 'Register with Zenuxs OAuth'}
                  </button>
                  
                  <button
                    onClick={() => handleZenuxsLogin({ popup: true, popupWidth: 600, popupHeight: 700 })}
                    disabled={loading}
                    className="oauth-button oauth-button-secondary"
                  >
                    {loading ? 'Opening...' : 'Register with Popup'}
                  </button>
                </div>
              </div>
              
              <div className="oauth-footer">
                <p className="oauth-footer-text">
                  Already have a Zenuxs account?{' '}
                  <Link to="/login" className="oauth-footer-link">
                    Sign in instead
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="register-form">
              <div className="form-group">
                <label className="form-label">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="John Doe"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="you@example.com"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <div className="terms-agreement">
                <input
                  type="checkbox"
                  id="agree-to-terms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="checkbox"
                />
                <label htmlFor="agree-to-terms" className="terms-label">
                  I agree to the{' '}
                  <a href="#" className="terms-link">
                    Terms & Conditions
                  </a>
                </label>
              </div>
              
              <button
                type="submit"
                className="register-button"
              >
                Create Account
              </button>
            </form>
          )}
        </div>
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
        
        <div className="login-section">
          <p className="login-text">
            Already have an account?{' '}
            <Link to="/login" className="login-link">
              Sign in
            </Link>
          </p>
        </div>
        
        {!useZenuxsOAuth && (
          <div className="social-register">
            <div className="divider">
              <div className="divider-line"></div>
              <span className="divider-text">Or sign up with</span>
              <div className="divider-line"></div>
            </div>
            
            <div className="social-buttons">
              <button className="social-button">
                Google
              </button>
              <button className="social-button">
                GitHub
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Register
`;
      
      // Create Register.css file with OAuth styles
      const registerCss = `.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.register-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 28rem;
  padding: 2rem;
}

.register-title {
  font-size: 1.875rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.register-subtitle {
  color: #6b7280;
  text-align: center;
  margin-bottom: 2rem;
}

.register-method {
  margin-bottom: 1.5rem;
}

.method-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.method-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
}

.toggle-container {
  display: flex;
  align-items: center;
}

.toggle-label {
  font-size: 0.875rem;
  transition: color 0.2s;
}

.toggle-label-active {
  color: #2563eb;
  font-weight: 500;
}

.toggle-label-inactive {
  color: #6b7280;
}

.toggle-button {
  position: relative;
  display: inline-flex;
  height: 1.5rem;
  width: 2.75rem;
  margin: 0 0.5rem;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
}

.toggle-track {
  display: inline-block;
  width: 100%;
  height: 100%;
  background-color: #d1d5db;
  border-radius: 9999px;
  transition: background-color 0.2s;
}

.toggle-track-active {
  background-color: #2563eb;
}

.toggle-slider {
  position: absolute;
  top: 0.125rem;
  left: 0.125rem;
  height: 1.25rem;
  width: 1.25rem;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.toggle-slider-active {
  transform: translateX(1.25rem);
}

.oauth-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.oauth-info {
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 0.75rem;
  padding: 1.25rem;
}

.oauth-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 0.5rem;
}

.oauth-text {
  color: #1e40af;
  font-size: 0.875rem;
  line-height: 1.4;
  margin-bottom: 1rem;
}

.oauth-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.oauth-button {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.oauth-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.oauth-button-primary {
  background-color: #2563eb;
  color: white;
}

.oauth-button-primary:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.oauth-button-secondary {
  background-color: #7c3aed;
  color: white;
}

.oauth-button-secondary:hover:not(:disabled) {
  background-color: #6d28d9;
}

.oauth-footer {
  text-align: center;
}

.oauth-footer-text {
  font-size: 0.875rem;
  color: #6b7280;
}

.oauth-footer-link {
  color: #2563eb;
  text-decoration: none;
}

.oauth-footer-link:hover {
  text-decoration: underline;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.terms-agreement {
  display: flex;
  align-items: flex-start;
}

.checkbox {
  margin-top: 0.25rem;
  height: 1rem;
  width: 1rem;
  color: #3b82f6;
  border-radius: 0.25rem;
}

.terms-label {
  margin-left: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
}

.terms-link {
  color: #3b82f6;
  text-decoration: none;
}

.terms-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.register-button {
  width: 100%;
  background-color: #7c3aed;
  color: white;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.register-button:hover {
  background-color: #6d28d9;
}

.error-message {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin-bottom: 1rem;
}

.error-message p {
  color: #dc2626;
  font-size: 0.875rem;
}

.login-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.login-text {
  text-align: center;
  color: #6b7280;
}

.login-link {
  color: #3b82f6;
  font-weight: 500;
  text-decoration: none;
}

.login-link:hover {
  color: #1d4ed8;
}

.social-register {
  margin-top: 2rem;
}

.divider {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.divider-line {
  flex: 1;
  height: 1px;
  background-color: #d1d5db;
}

.divider-text {
  padding: 0 1rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.social-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.social-button {
  width: 100%;
  display: inline-flex;
  justify-content: center;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.2s;
}

.social-button:hover {
  background-color: #f9fafb;
}
`;
      
      await fs.writeFile(`src/pages/Register.css`, registerCss);
    }
    
    await fs.writeFile(`src/pages/Register.${ext}`, registerPage);
    
    // Create Dashboard page with OAuth user info
    let dashboardPage;
    if (tailwind) {
      dashboardPage = `import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.${ext}'

const Dashboard = () => {
  const navigate = useNavigate()
  const { userInfo, sessionState, logout, getUserInfo, refreshTokens, exportSession } = useAuth()
  
  useEffect(() => {
    // Fetch user info if not already loaded
    if (!userInfo) {
      getUserInfo().catch(console.error)
    }
  }, [userInfo, getUserInfo])

  const handleLogout = () => {
    logout()
  }

  const handleRefreshTokens = () => {
    refreshTokens().catch(console.error)
  }

  const handleExportSession = () => {
    try {
      const session = exportSession()
      navigator.clipboard.writeText(JSON.stringify(session, null, 2))
      alert('Session exported to clipboard!')
    } catch (error) {
      alert(\`Export failed: \${error.message}\`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                Home
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section with OAuth Info */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome {userInfo?.name || userInfo?.email || 'User'}!
                  </h2>
                  <p className="text-gray-600">
                    This is a protected dashboard page. You are authenticated with Zenuxs OAuth.
                  </p>
                </div>
                {userInfo?.picture && (
                  <img 
                    src={userInfo.picture} 
                    alt="Profile" 
                    className="w-16 h-16 rounded-full"
                  />
                )}
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">OAuth Session Info</h3>
                  {sessionState && (
                    <div className="space-y-1">
                      <p className="text-sm text-blue-700">
                        <span className="font-medium">Authenticated:</span> {sessionState.isAuthenticated ? 'Yes' : 'No'}
                      </p>
                      {sessionState.expiresAt && (
                        <p className="text-sm text-blue-700">
                          <span className="font-medium">Expires:</span> {new Date(sessionState.expiresAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-2">OAuth Actions</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleRefreshTokens}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Refresh Tokens
                    </button>
                    <button
                      onClick={handleExportSession}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Export Session
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Info Panel */}
          {userInfo && (
            <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">User Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(userInfo, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600">📊</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Projects
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">12</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-600">✅</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Completed Tasks
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">47</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <span className="text-yellow-600">⏰</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Pending Tasks
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">8</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-purple-600">👥</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Team Members
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">24</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Activity
              </h3>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                <li className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600">🎯</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          OAuth authentication successful
                        </div>
                        <div className="text-sm text-gray-500">
                          You logged in using Zenuxs OAuth
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Just now
                    </div>
                  </div>
                </li>
                <li className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-600">✅</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          Task completed
                        </div>
                        <div className="text-sm text-gray-500">
                          "User authentication" task was marked as complete
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      1 day ago
                    </div>
                  </div>
                </li>
                <li className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                        <span className="text-yellow-600">📝</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          New comment
                        </div>
                        <div className="text-sm text-gray-500">
                          John Doe commented on "API Integration"
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      3 days ago
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
`;
    } else {
      dashboardPage = `import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.${ext}'
import './Dashboard.css'

const Dashboard = () => {
  const navigate = useNavigate()
  const { userInfo, sessionState, logout, getUserInfo, refreshTokens, exportSession } = useAuth()
  
  useEffect(() => {
    // Fetch user info if not already loaded
    if (!userInfo) {
      getUserInfo().catch(console.error)
    }
  }, [userInfo, getUserInfo])

  const handleLogout = () => {
    logout()
  }

  const handleRefreshTokens = () => {
    refreshTokens().catch(console.error)
  }

  const handleExportSession = () => {
    try {
      const session = exportSession()
      navigator.clipboard.writeText(JSON.stringify(session, null, 2))
      alert('Session exported to clipboard!')
    } catch (error) {
      alert(\`Export failed: \${error.message}\`)
    }
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="header-title">Dashboard</h1>
          </div>
          <div className="header-right">
            <Link 
              to="/" 
              className="header-link"
            >
              Home
            </Link>
            <button
              onClick={handleLogout}
              className="logout-button"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-content">
          {/* Welcome Section with OAuth Info */}
          <div className="welcome-card">
            <div className="welcome-content">
              <div className="welcome-header">
                <div>
                  <h2 className="welcome-title">
                    Welcome {userInfo?.name || userInfo?.email || 'User'}!
                  </h2>
                  <p className="welcome-text">
                    This is a protected dashboard page. You are authenticated with Zenuxs OAuth.
                  </p>
                </div>
                {userInfo?.picture && (
                  <img 
                    src={userInfo.picture} 
                    alt="Profile" 
                    className="welcome-avatar"
                  />
                )}
              </div>
              
              <div className="oauth-info-grid">
                <div className="oauth-info-card oauth-session-info">
                  <h3 className="oauth-info-title">OAuth Session Info</h3>
                  {sessionState && (
                    <div className="oauth-info-details">
                      <p className="oauth-info-item">
                        <span className="oauth-info-label">Authenticated:</span> {sessionState.isAuthenticated ? 'Yes' : 'No'}
                      </p>
                      {sessionState.expiresAt && (
                        <p className="oauth-info-item">
                          <span className="oauth-info-label">Expires:</span> {new Date(sessionState.expiresAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="oauth-info-card oauth-actions">
                  <h3 className="oauth-info-title">OAuth Actions</h3>
                  <div className="oauth-actions-buttons">
                    <button
                      onClick={handleRefreshTokens}
                      className="oauth-action-button refresh-button"
                    >
                      Refresh Tokens
                    </button>
                    <button
                      onClick={handleExportSession}
                      className="oauth-action-button export-button"
                    >
                      Export Session
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Info Panel */}
          {userInfo && (
            <div className="user-info-card">
              <div className="user-info-content">
                <h3 className="user-info-title">User Information</h3>
                <div className="user-info-json">
                  <pre>
                    {JSON.stringify(userInfo, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-icon-container">
                  <div className="stat-icon">📊</div>
                </div>
                <div className="stat-details">
                  <div className="stat-label">Total Projects</div>
                  <div className="stat-value">12</div>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-icon-container">
                  <div className="stat-icon">✅</div>
                </div>
                <div className="stat-details">
                  <div className="stat-label">Completed Tasks</div>
                  <div className="stat-value">47</div>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-icon-container">
                  <div className="stat-icon">⏰</div>
                </div>
                <div className="stat-details">
                  <div className="stat-label">Pending Tasks</div>
                  <div className="stat-value">8</div>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-icon-container">
                  <div className="stat-icon">👥</div>
                </div>
                <div className="stat-details">
                  <div className="stat-label">Team Members</div>
                  <div className="stat-value">24</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="activity-card">
            <div className="activity-header">
              <h3 className="activity-title">
                Recent Activity
              </h3>
            </div>
            <div className="activity-list">
              <ul className="activity-items">
                <li className="activity-item">
                  <div className="activity-item-content">
                    <div className="activity-item-left">
                      <div className="activity-icon-container">
                        <div className="activity-icon">🎯</div>
                      </div>
                      <div className="activity-details">
                        <div className="activity-main">
                          OAuth authentication successful
                        </div>
                        <div className="activity-description">
                          You logged in using Zenuxs OAuth
                        </div>
                      </div>
                    </div>
                    <div className="activity-time">
                      Just now
                    </div>
                  </div>
                </li>
                <li className="activity-item">
                  <div className="activity-item-content">
                    <div className="activity-item-left">
                      <div className="activity-icon-container">
                        <div className="activity-icon">✅</div>
                      </div>
                      <div className="activity-details">
                        <div className="activity-main">
                          Task completed
                        </div>
                        <div className="activity-description">
                          "User authentication" task was marked as complete
                        </div>
                      </div>
                    </div>
                    <div className="activity-time">
                      1 day ago
                    </div>
                  </div>
                </li>
                <li className="activity-item">
                  <div className="activity-item-content">
                    <div className="activity-item-left">
                      <div className="activity-icon-container">
                        <div className="activity-icon">📝</div>
                      </div>
                      <div className="activity-details">
                        <div className="activity-main">
                          New comment
                        </div>
                        <div className="activity-description">
                          John Doe commented on "API Integration"
                        </div>
                      </div>
                    </div>
                    <div className="activity-time">
                      3 days ago
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
`;
      
      // Create Dashboard.css file with OAuth styles
      const dashboardCss = `.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.dashboard-header {
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 4rem;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-link {
  padding: 0.5rem 1rem;
  color: #374151;
  text-decoration: none;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.header-link:hover {
  color: #111827;
  background-color: #f3f4f6;
}

.logout-button {
  padding: 0.5rem 1rem;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.logout-button:hover {
  background-color: #b91c1c;
}

.dashboard-main {
  max-width: 80rem;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

.dashboard-content {
  padding: 1rem 0;
}

.welcome-card {
  background: white;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.welcome-content {
  padding: 1.5rem;
}

.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.welcome-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.welcome-text {
  color: #6b7280;
}

.welcome-avatar {
  width: 4rem;
  height: 4rem;
  border-radius: 9999px;
  object-fit: cover;
}

.oauth-info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .oauth-info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.oauth-info-card {
  padding: 1rem;
  border-radius: 0.5rem;
}

.oauth-session-info {
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
}

.oauth-actions {
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.oauth-info-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.oauth-session-info .oauth-info-title {
  color: #1e40af;
}

.oauth-actions .oauth-info-title {
  color: #166534;
}

.oauth-info-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.oauth-info-item {
  font-size: 0.875rem;
  color: #1e40af;
}

.oauth-info-label {
  font-weight: 500;
}

.oauth-actions-buttons {
  display: flex;
  gap: 0.5rem;
}

.oauth-action-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.refresh-button {
  background-color: #16a34a;
  color: white;
}

.refresh-button:hover {
  background-color: #15803d;
}

.export-button {
  background-color: #2563eb;
  color: white;
}

.export-button:hover {
  background-color: #1d4ed8;
}

.user-info-card {
  background: white;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.user-info-content {
  padding: 1.5rem;
}

.user-info-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.user-info-json {
  background-color: #f8fafc;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}

.user-info-json pre {
  font-size: 0.875rem;
  color: #374151;
  margin: 0;
  white-space: pre-wrap;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.stat-card {
  background: white;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
}

.stat-content {
  padding: 1.25rem;
  display: flex;
  align-items: center;
}

.stat-icon-container {
  flex-shrink: 0;
}

.stat-icon {
  height: 2.5rem;
  width: 2.5rem;
  border-radius: 9999px;
  background-color: #dbeafe;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
}

.stat-details {
  margin-left: 1.25rem;
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-top: 0.25rem;
}

.activity-card {
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
}

.activity-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.activity-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.activity-list {
  border-top: 1px solid #e5e7eb;
}

.activity-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.activity-item {
  border-bottom: 1px solid #e5e7eb;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-item-content {
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.activity-item-left {
  display: flex;
  align-items: center;
}

.activity-icon-container {
  flex-shrink: 0;
}

.activity-icon {
  height: 2.5rem;
  width: 2.5rem;
  border-radius: 9999px;
  background-color: #dbeafe;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
}

.activity-details {
  margin-left: 1rem;
}

.activity-main {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
}

.activity-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.125rem;
}

.activity-time {
  font-size: 0.875rem;
  color: #6b7280;
  white-space: nowrap;
}
`;
      
      await fs.writeFile(`src/pages/Dashboard.css`, dashboardCss);
    }
    
    await fs.writeFile(`src/pages/Dashboard.${ext}`, dashboardPage);
  }
  
  // Create styles
  if (tailwind) {
    const globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Animations */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Transition classes */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
`;
    await fs.writeFile('src/styles/globals.css', globalsCss);
    
    // Create tailwind config
    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;
    await fs.writeFile('tailwind.config.js', tailwindConfig);
    
    // Create postcss config
    const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;
    await fs.writeFile('postcss.config.js', postcssConfig);
  } else {
    // Create basic CSS for non-Tailwind version
    const globalsCss = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Animations */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
`;
    await fs.writeFile('src/styles/globals.css', globalsCss);
  }
}