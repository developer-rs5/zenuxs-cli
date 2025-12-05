import fs from 'fs-extra';
import path from 'path';
import { execa } from 'execa';
import chalk from 'chalk';

export async function createDirectory(dirPath) {
  await fs.ensureDir(dirPath);
}

export async function createFile(filePath, content) {
  await fs.ensureFile(filePath);
  await fs.writeFile(filePath, content, 'utf8');
}

export async function copyTemplate(templatePath, destinationPath, variables = {}) {
  let content = await fs.readFile(templatePath, 'utf8');
  
  // Replace variables in template
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    content = content.replace(regex, value);
  });
  
  await createFile(destinationPath, content);
}

export async function installPackage(packageName, options = {}) {
  const args = ['install', packageName];
  
  if (options.dev) {
    args.push('--save-dev');
  }
  
  if (options.global) {
    args.push('--global');
  }
  
  await execa('npm', args);
}

export function logSuccess(message) {
  console.log(chalk.green('✓'), message);
}

export function logError(message) {
  console.log(chalk.red('✗'), message);
}

export function logInfo(message) {
  console.log(chalk.cyan('ℹ'), message);
}

export function logWarning(message) {
  console.log(chalk.yellow('⚠'), message);
}

export async function runCommand(command, args, options = {}) {
  try {
    const result = await execa(command, args, { stdio: 'inherit', ...options });
    return result;
  } catch (error) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}`);
  }
}