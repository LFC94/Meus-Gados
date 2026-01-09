import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { backupService } from "./backup";
import { getStoredAuthToken } from "./google-auth";
import { googleDriveService } from "./google-drive";
import { preferencesStorage } from "./preferences";

const BACKUP_TASK_NAME = "BACKGROUND_BACKUP_TASK";

// Types derived from Preferences but tailored for this logic if needed
// Assuming we store backup settings in preferences
// We might need to extend AppPreferences to include backup settings

TaskManager.defineTask(BACKUP_TASK_NAME, async () => {
  try {
    console.log("Starting background backup task...");

    // 1. Check if user is authenticated
    const token = await getStoredAuthToken();
    if (!token) {
      console.log("No Google Auth token found. Skipping backup.");
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // 2. Check preferences (frequency, enabled)
    const prefs = await preferencesStorage.getPreferences();
    if (!prefs.backupEnabled) {
      console.log("Backup disabled in preferences. Skipping.");
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // TODO: Implement actual frequency check (last execution time)
    // For now, we rely on the BackgroundFetch interval (which is ~daily)
    // If weekly is selected, we could store "lastBackupTime" and skip if < 7 days
    if (prefs.backupFrequency === "weekly") {
      // Logic to skip if last backup was less than 7 days ago
      // Leaving as TODO to separate concern
    }

    // 3. Perform Backup
    const backupData = await backupService.createBackup();
    const backupJson = await backupService.exportBackupAsJSON(backupData);

    const folderId = await googleDriveService.getOrCreateBackupFolder(token);
    await googleDriveService.uploadBackup(token, folderId, backupJson);

    console.log("Background backup completed successfully.");
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error("Background backup failed:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const backgroundBackupService = {
  async registerTask() {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKUP_TASK_NAME);
      if (!isRegistered) {
        await BackgroundFetch.registerTaskAsync(BACKUP_TASK_NAME, {
          minimumInterval: 60 * 60 * 24, // 1 day (execution not guaranteed exactly)
          stopOnTerminate: false, // Android only
          startOnBoot: true, // Android only
        });
        console.log("Backup task registered");
      }
    } catch (err) {
      console.error("Task registration failed:", err);
    }
  },

  async unregisterTask() {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKUP_TASK_NAME);
      if (isRegistered) {
        await BackgroundFetch.unregisterTaskAsync(BACKUP_TASK_NAME);
        console.log("Backup task unregistered");
      }
    } catch (err) {
      console.error("Task unregistration failed:", err);
    }
  },
};
