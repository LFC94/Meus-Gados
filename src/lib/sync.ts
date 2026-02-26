import AsyncStorage from "@react-native-async-storage/async-storage";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

import { STORAGE_KEYS } from "@/constants/const";
import { SyncBase } from "@/types";

import { logger } from "./logger";
import { getAllItemsIncludingDeleted, syncStorage } from "./storage";

type SyncCollection = keyof typeof STORAGE_KEYS;

const COLLECTIONS_TO_SYNC: SyncCollection[] = [
  "CATTLE",
  "VACCINE_CATALOG",
  "VACCINATION_RECORDS",
  "PREGNANCIES",
  "DISEASES",
  "MILK_PRODUCTION",
];

export const syncService = {
  /**
   * Performs a full synchronization cycle for all collections
   */
  async syncAll(): Promise<{ success: boolean; error?: string }> {
    const user = auth().currentUser;
    if (!user) return { success: false, error: "Usuário não autenticado" };

    try {
      const userId = user.uid;
      const currentSyncTime = new Date().toISOString();

      // Sync user info first
      await this.syncUserInfo(userId, user);

      for (const collectionKey of COLLECTIONS_TO_SYNC) {
        await this.syncCollection(userId, collectionKey);
      }

      await syncStorage.setLastSync(currentSyncTime);
      return { success: true };
    } catch (error) {
      logger.error("sync/syncAll", error);
      return { success: false, error: (error as Error).message };
    }
  },

  /**
   * Syncs user information to Firestore
   */
  async syncUserInfo(userId: string, user: FirebaseAuthTypes.User | null) {
    try {
      const userDocRef = firestore().collection("users").doc(userId);
      const docSnapshot = await userDocRef.get();

      if (!docSnapshot.data()?.nome && user) {
        await userDocRef.set(
          {
            nome: user.displayName,
            email: user.email,
          },
          { merge: true },
        );
      }
    } catch (error) {
      logger.error("sync/syncUserInfo", error);
    }
  },

  /**
   * Syncs a specific collection between local and cloud
   */
  async syncCollection(userId: string, collectionKey: SyncCollection) {
    const storageKey = STORAGE_KEYS[collectionKey];
    const firestorePath = `users/${userId}/${collectionKey.toLowerCase()}`;

    // 1. Get local data (including deleted)
    const localItems = await getAllItemsIncludingDeleted<SyncBase>(storageKey);

    // 2. Get cloud data (only what changed since last sync)
    const lastSync = await syncStorage.getLastSync();
    const collectionRef = firestore().collection(firestorePath);
    let cloudSnapshot: FirebaseFirestoreTypes.QuerySnapshot;

    try {
      if (lastSync) {
        // Fetch only items updated after last sync
        cloudSnapshot = await collectionRef.where("updatedAt", ">", lastSync).get();
      } else {
        cloudSnapshot = await collectionRef.get();
      }
    } catch (error) {
      logger.error(`sync/syncCollection/${collectionKey}`, error);
      // Fallback: try without filter if filter fails
      cloudSnapshot = await collectionRef.get();
    }

    const cloudItems = cloudSnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as SyncBase[];

    // 3. Merge Strategy: Last Write Wins
    const mergedItemsMap = new Map<string, SyncBase>();

    // Add all local items to map
    localItems.forEach((item) => mergedItemsMap.set(item.id, item));

    // Update or add cloud items if they are newer
    cloudItems.forEach((cloudItem) => {
      const localItem = mergedItemsMap.get(cloudItem.id);
      if (!localItem || new Date(cloudItem.updatedAt) > new Date(localItem.updatedAt)) {
        mergedItemsMap.set(cloudItem.id, cloudItem);
      }
    });

    const finalItems = Array.from(mergedItemsMap.values());

    // 4. Push updates to Cloud
    // Only push items that are newer locally or don't exist in cloud snapshot (if we didn't filter by timestamp)
    // To be safe and simple: push anything updated after lastSync
    const itemsToPush = localItems.filter((item) => !lastSync || new Date(item.updatedAt) > new Date(lastSync));

    const batch = firestore().batch();
    itemsToPush.forEach((item) => {
      const docRef = firestore().collection(firestorePath).doc(item.id);
      batch.set(docRef, item, { merge: true });
    });

    if (itemsToPush.length > 0) {
      await batch.commit();
    }

    // 5. Save merged result to local storage
    await AsyncStorage.setItem(storageKey, JSON.stringify(finalItems));
  },
};
