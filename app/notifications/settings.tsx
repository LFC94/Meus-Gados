import { ScreenContainer } from "@/components/screen-container";
import { useNavigation, useScreenHeader } from "@/hooks";
import { useColors } from "@/hooks/use-colors";
import {
  getNotificationSettings,
  NotificationSettings,
  requestNotificationPermission,
  saveNotificationSettings,
} from "@/lib/notifications";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NotificationSettingsScreen() {
  const navigation = useNavigation();
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);

  const insets = useSafeAreaInsets();
  useScreenHeader("Configurações de Notificações");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getNotificationSettings();
      setSettings(data);

      // Verificar permissão
      if (Platform.OS !== "web") {
        const hasPermission = await requestNotificationPermission();
        setPermissionGranted(hasPermission);
      } else {
        setPermissionGranted(true);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      await saveNotificationSettings(settings);

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert("Sucesso", "Configurações salvas com sucesso!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("Error saving settings:", error);
      Alert.alert("Erro", "Não foi possível salvar as configurações");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6" style={{ paddingBottom: insets.bottom }}>
      <View className="flex-1 gap-4">
        {!permissionGranted && (
          <View className="bg-warning/20 rounded-xl p-4 border border-warning">
            <Text className="text-sm text-warning font-medium">
              ⚠️ Notificações não estão habilitadas. Verifique as permissões do aplicativo.
            </Text>
          </View>
        )}

        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="gap-6 pb-6">
            {/* Vacinas */}
            <View className="gap-3">
              <Text className="text-lg font-semibold text-foreground">💉 Vacinas</Text>

              <View className="bg-surface rounded-xl p-4 border border-border">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-base text-foreground font-medium">Ativar Notificações</Text>
                  <Switch
                    value={settings.vaccinesEnabled}
                    onValueChange={(value) => setSettings({ ...settings, vaccinesEnabled: value })}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.background}
                  />
                </View>

                {settings.vaccinesEnabled && (
                  <>
                    <View className="border-t border-border pt-3 gap-3">
                      <View>
                        <Text className="text-sm text-muted mb-2">Alertar com antecedência (dias)</Text>
                        <View className="bg-background rounded-lg px-4 py-3 border border-border">
                          <TextInput
                            placeholder="Dias"
                            placeholderTextColor={colors.muted}
                            value={String(settings.vaccineAlertDaysBefore)}
                            onChangeText={(text) => {
                              const num = parseInt(text) || 0;
                              setSettings({
                                ...settings,
                                vaccineAlertDaysBefore: Math.max(0, num),
                              });
                            }}
                            keyboardType="number-pad"
                            className="text-base text-foreground"
                            style={{ padding: 0 }}
                          />
                        </View>
                        <Text className="text-xs text-muted mt-1">
                          Você receberá alertas {settings.vaccineAlertDaysBefore} dias antes da próxima dose
                        </Text>
                      </View>
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Gestação */}
            <View className="gap-3">
              <Text className="text-lg font-semibold text-foreground">🐄 Gestação/Parto</Text>

              <View className="bg-surface rounded-xl p-4 border border-border">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-base text-foreground font-medium">Ativar Notificações</Text>
                  <Switch
                    value={settings.pregnancyEnabled}
                    onValueChange={(value) => setSettings({ ...settings, pregnancyEnabled: value })}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.background}
                  />
                </View>

                {settings.pregnancyEnabled && (
                  <>
                    <View className="border-t border-border pt-3 gap-3">
                      <View>
                        <Text className="text-sm text-muted mb-2">Alertar com antecedência (dias)</Text>
                        <View className="bg-background rounded-lg px-4 py-3 border border-border">
                          <TextInput
                            placeholder="Dias"
                            placeholderTextColor={colors.muted}
                            value={String(settings.pregnancyAlertDaysBefore)}
                            onChangeText={(text) => {
                              const num = parseInt(text) || 0;
                              setSettings({
                                ...settings,
                                pregnancyAlertDaysBefore: Math.max(0, num),
                              });
                            }}
                            keyboardType="number-pad"
                            className="text-base text-foreground"
                            style={{ padding: 0 }}
                          />
                        </View>
                        <Text className="text-xs text-muted mt-1">
                          Você receberá alertas {settings.pregnancyAlertDaysBefore} dias antes da data prevista de parto
                        </Text>
                      </View>
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Horário */}
            <View className="gap-3">
              <Text className="text-lg font-semibold text-foreground">⏰ Horário</Text>

              <View className="bg-surface rounded-xl p-4 border border-border">
                <View>
                  <Text className="text-sm text-muted mb-2">Horário das Notificações</Text>
                  <View className="bg-background rounded-lg px-4 py-3 border border-border">
                    <TextInput
                      placeholder="HH:MM"
                      placeholderTextColor={colors.muted}
                      value={settings.notificationTime}
                      onChangeText={(text) => {
                        // Validar formato HH:MM
                        if (/^\d{0,2}:?\d{0,2}$/.test(text)) {
                          setSettings({ ...settings, notificationTime: text });
                        }
                      }}
                      maxLength={5}
                      className="text-base text-foreground"
                      style={{ padding: 0 }}
                    />
                  </View>
                  <Text className="text-xs text-muted mt-1">
                    As notificações serão enviadas neste horário (ex: 09:00)
                  </Text>
                </View>
              </View>
            </View>

            {/* Info */}
            <View className="bg-surface rounded-xl p-4 border border-border">
              <Text className="text-sm text-muted text-center">
                💡 As notificações serão agendadas automaticamente quando você adicionar vacinas ou gestações. Você pode
                gerenciar as notificações agendadas na tela de histórico.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className="bg-primary rounded-full p-4 items-center"
          style={{ opacity: saving ? 0.6 : 1 }}
        >
          {saving ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text className="text-background font-semibold text-base">Salvar Configurações</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
