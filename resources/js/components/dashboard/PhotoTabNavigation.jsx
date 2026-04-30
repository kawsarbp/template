import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Gavel, 
  Truck, 
  MapPinCheck, 
  Warehouse, 
  Camera 
} from "lucide-react";

const photoTabs = [
  { id: "auction", label: "Auction Photos", icon: Gavel },
  { id: "pickup", label: "Pickup Photos", icon: Truck },
  { id: "arrived", label: "Arrived Photos", icon: MapPinCheck },
  { id: "yard", label: "Yard Photos", icon: Warehouse },
];

export const PhotoTabNavigation = ({ activeTab, onTabChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-2xl p-1.5 sm:p-2 inline-flex gap-1 sm:gap-2 overflow-x-auto max-w-full scrollbar-hide border border-white/10"
    >
      {photoTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap",
              isActive
                ? "text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activePhotoTab"
                className="absolute inset-0 gradient-primary rounded-xl shadow-glow"
                style={{ background: 'var(--gradient-primary)' }} 
                transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
              />
            )}
            
            <span className="relative z-10 flex items-center gap-2">
              <Icon className={cn(
                "h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300",
                isActive ? "scale-110" : "opacity-70"
              )} />
              <span className="hidden md:inline-block tracking-wide">{tab.label}</span>
              <span className="inline-block md:hidden">
                {tab.label.split(' ')[0]}
              </span>
            </span>
          </button>
        );
      })}
    </motion.div>
  );
};