import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Send, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  sanitizeText,
  checkClientRateLimit,
  isHoneypotTriggered,
  addSecurityDelay,
  nameSchema,
  emailSchema,
  phoneSchema,
  textAreaSchema,
  projectTypeSchema,
  budgetSchema,
  timelineSchema,
} from "@/lib/security";

interface ContactFormFlowProps {
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

const ContactFormFlow = ({ isOpen, onClose }: ContactFormFlowProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    projectType: "",
    budget: "",
    timeline: "",
    details: "",
    name: "",
    email: "",
    phone: "",
    gdprConsent: false,
    // Honeypot fields (hidden)
    website: "",
    company_website: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lastSubmitTime, setLastSubmitTime] = useState(0);

  // Pre-fill email if user is logged in
  useEffect(() => {
    if (user?.email) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || "",
        name: user.user_metadata?.full_name || prev.name,
      }));
    }
  }, [user]);

  const totalSteps = 5;

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        const projectTypeResult = projectTypeSchema.safeParse(formData.projectType);
        if (!projectTypeResult.success) {
          newErrors.projectType = projectTypeResult.error.errors[0].message;
        }
        break;
      case 2:
        const budgetResult = budgetSchema.safeParse(formData.budget);
        if (!budgetResult.success) {
          newErrors.budget = budgetResult.error.errors[0].message;
        }
        break;
      case 3:
        const timelineResult = timelineSchema.safeParse(formData.timeline);
        if (!timelineResult.success) {
          newErrors.timeline = timelineResult.error.errors[0].message;
        }
        break;
      case 4:
        const detailsResult = textAreaSchema.safeParse(formData.details);
        if (!detailsResult.success) {
          newErrors.details = detailsResult.error.errors[0].message;
        }
        break;
      case 5:
        const nameResult = nameSchema.safeParse(formData.name);
        if (!nameResult.success) {
          newErrors.name = nameResult.error.errors[0].message;
        }

        const emailResult = emailSchema.safeParse(formData.email);
        if (!emailResult.success) {
          newErrors.email = emailResult.error.errors[0].message;
        }

        if (formData.phone) {
          const phoneResult = phoneSchema.safeParse(formData.phone);
          if (!phoneResult.success) {
            newErrors.phone = phoneResult.error.errors[0]?.message || "Telefon invalid";
          }
        }

        if (!formData.gdprConsent) {
          newErrors.gdprConsent = "Trebuie să accepți politica de confidențialitate";
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

  const handleSubmit = async () => {
    // Check honeypot
    if (isHoneypotTriggered(formData)) {
      await addSecurityDelay(500, 1500);
      toast.success("Cererea ta a fost trimisă!");
      resetForm();
      return;
    }

    // Check client-side rate limit
    const rateLimit = checkClientRateLimit("contact_form", 3, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      const waitTime = rateLimit.blockedUntil
        ? Math.ceil((rateLimit.blockedUntil.getTime() - Date.now()) / 60000)
        : 10;
      toast.error(`Prea multe încercări. Încearcă din nou în ${waitTime} minute.`);
      return;
    }

    // Minimum delay between submissions (5 seconds)
    const now = Date.now();
    if (now - lastSubmitTime < 5000) {
      toast.error("Te rugăm să aștepți câteva secunde.");
      return;
    }
    setLastSubmitTime(now);

    setIsSubmitting(true);

    try {
      await addSecurityDelay(200, 600);

      const sanitizedDetails = sanitizeText(formData.details);
      const sanitizedName = sanitizeText(formData.name);

      // Send email via edge function
      const { data, error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          projectType: formData.projectType,
          budget: formData.budget,
          timeline: formData.timeline,
          details: sanitizedDetails,
          name: sanitizedName,
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Eroare la trimitere");
      }

      // Store GDPR consent
      await supabase.from("gdpr_consents").insert({
        user_id: user?.id || null,
        email: formData.email,
        consent_type: "contact_form",
        consented: true,
        consent_text: "Accept procesarea datelor conform Politicii de Confidențialitate HRL.dev",
      });

      toast.success("Mulțumim! Cererea ta a fost trimisă. Te contactăm în curând!");
      resetForm();
    } catch (error: any) {
      console.error("Form submission error:", error);
      toast.error("A apărut o eroare. Te rugăm să încerci din nou.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      projectType: "",
      budget: "",
      timeline: "",
      details: "",
      name: user?.user_metadata?.full_name || "",
      email: user?.email || "",
      phone: "",
      gdprConsent: false,
      website: "",
      company_website: "",
    });
    setErrors({});
    onClose();
  };

  const stepTitles = ["Tip proiect", "Buget", "Termen", "Detalii", "Contact"];

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
              <span>
                Pasul {step} din {totalSteps}
              </span>
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
                      <RadioGroupItem value={budget.value} id={`contact-${budget.value}`} />
                      <Label htmlFor={`contact-${budget.value}`} className="cursor-pointer flex-1">
                        {budget.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                {errors.budget && <p className="text-destructive text-sm mt-2">{errors.budget}</p>}
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
                  maxLength={5000}
                />
                <div className="flex justify-between mt-2">
                  {errors.details && <p className="text-destructive text-sm">{errors.details}</p>}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {formData.details.length}/5000
                  </span>
                </div>
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
                  <Label htmlFor="contact-name">Nume complet *</Label>
                  <Input
                    id="contact-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Numele tău"
                    className="mt-1.5"
                    maxLength={100}
                    autoComplete="name"
                  />
                  {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="contact-email">Email *</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@exemplu.ro"
                    className="mt-1.5"
                    maxLength={255}
                    autoComplete="email"
                  />
                  {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="contact-phone">Telefon (opțional)</Label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+40 xxx xxx xxx"
                    className="mt-1.5"
                    maxLength={20}
                    autoComplete="tel"
                  />
                  {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone}</p>}
                </div>

                {/* GDPR Consent */}
                <div className="pt-4 border-t border-border">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="contact-gdpr"
                      checked={formData.gdprConsent}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, gdprConsent: checked === true })
                      }
                      className="mt-0.5"
                    />
                    <div className="space-y-1">
                      <Label htmlFor="contact-gdpr" className="text-sm cursor-pointer leading-relaxed">
                        Accept procesarea datelor personale conform{" "}
                        <a href="#" className="text-accent hover:underline">
                          Politicii de Confidențialitate
                        </a>{" "}
                        *
                      </Label>
                      {errors.gdprConsent && (
                        <p className="text-destructive text-sm">{errors.gdprConsent}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Honeypot fields */}
                <div className="absolute -left-[9999px]" aria-hidden="true">
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                  <input
                    type="text"
                    name="company_website"
                    value={formData.company_website}
                    onChange={(e) => setFormData({ ...formData, company_website: e.target.value })}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                {/* Security badge */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
                  <Shield className="w-4 h-4" />
                  <span>Datele tale sunt în siguranță și nu vor fi partajate.</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1 || isSubmitting}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Înapoi
          </Button>

          <Button
            onClick={handleNext}
            disabled={isSubmitting}
            className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Se trimite...
              </>
            ) : step === totalSteps ? (
              <>
                <Send className="w-4 h-4" />
                Trimite cererea
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

export default ContactFormFlow;
