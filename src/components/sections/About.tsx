import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Rocket, Target, Lightbulb, Heart } from "lucide-react";

const values = [
  { icon: Rocket, title: "Ambiție", description: "Suntem la început, dar visăm mare. Fiecare proiect este o oportunitate de a demonstra ce putem." },
  { icon: Target, title: "Precizie", description: "Livrăm soluții bine gândite, cu atenție la detalii și la nevoile reale ale clienților." },
  { icon: Lightbulb, title: "Inovație", description: "Folosim cele mai noi tehnologii și abordări pentru a crea produse digitale moderne." },
  { icon: Heart, title: "Dedicare", description: "Tratăm fiecare proiect ca și cum ar fi al nostru. Succesul tău este succesul nostru." },
];

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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
            Povestea noastră
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Story */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-semibold mb-4">Un start-up cu viziune</h3>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              HRL.dev s-a născut din dorința de a face tehnologia accesibilă pentru toți. Suntem o echipă tânără de dezvoltatori și designeri care cred că fiecare afacere merită o prezență digitală de calitate, indiferent de dimensiune sau buget.
            </p>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Abia ne-am lansat, dar venim cu energie, idei proaspete și o pasiune autentică pentru ceea ce facem. Fiecare client care ne alege acum devine parte din povestea noastră de la început.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Misiunea noastră:</strong> Să oferim soluții digitale accesibile, moderne și personalizate — de la site-uri web și aplicații, până la identitate vizuală și strategii digitale.
            </p>

            <div className="mt-8 p-5 rounded-xl bg-accent/10 border border-accent/20">
              <p className="text-sm text-accent font-medium mb-1">💡 De ce să lucrezi cu un start-up?</p>
              <p className="text-sm text-muted-foreground">
                Primești atenție 100% dedicată proiectului tău, prețuri corecte pentru un serviciu premium, și o echipă care chiar vrea să demonstreze ce poate.
              </p>
            </div>
          </motion.div>

          {/* Right Column - Values */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {values.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-card rounded-xl p-5 border border-border hover:border-accent/30 transition-colors"
              >
                <item.icon className="w-8 h-8 text-accent mb-3" />
                <h4 className="font-semibold mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
