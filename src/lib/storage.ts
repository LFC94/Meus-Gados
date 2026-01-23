/**
 * Serviço de armazenamento local usando AsyncStorage
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

import { STORAGE_KEYS } from "@/constants/const";
import {
  Cattle,
  Disease,
  MilkProductionRecord,
  Pregnancy,
  SyncBase,
  VaccinationRecord,
  VaccinationRecordWithDetails,
  VaccineModel,
  VaccineWithRecords,
} from "@/types";

import { preferencesStorage } from "./preferences";

/**
 * Sistema de notificação de mudanças para sincronização
 */
type StorageListener = () => void;
const listeners: StorageListener[] = [];

export const subscribeToStorageChanges = (callback: StorageListener) => {
  listeners.push(callback);
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) listeners.splice(index, 1);
  };
};

const notifyStorageChanges = () => {
  listeners.forEach((listener) => listener());
};

/**
 * Funções genéricas de armazenamento
 */

async function getItems<T extends { isDeleted?: boolean }>(key: string): Promise<T[]> {
  try {
    const data = await AsyncStorage.getItem(key);
    const items: T[] = data ? JSON.parse(data) : [];
    return items.filter((item) => !item.isDeleted);
  } catch (error) {
    console.error(`Error getting items from ${key}:`, error);
    return [];
  }
}

/**
 * Retorna todos os itens incluindo os marcados como deletado (usado para sync)
 */
export async function getAllItemsIncludingDeleted<T>(key: string): Promise<T[]> {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error getting all items from ${key}:`, error);
    return [];
  }
}

async function setItems<T>(key: string, items: T[]): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(items));
  } catch (error) {
    console.error(`Error setting items to ${key}:`, error);
    throw error;
  }
}

async function addItem<T extends SyncBase>(key: string, item: T): Promise<T> {
  const items = await getAllItemsIncludingDeleted<T>(key);
  const newItem = {
    ...item,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDeleted: false,
  };
  items.push(newItem);
  await setItems(key, items);
  notifyStorageChanges();
  return newItem;
}

async function updateItem<T extends SyncBase>(key: string, id: string, updates: Partial<T>): Promise<T | null> {
  const items = await getAllItemsIncludingDeleted<T>(key);
  const index = items.findIndex((item) => item.id === id);

  if (index === -1) {
    return null;
  }

  items[index] = {
    ...items[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await setItems(key, items);
  notifyStorageChanges();
  return items[index];
}

async function deleteItem<T extends { id: string; isDeleted?: boolean; updatedAt: string }>(
  key: string,
  id: string,
): Promise<boolean> {
  const items = await getAllItemsIncludingDeleted<T>(key);
  const index = items.findIndex((item) => item.id === id);

  if (index === -1) {
    return false;
  }

  items[index] = {
    ...items[index],
    isDeleted: true,
    updatedAt: new Date().toISOString(),
  };

  await setItems(key, items);
  notifyStorageChanges();
  return true;
}

async function getItemById<T extends SyncBase>(key: string, id: string): Promise<T | null> {
  const items = await getItems<T>(key);
  return items.find((item) => item.id === id) || null;
}

/**
 * Funções específicas para Cattle (Gado)
 */

export const cattleStorage = {
  getAll: () => getItems<Cattle>(STORAGE_KEYS.CATTLE),

  getById: (id: string) => getItemById<Cattle>(STORAGE_KEYS.CATTLE, id),

  add: (cattle: Omit<Cattle, "id" | "createdAt" | "updatedAt">) => {
    const id = `cattle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return addItem<Cattle>(STORAGE_KEYS.CATTLE, { ...cattle, id } as Cattle);
  },

  update: (id: string, updates: Partial<Cattle>) => updateItem<Cattle>(STORAGE_KEYS.CATTLE, id, updates),

  delete: (id: string) => deleteItem<Cattle>(STORAGE_KEYS.CATTLE, id),

  getByMotherId: async (motherId: string): Promise<Cattle[]> => {
    const allCattle = await getItems<Cattle>(STORAGE_KEYS.CATTLE);
    return allCattle.filter((cattle) => cattle.motherId === motherId);
  },
};

/**
 * Funções específicas para Catálogo de Vacinas (VaccineModel)
 */

