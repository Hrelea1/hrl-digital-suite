import { useState } from "react";
import Header from "@/components/layout/Header";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import About from "@/components/sections/About";
import Pricing from "@/components/sections/Pricing";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";
import FormFlow from "@/components/FormFlow";

const Index = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onOpenForm={() => setIsFormOpen(true)} />
      <Hero onOpenForm={() => setIsFormOpen(true)} />
      <Services onOpenForm={() => setIsFormOpen(true)} />
      <About />
      <Pricing onOpenForm={() => setIsFormOpen(true)} />
      <Contact />
      <Footer />
      <FormFlow isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
};

export default Index;
