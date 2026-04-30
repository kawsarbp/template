import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import React from 'react';

// const breadcrumbs = [
//     { label: 'Settings', href: '/settings' },
//     { label: 'Profile' } // Last item doesn't need an href
// ];

export const AppBreadcrumb = ({
    sidebarTrigger,
    className,
    breadcrumbs = [],
}) => {
    const { url } = usePage();
    const pathnames = url
        .split('?')[0]
        .split('/')
        .filter((x) => x);

    const breadcrumbItems =
        breadcrumbs.length > 0
            ? breadcrumbs
            : pathnames.map((value, index) => {
                  const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                  return {
                      label: value
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, (l) => l.toUpperCase()),
                      href: to,
                  };
              });

    return (
        <div className={cn('hidden items-center gap-3 md:flex', className)}>
            {sidebarTrigger}

            <div className="mx-1 h-5 w-px bg-border" />

            <Breadcrumb>
                <BreadcrumbList className="text-sm font-medium text-muted-foreground">
                    <BreadcrumbItem>
                        <Link
                            href="/"
                            className="transition-colors hover:text-foreground"
                        >
                            Dashboard
                        </Link>
                    </BreadcrumbItem>

                    {breadcrumbItems.length > 0 && <BreadcrumbSeparator />}

                    {breadcrumbItems.map((item, index) => {
                        const isLast = index === breadcrumbItems.length - 1;

                        return (
                            <React.Fragment key={item.label + index}>
                                <BreadcrumbItem>
                                    {isLast || !item.href ? (
                                        <BreadcrumbPage className="flex items-center gap-1 font-bold text-foreground">
                                            {item.label}
                                        </BreadcrumbPage>
                                    ) : (
                                        <Link
                                            href={item.href}
                                            className="transition-colors hover:text-foreground"
                                        >
                                            {item.label}
                                        </Link>
                                    )}
                                </BreadcrumbItem>
                                {!isLast && <BreadcrumbSeparator />}
                            </React.Fragment>
                        );
                    })}
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    );
};
