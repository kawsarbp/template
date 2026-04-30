import React from 'react';
import { ChevronRight, Camera } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { renderCell } from './DataTable'; // Import the helper from DataTable

export const ExpandableTableRow = ({ 
  row, 
  isExpanded, 
  toggleExpand, 
  visibleColumns, // Array of column definitions
  viewportWidth,
  renderSubComponent,
  canExpand
}) => {
  const data = row.original;

  const getStatusBadge = () => {
    if (data.status === 'Auction Unpaid') return "bg-destructive/10 text-destructive border-destructive/20";
    if (data.status === 'Paid') return "bg-primary/10 text-primary border-primary/20";
    return "bg-muted text-muted-foreground border-border";
  };

  return (
    <>
      <tr 
        className={`border-b border-border last:border-b-0 transition-colors group hover:bg-muted/30 ${isExpanded ? 'bg-muted/50' : 'bg-card'}`}
      >
        {visibleColumns.map((colDef, colIndex) => {
          const colId = colDef.id || colDef.accessorKey;
          
          // Custom render for 'vehicles' column to include expander
          if (colId === 'vehicles') {
            return (
              <td key={colId} className="p-4 align-middle w-87.5">
                <div className="flex items-start gap-3">
                   <span className="text-muted-foreground text-[10px] mt-1.5 w-4">{row.index + 1}</span>

                   <div className="h-10 w-14 bg-muted rounded border border-border flex items-center justify-center shrink-0 cursor-pointer hover:border-primary/50 transition-colors" onClick={toggleExpand}>
                      <Camera size={16} className="text-muted-foreground"/>
                   </div>

                   <div className="flex flex-col gap-0.5 cursor-pointer" onClick={toggleExpand}>
                       <div className="flex items-center gap-2">
                         <Badge variant="outline" className={`text-[9px] px-1 py-0 border font-bold uppercase ${getStatusBadge()}`}>
                           {data.status}
                         </Badge>
                         {
                          canExpand && <ChevronRight size={14} className={`text-muted-foreground transition-transform ${isExpanded ? 'rotate-90 text-primary' : ''}`} />
                         }
                       </div>
                       <span className="font-bold text-xs text-foreground hover:text-primary transition-colors">{data.vin}</span>
                       <span className="text-[11px] font-medium text-primary">
                          {data.year} {data.make} {data.model}
                       </span>
                   </div>
                </div>
              </td>
            );
          }

          // Generic Render using helper
          return (
            <td key={colId} className={`p-4 align-middle text-xs font-medium text-slate-700 ${colDef?.className ? colDef?.className : ''}`}>
              {renderCell(colDef, data, row.index, row.meta)}
            </td>
          );
        })}
      </tr>

      {isExpanded && (
        <tr className="bg-card">
          <td colSpan={visibleColumns.length} className="p-0 border-none relative">
             <div 
               style={{ 
                 position: 'sticky', 
                 width: viewportWidth ? `${viewportWidth}px` : '100vw', 
                 zIndex: 10 
               }} 
               className="start-0"
             >
               <div className="p-4 animate-in slide-in-from-top-2 duration-300">
                 {renderSubComponent ? renderSubComponent({ row }) : <div className="p-4 text-center text-muted-foreground">No details available</div>}
               </div>
             </div>
          </td>
        </tr>
      )}
    </>
  );
};