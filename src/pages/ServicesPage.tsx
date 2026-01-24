import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import ServiceSection from "@/components/services/ServiceSection";
import ContactFormFlow from "@/components/ContactFormFlow";
import { useAllServicePackages, ServiceCategory } from "@/hooks/useServicePackages";
import {
  ArrowRight,
  BadgeCheck,
  Braces,
  Globe,
  LineChart,
  Palette,
  ShieldCheck,
  Timer,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";

const serviceCategories = [
  {
    id: "website",
    title: "Creare site-uri web",
    description: "Site-uri moderne, rapide și optimizate pentru conversii. De la landing pages la platforme complexe de e-commerce.",
    icon: Globe,
    category: "website" as ServiceCategory,
  },
  {
    id: "seo",
    title: "SEO - Optimizare pentru motoare de căutare",
    description: "Crești vizibilitatea în Google și atragi trafic organic de calitate. Audit, optimizare și monitorizare continuă.",
    icon: LineChart,
    category: "seo" as ServiceCategory,
  },
  {
    id: "graphic-design",
    title: "Grafic Design",
    description: "Identitate vizuală memorabilă care reflectă valorile brandului tău. Logo, branding complet și materiale pentru social media.",
    icon: Palette,
    category: "graphic_design" as ServiceCategory,
  },
  {
    id: "maintenance",
    title: "Mentenanță & Suport Tehnic",
    description: "Asigurăm funcționarea optimă a site-ului tău cu monitorizare, backup-uri și suport tehnic rapid.",
    icon: Wrench,
    category: "maintenance" as ServiceCategory,
  },
];

const steps = [
  {
    title: "Discovery & brief",
    desc: "Clarificăm scopul, riscurile, deadline-ul și criteriile de succes.",
    icon: BadgeCheck,
  },
  {
    title: "Prototip & arhitectură",
    desc: "Propunem flow-uri + schemă tehnică; alegem varianta cu impact maxim.",
    icon: Braces,
  },
  {
    title: "Implementare & testare",
    desc: "Livrăm incremental, cu validări, audit, și QA orientat pe utilizare reală.",
    icon: ShieldCheck,
  },
  {
    title: "Lansare & iterare",
    desc: "Monitorizare + optimizări pe bază de date (performanță, conversie, stabilitate).",
    icon: Timer,
  },
] as const;

const navItems = [
  { id: "website", label: "Website" },
  { id: "seo", label: "SEO" },
  { id: "graphic-design", label: "Design" },
  { id: "maintenance", label: "Mentenanță" },
];

export default function ServicesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("website");
  const { data: packages, isLoading } = useAllServicePackages();

  // Scroll to hash on load
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
          setActiveSection(id);
        }
      }, 100);
    }
  }, [location.hash]);

  // Track active section on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );

    serviceCategories.forEach((cat) => {
      const element = document.getElementById(cat.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  // Group packages by category
  const packagesByCategory = useMemo(() => {
    if (!packages) return {};
    return packages.reduce((acc, pkg) => {
      const cat = pkg.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(pkg);
      return acc;
    }, {} as Record<ServiceCategory, typeof packages>);
  }, [packages]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const goToContact = () => {
    if (location.pathname !== "/") {
      navigate("/");
    }
    requestAnimationFrame(() => {
      setTimeout(() => {
        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    });
  };

  const handleSelectPackage = (packageName: string) => {
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onOpenForm={() => setIsFormOpen(true)} />

      <main className="pt-28">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 hero-gradient opacity-60" aria-hidden="true" />
          <div className="container mx-auto relative py-20">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl"
            >
              <p className="text-sm font-medium text-muted-foreground">Servicii & Pachete</p>
              <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">
                Alege pachetul potrivit pentru afacerea ta
              </h1>
              <p className="mt-5 text-muted-foreground text-lg leading-relaxed">
                De la site-uri web și SEO la branding și mentenanță — avem soluții clare, cu prețuri
                transparente și livrabile concrete.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={goToContact}>
                  Hai să discutăm
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Sticky Navigation */}
        <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="container mx-auto">
            <nav className="flex gap-1 py-3 overflow-x-auto scrollbar-hide">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeSection === item.id
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Service Sections */}
        {isLoading ? (
          <div className="container mx-auto py-16">
            <div className="space-y-16">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-6">
                  <Skeleton className="h-10 w-64" />
                  <Skeleton className="h-6 w-96" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-80" />
                    <Skeleton className="h-80" />
                    <Skeleton className="h-80" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          serviceCategories.map((cat) => (
            <ServiceSection
              key={cat.id}
              id={cat.id}
              title={cat.title}
              description={cat.description}
              icon={cat.icon}
              packages={packagesByCategory[cat.category] || []}
              onSelectPackage={handleSelectPackage}
            />
          ))
        )}

        {/* Process */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Cum lucrăm</h2>
                <p className="mt-3 text-muted-foreground max-w-prose">
                  Proces scurt, predictibil și orientat pe livrabile. Fără surprize — doar iterare.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {steps.map((st) => {
                  const Icon = st.icon;
                  return (
                    <Card key={st.title} className="bg-card border-border p-5">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                          <Icon className="h-5 w-5 text-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{st.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{st.desc}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Întrebări frecvente</h2>
            <p className="mt-3 text-muted-foreground">Răspunsuri rapide, ca să mergem mai departe fără fricțiune.</p>
            <div className="mt-8">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Care e primul pas?</AccordionTrigger>
                  <AccordionContent>
                    Un mesaj cu obiectivul și contextul. Apoi facem un scurt discovery ca să definim scope-ul și
                    livrabilele.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Lucrați pe abonament sau pe proiect?</AccordionTrigger>
                  <AccordionContent>
                    Ambele: proiect fix (pentru scope clar) sau retainer (pentru îmbunătățiri continue și mentenanță).
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Cât de repede putem lansa?</AccordionTrigger>
                  <AccordionContent>
                    Depinde de complexitate, dar pentru un MVP realist țintim livrări incremental (săptămânal) și o
                    lansare rapidă a unui prim „slice" utilizabil.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>Ce include prețul afișat?</AccordionTrigger>
                  <AccordionContent>
                    Prețurile afișate sunt orientative și includ tot ce e listat în features. Pentru proiecte custom,
                    facem o estimare personalizată după discovery.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 bg-card border-t border-border">
          <div className="container mx-auto">
            <div className="glass-card shadow-card rounded-xl p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Ai un proiect în minte?</h2>
                <p className="mt-2 text-muted-foreground max-w-2xl">
                  Spune-ne obiectivul și contextul. Îți răspundem cu pași clari și o propunere realistă.
                </p>
              </div>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setIsFormOpen(true)}>
                Începe un proiect
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <ContactFormFlow isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
}
