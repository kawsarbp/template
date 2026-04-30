import { motion } from "framer-motion";
import { SearchX, FilterX } from "lucide-react";
import { cn } from "@/lib/utils";

export const DataTableEmpty = ({
    colSpan,
    title = "No records found",
    description = "Try adjusting your filters or search query to find what you're looking for.",
    action,
    className
}) => {
    return (
        <tr>
            <td colSpan={colSpan} className="h-100 text-center align-middle bg-card/50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={cn("flex flex-col items-center justify-center max-w-md mx-auto p-8 rounded-2xl bg-linear-to-b from-transparent to-muted/20 border border-border/50", className)}
                >
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse" />
                        <div className="relative bg-card p-4 rounded-full shadow-lg border border-border">
                            <SearchX size={32} className="text-muted-foreground" />
                        </div>
                        <div className="absolute -top-1 -right-1 bg-background p-1 rounded-full border border-border shadow-sm">
                            <FilterX size={14} className="text-destructive/80" />
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold text-foreground mb-2">
                        {title}
                    </h3>
                    <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
                        {description}
                    </p>

                    {action && (
                        <div className="mt-2">
                            {action}
                        </div>
                    )}
                </motion.div>
            </td>
        </tr>
    );
};