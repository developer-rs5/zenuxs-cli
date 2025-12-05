#!/usr/bin/env node

import { runCLI } from './src/cli.js';

async function main() {
  try {
    const args = process.argv.slice(2);
    const projectName = args[0];
    
    if (!projectName) {
      console.error('❌ Please provide a project name');
      console.log('\nUsage: npx create-zenuxs-app <project-name>');
      console.log('       create-zenuxs-app <project-name>');
      process.exit(1);
    }
    
    await runCLI(projectName);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);  