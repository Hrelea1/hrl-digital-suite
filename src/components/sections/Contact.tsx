import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContactFormFlow from "@/components/ContactFormFlow";

const Contact = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isFormOpen, setIsFormOpen] = useState(false);

  const contactInfo = [
    { icon: Mail, label: "Email", value: "contact@hrldev.ro" },
    { icon: Phone, label: "Telefon", value: "+40 xxx xxx xxx" },
    { icon: MapPin, label: "Locație", value: "România" },
  ];

  return (
    <section id="contact" className="py-24 bg-muted/30" ref={ref}>
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm font-semibold tracking-wider uppercase">
            Contact
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4">
            Hai să vorbim
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Ai un proiect în minte? Completează formularul și îți răspundem în maxim 24 de ore.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-semibold mb-6">Informații de contact</h3>
            <div className="space-y-4 mb-8">
              {contactInfo.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border"
                >
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 text-primary-foreground">
              <h4 className="text-xl font-semibold mb-3">Timp mediu de răspuns</h4>
              <p className="text-primary-foreground/80 mb-4">
                Răspundem la toate mesajele în maxim 24 de ore în zilele lucrătoare.
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-sm">Online acum</span>
              </div>
            </div>
          </motion.div>

          {/* CTA to open form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="bg-card rounded-2xl p-8 border border-border shadow-card h-full flex flex-col justify-center items-center text-center">
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                <Mail className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Spune-ne ce ai nevoie</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Completează un scurt formular cu detaliile proiectului și îți trimitem o ofertă personalizată.
              </p>
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => setIsFormOpen(true)}
              >
                Începe conversația
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <ContactFormFlow isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </section>
  );
};

export default Contact;
