import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function generate(config) {
  const { projectName, database, auth } = config;
  
  // Package.json
  const packageJson = {
    name: projectName,
    version: '1.0.0',
    type: 'module',
    scripts: {
      start: 'node server.js',
      dev: 'nodemon server.js'
    },
    dependencies: {
      fastify: '^4.0.0',
      '@fastify/cors': '^8.0.0',
      '@fastify/helmet': '^10.0.0',
      '@fastify/env': '^4.0.0',
      '@fastify/compress': '^6.0.0'
    }
  };
  
  if (database === 'mongodb') {
    packageJson.dependencies['@fastify/mongodb'] = '^7.0.0';
  }
  
  if (auth) {
    packageJson.dependencies['@fastify/jwt'] = '^7.0.0';
    packageJson.dependencies.bcrypt = '^5.0.0';
  }
  
  await fs.writeJson('package.json', packageJson, { spaces: 2 });
  
  // Server.js
  const serverContent = `import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import compress from '@fastify/compress'
import env from '@fastify/env'

const fastify = Fastify({
  logger: true
})

// Environment schema
const schema = {
  type: 'object',
  required: ['PORT'],
  properties: {
    PORT: {
      type: 'string',
      default: '5000'
    },
    NODE_ENV: {
      type: 'string',
      default: 'development'
    }
  }
}

// Register plugins
await fastify.register(env, { schema, dotenv: true })
await fastify.register(cors, { origin: '*' })
await fastify.register(helmet)
await fastify.register(compress)

// Health check
fastify.get('/health', async () => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: '${projectName}',
    environment: fastify.config.NODE_ENV
  }
})

// Welcome route
fastify.get('/welcome', async () => {
  return {
    message: 'Welcome to ${projectName} API',
    version: '1.0.0',
    documentation: {
      zenuxs: 'https://zenuxs.in',
      easyMongoo: 'https://easy-mongoo.zenuxs.in',
      hmax: 'https://hmax.zenuxs.in'
    }
  }
})

// Start server
try {
  await fastify.listen({ 
    port: fastify.config.PORT,
    host: '0.0.0.0'
  })
  console.log(\`🚀 Server running on port \${fastify.config.PORT}\`)
  console.log('📚 Zenuxs Docs: https://zenuxs.in')
  console.log('📦 Easy-Mongoo: https://easy-mongoo.zenuxs.in')
  console.log('🔒 HMAX Security: https://hmax.zenuxs.in')
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
`;

  await fs.writeFile('server.js', serverContent);
  
  // Environment files
  const envContent = `PORT=5000
NODE_ENV=development
`;
  
  await fs.writeFile('.env', envContent);
  await fs.writeFile('.env.example', envContent);
}