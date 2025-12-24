import { useState, useEffect, useCallback } from "react";
import { getAllMeters, type Meter } from "@/data/meterData";
import { getAllBehaviors, type MeterBehavior } from "@/data/behaviorData";
import { getAllGuides, type Guide } from "@/data/guideData";

export interface SearchResult {
  id: string;
  type: "meter" | "behavior" | "guide";
  title: string;
  subtitle: string;
  path: string;
}

interface CacheData {
  meters: Meter[];
  behaviors: MeterBehavior[];
  guides: Guide[];
  lastFetched: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

let globalCache: CacheData | null = null;

export function useSearchCache() {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(!!globalCache);

  const fetchData = useCallback(async (force = false) => {
    // Return cached data if still valid
    if (
      !force &&
      globalCache &&
      Date.now() - globalCache.lastFetched < CACHE_DURATION
    ) {
      setIsReady(true);
      return;
    }

    setIsLoading(true);
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    };

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
      };
      setIsReady(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount if cache is empty or stale
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const search = useCallback((query: string): SearchResult[] => {
    if (!globalCache || !query.trim()) return [];

    const q = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search meters
    globalCache.meters.forEach((meter) => {
      const matchFields = [
        meter.brand,
        meter.model,
        meter.type,
        ...(meter.features || []),
      ].map((f) => (f || "").toLowerCase());

      if (matchFields.some((field) => field.includes(q))) {
        results.push({
          id: `meter-${meter.id}`,
          type: "meter",
          title: `${meter.brand} ${meter.model}`,
          subtitle: meter.type,
          path: `/directory/${meter.id}`,
        });
      }
    });

    // Search behaviors - using local MeterBehavior structure
    globalCache.behaviors.forEach((behavior) => {
      const symptoms = Array.isArray(behavior.symptoms) ? behavior.symptoms : [];

      const matchFields = [
        behavior.title,
        behavior.description,
        behavior.meterBrand || "",
        behavior.meterModel || "",
        ...symptoms,
      ].map((f) => (f || "").toLowerCase());

      if (matchFields.some((field) => field.includes(q))) {
        results.push({
          id: `behavior-${behavior.id}`,
          type: "behavior",
          title: behavior.title,
          subtitle: `${behavior.meterBrand} ${behavior.meterModel}`.trim() || "Unknown meter",
          path: `/behavior/${behavior.id}`,
        });
      }
    });

    // Search guides
    globalCache.guides.forEach((guide) => {
      const matchFields = [
        guide.title,
        guide.description,
        guide.category,
        guide.tags || "",
      ].map((f) => (f || "").toLowerCase());

      if (matchFields.some((field) => field.includes(q))) {
        results.push({
          id: `guide-${guide.id}`,
          type: "guide",
          title: guide.title,
          subtitle: `${guide.category} • ${guide.difficulty}`,
          path: `/guide/${guide.id}`,
        });
      }
    });

    return results;
  }, []);

  const refresh = useCallback(() => fetchData(true), [fetchData]);

  return { search, isLoading, isReady, refresh };
}
