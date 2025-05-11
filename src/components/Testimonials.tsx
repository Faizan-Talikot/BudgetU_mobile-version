
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Quote } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      quote: "BudgetU helped me stop overdrafting my account! Now I always know how much I can safely spend.",
      name: "Jamie C.",
      role: "Sophomore, NYU",
      avatar: "JC"
    },
    {
      quote: "The category breakdown made me realize I was spending way too much on takeout. Saved over $200 last month!",
      name: "Miguel R.",
      role: "Junior, UC Berkeley",
      avatar: "MR"
    },
    {
      quote: "As an RA with a meal plan, BudgetU helps me manage my stipend and save for grad school applications.",
      name: "Taylor W.",
      role: "Senior, UMich",
      avatar: "TW"
    }
  ];

  return (
    <section className="py-20" id="testimonials">
      <div className="budgetu-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What <span className="text-gradient">Students Say</span> About BudgetU
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of students who've transformed their financial habits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="card-hover">
              <CardContent className="p-6">
                <Quote className="h-8 w-8 text-budgetu-purple opacity-40 mb-4" />
                <p className="mb-6 text-lg">{testimonial.quote}</p>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-budgetu-light-purple text-budgetu-purple">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
