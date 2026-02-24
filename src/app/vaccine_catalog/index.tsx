import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ButtonAdd, CardEdit, IconSymbol } from "@/components";
import { ScreenContainer } from "@/components/screen-container";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useNavigation } from "@/hooks";
import { useColors } from "@/hooks/use-colors";
import useScreenHeader from "@/hooks/use-screen-header";
import { formatDate } from "@/lib/helpers";
import { logger } from "@/lib/logger";
import { vaccineCatalogStorage } from "@/lib/storage";
import { VaccineWithRecords } from "@/types";

export default function VaccineCatalogScreen() {
  const navigation = useNavigation();
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vaccines, setVaccines] = useState<VaccineWithRecords[]>([]);
  const [vaccineToDelete, setVaccineToDelete] = useState<VaccineWithRecords | null>(null);
  const insets = useSafeAreaInsets();

  useScreenHeader(
    "Catálogo de Vacinas",
    `${vaccines.length} ${vaccines.length === 1 ? "vacina" : "vacinas"} cadastradas`,
  );

  useFocusEffect(
    React.useCallback(() => {
      loadVaccines();
    }, []),
  );

  const loadVaccines = async () => {
    try {
      setLoading(true);
      const data = await vaccineCatalogStorage.getWithRecordCount();
      setVaccines(data);
    } catch (error) {
      logger.error("VaccineCatalog/loadVaccines", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const data = await vaccineCatalogStorage.getWithRecordCount();
      setVaccines(data);
    } catch (error) {
      logger.error("VaccineCatalog/handleRefresh", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteVaccine = async () => {
    if (!vaccineToDelete) return;

    try {
      await vaccineCatalogStorage.delete(vaccineToDelete.id);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      loadVaccines();
    } catch (error) {
      logger.error("VaccineCatalog/delete", error);
    } finally {
      setVaccineToDelete(null);
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0">
      <ConfirmDialog
        visible={!!vaccineToDelete}
        title="Excluir Vacina"
        message={
          vaccineToDelete && vaccineToDelete.recordCount > 0
            ? `Esta vaccine possui ${vaccineToDelete.recordCount} registros de aplicação. Ela será marcada como inativa em vez de excluída.`
            : "Tem certeza que deseja excluir esta vaccine do catálogo?"
        }
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmStyle="destructive"
        onConfirm={handleDeleteVaccine}
        onCancel={() => setVaccineToDelete(null)}
      />

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="p-6 gap-4 flex-1" style={{ paddingBottom: insets.bottom }}>
          {/* Empty State */}
          {vaccines.length === 0 ? (
            <View className="flex-1 items-center justify-center py-12">
              <IconSymbol name={"vaccines"} color={colors.muted} />
              <Text className="text-muted text-center text-base">Nenhuma vaccine cadastrada no catálogo</Text>
            </View>
          ) : (
            <View className="gap-3">
              {vaccines.map((vaccine) => (
                <CardEdit
                  key={vaccine.id}
                  title={vaccine.name}
                  icon="vaccines"
                  handleDelete={() => setVaccineToDelete(vaccine)}
                  handleEdit={() => navigation.navigate("VaccineCatalogCad", { id: vaccine.id })}
                >
                  <View className="flex-row">
                    <View className="flex-1">
                      <View className="flex-row gap-4 mt-2">
                        {vaccine.daysBetweenDoses !== undefined && vaccine.daysBetweenDoses > 0 && (
                          <Text className="text-xs text-muted">Intervalo: {vaccine.daysBetweenDoses} dias</Text>
                        )}
                      </View>
                      {vaccine.description && (
                        <Text className="text-sm text-muted mt-2" numberOfLines={2}>
                          {vaccine.description}
                        </Text>
                      )}
                    </View>
                    <View className="flex items-end gap-2 ">
                      <View className="bg-surface border border-border rounded-lg px-3 py-1">
                        <Text className="text-xs text-muted">
                          {vaccine.recordCount} aplicação{vaccine.recordCount !== 1 ? "ões" : ""}
                        </Text>
                      </View>
                      {vaccine.lastAppliedDate && (
                        <Text className="text-xs text-muted">Última: {formatDate(vaccine.lastAppliedDate)}</Text>
                      )}
                    </View>
                  </View>
                </CardEdit>
              ))}
            </View>
          )}
        </View>
        <View style={{ height: 60 }} />
      </ScrollView>
      <ButtonAdd
        label="Adicionar Vacina"
        color={colors.primary}
        icon="add"
        onPress={() => navigation.navigate("VaccineCatalogCad")}
      />
    </ScreenContainer>
  );
}
