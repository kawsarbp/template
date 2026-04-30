import * as React from "react";
import ReactDOM from "react-dom";
import { Check, ChevronDown, X, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "../label";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip";



const ServerSearchSelect = React.forwardRef(
  ({ 
    value, 
    onChange, 
    onInputChange = ()=>{},
    placeholder = "Search or select...",
    disabled = false,
    className,
    label,
    error,
    clearable = true,
    options = [],
    debounceMs = 300,
    isLoading=false,
    isRequired=false,
    isToolTip=false,
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [highlightedIndex, setHighlightedIndex] = React.useState(0)
    const [coords, setCoords] = React.useState({ top: 0, left: 0, width: 0 });
    const [placement, setPlacement] = React.useState("bottom");

    const containerRef = React.useRef(null);
    const inputRef = React.useRef(null);
    const listRef = React.useRef(null);
    const abortControllerRef = React.useRef(null);
   

    const updatePosition = React.useCallback(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const dropdownHeight = 280; // Approximate max height of our dropdown
        
        const spaceBelow = viewportHeight - rect.bottom;
        const showAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

        if (showAbove) {
          setCoords({
            top: rect.top - 6,
            left: rect.left,
            width: rect.width,
          });
          setPlacement("top");
        } else {
          setCoords({
            top: rect.bottom + 6,
            left: rect.left,
            width: rect.width,
          });
          setPlacement("bottom");
        }
      }
    }, []);




    React.useLayoutEffect(() => {
      if (isOpen) {
        updatePosition();
        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition, true);
      }
      return () => {
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition, true);
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        
      };
    }, [isOpen, updatePosition]);



    React.useEffect(() => {
      const handleClickOutside = (e) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target) &&
          listRef.current &&
          !listRef.current.contains(e.target)
        ) {
          setIsOpen(false);
          onInputChange("")
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
      onChange?.(option);
      setIsOpen(false);
      onInputChange("")
      setSearchQuery("");
    };

    const handleClear = (e) => {
      e.stopPropagation();
      onChange?.(null);
      onInputChange("")
      setSearchQuery("");
    };

    const handleKeyDown = (e) => {
      if (disabled) return;

      switch (e.key) {
        case "Enter":
          e.preventDefault();
          if (isOpen && options[highlightedIndex]) {
            handleSelect(options[highlightedIndex]);
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
          }
          break;
        case "Escape":
          setIsOpen(false);
          onInputChange("");
          setSearchQuery("");
          break;
      }
    };

    React.useEffect(() => {
      if (isOpen && highlightedIndex >= 0 && listRef.current && !isLoading) {
        const listContainer = listRef.current.querySelector("ul") || listRef.current;
        const highlightedEl = listContainer.children[highlightedIndex];
        highlightedEl?.scrollIntoView({ block: "nearest" });
      }
    }, [highlightedIndex, isOpen, isLoading]);

    const dropdownContent = (
      <div
        ref={listRef}
        className={cn(
          "fixed z-800 overflow-hidden rounded-lg border border-border bg-popover shadow-lg", 
          "animate-in fade-in-0 zoom-in-95 duration-100 ease-out",
        )}
        style={{
          top: coords.top,
          left: coords.left,
          width: coords.width,
          transform: placement === "top" ? "translateY(-100%)" : "none",
        }}
      >
        <div className="max-h-64 overflow-auto p-1.5 scrollbar-thin">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 text-primary animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : options.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <p className="text-sm text-muted-foreground">No results found</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Try a different search term</p>
            </div>
          ) : (
            <ul role="listbox" onMouseLeave={() => setHighlightedIndex(-1)}>
              {options.map((option, index) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={value === option.value}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={cn(
                    "relative flex cursor-pointer mb-1 select-none items-center rounded-md px-3 py-2.5 text-sm",
                    "transition-colors duration-150 overflow-hidden",
                    value === option.value
                      ? "bg-primary text-primary-foreground"
                      : highlightedIndex === index
                        ? "bg-accent/50"
                        : "hover:bg-accent/30",
                    option.disabled && "pointer-events-none opacity-50",
                  )}
                >
                {
                isToolTip ? 
                <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex-1 truncate">{option.label}</span>
                    </TooltipTrigger>
                    <TooltipContent side="right" align="center">
                      {option.label}
                    </TooltipContent>
                  </Tooltip> : <span className="flex-1 truncate">{option.label}</span>
                  }
                  {value === option.value && <Check className="h-4 w-4 shrink-0 ml-2" />}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );

    return (
      <div className={cn("w-full space-y-2", className)}>
        {label && <Label className={`text-sm font-medium text-muted-foreground  ${isRequired ? 'after:content-["*"] gap-0' : ""}`}>{label}</Label>}
        <div className="relative" ref={containerRef}>
          <div
            onClick={() => {
              if (!disabled) {
                updatePosition();
                setIsOpen(true);
              }
            }}
            className={cn(
              "flex h-11 w-full items-center rounded-lg border border-border bg-background cursor-pointer",
              "hover:border-primary/50",
              disabled && "cursor-not-allowed opacity-50",
              error && "border-destructive focus-within:ring-destructive",
            )}
          >
            {isOpen ? (
              <div className="flex items-center flex-1 px-3">
                <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    onInputChange(e.target.value);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={value?.label || placeholder}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  disabled={disabled}
                />
              </div>
            ) : (
              <div className="flex items-center flex-1 px-4 overflow-hidden">
                {isToolTip ?  
                <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex-1 truncate">{value?.label  || placeholder}</span>
                    </TooltipTrigger>
                    <TooltipContent side="right" align="center">
                      {value?.label  || placeholder}
                    </TooltipContent>
                  </Tooltip> :
                <span
                  className={cn(
                    "flex-1 truncate text-sm",
                    !value?.label && "text-muted-foreground",
                  )}
                >
                  {value?.label  || placeholder}
                </span>
                }
              </div>
            )}

            <div className="flex items-center pr-3 gap-1">
              {clearable && value && !isOpen && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-0.5 rounded hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
              <div className="h-5 w-px bg-border mx-1" />
              {isLoading && isOpen ? (
                <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
              ) : (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    isOpen && "rotate-180",
                  )}
                />
              )}
            </div>
          </div>

          {isOpen && ReactDOM.createPortal(dropdownContent, document.body)}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  },
);

ServerSearchSelect.displayName = "ServerSearchSelect";

export { ServerSearchSelect };
