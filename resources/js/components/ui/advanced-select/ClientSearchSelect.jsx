import * as React from "react";
import ReactDOM from "react-dom"; 
import { Check, ChevronDown, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const ClientSearchSelect = React.forwardRef(
  ({ 
    options = [], 
    value, 
    onChange, 
    placeholder = "Search or select...",
    disabled = false,
    className,
    label,
    error,
    clearable = true,
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [highlightedIndex, setHighlightedIndex] = React.useState(0);
    
    const containerRef = React.useRef(null);
    const triggerRef = React.useRef(null); 
    const inputRef = React.useRef(null);
    const listRef = React.useRef(null);

    const [coords, setCoords] = React.useState({ top: 0, left: 0, width: 0 });

    const selectedOption = options.find(opt => opt.value === value);

    const filteredOptions = React.useMemo(() => {
      if (!searchQuery.trim()) return options;
      const query = searchQuery.toLowerCase();
      return options.filter(opt => 
        opt.label.toLowerCase().includes(query)
      );
    }, [options, searchQuery]);

    const updatePosition = React.useCallback(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setCoords({
          top: rect.bottom + window.scrollY + 4, 
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    }, []);

    React.useLayoutEffect(() => {
      if (isOpen) {
        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition);
      }
      return () => {
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition);
      };
    }, [isOpen, updatePosition]);

    React.useEffect(() => {
      setHighlightedIndex(0);
    }, [filteredOptions.length]);

    React.useEffect(() => {
      const handleClickOutside = (e) => {
        if (
          triggerRef.current && 
          !triggerRef.current.contains(e.target) &&
          listRef.current && 
          !listRef.current.contains(e.target)
        ) {
          setIsOpen(false);
          setSearchQuery("");
        }
      };
      
      if(isOpen) {
          document.addEventListener("mousedown", handleClickOutside);
      }
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    React.useEffect(() => {
      if (isOpen && inputRef.current) {
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    }, [isOpen]);

    const handleSelect = (optionValue) => {
      onChange?.(optionValue);
      setIsOpen(false);
      setSearchQuery("");
    };

    const handleClear = (e) => {
      e.stopPropagation();
      onChange?.(null);
      setSearchQuery("");
    };

    const handleTriggerClick = () => {
        if (!disabled) {
            if(!isOpen) updatePosition();
            setIsOpen(true);
        }
    }

    const handleKeyDown = (e) => {
      if (disabled) return;

      switch (e.key) {
        case "Enter":
          e.preventDefault();
          if (isOpen && filteredOptions[highlightedIndex]) {
            handleSelect(filteredOptions[highlightedIndex].value);
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (!isOpen) {
            updatePosition();
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
            updatePosition();
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
      if (isOpen && highlightedIndex >= 0 && listRef.current) {
        const highlightedEl = listRef.current.children[highlightedIndex];
        highlightedEl?.scrollIntoView({ block: "nearest" });
      }
    }, [highlightedIndex, isOpen]);

    const dropdownContent = (
      <div
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
        <ul
          ref={listRef}
          role="listbox"
          className="max-h-64 overflow-auto space-y-1 p-1.5 scrollbar-thin"
          onMouseLeave={() => setHighlightedIndex(-1)}
        >
          {filteredOptions.length === 0 ? (
            <li className="px-3 py-8 text-center">
              <p className="text-sm text-muted-foreground">No results found</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Try a different search term
              </p>
            </li>
          ) : (
            filteredOptions.map((option, index) => (
              <li
                key={option.value}
                role="option"
                aria-selected={value === option.value}
                onClick={() => handleSelect(option.value)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={cn(
                  "relative flex cursor-pointer select-none items-center rounded-md px-3 py-2.5 text-sm",
                  "transition-colors duration-150",
                  value === option.value 
                    ? "bg-primary text-primary-foreground" 
                    : highlightedIndex === index 
                      ? "bg-accent/50" 
                      : "hover:bg-accent/30",
                  option.disabled && "pointer-events-none opacity-50"
                )}
              >
                <span className="flex-1 truncate">{option.label}</span>
                {value === option.value && (
                  <Check className="h-4 w-4 shrink-0 ml-2" />
                )}
              </li>
            ))
          )}
        </ul>
      </div>
    );

    return (
      <div className={cn("w-full space-y-1.5", className)} ref={containerRef}>
        {label && (
          <label className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          <div
            ref={triggerRef}
            onClick={handleTriggerClick}
            className={cn(
              "flex h-11 w-full items-center rounded-lg border border-border bg-background transition-all duration-200",
              "hover:border-primary/50",
              disabled && "cursor-not-allowed opacity-50",
              error && "border-destructive focus-within:ring-destructive"
            )}
          >
            {isOpen ? (
              <div className="flex items-center flex-1 px-3">
                <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={selectedOption?.label || placeholder}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  disabled={disabled}
                />
              </div>
            ) : (
              <div className="flex items-center flex-1 px-4 cursor-pointer">
                <span className={cn(
                  "flex-1 truncate text-sm",
                  !selectedOption && "text-muted-foreground"
                )}>
                  {selectedOption?.label || placeholder}
                </span>
              </div>
            )}

            <div className="flex items-center pr-3 gap-1">
              {clearable && value && !isOpen && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-0.5 rounded hover:bg-muted transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
              <div className="h-5 w-px bg-border mx-1" />
              <ChevronDown 
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  isOpen && "rotate-180"
                )} 
              />
            </div>
          </div>

          {isOpen && ReactDOM.createPortal(dropdownContent, document.body)}
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

ClientSearchSelect.displayName = "ClientSearchSelect";

export { ClientSearchSelect };