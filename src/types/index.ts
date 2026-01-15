/**
 * Tipos de dados para o aplicativo Meus Gados
 */

// Tipos existentes mantidos para compatibilidade
export interface SyncBase {
  id: string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export interface Cattle extends SyncBase {
  number: string;
  name?: string;
  breed: string;
  birthDate: string;
  weight: number;
  motherId?: string;
}

export type CattleResult = "in_treatment" | "healthy" | "death" | "overdue_pregnancy" | "pregnancy" | "pending_vaccine";

/**
 * Catálogo de Vacinas (Cadastro de Imunizantes)
 * Representa o produto físico/medicamento disponível no mercado
 */
export interface VaccineModel extends SyncBase {
  name: string; // Ex: Febre Aftosa
  manufacturer?: string; // Ex: Ourofino, MSD, Boehringer
  batchNumber?: string; // Lote padrão do catálogo
  expiryDate?: string; // Validade do lote atual (ISO Date)
  description?: string; // Descrição/tratamento que previne
  daysBetweenDoses?: number; // Intervalo para próxima dose (0 = dose única)
  isActive: boolean; // Se está ativa no catálogo
}

/**
 * Registro de Vacinação (Histórico de Aplicações)
 * Representa o fato de um animal ter sido vacinado
 */
export interface VaccinationRecord extends SyncBase {
  cattleId: string; // ID do animal
  vaccineId: string; // ID da vaccine do catálogo
  dateApplied: string; // Data da aplicação (ISO)
  nextDoseDate?: string; // Data da próxima dose (ISO)
  isNextDoseApplied?: boolean; // Se a próxima dose já foi aplicada
  batchUsed?: string; // Lote usado nesta aplicação específica
  notes?: string; // Observações (reações, etc)
}

export interface Pregnancy extends SyncBase {
  cattleId: string;
  coverageDate: string;
  expectedBirthDate: string;
  actualBirthDate?: string;
  result?: PregnancyResult;
  complications?: string;
  calfId?: string;
}

export type PregnancyResult = "pending" | "success" | "complications" | "failed";

export interface Disease extends SyncBase {
  cattleId: string;
  type: string;
  diagnosisDate: string;
  symptoms: string;
  treatment: string;
  result: DiseaseResult;
}

export type DiseaseResult = "in_treatment" | "cured" | "death";

export interface MilkProductionRecord extends SyncBase {
  cattleId: string;
  date: string; // ISO Date string
  period: "morning" | "afternoon" | "full_day";
  quantity: number; // in Liters
  notes?: string;
}

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
  CattleList: { status?: CattleResult };
  CattleDetail: { id: string };
  CattleCad: { id?: string };
  VaccinePending: undefined;
  VaccineCad: { id?: string; cattleId?: string; previousRecordId?: string; vaccineId?: string };
  VaccineCatalog: undefined;
  VaccineCatalogCad: { id: string };
  PregnancyAdd: { cattleId: string };
  PregnancyEdit: { id: string };
  DiseasesCad: { id?: string; cattleId?: string };
  NotificationsSettings: undefined;
  ScheduledNotifications: undefined;
  MilkProductionList: undefined;
  MilkProductionCad: { id?: string; cattleId?: string };
  SyncSetup: undefined;
};
