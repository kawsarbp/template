import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { perpageOptions } from "@/lib/options";

const DataTablePagination = ({ 
    meta,          
    onPageChange,
    onLimitChange, 
    className,
}) => {
    if (!meta) return null;
    const { current_page: page, limit, last_page: pageCount, total,to,from } = meta;
    
    const canPreviousPage = page > 1;
    const canNextPage = page < pageCount;

    const getPageNumbers = () => {
        const pages = [];
        if (pageCount <= 7) {
            for (let i = 1; i <= pageCount; i++) {
                pages.push(i);
            }
        } else {
            if (page <= 4) {
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push("...");
                pages.push(pageCount);
            } else if (page >= pageCount - 3) {
                pages.push(1);
                pages.push("...");
                for (let i = pageCount - 4; i <= pageCount; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push("...");
                for (let i = page - 1; i <= page + 1; i++) pages.push(i);
                pages.push("...");
                pages.push(pageCount);
            }
        }
        return pages;
    };
    return (
        <div className={cn("px-6 py-4 border-t border-border bg-card flex flex-col md:flex-row items-center justify-between gap-4 z-10", className)}>
            <div className="text-sm text-muted-foreground font-medium">
                Displaying{" "}
                <span className="text-foreground">
                    {from}
                </span>{" "}
                to{" "}
                <span className="text-foreground">
                    {to}
                </span>{" "}
                of{" "}
                <span className="text-foreground">
                    {total}
                </span>{" "}
                results
            </div>
            
            <div className="flex items-center flex-wrap justify-center gap-3 md:gap-6">
                
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">Rows per page</span>
                    <Select
                        value={`${limit}`}
                        onValueChange={(value) => onLimitChange("limit",Number(value))}
                    >
                        <SelectTrigger className="h-8 w-[70px] border-border rounded-md text-xs font-bold text-foreground focus:ring-primary">
                            <SelectValue placeholder={limit} />
                        </SelectTrigger>
                        <SelectContent align="end" className="min-w-[70px] bg-popover border-border">
                            {perpageOptions.map((pageSize) => (
                                <SelectItem key={pageSize.value} value={`${pageSize.value}`}>
                                    {pageSize.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hidden lg:flex"
                        onClick={() => onPageChange("page",1)}
                        disabled={!canPreviousPage}
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPageChange("page",page - 1)}
                        disabled={!canPreviousPage}
                        className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-muted font-medium"
                    >
                        <ChevronLeft className="h-4 w-4 me-1" /> Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                        {getPageNumbers().map((pageNum, idx) => (
                            pageNum === "..." ? (
                                <span key={`dots-${idx}`} className="px-2 text-xs text-muted-foreground">...</span>
                            ) : (
                                <Button
                                    key={pageNum}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onPageChange("page",pageNum)}
                                    className={`h-8 w-8 rounded-md font-bold text-xs transition-all ${
                                        page === pageNum 
                                        ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" 
                                        : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                                >
                                    {pageNum}
                                </Button>
                            )
                        ))}
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPageChange("page",page + 1)}
                        disabled={!canNextPage}
                        className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-muted font-medium"
                    >
                        Next <ChevronRight className="h-4 w-4 ms-1" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hidden lg:flex"
                        onClick={() => onPageChange("page",pageCount)}
                        disabled={!canNextPage}
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DataTablePagination;