import logoMain from '@/assets/logo-main.png';
import { bottomNavItems, navItems } from '@/configs/nav';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { mergeData } from '@/lib/helper';
import { cn } from '@/lib/utils';
import { Link, router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronRight, LogOut, User, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

// --- Helper: Recursively check if any child is active ---
const isChildActive = (item, currentPath) => {
    if (item.route && item.route === currentPath) return true;
    if (
        item.route &&
        item.route !== '/' &&
        currentPath.startsWith(item.route + '/')
    )
        return true;
    if (item.children) {
        return item.children.some((child) => isChildActive(child, currentPath));
    }
    return false;
};

// --- Helper: Filter items based on permission ---
const filterNavItemsByPermission = (items) => {
    return items
        .filter((item) => item.isPermission)
        .map((item) => {
            if (item.children) {
                return {
                    ...item,
                    children: filterNavItemsByPermission(item.children),
                };
            }
            return item;
        });
};

const badgeColors = {
    primary: 'bg-primary text-white',
    success: 'bg-success text-white',
    warning: 'bg-warning text-warning-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    info: 'bg-info text-white',
};

// --- Updated SubmenuItems for Hover Popup ---
const SubmenuItems = ({ items, isRTL, activeItem, level = 0 }) => {
    const [expandedItems, setExpandedItems] = useState([]);

    const toggleExpand = (label) => {
        setExpandedItems((prev) =>
            prev.includes(label)
                ? prev.filter((i) => i !== label)
                : [...prev, label],
        );
    };

    return (
        <div className="space-y-0.5 px-1">
            {items.map((item) => {
                const Icon = item.icon;
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = expandedItems.includes(item.label);
                const isActive =
                    (item.route && item.route === activeItem) ||
                    (item.route &&
                        item.route !== '/' &&
                        activeItem.startsWith(item.route + '/')) ||
                    (hasChildren && isChildActive(item, activeItem));

                return (
                    <div key={item.label}>
                        <Link
                            href={item.route || '#'}
                            onClick={(e) => {
                                if (hasChildren) {
                                    if (!item.route) e.preventDefault();
                                    toggleExpand(item.label);
                                }
                            }}
                            className={cn(
                                'flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                                isActive
                                    ? 'bg-primary/10 font-medium text-primary'
                                    : 'text-foreground/80 hover:bg-muted hover:text-foreground',
                            )}
                            style={{ paddingLeft: `${12 + level * 12}px` }}
                        >
                            <Icon
                                className={cn(
                                    'h-4 w-4 shrink-0',
                                    isActive
                                        ? 'text-primary'
                                        : 'text-muted-foreground',
                                )}
                            />
                            <span className="flex-1 truncate text-left">
                                {item.label}
                            </span>
                            {item.count !== undefined && (
                                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                                    {item?.count?.toLocaleString()}
                                </span>
                            )}
                            {hasChildren && (
                                <motion.div
                                    animate={{ rotate: isExpanded ? 90 : 0 }}
                                >
                                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                </motion.div>
                            )}
                        </Link>
                        <AnimatePresence>
                            {hasChildren && isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                >
                                    <SubmenuItems
                                        items={item.children}
                                        isRTL={isRTL}
                                        activeItem={activeItem}
                                        level={level + 1}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </div>
    );
};

// --- Updated HoverSubmenu ---
const HoverSubmenu = ({ item, children, collapsed, isRTL, activeItem }) => {
    const [showSubmenu, setShowSubmenu] = useState(false);
    const timeoutRef = useRef(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setShowSubmenu(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => setShowSubmenu(false), 150);
    };

    if (!collapsed || !item.children?.length) {
        return <>{children}</>;
    }

    return (
        <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            <AnimatePresence>
                {showSubmenu && (
                    <motion.div
                        initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: isRTL ? 10 : -10 }}
                        className={cn(
                            'fixed z-100 max-h-[70vh] min-w-55 overflow-y-auto rounded-xl py-2',
                            'border border-border bg-card backdrop-blur-xl',
                            'scrollbar-thin',
                            isRTL ? 'right-20 mr-2' : 'left-20 ml-2',
                        )}
                        style={{ marginTop: '-45px' }}
                    >
                        <div className="mb-1 border-b border-border px-3 py-2">
                            <span className="text-sm font-semibold text-foreground">
                                {item.label}
                            </span>
                        </div>
                        <SubmenuItems
                            items={item.children}
                            isRTL={isRTL}
                            activeItem={activeItem}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const MotionLink = motion(Link);

// --- Updated NavItem ---
const NavItem = ({
    item,
    level,
    collapsed,
    activeItem,
    onItemClick,
    expandedItems,
    onToggleExpand,
    isDark = true,
}) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.label);

    const isActive =
        (item.route && item.route === activeItem) ||
        (item.route &&
            item.route !== '/' &&
            activeItem.startsWith(item.route + '/')) ||
        (hasChildren && isChildActive(item, activeItem));

    const paddingInline = collapsed ? 12 : 12 + level * 12;
    const { isRTL } = useLanguage();

    const handleClick = (e) => {
        if (hasChildren && !collapsed) {
            if (!item.route) e.preventDefault();
            onToggleExpand(item.label);
        } else {
            if (item.route) onItemClick(item.route);
        }
    };

    return (
        <div>
            <HoverSubmenu
                item={item}
                collapsed={collapsed}
                isRTL={isRTL}
                activeItem={activeItem}
            >
                <MotionLink
                    href={item.route || '#'}
                    onClick={handleClick}
                    whileTap={{ scale: 0.98 }}
                    style={{
                        paddingInlineStart: paddingInline,
                        paddingInlineEnd: 12,
                    }}
                    className={cn(
                        'flex w-full cursor-pointer items-center gap-2 rounded-xl py-2.5 transition-all duration-200',
                        'group relative overflow-hidden',
                        collapsed && 'justify-center',
                        isActive
                            ? 'bg-linear-to-r from-primary to-primary/80 text-primary-foreground'
                            : isDark
                              ? 'text-sidebar-foreground/80 hover:bg-white/10 hover:text-sidebar-foreground'
                              : 'text-foreground/80 hover:bg-primary/10 hover:text-foreground',
                    )}
                >
                    <Icon
                        className={cn(
                            'h-4 w-4 shrink-0 transition-colors',
                            isActive
                                ? 'text-primary-foreground'
                                : isDark
                                  ? 'text-sidebar-foreground/60 group-hover:text-primary'
                                  : 'text-muted-foreground group-hover:text-primary',
                        )}
                    />

                    <AnimatePresence mode="wait">
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="flex-1 text-left text-sm font-medium whitespace-nowrap"
                            >
                                {item.label}
                            </motion.span>
                        )}
                    </AnimatePresence>

                    {!collapsed && (
                        <>
                            {item.count !== undefined && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className={cn(
                                        'rounded-full px-2 py-0.5 text-xs font-semibold',
                                        isActive
                                            ? 'bg-primary-foreground/20 text-primary-foreground'
                                            : 'bg-primary text-white',
                                    )}
                                >
                                    {item?.count?.toLocaleString()}
                                </motion.span>
                            )}

                            {item.badge && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className={cn(
                                        'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                                        badgeColors[
                                            item.badgeColor || 'primary'
                                        ],
                                    )}
                                >
                                    {item.badge}
                                </motion.span>
                            )}

                            {hasChildren && (
                                <motion.div
                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ChevronDown
                                        className={cn(
                                            'h-4 w-4',
                                            isDark
                                                ? 'text-sidebar-foreground/40'
                                                : isActive
                                                  ? 'text-white'
                                                  : 'text-muted-foreground',
                                        )}
                                    />
                                </motion.div>
                            )}
                        </>
                    )}
                </MotionLink>
            </HoverSubmenu>

            <AnimatePresence>
                {hasChildren && isExpanded && !collapsed && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="relative mt-1 space-y-0.5">
                            <div
                                className={cn(
                                    'absolute top-0 bottom-2 left-6 w-px rtl:right-6',
                                    isDark
                                        ? 'bg-sidebar-border/50'
                                        : 'bg-border',
                                )}
                                style={{ marginLeft: level * 12 }}
                            />
                            {item.children.map((child) => (
                                <NavItem
                                    key={child.label}
                                    item={child}
                                    level={level + 1}
                                    collapsed={collapsed}
                                    activeItem={activeItem}
                                    onItemClick={onItemClick}
                                    expandedItems={expandedItems}
                                    onToggleExpand={onToggleExpand}
                                    isDark={isDark}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const Sidebar = ({ mobileOpen, onMobileClose, collapsed = false }) => {
    const { url } = usePage();
    const { permissions = {}, user = {} } = usePage().props;
    const navigate = (url) => {
        // Keeping this for backward compatibility if needed elsewhere,
        // but prefer Link component
        router.get(url);
    };
    const [expandedItems, setExpandedItems] = useState(['Vehicles']);
    const { isRTL } = useLanguage();
    const { theme } = useTheme();
    const [badgeData, setBadgeData] = useState({});
    const isDark = theme === 'dark';
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileMenuRef = useRef(null);

    // Strip query parameters from URL for route matching
    const activeItem = url.split('?')[0];

    // Handle click outside to close profile menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                profileMenuRef.current &&
                !profileMenuRef.current.contains(event.target)
            ) {
                setShowProfileMenu(false);
            }
        };

        if (showProfileMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showProfileMenu]);

    const handleLogout = () => {
        router.post('/logout');
    };

    const finalNavItems = useMemo(() => {
        return filterNavItemsByPermission(
            mergeData(navItems(permissions), badgeData),
        );
    }, [badgeData]);

    const finalBottomNavItems = useMemo(() => {
        return filterNavItemsByPermission(
            mergeData(bottomNavItems(permissions), badgeData),
        );
    }, [badgeData]);

    useEffect(() => {
        const newExpandedItems = new Set(expandedItems);
        let hasChanges = false;

        const checkAndExpand = (items) => {
            items.forEach((item) => {
                if (
                    item.children &&
                    isChildActive(item, activeItem) &&
                    !newExpandedItems.has(item.label)
                ) {
                    newExpandedItems.add(item.label);
                    hasChanges = true;
                }
            });
        };

        checkAndExpand(finalNavItems);
        checkAndExpand(finalBottomNavItems);

        if (hasChanges) {
            setExpandedItems(Array.from(newExpandedItems));
        }
    }, [activeItem, finalNavItems, finalBottomNavItems]);

    const toggleExpand = (label) => {
        setExpandedItems((prev) =>
            prev.includes(label)
                ? prev.filter((item) => item !== label)
                : [...prev, label],
        );
    };

    const handleItemClick = (route) => {
        // Navigation is now handled by the Link component's href
        if (onMobileClose) onMobileClose();
    };

    const sidebarContent = (
        <>
            <div
                className={cn(
                    'border-b p-4',
                    isDark ? 'border-white/10' : 'border-border',
                )}
            >
                <div
                    className={`${mobileOpen ? 'flex items-center gap-3' : ''}`}
                >
                    <Link href="/">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="shrink-0 cursor-pointer"
                        >
                            <img
                                src={logoMain}
                                alt="Zaaag Shipping Logo"
                                className={cn(
                                    'object-contain transition-all duration-300',
                                    collapsed
                                        ? 'h-10 w-10'
                                        : `${mobileOpen ? 'h-14' : ''} w-full max-w-45`,
                                )}
                            />
                        </motion.div>
                    </Link>
                    {mobileOpen && (
                        <button
                            onClick={onMobileClose}
                            className={cn(
                                'ml-auto rounded-lg p-2 transition-colors lg:hidden',
                                isDark ? 'hover:bg-white/10' : 'hover:bg-muted',
                            )}
                        >
                            <X
                                className={cn(
                                    'h-5 w-5',
                                    isDark
                                        ? 'text-sidebar-foreground'
                                        : 'text-foreground',
                                )}
                            />
                        </button>
                    )}
                </div>
            </div>

            <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto p-3">
                {finalNavItems.map((item) => (
                    <NavItem
                        key={item.id}
                        item={item}
                        level={0}
                        collapsed={collapsed}
                        activeItem={activeItem}
                        onItemClick={handleItemClick}
                        expandedItems={expandedItems}
                        onToggleExpand={toggleExpand}
                        isDark={isDark}
                    />
                ))}
            </nav>

            {finalBottomNavItems.length > 0 && (
                <div
                    className={cn(
                        'border-t p-3',
                        isDark ? 'border-white/10' : 'border-border',
                    )}
                >
                    {finalBottomNavItems.map((item) => (
                        <NavItem
                            key={item.id}
                            item={item}
                            level={0}
                            collapsed={collapsed}
                            activeItem={activeItem}
                            onItemClick={handleItemClick}
                            expandedItems={expandedItems}
                            onToggleExpand={toggleExpand}
                            isDark={isDark}
                        />
                    ))}
                </div>
            )}

            <div
                className={cn(
                    'relative border-t p-3',
                    isDark ? 'border-white/10' : 'border-border',
                )}
                ref={profileMenuRef}
            >
                <AnimatePresence>
                    {showProfileMenu && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.1 }}
                            className={cn(
                                'absolute right-3 bottom-full left-3 mb-2 rounded-xl border p-1 shadow-lg backdrop-blur-xl',
                                isDark
                                    ? 'border-white/10 bg-white/5'
                                    : 'border-border bg-white/80',
                            )}
                        >
                            <Link
                                href="/profile"
                                className={cn(
                                    'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                                    isDark
                                        ? 'text-sidebar-foreground hover:bg-white/10'
                                        : 'text-foreground hover:bg-muted',
                                )}
                            >
                                <User className="h-4 w-4" />
                                <span>Profile</span>
                            </Link>
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className={cn(
                                    'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                                    isDark
                                        ? 'text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive'
                                        : 'text-foreground hover:bg-destructive/10 hover:text-destructive',
                                )}
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Logout</span>
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-xl p-2 transition-colors',
                        isDark
                            ? 'bg-white/5 hover:bg-white/10'
                            : 'bg-muted/50 hover:bg-muted',
                        collapsed && 'justify-center',
                        showProfileMenu &&
                            (isDark ? 'bg-white/10' : 'bg-muted'),
                    )}
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-primary to-accent">
                        {user?.data?.profile_photo ? (
                            <img
                                src={user?.data?.profile_photo}
                                alt=""
                                className="h-full w-full rounded-full object-cover"
                            />
                        ) : (
                            <User className="h-4 w-4 text-primary-foreground" />
                        )}
                    </div>
                    <AnimatePresence mode="wait">
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="min-w-0 flex-1"
                            >
                                <p
                                    className={cn(
                                        'truncate text-sm font-medium',
                                        isDark
                                            ? 'text-sidebar-foreground'
                                            : 'text-foreground',
                                    )}
                                >
                                    {user?.data?.name}
                                </p>
                                <p
                                    className={cn(
                                        'truncate text-xs',
                                        isDark
                                            ? 'text-sidebar-foreground/60'
                                            : 'text-muted-foreground',
                                    )}
                                >
                                    {user?.data?.email}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </>
    );

    const lightModeStyles = {
        background:
            'linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(220 20% 98%) 50%, hsl(220 25% 96%) 100%)',
    };

    const darkModeStyles = {
        background:
            'linear-gradient(180deg, hsl(215 80% 18%) 0%, hsl(220 75% 12%) 30%, hsl(225 70% 8%) 70%, hsl(230 65% 5%) 100%)',
    };

    return (
        <>
            <aside
                initial={{ x: isRTL ? 20 : -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className={cn(
                    'fixed top-0 z-30 hidden h-screen flex-col overflow-hidden transition-all duration-300 lg:flex',
                    isRTL ? 'right-0' : 'left-0',
                    collapsed ? 'w-18' : 'w-70',
                    !isDark && 'border-r border-border',
                )}
                style={isDark ? darkModeStyles : lightModeStyles}
            >
                {isDark && (
                    <>
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent" />
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />
                        <div className="absolute top-0 right-0 left-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />
                        <div
                            className={cn(
                                'absolute top-0 bottom-0 w-px',
                                isRTL
                                    ? 'left-0 bg-linear-to-b from-primary/30 via-white/5 to-transparent'
                                    : 'right-0 bg-linear-to-b from-primary/30 via-white/5 to-transparent',
                            )}
                        />
                    </>
                )}

                {!isDark && (
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
                )}

                <div className="relative z-10 flex h-full flex-col">
                    {sidebarContent}
                </div>
            </aside>

            <div
                className={cn(
                    'hidden shrink-0 transition-all duration-300 lg:block',
                    collapsed ? 'w-18' : 'w-70',
                )}
            />

            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onMobileClose}
                            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: isRTL ? '100%' : '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: isRTL ? '100%' : '-100%' }}
                            transition={{
                                type: 'spring',
                                damping: 25,
                                stiffness: 200,
                            }}
                            className={cn(
                                'fixed top-0 bottom-0 z-50 flex w-70 flex-col overflow-hidden lg:hidden',
                                isRTL ? 'right-0' : 'left-0',
                                !isDark && 'border-r border-border',
                            )}
                            style={isDark ? darkModeStyles : lightModeStyles}
                        >
                            {isDark && (
                                <>
                                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent" />
                                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />
                                    <div className="absolute top-0 right-0 left-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />
                                </>
                            )}
                            {!isDark && (
                                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
                            )}

                            <div className="relative z-10 flex h-full flex-col">
                                {sidebarContent}
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};
