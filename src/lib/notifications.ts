/**
 * Serviço de notificações locais usando expo-notifications
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

import { Pregnancy, VaccinationRecordWithDetails } from "@/types";

import { daysUntil, formatDate } from "./helpers";
import { logger } from "./logger";

type NotificationHandlerResult = {
  shouldShowAlert: boolean;
  shouldPlaySound: boolean;
  shouldSetBadge: boolean;
  shouldShowBanner: boolean;
  shouldShowList: boolean;
};

Notifications.setNotificationHandler({
  handleNotification: async () =>
    ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }) as NotificationHandlerResult,
});

const NOTIFICATION_SETTINGS_KEY = "@meus_gados:notification_settings";
const SCHEDULED_NOTIFICATIONS_KEY = "@meus_gados:scheduled_notifications";

export interface NotificationSettings {
  vaccinesEnabled: boolean;
  pregnancyEnabled: boolean;
  vaccineAlertDaysBefore: number; // Alertar X dias antes
  pregnancyAlertDaysBefore: number; // Alertar X dias antes
  notificationTime: string; // HH:MM (ex: "09:00")
}

export interface ScheduledNotification {
  id: string;
  type: "vaccine" | "pregnancy";
  cattleId: string;
  cattleName: string;
  title: string;
  body: string;
  scheduledDate: string;
  notificationId?: string;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  vaccinesEnabled: true,
  pregnancyEnabled: true,
  vaccineAlertDaysBefore: 7,
  pregnancyAlertDaysBefore: 14,
  notificationTime: "09:00",
};

/**
 * Solicitar permissão para enviar notificações
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch (error) {
    logger.error("notifications/requestPermission", error);
    return false;
  }
}

/**
 * Obter configurações de notificações
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const settings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    return settings ? JSON.parse(settings) : DEFAULT_SETTINGS;
  } catch (error) {
    logger.error("notifications/getSettings", error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Salvar configurações de notificações
 */
export async function saveNotificationSettings(settings: Partial<NotificationSettings>): Promise<void> {
  try {
    const current = await getNotificationSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    logger.error("notifications/saveSettings", error);
    throw error;
  }
}

/**
 * Agendar notificação para uma vacina
 */
export async function scheduleVaccineNotification(
  vaccine: VaccinationRecordWithDetails & { cattleName: string },
): Promise<string | null> {
  try {
    const settings = await getNotificationSettings();

    if (!settings.vaccinesEnabled || !vaccine.nextDoseDate) {
      return null;
    }

    const days = daysUntil(vaccine.nextDoseDate);

    // Agendar apenas se a vacina está dentro do período de alerta
    if (days < 0 || days > settings.vaccineAlertDaysBefore) {
      return null;
    }

    // Calcular horário da notificação
    const [hours, minutes] = settings.notificationTime.split(":").map(Number);
    const notificationDate = new Date(vaccine.nextDoseDate);
    notificationDate.setHours(hours, minutes, 0, 0);

    // Se a data já passou, agendar para hoje
    if (notificationDate < new Date()) {
      notificationDate.setDate(notificationDate.getDate() + 1);
    }

    const title = `Vacina Pendente`;
    const body = `${vaccine.cattleName} precisa tomar ${vaccine.vaccineName} em ${formatDate(vaccine.nextDoseDate)}`;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {
          type: "vaccine",
          vaccineId: vaccine.id,
          cattleId: vaccine.cattleId,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: notificationDate,
      },
    });

    // Salvar notificação agendada
    const scheduledNotification: ScheduledNotification = {
      id: vaccine.id,
      type: "vaccine",
      cattleId: vaccine.cattleId,
      cattleName: vaccine.cattleName,
      title,
      body,
      scheduledDate: notificationDate.toISOString(),
      notificationId,
    };

    await saveScheduledNotification(scheduledNotification);

    return notificationId;
  } catch (error) {
    logger.error("notifications/scheduleVaccine", error);
    return null;
  }
}

/**
 * Agendar notificação para uma gestação
 */
