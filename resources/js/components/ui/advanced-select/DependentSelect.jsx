import * as React from "react";
import { Check, ChevronDown, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Simulated API data (Same as before)
const countriesData = [
  { value: "us", label: "United States" },
  { value: "uk", label: "United Kingdom" },
  { value: "ca", label: "Canada" },
  { value: "au", label: "Australia" },
  { value: "de", label: "Germany" },
];

const statesData = {
  us: [
    { value: "ny", label: "New York" },
    { value: "ca", label: "California" },
    { value: "tx", label: "Texas" },
    { value: "fl", label: "Florida" },
    { value: "il", label: "Illinois" },
  ],
  uk: [
    { value: "eng", label: "England" },
    { value: "sco", label: "Scotland" },
    { value: "wal", label: "Wales" },
    { value: "ni", label: "Northern Ireland" },
  ],
  ca: [
    { value: "on", label: "Ontario" },
    { value: "qc", label: "Quebec" },
    { value: "bc", label: "British Columbia" },
    { value: "ab", label: "Alberta" },
  ],
  au: [
    { value: "nsw", label: "New South Wales" },
    { value: "vic", label: "Victoria" },
    { value: "qld", label: "Queensland" },
    { value: "wa", label: "Western Australia" },
  ],
  de: [
    { value: "by", label: "Bavaria" },
    { value: "nw", label: "North Rhine-Westphalia" },
    { value: "bw", label: "Baden-Württemberg" },
    { value: "he", label: "Hesse" },
  ],
};

const citiesData = {
  ny: [
    { value: "nyc", label: "New York City" },
    { value: "buf", label: "Buffalo" },
    { value: "roc", label: "Rochester" },
  ],
  ca: [
    { value: "la", label: "Los Angeles" },
    { value: "sf", label: "San Francisco" },
    { value: "sd", label: "San Diego" },
  ],
  tx: [
    { value: "hou", label: "Houston" },
    { value: "dal", label: "Dallas" },
    { value: "aus", label: "Austin" },
  ],
  fl: [
    { value: "mia", label: "Miami" },
    { value: "orl", label: "Orlando" },
    { value: "tam", label: "Tampa" },
  ],
  il: [
    { value: "chi", label: "Chicago" },
    { value: "aur", label: "Aurora" },
    { value: "nap", label: "Naperville" },
  ],
  eng: [
    { value: "lon", label: "London" },
    { value: "man", label: "Manchester" },
    { value: "bir", label: "Birmingham" },
  ],
  sco: [
    { value: "edi", label: "Edinburgh" },
    { value: "gla", label: "Glasgow" },
    { value: "abe", label: "Aberdeen" },
  ],
  wal: [
    { value: "car", label: "Cardiff" },
    { value: "swa", label: "Swansea" },
    { value: "new", label: "Newport" },
  ],
  ni: [
    { value: "bel", label: "Belfast" },
    { value: "der", label: "Derry" },
    { value: "lis", label: "Lisburn" },
  ],
  on: [
    { value: "tor", label: "Toronto" },
    { value: "ott", label: "Ottawa" },
    { value: "mis", label: "Mississauga" },
  ],
  qc: [
    { value: "mon", label: "Montreal" },
    { value: "que", label: "Quebec City" },
    { value: "lav", label: "Laval" },
  ],
  bc: [
    { value: "van", label: "Vancouver" },
    { value: "vic", label: "Victoria" },
    { value: "sur", label: "Surrey" },
  ],
  ab: [
    { value: "cal", label: "Calgary" },
    { value: "edm", label: "Edmonton" },
    { value: "red", label: "Red Deer" },
  ],
  nsw: [
    { value: "syd", label: "Sydney" },
    { value: "new", label: "Newcastle" },
    { value: "wol", label: "Wollongong" },
  ],
  vic: [
    { value: "mel", label: "Melbourne" },
    { value: "gee", label: "Geelong" },
    { value: "bal", label: "Ballarat" },
  ],
  qld: [
    { value: "bri", label: "Brisbane" },
    { value: "gc", label: "Gold Coast" },
    { value: "cai", label: "Cairns" },
  ],
  wa: [
    { value: "per", label: "Perth" },
    { value: "fre", label: "Fremantle" },
    { value: "bun", label: "Bunbury" },
  ],
  by: [
    { value: "mun", label: "Munich" },
    { value: "nur", label: "Nuremberg" },
    { value: "aug", label: "Augsburg" },
  ],
  nw: [
    { value: "col", label: "Cologne" },
    { value: "dus", label: "Düsseldorf" },
    { value: "dor", label: "Dortmund" },
  ],
  bw: [
    { value: "stu", label: "Stuttgart" },
    { value: "kar", label: "Karlsruhe" },
    { value: "man", label: "Mannheim" },
  ],
  he: [
    { value: "fra", label: "Frankfurt" },
    { value: "wie", label: "Wiesbaden" },
    { value: "kas", label: "Kassel" },
  ],
};

// Simulated API functions (Same as before)
const fetchCountries = async () => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return countriesData;
};

