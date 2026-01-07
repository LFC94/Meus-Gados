import { ConfirmDialog } from "@/components/confirm-dialog";
import { IconSymbol } from "@/components/icon-symbol";
import { ScreenContainer } from "@/components/screen-container";
import { useNavigation } from "@/hooks";
import { useColors } from "@/hooks/use-colors";
import useScreenHeader from "@/hooks/use-screen-header";
import { formatDate } from "@/lib/helpers";
import { vaccineCatalogStorage } from "@/lib/storage";
import { VaccineWithRecords } from "@/types";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { ActivityIndicator, Platform, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
    `${vaccines.length} ${vaccines.length === 1 ? "vacina" : "vacinas"} cadastradas`
  );

  useFocusEffect(
    React.useCallback(() => {
      loadVaccines();
    }, [])
  );

  const loadVaccines = async () => {
    try {
      setLoading(true);
      const data = await vaccineCatalogStorage.getWithRecordCount();
      setVaccines(data);
    } catch (error) {
      console.error("Error loading vaccine catalog:", error);
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
      console.error("Error refreshing vaccine catalog:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteVaccine = async () => {
    if (!vaccineToDelete) return;

    try {
      await vaccineCatalogStorage.delete(vaccineToDelete.id);

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      loadVaccines();
    } catch (error) {
      console.error("Error deleting vaccine:", error);
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
          {/* Info Card */}
          <View className="bg-primary/10 rounded-xl p-4 border border-primary/30">
            <Text className="text-primary font-semibold">💡 Dica</Text>
            <Text className="text-sm text-muted mt-1">
              Cadastre as vacunas que você utiliza regularmente. Ao vacinar um animal, você poderá selecionar
              rápidamente do catálogo.
            </Text>
          </View>

          {/* Empty State */}
          {vaccines.length === 0 ? (
            <View className="flex-1 items-center justify-center py-12">
              <Text className="text-4xl mb-4">💉</Text>
              <Text className="text-muted text-center text-base">Nenhuma vaccine cadastrada no catálogo</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("VaccineCatalogAdd")}
                className="mt-4 bg-primary rounded-full px-6 py-3"
                style={{ opacity: 1 }}
              >
                <Text className="text-white font-semibold">Cadastrar Primeira Vacina</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="gap-3">
              {vaccines.map((vaccine) => (
                <TouchableOpacity
                  key={vaccine.id}
                  onPress={() => navigation.navigate("VaccineCatalogEdit", { id: vaccine.id })}
                  className="bg-surface rounded-2xl p-4 border border-border"
                  style={{ opacity: 1 }}
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-xl">💉</Text>
                        <Text className="text-lg font-semibold text-foreground">{vaccine.name}</Text>
                        {!vaccine.isActive && (
                          <Text className="text-xs px-2 py-0.5 bg-error/20 text-error rounded-full">Inativa</Text>
                        )}
                      </View>

                      {vaccine.manufacturer && (
                        <Text className="text-sm text-muted mt-1">Fabricante: {vaccine.manufacturer}</Text>
                      )}

                      <View className="flex-row gap-4 mt-2">
                        {vaccine.batchNumber && <Text className="text-xs text-muted">Lote: {vaccine.batchNumber}</Text>}
                        {vaccine.daysBetweenDoses !== undefined && vaccine.daysBetweenDoses > 0 && (
                          <Text className="text-xs text-muted">Intervalo: {vaccine.daysBetweenDoses} dias</Text>
                        )}
                      </View>

                      {vaccine.description && (
                        <Text className="text-sm text-muted mt-2" numberOfLines={2}>
                          {vaccine.description}
                        </Text>
                      )}

                      <View className="flex-row items-center gap-2 mt-3">
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

                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        onPress={() => navigation.navigate("VaccineCatalogEdit", { id: vaccine.id })}
                        className="w-8 h-8 items-center justify-center"
                        style={{ opacity: 1 }}
                      >
                        <IconSymbol name="pencil" size={18} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setVaccineToDelete(vaccine)}
                        className="w-8 h-8 items-center justify-center"
                        style={{ opacity: 1 }}
                      >
                        <IconSymbol name="trash" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Add Button */}
          {vaccines.length > 0 && (
            <TouchableOpacity
              onPress={() => navigation.navigate("VaccineCatalogAdd")}
              className="bg-primary rounded-full p-4 items-center mt-2"
              style={{ opacity: 1 }}
            >
              <Text className="text-white font-semibold text-base">+ Cadastrar Nova Vacina</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
