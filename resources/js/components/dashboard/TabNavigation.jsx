import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LayoutGrid, Car, Package, FileText } from "lucide-react";

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "vehicles", label: "Vehicles", icon: Car },
  { id: "shipments", label: "Shipments", icon: Package },
  { id: "invoices", label: "Invoices", icon: FileText },
];

export const TabNavigation = ({ activeTab, onTabChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-1.5 sm:p-2 inline-flex gap-0.5 sm:gap-1 overflow-x-auto max-w-full scrollbar-thin"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap",
              isActive
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 gradient-primary rounded-xl shadow-glow"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </span>
          </button>
        );
      })}
    </motion.div>
  );
};