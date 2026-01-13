import "@/global.css";
import "@/lib/_core/nativewind-pressable";
import { requestNotificationPermission } from "@/lib/notifications";
import { ThemeProvider } from "@/lib/theme-provider";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Platform, Text } from "react-native";
import "react-native-reanimated";
import type { EdgeInsets, Metrics, Rect } from "react-native-safe-area-context";
import {
  SafeAreaFrameContext,
  SafeAreaInsetsContext,
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";

import { useColors, useScreenOptions } from "@/hooks/";
import { AuthProvider } from "@/hooks/use-auth";

import { initManusRuntime, subscribeSafeAreaInsets } from "@/lib/_core/manus-runtime";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";

// Screens
import { RootStackParamList } from "@/types";

import { initLogRocket } from "@/lib/logrocket";
import {
  CattleCadScreen,
  CattleDetailScreen,
  CattleListScreen,
  DiseasesCadScreen,
  HomeScreen,
  MilkProductionCadScreen,
  MilkProductionListScreen,
  NotificationsSettingsScreen,
  PregnancyAddScreen,
  PregnancyEditScreen,
  ScheduledNotificationsScreen,
  SettingsScreen,
  SyncSetupScreen,
  VaccineCadScreen,
  VaccineCatalogCadScreen,
  VaccineCatalogScreen,
  VaccinePendingScreen,
} from "./_screens";

const DEFAULT_WEB_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };
const DEFAULT_WEB_FRAME: Rect = { x: 0, y: 0, width: 0, height: 0 };

// Create navigators
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator<RootStackParamList>();

// Drawer Navigator - telas principais acessíveis pelo menu lateral
function DrawerNavigator() {
  const colors = useColors();

  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.muted,
        headerTintColor: colors.text,
        drawerStyle: {
          backgroundColor: colors.background,
        },
        drawerLabelStyle: {
          fontSize: 16,
          color: colors.text,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          color: colors.text,
        },
        swipeEnabled: true,
        drawerType: Platform.OS === "web" ? "permanent" : "front",
      }}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          drawerLabel: "Meus Gados",
          title: "Meus Gados",
          drawerIcon: () => <Text className="text-lg">🐮</Text>,
        }}
      />
      <Drawer.Screen
        name="CattleList"
        component={CattleListScreen}
        options={{
          drawerLabel: "Animais",
          title: "Animais",
          drawerIcon: () => <Text className="text-lg">🐄</Text>,
        }}
      />

      <Drawer.Screen
        name="MilkProductionList"
        component={MilkProductionListScreen}
        options={{
          title: "Controle de Leite",
          drawerLabel: "Controle de Leite",
          drawerIcon: () => <Text className="text-lg">🥛</Text>,
        }}
      />
      <Drawer.Screen
        name="VaccineCatalog"
        component={VaccineCatalogScreen}
        options={{
          drawerLabel: "Catálogo de Vacinas",
          title: "Catálogo de Vacinas",
          drawerIcon: () => <Text className="text-lg">💉</Text>,
        }}
      />
      <Drawer.Screen
        name="VaccinePending"
        component={VaccinePendingScreen}
        options={{
          drawerLabel: "Vacinas Pendentes",
          title: "Vacinas Pendentes",
          drawerIcon: () => <Text className="text-lg">🚨</Text>,
        }}
      />
      <Drawer.Screen
        name="ScheduledNotifications"
        component={ScheduledNotificationsScreen}
        options={{
          drawerLabel: "Notificações",
          title: "Notificações",
          drawerIcon: () => <Text className="text-lg">🔔</Text>,
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          drawerLabel: "Configurações",
          title: "Configurações",
          drawerIcon: () => <Text className="text-lg">⚙️</Text>,
        }}
      />
    </Drawer.Navigator>
  );
}

