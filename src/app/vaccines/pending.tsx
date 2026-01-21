import { useFocusEffect } from "@react-navigation/native";
import React, { useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenContainer } from "@/components/screen-container";
import { useNavigation } from "@/hooks";
import { useColors } from "@/hooks/use-colors";
import { daysUntil, formatDate, getVaccineStatus, getVaccineStatusColor } from "@/lib/helpers";
import { vaccinationRecordStorage } from "@/lib/storage";
import { Cattle, VaccinationRecordWithDetails } from "@/types";

export default function PendingVaccinesScreen() {
  const navigation = useNavigation();
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingVaccines, setPendingVaccines] = useState<(VaccinationRecordWithDetails & { cattle: Cattle })[]>([]);
  const insets = useSafeAreaInsets();
  useFocusEffect(
    React.useCallback(() => {
      loadPendingVaccines();
    }, []),
  );

  const loadPendingVaccines = async () => {
    try {
      setLoading(true);
      const data = await vaccinationRecordStorage.getPending();
      setPendingVaccines(data);
    } catch (error) {
      console.error("Error loading pending vaccines:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const data = await vaccinationRecordStorage.getPending();
      setPendingVaccines(data);
    } catch (error) {
      console.error("Error refreshing pending vaccines:", error);
    } finally {
      setRefreshing(false);
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
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
        contentContainerStyle={{ flexGrow: 1 }}
        style={{ paddingBottom: insets.bottom }}
      >
        <View className="p-6 gap-4 flex-1">
          {/* List */}
          {pendingVaccines.length === 0 ? (
            <View className="flex-1 items-center justify-center py-12">
              <Text className="text-muted text-center text-base">Nenhuma vacina pendente no momento</Text>
            </View>
          ) : (
            <View className="gap-3 pb-6">
              {pendingVaccines.map((item) => {
                const status = getVaccineStatus(item.nextDoseDate);
                const statusColor = getVaccineStatusColor(status);
                const days = item.nextDoseDate ? daysUntil(item.nextDoseDate) : 0;
                const isOverdue = days < 0;

                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => navigation.navigate("CattleDetail", { id: item.cattleId })}
                    className="bg-surface rounded-2xl p-4 border border-border"
                    style={{ opacity: 1 }}
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-foreground">
                          {item.cattle.name || `Animal ${item.cattle.number}`}
                        </Text>
                        <Text className="text-sm text-muted mt-1">Nº {item.cattle.number}</Text>
                        <Text className="text-sm text-foreground font-medium mt-2">{item.vaccineName}</Text>
                        {item.nextDoseDate && (
                          <Text className="text-sm text-muted mt-1">Próxima dose: {formatDate(item.nextDoseDate)}</Text>
                        )}
                      </View>
                      <View className="px-3 py-1 rounded-full" style={{ backgroundColor: statusColor + "20" }}>
                        <Text className="text-xs font-semibold" style={{ color: statusColor }}>
                          {isOverdue ? `${Math.abs(days)}d atrasada` : `${days}d restantes`}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-border">
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate("VaccineCad", {
                            cattleId: item.cattleId,
                            vaccineId: item.vaccineId,
                            previousRecordId: item.id,
                          })
                        }
                        className="flex-1  rounded-lg p-2 items-center mr-2 bg-primary/10"
                      >
                        <Text className="text-primary font-semibold text-sm">Aplicar Dose</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => navigation.navigate("CattleDetail", { id: item.cattleId })}
                        className="flex-1 bg-surface border border-border rounded-lg p-2 items-center"
                      >
                        <Text className="text-foreground text-sm">Ver Animal</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
