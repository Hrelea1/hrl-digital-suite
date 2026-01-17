import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Check, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PricingProps {
  onOpenForm: () => void;
}

const packages = [
  {
    name: "Start",
    price: "299",
    description: "Perfect pentru afaceri mici și prezențe online simple.",
    features: [
      "1–3 pagini",
      "Design responsive",
      "2 revizii incluse",
      "Garanție 1 lună",
      "Hosting setup",
    ],
    popular: false,
  },
  {
    name: "Business",
    price: "799",
    description: "Ideal pentru afaceri în creștere cu nevoi complexe.",
    features: [
      "5–8 pagini",
      "Design personalizat",
      "SEO on-page",
      "Formular avansat",
      "Google Analytics",
      "Optimizare viteză",
      "Suport 14 zile",
    ],
    popular: true,
  },
  {
    name: "Premium",
    price: "1699",
    description: "Soluția completă pentru proiecte ambițioase.",
    features: [
      "8–15 pagini",
      "UI/UX personalizat",
      "SEO avansat",
      "CRM/Newsletter",
      "Multilingual RO/EN",
      "GDPR compliance",
      "Backup automat",
      "Suport 30 zile",
    ],
    popular: false,
  },
];

const maintenance = [
  { name: "Standard", price: "60-90", period: "lună" },
  { name: "Premium", price: "120-200", period: "lună" },
  { name: "Anual Simplu", price: "120", period: "an" },
  { name: "Anual Premium", price: "200", period: "an" },
];

const Pricing = ({ onOpenForm }: PricingProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="preturi" className="py-24 bg-background" ref={ref}>
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm font-semibold tracking-wider uppercase">
            Prețuri
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4">
            Pachete și servicii
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Alegem împreună pachetul potrivit pentru nevoile tale. Prețuri transparente, fără costuri ascunse.
          </p>
        </motion.div>

        {/* Main Packages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-2xl p-8 border ${
                pkg.popular
                  ? "bg-primary text-primary-foreground border-accent shadow-glow"
                  : "bg-card border-border"
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-semibold flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5" />
                  Cel mai popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">{pkg.name}</h3>
                <p className={`text-sm ${pkg.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {pkg.description}
                </p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold">{pkg.price}</span>
                <span className={`text-lg ${pkg.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}> €</span>
              </div>

              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <Check className={`w-4 h-4 ${pkg.popular ? "text-accent" : "text-accent"}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={onOpenForm}
                className={`w-full ${
                  pkg.popular
                    ? "bg-accent text-accent-foreground hover:bg-accent/90"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                Începe proiectul
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Maintenance Packages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-muted/50 rounded-2xl p-8 border border-border"
        >
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-5 h-5 text-accent" />
            <h3 className="text-xl font-semibold">Pachete de mentenanță</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {maintenance.map((item, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-4 border border-border text-center"
              >
                <h4 className="font-semibold mb-1">{item.name}</h4>
                <p className="text-2xl font-bold text-accent">{item.price}€</p>
                <p className="text-sm text-muted-foreground">/{item.period}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
