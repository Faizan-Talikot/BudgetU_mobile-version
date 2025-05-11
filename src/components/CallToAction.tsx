import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

type CallToActionProps = {
  openSignupDialog: () => void;
};

const CallToAction = ({ openSignupDialog }: CallToActionProps) => {
  return (
    <section className="py-24">
      <div className="budgetu-container">
        <div className="bg-gradient-to-r from-budgetu-purple to-budgetu-vivid-purple rounded-3xl p-12 text-white text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Take Control of Your Student Finances?
            </h2>
            <p className="text-lg opacity-90 mb-8">
              Join thousands of students who never run out of money before the month ends.
              Start managing your finances the smart way.
            </p>
            <Button
              size="lg"
              className="bg-white text-budgetu-dark-purple hover:bg-white/90"
              onClick={openSignupDialog}
            >
              Get Started For Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="mt-4 text-sm opacity-80">
              No credit card required. Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
