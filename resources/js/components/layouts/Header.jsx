import { AppBreadcrumb } from '@/components/AppBreadcrumb';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Bell, PanelLeft } from 'lucide-react';
import ThemeSwitcher from '../ThemeSwitcher';

export const Header = ({
    onMenuClick,
    sidebarCollapsed,
    onToggleSidebar,
    breadcrumbs,
}) => {
    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="sticky top-0 z-40 w-full border-b border-border bg-card"
        >
            <div className="flex h-16 w-full items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onMenuClick}
                        className="shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
                    >
                        <PanelLeft className="h-5 w-5" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggleSidebar}
                        className="-ml-2 hidden shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground lg:flex"
                        title={
                            sidebarCollapsed
                                ? 'Expand sidebar'
                                : 'Collapse sidebar'
                        }
                    >
                        <PanelLeft className="h-5 w-5" />
                    </Button>

                    <AppBreadcrumb breadcrumbs={breadcrumbs} />
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="relative hidden sm:block">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                            <Bell className="h-5 w-5" />
                        </Button>
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full border-2 border-card bg-success"></span>
                    </div>

                    <LanguageSelector />

                    <div className="h-6 w-px bg-border" />
                    <ThemeSwitcher />
                </div>
            </div>
        </motion.header>
    );
};
