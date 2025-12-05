import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { execa } from 'execa';
import chalk from 'chalk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function generateProject(config) {
  const { projectName, projectType } = config;
  
  // Create project directory
  await fs.ensureDir(projectName);
  
  // Store original directory
  const originalDir = process.cwd();
  
  try {
    process.chdir(projectName);
    
    // Generate based on project type
    switch (projectType) {
      case 'frontend':
        await generateFrontend(config);
        break;
      case 'backend':
        await generateBackend(config);
        break;
      case 'fullstack':
        await generateFullStack(config);
        break;
    }
    
    // Create README
    await createReadme(config);
  } finally {
    // Return to original directory
    process.chdir(originalDir);
  }
}

async function generateFrontend(config) {
  const { framework } = config;
  
  if (framework === 'react') {
    // Import and use React template
    const { generateReactVite } = await import('./templates/react-vite.js');
    await generateReactVite(config);
  } else if (framework === 'next') {
    // Import and use Next.js template
    const { generateNextJS } = await import('./templates/nextjs.js');
    await generateNextJS(config);
  }
}

async function generateBackend(config) {
  const { framework } = config;
  
  if (framework === 'express') {
    const { generateExpress } = await import('./templates/express.js');
    await generateExpress(config);
  } else if (framework === 'fastify') {
    const { generateFastify } = await import('./templates/fastify.js');
    await generateFastify(config);
  }
}

async function generateFullStack(config) {
  const { projectName } = config;
  
  // Create frontend
  await fs.ensureDir('frontend');
  process.chdir('frontend');
  
  const frontendConfig = { 
    ...config, 
    projectName: `${projectName}-frontend`,
    framework: config.frontend 
  };
  
  await generateFrontend(frontendConfig);
  process.chdir('..');
  
  // Create backend
  await fs.ensureDir('backend');
  process.chdir('backend');
  
  const backendConfig = { 
    ...config, 
    projectName: `${projectName}-backend`,
    framework: config.backend 
  };
  
  await generateBackend(backendConfig);
  process.chdir('..');
  
  // Auto-connect if requested
  if (config.autoConnect) {
    await autoConnect(config);
  }
}

async function autoConnect(config) {
  // Create frontend .env
  const frontendEnv = `NEXT_PUBLIC_API_URL=http://localhost:5000/api
REACT_APP_API_URL=http://localhost:5000/api
`;
  
  await fs.writeFile('frontend/.env.local', frontendEnv);
  
  // Update backend CORS
  const backendServerPath = 'backend/server.js';
  if (await fs.pathExists(backendServerPath)) {
    let serverContent = await fs.readFile(backendServerPath, 'utf8');
    
    // Update CORS to allow frontend
    serverContent = serverContent.replace(
      "app.use(cors());",
      `app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));`
    );
    
    await fs.writeFile(backendServerPath, serverContent);
  }
}

async function createReadme(config) {
  const { projectName, projectType } = config;
  
  const readmeContent = `# ${projectName}

## Project Overview

This project was generated using the **Zenuxs CLI** - a powerful tool for scaffolding modern web applications.

## 🚀 Quick Start

\`\`\`bash
cd ${projectName}
${projectType === 'fullstack' ? '# For full-stack projects:\ncd frontend && npm install\ncd ../backend && npm install' : 'npm install'}
\`\`\`

## 📚 Documentation

- **Zenuxs Accounts**: [https://zenuxs.in](https://zenuxs.in)
- **Easy-Mongoo**: [https://easy-mongoo.zenuxs.in](https://easy-mongoo.zenuxs.in)
- **HMAX Security**: [https://hmax.zenuxs.in](https://hmax.zenuxs.in)

## 🔗 Useful Links

- **GitHub**: [https://github.com/zenuxs](https://github.com/zenuxs)
- **Documentation**: [https://docs.zenuxs.in](https://docs.zenuxs.in)
- **Support**: support@zenuxs.in

## 📄 License

MIT License

---

Built with ❤️ by [Zenuxs Team](https://zenuxs.in)
`;

  await fs.writeFile('README.md', readmeContent);
}

export async function installDependencies(config) {
  const { projectName, projectType } = config;
  
  const originalDir = process.cwd();
  
  try {
    if (projectType === 'fullstack') {
      // Install frontend dependencies
      process.chdir(path.join(originalDir, projectName, 'frontend'));
      await execa('npm', ['install'], { stdio: 'inherit' });
      
      // Install backend dependencies
      process.chdir(path.join(originalDir, projectName, 'backend'));
      await execa('npm', ['install'], { stdio: 'inherit' });
    } else {
      process.chdir(path.join(originalDir, projectName));
      await execa('npm', ['install'], { stdio: 'inherit' });
    }
  } catch (error) {
    console.log(chalk.yellow('⚠️  Note: Could not install dependencies automatically.'));
    console.log(chalk.yellow('   Please run "npm install" manually in your project directory.'));
  } finally {
    process.chdir(originalDir);
  }
}