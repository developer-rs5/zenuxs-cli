import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function generate(config) {
  const { projectName, typescript, tailwind, authUI } = config;
  const ext = typescript ? 'tsx' : 'jsx';
  const configExt = typescript ? 'ts' : 'js';
  
  // Package.json
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
      '@types/react': '^18.2.0',
      '@types/react-dom': '^18.2.0',
      'eslint': '^8.45.0',
      'eslint-plugin-react': '^7.32.2',
      'eslint-plugin-react-hooks': '^4.6.0',
      'eslint-plugin-react-refresh': '^0.4.3'
    }
  };
  
  if (typescript) {
    packageJson.devDependencies.typescript = '^5.0.0';
  }
  
  if (tailwind) {
    packageJson.devDependencies.tailwindcss = '^3.3.0';
    packageJson.devDependencies.autoprefixer = '^10.4.0';
    packageJson.devDependencies.postcss = '^8.4.0';
  }
  
  await fs.writeJson('package.json', packageJson, { spaces: 2 });
  
  // Vite config
  const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
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
  
  // TS Config
  if (typescript) {
    const tsConfig = `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
`;
    await fs.writeFile('tsconfig.json', tsConfig);
    
    const tsConfigNode = `{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
`;
    await fs.writeFile('tsconfig.node.json', tsConfigNode);
  }
  
  // Directory structure
  await fs.ensureDir('src/components');
  await fs.ensureDir('src/pages');
  await fs.ensureDir('src/styles');
  await fs.ensureDir('src/utils');
  await fs.ensureDir('src/hooks');
  await fs.ensureDir('src/layouts');
  await fs.ensureDir('public');
  
  // Index.html
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
    ${
      tailwind 
        ? '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">'
        : ''
    }
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.${configExt}"></script>
  </body>
</html>
`;
  await fs.writeFile('index.html', indexHtml);
  
  // Main entry
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
  
  // App component
  const appContent = `import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './layouts/MainLayout.${ext}'
import Home from './pages/Home.${ext}'
import ZenuxsPage from './pages/ZenuxsPage.${ext}'
${authUI ? `
import Login from './pages/auth/Login.${ext}'
import Register from './pages/auth/Register.${ext}'
import Dashboard from './pages/auth/Dashboard.${ext}'` : ''}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/zenuxs" element={<ZenuxsPage />} />
          ${authUI ? `
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />` : ''}
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
`;
  await fs.writeFile(`src/App.${ext}`, appContent);
  
  // Layout
  const layoutContent = `import React from 'react'
import Navbar from '../components/Navbar.${ext}'
import Footer from '../components/Footer.${ext}'

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
`;
  await fs.writeFile(`src/layouts/MainLayout.${ext}`, layoutContent);
  
  // Home page
  const homePage = `import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to ${projectName}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            A modern React application built with Vite
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Link
              to="/zenuxs"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Visit Zenuxs Page
            </Link>
            ${authUI ? `
            <Link
              to="/login"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Register
            </Link>` : ''}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Zenuxs Accounts</h3>
              <p className="text-gray-600 mb-4">Manage your Zenuxs account and services</p>
              <a href="https://zenuxs.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                zenuxs.in →
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Easy-Mongoo</h3>
              <p className="text-gray-600 mb-4">Ultra-simple MongoDB wrapper with all Mongoose features</p>
              <a href="https://easy-mongoo.zenuxs.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                easy-mongoo.zenuxs.in →
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">HMAX Security</h3>
              <p className="text-gray-600 mb-4">Advanced security for your applications</p>
              <a href="https://hmax.zenuxs.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                hmax.zenuxs.in →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
`;
  await fs.writeFile(`src/pages/Home.${ext}`, homePage);
  
  // Zenuxs page
  const zenuxsPage = `import React from 'react'

const ZenuxsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🚀 Project created using Zenuxs CLI
            </h1>
            <p className="text-gray-600 text-lg">
              Your application is ready to go! Here are some useful resources:
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">📚 Documentation</h3>
              <ul className="space-y-2">
                <li>
                  <a href="https://zenuxs.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    • Zenuxs Accounts: https://zenuxs.in
                  </a>
                </li>
                <li>
                  <a href="https://easy-mongoo.zenuxs.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    • Easy-Mongoo Docs: https://easy-mongoo.zenuxs.in
                  </a>
                </li>
                <li>
                  <a href="https://hmax.zenuxs.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    • HMAX Security: https://hmax.zenuxs.in
                  </a>
                </li>
              </ul>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">⚡ Quick Start</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <code className="text-sm text-gray-800 font-mono">
                  npm run dev
                </code>
              </div>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">✨ Features</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  React ${typescript ? 'TypeScript' : 'JavaScript'}
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Vite for fast development
                </li>
                ${tailwind ? `<li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Tailwind CSS for styling
                </li>` : ''}
                ${authUI ? `<li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Authentication UI pages
                </li>` : ''}
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  React Router for navigation
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-10 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-500">
              Built with ❤️ by <a href="https://zenuxs.in" className="text-blue-600 hover:underline">Zenuxs Team</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ZenuxsPage
`;
  await fs.writeFile(`src/pages/ZenuxsPage.${ext}`, zenuxsPage);
  
  // Styles
  if (tailwind) {
    const globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  line-height: 1.5;
  font-weight: 400;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
`;
    await fs.writeFile('src/styles/globals.css', globalsCss);
    
    // Tailwind config
    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
`;
    await fs.writeFile('tailwind.config.js', tailwindConfig);
    
    // PostCSS config
    const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;
    await fs.writeFile('postcss.config.js', postcssConfig);
  } else {
    const basicCss = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}
`;
    await fs.writeFile('src/styles/globals.css', basicCss);
  }
  
  // Create auth pages if requested
  if (authUI) {
    await fs.ensureDir('src/pages/auth');
    
    // Login page
    const loginPage = `import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      console.log('Login attempt:', { email, password })
      setLoading(false)
      // Navigate to dashboard on success
      navigate('/dashboard')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-gray-600">
            Sign in to your account
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <a
                  href="https://zenuxs.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Zenuxs</span>
                  Zenuxs Account
                </a>
              </div>
              <div>
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Google</span>
                  Google
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
`;
    await fs.writeFile(`src/pages/auth/Login.${ext}`, loginPage);
    
    // Register page (simplified)
    const registerPage = `import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      console.log('Register attempt:', formData)
      setLoading(false)
      navigate('/login')
    }, 1000)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-gray-600">
            Join our community today
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
`;
    await fs.writeFile(`src/pages/auth/Register.${ext}`, registerPage);
    
    // Dashboard page
    const dashboardPage = `import React from 'react'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <Link to="/zenuxs" className="text-gray-600 hover:text-gray-900">
                Zenuxs
              </Link>
              <button className="text-gray-600 hover:text-gray-900">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="px-4 py-8 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Welcome to your Dashboard!
                </h3>
                <p className="text-gray-600 mb-6">
                  This is a protected area. Only authenticated users can see this page.
                </p>
                <div className="space-x-4">
                  <Link
                    to="/zenuxs"
                    className="inline-block px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700"
                  >
                    Visit Zenuxs Page
                  </Link>
                  <Link
                    to="/"
                    className="inline-block px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700"
                  >
                    Go Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
`;
    await fs.writeFile(`src/pages/auth/Dashboard.${ext}`, dashboardPage);
  }
  
  // Create basic components
  const navbarComponent = `import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-800">
              ${config.projectName}
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link to="/zenuxs" className="text-gray-600 hover:text-gray-900">
              Zenuxs
            </Link>
            ${authUI ? `
            <Link to="/login" className="text-gray-600 hover:text-gray-900">
              Login
            </Link>
            <Link to="/register" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Register
            </Link>` : ''}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
`;
  await fs.writeFile(`src/components/Navbar.${ext}`, navbarComponent);
  
  const footerComponent = `import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold">${config.projectName}</h3>
            <p className="text-gray-400 mt-2">
              Built with Zenuxs CLI
            </p>
          </div>
          <div className="flex space-x-6">
            <a href="https://zenuxs.in" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
              Zenuxs
            </a>
            <a href="https://easy-mongoo.zenuxs.in" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
              Easy-Mongoo
            </a>
            <a href="https://hmax.zenuxs.in" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
              HMAX
            </a>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; ${new Date().getFullYear()} ${config.projectName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
`;
  await fs.writeFile(`src/components/Footer.${ext}`, footerComponent);
}