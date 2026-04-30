import { motion } from "framer-motion";
import { MapPin, ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const vehicleData = [
  { location: "Baltimore, MD", auction: { unpaid: 0, paid: 0 }, onWay: 0, onHand: { noTitle: 0, withTitle: 0, withLoad: 0 }, shipped: 2514, total: 2514 },
  { location: "Houston, TX", auction: { unpaid: 1, paid: 0 }, onWay: 0, onHand: { noTitle: 0, withTitle: 0, withLoad: 0 }, shipped: 3380, total: 3381 },
  { location: "Los Angeles, CA", auction: { unpaid: 0, paid: 2 }, onWay: 5, onHand: { noTitle: 3, withTitle: 12, withLoad: 2 }, shipped: 4521, total: 4545 },
  { location: "Miami, FL", auction: { unpaid: 3, paid: 1 }, onWay: 2, onHand: { noTitle: 1, withTitle: 8, withLoad: 0 }, shipped: 2890, total: 2905 },
  { location: "New York, NY", auction: { unpaid: 0, paid: 0 }, onWay: 0, onHand: { noTitle: 0, withTitle: 5, withLoad: 1 }, shipped: 4442, total: 4448 },
];

export const DataTable = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Vehicle Summary</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Current status of all vehicles in the system</p>
          </div>
          <button className="self-start sm:self-auto p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Location</span>
                </div>
              </TableHead>
              <TableHead className="text-center hidden md:table-cell" colSpan={2}>
                <span className="text-muted-foreground font-medium text-xs sm:text-sm">Auction</span>
              </TableHead>
              <TableHead className="text-center text-muted-foreground font-medium text-xs sm:text-sm hidden lg:table-cell">On Way</TableHead>
              <TableHead className="text-center hidden xl:table-cell" colSpan={3}>
                <span className="text-muted-foreground font-medium text-xs sm:text-sm">On Hand</span>
              </TableHead>
              <TableHead className="text-center text-muted-foreground font-medium text-xs sm:text-sm">Shipped</TableHead>
              <TableHead className="text-center text-muted-foreground font-medium text-xs sm:text-sm">Total</TableHead>
            </TableRow>
            <TableRow className="border-border/50 hover:bg-transparent hidden md:table-row">
              <TableHead></TableHead>
              <TableHead className="text-center text-[10px] sm:text-xs text-muted-foreground">Unpaid</TableHead>
              <TableHead className="text-center text-[10px] sm:text-xs text-muted-foreground">Paid</TableHead>
              <TableHead className="hidden lg:table-cell"></TableHead>
              <TableHead className="text-center text-[10px] sm:text-xs text-muted-foreground hidden xl:table-cell">No Title</TableHead>
              <TableHead className="text-center text-[10px] sm:text-xs text-muted-foreground hidden xl:table-cell">With Title</TableHead>
              <TableHead className="text-center text-[10px] sm:text-xs text-muted-foreground hidden xl:table-cell">With Load</TableHead>
              <TableHead></TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicleData.map((row, index) => (
              <motion.tr
                key={row.location}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="border-border/50 hover:bg-secondary/30 transition-colors"
              >
                <TableCell className="font-medium text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary" />
                    </div>
                    <span className="truncate max-w-25 sm:max-w-none">{row.location}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center hidden md:table-cell">
                  <span className={cn(
                    "px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-xs sm:text-sm",
                    row.auction.unpaid > 0 ? "bg-warning/10 text-warning" : "text-muted-foreground"
                  )}>
                    {row.auction.unpaid}
                  </span>
                </TableCell>
                <TableCell className="text-center text-muted-foreground text-xs sm:text-sm hidden md:table-cell">{row.auction.paid}</TableCell>
                <TableCell className="text-center text-muted-foreground text-xs sm:text-sm hidden lg:table-cell">{row.onWay}</TableCell>
                <TableCell className="text-center text-muted-foreground text-xs sm:text-sm hidden xl:table-cell">{row.onHand.noTitle}</TableCell>
                <TableCell className="text-center text-muted-foreground text-xs sm:text-sm hidden xl:table-cell">{row.onHand.withTitle}</TableCell>
                <TableCell className="text-center text-muted-foreground text-xs sm:text-sm hidden xl:table-cell">{row.onHand.withLoad}</TableCell>
                <TableCell className="text-center">
                  <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-primary/10 text-primary font-medium text-xs sm:text-sm">
                    {row.shipped.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell className="text-center font-semibold text-foreground text-xs sm:text-sm">{row.total.toLocaleString()}</TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
};