// Stack Navigator principal - contém todas as telas incluindo as de ação
function MainStackNavigator() {
  const screenOptions = useScreenOptions();
  return (
    <Stack.Navigator screenOptions={screenOptions} initialRouteName="Drawer">
      {/* Telas do Drawer integradas no Stack */}
      <Stack.Screen name="Drawer" component={DrawerNavigator} />

      <Stack.Screen
        name="CattleDetail"
        component={CattleDetailScreen}
        options={{
          title: "Detalhes do Animal",
        }}
      />
      <Stack.Screen
        name="CattleCad"
        component={CattleCadScreen}
        options={{
          title: "Editar Animal",
        }}
      />
      <Stack.Screen
        name="VaccineCad"
        component={VaccineCadScreen}
        options={{
          title: "Registrar Vacina",
        }}
      />
      <Stack.Screen
        name="VaccineCatalogCad"
        component={VaccineCatalogCadScreen}
        options={{
          title: "Editar Vacina",
        }}
      />
      <Stack.Screen
        name="PregnancyAdd"
        component={PregnancyAddScreen}
        options={{
          title: "Registrar Gestação",
        }}
      />
      <Stack.Screen
        name="PregnancyEdit"
        component={PregnancyEditScreen}
        options={{
          title: "Editar Gestação",
        }}
      />
      <Stack.Screen
        name="VaccineCatalog"
        component={VaccineCatalogScreen}
        options={{
          title: "Catálogo de Vacinas",
        }}
      />
      <Stack.Screen
        name="DiseasesCad"
        component={DiseasesCadScreen}
        options={{
          title: "Registrar Doença",
        }}
      />
      <Stack.Screen
        name="NotificationsSettings"
        component={NotificationsSettingsScreen}
        options={{
          title: "Configurar Notificações",
        }}
      />
      <Stack.Screen
        name="MilkProductionCad"
        component={MilkProductionCadScreen}
        options={{
          title: "Registrar Produção",
        }}
      />
      <Stack.Screen
        name="SyncSetup"
        component={SyncSetupScreen}
        options={{
          title: "Sincronização em Nuvem",
        }}
      />
    </Stack.Navigator>
  );
}

export default function RootLayout() {
  const initialInsets = initialWindowMetrics?.insets ?? DEFAULT_WEB_INSETS;
  const initialFrame = initialWindowMetrics?.frame ?? DEFAULT_WEB_FRAME;

  const [insets, setInsets] = useState<EdgeInsets>(initialInsets);
  const [frame, setFrame] = useState<Rect>(initialFrame);

  useEffect(() => {
    initManusRuntime();

    // Request notification permissions on app startup
    if (Platform.OS !== "web") {
      requestNotificationPermission();
    }
  }, []);

  const handleSafeAreaUpdate = useCallback((metrics: Metrics) => {
    setInsets(metrics.insets);
    setFrame(metrics.frame);
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const unsubscribe = subscribeSafeAreaInsets(handleSafeAreaUpdate);
    return () => unsubscribe();
  }, [handleSafeAreaUpdate]);

  // Initialize LogRocket for session recording and error tracking
  useEffect(() => {
    initLogRocket();
  }, []);

  const providerInitialMetrics = useMemo(() => {
    const metrics = initialWindowMetrics ?? { insets: initialInsets, frame: initialFrame };
    return {
      ...metrics,
      insets: {
        ...metrics.insets,
        top: Math.max(metrics.insets.top, 16),
        bottom: Math.max(metrics.insets.bottom, 12),
      },
    };
  }, [initialInsets, initialFrame]);

  const content = <MainStackNavigator />;

  const shouldOverrideSafeArea = Platform.OS === "web";

  if (shouldOverrideSafeArea) {
    return (
      <ThemeProvider>
        <AuthProvider>
          <SafeAreaProvider initialMetrics={providerInitialMetrics}>
            <SafeAreaFrameContext.Provider value={frame}>
              <SafeAreaInsetsContext.Provider value={insets}>{content}</SafeAreaInsetsContext.Provider>
            </SafeAreaFrameContext.Provider>
          </SafeAreaProvider>
        </AuthProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <SafeAreaProvider initialMetrics={providerInitialMetrics}>{content}</SafeAreaProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
