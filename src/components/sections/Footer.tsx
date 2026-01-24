import { ArrowUpRight } from "lucide-react";
import hrlLogo from "@/assets/hrl-logo.svg";
import { useLocation, useNavigate } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (id: string) => {
    if (location.pathname !== "/") {
      navigate("/");
    }

    requestAnimationFrame(() => {
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    });
  };

  const links = {
    servicii: [
      { label: "Site-uri web", to: "/servicii" },
      { label: "Aplicații software", to: "/servicii" },
      { label: "Soluții SaaS", to: "/servicii" },
      { label: "Mentenanță", to: "/servicii" },
    ],
    companie: [
      { label: "Despre noi", id: "about" },
      { label: "Portofoliu", id: "about" },
      { label: "Prețuri", id: "preturi" },
      { label: "Contact", id: "contact" },
    ],
  };

  return (
    <footer className="bg-card border-t border-border py-16">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <button type="button" onClick={() => scrollToSection("acasa")} className="block mb-4">
              <img src={hrlLogo} alt="HRL.dev" className="h-10" />
            </button>
            <p className="text-muted-foreground mb-6 max-w-sm">
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
            <h4 className="font-semibold mb-4 text-foreground">Servicii</h4>
            <ul className="space-y-3">
              {links.servicii.map((link, index) => (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() => navigate(link.to)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Companie</h4>
            <ul className="space-y-3">
              {links.companie.map((link, index) => (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() => scrollToSection(link.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} HRL.dev. Toate drepturile rezervate.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Politica de confidențialitate
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Termeni și condiții
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
