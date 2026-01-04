#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import App from './App';
import { handleCli } from './cli';

console.clear();

const args = process.argv.slice(2);
if (args.length > 0 && (args[0] === 'export' || args[0] === 'import')) {
  handleCli(args).catch((err) => {
    console.error(err);
    process.exit(1);
  });
} else {
  const app = render(<App />, { exitOnCtrlC: false });
  // Make the app instance globally accessible for clean exit
  (global as any).__inkApp = app;
}
