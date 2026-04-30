import RadioGroupField from '@/components/custom-component/RadioGroupField';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { Head, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs = [{ label: 'Reports' }, { label: 'Stock Report' }];

const groupByOptions = [
    { id: 'model', label: 'Model', value: 'model' },
    { id: 'brand', label: 'Brand', value: 'brand' },
];

const statusOptions = [
    { id: 'all', label: 'All', value: '' },
    { id: 'available', label: 'Available', value: '1' },
    { id: 'sold', label: 'Sold', value: '2' },
    { id: 'returned', label: 'Returned', value: '3' },
];

export default function StockReport({ rows, summary, filters }) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [filterData, setFilterData] = useState({
        group_by: filters?.group_by || 'model',
        status: String(filters?.status ?? ''),
    });

    const isModelView = filterData.group_by === 'model';

    const handleFilter = () => {
        setLoading(true);
        router.get('/reports/stock', filterData, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoading(false),
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilterData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <DashboardLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Stock Report')} />
            <div className="relative bg-background font-sans text-foreground">
                <div className="mb-4">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {t('Stock Report')}
                    </h1>
                </div>

                {/* Filters */}
                <div className="mb-6 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
                    <div className="flex flex-wrap items-end gap-4">
                        <RadioGroupField
                            label={t('Group By')}
                            name="group_by"
                            options={groupByOptions}
                            value={filterData.group_by}
                            onChange={handleChange}
                        />
                        <RadioGroupField
                            label={t('Status')}
                            name="status"
                            options={statusOptions}
                            value={filterData.status}
                            onChange={handleChange}
                        />
                        <Button
                            onClick={handleFilter}
                            disabled={loading}
                            variant="gradient"
                        >
                            <Search className="mr-1 h-4 w-4" />
                            {loading ? t('Loading...') : t('Filter')}
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                {summary && (
                    <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                        <SummaryCard
                            label={t('Total')}
                            value={summary.total_qty}
                        />
                        <SummaryCard
                            label={t('Available')}
                            value={summary.available}
                            className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30"
                        />
                        <SummaryCard
                            label={t('Sold')}
                            value={summary.sold}
                            className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30"
                        />
                        <SummaryCard
                            label={t('Returned')}
                            value={summary.returned}
                            className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/30"
                        />
                        <SummaryCard
                            label={t('Purchase Value')}
                            value={Number(
                                summary.total_purchase_value,
                            ).toLocaleString()}
                        />
                        <SummaryCard
                            label={t('Sale Value')}
                            value={Number(
                                summary.total_sale_value,
                            ).toLocaleString()}
                        />
                    </div>
                )}

                {/* Data Table */}
                <div className="overflow-hidden rounded-xl border border-border shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                        #
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                        {t('Brand')}
                                    </th>
                                    {isModelView && (
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                            {t('Model')}
                                        </th>
                                    )}
                                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                                        {t('Total')}
                                    </th>
                                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                                        {t('Available')}
                                    </th>
                                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                                        {t('Sold')}
                                    </th>
                                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                                        {t('Returned')}
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                        {t('Purchase Value')}
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                        {t('Sale Value')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows && rows.length > 0 ? (
                                    rows.map((row, index) => (
                                        <tr
                                            key={
                                                isModelView
                                                    ? row.product_id
                                                    : row.brand_id ?? index
                                            }
                                            className="border-t border-border"
                                        >
                                            <td className="px-4 py-2.5 text-muted-foreground">
                                                {index + 1}
                                            </td>
                                            <td className="px-4 py-2.5 font-medium">
                                                {row.brand_name}
                                            </td>
                                            {isModelView && (
                                                <td className="px-4 py-2.5">
                                                    {row.model_name}
                                                </td>
                                            )}
                                            <td className="px-4 py-2.5 text-center font-medium">
                                                {row.total_qty}
                                            </td>
                                            <td className="px-4 py-2.5 text-center text-green-600 dark:text-green-400">
                                                {row.available}
                                            </td>
                                            <td className="px-4 py-2.5 text-center text-blue-600 dark:text-blue-400">
                                                {row.sold}
                                            </td>
                                            <td className="px-4 py-2.5 text-center text-yellow-600 dark:text-yellow-400">
                                                {row.returned}
                                            </td>
                                            <td className="px-4 py-2.5 text-right">
                                                {Number(
                                                    row.total_purchase_value,
                                                ).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-2.5 text-right">
                                                {Number(
                                                    row.total_sale_value,
                                                ).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={isModelView ? 9 : 8}
                                            className="px-4 py-12 text-center text-muted-foreground"
                                        >
                                            {t('No stock data found.')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            {rows && rows.length > 0 && (
                                <tfoot className="border-t-2 border-border bg-muted/30">
                                    <tr>
                                        <td
                                            colSpan={isModelView ? 3 : 2}
                                            className="px-4 py-3 font-semibold"
                                        >
                                            {t('Total')}
                                        </td>
                                        <td className="px-4 py-3 text-center font-semibold">
                                            {summary.total_qty}
                                        </td>
                                        <td className="px-4 py-3 text-center font-semibold text-green-600 dark:text-green-400">
                                            {summary.available}
                                        </td>
                                        <td className="px-4 py-3 text-center font-semibold text-blue-600 dark:text-blue-400">
                                            {summary.sold}
                                        </td>
                                        <td className="px-4 py-3 text-center font-semibold text-yellow-600 dark:text-yellow-400">
                                            {summary.returned}
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold">
                                            {Number(
                                                summary.total_purchase_value,
                                            ).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold">
                                            {Number(
                                                summary.total_sale_value,
                                            ).toLocaleString()}
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function SummaryCard({ label, value, className = '' }) {
    return (
        <div
            className={`rounded-xl border border-border bg-card p-4 shadow-sm ${className}`}
        >
            <div className="text-xs font-medium text-muted-foreground">
                {label}
            </div>
            <div className="mt-1 text-xl font-bold text-foreground">
                {value}
            </div>
        </div>
    );
}
