import React, { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const DraggableTableHeader = memo(({ id, isDragable, columnDef, sortState, onSortChange, className }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled: !isDragable  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    cursor: isDragging ? "grabbing" : "grab",
    width: columnDef.size || "auto",
    minWidth: columnDef.minSize || "100px",
    zIndex: isDragging ? 2 : 1, // Ensure dragged item stays on top
  };

  // Handle Sort Click
  const handleSort = (e) => {
    if (!onSortChange || !columnDef.enableSorting) return;
    
    // Cycle: null -> asc -> desc -> null
    let nextDirection = "asc";
    if (sortState?.desc === false) nextDirection = "desc";
    else if (sortState?.desc === true) nextDirection = null; // Clear sort
    
    // Pass raw 'desc' boolean or null to parent
    const isDesc = nextDirection === "desc";
    onSortChange(id, nextDirection ? isDesc : null); 
  };

  return (
    <th
      ref={setNodeRef}
      style={style}
      {...(isDragable ? attributes : {})}
      {...(isDragable ? listeners : {})}
      className={cn("h-11 px-4 text-start align-middle text-[11px] font-bold text-muted-foreground uppercase tracking-wider bg-card border-b border-border select-none whitespace-nowrap group hover:bg-muted", className)}
    >
      <div
        className="flex items-center gap-1.5 cursor-pointer flex-1"
        onClick={handleSort}
      >
        {columnDef.header}
        
        {columnDef.enableSorting && columnDef.enableSorting !== false && (
            <span className="flex items-center">
                {!sortState ? (
                    <ArrowUpDown size={12} className="text-muted-foreground opacity-0 group-hover:opacity-50 transition-opacity" />
                ) : sortState.desc ? (
                    <ArrowDown size={12} className="text-primary" />
                ) : (
                    <ArrowUp size={12} className="text-primary" />
                )}
            </span>
        )}
      </div>
    </th>
  );
});

export default DraggableTableHeader;