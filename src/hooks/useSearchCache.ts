import { useState, useEffect, useCallback } from "react";
import { getAllMeters } from "@/data/meterData";
import { getAllBehaviors } from "@/data/behaviorData";
import { getAllGuides } from "@/data/guideData";
import { useAuth } from "@/contexts/AuthContext";

function safeParseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === "string");
  }

  if (typeof value !== "string") return [];
  const trimmed = value.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed.filter((v): v is string => typeof v === "string");
    }
    return [];
  } catch {
    // last resort: allow comma-separated strings
    return trimmed.includes(",")
      ? trimmed
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [trimmed];
  }
}

export interface SearchResult {
  id: string;
  type: "meter" | "behavior" | "guide";
  title: string;
  subtitle: string;
  path: string;
}

interface CacheData {
  meters: any[];
  behaviors: any[];
  guides: any[];
  lastFetched: number;
  authToken: string | null;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

let globalCache: CacheData | null = null;

export function useSearchCache() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(!!globalCache);

  const fetchData = useCallback(async (force = false) => {
    const authToken =
      localStorage.getItem("authToken") || localStorage.getItem("token");

    // Return cached data if still valid (and auth context didn't change)
    if (
      !force &&
      globalCache &&
      globalCache.authToken === authToken &&
      Date.now() - globalCache.lastFetched < CACHE_DURATION
    ) {
      setIsReady(true);
      return;
    }

    setIsLoading(true);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Only attach Authorization if we actually have a token (avoid `Bearer null`)
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    try {
      // Try to fetch from API first
      const [metersRes, behaviorsRes, guidesRes] = await Promise.all([
        fetch("https://localhost:3000/meters", { headers }).catch(() => null),
        fetch("https://localhost:3000/behaviors", { headers }).catch(() => null),
        fetch("https://localhost:3000/guides", { headers }).catch(() => null),
      ]);

      // Check if any API call succeeded
      const apiMeters = metersRes?.ok ? await metersRes.json() : null;
      const apiBehaviors = behaviorsRes?.ok ? await behaviorsRes.json() : null;
      const apiGuides = guidesRes?.ok ? await guidesRes.json() : null;

      // Use API data if available, otherwise fall back to local data
      const meters = apiMeters || getAllMeters();
      const behaviors = apiBehaviors || getAllBehaviors();
      const guides = apiGuides || getAllGuides();

      globalCache = {
        meters,
        behaviors,
        guides,
        lastFetched: Date.now(),
        authToken,
      };
      setIsReady(true);
    } catch (error) {
      // If all API calls fail, use local data as fallback
      console.warn("API fetch failed, using local data:", error);
      globalCache = {
        meters: getAllMeters(),
        behaviors: getAllBehaviors(),
        guides: getAllGuides(),
        lastFetched: Date.now(),
        authToken,
      };
      setIsReady(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount (and after login/logout) if cache is empty or stale
  useEffect(() => {
    fetchData();
  }, [fetchData, user]);

  const search = useCallback((query: string): SearchResult[] => {
    if (!globalCache || !query.trim()) return [];

    const q = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search meters
    globalCache.meters.forEach((meter: any) => {
      const brand = meter?.brand ?? "";
      const model = meter?.model ?? "";
      const meterType =
        meter?.type ?? meter?.meter_type_code ?? meter?.connection_type ?? "";
      const features = safeParseStringArray(meter?.features);

      const matchFields = [brand, model, meterType, ...features].map((f) =>
        (f || "").toLowerCase()
      );

      if (matchFields.some((field) => field.includes(q))) {
        results.push({
          id: `meter-${meter.id}`,
          type: "meter",
          title: `${brand} ${model}`.trim() || `Meter ${meter.id}`,
          subtitle: meterType || "Meter",
          path: `/directory/${meter.id}`,
        });
      }
    });

    // Search behaviors (API + local normalization)
    globalCache.behaviors.forEach((behavior: any) => {
      const meterBrand = behavior?.meterBrand || behavior?.meter?.brand || "";
      const meterModel = behavior?.meterModel || behavior?.meter?.model || "";

      const symptoms = safeParseStringArray(behavior?.symptoms);
      const solutions = safeParseStringArray(behavior?.solutions);

      const matchFields = [
        behavior?.title,
        behavior?.description,
        meterBrand,
        meterModel,
        ...symptoms,
        ...solutions,
      ].map((f) => (f || "").toLowerCase());

      if (matchFields.some((field) => field.includes(q))) {
        results.push({
          id: `behavior-${behavior.id}`,
          type: "behavior",
          title: behavior.title,
          subtitle: `${meterBrand} ${meterModel}`.trim() || "Unknown meter",
          path: `/behaviors/${behavior.id}`,
        });
      }
    });

    // Search guides
    globalCache.guides.forEach((guide: any) => {
      const tags = safeParseStringArray(guide?.tags);

      const matchFields = [
        guide?.title,
        guide?.description,
        guide?.category,
        guide?.difficulty,
        ...tags,
      ].map((f) => (f || "").toLowerCase());

      if (matchFields.some((field) => field.includes(q))) {
        results.push({
          id: `guide-${guide.id}`,
          type: "guide",
          title: guide.title,
          subtitle: `${guide.category} • ${guide.difficulty}`.trim(),
          path: `/guides/${guide.id}`,
        });
      }
    });

    return results;
  }, []);

  const refresh = useCallback(() => fetchData(true), [fetchData]);

  return { search, isLoading, isReady, refresh };
}
