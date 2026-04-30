import React, { useState, memo } from "react";
import { Settings2, Filter, X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const SortableColumnItem = memo(({ id, isDragable, headerName, isVisible, onToggle }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id, disabled: !isDragable });

  const style = { transform: CSS.Transform.toString(transform), transition };



  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-2.5 bg-card border border-border rounded-lg mb-2 group hover:border-primary/50 transition-all"
    >
      {isDragable && (
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab text-muted-foreground hover:text-foreground p-1 outline-none"
          >
            <GripVertical size={14} />
          </div>
      )}
      <Checkbox
        id={`col-${id}`}
        checked={isVisible}
        onCheckedChange={(value) => onToggle(!!value)}
        className="border-muted-foreground/30 data-[state=checked]:bg-primary w-4 h-4 rounded"
      />
      <label
        htmlFor={`col-${id}`}
        className="text-xs font-semibold text-muted-foreground group-hover:text-foreground flex-1 cursor-pointer select-none truncate text-start capitalize"
      >
        {headerName}
      </label>
    </div>
  );
});

export function RightSidebar({
  columns = [],
  columnOrder = [],
  onColumnOrderChange,
  columnVisibility = {},
  onColumnVisibilityChange,
  onResetFilters,
  onFilterChange,
  filterDefinitions = [],
  className,
  isDragable,
  filterInputValue = {},
  resetBtnOnOf = false,
}) {
  const [activeTab, setActiveTab] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Helper to get full column details based on current order
  const orderedColumns = columnOrder.map(id => {
    return columns.find(c => (c?.id || c?.accessorKey) === id);
  }).filter(Boolean); // Filter out any undefineds

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = columnOrder.indexOf(active.id);
      const newIndex = columnOrder.indexOf(over.id);
      onColumnOrderChange(arrayMove(columnOrder, oldIndex, newIndex));
    }
  };

  return (
    <div className={cn("flex h-full bg-card", className)}>
      <div
        className={`transition-all duration-300 ease-in-out bg-card ${activeTab ? "w-70 opacity-100 border-r border-border" : "w-0 opacity-0 border-none"} overflow-hidden flex flex-col h-full`}
      >
        <div className="p-4 border-b border-border flex justify-between items-center shrink-0">
          <h3 className="font-bold text-xs text-foreground uppercase tracking-wide flex items-center gap-2">
            {activeTab === "columns" ? "Customize Columns" : "Filter Records"}
          </h3>
          <div className="flex">
            {activeTab === "filters" && resetBtnOnOf && <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => onResetFilters()}
            >
              <RefreshCcw size={14} />
            </Button>}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => setActiveTab(null)}
            >
              <X size={14} />
            </Button>
          </div>
        </div>
        <ScrollArea className="flex-1 p-4 h-full bg-muted/20">
          {activeTab === "columns" && (
            <div className="space-y-4 pb-20">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={columnOrder}
                  strategy={verticalListSortingStrategy}
                >
                  {orderedColumns.map((column) => {
                    const colId = column.id || column.accessorKey;
                    const headerName = typeof column.header === "string"
                      ? column.header
                      : colId.replace(/([A-Z])/g, " $1").trim();

                    return (
                      <SortableColumnItem
                        key={colId}
                        id={colId}
                        headerName={headerName}
                        isVisible={!!columnVisibility[colId]}
                        onToggle={(val) => onColumnVisibilityChange(colId, val)}
                        isDragable={isDragable}
                      />
                    );
                  })}
                </SortableContext>
              </DndContext>
            </div>
          )}
          {activeTab === "filters" && (
            <div className="space-y-1 pb-20">
              <Accordion type="multiple" collapsible className="space-y-3">
                {filterDefinitions.map((filter, index) => (
                  <AccordionItem
                    key={filter.id || index}
                    value={filter.id || `filter-${index}`}
                    className="border border-border rounded-lg bg-card px-3"
                  >
                    <AccordionTrigger className="hover:no-underline py-3 text-xs font-bold text-foreground text-start uppercase tracking-wide">
                      {filter.label}
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4">
                      {filter.render({
                        values: filterInputValue,
                        onChange: onFilterChange,
                      })}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </ScrollArea>
      </div>

      <div className="w-10 bg-card flex flex-col items-center py-4 gap-4 shrink-0">
        <button
          onClick={() =>
            setActiveTab(activeTab === "columns" ? null : "columns")
          }
          className={`vertical-text p-2 rounded transition-all flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase w-8
            ${activeTab === "columns" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
        >
          <Settings2
            size={16}
            className={`mb-2 transition-transform duration-300 ${activeTab === "columns" ? "rotate-0 text-primary" : "-rotate-90"}`}
          />{" "}
          Columns
        </button>

        <div className="h-px w-4 bg-border" />

        <button
          onClick={() =>
            setActiveTab(activeTab === "filters" ? null : "filters")
          }
          className={`vertical-text p-2 rounded transition-all flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase w-8
            ${activeTab === "filters" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
        >
          <Filter
            size={16}
            className={`mb-2 transition-transform duration-300 ${activeTab === "filters" ? "rotate-0 text-primary" : "-rotate-90"}`}
          />{" "}
          Filters
        </button>
      </div>
    </div>
  );
}