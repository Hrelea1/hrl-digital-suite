import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import {
  ArrowRight,
  BadgeCheck,
  Braces,
  Globe,
  LineChart,
  ShieldCheck,
  Sparkles,
  Timer,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function ServicesPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const goToContact = () => {
    // Contact is a section on home page.
    if (location.pathname !== "/") {
      navigate("/");
    }

    requestAnimationFrame(() => {
      setTimeout(() => {
        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    });
  };

  const services = [
    {
      title: "Website-uri rapide & SEO-ready",
      desc: "Landing pages și site-uri de prezentare cu performanță, accesibilitate și structură SEO corectă.",
      icon: Globe,
      bullets: ["UI modern, responsive", "Viteză + Core Web Vitals", "Structură SEO + tracking"],
    },
    {
      title: "Aplicații web (Dashboard, Admin, Client Portal)",
      desc: "Sisteme cu autentificare, roluri, date sensibile și fluxuri clare pentru utilizatori.",
      icon: ShieldCheck,
      bullets: ["RBAC (user/client/admin)", "Izolare pe user + audit trail", "UX pentru operațiuni zilnice"],
    },
    {
      title: "Automatizări & integrări",
      desc: "Conectăm tool-urile tale și automatizăm procese (lead intake, notificări, raportări).",
      icon: Sparkles,
      bullets: ["Webhook-uri + validare", "Rate limiting & anti-abuse", "Loguri & alerte"],
    },
    {
      title: "MVP / Product Engineering",
      desc: "De la idee la produs: arhitectură, livrare iterativă, stabilitate și scalare.",
      icon: Braces,
      bullets: ["Roadmap pe sprinturi", "Design system + consistență", "Instrumentare + metrici"],
    },
    {
      title: "Optimizare & mentenanță",
      desc: "Îmbunătățim un produs existent: performanță, stabilitate, securitate, costuri.",
      icon: Wrench,
      bullets: ["Bugfix & hardening", "Refactor controlat", "Monitorizare și mentenanță"],
    },
    {
      title: "Analitică & conversie",
      desc: "Măsurăm ce contează și iterăm pentru conversie: funnel-uri, evenimente, A/B (când are sens).",
      icon: LineChart,
      bullets: ["Tracking pe evenimente", "Raportare clară", "Iterații orientate pe ROI"],
    },
  ] as const;

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

  return (
    <div className="min-h-screen bg-background">
      {/* Reuse existing header; CTA for this page is contact */}
      <Header onOpenForm={goToContact} />

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
              <p className="text-sm font-medium text-muted-foreground">Servicii</p>
              <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">
                Construim produse web care arată bine, se mișcă rapid și sunt securizate.
              </h1>
              <p className="mt-5 text-muted-foreground text-lg leading-relaxed">
                Pagina asta e gândită ca un meniu clar: ce facem, pentru cine e și cum lucrăm — fără
                „marketing fluff”, doar lucruri livrabile.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={goToContact}>
                  Hai să discutăm
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="secondary" onClick={() => navigate("/dashboard")}
                  className="justify-center"
                >
                  Vezi dashboard
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Services grid */}
        <section className="py-16">
          <div className="container mx-auto">
            <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
              <motion.div variants={item} className="mb-10">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Ce includ serviciile</h2>
                <p className="mt-3 text-muted-foreground max-w-2xl">
                  Carduri detaliate, ca să poți alege rapid direcția potrivită.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {services.map((s) => {
                  const Icon = s.icon;
                  return (
                    <motion.div key={s.title} variants={item}>
                      <Card className="glass-card shadow-soft p-6 h-full">
                        <div className="flex items-start gap-4">
                          <div className="h-11 w-11 rounded-lg bg-secondary flex items-center justify-center">
                            <Icon className="h-5 w-5 text-foreground" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-lg leading-snug">{s.title}</h3>
                            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                          </div>
                        </div>
                        <ul className="mt-5 space-y-2">
                          {s.bullets.map((b) => (
                            <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <BadgeCheck className="h-4 w-4 mt-0.5 text-accent" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

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
                    lansare rapidă a unui prim „slice” utilizabil.
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
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={goToContact}>
                Contact
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
