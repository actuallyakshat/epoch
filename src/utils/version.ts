export const CURRENT_VERSION = "0.1.7";
export const PACKAGE_NAME = "epoch-tui";

export interface UpdateInfo {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
}

export async function checkForUpdate(): Promise<UpdateInfo> {
  try {
    const res = await fetch(
      `https://registry.npmjs.org/${PACKAGE_NAME}/latest`
    );
    const data = await res.json();
    const latestVersion = data.version;

    return {
      hasUpdate: latestVersion !== CURRENT_VERSION,
      currentVersion: CURRENT_VERSION,
      latestVersion,
    };
  } catch {
    return {
      hasUpdate: false,
      currentVersion: CURRENT_VERSION,
      latestVersion: CURRENT_VERSION,
    };
  }
}
