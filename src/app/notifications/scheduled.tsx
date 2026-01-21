import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenContainer } from "@/components/screen-container";
import { useColors, useScreenHeader } from "@/hooks";
import { formatDate } from "@/lib/helpers";
import {
  cancelNotification,
  getScheduledNotifications,
  removeScheduledNotification,
  ScheduledNotification,
} from "@/lib/notifications";

export default function ScheduledNotificationsScreen() {
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<ScheduledNotification[]>([]);
  const insets = useSafeAreaInsets();
  useScreenHeader(
    "Notificações Agendadas",
    `${notifications.length} ${notifications.length === 1 ? "alerta" : "alertas"} ativo${notifications.length !== 1 ? "s" : ""}`,
  );

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, []),
  );

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getScheduledNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (notification: ScheduledNotification) => {
    Alert.alert("Remover Notificação", `Tem certeza que deseja remover este alerta?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            if (notification.notificationId) {
              await cancelNotification(notification.notificationId);
            }
            await removeScheduledNotification(notification.id, notification.type);
            loadNotifications();
          } catch (error) {
            Alert.alert("Erro", "Não foi possível remover a notificação" + error);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  const vaccineNotifications = notifications.filter((n) => n.type === "vaccine");
  const pregnancyNotifications = notifications.filter((n) => n.type === "pregnancy");

  return (
    <ScreenContainer className="p-6">
      <View className="flex-1 gap-4">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {notifications.length === 0 ? (
            <View className="flex-1 items-center justify-center py-12">
              <Text className="text-muted text-center text-base">Nenhuma notificação agendada no momento</Text>
            </View>
          ) : (
            <View className="gap-4 pb-6" style={{ paddingBottom: insets.bottom }}>
              {/* Vacinas */}
              {vaccineNotifications.length > 0 && (
                <View className="gap-3">
                  <Text className="text-lg font-semibold text-foreground">💉 Vacinas</Text>
                  {vaccineNotifications.map((notification) => (
                    <View key={notification.id} className="bg-surface rounded-2xl p-4 border border-border">
                      <View className="flex-row items-start justify-between mb-2">
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-foreground">{notification.cattleName}</Text>
                          <Text className="text-sm text-muted mt-1">{notification.title}</Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleRemove(notification)}
                          className="px-3 py-1 rounded-xl"
                          style={{ backgroundColor: colors.error + "20", opacity: 1 }}
                        >
                          <Text className="text-xs font-semibold" style={{ color: colors.error }}>
                            Remover
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <Text className="text-sm text-muted">
                        Agendado para: {formatDate(notification.scheduledDate)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Gestações */}
              {pregnancyNotifications.length > 0 && (
                <View className="gap-3">
                  <Text className="text-lg font-semibold text-foreground">🐄 Gestação/Parto</Text>
                  {pregnancyNotifications.map((notification) => (
                    <View key={notification.id} className="bg-surface rounded-2xl p-4 border border-border">
                      <View className="flex-row items-start justify-between mb-2">
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-foreground">{notification.cattleName}</Text>
                          <Text className="text-sm text-muted mt-1">{notification.title}</Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleRemove(notification)}
                          className="px-3 py-1 rounded-xl"
                          style={{ backgroundColor: colors.error + "20", opacity: 1 }}
                        >
                          <Text className="text-xs font-semibold" style={{ color: colors.error }}>
                            Remover
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <Text className="text-sm text-muted">
                        Agendado para: {formatDate(notification.scheduledDate)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}
