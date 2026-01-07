import AsyncStorage from "@react-native-async-storage/async-storage";
import { cattleStorage, vaccineStorage, pregnancyStorage, diseaseStorage } from "./storage";
import { Cattle, Vaccine, Pregnancy, Disease } from "@/types";

export interface BackupData {
  version: string;
  timestamp: string;
  cattle: Cattle[];
  vaccines: Vaccine[];
  pregnancies: Pregnancy[];
  diseases: Disease[];
}

const BACKUP_PREFIX = "@meus_gados_backup_";

export const backupService = {
  async createBackup(): Promise<BackupData> {
    try {
      const [cattle, vaccines, pregnancies, diseases] = await Promise.all([
        cattleStorage.getAll(),
        vaccineStorage.getAll(),
        pregnancyStorage.getAll(),
        diseaseStorage.getAll(),
      ]);

      const backup: BackupData = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        cattle,
        vaccines,
        pregnancies,
        diseases,
      };

      return backup;
    } catch (error) {
      console.error("Error creating backup:", error);
      throw error;
    }
  },

  async saveBackup(backup: BackupData): Promise<string> {
    try {
      const backupId = `${BACKUP_PREFIX}${Date.now()}`;
      await AsyncStorage.setItem(backupId, JSON.stringify(backup));
      return backupId;
    } catch (error) {
      console.error("Error saving backup:", error);
      throw error;
    }
  },

  async exportBackupAsJSON(backup: BackupData): Promise<string> {
    try {
      return JSON.stringify(backup, null, 2);
    } catch (error) {
      console.error("Error exporting backup:", error);
      throw error;
    }
  },

  async getBackupList(): Promise<Array<{ id: string; backup: BackupData }>> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const backupKeys = keys.filter((key) => key.startsWith(BACKUP_PREFIX));

      const backups = await Promise.all(
        backupKeys.map(async (key) => {
          const data = await AsyncStorage.getItem(key);
          if (data) {
            return {
              id: key,
              backup: JSON.parse(data) as BackupData,
            };
          }
          return null;
        })
      );

      return backups.filter((b) => b !== null) as Array<{ id: string; backup: BackupData }>;
    } catch (error) {
      console.error("Error getting backup list:", error);
      throw error;
    }
  },

  async restoreBackup(backup: BackupData): Promise<void> {
    try {
      // Clear existing data by removing all keys
      await Promise.all([
        AsyncStorage.removeItem("@meus_gados_cattle"),
        AsyncStorage.removeItem("@meus_gados_vaccines"),
        AsyncStorage.removeItem("@meus_gados_pregnancies"),
        AsyncStorage.removeItem("@meus_gados_diseases"),
      ]);

      // Restore data
      const addPromises = [
        ...backup.cattle.map((c) => cattleStorage.add(c)),
        ...backup.vaccines.map((v) => vaccineStorage.add(v)),
        ...backup.pregnancies.map((p) => pregnancyStorage.add(p)),
        ...backup.diseases.map((d) => diseaseStorage.add(d)),
      ];
      
      await Promise.all(addPromises);
    } catch (error) {
      console.error("Error restoring backup:", error);
      throw error;
    }
  },

  async deleteBackup(backupId: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(backupId);
    } catch (error) {
      console.error("Error deleting backup:", error);
      throw error;
    }
  },

  async importBackupFromJSON(jsonString: string): Promise<BackupData> {
    try {
      const backup = JSON.parse(jsonString) as BackupData;
      
      // Validate backup structure
      if (!backup.cattle || !backup.vaccines || !backup.pregnancies || !backup.diseases) {
        throw new Error("Invalid backup format");
      }

      return backup;
    } catch (error) {
      console.error("Error importing backup:", error);
      throw error;
    }
  },
};
