import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { generateProject, installDependencies } from './generators.js';

export async function runCLI(projectName) {
  console.log(chalk.cyan.bold('\n✨ Zenuxs CLI v1.0.0'));
  console.log(chalk.gray('Creating your project...\n'));
  
  // Ask project type
  const { projectType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'projectType',
      message: 'Select project type:',
      choices: [
        { name: 'Frontend', value: 'frontend' },
        { name: 'Backend', value: 'backend' },
        { name: 'Full-Stack', value: 'fullstack' }
      ]
    }
  ]);
  
  let config = { 
    projectName, 
    projectType,
    installDeps: true
  };
  
  // Frontend questions
  if (projectType === 'frontend') {
    const { framework } = await inquirer.prompt([
      {
        type: 'list',
        name: 'framework',
        message: 'Choose framework:',
        choices: [
          { name: 'React + Vite', value: 'react' },
          { name: 'Next.js', value: 'next' }
        ]
      }
    ]);
    
    const frontendDetails = await inquirer.prompt([
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
      }
    ]);
    
    if (framework === 'react') {
      const { authUI } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'authUI',
          message: 'Include auth pages (login/register/dashboard)?',
          default: false
        }
      ]);
      frontendDetails.authUI = authUI;
    }
    
    config = { 
      ...config, 
      ...frontendDetails,
      framework 
    };
  }
  
  // Backend questions
  else if (projectType === 'backend') {
    const backendAnswers = await inquirer.prompt([
      {
        type: 'list',
        name: 'framework',
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
        name: 'easyMongoo',
        message: 'Use Easy-Mongoo?',
        default: true,
        when: (answers) => answers.database === 'mongodb'
      },
      {
        type: 'confirm',
        name: 'auth',
        message: 'Include authentication?',
        default: true
      },
      {
        type: 'confirm',
        name: 'logger',
        message: 'Include logging?',
        default: true
      }
    ]);
    
    config = { ...config, ...backendAnswers };
  }
  
  // Full-stack questions
  else if (projectType === 'fullstack') {
    const { frontend, backend, autoConnect } = await inquirer.prompt([
      {
        type: 'list',
        name: 'frontend',
        message: 'Choose frontend:',
        choices: [
          { name: 'React + Vite', value: 'react' },
          { name: 'Next.js', value: 'next' }
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
        type: 'confirm',
        name: 'autoConnect',
        message: 'Auto-connect frontend & backend?',
        default: true
      }
    ]);
    
    // Ask frontend details
    const frontendDetails = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'frontendTypescript',
        message: 'Use TypeScript for frontend?',
        default: true
      },
      {
        type: 'confirm',
        name: 'frontendTailwind',
        message: 'Include TailwindCSS for frontend?',
        default: true
      }
    ]);
    
    if (frontend === 'react') {
      const { authUI } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'authUI',
          message: 'Include auth pages (login/register/dashboard) in frontend?',
          default: false
        }
      ]);
      frontendDetails.authUI = authUI;
    }
    
    // Ask backend details
    const backendDetails = await inquirer.prompt([
      {
        type: 'list',
        name: 'backendDatabase',
        message: 'Choose database for backend:',
        choices: [
          { name: 'MongoDB', value: 'mongodb' },
          { name: 'MySQL', value: 'mysql' },
          { name: 'PostgreSQL', value: 'postgres' }
        ]
      },
      {
        type: 'confirm',
        name: 'easyMongoo',
        message: 'Use Easy-Mongoo?',
        default: true,
        when: (answers) => answers.backendDatabase === 'mongodb'
      },
      {
        type: 'confirm',
        name: 'backendAuth',
        message: 'Include authentication in backend?',
        default: true
      },
      {
        type: 'confirm',
        name: 'backendLogger',
        message: 'Include logging in backend?',
        default: true
      }
    ]);
    
    config = { 
      ...config, 
      frontend,
      backend,
      autoConnect,
      ...frontendDetails,
      ...backendDetails 
    };
  }
  
  // Ask about dependencies installation
  const { installDeps } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'installDeps',
      message: 'Install dependencies after project creation?',
      default: true
    }
  ]);
  
  config.installDeps = installDeps;
  
  // Generate project
  const spinner = ora('Creating project structure...').start();
  try {
    await generateProject(config);
    spinner.succeed('Project structure created!');
    
    // Install dependencies
    if (config.installDeps) {
      const installSpinner = ora('Installing dependencies...').start();
      await installDependencies(config);
      installSpinner.succeed('Dependencies installed!');
    }
    
    showSuccessMessage(config);
  } catch (error) {
    spinner.fail('Failed to create project');
    console.error(chalk.red('Error details:'), error.message);
    throw error;
  }
}

function showSuccessMessage(config) {
  const { projectName, projectType, framework, frontend, backend } = config;
  
  console.log(chalk.green.bold('\n✅ Project created successfully!'));
  console.log(chalk.cyan('\n📁 Project:'), chalk.white(projectName));
  console.log(chalk.cyan('\n🏗️  Type:'), chalk.white(projectType));
  
  if (projectType === 'frontend') {
    console.log(chalk.cyan('\n🎨 Framework:'), chalk.white(framework === 'react' ? 'React + Vite' : 'Next.js'));
  } else if (projectType === 'backend') {
    console.log(chalk.cyan('\n⚙️  Backend:'), chalk.white(framework));
  } else if (projectType === 'fullstack') {
    console.log(chalk.cyan('\n🎨 Frontend:'), chalk.white(frontend === 'react' ? 'React + Vite' : 'Next.js'));
    console.log(chalk.cyan('\n⚙️  Backend:'), chalk.white(backend));
  }
  
  console.log(chalk.cyan('\n🚀 Getting started:'));
  console.log(chalk.white(`  cd ${projectName}`));
  
  if (projectType === 'fullstack') {
    console.log(chalk.white('\n  # Frontend:'));
    console.log(chalk.white('  cd frontend && npm run dev'));
    console.log(chalk.white('\n  # Backend:'));
    console.log(chalk.white('  cd backend && npm run dev'));
  } else if (projectType === 'frontend') {
    console.log(chalk.white('  npm run dev'));
  } else if (projectType === 'backend') {
    console.log(chalk.white('  npm run dev'));
  }
  
  console.log(chalk.cyan('\n📚 Documentation:'));
  console.log(chalk.white('  Zenuxs Accounts: https://zenuxs.in'));
  console.log(chalk.white('  Easy-Mongoo: https://easy-mongoo.zenuxs.in'));
  console.log(chalk.white('  HMAX Security: https://hmax.zenuxs.in'));
  
  if (projectType === 'frontend' && framework === 'react') {
    console.log(chalk.gray('\n💡 Tip: Run ') + chalk.white('npm run dev') + chalk.gray(' to start the development server'));
  } else if (projectType === 'frontend' && framework === 'next') {
    console.log(chalk.gray('\n💡 Tip: Run ') + chalk.white('npm run dev') + chalk.gray(' to start the Next.js server'));
  }
  
  console.log(chalk.gray('\nBuilt with ❤️ by Zenuxs Team'));
}