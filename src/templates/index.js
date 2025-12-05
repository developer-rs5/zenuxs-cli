// Main exports for all templates
import * as frontend from './frontend/index.js';
import * as backend from './backend/index.js';
import * as fullstack from './fullstack/index.js';

export { frontend, backend, fullstack };

// Helper functions for generators
export async function generateFrontendTemplate(config) {
  if (config.framework === 'react-vite') {
    return await frontend.reactVite.generate(config);
  } else if (config.framework === 'nextjs') {
    return await frontend.nextjs.generate(config);
  }
}

export async function generateBackendTemplate(config) {
  if (config.framework === 'express') {
    return await backend.express.generate(config);
  } else if (config.framework === 'fastify') {
    return await backend.fastify.generate(config);
  }
}

export async function autoConnectTemplates(config) {
  return await fullstack.integration.autoConnect(config);
}