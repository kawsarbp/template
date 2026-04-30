import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { RefreshCw, X } from 'lucide-react';
import { useEffect } from 'react';

export const MobileFilterSheet = ({
    isOpen,
    onClose,
    filterDefinitions,
    filterInputValue,
    onFilterChange,
    onReset,
}) => {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleChildChange = (key, value) => {
        onFilterChange(key, value);
    };

    let activeFilterCount = 0;

    for (let key in filterInputValue) {
        if (filterInputValue[key]) {
            activeFilterCount++;
        }
    }

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-40 md:hidden" onClick={onClose} />

            <div className="fixed top-42 right-4 left-4 z-50 flex max-h-[75vh] origin-top animate-in flex-col rounded-xl border-border bg-card duration-200 zoom-in-95 fade-in md:hidden">
                <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-foreground">
                            Filters
                        </h2>
                        {activeFilterCount > 0 && (
                            <span className="rounded-full border-border bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                                {activeFilterCount} Active
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onReset}
                            className="h-8 w-8 rounded-full text-green-600 hover:bg-green-500/10"
                        >
                            <RefreshCw size={16} />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="h-8 w-8 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                            <X size={18} />
                        </Button>
                    </div>
                </div>

                <div className="custom-scrollbar overflow-y-auto p-3">
                    <div className="space-y-2">
                        <Accordion
                            type="multiple"
                            collapsible
                            className="space-y-2"
                        >
                            {filterDefinitions.map((filter, index) => (
                                <AccordionItem
                                    key={filter.id || index}
                                    value={filter.id || `filter-${index}`}
                                    className="rounded-lg border border-border bg-card px-3 transition-all data-[state=open]:ring-1 data-[state=open]:ring-primary/20"
                                >
                                    <AccordionTrigger className="py-3 text-start text-sm font-bold text-foreground hover:no-underline">
                                        {filter.label}
                                    </AccordionTrigger>
                                    <AccordionContent className="px-1 pt-0 pb-3">
                                        {filter.render({
                                            values: filterInputValue,
                                            onChange: handleChildChange,
                                        })}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </div>
        </>
    );
};
