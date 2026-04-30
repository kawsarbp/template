import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const gradientClasses = {
    primary: 'gradient-primary',
    accent: 'gradient-accent',
    success: 'gradient-success',
    info: 'gradient-info',
    warning: 'gradient-warning',
};

export const StatCard = ({
    title,
    value,
    icon: Icon,
    gradient,
    subtitle,
    change,
    delay = 0,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4, ease: 'easeOut' }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={cn(
                'relative overflow-hidden rounded-2xl p-4 text-white shadow-lg sm:p-6',
                gradientClasses[gradient],
            )}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-white/20 sm:h-32 sm:w-32" />
                <div className="absolute -right-4 -bottom-4 h-16 w-16 rounded-full bg-white/10 sm:h-24 sm:w-24" />
            </div>

            <div className="relative z-10">
                <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-xs font-medium text-white/80 sm:text-sm">
                            {title}
                        </p>
                        <motion.p
                            className="truncate text-2xl font-bold sm:text-3xl"
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            transition={{
                                delay: delay + 0.2,
                                type: 'spring',
                                stiffness: 200,
                            }}
                        >
                            {typeof value === 'number'
                                ? value.toLocaleString()
                                : value}
                        </motion.p>
                        {subtitle && (
                            <p className="truncate text-[10px] text-white/70 sm:text-xs">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    <div className="ml-2 shrink-0 rounded-xl bg-white/20 p-2 sm:p-3">
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                </div>

                {change && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: delay + 0.3 }}
                        className="mt-3 flex items-center gap-2 sm:mt-4"
                    >
                        <span
                            className={cn(
                                'rounded-full px-2 py-0.5 text-[10px] font-semibold sm:text-xs',
                                change.positive ? 'bg-white/20' : 'bg-white/20',
                            )}
                        >
                            {/* {change.positive ? '+' : ''} */}
                            {change.value}
                        </span>
                        <span className="text-[10px] text-white/70 sm:text-xs">
                            Items
                        </span>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};
