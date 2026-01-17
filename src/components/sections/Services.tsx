import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Globe, Code, Cloud, Wrench, ArrowUpRight } from "lucide-react";

const services = [
  {
    icon: Globe,
    title: "Creare site-uri web",
    description:
      "Site-uri moderne, responsive și optimizate pentru conversii. De la landing pages la platforme complexe.",
    features: ["Design responsive", "SEO optimizat", "Performanță ridicată"],
  },
  {
    icon: Code,
    title: "Aplicații software personalizate",
    description:
      "Dezvoltăm soluții software la comandă, adaptate nevoilor specifice ale afacerii tale.",
    features: ["Full-stack development", "API integrations", "Scalabilitate"],
  },
  {
    icon: Cloud,
    title: "Soluții SaaS proprii",
    description:
      "Platforme SaaS robuste și scalabile, gata de a fi monetizate și utilizate de mii de utilizatori.",
    features: ["Multi-tenant", "Plăți integrate", "Analytics"],
  },
  {
    icon: Wrench,
    title: "Mentenanță & suport tehnic",
    description:
      "Asigurăm funcționarea optimă a aplicațiilor tale cu suport tehnic rapid și profesionist.",
    features: ["Monitorizare 24/7", "Backup automat", "Update-uri"],
  },
];

const Services = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="servicii" className="py-24 bg-background" ref={ref}>
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm font-semibold tracking-wider uppercase">
            Servicii
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4">
            Ce facem pentru tine
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Oferim o gamă completă de servicii IT pentru a-ți transforma viziunea în realitate digitală.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-card rounded-2xl p-8 border border-border card-hover cursor-pointer overflow-hidden"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <service.icon className="w-7 h-7 text-accent" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>

                <h3 className="text-xl font-semibold mb-3 group-hover:text-accent transition-colors">
                  {service.title}
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {service.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {service.features.map((feature, i) => (
                    <span
                      key={i}
                      className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
