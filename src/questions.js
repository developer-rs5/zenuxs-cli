import inquirer from 'inquirer';

export const questions = {
  frontend: async () => {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'framework',
        message: 'Choose framework:',
        choices: [
          { name: 'React + Vite', value: 'react-vite' },
          { name: 'Next.js', value: 'nextjs' }
        ]
      },
      {
        type: 'confirm',
        name: 'typescript',
        message: 'Use TypeScript?',
        default: true
      },
      {
        type: 'confirm',
        name: 'tailwind',
        message: 'Include TailwindCSS?',
        default: true
      },
      {
        type: 'confirm',
        name: 'authUI',
        message: 'Include basic auth pages (login/register/dashboard)?',
        default: false
      }
    ]);
    
    if (answers.framework === 'nextjs') {
      const { router } = await inquirer.prompt([
        {
          type: 'list',
          name: 'router',
          message: 'Choose routing:',
          choices: [
            { name: 'App Router (Recommended)', value: 'app' },
            { name: 'Pages Router', value: 'pages' }
          ]
        }
      ]);
      answers.routerType = router;
    }
    
    return answers;
  },
  
  backend: async () => {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'framework',
        message: 'Choose backend framework:',
        choices: [
          { name: 'Express', value: 'express' },
          { name: 'Fastify', value: 'fastify' }
        ]
      },
      {
        type: 'list',
        name: 'database',
        message: 'Choose database:',
        choices: [
          { name: 'MongoDB', value: 'mongodb' },
          { name: 'MySQL', value: 'mysql' },
          { name: 'PostgreSQL', value: 'postgres' }
        ]
      },
      {
        type: 'confirm',
        name: 'easyMongoo',
        message: 'Use Easy-Mongoo (MongoDB wrapper)?',
        default: true,
        when: (answers) => answers.database === 'mongodb'
      },
      {
        type: 'confirm',
        name: 'auth',
        message: 'Include authentication system?',
        default: true
      },
      {
        type: 'confirm',
        name: 'logger',
        message: 'Include logging system?',
        default: true
      },
      {
        type: 'confirm',
        name: 'rateLimiter',
        message: 'Include rate limiting?',
        default: true
      },
      {
        type: 'confirm',
        name: 'swagger',
        message: 'Include API documentation (Swagger)?',
        default: true
      }
    ]);
    
    return answers;
  },
  
  fullstack: async () => {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'frontend',
        message: 'Choose frontend:',
        choices: [
          { name: 'React + Vite', value: 'react-vite' },
          { name: 'Next.js', value: 'nextjs' }
        ]
      },
      {
        type: 'list',
        name: 'backend',
        message: 'Choose backend:',
        choices: [
          { name: 'Express', value: 'express' },
          { name: 'Fastify', value: 'fastify' }
        ]
      },
      {
        type: 'list',
        name: 'database',
        message: 'Choose database:',
        choices: [
          { name: 'MongoDB', value: 'mongodb' },
          { name: 'MySQL', value: 'mysql' },
          { name: 'PostgreSQL', value: 'postgres' }
        ]
      },
      {
        type: 'confirm',
        name: 'autoConnect',
        message: 'Auto-connect frontend and backend?',
        default: true
      },
      {
        type: 'confirm',
        name: 'fullAuth',
        message: 'Generate full authentication (UI + API)?',
        default: true
      },
      {
        type: 'confirm',
        name: 'docker',
        message: 'Include Docker configuration?',
        default: false
      }
    ]);
    
    return answers;
  }
};