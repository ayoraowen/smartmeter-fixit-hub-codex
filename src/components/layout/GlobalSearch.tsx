import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Gauge, BookOpen, AlertTriangle, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface SearchResult {
  id: string;
  type: "meter" | "guide" | "behavior";
  title: string;
  subtitle: string;
  path: string;
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

interface ApiBehavior {
  id: number;
  title: string;
  description: string;
  meterBrand?: string;
  meterModel?: string;
  symptoms?: string[] | string;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const query = searchTerm.toLowerCase();

    const fetchSearchResults = async () => {
      setIsLoading(true);
      const searchResults: SearchResult[] = [];
      const token = localStorage.getItem("authToken");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      try {
        // Fetch all data in parallel
        const [metersRes, behaviorsRes, guidesRes] = await Promise.all([
          fetch("https://localhost:3000/meters", {
            headers,
            signal: controller.signal,
          }).catch(() => null),
          fetch("https://localhost:3000/behaviors", {
            headers,
            signal: controller.signal,
          }).catch(() => null),
          fetch("https://localhost:3000/guides", {
            headers,
            signal: controller.signal,
          }).catch(() => null),
        ]);

        // Process meters
        if (metersRes?.ok) {
          const meters: ApiMeter[] = await metersRes.json();
          meters.forEach((meter) => {
            const matchFields = [
              meter.brand,
              meter.model,
              meter.type,
              ...(meter.features || []),
            ].map((f) => (f || "").toLowerCase());

            if (matchFields.some((field) => field.includes(query))) {
              searchResults.push({
                id: `meter-${meter.id}`,
                type: "meter",
                title: `${meter.brand} ${meter.model}`,
                subtitle: meter.type,
                path: `/meter/${meter.id}`,
              });
            }
          });
        }

        // Process behaviors
        if (behaviorsRes?.ok) {
          const behaviors: ApiBehavior[] = await behaviorsRes.json();
          behaviors.forEach((behavior) => {
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

            if (matchFields.some((field) => field.includes(query))) {
              searchResults.push({
                id: `behavior-${behavior.id}`,
                type: "behavior",
                title: behavior.title,
                subtitle: `${behavior.meterBrand || ""} ${behavior.meterModel || ""}`.trim() || "Unknown meter",
                path: `/behavior/${behavior.id}`,
              });
            }
          });
        }

        // Process guides
        if (guidesRes?.ok) {
          const guides: ApiGuide[] = await guidesRes.json();
          guides.forEach((guide) => {
            const matchFields = [
              guide.title,
              guide.description,
              guide.category,
              guide.tags || "",
            ].map((f) => (f || "").toLowerCase());

            if (matchFields.some((field) => field.includes(query))) {
              searchResults.push({
                id: `guide-${guide.id}`,
                type: "guide",
                title: guide.title,
                subtitle: `${guide.category} • ${guide.difficulty}`,
                path: `/guide/${guide.id}`,
              });
            }
          });
        }

        setResults(searchResults.slice(0, 10));
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Search error:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the search
    const timeoutId = setTimeout(fetchSearchResults, 300);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [searchTerm]);

  const handleSelect = (result: SearchResult) => {
    navigate(result.path);
    setOpen(false);
    setSearchTerm("");
  };

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "meter":
        return <Gauge className="h-4 w-4 text-primary" />;
      case "guide":
        return <BookOpen className="h-4 w-4 text-green-500" />;
      case "behavior":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    }
  };

  const groupedResults = {
    meters: results.filter((r) => r.type === "meter"),
    guides: results.filter((r) => r.type === "guide"),
    behaviors: results.filter((r) => r.type === "behavior"),
  };

  return (
    <Popover open={open && searchTerm.length > 0} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by meter model, error code, or symptom..."
            className="pl-10 pr-10 bg-background/50"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (e.target.value) setOpen(true);
            }}
            onFocus={() => {
              if (searchTerm) setOpen(true);
            }}
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setOpen(false);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        sideOffset={4}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandList>
            {isLoading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
              </div>
            )}
            {!isLoading && results.length === 0 && (
              <CommandEmpty>No results found for "{searchTerm}"</CommandEmpty>
            )}
            {!isLoading && groupedResults.meters.length > 0 && (
              <CommandGroup heading="Meters">
                {groupedResults.meters.map((result) => (
                  <CommandItem
                    key={result.id}
                    onSelect={() => handleSelect(result)}
                    className="cursor-pointer"
                  >
                    {getIcon(result.type)}
                    <div className="ml-2 flex flex-col">
                      <span className="font-medium">{result.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {result.subtitle}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {!isLoading && groupedResults.guides.length > 0 && (
              <CommandGroup heading="Guides">
                {groupedResults.guides.map((result) => (
                  <CommandItem
                    key={result.id}
                    onSelect={() => handleSelect(result)}
                    className="cursor-pointer"
                  >
                    {getIcon(result.type)}
                    <div className="ml-2 flex flex-col">
                      <span className="font-medium">{result.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {result.subtitle}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {!isLoading && groupedResults.behaviors.length > 0 && (
              <CommandGroup heading="Issues">
                {groupedResults.behaviors.map((result) => (
                  <CommandItem
                    key={result.id}
                    onSelect={() => handleSelect(result)}
                    className="cursor-pointer"
                  >
                    {getIcon(result.type)}
                    <div className="ml-2 flex flex-col">
                      <span className="font-medium">{result.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {result.subtitle}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
