import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import hrlLogo from "@/assets/hrl-logo.svg";

interface HeaderProps {
  onOpenForm: () => void;
}

const Header = ({ onOpenForm }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { id: "acasa", label: "Acasă" },
    { id: "servicii", label: "Servicii" },
    { id: "about", label: "About Us" },
    { id: "contact", label: "Contact" },
  ];

  const scrollToSection = async (id: string) => {
    // If we're not on home, first navigate there (HashRouter-safe) then scroll.
    if (location.pathname !== "/") {
      navigate("/");
    }

    // Wait a tick for the DOM to be ready after navigation.
    requestAnimationFrame(() => {
      setTimeout(() => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "glass-card py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between">
        <button
          type="button"
          onClick={() => scrollToSection("acasa")}
          className="flex items-center"
        >
          <img src={hrlLogo} alt="HRL.dev" className="h-20 md:h-24" />
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => scrollToSection(link.id)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </button>
          ))}
          {user ? (
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/dashboard">
                <User className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
          ) : (
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/auth">Autentificare</Link>
            </Button>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-card mt-2 mx-4 rounded-lg overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-3">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    scrollToSection(link.id);
                  }}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  {link.label}
                </button>
              ))}
              {user ? (
                <Button
                  asChild
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 mt-2"
                >
                  <Link to="/dashboard">
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 mt-2"
                >
                  <Link to="/auth">Autentificare</Link>
                </Button>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