export const vaccineCatalogStorage = {
  getAll: async (): Promise<VaccineModel[]> => {
    const items = await getItems<VaccineModel>(STORAGE_KEYS.VACCINE_CATALOG);
    return items.filter((v) => v.isActive);
  },

  getAllIncludingInactive: (): Promise<VaccineModel[]> => getItems<VaccineModel>(STORAGE_KEYS.VACCINE_CATALOG),

  getById: (id: string) => getItemById<VaccineModel>(STORAGE_KEYS.VACCINE_CATALOG, id),

  add: (vaccine: Omit<VaccineModel, "id" | "createdAt" | "updatedAt" | "isActive">) => {
    const id = `vac_catalog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newVaccine = {
      ...vaccine,
      id,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return addItem<VaccineModel>(STORAGE_KEYS.VACCINE_CATALOG, newVaccine);
  },

  update: (id: string, updates: Partial<VaccineModel>) =>
    updateItem<VaccineModel>(STORAGE_KEYS.VACCINE_CATALOG, id, updates),

  delete: async (id: string): Promise<boolean> => {
    // Verificar se há registros de aplicação usando esta vacina
    const records = await getItems<VaccinationRecord>(STORAGE_KEYS.VACCINATION_RECORDS);
    const hasRecords = records.some((r) => r.vaccineId === id);

    if (hasRecords) {
      // Em vez de excluir, marcar como inativa
      await updateItem<VaccineModel>(STORAGE_KEYS.VACCINE_CATALOG, id, { isActive: false });
      return true;
    }

    return deleteItem<VaccineModel>(STORAGE_KEYS.VACCINE_CATALOG, id);
  },

  getWithRecordCount: async (): Promise<VaccineWithRecords[]> => {
    const vaccines = await getItems<VaccineModel>(STORAGE_KEYS.VACCINE_CATALOG);
    const records = await getItems<VaccinationRecord>(STORAGE_KEYS.VACCINATION_RECORDS);

    return vaccines.map((vaccine) => {
      const vaccineRecords = records.filter((r) => r.vaccineId === vaccine.id);
      const lastRecord = vaccineRecords.sort(
        (a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime(),
      )[0];

      return {
        ...vaccine,
        recordCount: vaccineRecords.length,
        lastAppliedDate: lastRecord?.dateApplied,
      };
    });
  },
};

/**
 * Funções específicas para Registros de Vacinação (VaccinationRecord)
 */

export const vaccinationRecordStorage = {
  getAll: () => getItems<VaccinationRecord>(STORAGE_KEYS.VACCINATION_RECORDS),

  getById: (id: string) => getItemById<VaccinationRecord>(STORAGE_KEYS.VACCINATION_RECORDS, id),

  getByCattleId: async (cattleId: string): Promise<VaccinationRecordWithDetails[]> => {
    const allRecords = await getItems<VaccinationRecord>(STORAGE_KEYS.VACCINATION_RECORDS);
    const allVaccineCatalog = await getItems<VaccineModel>(STORAGE_KEYS.VACCINE_CATALOG);
    return allRecords
      .filter((record) => record.cattleId === cattleId)
      .sort((a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime())
      .map((vaccination): VaccinationRecordWithDetails => {
        const vaccine = allVaccineCatalog.find((vaccine) => vaccine.id === vaccination.vaccineId);
        return { ...vaccination, vaccineName: vaccine?.name || "" };
      });
  },

  getByCattleIdWithDetails: async (cattleId: string): Promise<VaccinationRecordWithDetails[]> => {
    const records = await vaccinationRecordStorage.getByCattleId(cattleId);
    const catalog = await vaccineCatalogStorage.getAllIncludingInactive();

    return records.map((record) => {
      const vaccine = catalog.find((v) => v.id === record.vaccineId);
      return {
        ...record,
        vaccineName: vaccine?.name || "Vacina Desconhecida",
        vaccineManufacturer: vaccine?.manufacturer,
        vaccineDescription: vaccine?.description,
        daysBetweenDoses: vaccine?.daysBetweenDoses,
      };
    });
  },

  add: (record: Omit<VaccinationRecord, "id" | "createdAt" | "updatedAt">) => {
    const id = `vac_record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return addItem<VaccinationRecord>(STORAGE_KEYS.VACCINATION_RECORDS, { ...record, id } as VaccinationRecord);
  },

  update: (id: string, updates: Partial<VaccinationRecord>) =>
    updateItem<VaccinationRecord>(STORAGE_KEYS.VACCINATION_RECORDS, id, updates),

  delete: (id: string) => deleteItem<VaccinationRecord>(STORAGE_KEYS.VACCINATION_RECORDS, id),

  getPending: async (): Promise<(VaccinationRecordWithDetails & { cattle: Cattle })[]> => {
    const allRecords = await getItems<VaccinationRecord>(STORAGE_KEYS.VACCINATION_RECORDS);
    const allVaccines = await vaccineCatalogStorage.getAllIncludingInactive();
    const allCattle = await getItems<Cattle>(STORAGE_KEYS.CATTLE);

    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const pendingRecords = allRecords.filter((record) => {
      if (!record.nextDoseDate) return false;
      if (record.isNextDoseApplied) return false;
      const nextDoseDate = new Date(record.nextDoseDate);
      return nextDoseDate <= thirtyDaysFromNow;
    });

    return pendingRecords
      .map((record): (VaccinationRecordWithDetails & { cattle: Cattle }) | null => {
        const vaccine = allVaccines.find((v) => v.id === record.vaccineId);
        const cattle = allCattle.find((c) => c.id === record.cattleId);

        if (!cattle) return null;

        return {
          id: record.id,
          cattleId: record.cattleId,
          vaccineId: record.vaccineId,
          dateApplied: record.dateApplied,
          nextDoseDate: record.nextDoseDate,
          batchUsed: record.batchUsed,
          notes: record.notes,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
          vaccineName: vaccine?.name || "Vacina Desconhecida",
          vaccineManufacturer: vaccine?.manufacturer,
          vaccineDescription: vaccine?.description,
          daysBetweenDoses: vaccine?.daysBetweenDoses,
          cattle,
        };
      })
      .filter((item): item is VaccinationRecordWithDetails & { cattle: Cattle } => item !== null)
      .sort((a, b) => new Date(a.nextDoseDate!).getTime() - new Date(b.nextDoseDate!).getTime());
  },

  getByVaccineId: async (vaccineId: string): Promise<VaccinationRecord[]> => {
    const allRecords = await getItems<VaccinationRecord>(STORAGE_KEYS.VACCINATION_RECORDS);
    return allRecords.filter((r) => r.vaccineId === vaccineId);
  },

  markNextDoseAsApplied: async (id: string): Promise<void> => {
    await updateItem<VaccinationRecord>(STORAGE_KEYS.VACCINATION_RECORDS, id, { isNextDoseApplied: true });
  },
};

