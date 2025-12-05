import fs from 'fs-extra';

export async function autoConnect(config) {
  const { projectName } = config;
  
  // Create API utility in frontend
  const apiUtil = `import axios from 'axios'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config
    
    // Handle 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const response = await axios.post(\`\${API_BASE_URL}/auth/refresh-token\`, {
          refreshToken
        })
        
        const { accessToken, refreshToken: newRefreshToken } = response.data.tokens
        
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', newRefreshToken)
        
        originalRequest.headers.Authorization = \`Bearer \${accessToken}\`
        return api(originalRequest)
      } catch (refreshError) {
        // Clear tokens and redirect to login
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  getProfile: () => api.get('/auth/profile')
}

export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(\`/users/\${id}\`),
  update: (id, data) => api.put(\`/users/\${id}\`, data),
  delete: (id) => api.delete(\`/users/\${id}\`)
}

export default api
`;
  
  // Write to frontend
  await fs.writeFile('frontend/src/utils/api.js', apiUtil);
  
  // Update frontend .env
  const frontendEnv = `VITE_API_URL=http://localhost:5000/api
`;
  await fs.writeFile('frontend/.env', frontendEnv);
  
  // Update backend CORS settings
  const backendServerPath = 'backend/server.js';
  if (await fs.pathExists(backendServerPath)) {
    let backendServer = await fs.readFile(backendServerPath, 'utf8');
    backendServer = backendServer.replace(
      "app.use(cors())",
      "app.use(cors({\n  origin: 'http://localhost:3000',\n  credentials: true\n}))"
    );
    await fs.writeFile(backendServerPath, backendServer);
  }
  
  // Create deployment guide
  const deploymentGuide = `# Deployment Guide - ${projectName}

## 📋 Prerequisites

- Node.js 16+ installed
- ${config.database === 'mongodb' ? 'MongoDB database' : config.database === 'mysql' ? 'MySQL database' : 'PostgreSQL database'}
- Git installed
- PM2 (for production)

## 🚀 Deployment Steps

### 1. Frontend Deployment

\`\`\`bash
cd frontend
npm run build
\`\`\`

### 2. Backend Deployment

\`\`\`bash
cd backend
npm install --production
npm start
\`\`\`

### 3. Environment Variables

#### Frontend (.env.production)
\`\`\`
VITE_API_URL=https://your-domain.com/api
\`\`\`

#### Backend (.env.production)
\`\`\`
NODE_ENV=production
PORT=5000
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
\`\`\`

### 4. Using PM2 (Recommended)

\`\`\`bash
# Install PM2 globally
npm install -g pm2

# Start backend with PM2
cd backend
pm2 start server.js --name "${projectName}-backend"

# Start frontend (if using Next.js)
cd frontend
pm2 start "npm start" --name "${projectName}-frontend"
\`\`\`

### 5. Nginx Configuration

\`\`\`nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Frontend
    location / {
        root /path/to/frontend/dist;
        try_files \$uri \$uri/ /index.html;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
\`\`\`

## 🔧 Monitoring

\`\`\`bash
# View logs
pm2 logs ${projectName}-backend
pm2 logs ${projectName}-frontend

# Monitor resources
pm2 monit

# Save PM2 process list
pm2 save
pm2 startup
\`\`\`

## 📞 Support

- **Zenuxs Docs**: https://zenuxs.in
- **Easy-Mongoo**: https://easy-mongoo.zenuxs.in
- **HMAX Security**: https://hmax.zenuxs.in
- **GitHub Issues**: https://github.com/zenuxs/create-zenuxs-app/issues
`;
  
  await fs.writeFile('DEPLOYMENT.md', deploymentGuide);
}