import * as Updates from "expo-updates";
import { useEffect } from "react";
import { Alert } from "react-native";

export function useUpdates() {
  async function onFetchUpdateAsync() {
    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        Alert.alert(
          "Atualização Disponível",
          "Uma nova versão do aplicativo foi baixada. Deseja reiniciar para aplicar as mudanças?",
          [
            { text: "Mais tarde", style: "cancel" },
            {
              text: "Reiniciar Agora",
              onPress: async () => {
                await Updates.reloadAsync();
              },
            },
          ],
        );
      }
    } catch (error) {
      // You can also add more robust error handling here, e.g. reporting to Sentry
      console.log(`Error fetching latest Expo update: ${error}`);
    }
  }

  useEffect(() => {
    if (!__DEV__) {
      onFetchUpdateAsync();
    }
  }, []);
}
