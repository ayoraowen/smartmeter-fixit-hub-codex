import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Gauge, BookOpen, AlertTriangle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useSearchCache, SearchResult } from "@/hooks/useSearchCache";

export function GlobalSearch() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { search, isLoading, isReady } = useSearchCache();

  // Debounced search term
  const [debouncedTerm, setDebouncedTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Local search - no API calls
  const results = useMemo(() => {
    if (!debouncedTerm.trim()) return [];
    return search(debouncedTerm);
  }, [debouncedTerm, search]);

  const handleSelect = (result: SearchResult) => {
    navigate(result.path);
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchTerm("");
    setIsOpen(false);
  };

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "meter":
        return <Gauge className="h-4 w-4 text-primary" />;
      case "guide":
        return <BookOpen className="h-4 w-4 text-accent-foreground" />;
      case "behavior":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
  };

  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {
      meter: [],
      behavior: [],
      guide: [],
    };
    results.forEach((r) => groups[r.type].push(r));
    return groups;
  }, [results]);

  const hasResults = results.length > 0;
  const showPopover = isOpen && searchTerm.trim().length > 0;

  return (
    <Popover open={showPopover} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search meters, guides, issues..."
            className="pl-10 pr-10 bg-card/50 border-border/50 focus:bg-card"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (e.target.value.trim()) setIsOpen(true);
            }}
            onFocus={() => {
              if (searchTerm.trim()) setIsOpen(true);
            }}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
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
            {!isReady && isLoading ? (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </div>
            ) : !hasResults ? (
              <CommandEmpty>No results found.</CommandEmpty>
            ) : (
              <>
                {groupedResults.meter.length > 0 && (
                  <CommandGroup heading="Meters">
                    {groupedResults.meter.slice(0, 5).map((result) => (
                      <CommandItem
                        key={result.id}
                        onSelect={() => handleSelect(result)}
                        className="cursor-pointer"
                      >
                        {getIcon(result.type)}
                        <div className="ml-2 flex-1 overflow-hidden">
                          <p className="font-medium truncate">{result.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {result.subtitle}
                          </p>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {groupedResults.behavior.length > 0 && (
                  <CommandGroup heading="Meter Behavior Issues">
                    {groupedResults.behavior.slice(0, 5).map((result) => (
                      <CommandItem
                        key={result.id}
                        onSelect={() => handleSelect(result)}
                        className="cursor-pointer"
                      >
                        {getIcon(result.type)}
                        <div className="ml-2 flex-1 overflow-hidden">
                          <p className="font-medium truncate">{result.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {result.subtitle}
                          </p>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {groupedResults.guide.length > 0 && (
                  <CommandGroup heading="Guides">
                    {groupedResults.guide.slice(0, 5).map((result) => (
                      <CommandItem
                        key={result.id}
                        onSelect={() => handleSelect(result)}
                        className="cursor-pointer"
                      >
                        {getIcon(result.type)}
                        <div className="ml-2 flex-1 overflow-hidden">
                          <p className="font-medium truncate">{result.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {result.subtitle}
                          </p>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
