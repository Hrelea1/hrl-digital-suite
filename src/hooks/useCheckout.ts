import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useCheckout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const initiateCheckout = async (packageId: string, packageName: string) => {
    if (!user) {
      // Store the intended package for after login
      sessionStorage.setItem("pendingCheckout", JSON.stringify({ packageId, packageName }));
      toast({
        title: "Autentificare necesară",
        description: "Te rugăm să te autentifici pentru a continua cu achiziția.",
      });
      navigate("/auth?redirect=/servicii");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { packageId },
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error("Nu am primit URL-ul de checkout");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        variant: "destructive",
        title: "Eroare",
        description: error instanceof Error ? error.message : "A apărut o eroare la procesarea plății.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check for pending checkout after login
  const checkPendingCheckout = () => {
    const pending = sessionStorage.getItem("pendingCheckout");
    if (pending && user) {
      const { packageId, packageName } = JSON.parse(pending);
      sessionStorage.removeItem("pendingCheckout");
      initiateCheckout(packageId, packageName);
    }
  };

  return {
    initiateCheckout,
    checkPendingCheckout,
    isLoading,
  };
};
