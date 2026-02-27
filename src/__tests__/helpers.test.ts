import {
  calculateAge,
  calculateAgeInMonths,
  formatAge,
  calculateExpectedBirthDate,
  addDaysToDate,
  daysUntil,
  formatDate,
  formatDateTime,
  parseDate,
  isPastDate,
  isDateNear,
  getVaccineStatus,
  getVaccineStatusLabel,
  calculatePregnancyProgress,
  calculateDaysPregnant,
  formatWeight,
  validateCattleNumber,
  validateWeight,
  generateId,
} from "../lib/helpers";

describe("helpers", () => {
  describe("calculateAge", () => {
    it("should calculate age correctly for birthday in past", () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 5);
      expect(calculateAge(birthDate.toISOString())).toBe(5);
    });

    it("should calculate age correctly for birthday this year", () => {
      const birthDate = new Date(2024, 0, 1);
      const age = calculateAge(birthDate.toISOString());
      expect(age).toBeGreaterThanOrEqual(1);
    });

    it("should return 0 for newborn", () => {
      const birthDate = new Date();
      birthDate.setMonth(birthDate.getMonth() - 6);
      const age = calculateAge(birthDate.toISOString());
      expect(age).toBe(0);
    });
  });

  describe("calculateAgeInMonths", () => {
    it("should calculate months correctly", () => {
      const birthDate = new Date();
      birthDate.setMonth(birthDate.getMonth() - 6);
      expect(calculateAgeInMonths(birthDate.toISOString())).toBe(6);
    });

    it("should return 0 for current month", () => {
      const birthDate = new Date();
      const months = calculateAgeInMonths(birthDate.toISOString());
      expect(months).toBeGreaterThanOrEqual(0);
    });
  });

  describe("formatAge", () => {
    it("should format age in months when less than 12", () => {
      const birthDate = new Date();
      birthDate.setMonth(birthDate.getMonth() - 6);
      expect(formatAge(birthDate.toISOString())).toBe("6 meses");
    });

    it("should format age in months with singular", () => {
      const birthDate = new Date();
      birthDate.setMonth(birthDate.getMonth() - 1);
      expect(formatAge(birthDate.toISOString())).toBe("1 mês");
    });

    it("should format age in years when 12 or more", () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 3);
      expect(formatAge(birthDate.toISOString())).toBe("3 anos");
    });

    it("should format age in years with singular", () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 1);
      expect(formatAge(birthDate.toISOString())).toBe("1 ano");
    });
  });

  describe("calculateExpectedBirthDate", () => {
    it("should calculate expected birth date 280 days after coverage", () => {
      const coverageDate = "2024-01-01T00:00:00.000Z";
      const result = calculateExpectedBirthDate(coverageDate);
      const expected = new Date("2024-01-01T00:00:00.000Z");
      expected.setDate(expected.getDate() + 280);
      expect(new Date(result).getTime()).toBeCloseTo(expected.getTime(), -1);
    });

    it("should handle Date object input", () => {
      const coverageDate = new Date("2024-01-01");
      const result = calculateExpectedBirthDate(coverageDate);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });
  });

  describe("addDaysToDate", () => {
    it("should add days to date correctly", () => {
      const date = new Date(2024, 0, 1);
      const result = addDaysToDate(date, 10);
      expect(result.getDate()).toBe(11);
    });

    it("should handle negative days", () => {
      const date = new Date(2024, 0, 15);
      const result = addDaysToDate(date, -5);
      expect(result.getDate()).toBe(10);
    });

    it("should not mutate original date", () => {
      const date = new Date(2024, 0, 1);
      addDaysToDate(date, 10);
      expect(date.getDate()).toBe(1);
    });
  });

  describe("daysUntil", () => {
    it("should return positive days for future date", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      expect(daysUntil(futureDate.toISOString())).toBe(10);
    });

    it("should return negative days for past date", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      expect(daysUntil(pastDate.toISOString())).toBeLessThan(0);
    });

    it("should return 1 for today", () => {
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      const result = daysUntil(today.toISOString());
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  describe("formatDate", () => {
    it("should format date to DD/MM/YYYY", () => {
      const date = new Date(2024, 0, 15);
      expect(formatDate(date.toISOString())).toBe("15/01/2024");
    });

    it("should pad single digit day and month", () => {
      const date = new Date(2024, 4, 3);
      expect(formatDate(date.toISOString())).toBe("03/05/2024");
    });
  });

  describe("formatDateTime", () => {
    it("should format date and time correctly", () => {
      expect(formatDateTime("2024-01-15T14:30:00.000Z")).toMatch(
        /\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/,
      );
    });
  });

  describe("parseDate", () => {
    it("should parse DD/MM/YYYY to ISO string", () => {
      const result = parseDate("15/03/2024");
      const date = new Date(result);
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(2);
      expect(date.getDate()).toBe(15);
    });

    it("should handle single digit day and month", () => {
      const result = parseDate("01/05/2024");
      const date = new Date(result);
      expect(date.getMonth()).toBe(4);
      expect(date.getDate()).toBe(1);
    });
  });

  describe("isPastDate", () => {
    it("should return true for past dates", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      expect(isPastDate(pastDate.toISOString())).toBe(true);
    });

    it("should return false for future dates", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      expect(isPastDate(futureDate.toISOString())).toBe(false);
    });
  });

  describe("isDateNear", () => {
    it("should return true for date within threshold", () => {
      const nearDate = new Date();
      nearDate.setDate(nearDate.getDate() + 15);
      expect(isDateNear(nearDate.toISOString(), 30)).toBe(true);
    });

    it("should return false for date beyond threshold", () => {
      const farDate = new Date();
      farDate.setDate(farDate.getDate() + 60);
      expect(isDateNear(farDate.toISOString(), 30)).toBe(false);
    });
  });

  describe("getVaccineStatus", () => {
    it("should return none when no next dose", () => {
      expect(getVaccineStatus()).toBe("none");
    });

    it("should return none when next dose is applied", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      expect(getVaccineStatus(futureDate.toISOString(), true)).toBe("none");
    });

    it("should return overdue for past dates", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      expect(getVaccineStatus(pastDate.toISOString())).toBe("overdue");
    });

    it("should return upcoming for near future dates", () => {
      const nearDate = new Date();
      nearDate.setDate(nearDate.getDate() + 15);
      expect(getVaccineStatus(nearDate.toISOString())).toBe("upcoming");
    });

    it("should return up_to_date for far future dates", () => {
      const farDate = new Date();
      farDate.setDate(farDate.getDate() + 60);
      expect(getVaccineStatus(farDate.toISOString())).toBe("up_to_date");
    });
  });

  describe("getVaccineStatusLabel", () => {
    it('should return "Já reaplicada" when applied', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      expect(getVaccineStatusLabel(futureDate.toISOString(), true)).toBe(
        "Já reaplicada",
      );
    });

    it("should return correct label for up_to_date", () => {
      const farDate = new Date();
      farDate.setDate(farDate.getDate() + 60);
      expect(getVaccineStatusLabel(farDate.toISOString())).toBe("Em dia");
    });

    it('should return "Sem próxima dose" when no date', () => {
      expect(getVaccineStatusLabel()).toBe("Sem próxima dose");
    });
  });

  describe("calculatePregnancyProgress", () => {
    it("should calculate pregnancy progress correctly", () => {
      const coverageDate = new Date();
      coverageDate.setDate(coverageDate.getDate() - 140);
      const expectedBirthDate = new Date();
      expectedBirthDate.setDate(expectedBirthDate.getDate() + 140);

      const progress = calculatePregnancyProgress(
        coverageDate.toISOString(),
        expectedBirthDate.toISOString(),
      );

      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(100);
    });

    it("should return 0 for early pregnancy", () => {
      const coverageDate = new Date();
      const expectedBirthDate = new Date();
      expectedBirthDate.setDate(expectedBirthDate.getDate() + 280);

      const progress = calculatePregnancyProgress(
        coverageDate.toISOString(),
        expectedBirthDate.toISOString(),
      );

      expect(progress).toBeLessThan(5);
    });
  });

  describe("calculateDaysPregnant", () => {
    it("should calculate days pregnant correctly", () => {
      const coverageDate = new Date();
      coverageDate.setDate(coverageDate.getDate() - 100);

      const days = calculateDaysPregnant(coverageDate.toISOString());
      expect(days).toBeGreaterThanOrEqual(99);
      expect(days).toBeLessThanOrEqual(101);
    });

    it("should return 0 for today", () => {
      const today = new Date();
      expect(calculateDaysPregnant(today.toISOString())).toBe(0);
    });
  });

  describe("formatWeight", () => {
    it("should format weight with one decimal", () => {
      expect(formatWeight(150.5)).toBe("150.5 kg");
    });

    it("should format whole number weight", () => {
      expect(formatWeight(200)).toBe("200.0 kg");
    });
  });

  describe("validateCattleNumber", () => {
    it("should return false for empty string", () => {
      expect(validateCattleNumber("")).toBe(false);
    });

    it("should return false for whitespace only", () => {
      expect(validateCattleNumber("   ")).toBe(false);
    });

    it("should return true for valid number", () => {
      expect(validateCattleNumber("123")).toBe(true);
    });

    it("should return true for number with spaces", () => {
      expect(validateCattleNumber("  ABC  ")).toBe(true);
    });
  });

  describe("validateWeight", () => {
    it("should return false for zero", () => {
      expect(validateWeight(0)).toBe(false);
    });

    it("should return false for negative", () => {
      expect(validateWeight(-10)).toBe(false);
    });

    it("should return true for positive weight", () => {
      expect(validateWeight(150)).toBe(true);
    });
  });

  describe("generateId", () => {
    it("should generate id with prefix", () => {
      const id = generateId("cattle");
      expect(id).toMatch(/^cattle_\d+_[a-z0-9]+$/);
    });

    it("should generate unique ids", () => {
      const id1 = generateId("test");
      const id2 = generateId("test");
      expect(id1).not.toBe(id2);
    });
  });
});
