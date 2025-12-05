import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function generate(config) {
  const { projectName, database, easyMongoo, auth, logger, rateLimiter, swagger } = config;
  
  // Package.json
  const packageJson = {
    name: projectName,
    version: '1.0.0',
    type: 'module',
    scripts: {
      start: 'node server.js',
      dev: 'nodemon server.js',
      test: 'jest'
    },
    dependencies: {
      express: '^4.18.0',
      cors: '^2.8.5',
      dotenv: '^16.0.0',
      helmet: '^7.0.0',
      compression: '^1.7.0',
      morgan: '^1.10.0'
    },
    devDependencies: {
      nodemon: '^3.0.0',
      jest: '^29.0.0',
      supertest: '^6.3.0'
    }
  };
  
  // Database dependencies
  if (database === 'mongodb') {
    if (easyMongoo) {
      packageJson.dependencies['easy-mongoo'] = '^1.0.0';
    } else {
      packageJson.dependencies.mongoose = '^7.0.0';
    }
  } else if (database === 'mysql') {
    packageJson.dependencies.mysql2 = '^3.0.0';
    packageJson.dependencies.sequelize = '^6.0.0';
  } else if (database === 'postgres') {
    packageJson.dependencies.pg = '^8.0.0';
    packageJson.dependencies['pg-hstore'] = '^2.3.0';
    packageJson.dependencies.sequelize = '^6.0.0';
  }
  
  // Auth dependencies
  if (auth) {
    packageJson.dependencies.bcrypt = '^5.0.0';
    packageJson.dependencies.jsonwebtoken = '^9.0.0';
    packageJson.dependencies['express-validator'] = '^7.0.0';
  }
  
  // Logger
  if (logger) {
    packageJson.dependencies.winston = '^3.0.0';
  }
  
  // Rate limiter
  if (rateLimiter) {
    packageJson.dependencies['express-rate-limit'] = '^6.0.0';
  }
  
  // Swagger
  if (swagger) {
    packageJson.dependencies.swagger = '^0.7.5';
    packageJson.dependencies['swagger-ui-express'] = '^5.0.0';
    packageJson.dependencies['swagger-jsdoc'] = '^6.0.0';
  }
  
  await fs.writeJson('package.json', packageJson, { spaces: 2 });
  
  // Create directory structure
  await fs.ensureDir('src/routes');
  await fs.ensureDir('src/controllers');
  await fs.ensureDir('src/models');
  await fs.ensureDir('src/middlewares');
  await fs.ensureDir('src/utils');
  await fs.ensureDir('src/services');
  await fs.ensureDir('src/validators');
  await fs.ensureDir('config');
  await fs.ensureDir('tests');
  
  // Server.js
  await generateServer(config);
  
  // Environment files
  await generateEnvFiles(config);
  
  // Database configuration
  await generateDatabaseConfig(config);
  
  // Auth setup if needed
  if (auth) {
    await generateAuthSetup(config);
  }
  
  // Example routes
  await generateExampleRoutes(config);
  
  // Middlewares
  await generateMiddlewares(config);
  
  // Utils
  await generateUtils(config);
}

