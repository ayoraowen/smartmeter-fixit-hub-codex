import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Gauge, BookOpen, AlertTriangle, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getAllMeters, type Meter } from "@/data/meterData";
import { getAllGuides, type Guide } from "@/data/guideData";
import { getAllBehaviors, type MeterBehavior } from "@/data/behaviorData";

interface SearchResult {
  id: string;
  type: "meter" | "guide" | "behavior";
  title: string;
  subtitle: string;
  path: string;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const query = searchTerm.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search meters
    const meters = getAllMeters();
    meters.forEach((meter: Meter) => {
      const matchFields = [
        meter.brand,
        meter.model,
        meter.type,
        ...meter.features,
      ].map((f) => f.toLowerCase());

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

    // Search guides
    const guides = getAllGuides();
    guides.forEach((guide: Guide) => {
      const matchFields = [
        guide.title,
        guide.description,
        guide.category,
        guide.tags || "",
      ].map((f) => f.toLowerCase());

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

    // Search behaviors (issues)
    const behaviors = getAllBehaviors();
    behaviors.forEach((behavior: MeterBehavior) => {
      const matchFields = [
        behavior.title,
        behavior.description,
        behavior.meterBrand,
        behavior.meterModel,
        ...behavior.symptoms,
      ].map((f) => f.toLowerCase());

      if (matchFields.some((field) => field.includes(query))) {
        searchResults.push({
          id: `behavior-${behavior.id}`,
          type: "behavior",
          title: behavior.title,
          subtitle: `${behavior.meterBrand} ${behavior.meterModel}`,
          path: `/behavior/${behavior.id}`,
        });
      }
    });

    setResults(searchResults.slice(0, 10)); // Limit to 10 results
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
            {results.length === 0 && (
              <CommandEmpty>No results found for "{searchTerm}"</CommandEmpty>
            )}
            {groupedResults.meters.length > 0 && (
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
            {groupedResults.guides.length > 0 && (
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
            {groupedResults.behaviors.length > 0 && (
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
