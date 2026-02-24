import AsyncStorage from "@react-native-async-storage/async-storage";

import { SyncBase } from "@/types";
import { logger } from "../logger";

export type StorageListener = () => void;
const listeners: StorageListener[] = [];

export const subscribeToStorageChanges = (callback: StorageListener) => {
  listeners.push(callback);
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) listeners.splice(index, 1);
  };
};

export const notifyStorageChanges = () => {
  listeners.forEach((listener) => listener());
};

export async function getItems<T extends { isDeleted?: boolean }>(
  key: string,
): Promise<T[]> {
  try {
    const data = await AsyncStorage.getItem(key);
    const items: T[] = data ? JSON.parse(data) : [];
    return items.filter((item) => !item.isDeleted);
  } catch (error) {
    logger.error(`storage/getItems/${key}`, error);
    return [];
  }
}

export async function getAllItemsIncludingDeleted<T>(
  key: string,
): Promise<T[]> {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    logger.error(`storage/getAllItemsIncludingDeleted/${key}`, error);
    return [];
  }
}

export async function setItems<T>(key: string, items: T[]): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(items));
  } catch (error) {
    logger.error(`storage/setItems/${key}`, error);
    throw error;
  }
}

export async function addItem<T extends SyncBase>(
  key: string,
  item: T,
): Promise<T> {
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

export async function updateItem<T extends SyncBase>(
  key: string,
  id: string,
  updates: Partial<T>,
): Promise<T | null> {
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

export async function deleteItem<
  T extends { id: string; isDeleted?: boolean; updatedAt: string },
>(key: string, id: string): Promise<boolean> {
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

export async function getItemById<T extends SyncBase>(
  key: string,
  id: string,
): Promise<T | null> {
  const items = await getItems<T>(key);
  return items.find((item) => item.id === id) || null;
}
