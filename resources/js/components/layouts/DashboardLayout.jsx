import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const DashboardLayout = ({ children, breadcrumbs = [] }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="flex min-h-screen w-full bg-background">
            <Sidebar
                mobileOpen={mobileMenuOpen}
                onMobileClose={() => setMobileMenuOpen(false)}
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <Header
                    onMenuClick={() => setMobileMenuOpen(true)}
                    sidebarCollapsed={sidebarCollapsed}
                    onToggleSidebar={() =>
                        setSidebarCollapsed(!sidebarCollapsed)
                    }
                    breadcrumbs={breadcrumbs}
                />
                <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};
