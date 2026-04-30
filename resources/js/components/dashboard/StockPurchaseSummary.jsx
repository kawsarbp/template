import { ServerSearchSelect } from '@/components/ui/advanced-select';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import useAxiosFetch from '@/hooks/useAxiosFetch';
import useDebounce from '@/hooks/useDebounce';
import { useLanguage } from '@/hooks/useLanguage';
import { cn, debounceInterval } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Calculator, DollarSign, ListChecks, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

const typeStyles = {
    amount: 'bg-primary/10 text-primary',
    paid: 'bg-success/10 text-success',
    due: 'bg-warning/10 text-warning',
};

export const StockPurchaseSummary = () => {
    const { t } = useLanguage();
    const [supplierSearch, setSupplierSearch] = useState('');
    const [supplierId, setSupplierId] = useState('');
    const [supplierChange, setSupplierChange] = useState(null);
    const [supplierOptions, setSupplierOptions] = useState([]);

    // Fetch Supplier Summary Data
    const { data: summaryData, loading: isLoadingSummary } = useAxiosFetch({
        url: `/stock-purchase-summary${supplierId ? `?supplier_id=${supplierId}` : ''}`,
    });

    // Fetch Supplier Options for filter
    const { data: suppliersData, loading: isLoadingSuppliers } = useAxiosFetch({
        url: `/search/suppliers?search=${supplierSearch}`,
    });

    const debounceSelectInputChange = useDebounce((value, stateFunction) => {
        stateFunction(value);
    }, debounceInterval);

    useEffect(() => {
        if (suppliersData) {
            setSupplierOptions(suppliersData?.data || []);
        }
    }, [suppliersData]);

    const handleSupplierChange = (value) => {
        setSupplierChange(value);
        setSupplierId(value?.value || '');
    };

    const stats = [
        {
            key: 'total_amount',
            title: t('Total Amount'),
            value: summaryData ? summaryData[0]?.total_amount : '...',
            icon: DollarSign,
            type: 'amount',
            description: t('Overall purchase value'),
        },
        {
            key: 'total_paid',
            title: t('Total Paid'),
            value: summaryData ? summaryData[1]?.total_paid : '...',
            icon: Calculator,
            type: 'paid',
            description: t('Amount settled with suppliers'),
        },
        {
            key: 'total_due',
            title: t('Total Due'),
            value: summaryData ? summaryData[2]?.total_due : '...',
            icon: Search,
            type: 'due',
            description: t('Outstanding balance'),
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-4 sm:p-6"
        >
            <div className="mb-4 flex flex-col gap-4 sm:mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-foreground sm:text-lg">
                            {t('Stock Purchase Summary')}
                        </h3>
                        <p className="text-xs text-muted-foreground sm:text-sm">
                            {t('Financial overview')}
                        </p>
                    </div>
                    <ListChecks className="h-5 w-5 text-primary opacity-50" />
                </div>

                <div className="w-full">
                    <ServerSearchSelect
                        placeholder={t('Filter by Supplier')}
                        value={supplierChange}
                        onInputChange={(value) =>
                            debounceSelectInputChange(value, setSupplierSearch)
                        }
                        isLoading={isLoadingSuppliers}
                        options={supplierOptions}
                        onChange={handleSupplierChange}
                        isClearable={true}
                    />
                </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.key}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            className="group flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-secondary/30 sm:gap-4 sm:p-3"
                        >
                            <div
                                className={cn(
                                    'shrink-0 rounded-lg p-1.5 sm:p-2',
                                    typeStyles[stat.type],
                                )}
                            >
                                <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-medium text-foreground transition-colors group-hover:text-primary sm:text-sm">
                                    {stat.title}
                                </p>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <p className="cursor-help truncate text-[10px] text-muted-foreground sm:text-xs">
                                            {stat.description}
                                        </p>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        {stat.description}
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-foreground sm:text-base">
                                    {stat.value}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
};
