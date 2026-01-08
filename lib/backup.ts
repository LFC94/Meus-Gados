import { STORAGE_KEYS } from "@/constants/const";
import { Cattle, Disease, Pregnancy, VaccinationRecord, VaccineModel } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  cattleStorage,
  diseaseStorage,
  pregnancyStorage,
  vaccinationRecordStorage,
  vaccineCatalogStorage,
} from "./storage";

export interface BackupData {
  version: string;
  timestamp: string;
  cattle: Cattle[];
  vaccineCatalog: VaccineModel[];
  vaccinationRecord: VaccinationRecord[];
  pregnancies: Pregnancy[];
  diseases: Disease[];
}

const BACKUP_PREFIX = "@meus_gados_backup_";

export const backupService = {
  async createBackup(): Promise<BackupData> {
    try {
      const [cattle, vaccineCatalog, vaccinationRecord, pregnancies, diseases] = await Promise.all([
        cattleStorage.getAll(),
        vaccineCatalogStorage.getAll(),
        vaccinationRecordStorage.getAll(),
        pregnancyStorage.getAll(),
        diseaseStorage.getAll(),
      ]);

      const backup: BackupData = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        cattle,
        vaccineCatalog,
        vaccinationRecord,
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

  async getBackupList(): Promise<{ id: string; backup: BackupData }[]> {
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

      return backups.filter((b) => b !== null) as { id: string; backup: BackupData }[];
    } catch (error) {
      console.error("Error getting backup list:", error);
      throw error;
    }
  },

  async restoreBackup(backup: BackupData): Promise<void> {
    try {
      // Clear existing data by removing all keys
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.CATTLE),
        AsyncStorage.removeItem(STORAGE_KEYS.DISEASES),
        AsyncStorage.removeItem(STORAGE_KEYS.PREGNANCIES),
        AsyncStorage.removeItem(STORAGE_KEYS.VACCINATION_RECORDS),
        AsyncStorage.removeItem(STORAGE_KEYS.VACCINE_CATALOG),
      ]);

      // Restore data
      const addPromises = [
        ...backup.cattle.map((c) => cattleStorage.add(c)),
        ...backup.vaccineCatalog.map((v) => vaccineCatalogStorage.add(v)),
        ...backup.vaccinationRecord.map((v) => vaccinationRecordStorage.add(v)),
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
      if (
        !backup.cattle ||
        !backup.vaccineCatalog ||
        !backup.vaccinationRecord ||
        !backup.pregnancies ||
        !backup.diseases
      ) {
        throw new Error("Invalid backup format");
      }

      return backup;
    } catch (error) {
      console.error("Error importing backup:", error);
      throw error;
    }
  },
};
