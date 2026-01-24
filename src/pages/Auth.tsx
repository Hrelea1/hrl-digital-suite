import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import hrlLogo from "@/assets/hrl-logo.svg";

const emailSchema = z.string().email("Adresă de email invalidă");
const passwordSchema = z.string().min(6, "Parola trebuie să aibă cel puțin 6 caractere");
const nameSchema = z.string().min(2, "Numele trebuie să aibă cel puțin 2 caractere");

type AuthMode = "login" | "signup" | "forgot" | "reset";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  // Check for password reset token in URL
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setMode("reset");
    }
  }, []);

  useEffect(() => {
    if (user && mode !== "reset") {
      navigate("/dashboard");
    }
  }, [user, navigate, mode]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (mode !== "reset") {
      const emailResult = emailSchema.safeParse(email);
      if (!emailResult.success) {
        newErrors.email = emailResult.error.errors[0].message;
      }
    }

    if (mode === "login" || mode === "signup") {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.errors[0].message;
      }
    }

    if (mode === "reset") {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.errors[0].message;
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = "Parolele nu coincid";
      }
    }

    if (mode === "signup") {
      const nameResult = nameSchema.safeParse(fullName);
      if (!nameResult.success) {
        newErrors.fullName = nameResult.error.errors[0].message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Email sau parolă incorectă");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Autentificare reușită!");
          navigate("/dashboard");
        }
      } else if (mode === "signup") {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("Acest email este deja înregistrat");
          } else {
            toast.error(error.message);
          }
        } else {
          // Send welcome email
          try {
            await supabase.functions.invoke("send-welcome-email", {
              body: { email, userName: fullName },
            });
          } catch (e) {
            console.error("Welcome email error:", e);
          }
          toast.success("Cont creat cu succes!");
          navigate("/dashboard");
        }
      } else if (mode === "forgot") {
        // Generate reset link and send via custom email
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/#/auth`,
        });

        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Verifică-ți email-ul pentru linkul de resetare!");
          setMode("login");
        }
      } else if (mode === "reset") {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Parola a fost schimbată cu succes!");
          setMode("login");
          navigate("/dashboard");
        }
      }
    } catch (err) {
      toast.error("A apărut o eroare. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "login":
        return "Bine ai revenit!";
      case "signup":
        return "Creează un cont";
      case "forgot":
        return "Resetează parola";
      case "reset":
        return "Parolă nouă";
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case "login":
        return "Autentifică-te pentru a accesa dashboard-ul";
      case "signup":
        return "Înregistrează-te pentru a începe";
      case "forgot":
        return "Introdu email-ul pentru a primi linkul de resetare";
      case "reset":
        return "Setează o parolă nouă pentru contul tău";
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <a href="/" className="flex justify-center mb-8">
          <img src={hrlLogo} alt="HRL.dev" className="h-12" />
        </a>

        {/* Auth Card */}
        <div className="bg-card rounded-2xl p-8 shadow-card border border-border">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">{getTitle()}</h1>
            <p className="text-muted-foreground">{getSubtitle()}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "signup" && (
              <div>
                <Label htmlFor="fullName" className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Nume complet
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ion Popescu"
                  className="bg-background"
                />
                {errors.fullName && (
                  <p className="text-destructive text-sm mt-1">{errors.fullName}</p>
                )}
              </div>
            )}

            {mode !== "reset" && (
              <div>
                <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplu.ro"
                  className="bg-background"
                />
                {errors.email && (
                  <p className="text-destructive text-sm mt-1">{errors.email}</p>
                )}
              </div>
            )}

            {(mode === "login" || mode === "signup" || mode === "reset") && (
              <div>
                <Label htmlFor="password" className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  {mode === "reset" ? "Parolă nouă" : "Parolă"}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-background pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-destructive text-sm mt-1">{errors.password}</p>
                )}
              </div>
            )}

            {mode === "reset" && (
              <div>
                <Label htmlFor="confirmPassword" className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  Confirmă parola
                </Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-background"
                />
                {errors.confirmPassword && (
                  <p className="text-destructive text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {mode === "login" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setErrors({});
                  }}
                  className="text-sm text-accent hover:underline"
                >
                  Ai uitat parola?
                </button>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 py-6"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Se procesează...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {mode === "login" && "Autentifică-te"}
                  {mode === "signup" && "Creează contul"}
                  {mode === "forgot" && "Trimite link de resetare"}
                  {mode === "reset" && "Salvează parola nouă"}
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            {(mode === "login" || mode === "signup") && (
              <p className="text-muted-foreground">
                {mode === "login" ? "Nu ai un cont?" : "Ai deja un cont?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "login" ? "signup" : "login");
                    setErrors({});
                  }}
                  className="text-accent hover:underline font-medium"
                >
                  {mode === "login" ? "Înregistrează-te" : "Autentifică-te"}
                </button>
              </p>
            )}

            {(mode === "forgot" || mode === "reset") && (
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrors({});
                }}
                className="text-accent hover:underline font-medium flex items-center gap-1 mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Înapoi la autentificare
              </button>
            )}
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            ← Înapoi la pagina principală
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
