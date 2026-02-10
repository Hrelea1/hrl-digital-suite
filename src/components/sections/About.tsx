import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Rocket, Target, Eye, Users } from "lucide-react";

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
            Cine suntem
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Suntem un start-up proaspăt lansat, cu o echipă mică dar ambițioasă, gata să transforme ideile tale în realitate digitală.
          </p>
        </motion.div>

        {/* Echipa */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-accent" />
            <h3 className="text-2xl font-semibold">Echipa</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed max-w-3xl">
            Suntem o echipă tânără de dezvoltatori și designeri uniți de aceeași pasiune: tehnologia. Fiecare membru aduce experiență, creativitate și dedicare, iar împreună construim soluții digitale de care suntem mândri. Chiar dacă suntem la început de drum, energia și dorința de a demonstra ce putem ne definesc.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Misiune */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-card rounded-xl p-8 border border-border hover:border-accent/30 transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-8 h-8 text-accent" />
              <h3 className="text-2xl font-semibold">Misiune</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Să oferim soluții digitale accesibile, moderne și personalizate pentru afaceri de toate dimensiunile. Credem că fiecare business merită o prezență online de calitate, iar noi suntem aici să facem asta posibil — rapid, eficient și la prețuri corecte.
            </p>
          </motion.div>

          {/* Viziune */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-card rounded-xl p-8 border border-border hover:border-accent/30 transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-8 h-8 text-accent" />
              <h3 className="text-2xl font-semibold">Viziune</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Să devenim partenerul de încredere al antreprenorilor din România care vor să-și digitalizeze afacerea. Ne dorim ca în câțiva ani, HRL.dev să fie sinonim cu calitate, inovație și accesibilitate în lumea dezvoltării web și software.
            </p>
          </motion.div>
        </div>

        {/* Portofoliu - În curând */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <div className="bg-card rounded-xl p-12 border border-dashed border-accent/30">
            <Rocket className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Portofoliu</h3>
            <p className="text-muted-foreground text-lg">
              În curând — primele noastre proiecte vor apărea aici.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