export async function schedulePregnancyNotification(
  pregnancy: Pregnancy & { cattleName: string },
): Promise<string | null> {
  try {
    const settings = await getNotificationSettings();

    if (!settings.pregnancyEnabled || pregnancy.result !== "pending") {
      return null;
    }

    const days = daysUntil(pregnancy.expectedBirthDate);

    // Agendar apenas se o parto está dentro do período de alerta
    if (days < 0 || days > settings.pregnancyAlertDaysBefore) {
      return null;
    }

    // Calcular horário da notificação
    const [hours, minutes] = settings.notificationTime.split(":").map(Number);
    const notificationDate = new Date(pregnancy.expectedBirthDate);
    notificationDate.setHours(hours, minutes, 0, 0);

    // Se a data já passou, agendar para hoje
    if (notificationDate < new Date()) {
      notificationDate.setDate(notificationDate.getDate() + 1);
    }

    const title = `Parto Previsto`;
    const body = `${pregnancy.cattleName} deve parir em ${formatDate(pregnancy.expectedBirthDate)}`;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {
          type: "pregnancy",
          pregnancyId: pregnancy.id,
          cattleId: pregnancy.cattleId,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: notificationDate,
      },
    });

    // Salvar notificação agendada
    const scheduledNotification: ScheduledNotification = {
      id: pregnancy.id,
      type: "pregnancy",
      cattleId: pregnancy.cattleId,
      cattleName: pregnancy.cattleName,
      title,
      body,
      scheduledDate: notificationDate.toISOString(),
      notificationId,
    };

    await saveScheduledNotification(scheduledNotification);

    return notificationId;
  } catch (error) {
    logger.error("notifications/schedulePregnancy", error);
    return null;
  }
}

/**
 * Cancelar notificação agendada
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    logger.error("notifications/cancel", error);
  }
}

/**
 * Cancelar todas as notificações agendadas
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    logger.error("notifications/cancelAll", error);
  }
}

/**
 * Salvar notificação agendada no histórico
 */
async function saveScheduledNotification(notification: ScheduledNotification): Promise<void> {
  try {
    const scheduled = await getScheduledNotifications();

    // Remover notificação anterior do mesmo tipo/animal
    const filtered = scheduled.filter((n) => !(n.type === notification.type && n.id === notification.id));

    filtered.push(notification);
    await AsyncStorage.setItem(SCHEDULED_NOTIFICATIONS_KEY, JSON.stringify(filtered));
  } catch (error) {
    logger.error("notifications/saveScheduled", error);
  }
}

/**
 * Obter notificações agendadas
 */
export async function getScheduledNotifications(): Promise<ScheduledNotification[]> {
  try {
    const scheduled = await AsyncStorage.getItem(SCHEDULED_NOTIFICATIONS_KEY);
    return scheduled ? JSON.parse(scheduled) : [];
  } catch (error) {
    logger.error("notifications/getScheduled", error);
    return [];
  }
}

/**
 * Remover notificação do histórico
 */
export async function removeScheduledNotification(id: string, type: "vaccine" | "pregnancy"): Promise<void> {
  try {
    const scheduled = await getScheduledNotifications();
    const filtered = scheduled.filter((n) => !(n.id === id && n.type === type));
    await AsyncStorage.setItem(SCHEDULED_NOTIFICATIONS_KEY, JSON.stringify(filtered));
  } catch (error) {
    logger.error("notifications/remove", error);
  }
}

/**
 * Limpar notificações antigas
 */
export async function cleanupOldNotifications(): Promise<void> {
  try {
    const scheduled = await getScheduledNotifications();
    const now = new Date();

    const filtered = scheduled.filter((n) => {
      const notificationDate = new Date(n.scheduledDate);
      return notificationDate > now;
    });

    await AsyncStorage.setItem(SCHEDULED_NOTIFICATIONS_KEY, JSON.stringify(filtered));
  } catch (error) {
    logger.error("notifications/cleanup", error);
  }
}

/**
 * Reagendar todas as notificações (útil após atualizar configurações)
 */
export async function rescheduleAllNotifications(
  vaccines: (VaccinationRecordWithDetails & { cattleName: string })[],
  pregnancies: (Pregnancy & { cattleName: string })[],
): Promise<void> {
  try {
    // Cancelar todas as notificações anteriores
    await cancelAllNotifications();

    // Limpar histórico
    await AsyncStorage.removeItem(SCHEDULED_NOTIFICATIONS_KEY);

    // Agendar novas notificações
    for (const vaccine of vaccines) {
      await scheduleVaccineNotification(vaccine);
    }

    for (const pregnancy of pregnancies) {
      await schedulePregnancyNotification(pregnancy);
    }
  } catch (error) {
    logger.error("notifications/reschedule", error);
    throw error;
  }
}
