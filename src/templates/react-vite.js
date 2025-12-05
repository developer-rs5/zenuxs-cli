import fs from 'fs-extra';

export async function generateReactVite(config) {
  const { projectName, typescript = true, tailwind = true, authUI = false } = config;
  const ext = typescript ? 'tsx' : 'jsx';
  const configExt = typescript ? 'ts' : 'js';
  
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