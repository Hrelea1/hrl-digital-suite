import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Users, Briefcase, Calendar, Award, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { icon: Users, value: 50, suffix: "+", label: "Clienți mulțumiți" },
  { icon: Briefcase, value: 120, suffix: "+", label: "Proiecte finalizate" },
  { icon: Calendar, value: 5, suffix: "+", label: "Ani experiență" },
  { icon: Award, value: 98, suffix: "%", label: "Rată de satisfacție" },
];

const timeline = [
  { year: "2019", title: "Fondarea HRL.dev", description: "Am început ca freelanceri pasionați de tehnologie." },
  { year: "2020", title: "Prima echipă", description: "Am crescut la 5 membri și am lansat primele proiecte SaaS." },
  { year: "2021", title: "100 de clienți", description: "Am atins pragul de 100 de clienți mulțumiți." },
  { year: "2023", title: "Expansiune", description: "Am extins serviciile în zona aplicațiilor enterprise." },
  { year: "2024", title: "AI Integration", description: "Am integrat soluții AI în portofoliul de servicii." },
];

const portfolio = [
  { title: "E-commerce Platform", category: "Web", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop", description: "Platformă e-commerce completă cu plăți integrate." },
  { title: "Mobile Banking App", category: "Mobile", image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&h=400&fit=crop", description: "Aplicație bancară mobilă cu autentificare biometrică." },
  { title: "HR Management SaaS", category: "SaaS", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop", description: "Sistem complet de management al resurselor umane." },
  { title: "Corporate Website", category: "Web", image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&h=400&fit=crop", description: "Site corporate modern cu CMS integrat." },
  { title: "Inventory System", category: "SaaS", image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=400&fit=crop", description: "Sistem de gestiune a stocurilor în timp real." },
  { title: "Brand Identity", category: "Design", image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&h=400&fit=crop", description: "Identitate vizuală completă pentru startup tech." },
];

const categories = ["Toate", "Web", "Mobile", "SaaS", "Design"];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const duration = 2000;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeCategory, setActiveCategory] = useState("Toate");
  const [selectedProject, setSelectedProject] = useState<typeof portfolio[0] | null>(null);

  const filteredPortfolio = activeCategory === "Toate"
    ? portfolio
    : portfolio.filter((p) => p.category === activeCategory);

  return (
    <section id="about" className="py-24 bg-muted/30" ref={ref}>
      <div className="container mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm font-semibold tracking-wider uppercase">
            Despre noi
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4">
            Echipa & Portofoliu
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - About & Timeline */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h3 className="text-2xl font-semibold mb-4">Cine suntem</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Suntem o echipă de dezvoltatori și designeri pasionați de tehnologie, dedicați să transformăm ideile în produse digitale de succes.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Misiunea noastră:</strong> Să oferim soluții digitale accesibile și de înaltă calitate pentru afaceri de toate dimensiunile.
              </p>
            </motion.div>

            {/* Animated Counters */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 gap-4 mb-12"
            >
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-card rounded-xl p-5 border border-border text-center"
                >
                  <stat.icon className="w-6 h-6 text-accent mx-auto mb-2" />
                  <div className="text-3xl font-bold text-foreground">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="text-xl font-semibold mb-6">Evoluția noastră</h3>
              <div className="relative">
                <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
                {timeline.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="relative pl-10 pb-6 last:pb-0"
                  >
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                    </div>
                    <span className="text-accent text-sm font-semibold">{item.year}</span>
                    <h4 className="font-semibold mt-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Portfolio */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-2xl font-semibold mb-6">Portofoliu</h3>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(cat)}
                  className={activeCategory === cat ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}
                >
                  {cat}
                </Button>
              ))}
            </div>

            {/* Portfolio Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredPortfolio.map((project, index) => (
                <motion.div
                  key={project.title}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="group relative rounded-xl overflow-hidden cursor-pointer"
                  onClick={() => setSelectedProject(project)}
                >
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div>
                      <span className="text-xs text-accent font-medium">{project.category}</span>
                      <h4 className="text-primary-foreground font-semibold">{project.title}</h4>
                    </div>
                    <ExternalLink className="absolute top-4 right-4 w-5 h-5 text-primary-foreground" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Project Modal */}
      {selectedProject && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedProject(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card rounded-2xl max-w-2xl w-full overflow-hidden shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img
                src={selectedProject.image}
                alt={selectedProject.title}
                className="w-full h-64 object-cover"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 bg-background/50 hover:bg-background/80"
                onClick={() => setSelectedProject(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-6">
              <span className="text-accent text-sm font-medium">{selectedProject.category}</span>
              <h3 className="text-2xl font-bold mt-1 mb-3">{selectedProject.title}</h3>
              <p className="text-muted-foreground">{selectedProject.description}</p>
              <div className="mt-6 flex gap-3">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Vezi proiectul
                </Button>
                <Button variant="outline" onClick={() => setSelectedProject(null)}>
                  Închide
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
};

export default About;
