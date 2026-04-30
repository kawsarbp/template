import DetailRow from '@/components/custom-component/DetailRow';
import { useLanguage } from '@/hooks/useLanguage';
import { ArrowLeft } from 'lucide-react';

export const AdvanceReportMobileDetailSheet = ({
    isOpen,
    onClose,
    data,
    tableColumnsDefinitions,
}) => {
    const { t } = useLanguage();
    if (!isOpen || !data) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity md:hidden dark:bg-zinc-800/40"
                onClick={onClose}
            />

            {/* Slide-up Panel */}
            <div className="fixed inset-x-0 bottom-0 z-50 flex max-h-[90vh] transform animate-in flex-col overflow-hidden rounded-t-2xl bg-card shadow-2xl transition-transform duration-300 slide-in-from-bottom md:hidden">
                {/* Header (Green) */}
                <div className="flex flex-col gap-2 border-b border-success/20 bg-success/10 p-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="text-success-foreground"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="space-y-0 overflow-y-auto p-4 pb-10">
                    {/* Section Header */}
                    <div className="text-success-foreground mb-0 rounded-t-lg border-b border-success/20 bg-success/10 py-2 text-center text-sm font-bold">
                        {t('Advance Customer Information')}
                    </div>

                    {/* Data List Table Style */}
                    <div className="overflow-hidden rounded-b-lg border border-border text-sm">
                        {tableColumnsDefinitions
                            .map((column) => {
                                return column?.cellMobileView ? (
                                    column?.cellMobileView(data)
                                ) : column?.isSkipColumn ? null : (
                                    <DetailRow
                                        label={column?.header}
                                        value={data[column?.accessorKey]}
                                    />
                                );
                            })
                            .filter(Boolean)}
                    </div>
                </div>
            </div>
        </>
    );
};
