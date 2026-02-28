import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  addItem,
  deleteItem,
  getAllItemsIncludingDeleted,
  getItemById,
  getItems,
  notifyStorageChanges,
  setItems,
  subscribeToStorageChanges,
  updateItem,
} from "../../lib/storage/base";

interface TestItem {
  id: string;
  name: string;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "@test/items";

describe("storage/base", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  describe("getItems", () => {
    it("should return empty array when no data", async () => {
      const result = await getItems<TestItem>(STORAGE_KEY);
      expect(result).toEqual([]);
    });

    it("should return items excluding deleted", async () => {
      const items: TestItem[] = [
        {
          id: "1",
          name: "Item 1",
          isDeleted: false,
          createdAt: "",
          updatedAt: "",
        },
        {
          id: "2",
          name: "Item 2",
          isDeleted: true,
          createdAt: "",
          updatedAt: "",
        },
      ];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));

      const result = await getItems<TestItem>(STORAGE_KEY);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });
  });

  describe("getAllItemsIncludingDeleted", () => {
    it("should return all items including deleted", async () => {
      const items: TestItem[] = [
        {
          id: "1",
          name: "Item 1",
          isDeleted: false,
          createdAt: "",
          updatedAt: "",
        },
        {
          id: "2",
          name: "Item 2",
          isDeleted: true,
          createdAt: "",
          updatedAt: "",
        },
      ];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));

      const result = await getAllItemsIncludingDeleted<TestItem>(STORAGE_KEY);
      expect(result).toHaveLength(2);
    });
  });

  describe("setItems", () => {
    it("should save items to storage", async () => {
      const items: TestItem[] = [{ id: "1", name: "Item 1", createdAt: "", updatedAt: "" }];

      await setItems(STORAGE_KEY, items);

      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(stored || "[]");
      expect(parsed).toHaveLength(1);
      expect(parsed[0].name).toBe("Item 1");
    });
  });

  describe("addItem", () => {
    it("should add new item with timestamps", async () => {
      const newItem: Partial<TestItem> = {
        id: "1",
        name: "New Item",
      };

      const result = await addItem(STORAGE_KEY, newItem as TestItem);

      expect(result.id).toBe("1");
      expect(result.name).toBe("New Item");
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(result.isDeleted).toBe(false);
    });

    it("should add item to existing list", async () => {
      const existingItem = {
        id: "1",
        name: "Existing",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
        isDeleted: false,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([existingItem]));

      const newItem = { id: "2", name: "New" };
      await addItem(STORAGE_KEY, newItem as TestItem);

      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const items = JSON.parse(stored || "[]");
      expect(items).toHaveLength(2);
    });
  });

  describe("updateItem", () => {
    it("should update existing item", async () => {
      const items: TestItem[] = [
        {
          id: "1",
          name: "Original",
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
      ];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));

      const result = await updateItem(STORAGE_KEY, "1", {
        updatedAt: "2025-01-01",
      });

      expect(result?.updatedAt).not.toBe("2024-01-01");
    });
  });

  describe("deleteItem", () => {
    it("should soft delete item", async () => {
      const items: TestItem[] = [
        {
          id: "1",
          name: "Item",
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
      ];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));

      const result = await deleteItem(STORAGE_KEY, "1");

      expect(result).toBe(true);

      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(stored || "[]");
      expect(parsed[0].isDeleted).toBe(true);
    });

    it("should return false for non-existent item", async () => {
      const result = await deleteItem(STORAGE_KEY, "non-existent");
      expect(result).toBe(false);
    });
  });

  describe("getItemById", () => {
    it("should return item by id", async () => {
      const items: TestItem[] = [
        { id: "1", name: "Item 1", createdAt: "", updatedAt: "" },
        { id: "2", name: "Item 2", createdAt: "", updatedAt: "" },
      ];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));

      const result = await getItemById<TestItem>(STORAGE_KEY, "1");

      expect(result?.name).toBe("Item 1");
    });

    it("should return null for non-existent id", async () => {
      const result = await getItemById<TestItem>(STORAGE_KEY, "non-existent");
      expect(result).toBeNull();
    });

    it("should not return deleted items", async () => {
      const items: TestItem[] = [
        {
          id: "1",
          name: "Deleted",
          isDeleted: true,
          createdAt: "",
          updatedAt: "",
        },
      ];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));

      const result = await getItemById<TestItem>(STORAGE_KEY, "1");
      expect(result).toBeNull();
    });
  });

  describe("storage listeners", () => {
    it("should notify listeners on changes", () => {
      const callback = jest.fn();
      subscribeToStorageChanges(callback);

      notifyStorageChanges();

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should unsubscribe listener", () => {
      const callback = jest.fn();
      const unsubscribe = subscribeToStorageChanges(callback);

      unsubscribe();
      notifyStorageChanges();

      expect(callback).not.toHaveBeenCalled();
    });

    it("should handle multiple listeners", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      subscribeToStorageChanges(callback1);
      subscribeToStorageChanges(callback2);

      notifyStorageChanges();

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });
  });
});
