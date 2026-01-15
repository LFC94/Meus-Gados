import { ScreenContainer } from "@/components/screen-container";
import { useAuth, useColors, useScreenHeader } from "@/hooks";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function SyncSetupScreen() {
  const colors = useColors();
  const colorSchema = useColorScheme();
  const { user, loading, signInWithGoogle, signOut, syncData, isSyncing } = useAuth();
  const [authLoading, setAuthLoading] = useState(false);
  const [lastSyncStatus, setLastSyncStatus] = useState<string | null>(null);

  useEffect(() => {
    const loadLastSync = async () => {
      const { syncStorage } = await import("@/lib/storage");
      const lastSync = await syncStorage.getLastSync();
      if (lastSync) {
        setLastSyncStatus(`Última sincronização: ${new Date(lastSync).toLocaleString()}`);
      }
    };
    loadLastSync();
  }, [isSyncing]);

  useScreenHeader("Sincronização", "Acesse seus dados em outro dispositivo");

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    try {
      await signInWithGoogle();
      // Sync immediately after login
      await syncData();
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      Alert.alert("Erro de Autenticação", "Não foi possível realizar o login com o Google.");
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

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (user) {
    return (
      <ScreenContainer className="p-4">
        <View className="flex-1 gap-6">
          <View className="bg-surface p-6 rounded-2xl border border-border items-center gap-4">
            <View className="items-center">
              <Text className="text-xl font-bold text-foreground">Sincronização Ativa</Text>
              <Image width={100} height={100} source={{ uri: user.photoURL || "" }} />
              <Text className="text-muted text-center mt-1">
                Seus dados estão sendo salvos na nuvem como {user.email}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleManualSync}
            disabled={isSyncing}
            className="bg-primary p-4 rounded-xl items-center flex-row justify-center gap-2"
          >
            {isSyncing ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className="text-white font-bold">☁️ Sincronizar Agora</Text>
              </>
            )}
          </TouchableOpacity>

          {lastSyncStatus && <Text className="text-muted text-center text-sm">{lastSyncStatus}</Text>}

          <TouchableOpacity
            onPress={() => signOut()}
            className="bg-error/10 p-4 rounded-xl items-center border border-error/20"
          >
            <Text className="text-error font-semibold">Sair da Conta</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }} className="flex-1">
        <View className="gap-8">
          <View className="items-center gap-4">
            <View className="w-20 h-20 rounded-full items-center justify-center border border-primary">
              <Text className="text-3xl">☁️</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-foreground text-center">Backup na Nuvem</Text>
              <Text className="text-muted text-center mt-2 leading-5">
                Mantenha seus dados seguros e acesse de qualquer lugar via Google.
              </Text>
            </View>
          </View>

          <View className="items-center gap-4">
            {authLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <GoogleSigninButton
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color[colorSchema === "dark" ? "Dark" : "Light"]}
                onPress={handleGoogleSignIn}
                disabled={authLoading}
              />
            )}
          </View>

          <View className="bg-surface/50 p-4 rounded-xl border border-border mt-4">
            <Text className="text-xs text-muted text-center leading-4">
              Ao sincronizar, seus dados locais serão fundidos com os dados da nuvem. O app continua funcionando offline
              normalmente.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