/**
 * Funções específicas para Pregnancies (Gestações)
 */

export const pregnancyStorage = {
  getAll: () => getItems<Pregnancy>(STORAGE_KEYS.PREGNANCIES),

  getById: (id: string) => getItemById<Pregnancy>(STORAGE_KEYS.PREGNANCIES, id),

  getByCattleId: async (cattleId: string): Promise<Pregnancy[]> => {
    const allPregnancies = await getItems<Pregnancy>(STORAGE_KEYS.PREGNANCIES);
    return allPregnancies.filter((pregnancy) => pregnancy.cattleId === cattleId);
  },

  add: (pregnancy: Omit<Pregnancy, "id" | "createdAt" | "updatedAt">) => {
    const id = `pregnancy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return addItem<Pregnancy>(STORAGE_KEYS.PREGNANCIES, { ...pregnancy, id } as Pregnancy);
  },

  update: (id: string, updates: Partial<Pregnancy>) => updateItem<Pregnancy>(STORAGE_KEYS.PREGNANCIES, id, updates),

  delete: (id: string) => deleteItem<Pregnancy>(STORAGE_KEYS.PREGNANCIES, id),

  getActive: async (): Promise<(Pregnancy & { cattle: Cattle })[]> => {
    const allPregnancies = await getItems<Pregnancy>(STORAGE_KEYS.PREGNANCIES);
    const allCattle = await getItems<Cattle>(STORAGE_KEYS.CATTLE);

    const activePregnancies = allPregnancies.filter((pregnancy) => pregnancy.result === "pending");

    return activePregnancies
      .map((pregnancy) => {
        const cattle = allCattle.find((c) => c.id === pregnancy.cattleId);
        return cattle ? { ...pregnancy, cattle } : null;
      })
      .filter((item): item is Pregnancy & { cattle: Cattle } => item !== null);
  },
};

/**
 * Funções específicas para Diseases (Doenças)
 */

export const diseaseStorage = {
  getAll: () => getItems<Disease>(STORAGE_KEYS.DISEASES),

  getById: (id: string) => getItemById<Disease>(STORAGE_KEYS.DISEASES, id),

  getByCattleId: async (cattleId: string): Promise<Disease[]> => {
    const allDiseases = await getItems<Disease>(STORAGE_KEYS.DISEASES);
    return allDiseases
      .filter((disease) => disease.cattleId === cattleId)
      .sort((a, b) => new Date(b.diagnosisDate).getTime() - new Date(a.diagnosisDate).getTime());
  },

  add: (disease: Omit<Disease, "id" | "createdAt" | "updatedAt">) => {
    const id = `disease_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return addItem<Disease>(STORAGE_KEYS.DISEASES, { ...disease, id } as Disease);
  },

  update: (id: string, updates: Partial<Disease>) => updateItem<Disease>(STORAGE_KEYS.DISEASES, id, updates),

  delete: (id: string) => deleteItem<Disease>(STORAGE_KEYS.DISEASES, id),

  getInTreatment: async (): Promise<(Disease & { cattle: Cattle })[]> => {
    const allDiseases = await getItems<Disease>(STORAGE_KEYS.DISEASES);
    const allCattle = await getItems<Cattle>(STORAGE_KEYS.CATTLE);

    const inTreatment = allDiseases.filter((disease) => disease.result === "in_treatment");

    return inTreatment
      .map((disease) => {
        const cattle = allCattle.find((c) => c.id === disease.cattleId);
        return cattle ? { ...disease, cattle } : null;
      })
      .filter((item): item is Disease & { cattle: Cattle } => item !== null);
  },
};

