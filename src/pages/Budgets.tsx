import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Plus,
    Wallet,
    Calendar,
    MoreHorizontal,
    PieChart,
    Menu,
    ChevronLeft,
    ChevronRight,
    Edit,
    Trash2,
    ArrowUpDown,
    Check,
    X,
    Loader2
} from "lucide-react";
import { getUserData, logout, budgetApi } from "@/lib/api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DashboardNav } from "@/components/DashboardNav";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

// Define Budget type interface
interface Category {
    _id?: string;
    name: string;
    amount: number;
    spent: number;
    color: string;
    icon?: string;
    isEssential?: boolean;
}

interface Budget {
    _id: string;
    name: string;
    totalAmount: number;
    spent: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    isRecurring?: boolean;
    recurringPeriod?: string;
    categories: Category[];
}

const Budgets = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [userName, setUserName] = useState("");
    const [userInitials, setUserInitials] = useState("");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState("active");
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [showCreateBudgetDialog, setShowCreateBudgetDialog] = useState(false);
    const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
    const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [budgetCreationStep, setBudgetCreationStep] = useState(1); // Step 1: Budget details, Step 2: Categories
    const [newBudgetData, setNewBudgetData] = useState({
        name: "",
        totalAmount: "",
        startDate: "",
        endDate: ""
    });
    const [newCategoryData, setNewCategoryData] = useState({
        name: "",
        amount: "",
        color: "#4338ca",
        icon: "dollar-sign",
        isEssential: false
    });
    const [budgetCategories, setBudgetCategories] = useState<Category[]>([]);
    const [tempBudgetId, setTempBudgetId] = useState<string | null>(null);

    // Load budgets
    const loadBudgets = async () => {
        try {
            setIsLoading(true);
            const data = await budgetApi.getBudgets();
            setBudgets(data);
        } catch (error) {
            console.error("Error loading budgets:", error);
            toast({
                title: "Error",
                description: "Failed to load budgets. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

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

        // Load budgets from API
        loadBudgets();
    }, [navigate]);

    // Reload budgets when user navigates back to this page
    useEffect(() => {
        // Create an interval to refresh budgets data every 10 seconds
        // This ensures that if transactions are added, the budget cards will update
        const intervalId = setInterval(() => {
            if (document.visibilityState === 'visible') {
                loadBudgets();
            }
        }, 10000);

        // Also reload when the page becomes visible
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                loadBudgets();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Clean up
        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // Handle logout
    const handleLogout = () => {
        logout();
        navigate("/");
    };

    // Toggle sidebar
    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    // Handle create budget dialog
    const handleOpenCreateBudget = () => {
        setShowCreateBudgetDialog(true);
        setBudgetCreationStep(1);
        setBudgetCategories([]);
        setTempBudgetId(null);
        setNewBudgetData({
            name: "",
            totalAmount: "",
            startDate: "",
            endDate: ""
        });
    };

    // Handle input change for new budget
    const handleBudgetInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewBudgetData({
            ...newBudgetData,
            [name]: value
        });
    };

    // Handle save new budget (Step 1)
    const handleSaveNewBudget = async () => {
        try {
            setIsSubmitting(true);

            const newBudget = await budgetApi.createBudget({
                name: newBudgetData.name,
                totalAmount: parseFloat(newBudgetData.totalAmount),
                startDate: newBudgetData.startDate,
                endDate: newBudgetData.endDate,
                categories: [] // We'll add categories in step 2
            });

            // Store the budget ID for adding categories
            setTempBudgetId(newBudget._id);

            // Set initial empty categories array
            setBudgetCategories([]);

            // Move to step 2 - category creation
            setBudgetCreationStep(2);

            toast({
                title: "Budget created",
                description: "Now let's add some spending categories.",
            });
        } catch (error) {
            console.error("Error creating budget:", error);
            toast({
                title: "Error",
                description: "Failed to create budget. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle finishing budget creation
    const handleFinishBudgetCreation = async () => {
        setShowCreateBudgetDialog(false);
        setBudgetCreationStep(1);
        setTempBudgetId(null);
        setBudgetCategories([]);

        // Refresh budgets list to show the new budget with categories
        await loadBudgets();

        toast({
            title: "Success",
            description: "Budget created successfully with categories.",
        });
    };

    // Handle delete budget
    const handleDeleteBudget = async (id: string) => {
        try {
            await budgetApi.deleteBudget(id);
            // Remove budget from state
            setBudgets(budgets.filter(budget => budget._id !== id));
            toast({
                title: "Success",
                description: "Budget deleted successfully.",
            });
        } catch (error) {
            console.error("Error deleting budget:", error);
            toast({
                title: "Error",
                description: "Failed to delete budget. Please try again.",
                variant: "destructive",
            });
        }
    };

    // Calculate whether a form is valid
    const isFormValid = () => {
        return (
            newBudgetData.name.trim() !== "" &&
            newBudgetData.totalAmount !== "" &&
            !isNaN(parseFloat(newBudgetData.totalAmount)) &&
            parseFloat(newBudgetData.totalAmount) > 0 &&
            newBudgetData.startDate !== "" &&
            newBudgetData.endDate !== ""
        );
    };

    // Calculate whether the category form is valid
    const isCategoryFormValid = () => {
        const totalBudgetAmount = parseFloat(newBudgetData.totalAmount);
        const categoryAmount = parseFloat(newCategoryData.amount);
        const alreadyAllocated = budgetCategories.reduce((sum, cat) => sum + cat.amount, 0);
        const remainingToAllocate = totalBudgetAmount - alreadyAllocated;

        return (
            newCategoryData.name.trim() !== "" &&
            newCategoryData.amount !== "" &&
            !isNaN(categoryAmount) &&
            categoryAmount > 0 &&
            categoryAmount <= remainingToAllocate
        );
    };

    // Calculate remaining amount to allocate
    const calculateRemainingAmount = () => {
        const totalBudgetAmount = parseFloat(newBudgetData.totalAmount);
        const alreadyAllocated = budgetCategories.reduce((sum, cat) => sum + cat.amount, 0);
        return totalBudgetAmount - alreadyAllocated;
    };

    // Open the add category dialog
    const handleOpenAddCategory = (budgetId: string) => {
        setSelectedBudgetId(budgetId);
        setShowAddCategoryDialog(true);
    };

    // Handle category input change
    const handleCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setNewCategoryData({
            ...newCategoryData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    // Handle save new category
    const handleSaveNewCategory = async () => {
        if (!selectedBudgetId) return;

        try {
            setIsSubmitting(true);

            await budgetApi.addBudgetCategory(selectedBudgetId, {
                name: newCategoryData.name,
                amount: parseFloat(newCategoryData.amount),
                color: newCategoryData.color,
                icon: newCategoryData.icon,
                isEssential: newCategoryData.isEssential
            });

            // Reset form data
            setNewCategoryData({
                name: "",
                amount: "",
                color: "#4338ca",
                icon: "dollar-sign",
                isEssential: false
            });

            // Close the dialog
            setShowAddCategoryDialog(false);

            // Refresh budgets to show the new category
            await loadBudgets();

            toast({
                title: "Success",
                description: "Category added successfully.",
            });
        } catch (error) {
            console.error("Error adding category:", error);
            toast({
                title: "Error",
                description: "Failed to add category. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper to format dates
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    // Filter budgets based on active tab
    const filteredBudgets = budgets.filter(budget =>
        activeTab === "active" ? budget.isActive : !budget.isActive
    );

    // Add temp category for new budget
    const handleAddTempCategory = () => {
        if (!isCategoryFormValid()) return;

        const categoryAmount = parseFloat(newCategoryData.amount);
        const remainingAmount = calculateRemainingAmount();

        // Double-check to ensure we don't exceed the budget
        if (categoryAmount > remainingAmount) {
            toast({
                title: "Invalid amount",
                description: `Category amount exceeds remaining budget by ₹${(categoryAmount - remainingAmount).toLocaleString()}`,
                variant: "destructive",
            });
            return;
        }

        // Add category to temporary list
        setBudgetCategories([
            ...budgetCategories,
            {
                name: newCategoryData.name,
                amount: categoryAmount,
                spent: 0,
                color: newCategoryData.color,
                icon: newCategoryData.icon || "dollar-sign",
                isEssential: newCategoryData.isEssential
            }
        ]);

        // Reset category form
        setNewCategoryData({
            name: "",
            amount: "",
            color: "#" + Math.floor(Math.random() * 16777215).toString(16), // Random color
            icon: "dollar-sign",
            isEssential: false
        });
    };

    // Remove temp category 
    const handleRemoveTempCategory = (index: number) => {
        setBudgetCategories(budgetCategories.filter((_, i) => i !== index));
    };

    // Save categories to budget
    const handleSaveCategories = async () => {
        if (!tempBudgetId) return;

        try {
            setIsSubmitting(true);

            // For each category in budgetCategories, add it to the budget
            for (const category of budgetCategories) {
                await budgetApi.addBudgetCategory(tempBudgetId, {
                    name: category.name,
                    amount: category.amount,
                    color: category.color,
                    icon: category.icon || "dollar-sign",
                    isEssential: !!category.isEssential
                });
            }

            // Finish budget creation
            handleFinishBudgetCreation();

        } catch (error) {
            console.error("Error adding categories:", error);
            toast({
                title: "Error",
                description: "Failed to add categories. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

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
                        <h1 className="text-lg font-semibold">Budget Management</h1>
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
                            <h2 className="text-2xl font-bold">My Budgets</h2>
                            <p className="text-muted-foreground">Manage and track your monthly budgets</p>
                        </div>
                        <Button className="flex items-center gap-2" onClick={handleOpenCreateBudget}>
                            <Plus className="h-4 w-4" />
                            Create New Budget
                        </Button>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                        <TabsList>
                            <TabsTrigger value="active">Active Budgets</TabsTrigger>
                            <TabsTrigger value="past">Past Budgets</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                            <span className="ml-2">Loading budgets...</span>
                        </div>
                    ) : filteredBudgets.length === 0 ? (
                        <Card className="text-center p-8">
                            <CardContent className="pt-10 pb-10">
                                <div className="mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                                    <Wallet className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-medium mb-2">No {activeTab} budgets</h3>
                                <p className="text-muted-foreground mb-6">
                                    {activeTab === "active"
                                        ? "Create a new budget to start tracking your spending"
                                        : "Your past budgets will appear here"
                                    }
                                </p>
                                {activeTab === "active" && (
                                    <Button onClick={handleOpenCreateBudget}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create New Budget
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredBudgets.map((budget) => {
                                const progress = budget.spent && budget.totalAmount
                                    ? Math.round((budget.spent / budget.totalAmount) * 100)
                                    : 0;
                                let progressColor = "bg-green-500";
                                if (progress > 90) progressColor = "bg-red-500";
                                else if (progress > 75) progressColor = "bg-yellow-500";

                                return (
                                    <Card key={budget._id} className="overflow-hidden">
                                        <CardHeader className="pb-2 flex flex-row items-start justify-between">
                                            <div>
                                                <CardTitle>{budget.name}</CardTitle>
                                                <CardDescription className="flex items-center gap-2 mt-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <span>
                                                        {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
                                                    </span>
                                                </CardDescription>
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
                                                        <span>Edit Budget</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="cursor-pointer"
                                                        onClick={() => handleOpenAddCategory(budget._id)}
                                                    >
                                                        <PieChart className="mr-2 h-4 w-4" />
                                                        <span>Add Category</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="cursor-pointer text-red-500"
                                                        onClick={() => handleDeleteBudget(budget._id)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        <span>Delete Budget</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="text-sm font-medium">Total Budget</div>
                                                <div className="text-sm">₹{(budget.totalAmount || 0).toLocaleString()}</div>
                                            </div>

                                            <div className="flex justify-between items-center mb-1">
                                                <div className="text-sm text-muted-foreground">Spent</div>
                                                <div className="text-sm">₹{(budget.spent || 0).toLocaleString()} <span className="text-muted-foreground">({progress}%)</span></div>
                                            </div>

                                            <Progress value={progress} className={`h-2 mb-4 ${progressColor}`} />

                                            {/* Calculate unallocated amount */}
                                            {(() => {
                                                const totalAllocated = (budget.categories || []).reduce((sum, cat) => sum + (cat.amount || 0), 0);
                                                const unallocated = (budget.totalAmount || 0) - totalAllocated;

                                                if (unallocated > 0) {
                                                    return (
                                                        <div className="flex justify-between items-center mb-4 text-sm bg-muted p-2 rounded-md">
                                                            <div className="font-medium">Unallocated Budget</div>
                                                            <div className="text-amber-600 font-medium">₹{unallocated.toLocaleString()}</div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}

                                            <div className="space-y-3 mt-6">
                                                <h4 className="text-sm font-medium mb-2">Top Categories</h4>
                                                {(budget.categories || []).length > 0 ? (
                                                    <>
                                                        {(budget.categories || []).slice(0, 3).map((category, index) => (
                                                            <div key={index} className="flex items-center justify-between text-sm">
                                                                <div className="flex items-center">
                                                                    <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: category.color }}></div>
                                                                    <span>{category.name}</span>
                                                                </div>
                                                                <span>
                                                                    ₹{(category.spent || 0).toLocaleString()} / ₹{(category.amount || 0).toLocaleString()}
                                                                </span>
                                                            </div>
                                                        ))}

                                                        {/* Show unallocated as a "category" if there is any */}
                                                        {(() => {
                                                            const totalAllocated = (budget.categories || []).reduce((sum, cat) => sum + (cat.amount || 0), 0);
                                                            const unallocated = (budget.totalAmount || 0) - totalAllocated;

                                                            if (unallocated > 0 && (budget.categories || []).length <= 3) {
                                                                return (
                                                                    <div className="flex items-center justify-between text-sm">
                                                                        <div className="flex items-center">
                                                                            <div className="h-3 w-3 rounded-full mr-2 bg-amber-400"></div>
                                                                            <span>Unallocated</span>
                                                                        </div>
                                                                        <span>₹{unallocated.toLocaleString()}</span>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                    </>
                                                ) : (
                                                    <div className="text-sm text-muted-foreground">No categories defined</div>
                                                )}
                                                {(budget.categories || []).length > 3 && (
                                                    <Button variant="link" className="text-xs h-auto p-0">
                                                        View all {(budget.categories || []).length} categories
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                        <CardFooter className="border-t bg-muted/50 py-3">
                                            <div className="w-full flex justify-between items-center">
                                                <Badge variant={budget.isActive ? "default" : "outline"}>
                                                    {budget.isActive ? "Active" : "Completed"}
                                                </Badge>

                                                {/* Check if there's unallocated budget */}
                                                {(() => {
                                                    const totalAllocated = (budget.categories || []).reduce((sum, cat) => sum + (cat.amount || 0), 0);
                                                    const unallocated = (budget.totalAmount || 0) - totalAllocated;

                                                    if (unallocated > 0 && budget.isActive) {
                                                        return (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleOpenAddCategory(budget._id)}
                                                                className="gap-1"
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                                Allocate Remaining
                                                            </Button>
                                                        );
                                                    } else {
                                                        return (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => navigate(`/budgets/${budget._id}`)}
                                                            >
                                                                View Details
                                                            </Button>
                                                        );
                                                    }
                                                })()}
                                            </div>
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>

            {/* Create Budget Dialog */}
            <Dialog open={showCreateBudgetDialog} onOpenChange={setShowCreateBudgetDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {budgetCreationStep === 1 ? "Create New Budget" : "Add Budget Categories"}
                        </DialogTitle>
                        <DialogDescription>
                            {budgetCreationStep === 1
                                ? "Set up your budget details. You'll be able to add categories in the next step."
                                : "Add categories to track specific expenses in your budget."}
                        </DialogDescription>
                    </DialogHeader>

                    {budgetCreationStep === 1 ? (
                        /* Step 1: Budget Details */
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Budget Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="e.g. November 2023"
                                    value={newBudgetData.name}
                                    onChange={handleBudgetInputChange}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="totalAmount">Total Budget Amount (₹)</Label>
                                <Input
                                    id="totalAmount"
                                    name="totalAmount"
                                    type="number"
                                    placeholder="e.g. 12000"
                                    value={newBudgetData.totalAmount}
                                    onChange={handleBudgetInputChange}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="startDate">Start Date</Label>
                                    <Input
                                        id="startDate"
                                        name="startDate"
                                        type="date"
                                        value={newBudgetData.startDate}
                                        onChange={handleBudgetInputChange}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="endDate">End Date</Label>
                                    <Input
                                        id="endDate"
                                        name="endDate"
                                        type="date"
                                        value={newBudgetData.endDate}
                                        onChange={handleBudgetInputChange}
                                    />
                                </div>
                            </div>
                            <DialogFooter className="pt-4">
                                <Button variant="outline" onClick={() => setShowCreateBudgetDialog(false)}>Cancel</Button>
                                <Button
                                    onClick={handleSaveNewBudget}
                                    disabled={!isFormValid() || isSubmitting}
                                >
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isSubmitting ? "Creating..." : "Next: Add Categories"}
                                </Button>
                            </DialogFooter>
                        </div>
                    ) : (
                        /* Step 2: Categories */
                        <div className="grid gap-4 py-4">
                            <div className="border rounded-lg p-4 bg-muted/30">
                                <h3 className="font-medium mb-2">Budget: {newBudgetData.name}</h3>
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Total: ₹{parseFloat(newBudgetData.totalAmount).toLocaleString()}</span>
                                    <span>
                                        {new Date(newBudgetData.startDate).toLocaleDateString()} - {new Date(newBudgetData.endDate).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="mt-3 pt-3 border-t">
                                    <div className="flex justify-between text-sm">
                                        <span>Allocated: ₹{budgetCategories.reduce((sum, cat) => sum + cat.amount, 0).toLocaleString()}</span>
                                        <span className="font-medium">
                                            Remaining: <span className={calculateRemainingAmount() === 0 ? "text-green-600" : ""}>
                                                ₹{calculateRemainingAmount().toLocaleString()}
                                            </span>
                                        </span>
                                    </div>
                                    {calculateRemainingAmount() === 0 && (
                                        <div className="mt-2 text-xs text-green-600">
                                            Budget fully allocated! ✓
                                        </div>
                                    )}
                                    <div className="mt-2">
                                        <Progress
                                            value={(budgetCategories.reduce((sum, cat) => sum + cat.amount, 0) / parseFloat(newBudgetData.totalAmount)) * 100}
                                            className={`h-2 ${calculateRemainingAmount() === 0 ? "bg-green-500" : "bg-blue-500"}`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Added Categories */}
                            {budgetCategories.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Categories</Label>
                                    <div className="border rounded-md divide-y">
                                        {budgetCategories.map((category, index) => (
                                            <div key={index} className="flex items-center justify-between p-3">
                                                <div className="flex items-center">
                                                    <div
                                                        className="h-3 w-3 rounded-full mr-2"
                                                        style={{ backgroundColor: category.color }}
                                                    ></div>
                                                    <span>{category.name}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm">₹{category.amount.toLocaleString()}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-red-500"
                                                        onClick={() => handleRemoveTempCategory(index)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Add New Category Form */}
                            <div className="space-y-3 border rounded-md p-3">
                                <h4 className="font-medium">Add Category</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor="categoryName" className="text-xs">Name</Label>
                                        <Input
                                            id="categoryName"
                                            name="name"
                                            placeholder="e.g. Groceries"
                                            value={newCategoryData.name}
                                            onChange={handleCategoryInputChange}
                                            className="h-8 mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="categoryAmount" className="text-xs">Amount (₹)</Label>
                                        <Input
                                            id="categoryAmount"
                                            name="amount"
                                            type="number"
                                            placeholder="Amount"
                                            value={newCategoryData.amount}
                                            onChange={handleCategoryInputChange}
                                            className="h-8 mt-1"
                                        />
                                        {newCategoryData.amount && parseFloat(newCategoryData.amount) > calculateRemainingAmount() && (
                                            <p className="text-xs text-red-500 mt-1">
                                                Exceeds remaining budget by ₹{(parseFloat(newCategoryData.amount) - calculateRemainingAmount()).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="categoryColor"
                                            name="color"
                                            type="color"
                                            className="w-8 h-8 p-1"
                                            value={newCategoryData.color}
                                            onChange={handleCategoryInputChange}
                                        />
                                        <div className="flex items-center gap-2">
                                            <Input
                                                id="categoryEssential"
                                                name="isEssential"
                                                type="checkbox"
                                                className="w-4 h-4"
                                                checked={newCategoryData.isEssential}
                                                onChange={handleCategoryInputChange}
                                            />
                                            <Label htmlFor="categoryEssential" className="text-xs cursor-pointer">Essential</Label>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={handleAddTempCategory}
                                        disabled={!isCategoryFormValid()}
                                    >
                                        <Plus className="h-4 w-4 mr-1" /> Add
                                    </Button>
                                </div>
                            </div>

                            <DialogFooter className="pt-4">
                                <div className="flex justify-between w-full">
                                    <Button
                                        variant="outline"
                                        onClick={() => setBudgetCreationStep(1)}
                                    >
                                        Back to Budget Details
                                    </Button>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowCreateBudgetDialog(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleSaveCategories}
                                            disabled={budgetCategories.length === 0 || isSubmitting}
                                        >
                                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            {isSubmitting ? "Saving..." : "Save Budget"}
                                        </Button>
                                    </div>
                                </div>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Add Category Dialog */}
            <Dialog open={showAddCategoryDialog} onOpenChange={setShowAddCategoryDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Budget Category</DialogTitle>
                        <DialogDescription>
                            Create a new category to track specific expenses in your budget.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="categoryName">Category Name</Label>
                            <Input
                                id="categoryName"
                                name="name"
                                placeholder="e.g. Groceries, Rent, Transportation"
                                value={newCategoryData.name}
                                onChange={handleCategoryInputChange}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="categoryAmount">Amount (₹)</Label>
                            <Input
                                id="categoryAmount"
                                name="amount"
                                type="number"
                                placeholder="e.g. 4000"
                                value={newCategoryData.amount}
                                onChange={handleCategoryInputChange}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="categoryColor">Color</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="categoryColor"
                                    name="color"
                                    type="color"
                                    className="w-16 h-10 p-1"
                                    value={newCategoryData.color}
                                    onChange={handleCategoryInputChange}
                                />
                                <div className="flex-1 flex items-center px-3 border rounded-md bg-muted">
                                    <div
                                        className="w-4 h-4 rounded-full mr-2"
                                        style={{ backgroundColor: newCategoryData.color }}
                                    ></div>
                                    <span className="text-sm">{newCategoryData.color}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Input
                                id="categoryEssential"
                                name="isEssential"
                                type="checkbox"
                                className="w-4 h-4"
                                checked={newCategoryData.isEssential}
                                onChange={handleCategoryInputChange}
                            />
                            <Label htmlFor="categoryEssential" className="cursor-pointer">Mark as essential expense</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddCategoryDialog(false)}>Cancel</Button>
                        <Button
                            onClick={handleSaveNewCategory}
                            disabled={!isCategoryFormValid() || isSubmitting}
                        >
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? "Adding..." : "Add Category"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Budgets; 