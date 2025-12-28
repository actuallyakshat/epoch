import React from "react";
import { render } from "ink";
import App from "./App";

console.clear();
const app = render(<App />, { exitOnCtrlC: false });

// Make the app instance globally accessible for clean exit
(global as any).__inkApp = app;
