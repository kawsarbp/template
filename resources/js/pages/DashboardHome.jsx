import { AnalyticsChart } from '@/components/dashboard/AnalyticsChart';
import { StatCard } from '@/components/dashboard/StatCard';
import { StockPurchaseSummary } from '@/components/dashboard/StockPurchaseSummary';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useLanguage } from '@/hooks/useLanguage';
import { Head } from '@inertiajs/react';
import {
    BadgePercent,
    PackageCheck,
    ReceiptText,
    ShoppingBag,
} from 'lucide-react';

const Index = (props) => {
    const { t } = useLanguage();

    return (
        <DashboardLayout>
            <Head title="Dashboard" />
            {/* Tab Navigation */}
            {/* <div className="mb-4 sm:mb-6">
                <TabNavigation
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
            </div> */}

            {/* Stats Grid */}
            <div className="mb-4 grid grid-cols-2 gap-3 sm:mb-6 sm:gap-4 lg:grid-cols-4">
                <StatCard
                    title={t("Today's Sales")}
                    value={props?.summary?.today_sale}
                    icon={BadgePercent}
                    gradient="primary"
                    change={{
                        value: props?.summary?.today_sale_qty,
                        positive: true,
                    }}
                    delay={0.1}
                />
                <StatCard
                    title={t("Today's Purchases")}
                    value={props?.summary?.today_purchase}
                    icon={ShoppingBag}
                    gradient="info"
                    change={{
                        value: props?.summary?.today_purchase_qty,
                        positive: true,
                    }}
                    delay={0.15}
                />
                <StatCard
                    title={t('Available Stock')}
                    value={props?.summary?.available_stock}
                    icon={PackageCheck}
                    gradient="success"
                    delay={0.2}
                />
                <StatCard
                    title={t('Outstanding Dues')}
                    value={props?.summary?.outstanding_balance}
                    icon={ReceiptText}
                    gradient="warning"
                    delay={0.25}
                />
            </div>

            {/* Main Content Grid */}
            <div className="mb-4 grid grid-cols-1 gap-4 sm:mb-6 sm:gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2">
                    <AnalyticsChart />
                </div>
                <div className="space-y-4 sm:space-y-6">
                    <StockPurchaseSummary />
                    {/* <RecentActivity /> */}
                </div>
            </div>

            {/* Data Table */}
            {/* <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <DataTable />
            </motion.div> */}
        </DashboardLayout>
    );
};

export default Index;
