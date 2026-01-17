import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Send, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface FormFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

const projectTypes = [
  { value: "prezentare", label: "Site de prezentare" },
  { value: "magazin", label: "Magazin online" },
  { value: "aplicatie", label: "Aplicație web" },
  { value: "saas", label: "Platformă SaaS" },
  { value: "altele", label: "Altele" },
];

const budgets = [
  { value: "<300", label: "Mai puțin de 300€" },
  { value: "300-800", label: "300€ - 800€" },
  { value: "800-1700", label: "800€ - 1700€" },
  { value: ">1700", label: "Peste 1700€" },
];

const timelines = [
  { value: "1-2saptamani", label: "1-2 săptămâni" },
  { value: "2-4saptamani", label: "2-4 săptămâni" },
  { value: "1-2luni", label: "1-2 luni" },
  { value: ">2luni", label: "Peste 2 luni" },
];

const FormFlow = ({ isOpen, onClose }: FormFlowProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    projectType: "",
    budget: "",
    timeline: "",
    details: "",
    name: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = 5;

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.projectType) {
          newErrors.projectType = "Selectează tipul proiectului";
        }
        break;
      case 2:
        if (!formData.budget) {
          newErrors.budget = "Selectează bugetul estimativ";
        }
        break;
      case 3:
        if (!formData.timeline) {
          newErrors.timeline = "Selectează termenul de livrare";
        }
        break;
      case 4:
        if (!formData.details.trim()) {
          newErrors.details = "Adaugă o descriere a proiectului";
        }
        break;
      case 5:
        if (!formData.name.trim()) {
          newErrors.name = "Introdu numele tău";
        }
        if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = "Introdu o adresă de email validă";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step < totalSteps) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    toast.success("Cererea ta a fost trimisă cu succes! Te vom contacta în curând.");
    setStep(1);
    setFormData({
      projectType: "",
      budget: "",
      timeline: "",
      details: "",
      name: "",
      email: "",
      phone: "",
    });
    onClose();
  };

  const stepTitles = [
    "Tip proiect",
    "Buget",
    "Termen",
    "Detalii",
    "Contact",
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card rounded-2xl w-full max-w-lg overflow-hidden shadow-card border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-primary text-primary-foreground p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Spune-ne ce ai nevoie</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Pasul {step} din {totalSteps}</span>
              <span className="text-primary-foreground/70">{stepTitles[step - 1]}</span>
            </div>
            <div className="h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-accent"
                initial={{ width: 0 }}
                animate={{ width: `${(step / totalSteps) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="text-lg font-semibold mb-4">Ce tip de proiect ai nevoie?</h3>
                <Select
                  value={formData.projectType}
                  onValueChange={(value) => setFormData({ ...formData, projectType: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selectează tipul proiectului" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.projectType && (
                  <p className="text-destructive text-sm mt-2">{errors.projectType}</p>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="text-lg font-semibold mb-4">Care este bugetul tău estimativ?</h3>
                <RadioGroup
                  value={formData.budget}
                  onValueChange={(value) => setFormData({ ...formData, budget: value })}
                  className="space-y-3"
                >
                  {budgets.map((budget) => (
                    <div
                      key={budget.value}
                      className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                        formData.budget === budget.value
                          ? "border-accent bg-accent/5"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <RadioGroupItem value={budget.value} id={budget.value} />
                      <Label htmlFor={budget.value} className="cursor-pointer flex-1">
                        {budget.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                {errors.budget && (
                  <p className="text-destructive text-sm mt-2">{errors.budget}</p>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="text-lg font-semibold mb-4">Când ai nevoie de proiect?</h3>
                <Select
                  value={formData.timeline}
                  onValueChange={(value) => setFormData({ ...formData, timeline: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selectează termenul de livrare" />
                  </SelectTrigger>
                  <SelectContent>
                    {timelines.map((timeline) => (
                      <SelectItem key={timeline.value} value={timeline.value}>
                        {timeline.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.timeline && (
                  <p className="text-destructive text-sm mt-2">{errors.timeline}</p>
                )}
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="text-lg font-semibold mb-4">Descrie proiectul tău</h3>
                <Textarea
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  placeholder="Spune-ne mai multe despre proiectul tău: funcționalități dorite, inspirație, etc."
                  rows={6}
                  className="resize-none"
                />
                {errors.details && (
                  <p className="text-destructive text-sm mt-2">{errors.details}</p>
                )}
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold mb-4">Datele tale de contact</h3>
                <div>
                  <Label htmlFor="name">Nume complet *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Numele tău"
                    className="mt-1.5"
                  />
                  {errors.name && (
                    <p className="text-destructive text-sm mt-1">{errors.name}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@exemplu.ro"
                    className="mt-1.5"
                  />
                  {errors.email && (
                    <p className="text-destructive text-sm mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Telefon (opțional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+40 xxx xxx xxx"
                    className="mt-1.5"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Înapoi
          </Button>
          <Button
            onClick={handleNext}
            className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
          >
            {step === totalSteps ? (
              <>
                Trimite
                <Send className="w-4 h-4" />
              </>
            ) : (
              <>
                Continuă
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FormFlow;
