/**
 * Funções auxiliares para o aplicativo Meus Gados
 */

import { ThemeColorPalette } from "./_core/theme";

/**
 * Calcula a idade em anos a partir da data de nascimento
 */
export function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Calcula a idade em meses para animais jovens
 */
export function calculateAgeInMonths(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();

  let months = (today.getFullYear() - birth.getFullYear()) * 12;
  months += today.getMonth() - birth.getMonth();

  if (today.getDate() < birth.getDate()) {
    months--;
  }

  return Math.max(0, months);
}

/**
 * Formata idade de forma amigável
 */
export function formatAge(birthDate: string): string {
  const ageInMonths = calculateAgeInMonths(birthDate);

  if (ageInMonths < 12) {
    return `${ageInMonths} ${ageInMonths === 1 ? "mês" : "meses"}`;
  }

  const years = calculateAge(birthDate);
  return `${years} ${years === 1 ? "ano" : "anos"}`;
}

/**
 * Calcula a data prevista de parto (280 dias após cobertura)
 */
export function calculateExpectedBirthDate(coverageDate: string | Date): string {
  const coverage = typeof coverageDate === "string" ? new Date(coverageDate) : coverageDate;
  const expectedBirth = new Date(coverage.getTime() + 280 * 24 * 60 * 60 * 1000);
  return expectedBirth.toISOString();
}

/**
 * Calcula a data prevista de parto como Date (280 dias após cobertura)
 */
export function calculateExpectedBirthDateAsDate(coverageDate: string | Date): Date {
  const coverage = typeof coverageDate === "string" ? new Date(coverageDate) : coverageDate;
  return addDaysToDate(coverage, 280);
}

/**
 * Adiciona dias a uma data
 */
export function addDaysToDate(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Calcula dias restantes até uma data
 */
export function daysUntil(targetDate: string): number {
  const target = new Date(targetDate);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    diffDays = isPastDate(targetDate) ? 0 : 1;
  }

  return diffDays;
}

/**
 * Formata data para exibição (DD/MM/YYYY)
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Formata data e hora para exibição (DD/MM/YYYY HH:MM)
 */
export function formatDateTime(isoDate: string): string {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Converte data DD/MM/YYYY para ISO string
 */
export function parseDate(dateString: string): string {
  const [day, month, year] = dateString.split("/");
  return new Date(Number(year), Number(month) - 1, Number(day)).toISOString();
}

/**
 * Verifica se uma data está no passado
 */
export function isPastDate(isoDate: string): boolean {
  const date = new Date(isoDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  return date < today;
}

/**
 * Verifica se uma data está próxima (dentro de X dias)
 */
export function isDateNear(isoDate: string, daysThreshold: number = 30): boolean {
  const days = daysUntil(isoDate);
  return days >= 0 && days <= daysThreshold;
}

/**
 * Retorna status de vacina baseado na próxima dose
 */
export function getVaccineStatus(nextDose?: string): "up_to_date" | "upcoming" | "overdue" | "none" {
  if (!nextDose) return "none";

  const days = daysUntil(nextDose);

  if (days < 0) return "overdue";
  if (days <= 30) return "upcoming";
  return "up_to_date";
}

/**
 * Retorna cor para status de vacina
 */
export function getVaccineStatusColor(status: ReturnType<typeof getVaccineStatus>): keyof ThemeColorPalette {
  switch (status) {
    case "up_to_date":
      return "success";
    case "upcoming":
      return "warning";
    case "overdue":
      return "error";
    default:
      return "muted";
  }
}

/**
 * Retorna label para status de vacina
 */
export function getVaccineStatusLabel(nextDose?: string): string {
  const daysUntilNextDose = nextDose ? daysUntil(nextDose) : 0;
  const status = getVaccineStatus(nextDose);

  switch (status) {
    case "up_to_date":
      return "Em dia";
    case "upcoming":
      return `Próxima em ${daysUntilNextDose} dia${daysUntilNextDose > 1 ? "s" : ""}`;
    case "overdue":
      return "Atrasada";
    default:
      return "Sem próxima dose";
  }
}

/**
 * Calcula progresso da gestação em porcentagem
 */
export function calculatePregnancyProgress(coverageDate: string, expectedBirthDate: string): number {
  const coverage = new Date(coverageDate);
  const expected = new Date(expectedBirthDate);
  const today = new Date();

  const totalDuration = expected.getTime() - coverage.getTime();
  const elapsed = today.getTime() - coverage.getTime();

  const progress = (elapsed / totalDuration) * 100;

  return Math.min(Math.max(progress, 0), 100);
}

/**
 * Calcula dias de gestação
 */
export function calculateDaysPregnant(coverageDate: string): number {
  const coverage = new Date(coverageDate);
  const today = new Date();

  const diffTime = today.getTime() - coverage.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

/**
 * Formata peso com unidade
 */
export function formatWeight(weight: number): string {
  return `${weight.toFixed(1)} kg`;
}

/**
 * Valida número de animal (não pode ser vazio)
 */
export function validateCattleNumber(number: string): boolean {
  return number.trim().length > 0;
}

/**
 * Valida peso (deve ser positivo)
 */
export function validateWeight(weight: number): boolean {
  return weight > 0;
}

/**
 * Gera ID único para novos registros
 */
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
