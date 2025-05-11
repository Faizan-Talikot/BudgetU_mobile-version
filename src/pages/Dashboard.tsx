import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, User, Settings, ChevronDown, Plus, ArrowUpRight, ArrowDownRight, MoreHorizontal, Wallet, Home, ShoppingBag, Coffee, Utensils, Book, Download, Menu, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { getUserData, logout, transactionApi, budgetApi } from "@/lib/api";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DashboardNav } from "@/components/DashboardNav";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Receipt, LineChart, Goal, Loader2 } from "lucide-react";
import { EmptyStateFinancial } from "@/components/EmptyStateFinancial";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

// Define interfaces for data
interface Transaction {
    _id: string;
    amount: number;
    description: string;
    category: string;
    date: string;
    isIncome: boolean;
    paymentMethod: string;
    budgetId?: string;
    location?: string;
}

interface Budget {
    _id: string;
    name: string;
    totalAmount: number;
    spent: number;
    remaining: number;
    startDate: string;
    endDate: string;
    categories: {
        _id: string;
        name: string;
        amount: number;
        spent: number;
        color?: string;
        icon?: string;
    }[];
}

interface CategoryBreakdown {
    category: string;
    amount: number;
    percentage: number;
    color?: string;
}

interface FinancialSummary {
    income: number;
    expenses: number;
    balance: number;
    categoryBreakdown: CategoryBreakdown[];
}

const Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();

    // User data state
    const [userName, setUserName] = useState("");
    const [userInitials, setUserInitials] = useState("");

    // UI state
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showAddTransactionDialog, setShowAddTransactionDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Data state
    const [hasFinancialData, setHasFinancialData] = useState(false);
    const [activeBudgets, setActiveBudgets] = useState<Budget[]>([]);
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
    const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
        income: 0,
        expenses: 0,
        balance: 0,
        categoryBreakdown: []
    });

    // Check if user is logged in and load data
    useEffect(() => {
        const token = localStorage.getItem("budgetu-token");
        if (!token) {
            navigate("/");
            return;
        }

        // Get user data from localStorage
        const userData = getUserData();
        if (userData) {
            setUserName(`${userData.firstName} ${userData.lastName}`);
            setUserInitials(`${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`);
        }

        // Load dashboard data
        loadDashboardData();
    }, [navigate]);

    // Load all dashboard data
    const loadDashboardData = async () => {
        setIsLoading(true);
        try {
            // Get data for the current month
            const currentDate = new Date();
            const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

            console.log("Loading dashboard data...");
            console.log("Date range:", firstDay.toISOString().split('T')[0], "to", lastDay.toISOString().split('T')[0]);

            // Initialize variables to store data
            let transactions = [];
            let budgets = [];

            try {
                const transactionData = await transactionApi.getTransactions({
                    limit: 7, // For recent transactions widget
                    _timestamp: Date.now() // Ensure fresh data
                });
                console.log("Transaction data loaded:", transactionData);
                transactions = transactionData.transactions || [];
                setRecentTransactions(transactions);
            } catch (txError) {
                console.error("Error loading transactions:", txError);
                setRecentTransactions([]);
            }

            try {
                const budgetData = await budgetApi.getActiveBudgets();
                console.log("Budget data loaded:", budgetData);
                budgets = budgetData || [];
                setActiveBudgets(budgets);
            } catch (budgetError) {
                console.error("Error loading budgets:", budgetError);
                setActiveBudgets([]);
            }

            try {
                const summaryData = await transactionApi.getSpendingSummary(
                    firstDay.toISOString().split('T')[0],
                    lastDay.toISOString().split('T')[0]
                );
                console.log("Summary data loaded:", summaryData);
                setFinancialSummary(summaryData || {
                    income: 0,
                    expenses: 0,
                    balance: 0,
                    categoryBreakdown: []
                });
            } catch (summaryError) {
                console.error("Error loading summary:", summaryError);
                setFinancialSummary({
                    income: 0,
                    expenses: 0,
                    balance: 0,
                    categoryBreakdown: []
                });
            }

            // Determine if we have real financial data
            const hasData = (transactions && transactions.length > 0) || (budgets && budgets.length > 0);
            setHasFinancialData(hasData);

        } catch (error) {
            console.error("Error loading dashboard data:", error);
            toast({
                title: "Error",
                description: "Failed to load dashboard data. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle logout
    const handleLogout = () => {
        logout();
        navigate("/");
    };

    // Toggle sidebar
    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    // Handle create budget
    const handleCreateBudget = () => {
        navigate("/budgets");
    };

    // Handle add transaction
    const handleAddTransaction = () => {
        navigate("/transactions");
    };

    // Handle view all transactions
    const handleViewAllTransactions = () => {
        navigate("/transactions");
    };

    // Handle view all budgets
    const handleViewAllBudgets = () => {
        navigate("/budgets");
    };

    // Handle use sample data (for empty state)
    const handleUseSampleData = () => {
        // For now, just redirect to create their first budget
        navigate("/budgets");
    };

    // Handle refresh data
    const handleRefreshData = () => {
        loadDashboardData();
    };

    // Get transaction icon based on category (helper function)
    const getCategoryIcon = (category: string) => {
        const icons: Record<string, any> = {
            "Housing": Home,
            "Food": Utensils,
            "Shopping": ShoppingBag,
            "Entertainment": Coffee,
            "Education": Book,
        };
        return icons[category] || ShoppingBag;
    };

    // Format currency (helper function)
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Calculate primary budget progress
    const primaryBudget = activeBudgets[0];
    const budgetProgress = primaryBudget ?
        Math.round((primaryBudget.spent / primaryBudget.totalAmount) * 100) : 0;

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar - hidden on mobile */}
            <div
                className={cn(
                    "hidden md:flex md:flex-col md:fixed md:inset-y-0 z-10 border-r transition-all duration-300",
                    sidebarCollapsed ? "md:w-16" : "md:w-64"
                )}
            >
                <div className="flex flex-col h-full">
                    <div className="px-3 py-2">
                        <div className={cn(
                            "flex items-center gap-2 px-2 mb-6",
                            sidebarCollapsed && "justify-center"
                        )}>
                            <div className="h-8 w-8 bg-budgetu-purple rounded-md flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-lg">B</span>
                            </div>
                            {!sidebarCollapsed && <span className="font-bold text-xl">BudgetU</span>}
                        </div>
                        <div className="space-y-1">
                            {!sidebarCollapsed ? (
                                <DashboardNav onLogout={handleLogout} />
                            ) : (
                                <div className="flex flex-col items-center space-y-4 py-4">
                                    <Link
                                        to="/dashboard"
                                        className={cn(
                                            "flex items-center justify-center h-9 w-9 rounded-lg",
                                            location.pathname === "/dashboard"
                                                ? "bg-muted text-primary"
                                                : "text-muted-foreground hover:bg-muted hover:text-primary"
                                        )}
                                    >
                                        <LayoutDashboard className="h-5 w-5" />
                                    </Link>
                                    <Link
                                        to="/budgets"
                                        className={cn(
                                            "flex items-center justify-center h-9 w-9 rounded-lg",
                                            location.pathname === "/budgets"
                                                ? "bg-muted text-primary"
                                                : "text-muted-foreground hover:bg-muted hover:text-primary"
                                        )}
                                    >
                                        <Wallet className="h-5 w-5" />
                                    </Link>
                                    <Link
                                        to="/transactions"
                                        className={cn(
                                            "flex items-center justify-center h-9 w-9 rounded-lg",
                                            location.pathname === "/transactions"
                                                ? "bg-muted text-primary"
                                                : "text-muted-foreground hover:bg-muted hover:text-primary"
                                        )}
                                    >
                                        <Receipt className="h-5 w-5" />
                                    </Link>
                                    <Link
                                        to="#"
                                        className="flex items-center justify-center h-9 w-9 rounded-lg text-muted-foreground opacity-60"
                                    >
                                        <LineChart className="h-5 w-5" />
                                    </Link>
                                    <Link
                                        to="#"
                                        className="flex items-center justify-center h-9 w-9 rounded-lg text-muted-foreground opacity-60"
                                    >
                                        <Goal className="h-5 w-5" />
                                    </Link>

                                    <div className="mt-auto pt-10">
                                        <Link
                                            to="/settings"
                                            className={cn(
                                                "flex items-center justify-center h-9 w-9 rounded-lg",
                                                location.pathname === "/settings"
                                                    ? "bg-muted text-primary"
                                                    : "text-muted-foreground hover:bg-muted hover:text-primary"
                                            )}
                                        >
                                            <Settings className="h-5 w-5" />
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            className="w-full h-9 p-0 mt-4 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-primary"
                                            onClick={handleLogout}
                                        >
                                            <LogOut className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className={cn(
                "flex-1 flex flex-col transition-all duration-300",
                sidebarCollapsed ? "md:ml-16" : "md:ml-64"
            )}>
                <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
                    {/* Mobile menu */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64 p-0">
                            <DashboardNav onLogout={handleLogout} />
                        </SheetContent>
                    </Sheet>

                    {/* Desktop sidebar toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleSidebar}
                        className="hidden md:flex"
                    >
                        {sidebarCollapsed ? (
                            <ChevronRight className="h-5 w-5" />
                        ) : (
                            <ChevronLeft className="h-5 w-5" />
                        )}
                        <span className="sr-only">Toggle sidebar</span>
                    </Button>

                    <div className="flex-1">
                        <h1 className="text-lg font-semibold">Dashboard</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleRefreshData}
                            className="h-8 w-8"
                            title="Refresh data"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-budgetu-purple text-white">
                                    {userInitials}
                                </AvatarFallback>
                            </Avatar>
                            <span className="hidden md:inline font-medium">{userName}</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 px-6 py-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                            <span className="ml-2">Loading dashboard data...</span>
                        </div>
                    ) : hasFinancialData ? (
                        <>
                            {/* Financial Summary Cards */}
                            <div className="grid gap-6 md:grid-cols-3 mb-6">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Total Income</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-green-600">
                                            {formatCurrency(financialSummary.income)}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            This month
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Total Expenses</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-red-600">
                                            {formatCurrency(financialSummary.expenses)}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            This month
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Balance</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className={cn(
                                            "text-2xl font-bold",
                                            financialSummary.balance >= 0 ? "text-green-600" : "text-red-600"
                                        )}>
                                            {formatCurrency(financialSummary.balance)}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Income - Expenses
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Main content grid */}
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {/* Active budget card */}
                                <Card className="lg:col-span-2">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <div>
                                            <CardTitle>Active Budgets</CardTitle>
                                            <CardDescription>
                                                {activeBudgets.length
                                                    ? `You have ${activeBudgets.length} active budget${activeBudgets.length > 1 ? 's' : ''}`
                                                    : 'No active budgets'}
                                            </CardDescription>
                                        </div>
                                        <Button
                                            onClick={handleViewAllBudgets}
                                            variant="outline"
                                            size="sm"
                                            className="h-8"
                                        >
                                            View All
                                        </Button>
                                    </CardHeader>
                                    <CardContent>
                                        {activeBudgets.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center p-8">
                                                <Wallet className="h-12 w-12 text-muted-foreground/60 mb-4" />
                                                <p className="text-center text-muted-foreground">
                                                    You don't have any active budgets.
                                                    <br />
                                                    Create one to start tracking your expenses.
                                                </p>
                                                <Button
                                                    onClick={handleCreateBudget}
                                                    className="mt-4"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Create Budget
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                {activeBudgets.slice(0, 2).map((budget) => (
                                                    <div key={budget._id} className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <div className="font-medium">{budget.name}</div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {formatCurrency(budget.spent)} / {formatCurrency(budget.totalAmount)}
                                                            </div>
                                                        </div>
                                                        <Progress
                                                            value={(budget.spent / budget.totalAmount) * 100}
                                                            className="h-2"
                                                        />
                                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                                            {budget.categories.slice(0, 4).map((category) => (
                                                                <div key={category._id} className="flex items-center space-x-3">
                                                                    <div
                                                                        className="h-4 w-4 rounded-full"
                                                                        style={{ backgroundColor: category.color || "#8b5cf6" }}
                                                                    />
                                                                    <div className="flex-1 flex justify-between items-center">
                                                                        <div className="text-sm">{category.name}</div>
                                                                        <div className="text-xs text-muted-foreground">
                                                                            {Math.round((category.spent / category.amount) * 100)}%
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                                {activeBudgets.length > 2 && (
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full text-xs"
                                                        onClick={handleViewAllBudgets}
                                                    >
                                                        View all {activeBudgets.length} budgets
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Recent transactions card */}
                                <Card className="col-span-1">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <div>
                                            <CardTitle>Recent Transactions</CardTitle>
                                            <CardDescription>
                                                {recentTransactions.length ? 'Your most recent activity' : 'No transactions yet'}
                                            </CardDescription>
                                        </div>
                                        <Button
                                            onClick={handleViewAllTransactions}
                                            variant="outline"
                                            size="sm"
                                            className="h-8"
                                        >
                                            View All
                                        </Button>
                                    </CardHeader>
                                    <CardContent>
                                        {recentTransactions.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center p-8">
                                                <Receipt className="h-12 w-12 text-muted-foreground/60 mb-4" />
                                                <p className="text-center text-muted-foreground">
                                                    You don't have any transactions yet.
                                                    <br />
                                                    Add one to track your spending.
                                                </p>
                                                <Button
                                                    onClick={handleAddTransaction}
                                                    className="mt-4"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Transaction
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {recentTransactions.slice(0, 5).map((transaction) => {
                                                    const Icon = getCategoryIcon(transaction.category);
                                                    const formattedDate = format(new Date(transaction.date), 'dd MMM');

                                                    return (
                                                        <div key={transaction._id} className="flex items-center gap-4">
                                                            <div className={cn(
                                                                "h-10 w-10 rounded-full flex items-center justify-center",
                                                                transaction.isIncome ? "bg-green-100" : "bg-red-100"
                                                            )}>
                                                                {transaction.isIncome ? (
                                                                    <ArrowUpRight className="h-5 w-5 text-green-600" />
                                                                ) : (
                                                                    <ArrowDownRight className="h-5 w-5 text-red-600" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex justify-between">
                                                                    <div className="font-medium">{transaction.description}</div>
                                                                    <div className={transaction.isIncome ? "text-green-600" : "text-red-600"}>
                                                                        {transaction.isIncome ? "+" : "-"}{formatCurrency(transaction.amount)}
                                                                    </div>
                                                                </div>
                                                                <div className="flex justify-between text-sm text-muted-foreground">
                                                                    <div>{transaction.category}</div>
                                                                    <div>{formattedDate}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                {recentTransactions.length > 5 && (
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full text-xs"
                                                        onClick={handleViewAllTransactions}
                                                    >
                                                        View all transactions
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    ) : (
                        <EmptyStateFinancial
                            userName={userName}
                            onCreateBudget={handleCreateBudget}
                            onAddTransaction={handleAddTransaction}
                            onUseSampleData={handleUseSampleData}
                        />
                    )}
                </main>
            </div>
        </div>
    );
};

export default Dashboard; 