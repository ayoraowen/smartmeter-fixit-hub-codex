import { useState, useEffect, useCallback } from "react";

interface ApiBehavior {
  id: number;
  title: string;
  description: string;
  symptoms: string | string[];
  meterBrand?: string;
  meterModel?: string;
}

interface ApiMeter {
  id: number;
  brand: string;
  model: string;
  type: string;
  features?: string[];
}

interface ApiGuide {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  tags?: string;
}

export interface SearchResult {
  id: string;
  type: "meter" | "behavior" | "guide";
  title: string;
  subtitle: string;
  path: string;
}

interface CacheData {
  meters: ApiMeter[];
  behaviors: ApiBehavior[];
  guides: ApiGuide[];
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
      const [metersRes, behaviorsRes, guidesRes] = await Promise.all([
        fetch("https://localhost:3000/meters", { headers }).catch(() => null),
        fetch("https://localhost:3000/behaviors", { headers }).catch(
          () => null
        ),
        fetch("https://localhost:3000/guides", { headers }).catch(() => null),
      ]);

      const meters: ApiMeter[] = metersRes?.ok
        ? await metersRes.json()
        : [];
      const behaviors: ApiBehavior[] = behaviorsRes?.ok
        ? await behaviorsRes.json()
        : [];
      const guides: ApiGuide[] = guidesRes?.ok
        ? await guidesRes.json()
        : [];

      globalCache = {
        meters,
        behaviors,
        guides,
        lastFetched: Date.now(),
      };
      setIsReady(true);
    } catch (error) {
      console.error("Failed to fetch search data:", error);
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
          path: `/meter/${meter.id}`,
        });
      }
    });

    // Search behaviors
    globalCache.behaviors.forEach((behavior) => {
      const symptoms = Array.isArray(behavior.symptoms)
        ? behavior.symptoms
        : typeof behavior.symptoms === "string"
        ? JSON.parse(behavior.symptoms || "[]")
        : [];

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
          subtitle:
            `${behavior.meterBrand || ""} ${behavior.meterModel || ""}`.trim() ||
            "Unknown meter",
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
