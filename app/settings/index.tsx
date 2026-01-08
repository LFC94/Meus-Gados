import { ScreenContainer } from "@/components/screen-container";
import { useColors, useNavigation } from "@/hooks";

import { backupService, type BackupData } from "@/lib/backup";
import { preferencesStorage, type Theme } from "@/lib/preferences";
import { useFocusEffect } from "@react-navigation/native";
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const colors = useColors();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>("system");
  const [backups, setBackups] = useState<{ id: string; backup: BackupData }[]>([]);

  const insets = useSafeAreaInsets();
  useFocusEffect(
    React.useCallback(() => {
      loadSettings();
    }, [])
  );

  const loadSettings = async () => {
    try {
      setLoading(true);
      const prefs = await preferencesStorage.getPreferences();

      setTheme(prefs.theme);

      const backupList = await backupService.getBackupList();
      setBackups(
        backupList.sort((a, b) => new Date(b.backup.timestamp).getTime() - new Date(a.backup.timestamp).getTime())
      );
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = async (newTheme: Theme) => {
    try {
      setTheme(newTheme);
      await preferencesStorage.updateTheme(newTheme);
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o tema");
      setTheme(theme);
    }
  };

  const handleCreateBackup = async () => {
    try {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const backup = await backupService.createBackup();
      await backupService.saveBackup(backup);

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert("Sucesso", "Backup criado com sucesso!");
      loadSettings();
    } catch (error) {
      console.error("Error creating backup:", error);
      Alert.alert("Erro", "Não foi possível criar o backup");
    }
  };

  const handleExportBackup = async () => {
    try {
      const backup = await backupService.createBackup();
      const jsonString = await backupService.exportBackupAsJSON(backup);

      const fileName = `meus-gados-backup-${new Date().toISOString().split("T")[0]}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, jsonString);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/json",
          dialogTitle: "Compartilhar Backup",
        });
      } else {
        Alert.alert("Sucesso", "Backup exportado para o arquivo de documentos");
      }
    } catch (error) {
      console.error("Error exporting backup:", error);
      Alert.alert("Erro", "Não foi possível exportar o backup");
    }
  };

  const handleRestoreBackup = (backup: BackupData) => {
    Alert.alert(
      "Restaurar Backup",
      `Deseja restaurar o backup de ${new Date(backup.timestamp).toLocaleDateString("pt-BR")}? Todos os dados atuais serão substituídos.`,
      [
        { text: "Cancelar", onPress: () => {} },
        {
          text: "Restaurar",
          onPress: async () => {
            try {
              await backupService.restoreBackup(backup);
              if (Platform.OS !== "web") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              Alert.alert("Sucesso", "Backup restaurado com sucesso!");
              loadSettings();
            } catch (error) {
              console.error("Error restoring backup:", error);
              Alert.alert("Erro", "Não foi possível restaurar o backup");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleDeleteBackup = (backupId: string) => {
    Alert.alert("Deletar Backup", "Deseja deletar este backup? Esta ação não pode ser desfeita.", [
      { text: "Cancelar", onPress: () => {} },
      {
        text: "Deletar",
        onPress: async () => {
          try {
            await backupService.deleteBackup(backupId);
            loadSettings();
            Alert.alert("Sucesso", "Backup deletado com sucesso!");
          } catch (error) {
            console.error("Error deleting backup:", error);
            Alert.alert("Erro", "Não foi possível deletar o backup");
          }
        },
        style: "destructive",
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

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4" style={{ paddingBottom: insets.bottom }}>
        <View className="gap-6">
          {/* Tema */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Tema</Text>
            <View className="bg-surface rounded-lg p-4 gap-3">
              <TouchableOpacity
                onPress={() => handleThemeChange("light")}
                className={`p-3 rounded-lg border-2 ${
                  theme === "light" ? "border-primary bg-primary/10" : "border-border bg-transparent"
                }`}
              >
                <Text className={`font-semibold ${theme === "light" ? "text-primary" : "text-foreground"}`}>
                  Claro (Light)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleThemeChange("dark")}
                className={`p-3 rounded-lg border-2 ${
                  theme === "dark" ? "border-primary bg-primary/10" : "border-border bg-transparent"
                }`}
              >
                <Text className={`font-semibold ${theme === "dark" ? "text-primary" : "text-foreground"}`}>
                  Escuro (Dark)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleThemeChange("system")}
                className={`p-3 rounded-lg border-2 ${
                  theme === "system" ? "border-primary bg-primary/10" : "border-border bg-transparent"
                }`}
              >
                <Text className={`font-semibold ${theme === "system" ? "text-primary" : "text-foreground"}`}>
                  Do Sistema
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Backup e Restauração */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Backup de Dados</Text>
            <View className="bg-surface rounded-lg p-4 gap-3">
              <TouchableOpacity onPress={handleCreateBackup} className="bg-primary rounded-lg p-4 items-center">
                <Text className="text-white font-semibold">Criar Backup</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleExportBackup}
                className="border border-primary rounded-lg p-4 items-center"
              >
                <Text className="text-primary font-semibold">Exportar Backup (JSON)</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Lista de Backups */}
          {backups.length > 0 && (
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-foreground">Backups Salvos</Text>
                <Text className="text-sm text-muted">{backups.length}</Text>
              </View>

              <View className="gap-2">
                {backups.map((item) => (
                  <View key={item.id} className="bg-surface rounded-lg p-4 border border-border">
                    <View className="gap-2 mb-3">
                      <Text className="text-sm font-semibold text-foreground">
                        {new Date(item.backup.timestamp).toLocaleDateString("pt-BR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                      <Text className="text-xs text-muted">
                        {item.backup.cattle.length} animais • {item.backup.vaccineCatalog.length} vacinas
                      </Text>
                    </View>

                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        onPress={() => handleRestoreBackup(item.backup)}
                        className="flex-1 bg-primary/20 rounded-lg p-2 items-center"
                      >
                        <Text className="text-primary font-semibold text-sm">Restaurar</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleDeleteBackup(item.id)}
                        className="flex-1 bg-error/20 rounded-lg p-2 items-center"
                      >
                        <Text className="text-error font-semibold text-sm">Deletar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity
            onPress={() => navigation.navigate("NotificationsSettings" as never)}
            className="bg-surface rounded-full p-4 items-center border border-border"
            style={{ opacity: 1 }}
          >
            <Text className="text-foreground font-semibold text-base">⚙️ Configurar Notificações</Text>
          </TouchableOpacity>

          {/* Informações do App */}
          <View className="gap-3 border-t border-border pt-4">
            <Text className="text-lg font-semibold text-foreground">Sobre</Text>
            <View className="bg-surface rounded-lg p-4 gap-2">
              <View className="flex-row justify-between">
                <Text className="text-muted">App</Text>
                <Text className="font-semibold text-foreground">Meus Gados</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
