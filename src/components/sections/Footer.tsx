import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const links = {
    servicii: [
      { label: "Site-uri web", href: "#servicii" },
      { label: "Aplicații software", href: "#servicii" },
      { label: "Soluții SaaS", href: "#servicii" },
      { label: "Mentenanță", href: "#servicii" },
    ],
    companie: [
      { label: "Despre noi", href: "#about" },
      { label: "Portofoliu", href: "#about" },
      { label: "Prețuri", href: "#preturi" },
      { label: "Contact", href: "#contact" },
    ],
  };

  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <a href="#" className="text-2xl font-bold mb-4 block">
              HRL<span className="text-accent">.dev</span>
            </a>
            <p className="text-primary-foreground/70 mb-6 max-w-sm">
              Digitalizăm afacerea ta cu soluții web și software personalizat. Partenerul tău de încredere pentru transformarea digitală.
            </p>
            <a
              href="mailto:contact@hrl.dev"
              className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors"
            >
              contact@hrl.dev
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Servicii</h4>
            <ul className="space-y-3">
              {links.servicii.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Companie</h4>
            <ul className="space-y-3">
              {links.companie.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/50">
            © {currentYear} HRL.dev. Toate drepturile rezervate.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-primary-foreground/50 hover:text-primary-foreground transition-colors">
              Politica de confidențialitate
            </a>
            <a href="#" className="text-sm text-primary-foreground/50 hover:text-primary-foreground transition-colors">
              Termeni și condiții
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
