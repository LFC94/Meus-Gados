import AsyncStorage from "@react-native-async-storage/async-storage";
import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";

WebBrowser.maybeCompleteAuthSession();

const STORAGE_KEY = "@meus_gados_google_auth";

// CLIENT IDs
// Configurados no arquivo .env (veja .env.example)
const GOOGLE_CONFIG = {
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  scopes: ["https://www.googleapis.com/auth/drive.file"], // Acesso apenas aos arquivos criados pelo app
};

interface AuthData {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  issuedAt?: number;
  userInfo?: {
    email: string;
    name: string;
    picture: string;
  };
}

export function useGoogleAuth() {
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [loading, setLoading] = useState(true);

  const [request, response, promptAsync] = Google.useAuthRequest({
    ...GOOGLE_CONFIG,
    redirectUri: makeRedirectUri({
      scheme: "lfcapp",
    }),
  });

  useEffect(() => {
    loadStoredAuth();
  }, []);

  useEffect(() => {
    if (response?.type === "success" && response.authentication) {
      handleAuthSuccess(response.authentication);
    }
  }, [response]);

  const loadStoredAuth = async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        const data = JSON.parse(json);
        // Verificar se token expirou (se tivermos issuedAt e expiresIn)
        // Por simplificação, vamos assumir válido e tentar usar, se falhar, o usuário loga de novo
        // Idealmente usaríamos refresh token se disponível
        setAuthData(data);
      }
    } catch (e) {
      console.error("Failed to load auth", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = async (authentication: any) => {
    try {
      // Obter dados do usuário
      const userInfoResponse = await fetch("https://www.googleapis.com/userinfo/v2/me", {
        headers: { Authorization: `Bearer ${authentication.accessToken}` },
      });
      const userInfo = await userInfoResponse.json();

      const newAuthData: AuthData = {
        accessToken: authentication.accessToken,
        refreshToken: authentication.refreshToken,
        expiresIn: authentication.expiresIn,
        issuedAt: Date.now(),
        userInfo: {
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
        },
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newAuthData));
      setAuthData(newAuthData);
    } catch (e) {
      console.error("Failed to process auth success", e);
    }
  };

  const signOut = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setAuthData(null);
  };

  const signIn = async () => {
    await promptAsync();
  };

  return {
    authData,
    loading,
    signIn,
    signOut,
    request,
  };
}

// Função helper para obter token válido fora do hook (para background tasks)
export async function getStoredAuthToken(): Promise<string | null> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return null;
    const data = JSON.parse(json) as AuthData;
    return data.accessToken;
  } catch {
    return null;
  }
}
