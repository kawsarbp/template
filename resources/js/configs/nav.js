import { formatDateToYMD } from "@/lib/helper";
import { User2Icon } from "lucide-react";
import { Key } from "lucide-react";
import { Package } from "lucide-react";
import { Palette, Star } from "lucide-react";
import { ReceiptText } from "lucide-react";
import { Receipt } from "lucide-react";
import { History } from "lucide-react";
import { Settings } from "lucide-react";
import {
    LayoutDashboard,
    LandmarkIcon,
    Tag,
    Truck,
    UserIcon,
    Warehouse,
    ShoppingCart,
    BadgeDollarSign,
    ChartBarStacked,
    TrendingUp,
    CircleDollarSign,
    BoxesIcon,
    Undo2,
    CreditCard,
} from "lucide-react";

export const navItems = (permissions = {}) => {
    const menuPermissions = {
        settigns: [
            "manage role",
            "manage user",
            "manage brand",
            "manage bank account",
        ],
        advanceAccounts: [
            "manage advance account",
            "manage advance report"
        ],
        reports: [
            "manage sale",
            "manage cash bank",
            "manage stock",
        ]
    };

    return [
        {
            id: "dashboard",
            icon: LayoutDashboard,
            label: "Dashboard",
            route: "/",
            isPermission: true
        },
        {
            id: 'customer',
            icon: UserIcon,
            label: "Customer",
            route: "/customers",
            isPermission: permissions['manage customer']
        },
        {
            id: 'supplier',
            icon: Truck,
            label: "Supplier",
            route: "/suppliers",
            isPermission: permissions['manage supplier']
        },
        {
            id: "product",
            icon: Package,
            label: "Product",
            route: "/products",
            isPermission: permissions['manage product']
        },
        {
            id: "stock-purchases",
            icon: ShoppingCart,
            label: "Stock Purchases",
            route: "/stock-purchases",
            isPermission: permissions['manage stock']
        },
        {
            id: "supplier-payments",
            icon: CreditCard,
            label: "Supplier Payment",
            route: "/supplier-payments",
            isPermission: permissions['manage stock']
        },
        {
            id: "stocks",
            icon: Warehouse,
            label: "Stock Inventory",
            route: "/stocks",
            isPermission: permissions['manage stock']
        },
        {
            id: "sales",
            icon: BadgeDollarSign,
            label: "Sales",
            route: "/sales",
            isPermission: permissions['manage sale']
        },
        {
            id: "sale-returns",
            icon: Undo2,
            label: "Sale Returns",
            route: "/sale-returns",
            isPermission: permissions['manage sale return']
        },
        {
            id: "advance-acounts",
            icon: ReceiptText,
            label: "Advance Payment",
            isPermission: menuPermissions.advanceAccounts.some((permission) => permissions[permission]),
            children: [
                {
                    id: "customer-advance",
                    icon: Receipt,
                    label: "Customer Advance",
                    route: "/advanced-accounts",
                    isPermission: permissions['manage advance account'],
                },
                {
                    id: "customer-advance-report",
                    icon: ReceiptText,
                    label: "Advance Report",
                    route: "/reports/customer-advance",
                    isPermission: permissions['manage advance report'],
                }
            ]
        },
        {
            id: "Cashflow",
            icon: Receipt,
            label: "Cash Flow",
            route: "/cashflow-transactions",
            isPermission: permissions['manage cashflow']
        },
        {
            id: 'reports',
            icon: ChartBarStacked,
            label: 'Reports',
            isPermission: menuPermissions.reports.some((permission) => permissions[permission]),
            children: [
                {
                    id: 'sales-summary',
                    icon: TrendingUp,
                    label: 'Sales Summary',
                    route: '/reports/sales-summary',
                    isPermission: permissions['manage sale'],
                },
                {
                    id: 'profit-report',
                    icon: CircleDollarSign,
                    label: 'Profit Report',
                    route: '/reports/profit',
                    isPermission: permissions['manage sale'],
                },
                {
                    id: 'stock-report',
                    icon: BoxesIcon,
                    label: 'Stock Report',
                    route: '/reports/stock',
                    isPermission: permissions['manage stock'],
                },
                {
                    id: 'cash-bank-report',
                    icon: LandmarkIcon,
                    label: 'Cash Bank Report',
                    route: `/reports/cash-bank-report?start_date=${formatDateToYMD(new Date())}&end_date=${formatDateToYMD(new Date())}`,
                    isPermission: permissions['manage cash bank'],
                },
            ]
        },
        {
            id: 'settings',
            icon: Settings,
            label: 'Settings',
            isPermission: menuPermissions.settigns.some((permission) => permissions[permission]),
            children: [
                {
                    id: 'role',
                    icon: Key,
                    label: 'Role',
                    route: '/roles',
                    isPermission: permissions['manage role']
                },
                {
                    id: 'user',
                    icon: User2Icon,
                    label: 'User',
                    route: '/users',
                    isPermission: permissions['manage user']
                },
                {
                    id: 'brand',
                    icon: Tag,
                    label: 'Brand',
                    route: '/brands',
                    isPermission: permissions['manage brand']
                },
                {
                    id: 'color',
                    icon: Palette,
                    label: 'Color',
                    route: '/colors',
                    isPermission: permissions['manage color']
                },
                {
                    id: 'condition',
                    icon: Star,
                    label: 'Condition',
                    route: '/conditions',
                    isPermission: permissions['manage condition']
                },
                {
                    id: "Banking",
                    icon: LandmarkIcon,
                    label: "Bank Account",
                    route: "/bank-accounts",
                    isPermission: permissions['manage bank account']
                },
                {
                    id: "audit-logs",
                    icon: History,
                    label: 'Audit Log',
                    route: '/activity-logs',
                    isPermission: true,
                }
            ]
        }

    ]
};

export const bottomNavItems = () => [

];
