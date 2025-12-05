import fs from 'fs-extra';

export async function generateExpress(config) {
  const { projectName, database = 'mongodb', easyMongoo = true, auth = true, logger = true } = config;
  
  // Create package.json
  const packageJson = {
    name: projectName,
    version: '1.0.0',
    type: 'module',
    scripts: {
      start: 'node server.js',
      dev: 'nodemon server.js'
    },
    dependencies: {
      express: '^4.18.0',
      cors: '^2.8.5',
      dotenv: '^16.0.0',
      helmet: '^7.0.0',
      morgan: '^1.10.0'
    },
    devDependencies: {
      nodemon: '^3.0.0'
    }
  };
  
  // Add database dependencies
  if (database === 'mongodb') {
    if (easyMongoo) {
      packageJson.dependencies['easy-mongoo'] = '^1.0.0';
    } else {
      packageJson.dependencies.mongoose = '^7.0.0';
    }
  }
  
  // Add auth dependencies
  if (auth) {
    packageJson.dependencies.bcrypt = '^5.0.0';
    packageJson.dependencies.jsonwebtoken = '^9.0.0';
    packageJson.dependencies['express-validator'] = '^7.0.0';
  }
  
  await fs.writeJson('package.json', packageJson, { spaces: 2 });
  
  // Create directory structure
  await fs.ensureDir('src/routes');
  await fs.ensureDir('src/controllers');
  await fs.ensureDir('src/middlewares');
  await fs.ensureDir('src/utils');
  await fs.ensureDir('src/models');
  
  // Create .env files
  const envExample = `PORT=5000
NODE_ENV=development
${database === 'mongodb' ? 'MONGODB_URI=mongodb://localhost:27017/' + projectName.replace(/\s+/g, '_').toLowerCase() : ''}
${auth ? 'JWT_SECRET=your_jwt_secret_key_change_this_in_production\nJWT_REFRESH_SECRET=your_refresh_secret_key_change_this_too' : ''}
`;
  
  await fs.writeFile('.env.example', envExample);
  await fs.writeFile('.env', envExample);
  
  // Create server.js
  let serverContent = `import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Database connection
${database === 'mongodb' ? `import { connectDatabase } from './src/config/database.js'\n` : ''}

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to ${projectName} API',
    version: '1.0.0',
    documentation: {
      zenuxs: 'https://zenuxs.in',
      easyMongoo: 'https://easy-mongoo.zenuxs.in',
      hmax: 'https://hmax.zenuxs.in'
    }
  })
})

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: '${projectName}'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

// Start server
${database === 'mongodb' ? `connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(\`🚀 Server running on port \${PORT}\`)
    console.log('📚 Zenuxs Docs: https://zenuxs.in')
    console.log('📦 Easy-Mongoo: https://easy-mongoo.zenuxs.in')
    console.log('🔒 HMAX Security: https://hmax.zenuxs.in')
  })
}).catch(err => {
  console.error('Failed to connect to database:', err)
  process.exit(1)
})` : `app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`)
  console.log('📚 Zenuxs Docs: https://zenuxs.in')
  console.log('📦 Easy-Mongoo: https://easy-mongoo.zenuxs.in')
  console.log('🔒 HMAX Security: https://hmax.zenuxs.in')
})`}
`;

  await fs.writeFile('server.js', serverContent);
  
  // Create database config if using MongoDB
  if (database === 'mongodb') {
    await fs.ensureDir('src/config');
    
    let dbConfig = '';
    if (easyMongoo) {
      dbConfig = `import mongoo from 'easy-mongoo'

export const connectDatabase = async () => {
  try {
    await mongoo.connect(process.env.MONGODB_URI, {
      debug: process.env.NODE_ENV === 'development'
    })
    
    console.log('✅ MongoDB connected using Easy-Mongoo')
    
    // Create User model
    mongoo.model('User', {
      username: 'string!!',
      email: 'email!!',
      password: 'password!',
      role: {
        type: 'string',
        enum: ['user', 'admin'],
        default: 'user'
      },
      refreshToken: 'string?',
      isActive: 'boolean+'
    })
    
    console.log('✅ User model created with Easy-Mongoo')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    throw error
  }
}

export { mongoo }
`;
    } else {
      dbConfig = `import mongoose from 'mongoose'

export const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ MongoDB connected')
    
    // Create User schema
    const userSchema = new mongoose.Schema({
      username: {
        type: String,
        required: true,
        unique: true,
        trim: true
      },
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
      },
      password: {
        type: String,
        required: true,
        minlength: 6
      },
      role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
      },
      refreshToken: String,
      isActive: {
        type: Boolean,
        default: true
      }
    }, {
      timestamps: true
    })
    
    mongoose.model('User', userSchema)
    console.log('✅ User model created')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    throw error
  }
}

export default mongoose
`;
    }
    
    await fs.writeFile('src/config/database.js', dbConfig);
  }
  
  // Create auth files if needed
  if (auth) {
    // Auth middleware
    const authMiddleware = `import jwt from 'jsonwebtoken'

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' })
    }
    
    req.userId = decoded.userId
    next()
  })
}

export const authorizeRole = (...roles) => {
  return async (req, res, next) => {
    try {
      const User = (await import('../models/User.js')).default
      const user = await User.findById(req.userId)
      
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' })
      }
      
      next()
    } catch (error) {
      console.error('Authorization error:', error)
      res.status(500).json({ error: 'Authorization failed' })
    }
  }
}
`;
    
    await fs.writeFile('src/middlewares/auth.middleware.js', authMiddleware);
    
    // Auth routes
    const authRoutes = `import { Router } from 'express'
import { authenticateToken } from '../middlewares/auth.middleware.js'

const router = Router()

router.post('/register', (req, res) => {
  res.json({ message: 'Register endpoint' })
})

router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint' })
})

router.post('/refresh-token', (req, res) => {
  res.json({ message: 'Refresh token endpoint' })
})

router.post('/logout', (req, res) => {
  res.json({ message: 'Logout endpoint' })
})

router.get('/profile', authenticateToken, (req, res) => {
  res.json({ 
    message: 'Protected profile endpoint',
    userId: req.userId 
  })
})

export default router
`;
    
    await fs.writeFile('src/routes/auth.routes.js', authRoutes);
    
    // Update server.js to include auth routes
    let server = await fs.readFile('server.js', 'utf8');
    server = server.replace(
      '// Routes',
      `// Routes
import authRoutes from './src/routes/auth.routes.js'

app.use('/api/auth', authRoutes)`
    );
    await fs.writeFile('server.js', server);
  }
}