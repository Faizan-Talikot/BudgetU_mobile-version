import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

type HowItWorksProps = {
  openSignupDialog: () => void;
};

const HowItWorks = ({ openSignupDialog }: HowItWorksProps) => {
  const steps = [
    {
      number: "01",
      title: "Connect Your Bank Accounts",
      description: "Securely link your accounts to automatically import and categorize transactions."
    },
    {
      number: "02",
      title: "Set Up Your Monthly Budget",
      description: "Choose a template or create a custom budget with categories that match your student lifestyle."
    },
    {
      number: "03",
      title: "Track Your Spending",
      description: "View transactions automatically categorized and see your spending patterns in real-time."
    },
    {
      number: "04",
      title: "Make Smarter Spending Decisions",
      description: "Use the Safe-to-Spend calculator to know if you can afford that coffee or night out."
    }
  ];

  return (
    <section className="py-20" id="how-it-works">
      <div className="budgetu-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How <span className="text-gradient">BudgetU</span> Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Getting started is simple - you'll be managing your money like a pro in minutes.
          </p>
        </div>

        <div className="grid gap-8 md:gap-12">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row gap-6 items-start md:items-center bg-background rounded-2xl p-6 border"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-budgetu-purple/10 flex items-center justify-center text-budgetu-purple font-bold">
                {step.number}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button
            size="lg"
            className="bg-budgetu-orange hover:bg-budgetu-orange/90"
            onClick={openSignupDialog}
          >
            Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
