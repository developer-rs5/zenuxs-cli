import fs from 'fs-extra';

export async function generateFastify(config) {
  const { projectName } = config;
  
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
      fastify: '^4.0.0',
      '@fastify/cors': '^8.0.0',
      '@fastify/helmet': '^10.0.0'
    },
    devDependencies: {
      nodemon: '^3.0.0'
    }
  };
  
  await fs.writeJson('package.json', packageJson, { spaces: 2 });
  
  // Create server.js
  const serverContent = `import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'

const fastify = Fastify({
  logger: true
})

// Register plugins
await fastify.register(cors, {
  origin: '*'
})
await fastify.register(helmet)

// Routes
fastify.get('/', async () => {
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

fastify.get('/health', async () => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: '${projectName}'
  }
})

// Start server
try {
  await fastify.listen({ port: 5000, host: '0.0.0.0' })
  console.log('🚀 Server running on port 5000')
  console.log('📚 Zenuxs Docs: https://zenuxs.in')
  console.log('📦 Easy-Mongoo: https://easy-mongoo.zenuxs.in')
  console.log('🔒 HMAX Security: https://hmax.zenuxs.in')
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
`;

  await fs.writeFile('server.js', serverContent);
}