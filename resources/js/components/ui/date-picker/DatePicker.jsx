import * as React from "react";
import { format, setHours, setMinutes, getHours, getMinutes } from "date-fns";
import { Calendar as CalendarIcon, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Label } from "../label";

export function SmartDatePicker({
  value,
  onChange,
  mode = "single",
  placeholder = "Pick a date",
  className,
  formatStr = "dd/MM/yyyy", 
  presets = [],
  includeTime = false, 
  label,
  isRequired,
  error,
  valueClass = "min-w-0"
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  const [time, setTime] = React.useState({
    hour: "12",
    minute: "00",
    ampm: "AM",
  });

  React.useEffect(() => {
    if (value && mode === "single" && value instanceof Date) {
      const h = getHours(value);
      const m = getMinutes(value);
      const ampm = h >= 12 ? "PM" : "AM";
      const displayHour = h % 12 || 12;

      setTime({
        hour: displayHour.toString(),
        minute: m.toString().padStart(2, "0"),
        ampm,
      });
    }
  }, [value, mode]);

  const handleSelect = (selected) => {
    let finalDate = selected;


    if (mode === "single" && selected && includeTime) {
      const currentAmpm = time.ampm;
      let currentHour = parseInt(time.hour, 10);
      const currentMinute = parseInt(time.minute, 10);

      if (currentAmpm === "PM" && currentHour !== 12) currentHour += 12;
      if (currentAmpm === "AM" && currentHour === 12) currentHour = 0;

      finalDate = setHours(setMinutes(selected, currentMinute), currentHour);
    }

    onChange?.(finalDate);

    if (mode === "single") {
      if (!includeTime && selected) {
        setIsOpen(false);
      }
    } else if (mode === "range") {
      if (selected?.from && selected?.to) {
        const fromDate = format(selected.from, "yyyy-MM-dd");
        const toDate = format(selected.to, "yyyy-MM-dd");
        if (fromDate !== toDate) {
          setIsOpen(false);
        }
      }
    }
  };

  const handleTimeChange = (type, val) => {
    if (!value || mode !== "single") return;

    const newTime = { ...time, [type]: val };
    setTime(newTime);

    let h = parseInt(newTime.hour || "0", 10);
    const m = parseInt(newTime.minute || "0", 10);
    const ampm = newTime.ampm;

    if (isNaN(h) || isNaN(m)) return;

    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;

    const newDate = setHours(setMinutes(value, m), h);
    onChange?.(newDate);
  };

  const getDisplayText = () => {
    if (!value) return placeholder;

    if (mode === "range") {
      if (value.from) {
        const fromStr = format(value.from, formatStr);
        if (value.to) {
          return `${fromStr} - ${format(value.to, formatStr)}`;
        }
        return `${fromStr} - End Date`;
      }
      return placeholder;
    }

    return format(value, formatStr);
  };

  const handleClear = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onChange?.(undefined);
    setTime({ hour: "12", minute: "00", ampm: "AM" }); 
  };

  return (
    <div className={cn("grid gap-2", className)}>
     {label && <Label
        className={`text-sm font-medium text-foreground ${isRequired ? 'after:content-["*"] gap-0' : ""}`}
      >
        {label}
       
      </Label>}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div
            role="button"
            tabIndex={0}
            className={cn(
              "flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer transition-colors",
              !value && "text-muted-foreground",
              isOpen && "border-primary ring-1 ring-primary/20"
            )}
          >
            <CalendarIcon className="h-4 w-4 shrink-0 opacity-50 text-muted-foreground mr-2" />
            
            <div className={`flex-1 flex ${valueClass} items-center gap-2 overflow-hidden`}>
              <span className="truncate text-left font-medium text-foreground block">
                {getDisplayText()}
              </span>

              {mode === "range" && value?.from && value?.to && (
                <Badge variant="secondary" className="h-5 shrink-0 px-1.5 text-[10px] hidden sm:flex pointer-events-none whitespace-nowrap">
                  {Math.round((value.to - value.from) / (1000 * 60 * 60 * 24)) + 1} Days
                </Badge>
              )}
            </div>

            {((mode === "single" && value) || (mode === "range" && (value?.from || value?.to))) && (
              <button
                type="button"
                onClick={handleClear}
                className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors z-10 border-none outline-none focus:ring-1 focus:ring-destructive/30"
                aria-label="Clear date"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </PopoverTrigger>

        <PopoverContent
          className="w-auto p-0 rounded-xl shadow-xl border-border bg-popover text-popover-foreground overflow-hidden"
          align="start"
        >
          {presets.length > 0 && (
            <div className="flex gap-2 p-2 border-b border-border overflow-x-auto scrollbar-hide bg-muted/20">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  className="h-7 px-2 text-xs font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors border border-transparent hover:border-border"
                  onClick={() => {
                    onChange?.(preset.value);
                    setIsOpen(false);
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}

          <div className="p-0">
            <Calendar
              initialFocus
              mode={mode}
              defaultMonth={mode === "range" ? value?.from : value}
              selected={value}
              onSelect={handleSelect}
              numberOfMonths={mode === "range" ? 2 : 1}
              className="p-3"
            />
          </div>

          {includeTime && mode === "single" && (
            <div className="border-t border-border p-3 bg-muted/10">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Time</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={2}
                      value={time.hour}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, "");
                        if (parseInt(val) > 12) val = "12"; 
                        handleTimeChange("hour", val);
                      }}
                      onBlur={(e) => {
                         let val = e.target.value;
                         if(!val || val === '0') val = '12';
                         handleTimeChange("hour", val);
                      }}
                      className="w-8 h-8 text-center text-sm font-medium bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 tabular-nums"
                    />
                  </div>
                  <span className="text-muted-foreground font-bold">:</span>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={2}
                      value={time.minute}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, "");
                        if (parseInt(val) > 59) val = "59";
                        handleTimeChange("minute", val);
                      }}
                      onBlur={(e) => {
                         let val = e.target.value.padStart(2, '0');
                         handleTimeChange("minute", val);
                      }}
                      className="w-8 h-8 text-center text-sm font-medium bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 tabular-nums"
                    />
                  </div>
                  
                  <div className="flex h-8 bg-background border border-input rounded-md overflow-hidden ml-2 select-none">
                     <button
                       type="button"
                       onClick={() => handleTimeChange("ampm", "AM")}
                       className={cn(
                         "px-2 text-[10px] font-bold transition-colors",
                         time.ampm === "AM" 
                           ? "bg-primary text-primary-foreground" 
                           : "text-muted-foreground hover:bg-muted"
                       )}
                     >
                       AM
                     </button>
                     <button
                       type="button"
                       onClick={() => handleTimeChange("ampm", "PM")}
                       className={cn(
                         "px-2 text-[10px] font-bold transition-colors",
                         time.ampm === "PM" 
                           ? "bg-primary text-primary-foreground" 
                           : "text-muted-foreground hover:bg-muted"
                       )}
                     >
                       PM
                     </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}