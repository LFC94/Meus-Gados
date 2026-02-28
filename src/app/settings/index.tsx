import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
import { useFocusEffect } from "@react-navigation/native";
import Constants from "expo-constants";
import { impactAsync, ImpactFeedbackStyle, notificationAsync, NotificationFeedbackType } from "expo-haptics";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FormInput, FormTimePicker, IconSymbol, LoadingScreen } from "@/components";
import { ScreenContainer } from "@/components/screen-container";
import { STATUS_CATTLE } from "@/constants/const";
import { useAuth, useColors, useScreenHeader } from "@/hooks";
import { logger } from "@/lib/logger";
import {
  getNotificationSettings,
  NotificationSettings,
  requestNotificationPermission,
  saveNotificationSettings,
} from "@/lib/notifications";
import { seedDatabase } from "@/lib/storage/seed";
import { useThemeContext } from "@/lib/theme-provider";

export default function SettingsScreen() {
  const { theme, setTheme } = useThemeContext();
  const colors = useColors();
  const { user, signInWithGoogle, signOut, syncData, isSyncing } = useAuth();
  const [isSeeding, setIsSeeding] = useState(false);

  const [loading, setLoading] = useState(true);

  // Notification states
  const [notifSaving, setNotifSaving] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [notifSettings, setNotifSettings] = useState<NotificationSettings | null>(null);

  // Sync states
  const [authLoading, setAuthLoading] = useState(false);
  const [lastSyncStatus, setLastSyncStatus] = useState<string | null>(null);

  const insets = useSafeAreaInsets();
  useScreenHeader("Configurações");

  useEffect(() => {
    loadSettings();
    loadNotificationSettings();
  }, []);

  useEffect(() => {
    const loadLastSync = async () => {
      const { syncStorage } = await import("@/lib/storage");
      const lastSync = await syncStorage.getLastSync();
      if (lastSync) {
        setLastSyncStatus(`Última sincronização: ${new Date(lastSync).toLocaleString()}`);
      }
    };
    if (user) loadLastSync();
  }, [user, isSyncing]);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
      loadNotificationSettings();
    }, []),
  );

  const loadSettings = async () => {
    try {
      setLoading(true);
    } catch (error) {
      logger.error("Settings/loadSettings", error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotificationSettings = async () => {
    try {
      const data = await getNotificationSettings();
      setNotifSettings(data);
      const hasPermission = await requestNotificationPermission();
      setPermissionGranted(hasPermission);
    } catch (error) {
      logger.error("Settings/loadNotificationSettings", error);
    }
  };

  const handleNotifSave = async () => {
    if (!notifSettings) return;
    try {
      setNotifSaving(true);
      impactAsync(ImpactFeedbackStyle.Light);
      await saveNotificationSettings(notifSettings);
      notificationAsync(NotificationFeedbackType.Success);
      Alert.alert("Sucesso", "Configurações de notificações salvas!");
    } catch (error) {
      logger.error("Settings/saveNotificationSettings", error);
      Alert.alert("Erro", "Não foi possível salvar as notificações");
    } finally {
      setNotifSaving(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    try {
      await signInWithGoogle();
      await syncData();
    } catch (error) {
      logger.error("Settings/googleSignIn", error);
      Alert.alert("Erro de Autenticação", "Não foi possível realizar o login.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleManualSync = async () => {
    const result = await syncData();
    if (result.success) {
      setLastSyncStatus(`Última sincronização: ${new Date().toLocaleTimeString()}`);
      Alert.alert("Sucesso", "Dados sincronizados com sucesso!");
    } else {
      Alert.alert("Erro", result.error || "Erro ao sincronizar dados.");
    }
  };

  const handleThemeChange = async (newTheme: "dark" | "light" | "system") => {
    try {
      setTheme(newTheme);
      impactAsync(ImpactFeedbackStyle.Light);
    } catch (error) {
      logger.error("Settings/changeTheme", error);
      Alert.alert("Erro", "Não foi possível atualizar o tema");
    }
  };

  const handleSeedData = async () => {
    Alert.alert(
      "Seed de Dados",
      "Isso irá apagar todos os dados locais e criar novos dados de teste. Deseja continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sim, Popular",
          onPress: async () => {
            try {
              setIsSeeding(true);
              await seedDatabase();
              notificationAsync(NotificationFeedbackType.Success);
              Alert.alert("Sucesso", "Banco de dados populado com sucesso!");
              loadSettings();
            } catch (error) {
              logger.error("Settings/seedData", error);
              Alert.alert("Erro", "Falha ao realizar seed de dados");
            } finally {
              setIsSeeding(false);
            }
          },
        },
      ],
    );
  };

  if (loading) return <LoadingScreen />;

  return (
    <ScreenContainer className="p-0">
      <View className="flex-1" style={{ paddingBottom: insets.bottom }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="gap-6 p-4 pb-10">
            {/* 1. Perfil e Sincronização */}
            <View className="gap-3">
              <Text className="text-lg font-semibold text-foreground">Sincronização em Nuvem</Text>
              <View className="bg-surface rounded-2xl p-6 border border-border gap-4">
                {user ? (
                  <>
                    <View className="flex-row items-center gap-4">
                      <Image
                        source={{ uri: user.photoURL || "" }}
                        className="w-14 h-14 rounded-full border border-border"
                      />
                      <View className="flex-1">
                        <Text className="font-bold text-foreground text-lg" numberOfLines={1}>
                          {user.displayName || "Usuário"}
                        </Text>
                        <Text className="text-muted text-sm" numberOfLines={1}>
                          {user.email}
                        </Text>
                      </View>
                    </View>

                    <View className="bg-muted p-3 rounded-md">
                      <Text className="text-xs text-surface text-center italic">
                        {lastSyncStatus || "Aguardando sincronização..."}
                      </Text>
                    </View>

                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        onPress={handleManualSync}
                        disabled={isSyncing}
                        className="flex-1 border border-primary py-3 bg-primary/10 rounded-xl flex-row justify-center items-center gap-2"
                      >
                        {isSyncing ? (
                          <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                          <Text className="text-primary font-bold">☁️ Sincronizar Agora</Text>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => signOut()}
                        className=" bg-error/10 border border-error/20 px-4 py-3 rounded-xl justify-center items-center"
                      >
                        <Text className="text-error font-semibold">Sair</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <View className="items-center gap-4">
                    <Text className="text-muted text-center text-sm">
                      Faça login com sua conta Google para salvar seus dados na nuvem e acessar de outros aparelhos.
                    </Text>
                    {authLoading ? (
                      <ActivityIndicator color={colors.primary} />
                    ) : (
                      <>
                        <GoogleSigninButton
                          size={GoogleSigninButton.Size.Wide}
                          color={GoogleSigninButton.Color.Dark}
                          onPress={handleGoogleSignIn}
                          disabled={authLoading}
                        />
                      </>
                    )}
                  </View>
                )}
              </View>
            </View>

            {/* 3. Tema */}
            <View className="gap-3">
              <Text className="text-lg font-semibold text-foreground">Aparência</Text>
              <View className="bg-surface rounded-2xl p-2 border border-border flex-row">
                {(["light", "dark", "system"] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => handleThemeChange(t)}
                    className={`flex-1 py-3 px-1 rounded-xl items-center ${theme === t ? "bg-primary" : "bg-transparent"}`}
                  >
                    <Text className={`font-bold text-xs ${theme === t ? "text-white" : "text-muted"}`}>
                      {t === "light" ? "Claro" : t === "dark" ? "Escuro" : "Sistema"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Dev Only: Seed Data */}
            {__DEV__ && (
              <View className="gap-3">
                <Text className="text-lg font-semibold text-warning">Desenvolvedor</Text>
                <TouchableOpacity
                  onPress={handleSeedData}
                  disabled={isSeeding}
                  className="bg-warning/10 border border-warning/30 p-4 rounded-2xl flex-row justify-center items-center gap-2"
                >
                  {isSeeding ? (
                    <ActivityIndicator size="small" color="#eab308" />
                  ) : (
                    <Text className="text-warning font-bold">🌱 Popular Banco de Dados (Seed)</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* 2. Configurações de Notificações */}
            {notifSettings && (
              <View className="gap-3 ">
                <Text className="text-lg font-semibold text-foreground">Notificações</Text>

                <View className="bg-surface rounded-2xl p-4 border border-border gap-6">
                  {!permissionGranted && (
                    <View className="bg-warning/10 p-3 rounded-xl border border-warning/20">
                      <Text className="text-xs text-warning text-center">
                        ⚠️ Permissão de notificações desativada no sistema.
                      </Text>
                    </View>
                  )}

                  {/* Vacinas */}
                  <View className="gap-3 py-4">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                        <IconSymbol name={"vaccines"} color={colors.foreground} />
                        <Text className="font-semibold text-foreground">Vacinas</Text>
                      </View>
                      <Switch
                        value={notifSettings.vaccinesEnabled}
                        onValueChange={(v) =>
                          setNotifSettings({
                            ...notifSettings,
                            vaccinesEnabled: v,
                          })
                        }
                        trackColor={{
                          false: colors.border,
                          true: colors.primary,
                        }}
                        thumbColor={colors.background}
                      />
                    </View>
                    {notifSettings.vaccinesEnabled && (
                      <View className="bg-background px-4 py-3 rounded-xl border border-border flex-row items-center">
                        <FormInput
                          label="Alertar antes (dias):"
                          keyboardType="numeric"
                          horizontal={true}
                          inputStyle={{ width: 40, flex: 0 }}
                          value={String(notifSettings.vaccineAlertDaysBefore)}
                          onChangeText={(t) =>
                            setNotifSettings({
                              ...notifSettings,
                              vaccineAlertDaysBefore: parseInt(t) || 0,
                            })
                          }
                        />
                      </View>
                    )}
                  </View>

                  {/* Gestação */}
                  <View className="gap-3 border-t border-border/50 py-4">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                        <IconSymbol name={STATUS_CATTLE["pregnancy"].icon} color={colors.foreground} />
                        <Text className="font-semibold text-foreground">Gestação/Parto</Text>
                      </View>
                      <Switch
                        value={notifSettings.pregnancyEnabled}
                        onValueChange={(v) =>
                          setNotifSettings({
                            ...notifSettings,
                            pregnancyEnabled: v,
                          })
                        }
                        trackColor={{
                          false: colors.border,
                          true: colors.primary,
                        }}
                        thumbColor={colors.background}
                      />
                    </View>
                    {notifSettings.pregnancyEnabled && (
                      <View className="bg-background px-4 py-3 rounded-xl border border-border flex-row items-center">
                        <FormInput
                          label="Alertar antes (dias):"
                          keyboardType="numeric"
                          horizontal={true}
                          inputStyle={{ width: 40, flex: 0 }}
                          value={String(notifSettings.pregnancyAlertDaysBefore)}
                          onChangeText={(t) =>
                            setNotifSettings({
                              ...notifSettings,
                              pregnancyAlertDaysBefore: parseInt(t) || 0,
                            })
                          }
                        />
                      </View>
                    )}
                  </View>

                  {/* Horário */}
                  <View className="gap-3 border-t border-border/50 py-4">
                    <View className="bg-background px-4 py-3 rounded-xl border border-border flex-row items-center">
                      <FormTimePicker
                        label="Horário dos Alertas"
                        horizontal={true}
                        value={notifSettings.notificationTime}
                        onChange={(date) => {
                          const timeStr = date.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          });
                          setNotifSettings({
                            ...notifSettings,
                            notificationTime: timeStr,
                          });
                        }}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={handleNotifSave}
                    disabled={notifSaving}
                    className="bg-primary p-4 m-2 rounded-xl items-center"
                  >
                    {notifSaving ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text className="text-white font-bold">Salvar Preferências</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* 5. Sobre */}
            <View className="items-center mt-4">
              <Text className="text-muted">Meus Gados • Versão {Constants.expoConfig?.version ?? "1.0.0"}</Text>
              <Text className="text-xs text-muted mt-1">Desenvolvido por Lucas Felipe Costa</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}
