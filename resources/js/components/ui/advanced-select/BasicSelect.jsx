import * as React from "react";
import ReactDOM from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "../label";

const BasicSelect = React.forwardRef(
  ({ 
    options = [], 
    value, 
    onChange, 
    placeholder = "Select an option...",
    disabled = false,
    className,
    label,
    error,
    isRequired = false,
    labelClassName,
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
    
    const buttonRef = React.useRef(null);
    const listRef = React.useRef(null);

    const [coords, setCoords] = React.useState({ top: 0, left: 0, width: 0 });

    const selectedOption = options.find(opt => opt.value == value);

    const updatePosition = React.useCallback(() => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setCoords({
          top: rect.bottom + window.scrollY + 4, 
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    }, []);

    const toggleOpen = () => {
      if (disabled) return;
      
      if (!isOpen) {
        updatePosition();
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

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
      const handleClickOutside = (e) => {
        if (
          buttonRef.current && 
          !buttonRef.current.contains(e.target) &&
          listRef.current &&
          !listRef.current.contains(e.target)
        ) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isOpen]);

    const handleKeyDown = (e) => {
      if (disabled) return;

      switch (e.key) {
        case "Enter":
        case " ":
          e.preventDefault();
          if (isOpen && highlightedIndex >= 0) {
            onChange?.(options[highlightedIndex].value);
            setIsOpen(false);
          } else {
            if (!isOpen) updatePosition();
            setIsOpen(!isOpen);
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (!isOpen) {
            updatePosition();
            setIsOpen(true);
          } else {
            setHighlightedIndex(prev => 
              prev < options.length - 1 ? prev + 1 : 0
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
              prev > 0 ? prev - 1 : options.length - 1
            );
          }
          break;
        case "Escape":
          setIsOpen(false);
          break;
        case "Tab":
          setIsOpen(false);
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
          className="max-h-60 overflow-auto p-1.5 space-y-1 scrollbar-thin"
          onMouseLeave={() => setHighlightedIndex(-1)}
        >
          {options.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground text-center">
              No options available
            </li>
          ) : (
            options.map((option, index) => (
              <li
                key={option.value}
                role="option"
                aria-selected={value === option.value}
                onClick={() => {
                  onChange?.(option.value);
                  setIsOpen(false);
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={cn(
                  "relative flex cursor-pointer select-none items-center rounded-md px-3 py-2.5 text-sm",
                  "transition-colors duration-150",
                  value == option.value 
                    ? "bg-primary text-primary-foreground" 
                    : highlightedIndex == index 
                      ? "bg-accent/50" 
                      : "hover:bg-accent/30",
                  option.disabled && "pointer-events-none opacity-50"
                )}
              >
                <span className="flex-1 truncate">{option.label}</span>
                {value == option.value && (
                  <Check className="h-4 w-4 shrink-0 ml-2" />
                )}
              </li>
            ))
          )}
        </ul>
      </div>
    );

    return (
      <div className={cn("w-full space-y-2", className)}>
        {label && (
          <Label className={`text-sm font-medium text-muted-foreground ${labelClassName ? labelClassName : ""} ${isRequired ? 'after:content-["*"] gap-0' : ""}`}>
            {label}
          </Label>
        )}
        <div className="relative">
          <button
            ref={(node) => {
                buttonRef.current = node;
                if (typeof ref === 'function') ref(node);
                else if (ref) ref.current = node;
            }}
            type="button"
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            disabled={disabled}
            onClick={toggleOpen} 
            onKeyDown={handleKeyDown}
            className={cn(
              "flex h-11 w-full items-center justify-between rounded-lg border border-border bg-background px-4 py-2.5 text-sm",
              "ring-offset-background transition-all duration-200",
              "hover:border-primary/50 focus:outline-none focus:ring-1 focus:ring-ring ",
              disabled && "cursor-not-allowed opacity-50",
              error && "border-destructive focus:ring-destructive"
            )}
            {...props}
          >
            <span className={cn(
              "truncate text-muted-foreground",
              !selectedOption && "text-muted-foreground"
            )}>
              {selectedOption?.label || placeholder}
            </span>
            <ChevronDown 
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                isOpen && "rotate-180"
              )} 
            />
          </button>

          {isOpen && ReactDOM.createPortal(dropdownContent, document.body)}
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

BasicSelect.displayName = "BasicSelect";

export { BasicSelect };