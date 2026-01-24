import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Calendar, ArrowRight, Home } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="p-8 text-center relative overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/5 pointer-events-none" />
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="relative"
          >
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <h1 className="text-2xl font-bold mb-2">Plata a fost procesată cu succes!</h1>
            <p className="text-muted-foreground mb-8">
              Mulțumim pentru achiziție! Vei primi în curând un email cu toate detaliile și pașii următori.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4 relative"
          >
            <div className="bg-muted/50 rounded-xl p-6 text-left">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-accent" />
                Pasul următor: Programează consultația
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Pentru a începe proiectul, hai să programăm o întâlnire în care să discutăm detaliile și să stabilim un plan de acțiune.
              </p>
              <Button 
                onClick={() => navigate("/dashboard/packages")}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Programează acum
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="flex-1"
              >
                <Home className="w-4 h-4 mr-2" />
                Acasă
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard/packages")}
                className="flex-1"
              >
                Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>

          {sessionId && (
            <p className="text-xs text-muted-foreground mt-6 relative">
              ID sesiune: {sessionId.slice(0, 20)}...
            </p>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default CheckoutSuccess;
