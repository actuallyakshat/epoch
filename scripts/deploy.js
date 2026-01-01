#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

// Read version from package.json
const packageJson = JSON.parse(
  readFileSync(join(rootDir, "package.json"), "utf-8")
);
const version = packageJson.version;

console.log(`Deploying version ${version}...`);

// Update CURRENT_VERSION in src/utils/version.ts
const versionFilePath = join(rootDir, "src/utils/version.ts");
let versionFileContent = readFileSync(versionFilePath, "utf-8");
versionFileContent = versionFileContent.replace(
  /export const CURRENT_VERSION = "[^"]+";/,
  `export const CURRENT_VERSION = "${version}";`
);
writeFileSync(versionFilePath, versionFileContent);
console.log(`Updated CURRENT_VERSION to ${version}`);

// Build the application
console.log("Building...");
execSync("pnpm build", { cwd: rootDir, stdio: "inherit" });

// Publish to npm
console.log("Publishing to npm...");
execSync("npm publish", { cwd: rootDir, stdio: "inherit" });

console.log(`Successfully deployed version ${version}!`);
