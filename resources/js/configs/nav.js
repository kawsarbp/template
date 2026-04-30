import { User2Icon } from "lucide-react";
import { History } from "lucide-react";
import { Settings } from "lucide-react";
import {
    LayoutDashboard,
} from "lucide-react";

export const navItems = (permissions = {}) => {
    const menuPermissions = {
        settigns: [
            "manage user",
        ],
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
            id: 'settings',
            icon: Settings,
            label: 'Settings',
            isPermission: menuPermissions.settigns.some((permission) => permissions[permission]),
            children: [
                {
                    id: 'user',
                    icon: User2Icon,
                    label: 'User',
                    route: '/users',
                    isPermission: permissions['manage user']
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
