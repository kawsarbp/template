import { usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-strong rounded-lg p-3 shadow-lg">
                <p className="mb-2 text-sm font-semibold text-foreground">
                    {label}
                </p>
                {payload.map((entry, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-2 text-sm"
                    >
                        <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-muted-foreground capitalize">
                            {entry.name}:
                        </span>
                        <span className="font-medium text-foreground">
                            {entry.name === 'revenue'
                                ? `$${entry.value.toLocaleString()}`
                                : entry.value.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export const AnalyticsChart = () => {
    const { performance_overview } = usePage().props;
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass rounded-2xl p-4 sm:p-6"
        >
            <div className="mb-4 flex flex-col justify-between gap-3 sm:mb-6 sm:flex-row sm:items-center">
                <div>
                    <h3 className="text-base font-semibold text-foreground sm:text-lg">
                        Sales and Purchase Overview
                    </h3>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                        Monthly statistics for the year
                    </p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-success" />
                        <span className="text-xs text-muted-foreground">
                            Sales
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-accent" />
                        <span className="text-xs text-muted-foreground">
                            Purchases
                        </span>
                    </div>
                </div>
            </div>

            <div className="h-50 sm:h-70">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={performance_overview?.original ?? []}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient
                                id="colorVehicles"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="hsl(142, 76%, 36%)"
                                    stopOpacity={0.3}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="hsl(142, 76%, 36%)"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                            <linearGradient
                                id="colorShipments"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="hsl(199, 89%, 48%)"
                                    stopOpacity={0.3}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="hsl(199, 89%, 48%)"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="var(--border)"
                            strokeOpacity={0.5}
                        />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fontSize: 10,
                                fill: 'var(--muted-foreground)',
                            }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fontSize: 10,
                                fill: 'var(--muted-foreground)',
                            }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="sales"
                            stroke="hsl(142, 76%, 36%)"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorVehicles)"
                        />
                        <Area
                            type="monotone"
                            dataKey="purchases"
                            stroke="hsl(199, 89%, 48%)"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorShipments)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};
