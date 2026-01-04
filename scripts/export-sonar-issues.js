#!/usr/bin/env node

/**
 * Export SonarQube issues to a structured format for code analysis
 *
 * Usage: node scripts/export-sonar-issues.js [options]
 *
 * Options:
 *   --format=json|markdown|text  Output format (default: markdown)
 *   --severity=BLOCKER,HIGH,...  Filter by severity (default: all)
 *   --type=BUG,CODE_SMELL,...    Filter by type (default: all)
 *   --output=<file>              Output file (default: stdout)
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.join(__dirname, '..', '.env');
const env = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      env[match[1].trim()] = match[2].trim();
    }
  });
}

const SONAR_URL = env.SONAR_HOST_URL || 'http://localhost:9000';
const SONAR_TOKEN = env.SONAR_TOKEN;
const PROJECT_KEY = env.SONAR_PROJECT_KEY || 'epoch-local';

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  format: 'markdown',
  severity: null,
  type: null,
  output: null,
};

args.forEach((arg) => {
  if (arg.startsWith('--format=')) {
    options.format = arg.split('=')[1];
  } else if (arg.startsWith('--severity=')) {
    options.severity = arg.split('=')[1];
  } else if (arg.startsWith('--type=')) {
    options.type = arg.split('=')[1];
  } else if (arg.startsWith('--output=')) {
    options.output = arg.split('=')[1];
  }
});

async function fetchIssues() {
  const params = new URLSearchParams({
    componentKeys: PROJECT_KEY,
    ps: '500', // page size
    resolved: 'false',
  });

  if (options.severity) {
    params.append('severities', options.severity);
  }
  if (options.type) {
    params.append('types', options.type);
  }

  const url = `${SONAR_URL}/api/issues/search?${params}`;

  const headers = {
    Accept: 'application/json',
  };

  if (SONAR_TOKEN) {
    headers['Authorization'] = `Bearer ${SONAR_TOKEN}`;
  }

  try {
    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching issues from SonarQube:', error.message);
    process.exit(1);
  }
}

function formatAsMarkdown(data) {
  const { issues, total } = data;

  let output = `# SonarQube Issues Export\n\n`;
  output += `**Project:** ${PROJECT_KEY}\n`;
  output += `**Total Issues:** ${total}\n`;
  output += `**Exported:** ${new Date().toISOString()}\n\n`;

  // Group by severity
  const bySeverity = {
    BLOCKER: [],
    CRITICAL: [],
    MAJOR: [],
    MINOR: [],
    INFO: [],
  };

  issues.forEach((issue) => {
    bySeverity[issue.severity]?.push(issue);
  });

  const severityLabels = {
    BLOCKER: '🔴 Blocker',
    CRITICAL: '🟠 High',
    MAJOR: '🟡 Medium',
    MINOR: '🟢 Low',
    INFO: 'ℹ️ Info',
  };

  // Output by severity
  Object.entries(bySeverity).forEach(([severity, severityIssues]) => {
    if (severityIssues.length === 0) return;

    output += `## ${severityLabels[severity]} (${severityIssues.length} issues)\n\n`;

    // Group by file
    const byFile = {};
    severityIssues.forEach((issue) => {
      const file = issue.component.split(':')[1] || issue.component;
      if (!byFile[file]) byFile[file] = [];
      byFile[file].push(issue);
    });

    Object.entries(byFile).forEach(([file, fileIssues]) => {
      output += `### \`${file}\`\n\n`;

      fileIssues.forEach((issue, idx) => {
        const line = issue.line ? `:${issue.line}` : '';
        const effort = issue.effort ? ` (${issue.effort} effort)` : '';

        output += `${idx + 1}. **${issue.message}**${effort}\n`;
        output += `   - **Rule:** \`${issue.rule}\`\n`;
        output += `   - **Type:** ${issue.type}\n`;
        output += `   - **Location:** \`${file}${line}\`\n`;

        if (issue.flows && issue.flows.length > 0) {
          output += `   - **Code Flow:**\n`;
          issue.flows[0].locations.forEach((loc, i) => {
            output += `     ${i + 1}. ${loc.msg} (line ${loc.textRange?.startLine || '?'})\n`;
          });
        }

        output += `\n`;
      });

      output += '\n';
    });
  });

  // Add summary statistics
  output += `---\n\n`;
  output += `## Summary\n\n`;
  output += `| Severity | Count |\n`;
  output += `|----------|-------|\n`;
  Object.entries(bySeverity).forEach(([severity, severityIssues]) => {
    if (severityIssues.length > 0) {
      output += `| ${severityLabels[severity]} | ${severityIssues.length} |\n`;
    }
  });

  // Type breakdown
  const byType = {};
  issues.forEach((issue) => {
    byType[issue.type] = (byType[issue.type] || 0) + 1;
  });

  output += `\n| Type | Count |\n`;
  output += `|------|-------|\n`;
  Object.entries(byType).forEach(([type, count]) => {
    output += `| ${type} | ${count} |\n`;
  });

  return output;
}

function formatAsJSON(data) {
  // Simplify the structure for coding agents
  const simplified = data.issues.map((issue) => ({
    file: issue.component.split(':')[1] || issue.component,
    line: issue.line,
    message: issue.message,
    rule: issue.rule,
    severity: issue.severity,
    type: issue.type,
    effort: issue.effort,
    tags: issue.tags,
  }));

  return JSON.stringify(
    {
      project: PROJECT_KEY,
      total: data.total,
      exported: new Date().toISOString(),
      issues: simplified,
    },
    null,
    2,
  );
}

function formatAsText(data) {
  const { issues, total } = data;

  let output = `SonarQube Issues Export\n`;
  output += `${'='.repeat(80)}\n\n`;
  output += `Project: ${PROJECT_KEY}\n`;
  output += `Total Issues: ${total}\n`;
  output += `Exported: ${new Date().toISOString()}\n\n`;

  issues.forEach((issue, idx) => {
    const file = issue.component.split(':')[1] || issue.component;
    const line = issue.line ? `:${issue.line}` : '';
    const effort = issue.effort ? ` (${issue.effort})` : '';

    output += `${idx + 1}. [${issue.severity}] ${issue.message}\n`;
    output += `   File: ${file}${line}\n`;
    output += `   Rule: ${issue.rule}${effort}\n`;
    output += `   Type: ${issue.type}\n\n`;
  });

  return output;
}

async function main() {
  console.error('Fetching issues from SonarQube...');
  const data = await fetchIssues();

  console.error(`Found ${data.total} issues`);

  let output;
  switch (options.format) {
    case 'json':
      output = formatAsJSON(data);
      break;
    case 'text':
      output = formatAsText(data);
      break;
    case 'markdown':
    default:
      output = formatAsMarkdown(data);
      break;
  }

  if (options.output) {
    fs.writeFileSync(options.output, output, 'utf-8');
    console.error(`Issues exported to: ${options.output}`);
  } else {
    console.log(output);
  }
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
