import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Search,
    Plus,
    Filter,
    ArrowUpDown,
    CalendarIcon,
    ArrowUp,
    ArrowDown,
    Trash2,
    Edit,
    MoreHorizontal,
    Menu,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Upload,
    Image,
    Loader2,
    X,
    Wallet,
    RefreshCw
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardNav } from "@/components/DashboardNav";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { getUserData, logout, transactionApi, budgetApi } from "@/lib/api";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

// Define Transaction type interface
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
    receiptImage?: string;
    notes?: string;
}

// Define Budget interface for dropdowns
interface BudgetOption {
    _id: string;
    name: string;
    startDate: string;
    endDate: string;
    categories: { name: string; _id?: string }[];
}

const Transactions = () => {
    // Navigation and state hooks
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();

    // User data state
    const [userName, setUserName] = useState("");
    const [userInitials, setUserInitials] = useState("");

    // UI state
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter state
    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
        category: "all",
        minAmount: "",
        maxAmount: "",
        isIncome: "all",
        paymentMethod: "all",
        searchQuery: ""
    });

    // New transaction state
    const [showAddTransactionDialog, setShowAddTransactionDialog] = useState(false);
    const [newTransaction, setNewTransaction] = useState({
        amount: "",
        description: "",
        category: "",
        date: new Date().toISOString().split('T')[0],
        isIncome: false,
        paymentMethod: "cash",
        budgetId: "none",
        location: "",
        receiptImage: "",
        notes: ""
    });

    // File upload state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Budget state
    const [activeBudgets, setActiveBudgets] = useState<BudgetOption[]>([]);

    // Add activeTab state
    const [activeTab, setActiveTab] = useState<'all' | 'expenses' | 'income'>('all');

    // Add financialSummary state
    const [financialSummary, setFinancialSummary] = useState({
        income: 0,
        expenses: 0,
        balance: 0,
        categoryBreakdown: []
    });

    // Check if user is logged in (has token)
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

        // Load transactions from API
        loadTransactions();
        loadCategories();
        loadActiveBudgets();
    }, [navigate]);

    // Load transactions from API
    const loadTransactions = async () => {
        try {
            setIsLoading(true);

            // Create a clean copy of filters - convert "all" to empty strings
            const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
                acc[key] = value === "all" ? "" : value;
                return acc;
            }, {} as any);

            // Fetch fresh data from the server - ensure we don't use any cached data
            console.log("Fetching transactions with filters:", cleanFilters);

            const data = await transactionApi.getTransactions({
                ...cleanFilters,
                _timestamp: Date.now(), // Add timestamp to force fresh data
                limit: 100 // Increase limit to ensure we get all transactions
            });

            console.log("Received transactions:", data);

            if (data && Array.isArray(data.transactions)) {
                setTransactions(data.transactions);
                console.log(`Successfully loaded ${data.transactions.length} transactions`);
            } else if (data && data.transactions) {
                // Handle any unexpected data structure
                setTransactions(data.transactions);
                console.log(`Successfully loaded ${data.transactions.length} transactions`);
            } else {
                console.error("Unexpected data format:", data);
                setTransactions([]);
            }

            // Refresh budgets data too to ensure consistency
            await loadActiveBudgets();
        } catch (error) {
            console.error("Error loading transactions:", error);
            setTransactions([]); // Ensure we have an empty array instead of undefined
            toast({
                title: "Error",
                description: "Failed to load transactions. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Load categories from budgets
    const loadCategories = async () => {
        try {
            const budgets = await budgetApi.getActiveBudgets();
            // Extract unique categories from budgets
            const budgetCategories = budgets.flatMap(budget =>
                budget.categories.map(category => category.name)
            );
            // Add some common categories
            const commonCategories = [
                "Food", "Groceries", "Rent", "Transportation",
                "Entertainment", "Shopping", "Education", "Healthcare",
                "Utilities", "Salary", "Gift", "Other"
            ];

            // Combine and deduplicate
            const allCategories = [...new Set([...budgetCategories, ...commonCategories])];
            setCategories(allCategories);
        } catch (error) {
            console.error("Error loading categories:", error);
        }
    };

    // Load active budgets for selection
    const loadActiveBudgets = async () => {
        try {
            const budgets = await budgetApi.getActiveBudgets();
            setActiveBudgets(budgets);
        } catch (error) {
            console.error("Error loading active budgets:", error);
        }
    };

    // Handle filter input changes
    const handleFilterChange = (name: string, value: string) => {
        setFilters({
            ...filters,
            [name]: value === "all" ? "" : value  // Convert "all" to empty string for API queries
        });
    };

    // Apply filters and reload transactions
    const handleApplyFilters = () => {
        loadTransactions();
    };

    // Reset all filters
    const handleResetFilters = () => {
        setFilters({
            startDate: "",
            endDate: "",
            category: "all",
            minAmount: "",
            maxAmount: "",
            isIncome: "all",
            paymentMethod: "all",
            searchQuery: ""
        });
        // Reload with cleared filters
        setTimeout(loadTransactions, 0);
    };

    // Handle transaction form input changes
    const handleTransactionInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const target = e.target as HTMLInputElement;
            setNewTransaction({
                ...newTransaction,
                [name]: target.checked
            });
        } else {
            setNewTransaction({
                ...newTransaction,
                [name]: value
            });
        }
    };

    // Handle dropdown select changes
    const handleSelectChange = (name: string, value: string) => {
        setNewTransaction({
            ...newTransaction,
            [name]: value
        });
    };

    // Handle date changes
    const handleDateChange = (date: Date | undefined) => {
        if (date) {
            setNewTransaction({
                ...newTransaction,
                date: date.toISOString().split('T')[0]
            });
        }
    };

    // Handle file upload for receipt
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    // Upload receipt image and get URL
    const uploadReceipt = async (): Promise<string | null> => {
        if (!selectedFile) return null;

        try {
            setIsUploading(true);
            const response = await transactionApi.uploadReceiptImage(selectedFile);
            return response.imageUrl;
        } catch (error) {
            console.error("Error uploading receipt:", error);
            toast({
                title: "Upload Failed",
                description: "Could not upload receipt image. Please try again.",
                variant: "destructive",
            });
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    // Handle category change based on budget selection
    const handleBudgetChange = (budgetId: string) => {
        // Reset category when budget changes
        setNewTransaction({
            ...newTransaction,
            budgetId,
            category: ""
        });
    };

    // Get available categories based on selected budget
    const getAvailableCategories = () => {
        if (!newTransaction.budgetId || newTransaction.budgetId === "none") {
            return categories;
        }

        const selectedBudget = activeBudgets.find(budget => budget._id === newTransaction.budgetId);
        if (selectedBudget) {
            return selectedBudget.categories.map(cat => cat.name);
        }

        return categories;
    };

    // Save new transaction
    const handleSaveTransaction = async () => {
        try {
            setIsSubmitting(true);

            // Upload receipt if selected
            let receiptUrl = null;
            if (selectedFile) {
                receiptUrl = await uploadReceipt();
            }

            // Create the transaction data object
            const transactionData = {
                amount: parseFloat(newTransaction.amount),
                description: newTransaction.description,
                category: newTransaction.category,
                date: newTransaction.date,
                isIncome: newTransaction.isIncome,
                paymentMethod: newTransaction.paymentMethod,
                budgetId: newTransaction.budgetId && newTransaction.budgetId !== "none" ? newTransaction.budgetId : undefined,
                location: newTransaction.location,
                receiptImage: receiptUrl || undefined,
                notes: newTransaction.notes
            };

            console.log("Creating new transaction:", transactionData);

            // Create the transaction
            const createdTransaction = await transactionApi.createTransaction(transactionData);
            console.log("Transaction created:", createdTransaction);

            // Reset form and close dialog
            setNewTransaction({
                amount: "",
                description: "",
                category: "",
                date: new Date().toISOString().split('T')[0],
                isIncome: false,
                paymentMethod: "cash",
                budgetId: "none",
                location: "",
                receiptImage: "",
                notes: ""
            });
            setSelectedFile(null);
            setShowAddTransactionDialog(false);

            // Force clear any filters that might prevent the new transaction from appearing
            setFilters({
                startDate: "",
                endDate: "",
                category: "all",
                minAmount: "",
                maxAmount: "",
                isIncome: "all",
                paymentMethod: "all",
                searchQuery: ""
            });

            // Comprehensive data refresh to ensure consistency
            await Promise.all([
                // Reload transactions to show the new one
                loadTransactions(),
                // Reload active budgets to refresh their data
                loadActiveBudgets(),
                // Reload categories (might have new ones from budget updates)
                loadCategories()
            ]);

            // Show appropriate toast message
            if (!newTransaction.isIncome && newTransaction.budgetId && newTransaction.budgetId !== "none") {
                toast({
                    title: "Transaction & Budget Updated",
                    description: `Transaction added and budget amounts recalculated.`,
                });
            } else {
                toast({
                    title: "Success",
                    description: "Transaction added successfully.",
                });
            }
        } catch (error) {
            console.error("Error creating transaction:", error);
            toast({
                title: "Error",
                description: "Failed to create transaction. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete a transaction
    const handleDeleteTransaction = async (id: string) => {
        try {
            // Find the transaction to check if it's linked to a budget
            const transactionToDelete = transactions.find(t => t._id === id);
            const isBudgetLinked = transactionToDelete && !transactionToDelete.isIncome && transactionToDelete.budgetId;

            // Delete the transaction
            await transactionApi.deleteTransaction(id);

            // Perform complete data refresh to ensure consistency
            await Promise.all([
                loadTransactions(),
                // If transaction was linked to a budget, refresh budget data too
                isBudgetLinked ? loadActiveBudgets() : Promise.resolve()
            ]);

            if (isBudgetLinked) {
                toast({
                    title: "Transaction Deleted",
                    description: "Transaction deleted and budget amounts updated.",
                });
            } else {
                toast({
                    title: "Success",
                    description: "Transaction deleted successfully.",
                });
            }
        } catch (error) {
            console.error("Error deleting transaction:", error);
            toast({
                title: "Error",
                description: "Failed to delete transaction. Please try again.",
                variant: "destructive",
            });
        }
    };

    // Toggle sidebar
    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    // Handle logout
    const handleLogout = () => {
        logout();
        navigate("/");
    };

    // Add a helper function to find budget name based on ID
    const getBudgetNameById = (budgetId: string | undefined): string => {
        if (!budgetId) return "";
        const budget = activeBudgets.find(b => b._id === budgetId);
        return budget ? budget.name : "";
    };

    // Modify the useEffect for refreshing data to use a more reasonable interval and reduce performance impact
    // Update the refresh interval to be less aggressive
    useEffect(() => {
        // Create an interval to refresh transactions data every 60 seconds instead of 15
        // This will be less taxing on performance while still keeping data reasonably fresh
        const intervalId = setInterval(() => {
            if (document.visibilityState === 'visible' && !isLoading) {
                // Only refresh if we're not already loading data
                loadTransactions();
            }
        }, 60000); // Change from 15000 to 60000 (1 minute)

        // Also reload when the page becomes visible, but only if it's been at least 5 seconds since last load
        let lastLoadTime = Date.now();
        const handleVisibilityChange = () => {
            const now = Date.now();
            if (document.visibilityState === 'visible' && now - lastLoadTime > 5000 && !isLoading) {
                loadTransactions();
                lastLoadTime = now;
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Clean up
        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [filters, isLoading]); // Re-establish the interval when filters or loading state changes

    // Handle tab change
    const handleTabChange = (value: string) => {
        setActiveTab(value as 'all' | 'expenses' | 'income');

        // Update the filters based on tab selection
        if (value === 'all') {
            handleFilterChange('isIncome', 'all');
        } else if (value === 'expenses') {
            handleFilterChange('isIncome', 'false');
        } else if (value === 'income') {
            handleFilterChange('isIncome', 'true');
        }

        // Apply the filters
        setTimeout(() => {
            loadTransactions();
        }, 0);
    };

    // Initial data load in Dashboard component
    useEffect(() => {
        // Fetch summary data for dashboard
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                // Get data for the current month
                const currentDate = new Date();
                const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

                // Fetch data in parallel for better performance
                const [transactionData, budgetData, summaryData] = await Promise.all([
                    transactionApi.getTransactions({
                        startDate: firstDay.toISOString().split('T')[0],
                        endDate: lastDay.toISOString().split('T')[0],
                        limit: 7 // For recent transactions widget
                    }),
                    budgetApi.getActiveBudgets(),
                    transactionApi.getSpendingSummary(
                        firstDay.toISOString().split('T')[0],
                        lastDay.toISOString().split('T')[0]
                    )
                ]);

                setTransactions(transactionData.transactions);
                setActiveBudgets(budgetData);
                setFinancialSummary(summaryData);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                toast({
                    title: "Error",
                    description: "Failed to load dashboard data. Please try again.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

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
                                    {/* Collapsed nav icons only */}
                                    <Link
                                        to="/dashboard"
                                        className={cn(
                                            "flex items-center justify-center h-9 w-9 rounded-lg",
                                            location.pathname === "/dashboard"
                                                ? "bg-muted text-primary"
                                                : "text-muted-foreground hover:bg-muted hover:text-primary"
                                        )}
                                    >
                                        <Menu className="h-5 w-5" />
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
                                        <ArrowUpDown className="h-5 w-5" />
                                    </Link>
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
                        <h1 className="text-lg font-semibold">Transactions</h1>
                    </div>

                    <div className="flex items-center gap-4">
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

                <main className="flex-1 p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold">My Transactions</h2>
                            <p className="text-muted-foreground">Track and manage your expenses and income</p>
                        </div>
                        <Button className="flex items-center gap-2" onClick={() => setShowAddTransactionDialog(true)}>
                            <Plus className="h-4 w-4" />
                            Add Transaction
                        </Button>
                    </div>

                    {/* Filtering and search bar */}
                    <div className="mb-6 space-y-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 flex bg-muted rounded-lg">
                                <div className="flex items-center px-3 text-muted-foreground">
                                    <Search className="h-4 w-4" />
                                </div>
                                <Input
                                    type="text"
                                    placeholder="Search transactions..."
                                    className="flex-1 border-0 bg-transparent"
                                    value={filters.searchQuery}
                                    onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="gap-2">
                                            <Filter className="h-4 w-4" />
                                            <span className="hidden sm:inline">Filters</span>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80 p-4">
                                        <div className="space-y-4">
                                            <h4 className="font-medium">Filter Transactions</h4>

                                            <div className="space-y-2">
                                                <Label htmlFor="date-range">Date Range</Label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <Label htmlFor="start-date" className="text-xs">From</Label>
                                                        <Input
                                                            id="start-date"
                                                            type="date"
                                                            value={filters.startDate}
                                                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="end-date" className="text-xs">To</Label>
                                                        <Input
                                                            id="end-date"
                                                            type="date"
                                                            value={filters.endDate}
                                                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="category">Category</Label>
                                                <Select
                                                    value={filters.category}
                                                    onValueChange={(value) => handleFilterChange('category', value)}
                                                >
                                                    <SelectTrigger id="category">
                                                        <SelectValue placeholder="All Categories" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Categories</SelectItem>
                                                        {categories.map((category) => (
                                                            <SelectItem key={category} value={category}>
                                                                {category}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="amount-range">Amount Range (₹)</Label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <Label htmlFor="min-amount" className="text-xs">Min</Label>
                                                        <Input
                                                            id="min-amount"
                                                            type="number"
                                                            placeholder="0"
                                                            value={filters.minAmount}
                                                            onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="max-amount" className="text-xs">Max</Label>
                                                        <Input
                                                            id="max-amount"
                                                            type="number"
                                                            placeholder="Any"
                                                            value={filters.maxAmount}
                                                            onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="transaction-type">Transaction Type</Label>
                                                <Select
                                                    value={filters.isIncome}
                                                    onValueChange={(value) => handleFilterChange('isIncome', value)}
                                                >
                                                    <SelectTrigger id="transaction-type">
                                                        <SelectValue placeholder="All Transactions" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Transactions</SelectItem>
                                                        <SelectItem value="false">Expenses</SelectItem>
                                                        <SelectItem value="true">Income</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="payment-method">Payment Method</Label>
                                                <Select
                                                    value={filters.paymentMethod}
                                                    onValueChange={(value) => handleFilterChange('paymentMethod', value)}
                                                >
                                                    <SelectTrigger id="payment-method">
                                                        <SelectValue placeholder="All Methods" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Methods</SelectItem>
                                                        <SelectItem value="cash">Cash</SelectItem>
                                                        <SelectItem value="credit_card">Credit Card</SelectItem>
                                                        <SelectItem value="debit_card">Debit Card</SelectItem>
                                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="flex justify-between pt-2">
                                                <Button variant="outline" onClick={handleResetFilters}>Reset</Button>
                                                <Button onClick={handleApplyFilters}>Apply Filters</Button>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>

                                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-auto">
                                    <TabsList>
                                        <TabsTrigger value="all">All</TabsTrigger>
                                        <TabsTrigger value="expenses">Expenses</TabsTrigger>
                                        <TabsTrigger value="income">Income</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                        </div>
                    </div>

                    {/* Transaction list */}
                    <Card>
                        <CardHeader className="px-6 py-4">
                            <div className="flex justify-between items-center">
                                <CardTitle>Transaction History</CardTitle>
                                <div className="flex items-center gap-2">
                                    <div className="text-sm text-muted-foreground">
                                        {transactions.length} {transactions.length === 1 ? 'transaction' : 'transactions'}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => {
                                            handleResetFilters();
                                            loadTransactions();
                                        }}
                                        title="Refresh transactions"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-64">
                                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                    <span className="ml-2">Loading transactions...</span>
                                </div>
                            ) : transactions.length === 0 ? (
                                <div className="text-center p-12">
                                    <div className="mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                                        <ArrowUpDown className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-medium mb-2">No transactions found</h3>
                                    <p className="text-muted-foreground mb-6">
                                        {filters.searchQuery || filters.category || filters.startDate ?
                                            "Try adjusting your filters to see more results" :
                                            "Add your first transaction to get started"
                                        }
                                    </p>
                                    <Button onClick={() => setShowAddTransactionDialog(true)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Transaction
                                    </Button>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {transactions.map((transaction) => {
                                        const dateObj = new Date(transaction.date);
                                        const formattedDate = format(dateObj, 'PPP');

                                        return (
                                            <div key={transaction._id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                                                <div className="flex items-start gap-3">
                                                    <div className={cn(
                                                        "h-10 w-10 rounded-full flex items-center justify-center",
                                                        transaction.isIncome ? "bg-green-100" : "bg-red-100"
                                                    )}>
                                                        {transaction.isIncome ? (
                                                            <ArrowUp className="h-5 w-5 text-green-600" />
                                                        ) : (
                                                            <ArrowDown className="h-5 w-5 text-red-600" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{transaction.description}</div>
                                                        <div className="text-sm text-muted-foreground flex flex-wrap gap-x-3 mt-1">
                                                            <span>{formattedDate}</span>
                                                            <Badge variant="outline">{transaction.category}</Badge>
                                                            {transaction.budgetId && !transaction.isIncome && (
                                                                <Badge variant="outline" className="bg-budgetu-purple/10 text-budgetu-purple border-budgetu-purple/20">
                                                                    <Wallet className="h-3 w-3 mr-1" />
                                                                    {getBudgetNameById(transaction.budgetId)}
                                                                </Badge>
                                                            )}
                                                            {transaction.location && (
                                                                <span className="flex items-center">
                                                                    <MapPin className="h-3 w-3 mr-1" />
                                                                    {transaction.location}
                                                                </span>
                                                            )}
                                                            {transaction.receiptImage && (
                                                                <span className="flex items-center text-blue-600">
                                                                    <Image className="h-3 w-3 mr-1" />
                                                                    Receipt
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "text-right",
                                                        transaction.isIncome ? "text-green-600" : "text-red-600"
                                                    )}>
                                                        <div className="font-medium">
                                                            {transaction.isIncome ? "+" : "-"}₹{transaction.amount.toLocaleString()}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground capitalize">
                                                            {transaction.paymentMethod.replace('_', ' ')}
                                                        </div>
                                                    </div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem className="cursor-pointer">
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                <span>Edit</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="cursor-pointer text-red-500"
                                                                onClick={() => handleDeleteTransaction(transaction._id)}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                <span>Delete</span>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </main>
            </div>

            {/* Add Transaction Dialog */}
            <Dialog open={showAddTransactionDialog} onOpenChange={setShowAddTransactionDialog}>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="sticky top-0 bg-background z-10 pb-4">
                        <DialogTitle>Add New Transaction</DialogTitle>
                        <DialogDescription>
                            Record your income or expenses to keep track of your finances.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="flex items-center gap-4">
                            <Label
                                htmlFor="transaction-type"
                                className="text-right font-normal"
                            >
                                Type
                            </Label>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="transaction-type"
                                    checked={newTransaction.isIncome}
                                    onCheckedChange={(checked) => {
                                        setNewTransaction({
                                            ...newTransaction,
                                            isIncome: checked === true
                                        });
                                    }}
                                />
                                <label
                                    htmlFor="transaction-type"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Income
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="amount">Amount (₹)</Label>
                                <Input
                                    id="amount"
                                    name="amount"
                                    type="number"
                                    placeholder="0.00"
                                    value={newTransaction.amount}
                                    onChange={handleTransactionInputChange}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    value={newTransaction.category}
                                    onValueChange={(value) => handleSelectChange('category', value)}
                                >
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getAvailableCategories().map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                name="description"
                                placeholder="e.g. Grocery shopping, Dinner out, Salary"
                                value={newTransaction.description}
                                onChange={handleTransactionInputChange}
                            />
                        </div>

                        {!newTransaction.isIncome && (
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="budget">Budget (Optional)</Label>
                                    <Select
                                        value={newTransaction.budgetId}
                                        onValueChange={handleBudgetChange}
                                    >
                                        <SelectTrigger id="budget">
                                            <SelectValue placeholder="Select a budget" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No specific budget</SelectItem>
                                            {activeBudgets.map((budget) => (
                                                <SelectItem key={budget._id} value={budget._id}>
                                                    {budget.name} ({format(new Date(budget.startDate), "MMM dd")} - {format(new Date(budget.endDate), "MMM dd")})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        {newTransaction.budgetId && newTransaction.budgetId !== "none"
                                            ? "This expense will be deducted from the selected budget."
                                            : "Select a budget to track this expense against your budget."}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="transaction-date">Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !newTransaction.date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {newTransaction.date ? format(new Date(newTransaction.date), "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={newTransaction.date ? new Date(newTransaction.date) : undefined}
                                            onSelect={handleDateChange}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="payment-method">Payment Method</Label>
                                <Select
                                    value={newTransaction.paymentMethod}
                                    onValueChange={(value) => handleSelectChange('paymentMethod', value)}
                                >
                                    <SelectTrigger id="payment-method">
                                        <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="credit_card">Credit Card</SelectItem>
                                        <SelectItem value="debit_card">Debit Card</SelectItem>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="location">Location (Optional)</Label>
                            <Input
                                id="location"
                                name="location"
                                placeholder="e.g. Grocery Store, Online, Office"
                                value={newTransaction.location}
                                onChange={handleTransactionInputChange}
                            />
                        </div>

                        <div className="grid gap-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="receipt">Receipt Photo (Optional)</Label>
                                {selectedFile && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedFile(null)}
                                        className="h-7 py-0 px-2"
                                    >
                                        <X className="h-3 w-3 mr-1" /> Remove
                                    </Button>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <Label
                                        htmlFor="receipt-upload"
                                        className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-md cursor-pointer bg-muted/50 hover:bg-muted"
                                    >
                                        <div className="flex flex-col items-center justify-center pt-2 pb-2">
                                            <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                                            <p className="text-xs text-muted-foreground">
                                                {selectedFile ? selectedFile.name : "Click to upload receipt"}
                                            </p>
                                        </div>
                                        <Input
                                            id="receipt-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </Label>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                name="notes"
                                placeholder="Any additional information about this transaction"
                                value={newTransaction.notes}
                                onChange={handleTransactionInputChange}
                                className="resize-none"
                                rows={2}
                            />
                        </div>
                    </div>
                    <DialogFooter className="sticky bottom-0 bg-background pt-4 mt-2">
                        <Button variant="outline" onClick={() => setShowAddTransactionDialog(false)}>Cancel</Button>
                        <Button
                            onClick={handleSaveTransaction}
                            disabled={
                                !newTransaction.amount ||
                                !newTransaction.description ||
                                !newTransaction.category ||
                                isSubmitting ||
                                isUploading
                            }
                        >
                            {(isSubmitting || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? "Saving..." : isUploading ? "Uploading..." : "Save Transaction"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Transactions; 