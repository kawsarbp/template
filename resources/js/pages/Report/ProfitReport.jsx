import RadioGroupField from '@/components/custom-component/RadioGroupField';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { SmartDatePicker } from '@/components/ui/date-picker/DatePicker';
import { useLanguage } from '@/hooks/useLanguage';
import { formatDateDMY, formatDateToYMD } from '@/lib/helper';
import { Head, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs = [{ label: 'Reports' }, { label: 'Profit Report' }];

const groupByOptions = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
];

const viewOptions = [
    { label: 'Summary', value: 'summary' },
    { label: 'Per Item', value: 'items' },
];

export default function ProfitReport({ rows, summary, filters }) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [filterData, setFilterData] = useState({
        from_date: filters?.from_date || '',
        to_date: filters?.to_date || '',
        group_by: filters?.group_by || 'daily',
        view: filters?.view || 'summary',
    });

    const isItemView = filterData.view === 'items';

    const handleFilter = () => {
        setLoading(true);
        router.get('/reports/profit', filterData, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoading(false),
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilterData((prev) => ({ ...prev, [name]: value }));
    };

    const profitMargin =
        summary?.total_sale > 0
            ? ((summary.total_profit / summary.total_sale) * 100).toFixed(1)
            : '0.0';

    return (
        <DashboardLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Profit Report')} />
            <div className="relative bg-background font-sans text-foreground">
                <div className="mb-4">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {t('Profit Report')}
                    </h1>
                </div>

                {/* Filters */}
                <div className="mb-6 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
                    <div className="flex flex-wrap items-end gap-4">
                        <SmartDatePicker
                            label={t('From Date')}
                            value={filterData.from_date}
                            onChange={(val) =>
                                setFilterData((prev) => ({
                                    ...prev,
                                    from_date: formatDateToYMD(val),
                                }))
                            }
                        />
                        <SmartDatePicker
                            label={t('To Date')}
                            value={filterData.to_date}
                            onChange={(val) =>
                                setFilterData((prev) => ({
                                    ...prev,
                                    to_date: formatDateToYMD(val),
                                }))
                            }
                        />
                        <RadioGroupField
                            label={t('View')}
                            name="view"
                            options={viewOptions}
                            value={filterData.view}
                            onChange={handleChange}
                        />
                        {!isItemView && (
                            <RadioGroupField
                                label={t('Group By')}
                                name="group_by"
                                options={groupByOptions}
                                value={filterData.group_by}
                                onChange={handleChange}
                            />
                        )}
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
                    <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                        <SummaryCard
                            label={t('Total Items')}
                            value={summary.total_items}
                        />
                        <SummaryCard
                            label={t('Total Purchase')}
                            value={Number(
                                summary.total_purchase,
                            ).toLocaleString()}
                        />
                        <SummaryCard
                            label={t('Total Sale')}
                            value={Number(summary.total_sale).toLocaleString()}
                        />
                        <ProfitCard
                            label={t('Total Profit')}
                            value={summary.total_profit}
                            margin={profitMargin}
                        />
                    </div>
                )}

                {/* Data Table */}
                <div className="overflow-hidden rounded-xl border border-border shadow-sm">
                    <div className="overflow-x-auto">
                        {isItemView ? (
                            <ItemsTable rows={rows} summary={summary} t={t} />
                        ) : (
                            <SummaryTable rows={rows} summary={summary} t={t} />
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function SummaryTable({ rows, summary, t }) {
    return (
        <table className="w-full text-sm">
            <thead className="bg-muted/50">
                <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        #
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        {t('Period')}
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                        {t('Items')}
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                        {t('Purchase')}
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                        {t('Sale')}
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                        {t('Profit')}
                    </th>
                </tr>
            </thead>
            <tbody>
                {rows && rows.length > 0 ? (
                    rows.map((row, index) => (
                        <tr key={row.period} className="border-t border-border">
                            <td className="px-4 py-2.5 text-muted-foreground">
                                {index + 1}
                            </td>
                            <td className="px-4 py-2.5 font-medium">
                                {formatDateDMY(row.period)}
                            </td>
                            <td className="px-4 py-2.5 text-center">
                                {row.total_items}
                            </td>
                            <td className="px-4 py-2.5 text-right">
                                {Number(row.total_purchase).toLocaleString()}
                            </td>
                            <td className="px-4 py-2.5 text-right">
                                {Number(row.total_sale).toLocaleString()}
                            </td>
                            <td
                                className={`px-4 py-2.5 text-right font-semibold ${Number(row.total_profit) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}
                            >
                                {Number(row.total_profit).toLocaleString()}
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td
                            colSpan={6}
                            className="px-4 py-12 text-center text-muted-foreground"
                        >
                            {t('No data found for the selected period.')}
                        </td>
                    </tr>
                )}
            </tbody>
            {rows && rows.length > 0 && (
                <tfoot className="border-t-2 border-border bg-muted/30">
                    <tr>
                        <td colSpan={2} className="px-4 py-3 font-semibold">
                            {t('Total')}
                        </td>
                        <td className="px-4 py-3 text-center font-semibold">
                            {summary.total_items}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                            {Number(summary.total_purchase).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                            {Number(summary.total_sale).toLocaleString()}
                        </td>
                        <td
                            className={`px-4 py-3 text-right font-bold ${Number(summary.total_profit) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}
                        >
                            {Number(summary.total_profit).toLocaleString()}
                        </td>
                    </tr>
                </tfoot>
            )}
        </table>
    );
}

function ItemsTable({ rows, summary, t }) {
    return (
        <table className="w-full text-sm">
            <thead className="bg-muted/50">
                <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        #
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        {t('Sale #')}
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        {t('Date')}
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        {t('IMEI')}
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        {t('Product')}
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                        {t('Purchase')}
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                        {t('Sale')}
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                        {t('Profit')}
                    </th>
                </tr>
            </thead>
            <tbody>
                {rows && rows.length > 0 ? (
                    rows.map((row, index) => (
                        <tr key={row.id} className="border-t border-border">
                            <td className="px-4 py-2.5 text-muted-foreground">
                                {index + 1}
                            </td>
                            <td className="px-4 py-2.5 font-medium">
                                {row.sale_number}
                            </td>
                            <td className="px-4 py-2.5 text-muted-foreground">
                                {row.sale_date}
                            </td>
                            <td className="px-4 py-2.5">{row.imei || 'N/A'}</td>
                            <td className="px-4 py-2.5 text-muted-foreground">
                                {row.product_name}
                            </td>
                            <td className="px-4 py-2.5 text-right">
                                {Number(row.purchase_price).toLocaleString()}
                            </td>
                            <td className="px-4 py-2.5 text-right">
                                {Number(row.sale_price).toLocaleString()}
                            </td>
                            <td
                                className={`px-4 py-2.5 text-right font-semibold ${Number(row.profit) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}
                            >
                                {Number(row.profit).toLocaleString()}
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td
                            colSpan={8}
                            className="px-4 py-12 text-center text-muted-foreground"
                        >
                            {t('No data found for the selected period.')}
                        </td>
                    </tr>
                )}
            </tbody>
            {rows && rows.length > 0 && (
                <tfoot className="border-t-2 border-border bg-muted/30">
                    <tr>
                        <td colSpan={5} className="px-4 py-3 font-semibold">
                            {t('Total')} ({summary.total_items} {t('items')})
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                            {Number(summary.total_purchase).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                            {Number(summary.total_sale).toLocaleString()}
                        </td>
                        <td
                            className={`px-4 py-3 text-right font-bold ${Number(summary.total_profit) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}
                        >
                            {Number(summary.total_profit).toLocaleString()}
                        </td>
                    </tr>
                </tfoot>
            )}
        </table>
    );
}

function SummaryCard({ label, value }) {
    return (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="text-xs font-medium text-muted-foreground">
                {label}
            </div>
            <div className="mt-1 text-xl font-bold text-foreground">
                {value}
            </div>
        </div>
    );
}

function ProfitCard({ label, value, margin }) {
    const isPositive = Number(value) >= 0;
    return (
        <div
            className={`rounded-xl border p-4 shadow-sm ${isPositive ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30' : 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30'}`}
        >
            <div className="text-xs font-medium text-muted-foreground">
                {label}
            </div>
            <div
                className={`mt-1 text-xl font-bold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}
            >
                {Number(value).toLocaleString()}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
                {margin}% margin
            </div>
        </div>
    );
}
