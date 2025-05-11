import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Plus, Wallet, FileText, BarChart4, Lightbulb } from "lucide-react";

interface EmptyStateFinancialProps {
    userName: string;
    onCreateBudget: () => void;
    onAddTransaction: () => void;
    onUseSampleData: () => void;
}

export function EmptyStateFinancial({
    userName,
    onCreateBudget,
    onAddTransaction,
    onUseSampleData
}: EmptyStateFinancialProps) {
    const firstName = userName.split(' ')[0];

    const steps = [
        {
            title: "Create your budget",
            description: "Set up monthly budgets with categories that matter to you",
            icon: Wallet,
            action: onCreateBudget,
            actionText: "Create Budget"
        },
        {
            title: "Track your expenses",
            description: "Add your expenses and income to start tracking your spending",
            icon: FileText,
            action: onAddTransaction,
            actionText: "Add Transaction"
        },
        {
            title: "Monitor your progress",
            description: "See insights and analyze your spending patterns",
            icon: BarChart4,
            actionText: "View Analytics",
            disabled: true
        }
    ];

    const tips = [
        "Track every small expense - they add up over time",
        "Allocate at least 20% of your income to savings if possible",
        "Review your spending weekly to stay on track",
        "Create separate budgets for fixed and variable expenses"
    ];

    return (
        <div className="space-y-6">
            {/* Welcome section */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Welcome{firstName ? `, ${firstName}` : ""}!</h1>
                <p className="text-muted-foreground text-lg">Let's set up your financial dashboard</p>
            </div>

            {/* Getting started steps */}
            <div className="grid gap-6 md:grid-cols-3 mt-8">
                {steps.map((step, index) => (
                    <Card key={index} className="relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <step.icon className="w-16 h-16" />
                        </div>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-budgetu-purple text-white flex items-center justify-center">
                                    <span className="text-sm">{index + 1}</span>
                                </div>
                                {step.title}
                            </CardTitle>
                            <CardDescription>{step.description}</CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button
                                className="w-full"
                                onClick={step.action}
                                disabled={step.disabled}
                            >
                                {step.actionText}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Try with sample data */}
            <Card className="max-w-md mx-auto mt-8">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />
                        Not sure where to start?
                    </CardTitle>
                    <CardDescription>
                        Try with sample data to see how BudgetU can help you manage your finances
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={onUseSampleData}
                    >
                        Use Sample Data
                    </Button>
                </CardFooter>
            </Card>

            {/* Quick tips */}
            <div className="max-w-3xl mx-auto mt-8">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                    <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />
                    Quick Finance Tips for Students
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                    {tips.map((tip, index) => (
                        <div
                            key={index}
                            className="p-3 border rounded-lg text-sm flex items-start"
                        >
                            <div className="mr-2 flex-shrink-0 mt-0.5">
                                <div className="h-5 w-5 rounded-full bg-budgetu-purple/10 text-budgetu-purple flex items-center justify-center">
                                    <span className="text-xs">{index + 1}</span>
                                </div>
                            </div>
                            <p>{tip}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 