async function generateServer(config) {
  const { projectName, database, logger, rateLimiter, swagger } = config;
  
  let serverContent = `import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import dotenv from 'dotenv'
${logger ? "import logger from './src/utils/logger.js'" : ''}
${rateLimiter ? "import rateLimiter from './src/middlewares/rateLimiter.js'" : ''}
${swagger ? "import swaggerSetup from './src/config/swagger.js'" : ''}
${database === 'mongodb' ? "import { connectDatabase } from './src/config/database.js'" : ''}

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet())
app.use(cors())
app.use(compression())
app.use(morgan('combined'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
${rateLimiter ? 'app.use(rateLimiter)' : ''}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: '${projectName}',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  })
})

// Welcome endpoint
app.get('/welcome', (req, res) => {
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

${swagger ? '// API Documentation\napp.use(\'/api-docs\', swaggerSetup)' : ''}

// Import routes
import authRoutes from './src/routes/auth.routes.js'
import userRoutes from './src/routes/user.routes.js'
import exampleRoutes from './src/routes/example.routes.js'

// Use routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/examples', exampleRoutes)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  })
})

// Global error handler
app.use((err, req, res, next) => {
  ${logger ? 'logger.error(err.stack)' : 'console.error(err.stack)'}
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// Database connection and server start
const startServer = async () => {
  try {
    ${database === 'mongodb' ? 'await connectDatabase()' : ''}
    
    app.listen(PORT, () => {
      console.log(\`🚀 Server running on port \${PORT}\`)
      console.log(\`📝 Environment: \${process.env.NODE_ENV}\`)
      console.log('🔗 Useful links:')
      console.log('   📚 Zenuxs Accounts: https://zenuxs.in')
      console.log('   📦 Easy-Mongoo: https://easy-mongoo.zenuxs.in')
      console.log('   🔒 HMAX Security: https://hmax.zenuxs.in')
      ${swagger ? "console.log(`   📄 API Docs: http://localhost:${PORT}/api-docs`)" : ''}
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

export default app
`;

  await fs.writeFile('server.js', serverContent);
}

async function generateEnvFiles(config) {
  const { database } = config;
  
  const envExample = `# Server
PORT=5000
NODE_ENV=development

# Database
${database === 'mongodb' ? 'MONGODB_URI=mongodb://localhost:27017/zenuxs_db' : ''}
${database === 'mysql' ? 'MYSQL_HOST=localhost\nMYSQL_PORT=3306\nMYSQL_DATABASE=zenuxs_db\nMYSQL_USER=root\nMYSQL_PASSWORD=' : ''}
${database === 'postgres' ? 'POSTGRES_HOST=localhost\nPOSTGRES_PORT=5432\nPOSTGRES_DATABASE=zenuxs_db\nPOSTGRES_USER=postgres\nPOSTGRES_PASSWORD=' : ''}

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_too
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_SALT_ROUNDS=12
CORS_ORIGIN=http://localhost:3000

# Rate limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
`;

  await fs.writeFile('.env.example', envExample);
  await fs.writeFile('.env', envExample);
}

async function generateDatabaseConfig(config) {
  const { database, easyMongoo } = config;
  
  if (database === 'mongodb') {
    if (easyMongoo) {
      const dbConfig = `import mongoo from 'easy-mongoo'

export const connectDatabase = async () => {
  try {
    await mongoo.connect(process.env.MONGODB_URI, {
      debug: process.env.NODE_ENV === 'development'
    })
    
    console.log('✅ MongoDB connected using Easy-Mongoo')
    console.log('📊 Database:', mongoo.status().database)
    
    // Create User model with Easy-Mongoo
    mongoo.model('User', {
      username: 'string!!',
      email: 'email!!',
      password: 'password!',
      role: {
        type: 'string',
        enum: ['user', 'admin', 'moderator'],
        default: 'user'
      },
      profile: {
        firstName: 'string?',
        lastName: 'string?',
        avatar: 'string?',
        bio: 'string?'
      },
      isActive: 'boolean+',
      isVerified: 'boolean+',
      refreshToken: 'string?',
      lastLogin: 'date?'
    })
    
    // Add virtuals
    mongoo.virtual('User', 'fullName', function() {
      return \`\${this.profile?.firstName || ''} \${this.profile?.lastName || ''}\`.trim()
    })
    
    // Add instance methods
    mongoo.method('User', 'toJSON', function() {
      const obj = this.toObject()
      delete obj.password
      delete obj.refreshToken
      return obj
    })
    
    console.log('✅ User model created with auto-features')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    throw error
  }
}

export { mongoo }
`;
      await fs.writeFile('src/config/database.js', dbConfig);
    } else {
      const dbConfig = `import mongoose from 'mongoose'

export const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ MongoDB connected successfully')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    throw error
  }
}

export default mongoose
`;
      await fs.writeFile('src/config/database.js', dbConfig);
    }
  }
}

async function generateAuthSetup(config) {
  const { database } = config;
  
  // Auth controller
  const authController = `import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { validationResult } from 'express-validator'
${database === 'mongodb' ? "import User from '../models/User.js'" : ''}

// Generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  )
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  )
  
  return { accessToken, refreshToken }
}

// Auth controller
export const authController = {
  register: async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      
      const { username, email, password } = req.body
      
      // Check if user exists
      const existingUser = await User.findOne({ 
        $or: [{ email }, { username }] 
      })
      
      if (existingUser) {
        return res.status(400).json({ 
          error: 'User with this email or username already exists' 
        })
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(
        password, 
        parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12
      )
      
      // Create user
      const user = await User.create({
        username,
        email,
        password: hashedPassword
      })
      
      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user._id)
      
      // Save refresh token
      user.refreshToken = refreshToken
      await user.save()
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
          },
          tokens: {
            accessToken,
            refreshToken
          }
        }
      })
    } catch (error) {
      console.error('Registration error:', error)
      res.status(500).json({ 
        error: 'Registration failed',
        message: error.message 
      })
    }
  },
  
  login: async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      
      const { email, password } = req.body
      
      // Find user
      const user = await User.findOne({ email })
      if (!user) {
        return res.status(401).json({ 
          error: 'Invalid credentials' 
        })
      }
      
      // Check password
      const validPassword = await bcrypt.compare(password, user.password)
      if (!validPassword) {
        return res.status(401).json({ 
          error: 'Invalid credentials' 
        })
      }
      
      // Update last login
      user.lastLogin = new Date()
      await user.save()
      
      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user._id)
      
      // Save refresh token
      user.refreshToken = refreshToken
      await user.save()
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            fullName: user.fullName
          },
          tokens: {
            accessToken,
            refreshToken
          }
        }
      })
    } catch (error) {
      console.error('Login error:', error)
      res.status(500).json({ 
        error: 'Login failed',
        message: error.message 
      })
    }
  },
  
  refreshToken: async (req, res) => {
    try {
      const { refreshToken } = req.body
      
      if (!refreshToken) {
        return res.status(400).json({ 
          error: 'Refresh token is required' 
        })
      }
      
      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken, 
        process.env.JWT_REFRESH_SECRET
      )
      
      // Find user with refresh token
      const user = await User.findOne({
        _id: decoded.userId,
        refreshToken
      })
      
      if (!user) {
        return res.status(401).json({ 
          error: 'Invalid refresh token' 
        })
      }
      
      // Generate new tokens
      const tokens = generateTokens(user._id)
      
      // Update refresh token
      user.refreshToken = tokens.refreshToken
      await user.save()
      
      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          tokens
        }
      })
    } catch (error) {
      console.error('Refresh token error:', error)
      res.status(401).json({ 
        error: 'Invalid refresh token',
        message: error.message 
      })
    }
  },
  
  logout: async (req, res) => {
    try {
      const { refreshToken } = req.body
      
      if (refreshToken) {
        // Clear refresh token from database
        await User.findOneAndUpdate(
          { refreshToken },
          { $unset: { refreshToken: 1 } }
        )
      }
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      })
    } catch (error) {
      console.error('Logout error:', error)
      res.status(500).json({ 
        error: 'Logout failed',
        message: error.message 
      })
    }
  },
  
  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.userId)
        .select('-password -refreshToken')
      
      if (!user) {
        return res.status(404).json({ 
          error: 'User not found' 
        })
      }
      
      res.json({
        success: true,
        data: {
          user
        }
      })
    } catch (error) {
      console.error('Get profile error:', error)
      res.status(500).json({ 
        error: 'Failed to get profile',
        message: error.message 
      })
    }
  }
}

export default authController
`;
  
  await fs.writeFile('src/controllers/auth.controller.js', authController);
  
  // Auth validators
  const authValidators = `import { body } from 'express-validator'

export const registerValidator = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/\\d/)
    .withMessage('Password must contain at least one number')
]

export const loginValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
]

export const refreshTokenValidator = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
]
`;
  
  await fs.writeFile('src/validators/auth.validators.js', authValidators);
  
  // Auth middleware
  const authMiddleware = `import jwt from 'jsonwebtoken'

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required' 
    })
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ 
        error: 'Invalid or expired token',
        message: err.message 
      })
    }
    
    req.userId = decoded.userId
    next()
  })
}

export const authorizeRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const User = (await import('../models/User.js')).default
      const user = await User.findById(req.userId)
      
      if (!user || !allowedRoles.includes(user.role)) {
        return res.status(403).json({ 
          error: 'Insufficient permissions' 
        })
      }
      
      req.user = user
      next()
    } catch (error) {
      console.error('Authorization error:', error)
      res.status(500).json({ 
        error: 'Authorization failed',
        message: error.message 
      })
    }
  }
}

export default { authenticateToken, authorizeRole }
`;
  
  await fs.writeFile('src/middlewares/auth.middleware.js', authMiddleware);
  
  // Auth routes
  const authRoutes = `import { Router } from 'express'
import authController from '../controllers/auth.controller.js'
import { 
  registerValidator, 
  loginValidator, 
  refreshTokenValidator 
} from '../validators/auth.validators.js'
import { 
  authenticateToken, 
  authorizeRole 
} from '../middlewares/auth.middleware.js'

const router = Router()

// Public routes
router.post('/register', registerValidator, authController.register)
router.post('/login', loginValidator, authController.login)
router.post('/refresh-token', refreshTokenValidator, authController.refreshToken)
router.post('/logout', authController.logout)

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile)
router.get('/admin', authenticateToken, authorizeRole('admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Admin access granted',
    data: {
      user: req.user
    }
  })
})

export default router
`;
  
  await fs.writeFile('src/routes/auth.routes.js', authRoutes);
}

async function generateExampleRoutes(config) {
  const exampleController = `export const exampleController = {
  getAll: async (req, res) => {
    try {
      res.json({
        success: true,
        message: 'Examples retrieved successfully',
        data: {
          examples: [
            { id: 1, name: 'Example 1' },
            { id: 2, name: 'Example 2' },
            { id: 3, name: 'Example 3' }
          ]
        }
      })
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to retrieve examples',
        message: error.message 
      })
    }
  },
  
  getById: async (req, res) => {
    try {
      const { id } = req.params
      res.json({
        success: true,
        message: 'Example retrieved successfully',
        data: {
          example: { id, name: \`Example \${id}\` }
        }
      })
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to retrieve example',
        message: error.message 
      })
    }
  },
  
  create: async (req, res) => {
    try {
      const example = req.body
      res.status(201).json({
        success: true,
        message: 'Example created successfully',
        data: {
          example: { id: Date.now(), ...example }
        }
      })
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to create example',
        message: error.message 
      })
    }
  },
  
  update: async (req, res) => {
    try {
      const { id } = req.params
      const updates = req.body
      res.json({
        success: true,
        message: 'Example updated successfully',
        data: {
          example: { id, ...updates }
        }
      })
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to update example',
        message: error.message 
      })
    }
  },
  
  delete: async (req, res) => {
    try {
      const { id } = req.params
      res.json({
        success: true,
        message: 'Example deleted successfully'
      })
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to delete example',
        message: error.message 
      })
    }
  }
}

export default exampleController
`;
  
  await fs.writeFile('src/controllers/example.controller.js', exampleController);
  
  const exampleRoutes = `import { Router } from 'express'
import exampleController from '../controllers/example.controller.js'
import { authenticateToken } from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/', exampleController.getAll)
router.get('/:id', exampleController.getById)
router.post('/', authenticateToken, exampleController.create)
router.put('/:id', authenticateToken, exampleController.update)
router.delete('/:id', authenticateToken, exampleController.delete)

export default router
`;
  
  await fs.writeFile('src/routes/example.routes.js', exampleRoutes);
}

async function generateMiddlewares(config) {
  const { rateLimiter } = config;
  
  if (rateLimiter) {
    const rateLimiterMiddleware = `import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => {
    return req.ip // Use IP address as key
  },
  handler: (req, res, next, options) => {
    res.status(429).json(options.message)
  }
})

export default limiter
`;
    
    await fs.writeFile('src/middlewares/rateLimiter.js', rateLimiterMiddleware);
  }
  
  // Error handler middleware
  const errorHandler = `export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'
  
  // Log error
  console.error(\`[\${new Date().toISOString()}] \${req.method} \${req.originalUrl}\`)
  console.error(\`Error: \${message}\`)
  console.error(\`Stack: \${err.stack}\`)
  
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  })
}

export const notFoundHandler = (req, res, next) => {
  const error = new Error(\`Route not found: \${req.originalUrl}\`)
  error.statusCode = 404
  next(error)
}

export default { errorHandler, notFoundHandler }
`;
  
  await fs.writeFile('src/middlewares/errorHandler.js', errorHandler);
}

async function generateUtils(config) {
  const { logger } = config;
  
  if (logger) {
    const loggerUtil = `import winston from 'winston'
import path from 'path'

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
)

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: '${config.projectName}' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // File transport for errors
    new winston.transports.File({ 
      filename: path.join('logs', 'error.log'), 
      level: 'error' 
    }),
    // File transport for all logs
    new winston.transports.File({ 
      filename: path.join('logs', 'combined.log') 
    })
  ]
})

// Create logs directory
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

if (!fs.existsSync(path.join(__dirname, '..', '..', 'logs'))) {
  fs.mkdirSync(path.join(__dirname, '..', '..', 'logs'))
}

export default logger
`;
    
    await fs.ensureDir('logs');
    await fs.writeFile('src/utils/logger.js', loggerUtil);
  }
  
  // Response utility
  const responseUtil = `export class ApiResponse {
  constructor(success, message, data = null) {
    this.success = success
    this.message = message
    this.data = data
    this.timestamp = new Date().toISOString()
  }
  
  static success(message, data = null) {
    return new ApiResponse(true, message, data)
  }
  
  static error(message, data = null) {
    return new ApiResponse(false, message, data)
  }
}

export class ApiError extends Error {
  constructor(message, statusCode = 500) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
  
  static badRequest(message = 'Bad Request') {
    return new ApiError(message, 400)
  }
  
  static unauthorized(message = 'Unauthorized') {
    return new ApiError(message, 401)
  }
  
  static forbidden(message = 'Forbidden') {
    return new ApiError(message, 403)
  }
  
  static notFound(message = 'Not Found') {
    return new ApiError(message, 404)
  }
  
  static internal(message = 'Internal Server Error') {
    return new ApiError(message, 500)
  }
}
`;
  
  await fs.writeFile('src/utils/apiResponse.js', responseUtil);
  
  // Validation utility
  const validationUtil = `import { validationResult } from 'express-validator'

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    })
  }
  next()
}

export const validateObjectId = (value) => {
  return /^[0-9a-fA-F]{24}$/.test(value)
}
`;
  
  await fs.writeFile('src/utils/validation.js', validationUtil);
}