import * as React from "react";
import ReactDOM from "react-dom"; 
import { Check, ChevronDown, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const simulateApiSearch = async (query, signal) => {
  const allOptions = [
    { value: "ocean", label: "Ocean" },
    { value: "blue", label: "Blue" },
    { value: "purple", label: "Purple" },
    { value: "red", label: "Red" },
    { value: "orange", label: "Orange" },
    { value: "yellow", label: "Yellow" },
    { value: "green", label: "Green" },
    { value: "forest", label: "Forest" },
    { value: "slate", label: "Slate" },
    { value: "silver", label: "Silver" },
    { value: "teal", label: "Teal" },
    { value: "navy", label: "Navy" },
    { value: "coral", label: "Coral" },
    { value: "rose", label: "Rose" },
    { value: "lavender", label: "Lavender" },
  ];

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(resolve, 500 + Math.random() * 500);
    signal?.addEventListener("abort", () => {
      clearTimeout(timeout);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

  if (!query.trim()) {
    return allOptions.slice(0, 8);
  }

  const lowerQuery = query.toLowerCase();
  return allOptions.filter(opt => 
    opt.label.toLowerCase().includes(lowerQuery)
  );
};

const MultiSelect = React.forwardRef(
  ({ 
    value = [], 
    onChange, 
    placeholder = "Search or select...",
    disabled = false,
    className,
    label,
    error,
    fetchOptions = simulateApiSearch,
    debounceMs = 300,
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [highlightedIndex, setHighlightedIndex] = React.useState(0);
    const [options, setOptions] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [loadError, setLoadError] = React.useState(null);
    const [coords, setCoords] = React.useState({ top: 0, left: 0, width: 0 });

    const containerRef = React.useRef(null);
    const inputRef = React.useRef(null);
    const listRef = React.useRef(null);
    const abortControllerRef = React.useRef(null);
    const debounceTimerRef = React.useRef(null);

    const updatePosition = React.useCallback(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCoords({
          top: rect.bottom + window.scrollY + 6, 
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    }, []);

    const fetchOptionsDebounced = React.useCallback(async (query, immediate = false) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      setIsLoading(true);
      setLoadError(null);
      if (immediate) {
        setOptions([]);
      }

      const delay = immediate ? 0 : debounceMs;

      debounceTimerRef.current = setTimeout(async () => {
        try {
          const results = await fetchOptions(query, signal);
          
          const valueSet = new Set(value);
          const filteredResults = results.filter(r => !valueSet.has(r.value));
          
          const currentSelected = value.map(val => {
            const found = options.find(o => o.value === val);
            return found || {value: val, label: val};
          })
          
          const uniqueSelected = currentSelected.filter(
            (obj, index, self) => index === self.findIndex(o => o.value === obj.value)
          );

          const combined = [...uniqueSelected, ...results];
          const uniqueCombined = combined.filter(
            (obj, index, self) => index === self.findIndex(o => o.value === obj.value)
          );
          setOptions(uniqueCombined);
          setHighlightedIndex(0);
        } catch (err) {
          if (err.name !== "AbortError") {
            setLoadError("Failed to load options");
            setOptions([]);
          }
        } finally {
          setIsLoading(false);
        }
      }, delay);
    }, [fetchOptions, debounceMs, value, options]);

    React.useLayoutEffect(() => {
      if (isOpen) {
        updatePosition();
        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition, true);
        fetchOptionsDebounced(searchQuery, true);
      }
      return () => {
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition, true);
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }, [isOpen, updatePosition]); 

    React.useEffect(() => {
        if(isOpen) {
            updatePosition();
        }
    }, [value, isOpen, updatePosition]);

    React.useEffect(() => {
      if (isOpen && searchQuery !== "") {
        fetchOptionsDebounced(searchQuery, false);
      }
    }, [searchQuery]);

    React.useEffect(() => {
      const handleClickOutside = (e) => {
        if (
            containerRef.current && 
            !containerRef.current.contains(e.target) &&
            listRef.current && 
            !listRef.current.contains(e.target)
        ) {
          setIsOpen(false);
          setSearchQuery("");
        }
      };
      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    React.useEffect(() => {
      if (isOpen && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isOpen]);

    const handleSelect = (option) => {
      onChange?.([...value, option.value]);
      setSearchQuery("");
      if(inputRef.current) inputRef.current.focus();
    };

    const handleRemove = (selectedValue, e) => {
      e.stopPropagation();
      onChange?.(value.filter(v => v !== selectedValue));
      updatePosition(); 
    };

    const handleKeyDown = (e) => {
      if (disabled) return;

      if (e.key === 'Backspace' && searchQuery === '' && value.length > 0) {
        onChange?.(value.slice(0, value.length - 1));
        return;
      }

      switch (e.key) {
        case "Enter":
          e.preventDefault();
          if (isOpen && filteredOptions[highlightedIndex]) {
            handleSelect(filteredOptions[highlightedIndex]);
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setHighlightedIndex(prev => 
              prev < filteredOptions.length - 1 ? prev + 1 : 0
            );
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setHighlightedIndex(prev => 
              prev > 0 ? prev - 1 : filteredOptions.length - 1
            );
          }
          break;
        case "Escape":
          setIsOpen(false);
          setSearchQuery("");
          break;
      }
    };
    
    React.useEffect(() => {
      if (isOpen && highlightedIndex >= 0 && listRef.current && !isLoading) {
        const listContainer = listRef.current.querySelector('ul') || listRef.current;
        if(listContainer && listContainer.children) {
             const highlightedEl = listContainer.children[highlightedIndex];
             highlightedEl?.scrollIntoView({ block: "nearest" });
        }
      }
    }, [highlightedIndex, isOpen, isLoading]);

    const filteredOptions = options.filter(opt => !value.includes(opt.value));
    const currentSelectedOptions = options.filter(opt => value.includes(opt.value));

    const dropdownContent = (
      <div
        ref={listRef} 
        className={cn(
            "absolute z-9999 overflow-hidden rounded-lg border border-border bg-popover shadow-lg",
            "animate-in fade-in-0 zoom-in-95 duration-100 ease-out"
        )}
        style={{
            top: coords.top,
            left: coords.left,
            width: coords.width,
        }}
      >
        <div className="max-h-64 overflow-auto p-1.5 scrollbar-thin">
            {isLoading && filteredOptions.length === 0 ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 text-primary animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : loadError ? (
              <div className="px-3 py-4 text-center">
                <p className="text-sm text-destructive">{loadError}</p>
                <button
                  type="button"
                  onClick={() => fetchOptionsDebounced(searchQuery)}
                  className="text-xs text-primary hover:underline mt-2"
                >
                  Try again
                </button>
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center">
                <p className="text-sm text-muted-foreground">No results found</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Try a different search term
                </p>
              </div>
            ) : (
              <ul role="listbox" onMouseLeave={() => setHighlightedIndex(-1)}>
                {filteredOptions.map((option, index) => (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={value.includes(option.value)}
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={cn(
                      "relative flex cursor-pointer mb-1 select-none items-center rounded-md px-3 py-2.5 text-sm",
                      "transition-colors duration-150",
                      highlightedIndex === index 
                        ? "bg-accent/50" 
                        : "hover:bg-accent/30",
                      option.disabled && "pointer-events-none opacity-50"
                    )}
                  >
                    <span className="flex-1 truncate">{option.label}</span>
                    {value.includes(option.value) && (
                      <Check className="h-4 w-4 shrink-0 ml-2 text-primary" />
                    )}
                  </li>
                ))}
              </ul>
            )}
        </div>
      </div>
    );

    return (
      <div className={cn("w-full space-y-1.5", className)} ref={containerRef}>
        {label && (
          <label className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div 
          onClick={() => {
            if(!disabled) {
                updatePosition();
                setIsOpen(true);
            }
          }}
          className={cn(
            "flex w-full flex-wrap items-center gap-2 rounded-lg border border-border bg-background p-2.5",
            "min-h-11",
            "hover:border-primary/50",
            disabled && "cursor-not-allowed opacity-50",
            error && "border-destructive focus-within:ring-destructive"
          )}
        >
          {currentSelectedOptions.map(option => (
            <div 
              key={option.value}
              className="flex items-center gap-1.5 bg-muted text-foreground text-sm rounded-md px-2 py-1"
            >
              <span className="truncate">{option.label}</span>
              <button
                type="button"
                onClick={(e) => handleRemove(option.value, e)}
                className="p-0.5 rounded hover:bg-muted-foreground/20 transition-colors"
                aria-label={`Remove ${option.label}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          <div className="flex-1 min-w-30 relative">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                  updatePosition();
                  setIsOpen(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder={value.length > 0 ? "" : placeholder}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              disabled={disabled}
            />
          </div>

          <div className="flex items-center self-stretch">
            {isLoading && isOpen && (
              <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
            )}
            <ChevronDown 
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200 ml-2",
                isOpen && "rotate-180"
              )} 
            />
          </div>
        </div>
        
        {isOpen && ReactDOM.createPortal(dropdownContent, document.body)}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

MultiSelect.displayName = "MultiSelect";

export { MultiSelect };