const fetchStates = async (countryId) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return statesData[countryId] || [];
};

const fetchCities = async (stateId) => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return citiesData[stateId] || [];
};

// --- UPDATED CASCADING SELECT WITH SEARCH ---
const CascadingSelect = React.forwardRef(
  (
    {
      options = [],
      value,
      onChange,
      placeholder = "Select...",
      disabled = false,
      isLoading = false,
      className,
      label,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
    const [searchQuery, setSearchQuery] = React.useState("");

    const containerRef = React.useRef(null);
    const listRef = React.useRef(null);
    const inputRef = React.useRef(null);

    // Find the currently selected option object
    const selectedOption = React.useMemo(
      () => options.find((opt) => opt.value === value),
      [options, value]
    );

    // Sync search query with selected value when value changes externally or on mount
    React.useEffect(() => {
      if (selectedOption) {
        setSearchQuery(selectedOption.label);
      } else {
        setSearchQuery("");
      }
    }, [selectedOption]);

    // Filter options based on search query
    const filteredOptions = React.useMemo(() => {
      if (!searchQuery) return options;
      
      // If the search query matches the selected option exactly, show all options 
      // (so the user can see other choices easily after selecting one)
      if (selectedOption && searchQuery === selectedOption.label) {
        return options;
      }

      return options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }, [options, searchQuery, selectedOption]);

    // Handle clicking outside to close
    React.useEffect(() => {
      const handleClickOutside = (e) => {
        if (containerRef.current && !containerRef.current.contains(e.target)) {
          setIsOpen(false);
          // Revert text to selected option if closed without selecting new one
          if (selectedOption) {
            setSearchQuery(selectedOption.label);
          } else {
            setSearchQuery("");
          }
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [selectedOption]);

    const handleSelect = (optionValue) => {
      onChange?.(optionValue);
      setIsOpen(false);
      // Query update handled by the useEffect dependent on 'value'
    };

    const handleKeyDown = (e) => {
      if (disabled || isLoading) return;

      switch (e.key) {
        case "Enter":
          e.preventDefault();
          if (isOpen && highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
            handleSelect(filteredOptions[highlightedIndex].value);
          } else if (!isOpen) {
             setIsOpen(true);
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setHighlightedIndex((prev) =>
              prev < filteredOptions.length - 1 ? prev + 1 : 0
            );
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setHighlightedIndex((prev) =>
              prev > 0 ? prev - 1 : filteredOptions.length - 1
            );
          }
          break;
        case "Escape":
          setIsOpen(false);
          inputRef.current?.blur();
          // Revert text
          if (selectedOption) {
             setSearchQuery(selectedOption.label);
          } else {
             setSearchQuery("");
          }
          break;
      }
    };

    // Scroll highlighted item into view
    React.useEffect(() => {
      if (isOpen && highlightedIndex >= 0 && listRef.current) {
        const highlightedEl = listRef.current.children[highlightedIndex];
        highlightedEl?.scrollIntoView({ block: "nearest" });
      }
    }, [highlightedIndex, isOpen]);

    return (
      <div className={cn("w-full space-y-1.5", className)} ref={containerRef}>
        {label && (
          <label className="text-sm font-medium text-foreground">{label}</label>
        )}
        <div className="relative group">
          {/* Input wrapper acting as the trigger */}
          <div
            className={cn(
              "flex h-11 w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background",
              "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
              "hover:border-primary/50 cursor-text",
              (disabled || isLoading) && "cursor-not-allowed opacity-50"
            )}
            onClick={() => {
               if(!disabled && !isLoading) {
                 inputRef.current?.focus();
                 setIsOpen(true);
               }
            }}
          >
             <input
                ref={(node) => {
                    inputRef.current = node;
                    if (typeof ref === 'function') ref(node);
                    else if (ref) ref.current = node;
                }}
                type="text"
                className={cn(
                  "flex-1 bg-transparent outline-none placeholder:text-muted-foreground",
                  (disabled || isLoading) && "cursor-not-allowed"
                )}
                placeholder={placeholder}
                value={searchQuery}
                disabled={disabled || isLoading}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsOpen(true);
                  setHighlightedIndex(0); // Reset selection on search
                }}
                onFocus={() => setIsOpen(true)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
             />

            {isLoading ? (
              <Loader2 className="h-4 w-4 shrink-0 text-muted-foreground animate-spin ml-2" />
            ) : (
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ml-2",
                  isOpen && "rotate-180"
                )}
              />
            )}
          </div>

          <div
            className={cn(
              "absolute z-50 mt-1.5 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-lg",
              "transition-all duration-200 origin-top",
              isOpen
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
            )}
          >
            <ul
              ref={listRef}
              role="listbox"
              className="max-h-60 overflow-auto space-y-1 p-1.5 scrollbar-thin"
              onMouseDown={(e) => e.preventDefault()} // Prevent input blur on scroll click
              onMouseLeave={() => setHighlightedIndex(-1)}
            >
              {filteredOptions.length === 0 ? (
                <li className="px-3 py-2 text-sm text-muted-foreground text-center">
                  {searchQuery ? "No results found" : (disabled ? "Select previous option first" : "No options available")}
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
                        : "hover:bg-accent/30"
                    )}
                  >
                    <span className="flex-1 truncate">
                        {/* Highlight matching text part could be added here, currently just label */}
                        {option.label}
                    </span>
                    {value === option.value && (
                      <Check className="h-4 w-4 shrink-0 ml-2" />
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  }
);

CascadingSelect.displayName = "CascadingSelect";

// Main Dependent Select Component (Unchanged logic, kept for full code context)
const DependentSelect = ({
  className,
  onChange,
  value = { country: null, state: null, city: null },
}) => {
  const [countries, setCountries] = React.useState([]);
  const [states, setStates] = React.useState([]);
  const [cities, setCities] = React.useState([]);

  const [loadingCountries, setLoadingCountries] = React.useState(true);
  const [loadingStates, setLoadingStates] = React.useState(false);
  const [loadingCities, setLoadingCities] = React.useState(false);

  const [selectedCountry, setSelectedCountry] = React.useState(value.country);
  const [selectedState, setSelectedState] = React.useState(value.state);
  const [selectedCity, setSelectedCity] = React.useState(value.city);

  // Load countries on mount
  React.useEffect(() => {
    const loadCountries = async () => {
      setLoadingCountries(true);
      const data = await fetchCountries();
      setCountries(data);
      setLoadingCountries(false);
    };
    loadCountries();
  }, []);

  // Load states when country changes
  React.useEffect(() => {
    if (!selectedCountry) {
      setStates([]);
      setCities([]);
      return;
    }

    const loadStates = async () => {
      setLoadingStates(true);
      setSelectedState(null);
      setSelectedCity(null);
      setCities([]);
      const data = await fetchStates(selectedCountry);
      setStates(data);
      setLoadingStates(false);
    };
    loadStates();
  }, [selectedCountry]);

  // Load cities when state changes
  React.useEffect(() => {
    if (!selectedState) {
      setCities([]);
      return;
    }

    const loadCities = async () => {
      setLoadingCities(true);
      setSelectedCity(null);
      const data = await fetchCities(selectedState);
      setCities(data);
      setLoadingCities(false);
    };
    loadCities();
  }, [selectedState]);

  // Notify parent of changes
  React.useEffect(() => {
    onChange?.({
      country: selectedCountry,
      state: selectedState,
      city: selectedCity,
    });
  }, [selectedCountry, selectedState, selectedCity, onChange]);

  return (
    <div className={cn("space-y-4", className)}>
      <CascadingSelect
        label="Country"
        placeholder="Select a country..."
        options={countries}
        value={selectedCountry}
        onChange={setSelectedCountry}
        isLoading={loadingCountries}
      />

      <CascadingSelect
        label="State / Region"
        placeholder={selectedCountry ? "Select a state..." : "Select country first"}
        options={states}
        value={selectedState}
        onChange={setSelectedState}
        disabled={!selectedCountry}
        isLoading={loadingStates}
      />

      <CascadingSelect
        label="City"
        placeholder={selectedState ? "Select a city..." : "Select state first"}
        options={cities}
        value={selectedCity}
        onChange={setSelectedCity}
        disabled={!selectedState}
        isLoading={loadingCities}
      />
    </div>
  );
};

export { DependentSelect, CascadingSelect };