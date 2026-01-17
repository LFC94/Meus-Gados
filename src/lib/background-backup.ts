import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";

const BACKUP_TASK_NAME = "BACKGROUND_BACKUP_TASK";

// Types derived from Preferences but tailored for this logic if needed
// Assuming we store backup settings in preferences
// We might need to extend AppPreferences to include backup settings

// Task removal or simplification for local-only backup
TaskManager.defineTask(BACKUP_TASK_NAME, async () => {
  try {
    console.log("Background backup task running (Cloud disabled)...");
    // If local backup in background is desired in the future, it would go here.
    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error("Background task error:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const backgroundBackupService = {
  async registerTask() {
    // Disabled registration for now as it was cloud-centric
  },

  async unregisterTask() {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKUP_TASK_NAME);
      if (isRegistered) {
        await BackgroundFetch.unregisterTaskAsync(BACKUP_TASK_NAME);
      }
    } catch (err) {
      console.error("Task unregistration failed:", err);
    }
  },
};
