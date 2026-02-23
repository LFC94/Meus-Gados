import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

import useNavigation from "./use-navigation";

export interface UseFormScreenOptions<T> {
  initialData: T;
  loadData?: () => Promise<T | null>;
  validate?: (data: T) => string | null;
  onSave: (data: T) => Promise<void>;
  onSuccess?: () => void;
  successMessage?: string;
}

export interface UseFormScreenReturn<T> {
  data: T;
  setData: React.Dispatch<React.SetStateAction<T>>;
  updateData: (updates: Partial<T>) => void;
  loading: boolean;
  saving: boolean;
  save: () => Promise<boolean>;
  reload: () => void;
}

export function useFormScreen<T>(options: UseFormScreenOptions<T>): UseFormScreenReturn<T> {
  const {
    initialData,
    loadData,
    validate,
    onSave,
    onSuccess,
    successMessage = "Registro salvo com sucesso!",
  } = options;

  const navigation = useNavigation();
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(!!loadData);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!loadData) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await loadData();
      if (result) {
        setData(result);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados");
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  useEffect(() => {
    load();
  }, [load]);

  const updateData = useCallback((updates: Partial<T>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const save = useCallback(async (): Promise<boolean> => {
    if (validate) {
      const error = validate(data);
      if (error) {
        Alert.alert("Erro", error);
        return false;
      }
    }

    try {
      setSaving(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      await onSave(data);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (onSuccess) {
        onSuccess();
      } else {
        Alert.alert("Sucesso", successMessage, [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      }

      return true;
    } catch (error) {
      console.error("Error saving data:", error);
      Alert.alert("Erro", "Não foi possível salvar o registro");
      return false;
    } finally {
      setSaving(false);
    }
  }, [data, validate, onSave, onSuccess, successMessage, navigation]);

  const reload = useCallback(() => {
    load();
  }, [load]);

  return {
    data,
    setData,
    updateData,
    loading,
    saving,
    save,
    reload,
  };
}
