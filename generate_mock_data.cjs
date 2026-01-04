const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const tasksPool = [
  'Fix race condition in AuthProvider sync',
  'Refactor Redis connection pooling logic',
  'Optimize Postgres query for user-history node',
  'Update Swagger docs for /v2/orders endpoint',
  'Implement retry logic for payment-svc',
  'Investigate memory leak on staging-cluster-3',
  'Migrate legacy S3 buckets to standard IA',
  'Update Dockerfile for multi-stage builds',
  'Patch CVE-2024 security vuln in jwt-lib',
  'Review prod-launch-blue branch',
  'Write post-mortem for incident',
  'Draft RFC for websocket notification system',
  'Setup Prometheus alerts for disk-usage-spike',
  'Cleanup dead-code in legacy-admin panel',
  'Upgrade React from 18.2 to 18.3 in webapp',
  'Fix CSS layout shifts in dashboard-v4',
  'POC for gRPC bridge in inventory-service',
  'Verify bugfix on staging-v2-alpha',
  'Update k8s helm chart for redis-cluster',
  'Benchmark latency for geo-spatial queries',
  'Automate database-schema backup script',
  'Review PR for worker-thread-impl',
  'Implement rate-limiting for auth-endpoints',
  'Fix hydration error in SSR-landing-page',
  'Update CI configuration for parallel tests',
  'Profile CPU usage for image-processing node',
  'Configure Sentry alerts for 5xx-surge',
  'Document internal-api for partner-onboarding',
  'Remove hardcoded credentials from dev-config',
  'Implement health-check endpoint for crawler',
  'Optimize LCP for mobile-home-screen',
  'Refactor middleware for RBAC-v2',
  'Analyze slow-queries on main-read-replica',
  'Setup GH-actions for auto-labeling-PRs',
  'Fix flaky E2E tests in checkout-flow',
  'Verify SSL certificate renewal on production',
  'Audit IAM permissions for developer-group',
  'Update README for local-setup instructions',
  'Implement soft-delete for user-profiles',
  'Add logging for failed-webhook-callbacks',
  'Refactor event-emitter for better TS types',
  'Upgrade Node.js to v20 in CI/CD pipeline',
  'Fix z-index issues in global-modal',
  'Implement cache-bursting for asset-delivery',
  'Review infra-as-code for VPC-peering',
  'Conduct technical-interview for SE-II role',
  'Setup Grafana dashboard for API-throughput',
  'Fix broken images in email-templates',
  'Implement dark-mode toggle for dashboard',
  'Review logs for failed-sync in stripe-int',
  'Cleanup unused NPM dependencies',
  'Implement deep-linking for mobile-app v2',
  'Fix memory-leak in WebSocket-handler',
  'Update terraform-scripts for db-migration',
  'Refactor legacy-utils to ES-modules',
  'Patch OpenSSL vulnerability on build-server',
  'Audit API-keys usage across services',
  'Implement circuit-breaker for external-API',
  'Optimize bundle-size for marketing-site',
  'Fix cross-browser bugs in IE11 fallback',
  'Draft quarterly performance-review',
  'Update error-handling in file-upload-svc',
  'Implement search-indexing for blog-posts',
  'Secure Redis instance with ACLs',
  'Debug failing cron-job for daily-reports',
  'Setup staging-environment for feature-X',
  'Implement multi-tenant auth in gateway',
  'Fix race-condition in state-manager',
  'Optimize SVG assets for performance',
  'Update CSP headers for security-audit',
  'Implement feature-flag for new-UI',
  'Fix broken-links in API-documentation',
  'Refactor shared-components for reusability',
  'Audit resource-limits for k8s-pods',
  'Implement request-tracing for microservices',
  'Update E2E test-data generation script',
  'Patch security issue in node-fetch',
  'Verify data-consistency after migration',
  'Implement pagination for search-results',
  'Optimize database-indexing for large-tables',
  'Fix visual-regressions in navbar-update',
  'Update dependency-graph for yarn-v4',
  'Implement logging for authentication-audit',
  'Fix broken unit-tests for auth-logic',
  'Implement request-validation for API-v1',
  'Update infra-docs for new-VPC architecture',
  'Analyze performance-bottleneck in PDF-gen',
  'Fix layout-issue in mobile-responsive-view',
  'Implement retry-policy for message-queue',
  'Update staging-data from production-sanitized',
  'Fix bug in date-picker component',
  'Optimize image-loading for gallery-view',
  'Implement auth-guards for admin-dashboard',
  'Update project-dependencies to latest',
  'Fix memory-usage peak in batch-processing',
  'Implement audit-trail for critical-actions',
  'Update deployment-scripts for blue-green',
  'Improve error-messages for user-onboarding',
  'Fix CSS-specificity in component-library',
  'Optimize network-calls in dashboard-load',
  'Implement API-versioning for public-endpoints',
  'Update documentation for developer-API',
  'Fix broken UI in user-settings-page',
  'Optimize code-splitting in main-bundle',
  'Implement rate-limit in API-gateway',
  'Update k8s-manifests for new-service',
  'Fix intermittent failure in CI-pipeline',
  'Implement telemetry for feature-adoption',
  'Update onboarding-guide for new-hires',
];

