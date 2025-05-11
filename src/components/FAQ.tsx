
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "Is BudgetU free to use?",
      answer:
        "Yes! BudgetU offers a free plan with core budgeting and expense tracking features. Premium features like advanced insights and financial coaching are available through a subscription plan with special student pricing."
    },
    {
      question: "Is it safe to connect my bank account?",
      answer:
        "Absolutely. BudgetU uses bank-level encryption and security protocols. We connect to your accounts using trusted financial API providers like Plaid, which means we never store your login credentials."
    },
    {
      question: "Do I need a bank account to use BudgetU?",
      answer:
        "While connecting a bank account provides the best experience with automatic transaction imports, you can still use BudgetU manually by entering transactions yourself and tracking your cash spending."
    },
    {
      question: "Can I use BudgetU if I share expenses with roommates?",
      answer:
        "Yes! BudgetU allows you to mark transactions as split expenses and track your individual portion. You can also create shared expense categories to monitor group spending on utilities and other shared bills."
    },
    {
      question: "How does the Safe-to-Spend feature work?",
      answer:
        "The Safe-to-Spend calculator takes your remaining budget for the month and divides it by the number of days left, giving you a daily spending target that helps you avoid running out of money before the month ends."
    },
    {
      question: "Can I customize budget categories for my specific needs?",
      answer:
        "Definitely! While BudgetU provides student-specific templates, you can fully customize your budget categories to match your unique situation, whether you live on-campus, off-campus, or have specific expenses like textbooks or club dues."
    }
  ];

  return (
    <section className="py-20 bg-secondary/50" id="faq">
      <div className="budgetu-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about using BudgetU for your student finances.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
