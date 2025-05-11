import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

type HeroProps = {
  openSignupDialog: () => void;
};

const Hero = ({ openSignupDialog }: HeroProps) => {
  const navigate = useNavigate();

  const handleHowItWorks = () => {
    // Scroll to the How It Works section
    const howItWorksSection = document.getElementById("how-it-works");
    if (howItWorksSection) {
      howItWorksSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-20 md:py-28">
      <div className="budgetu-container">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Never Run Out of Money <span className="text-gradient">Before Month-End</span> Again
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              BudgetU helps college students take control of their finances with smart budgeting,
              expense tracking, and real-time spending guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button
                size="lg"
                className="bg-budgetu-orange hover:bg-budgetu-orange/90"
                onClick={openSignupDialog}
              >
                Start Budgeting <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleHowItWorks}
              >
                See How It Works
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required. Free plan available.
            </p>
          </div>
          <div className="flex-1 relative">
            <div className="bg-gradient-to-br from-budgetu-purple/30 to-budgetu-light-purple/30 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-budgetu-purple/20 blur-2xl"></div>
              <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-budgetu-light-purple/20 blur-2xl"></div>
              <img
                src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&q=80&w=800&ixlib=rb-4.0.3"
                alt="Student using BudgetU app"
                className="rounded-xl shadow-lg animate-float"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