const subtasksPool = [
  'Update unit tests',
  'Write integration tests',
  'Update documentation',
  'Add error handling',
  'Code review',
  'Deploy to staging',
  'Verify on production',
  'Update changelog',
  'Notify team',
  'Create Jira ticket',
  'Add logging',
  'Performance testing',
  'Security audit',
  'Refactor code',
  'Add type definitions',
  'Update dependencies',
  'Fix linting errors',
  'Add metrics',
  'Configure monitoring',
  'Update CI/CD',
];

// Recurring task templates
const recurringTasks = [
  {
    title: 'Daily standup notes',
    frequency: 'weekdays',
    startDate: new Date(2026, 0, 5), // Jan 5, 2026 (Monday)
  },
  {
    title: 'Check production alerts',
    frequency: 'daily',
    startDate: new Date(2026, 0, 1),
  },
  {
    title: 'Team sync meeting',
    frequency: 'weekly',
    startDate: new Date(2026, 0, 6), // Jan 6, 2026 (Tuesday)
  },
  {
    title: 'Review open PRs',
    frequency: 'custom',
    daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
    startDate: new Date(2026, 0, 5),
  },
  {
    title: 'Monthly security audit',
    frequency: 'monthly',
    startDate: new Date(2026, 0, 15),
  },
  {
    title: 'Weekly team retrospective',
    frequency: 'weekly',
    startDate: new Date(2026, 0, 10), // Jan 10, 2026 (Friday)
  },
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomSubset(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

function createSubtask(title, parentId, dateStr, depth = 1, usedSubtaskTitles = new Set()) {
  // Ensure unique subtask titles within the same parent
  if (usedSubtaskTitles.has(title)) {
    return null; // Skip duplicate
  }
  usedSubtaskTitles.add(title);

  const taskId = uuidv4();
  const createdAt = new Date();
  createdAt.setHours(getRandomInt(8, 18), getRandomInt(0, 59), 0, 0);

  const subtask = {
    id: taskId,
    title,
    state: Math.random() < 0.6 ? 'completed' : 'todo',
    createdAt: createdAt.toISOString(),
    updatedAt: createdAt.toISOString(),
    children: [],
    parentId,
    date: dateStr,
  };

  // Add nested subtasks (max 2 levels deep) - limit to prevent over-nesting
  if (depth < 2 && Math.random() < 0.25) {
    const nestedCount = getRandomInt(1, 2);
    const nestedSubtasks = getRandomSubset(subtasksPool, nestedCount);
    const nestedUsedTitles = new Set();

    subtask.children = nestedSubtasks
      .map((title) => createSubtask(title, taskId, dateStr, depth + 1, nestedUsedTitles))
      .filter(Boolean); // Remove null values
  }

  if (subtask.state === 'completed') {
    const endTime = new Date();
    endTime.setHours(getRandomInt(14, 18), getRandomInt(0, 59), 0, 0);
    subtask.endTime = endTime.toISOString();
  }

  return subtask;
}

function generateData() {
  const data = {
    version: '1.0.0',
    tasks: {},
    timeline: {},
    settings: {
      theme: 'dark',
      defaultStartTime: 'now',
      dateFormat: 'MMMM do, yyyy',
      timeFormat: '12h',
    },
  };

  const today = new Date(2026, 0, 4); // Jan 4, 2026
  today.setHours(16, 26, 44, 0);
  let taskIndex = 0;

  // Track all task IDs to ensure uniqueness
  const allTaskIds = new Set();

  // First, add recurring tasks
  const recurringTaskIds = {};
  recurringTasks.forEach((recurringTemplate) => {
    const taskId = uuidv4();
    allTaskIds.add(taskId);

    const dateStr = recurringTemplate.startDate.toISOString().split('T')[0];
    const createdAt = new Date(recurringTemplate.startDate);
    createdAt.setHours(8, 0, 0, 0);

    const recurrence = {
      frequency: recurringTemplate.frequency,
    };

    if (recurringTemplate.daysOfWeek) {
      recurrence.daysOfWeek = recurringTemplate.daysOfWeek;
    }

    // Add some excluded dates randomly
    if (Math.random() < 0.3) {
      const excludedDate = new Date(2026, 0, getRandomInt(10, 20));
      recurrence.excludedDates = [excludedDate.toISOString().split('T')[0]];
    }

    const task = {
      id: taskId,
      title: recurringTemplate.title,
      state: recurringTemplate.startDate < today ? 'completed' : 'todo',
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
      children: [],
      date: dateStr,
      recurrence,
    };

    if (task.state === 'completed') {
      const endTime = new Date(recurringTemplate.startDate);
      endTime.setHours(getRandomInt(14, 17), getRandomInt(0, 59), 0, 0);
      task.endTime = endTime.toISOString();
      task.startTime = new Date(recurringTemplate.startDate).toISOString();
    }

    // Add subtasks to some recurring tasks - limit to prevent duplication
    if (Math.random() < 0.3) {
      const subtaskCount = getRandomInt(1, 2);
      const selectedSubtasks = getRandomSubset(subtasksPool, subtaskCount);
      const usedSubtaskTitles = new Set();

      task.children = selectedSubtasks
        .map((title) => createSubtask(title, taskId, dateStr, 1, usedSubtaskTitles))
        .filter(Boolean);

      // Track all subtask IDs
      task.children.forEach(child => {
        allTaskIds.add(child.id);
        child.children.forEach(grandchild => {
          allTaskIds.add(grandchild.id);
        });
      });
    }

    if (!data.tasks[dateStr]) {
      data.tasks[dateStr] = [];
      data.timeline[dateStr] = [];
    }

    data.tasks[dateStr].push(task);
    recurringTaskIds[recurringTemplate.title] = taskId;

    // Add timeline event if completed
    if (task.state === 'completed') {
      data.timeline[dateStr].push({
        id: uuidv4(),
        taskId,
        taskTitle: task.title,
        type: 'completed',
        timestamp: task.endTime,
        previousState: 'todo',
        newState: 'completed',
      });
    }
  });

  // Generate regular tasks for each day in January 2026
  for (let day = 1; day <= 31; day++) {
    const date = new Date(2026, 0, day);
    const dateStr = date.toISOString().split('T')[0];

    // More tasks on weekdays
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const numTasks = isWeekend ? getRandomInt(1, 2) : getRandomInt(3, 5);

    if (!data.tasks[dateStr]) {
      data.tasks[dateStr] = [];
    }
    if (!data.timeline[dateStr]) {
      data.timeline[dateStr] = [];
    }

    const dayTasks = data.tasks[dateStr];
    const dayEvents = data.timeline[dateStr];

    for (let t = 0; t < numTasks; t++) {
      if (taskIndex >= tasksPool.length) break;

      const taskId = uuidv4();

      // Ensure unique task ID
      if (allTaskIds.has(taskId)) {
        continue;
      }
      allTaskIds.add(taskId);

      const title = tasksPool[taskIndex++];

      let state = 'todo';
      if (date < today) {
        const rand = Math.random();
        if (rand < 0.7) state = 'completed';
        else if (rand < 0.85) state = 'delayed';
        else if (rand < 0.95) state = 'delegated';
        else state = 'todo';
      } else if (date.toDateString() === today.toDateString()) {
        const rand = Math.random();
        if (rand < 0.4) state = 'completed';
        else if (rand < 0.5) state = 'delayed';
        else state = 'todo';
      }

      const createdAt = new Date(date);
      createdAt.setHours(getRandomInt(8, 10), getRandomInt(0, 59), 0, 0);

      const updatedAt = new Date(date);
      updatedAt.setHours(getRandomInt(10, 18), getRandomInt(0, 59), 0, 0);

      const task = {
        id: taskId,
        title,
        state,
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
        children: [],
        date: dateStr,
      };

      // Add subtasks to some tasks (20% chance, reduced from 30%)
      if (Math.random() < 0.2) {
        const subtaskCount = getRandomInt(1, 3);
        const selectedSubtasks = getRandomSubset(subtasksPool, subtaskCount);
        const usedSubtaskTitles = new Set();

        task.children = selectedSubtasks
          .map((title) => createSubtask(title, taskId, dateStr, 1, usedSubtaskTitles))
          .filter(Boolean);

        // Track all subtask IDs
        task.children.forEach(child => {
          allTaskIds.add(child.id);
          child.children.forEach(grandchild => {
            allTaskIds.add(grandchild.id);
          });
        });
      }

      if (state === 'completed' || state === 'delayed' || state === 'delegated') {
        const endTime = new Date(date);
        endTime.setHours(getRandomInt(14, 18), getRandomInt(0, 59), 0, 0);
        task.endTime = endTime.toISOString();
      }

      if (date <= today && (state !== 'todo' || Math.random() < 0.5)) {
        const startTime = new Date(date);
        startTime.setHours(getRandomInt(9, 11), getRandomInt(0, 59), 0, 0);
        task.startTime = startTime.toISOString();
      }

      dayTasks.push(task);

      // Timeline events
      if (task.startTime) {
        dayEvents.push({
          id: uuidv4(),
          taskId,
          taskTitle: title,
          type: 'started',
          timestamp: task.startTime,
        });
      }

      if (state !== 'todo' && task.endTime) {
        dayEvents.push({
          id: uuidv4(),
          taskId,
          taskTitle: title,
          type: state,
          timestamp: task.endTime,
          previousState: 'todo',
          newState: state,
        });
      }

      // Add timeline events for completed subtasks
      task.children.forEach((subtask) => {
        if (subtask.state === 'completed' && subtask.endTime) {
          dayEvents.push({
            id: uuidv4(),
            taskId: subtask.id,
            taskTitle: subtask.title,
            type: 'completed',
            timestamp: subtask.endTime,
            previousState: 'todo',
            newState: 'completed',
          });
        }

        // Add events for nested subtasks
        subtask.children.forEach((nestedSubtask) => {
          if (nestedSubtask.state === 'completed' && nestedSubtask.endTime) {
            dayEvents.push({
              id: uuidv4(),
              taskId: nestedSubtask.id,
              taskTitle: nestedSubtask.title,
              type: 'completed',
              timestamp: nestedSubtask.endTime,
              previousState: 'todo',
              newState: 'completed',
            });
          }
        });
      });
    }

    // Sort timeline events by timestamp
    data.timeline[dateStr] = dayEvents.sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
    );
  }

  return data;
}

const path = require('path');
const os = require('os');

const mockData = generateData();

// Define target directory and file
const targetDir = path.join(os.homedir(), 'Library', 'Application Support', 'epoch');
const targetFile = path.join(targetDir, 'data.json');

// Ensure directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`Created directory: ${targetDir}`);
}

// Backup existing data if it exists
if (fs.existsSync(targetFile)) {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
  const backupFile = path.join(targetDir, `data_${dateStr}_${timeStr}.json`);

  fs.copyFileSync(targetFile, backupFile);
  console.log(`Backed up existing data to: ${backupFile}`);
}

// Write new data
fs.writeFileSync(targetFile, JSON.stringify(mockData, null, 2));
console.log(`Mock data generated successfully at: ${targetFile}`);
console.log('\nData includes:');
console.log('- Tasks for January 2026');
console.log('- Recurring tasks (daily, weekly, weekdays, monthly, custom)');
console.log('- Nested subtasks (up to 2 levels deep)');
console.log('- Various task states (todo, completed, delegated, delayed)');
console.log('- Timeline events with timestamps');
console.log('- All task IDs are unique (no duplicates)');
console.log('- Proper parent-child relationships');
