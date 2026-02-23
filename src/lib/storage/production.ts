import { STORAGE_KEYS } from "@/constants/const";
import { Cattle, MilkProductionRecord } from "@/types";

import { addItem, deleteItem, getItemById, getItems, updateItem } from "./base";

export const milkProductionStorage = {
  getAll: () => getItems<MilkProductionRecord>(STORAGE_KEYS.MILK_PRODUCTION),

  getById: (id: string) => getItemById<MilkProductionRecord>(STORAGE_KEYS.MILK_PRODUCTION, id),

  getByCattleId: async (cattleId: string, limit = 10, offset = 0): Promise<MilkProductionRecord[]> => {
    const allRecords = await getItems<MilkProductionRecord>(STORAGE_KEYS.MILK_PRODUCTION);
    return allRecords
      .filter((record) => record.cattleId === cattleId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(offset, offset + limit);
  },

  add: (record: Omit<MilkProductionRecord, "id" | "createdAt" | "updatedAt">) => {
    const id = `milk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return addItem<MilkProductionRecord>(STORAGE_KEYS.MILK_PRODUCTION, {
      ...record,
      id,
    } as MilkProductionRecord);
  },

  update: (id: string, updates: Partial<MilkProductionRecord>) =>
    updateItem<MilkProductionRecord>(STORAGE_KEYS.MILK_PRODUCTION, id, updates),

  delete: (id: string) => deleteItem<MilkProductionRecord>(STORAGE_KEYS.MILK_PRODUCTION, id),

  getRecent: async (limit = 10, offset = 0): Promise<(MilkProductionRecord & { cattle: Cattle })[]> => {
    const allRecords = await getItems<MilkProductionRecord>(STORAGE_KEYS.MILK_PRODUCTION);
    const allCattle = await getItems<Cattle>(STORAGE_KEYS.CATTLE);

    return allRecords
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(offset, offset + limit)
      .map((record) => {
        const cattle = allCattle.find((c) => c.id === record.cattleId);
        if (!cattle) return null;
        return { ...record, cattle };
      })
      .filter((item): item is MilkProductionRecord & { cattle: Cattle } => item !== null);
  },
};
