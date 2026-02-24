import AsyncStorage from "@react-native-async-storage/async-storage";

import { STORAGE_KEYS } from "@/constants/const";

import { logger } from "../logger";
import { preferencesStorage } from "../preferences";
import { setItems } from "./base";
import { cattleStorage } from "./cattle";
import { diseaseStorage } from "./diseases";
import { pregnancyStorage } from "./pregnancy";
import { milkProductionStorage } from "./production";
import { vaccinationRecordStorage, vaccineCatalogStorage } from "./vaccines";

export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.CATTLE,
      STORAGE_KEYS.VACCINE_CATALOG,
      STORAGE_KEYS.VACCINATION_RECORDS,
      STORAGE_KEYS.PREGNANCIES,
      STORAGE_KEYS.DISEASES,
      STORAGE_KEYS.MILK_PRODUCTION,
      STORAGE_KEYS.PREFERENCES,
    ]);
  } catch (error) {
    logger.error("storage/clearAllData", error);
    throw error;
  }
};

export const exportAllData = async (): Promise<string> => {
  const [
    cattle,
    vaccineCatalog,
    vaccinationRecords,
    pregnancies,
    diseases,
    milkProduction,
    preferences,
  ] = await Promise.all([
    cattleStorage.getAll(),
    vaccineCatalogStorage.getAllIncludingInactive(),
    vaccinationRecordStorage.getAll(),
    pregnancyStorage.getAll(),
    diseaseStorage.getAll(),
    milkProductionStorage.getAll(),
    preferencesStorage.getPreferences(),
  ]);

  return JSON.stringify(
    {
      cattle,
      vaccineCatalog,
      vaccinationRecords,
      pregnancies,
      diseases,
      milkProduction,
      preferences,
      exportedAt: new Date().toISOString(),
    },
    null,
    2,
  );
};

export const importAllData = async (jsonData: string): Promise<void> => {
  try {
    const data = JSON.parse(jsonData);

    await Promise.all([
      setItems(STORAGE_KEYS.CATTLE, data.cattle || []),
      setItems(STORAGE_KEYS.VACCINE_CATALOG, data.vaccineCatalog || []),
      setItems(STORAGE_KEYS.VACCINATION_RECORDS, data.vaccinationRecords || []),
      setItems(STORAGE_KEYS.PREGNANCIES, data.pregnancies || []),
      setItems(STORAGE_KEYS.DISEASES, data.diseases || []),
      setItems(STORAGE_KEYS.MILK_PRODUCTION, data.milkProduction || []),
      setItems(STORAGE_KEYS.PREFERENCES, data.preferences || []),
    ]);
  } catch (error) {
    logger.error("storage/importAllData", error);
    throw error;
  }
};

export const syncStorage = {
  getLastSync: async (): Promise<string | null> => {
    return AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  },
  setLastSync: async (timestamp: string): Promise<void> => {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp);
  },
};
