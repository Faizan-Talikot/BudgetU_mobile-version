import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    Wallet,
    Receipt,
    LineChart,
    Goal,
    Settings,
    LogOut
} from "lucide-react";

type NavItem = {
    title: string;
    href: string;
    icon: React.ElementType;
    disabled?: boolean;
};

const navItems: NavItem[] = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Budgets",
        href: "/budgets",
        icon: Wallet,
    },
    {
        title: "Transactions",
        href: "/transactions",
        icon: Receipt,
    },
    {
        title: "Analytics",
        href: "/analytics",
        icon: LineChart,
        disabled: true,
    },
    {
        title: "Savings Goals",
        href: "/goals",
        icon: Goal,
        disabled: true,
    },
];

interface DashboardNavProps {
    onLogout: () => void;
}

export function DashboardNav({ onLogout }: DashboardNavProps) {
    const location = useLocation();

    return (
        <div className="flex flex-col h-full">
            <div className="px-3 py-2">
                <div className="flex items-center gap-2 px-2 mb-6">
                    <div className="h-8 w-8 bg-budgetu-purple rounded-md flex items-center justify-center">
                        <span className="text-white font-bold text-lg">B</span>
                    </div>
                    <span className="font-bold text-xl">BudgetU</span>
                </div>
                <div className="space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            to={item.disabled ? "#" : item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                                location.pathname === item.href
                                    ? "bg-muted font-medium text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-primary",
                                item.disabled && "pointer-events-none opacity-60"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.title}
                        </Link>
                    ))}
                </div>
            </div>
            <div className="mt-auto p-3 space-y-1">
                <Link
                    to="/settings"
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        location.pathname === "/settings"
                            ? "bg-muted font-medium text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-primary",
                    )}
                >
                    <Settings className="h-4 w-4" />
                    Settings
                </Link>
                <Button
                    variant="ghost"
                    className="w-full justify-start px-3 py-2 text-sm font-normal text-muted-foreground hover:bg-muted hover:text-primary"
                    onClick={onLogout}
                >
                    <LogOut className="h-4 w-4 mr-3" />
                    Logout
                </Button>
            </div>
        </div>
    );
} 