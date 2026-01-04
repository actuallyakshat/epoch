import { storageService } from './services/storage';
import { StorageSchema } from './types/storage';
import readline from 'readline';

const SERVER_URL = process.env.EPOCH_SERVER_URL || 'https://epoch-server.actuallyakshat.in';

export async function handleCli(args: string[]) {
  const command = args[0];

  if (command === 'export') {
    await handleExport();
  } else if (command === 'import') {
    await handleImport();
  } else {
    console.error('Unknown command');
    process.exit(1);
  }
}

async function handleExport() {
  try {
    const data = await storageService.load();

    // We need the raw JSON with ISO strings for transport, so we'll access the private method via 'any' cast
    // or we could refactor. Since we have load() returning hydrated objects, let's just use JSON.stringify
    // which will call .toISOString() on dates automatically.
    const response = await fetch(`${SERVER_URL}/api/data/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      const error: any = await response.json();
      throw new Error(error.message || 'Export failed');
    }

    const result: any = await response.json();
    console.log('\nData exported successfully!');
    console.log('---------------------------');
    console.log(`Secret Key: ${result.code}`);
    console.log(`Expires: ${new Date(result.expiresAt).toLocaleString()}`);
    console.log('---------------------------\n');
    console.log(`Run 'epoch import' on another machine and enter this key to sync your data.\n`);
  } catch (error) {
    console.error('Export failed:', error);
    process.exit(1);
  }
}

async function handleImport() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query: string): Promise<string> => {
    return new Promise((resolve) => rl.question(query, resolve));
  };

  try {
    const code = await question('Enter your secret key: ');

    const response = await fetch(`${SERVER_URL}/api/data/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.trim() }),
    });

    if (!response.ok) {
      const error: any = await response.json();
      throw new Error(error.message || 'Import failed');
    }

    const json: any = await response.json();
    const remoteData = json.data;
    // Hydrate dates so we can work with objects
    const hydratedRemoteData = storageService.hydrateDates(remoteData);

    const action = await question(
      '\nData found! Do you want to (r)eplace existing data or (m)erge with it? [r/m]: ',
    );

    if (action.toLowerCase() === 'r') {
      await storageService.save(hydratedRemoteData);
      console.log('Data successfully replaced.');
    } else if (action.toLowerCase() === 'm') {
      const currentData = await storageService.load();
      const mergedData = mergeData(currentData, hydratedRemoteData);
      await storageService.save(mergedData);
      console.log('Data successfully merged.');
    } else {
      console.log('Cancelled.');
    }
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    rl.close();
  }
}

function mergeData(local: StorageSchema, remote: StorageSchema): StorageSchema {
  const merged: StorageSchema = { ...local };

  // Merge Tasks
  Object.keys(remote.tasks).forEach((date) => {
    if (!merged.tasks[date]) {
      merged.tasks[date] = remote.tasks[date];
    } else {
      // Simple merge: add remote tasks to local list for that day, de-duping by ID could be added here
      // For now, let's just append and let the user sort it out if there are dupes,
      // or simplistic de-dupe by ID
      const existingIds = new Set(merged.tasks[date].map((t) => t.id));
      const newTasks = remote.tasks[date].filter((t) => !existingIds.has(t.id));
      merged.tasks[date] = [...merged.tasks[date], ...newTasks];
    }
  });

  // Merge Timeline
  Object.keys(remote.timeline).forEach((date) => {
    if (!merged.timeline[date]) {
      merged.timeline[date] = remote.timeline[date];
    } else {
      // Similar de-dupe for timeline events?
      // Timeline events might not have unique IDs in older versions, assuming they do or just append
      // Let's just append for now to be safe against data loss
      merged.timeline[date] = [...merged.timeline[date], ...remote.timeline[date]];
    }
  });

  // Settings - keep local settings, or maybe overwrite if remote is newer?
  // Let's keep local settings to preserve user preference on this machine.

  return merged;
}
