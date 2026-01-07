/**
 * Tipos de dados para o aplicativo Meus Gados
 */

// Tipos existentes mantidos para compatibilidade
export interface Cattle {
  id: string;
  number: string;
  name?: string;
  breed: string;
  birthDate: string;
  weight: number;
  motherId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Catálogo de Vacinas (Cadastro de Imunizantes)
 * Representa o produto físico/medicamento disponível no mercado
 */
export interface VaccineModel {
  id: string;
  name: string; // Ex: Febre Aftosa
  manufacturer?: string; // Ex: Ourofino, MSD, Boehringer
  batchNumber?: string; // Lote padrão do catálogo
  expiryDate?: string; // Validade do lote atual (ISO Date)
  description?: string; // Descrição/tratamento que previne
  daysBetweenDoses?: number; // Intervalo para próxima dose (0 = dose única)
  isActive: boolean; // Se está ativa no catálogo
  createdAt: string;
  updatedAt: string;
}

/**
 * Registro de Vacinação (Histórico de Aplicações)
 * Representa o fato de um animal ter sido vacinado
 */
export interface VaccinationRecord {
  id: string;
  cattleId: string; // ID do animal
  vaccineId: string; // ID da vaccine do catálogo
  dateApplied: string; // Data da aplicação (ISO)
  nextDoseDate?: string; // Data da próxima dose (ISO)
  batchUsed?: string; // Lote usado nesta aplicação específica
  notes?: string; // Observações (reações, etc)
  createdAt: string;
  updatedAt: string;
}

export interface Pregnancy {
  id: string;
  cattleId: string;
  coverageDate: string;
  expectedBirthDate: string;
  actualBirthDate?: string;
  result?: PregnancyResult;
  complications?: string;
  calfId?: string;
  createdAt: string;
  updatedAt: string;
}

export type PregnancyResult = "pending" | "success" | "complications" | "failed";

export interface Disease {
  id: string;
  cattleId: string;
  type: string;
  diagnosisDate: string;
  symptoms: string;
  treatment: string;
  result: DiseaseResult;
  createdAt: string;
  updatedAt: string;
}

export type DiseaseResult = "in_treatment" | "cured" | "death";

/**
 * Tipos combinados para visualização
 */
export interface VaccinationRecordWithDetails extends VaccinationRecord {
  vaccineName: string;
  vaccineManufacturer?: string;
  vaccineDescription?: string;
  daysBetweenDoses?: number;
}

export interface VaccineWithRecords extends VaccineModel {
  recordCount: number;
  lastAppliedDate?: string;
}

// Type definitions for navigation
export type RootStackParamList = {
  Home: undefined;
  Drawer: undefined;
  Settings: undefined;
  CattleList: undefined;
  CattleAdd: undefined;
  CattleDetail: { id: string };
  CattleEdit: { id: string };
  VaccinePending: undefined;
  VaccineAdd: { cattleId: string };
  VaccineEdit: { id: string };
  VaccineCatalogIndex: undefined;
  VaccineCatalogAdd: undefined;
  VaccineCatalogEdit: { id: string };
  PregnancyAdd: undefined;
  PregnancyEdit: { id: string };
  DiseasesAdd: undefined;
  DiseasesEdit: { id: string };
  NotificationsSettings: undefined;
  ScheduledNotifications: undefined;
  ThemeLab: undefined;
};