/**
 * Funções específicas para Produção de Leite
 */
export const milkProductionStorage = {
  getAll: () => getItems<MilkProductionRecord>(STORAGE_KEYS.MILK_PRODUCTION),

  getById: (id: string) => getItemById<MilkProductionRecord>(STORAGE_KEYS.MILK_PRODUCTION, id),

  getByCattleId: async (cattleId: string): Promise<MilkProductionRecord[]> => {
    const allRecords = await getItems<MilkProductionRecord>(STORAGE_KEYS.MILK_PRODUCTION);
    return allRecords
      .filter((record) => record.cattleId === cattleId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  add: (record: Omit<MilkProductionRecord, "id" | "createdAt" | "updatedAt">) => {
    const id = `milk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return addItem<MilkProductionRecord>(STORAGE_KEYS.MILK_PRODUCTION, { ...record, id } as MilkProductionRecord);
  },

  update: (id: string, updates: Partial<MilkProductionRecord>) =>
    updateItem<MilkProductionRecord>(STORAGE_KEYS.MILK_PRODUCTION, id, updates),

  delete: (id: string) => deleteItem<MilkProductionRecord>(STORAGE_KEYS.MILK_PRODUCTION, id),

  getRecent: async (limit = 20): Promise<(MilkProductionRecord & { cattle: Cattle })[]> => {
    const allRecords = await getItems<MilkProductionRecord>(STORAGE_KEYS.MILK_PRODUCTION);
    const allCattle = await getItems<Cattle>(STORAGE_KEYS.CATTLE);

    return allRecords
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit)
      .map((record) => {
        const cattle = allCattle.find((c) => c.id === record.cattleId);
        if (!cattle) return null;
        return { ...record, cattle };
      })
      .filter((item): item is MilkProductionRecord & { cattle: Cattle } => item !== null);
  },
};

/**
 * Função para limpar todos os dados (útil para testes)
 */
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
    console.error("Error clearing all data:", error);
    throw error;
  }
};

/**
 * Função para exportar todos os dados
 */
export const exportAllData = async (): Promise<string> => {
  const [cattle, vaccineCatalog, vaccinationRecords, pregnancies, diseases, milkProduction, preferences] =
    await Promise.all([
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

export const syncStorage = {
  getLastSync: async (): Promise<string | null> => {
    return AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  },
  setLastSync: async (timestamp: string): Promise<void> => {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp);
  },
};

/**
 * Função para importar dados
 */
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
    console.error("Error importing data:", error);
    throw error;
  }
};
