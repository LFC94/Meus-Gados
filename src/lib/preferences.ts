import AsyncStorage from "@react-native-async-storage/async-storage";

import { STORAGE_KEYS } from "@/constants/const";

import { logger } from "./logger";

export type Unit = "kg" | "arrobas";
export type Language = "pt" | "en";
export type Theme = "dark" | "light" | "system";

export interface AppPreferences {
  unit: Unit;
  language: Language;
  theme: Theme;
  backupEnabled?: boolean;
  backupFrequency?: "daily" | "weekly";
}

const PREFERENCES_KEY = STORAGE_KEYS.PREFERENCES;

const DEFAULT_PREFERENCES: AppPreferences = {
  unit: "kg",
  language: "pt",
  theme: "system",
};

export const preferencesStorage = {
  async getPreferences(): Promise<AppPreferences> {
    try {
      const data = await AsyncStorage.getItem(PREFERENCES_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return DEFAULT_PREFERENCES;
    } catch (error) {
      logger.error("preferences/get", error);
      return DEFAULT_PREFERENCES;
    }
  },

  async updatePreferences(preferences: Partial<AppPreferences>): Promise<void> {
    try {
      const current = await this.getPreferences();
      const updated = { ...current, ...preferences };
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
    } catch (error) {
      logger.error("preferences/update", error);
      throw error;
    }
  },

  async updateUnit(unit: Unit): Promise<void> {
    return this.updatePreferences({ unit });
  },

  async updateLanguage(language: Language): Promise<void> {
    return this.updatePreferences({ language });
  },

  async updateTheme(theme: Theme): Promise<void> {
    return this.updatePreferences({ theme });
  },

  async getTheme(): Promise<Theme> {
    const prefs = await this.getPreferences();
    return prefs.theme;
  },

  async reset(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PREFERENCES_KEY);
    } catch (error) {
      logger.error("preferences/reset", error);
      throw error;
    }
  },
};
