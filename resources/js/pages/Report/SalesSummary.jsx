import RadioGroupField from '@/components/custom-component/RadioGroupField';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { SmartDatePicker } from '@/components/ui/date-picker/DatePicker';
import { useLanguage } from '@/hooks/useLanguage';
import { formatDateDMY } from '@/lib/helper';
import { Head, Link, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs = [{ label: 'Reports' }, { label: 'Sales Summary' }];

const groupByOptions = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
];

export default function SalesSummary({ rows, summary, filters }) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [filterData, setFilterData] = useState({
        from_date: filters?.from_date || '',
        to_date: filters?.to_date || '',
        group_by: filters?.group_by || 'daily',
    });

    const handleFilter = () => {
        setLoading(true);
        router.get('/reports/sales-summary', filterData, {
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
            <Head title={t('Sales Summary')} />
            <div className="relative bg-background font-sans text-foreground">
                <div className="mb-4">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {t('Sales Summary')}
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
                                    from_date: val,
                                }))
                            }
                        />
                        <SmartDatePicker
                            label={t('To Date')}
                            value={filterData.to_date}
                            onChange={(val) =>
                                setFilterData((prev) => ({
                                    ...prev,
                                    to_date: val,
                                }))
                            }
                        />
                        <RadioGroupField
                            label={t('Group By')}
                            name="group_by"
                            options={groupByOptions}
                            value={filterData.group_by}
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
                            label={t('Total Sales')}
                            value={summary.total_sales}
                        />
                        <SummaryCard
                            label={t('Total Units')}
                            value={summary.total_units}
                        />
                        <SummaryCard
                            label={t('Total Amount')}
                            value={Number(
                                summary.total_amount,
                            ).toLocaleString()}
                        />
                        <SummaryCard
                            label={t('Total Discount')}
                            value={Number(
                                summary.total_discount,
                            ).toLocaleString()}
                        />
                        <SummaryCard
                            label={t('Total Paid')}
                            value={Number(summary.total_paid).toLocaleString()}
                        />
                        <SummaryCard
                            label={t('Total Due')}
                            value={Number(summary.total_due).toLocaleString()}
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
                                        {t('Period')}
                                    </th>
                                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                                        {t('Sales')}
                                    </th>
                                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                                        {t('Units')}
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                        {t('Amount')}
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                        {t('Discount')}
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                        {t('Paid')}
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                        {t('Due')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows && rows.length > 0 ? (
                                    rows.map((row, index) => (
                                        <tr
                                            key={row.period}
                                            className="border-t border-border"
                                        >
                                            <td className="px-4 py-2.5 text-muted-foreground">
                                                {index + 1}
                                            </td>
                                            <td className="px-4 py-2.5 font-medium">
                                                <Link
                                                    href={`/sales?sale_date=${row.period}`}
                                                    className="text-primary hover:underline"
                                                >
                                                    {formatDateDMY(row.period)}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-2.5 text-center">
                                                {row.total_sales}
                                            </td>
                                            <td className="px-4 py-2.5 text-center">
                                                {row.total_units}
                                            </td>
                                            <td className="px-4 py-2.5 text-right">
                                                {Number(
                                                    row.total_amount,
                                                ).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-2.5 text-right">
                                                {Number(
                                                    row.total_discount,
                                                ).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-2.5 text-right">
                                                {Number(
                                                    row.total_paid,
                                                ).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-2.5 text-right">
                                                {Number(
                                                    row.total_due,
                                                ).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-4 py-12 text-center text-muted-foreground"
                                        >
                                            {t(
                                                'No data found for the selected period.',
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            {rows && rows.length > 0 && (
                                <tfoot className="border-t-2 border-border bg-muted/30">
                                    <tr>
                                        <td
                                            colSpan={2}
                                            className="px-4 py-3 font-semibold"
                                        >
                                            {t('Total')}
                                        </td>
                                        <td className="px-4 py-3 text-center font-semibold">
                                            {summary.total_sales}
                                        </td>
                                        <td className="px-4 py-3 text-center font-semibold">
                                            {summary.total_units}
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold">
                                            {Number(
                                                summary.total_amount,
                                            ).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold">
                                            {Number(
                                                summary.total_discount,
                                            ).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold">
                                            {Number(
                                                summary.total_paid,
                                            ).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold">
                                            {Number(
                                                summary.total_due,
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
