import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Cattle,
  CattleResult,
  Disease,
  Pregnancy,
  VaccinationRecord,
} from "@/types";
import { calculateAge } from "@/lib/helpers";

export interface FilterOptions {
  searchQuery: string;
  status: CattleResult | "all";
  breed: string;
  ageRange: { min: string; max: string };
}

export interface UseCattleFilterReturn {
  filteredCattle: Cattle[];
  breeds: string[];
  statusFilter: CattleResult | "all";
  breedFilter: string;
  ageRange: { min: string; max: string };
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: CattleResult | "all") => void;
  setBreedFilter: (breed: string) => void;
  setAgeRange: (range: { min: string; max: string }) => void;
  clearFilters: () => void;
  getStatus: (cattleItem: Cattle) => CattleResult[];
}

function calculateStatus(
  cattleItem: Cattle,
  diseases: Disease[],
  pregnancies: Pregnancy[],
  vaccines: VaccinationRecord[],
): CattleResult[] {
  const inDeath = diseases.find(
    (d) => d.cattleId === cattleItem.id && d.result === "death",
  );
  if (inDeath) {
    return ["death"];
  }

  let result = [] as CattleResult[];
  const inTreatment = diseases.find(
    (d) => d.cattleId === cattleItem.id && d.result === "in_treatment",
  );
  if (inTreatment) {
    result.push("in_treatment");
  } else {
    result.push("healthy");
  }

  const activePregnancy = pregnancies.find(
    (p) => p.cattleId === cattleItem.id && p.result === "pending",
  );
  if (activePregnancy) {
    const expectedBirthDate = new Date(activePregnancy.expectedBirthDate);
    if (new Date() > expectedBirthDate) {
      result.push("overdue_pregnancy");
    }
    result.push("pregnancy");
  }

  const pendingVaccine = vaccines.find((v) => {
    if (v.cattleId !== cattleItem.id) return false;
    if (!v.nextDoseDate || v.isNextDoseApplied) return false;
    const nextDoseDate = new Date(v.nextDoseDate);
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return nextDoseDate <= thirtyDaysFromNow;
  });
  if (pendingVaccine) {
    result.push("pending_vaccine");
  }

  return result;
}

export function useCattleFilter(
  cattle: Cattle[],
  diseases: Disease[],
  pregnancies: Pregnancy[],
  vaccines: VaccinationRecord[],
  initialStatus?: CattleResult | "all",
): UseCattleFilterReturn {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CattleResult | "all">(
    initialStatus || "all",
  );
  const [breedFilter, setBreedFilter] = useState<string>("all");
  const [ageRange, setAgeRange] = useState<{ min: string; max: string }>({
    min: "",
    max: "",
  });

  const statusMap = useMemo(() => {
    const map = new Map<string, CattleResult[]>();
    cattle.forEach((c) => {
      map.set(c.id, calculateStatus(c, diseases, pregnancies, vaccines));
    });
    return map;
  }, [cattle, diseases, pregnancies, vaccines]);

  const breeds = useMemo(() => {
    const uniqueBreeds = Array.from(new Set(cattle.map((c) => c.breed))).filter(
      Boolean,
    );
    return ["all", ...uniqueBreeds.sort()];
  }, [cattle]);

  const filteredCattle = useMemo(() => {
    let filtered = [...cattle];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((c) => {
        const matchesNumber = c.number.toLowerCase().includes(query);
        const matchesName = c.name?.toLowerCase().includes(query);
        const matchesBreed = c.breed.toLowerCase().includes(query);
        return matchesNumber || matchesName || matchesBreed;
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => {
        const status = statusMap.get(c.id);
        return status?.includes(statusFilter) ?? false;
      });
    }

    if (breedFilter !== "all") {
      filtered = filtered.filter((c) => c.breed === breedFilter);
    }

    if (ageRange.min || ageRange.max) {
      filtered = filtered.filter((c) => {
        const age = calculateAge(c.birthDate);
        const minMatch = ageRange.min
          ? age >= parseInt(ageRange.min, 10)
          : true;
        const maxMatch = ageRange.max
          ? age <= parseInt(ageRange.max, 10)
          : true;
        return minMatch && maxMatch;
      });
    }

    return filtered;
  }, [cattle, searchQuery, statusFilter, breedFilter, ageRange, statusMap]);

  const getStatus = useCallback(
    (cattleItem: Cattle): CattleResult[] => {
      return statusMap.get(cattleItem.id) || [];
    },
    [statusMap],
  );

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("all");
    setBreedFilter("all");
    setAgeRange({ min: "", max: "" });
  }, []);

  return {
    filteredCattle,
    breeds,
    statusFilter,
    breedFilter,
    ageRange,
    searchQuery,
    setSearchQuery,
    setStatusFilter,
    setBreedFilter,
    setAgeRange,
    clearFilters,
    getStatus,
  };
}

export { calculateStatus };
