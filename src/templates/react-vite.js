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
      'react-router-dom': '^6.14.0'
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
  
  // Create App component
  const appContent = `import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.${ext}'
import ZenuxsPage from './pages/ZenuxsPage.${ext}'
${authUI ? `
import Login from './pages/Login.${ext}'
import Register from './pages/Register.${ext}'
import Dashboard from './pages/Dashboard.${ext}'` : ''}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/zenuxs" element={<ZenuxsPage />} />
        ${authUI ? `
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />` : ''}
      </Routes>
    </Router>
  )
}

export default App
`;
  await fs.writeFile(`src/App.${ext}`, appContent);
  
  // Create Home page with or without Tailwind classes
  let homePage;
  if (tailwind) {
    homePage = `import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
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
          <Link
            to="/login"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Register
          </Link>` : ''}
        </div>
        
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

const Home = () => {
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
          <Link
            to="/login"
            className="btn btn-secondary"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="btn btn-tertiary"
          >
            Register
          </Link>` : ''}
        </div>
        
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
    
    // Create Home.css file for non-Tailwind version
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
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
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
  
  // Create Zenuxs page with or without Tailwind classes
  let zenuxsPage;
  if (tailwind) {
    zenuxsPage = `import React from 'react'

const ZenuxsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          🚀 Project created using Zenuxs CLI
        </h1>
        
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

const ZenuxsPage = () => {
  return (
    <div className="zenuxs-container">
      <div className="zenuxs-content">
        <h1 className="zenuxs-title">
          🚀 Project created using Zenuxs CLI
        </h1>
        
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
    
    // Create ZenuxsPage.css file for non-Tailwind version
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
    // Create Login page
    let loginPage;
    if (tailwind) {
      loginPage = `import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real app, you would make an API call here
    console.log('Login attempt:', { email, password, rememberMe })
    
    // For demo purposes, redirect to dashboard
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center mb-2">Welcome Back</h1>
        <p className="text-gray-600 text-center mb-8">Sign in to your account</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="••••••••"
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="remember-me" className="ml-2 text-sm text-gray-600">
                Remember me
              </label>
            </div>
            
            <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
              Forgot password?
            </a>
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-200"
          >
            Sign In
          </button>
        </form>
        
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-medium hover:text-blue-800">
              Sign up
            </Link>
          </p>
        </div>
        
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
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
      </div>
    </div>
  )
}

export default Login
`;
    } else {
      loginPage = `import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Login.css'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real app, you would make an API call here
    console.log('Login attempt:', { email, password, rememberMe })
    
    // For demo purposes, redirect to dashboard
    navigate('/dashboard')
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Sign in to your account</p>
        
        <form onSubmit={handleSubmit} className="login-form">
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
              required
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
              required
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
        
        <div className="signup-section">
          <p className="signup-text">
            Don't have an account?{' '}
            <Link to="/register" className="signup-link">
              Sign up
            </Link>
          </p>
        </div>
        
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
      </div>
    </div>
  )
}

export default Login
`;
      
      // Create Login.css file
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
    
    // Create Register page
    let registerPage;
    if (tailwind) {
      registerPage = `import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })
  const navigate = useNavigate()

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center mb-2">Create Account</h1>
        <p className="text-gray-600 text-center mb-8">Get started with your free account</p>
        
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
        
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </div>
        
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
      </div>
    </div>
  )
}

export default Register
`;
    } else {
      registerPage = `import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Register.css'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })
  const navigate = useNavigate()

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

  return (
    <div className="register-container">
      <div className="register-card">
        <h1 className="register-title">Create Account</h1>
        <p className="register-subtitle">Get started with your free account</p>
        
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
        
        <div className="login-section">
          <p className="login-text">
            Already have an account?{' '}
            <Link to="/login" className="login-link">
              Sign in
            </Link>
          </p>
        </div>
        
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
      </div>
    </div>
  )
}

export default Register
`;
      
      // Create Register.css file
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
    
    // Create Dashboard page
    let dashboardPage;
    if (tailwind) {
      dashboardPage = `import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const navigate = useNavigate()
  
  const handleLogout = () => {
    // In a real app, you would clear tokens/user data here
    console.log('User logged out')
    navigate('/')
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
          {/* Welcome Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Your Dashboard!</h2>
              <p className="text-gray-600">
                This is a protected dashboard page. Only authenticated users can see this content.
              </p>
            </div>
          </div>

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
                          New project created
                        </div>
                        <div className="text-sm text-gray-500">
                          "E-commerce Dashboard" project was created
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      2 hours ago
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
      dashboardPage = `import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Dashboard.css'

const Dashboard = () => {
  const navigate = useNavigate()
  
  const handleLogout = () => {
    // In a real app, you would clear tokens/user data here
    console.log('User logged out')
    navigate('/')
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
          {/* Welcome Section */}
          <div className="welcome-card">
            <div className="welcome-content">
              <h2 className="welcome-title">Welcome to Your Dashboard!</h2>
              <p className="welcome-text">
                This is a protected dashboard page. Only authenticated users can see this content.
              </p>
            </div>
          </div>

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
                          New project created
                        </div>
                        <div className="activity-description">
                          "E-commerce Dashboard" project was created
                        </div>
                      </div>
                    </div>
                    <div className="activity-time">
                      2 hours ago
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
      
      // Create Dashboard.css file
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
  padding: 1.25rem 1.5rem;
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
`;
    await fs.writeFile('src/styles/globals.css', globalsCss);
  }
}