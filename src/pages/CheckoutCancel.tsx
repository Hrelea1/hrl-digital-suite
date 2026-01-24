import { useNavigate } from "react-router-dom";
import { XCircle, ArrowLeft, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const CheckoutCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-amber-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-2xl font-bold mb-2">Plata a fost anulată</h1>
            <p className="text-muted-foreground mb-8">
              Nu ți-am debitat cardul. Poți reveni oricând pentru a finaliza achiziția sau ne poți contacta dacă ai întrebări.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <Button
              onClick={() => navigate("/servicii")}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Înapoi la pachete
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate("/#contact")}
              className="w-full"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Contactează-ne
            </Button>
          </motion.div>

          <p className="text-xs text-muted-foreground mt-6">
            Ai nevoie de ajutor? Suntem aici pentru tine.
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default CheckoutCancel;
