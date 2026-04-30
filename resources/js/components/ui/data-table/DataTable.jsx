import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { RightSidebar } from "./RightSidebar";
import { ExpandableTableRow } from "./ExpandableRow";
import DraggableTableHeader from "./TableHeader";
import DataTablePagination from "./DataTablePagination";
import { DataTableSkeleton } from "./DataTableSkeleton";
import { DataTableEmpty } from "./DataTableEmpty";
import { cn } from "@/lib/utils";

export const renderCell = (columnDef, rowData, rowIndex,meta) => {
  if (!columnDef) return null;
  
  if (typeof columnDef.cell === 'function') {
    return columnDef.cell({ 
      row: { original: rowData, index: rowIndex,meta: meta }, 
      getValue: () => rowData[columnDef.accessorKey] 
    });
  }
  
  return rowData[columnDef.accessorKey];
};

const renderFooterCell = (columnDef, data) => {
  if (!columnDef.footer) return null;
  
  if (typeof columnDef.footer === 'function') {
    return columnDef.footer({ rows: data });
  }
  
  return columnDef.footer;
};

export function DataTable({
  tableHeaderTitleRow=null,
  columns,
  data,
  meta = { page: 1, limit: 20, total: 0 }, 
  sorting = [],
  onSortChange, 
  onPaginationChange, 
  filterDefinitions = [],
  onFilterChange,
  renderSubComponent,
  loading = false,
  error = null,
  options = { views: ["grid", "table"], expandable: true },
  customLoader,
  customEmptyState,
  onResetFilters,
  isDragable = false,
  className,
  mobileViewCard = ()=>{},
  mobileViewDetailSheet = ()=>{},
  filterInputValue = {},
  resetBtnOnOf = false,
}) {
  const [columnOrder, setColumnOrder] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [expandedRows, setExpandedRows] = useState({});
  const [viewportWidth, setViewportWidth] = useState(0);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const initialOrder = columns.map((c) => c?.id || c?.accessorKey);
    setColumnOrder(initialOrder);
    
    const initialVisibility = {};
    columns.forEach(c => {
        initialVisibility[c?.id || c?.accessorKey] = true;
    });
    setColumnVisibility(initialVisibility);
  }, [columns]);

  // Viewport observer
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) setViewportWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  // --- Handlers ---

  const handleColumnDragEnd = (event) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setColumnOrder((order) => {
        const oldIndex = order.indexOf(active.id);
        const newIndex = order.indexOf(over.id);
        return arrayMove(order, oldIndex, newIndex);
      });
    }
  };

  const toggleRow = (id) => {
    if (options.expandable) {
      setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
    }
  };

  const toggleColumnVisibility = useCallback((columnId, checked) => {
    setColumnVisibility(prev => ({ ...prev, [columnId]: checked }));
  }, []);

  // Compute Visible Columns based on Order AND Visibility
  const visibleColumnDefs = useMemo(() => {
    return columnOrder
      .map(id => columns.find(c => (c?.id || c?.accessorKey) === id))
      .filter(col => col && columnVisibility[col?.id || col?.accessorKey]);
  }, [columnOrder, columnVisibility, columns]);

  const showFooter = useMemo(() => {
    return visibleColumnDefs.some(col => col.footer);
  }, [visibleColumnDefs]);


  // --- Render Logic ---

  const renderTableBody = () => {
    if (error) return <tr><td colSpan={visibleColumnDefs.length} className="text-center p-4 text-destructive">Error loading data</td></tr>;
    
    if (loading) {
      return customLoader || <DataTableSkeleton columns={visibleColumnDefs} />;
    }

    if (data.length === 0) {
      return customEmptyState || (
        <DataTableEmpty
          colSpan={visibleColumnDefs.length}
          action={onResetFilters ? (
            <button onClick={onResetFilters} className="text-primary hover:underline text-sm font-medium">Clear all filters</button>
          ) : null}
        />
      );
    }

    return data.map((row, index) => (
       <ExpandableTableRow
          key={row.id || index}
          row={{ original: row, index, id: row.id || index, meta: meta }} 
          isExpanded={!!expandedRows[row.id || index]}
          toggleExpand={() => toggleRow(row.id || index)}
          visibleColumns={visibleColumnDefs}
          canExpand={options.expandable}
          viewportWidth={viewportWidth}
          renderSubComponent={renderSubComponent}
        />
    ));
  };

  return (
    <div className={cn("flex flex-col md:flex-row w-full h-full bg-card", className)}>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-hidden relative">
          
          {/* Mobile View */}
          <div className="md:hidden h-full overflow-y-auto scrollbar-thin">
            {loading && (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted-foreground/10 rounded-md animate-pulse" />)}
              </div>
            )}
            {
            mobileViewCard(data)
            }
          </div>

          {/* Desktop View */}
          <div ref={scrollContainerRef} className="hidden md:block absolute inset-0 overflow-auto custom-scrollbar bg-card">
            <DndContext collisionDetection={closestCenter} onDragEnd={handleColumnDragEnd} sensors={sensors}>
              <div className="w-full min-w-max pb-4">
               {
               tableHeaderTitleRow && <div className="flex justify-center">
                 {tableHeaderTitleRow}
               </div>
               }
                <table className="w-full caption-bottom text-sm border-collapse">
                  <thead className="sticky top-0 z-20 shadow-[0_1px_0_0_var(--border)]">
                    <tr>
                        <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
                          {columnOrder.map((colId) => {
                            // Find definition
                            const colDef = columns.find(c => (c?.id || c?.accessorKey) === colId);
                            if (!colDef || !columnVisibility[colId]) return null;

                            return (
                                <DraggableTableHeader
                                    key={colId}
                                    id={colId}
                                    columnDef={colDef}
                                    sortState={sorting.find(s => s.id === colId)} // { id, desc }
                                    onSortChange={onSortChange}
                                    isDragable={isDragable}
                                />
                            );
                          })}
                        </SortableContext>
                    </tr>
                  </thead>
                  <tbody>{renderTableBody()}</tbody>
                  {showFooter && data.length > 0 && (
                    <tfoot className="sticky bottom-0 z-20 bg-background font-bold text-foreground">
                      <tr>
                        {visibleColumnDefs.map((col, idx) => (
                          <td 
                            key={`footer-${col.id || col.accessorKey}`} 
                            className={`p-4 align-middle text-xs ${col?.footerClassName ? col.footerClassName : ''}`}
                          >
                             {renderFooterCell(col, data)}
                          </td>
                        ))}
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </DndContext>
          </div>
        </div>

        {/* Pagination */}
        <DataTablePagination 
            meta={meta}
            onPageChange={(key, p) => onPaginationChange(key, p)}
            onLimitChange={(key, l) => onPaginationChange(key, l)}
            currentCount={data.length}
        />
      </div>

      {/* Right Sidebar */}
      <div className="hidden md:block h-full border-l border-border bg-card z-20">
        <RightSidebar
          columns={columns}
          columnOrder={columnOrder}
          onColumnOrderChange={setColumnOrder}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={toggleColumnVisibility}
          onFilterChange={onFilterChange}
          filterDefinitions={filterDefinitions}
          filterInputValue={filterInputValue}
          onResetFilters={onResetFilters}
          isDragable={isDragable}
          resetBtnOnOf={resetBtnOnOf}
        />
      </div>
      {mobileViewDetailSheet()}
    </div>
  );
}