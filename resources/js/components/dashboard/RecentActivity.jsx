import { motion } from "framer-motion";
import { Package, FileText, Car, DollarSign, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const activities = [
  {
    id: 1,
    icon: Package,
    title: "New shipment created",
    description: "Shipment #SHP-4618 to Dubai, UAE",
    time: "2 min ago",
    type: "shipment",
  },
  {
    id: 2,
    icon: DollarSign,
    title: "Payment received",
    description: "Invoice #INV-2847 - $12,450.00",
    time: "15 min ago",
    type: "payment",
  },
  {
    id: 3,
    icon: Car,
    title: "Vehicle added",
    description: "2024 Toyota Camry - VIN: 4T1B11HK...",
    time: "1 hr ago",
    type: "vehicle",
  },
  {
    id: 4,
    icon: CheckCircle2,
    title: "Shipment delivered",
    description: "Shipment #SHP-4590 completed",
    time: "2 hrs ago",
    type: "success",
  },
];

const typeStyles = {
  shipment: "bg-info/10 text-info",
  payment: "bg-success/10 text-success",
  vehicle: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  invoice: "bg-accent/10 text-accent",
};

export const RecentActivity = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass rounded-2xl p-4 sm:p-6 h-full"
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground">Recent Activity</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Latest updates</p>
        </div>
        <button className="text-xs sm:text-sm text-primary hover:underline font-medium">
          View all
        </button>
      </div>

      <div className="space-y-2 sm:space-y-4">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-start gap-3 sm:gap-4 p-2 sm:p-3 rounded-xl hover:bg-secondary/30 transition-colors cursor-pointer group"
            >
              <div className={cn(
                "p-1.5 sm:p-2 rounded-lg shrink-0",
                typeStyles[activity.type]
              )}>
                <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                  {activity.title}
                </p>
                <p className="text-[10px] sm:text-sm text-muted-foreground truncate">
                  {activity.description}
                </p>
              </div>
              <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap shrink-0">
                {activity.time}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};