import { STORAGE_KEYS } from "@/constants/const";
import { Cattle, VaccinationRecord, VaccinationRecordWithDetails, VaccineModel, VaccineWithRecords } from "@/types";

import { addItem, deleteItem, getItemById, getItems, updateItem } from "./base";

export const vaccineCatalogStorage = {
  getAll: async (): Promise<VaccineModel[]> => {
    const items = await getItems<VaccineModel>(STORAGE_KEYS.VACCINE_CATALOG);
    return items.filter((v) => v.isActive);
  },

  getAllIncludingInactive: () => getItems<VaccineModel>(STORAGE_KEYS.VACCINE_CATALOG),

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
    const records = await getItems<VaccinationRecord>(STORAGE_KEYS.VACCINATION_RECORDS);
    const hasRecords = records.some((r) => r.vaccineId === id);

    if (hasRecords) {
      await updateItem<VaccineModel>(STORAGE_KEYS.VACCINE_CATALOG, id, {
        isActive: false,
      });
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

export const vaccinationRecordStorage = {
  getAll: () => getItems<VaccinationRecord>(STORAGE_KEYS.VACCINATION_RECORDS),

  getById: (id: string) => getItemById<VaccinationRecord>(STORAGE_KEYS.VACCINATION_RECORDS, id),

  getByCattleId: async (cattleId: string, limit = 10, offset = 0): Promise<VaccinationRecordWithDetails[]> => {
    const allRecords = await getItems<VaccinationRecord>(STORAGE_KEYS.VACCINATION_RECORDS);
    const allVaccineCatalog = await getItems<VaccineModel>(STORAGE_KEYS.VACCINE_CATALOG);
    return allRecords
      .filter((record) => record.cattleId === cattleId)
      .sort((a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime())
      .slice(offset, offset + limit)
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
    return addItem<VaccinationRecord>(STORAGE_KEYS.VACCINATION_RECORDS, {
      ...record,
      id,
    } as VaccinationRecord);
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
    await updateItem<VaccinationRecord>(STORAGE_KEYS.VACCINATION_RECORDS, id, {
      isNextDoseApplied: true,
    });
  },
};
