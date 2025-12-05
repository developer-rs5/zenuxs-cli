#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const main = resolve(__dirname, '..', 'index.js');

const args = process.argv.slice(2);

spawn(process.execPath, [main, ...args], {
  stdio: 'inherit',
  env: process.env
}).on('exit', (code) => {
  process.exit(code);
});