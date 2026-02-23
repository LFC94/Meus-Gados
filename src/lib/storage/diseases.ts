import { STORAGE_KEYS } from "@/constants/const";
import { Cattle, Disease } from "@/types";

import { addItem, deleteItem, getItemById, getItems, updateItem } from "./base";

export const diseaseStorage = {
  getAll: () => getItems<Disease>(STORAGE_KEYS.DISEASES),

  getById: (id: string) => getItemById<Disease>(STORAGE_KEYS.DISEASES, id),

  getByCattleId: async (cattleId: string, limit = 10, offset = 0): Promise<Disease[]> => {
    const allDiseases = await getItems<Disease>(STORAGE_KEYS.DISEASES);
    return allDiseases
      .filter((disease) => disease.cattleId === cattleId)
      .sort((a, b) => new Date(b.diagnosisDate).getTime() - new Date(a.diagnosisDate).getTime())
      .slice(offset, offset + limit);
  },

  add: (disease: Omit<Disease, "id" | "createdAt" | "updatedAt">) => {
    const id = `disease_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return addItem<Disease>(STORAGE_KEYS.DISEASES, {
      ...disease,
      id,
    } as Disease);
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
