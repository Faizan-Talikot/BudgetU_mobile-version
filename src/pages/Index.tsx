import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import DashboardDemo from "@/components/DashboardDemo";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";

const Index = () => {
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  const openSignupDialog = () => {
    setIsSignupOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header isSignupOpen={isSignupOpen} setIsSignupOpen={setIsSignupOpen} />
      <main>
        <Hero openSignupDialog={openSignupDialog} />
        <Features />
        <HowItWorks openSignupDialog={openSignupDialog} />
        <DashboardDemo />
        <Testimonials />
        <FAQ />
        <CallToAction openSignupDialog={openSignupDialog} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
