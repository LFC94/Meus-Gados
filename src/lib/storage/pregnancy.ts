import { STORAGE_KEYS } from "@/constants/const";
import { Cattle, Pregnancy } from "@/types";

import { addItem, deleteItem, getItemById, getItems, updateItem } from "./base";

export const pregnancyStorage = {
  getAll: () => getItems<Pregnancy>(STORAGE_KEYS.PREGNANCIES),

  getById: (id: string) => getItemById<Pregnancy>(STORAGE_KEYS.PREGNANCIES, id),

  getByCattleId: async (cattleId: string): Promise<Pregnancy[]> => {
    const allPregnancies = await getItems<Pregnancy>(STORAGE_KEYS.PREGNANCIES);
    return allPregnancies.filter((pregnancy) => pregnancy.cattleId === cattleId);
  },

  add: (pregnancy: Omit<Pregnancy, "id" | "createdAt" | "updatedAt">) => {
    const id = `pregnancy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return addItem<Pregnancy>(STORAGE_KEYS.PREGNANCIES, {
      ...pregnancy,
      id,
    } as Pregnancy);
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
