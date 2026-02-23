import { STORAGE_KEYS } from "@/constants/const";
import { Cattle } from "@/types";

import { addItem, deleteItem, getItemById, getItems, updateItem } from "./base";

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
